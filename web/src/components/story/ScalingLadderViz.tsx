import { LADDER } from '../../data'

// The path from a portfolio result to something a clinician (and eventually a
// payer) could trust. Drawn as a ladder so the distance is honest: rung one is
// done, the rest are not, and each says what would have to be true to climb it.

const STATE_STYLE: Record<string, { dot: string; label: string }> = {
  done: { dot: 'var(--good)', label: 'done' },
  next: { dot: 'var(--accent)', label: 'next' },
  future: { dot: 'var(--fg-low)', label: 'later' },
}

export function ScalingLadderViz() {
  return (
    <div className="teach-card">
      <h3 className="teach-card__title">From 22 children to something you can trust</h3>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {LADDER.map((rung, i) => {
          const s = STATE_STYLE[rung.state]
          const last = i === LADDER.length - 1
          return (
            <li
              key={i}
              className="layer-drop"
              style={{ display: 'grid', gridTemplateColumns: '1.4rem 1fr', gap: '0.75rem', animationDelay: `${0.15 + i * 0.18}s` }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    width: '0.85rem',
                    height: '0.85rem',
                    borderRadius: '50%',
                    background: rung.state === 'done' ? s.dot : 'var(--bg-raised)',
                    border: `2px solid ${s.dot}`,
                    marginTop: '0.2rem',
                    flex: 'none',
                  }}
                />
                {!last ? <span style={{ width: '2px', flex: 1, background: 'var(--line-rule)', margin: '0.2rem 0' }} /> : null}
              </div>
              <div style={{ paddingBottom: last ? 0 : '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--fg-hi)', fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                    {rung.title}
                  </strong>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: s.dot,
                      border: `1px solid ${s.dot}`,
                      borderRadius: '3px',
                      padding: '1px 6px',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'var(--fg)' }}>{rung.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="meta" style={{ margin: '0.75rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        Only the first rung is done. The point of drawing the rest is to be specific about the
        distance, not to imply it is close.
      </p>
    </div>
  )
}
