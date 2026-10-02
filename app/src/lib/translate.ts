// Public, unauthenticated endpoint (a Claude-powered Supabase edge
// function) — same one the legacy app calls, and it needs no session.
const API = 'https://ivcnjkzuggwpxvnalbol.supabase.co/functions/v1/greta'

export interface TranslateResult {
  from: string
  to: string
  translations: string[]
}

export async function translateWords(
  words: string[],
  from?: string,
  to?: string,
): Promise<TranslateResult> {
  const res = await fetch(`${API}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, ...(from ? { from } : {}), ...(to ? { to } : {}) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Translation failed')
  return data
}

export interface AdjectiveFormPair {
  comparative: string
  superlative: string
}

export interface WordForms {
  isAdjective: boolean
  from?: AdjectiveFormPair
  to?: AdjectiveFormPair
}

// Given word pairs already translated between `from` and `to`, asks which
// ones are adjectives and, for those, their comparative/superlative forms
// in both languages — used by the "add conjugations" toggle in the list
// creator (see src/lib/adjectiveForms.ts for how the result gets merged
// back onto the word list).
export async function fetchAdjectiveForms(
  words: { from: string; to: string }[],
  from: string,
  to: string,
): Promise<WordForms[]> {
  const res = await fetch(`${API}/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, from, to }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not fetch conjugations')
  return data.forms
}
