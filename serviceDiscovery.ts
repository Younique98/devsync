/**
 * Registers this backend instance with Consul on startup (and deregisters
 * on shutdown), so it's discoverable via Consul's service catalog and gets
 * a health check wired to the existing /health endpoint.
 */

const CONSUL_ADDR = process.env.CONSUL_ADDR || 'http://localhost:8500'
const SERVICE_ID = `devsync-backend-${process.pid}`
const SERVICE_NAME = 'devsync-backend'

export async function registerWithConsul(port: number, healthCheckHost = 'localhost') {
    const payload = {
        ID: SERVICE_ID,
        Name: SERVICE_NAME,
        Port: port,
        Check: {
            HTTP: `http://${healthCheckHost}:${port}/health`,
            Interval: '10s',
            Timeout: '2s',
            DeregisterCriticalServiceAfter: '1m',
        },
    }

    try {
        const response = await fetch(`${CONSUL_ADDR}/v1/agent/service/register`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!response.ok) {
            throw new Error(`Consul registration failed: ${response.status} ${response.statusText}`)
        }
        console.log(`✅ Registered "${SERVICE_NAME}" (${SERVICE_ID}) with Consul at ${CONSUL_ADDR}`)
    } catch (error) {
        // Consul is optional for local dev - don't crash the server if it's
        // not running, just log and move on.
        console.warn(`⚠️  Could not register with Consul at ${CONSUL_ADDR}:`, (error as Error).message)
    }
}

export async function deregisterFromConsul() {
    try {
        await fetch(`${CONSUL_ADDR}/v1/agent/service/deregister/${SERVICE_ID}`, {
            method: 'PUT',
        })
        console.log(`🛑 Deregistered "${SERVICE_ID}" from Consul`)
    } catch (error) {
        console.warn('⚠️  Could not deregister from Consul:', (error as Error).message)
    }
}
