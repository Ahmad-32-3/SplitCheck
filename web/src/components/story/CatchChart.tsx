import { ABLATION, METRICS } from '../../data'

const ROWS = [
  { key: 'detector', label: 'Parity checker', value: METRICS.successPct, color: 'var(--chart-catch)' },
  { key: 'naive', label: 'Naive: always match', value: METRICS.baselinePct, color: 'var(--chart-miss)' },
  ...ABLATION.map((a) => ({
    key: a.key,
    label: a.label,
    value: a.successPct,
    color: 'var(--chart-offline)',
  })),
]

const W = 660
const ROW_H = 36
const PAD = { l: 176, r: 56, t: 8, b: 8 }
const H = PAD.t + PAD.b + ROWS.length * ROW_H
const plotW = W - PAD.l - PAD.r

export function CatchChart() {
  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Catch rate. Checker ${METRICS.successPct} percent. Naive baseline ${METRICS.baselinePct} percent.`}
      >
        {ROWS.map((r, i) => {
          const y = PAD.t + i * ROW_H + 8
          const w = Math.max(2, (r.value / 100) * plotW)
          return (
            <g key={r.key}>
              <text
                x={PAD.l - 10}
                y={y + 12}
                textAnchor="end"
                fontSize="11"
                fill="var(--chart-label)"
                fontFamily="var(--font-text)"
              >
                {r.label}
              </text>
              <rect
                className="bar-grow"
                x={PAD.l}
                y={y}
                width={w}
                height={16}
                fill={r.color}
                style={{ animationDelay: `${i * 0.08}s` }}
              />
              <text
                x={PAD.l + w + 8}
                y={y + 13}
                fontSize="11"
                fill="var(--fg-hi)"
                fontFamily="var(--font-mono)"
              >
                {r.value.toFixed(0)}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
