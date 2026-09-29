import type { PointerEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { useLayoutEffect, useRef, useState } from 'react'
import { AvatarImage } from '../components/AvatarImage'
import { ACCESSORIES } from '../data/accessories'
import type { AvatarKey } from '../data/constants'
import { accessoryName, t, type UiLang } from '../data/i18n'
import { ArrowBack, Check } from '../icons/icons'
import { ACCESSORY_ICONS } from '../icons/accessoryIcons'

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
// Tall enough for one row of accessory tiles plus the handle, so the
// character stays the main thing on screen most of the time.
const PEEK_HEIGHT = 172
// The "fully open" state is a fraction of the whole screen's height
// rather than a fixed px value, so it scales with the device.
const OPEN_FRACTION = 0.5
// Below this many px of pointer movement, a press-and-release on the
// handle is treated as a tap (cycling open/peek/closed) rather than a
// drag (snapping to whichever of the three it ended up closest to).
const DRAG_THRESHOLD = 6

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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        <div style={{ position: 'relative', width: 'min(72vw, 300px)', aspectRatio: '1' }}>
          <AvatarImage avatar={avatar} diameter={270} accessoryId={equippedAccessoryId} />
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

        {sheetState === 'open' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '4px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {ACCESSORIES.map((item) => {
              const equipped = equippedAccessoryId === item.id
              const renderIcon = ACCESSORY_ICONS[item.id]
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--paper-alt)',
                      border: 'var(--border-thin)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {renderIcon?.(36)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-font" style={{ fontSize: 17, color: 'var(--ink)' }}>
                      {accessoryName(uiLang, item.id)}
                    </div>
                    <div className="m-font" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      {item.cost === 0 ? t(uiLang, 'free') : item.cost}
                    </div>
                  </div>
                  <Button
                    id={`accessory-toggle-${item.id}`}
                    className={equipped ? 'btn btn-secondary' : 'btn btn-primary'}
                    onClick={() => onToggle(item.id)}
                  >
                    {equipped ? t(uiLang, 'takeOff') : t(uiLang, 'wearIt')}
                  </Button>
                </div>
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
              gap: 12,
              padding: '0 16px 12px',
            }}
          >
            {ACCESSORIES.map((item) => {
              const equipped = equippedAccessoryId === item.id
              const renderIcon = ACCESSORY_ICONS[item.id]
              return (
                <Button
                  key={item.id}
                  id={`accessory-tile-${item.id}`}
                  title={accessoryName(uiLang, item.id)}
                  onClick={() => onToggle(item.id)}
                  style={{
                    position: 'relative',
                    overflow: 'visible',
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    background: 'var(--paper-alt)',
                    border: equipped ? '3px solid var(--ink)' : 'var(--border-thin)',
                    boxShadow: '0 3px 0 var(--ink)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderIcon?.(44)}
                  {equipped && (
                    <div
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
            })}
          </div>
        )}
      </div>
    </div>
  )
}
