#!/usr/bin/env node
/**
 * Minimal migration runner: applies each .sql file in this directory, in
 * filename order, exactly once - tracked via a schema_migrations table.
 *
 * Usage: PG_USER=... PG_PASSWORD=... PG_DATABASE=... PG_HOST=... node migrations/migrate.js
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
    const pool = new Pool({
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST || 'localhost',
        port: Number(process.env.PG_PORT) || 5432,
    })

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `)

        const { rows } = await pool.query('SELECT filename FROM schema_migrations')
        const applied = new Set(rows.map((r) => r.filename))

        const files = fs
            .readdirSync(__dirname)
            .filter((f) => f.endsWith('.sql'))
            .sort()

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`⏭  Skipping already-applied migration: ${file}`)
                continue
            }

            const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
            console.log(`▶  Applying migration: ${file}`)

            const client = await pool.connect()
            try {
                await client.query('BEGIN')
                await client.query(sql)
                await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
                await client.query('COMMIT')
                console.log(`✅ Applied: ${file}`)
            } catch (err) {
                await client.query('ROLLBACK')
                throw err
            } finally {
                client.release()
            }
        }

        console.log('✅ All migrations applied')
    } finally {
        await pool.end()
    }
}

main().catch((err) => {
    console.error('❌ Migration failed:', err)
    process.exit(1)
})
