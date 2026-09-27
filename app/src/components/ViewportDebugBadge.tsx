import { useEffect, useState } from 'react'

interface Metrics {
  innerWidth: number
  innerHeight: number
  visualViewportWidth: number | null
  visualViewportHeight: number | null
  visualViewportOffsetLeft: number | null
  visualViewportOffsetTop: number | null
  appWidth: string
  appHeight: string
  appLeft: string
  appTop: string
  frameWidth: number | null
  frameHeight: number | null
  frameLeft: number | null
  frameTop: number | null
  screenHeight: number | null
  screenScrollTop: number | null
  activeElement: string
}

function readMetrics(): Metrics {
  const frame = document.getElementById('frame')
  const screen = document.getElementById('screen')
  const active = document.activeElement as HTMLElement | null
  const cs = getComputedStyle(document.documentElement)
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    visualViewportWidth: window.visualViewport?.width ?? null,
    visualViewportHeight: window.visualViewport?.height ?? null,
    visualViewportOffsetLeft: window.visualViewport?.offsetLeft ?? null,
    visualViewportOffsetTop: window.visualViewport?.offsetTop ?? null,
    appWidth: cs.getPropertyValue('--app-width').trim(),
    appHeight: cs.getPropertyValue('--app-height').trim(),
    appLeft: cs.getPropertyValue('--app-left').trim(),
    appTop: cs.getPropertyValue('--app-top').trim(),
    frameWidth: frame?.getBoundingClientRect().width ?? null,
    frameHeight: frame?.getBoundingClientRect().height ?? null,
    frameLeft: frame?.getBoundingClientRect().left ?? null,
    frameTop: frame?.getBoundingClientRect().top ?? null,
    screenHeight: screen?.getBoundingClientRect().height ?? null,
    screenScrollTop: screen?.scrollTop ?? null,
    activeElement: active ? `${active.tagName}${active.id ? '#' + active.id : ''}` : 'none',
  }
}

// Opt-in (?debug=1) live readout of the exact viewport measurements this
// app's keyboard-avoidance logic reacts to. Screenshotting this at the
// moment a layout bug is visible on a real device gives an actual number
// to diagnose from, instead of guessing at what visualViewport/--app-*
// were doing — headless testing can't reproduce real iOS Safari's
// keyboard/chrome timing, so this is the only way to see it directly.
export function ViewportDebugBadge() {
  const [metrics, setMetrics] = useState<Metrics>(readMetrics)

  useEffect(() => {
    const update = () => setMetrics(readMetrics())
    const interval = window.setInterval(update, 200)
    window.addEventListener('resize', update)
    window.addEventListener('focusin', update)
    window.addEventListener('focusout', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('resize', update)
      window.removeEventListener('focusin', update)
      window.removeEventListener('focusout', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,.85)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 10,
        lineHeight: 1.4,
        padding: '4px 8px',
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
    >
      {`innerW/H=${metrics.innerWidth}/${metrics.innerHeight} vvW/H=${metrics.visualViewportWidth}/${metrics.visualViewportHeight} vvOffsetL/T=${metrics.visualViewportOffsetLeft}/${metrics.visualViewportOffsetTop}
--app-width/height=${metrics.appWidth}/${metrics.appHeight} --app-left/top=${metrics.appLeft}/${metrics.appTop}
frameL/T/W/H=${metrics.frameLeft?.toFixed(0)}/${metrics.frameTop?.toFixed(0)}/${metrics.frameWidth?.toFixed(0)}/${metrics.frameHeight?.toFixed(0)} screenH=${metrics.screenHeight?.toFixed(0)} scrollTop=${metrics.screenScrollTop} active=${metrics.activeElement}`}
    </div>
  )
}
