/**
 * POST /api/loops-trigger
 *
 * Called from the /confirmed page on mount (once per signup).
 * Server-side only — the Loops API key never reaches the browser.
 *
 * Body:
 *   { email, position, region, assetTypes, painPoint,
 *     currentTools, surveyCompleted, utmSource }
 *
 * Returns:
 *   200 { ok: true }
 *   500 { ok: false, error: string }
 *
 * Required env vars (set in Vercel dashboard or .env.local):
 *   LOOPS_API_KEY              — Loops secret API key
 *   LOOPS_WELCOME_EMAIL_ID     — transactional email ID for "You're in" email
 *   LOOPS_WAITLIST_LIST_ID     — mailing list ID for the waitlist-nurture sequence
 */

const LOOPS_BASE = 'https://app.loops.so/api/v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const {
    email,
    position,
    region,
    assetTypes,
    painPoint,
    currentTools,
    surveyCompleted,
    utmSource,
  } = req.body ?? {}

  if (!email) {
    return res.status(400).json({ ok: false, error: 'email is required' })
  }

  const apiKey          = process.env.LOOPS_API_KEY
  const transactionalId = process.env.LOOPS_WELCOME_EMAIL_ID
  const listId          = process.env.LOOPS_WAITLIST_LIST_ID

  if (!apiKey) {
    console.error('[loops-trigger] LOOPS_API_KEY not set')
    return res.status(500).json({ ok: false, error: 'Server misconfiguration' })
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  try {
    // ── Step 1: Create / update contact with survey-derived properties ──────
    const contactBody = {
      email,
      waitlistPosition: position,
      region:           region          ?? '',
      assetTypes:       Array.isArray(assetTypes) ? assetTypes.join(', ') : (assetTypes ?? ''),
      painPoint:        painPoint        ?? '',
      currentTools:     Array.isArray(currentTools) ? currentTools.join(', ') : (currentTools ?? ''),
      surveyCompleted:  Boolean(surveyCompleted),
      utmSource:        utmSource        ?? '',
      userGroup:        'waitlist',
      // Adds the contact to the waitlist-nurture mailing list / automation
      ...(listId ? { mailingLists: { [listId]: true } } : {}),
    }

    const contactRes = await fetch(`${LOOPS_BASE}/contacts/create`, {
      method:  'POST',
      headers,
      body:    JSON.stringify(contactBody),
    })

    if (!contactRes.ok) {
      const text = await contactRes.text()
      throw new Error(`Loops contacts/create failed (${contactRes.status}): ${text}`)
    }

    // ── Step 2: Send welcome transactional email ─────────────────────────────
    if (transactionalId) {
      const emailRes = await fetch(`${LOOPS_BASE}/transactional`, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          transactionalId,
          email,
          dataVariables: { waitlistPosition: String(position ?? '') },
        }),
      })

      if (!emailRes.ok) {
        const text = await emailRes.text()
        // Non-fatal — contact is created, just log
        console.error(`[loops-trigger] transactional email failed (${emailRes.status}): ${text}`)
      }
    } else {
      console.warn('[loops-trigger] LOOPS_WELCOME_EMAIL_ID not set — skipping transactional email')
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    // Failure here does NOT lose the signup — it's already in Supabase.
    // Backfill contacts via Loops CSV import or re-run this endpoint later.
    console.error('[loops-trigger] error:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
