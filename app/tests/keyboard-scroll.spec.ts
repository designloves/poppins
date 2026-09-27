import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

// Regression tests for "a plain, keyboard-closed page load can force a
// small spurious scroll": visualViewport.height can read a hair larger
// than the truly-settled visible area right as Safari's chrome finishes
// settling. syncAppHeight() now only overrides the CSS default (100svh,
// the guaranteed-smallest/never-overflows size) when window.innerHeight
// and visualViewport.height diverge by more than a keyboard-sized amount
// — otherwise it leaves --app-height alone.

test('a normal, keyboard-closed page leaves --app-height at its safe CSS default', async ({
  page,
}) => {
  await page.goto('/')
  const appHeightRaw = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim(),
  )
  // The CSS default is "100svh" (unresolved, since it's never been
  // overridden with a literal px value) — a JS override would read like
  // "812.5px" instead.
  expect(appHeightRaw).not.toContain('px')
})

test('a visualViewport shrink without a matching window.innerHeight shrink (a real keyboard) does override --app-height', async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  // Simulates the real device signature of an on-screen keyboard: the
  // visual viewport shrinks while the layout viewport (innerHeight)
  // doesn't — something a plain page.setViewportSize() resize can't
  // reproduce, since that shrinks both together.
  await page.evaluate(
    (shrunkHeight) => {
      Object.defineProperty(window.visualViewport, 'height', {
        configurable: true,
        get: () => shrunkHeight,
      })
      window.visualViewport!.dispatchEvent(new Event('resize'))
    },
    Math.round(full.height * 0.5),
  )
  await page.waitForTimeout(100)

  const appHeightRaw = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim(),
  )
  expect(appHeightRaw).toContain('px')
})

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
// every animation frame for 700ms after focus, via pinScrollFor) must
// undo that for the single-input quiz screen, but must NOT fight the
// write-5x screen's stacked inputs, which can legitimately need that
// scroll to reach later fields (w5-0..w5-4).
//
// A real virtual keyboard can't be triggered in a headless browser, so
// these simulate the same conditions the code reacts to: a
// keyboard-shrunk --app-height (or a real viewport resize) with #screen
// already scrolled away from the top, then a focus event.

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

test('focusing a write-5x input does not force #screen back to the top', async ({ page }) => {
  await startQuiz(page)

  // Force a wrong answer to enter write-5x mode.
  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await page.waitForSelector('#w5-0', { timeout: 3000 })

  await page.evaluate(() => {
    document.documentElement.style.setProperty('--app-height', '420px')
    const screen = document.getElementById('screen')!
    screen.style.paddingBottom = '400px'
    screen.scrollTop = 120 // simulate having scrolled down to reach a later field
  })

  await page.focus('#w5-3')
  await page.waitForTimeout(800)

  // The exact value is up to the browser's own native "scroll focused
  // element into view" (it can shift a few px with layout changes) — what
  // matters is that resetOuterScroll() didn't force it back to 0.
  const scrollTop = await page.evaluate(() => document.getElementById('screen')!.scrollTop)
  expect(scrollTop).toBeGreaterThan(50)
})

test('the coin pouch stays within the shrunk frame when the keyboard opens during write-5x', async ({
  page,
}) => {
  await startQuiz(page)
  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await page.waitForSelector('#w5-0', { timeout: 3000 })

  await page.evaluate(() => {
    document.documentElement.style.setProperty('--app-height', '420px')
  })
  await page.focus('#w5-0')
  await page.waitForTimeout(800)

  const pouchBottom = await page.evaluate(
    () => document.getElementById('coin-pouch-icon')!.getBoundingClientRect().bottom,
  )
  expect(pouchBottom).toBeLessThanOrEqual(420)
})

// Regression test for "the frame doesn't adjust to the remaining space,
// so the word card and input disappear behind the keyboard": unlike the
// tests above, this doesn't stub --app-height directly — it resizes the
// real viewport. A genuine window resize (unlike a real device keyboard)
// shrinks window.innerHeight and visualViewport.height together, so
// syncAppHeight's keyboard heuristic correctly leaves --app-height alone
// here and CSS's own 100svh fallback handles it — this checks the actual
// rendered result rather than that internal implementation detail.
test('a real viewport resize (simulating the keyboard opening) shrinks the frame so the word card and input stay visible', async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  // A phone-sized keyboard typically leaves 40-55% of the screen visible.
  const shrunk = Math.round(full.height * 0.5)
  await page.setViewportSize({ width: full.width, height: shrunk })
  await page.waitForTimeout(300)

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
