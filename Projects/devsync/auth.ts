
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const VAULT_ADDR = "http://127.0.0.1:8200/v1/secret/data/jwt"; // Vault endpoint

// Function to fetch JWT secret from HashiCorp Vault
async function getSecretKey() {
    const response = await axios.get(VAULT_ADDR);
    return response.data.data.SECRET_KEY;
}

// Generate JWT Token
export async function generateToken(userId: string) {
    const secretKey = await getSecretKey();
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
}

// Verify JWT Token
export async function verifyToken(token: string) {
    const secretKey = await getSecretKey();
    return jwt.verify(token, secretKey);
}