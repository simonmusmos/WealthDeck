import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import './ProductCard.css'

// ── Currency data ────────────────────────────────────────────────────────────
const CURRENCIES = [
  { symbol: '$',  value: 847291,  region: 'US' },
  { symbol: '£',  value: 668403,  region: 'UK' },
  { symbol: 'S$', value: 1143842, region: 'SG' },
]

// Asset bars are static — only the total cycles through currencies
const ASSETS = [
  { name: 'Equities', value: '$355,862', pct: 42, color: '#42d277' },
  { name: 'Property', value: '$254,187', pct: 30, color: '#8B9EB0' },
  { name: 'Crypto',   value: '$177,931', pct: 21, color: '#E8B44F' },
  { name: 'Cash',     value: '$67,783',  pct:  8, color: '#9B8EC4' },
]

// ── Number count-up hook ─────────────────────────────────────────────────────
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target)
  const displayRef  = useRef(target)  // current displayed value
  const rafRef      = useRef(null)

  useEffect(() => {
    const from = displayRef.current
    if (from === target) return

    const start = performance.now()
    const diff  = target - from

    const tick = (now) => {
      const t       = Math.min((now - start) / duration, 1)
      const current = Math.round(from + diff * easeOut(t))
      displayRef.current = current
      setValue(current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        displayRef.current = target
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ProductCard() {
  const [idx, setIdx]             = useState(0)
  const [phase, setPhase]         = useState('idle') // 'idle' | 'exit' | 'enter'
  const [amountTarget, setTarget] = useState(CURRENCIES[0].value)
  const [symbol, setSymbol]       = useState(CURRENCIES[0].symbol)

  const displayAmount = useCountUp(amountTarget, 600)

  // Refs to avoid stale closures in timeouts
  const pausedRef       = useRef(false)
  const timerRef        = useRef(null)
  const resumeTimerRef  = useRef(null)
  const runCycleRef     = useRef(null)

  // schedule: runs fn after delay only if not paused
  const schedule = useCallback((delay, fn) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) fn()
    }, delay)
  }, [])

  const runCycle = useCallback(() => {
    // 1. Wait 3s, then start exit
    schedule(3000, () => {
      setPhase('exit')

      // 2. After exit (300ms) + pause (100ms) = 400ms: switch + enter
      schedule(400, () => {
        setIdx((prev) => {
          const next = (prev + 1) % CURRENCIES.length
          setSymbol(CURRENCIES[next].symbol)
          setTarget(CURRENCIES[next].value)
          return next
        })
        setPhase('enter')

        // 3. After enter (300ms): back to idle, recurse
        schedule(300, () => {
          setPhase('idle')
          runCycleRef.current?.()
        })
      })
    })
  }, [schedule])

  // Keep ref in sync so recursive calls always get the latest
  runCycleRef.current = runCycle

  useEffect(() => {
    runCycle()
    return () => clearTimeout(timerRef.current)
  }, [runCycle])

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    clearTimeout(resumeTimerRef.current)
    clearTimeout(timerRef.current)
    pausedRef.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
      setPhase('idle')
      runCycleRef.current?.()
    }, 1000)
  }, [])

  const animClass = phase === 'exit' ? 'anim-exit'
                  : phase === 'enter' ? 'anim-enter'
                  : ''

  const formatted = `${symbol}${displayAmount.toLocaleString('en-US')}`

  return (
    <div
      className="card-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card">
        <p className="card-label">Total Net Worth</p>

        {/* Animated total */}
        <div className="card-total">
          <span className={`card-amount ${animClass}`}>
            {formatted}
          </span>
          <span className="card-change">+12.4%</span>
        </div>

        {/* Asset breakdown — static, does not change with currency rotation */}
        <div className="card-assets">
          {ASSETS.map((a, i) => (
            <div className="asset-row" key={a.name}>
              <div className="asset-meta">
                <span className="asset-name">{a.name}</span>
                <span className="asset-value">{a.value}</span>
              </div>
              <div className="asset-track">
                <div
                  className="asset-fill"
                  style={{
                    width: `${a.pct}%`,
                    background: a.color,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card-divider" />

        {/* Animated region indicator */}
        <p className={`card-regions ${animClass}`}>
          {CURRENCIES.map((c, i) => (
            <Fragment key={c.region}>
              {i > 0 && <span className="region-sep"> · </span>}
              <span className={i === idx ? 'region-active' : 'region-dim'}>
                {c.region}
              </span>
            </Fragment>
          ))}
        </p>
      </div>

      <div className="card-reflection" aria-hidden="true" />
    </div>
  )
}
