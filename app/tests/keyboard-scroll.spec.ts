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

  const scrollTop = await page.evaluate(() => document.getElementById('screen')!.scrollTop)
  expect(scrollTop).toBe(120)
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
