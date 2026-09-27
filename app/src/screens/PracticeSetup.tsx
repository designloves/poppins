import { Button } from '@base-ui/react/button'
import { langHelpers, type WordList } from '../data/constants'
import { langName, t, type UiLang } from '../data/i18n'
import { ArrowBack } from '../icons/icons'
import { Mascot } from '../icons/Mascot'

interface PracticeSetupProps {
  list: WordList
  uiLang: UiLang
  onBack: () => void
  onStart: (reversed: boolean) => void
}

export function PracticeSetup({ list, uiLang, onBack, onStart }: PracticeSetupProps) {
  const lh = langHelpers(list, false)
  const srcLang = langName(uiLang, lh.from)
  const tgtLang = langName(uiLang, lh.to)

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
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button className="back-btn" onClick={onBack}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Mascot size={90} mood="thinking" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 className="h-font" style={{ fontSize: 26, color: 'var(--ink)' }}>
            {t(uiLang, 'whichLangAnswer')}
          </h2>
          <p className="b-font" style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 6 }}>
            {t(uiLang, 'starting', { name: list.name })}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button className="btn btn-primary btn-lg btn-full" onClick={() => onStart(false)}>
            {t(uiLang, 'answerIn', { lang: tgtLang })}
          </Button>
          <Button className="btn btn-secondary btn-lg btn-full" onClick={() => onStart(true)}>
            {t(uiLang, 'answerIn', { lang: srcLang })}
          </Button>
        </div>
      </div>
    </div>
  )
}
