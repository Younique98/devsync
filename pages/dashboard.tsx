import Link from 'next/link'
import { Seo } from '../components/Seo'
import { StatTile } from '../components/StatTile'
import { StatusPill } from '../components/StatusPill'
import { RequestVolumeChart } from '../components/RequestVolumeChart'
import { SERVICES, STAT_TILES, REQUEST_VOLUME, RECENT_ACTIVITY, EXTERNAL_TOOLS } from '../lib/mockData'

const ACTIVITY_DOT: Record<string, string> = {
    deploy: 'bg-accent-strong',
    registered: 'bg-good',
    alert: 'bg-warning',
}

export default function Dashboard() {
    return (
        <>
            <Seo
                title="Dashboard"
                description="Live infrastructure overview for DevSync: request volume, service health across Postgres, MongoDB, Vault, Consul, and Nomad, and recent deployment activity."
                path="/dashboard"
            />
            <div className="min-h-screen bg-background text-ink">
                <header className="border-b border-border">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="font-bold text-lg tracking-tight">
                            DevSync
                        </Link>
                        <nav className="flex items-center gap-6 text-sm">
                            <span className="text-ink font-medium">Dashboard</span>
                            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink-muted">
                                Demo data
                            </span>
                        </nav>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-10">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold">Overview</h1>
                        <p className="mt-1 text-sm text-ink-muted">
                            Live status across the DevSync stack, sourced from Consul, Prometheus, and the backend&apos;s own health checks.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {STAT_TILES.map((tile) => (
                            <StatTile key={tile.label} {...tile} />
                        ))}
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-6 mb-6">
                        <div className="flex items-baseline justify-between mb-4">
                            <h2 className="text-sm font-semibold text-ink">Request volume</h2>
                            <span className="text-xs text-ink-muted">Last 24 hours</span>
                        </div>
                        <RequestVolumeChart data={REQUEST_VOLUME} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6">
                            <h2 className="text-sm font-semibold text-ink mb-4">Service health</h2>
                            <div className="divide-y divide-border">
                                {SERVICES.map((service) => (
                                    <div key={service.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium text-ink">{service.name}</p>
                                            <p className="text-xs text-ink-muted">{service.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="hidden sm:block text-xs text-ink-muted tabular-nums w-16 text-right">
                                                {service.latencyMs}ms
                                            </span>
                                            <span className="hidden sm:block text-xs text-ink-muted tabular-nums w-14 text-right">
                                                {service.uptime}
                                            </span>
                                            <StatusPill status={service.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-6">
                            <h2 className="text-sm font-semibold text-ink mb-4">Recent activity</h2>
                            <ul className="space-y-4">
                                {RECENT_ACTIVITY.map((event) => (
                                    <li key={event.id} className="flex gap-3">
                                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${ACTIVITY_DOT[event.type]}`} aria-hidden />
                                        <div>
                                            <p className="text-sm text-ink leading-snug">{event.message}</p>
                                            <p className="text-xs text-ink-muted mt-0.5">{event.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">
                            Infrastructure
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {EXTERNAL_TOOLS.map((tool) => (
                                <a
                                    key={tool.name}
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent-strong hover:bg-surface-hover"
                                >
                                    <p className="text-sm font-medium text-ink group-hover:text-accent">{tool.name}</p>
                                    <p className="text-xs text-ink-muted mt-0.5">{tool.description}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
