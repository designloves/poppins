import { Button } from '@base-ui/react/button'
import { AvatarImage } from '../components/AvatarImage'
import { AVATAR_PANEL, CHARACTERS, type AvatarKey } from '../data/constants'
import { t, type UiLang } from '../data/i18n'
import { ArrowBack, Heart } from '../icons/icons'
import type { CurrentUser } from '../lib/auth'
import { useSwipeBack } from '../lib/useSwipeBack'

interface SettingsProps {
  avatar: AvatarKey
  avatarChanging: boolean
  uiLang: UiLang
  soundOn: boolean
  pronunciationOn: boolean
  equippedAccessoryId: string | null
  currentUser: CurrentUser | null
  onBack: () => void
  onLogin: () => void
  onLogout: () => void
  onSetAvatar: (avatar: AvatarKey) => void
  onSetUiLang: (uiLang: UiLang) => void
  onToggleSound: () => void
  onTogglePronunciation: () => void
}

export function Settings({
  avatar,
  avatarChanging,
  uiLang,
  soundOn,
  pronunciationOn,
  equippedAccessoryId,
  currentUser,
  onBack,
  onLogin,
  onLogout,
  onSetAvatar,
  onSetUiLang,
  onToggleSound,
  onTogglePronunciation,
}: SettingsProps) {
  useSwipeBack(onBack)
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 -12px',
        }}
      >
        <h2 className="h-font" style={{ fontSize: 30, color: 'var(--ink)' }}>
          {t(uiLang, 'settingsTitle')}
        </h2>
        <Button id="settings-close" className="back-btn" onClick={onBack}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>

      <div className="card" style={{ background: AVATAR_PANEL[avatar] ?? 'var(--pink-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              position: 'relative',
              overflow: 'visible',
              width: 64,
              height: 64,
              borderRadius: 999,
              background: 'var(--paper)',
              border: 'var(--border-thin)',
              flexShrink: 0,
            }}
          >
            <AvatarImage avatar={avatar} diameter={64} accessoryId={equippedAccessoryId} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h-font" style={{ fontSize: 18, color: 'var(--ink)' }}>
              {t(uiLang, 'hejThere')}
            </div>
            <div className="m-font" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {currentUser?.email ?? t(uiLang, 'notSignedIn')}
            </div>
          </div>
          {!currentUser && (
            <Button
              id="settings-login"
              className="btn btn-primary"
              style={{ flexShrink: 0, padding: '10px 16px', fontSize: 14 }}
              onClick={onLogin}
            >
              {t(uiLang, 'logIn')}
            </Button>
          )}
        </div>
      </div>

      {currentUser && (
        <Button id="settings-logout" className="btn btn-tertiary btn-full" onClick={onLogout}>
          {t(uiLang, 'logOut')}
        </Button>
      )}

      <div>
        <div className="label-caps" style={{ marginBottom: 8 }}>
          {t(uiLang, 'avatar')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
          {CHARACTERS.map((key) => (
            <Button
              key={key}
              className="avatar-swatch"
              title={key}
              onClick={() => onSetAvatar(key)}
              style={{
                position: 'relative',
                overflow: 'visible',
                width: 52,
                height: 52,
                borderRadius: 999,
                background: 'var(--paper-alt)',
                border: avatar === key ? '3px solid var(--ink)' : 'var(--border-thin)',
                cursor: 'pointer',
                padding: 0,
                boxShadow: '0 3px 0 var(--ink)',
                flexShrink: 0,
              }}
            >
              <AvatarImage avatar={key} diameter={52} />
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="label-caps" style={{ marginBottom: 8 }}>
          {t(uiLang, 'appLanguage')}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            className="ui-lang-btn b-font"
            onClick={() => onSetUiLang('sv')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 'var(--radius)',
              border: uiLang === 'sv' ? 'var(--border)' : 'var(--border-thin)',
              background: uiLang === 'sv' ? 'var(--butter-soft)' : 'var(--paper)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              boxShadow: uiLang === 'sv' ? '0 3px 0 var(--ink)' : 'none',
            }}
          >
            Svenska
          </Button>
          <Button
            className="ui-lang-btn b-font"
            onClick={() => onSetUiLang('en')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 'var(--radius)',
              border: uiLang === 'en' ? 'var(--border)' : 'var(--border-thin)',
              background: uiLang === 'en' ? 'var(--butter-soft)' : 'var(--paper)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              boxShadow: uiLang === 'en' ? '0 3px 0 var(--ink)' : 'none',
            }}
          >
            English
          </Button>
        </div>
      </div>

      <div>
        <div className="label-caps" style={{ marginBottom: 8 }}>
          {t(uiLang, 'practice')}
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            className="b-font"
            style={{
              padding: '14px 16px',
              borderBottom: '1.5px solid var(--paper-alt)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {t(uiLang, 'soundEffects')}
            </span>
            <Button
              id="setting-sound"
              className="switch"
              data-on={soundOn}
              onClick={onToggleSound}
            />
          </div>
          <div
            className="b-font"
            style={{
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {t(uiLang, 'showPronunciation')}
            </span>
            <Button
              id="setting-pronunciation"
              className="switch"
              data-on={pronunciationOn}
              onClick={onTogglePronunciation}
            />
          </div>
        </div>
      </div>

      <div
        className="m-font"
        style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)', marginTop: 'auto' }}
      >
        {t(uiLang, 'madeWith')} <Heart size={12} color="#B583E8" />
      </div>

      {avatarChanging && (
        <div
          data-testid="avatar-transition"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Solid the instant it appears — masking the reload is the
            // whole point, so only the avatar itself (below) animates in;
            // fading the background too would make it translucent for
            // part of that window, defeating it.
            background: AVATAR_PANEL[avatar] ?? 'var(--pink-soft)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 140,
              height: 140,
              animation: 'pop-in 200ms ease-out',
            }}
          >
            <AvatarImage avatar={avatar} diameter={140} accessoryId={equippedAccessoryId} />
          </div>
        </div>
      )}
    </div>
  )
}
