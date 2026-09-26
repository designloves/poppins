const { test, expect } = require('@playwright/test');
const { gotoApp, startQuiz } = require('./helpers');

// Regression tests for two real bugs found in production screenshots:
//  - the app frame shrink-wrapping to a narrow column instead of filling
//    the viewport width (a combined html,body flex-centering selector
//    made body a shrink-to-fit flex item of html)
//  - the exit-confirm dialog only covering that narrow column instead of
//    the full screen, visible as a background-colored strip around it

test('the app frame fills the full viewport width', async ({ page }) => {
  await gotoApp(page);
  const viewport = page.viewportSize();
  const frameWidth = await page.evaluate(() => document.getElementById('frame').getBoundingClientRect().width);
  expect(frameWidth).toBeGreaterThanOrEqual(viewport.width - 2);
});

test('the exit-confirm dialog fills the screen (with its intended 16px margin), not a narrow strip', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);
  await page.click('#quiz-exit');
  await page.waitForSelector('#exit-confirm-yes');

  const { frameWidth, cardWidth } = await page.evaluate(() => {
    const frame = document.getElementById('frame').getBoundingClientRect();
    const card = document.getElementById('exit-confirm-yes').closest('.card-lg').getBoundingClientRect();
    return { frameWidth: frame.width, cardWidth: card.width };
  });

  // The dialog card is meant to sit 16px in from each side of the frame.
  expect(cardWidth).toBeGreaterThan(frameWidth * 0.7);
  expect(cardWidth).toBeCloseTo(frameWidth - 32, -1);
});

test('no page-level scroll appears on a normal (keyboard-closed) viewport', async ({ page }) => {
  await gotoApp(page);
  await startQuiz(page);

  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 2);
});
