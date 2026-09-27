import { test, expect } from '@playwright/test'

async function openPracticeSetup(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
}

test('shows both answer-direction options for the active list', async ({ page }) => {
  await openPracticeSetup(page)
  await expect(page.getByText('Startar "Djur (Animals)"')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Svara på engelska' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Svara på svenska' })).toBeVisible()
})

test('choosing an answer direction navigates to the quiz', async ({ page }) => {
  await openPracticeSetup(page)
  await page.getByRole('button', { name: 'Svara på svenska' }).click()
  await expect(page.getByText('1 / 10')).toBeVisible()
  await expect(page.locator('#quiz-input')).toBeVisible()
})

test('back returns to home without starting a quiz', async ({ page }) => {
  await openPracticeSetup(page)
  await page.getByRole('button', { name: 'Tillbaka' }).click()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

// Regression test: the back button used to sit inside the same
// vertically-centered column as the rest of the screen's content, so on
// a tall viewport it landed far down the page instead of near the top
// like every other screen's back button (Lists, Settings, Paste all pin
// theirs to a top header row and only center the content below it).
test("the back button sits near the top of the screen, like other screens' back buttons", async ({
  page,
}) => {
  await openPracticeSetup(page)
  const backButtonTop = await page
    .getByRole('button', { name: 'Tillbaka' })
    .evaluate((el) => el.getBoundingClientRect().top)
  expect(backButtonTop).toBeLessThan(60)
})
