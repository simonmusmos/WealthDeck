import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Background from '../components/Background'
import EmailForm from '../components/EmailForm'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import SocialProof from '../components/SocialProof'
import StickyMobileCTA from '../components/StickyMobileCTA'
import './Waitlist.css'

// ── Headline config ──────────────────────────────────────────────────────────
// Each variant defines segments; set accent:true to color a segment --accent.
const HEADLINES = {
  default: [
    { text: 'Know your entire ', accent: false },
    { text: 'net worth', accent: true },
    { text: '. One Place.', accent: false },
  ],
  v2: [
    { text: 'See your ', accent: false },
    { text: 'full financial picture', accent: true },
    { text: '. One Place.', accent: false },
  ],
  v3: [
    { text: 'Your ', accent: false },
    { text: 'net worth', accent: true },
    { text: ', every asset, one dashboard.', accent: false },
  ],
}
// ────────────────────────────────────────────────────────────────────────────

export default function Waitlist() {
  const { utmParams } = useApp()
  const [toast, setToast] = useState('')

  const headlineKey = utmParams.h && HEADLINES[utmParams.h] ? utmParams.h : 'default'
  const headlineSegments = HEADLINES[headlineKey]

  return (
    <div className="waitlist-page">
      <Background />

      <div className="waitlist-content">

        {/* ── Hero ── */}
        <section className="hero">
          <div className="container">
            <div className="hero-inner">

              {/* Left column */}
              <div className="hero-left">
                <div className="waitlist-badge">
                  <span className="badge-dot" />
                  4,231 people are already on the waitlist
                </div>

                <h1 className="hero-heading">
                  {headlineSegments.map((seg, i) => (
                    seg.accent
                      ? <span key={i} className="hero-accent">{seg.text}</span>
                      : <span key={i}>{seg.text}</span>
                  ))}
                </h1>

                <p className="hero-sub">
                  Track every asset, currency, and country from a single
                  dashboard — built for digital nomads, global investors,
                  and the wealthy.
                </p>

                <EmailForm id="hero-email" onToast={setToast} />

                <p className="trust-line">256-bit encrypted · No data selling</p>
              </div>

              {/* Right column — desktop only */}
              <div className="hero-right">
                <ProductCard />
              </div>

            </div>
          </div>
        </section>

        <SocialProof />

        {/* ── Features ── */}
        <section className="features">
          <div className="container">
            <div className="features-table">
              {features.map((f) => (
                <div className="feature-row" key={f.label}>
                  <span className="feature-label">{f.label}</span>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-heading">Ready to see your full picture?</h2>
            <EmailForm id="cta-email" centered onToast={setToast} />
            <p className="cta-trust">Free during early access · No credit card</p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="container">
            <div className="footer-inner">
              <span className="footer-copy">© 2026 WealthDeck</span>
              <nav className="footer-links">
                <Link to="/privacy">Privacy</Link>
                <span className="footer-sep">·</span>
                <Link to="/terms">Terms</Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>

      <Toast message={toast} onDismiss={() => setToast('')} />
      <StickyMobileCTA heroFormId="hero-email" />
    </div>
  )
}

const features = [
  {
    label: 'Multi-Currency',
    desc: 'Real-time conversion and tracking across every currency you hold, with no manual entry.',
  },
  {
    label: 'Every Asset',
    desc: 'Stocks, crypto, property, retirement accounts, business equity — one complete picture.',
  },
  {
    label: 'Your Data',
    desc: 'Bank-grade encryption, no data selling, and no third-party analytics on your financial information.',
  },
]

