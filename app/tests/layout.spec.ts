import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

test('the app frame fills the full viewport width', async ({ page }) => {
  await page.goto('/')
  const viewport = page.viewportSize()!
  const frameWidth = await page.evaluate(
    () => document.getElementById('frame')!.getBoundingClientRect().width,
  )
  expect(frameWidth).toBeGreaterThanOrEqual(viewport.width - 2)
})

test('the exit-confirm dialog fills the screen (with its intended 16px margin), not a narrow strip', async ({
  page,
}) => {
  await startQuiz(page)
  await page.click('#quiz-exit')
  await page.waitForSelector('#exit-confirm-yes')

  const { frameWidth, cardWidth } = await page.evaluate(() => {
    const frame = document.getElementById('frame')!.getBoundingClientRect()
    const card = document
      .getElementById('exit-confirm-yes')!
      .closest('.card-lg')!
      .getBoundingClientRect()
    return { frameWidth: frame.width, cardWidth: card.width }
  })

  // The dialog card is meant to sit 16px in from each side of the frame.
  expect(cardWidth).toBeGreaterThan(frameWidth * 0.7)
  expect(cardWidth).toBeCloseTo(frameWidth - 32, -1)
})

test('no page-level scroll appears on a normal (keyboard-closed) viewport', async ({ page }) => {
  await startQuiz(page)

  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))
  expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 2)
})

// Regression test: #frame is position:fixed, which takes it out of the
// normal document flow — an ancestor's overflow:hidden (html/body's) does
// NOT clip a fixed-position element, only its own overflow does. Without
// #frame having its own overflow:hidden, any sub-pixel rounding overflow
// (routine on mobile browsers) is exposed as real, touch-scrollable
// horizontal overflow instead of being silently clipped.
test('no horizontal scroll appears on any screen at a real phone width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })

  async function assertNoHorizontalOverflow() {
    const { docWidth, winWidth } = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      winWidth: document.documentElement.clientWidth,
    }))
    expect(docWidth).toBeLessThanOrEqual(winWidth)
  }

  await page.goto('/')
  await assertNoHorizontalOverflow()

  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await assertNoHorizontalOverflow()

  await page.getByRole('button', { name: 'Svara på engelska' }).click()
  await assertNoHorizontalOverflow()

  await page.click('#quiz-exit')
  await assertNoHorizontalOverflow()
  await page.click('#exit-confirm-no')

  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await page.waitForSelector('#w5-0', { timeout: 3000 })
  await assertNoHorizontalOverflow()
})
