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
  await expect(page.locator('#accessory-tile-party-hat')).toBeVisible()
  // The full list (with its price/wear-it button) only shows once opened.
  await expect(page.getByText('Partyhatt')).toBeHidden()
})

test('tapping the handle opens the full list, tapping again collapses it back to peek', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')

  await page.click('#dressing-room-sheet-handle')
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'open',
  )
  await expect(page.getByText('Partyhatt')).toBeVisible()
  await expect(page.getByText('Gratis')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ta på' })).toBeVisible()

  await page.click('#dressing-room-sheet-handle')
  await expect(page.locator('[data-testid="dressing-room-sheet"]')).toHaveAttribute(
    'data-sheet-state',
    'peek',
  )
  await expect(page.getByText('Partyhatt')).toBeHidden()
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

test('wearing an accessory from the peek row shows it on the avatar everywhere, and persists across a reload', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#accessory-tile-party-hat')

  // cat (the default avatar) has full-body art in the dressing room's own
  // hero preview, which doesn't yet support the accessory overlay — but
  // it still shows up everywhere the face-crop art is used.
  await page.click('#dressing-room-close')
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.click('button[title="Inställningar"]')
  await expect(page.getByTestId('accessory-overlay')).toBeVisible()

  await page.reload()
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-sheet-handle')
  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()
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

test('taking an accessory back off removes it, consistently between the open list and the peek row', async ({
  page,
}) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-sheet-handle')
  await page.click('#accessory-toggle-party-hat')
  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()

  await page.click('#accessory-toggle-party-hat')
  await expect(page.getByRole('button', { name: 'Ta på' })).toBeVisible()

  // Equip from the collapsed peek row instead, then confirm the open list
  // agrees it's worn.
  await page.click('#dressing-room-sheet-handle')
  await page.click('#accessory-tile-party-hat')
  await page.click('#dressing-room-sheet-handle')
  await expect(page.getByRole('button', { name: 'Ta av' })).toBeVisible()
})

test('back button returns home', async ({ page }) => {
  await page.goto('/')
  await page.click('button[title="Garderoben"]')
  await page.click('#dressing-room-close')
  await expect(page.getByText('Djur (Animals)')).toBeVisible()
})
