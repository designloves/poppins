import { Bloom, Confetti, Curl, Heart, Spark } from '../icons/icons'

export type ScreenFxKind = 'confetti' | 'hearts' | 'fireworks' | 'curls' | 'flowers'

const COLORS = ['#B583E8', '#F2EE5B', '#8AD7FF', '#A8F08C', '#FFB0C8']

// Full-screen celebration overlay shown briefly after a correct answer.
// Ported from the legacy app's screenFX() — same deterministic per-piece
// arithmetic (not Math.random()) so every piece's position/timing/color
// is reproducible, just rendered as real icon components instead of
// SVG.* innerHTML strings.
export function ScreenFx({ kind }: { kind: ScreenFxKind }) {
  if (kind === 'confetti') {
    return (
      <>
        {Array.from({ length: 30 }).map((_, i) => {
          const left = (i * 33) % 100
          const delay = (i * 23) % 450
          const dur = 1100 + ((i * 37) % 500)
          const rot = (i * 47) % 360
          const color = COLORS[i % COLORS.length]
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: -24,
                left: `${left}%`,
                animation: `greta-fx-fall ${dur}ms ${delay}ms ease-in both`,
              }}
            >
              <Confetti size={11} color={color} rotation={rot} />
            </div>
          )
        })}
      </>
    )
  }

  if (kind === 'hearts') {
    return (
      <>
        {Array.from({ length: 16 }).map((_, i) => {
          const left = 4 + ((i * 19) % 92)
          const delay = (i * 55) % 400
          const dur = 1100 + ((i * 41) % 450)
          const size = 16 + (i % 3) * 6
          const color = COLORS[i % COLORS.length]
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: '6%',
                left: `${left}%`,
                animation: `greta-heart-rise ${dur}ms ${delay}ms ease-out both`,
              }}
            >
              <Heart size={size} color={color} />
            </div>
          )
        })}
      </>
    )
  }

  if (kind === 'fireworks') {
    const origins = [
      { x: 20, y: 32 },
      { x: 78, y: 24 },
      { x: 48, y: 48 },
    ]
    return (
      <>
        {origins.map((o, oi) => (
          <div key={oi} style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%` }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const ang = (i / 10) * Math.PI * 2
              const dist = 55 + oi * 8
              const dx = Math.round(Math.cos(ang) * dist)
              const dy = Math.round(Math.sin(ang) * dist)
              const color = COLORS[(i + oi) % COLORS.length]
              return (
                <div
                  key={i}
                  style={
                    {
                      position: 'absolute',
                      '--dx': `${dx}px`,
                      '--dy': `${dy}px`,
                      animation: `greta-firework-spark 800ms ease-out ${oi * 220 + i * 8}ms both`,
                    } as React.CSSProperties
                  }
                >
                  <Spark size={16} color={color} />
                </div>
              )
            })}
          </div>
        ))}
      </>
    )
  }

  if (kind === 'curls') {
    return (
      <>
        {Array.from({ length: 20 }).map((_, i) => {
          const left = (i * 37) % 100
          const delay = (i * 33) % 450
          const dur = 1200 + ((i * 43) % 500)
          const rot = (i * 53) % 360
          const color = COLORS[i % COLORS.length]
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: -24,
                left: `${left}%`,
                animation: `greta-fx-fall ${dur}ms ${delay}ms ease-in both`,
              }}
            >
              <Curl size={22} color={color} rotation={rot} />
            </div>
          )
        })}
      </>
    )
  }

  // flowers
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const left = (i * 39) % 100
        const delay = (i * 31) % 450
        const dur = 1200 + ((i * 53) % 550)
        const color = COLORS[i % COLORS.length]
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -24,
              left: `${left}%`,
              animation: `greta-fx-fall ${dur}ms ${delay}ms ease-in both`,
            }}
          >
            <Bloom size={20} color={color} center="#F4F1E8" spinning={false} />
          </div>
        )
      })}
    </>
  )
}
