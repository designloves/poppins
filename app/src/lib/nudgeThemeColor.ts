// Safari colors its own chrome (status bar, bottom toolbar) by sampling
// the page's rendered content/theme-color rather than reliably reacting
// to it — it can get stuck showing a stale color (e.g. after a full-bleed
// dark overlay closes) until something nudges it to re-evaluate. Briefly
// changing the <meta name="theme-color"> tag's content and then restoring
// it forces that re-evaluation; a known workaround for this exact class
// of staleness, not a guess. Called on every screen change (see
// navigate() in useAppState.ts) since that's every point content could
// have shifted enough for Safari's cached chrome color to be wrong.
export function nudgeThemeColor() {
  try {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const original = meta.getAttribute('content')
    if (!original) return
    meta.setAttribute('content', 'transparent')
    requestAnimationFrame(() => {
      meta.setAttribute('content', original)
    })
  } catch {
    // ignore
  }
}
