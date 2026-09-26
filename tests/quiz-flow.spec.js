const { test, expect } = require('@playwright/test');
const { gotoApp, startQuiz, currentTarget } = require('./helpers');

test('a correct answer is scored and the quiz advances to the next word', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  const target = await currentTarget(page);
  await page.fill('#quiz-input', target);
  await page.press('#quiz-input', 'Enter');

  await expect.poll(() => page.evaluate(() => state.quizRight)).toBe(1);

  await expect.poll(() => page.evaluate(() => state.quizIdx), { timeout: 3000 }).toBe(1);
  expect(await page.evaluate(() => state.quizWrong)).toBe(0);
});

test('a wrong answer is scored and drops into the write-5x remediation', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  await page.fill('#quiz-input', '__definitely wrong__');
  await page.press('#quiz-input', 'Enter');

  await expect.poll(() => page.evaluate(() => state.quizWrong)).toBe(1);
  await expect.poll(() => page.evaluate(() => state.quizWriteMode), { timeout: 3000 }).toBe(true);
  expect(await page.evaluate(() => state.quizRight)).toBe(0);
});

test('answering in reverse quizzes on the source-language word instead', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page, { reversed: true });

  const reversedIsActive = await page.evaluate(() => state.quizReversed);
  expect(reversedIsActive).toBe(true);
});
