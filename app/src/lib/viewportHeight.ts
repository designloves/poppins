// Tracks the visual viewport so the on-screen keyboard shrinks the app
// instead of covering it, and undoes mobile browsers' own "scroll the
// focused input into view" behavior where it fights with that shrink.
// Ported from the legacy app verbatim — these are exact, hard-won fixes
// for real mobile browser quirks, not obvious from first principles.
export function initViewportHeight() {
  function syncAppHeight() {
    try {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${h}px`)
      // A short visible height (typically a small phone with the keyboard
      // open) means room is tight — some non-essential content hides
      // itself via the .short-viewport class rather than forcing a scroll.
      document.documentElement.classList.toggle('short-viewport', h < 560)
    } catch {
      // ignore
    }
  }

  // Some mobile browsers scroll the outer document itself when a focused
  // input is covered by the keyboard, even with html/body set to
  // overflow:hidden — snap it back so only the inner #screen ever
  // scrolls. The browser's own "scroll focused input into view" can also
  // grab #screen itself (it's the nearest scrollable ancestor of any
  // input), shoving the header/card up and out of view even though
  // --app-height has already shrunk the frame to fit above the keyboard
  // — snap that back to the top too.
  function resetOuterScroll() {
    try {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      // The write-5x screen's stacked inputs (w5-0..w5-4) can legitimately
      // need #screen's own scroll to reach the lower ones — leave that
      // be. Every other input (just the single quiz-input) should always
      // sit flush at the top, so undo the browser's scroll-into-view
      // there.
      const active = document.activeElement as HTMLElement | null
      const inWrite5 = !!active?.id && active.id.startsWith('w5-')
      const screen = document.getElementById('screen')
      if (screen && !inWrite5) screen.scrollTop = 0
    } catch {
      // ignore
    }
  }

  // iOS Safari animates its own "scroll focused input into view" in sync
  // with the keyboard's slide-up (which can take ~250-400ms, longer on
  // slower devices), continuously adjusting scroll position frame by
  // frame rather than doing it once. A couple of fixed-delay corrections
  // can win briefly and still lose to a later animation frame that
  // scrolls again after the last correction ran. Re-assert scrollTop 0
  // on every animation frame for a window that comfortably outlasts the
  // keyboard animation instead of guessing at fixed delays.
  function pinScrollFor(durationMs: number) {
    const start = performance.now()
    function tick() {
      resetOuterScroll()
      if (performance.now() - start < durationMs) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  syncAppHeight()
  window.addEventListener('resize', syncAppHeight)
  window.addEventListener('resize', resetOuterScroll)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight)
    window.visualViewport.addEventListener('scroll', syncAppHeight)
    window.visualViewport.addEventListener('resize', resetOuterScroll)
  }
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      pinScrollFor(700)
    }
  })
}
