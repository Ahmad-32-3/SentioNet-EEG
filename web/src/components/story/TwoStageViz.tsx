import { PIPELINE } from '../../data'

// The solution as a pipeline: raw EEG becomes a calibrated score (stage one,
// the detector), and only that score feeds the forecaster (stage two). The two
// stages are drawn as two tinted groups so the hand-off is the visible point.

const W = 460
const BOX_W = 128
const BOX_H = 46
const GAP = 22
const COL_X = (i: number) => 12 + i * (BOX_W + GAP)

export function TwoStageViz() {
  const row = (i: number) => (i < 3 ? 0 : 1)
  const col = (i: number) => i % 3
  const boxX = (i: number) => COL_X(col(i))
  const boxY = (i: number) => 40 + row(i) * (BOX_H + 52)

  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Two stages, one hand-off</h3>
      <svg className="chart-svg" viewBox={`0 0 ${W} 200`} role="img" aria-labelledby="ts-title ts-desc">
        <title id="ts-title">A pipeline from raw EEG to a forecast</title>
        <desc id="ts-desc">
          Six boxes in two rows. Stage one turns raw EEG into a calibrated seizure probability. Stage
          two reads a buffer of that probability and forecasts where it is heading.
        </desc>

        <text x={12} y={26} fill="var(--good)" fontSize="10" fontWeight="600">
          STAGE 1 · detect (labeled task)
        </text>
        <text x={12} y={148} fill="var(--accent-bright)" fontSize="10" fontWeight="600">
          STAGE 2 · forecast (the score&apos;s future)
        </text>

        {PIPELINE.map((p, i) => {
          const stage2 = i >= 4
          const stroke = stage2 ? 'var(--accent)' : 'var(--good)'
          const wash = stage2
            ? 'color-mix(in srgb, var(--accent) 12%, var(--bg-raised))'
            : 'color-mix(in srgb, var(--good) 12%, var(--bg-raised))'
          const x = boxX(i)
          const y = boxY(i)
          return (
            <g key={p.id} className="path-node" style={{ animationDelay: `${0.15 + i * 0.22}s` }}>
              {i > 0 ? (
                col(i) === 0 ? (
                  <path
                    d={`M ${COL_X(2) + BOX_W / 2} ${40 + BOX_H} L ${COL_X(2) + BOX_W / 2} ${40 + BOX_H + 20} L ${COL_X(0) + BOX_W / 2} ${40 + BOX_H + 20} L ${COL_X(0) + BOX_W / 2} ${boxY(i)}`}
                    fill="none"
                    stroke="var(--line-strong)"
                    strokeWidth="1.4"
                  />
                ) : (
                  <line
                    x1={boxX(i - 1) + BOX_W}
                    y1={y + BOX_H / 2}
                    x2={x}
                    y2={y + BOX_H / 2}
                    stroke="var(--line-strong)"
                    strokeWidth="1.4"
                  />
                )
              ) : null}
              <rect x={x} y={y} width={BOX_W} height={BOX_H} rx="3" fill={wash} stroke={stroke} strokeWidth="1.4" />
              <text x={x + BOX_W / 2} y={y + 19} textAnchor="middle" fill="var(--fg-hi)" fontSize="11" fontWeight="600">
                {p.label}
              </text>
              <text x={x + BOX_W / 2} y={y + 34} textAnchor="middle" fill="var(--fg-low)" fontSize="8.5" fontFamily="var(--font-mono)">
                {p.sub}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="meta" style={{ margin: '0.5rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        Stage one is trained on real labels (a seizure either overlaps a window or it does not).
        Stage two never sees a &quot;pre-seizure&quot; label, because none exists in the files. It
        only forecasts where the stage-one score is heading.
      </p>
    </div>
  )
}
