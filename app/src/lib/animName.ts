// Maps a quiz feedback animation key to its full CSS `animation` shorthand.
// Ported from the legacy app's animName().
const ANIMATIONS: Record<string, string> = {
  kiss: 'greta-kiss 1100ms cubic-bezier(.4,1.4,.6,1)',
  tada: 'greta-tada 950ms ease-in-out',
  bigbounce: 'greta-bigbounce 1100ms ease-out',
  cartwheel: 'greta-cartwheel 1000ms cubic-bezier(.5,.9,.5,1)',
  shake: 'greta-oops 620ms ease-in-out',
  sink: 'greta-sink 900ms ease-in-out',
  headtilt: 'greta-headtilt 950ms ease-in-out',
  spin: 'greta-spin-shrink 850ms cubic-bezier(.5,1.4,.5,1)',
}

export function animName(anim: string | null): string {
  return (anim && ANIMATIONS[anim]) || 'none'
}
