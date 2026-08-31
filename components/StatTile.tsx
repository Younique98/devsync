import type { StatTile as StatTileData } from '../lib/mockData'

const SENTIMENT_TEXT: Record<StatTileData['sentiment'], string> = {
    good: 'text-good',
    bad: 'text-critical',
    neutral: 'text-ink-muted',
}

export function StatTile({ label, value, delta, sentiment }: StatTileData) {
    return (
        <div className="rounded-xl border border-border bg-surface px-5 py-4">
            <p className="text-sm text-ink-muted">{label}</p>
            <p className="mt-1.5 text-3xl font-semibold text-ink tabular-nums">{value}</p>
            <p className={`mt-1 text-xs font-medium ${SENTIMENT_TEXT[sentiment]}`}>{delta}</p>
        </div>
    )
}
