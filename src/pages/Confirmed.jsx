import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Background from '../components/Background'
import './Confirmed.css'

// ── Utilities ─────────────────────────────────────────────────────────────────
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

function useCountUp(target, duration) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * easeOut(t)))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return value
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const el = document.createElement('textarea')
  el.value = text
  el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

// ── What's next data ──────────────────────────────────────────────────────────
const NEXT_ITEMS = [
  {
    n: '01',
    title: "We're building",
    body: 'Your survey answers directly shape which integrations and features ship first.',
  },
  {
    n: '02',
    title: "You'll hear from us",
    body: "We'll send occasional updates on progress — no spam, just substance.",
  },
  {
    n: '03',
    title: 'Early access ships soon',
    body: "When we launch, you'll be among the first in — with premium features free.",
  },
]

// ── Preview card ──────────────────────────────────────────────────────────────
const CURRENCIES = [
  { symbol: '$', value: 3038632, region: 'US' },
  { symbol: '£', value: 2400812, region: 'UK' },
  { symbol: '€', value: 2812475, region: 'EU' },
]

const ASSETS = [
  { name: 'Equities',      value: '$381,281', pct: 50, color: '#42d277' },
  { name: 'Property',      value: '$271,133', pct: 35, color: '#8B9EB0' },
  { name: 'Crypto & Cash', value: '$194,877', pct: 25, color: '#E8B44F' },
]

// SVG sparkline — upward trend with two small dips
const SPARK_D = 'M0,58 L32,52 L65,55 L98,44 L130,46 L163,36 L196,38 L228,28 L261,22 L294,18 L326,12 L360,8 L400,4'

// Delays from page load per animation sequence:
//   card fades in at 1.6s — sparkline starts drawing at 2.0s (400ms after card)
//   currency rotation begins at 2.5s
const SPARK_DRAW_DELAY_MS    = 400   // relative to when IntersectionObserver fires
const CURRENCY_START_DELAY_MS = 2500

function useSparkDraw(svgPathRef, drawDelay = 0) {
  useEffect(() => {
    const path = svgPathRef.current
    if (!path) return
    const len = path.getTotalLength()
    path.style.strokeDasharray  = len
    path.style.strokeDashoffset = len

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setTimeout(() => {
        path.style.transition    = 'stroke-dashoffset 1.2s ease-out'
        path.style.strokeDashoffset = '0'
      }, drawDelay)
      observer.disconnect()
    }, { threshold: 0.3 })
    observer.observe(path)
    return () => observer.disconnect()
  }, [svgPathRef, drawDelay])
}

function useCurrencyRotation(startDelay = 0) {
  const [idx, setIdx]             = useState(0)
  const [phase, setPhase]         = useState('idle')
  const [amountTarget, setTarget] = useState(CURRENCIES[0].value)
  const [symbol, setSymbol]       = useState(CURRENCIES[0].symbol)
  const displayRef                = useRef(CURRENCIES[0].value)
  const rafRef                    = useRef(null)
  const timerRef                  = useRef(null)
  const runRef                    = useRef(null)

  const [displayAmount, setDisplayAmount] = useState(CURRENCIES[0].value)

  useEffect(() => {
    const from = displayRef.current
    if (from === amountTarget) return
    const start = performance.now()
    const diff  = amountTarget - from
    const tick  = (now) => {
      const t = Math.min((now - start) / 600, 1)
      const v = Math.round(from + diff * easeOut(t))
      displayRef.current = v
      setDisplayAmount(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else displayRef.current = amountTarget
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [amountTarget])

  const schedule = useCallback((delay, fn) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(fn, delay)
  }, [])

  const run = useCallback(() => {
    schedule(3000, () => {
      setPhase('exit')
      schedule(400, () => {
        setIdx(prev => {
          const next = (prev + 1) % CURRENCIES.length
          setSymbol(CURRENCIES[next].symbol)
          setTarget(CURRENCIES[next].value)
          return next
        })
        setPhase('enter')
        schedule(300, () => {
          setPhase('idle')
          runRef.current?.()
        })
      })
    })
  }, [schedule])

  runRef.current = run

  useEffect(() => {
    const t = setTimeout(() => run(), startDelay)
    return () => { clearTimeout(t); clearTimeout(timerRef.current) }
  }, [run, startDelay])

  return { idx, phase, symbol, displayAmount }
}

function PreviewCard() {
  const pathRef = useRef(null)
  const { idx, phase, symbol, displayAmount } = useCurrencyRotation(CURRENCY_START_DELAY_MS)

  useSparkDraw(pathRef, SPARK_DRAW_DELAY_MS)

  const animClass = phase === 'exit' ? 'pc-exit' : phase === 'enter' ? 'pc-enter' : ''
  const formatted = `${symbol}${displayAmount.toLocaleString('en-US')}`

  return (
    <div className="preview-card">
      <p className="preview-label">Total Net Worth</p>

      <div className="preview-total-row">
        <span className={`preview-amount ${animClass}`}>{formatted}</span>
        <span className="preview-badge">+12.4% past year</span>
      </div>

      {/* Sparkline */}
      <div className="preview-chart" aria-hidden="true">
        <svg viewBox="0 0 400 64" preserveAspectRatio="none">
          <path
            ref={pathRef}
            d={SPARK_D}
            fill="none"
            stroke="#42d277"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Asset rows */}
      <div className="preview-assets">
        {ASSETS.map(a => (
          <div className="preview-asset-row" key={a.name}>
            <span className="preview-asset-name">{a.name}</span>
            <div className="preview-mini-track">
              <div className="preview-mini-fill" style={{ width: `${a.pct}%`, background: a.color }} />
            </div>
            <span className="preview-asset-value">{a.value}</span>
          </div>
        ))}
      </div>

      <div className="preview-divider" />

      {/* Country indicator — active region syncs with rotation */}
      <p className="preview-footer">
        {CURRENCIES.map((c, i) => (
          <Fragment key={c.region}>
            {i > 0 && <span className="preview-sep"> · </span>}
            <span className={`preview-region ${i === idx ? 'preview-region--active' : ''} ${animClass}`}>
              {c.region}
            </span>
          </Fragment>
        ))}
        <span className="preview-accounts"> — 4 accounts connected</span>
      </p>
    </div>
  )
}

// ── Loops trigger ─────────────────────────────────────────────────────────────
async function triggerLoops({ email, position, surveyAnswers, utmSource, signupId }) {
  const res = await fetch('/api/loops-trigger', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      position,
      region:          surveyAnswers?.region          ?? null,
      assetTypes:      surveyAnswers?.assetTypes      ?? [],
      painPoint:       surveyAnswers?.painPoint       ?? null,
      currentTools:    surveyAnswers?.currentTools    ?? [],
      surveyCompleted: surveyAnswers?.surveyCompleted ?? false,
      utmSource,
    }),
  })
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}))
    throw new Error(error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Confirmed() {
  const { signupData, setSignupData, surveyAnswers, utmParams } = useApp()
  const signup   = signupData ?? { email: null, position: 4231 }
  const position = signup.position ?? 4231

  const displayPos = useCountUp(position, 1400)
  const [copied, setCopied] = useState(false)

  // ── Loops welcome email trigger — fires once, prevents duplicates ──────────
  useEffect(() => {
    // Skip if no real signup data (dev placeholder) or already sent this session
    if (!signupData?.email || signupData?.emailSent) return

    triggerLoops({
      email:         signupData.email,
      position:      signupData.position,
      surveyAnswers,
      utmSource:     utmParams?.utm_source ?? null,
      signupId:      signupData.id,
    })
      .then(() => {
        // Mark sent in context so a re-visit to /confirmed won't re-trigger
        setSignupData(prev => ({ ...prev, emailSent: true }))
        // TODO: also call markEmailSent(signupData.id) once Supabase is connected
        // import { markEmailSent } from '../lib/supabase'
        // markEmailSent(signupData.id).catch(console.error)
      })
      .catch(err => {
        // Signup is NOT lost — it's in Supabase. Log and move on.
        console.error('[Confirmed] Loops trigger failed:', err)
      })
  // Run once on mount. signupData.emailSent is the guard against re-runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async () => {
    await copyText('https://waitlist.wealthdeck.app')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="confirmed-page">
      <Background />
      <div className="confirmed-layout">

        <main className="confirmed-main">

          {/* Position hero */}
          <div className="confirmed-hero">
            <p className="confirmed-number">
              #{displayPos.toLocaleString('en-US')}
            </p>
            <p className="confirmed-sub">
              {signup.email
                ? <><strong>{signup.email}</strong> — you're on the list.</>
                : "You're on the list."
              }
            </p>
            <button
              className={`confirmed-copy ${copied ? 'confirmed-copy--done' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied ✓' : 'Copy waitlist link'}
            </button>
          </div>

          {/* Divider */}
          <div className="confirmed-divider" />

          {/* What's next */}
          <div className="confirmed-next">
            {NEXT_ITEMS.map(item => (
              <div className="confirmed-next-item" key={item.n}>
                <span className="confirmed-next-n">{item.n}</span>
                <div>
                  <p className="confirmed-next-title">{item.title}</p>
                  <p className="confirmed-next-desc">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview card */}
          <div className="preview-card-wrap">
            <PreviewCard />
          </div>

          {/* Contact */}
          <p className="confirmed-contact">
            Have questions? Reach us at{' '}
            <a href="mailto:support@wealthdeck.com" className="confirmed-email-link">
              support@wealthdeck.com
            </a>
          </p>

        </main>

        <footer className="confirmed-footer">
          <span>© 2026 WealthDeck</span>
          <nav className="confirmed-footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </footer>

      </div>
    </div>
  )
}
