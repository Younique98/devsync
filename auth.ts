import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const VAULT_ADDR = process.env.VAULT_ADDR
const VAULT_TOKEN = process.env.VAULT_TOKEN

async function getSecretKey() {
    if (!VAULT_ADDR || !VAULT_TOKEN) {
        throw new Error('Vault configuration missing in environment variables.')
    }
    const response = await axios.get(`${VAULT_ADDR}/v1/secret/data/auth`, {
        headers: {
            'X-Vault-Token': VAULT_TOKEN,
        },
    })
    const secretKey = response.data?.data?.data?.SECRET_KEY
    if (!secretKey) {
        throw new Error(
            '❌ No SECRET_KEY found at secret/data/auth - has it been seeded (see init-vault.sh)?'
        )
    }
    return secretKey
}

export type Role = 'admin' | 'user'

export interface TokenPayload {
    id: string
    role: Role
}

export async function generateToken(userId: string, role: Role = 'user') {
    const secretKey = await getSecretKey()
    return jwt.sign({ id: userId, role }, secretKey, { expiresIn: '1h' })
}

export async function verifyToken(token: string): Promise<TokenPayload> {
    const secretKey = await getSecretKey()
    return jwt.verify(token, secretKey) as TokenPayload
}

/**
 * Extracts a "Bearer <token>" header, verifies it, and checks the decoded
 * role is in `allowedRoles`. Throws on any failure (missing header, bad
 * token, insufficient role) - callers should catch and respond 401/403.
 */
export async function requireRole(
    authHeader: string | undefined,
    allowedRoles: Role[]
): Promise<TokenPayload> {
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
        throw new Error('Missing bearer token')
    }
    const payload = await verifyToken(token)
    if (!allowedRoles.includes(payload.role)) {
        throw new Error(`Requires role: ${allowedRoles.join(' or ')}`)
    }
    return payload
}
