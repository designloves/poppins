import { Button } from '@base-ui/react/button'
import { ArrowRight, Confetti, Spark } from '../icons/icons'
import { Mascot } from '../icons/Mascot'
import { accentText, type AvatarKey } from '../data/constants'
import { t, type UiLang } from '../data/i18n'
import { useSwipeBack } from '../lib/useSwipeBack'
import type { QuizResult } from '../state/useAppState'

const CONFETTI_COLORS = ['#FFB0C8', '#F2EE5B', '#8AD7FF', '#A8F08C', '#B583E8']

interface DoneProps {
  result: QuizResult | null
  avatar: AvatarKey
  uiLang: UiLang
  onHome: () => void
  onPlayAgain: () => void
}

export function Done({ result, avatar, uiLang, onHome, onPlayAgain }: DoneProps) {
  useSwipeBack(onHome)
  const r = result ?? { right: 0, wrong: 0, total: 1 }
  const pct = Math.round((r.right / r.total) * 100)
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1
  const accent = accentText(avatar)

  const resultTemplate = t(uiLang, 'resultLine', { pct: String(pct), fraction: '{fraction}' })
  const [beforeFraction, afterFraction] = resultTemplate.split('{fraction}')

  return (
    <div
      style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 18,
        minHeight: '100%',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: `${(i * 37) % 100}%`,
            animation: `greta-fall 3s ${(i * 80) % 1500}ms infinite linear`,
          }}
        >
          <Confetti
            size={10}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            rotation={(i * 47) % 360}
          />
        </div>
      ))}

      <Mascot size={150} mood="proud" />

      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: 50,
              height: 50,
              borderRadius: 999,
              background: s <= stars ? 'var(--butter)' : 'var(--paper-alt)',
              border: 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${s <= stars ? 1 : 0.85})`,
              boxShadow: s <= stars ? '0 4px 0 var(--ink)' : 'none',
            }}
          >
            <Spark size={26} color={s <= stars ? '#241F3D' : '#6B638A'} />
          </div>
        ))}
      </div>

      <div>
        <h1
          className="h-font"
          style={{ fontSize: 44, color: 'var(--ink)', letterSpacing: '-.03em', lineHeight: 1 }}
        >
          {t(uiLang, 'youDidIt')}
        </h1>
        <p className="b-font" style={{ color: 'var(--ink-soft)', fontSize: 16, marginTop: 8 }}>
          {beforeFraction}
          <span className="m-font">
            {r.right}/{r.total}
          </span>
          {afterFraction}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <Button id="done-home" className="btn btn-tertiary" onClick={onHome}>
          {t(uiLang, 'home')}
        </Button>
        <Button
          id="done-again"
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={onPlayAgain}
        >
          {t(uiLang, 'playAgain')} <ArrowRight size={16} color={accent} />
        </Button>
      </div>
    </div>
  )
}
