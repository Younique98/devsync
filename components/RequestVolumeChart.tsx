import { useState, useRef, type PointerEvent } from 'react'

interface Point {
    hour: string
    value: number
}

const WIDTH = 720
const HEIGHT = 220
const PAD_LEFT = 44
const PAD_RIGHT = 12
const PAD_TOP = 16
const PAD_BOTTOM = 28

export function RequestVolumeChart({ data }: { data: Point[] }) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
    const maxValue = Math.ceil(Math.max(...data.map((d) => d.value)) / 500) * 500

    const xFor = (i: number) => PAD_LEFT + (i / (data.length - 1)) * plotWidth
    const yFor = (v: number) => PAD_TOP + plotHeight - (v / maxValue) * plotHeight

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.value)}`).join(' ')
    const areaPath = `${linePath} L ${xFor(data.length - 1)} ${PAD_TOP + plotHeight} L ${xFor(0)} ${PAD_TOP + plotHeight} Z`

    const yTicks = [0, maxValue / 2, maxValue]

    function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current
        if (!svg) return
        const rect = svg.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * WIDTH
        const ratio = Math.min(1, Math.max(0, (x - PAD_LEFT) / plotWidth))
        const index = Math.round(ratio * (data.length - 1))
        setHoverIndex(index)
    }

    const hovered = hoverIndex !== null ? data[hoverIndex] : null

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-auto touch-none"
                role="img"
                aria-label="Requests per minute over the last 24 hours"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHoverIndex(null)}
            >
                {/* gridlines */}
                {yTicks.map((t) => (
                    <line
                        key={t}
                        x1={PAD_LEFT}
                        x2={WIDTH - PAD_RIGHT}
                        y1={yFor(t)}
                        y2={yFor(t)}
                        stroke="#282f3e"
                        strokeWidth={1}
                    />
                ))}
                {yTicks.map((t) => (
                    <text key={t} x={PAD_LEFT - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="fill-ink-muted text-[10px]">
                        {t >= 1000 ? `${(t / 1000).toFixed(1)}K` : t}
                    </text>
                ))}

                {/* area fill */}
                <path d={areaPath} fill="#3174c5" fillOpacity={0.1} stroke="none" />

                {/* line */}
                <path d={linePath} fill="none" stroke="#3174c5" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

                {/* x-axis labels (every 4th hour) */}
                {data.map(
                    (d, i) =>
                        i % 4 === 0 && (
                            <text key={d.hour} x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-muted text-[10px]">
                                {d.hour}
                            </text>
                        )
                )}

                {/* crosshair + end marker */}
                {hoverIndex !== null && (
                    <>
                        <line
                            x1={xFor(hoverIndex)}
                            x2={xFor(hoverIndex)}
                            y1={PAD_TOP}
                            y2={PAD_TOP + plotHeight}
                            stroke="#97a3b4"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                        />
                        <circle cx={xFor(hoverIndex)} cy={yFor(data[hoverIndex].value)} r={4} fill="#3174c5" stroke="#121826" strokeWidth={2} />
                    </>
                )}
            </svg>

            {hovered && (
                <div
                    className="pointer-events-none absolute top-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg transition-all"
                    style={{
                        left: `${(xFor(hoverIndex!) / WIDTH) * 100}%`,
                        transform: `translateX(${hoverIndex! > data.length / 2 ? '-105%' : '5%'})`,
                    }}
                >
                    <p className="text-xs text-ink-muted">{hovered.hour}</p>
                    <p className="text-sm font-semibold text-ink">{hovered.value.toLocaleString()} req/min</p>
                </div>
            )}
        </div>
    )
}
