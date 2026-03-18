import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Background from '../components/Background'
import './Survey.css'

// ── Question data ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'region',
    question: 'Where are you primarily based?',
    hint: 'Helps us prioritize currencies and bank integrations',
    multi: false,
    options: [
      'North America', 'Europe',
      'Southeast Asia', 'Middle East',
      'Latin America', 'East Asia',
      'Africa', 'Oceania',
    ],
  },
  {
    id: 'assets',
    question: 'What types of assets do you hold?',
    hint: "We'll build the integrations you actually need",
    multi: true,
    options: [
      'Stocks & ETFs', 'Crypto',
      'Real Estate', 'Multi-Currency Cash',
      'Retirement Accounts', 'Business Equity',
      'Commodities', 'Alternatives',
    ],
  },
  {
    id: 'frustration',
    question: "What's your biggest frustration tracking your net worth?",
    hint: 'This directly shapes what we build first',
    multi: false,
    options: [
      'Scattered across too many apps', 'No multi-currency support',
      "Can't track all asset types", 'Spreadsheet chaos',
      'No historical trends', 'Privacy concerns',
    ],
  },
  {
    id: 'current_tool',
    question: 'What do you currently use?',
    hint: 'So we can make switching painless',
    multi: true,
    options: [
      'Spreadsheets', 'Empower',
      'Kubera', 'Monarch Money',
      'Copilot', 'Nothing — just vibes',
      'Custom scripts', 'Other',
    ],
  },
]

const TOTAL    = QUESTIONS.length
const PROGRESS = [25, 50, 75, 100]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Survey() {
  const navigate                       = useNavigate()
  const { signupData, setSurveyAnswers } = useApp()

  const activeSignup = signupData ?? { id: 'dev', email: 'you@email.com', position: 1 }

  const [step, setStep]           = useState(0)
  const [displayStep, setDisplay] = useState(0)
  const [phase, setPhase]         = useState('idle') // 'idle' | 'exit' | 'enter'
  const [answers, setAnswers]     = useState({})
  const timerRef                  = useRef(null)

  const q          = QUESTIONS[displayStep]
  const selection  = answers[q.id] ?? (q.multi ? [] : null)
  const hasSelection = q.multi ? selection.length > 0 : selection !== null
  const isFirstQ   = step === 0
  const isLastQ    = step === TOTAL - 1

  // ── Transition helper ──
  const transition = useCallback((toStep, direction = 'forward') => {
    setPhase('exit')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setStep(toStep)
      setDisplay(toStep)
      setPhase('enter')
      timerRef.current = setTimeout(() => setPhase('idle'), 350)
    }, 150)
  }, [])

  // ── Option toggle ──
  const toggle = (opt) => {
    setAnswers((prev) => {
      const cur = prev[q.id]
      if (q.multi) {
        const arr = cur ?? []
        return { ...prev, [q.id]: arr.includes(opt) ? arr.filter(o => o !== opt) : [...arr, opt] }
      }
      return { ...prev, [q.id]: opt }
    })
  }

  // ── Continue ──
  const advance = useCallback(() => {
    if (!hasSelection) return
    const nextStep = step + 1

    // TODO: INSERT survey_responses to Supabase here (per-question save)
    // saveSurveyResponse(activeSignup.id, q.id, selection)

    if (nextStep >= TOTAL) {
      // TODO: UPDATE waitlist_signups SET survey_completed = true
      setSurveyAnswers({
        region:         answers.region        ?? null,
        assetTypes:     answers.assets        ?? [],
        painPoint:      answers.frustration   ?? null,
        currentTools:   answers.current_tool  ?? [],
        surveyCompleted: true,
      })
      navigate('/confirmed')
      return
    }
    transition(nextStep)
  }, [hasSelection, step, answers, transition, navigate, setSurveyAnswers])

  // ── Back ──
  const goBack = useCallback(() => {
    if (isFirstQ) return
    transition(step - 1)
  }, [isFirstQ, step, transition])

  // ── Skip ──
  const skip = () => {
    // TODO: UPDATE waitlist_signups SET survey_completed = false
    setSurveyAnswers({
      region:          answers.region       ?? null,
      assetTypes:      answers.assets       ?? [],
      painPoint:       answers.frustration  ?? null,
      currentTools:    answers.current_tool ?? [],
      surveyCompleted: false,
    })
    navigate('/confirmed')
  }

  // ── Keyboard: Enter triggers Continue ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') {
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  const phaseClass = phase === 'exit' ? 'q-exit' : phase === 'enter' ? 'q-enter' : ''

  return (
    <div className="survey-page">
      <Background />
      <div className="survey-layout">

        {/* ── Top bar ── */}
        <header className="survey-topbar">
          <span className="survey-logo">WealthDeck</span>
          <button className="survey-skip-link" onClick={skip}>
            Skip to waitlist →
          </button>
        </header>

        {/* ── Progress bar ── */}
        <div
          className="survey-progress-track"
          role="progressbar"
          aria-valuenow={PROGRESS[displayStep]}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="survey-progress-fill" style={{ width: `${PROGRESS[displayStep]}%` }} />
        </div>

        {/* ── Question ── */}
        <main className="survey-main">
          <div className={`survey-question ${phaseClass}`}>

            <p className="survey-step">{displayStep + 1} of {TOTAL}</p>
            <h1 className="survey-q-text">{q.question}</h1>
            <p className="survey-q-hint">{q.hint}</p>

            {/* Option pills */}
            <div className="survey-pills" role="group" aria-label={q.question}>
              {q.options.map((opt) => {
                const selected = q.multi ? selection.includes(opt) : selection === opt
                return (
                  <button
                    key={opt}
                    className={`survey-pill ${selected ? 'survey-pill--selected' : ''}`}
                    onClick={() => toggle(opt)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        toggle(opt)
                      }
                    }}
                    type="button"
                    aria-pressed={selected}
                  >
                    {selected && <span className="pill-check" aria-hidden="true">✓ </span>}
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="survey-nav">
              <button
                className="survey-back"
                onClick={goBack}
                type="button"
                aria-hidden={isFirstQ}
                style={{ visibility: isFirstQ ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>

              <button
                className={`survey-continue ${!hasSelection ? 'survey-continue--disabled' : ''}`}
                onClick={advance}
                type="button"
                aria-disabled={!hasSelection}
              >
                {isLastQ ? 'Finish →' : 'Continue'}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
