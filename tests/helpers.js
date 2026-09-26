// Served over HTTP by playwright.config.js's webServer (index.html loads
// its own code as ES modules, which browsers block from file:// origins).
async function gotoApp(page) {
  await page.goto('/index.html');
  await page.waitForSelector('#frame');
}

// Drives the real UI (home -> practice setup -> quiz), same path a player takes.
async function startQuiz(page, { reversed = false } = {}) {
  await page.click('#home-start');
  await page.click(reversed ? '#setup-reversed' : '#setup-normal');
  await page.waitForSelector('#quiz-input');
}

// The correct answer for the word currently on screen, read from app state
// rather than hardcoded, since quiz words are shuffled on every start.
async function currentTarget(page) {
  return page.evaluate(() => {
    const lh = langHelpers(activeList(), state.quizReversed);
    return lh.tgt(state.quizWords[state.quizIdx]);
  });
}

async function getCoins(page) {
  return page.evaluate(() => state.coins);
}

module.exports = { gotoApp, startQuiz, currentTarget, getCoins };
