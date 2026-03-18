import { useState, useEffect } from 'react'
import './StickyMobileCTA.css'

export default function StickyMobileCTA({ heroFormId }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const formEl = document.getElementById(heroFormId)
    if (!formEl) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(formEl)
    return () => observer.disconnect()
  }, [heroFormId])

  const handleClick = () => {
    const input = document.getElementById(heroFormId)
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => input.focus(), 400)
    }
  }

  return (
    <div className={`sticky-cta ${visible ? 'sticky-cta--visible' : ''}`} aria-hidden={!visible}>
      <div className="sticky-cta-inner">
        <button className="sticky-cta-btn" onClick={handleClick} tabIndex={visible ? 0 : -1}>
          Get early access
        </button>
      </div>
    </div>
  )
}
