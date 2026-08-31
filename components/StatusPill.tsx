import type { ServiceStatus } from '../lib/mockData'

const STATUS_CONFIG: Record<ServiceStatus, { label: string; dot: string; text: string; bg: string }> = {
    operational: { label: 'Operational', dot: 'bg-good', text: 'text-good', bg: 'bg-good/10' },
    degraded: { label: 'Degraded', dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10' },
    down: { label: 'Down', dot: 'bg-critical', text: 'text-critical', bg: 'bg-critical/10' },
}

export function StatusPill({ status }: { status: ServiceStatus }) {
    const config = STATUS_CONFIG[status]
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden />
            {config.label}
        </span>
    )
}
