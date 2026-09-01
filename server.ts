import crypto from 'crypto'
import express, { Express, NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import client from 'prom-client'
import { connectDatabases } from './database'
import { generateToken, requireRole } from './auth'
import { findUserByCredentials } from './users'
import { registerWithConsul, deregisterFromConsul } from './serviceDiscovery'
import { getGithubAuthorizeUrl, exchangeCodeForGithubUser } from './oauth'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5001

// --- Prometheus metrics ---
const metricsRegistry = new client.Registry()
client.collectDefaultMetrics({ register: metricsRegistry })

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [metricsRegistry],
})

app.use(express.json())

// Baseline security response headers. Hand-rolled rather than pulling in
// helmet - this is the small, fixed set that actually applies to a JSON
// API with no HTML responses of its own (X-Powered-By removed so the
// Express version isn't advertised to every caller).
app.disable('x-powered-by')
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'no-referrer')
    next()
})

app.use((req: Request, res: Response, next: NextFunction) => {
    const endTimer = httpRequestDuration.startTimer()
    res.on('finish', () => {
        // Only ever label with a matched Express route (a small, fixed set).
        // Falling back to the raw request path would let an attacker create
        // unbounded Prometheus label cardinality by hitting random URLs.
        endTimer({
            method: req.method,
            route: req.route?.path || 'unmatched',
            status_code: res.statusCode,
        })
    })
    next()
})

app.get('/metrics', async (req: Request, res: Response) => {
    // Prometheus metrics leak infra topology (route names, status-code
    // distributions, process/host stats via collectDefaultMetrics) that
    // shouldn't be handed to anyone on the internet who finds the port -
    // gate it the same way the rest of this app gates sensitive reads:
    // a bearer token, checked in constant time. /health stays open below;
    // a bare liveness boolean isn't sensitive and orchestrators need it
    // reachable without credentials.
    const METRICS_TOKEN = process.env.METRICS_TOKEN
    if (!METRICS_TOKEN) {
        return res.status(500).json({ error: 'Metrics token not configured' })
    }

    const authHeader = req.headers.authorization
    const presented = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!isValidMetricsToken(presented, METRICS_TOKEN)) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    res.set('Content-Type', metricsRegistry.contentType)
    res.end(await metricsRegistry.metrics())
})

// Constant-time token comparison so response timing can't be used to guess
// the token byte-by-byte. timingSafeEqual throws on a length mismatch
// rather than returning false, so that's checked first.
function isValidMetricsToken(presented: string | null, expected: string): boolean {
    if (!presented) return false
    const presentedBuf = Buffer.from(presented)
    const expectedBuf = Buffer.from(expected)
    if (presentedBuf.length !== expectedBuf.length) return false
    return crypto.timingSafeEqual(presentedBuf, expectedBuf)
}

// Define a health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'Server is running' })
})

// In-memory login rate limiter, keyed by IP + username. Same tradeoff as
// pendingOAuthStates below: fine for a single-instance demo, a real
// multi-instance deployment should move this to Redis (this repo has no
// Redis service today - see docker-compose.yml). Counts failed attempts
// only; a successful login clears the counter so it never locks out a
// user who just mistyped a password once.
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function pruneExpiredLoginAttempts() {
    const now = Date.now()
    for (const [key, entry] of loginAttempts) {
        if (entry.resetAt <= now) {
            loginAttempts.delete(key)
        }
    }
}

function loginRateLimitKey(req: Request, username: string): string {
    return `${req.ip}:${username.toLowerCase()}`
}

function recordFailedLoginAttempt(key: string) {
    const now = Date.now()
    const entry = loginAttempts.get(key)
    if (entry && entry.resetAt > now) {
        entry.count += 1
    } else {
        loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS })
    }
}

app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body

    // Reject non-string bodies outright, not just missing ones - an
    // object/array slipped into bcrypt.compare() would throw and fall
    // through to the catch block below instead of a clean 400, and an
    // unbounded string is needless input to hash-compare against.
    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        username.length === 0 ||
        password.length === 0 ||
        username.length > 256 ||
        password.length > 256
    ) {
        return res.status(400).json({ message: 'Username and password are required' })
    }

    pruneExpiredLoginAttempts()
    const rateLimitKey = loginRateLimitKey(req, username)
    const rateLimitEntry = loginAttempts.get(rateLimitKey)
    if (rateLimitEntry && rateLimitEntry.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.ceil((rateLimitEntry.resetAt - Date.now()) / 1000)
        res.setHeader('Retry-After', String(retryAfterSeconds))
        return res.status(429).json({
            message: `Too many failed login attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
        })
    }

    try {
        const user = await findUserByCredentials(username, password)
        if (!user) {
            recordFailedLoginAttempt(rateLimitKey)
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // A correct password clears any prior failed attempts for this
        // key - only wrong guesses should ever count toward the limit.
        loginAttempts.delete(rateLimitKey)

        const token = await generateToken(user.id, user.role)
        return res.json({ token, role: user.role })
    } catch (error: any) {
        // Log the real cause server-side only (e.g. Vault unreachable) -
        // never echo internal error detail back to an unauthenticated caller.
        console.error('❌ Login error:', error)
        return res.status(500).json({ message: 'Login failed' })
    }
})

// --- GitHub OAuth2 (Authorization Code flow) ---
// In-memory state store for CSRF protection between /auth/github and its
// callback. A multi-instance deployment should move this to Redis/Vault
// instead - fine for a single-instance demo. States expire after
// OAUTH_STATE_TTL_MS so an abandoned /auth/github (never followed by a
// callback) doesn't grow this map forever.
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000
const pendingOAuthStates = new Map<string, number>() // state -> expiresAt

function pruneExpiredOAuthStates() {
    const now = Date.now()
    for (const [state, expiresAt] of pendingOAuthStates) {
        if (expiresAt <= now) {
            pendingOAuthStates.delete(state)
        }
    }
}

app.get('/auth/github', (req: Request, res: Response) => {
    pruneExpiredOAuthStates()
    const state = crypto.randomBytes(16).toString('hex')
    try {
        const authorizeUrl = getGithubAuthorizeUrl(state)
        pendingOAuthStates.set(state, Date.now() + OAUTH_STATE_TTL_MS)
        res.redirect(authorizeUrl)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/auth/github/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query

    pruneExpiredOAuthStates()
    if (typeof state !== 'string' || !pendingOAuthStates.has(state)) {
        return res.status(400).json({ error: 'Invalid or expired OAuth state' })
    }
    pendingOAuthStates.delete(state)

    if (typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing code' })
    }

    try {
        const githubUser = await exchangeCodeForGithubUser(code)
        const token = await generateToken(`github:${githubUser.id}`, 'user')
        return res.json({ token, role: 'user', githubLogin: githubUser.login })
    } catch (error: any) {
        return res.status(502).json({ error: error.message })
    }
})

// RBAC-protected route: demonstrates the same requireRole() guard used by
// pages/api/vault.ts, enforced within the Express backend too.
app.get('/admin/status', async (req: Request, res: Response) => {
    try {
        await requireRole(req.headers.authorization, ['admin'])
    } catch (error: any) {
        return res.status(401).json({ error: error.message })
    }
    return res.json({
        status: 'ok',
        pgConnected: Boolean(app.locals.pgPool),
        mongoConnected: Boolean(app.locals.mongoose),
    })
})
const startServer = async () => {
    try {
        const { pgPool, mongoose } = await connectDatabases()
        console.log('🚀 Databases connected, starting server...')

        // Store database connections for use in routes
        app.locals.pgPool = pgPool
        app.locals.mongoose = mongoose

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
        })

        await registerWithConsul(Number(PORT))

        const shutdown = async () => {
            console.log('🛑 Shutting down...')
            await deregisterFromConsul()
            server.close(() => process.exit(0))
        }
        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)
    } catch (error) {
        console.error(
            '❌ Failed to connect to databases. Server not started.',
            error
        )
        process.exit(1) // Exit process if database connection fails
    }
}

if (require.main === module) {
    startServer()
}

export { app }
