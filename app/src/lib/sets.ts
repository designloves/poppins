import type { Word } from '../data/constants'

// Public Supabase edge function — same project as translate.ts and
// auth.ts. POST /sets requires a Bearer token (see supabase/functions/
// greta/index.ts's saveSet handler).
const API = 'https://ivcnjkzuggwpxvnalbol.supabase.co/functions/v1/greta'

export async function saveSet(
  token: string,
  set: { topic: string; vocab: Word[]; lang_from: string; lang_to: string },
): Promise<{ id: string }> {
  const res = await fetch(`${API}/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(set),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not save list')
  return data
}
