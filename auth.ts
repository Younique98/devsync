import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const VAULT_ADDR = process.env.VAULT_ADDR
// Function to fetch JWT secret from HashiCorp Vault
async function getSecretKey() {
    if (!VAULT_ADDR) {
        throw new Error('Vault address is missing in environment variables.')
    }
    const response = await axios.get(VAULT_ADDR)
    return response.data.data.SECRET_KEY
}

// Generate JWT Token
export async function generateToken(userId: string) {
    const secretKey = await getSecretKey()
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' })
}

// Verify JWT Token
export async function verifyToken(token: string) {
    const secretKey = await getSecretKey()
    return jwt.verify(token, secretKey)
}
