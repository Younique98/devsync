import axios from 'axios'
import request from 'supertest'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

process.env.VAULT_ADDR = 'http://localhost:8200'
process.env.VAULT_TOKEN = 'test-vault-token'
process.env.GITHUB_CLIENT_ID = 'test-client-id'
process.env.GITHUB_CLIENT_SECRET = 'test-client-secret'
process.env.GITHUB_CALLBACK_URL = 'http://localhost:5001/auth/github/callback'
process.env.METRICS_TOKEN = 'test-metrics-token'

// Imported after env vars are set, and after axios is mocked, since server.ts
// pulls in auth.ts (which reads Vault via axios) at module load.
import { app } from '../server'
import { generateToken } from '../auth'

beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
        data: { data: { data: { SECRET_KEY: 'test-signing-secret' } } },
    })
})

afterEach(() => {
    jest.clearAllMocks()
})

describe('GET /health', () => {
    it('returns 200 with a status message', async () => {
        const res = await request(app).get('/health')

        expect(res.status).toBe(200)
        expect(res.body).toEqual({ status: 'Server is running' })
    })
})

describe('GET /metrics', () => {
    it('rejects a request with no token', async () => {
        const res = await request(app).get('/metrics')

        expect(res.status).toBe(401)
    })

    it('rejects a request with the wrong token', async () => {
        const res = await request(app).get('/metrics').set('Authorization', 'Bearer wrong-token')

        expect(res.status).toBe(401)
    })

    it('returns Prometheus-formatted metrics for the configured token', async () => {
        const res = await request(app).get('/metrics').set('Authorization', 'Bearer test-metrics-token')

        expect(res.status).toBe(200)
        expect(res.text).toContain('http_request_duration_seconds')
    })
})

describe('POST /login', () => {
    it('rejects a request missing credentials', async () => {
        const res = await request(app).post('/login').send({})

        expect(res.status).toBe(400)
    })

    it('rejects invalid credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'wrong' })

        expect(res.status).toBe(401)
    })

    it('issues a token for valid demo credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'admin123' })

        expect(res.status).toBe(200)
        expect(res.body.token).toEqual(expect.any(String))
        expect(res.body.role).toBe('admin')
    })

    it('returns 500 instead of hanging when token signing fails (e.g. Vault down)', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Vault unreachable'))

        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'admin123' })

        expect(res.status).toBe(500)
    })

    it('429s after 5 failed attempts for the same IP + username, with a Retry-After header', async () => {
        const attempt = () =>
            request(app).post('/login').send({ username: 'rate-limit-user', password: 'wrong' })

        for (let i = 0; i < 5; i++) {
            const res = await attempt()
            expect(res.status).toBe(401)
        }

        const blocked = await attempt()
        expect(blocked.status).toBe(429)
        expect(blocked.headers['retry-after']).toBeDefined()
        expect(blocked.body.message).toMatch(/too many failed login attempts/i)
    })

    it('does not rate-limit a different username from the same IP', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app).post('/login').send({ username: 'other-rate-limit-user', password: 'wrong' })
        }

        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'admin123' })

        expect(res.status).toBe(200)
    })

    it('clears the failed-attempt counter on a successful login', async () => {
        for (let i = 0; i < 4; i++) {
            await request(app).post('/login').send({ username: 'demo', password: 'wrong' })
        }

        const success = await request(app).post('/login').send({ username: 'demo', password: 'demo123' })
        expect(success.status).toBe(200)

        // The counter reset, so this single failure shouldn't trip the limit.
        const res = await request(app).post('/login').send({ username: 'demo', password: 'wrong' })
        expect(res.status).toBe(401)
    })
})

describe('GET /admin/status', () => {
    it('rejects a request with no token', async () => {
        const res = await request(app).get('/admin/status')

        expect(res.status).toBe(401)
    })

    it('rejects a non-admin token', async () => {
        const token = await generateToken('user-1', 'user')
        const res = await request(app)
            .get('/admin/status')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(401)
    })

    it('accepts an admin token', async () => {
        const token = await generateToken('admin-1', 'admin')
        const res = await request(app)
            .get('/admin/status')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.status).toBe('ok')
    })
})

describe('GET /auth/github', () => {
    it('redirects to the GitHub authorize URL', async () => {
        const res = await request(app).get('/auth/github')

        expect(res.status).toBe(302)
        expect(res.headers.location).toContain('https://github.com/login/oauth/authorize')
    })
})

describe('GET /auth/github/callback', () => {
    it('rejects a request with an unrecognized state', async () => {
        const res = await request(app)
            .get('/auth/github/callback')
            .query({ code: 'abc', state: 'never-issued' })

        expect(res.status).toBe(400)
    })

    it('rejects a request with no code', async () => {
        const startRes = await request(app).get('/auth/github')
        const state = new URL(startRes.headers.location).searchParams.get('state')!

        const res = await request(app).get('/auth/github/callback').query({ state })

        expect(res.status).toBe(400)
    })

    it('rejects a state that has expired', async () => {
        const startRes = await request(app).get('/auth/github')
        const state = new URL(startRes.headers.location).searchParams.get('state')!

        const realNow = Date.now
        Date.now = () => realNow() + 11 * 60 * 1000 // 11 minutes later
        try {
            const res = await request(app)
                .get('/auth/github/callback')
                .query({ code: 'abc', state })

            expect(res.status).toBe(400)
        } finally {
            Date.now = realNow
        }
    })
})

describe('Prometheus route label cardinality', () => {
    it('labels unmatched routes with a fixed placeholder, not the raw path', async () => {
        await request(app).get('/this-path-does-not-exist')

        const res = await request(app).get('/metrics').set('Authorization', 'Bearer test-metrics-token')

        expect(res.text).not.toContain('this-path-does-not-exist')
        expect(res.text).toContain('route="unmatched"')
    })
})
