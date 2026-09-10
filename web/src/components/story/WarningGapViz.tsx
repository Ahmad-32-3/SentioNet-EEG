// The problem, in one picture: EEG looks ordinary right up until the seizure,
// so a person (or a naive alarm reading the raw trace) gets almost no warning.

const W = 440
const H = 190
const onsetX = 300

function calmThenSeize() {
  const pts: string[] = []
  for (let i = 0; i <= 220; i++) {
    const x = (i / 220) * W
    const past = x - onsetX
    let amp = 6 + Math.sin(i * 0.9) * 4
    if (x > onsetX) {
      amp = 34 * Math.exp(-Math.max(0, past) / 90)
      const y = H / 2 + Math.sin(i * 2.4) * amp + Math.sin(i * 5.1) * amp * 0.6
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`)
      continue
    }
    const y = H / 2 + Math.sin(i * 0.9) * amp * 0.5 + Math.sin(i * 2.1) * 2
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

export function WarningGapViz() {
  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Where is the warning?</h3>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="wg-title wg-desc">
        <title id="wg-title">A calm EEG trace that suddenly erupts into a seizure</title>
        <desc id="wg-desc">
          A brain-wave trace stays quiet, then erupts into large fast waves at the seizure onset on
          the right. Before the eruption there is a question mark: the trace gives little visible
          warning.
        </desc>

        <line x1={onsetX} y1={16} x2={onsetX} y2={H - 16} stroke="var(--amber)" strokeWidth="1.5" />
        <text x={onsetX + 4} y={26} fill="var(--amber)" fontSize="10" fontWeight="600">seizure starts</text>

        <path
          className="draw-line"
          d={calmThenSeize()}
          fill="none"
          stroke="var(--fg-hi)"
          strokeWidth="1.4"
          pathLength={1}
          style={{ animationDuration: '1.6s' }}
        />

        <g className="path-node" style={{ animationDelay: '0.4s' }}>
          <text x={onsetX / 2} y={H - 24} textAnchor="middle" fill="var(--fg-low)" fontSize="11">
            looks ordinary
          </text>
          <text x={onsetX / 2} y={44} textAnchor="middle" fill="var(--accent-bright)" fontSize="22" fontWeight="700">
            ?
          </text>
        </g>
      </svg>
      <p className="meta" style={{ margin: '0.5rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        Illustrative trace. The minutes before a seizure often look unremarkable on the raw signal.
        The goal is to squeeze a warning out of that quiet stretch.
      </p>
    </div>
  )
}
