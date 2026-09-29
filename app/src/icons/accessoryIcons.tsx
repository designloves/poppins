import type { ReactNode } from 'react'
import { Fish } from './Fish'
import { PartyHat } from './PartyHat'

// Looked up by accessory id (app/src/data/accessories.ts) wherever an
// accessory needs to render — worn on an avatar or sitting on a shelf.
export const ACCESSORY_ICONS: Record<string, (size: number) => ReactNode> = {
  'party-hat': (size) => <PartyHat size={size} />,
  'fish-hairclip': (size) => <Fish size={size} />,
}
