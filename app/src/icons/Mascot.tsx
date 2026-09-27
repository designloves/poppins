export type MascotMood = 'happy' | 'proud' | 'thinking' | 'oops' | 'cheer'

interface MascotProps {
  size: number
  mood: MascotMood
  bowColor?: string
  // A faint, faceless silhouette rather than the full mascot — used as a
  // "not done yet" placeholder that fills in with the real thing once
  // earned (e.g. write-5x's per-repetition progress row).
  outline?: boolean
}

const EYE = '#241F3D'

const EYES: Record<MascotMood, React.ReactNode> = {
  happy: (
    <>
      <circle cx="34" cy="48" r="3.2" fill={EYE} />
      <circle cx="58" cy="48" r="3.2" fill={EYE} />
    </>
  ),
  proud: (
    <>
      <path
        d="M30 48 Q34 44 38 48"
        fill="none"
        stroke={EYE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M54 48 Q58 44 62 48"
        fill="none"
        stroke={EYE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  thinking: (
    <>
      <circle cx="34" cy="48" r="3.2" fill={EYE} />
      <path
        d="M54 48 Q58 44 62 48"
        fill="none"
        stroke={EYE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  oops: (
    <>
      <path d="M30 50 L38 46" stroke={EYE} strokeWidth="3" strokeLinecap="round" />
      <path d="M54 46 L62 50" stroke={EYE} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  cheer: (
    <>
      <path
        d="M30 50 Q34 44 38 50"
        fill="none"
        stroke={EYE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M54 50 Q58 44 62 50"
        fill="none"
        stroke={EYE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
}

const MOUTHS: Record<MascotMood, React.ReactNode> = {
  happy: (
    <path
      d="M40 60 Q46 65 52 60"
      fill="none"
      stroke={EYE}
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  ),
  proud: (
    <path
      d="M40 60 Q46 67 52 60"
      fill="none"
      stroke={EYE}
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  ),
  thinking: <path d="M42 62 L50 62" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />,
  oops: <ellipse cx="46" cy="62" rx="3" ry="3.5" fill={EYE} />,
  cheer: <path d="M38 58 Q46 70 54 58 Z" fill={EYE} />,
}

const BOW_ROTATIONS = [0, 60, 120, 180, 240, 300]

export function Mascot({ size, mood, bowColor = '#B583E8', outline = false }: MascotProps) {
  const bowCenter = '#F2EE5B'
  return (
    <svg width={size} height={size} viewBox="0 0 96 96">
      <path
        d="M20 60 Q12 60 12 50 Q12 42 20 40 Q20 28 32 28 Q36 18 48 20 Q60 18 64 28 Q76 28 76 40 Q84 42 84 50 Q84 60 76 60 Q76 72 64 72 L32 72 Q20 72 20 60 Z"
        fill={outline ? 'none' : '#fff'}
        stroke={EYE}
        strokeWidth="2.5"
        opacity={outline ? 0.35 : 1}
      />
      {!outline && (
        <>
          <ellipse cx="28" cy="56" rx="4" ry="3" fill="#FFB0C8" opacity={0.9} />
          <ellipse cx="64" cy="56" rx="4" ry="3" fill="#FFB0C8" opacity={0.9} />
          {EYES[mood]}
          {MOUTHS[mood]}
          <g transform="translate(58 18) rotate(-15)">
            {BOW_ROTATIONS.map((d) => (
              <ellipse
                key={d}
                cx="0"
                cy="-7"
                rx="4"
                ry="6"
                fill={bowColor}
                transform={`rotate(${d})`}
              />
            ))}
            <circle cx="0" cy="0" r="3" fill={bowCenter} />
          </g>
        </>
      )}
    </svg>
  )
}
