import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' })
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
        const vaultUrl = `${VAULT_ADDR}/v1/secret/database`
        
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
        return res.status(200).json({ secrets: data.data })
    } catch (error: any) {
        console.error('❌ Vault API Error:', error)
        return res.status(500).json({ error: error.message })
    }
}
