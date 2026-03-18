import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Background from '../components/Background'
import './Confirmed.css'

// ── Count-up hook ─────────────────────────────────────────────────────────────
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

function useCountUp(target, duration = 1400) {
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

// ── Clipboard helper (TikTok WebView safe) ────────────────────────────────────
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

// ── What's next items ─────────────────────────────────────────────────────────
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

// ── Preview card chart data ───────────────────────────────────────────────────
const CHART_POINTS = [
  [0, 72], [8, 68], [16, 65], [26, 62], [34, 64],
  [44, 56], [54, 50], [64, 44], [76, 38], [86, 30], [100, 22],
]

function buildPath(pts, w, h) {
  return pts
    .map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${(px / 100) * w},${(py / 100) * h}`)
    .join(' ')
}

function PreviewCard() {
  return (
    <div className="preview-card">
      <p className="preview-label">Total Net Worth</p>

      <div className="preview-total-row">
        <span className="preview-amount">$3,038,632</span>
        <span className="preview-badge">+12.4% past year</span>
      </div>

      {/* SVG sparkline */}
      <div className="preview-chart">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#42d277" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#42d277" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path
            d={`${buildPath(CHART_POINTS, 400, 80)} L400,80 L0,80 Z`}
            fill="url(#chartGrad)"
          />
          {/* Line */}
          <path
            d={buildPath(CHART_POINTS, 400, 80)}
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
        {[
          { name: 'Equities',      value: '$381,281', pct: 50, color: '#42d277' },
          { name: 'Property',      value: '$271,133', pct: 35, color: '#8B9EB0' },
          { name: 'Crypto & Cash', value: '$194,877', pct: 25, color: '#E8B44F' },
        ].map(a => (
          <div className="preview-asset-row" key={a.name}>
            <span className="preview-asset-name">{a.name}</span>
            <div className="preview-asset-track">
              <div className="preview-asset-fill" style={{ width: `${a.pct}%`, background: a.color }} />
            </div>
            <span className="preview-asset-value">{a.value}</span>
          </div>
        ))}
      </div>

      <div className="preview-card-footer">
        <span className="preview-region-active">US</span>
        {' · '}
        <span className="preview-region-dim">UK · EU · SG · JP</span>
        <span className="preview-accounts"> — 4 accounts connected</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Confirmed() {
  const { signupData } = useApp()
  const signup   = signupData ?? { email: null, position: 4231 }
  const position = signup.position ?? 4231

  const displayPos = useCountUp(position, 1400)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText('https://waitlist.wealthdeck.app')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="confirmed-page">
      <Background />
      <div className="confirmed-layout">

        {/* Logo */}
        <header className="confirmed-topbar">
          <Link to="/" className="confirmed-logo">WealthDeck</Link>
        </header>

        <main className="confirmed-main">

          {/* ── Position hero ── */}
          <div className="confirmed-position-hero">
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

          {/* ── What's next ── */}
          <div className="confirmed-next">
            {NEXT_ITEMS.map(item => (
              <div className="confirmed-next-item" key={item.n}>
                <span className="confirmed-next-n">{item.n}</span>
                <div className="confirmed-next-body">
                  <p className="confirmed-next-title">{item.title}</p>
                  <p className="confirmed-next-desc">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Product preview ── */}
          <PreviewCard />

          {/* Contact */}
          <p className="confirmed-contact">
            Have questions? Reach us at{' '}
            <a href="mailto:hello@wealthdeck.com" className="confirmed-email-link">
              hello@wealthdeck.com
            </a>
          </p>

        </main>

        {/* Footer */}
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
