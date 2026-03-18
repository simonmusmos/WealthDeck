import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [utmParams, setUtmParams] = useState({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    h: null,
  })
  const [signupData, setSignupData] = useState(null)   // { email, id, position, emailSent? }
  const [draftEmail, setDraftEmail] = useState('')     // shared across all email forms
  const [surveyAnswers, setSurveyAnswers] = useState(null) // { region, assetTypes, painPoint, currentTools, surveyCompleted }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUtmParams({
      utm_source:   params.get('utm_source')   || null,
      utm_medium:   params.get('utm_medium')   || null,
      utm_campaign: params.get('utm_campaign') || null,
      h:            params.get('h')            || null,
    })
  }, [])

  return (
    <AppContext.Provider value={{ utmParams, signupData, setSignupData, draftEmail, setDraftEmail, surveyAnswers, setSurveyAnswers }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
