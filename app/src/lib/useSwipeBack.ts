import { useEffect, useLayoutEffect, useRef } from 'react'

// A swipe starting within this many px of the left edge of #screen counts
// as a back-navigation gesture attempt (matches the iOS system convention
// of an edge swipe, so it doesn't fight normal scrolling/tapping anywhere
// else on the screen).
const EDGE_ZONE = 24
// How far right the touch has to travel before it counts as a completed
// "swipe back," not just a stray touch near the edge.
const MIN_DISTANCE = 60
// Vertical drift allowed before it's treated as a vertical scroll instead
// of a horizontal back-swipe.
const MAX_VERTICAL_DRIFT = 40

// Calls onBack after a left-edge swipe-right gesture on #screen — the
// same motion as the system "swipe back" gesture, reimplemented here
// because #screen intercepts touches (it's the app's own scroll
// container), and because we want it available in the installed web app
// too, not just in a native container that would provide it for free.
export function useSwipeBack(onBack: () => void) {
  const onBackRef = useRef(onBack)
  useLayoutEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    const screen = document.getElementById('screen')
    if (!screen) return

    let startX = 0
    let startY = 0
    let tracking = false

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch || touch.clientX > EDGE_ZONE) {
        tracking = false
        return
      }
      startX = touch.clientX
      startY = touch.clientY
      tracking = true
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return
      tracking = false
      const touch = e.changedTouches[0]
      if (!touch) return
      const dx = touch.clientX - startX
      const dy = Math.abs(touch.clientY - startY)
      if (dx > MIN_DISTANCE && dy < MAX_VERTICAL_DRIFT) {
        onBackRef.current()
      }
    }

    screen.addEventListener('touchstart', onTouchStart, { passive: true })
    screen.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      screen.removeEventListener('touchstart', onTouchStart)
      screen.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
