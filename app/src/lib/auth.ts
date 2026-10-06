// Public, unauthenticated Supabase auth endpoints — same project the
// legacy app talks to. Signing in works without a backend deployment
// of our own. Re-syncing a user's lists to the server (POST /sets) is
// a separate, explicit action — see lib/sets.ts and useAppState's
// transferLists().
const SUPABASE_URL = 'https://ivcnjkzuggwpxvnalbol.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_nvKqUBjP0B-TmROc_aJtdA_U-P0pr_u'

const SESSION_KEY = 'greta_session'

export interface CurrentUser {
  id: string
  email: string
}

interface StoredSession {
  token: string
  refresh?: string
}

interface AuthResult {
  user: CurrentUser
  token: string
}

function parseJWT(token: string): { sub?: string; email?: string; exp?: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function tokenExpired(token: string): boolean {
  const p = parseJWT(token)
  return !p?.exp || Date.now() / 1000 > p.exp - 60
}

function userFromToken(token: string): CurrentUser | null {
  const p = parseJWT(token)
  return p?.sub && p?.email ? { id: p.sub, email: p.email } : null
}

function saveSession(token: string, refresh?: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, refresh }))
  } catch {
    // localStorage can throw (private browsing, quota) — losing the
    // session isn't worth surfacing an error for
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore, see saveSession
  }
}

export async function sendMagicLink(email: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({
      email,
      create_user: true,
      options: { emailRedirectTo: location.href.split('#')[0] },
    }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.msg || d.error_description || 'Could not send link')
  }
}

// Called once on app start: picks up a fresh magic-link redirect (the
// access/refresh tokens Supabase appends to the URL hash), or restores
// (and if needed refreshes) a previously saved session.
export async function initAuth(): Promise<AuthResult | null> {
  const params = new URLSearchParams(location.hash.substring(1))
  const hashToken = params.get('access_token')
  if (hashToken) {
    saveSession(hashToken, params.get('refresh_token') ?? undefined)
    try {
      history.replaceState(null, '', location.pathname + location.search)
    } catch {
      // ignore
    }
    const user = userFromToken(hashToken)
    return user ? { user, token: hashToken } : null
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    let { token, refresh }: StoredSession = JSON.parse(raw)
    if (tokenExpired(token)) {
      if (!refresh) {
        clearSession()
        return null
      }
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      if (!res.ok) {
        clearSession()
        return null
      }
      const d = await res.json()
      token = d.access_token
      refresh = d.refresh_token
    }
    saveSession(token, refresh)
    const user = userFromToken(token)
    return user ? { user, token } : null
  } catch {
    clearSession()
    return null
  }
}

export async function signOutRemote(token: string): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    })
  } catch {
    // best-effort — the local session is cleared either way
  }
}
