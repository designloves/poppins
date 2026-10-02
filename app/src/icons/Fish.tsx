// A wearable fish hairclip — previously baked permanently into the cat
// avatar's art (sitting on its head in every screenshot); pulled out as
// its own accessory so it can be taken on and off like any other item.
export function Fish({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path
        d="M10 50
           C10 30 30 18 50 20
           C65 21 78 30 78 38
           L95 20
           L80 50
           L95 80
           L78 62
           C78 70 65 79 50 80
           C30 82 10 70 10 50 Z"
        fill="#FBC516"
        stroke="#241F3D"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="45" r="5" fill="#241F3D" />
    </svg>
  )
}
