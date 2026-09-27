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
