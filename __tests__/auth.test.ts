import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

process.env.VAULT_ADDR = 'http://localhost:8200'
process.env.VAULT_TOKEN = 'test-vault-token'

// Imported after env vars are set, since auth.ts reads them at module load.
import { generateToken, verifyToken, requireRole } from '../auth'

beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
        data: { data: { data: { SECRET_KEY: 'test-signing-secret' } } },
    })
})

afterEach(() => {
    jest.clearAllMocks()
})

describe('generateToken / verifyToken', () => {
    it('round-trips id and role through a signed JWT', async () => {
        const token = await generateToken('user-1', 'admin')
        const payload = await verifyToken(token)

        expect(payload.id).toBe('user-1')
        expect(payload.role).toBe('admin')
    })

    it('defaults to the "user" role when none is given', async () => {
        const token = await generateToken('user-2')
        const payload = await verifyToken(token)

        expect(payload.role).toBe('user')
    })

    it('rejects a token signed with a different secret', async () => {
        const token = await generateToken('user-3', 'admin')

        mockedAxios.get.mockResolvedValue({
            data: { data: { data: { SECRET_KEY: 'a-different-secret' } } },
        })

        await expect(verifyToken(token)).rejects.toThrow()
    })

    it('throws a clear error, not a raw TypeError, when the secret is missing/unseeded', async () => {
        // What a real Vault KV v2 mount returns for a path with no secret
        // written yet (e.g. init-vault.sh never ran).
        mockedAxios.get.mockResolvedValue({ data: { data: null } })

        await expect(generateToken('user-5')).rejects.toThrow(/No SECRET_KEY found/)
    })
})

describe('requireRole', () => {
    it('resolves when the token role is in the allowed list', async () => {
        const token = await generateToken('admin-1', 'admin')

        await expect(
            requireRole(`Bearer ${token}`, ['admin'])
        ).resolves.toMatchObject({ id: 'admin-1', role: 'admin' })
    })

    it('throws when the token role is not in the allowed list', async () => {
        const token = await generateToken('user-4', 'user')

        await expect(requireRole(`Bearer ${token}`, ['admin'])).rejects.toThrow(
            /requires role/i
        )
    })

    it('throws when the Authorization header is missing', async () => {
        await expect(requireRole(undefined, ['admin'])).rejects.toThrow(
            /missing bearer token/i
        )
    })

    it('throws when the Authorization header is not a Bearer token', async () => {
        await expect(requireRole('Basic abc123', ['admin'])).rejects.toThrow(
            /missing bearer token/i
        )
    })
})
