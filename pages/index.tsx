import Link from 'next/link'
import Head from 'next/head'

const FEATURES = [
    { title: 'Secrets management', description: 'Vault-backed credentials, never hardcoded.' },
    { title: 'Service discovery', description: 'Consul health checks, self-registering services.' },
    { title: 'Observability', description: 'Prometheus metrics, Grafana dashboards, Loki logs.' },
    { title: 'Infrastructure as code', description: 'Terraform + Nomad job specs, version controlled.' },
]

export default function Home() {
    return (
        <>
            <Head>
                <title>DevSync</title>
            </Head>
            <div className="min-h-screen bg-background text-ink">
                <header className="border-b border-border">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <span className="font-bold text-lg tracking-tight">DevSync</span>
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-accent mb-6">
                        <span className="h-1.5 w-1.5 rounded-full bg-good" />
                        All systems operational
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-balance">
                        Full-stack DevOps, wired together properly
                    </h1>
                    <p className="mt-5 text-lg text-ink-muted text-balance">
                        Vault-backed secrets, Consul service discovery, Prometheus metrics, and
                        Terraform + Nomad provisioning - built to demonstrate the real thing, not
                        a slide about it.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-accent-strong px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
                        >
                            View Dashboard →
                        </Link>
                        <a
                            href="https://github.com/Younique98/devsync"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-border px-5 py-2.5 font-semibold text-ink transition hover:bg-surface"
                        >
                            View Source
                        </a>
                    </div>
                </main>

                <section className="max-w-6xl mx-auto px-6 pb-24">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
                                <p className="text-sm font-semibold text-ink">{feature.title}</p>
                                <p className="mt-1.5 text-sm text-ink-muted">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}
