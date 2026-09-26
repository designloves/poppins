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

  await expect(page.locator('#w5-0')).toBeVisible({ timeout: 2000 })
  const target = await page.locator('#w5-0').getAttribute('placeholder')
  expect(target).toBeTruthy()

  for (let i = 0; i < 5; i++) {
    await page.fill(`#w5-${i}`, target!)
  }

  await expect(page.locator('#w5-done')).toBeEnabled()
  await page.click('#w5-done')

  // 1 (none yet, answer was wrong) + 3 (write-5x bonus) = 3
  await expect(page.locator('[data-testid="coin-count"]').first()).toHaveText('3', {
    timeout: 2000,
  })
  await expect(page.getByText('2 / 10')).toBeVisible()
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
