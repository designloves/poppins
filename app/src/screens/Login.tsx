import { Button } from '@base-ui/react/button'
import type { ChangeEvent, ReactNode } from 'react'
import { accentText, type AvatarKey } from '../data/constants'
import { t, type UiLang } from '../data/i18n'
import { ArrowRight, Spark } from '../icons/icons'
import { Mascot } from '../icons/Mascot'

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

interface LoginProps {
  avatar: AvatarKey
  uiLang: UiLang
  loginEmail: string
  loginSent: boolean
  loginErr: string
  loginLoading: boolean
  onChangeEmail: (v: string) => void
  onSubmit: () => void
  onSkip: () => void
}

export function Login({
  avatar,
  uiLang,
  loginEmail,
  loginSent,
  loginErr,
  loginLoading,
  onChangeEmail,
  onSubmit,
  onSkip,
}: LoginProps) {
  const accent = accentText(avatar)

  if (!loginSent) {
    return (
      <div
        style={{
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 20,
          minHeight: '100%',
          justifyContent: 'center',
        }}
      >
        <Mascot size={140} mood="happy" />
        <div>
          <h1
            className="h-font"
            style={{ fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {t(uiLang, 'loginGreeting')}
          </h1>
          <p
            className="b-font"
            style={{ color: 'var(--ink-soft)', fontSize: 16, marginTop: 8, maxWidth: 260 }}
          >
            {t(uiLang, 'loginIntro')}
          </p>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            id="login-email"
            className="inp"
            type="email"
            placeholder="you@email.com"
            value={loginEmail}
            autoComplete="email"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeEmail(e.target.value)}
          />
          {loginErr && <div style={{ color: 'var(--wrong)', fontSize: 14 }}>{loginErr}</div>}
          <Button
            id="login-submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loginLoading}
            onClick={onSubmit}
          >
            <Spark size={18} color={accent} />{' '}
            {loginLoading ? t(uiLang, 'sending') : t(uiLang, 'sendMagicLink')}
          </Button>
          <Button
            id="login-skip"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-soft)',
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: 12,
            }}
            onClick={onSkip}
          >
            {t(uiLang, 'skipTryFirst')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 22,
        minHeight: '100%',
        justifyContent: 'center',
      }}
    >
      <Mascot size={140} mood="cheer" />
      <div>
        <h1
          className="h-font"
          style={{
            fontSize: 36,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {t(uiLang, 'checkInbox')}
        </h1>
        <p
          className="b-font"
          style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 12, maxWidth: 280 }}
        >
          {interpolateNode(
            t(uiLang, 'magicLinkSent'),
            'email',
            <strong style={{ color: 'var(--ink)' }}>{loginEmail}</strong>,
          )}
        </p>
      </div>
      <Button id="login-skip" className="btn btn-secondary" onClick={onSkip}>
        {t(uiLang, 'clickedItLetMeIn')} <ArrowRight size={16} color="#241F3D" />
      </Button>
    </div>
  )
}
