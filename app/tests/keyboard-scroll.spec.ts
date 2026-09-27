import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

// Regression tests for the "quiz card (and coin pouch) scrolled
// off-screen when the keyboard opens" bug. index.html's meta viewport
// declares interactive-widget=resizes-content, but that's Chromium-only
// (Chrome for Android 108+) — Safari has never implemented it, so on iOS
// app/src/lib/viewportHeight.ts's visualViewport-based tracking is what
// actually shrinks --app-height (and #frame with it) for the keyboard.
//
// #screen (not the outer page) is the nearest scrollable ancestor of the
// quiz input, so the browser's native "scroll focused input into view"
// can grab #screen directly and shove the header/pouch up out of view,
// sometimes using the pre-shrink geometry and then re-adjusting through
// the keyboard's whole slide-up animation. resetOuterScroll() (re-applied
// every animation frame for 700ms after focus, via pinScrollFor) undoes
// that. write-5x uses the same single #quiz-input as normal mode now (not
// 5 stacked inputs), so this applies uniformly there too — there's no
// longer a later, below-the-fold input that would legitimately need its
// own scroll to reach.
//
// A real virtual keyboard can't be triggered in a headless browser, so
// these simulate the same conditions the code reacts to: a
// keyboard-shrunk --app-height (or a real viewport resize) with #screen
// already scrolled away from the top, then a focus event.

async function enterWrite5Mode(page: Page) {
  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await page.getByText('Övning').waitFor({ timeout: 3000 })
}

// Regression test for the actual root cause behind "the word card and
// input scroll off-screen and stay there no matter what": confirmed on a
// real device via the ?debug=1 overlay — visualViewport.offsetTop reads
// ~414px (iOS Safari panning the *visual* viewport to clear the keyboard)
// while #frame, anchored to the *layout* viewport by position:fixed,
// rendered at top:-414px. That's a pan, not a scroll position, so
// resetOuterScroll() (which only resets scroll) never touched it —
// nothing did, until #frame's own top started tracking
// visualViewport.offsetTop directly via --app-top.
test('#frame stays anchored to the visible window when the visual viewport pans (iOS keyboard quirk)', async ({
  page,
}) => {
  await startQuiz(page)

  const pan = 120
  await page.evaluate((offsetTop) => {
    Object.defineProperty(window.visualViewport, 'offsetTop', {
      configurable: true,
      get: () => offsetTop,
    })
    window.visualViewport!.dispatchEvent(new Event('scroll'))
  }, pan)
  await page.waitForTimeout(100)

  const { appTop, frameTop } = await page.evaluate(() => ({
    appTop: getComputedStyle(document.documentElement).getPropertyValue('--app-top').trim(),
    frameTop: document.getElementById('frame')!.getBoundingClientRect().top,
  }))
  expect(appTop).toBe('120px')
  // #frame's CSS top is var(--app-top), i.e. the pan amount — so relative
  // to the layout viewport it renders at exactly the pan offset, which
  // cancels the visual viewport's own pan and keeps it visible at 0 from
  // the user's actual point of view.
  expect(frameTop).toBe(pan)
})

// Regression test for the horizontal counterpart of the bug above: a
// device screenshot showed the write-5x input's left edge flush but its
// right edge (and the coin pouch, meant to hug the right side) cut off
// past the visible window — the same visual-viewport-pan mechanism,
// horizontally (visualViewport.offsetLeft), or a width mismatch
// (visualViewport.width narrower than the layout viewport #frame's old
// right:0 assumed). #frame now tracks both via --app-left and --app-width
// instead of left:0/right:0.
test('#frame stays within the visible window when the visual viewport narrows or shifts horizontally', async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  const left = 30
  const width = full.width - 80
  await page.evaluate(
    ({ offsetLeft, w }) => {
      Object.defineProperty(window.visualViewport, 'offsetLeft', {
        configurable: true,
        get: () => offsetLeft,
      })
      Object.defineProperty(window.visualViewport, 'width', {
        configurable: true,
        get: () => w,
      })
      window.visualViewport!.dispatchEvent(new Event('resize'))
    },
    { offsetLeft: left, w: width },
  )
  await page.waitForTimeout(100)

  const { appLeft, appWidth, frameLeft, frameWidth } = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    const rect = document.getElementById('frame')!.getBoundingClientRect()
    return {
      appLeft: cs.getPropertyValue('--app-left').trim(),
      appWidth: cs.getPropertyValue('--app-width').trim(),
      frameLeft: rect.left,
      frameWidth: rect.width,
    }
  })
  expect(appLeft).toBe('30px')
  expect(appWidth).toBe(`${width}px`)
  expect(frameLeft).toBe(left)
  expect(frameWidth).toBe(width)
  // #frame's right edge must land inside the actual visible width, not
  // spill past it as it did with the old left:0/right:0.
  expect(frameLeft + frameWidth).toBeLessThanOrEqual(full.width)
})

test('focusing the quiz input snaps #screen back to the top', async ({ page }) => {
  await startQuiz(page)

  await page.evaluate(() => {
    // The quiz input auto-focuses on mount; blur it first so the focus()
    // below is a real focus transition and actually fires a focus event
    // (a no-op re-focus on an already-focused element does not).
    document.activeElement?.blur()
    document.documentElement.style.setProperty('--app-height', '420px')
    const screen = document.getElementById('screen')!
    screen.style.paddingBottom = '400px' // force genuine overflow to scroll into
    screen.scrollTop = 300
  })

  await page.focus('#quiz-input')
  await page.waitForTimeout(800) // outlasts pinScrollFor's 700ms correction window

  const scrollTop = await page.evaluate(() => document.getElementById('screen')!.scrollTop)
  expect(scrollTop).toBe(0)
})

test('focusing the quiz input snaps #screen back to the top during write-5x too', async ({
  page,
}) => {
  await startQuiz(page)
  await enterWrite5Mode(page)

  await page.evaluate(() => {
    document.activeElement?.blur()
    document.documentElement.style.setProperty('--app-height', '420px')
    const screen = document.getElementById('screen')!
    screen.style.paddingBottom = '400px'
    screen.scrollTop = 300
  })

  await page.focus('#quiz-input')
  await page.waitForTimeout(800)

  const scrollTop = await page.evaluate(() => document.getElementById('screen')!.scrollTop)
  expect(scrollTop).toBe(0)
})

test('the coin pouch stays within the shrunk frame when the keyboard opens during write-5x', async ({
  page,
}) => {
  await startQuiz(page)
  await enterWrite5Mode(page)

  await page.evaluate(() => {
    document.documentElement.style.setProperty('--app-height', '420px')
  })
  await page.focus('#quiz-input')
  await page.waitForTimeout(800)

  const pouchBottom = await page.evaluate(
    () => document.getElementById('coin-pouch-icon')!.getBoundingClientRect().bottom,
  )
  expect(pouchBottom).toBeLessThanOrEqual(420)
})

test('the write-5x coin pouch stays pinned to the top when its own list scrolls', async ({
  page,
}) => {
  await startQuiz(page)
  await enterWrite5Mode(page)

  const nav = page.locator('#write5-topnav')
  await expect(nav).toHaveCSS('position', 'sticky')

  const topBefore = await nav.evaluate((el) => el.getBoundingClientRect().top)
  await page.evaluate(() => {
    const screen = document.getElementById('screen')!
    screen.style.paddingBottom = '400px' // force genuine overflow to scroll into
    screen.scrollBy(0, 40)
  })
  const topAfter = await nav.evaluate((el) => el.getBoundingClientRect().top)
  expect(topAfter).toBe(topBefore)
})

test('the normal quiz top nav (progress dots, counters, exit button) stays pinned to the top', async ({
  page,
}) => {
  await startQuiz(page)

  const nav = page.locator('#quiz-topnav')
  await expect(nav).toHaveCSS('position', 'sticky')

  const topBefore = await nav.evaluate((el) => el.getBoundingClientRect().top)
  await page.evaluate(() => {
    const screen = document.getElementById('screen')!
    screen.style.paddingBottom = '400px'
    screen.scrollBy(0, 40)
  })
  const topAfter = await nav.evaluate((el) => el.getBoundingClientRect().top)
  expect(topAfter).toBe(topBefore)
})

// Regression test for "--app-height doesn't adjust to the remaining space,
// so the word card and input disappear behind the keyboard": unlike the
// tests above, this doesn't stub --app-height directly — it resizes the
// real viewport, which fires the actual resize/visualViewport events
// initViewportHeight() listens for, exercising the real syncAppHeight()
// code path instead of bypassing it.
test('a real viewport resize (simulating the keyboard opening) shrinks the frame so the word card and input stay visible', async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  // A phone-sized keyboard typically leaves 40-55% of the screen visible.
  const shrunk = Math.round(full.height * 0.5)
  await page.setViewportSize({ width: full.width, height: shrunk })
  await page.waitForTimeout(300)

  const appHeight = await page.evaluate(() =>
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-height')),
  )
  expect(appHeight).toBeLessThanOrEqual(shrunk)
  expect(appHeight).toBeGreaterThan(shrunk - 10)

  const { frameHeight, cardBottom, inputBottom } = await page.evaluate(() => ({
    frameHeight: document.getElementById('frame')!.getBoundingClientRect().height,
    cardBottom: document.querySelector('.card-lg')!.getBoundingClientRect().bottom,
    inputBottom: document.getElementById('quiz-input')!.getBoundingClientRect().bottom,
  }))
  expect(frameHeight).toBeLessThanOrEqual(shrunk)
  expect(cardBottom).toBeLessThanOrEqual(shrunk)
  expect(inputBottom).toBeLessThanOrEqual(shrunk)

  await page.focus('#quiz-input')
  await page.waitForTimeout(800)
  const inputBottomAfterFocus = await page.evaluate(
    () => document.getElementById('quiz-input')!.getBoundingClientRect().bottom,
  )
  expect(inputBottomAfterFocus).toBeLessThanOrEqual(shrunk)
  expect(inputBottomAfterFocus).toBeGreaterThan(0)
})

// Regression test for the mismatch the test above can't reach: a real
// mobile keyboard shrinks the *visual* viewport (what --app-height tracks)
// without shrinking the *layout* viewport (what the vh unit is defined
// against) — so page.setViewportSize(), which resizes the real window and
// therefore both, can't reproduce it. Stubbing --app-height directly while
// leaving the actual viewport alone reproduces the real mismatch: if the
// card's own padding/font-size were still sized in vh, they'd stay
// full-size and push content below the shrunk frame, forcing a scroll to
// reach it. Sized in cqh (off #screen's real, --app-height-driven height)
// instead, they shrink with the frame.
test('the word card shrinks its own padding when --app-height shrinks, even though the layout viewport (vh) does not', async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  const paddingBefore = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector('.card-lg')!).paddingTop),
  )

  const shrunk = Math.round(full.height * 0.45)
  await page.evaluate((h) => {
    document.documentElement.style.setProperty('--app-height', `${h}px`)
  }, shrunk)
  await page.waitForTimeout(100)

  const { paddingAfter, cardBottom, frameHeight } = await page.evaluate(() => ({
    paddingAfter: parseFloat(getComputedStyle(document.querySelector('.card-lg')!).paddingTop),
    cardBottom: document.querySelector('.card-lg')!.getBoundingClientRect().bottom,
    frameHeight: document.getElementById('frame')!.getBoundingClientRect().height,
  }))

  expect(frameHeight).toBeLessThanOrEqual(shrunk)
  expect(paddingAfter).toBeLessThan(paddingBefore)
  expect(cardBottom).toBeLessThanOrEqual(shrunk)
})
