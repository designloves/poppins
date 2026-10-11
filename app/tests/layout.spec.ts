import { test, expect, type Page } from '@playwright/test'

async function startQuiz(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await page.getByRole('button', { name: 'Svara på engelska' }).click()
}

async function assertNoPageScroll(page: Page) {
  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))
  expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 2)
}

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

test('the app frame fills the full viewport width', async ({ page }) => {
  await page.goto('/')
  const viewport = page.viewportSize()!
  const frameWidth = await page.evaluate(
    () => document.getElementById('frame')!.getBoundingClientRect().width,
  )
  expect(frameWidth).toBeGreaterThanOrEqual(viewport.width - 2)
})

test('the exit-confirm dialog fills the screen (with its intended 16px margin), not a narrow strip', async ({
  page,
}) => {
  await startQuiz(page)
  await page.click('#quiz-exit')
  await page.waitForSelector('#exit-confirm-yes')

  const { frameWidth, cardWidth } = await page.evaluate(() => {
    const frame = document.getElementById('frame')!.getBoundingClientRect()
    const card = document
      .getElementById('exit-confirm-yes')!
      .closest('.card-lg')!
      .getBoundingClientRect()
    return { frameWidth: frame.width, cardWidth: card.width }
  })

  // The dialog card is meant to sit 16px in from each side of the frame.
  expect(cardWidth).toBeGreaterThan(frameWidth * 0.7)
  expect(cardWidth).toBeCloseTo(frameWidth - 32, -1)
})

test('no page-level scroll appears on a normal (keyboard-closed) viewport', async ({ page }) => {
  await startQuiz(page)

  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))
  expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 2)
})

// Regression test: #frame is position:fixed, which takes it out of the
// normal document flow — an ancestor's overflow:hidden (html/body's) does
// NOT clip a fixed-position element, only its own overflow does. Without
// #frame having its own overflow:hidden, any sub-pixel rounding overflow
// (routine on mobile browsers) is exposed as real, touch-scrollable
// horizontal overflow instead of being silently clipped.
test('no horizontal scroll appears on any screen at a real phone width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })

  async function assertNoHorizontalOverflow() {
    const { docWidth, winWidth } = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      winWidth: document.documentElement.clientWidth,
    }))
    expect(docWidth).toBeLessThanOrEqual(winWidth)
  }

  await page.goto('/')
  await assertNoHorizontalOverflow()

  await page.getByRole('button', { name: /Starta övning|Start practice/ }).click()
  await assertNoHorizontalOverflow()

  await page.getByRole('button', { name: 'Svara på engelska' }).click()
  await assertNoHorizontalOverflow()

  await page.click('#quiz-exit')
  await assertNoHorizontalOverflow()
  await page.click('#exit-confirm-no')

  await page.fill('#quiz-input', '__definitely wrong__')
  await page.press('#quiz-input', 'Enter')
  await page.getByText('Övning').waitFor({ timeout: 3000 })
  await assertNoHorizontalOverflow()
})

// Regression test: once overflow-y is set to anything other than
// 'visible', an unset overflow-x no longer defaults to 'visible' either —
// it computes to 'auto' instead (the CSS Overflow spec forbids mixing
// 'visible' on one axis with a non-visible value on the other). Any of
// these inner scroll areas running even a few px wider than its own
// container (scrollbar-gutter math, sub-pixel rounding) then became a
// real, user-swipeable horizontal scroll confined to that one area — the
// page-level check above can't catch it, since #screen's own
// overflow-x:hidden clips the *document*, not a nested scroll container
// like these.
test('inner scroll areas never allow horizontal scrolling, even if overflow-y is active', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })

  async function assertOverflowXHidden(testId: string) {
    const overflowX = await page
      .getByTestId(testId)
      .evaluate((el) => getComputedStyle(el).overflowX)
    expect(overflowX).toBe('hidden')
  }

  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await assertOverflowXHidden('lists-scroll-area')

  await page.getByRole('button', { name: 'Tillbaka' }).click()
  await page.getByRole('button', { name: 'Ny' }).click()
  await assertOverflowXHidden('paste-form-scroll-area')

  await page.fill('#paste-name', 'Test')
  await page.fill('#paste-text', 'ett = one')
  await page.click('#paste-parse')
  await assertOverflowXHidden('paste-review-scroll-area')

  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-sheet-handle')
  await assertOverflowXHidden('dressing-room-grid-scroll-area')
})

// Regression test: a flex item defaults to min-height:auto (its content's
// own intrinsic size), not 0 — so flex:1 + overflow-y:auto alone doesn't
// actually scroll internally once the content is tall enough; it pushes
// the parent taller instead, which pushes the Avbryt/Sortera row below
// past the screen's own bottom edge. At that point the row's hard
// box-shadow (ink overflow, not real layout) gets clipped where #screen's
// own overflow-y:auto cuts off, since it isn't given its own extra scroll
// room the way real content is.
test('a long pasted word list scrolls internally instead of pushing the button row off-screen', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ny' }).click()
  await page.fill('#paste-name', 'Long list')
  const lines = Array.from({ length: 40 }, (_, i) => `ord${i} = word${i}`).join('\n')
  await page.fill('#paste-text', lines)
  await assertNoPageScroll(page)

  await page.click('#paste-parse')
  await expect(page.getByText('Hittade 40 ord')).toBeVisible()
  await assertNoPageScroll(page)
})

test('many lists scroll internally, keeping "Add a new list" within the viewport', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const lists = Array.from({ length: 15 }, (_, i) => ({
      id: `list-${i}`,
      from: 'sv',
      to: 'en',
      name: `Lista ${i}`,
      color: 'rose',
      words: [{ sv: 'ett', en: 'one' }],
    }))
    localStorage.setItem('poppins_settings_v1', JSON.stringify({ lists, activeListId: 'list-0' }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()
  await assertNoPageScroll(page)
})

// Regression test: the active list card nudges 4px right (translateX)
// as a selection affordance. Once the scroll area above picked up its
// own overflow-x:hidden, that nudge pushed the card 4px past the
// container's own right edge, where it got hard-clipped — flattening
// its right corner and border. The container now widens its own clip
// box by 4px on each side (negative margin + matching padding) so the
// nudge has room without moving any card's resting position.
test("the active list card's selection nudge isn't clipped by the scroll area's own edge", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const lists = Array.from({ length: 3 }, (_, i) => ({
      id: `list-${i}`,
      from: 'sv',
      to: 'en',
      name: `Lista ${i}`,
      color: 'rose',
      words: [{ sv: 'ett', en: 'one' }],
    }))
    localStorage.setItem('poppins_settings_v1', JSON.stringify({ lists, activeListId: 'list-0' }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Mina listor' }).click()

  const { scrollArea, activeCard, inactiveCard } = await page.evaluate(() => {
    const area = document.querySelector('[data-testid="lists-scroll-area"]')!
    const cards = area.querySelectorAll(':scope > div')
    return {
      scrollArea: area.getBoundingClientRect(),
      activeCard: cards[0].getBoundingClientRect(),
      inactiveCard: cards[1].getBoundingClientRect(),
    }
  })

  // The inactive card still rests flush at the area's visual left edge...
  expect(inactiveCard.left).toBeCloseTo(scrollArea.left + 4, 0)
  // ...while the active card's nudged-right edge stays within the
  // container's own (widened) clip box, not flattened by it.
  expect(activeCard.right).toBeLessThanOrEqual(scrollArea.right + 0.5)
})

// Regression test: overflow:hidden on the done screen's shared container
// (there to keep the falling confetti animation from spilling past the
// screen's bounds) was also clipping the star badges' and buttons' own
// box-shadow below them whenever it bled past that same boundary — a
// different kind of clipping than the flex/min-height bug above, but the
// same visible symptom (a hard-edged shadow cut off instead of complete).
// The confetti now has its own, separately clipped layer.
test("the done screen's content isn't inside the confetti's own clipped layer", async ({
  page,
}) => {
  await startQuiz(page)
  for (let i = 0; i < 10; i++) {
    const word = (
      await page
        .locator('.h-font')
        .filter({ hasText: /^[a-zåäö]+$/i })
        .first()
        .textContent()
    )?.trim()
    await page.fill('#quiz-input', SV_TO_EN[word ?? ''])
    await page.press('#quiz-input', 'Enter')
    await page.waitForTimeout(1800)
  }
  await page.waitForSelector('#done-again')

  const hasHiddenAncestor = await page.evaluate(() => {
    let el: HTMLElement | null = document.getElementById('done-again')
    while (el && el.id !== 'screen') {
      if (getComputedStyle(el).overflow === 'hidden') return true
      el = el.parentElement
    }
    return false
  })
  expect(hasHiddenAncestor).toBe(false)
})
