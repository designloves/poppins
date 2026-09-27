import { test, expect, type Page } from '@playwright/test'

// Simulates a left-edge swipe-right gesture (the iOS system "swipe back"
// motion) by dispatching real Touch/TouchEvent objects at #screen, since
// useSwipeBack listens for touchstart/touchend there directly rather than
// via a framework that Playwright's synthetic mouse events would satisfy.
async function swipeBackFromEdge(page: Page) {
  await page.evaluate(() => {
    const screen = document.getElementById('screen')!
    const touch = (x: number, y: number) =>
      new Touch({ identifier: 0, target: screen, clientX: x, clientY: y })
    screen.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(10, 400)], bubbles: true }))
    screen.dispatchEvent(
      new TouchEvent('touchend', { changedTouches: [touch(120, 405)], bubbles: true }),
    )
  })
}

test('swiping back from the left edge on PracticeSetup returns home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await expect(page.getByText('Startar "Djur (Animals)"')).toBeVisible()

  await swipeBackFromEdge(page)
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('swiping back from the left edge during a quiz opens the exit-confirm dialog', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
  await expect(page.locator('#quiz-input')).toBeVisible()

  await swipeBackFromEdge(page)
  await expect(page.locator('#exit-confirm-yes')).toBeVisible()
})

test('a swipe that starts away from the left edge does not trigger back navigation', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await expect(page.getByText('Startar "Djur (Animals)"')).toBeVisible()

  await page.evaluate(() => {
    const screen = document.getElementById('screen')!
    const touch = (x: number, y: number) =>
      new Touch({ identifier: 0, target: screen, clientX: x, clientY: y })
    // Starts well past the edge zone, so it shouldn't count as a back swipe.
    screen.dispatchEvent(
      new TouchEvent('touchstart', { touches: [touch(200, 400)], bubbles: true }),
    )
    screen.dispatchEvent(
      new TouchEvent('touchend', { changedTouches: [touch(310, 405)], bubbles: true }),
    )
  })
  await expect(page.getByText('Startar "Djur (Animals)"')).toBeVisible()
})
