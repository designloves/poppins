// Generated tones, no audio files needed — ported from the legacy app.
let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext()
    } catch {
      // Web Audio unsupported or blocked — sound is a nice-to-have
    }
  }
  return audioCtx
}

function playTone(freq: number, duration: number, startTime: number, peak: number) {
  const ctx = getAudioCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const t0 = ctx.currentTime + startTime
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playCorrectSound() {
  playTone(523.25, 0.1, 0, 0.16)
  playTone(659.25, 0.1, 0.07, 0.16)
  playTone(783.99, 0.1, 0.14, 0.16)
  playTone(1046.5, 0.22, 0.21, 0.2)
  try {
    navigator.vibrate?.(30)
  } catch {
    // vibration API unsupported — safe to ignore
  }
}

export function playWrongSound() {
  playTone(220, 0.22, 0, 0.16)
}
