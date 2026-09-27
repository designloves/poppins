import { test, expect } from '@playwright/test'

test('creating a new list from pasted word pairs saves and activates it', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ny' }).click()

  await page.fill('#paste-name', 'Frukt (Fruit)')
  await page.fill('#paste-text', 'äpple = apple\nbanan = banana\npäron = pear')
  await page.click('#paste-parse')

  await expect(page.getByText('Hittade 3 ord')).toBeVisible()
  await expect(page.getByText('äpple')).toBeVisible()
  await expect(page.getByText('banana')).toBeVisible()

  await page.click('#paste-save')

  await expect(page.getByText('Frukt (Fruit)')).toBeVisible()
  await expect(page.getByText('3 ord')).toBeVisible()

  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('Frukt (Fruit)')).toBeVisible()
})

test('the review step can be edited before saving, and cancel discards a new list', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ny' }).click()

  await page.fill('#paste-name', 'Test')
  await page.fill('#paste-text', 'ett = one')
  await page.click('#paste-parse')
  await expect(page.getByText('Hittade 1 ord')).toBeVisible()

  await page.click('#paste-back')
  await expect(page.locator('#paste-text')).toHaveValue('ett = one')

  await page.click('#paste-cancel')
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('Test')).toBeHidden()
})

test('editing the active list pre-fills its name and words, and updates it in place', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Redigera lista"]')

  await expect(page.locator('#paste-name')).toHaveValue('Djur (Animals)')
  await expect(page.locator('#paste-text')).toHaveValue(/katt = cat/)

  await page.fill('#paste-name', 'Djur (Animals) v2')
  await page.click('#paste-parse')
  await page.click('#paste-save')

  await expect(page.getByText('Djur (Animals) v2')).toBeVisible()

  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('4 listor')).toBeVisible()
  await expect(page.getByText('Djur (Animals) v2')).toBeVisible()
})
