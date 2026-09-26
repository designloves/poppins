import { useId } from 'react'
import { coinBackMarkup, coinFrontMarkup } from '../icons/coinFaceMarkup'
import { Spark } from '../icons/icons'

export const COIN_FLIGHT_MS = 750
export const COIN_ICON_SIZE = 32

export interface CoinFlightData {
  id: number
  /** origin position, relative to the #frame container */
  ox: number
  oy: number
  /** destination offset from origin, relative to the #frame container */
  dx: number
  dy: number
}

// One flying coin: a brief spark "poof" at the origin, then the coin
// itself flies to the pouch while genuinely flipping between its two
// faces (a 3D Y-axis spin, not a flat 2D rotate) via a perspective
// wrapper + backface-visibility, same technique as the legacy app.
export function CoinFlight({ ox, oy, dx, dy }: CoinFlightData) {
  const frontUid = useId()
  const backUid = useId()
  const half = COIN_ICON_SIZE / 2

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: ox - half,
          top: oy - half,
          width: COIN_ICON_SIZE,
          height: COIN_ICON_SIZE,
          animation: 'coin-poof 420ms ease-out both',
          pointerEvents: 'none',
        }}
      >
        <Spark size={COIN_ICON_SIZE} color="#FFD666" />
      </div>
      <div
        style={
          {
            position: 'absolute',
            left: ox - half,
            top: oy - half,
            width: COIN_ICON_SIZE,
            height: COIN_ICON_SIZE,
            perspective: 600,
            '--cdx': `${dx}px`,
            '--cdy': `${dy}px`,
            animation: `coin-fly-outer ${COIN_FLIGHT_MS}ms cubic-bezier(.3,.55,.4,1) both`,
            pointerEvents: 'none',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `coin-spin-inner ${COIN_FLIGHT_MS}ms linear both`,
          }}
        >
          <div
            className="coin-face"
            dangerouslySetInnerHTML={{ __html: coinFrontMarkup(COIN_ICON_SIZE, frontUid) }}
          />
          <div
            className="coin-face coin-face-back"
            dangerouslySetInnerHTML={{ __html: coinBackMarkup(COIN_ICON_SIZE, backUid) }}
          />
        </div>
      </div>
    </>
  )
}
