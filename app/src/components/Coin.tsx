import { useId } from 'react'
import { coinFrontMarkup } from '../icons/coinFaceMarkup'

// A single static coin glyph — the same art CoinFlight uses for one face
// of the flying coin, reused here wherever a price just needs a small
// icon next to a number (e.g. "0 🪙") rather than the whole animated
// flight or the coin-pouch-plus-count combo CoinPouch renders.
export function Coin({ size }: { size: number }) {
  const uid = useId()
  return (
    <span
      style={{ display: 'inline-flex', width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: coinFrontMarkup(size, uid) }}
    />
  )
}
