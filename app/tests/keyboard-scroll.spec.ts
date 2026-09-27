import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

// Regression tests for the "quiz card (and coin pouch) scrolled
// off-screen when the keyboard opens" bug: #screen (not the outer page)
// is the nearest scrollable ancestor of the quiz input, so the browser's
// native "scroll focused input into view" can grab #screen directly and
// shove the header/pouch up out of view. resetOuterScroll() must undo
// that for the single-input quiz screen, but must NOT fight the
// write-5x screen's stacked inputs, which can legitimately need that
// scroll to reach later fields (w5-0..w5-4).
//
// A real virtual keyboard can't be triggered in a headless browser, so
// these simulate the same conditions resetOuterScroll() reacts to: a
// keyboard-shrunk --app-height with #screen already scrolled away from
// the top, then a focus event on the relevant input.

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
  await page.waitForTimeout(400) // covers resetOuterScroll's 50ms + 300ms retries

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
  await page.waitForTimeout(400)

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
  await page.waitForTimeout(400)

  const pouchBottom = await page.evaluate(
    () => document.getElementById('coin-pouch-icon')!.getBoundingClientRect().bottom,
  )
  expect(pouchBottom).toBeLessThanOrEqual(420)
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
  await page.waitForTimeout(400)
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
