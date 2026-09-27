// Tracks the visual viewport so the on-screen keyboard shrinks the app
// instead of covering it, and re-anchors #frame to the visual viewport's
// actual on-screen position — see syncAppTop() below for why that part
// is the one that actually matters.
//
// interactive-widget=resizes-content (index.html's meta viewport) is the
// standardized way to get this for free, but it's Chromium-only (Chrome
// for Android 108+) — Safari has never implemented it, so on iOS this JS
// layer is the only thing that makes --app-height (and everything sized
// off it, like the word card's cqh-based padding) track the keyboard at
// all. It's a no-op where the browser already resizes content correctly
// (visualViewport.height and the layout viewport already agree there),
// so it's safe to run everywhere rather than branching per engine.
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

  // #frame is position:fixed, which anchors it to the *layout* viewport's
  // origin (top:0 = the layout viewport's top) — but iOS Safari can pan
  // the *visual* viewport away from the layout viewport when a focused
  // input needs to clear the keyboard (visualViewport.offsetTop), a
  // completely separate mechanism from document/element scroll position.
  // Confirmed directly from a real device: visualViewport.offsetTop read
  // ~414px while #frame's rendered top was exactly -414px — the pan,
  // not a leftover scroll, was pushing the whole frame off-screen no
  // matter what resetOuterScroll() did, since that only ever resets
  // scroll position, a value this pan never touches. Continuously
  // re-anchoring #frame's own top to the current offset keeps it pinned
  // to what's actually visible regardless of that pan.
  function syncAppTop() {
    try {
      const top = window.visualViewport ? window.visualViewport.offsetTop : 0
      document.documentElement.style.setProperty('--app-top', `${top}px`)
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

  // iOS Safari can scroll/pan a focused input into view pre-emptively,
  // before --app-height/--app-top have updated in response, using the
  // *old*, larger geometry — then keeps nudging both throughout the
  // keyboard's slide-up animation (~250-400ms, longer on slower devices).
  // A couple of fixed-delay corrections can win briefly and still lose to
  // a later animation frame that moves things again afterward. Re-assert
  // on every animation frame for a window that comfortably outlasts the
  // keyboard animation instead.
  function pinPositionFor(durationMs: number) {
    const start = performance.now()
    function tick() {
      resetOuterScroll()
      syncAppTop()
      if (performance.now() - start < durationMs) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // Calling these synchronously here runs before the browser's first
  // paint — before Safari has settled its own internal bookkeeping of
  // chrome/toolbar visibility right after a page load — and can lock in
  // a transient, incorrect value that nothing then corrects (no further
  // resize ever fires if nothing else changes). Waiting a couple of
  // animation frames lets that settle first.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      syncAppHeight()
      syncAppTop()
    }),
  )
  window.addEventListener('resize', syncAppHeight)
  window.addEventListener('resize', resetOuterScroll)
  window.addEventListener('resize', syncAppTop)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight)
    window.visualViewport.addEventListener('scroll', syncAppHeight)
    window.visualViewport.addEventListener('resize', resetOuterScroll)
    window.visualViewport.addEventListener('resize', syncAppTop)
    window.visualViewport.addEventListener('scroll', syncAppTop)
  }
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      pinPositionFor(700)
    }
  })
}
