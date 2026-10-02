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

// One square tile — just the icon, maximized, with the price below it —
// used both in the wide-open grid and the peek row so browsing and
// equipping work identically in either state. Always exactly `size` x
// `size`: the price row is a fixed height, and the icon fills whatever
// space is left above it, so the square holds regardless of the tile's
// actual size. The item's name isn't shown — it'd cost more room than
// it's worth here — but stays available as the tile's accessible name.
function AccessoryTile({
  item,
  equipped,
  uiLang,
  size,
  radius,
  onToggle,
}: {
  item: Accessory
  equipped: boolean
  uiLang: UiLang
  size: number
  radius: string | number
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        boxSizing: 'border-box',
        borderRadius: radius,
        background: 'var(--paper-alt)',
        border: equipped ? '3px solid var(--ink)' : 'var(--border-thin)',
        boxShadow: '0 3px 0 var(--ink)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderIcon?.(size * 0.62)}
      </div>
      <div
        className="m-font"
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{item.cost}</span>
        <Coin size={18} />
      </div>
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
// The handle area's own height (20px top padding + 5px bar + 12px bottom
// padding) when it's just the bar, no label — i.e. whenever the sheet
// isn't 'closed'.
const HANDLE_HEIGHT = 37
const TILES_PER_ROW = 4
const TILE_GAP = 10
const ROW_TOP_PADDING = 8
const ROW_BOTTOM_PADDING = 12
// The gap from the sheet's left/right edge to a tile should match the gap
// from its top edge to a tile (the handle plus the row's own top padding)
// rather than being its own, smaller number — otherwise the top reads as
// noticeably more padded than the sides, even though both are "padding."
const ROW_SIDE_PADDING = HANDLE_HEIGHT + ROW_TOP_PADDING
// Caps the tile (and so the sheet) from growing unreasonably large on a
// wide viewport — tiles are sized off the available width so exactly 4
// fit per row, but that width is the whole app frame, which isn't capped
// to a phone size itself.
const MAX_TILE_SIZE = 120
// Below this many px of pointer movement, a press-and-release on the
// handle is treated as a tap (cycling open/peek/closed) rather than a
// drag (snapping to whichever of the three it ended up closest to).
const DRAG_THRESHOLD = 6

// A tile that isn't flush against the sheet's own left/right edge just
// uses a plain, fixed corner radius.
const DEFAULT_TILE_RADIUS = 14
// Apple's "concentric" corner rule from their newest HIG (Liquid Glass):
// a nested shape's corner radius should equal its container's radius
// minus the padding separating them, so the two curves share a focal
// point instead of two independently-chosen roundings that just happen
// to sit near each other. The sheet is the container here (--radius-lg),
// and ROW_SIDE_PADDING is exactly what separates a row from the sheet's
// own left/right edge, so deriving the edge tiles' radius from those two
// — rather than picking a number by eye — keeps them concentric with the
// sheet automatically, including if --radius-lg itself ever changes.
const CONCENTRIC_TILE_RADIUS = `max(0px, calc(var(--radius-lg) - ${ROW_SIDE_PADDING}px))`

export function DressingRoom({
  avatar,
  uiLang,
  equippedAccessoryId,
  onBack,
  onToggle,
}: DressingRoomProps) {
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  // Measured in an effect rather than read from the ref during render —
  // tileSize() below is called while rendering (to size the tiles and the
  // sheet itself), and reading a ref's .current there instead of this
  // state would be the same value but off-limits during render.
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(null)

  useLayoutEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Square tiles, sized off the available width so exactly 4 fit per row
  // (with padding) in the open grid — the peek row uses the very same
  // size, so a tile looks identical whichever state it's shown in.
  function tileSize() {
    const width = containerWidth || window.innerWidth
    const available = width - ROW_SIDE_PADDING * 2 - TILE_GAP * (TILES_PER_ROW - 1)
    return Math.min(MAX_TILE_SIZE, Math.floor(available / TILES_PER_ROW))
  }

  // The sheet's content height for a given number of tile rows — the
  // handle bar above it, plus that many square tiles and the gaps/padding
  // around them.
  function rowsHeight(rows: number) {
    const size = tileSize()
    return (
      HANDLE_HEIGHT + ROW_TOP_PADDING + rows * size + (rows - 1) * TILE_GAP + ROW_BOTTOM_PADDING
    )
  }

  function heightFor(state: SheetState) {
    if (state === 'closed') return CLOSED_HEIGHT
    if (state === 'peek') return rowsHeight(1)
    return rowsHeight(TILES_PER_ROW)
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
    const max = rowsHeight(TILES_PER_ROW)
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
    const candidates: [SheetState, number][] = [
      ['closed', CLOSED_HEIGHT],
      ['peek', rowsHeight(1)],
      ['open', rowsHeight(TILES_PER_ROW)],
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        <div style={{ position: 'relative', width: 'min(72vw, 300px)', aspectRatio: '1' }}>
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
            <AvatarImage avatar={avatar} diameter={270} accessoryId={equippedAccessoryId} />
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
            padding: '20px 0 12px',
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

        {sheetState === 'open' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: `${ROW_TOP_PADDING}px ${ROW_SIDE_PADDING}px ${ROW_BOTTOM_PADDING}px`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: TILE_GAP,
              alignContent: 'flex-start',
            }}
          >
            {ACCESSORIES.map((item, i) => {
              // Concentric with the sheet's rounded corners on whichever
              // edge of the row this tile sits against — the first/last
              // tile of each wrapped row, not just the very first/last
              // accessory overall.
              const isEdge =
                i % TILES_PER_ROW === 0 ||
                (i + 1) % TILES_PER_ROW === 0 ||
                i === ACCESSORIES.length - 1
              return (
                <AccessoryTile
                  key={item.id}
                  item={item}
                  equipped={equippedAccessoryId === item.id}
                  uiLang={uiLang}
                  size={tileSize()}
                  radius={isEdge ? CONCENTRIC_TILE_RADIUS : DEFAULT_TILE_RADIUS}
                  onToggle={onToggle}
                />
              )
            })}
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
              gap: TILE_GAP,
              padding: `${ROW_TOP_PADDING}px ${ROW_SIDE_PADDING}px ${ROW_BOTTOM_PADDING}px`,
            }}
          >
            {ACCESSORIES.map((item, i) => {
              // The row never wraps here, so only the very first/last
              // accessory sits at the sheet's left/right edge.
              const isEdge = i === 0 || i === ACCESSORIES.length - 1
              return (
                <AccessoryTile
                  key={item.id}
                  item={item}
                  equipped={equippedAccessoryId === item.id}
                  uiLang={uiLang}
                  size={tileSize()}
                  radius={isEdge ? CONCENTRIC_TILE_RADIUS : DEFAULT_TILE_RADIUS}
                  onToggle={onToggle}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
