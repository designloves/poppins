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
  await expect(page.getByText('Practice setup')).toBeVisible()
  await page.getByRole('button', { name: /Back/ }).click()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})
