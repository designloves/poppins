import { test, expect } from '@playwright/test'

test("renders the today's list card and coin pouch", async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Poppins')).toBeVisible()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
  await expect(page.getByRole('button', { name: /Starta övning|Start practice/ })).toBeVisible()
  await expect(page.getByTestId('coin-count')).toHaveText('0')
})

test('clicking the mascot shows and then hides the greeting bubble', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Say hi|Säg hej/ }).click()
  await expect(page.locator('.speech-bubble')).toBeVisible()
  await expect(page.locator('.speech-bubble')).toBeHidden({ timeout: 3000 })
})

test('start practice navigates away from the home screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await expect(page.getByText('Vilket språk vill du svara på?')).toBeVisible()
  await page.getByRole('button', { name: /Tillbaka|Back/ }).click()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test("the today's-list card has no redundant label above the list name", async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Dagens lista')).toHaveCount(0)
})

test('the top nav stays pinned to the top when the page scrolls', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('#home-topnav')
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
