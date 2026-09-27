import { test, expect } from '@playwright/test'

test('the dressing room shows the starter accessory and previews it on the avatar', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  await expect(page.getByText('Partyhatt')).toBeVisible()
  await expect(page.getByText('Gratis')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ta på' })).toBeVisible()
})

test('wearing an accessory shows it on the avatar everywhere, and persists across a reload', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-toggle-party-hat')

  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()
  // Worn on the dressing room's own live preview.
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.click('#dressing-room-close')
  // ...and on the home header's avatar button too.
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.click('button[title="Inställningar"]')
  // ...and on the settings profile avatar.
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.reload()
  await page.click('button[title="Garderoben"]')
  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()
})

test('taking an accessory back off removes it', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-toggle-party-hat')
  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()

  await page.click('#accessory-toggle-party-hat')
  await expect(page.getByRole('button', { name: 'Ta på' })).toBeVisible()
})

test('back button returns home', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-close')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})
