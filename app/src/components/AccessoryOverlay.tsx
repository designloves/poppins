import { ACCESSORY_ICONS } from '../icons/accessoryIcons'

// Positions a worn accessory over an avatar image of the given
// diameter — scaled and perched relative to it, so it looks right at
// every size the avatar itself is already shown at.
export function AccessoryOverlay({
  accessoryId,
  diameter,
}: {
  accessoryId: string
  diameter: number
}) {
  const render = ACCESSORY_ICONS[accessoryId]
  if (!render) return null
  return (
    <div
      data-testid="accessory-overlay"
      style={{
        position: 'absolute',
        top: -diameter * 0.3,
        left: '50%',
        transform: 'translateX(-50%) rotate(-8deg)',
        pointerEvents: 'none',
      }}
    >
      {render(diameter * 0.62)}
    </div>
  )
}
