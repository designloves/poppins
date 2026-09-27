import { Button } from '@base-ui/react/button'
import { AvatarImage } from '../components/AvatarImage'
import { ACCESSORIES } from '../data/accessories'
import type { AvatarKey } from '../data/constants'
import { accessoryName, t, type UiLang } from '../data/i18n'
import { ArrowBack } from '../icons/icons'
import { ACCESSORY_ICONS } from '../icons/accessoryIcons'

interface DressingRoomProps {
  avatar: AvatarKey
  uiLang: UiLang
  equippedAccessoryId: string | null
  onBack: () => void
  onToggle: (id: string) => void
}

export function DressingRoom({
  avatar,
  uiLang,
  equippedAccessoryId,
  onBack,
  onToggle,
}: DressingRoomProps) {
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
        <h2 className="h-font" style={{ fontSize: 30, color: 'var(--ink)' }}>
          {t(uiLang, 'dressingRoom')}
        </h2>
        <Button id="dressing-room-close" className="back-btn" onClick={onBack}>
          <ArrowBack size={18} color="#241F3D" /> {t(uiLang, 'back')}
        </Button>
      </div>

      <div className="card-lg" style={{ display: 'flex', justifyContent: 'center', padding: 36 }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <AvatarImage avatar={avatar} diameter={120} accessoryId={equippedAccessoryId} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ACCESSORIES.map((item) => {
          const equipped = equippedAccessoryId === item.id
          const renderIcon = ACCESSORY_ICONS[item.id]
          return (
            <div
              key={item.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
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
    </div>
  )
}
