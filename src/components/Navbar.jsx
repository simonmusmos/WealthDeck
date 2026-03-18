import { useLocation, Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const isHome    = location.pathname === '/'

  if (location.pathname === '/survey') return null

  const handleCta = () => {
    if (isHome) {
      const input = document.getElementById('hero-email')
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => input.focus(), 400)
        return
      }
    }
    navigate('/')
  }

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link to="/" className="site-nav-logo">WealthDeck</Link>
        <button className="site-nav-cta" onClick={handleCta}>
          Get early access
        </button>
      </div>
    </nav>
  )
}
