export type QuizFeedback = 'correct' | 'wrong' | null

// Small in-card reactions layered over the quiz card, ported from the
// legacy app's feedbackBurst(). Each wrong-answer animation gets its own
// matching visual: a droplet for "sink", a question mark for "headtilt",
// a puff of smoke for "spin". A correct answer just gets an inward glow.
export function FeedbackBurst({ feedback, anim }: { feedback: QuizFeedback; anim: string | null }) {
  if (!feedback || !anim) return null

  if (feedback === 'correct') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          borderRadius: 'inherit',
          animation: 'greta-glow-pulse 650ms ease-out both',
        }}
      />
    )
  }

  if (anim === 'sink') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
        <div
          style={{
            position: 'absolute',
            bottom: 38,
            right: 62,
            animation: 'greta-droplet-fall 1000ms ease-in 200ms both',
          }}
        >
          <svg width="14" height="20" viewBox="0 0 14 20">
            <path d="M7 1 C 11 9 13 13 13 16 a6 6 0 0 1 -12 0 C 1 13 3 9 7 1 Z" fill="#8AD7FF" />
            <ellipse cx="9" cy="13" rx="1.5" ry="3" fill="#fff" opacity={0.6} />
          </svg>
        </div>
      </div>
    )
  }

  if (anim === 'headtilt') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 26,
            animation: 'greta-qmark-pop 1000ms ease-out 100ms both',
            fontFamily: 'var(--h-font)',
            fontSize: 36,
            color: 'var(--wrong)',
            fontWeight: 700,
          }}
        >
          ?
        </div>
      </div>
    )
  }

  if (anim === 'spin') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'var(--ink-soft)',
            animation: 'greta-puff 850ms ease-out both',
            opacity: 0.5,
          }}
        />
      </div>
    )
  }

  return null
}
