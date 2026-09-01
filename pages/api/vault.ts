import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole } from '../../auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        await requireRole(req.headers.authorization, ['admin'])
    } catch (error: any) {
        // requireRole's errors (missing/invalid token, wrong role) are safe
        // to relay as-is - they never carry secret material.
        return res.status(401).json({ error: error.message })
    }

    const VAULT_ADDR = process.env.VAULT_ADDR
    const VAULT_TOKEN = process.env.VAULT_TOKEN

    if (!VAULT_ADDR) {
        return res.status(500).json({ error: 'Vault address is incorrect' })
    }
    if (!VAULT_TOKEN) {
        return res.status(500).json({ error: 'Vault environment variables/tokens are missing' })
    }

    try {
        // KV v2 read path (Vault's "secret/" mount defaults to KV v2), same
        // shape database.ts and auth.ts read - the actual secret data is
        // nested under data.data.data. See database.ts for why the v1 path
        // (secret/database, one level of unwrapping) 404s against a
        // standard Vault setup.
        const vaultUrl = `${VAULT_ADDR}/v1/secret/data/database`

        const response = await fetch(vaultUrl, {
            method: 'GET',
            headers: {
                'X-Vault-Token': VAULT_TOKEN,
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Vault Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const secrets: Record<string, unknown> = data?.data?.data ?? {}

        // This route exists to prove RBAC-gated read access into Vault
        // works end to end - not to hand live database credentials to
        // whatever's holding a valid admin JWT. Returning the raw values
        // here would mean anyone who can steal/guess an admin token, or
        // read this response off the wire/logs, walks away with the real
        // Postgres/Mongo passwords Vault exists to protect. Report which
        // keys are configured instead of what they contain.
        return res.status(200).json({
            configured: Object.keys(secrets).length > 0,
            keys: Object.keys(secrets).sort(),
        })
    } catch (error: any) {
        // Log the real error server-side only - the client just needs to
        // know the read failed, not Vault's internal error detail.
        console.error('❌ Vault API Error:', error)
        return res.status(502).json({ error: 'Failed to read secrets from Vault' })
    }
}
