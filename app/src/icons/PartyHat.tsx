// The dressing room's free starter accessory — hand-drawn since no
// sourced accessory art exists yet (see the dressing-room PR
// description). A real shop with sourced art is a later step.
export function PartyHat({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="88" rx="40" ry="9" fill="#F2EE5B" stroke="#241F3D" strokeWidth="4" />
      <path
        d="M50 6 L86 82 L14 82 Z"
        fill="#B583E8"
        stroke="#241F3D"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="58" r="5" fill="#fff" opacity="0.85" />
      <circle cx="58" cy="42" r="4" fill="#fff" opacity="0.85" />
      <circle cx="46" cy="70" r="4" fill="#fff" opacity="0.85" />
      <circle cx="50" cy="6" r="9" fill="#F2EE5B" stroke="#241F3D" strokeWidth="4" />
    </svg>
  )
}
