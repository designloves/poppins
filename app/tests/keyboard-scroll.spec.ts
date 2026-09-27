import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

// The app relies entirely on the standard viewport mechanism for the
// on-screen keyboard now: index.html's meta viewport declares
// interactive-widget=resizes-content, which makes engines that honor it
// (Safari 17.4+, Chrome for Android 108+) shrink the viewport 100dvh is
// defined against when the keyboard opens — so #frame (height: 100dvh)
// and #screen (a cqh size container the word card sizes its own
// padding/font off) shrink correctly with no JS involved, and the
// browser's own native "scroll focused input into view" has nothing to
// fight since the document is never taller than what's actually visible.
//
// A real on-screen keyboard can't be triggered in a headless browser, so
// these use a real page.setViewportSize() resize (which does trigger a
// real dvh/cqh recomputation, unlike stubbing a custom property) as a
// stand-in for "the visible height shrank."

test('the frame and its content fit within a real, shrunk viewport', async ({ page }) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  // A phone-sized keyboard typically leaves 40-55% of the screen visible.
  const shrunk = Math.round(full.height * 0.5)
  await page.setViewportSize({ width: full.width, height: shrunk })
  await page.waitForTimeout(100)

  const { frameHeight, cardBottom, inputBottom } = await page.evaluate(() => ({
    frameHeight: document.getElementById('frame')!.getBoundingClientRect().height,
    cardBottom: document.querySelector('.card-lg')!.getBoundingClientRect().bottom,
    inputBottom: document.getElementById('quiz-input')!.getBoundingClientRect().bottom,
  }))
  expect(frameHeight).toBeLessThanOrEqual(shrunk)
  expect(cardBottom).toBeLessThanOrEqual(shrunk)
  expect(inputBottom).toBeLessThanOrEqual(shrunk)

  await page.focus('#quiz-input')
  await page.waitForTimeout(100)
  const inputBottomAfterFocus = await page.evaluate(
    () => document.getElementById('quiz-input')!.getBoundingClientRect().bottom,
  )
  expect(inputBottomAfterFocus).toBeLessThanOrEqual(shrunk)
  expect(inputBottomAfterFocus).toBeGreaterThan(0)
})

test("the word card's padding shrinks along with the viewport, not just the frame around it", async ({
  page,
}) => {
  await startQuiz(page)
  const full = page.viewportSize()!

  const paddingBefore = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector('.card-lg')!).paddingTop),
  )

  const shrunk = Math.round(full.height * 0.45)
  await page.setViewportSize({ width: full.width, height: shrunk })
  await page.waitForTimeout(100)

  const { paddingAfter, cardBottom } = await page.evaluate(() => ({
    paddingAfter: parseFloat(getComputedStyle(document.querySelector('.card-lg')!).paddingTop),
    cardBottom: document.querySelector('.card-lg')!.getBoundingClientRect().bottom,
  }))

  // Sized in cqh (off #screen's real height) rather than vh (off the
  // viewport as a whole), so it tracks #screen's own shrink specifically.
  expect(paddingAfter).toBeLessThan(paddingBefore)
  expect(cardBottom).toBeLessThanOrEqual(shrunk)
})
