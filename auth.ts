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
    return response.data.data.data.SECRET_KEY
}

export async function generateToken(userId: string) {
    const secretKey = await getSecretKey()
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' })
}

export async function verifyToken(token: string) {
    const secretKey = await getSecretKey()
    return jwt.verify(token, secretKey)
}
