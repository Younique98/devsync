import { Pool } from 'pg'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

// Function to fetch database secrets from Vault
async function getDatabaseSecrets() {
    try {
        const VAULT_ADDR = process.env.VAULT_ADDR
        const VAULT_TOKEN = process.env.VAULT_TOKEN

        if (!VAULT_ADDR || !VAULT_TOKEN) {
            throw new Error(
                'Vault address or token is missing in environment variables.'
            )
        }
        const response = await axios.get(VAULT_ADDR, {
            headers: { 'X-Vault-Token': VAULT_TOKEN },
        })

        console.log(
            '✅ Successfully retrieved secrets from Vault:',
            response.data.data
        )

        return response.data.data
    } catch (err) {
        console.error(
            '❌ Error fetching secrets from Vault:',
            (err as Error).message
        )
        throw err
    }
}

const connectDatabases = async () => {
    const PG_DATABASE = process.env.PG_DATABASE
    const PG_USER = process.env.PG_USER
    const PG_PASSWORD = process.env.PG_PASSWORD
    const MONGO_URI = process.env.MONGO_URI

    try {
        const secrets = await getDatabaseSecrets()
        console.log('All available secrets:', JSON.stringify(secrets, null, 2))
        console.log('Attempting to connect to database:', secrets)
        console.log('Attempting to connect to database:', PG_DATABASE)
        const pgPool = new Pool({
            user: PG_USER,
            password: PG_PASSWORD,
            host: 'localhost',
            database: PG_DATABASE, // Ensure this matches your DB name
            port: 5432,
        })

        // Test PostgreSQL connection explicitly
        await pgPool.connect()
        console.log('✅ PostgreSQL Connected Successfully')

        if (!MONGO_URI) {
            throw new Error('MongoDB URI is missing in environment variables.')
        }
        // MongoDB connection
        await mongoose.connect(MONGO_URI)
        console.log('✅ MongoDB Connected Successfully')

        return { pgPool, mongoose }
    } catch (err) {
        console.error('❌ Database connection error:', err)
        throw err
    }
}

connectDatabases()
export { connectDatabases }
