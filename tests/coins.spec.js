const { test, expect } = require('@playwright/test');
const { gotoApp, startQuiz, currentTarget, getCoins } = require('./helpers');

test('a correct answer earns a coin, and it persists across a reload', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  expect(await getCoins(page)).toBe(0);

  const target = await currentTarget(page);
  await page.fill('#quiz-input', target);
  await page.press('#quiz-input', 'Enter');

  await expect.poll(() => getCoins(page)).toBe(1);

  await page.reload();
  await page.waitForSelector('#frame');
  expect(await getCoins(page)).toBe(1);
});

test('a wrong answer earns no coin by itself', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  await page.fill('#quiz-input', '__definitely wrong__');
  await page.press('#quiz-input', 'Enter');
  await page.waitForTimeout(200);

  expect(await getCoins(page)).toBe(0);
});

test('completing the write-5x remediation after a wrong answer awards the bonus exactly once', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  const target = await currentTarget(page);

  await page.fill('#quiz-input', '__definitely wrong__');
  await page.press('#quiz-input', 'Enter');
  await page.waitForSelector('#w5-0', { timeout: 3000 });

  for (let i = 0; i < 5; i++) {
    await page.fill(`#w5-${i}`, target);
  }

  await expect.poll(() => getCoins(page)).toBe(3); // WRITE5_COINS

  // Re-triggering write5Check on an already-completed rep must not pay out again.
  await page.waitForTimeout(200);
  expect(await getCoins(page)).toBe(3);
});
