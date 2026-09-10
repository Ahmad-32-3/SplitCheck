import { PROBLEM } from '../../data'

const W = 660
const H = 220
const PAD = { l: 36, r: 12, t: 28, b: 36 }

export function DualStore() {
  const n = PROBLEM.hours.length
  const max = Math.max(...PROBLEM.hours)
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const gap = 3
  const barW = plotW / n - gap
  const x = (i: number) => PAD.l + i * (barW + gap)
  const h = (v: number) => (v / max) * plotH

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Hourly spend for ${PROBLEM.entityId}. Postgres sums all 24 hours. Redis drops hour 1.`}
      >
        {PROBLEM.hours.map((v, i) => {
          const dropped = i === 0
          return (
            <g key={i}>
              <rect
                className="bar-grow-y"
                x={x(i)}
                y={PAD.t + plotH - h(v)}
                width={barW}
                height={h(v)}
                fill={dropped ? 'var(--chart-miss)' : 'var(--chart-offline)'}
                opacity={dropped ? 0.45 : 1}
              />
            </g>
          )
        })}
        <text x={PAD.l} y={H - 10} fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          hour 1 (dropped on Redis)
        </text>
        <text x={W - PAD.r} y={H - 10} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          hour 24
        </text>
        <text x={PAD.l} y={18} fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          {PROBLEM.entityId}
        </text>
      </svg>
      <ul className="legend">
        <li>
          <span className="swatch" style={{ background: 'var(--chart-offline)' }} />
          Postgres 24h sum {PROBLEM.postgres.toFixed(1)}
        </li>
        <li>
          <span className="swatch" style={{ background: 'var(--chart-online)' }} />
          Redis 23h sum {PROBLEM.redis.toFixed(1)}
        </li>
      </ul>
    </div>
  )
}
