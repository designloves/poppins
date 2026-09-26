import { Button } from '@base-ui/react/button'
import { ArrowBack } from '../icons/icons'
import type { Screen } from '../state/useAppState'

// Every screen Home can navigate to that hasn't been ported yet. Proves
// navigation is wired end to end without pretending those screens exist.
export function Placeholder({
  title,
  navigate,
}: {
  title: string
  navigate: (screen: Screen) => void
}) {
  return (
    <div
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}
    >
      <Button
        className="btn btn-tertiary"
        style={{ alignSelf: 'flex-start' }}
        onClick={() => navigate('home')}
      >
        <ArrowBack size={16} color="#241F3D" /> Back
      </Button>
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 className="h-font" style={{ fontSize: 28, color: 'var(--ink)' }}>
          {title}
        </h2>
        <p className="b-font" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          Not ported yet — coming in a follow-up PR.
        </p>
      </div>
    </div>
  )
}
