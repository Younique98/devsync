import Link from 'next/link'
import { Seo } from '../components/Seo'

const FEATURES = [
    {
        title: 'Secrets management',
        description: 'Centralized, Vault-backed credential storage - no secrets hardcoded in source or config.',
    },
    {
        title: 'Service discovery',
        description: 'Consul-registered services with automated health checks and live status reporting.',
    },
    {
        title: 'Observability',
        description: 'Request metrics, latency, and error rates via Prometheus, visualized in Grafana.',
    },
    {
        title: 'Infrastructure as code',
        description: 'Terraform-provisioned secrets and Nomad job specs, version-controlled end to end.',
    },
]

export default function Home() {
    return (
        <>
            <Seo
                title="DevSync"
                description="DevSync is a full-stack DevOps platform for secrets management, service discovery, and observability, built on HashiCorp Vault, Consul, Terraform, and Nomad."
                path="/"
            />
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

                <main>
                    <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-accent mb-6">
                            <span className="h-1.5 w-1.5 rounded-full bg-good" />
                            All systems operational
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-balance">
                            One platform for secrets, service discovery, and observability
                        </h1>
                        <p className="mt-5 text-lg text-ink-muted text-balance">
                            DevSync unifies HashiCorp Vault, Consul, and Terraform with Prometheus-based
                            monitoring, giving engineering teams a single, secure control plane for
                            infrastructure operations.
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
                    </div>

                    <section aria-label="Key features" className="max-w-6xl mx-auto px-6 pb-24">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {FEATURES.map((feature) => (
                                <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
                                    <p className="text-sm font-semibold text-ink">{feature.title}</p>
                                    <p className="mt-1.5 text-sm text-ink-muted">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    )
}
