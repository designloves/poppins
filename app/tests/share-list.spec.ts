import { test, expect } from '@playwright/test'

test('sharing a list copies a link to the clipboard when the Web Share API is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, 'share', { value: undefined, configurable: true })
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

  await page.route('**/functions/v1/greta/sets', (route) => {
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
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await page.locator('.card', { hasText: 'Djur' }).locator('button[title="Dela"]').click()

  await expect(page.getByText('Länk kopierad!', { exact: false })).toBeVisible()
  const clipboardText = await page.evaluate(
    () => (window as unknown as { __clipboardText: string | null }).__clipboardText,
  )
  expect(clipboardText).toBe('https://designloves.github.io/poppins/?set=shared-abc')
})

test('sharing a list uses the native share sheet when available', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __shareCalls: unknown[] }).__shareCalls = []
    Object.defineProperty(window.navigator, 'share', {
      value: (data: unknown) => {
        ;(window as unknown as { __shareCalls: unknown[] }).__shareCalls.push(data)
        return Promise.resolve()
      },
      configurable: true,
    })
  })

  await page.route('**/functions/v1/greta/sets', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'shared-xyz' }),
    }),
  )

  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await page.locator('.card', { hasText: 'Djur' }).locator('button[title="Dela"]').click()

  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __shareCalls: unknown[] }).__shareCalls.length),
    )
    .toBeGreaterThan(0)
  const calls = await page.evaluate(
    () => (window as unknown as { __shareCalls: { url: string }[] }).__shareCalls,
  )
  expect(calls[0].url).toBe('https://designloves.github.io/poppins/?set=shared-xyz')
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
    Object.defineProperty(window.navigator, 'share', { value: undefined, configurable: true })
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
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await page.locator('.card', { hasText: 'Djur' }).locator('button[title="Dela"]').click()

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
