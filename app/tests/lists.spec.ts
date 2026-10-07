import { test, expect } from '@playwright/test'

test('lists screen shows every sample list and navigates back home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()

  await expect(page.getByText('4 listor')).toBeVisible()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
  await expect(page.getByText('Mat (Food)')).toBeVisible()
  await expect(page.getByText('Skolan (School)')).toBeVisible()
  await expect(page.getByText('Känslor (Feelings)')).toBeVisible()

  await page.getByRole('button', { name: 'Tillbaka' }).click()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('selecting a list makes it active and returns home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await page.getByText('Mat (Food)').click()

  await expect(page.getByText('Mat (Food)')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Starta övning' })).toBeVisible()
})

test("deleting a list asks for confirmation (in the app's own themed dialog, not a native one) and removes it on accept", async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()

  await page.locator('.card', { hasText: 'Skolan' }).locator('button').click()
  await expect(page.getByText('Ta bort listan permanent?')).toBeVisible()
  await page.click('#app-dialog-cancel')
  await expect(page.getByText('Skolan (School)')).toBeVisible()

  await page.locator('.card', { hasText: 'Skolan' }).locator('button').click()
  await page.click('#app-dialog-confirm')
  await expect(page.getByText('Skolan (School)')).toBeHidden()
  await expect(page.getByText('3 listor')).toBeVisible()
})

test('lists and the active list survive a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()

  await page.locator('.card', { hasText: 'Skolan' }).locator('button').click()
  await page.click('#app-dialog-confirm')
  await expect(page.getByText('3 listor')).toBeVisible()
  await page.getByText('Mat (Food)').click()

  await page.reload()

  await expect(page.getByText('Mat (Food)')).toBeVisible()
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('3 listor')).toBeVisible()
  await expect(page.getByText('Skolan (School)')).toBeHidden()
})
