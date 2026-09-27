import { test, expect } from '@playwright/test'

// Regression test for Safari getting "stuck" showing a stale chrome color
// (status bar/toolbar) after content that would affect it changes —
// nudgeThemeColor() briefly toggles the theme-color meta tag's content to
// force Safari to re-evaluate, then restores it. Called from navigate()
// on every screen change, and separately when the exit-confirm dialog's
// full-bleed dark scrim closes.
test('navigating toggles the theme-color meta tag and restores its original value', async ({
  page,
}) => {
  await page.goto('/')
  const original = await page.locator('meta[name="theme-color"]').getAttribute('content')
  expect(original).toBeTruthy()

  // Arm the observer without awaiting it yet — awaiting here would block
  // before the click below ever happens, since the promise only resolves
  // once the toggle it's watching for occurs.
  const sawTogglePromise = page.evaluate(
    (original) =>
      new Promise<boolean>((resolve) => {
        const meta = document.querySelector('meta[name="theme-color"]')!
        const observer = new MutationObserver(() => {
          if (meta.getAttribute('content') !== original) {
            observer.disconnect()
            resolve(true)
          }
        })
        observer.observe(meta, { attributes: true, attributeFilter: ['content'] })
        setTimeout(() => {
          observer.disconnect()
          resolve(false)
        }, 2000)
      }),
    original,
  )
  // Trigger a navigation while the observer above is armed. Home's
  // settings-avatar button is a reliable navigate() call on every screen.
  await page.getByTitle(/Inställningar|Settings/).click()

  expect(await sawTogglePromise).toBe(true)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', original!)
})
