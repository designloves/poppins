// Ported from the legacy app's SVG.coinFront — see coinPouchMarkup.ts
// for why this stays a string-returning function instead of JSX.
export function coinFrontMarkup(size: number, uid: string): string {
  const u = uid
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${size}" height="${size}">
  <defs>
    <linearGradient id="goldRimGrad-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFAD1"/>
      <stop offset="25%" stop-color="#F2B705"/>
      <stop offset="50%" stop-color="#7A4B00"/>
      <stop offset="75%" stop-color="#FFDF66"/>
      <stop offset="100%" stop-color="#402500"/>
    </linearGradient>
    <radialGradient id="coinFaceGrad-${u}" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#FFE875"/>
      <stop offset="50%" stop-color="#D99100"/>
      <stop offset="82%" stop-color="#8C5300"/>
      <stop offset="100%" stop-color="#4A2B00"/>
    </radialGradient>
    <linearGradient id="facetLight-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFE6"/>
      <stop offset="60%" stop-color="#FFC000"/>
      <stop offset="100%" stop-color="#AD6B00"/>
    </linearGradient>
    <linearGradient id="facetDark-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A36300"/>
      <stop offset="70%" stop-color="#5E3500"/>
      <stop offset="100%" stop-color="#2D1900"/>
    </linearGradient>
    <filter id="glow-${u}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="238" fill="url(#goldRimGrad-${u})"/>
  <circle cx="250" cy="250" r="234" fill="none" stroke="#422500" stroke-width="8" stroke-dasharray="4 6"/>
  <circle cx="250" cy="250" r="230" fill="none" stroke="#FFE875" stroke-width="2"/>
  <circle cx="250" cy="250" r="218" fill="#3D2200"/>
  <circle cx="250" cy="250" r="212" fill="url(#coinFaceGrad-${u})"/>
  <circle cx="250" cy="250" r="186" fill="none" stroke="url(#goldRimGrad-${u})" stroke-width="6"/>
  <circle cx="250" cy="250" r="176" fill="none" stroke="#5E3500" stroke-width="2"/>
  <path d="M 250,56 L 262,70 L 250,84 L 238,70 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <path d="M 234,70 Q 250,60 266,70 Q 250,80 234,70 Z" fill="none" stroke="#FFE875" stroke-width="2"/>
  <path d="M 70,250 L 84,262 L 98,250 L 84,238 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <path d="M 430,250 L 416,262 L 402,250 L 416,238 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <rect x="232" y="420" width="36" height="20" rx="10" fill="#3D2200" stroke="#FFE875" stroke-width="2"/>
  <text x="250" y="435" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFE875" text-anchor="middle">1</text>
  <g>
    <polygon points="250,120 279,210 364,213 297.5,265.5 320,347 250,300 180,347 202.5,265.5 136,213 221,210" fill="#422500" stroke="#FFE875" stroke-width="4"/>
    <polygon points="250,250 250,120 221,210" fill="url(#facetLight-${u})"/>
    <polygon points="250,250 364,213 279,210" fill="url(#facetLight-${u})"/>
    <polygon points="250,250 320,347 297.5,265.5" fill="url(#facetLight-${u})"/>
    <polygon points="250,250 180,347 250,300" fill="url(#facetLight-${u})"/>
    <polygon points="250,250 136,213 202.5,265.5" fill="url(#facetLight-${u})"/>
    <polygon points="250,250 250,120 279,210" fill="url(#facetDark-${u})"/>
    <polygon points="250,250 364,213 297.5,265.5" fill="url(#facetDark-${u})"/>
    <polygon points="250,250 320,347 250,300" fill="url(#facetDark-${u})"/>
    <polygon points="250,250 180,347 202.5,265.5" fill="url(#facetDark-${u})"/>
    <polygon points="250,250 136,213 221,210" fill="url(#facetDark-${u})"/>
  </g>
  <g transform="translate(365, 125)" filter="url(#glow-${u})">
    <path d="M 0,-38 Q 0,0 38,0 Q 0,0 0,38 Q 0,0 -38,0 Q 0,0 0,-38 Z" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="8" fill="#FFFFD0"/>
  </g>
</svg>`
}

// Ported from the legacy app's SVG.coinBack, same rationale as above.
export function coinBackMarkup(size: number, uid: string): string {
  const u = uid
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${size}" height="${size}">
  <defs>
    <linearGradient id="goldRimGrad-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFAD1"/>
      <stop offset="25%" stop-color="#F2B705"/>
      <stop offset="50%" stop-color="#7A4B00"/>
      <stop offset="75%" stop-color="#FFDF66"/>
      <stop offset="100%" stop-color="#402500"/>
    </linearGradient>
    <radialGradient id="coinFaceGrad-${u}" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#FFE875"/>
      <stop offset="50%" stop-color="#D99100"/>
      <stop offset="82%" stop-color="#8C5300"/>
      <stop offset="100%" stop-color="#4A2B00"/>
    </radialGradient>
    <linearGradient id="numLight-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFE6"/>
      <stop offset="50%" stop-color="#FFC000"/>
      <stop offset="100%" stop-color="#A36300"/>
    </linearGradient>
    <linearGradient id="numDark-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8C5300"/>
      <stop offset="100%" stop-color="#3A1E00"/>
    </linearGradient>
    <pattern id="crossHatch-${u}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 0,12 L 12,0 M 0,0 L 12,12" stroke="#8A5200" stroke-width="1.5" opacity="0.6"/>
    </pattern>
    <filter id="glow-${u}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="238" fill="url(#goldRimGrad-${u})"/>
  <circle cx="250" cy="250" r="234" fill="none" stroke="#422500" stroke-width="8" stroke-dasharray="4 6"/>
  <circle cx="250" cy="250" r="230" fill="none" stroke="#FFE875" stroke-width="2"/>
  <circle cx="250" cy="250" r="218" fill="#3D2200"/>
  <circle cx="250" cy="250" r="212" fill="url(#coinFaceGrad-${u})"/>
  <circle cx="250" cy="250" r="186" fill="none" stroke="url(#goldRimGrad-${u})" stroke-width="6"/>
  <circle cx="250" cy="250" r="176" fill="none" stroke="#5E3500" stroke-width="2"/>
  <path d="M 250,56 L 262,70 L 250,84 L 238,70 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <path d="M 234,70 Q 250,60 266,70 Q 250,80 234,70 Z" fill="none" stroke="#FFE875" stroke-width="2"/>
  <path d="M 70,250 L 84,262 L 98,250 L 84,238 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <path d="M 430,250 L 416,262 L 402,250 L 416,238 Z" fill="#FFE875" stroke="#5E3500" stroke-width="2"/>
  <rect x="232" y="420" width="36" height="20" rx="10" fill="#3D2200" stroke="#FFE875" stroke-width="2"/>
  <text x="250" y="435" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFE875" text-anchor="middle">1</text>
  <g>
    <path d="M 200,180 L 240,140 L 278,140 L 278,320 L 312,320 L 312,352 L 188,352 L 188,320 L 222,320 L 222,200 L 198,212 Z" fill="url(#numDark-${u})" stroke="#381D00" stroke-width="4"/>
    <path d="M 205,184 L 242,146 L 272,146 L 272,326 L 306,326 L 306,346 L 194,346 L 194,326 L 228,326 L 228,194 L 202,206 Z" fill="url(#numLight-${u})"/>
    <path d="M 228,194 L 272,146 L 272,326 L 228,326 Z" fill="url(#crossHatch-${u})"/>
    <path d="M 242,146 L 272,146 L 272,326 L 250,326 Z" fill="#FFFFFF" opacity="0.25"/>
  </g>
  <g transform="translate(365, 125)" filter="url(#glow-${u})">
    <path d="M 0,-38 Q 0,0 38,0 Q 0,0 0,38 Q 0,0 -38,0 Q 0,0 0,-38 Z" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="8" fill="#FFFFD0"/>
  </g>
</svg>`
}
