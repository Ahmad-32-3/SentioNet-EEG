import { FORECASTERS, HERO, PROTOCOL, type Forecaster } from '../../data'

// The hero. Two rows, one shared time axis, one seizure. Top row forecasts from
// the raw signal and reacts too late; bottom row forecasts from the calibrated
// score and buys real warning. The whole ablation, in one glance.

const X0 = 46
const X1 = 436
const MIN_LO = -32
const MIN_HI = 2
const PLOT_H = 66

const minToX = (m: number) => X0 + ((m - MIN_LO) / (MIN_HI - MIN_LO)) * (X1 - X0)
const riskToY = (v: number, top: number) => top + (1 - v) * PLOT_H

function tracePath(trace: [number, number][], top: number) {
  return trace
    .map(([m, v], i) => `${i === 0 ? 'M' : 'L'} ${minToX(m).toFixed(1)} ${riskToY(v, top).toFixed(1)}`)
    .join(' ')
}

// A faint, deterministic EEG squiggle sitting behind each row (a stage prop,
// not real signal). It gets busier near onset so the raw row looks alive.
function eegPath(top: number, seed: number) {
  const yMid = top + PLOT_H + 20
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const x = X0 + (i / 120) * (X1 - X0)
    const near = i / 120
    const amp = 3 + near * near * 9
    const y =
      yMid +
      Math.sin(i * 0.7 + seed) * amp +
      Math.sin(i * 1.9 + seed * 2) * amp * 0.4 +
      Math.sin(i * 3.3 + seed) * amp * 0.2
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

function Row({ f, top, delay }: { f: Forecaster; top: number; delay: number }) {
  const isScore = f.key === 'score'
  const stroke = isScore ? 'var(--good)' : 'var(--amber)'
  const yThresh = riskToY(HERO.threshold, top)
  const alarmX = f.alarmMin != null ? minToX(f.alarmMin) : null
  const faX = f.falseAlarmMin != null ? minToX(f.falseAlarmMin) : null
  const lead = isScore ? HERO.leadMinScore : HERO.leadMinRaw

  return (
    <g>
      <path d={eegPath(top, isScore ? 5 : 1)} fill="none" stroke="var(--line-rule)" strokeWidth="1" opacity="0.5" />

      <line x1={X0} y1={yThresh} x2={X1} y2={yThresh} stroke="var(--fg-low)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <text x={X1} y={yThresh - 4} textAnchor="end" fill="var(--fg-low)" fontSize="8.5">alarm threshold</text>

      <path
        className="draw-line"
        d={tracePath(f.trace, top)}
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
        pathLength={1}
        style={{ animationDelay: `${delay}s`, animationDuration: '1.1s' }}
      />

      {faX != null ? (
        <g className="path-node" style={{ animationDelay: `${delay + 0.8}s` }}>
          <line x1={faX} y1={top + 2} x2={faX} y2={top + PLOT_H} stroke="var(--bad)" strokeWidth="1" strokeDasharray="2 2" />
          <text x={faX} y={top + 14} textAnchor="middle" fill="var(--bad)" fontSize="8.5">false alarm</text>
        </g>
      ) : null}

      {alarmX != null ? (
        <g className="path-node" style={{ animationDelay: `${delay + 1.1}s` }}>
          <circle cx={alarmX} cy={yThresh} r="4.5" fill={stroke} className="path-packet" />
          <line x1={alarmX} y1={yThresh} x2={alarmX} y2={top + PLOT_H + 34} stroke={stroke} strokeWidth="1.2" strokeDasharray="2 3" />
          <text x={alarmX - 6} y={top + PLOT_H + 44} textAnchor={isScore ? 'start' : 'end'} fill={stroke} fontSize="10" fontWeight="600">
            {isScore ? `${lead} min warning` : 'fires 1.2 min out'}
          </text>
        </g>
      ) : null}

      <text x={X0} y={top - 10} fill="var(--fg-hi)" fontSize="11" fontWeight="600">
        {isScore ? 'Forecast from the score' : 'Forecast from raw EEG'}
      </text>
    </g>
  )
}

export function AblationTimeline() {
  const raw = FORECASTERS.find((f) => f.key === 'raw')!
  const score = FORECASTERS.find((f) => f.key === 'score')!
  const topRaw = 52
  const topScore = 210
  const sopStart = minToX(-PROTOCOL.sopMin)
  const sopEnd = minToX(-PROTOCOL.sphMin)
  const onsetX = minToX(0)

  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Same seizure, two forecasters</h3>
      <svg className="chart-svg" viewBox="0 0 460 340" role="img" aria-labelledby="ab-title ab-desc">
        <title id="ab-title">Two forecasts of the same seizure on one time axis</title>
        <desc id="ab-desc">
          Time runs left to right toward the seizure onset on the right. A green shaded band is the
          window where an alarm is early enough to be useful. The top row forecasts from the raw EEG
          and only crosses the alarm line 1.2 minutes before onset, plus one false alarm. The bottom
          row forecasts from the detector&apos;s calibrated score and crosses the line 11 minutes
          before onset, inside the useful window.
        </desc>

        <rect x={sopStart} y={40} width={sopEnd - sopStart} height={256} fill="var(--good-soft)" opacity="0.55" />
        <text x={(sopStart + sopEnd) / 2} y={34} textAnchor="middle" fill="var(--good)" fontSize="9">
          useful warning window (30 min)
        </text>

        <rect x={sopEnd} y={40} width={onsetX - sopEnd} height={256} fill="var(--bad-soft)" opacity="0.6" />

        <line x1={onsetX} y1={34} x2={onsetX} y2={296} stroke="var(--fg-hi)" strokeWidth="1.5" />
        <text x={onsetX + 3} y={44} fill="var(--fg-hi)" fontSize="9.5" fontWeight="600">seizure</text>
        <text x={onsetX + 3} y={54} fill="var(--fg-hi)" fontSize="9.5" fontWeight="600">onset</text>

        <Row f={raw} top={topRaw} delay={0.2} />
        <Row f={score} top={topScore} delay={1.5} />

        {[-30, -20, -10, 0].map((m) => (
          <text key={m} x={minToX(m)} y={332} textAnchor="middle" fill="var(--fg-low)" fontSize="8.5" fontFamily="var(--font-mono)">
            {m === 0 ? '0' : `${m}m`}
          </text>
        ))}
      </svg>
      <p className="meta" style={{ margin: '0.5rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        Illustrative, pending training. The seizure is the same in both rows. Green is the window
        where a warning is early enough to act on; red is too late. Feeding the forecaster the
        calibrated score instead of the raw signal is the only change between the rows.
      </p>
    </div>
  )
}
