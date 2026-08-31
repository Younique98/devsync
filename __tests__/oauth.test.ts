import { getGithubAuthorizeUrl, exchangeCodeForGithubUser } from '../oauth'

const originalEnv = process.env

beforeEach(() => {
    process.env = { ...originalEnv }
})

afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
})

describe('getGithubAuthorizeUrl', () => {
    it('builds a valid GitHub authorize URL with the given state', () => {
        process.env.GITHUB_CLIENT_ID = 'client-123'
        process.env.GITHUB_CALLBACK_URL = 'http://localhost:5001/auth/github/callback'

        const url = getGithubAuthorizeUrl('csrf-state-abc')

        expect(url).toContain('https://github.com/login/oauth/authorize')
        expect(url).toContain('client_id=client-123')
        expect(url).toContain('state=csrf-state-abc')
    })

    it('throws when GITHUB_CLIENT_ID is not configured', () => {
        delete process.env.GITHUB_CLIENT_ID
        process.env.GITHUB_CALLBACK_URL = 'http://localhost:5001/auth/github/callback'

        expect(() => getGithubAuthorizeUrl('state')).toThrow(/GITHUB_CLIENT_ID/)
    })
})

describe('exchangeCodeForGithubUser', () => {
    beforeEach(() => {
        process.env.GITHUB_CLIENT_ID = 'client-123'
        process.env.GITHUB_CLIENT_SECRET = 'secret-456'
    })

    it('exchanges a code for an access token, then fetches the user profile', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ access_token: 'gho_test_token' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 42, login: 'octocat', email: 'octocat@github.com' }),
            }) as any

        const user = await exchangeCodeForGithubUser('some-code')

        expect(user).toEqual({ id: 42, login: 'octocat', email: 'octocat@github.com' })
        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(global.fetch).toHaveBeenNthCalledWith(
            2,
            'https://api.github.com/user',
            expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer gho_test_token' }),
            })
        )
    })

    it('throws when the token exchange fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as any

        await expect(exchangeCodeForGithubUser('bad-code')).rejects.toThrow(
            /token exchange failed/i
        )
    })

    it('throws when GitHub returns no access_token', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ error: 'bad_verification_code' }),
        }) as any

        await expect(exchangeCodeForGithubUser('bad-code')).rejects.toThrow(
            /returned no access_token/i
        )
    })
})
