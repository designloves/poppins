import type { PointerEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { useLayoutEffect, useRef, useState } from 'react'
import { AvatarImage } from '../components/AvatarImage'
import { Coin } from '../components/Coin'
import { ACCESSORIES, type Accessory } from '../data/accessories'
import { FULL_BODY_AVATARS, type AvatarKey } from '../data/constants'
import { accessoryName, t, type UiLang } from '../data/i18n'
import { ArrowBack, Check } from '../icons/icons'
import { ACCESSORY_ICONS } from '../icons/accessoryIcons'

// One square tile — just the icon, in a single frame, with a single tap
// to select it (see the name/price header above the tiles) and toggle
// equipping it. Used both in the wide-open grid and the peek row so
// browsing and equipping work identically in either state.
function AccessoryTile({
  item,
  equipped,
  uiLang,
  size,
  onToggle,
}: {
  item: Accessory
  equipped: boolean
  uiLang: UiLang
  size: number
  onToggle: (id: string) => void
}) {
  const renderIcon = ACCESSORY_ICONS[item.id]
  return (
    <Button
      id={`accessory-tile-${item.id}`}
      title={accessoryName(uiLang, item.id)}
      onClick={() => onToggle(item.id)}
      style={{
        position: 'relative',
        overflow: 'visible',
        flexShrink: 0,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        background: 'var(--paper-alt)',
        border: equipped ? '3px solid var(--ink)' : 'var(--border-thin)',
        boxShadow: '0 3px 0 var(--ink)',
        cursor: 'pointer',
      }}
    >
      {renderIcon?.(size * 0.62)}
      {equipped && (
        <div
          data-testid="accessory-tile-equipped"
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: 'var(--mint)',
            border: '2px solid var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={12} color="#241F3D" />
        </div>
      )}
    </Button>
  )
}

interface DressingRoomProps {
  avatar: AvatarKey
  uiLang: UiLang
  equippedAccessoryId: string | null
  onBack: () => void
  onToggle: (id: string) => void
}

type SheetState = 'closed' | 'peek' | 'open'

// Tall enough for just the handle/label — tap this to bring the sheet
// back once it's been dragged all the way down.
const CLOSED_HEIGHT = 64
// Tall enough for the name/price header plus one row of accessory tiles
// plus the handle, so the character stays the main thing on screen most
// of the time.
const PEEK_HEIGHT = 216
// The "fully open" state is a fraction of the whole screen's height
// rather than a fixed px value, so it scales with the device.
const OPEN_FRACTION = 0.5
// Below this many px of pointer movement, a press-and-release on the
// handle is treated as a tap (cycling open/peek/closed) rather than a
// drag (snapping to whichever of the three it ended up closest to).
const DRAG_THRESHOLD = 6
const TILE_SIZE = 92

export function DressingRoom({
  avatar,
  uiLang,
  equippedAccessoryId,
  onBack,
  onToggle,
}: DressingRoomProps) {
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  // Whichever tile was tapped most recently — shown in the header above
  // the tiles, independent of whether that tap ended up equipping or
  // unequipping it. Starts on whatever's already worn, or just the first
  // item if nothing is.
  const [selectedId, setSelectedId] = useState<string | null>(
    equippedAccessoryId ?? ACCESSORIES[0]?.id ?? null,
  )
  const selectedItem = ACCESSORIES.find((item) => item.id === selectedId) ?? ACCESSORIES[0]

  function selectAndToggle(id: string) {
    setSelectedId(id)
    onToggle(id)
  }
  // Measured in an effect rather than read from the ref during render —
  // openHeight() below is called while rendering (to size the sheet when
  // sheetState is 'open'), and reading a ref's .current there instead of
  // this state would be the same value but off-limits during render.
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(null)

  useLayoutEffect(() => {
    function measure() {
      if (containerRef.current) setContainerHeight(containerRef.current.clientHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function openHeight() {
    return Math.round((containerHeight || window.innerHeight) * OPEN_FRACTION)
  }

  function heightFor(state: SheetState) {
    if (state === 'closed') return CLOSED_HEIGHT
    if (state === 'peek') return PEEK_HEIGHT
    return openHeight()
  }

  function cycleSheet() {
    setSheetState(sheetState === 'open' ? 'peek' : sheetState === 'peek' ? 'open' : 'peek')
  }

  function onHandlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startHeight: heightFor(sheetState), moved: false }
  }

  function onHandlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    const delta = drag.startY - e.clientY
    if (Math.abs(delta) > DRAG_THRESHOLD) drag.moved = true
    const max = openHeight()
    setDragHeight(Math.min(max, Math.max(CLOSED_HEIGHT, drag.startHeight + delta)))
  }

  function onHandlePointerUp() {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    if (!drag.moved) {
      setDragHeight(null)
      cycleSheet()
      return
    }
    const current = dragHeight ?? drag.startHeight
    const max = openHeight()
    const candidates: [SheetState, number][] = [
      ['closed', CLOSED_HEIGHT],
      ['peek', PEEK_HEIGHT],
      ['open', max],
    ]
    candidates.sort((a, b) => Math.abs(current - a[1]) - Math.abs(current - b[1]))
    setSheetState(candidates[0][0])
    setDragHeight(null)
  }

  const sheetHeight = dragHeight ?? heightFor(sheetState)

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 16px 0',
          flexShrink: 0,
        }}
      >
        <h2 className="h-font" style={{ fontSize: 30, color: 'var(--ink)' }}>
          {t(uiLang, 'dressingRoom')}
        </h2>
        <Button id="dressing-room-close" className="back-btn" onClick={onBack}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 16px',
          // Top-aligned rather than centered, with headroom above the
          // character itself — pulls it up and away from the sheet below,
          // and leaves room for a hat or similar to peek above its head
          // once accessories can render on this full-body view.
          paddingTop: 28,
          // The avatar below is sized off width alone, so on a short
          // viewport (or with the sheet 'open', shrinking this flex area)
          // it can be taller than the space actually left for it —
          // without clipping that overflow here, it visually overlaps the
          // sheet and steals pointer events from the handle underneath it.
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', flexShrink: 0 }}>
          {FULL_BODY_AVATARS.has(avatar) ? (
            // Full-body art is a complete standing pose, meant to be shown
            // in full rather than cropped/oversized the way the face-only
            // art is — no accessory overlay yet, since AccessoryOverlay's
            // positioning assumes that face-crop composition.
            <img
              src={`avatars/full/${avatar}.png`}
              alt={avatar}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <AvatarImage avatar={avatar} diameter={340} accessoryId={equippedAccessoryId} />
          )}
        </div>
      </div>

      <div
        data-testid="dressing-room-sheet"
        data-sheet-state={sheetState}
        style={{
          flexShrink: 0,
          height: sheetHeight,
          background: 'var(--paper)',
          border: 'var(--border)',
          borderBottom: 'none',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          boxShadow: '0 -6px 0 rgba(36,31,61,.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transition: dragHeight === null ? 'height 220ms ease-out' : 'none',
          touchAction: 'none',
        }}
      >
        <div
          id="dressing-room-sheet-handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '10px 0 6px',
            cursor: 'grab',
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 999,
              background: 'var(--paper-alt)',
              border: '1.5px solid var(--ink)',
            }}
          />
          {sheetState === 'closed' && (
            <div className="h-font" style={{ fontSize: 15, color: 'var(--ink)' }}>
              {t(uiLang, 'dressingRoom')}
            </div>
          )}
        </div>

        {sheetState !== 'closed' && selectedItem && (
          <div
            data-testid="dressing-room-item-header"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0 16px 10px',
            }}
          >
            <span className="h-font" style={{ fontSize: 17, color: 'var(--ink)' }}>
              {accessoryName(uiLang, selectedItem.id)}
            </span>
            <span className="m-font" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {selectedItem.cost}
              </span>
              <Coin size={14} />
            </span>
          </div>
        )}

        {sheetState === 'open' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '4px 16px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignContent: 'flex-start',
            }}
          >
            {ACCESSORIES.map((item) => (
              <AccessoryTile
                key={item.id}
                item={item}
                equipped={equippedAccessoryId === item.id}
                uiLang={uiLang}
                size={TILE_SIZE}
                onToggle={selectAndToggle}
              />
            ))}
          </div>
        )}

        {sheetState === 'peek' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowX: 'auto',
              overflowY: 'hidden',
              display: 'flex',
              gap: 12,
              padding: '0 16px 12px',
            }}
          >
            {ACCESSORIES.map((item) => (
              <AccessoryTile
                key={item.id}
                item={item}
                equipped={equippedAccessoryId === item.id}
                uiLang={uiLang}
                size={TILE_SIZE}
                onToggle={selectAndToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
