import { useEffect, useState } from 'react'

// Leave-one-patient-out, made concrete. 23 recordings, one child held out for
// testing; the model trains on the rest and is scored only on the one it never
// saw. The held-out chip walks across the row so the "never in train" rule is
// visible, not just asserted. chb01 and chb21 are the same child, drawn joined.

const CASES = Array.from({ length: 23 }, (_, i) => `chb${String(i + 1).padStart(2, '0')}`)
const MERGED = new Set(['chb21'])

export function LopoSplitViz() {
  const [held, setHeld] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const t = setInterval(() => setHeld((h) => (h + 1) % CASES.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="teach-card">
      <h3 className="teach-card__title">One child out, every time</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CASES.map((c, i) => {
          const isHeld = i === held
          const merged = MERGED.has(c)
          return (
            <span
              key={c}
              title={merged ? 'same child as chb01' : undefined}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '4px 7px',
                borderRadius: '3px',
                border: `1px solid ${isHeld ? 'var(--amber)' : merged ? 'var(--accent-deep)' : 'var(--line-rule)'}`,
                background: isHeld ? 'var(--amber-soft)' : 'var(--bg-raised)',
                color: isHeld ? 'var(--amber)' : merged ? 'var(--accent-bright)' : 'var(--fg-low)',
                transition: 'all 160ms var(--ease-out)',
              }}
            >
              {c}
              {merged ? '*' : ''}
            </span>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '13px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--amber)' }}>■ held out (test)</span>
        <span style={{ color: 'var(--fg-low)' }}>■ train</span>
        <span style={{ color: 'var(--accent-bright)' }}>* chb21 = chb01, same child</span>
      </div>

      <p className="meta" style={{ margin: '0.75rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        The number that matters is measured on a child the model has never seen. Splitting by hour or
        by file inside one child would leak the answer, so the whole child leaves the training set.
        chb01 and chb21 are one person recorded twice, so they always leave together.
      </p>
    </div>
  )
}
