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

function signedInUrl(path: string): string {
  const token = fakeJwt({
    sub: 'user-123',
    email: 'signedin@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
  return `${path}#access_token=${token}&refresh_token=refresh-abc`
}

function stubClipboard(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    ;(window as unknown as { __clipboardText: string | null }).__clipboardText = null
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          ;(window as unknown as { __clipboardText: string | null }).__clipboardText = text
          return Promise.resolve()
        },
      },
      configurable: true,
    })
  })
}

test('sharing a list copies a link to the clipboard, every time — not just the first', async ({
  page,
}) => {
  await stubClipboard(page)

  let uploads = 0
  await page.route('**/functions/v1/greta/sets', (route) => {
    uploads++
    const body = JSON.parse(route.request().postData() ?? '{}')
    expect(body.topic).toBe('Djur (Animals)')
    expect(route.request().headers()['authorization']).toBeUndefined()
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'shared-abc' }),
    })
  })

  await page.goto('/')
  await page.click('button[title="Dela"]')

  await expect(page.getByText('Länk kopierad!', { exact: false })).toBeVisible()
  let clipboardText = await page.evaluate(
    () => (window as unknown as { __clipboardText: string | null }).__clipboardText,
  )
  expect(clipboardText).toBe('https://designloves.github.io/poppins/?set=shared-abc')
  expect(uploads).toBe(1)

  // Sharing the same list again: the link is re-copied and the dialog
  // shown again, but nothing is re-uploaded (it already has a remoteId).
  await page.click('#app-dialog-confirm')
  await page.evaluate(() => {
    ;(window as unknown as { __clipboardText: string | null }).__clipboardText = null
  })
  await page.click('button[title="Dela"]')
  await expect(page.getByText('Länk kopierad!', { exact: false })).toBeVisible()
  clipboardText = await page.evaluate(
    () => (window as unknown as { __clipboardText: string | null }).__clipboardText,
  )
  expect(clipboardText).toBe('https://designloves.github.io/poppins/?set=shared-abc')
  expect(uploads).toBe(1)
})

test('sharing a list already transferred to an account reuses its remoteId instead of re-uploading', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'poppins_settings_v1',
      JSON.stringify({
        lists: [
          {
            id: 'djur',
            from: 'sv',
            to: 'en',
            name: 'Djur (Animals)',
            color: 'rose',
            words: [{ sv: 'katt', en: 'cat' }],
            remoteId: 'already-shared',
          },
        ],
        activeListId: 'djur',
      }),
    )
  })
  await stubClipboard(page)

  let postCalled = false
  await page.route('**/functions/v1/greta/sets', (route) => {
    postCalled = true
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'new-id' }),
    })
  })

  await page.goto('/')
  await page.click('button[title="Dela"]')

  const clipboardText = await page.evaluate(
    () => (window as unknown as { __clipboardText: string | null }).__clipboardText,
  )
  expect(clipboardText).toBe('https://designloves.github.io/poppins/?set=already-shared')
  expect(postCalled).toBe(false)
})

test('opening a share link prompts to add the shared list, and adds it on confirm', async ({
  page,
}) => {
  await page.route('**/functions/v1/greta/sets/shared-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'shared-1',
        topic: 'Frukt (Fruit)',
        vocab: [
          { sv: 'äpple', en: 'apple' },
          { sv: 'banan', en: 'banana' },
        ],
        lang_from: 'sv',
        lang_to: 'en',
      }),
    }),
  )

  await page.goto('/?set=shared-1')
  await expect(page.getByText('Lägg till "Frukt (Fruit)" (2 ord) i dina listor?')).toBeVisible()
  // The ?set= param is stripped as soon as the app reads it, regardless
  // of how the prompt is answered.
  expect(page.url()).not.toContain('set=')

  await page.click('#app-dialog-confirm')

  await expect(page.getByText('Frukt (Fruit)')).toBeVisible()
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('5 listor')).toBeVisible()
})

test('importing a shared list while signed in also saves a copy to the account', async ({
  page,
}) => {
  await page.route('**/functions/v1/greta/sets/shared-3', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'shared-3',
        topic: 'Kroppen (Body)',
        vocab: [{ sv: 'hand', en: 'hand' }],
        lang_from: 'sv',
        lang_to: 'en',
      }),
    }),
  )
  await page.route('**/functions/v1/greta/sets', (route) => {
    expect(route.request().headers()['authorization']).toMatch(/^Bearer /)
    const body = JSON.parse(route.request().postData() ?? '{}')
    expect(body.topic).toBe('Kroppen (Body)')
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'owned-copy-id' }),
    })
  })

  await page.goto(signedInUrl('/?set=shared-3'))
  await expect(page.getByText('Lägg till "Kroppen (Body)"', { exact: false })).toBeVisible()
  await page.click('#app-dialog-confirm')

  await expect(page.getByText('Kroppen (Body)')).toBeVisible()
})

test("if saving an imported list to the account fails, it's still added locally", async ({
  page,
}) => {
  await page.route('**/functions/v1/greta/sets/shared-4', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'shared-4',
        topic: 'Väder (Weather)',
        vocab: [{ sv: 'regn', en: 'rain' }],
        lang_from: 'sv',
        lang_to: 'en',
      }),
    }),
  )
  await page.route('**/functions/v1/greta/sets', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' }),
    }),
  )

  await page.goto(signedInUrl('/?set=shared-4'))
  await expect(page.getByText('Lägg till "Väder (Weather)"', { exact: false })).toBeVisible()
  await page.click('#app-dialog-confirm')

  await expect(
    page.getByText('kunde inte även spara den på kontot', { exact: false }),
  ).toBeVisible()
  await page.click('#app-dialog-confirm')

  await expect(page.getByText('Väder (Weather)')).toBeVisible()
})

test('canceling the import prompt leaves lists unchanged', async ({ page }) => {
  await page.route('**/functions/v1/greta/sets/shared-2', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'shared-2',
        topic: 'Test',
        vocab: [{ sv: 'ett', en: 'one' }],
        lang_from: 'sv',
        lang_to: 'en',
      }),
    }),
  )

  await page.goto('/?set=shared-2')
  await expect(page.getByText('Lägg till "Test"', { exact: false })).toBeVisible()
  await page.click('#app-dialog-cancel')

  await page.getByRole('button', { name: 'Mina listor' }).click()
  await expect(page.getByText('4 listor')).toBeVisible()
})

test('a missing shared list shows an error instead of crashing', async ({ page }) => {
  await page.route('**/functions/v1/greta/sets/missing', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Set not found' }),
    }),
  )

  await page.goto('/?set=missing')
  await expect(page.getByText('Set not found', { exact: false })).toBeVisible()
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})
