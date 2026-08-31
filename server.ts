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
    res.set('Content-Type', metricsRegistry.contentType)
    res.end(await metricsRegistry.metrics())
})

// Define a health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'Server is running' })
})

app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' })
    }

    try {
        const user = await findUserByCredentials(username, password)
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = await generateToken(user.id, user.role)
        return res.json({ token, role: user.role })
    } catch (error: any) {
        console.error('❌ Login error:', error)
        return res.status(500).json({ message: 'Login failed', error: error.message })
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
