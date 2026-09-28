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

test('the footer shows a real build identifier, not a hardcoded version', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  // A short git commit hash, injected at build time — not "v1" or any
  // other string that never changes between releases.
  await expect(page.getByText(/Poppins [0-9a-f]{7} · gjord med/)).toBeVisible()
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

test("picking a different avatar updates Safari's theme-color to match", async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('button[title="fox"]')

  await expect
    .poll(() => page.locator('meta[name="theme-color"]').getAttribute('content'))
    .toBe('#F0D3B4')
})

test('the login button navigates to the login screen', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('#settings-login')

  await expect(page.getByText('Hej!')).toBeVisible()
  await expect(page.locator('#login-email')).toBeVisible()
})
