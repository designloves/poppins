import { test, expect } from '@playwright/test'

function fakeJwt(payload: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.fakesig`
}

async function openLogin(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('#settings-login')
}

test('an invalid email is rejected without a network call', async ({ page }) => {
  await openLogin(page)
  await page.fill('#login-email', 'not-an-email')
  await page.click('#login-submit')
  await expect(page.getByText('Enter a valid email')).toBeVisible()
})

test('sending a magic link shows the check-inbox confirmation with the email', async ({ page }) => {
  await page.route('**/auth/v1/otp', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  )
  await openLogin(page)
  await page.fill('#login-email', 'emil@example.com')
  await page.click('#login-submit')

  await expect(page.getByText('Kolla din inkorg')).toBeVisible()
  await expect(page.getByText('emil@example.com')).toBeVisible()

  await page.click('#login-skip')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('a failed send shows the server error and stays on the form', async ({ page }) => {
  await page.route('**/auth/v1/otp', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ msg: 'Rate limit exceeded' }),
    }),
  )
  await openLogin(page)
  await page.fill('#login-email', 'emil@example.com')
  await page.click('#login-submit')

  await expect(page.getByText('Rate limit exceeded')).toBeVisible()
  await expect(page.locator('#login-email')).toBeVisible()
})

test('skip without sending returns home without signing in', async ({ page }) => {
  await openLogin(page)
  await page.click('#login-skip')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('a magic-link redirect signs the user in, and the session survives a reload', async ({
  page,
}) => {
  const token = fakeJwt({
    sub: 'user-123',
    email: 'signedin@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })

  await page.goto(`/#access_token=${token}&refresh_token=refresh-abc`)
  await page.click('button[title="Inställningar"]')
  await expect(page.getByText('signedin@example.com')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logga ut' })).toBeVisible()

  await page.reload()
  await page.click('button[title="Inställningar"]')
  await expect(page.getByText('signedin@example.com')).toBeVisible()

  await page.click('#settings-logout')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
  await page.click('button[title="Inställningar"]')
  await expect(page.getByText('Inte inloggad')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logga in' })).toBeVisible()
})
