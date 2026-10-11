import { Button } from '@base-ui/react/button'
import type { MouseEvent } from 'react'
import { accentText, COLOR_MAP, type AvatarKey, type WordList } from '../data/constants'
import { LANGUAGE_CODES, listsCountText, t, wordsCountText } from '../data/i18n'
import type { UiLang } from '../data/i18n'
import { ArrowBack, Bloom, Check, Plus, Trash } from '../icons/icons'
import { useSwipeBack } from '../lib/useSwipeBack'

interface ListsProps {
  lists: WordList[]
  activeListId: string | null
  avatar: AvatarKey
  uiLang: UiLang
  onBack: () => void
  onAddNew: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function Lists({
  lists,
  activeListId,
  avatar,
  uiLang,
  onBack,
  onAddNew,
  onSelect,
  onDelete,
}: ListsProps) {
  useSwipeBack(onBack)
  const accent = accentText(avatar)

  function handleDelete(e: MouseEvent, id: string) {
    e.stopPropagation()
    onDelete(id)
  }

  return (
    <div
      style={{
        padding: '16px 16px calc(18px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        minHeight: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h-font" style={{ fontSize: 30, color: 'var(--ink)' }}>
            {t(uiLang, 'myLists')}
          </h2>
          <div className="m-font" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
            {listsCountText(uiLang, lists.length)}
          </div>
        </div>
        <Button className="back-btn" onClick={onBack}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>
      <div
        data-testid="lists-scroll-area"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          // Without this, a flex item defaults to min-height:auto — its
          // content's intrinsic size, not 0 — so with enough lists this
          // area wouldn't scroll internally at all; it'd just push the
          // "Add a new list" button below past the screen's own bottom
          // edge instead, clipping its box-shadow where #screen's own
          // overflow-y:auto cuts off (ink overflow like a hard
          // box-shadow doesn't get its own extra scroll room there).
          minHeight: 0,
          overflowY: 'auto',
          // Without this, overflow-x computes to auto (not its own
          // 'visible' default) once overflow-y is non-visible — turning
          // a few stray px of width (scrollbar gutter math, sub-pixel
          // rounding) into a real, swipeable horizontal scroll confined
          // to this one area, invisible to a page-level overflow check
          // since #screen's own overflow-x:hidden only clips at the
          // document level, not inside a nested scroll container like
          // this one.
          overflowX: 'hidden',
          // The active card nudges 4px right (translateX below) as a
          // selection affordance. That pushed it 4px past this
          // container's own right edge, where the new overflow-x:hidden
          // above hard-clipped it — flattening its right corner and
          // border. Widening the clip box by 4px on each side (negative
          // margin) while pulling the content back in by the same amount
          // (matching padding) gives the nudge room without moving any
          // card's resting position or reopening the real scroll bug.
          margin: '0 -4px',
          padding: '0 4px',
        }}
      >
        {lists.length ? (
          lists.map((list) => {
            const active = activeListId === list.id
            return (
              <div
                key={list.id}
                className="card"
                onClick={() => onSelect(list.id)}
                style={{
                  background: COLOR_MAP[list.color] ?? '#FFB0C8',
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transform: active ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 120ms',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: active ? 'var(--ink)' : 'var(--paper)',
                    border: 'var(--border-thin)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 120ms',
                  }}
                >
                  {active ? (
                    <Check size={22} color="#fff" strokeWidth={4} />
                  ) : (
                    <Bloom size={26} color="#241F3D" center={COLOR_MAP[list.color]} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="h-font"
                    style={{
                      fontSize: 19,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {list.name}
                  </div>
                  <div
                    className="m-font"
                    style={{ fontSize: 12, color: 'var(--ink)', opacity: 0.7, marginTop: 2 }}
                  >
                    {wordsCountText(uiLang, list.words.length)} ·{' '}
                    {LANGUAGE_CODES[list.from] ?? 'SV'} → {LANGUAGE_CODES[list.to] ?? 'EN'}
                  </div>
                </div>
                <Button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    flexShrink: 0,
                  }}
                  onClick={(e) => handleDelete(e, list.id)}
                >
                  <Trash size={16} color="#241F3D" />
                </Button>
              </div>
            )
          })
        ) : (
          <div
            className="b-font"
            style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-soft)' }}
          >
            {t(uiLang, 'noListsYet')}
          </div>
        )}
      </div>
      <Button className="btn btn-primary btn-lg btn-full" onClick={onAddNew}>
        <Plus size={18} color={accent} /> {t(uiLang, 'addNewList')}
      </Button>
    </div>
  )
}
