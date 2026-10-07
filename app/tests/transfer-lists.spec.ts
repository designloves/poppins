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

async function signInAndOpenSettings(page: import('@playwright/test').Page) {
  const token = fakeJwt({
    sub: 'user-123',
    email: 'signedin@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
  await page.goto(`/#access_token=${token}&refresh_token=refresh-abc`)
  await page.click('button[title="Inställningar"]')
}

test('the transfer button is hidden while signed out', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await expect(page.locator('#settings-transfer-lists')).toBeHidden()
})

test('the transfer button appears once signed in, while lists are untransferred', async ({
  page,
}) => {
  // A hash-only change is a same-document navigation — it wouldn't
  // re-run the app's mount effect that reads the magic-link token, so
  // this goes straight to the signed-in URL rather than visiting '/'
  // first (see login.spec.ts's equivalent test for the same pattern).
  await signInAndOpenSettings(page)
  await expect(page.locator('#settings-transfer-lists')).toBeVisible()
})

test('transferring lists uploads each one and reports success', async ({ page }) => {
  const requests: unknown[] = []
  let nextId = 1
  await page.route('**/functions/v1/greta/sets', (route) => {
    requests.push(JSON.parse(route.request().postData() ?? '{}'))
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: `srv-${nextId++}` }),
    })
  })

  await signInAndOpenSettings(page)

  await page.click('#settings-transfer-lists')
  await expect(page.getByText('sparade på kontot', { exact: false })).toBeVisible()
  await page.click('#app-dialog-confirm')

  expect(requests).toHaveLength(4)

  // Every list is now transferred, so the button has nothing left to do.
  await expect(page.locator('#settings-transfer-lists')).toBeHidden()
})

test('a failed transfer reports which list failed without blocking the rest', async ({ page }) => {
  await page.route('**/functions/v1/greta/sets', (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    if (body.topic === 'Mat (Food)') {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Max 20 words' }),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'srv-ok' }),
    })
  })

  await signInAndOpenSettings(page)

  await page.click('#settings-transfer-lists')
  const dialogText = await page.locator('.card-lg').last().innerText()
  expect(dialogText).toContain('Mat (Food)')
  expect(dialogText).toContain('Max 20 words')
  await page.click('#app-dialog-confirm')

  // The one that failed is still pending, so the button stays visible to retry.
  await expect(page.locator('#settings-transfer-lists')).toBeVisible()
})
