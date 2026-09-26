import { CoinPouchIcon } from '../icons/CoinPouchIcon'
import { COIN_BUMP_MS } from '../data/constants'

export function CoinPouch({ coins, bump }: { coins: number; bump: boolean }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transformOrigin: 'center',
        animation: bump ? `coin-pouch-bump ${COIN_BUMP_MS}ms ease-out both` : 'none',
      }}
    >
      <CoinPouchIcon size={40} />
      <span
        data-testid="coin-count"
        className="m-font"
        style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}
      >
        {coins}
      </span>
    </span>
  )
}
