// A lighter recolor of the legacy app's leather pouch icon — only the
// leather/rope tones are lightened to fit the game's pastel palette; the
// gold medallion reuses the exact coin colors so it visually matches
// coins landing in it. Kept as a plain string-returning function (like
// the legacy SVG.* helpers) rather than hand-converted to JSX: it's a
// large, purely decorative, static asset with no per-element logic, so
// the conversion would be pure transcription risk for no real benefit.
//
// `uid` must be unique per render instance sharing the page (the gold
// gradient/filter ids inside would otherwise collide with any other
// coin-pouch icon rendered at the same time) — the CoinPouchIcon
// component below supplies it via React's useId().
export function coinPouchMarkup(size: number, uid: string): string {
  const u = uid
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 50 480 320" width="${size}" height="${(size * 320) / 480}">
  <defs>
    <radialGradient id="oldLeatherBody-${u}" cx="42%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#F2BC85"/>
      <stop offset="45%" stop-color="#DB9A5C"/>
      <stop offset="80%" stop-color="#BC7A40"/>
      <stop offset="100%" stop-color="#985E2E"/>
    </radialGradient>
    <linearGradient id="leatherFlap-${u}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F7C88F"/>
      <stop offset="50%" stop-color="#E2A567"/>
      <stop offset="100%" stop-color="#BD8347"/>
    </linearGradient>
    <linearGradient id="ropeGrad-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3B0"/>
      <stop offset="30%" stop-color="#E5AD35"/>
      <stop offset="70%" stop-color="#C08A30"/>
      <stop offset="100%" stop-color="#7A5218"/>
    </linearGradient>
    <linearGradient id="goldRimGrad-${u}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFAD1"/>
      <stop offset="25%" stop-color="#F2B705"/>
      <stop offset="50%" stop-color="#7A4B00"/>
      <stop offset="75%" stop-color="#FFDF66"/>
      <stop offset="100%" stop-color="#402500"/>
    </linearGradient>
    <radialGradient id="goldMedallion-${u}" cx="38%" cy="32%" r="68%">
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
    <filter id="pouchShadow-${u}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="glow-${u}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <path d="M 190,95 C 210,65 390,65 410,95 C 425,112 175,112 190,95 Z" fill="#8A5A32" stroke="#6B4020" stroke-width="3"/>
  <ellipse cx="300" cy="98" rx="110" ry="18" fill="#5A3A20"/>

  <g>
    <g transform="translate(230, 92) rotate(-28)">
      <ellipse cx="0" cy="0" rx="25" ry="11" fill="url(#goldRimGrad-${u})"/>
      <ellipse cx="0" cy="0" rx="19" ry="7" fill="#6B4415"/>
    </g>
    <g transform="translate(270, 88) rotate(-8)">
      <ellipse cx="0" cy="0" rx="27" ry="12" fill="url(#goldRimGrad-${u})"/>
      <ellipse cx="0" cy="0" rx="21" ry="8" fill="#6B4415"/>
    </g>
    <g transform="translate(325, 87) rotate(16)">
      <ellipse cx="0" cy="0" rx="28" ry="12" fill="url(#goldRimGrad-${u})"/>
      <ellipse cx="0" cy="0" rx="22" ry="8" fill="#6B4415"/>
    </g>
    <g transform="translate(370, 93) rotate(32)">
      <ellipse cx="0" cy="0" rx="24" ry="10" fill="url(#goldRimGrad-${u})"/>
      <ellipse cx="0" cy="0" rx="18" ry="6" fill="#6B4415"/>
    </g>
    <g transform="translate(298, 96) rotate(2)">
      <ellipse cx="0" cy="0" rx="30" ry="14" fill="url(#goldRimGrad-${u})"/>
      <ellipse cx="0" cy="0" rx="24" ry="10" fill="url(#goldMedallion-${u})"/>
      <path d="M -5,-2 L 0,-9 L 5,-2 L 9,3 L 0,1 L -9,3 Z" fill="#FFE875"/>
    </g>
  </g>

  <path d="M 390,96 C 425,88 435,122 405,138 C 380,140 375,120 390,96 Z" fill="url(#leatherFlap-${u})" stroke="#6B4020" stroke-width="2"/>
  <path d="M 210,96 C 175,88 165,122 195,138 C 220,140 225,120 210,96 Z" fill="url(#leatherFlap-${u})" stroke="#6B4020" stroke-width="2"/>

  <path d="M 180,100
           C 210,118 250,98 300,112
           C 350,98 390,118 420,100
           C 445,128 410,152 385,146
           C 335,136 265,136 215,146
           C 190,152 155,128 180,100 Z"
        fill="url(#leatherFlap-${u})"
        stroke="#6B4020"
        stroke-width="3"/>

  <path d="M 205,108 Q 235,128 260,114" fill="none" stroke="#FFE8C4" stroke-width="2" opacity="0.5"/>
  <path d="M 395,108 Q 365,128 340,114" fill="none" stroke="#FFE8C4" stroke-width="2" opacity="0.5"/>
  <path d="M 300,112 Q 305,132 310,142" fill="none" stroke="#6B4020" stroke-width="3" opacity="0.5"/>

  <path d="M 205,148
           C 110,175 75,285 190,332 C 240,350 360,350 410,332 C 525,285 490,175 395,148
           C 345,160 255,160 205,148 Z"
        fill="url(#oldLeatherBody-${u})"
        stroke="#7A4A28"
        stroke-width="5"
        filter="url(#pouchShadow-${u})"/>

  <path d="M 210,150 Q 240,190 230,235" fill="none" stroke="#7A4A28" stroke-width="6" opacity="0.5"/>
  <path d="M 390,150 Q 360,190 370,235" fill="none" stroke="#7A4A28" stroke-width="6" opacity="0.5"/>
  <path d="M 300,156 Q 298,195 302,230" fill="none" stroke="#7A4A28" stroke-width="4" opacity="0.35"/>

  <path d="M 145,215 C 120,260 150,312 215,332" fill="none" stroke="#FFE8C4" stroke-width="4" opacity="0.4"/>
  <path d="M 455,215 C 480,260 450,312 385,332" fill="none" stroke="#7A4A28" stroke-width="6" opacity="0.35"/>

  <g stroke="#D19E61" stroke-width="2" stroke-linecap="round" opacity="0.75">
    <line x1="140" y1="245" x2="152" y2="250"/>
    <line x1="138" y1="257" x2="150" y2="262"/>
    <line x1="138" y1="269" x2="150" y2="274"/>
  </g>

  <g>
    <path d="M 195,146 Q 300,166 405,146" fill="none" stroke="#7A4A28" stroke-width="12" opacity="0.5"/>
    <path d="M 195,144 Q 300,164 405,144" fill="none" stroke="url(#ropeGrad-${u})" stroke-width="9" stroke-dasharray="8 3"/>
    <path d="M 195,144 Q 300,164 405,144" fill="none" stroke="#FFE875" stroke-width="2" opacity="0.5"/>

    <g transform="translate(260, 156)">
      <circle cx="0" cy="0" r="9" fill="url(#ropeGrad-${u})" stroke="#7A5218" stroke-width="2"/>
      <circle cx="8" cy="2" r="7" fill="url(#ropeGrad-${u})" stroke="#7A5218" stroke-width="2"/>
    </g>

    <path d="M 257,161 Q 230,195 210,225" fill="none" stroke="#B5883F" stroke-width="7" stroke-linecap="round"/>
    <path d="M 257,161 Q 230,195 210,225" fill="none" stroke="url(#ropeGrad-${u})" stroke-width="5" stroke-dasharray="5 2" stroke-linecap="round"/>
    <path d="M 210,225 L 198,245 M 210,225 L 206,248 M 210,225 L 217,244" stroke="url(#ropeGrad-${u})" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="210" cy="225" rx="5" ry="4" fill="url(#goldRimGrad-${u})"/>

    <path d="M 266,162 Q 280,200 288,240" fill="none" stroke="#B5883F" stroke-width="7" stroke-linecap="round"/>
    <path d="M 266,162 Q 280,200 288,240" fill="none" stroke="url(#ropeGrad-${u})" stroke-width="5" stroke-dasharray="5 2" stroke-linecap="round"/>
    <path d="M 288,240 L 278,261 M 288,240 L 288,264 M 288,240 L 297,260" stroke="url(#ropeGrad-${u})" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="288" cy="240" rx="5" ry="4" fill="url(#goldRimGrad-${u})"/>
  </g>

  <g transform="translate(330, 255)">
    <circle cx="0" cy="0" r="44" fill="url(#goldRimGrad-${u})" filter="url(#pouchShadow-${u})"/>
    <circle cx="0" cy="0" r="38" fill="#3D2200"/>
    <circle cx="0" cy="0" r="35" fill="url(#goldMedallion-${u})"/>
    <circle cx="0" cy="0" r="30" fill="none" stroke="#FFE875" stroke-width="2"/>
    <circle cx="0" cy="0" r="27" fill="none" stroke="#5E3500" stroke-width="1.5"/>
    <g transform="scale(0.52)">
      <polygon points="0,-45 13,-12 43,-10 20,11 27,42 0,25 -27,42 -20,11 -43,-10 -13,-12" fill="#422500" stroke="#FFE875" stroke-width="3"/>
      <polygon points="0,0 0,-45 -13,-12" fill="url(#facetLight-${u})"/>
      <polygon points="0,0 43,-10 13,-12" fill="url(#facetLight-${u})"/>
      <polygon points="0,0 27,42 20,11" fill="url(#facetLight-${u})"/>
      <polygon points="0,0 -27,42 0,25" fill="url(#facetLight-${u})"/>
      <polygon points="0,0 -43,-10 -20,11" fill="url(#facetLight-${u})"/>
      <polygon points="0,0 0,-45 13,-12" fill="url(#facetDark-${u})"/>
      <polygon points="0,0 43,-10 20,11" fill="url(#facetDark-${u})"/>
      <polygon points="0,0 27,42 0,25" fill="url(#facetDark-${u})"/>
      <polygon points="0,0 -27,42 -20,11" fill="url(#facetDark-${u})"/>
      <polygon points="0,0 -43,-10 -13,-12" fill="url(#facetDark-${u})"/>
    </g>
  </g>

  <g transform="translate(362, 222)" filter="url(#glow-${u})">
    <path d="M 0,-18 Q 0,0 18,0 Q 0,0 0,18 Q 0,0 -18,0 Q 0,0 0,-18 Z" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="3.5" fill="#FFFFD0"/>
  </g>
</svg>`
}
