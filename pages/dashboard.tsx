import { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

type HealthState =
    | { status: 'loading' }
    | { status: 'up'; message: string }
    | { status: 'down'; error: string }

const EXTERNAL_TOOLS = [
    { name: 'Grafana', url: 'http://localhost:3001', description: 'Dashboards for Prometheus + Loki' },
    { name: 'Prometheus', url: 'http://localhost:9090', description: 'Metrics & alerting' },
    { name: 'Consul', url: 'http://localhost:8500', description: 'Service catalog & health checks' },
    { name: 'Nomad', url: 'http://localhost:4646', description: 'Job scheduler UI' },
    { name: 'Vault', url: 'http://localhost:8200', description: 'Secrets management' },
]

export default function Dashboard() {
    const [health, setHealth] = useState<HealthState>({ status: 'loading' })

    useEffect(() => {
        let cancelled = false

        fetch(`${BACKEND_URL}/health`)
            .then((res) => {
                if (!res.ok) throw new Error(`Backend responded ${res.status}`)
                return res.json()
            })
            .then((data) => {
                if (!cancelled) setHealth({ status: 'up', message: data.status })
            })
            .catch((err) => {
                if (!cancelled) setHealth({ status: 'down', error: err.message })
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <main className="max-w-2xl mx-auto mt-24 px-4 font-sans">
            <h1 className="text-4xl font-bold text-slate-900">DevSync Dashboard</h1>

            <section aria-label="Backend health" className="mt-10">
                <h2 className="text-xl font-semibold text-slate-900">Backend Health</h2>
                {health.status === 'loading' && (
                    <p data-testid="health-status" className="mt-2 text-slate-500">
                        Checking backend...
                    </p>
                )}
                {health.status === 'up' && (
                    <p data-testid="health-status" className="mt-2 text-green-600 font-medium">
                        ● Backend is up ({health.message})
                    </p>
                )}
                {health.status === 'down' && (
                    <p data-testid="health-status" className="mt-2 text-red-600 font-medium">
                        ● Backend unreachable: {health.error}
                    </p>
                )}
            </section>

            <section aria-label="Monitoring tools" className="mt-10">
                <h2 className="text-xl font-semibold text-slate-900">Monitoring & Infra Tools</h2>
                <ul className="mt-3 space-y-2">
                    {EXTERNAL_TOOLS.map((tool) => (
                        <li key={tool.name} className="text-slate-700">
                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                                {tool.name}
                            </a>{' '}
                            - {tool.description}
                        </li>
                    ))}
                </ul>
                <p className="mt-4 text-sm text-slate-400">
                    Links assume the full docker-compose stack is running locally.
                </p>
            </section>
        </main>
    )
}
