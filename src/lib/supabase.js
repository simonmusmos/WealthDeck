import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars not set. See .env.example')
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder'
)

/**
 * Insert a new waitlist signup.
 * Returns { data, error } — data contains { id, position }.
 */
export async function insertSignup({ email, utm_source, utm_medium, utm_campaign, device, referrer, headline_variant }) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email, utm_source, utm_medium, utm_campaign, device, referrer, headline_variant }])
    .select('id, position')
    .single()

  return { data, error }
}

/**
 * Fetch an existing signup by email.
 * Returns { data, error } — data contains { id, position }.
 */
export async function getSignupByEmail(email) {
  const { data, error } = await supabase
    .from('waitlist')
    .select('id, position')
    .eq('email', email)
    .single()

  return { data, error }
}

/**
 * Save survey answers for a signup.
 * answers: { region, profile, assets, tracking }
 * survey_completed: boolean
 */
export async function saveSurveyAnswers(id, answers, survey_completed = true) {
  const { error } = await supabase
    .from('waitlist')
    .update({ survey_answers: answers, survey_completed })
    .eq('id', id)

  return { error }
}

/**
 * Fetch the total waitlist count (public, no email data exposed).
 * Returns the count as a number, or null on error.
 */
export async function getWaitlistCount() {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  if (error) return null
  return count
}
