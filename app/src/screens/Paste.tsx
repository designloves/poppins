import { Button } from '@base-ui/react/button'
import type { ChangeEvent, ReactNode } from 'react'
import { accentText, type AvatarKey, type Word } from '../data/constants'
import { LANGUAGE_CODES, langName, t, type UiLang } from '../data/i18n'
import type { LangPair } from '../lib/pasteParsing'
import { ArrowBack, ArrowRight, Check, Spark } from '../icons/icons'

const LANGUAGE_ORDER = Object.keys(LANGUAGE_CODES)

function interpolateNode(template: string, key: string, node: ReactNode): ReactNode {
  const [before, after] = template.split(`{${key}}`)
  return (
    <>
      {before}
      {node}
      {after}
    </>
  )
}

interface PasteProps {
  avatar: AvatarKey
  uiLang: UiLang
  pasteName: string
  setPasteName: (v: string) => void
  pasteText: string
  setPasteText: (v: string) => void
  pasteParsed: Word[]
  pasteStep: 'paste' | 'review'
  editingListId: string | null
  pastePair: LangPair
  pasteLoading: boolean
  onClose: () => void
  onChangeFrom: (code: string) => void
  onChangeTo: (code: string) => void
  onParse: () => void
  onBack: () => void
  onSave: () => void
}

export function Paste({
  avatar,
  uiLang,
  pasteName,
  setPasteName,
  pasteText,
  setPasteText,
  pasteParsed,
  pasteStep,
  editingListId,
  pastePair,
  pasteLoading,
  onClose,
  onChangeFrom,
  onChangeTo,
  onParse,
  onBack,
  onSave,
}: PasteProps) {
  const accent = accentText(avatar)

  if (pasteStep === 'paste') {
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
          <h2 className="h-font" style={{ fontSize: 28, color: 'var(--ink)' }}>
            {editingListId ? t(uiLang, 'editList') : t(uiLang, 'pasteWordList')}
          </h2>
          <Button id="paste-close" className="back-btn" onClick={onClose}>
            <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
          </Button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <p className="b-font" style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
            {t(uiLang, 'pasteInstructions')}{' '}
            {['=', '-', ':', '→'].map((sym) => (
              <code
                key={sym}
                style={{
                  fontFamily: 'var(--m-font)',
                  background: 'var(--paper-alt)',
                  padding: '1px 6px',
                  borderRadius: 6,
                }}
              >
                {sym}
              </code>
            ))}
          </p>
          <input
            id="paste-name"
            className="inp inp-header"
            placeholder={t(uiLang, 'listNamePlaceholder')}
            value={pasteName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPasteName(e.target.value)}
          />
          <textarea
            id="paste-text"
            className="inp inp-mono"
            rows={9}
            placeholder={t(uiLang, 'wordTranslationPlaceholder')}
            value={pasteText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPasteText(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button id="paste-cancel" className="btn btn-tertiary" onClick={onClose}>
            {t(uiLang, 'cancel')}
          </Button>
          <Button
            id="paste-parse"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!pasteText.trim() || pasteLoading}
            onClick={onParse}
          >
            {pasteLoading ? (
              t(uiLang, 'translating')
            ) : (
              <>
                <Spark size={16} color={accent} /> {t(uiLang, 'sortItOut')}
              </>
            )}
          </Button>
        </div>
      </div>
    )
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
        <h2 className="h-font" style={{ fontSize: 28, color: 'var(--ink)' }}>
          {t(uiLang, 'lookRight')}
        </h2>
        <Button id="paste-close" className="back-btn" onClick={onClose}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>
      <div
        style={{
          background: 'var(--mint-soft)',
          border: 'var(--border-thin)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Check size={18} color="#241F3D" strokeWidth={4} />
        <span className="b-font" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
          {pasteLoading
            ? t(uiLang, 'translating')
            : interpolateNode(t(uiLang, 'foundWords'), 'n', <strong>{pasteParsed.length}</strong>)}
        </span>
      </div>
      <div>
        <div className="label-caps" style={{ marginBottom: 6 }}>
          {t(uiLang, 'language')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            id="paste-from"
            className="inp"
            style={{ flex: 1, padding: '10px 12px', fontSize: 14 }}
            disabled={pasteLoading}
            value={pastePair.from}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeFrom(e.target.value)}
          >
            {LANGUAGE_ORDER.map((code) => (
              <option key={code} value={code}>
                {langName(uiLang, code)}
              </option>
            ))}
          </select>
          <ArrowRight size={16} color="#241F3D" />
          <select
            id="paste-to"
            className="inp"
            style={{ flex: 1, padding: '10px 12px', fontSize: 14 }}
            disabled={pasteLoading}
            value={pastePair.to}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeTo(e.target.value)}
          >
            {LANGUAGE_ORDER.map((code) => (
              <option key={code} value={code}>
                {langName(uiLang, code)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pasteParsed.map((w, i) => (
          <div
            key={i}
            className="b-font"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--paper)',
              border: 'var(--border-thin)',
              borderRadius: 14,
              padding: '10px 14px',
            }}
          >
            <span style={{ color: 'var(--ink)', fontWeight: 700, flex: 1 }}>
              {w[pastePair.from] || w.sv}
            </span>
            <ArrowRight size={14} color="#6B638A" />
            <span style={{ color: 'var(--ink-soft)', flex: 1 }}>{w[pastePair.to] || w.en}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button id="paste-back" className="btn btn-tertiary" onClick={onBack}>
          {t(uiLang, 'edit')}
        </Button>
        <Button
          id="paste-save"
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={!pasteParsed.length || pasteLoading}
          onClick={onSave}
        >
          {editingListId ? t(uiLang, 'saveChanges') : t(uiLang, 'saveList')}{' '}
          <ArrowRight size={16} color={accent} />
        </Button>
      </div>
    </div>
  )
}
