import { Link } from 'react-router-dom'
import Background from '../components/Background'
import './Legal.css'

export function Privacy() {
  return <LegalPage title="Privacy Policy" lastUpdated="March 2026" />
}

export function Terms() {
  return <LegalPage title="Terms of Service" lastUpdated="March 2026" />
}

function LegalPage({ title, lastUpdated }) {
  return (
    <div className="legal-page">
      <Background />
      <div className="legal-content">
        <div className="legal-card">
          <Link to="/" className="legal-back">← Back</Link>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-meta">Last updated {lastUpdated}</p>
          <p className="legal-placeholder">
            This page is a placeholder. Full {title.toLowerCase()} will be published before public launch.
          </p>
        </div>
      </div>
    </div>
  )
}
