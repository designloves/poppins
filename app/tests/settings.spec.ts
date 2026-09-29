import { test, expect } from '@playwright/test'

test('settings shows the not-signed-in profile card and a working back button', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await expect(page.getByText('Hej där!')).toBeVisible()
  await expect(page.getByText('Inte inloggad')).toBeVisible()

  await page.click('#settings-close')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})

test('toggling sound and pronunciation switches flips their state', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await expect(page.locator('#setting-sound')).toHaveAttribute('data-on', 'false')
  await page.click('#setting-sound')
  await expect(page.locator('#setting-sound')).toHaveAttribute('data-on', 'true')

  await expect(page.locator('#setting-pronunciation')).toHaveAttribute('data-on', 'false')
  await page.click('#setting-pronunciation')
  await expect(page.locator('#setting-pronunciation')).toHaveAttribute('data-on', 'true')
})

test('switching app language updates the whole UI immediately', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')

  await page.click('button:has-text("English")')
  await expect(page.getByText('Settings')).toBeVisible()
  await expect(page.getByText('App language')).toBeVisible()
  await expect(page.getByText('Sound effects')).toBeVisible()
})

// Picking an avatar reloads the page shortly after (see selectAvatar() in
// useAppState.ts) — no live update has proven reliable across Safari
// versions, only a fresh load. Waiting for that reload's own 'load'
// event, rather than a fixed delay, is what makes these tests exercise
// the real behavior instead of racing a timer.
async function pickAvatarAndWaitForReload(page: import('@playwright/test').Page, title: string) {
  await page.click('button[title="Inställningar"]')
  await Promise.all([page.waitForEvent('load'), page.click(`button[title="${title}"]`)])
}

test('picking a different avatar updates it across the app', async ({ page }) => {
  await page.goto('/')
  await pickAvatarAndWaitForReload(page, 'fox')

  await expect(page.locator('img[alt="fox"]').first()).toBeVisible()
})

test('picking a different avatar shows a themed transition before the reload', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('button[title="fox"]')

  // Shown during the brief window before the reload that actually
  // applies the new avatar everywhere (see selectAvatar()) — so the
  // reload reads as a deliberate "updating your look" moment.
  const transition = page.getByTestId('avatar-transition')
  await expect(transition).toBeVisible()
  await expect(transition.locator('img[alt="fox"]')).toBeVisible()
})

test('picking a different avatar reloads back onto Settings, not Home', async ({ page }) => {
  await page.goto('/')
  await pickAvatarAndWaitForReload(page, 'fox')

  // The reload is there to get Safari's chrome color right, not to kick
  // you out of what you were doing.
  await expect(page.getByText('Hej där!')).toBeVisible()
})

test("picking a different avatar updates Safari's theme-color to match", async ({ page }) => {
  await page.goto('/')
  await pickAvatarAndWaitForReload(page, 'fox')

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F0D3B4')
})

test('picking a different avatar sets an inline body background-color, for iOS 26 Safari', async ({
  page,
}) => {
  await page.goto('/')
  await pickAvatarAndWaitForReload(page, 'fox')

  // body's own background-color is one of the signals Safari can read
  // for its chrome color (kept for compatibility), though on this app's
  // non-scrolling layout it isn't sufficient by itself — see the #frame
  // fixed-element background below for the fix that actually works.
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(240, 211, 180)')
})

test("picking a different avatar updates #frame's background, which Safari 26 samples for its chrome", async ({
  page,
}) => {
  await page.goto('/')
  await pickAvatarAndWaitForReload(page, 'fox')

  // Safari 26 tints its status bar/bottom bar from a real position:fixed
  // DOM element spanning the viewport's top/bottom edges with its own
  // opaque background-color — not from theme-color or (reliably) from
  // body's background. #frame is that element in this app; a fresh load
  // is what actually gets Safari to read it, confirmed on a real device.
  await expect(page.locator('#frame')).toHaveCSS('background-color', 'rgb(240, 211, 180)')
})

test('the login button navigates to the login screen', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await page.click('#settings-login')

  await expect(page.getByText('Hej!')).toBeVisible()
  await expect(page.locator('#login-email')).toBeVisible()
})
