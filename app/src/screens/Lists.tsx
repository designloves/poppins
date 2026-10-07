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
        style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}
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
