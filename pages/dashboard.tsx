import Link from 'next/link'
import { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

type HealthState =
    | { status: 'loading' }
    | { status: 'up'; message: string }
    | { status: 'down'; error: string }

const EXTERNAL_TOOLS = [
    { name: 'Grafana', url: 'http://localhost:3001', description: 'Dashboards for Prometheus + Loki', icon: '📊' },
    { name: 'Prometheus', url: 'http://localhost:9090', description: 'Metrics & alerting', icon: '📈' },
    { name: 'Consul', url: 'http://localhost:8500', description: 'Service catalog & health checks', icon: '🧭' },
    { name: 'Nomad', url: 'http://localhost:4646', description: 'Job scheduler UI', icon: '⚙️' },
    { name: 'Vault', url: 'http://localhost:8200', description: 'Secrets management', icon: '🔒' },
]

function StatusPill({ health }: { health: HealthState }) {
    if (health.status === 'loading') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
                Checking...
            </span>
        )
    }
    if (health.status === 'up') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-sm font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {health.message}
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-900 bg-red-950 px-3 py-1 text-sm font-medium text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Unreachable
        </span>
    )
}

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
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-bold text-lg tracking-tight">
                    DevSync
                </Link>
                <span className="text-sm text-slate-500">Dashboard</span>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <section aria-label="Backend health" className="mb-12">
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-6 py-5">
                        <div>
                            <h1 className="text-xl font-semibold">Backend</h1>
                            <p
                                data-testid="health-status"
                                className="mt-1 text-sm text-slate-500"
                            >
                                {health.status === 'down' ? health.error : BACKEND_URL}
                            </p>
                        </div>
                        <StatusPill health={health} />
                    </div>
                </section>

                <section aria-label="Monitoring tools">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                        Monitoring & Infra Tools
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {EXTERNAL_TOOLS.map((tool) => (
                            <a
                                key={tool.name}
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 transition hover:border-emerald-700 hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl" aria-hidden>
                                        {tool.icon}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-slate-100 group-hover:text-emerald-400">
                                            {tool.name}
                                        </p>
                                        <p className="text-sm text-slate-500">{tool.description}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-slate-600">
                        Links assume the full docker-compose stack is running locally.
                    </p>
                </section>
            </div>
        </main>
    )
}
