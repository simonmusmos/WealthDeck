import { useState, useEffect, useRef } from 'react'
import { getWaitlistCount } from '../lib/supabase'
import './SocialProof.css'

const FALLBACK_COUNT = 4231
const COUNT_DURATION = 1200 // ms

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default function SocialProof() {
  const [displayCount, setDisplayCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    let targetCount = FALLBACK_COUNT

    // Kick off animation immediately with fallback, then optionally
    // swap to real count if Supabase returns before animation ends.
    const animate = (to) => {
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / COUNT_DURATION, 1)
        setDisplayCount(Math.round(to * easeOut(t)))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    animate(targetCount)

    // Try to fetch real count; if it arrives before animation ends, restart with live number
    getWaitlistCount().then((liveCount) => {
      if (liveCount !== null && liveCount !== targetCount) {
        targetCount = liveCount
        animate(liveCount)
      }
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section className="social-proof">
      <div className="social-proof-inner">
        <span className="pulse-dot" aria-hidden="true" />
        <p className="social-proof-text">
          <span className="social-proof-count">
            {displayCount.toLocaleString('en-US')}
          </span>
          {' '}people are already on the waitlist
        </p>
      </div>
    </section>
  )
}
