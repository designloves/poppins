// Tracks the visual viewport so the on-screen keyboard shrinks the app
// instead of covering it, and re-anchors #frame to the visual viewport's
// actual on-screen size and position — see syncAppPosition() below for
// why the position part is the one that actually matters.
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

  // iOS Safari can also zoom/narrow the *visual* viewport's width
  // independently of the layout viewport's — the horizontal counterpart
  // of the height mismatch --app-height exists for. #frame's width was
  // previously just left:0/right:0 (i.e. the full layout viewport width),
  // which overflowed off the right edge of the actual visible window
  // whenever the two diverged. Sized off visualViewport.width instead, it
  // can't.
  function syncAppWidth() {
    try {
      const w = window.visualViewport ? window.visualViewport.width : window.innerWidth
      document.documentElement.style.setProperty('--app-width', `${w}px`)
    } catch {
      // ignore
    }
  }

  // #frame is position:fixed, which anchors it to the *layout* viewport's
  // origin (top:0/left:0 = the layout viewport's own corner) — but iOS
  // Safari can pan the *visual* viewport away from the layout viewport
  // when a focused input needs to clear the keyboard
  // (visualViewport.offsetTop/offsetLeft), a completely separate
  // mechanism from document/element scroll position. Confirmed directly
  // from a real device: visualViewport.offsetTop read ~414px while
  // #frame's rendered top was exactly -414px — the pan, not a leftover
  // scroll, was pushing the whole frame off-screen no matter what
  // resetOuterScroll() did, since that only ever resets scroll position, a
  // value this pan never touches. The same pan can happen horizontally
  // (offsetLeft), pushing #frame's right edge past the visible window.
  // Continuously re-anchoring #frame's own top/left to the current offsets
  // keeps it pinned to what's actually visible regardless of either pan.
  function syncAppPosition() {
    try {
      const top = window.visualViewport ? window.visualViewport.offsetTop : 0
      const left = window.visualViewport ? window.visualViewport.offsetLeft : 0
      document.documentElement.style.setProperty('--app-top', `${top}px`)
      document.documentElement.style.setProperty('--app-left', `${left}px`)
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
  // — snap that back to the top too. Every screen has exactly one input
  // (write-5x included, since it moved to a single always-visible field
  // rather than 5 stacked ones), so it should always sit flush at the top.
  function resetOuterScroll() {
    try {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      const screen = document.getElementById('screen')
      if (screen) screen.scrollTop = 0
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
      syncAppPosition()
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
      syncAppWidth()
      syncAppPosition()
    }),
  )
  window.addEventListener('resize', syncAppHeight)
  window.addEventListener('resize', syncAppWidth)
  window.addEventListener('resize', resetOuterScroll)
  window.addEventListener('resize', syncAppPosition)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight)
    window.visualViewport.addEventListener('resize', syncAppWidth)
    window.visualViewport.addEventListener('scroll', syncAppHeight)
    window.visualViewport.addEventListener('resize', resetOuterScroll)
    window.visualViewport.addEventListener('resize', syncAppPosition)
    window.visualViewport.addEventListener('scroll', syncAppPosition)
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
