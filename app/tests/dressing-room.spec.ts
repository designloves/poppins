import { test, expect, type Page } from '@playwright/test'

// Simulates a drag on the bottom sheet's handle by dispatching real mouse
// input — Chromium translates this into the pointer events the sheet
// itself listens for (onPointerDown/Move/Up), same as a touch would.
async function dragHandle(page: Page, deltaY: number) {
  const handle = page.locator('#dressing-room-sheet-handle')
  const box = await handle.boundingBox()
  if (!box) throw new Error('handle not found')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + deltaY, { steps: 10 })
  await page.mouse.up()
}

test('opens on the peek state: a big avatar with the wardrobe peeking from the bottom', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'peek',
  )
  // Icon-only tile — the name/price header above the row names whichever
  // item is selected, defaulting to the first one.
  await expect(page.locator('#accessory-tile-party-hat')).toBeVisible()
  await expect(page.getByTestId('dressing-room-item-header')).toContainText('Partyhatt')
})

test('tapping the handle opens the wider grid, tapping again collapses it back to peek', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  await page.click('#dressing-room-sheet-handle')
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'open',
  )
  await expect(page.locator('#accessory-tile-party-hat')).toBeVisible()

  await page.click('#dressing-room-sheet-handle')
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'peek',
  )
})

test('dragging the handle down closes the sheet to a peeking bar, tapping it reopens to peek', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  await dragHandle(page, 200)
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'closed',
  )
  await expect(page.locator('#dressing-room-sheet-handle').getByText('Garderoben')).toBeVisible()

  await page.click('#dressing-room-sheet-handle')
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'peek',
  )
})

test("the header shows the selected item's price as a number next to a coin, not free text", async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  const header = page.getByTestId('dressing-room-item-header')
  await expect(header).toContainText('Partyhatt')
  await expect(header).toContainText('0')
  await expect(header.locator('svg')).not.toHaveCount(0)
})

test('tapping a different tile updates the header to name that item instead', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  const header = page.getByTestId('dressing-room-item-header')
  await expect(header).toContainText('Partyhatt')

  await page.click('#accessory-tile-fish-hairclip')
  await expect(header).toContainText('Fiskspänne')
  await expect(header).not.toContainText('Partyhatt')
})

test('wearing an accessory shows it on the avatar everywhere, and persists across a reload', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-tile-party-hat')

  await expect(page.getByTestId('accessory-tile-equipped')).toBeVisible()

  // cat (the default avatar) has full-body art in the dressing room's own
  // hero preview, which doesn't yet support the accessory overlay — but
  // it still shows up everywhere the face-crop art is used.
  await page.click('#dressing-room-close')
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.click('button[title="Inställningar"]')
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.reload()
  await page.click('button[title="Garderoben"]')
  await expect(page.getByTestId('accessory-tile-equipped')).toBeVisible()
})

test("the dressing room's own preview shows a worn accessory too, for avatars still using face-crop art", async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Inställningar"]')
  await Promise.all([page.waitForEvent('load'), page.click('button[title="elephant"]')])
  // Picking an avatar reloads back onto Settings, not Home.
  await page.click('#settings-close')

  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-tile-party-hat')
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()
})

test('taking an accessory back off removes it, consistently between peek and open', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-tile-party-hat')
  await expect(page.getByTestId('accessory-tile-equipped')).toBeVisible()

  await page.click('#dressing-room-sheet-handle')
  await expect(page.getByTestId('accessory-tile-equipped')).toBeVisible()

  await page.click('#accessory-tile-party-hat')
  await expect(page.getByTestId('accessory-tile-equipped')).toBeHidden()

  await page.click('#dressing-room-sheet-handle')
  await expect(page.getByTestId('accessory-tile-equipped')).toBeHidden()
})

test('back button returns home', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-close')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})
