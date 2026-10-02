import { test, expect, type Page } from '@playwright/test'

// Mocks the Claude-powered edge function's /translate and /forms routes —
// same pattern as login.spec.ts mocking Supabase auth — so these tests
// don't depend on a real ANTHROPIC_API_KEY or network access.
async function mockTranslateAndForms(page: Page) {
  await page.route('**/functions/v1/greta/translate', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ from: 'sv', to: 'en', translations: ['big'] }),
    }),
  )
  await page.route('**/functions/v1/greta/forms', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        forms: [
          {
            isAdjective: true,
            from: { comparative: 'större', superlative: 'störst' },
            to: { comparative: 'bigger', superlative: 'biggest' },
          },
        ],
      }),
    }),
  )
}

// Pastes a single adjective ("stor"), toggles "add conjugations" on before
// parsing (which triggers the single-word translate path, since there's
// no "=" separator) — leaves the review step open with the parsed word
// (and its fetched forms) on screen, unsaved.
async function parseAdjectiveWithForms(page: Page) {
  await mockTranslateAndForms(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Ny' }).click()
  await page.fill('#paste-name', 'Adjektiv')
  await page.fill('#paste-text', 'stor')
  await page.click('#paste-include-forms')
  await page.click('#paste-parse')
  await expect(page.getByTestId('paste-word-forms')).toBeVisible()
}

async function createAdjectiveListWithForms(page: Page) {
  await parseAdjectiveWithForms(page)
  await page.click('#paste-save')
  await expect(page.getByText('Adjektiv')).toBeVisible()
}

test('toggling "add conjugations" fetches and shows comparative/superlative forms before saving', async ({
  page,
}) => {
  await parseAdjectiveWithForms(page)
  await expect(page.getByText('större → bigger')).toBeVisible()
  await expect(page.getByText('störst → biggest')).toBeVisible()
})

test('practice setup only offers "practice conjugations too" for lists that actually have forms', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await expect(page.locator('#practice-include-forms')).toBeHidden()
})

test('turning on "practice conjugations too" quizzes all three forms of an adjective', async ({
  page,
}) => {
  await createAdjectiveListWithForms(page)
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()

  await expect(page.locator('#practice-include-forms')).toBeVisible()
  await page.click('#practice-include-forms')
  await page.getByRole('button', { name: 'Svara på engelska' }).click()

  await expect(page.getByText('1 / 3')).toBeVisible()

  const answers: Record<string, string> = { stor: 'big', större: 'bigger', störst: 'biggest' }
  for (let i = 0; i < 3; i++) {
    const word = (
      await page
        .locator('.h-font')
        .filter({ hasText: /^[a-zåäö]+$/i })
        .first()
        .textContent()
    )?.trim()
    const answer = word ? answers[word] : undefined
    expect(answer).toBeTruthy()
    await page.fill('#quiz-input', answer!)
    await page.press('#quiz-input', 'Enter')
    if (i < 2) await expect(page.getByText(`${i + 2} / 3`)).toBeVisible({ timeout: 3000 })
  }
  await expect(page.getByText('Du klarade det!')).toBeVisible({ timeout: 3000 })
})
