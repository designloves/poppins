import { test, expect, type Page } from '@playwright/test'

// The "Djur (Animals)" sample list's sv->en pairs, mirrored from
// src/data/constants.ts — used to answer correctly without depending on
// any internal state exposure (the app deliberately doesn't expose one).
const SV_TO_EN: Record<string, string> = {
  katt: 'cat',
  hund: 'dog',
  häst: 'horse',
  fågel: 'bird',
  kanin: 'rabbit',
  räv: 'fox',
  björn: 'bear',
  ekorre: 'squirrel',
  groda: 'frog',
  fjäril: 'butterfly',
}

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

async function currentSourceWord(page: Page): Promise<string> {
  const text = await page
    .locator('.h-font')
    .filter({ hasText: /^[a-zåäö]+$/i })
    .first()
    .textContent()
  return (text ?? '').trim()
}

test('a correct answer is scored, earns a coin, and advances to the next word', async ({
  page,
}) => {
  await startQuiz(page)
  const word = await currentSourceWord(page)
  await page.fill('#quiz-input', SV_TO_EN[word])
  await page.press('#quiz-input', 'Enter')

  await expect(page.locator('[data-testid="coin-count"]').first()).toHaveText('1', {
    timeout: 2000,
  })
  // auto-advances ~1800ms after a correct answer
  await expect(page.getByText('2 / 10')).toBeVisible({ timeout: 3000 })
})

test('a wrong answer drops into write-5x, and finishing it awards a bigger coin bonus', async ({
  page,
}) => {
  await startQuiz(page)
  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')

  await expect(page.getByText('Övning')).toBeVisible({ timeout: 2000 })
  const target = await page.locator('#quiz-input').getAttribute('placeholder')
  expect(target).toBeTruthy()

  for (let i = 0; i < 5; i++) {
    await page.fill('#quiz-input', target!)
  }

  await expect(page.locator('#w5-done')).toBeEnabled()
  await page.click('#w5-done')

  // 1 (none yet, answer was wrong) + 3 (write-5x bonus) = 3
  await expect(page.locator('[data-testid="coin-count"]').first()).toHaveText('3', {
    timeout: 2000,
  })
  await expect(page.getByText('2 / 10')).toBeVisible()
})

test('write-5x uses a single input, with a mascot per repetition filling in as each is confirmed', async ({
  page,
}) => {
  await startQuiz(page)
  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await expect(page.getByText('Övning')).toBeVisible({ timeout: 2000 })

  // Exactly one input on screen — not one per repetition.
  await expect(page.locator('input')).toHaveCount(1)
  // Five mascot slots, all starting as outlines (not done).
  await expect(page.getByTestId('write5-mascot')).toHaveCount(5)
  for (const done of await page
    .getByTestId('write5-mascot')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-done')))) {
    expect(done).toBe('false')
  }

  const target = await page.locator('#quiz-input').getAttribute('placeholder')
  await page.fill('#quiz-input', target!)

  // The first mascot fills in once its repetition is confirmed correct...
  await expect(page.getByTestId('write5-mascot').nth(0)).toHaveAttribute('data-done', 'true')
  await expect(page.getByTestId('write5-mascot').nth(1)).toHaveAttribute('data-done', 'false')
  // ...and the (still single) input clears itself, ready for the next one.
  await expect(page.locator('#quiz-input')).toHaveValue('')
  await expect(page.locator('input')).toHaveCount(1)

  await page.fill('#quiz-input', target!)
  await expect(page.getByTestId('write5-mascot').nth(1)).toHaveAttribute('data-done', 'true')
})

test('exit confirm can be dismissed, or used to leave the quiz', async ({ page }) => {
  await startQuiz(page)
  await page.click('#quiz-exit')
  await expect(page.getByText('Avsluta den här omgången?')).toBeVisible()

  await page.click('#exit-confirm-no')
  await expect(page.getByText('Avsluta den här omgången?')).toBeHidden()

  await page.click('#quiz-exit')
  await page.click('#exit-confirm-yes')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('completing every word reaches the results screen, and play again restarts', async ({
  page,
}) => {
  test.setTimeout(60000)
  await startQuiz(page)

  for (let n = 0; n < 10; n++) {
    if (
      await page
        .getByText('Du klarade det!')
        .isVisible()
        .catch(() => false)
    )
      break
    const word = await currentSourceWord(page)
    await page.fill('#quiz-input', SV_TO_EN[word])
    await page.press('#quiz-input', 'Enter')
    await page.waitForTimeout(1900)
  }

  await expect(page.getByText('Du klarade det!')).toBeVisible()
  await expect(page.getByText('10/10')).toBeVisible()

  await page.click('#done-again')
  await expect(page.getByText('1 / 10')).toBeVisible()
})
