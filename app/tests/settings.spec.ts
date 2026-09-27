import { test, expect } from '@playwright/test'

test('settings shows the not-signed-in profile card and a working back button', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await expect(page.getByText('Hej där!')).toBeVisible()
  await expect(page.getByText('Inte inloggad')).toBeVisible()

  await page.click('#settings-close')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('toggling sound and pronunciation switches flips their state', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await expect(page.locator('#setting-sound')).toHaveAttribute('data-on', 'false')
  await page.click('#setting-sound')
  await expect(page.locator('#setting-sound')).toHaveAttribute('data-on', 'true')

  await expect(page.locator('#setting-pronunciation')).toHaveAttribute('data-on', 'false')
  await page.click('#setting-pronunciation')
  await expect(page.locator('#setting-pronunciation')).toHaveAttribute('data-on', 'true')
})

test('switching app language updates the whole UI immediately', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await page.click('button:has-text("English")')
  await expect(page.getByText('Settings')).toBeVisible()
  await expect(page.getByText('App language')).toBeVisible()
  await expect(page.getByText('Sound effects')).toBeVisible()
})

test('picking a different avatar updates it across the app', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await page.click('button[title="fox"]')
  await page.click('#settings-close')

  await expect(page.locator('img[alt="fox"]').first()).toBeVisible()
})

test('the login button navigates to the login screen', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('#settings-login')

  await expect(page.getByText('Hej!')).toBeVisible()
  await expect(page.locator('#login-email')).toBeVisible()
})
