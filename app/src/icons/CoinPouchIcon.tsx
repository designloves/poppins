import { useId } from 'react'
import { coinPouchMarkup } from './coinPouchMarkup'

export function CoinPouchIcon({ size }: { size: number }) {
  // useId() is React's built-in replacement for the legacy app's manual
  // `_coinSvgUid++` counter — same purpose (a unique id per rendered
  // instance so this icon's gradients never collide with another one
  // rendered at the same time), idiomatic in React instead of a global.
  const uid = useId()
  return (
    <span
      style={{ display: 'flex', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: coinPouchMarkup(size, uid) }}
    />
  )
}
