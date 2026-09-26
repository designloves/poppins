// ── SVG ICONS (strings) ───────────────────────────────────────────
// Every gradient/filter id inside the coin SVGs must stay unique across
// the whole page — the pouch icon and a flying coin can both be on
// screen at once — so each render gets its own id suffix.
let _coinSvgUid=0;
export const SVG={
  bloom:(size,color,center,spinning)=>{
    const c=center||color;
    const petals=[0,60,120,180,240,300].map(d=>`<ellipse cx="16" cy="9" rx="4" ry="6" fill="${color}" transform="rotate(${d} 16 16)"/>`).join("");
    const spin=spinning?`style="animation:bloom-spin 4s linear infinite"`:"";
    return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" ${spin}>${petals}<circle cx="16" cy="16" r="3" fill="${c}"/></svg>`;
  },
  // A lighter recolor of the leather pouch — only the leather/rope tones
  // are lightened to fit the game's pastel palette; the gold medallion
  // reuses the exact coin colors (goldRimGrad/goldMedallion/facets) so
  // it visually matches the coins landing in it.
  coinPouch:(size)=>{
    const u=`cp${_coinSvgUid++}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 50 480 320" width="${size}" height="${size*320/480}">
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
</svg>`;
  },
  coinFront:(size)=>{
    const u=`cf${_coinSvgUid++}`;
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
</svg>`;
  },
  coinBack:(size)=>{
    const u=`cb${_coinSvgUid++}`;
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
</svg>`;
  },
  spark:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
  heart:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  check:(size,color,w=4)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  cross:(size,color,w=4)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  plus:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  arrowRight:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  arrowBack:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`,
  arrowUp:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
  arrowDown:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`,
  pencil:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .622.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
  trash:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
  books:(size,color)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`,
  confetti:(size,color,rot)=>`<svg width="${size}" height="${size*1.6}" viewBox="0 0 10 16" style="transform:rotate(${rot}deg)"><rect x="0" y="0" width="10" height="16" rx="2" fill="${color}"/></svg>`,
  curl:(size,color,rot)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" style="transform:rotate(${rot}deg)"><path d="M3 12c3-8 9-8 9 0s6 8 9 0"/></svg>`,
};

// ── MASCOT ────────────────────────────────────────────────────────
export function mascotSVG(size,mood,bowColor){
  const p={body:"#fff",outline:"#241F3D",cheek:"#FFB0C8",bow:bowColor||"#B583E8",bowCenter:"#F2EE5B",eye:"#241F3D"};
  const eyes={
    happy:`<circle cx="34" cy="48" r="3.2" fill="${p.eye}"/><circle cx="58" cy="48" r="3.2" fill="${p.eye}"/>`,
    proud:`<path d="M30 48 Q34 44 38 48" fill="none" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/><path d="M54 48 Q58 44 62 48" fill="none" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/>`,
    thinking:`<circle cx="34" cy="48" r="3.2" fill="${p.eye}"/><path d="M54 48 Q58 44 62 48" fill="none" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/>`,
    oops:`<path d="M30 50 L38 46" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/><path d="M54 46 L62 50" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/>`,
    cheer:`<path d="M30 50 Q34 44 38 50" fill="none" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/><path d="M54 50 Q58 44 62 50" fill="none" stroke="${p.eye}" stroke-width="3" stroke-linecap="round"/>`,
  }[mood]||"";
  const mouth={
    happy:`<path d="M40 60 Q46 65 52 60" fill="none" stroke="${p.eye}" stroke-width="2.6" stroke-linecap="round"/>`,
    proud:`<path d="M40 60 Q46 67 52 60" fill="none" stroke="${p.eye}" stroke-width="2.6" stroke-linecap="round"/>`,
    thinking:`<path d="M42 62 L50 62" stroke="${p.eye}" stroke-width="2.6" stroke-linecap="round"/>`,
    oops:`<ellipse cx="46" cy="62" rx="3" ry="3.5" fill="${p.eye}"/>`,
    cheer:`<path d="M38 58 Q46 70 54 58 Z" fill="${p.eye}"/>`,
  }[mood]||"";
  const bowPetals=[0,60,120,180,240,300].map(d=>`<ellipse cx="0" cy="-7" rx="4" ry="6" fill="${p.bow}" transform="rotate(${d})"/>`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 96 96">
    <path d="M20 60 Q12 60 12 50 Q12 42 20 40 Q20 28 32 28 Q36 18 48 20 Q60 18 64 28 Q76 28 76 40 Q84 42 84 50 Q84 60 76 60 Q76 72 64 72 L32 72 Q20 72 20 60 Z" fill="${p.body}" stroke="${p.outline}" stroke-width="2.5"/>
    <ellipse cx="28" cy="56" rx="4" ry="3" fill="${p.cheek}" opacity=".9"/>
    <ellipse cx="64" cy="56" rx="4" ry="3" fill="${p.cheek}" opacity=".9"/>
    ${eyes}${mouth}
    <g transform="translate(58 18) rotate(-15)">${bowPetals}<circle cx="0" cy="0" r="3" fill="${p.bowCenter}"/></g>
  </svg>`;
}
