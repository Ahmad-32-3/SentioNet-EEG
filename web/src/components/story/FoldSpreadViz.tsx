import { FOLD_LEAD } from '../../data'

// One clean average bar would lie about a 22-patient study. This shows every
// held-out child as its own dot: how much warning that child got, score-fed
// versus raw-fed, including the children who got none (dots stuck at zero).

const W = 440
const X0 = 60
const X1 = 420
const MAX = 15
const toX = (m: number) => X0 + (Math.min(m, MAX) / MAX) * (X1 - X0)

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function Strip({ vals, y, color, label, delay }: { vals: number[]; y: number; color: string; label: string; delay: number }) {
  const med = median(vals)
  return (
    <g>
      <text x={12} y={y + 4} fill="var(--fg-hi)" fontSize="10" fontWeight="600">
        {label}
      </text>
      <line x1={X0} y1={y} x2={X1} y2={y} stroke="var(--line-hairline)" strokeWidth="1" />
      {vals.map((v, i) => (
        <circle
          key={i}
          className="path-node"
          cx={toX(v)}
          cy={y + (i % 2 ? -5 : 5)}
          r={v === 0 ? 3 : 4}
          fill={v === 0 ? 'var(--bg-raised)' : color}
          stroke={color}
          strokeWidth="1.3"
          opacity={v === 0 ? 0.7 : 1}
          style={{ animationDelay: `${delay + i * 0.05}s` }}
        />
      ))}
      <line x1={toX(med)} y1={y - 16} x2={toX(med)} y2={y + 16} stroke={color} strokeWidth="1.6" strokeDasharray="3 2" />
      <text x={toX(med)} y={y - 20} textAnchor="middle" fill={color} fontSize="9">
        median {med.toFixed(1)}m
      </text>
    </g>
  )
}

export function FoldSpreadViz() {
  const missScore = FOLD_LEAD.score.filter((v) => v === 0).length
  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Every child, not an average</h3>
      <svg className="chart-svg" viewBox={`0 0 ${W} 170`} role="img" aria-labelledby="fs-title fs-desc">
        <title id="fs-title">Lead time per held-out child, score-fed versus raw-fed</title>
        <desc id="fs-desc">
          Two rows of dots on a minutes axis. Each dot is one held-out child. The score-fed row sits
          further right (more warning) with a higher median; the raw-fed row clusters near zero. Open
          dots at zero are children who got no usable warning.
        </desc>

        <Strip vals={FOLD_LEAD.score} y={50} color="var(--good)" label="score-fed" delay={0.2} />
        <Strip vals={FOLD_LEAD.raw} y={120} color="var(--amber)" label="raw-fed" delay={0.9} />

        {[0, 5, 10, 15].map((m) => (
          <g key={m}>
            <line x1={toX(m)} y1={40} x2={toX(m)} y2={140} stroke="var(--line-hairline)" strokeWidth="0.7" opacity="0.5" />
            <text x={toX(m)} y={158} textAnchor="middle" fill="var(--fg-low)" fontSize="8.5" fontFamily="var(--font-mono)">
              {m}m
            </text>
          </g>
        ))}
      </svg>
      <p className="meta" style={{ margin: '0.5rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        Illustrative, 12 folds. The score-fed forecaster gives more warning on most children, but
        {' '}{missScore} still get none. On 22 patients the honest result is the spread, not a single
        headline number.
      </p>
    </div>
  )
}
