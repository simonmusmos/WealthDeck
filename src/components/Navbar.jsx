import { useEffect, useState, useRef } from 'react'
import './Navbar.css'

export default function Navbar({ heroRef }) {
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    if (!heroRef?.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [heroRef])

  const scrollToForm = () => {
    const input = document.getElementById('hero-email')
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => input.focus(), 400)
    }
  }

  return (
    <>
      {/* Static nav (always rendered, part of page flow) */}
      <nav className="navbar static-nav">
        <NavContent onCta={scrollToForm} />
      </nav>

      {/* Sticky nav (slides in when hero leaves viewport) */}
      <nav className={`navbar sticky-nav ${sticky ? 'visible' : ''}`} aria-hidden={!sticky}>
        <NavContent onCta={scrollToForm} />
      </nav>
    </>
  )
}

function NavContent({ onCta }) {
  return (
    <div className="navbar-inner">
      <span className="navbar-logo">WealthDeck</span>
      <button className="navbar-cta" onClick={onCta}>
        Get early access
      </button>
    </div>
  )
}
