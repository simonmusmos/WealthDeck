import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const id = setTimeout(onDismiss, duration)
    return () => clearTimeout(id)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="toast" role="alert">
      <span>{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
