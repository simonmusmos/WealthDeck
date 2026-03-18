import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './EmailForm.css'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function EmailForm({ id, centered = false, onToast }) {
  const navigate = useNavigate()
  const { setSignupData, draftEmail, setDraftEmail } = useApp()

  // Pre-fill from shared draft (e.g. bottom CTA pre-fills if hero was typed in)
  const [email, setEmail] = useState(draftEmail)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const val = e.target.value
    setEmail(val)
    setDraftEmail(val)       // keep all forms in sync
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setError('Please enter a valid email')
      return
    }

    // TODO: replace with real Supabase insert once connected
    setSignupData({ email: email.trim(), id: 'dev', position: 4232 })
    navigate('/survey')
  }

  return (
    <form
      className={`email-form ${centered ? 'email-form--centered' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="email-form-row">
        <div className="email-field-wrap">
          <input
            id={id}
            className={`email-input ${error ? 'email-input--error' : ''}`}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={handleChange}
            autoFocus={id === 'hero-email'}
            autoComplete="email"
            disabled={loading}
            aria-label="Email address"
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>

        <button
          className={`btn-submit ${loading ? 'btn-submit--loading' : ''}`}
          type="submit"
          disabled={loading}
        >
          {loading ? <LoadingDots /> : 'Get early access'}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="email-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function LoadingDots() {
  return (
    <span className="loading-dots" aria-label="Joining…">
      Joining<span className="dot dot-1">.</span><span className="dot dot-2">.</span><span className="dot dot-3">.</span>
    </span>
  )
}
