import { AVATAR_ASSET_VERSION, type AvatarKey } from '../data/constants'
import { AccessoryOverlay } from './AccessoryOverlay'

export function AvatarImage({
  avatar,
  diameter,
  accessoryId,
}: {
  avatar: AvatarKey
  diameter: number
  accessoryId?: string | null
}) {
  return (
    <>
      <img
        src={`avatars/${avatar}.png?v=${AVATAR_ASSET_VERSION}`}
        alt={avatar}
        width={diameter}
        height={diameter}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '122%',
          maxWidth: '122%',
          height: 'auto',
          display: 'block',
        }}
      />
      {accessoryId && <AccessoryOverlay accessoryId={accessoryId} diameter={diameter} />}
    </>
  )
}
