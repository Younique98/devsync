import { Pool } from 'pg'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function getDatabaseSecrets() {
    try {
        const VAULT_ADDR = process.env.VAULT_ADDR
        const VAULT_TOKEN = process.env.VAULT_TOKEN
        if (!VAULT_ADDR) {
            throw new Error('❌ Vault address is incorrect')
        }
        if (!VAULT_TOKEN) {
            throw new Error('❌ Vault environment variables/tokens are missing')
        }

        console.log('🔍 Fetching secrets from Vault...', `${VAULT_ADDR}`)

        const response = await fetch(`${VAULT_ADDR}/v1/secret/database`, {
            method: 'GET',
            headers: {
                'X-Vault-Token': VAULT_TOKEN,
                Accept: 'application/json',
            },
        })
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `❌ Vault API Error: ${response.status} ${response.statusText} - ${errorText}`
            )
        }

        const data = await response.json()
        console.log(
            '🔍 Secrets fetched successfully in getDatabaseSecrets:',
            data.data
        )
        return data.data
    } catch (err) {
        console.error('❌ Error fetching database secrets:', err)
        throw err
    }
}

const connectDatabases = async () => {
    try {
        const secrets = await getDatabaseSecrets()
        console.log('🔍 Retrieved Secrets:', JSON.stringify(secrets, null, 2))

        const {
            PG_USER: pgUser,
            PG_PASSWORD: pgPassword,
            PG_DATABASE: pgDatabase,
            MONGO_URI: mongoUri,
            PG_HOST: pgHost,
        } = secrets

        if (!pgUser || !pgPassword || !pgDatabase || !pgHost) {
            throw new Error('❌ Missing PostgreSQL credentials from Vault.')
        }

        if (!mongoUri) {
            throw new Error('❌ Missing MongoDB URI from Vault.')
        }

        const pgPool = new Pool({
            user: pgUser,
            password: pgPassword,
            host: pgHost,
            database: pgDatabase,
            port: 5432,
        })

        await pgPool.connect()
        console.log('✅ PostgreSQL Connected Successfully')

        await mongoose.connect(mongoUri)
        console.log('✅ MongoDB Connected Successfully')

        return { pgPool, mongoose }
    } catch (err) {
        console.error('❌ Database connection error:', err)
        throw err
    }
}

connectDatabases()
export { connectDatabases }
