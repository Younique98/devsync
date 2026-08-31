process.env.VAULT_ADDR = 'http://localhost:8200'
process.env.VAULT_TOKEN = 'test-vault-token'

jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
    })),
}))

jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue(undefined),
}))

import { connectDatabases } from '../database'

const originalFetch = global.fetch

afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
})

// Regression test for a real bug: this file's fetch used to hit the KV v1
// shaped path (secret/database, one level of unwrapping) while Vault's
// "secret/" mount defaults to KV v2 (as does the docker-compose Vault
// service and init-vault.sh's `vault kv put`, which is KV-version-aware).
// Against a real KV v2 Vault, the old code got a 404/invalid-path response
// and every credential came back undefined - this locks in the fix.
describe('connectDatabases -> getDatabaseSecrets Vault integration', () => {
    it('reads secrets from the KV v2 path/shape (secret/data/database, data.data.data)', async () => {
        global.fetch = jest.fn().mockImplementation((url: string) => {
            expect(url).toBe('http://localhost:8200/v1/secret/data/database')
            return Promise.resolve({
                ok: true,
                json: async () => ({
                    data: {
                        data: {
                            PG_USER: 'u',
                            PG_PASSWORD: 'p',
                            PG_DATABASE: 'd',
                            PG_HOST: 'h',
                            MONGO_URI: 'mongodb://h/d',
                        },
                    },
                }),
            })
        }) as any

        await expect(connectDatabases()).resolves.toMatchObject({
            pgPool: expect.anything(),
        })
    })

    it('throws a clear error, not a raw TypeError, when the secret is missing/unseeded', async () => {
        // This is what a real Vault KV v2 mount returns for a path with no
        // secret written yet (e.g. init-vault.sh never ran).
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: null }),
        }) as any

        await expect(connectDatabases()).rejects.toThrow(/No secret found/)
    })
})
