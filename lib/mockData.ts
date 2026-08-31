// Demo/portfolio data. The real backend exposes this same shape via
// /health, /metrics, and Consul's catalog - this file lets the dashboard
// render a realistic, fully-populated state without a live multi-service
// stack running behind it. See README "Areas for Improvement".

export type ServiceStatus = 'operational' | 'degraded' | 'down'

export interface ServiceHealth {
    name: string
    description: string
    status: ServiceStatus
    latencyMs: number
    uptime: string
}

export const SERVICES: ServiceHealth[] = [
    { name: 'Backend API', description: 'Express + Next.js API routes', status: 'operational', latencyMs: 42, uptime: '99.98%' },
    { name: 'PostgreSQL', description: 'Primary relational store', status: 'operational', latencyMs: 8, uptime: '99.99%' },
    { name: 'MongoDB', description: 'Document store', status: 'operational', latencyMs: 14, uptime: '99.95%' },
    { name: 'Vault', description: 'Secrets management', status: 'operational', latencyMs: 21, uptime: '99.97%' },
    { name: 'Consul', description: 'Service discovery + health checks', status: 'operational', latencyMs: 6, uptime: '100%' },
    { name: 'Nomad', description: 'Job scheduler', status: 'degraded', latencyMs: 340, uptime: '99.62%' },
]

export interface StatTile {
    label: string
    value: string
    delta: string
    sentiment: 'good' | 'bad' | 'neutral'
}

export const STAT_TILES: StatTile[] = [
    { label: 'Requests / min', value: '2,847', delta: '+12.4% vs yesterday', sentiment: 'good' },
    { label: 'p95 latency', value: '86ms', delta: '-4ms vs yesterday', sentiment: 'good' },
    { label: 'Error rate', value: '0.12%', delta: '+0.02pp vs yesterday', sentiment: 'bad' },
    { label: 'Active services', value: '5/6', delta: '1 degraded', sentiment: 'bad' },
]

// 24 hourly points, requests per minute - a gentle daily curve with one
// small incident bump so the chart has something to point at.
export const REQUEST_VOLUME: { hour: string; value: number }[] = [
    { hour: '00:00', value: 640 },
    { hour: '01:00', value: 520 },
    { hour: '02:00', value: 410 },
    { hour: '03:00', value: 380 },
    { hour: '04:00', value: 360 },
    { hour: '05:00', value: 420 },
    { hour: '06:00', value: 610 },
    { hour: '07:00', value: 980 },
    { hour: '08:00', value: 1450 },
    { hour: '09:00', value: 1920 },
    { hour: '10:00', value: 2210 },
    { hour: '11:00', value: 2380 },
    { hour: '12:00', value: 2190 },
    { hour: '13:00', value: 2340 },
    { hour: '14:00', value: 2510 },
    { hour: '15:00', value: 2680 },
    { hour: '16:00', value: 3120 },
    { hour: '17:00', value: 2940 },
    { hour: '18:00', value: 2420 },
    { hour: '19:00', value: 2050 },
    { hour: '20:00', value: 1780 },
    { hour: '21:00', value: 1490 },
    { hour: '22:00', value: 1120 },
    { hour: '23:00', value: 847 },
]

export interface ActivityEvent {
    id: string
    type: 'deploy' | 'registered' | 'alert'
    message: string
    timestamp: string
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
    { id: '1', type: 'deploy', message: 'devsync-backend deployed via Nomad', timestamp: '4 min ago' },
    { id: '2', type: 'registered', message: 'devsync-backend-3 registered with Consul', timestamp: '4 min ago' },
    { id: '3', type: 'alert', message: 'Nomad job scheduler latency above threshold', timestamp: '18 min ago' },
    { id: '4', type: 'deploy', message: 'Vault secrets rotated (secret/database)', timestamp: '1 hr ago' },
    { id: '5', type: 'registered', message: 'devsync-backend-2 health check passing', timestamp: '2 hr ago' },
]

export const EXTERNAL_TOOLS = [
    { name: 'Grafana', url: 'http://localhost:3001', description: 'Dashboards for Prometheus + Loki' },
    { name: 'Prometheus', url: 'http://localhost:9090', description: 'Metrics & alerting' },
    { name: 'Consul', url: 'http://localhost:8500', description: 'Service catalog & health checks' },
    { name: 'Nomad', url: 'http://localhost:4646', description: 'Job scheduler UI' },
    { name: 'Vault', url: 'http://localhost:8200', description: 'Secrets management' },
]
