// The dressing room's nav icon — a carved wood cabinet with a gold star
// medallion, matching the coin/pouch gold motif elsewhere in the app.
// Cropped to just the cabinet (the source art's own canvas background
// and ground shadow are dropped) so it drops into a small round button
// like any other icon.
export function Wardrobe({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="135 56 330 298">
      <defs>
        <linearGradient id="wardrobeCabinetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2D0F04" />
          <stop offset="20%" stopColor="#5E230E" />
          <stop offset="50%" stopColor="#80381B" />
          <stop offset="80%" stopColor="#5E230E" />
          <stop offset="100%" stopColor="#200A02" />
        </linearGradient>

        <linearGradient id="wardrobeDoorPanel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6E2C13" />
          <stop offset="50%" stopColor="#4A1C0A" />
          <stop offset="100%" stopColor="#290E03" />
        </linearGradient>

        <linearGradient id="wardrobeCorniceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9E4924" />
          <stop offset="40%" stopColor="#5B220B" />
          <stop offset="100%" stopColor="#1F0801" />
        </linearGradient>

        <linearGradient id="wardrobeGoldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFAD1" />
          <stop offset="25%" stopColor="#F2B705" />
          <stop offset="50%" stopColor="#7A4B00" />
          <stop offset="75%" stopColor="#FFDF66" />
          <stop offset="100%" stopColor="#402500" />
        </linearGradient>

        <radialGradient id="wardrobeGoldMedallion" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE875" />
          <stop offset="50%" stopColor="#D99100" />
          <stop offset="82%" stopColor="#8C5300" />
          <stop offset="100%" stopColor="#4A2B00" />
        </radialGradient>

        <linearGradient id="wardrobeFacetLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFE6" />
          <stop offset="60%" stopColor="#FFC000" />
          <stop offset="100%" stopColor="#AD6B00" />
        </linearGradient>

        <linearGradient id="wardrobeFacetDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A36300" />
          <stop offset="70%" stopColor="#5E3500" />
          <stop offset="100%" stopColor="#2D1900" />
        </linearGradient>

        <filter id="wardrobeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Carved wooden feet */}
      <path
        d="M 160,310 L 150,338 C 150,342 170,344 180,340 L 195,310 Z"
        fill="#1C0802"
        stroke="#0D0300"
        strokeWidth="2"
      />
      <path
        d="M 152,336 L 178,338"
        stroke="url(#wardrobeGoldRimGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 440,310 L 450,338 C 450,342 430,344 420,340 L 405,310 Z"
        fill="#1C0802"
        stroke="#0D0300"
        strokeWidth="2"
      />
      <path
        d="M 448,336 L 422,338"
        stroke="url(#wardrobeGoldRimGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Main cabinet body */}
      <rect
        x="165"
        y="100"
        width="270"
        height="215"
        rx="10"
        fill="url(#wardrobeCabinetGrad)"
        stroke="#120401"
        strokeWidth="4"
      />
      <rect x="175" y="110" width="250" height="195" rx="6" fill="#140602" />

      {/* Left door */}
      <rect x="178" y="113" width="120" height="189" rx="4" fill="url(#wardrobeDoorPanel)" />
      <rect
        x="190"
        y="125"
        width="96"
        height="165"
        rx="3"
        fill="#3D1609"
        stroke="#1A0702"
        strokeWidth="3"
      />
      <rect x="193" y="128" width="90" height="159" rx="2" fill="url(#wardrobeCabinetGrad)" />
      <path
        d="M 194,129 L 282,129 L 282,286"
        fill="none"
        stroke="#A04F28"
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* Right door */}
      <rect x="302" y="113" width="120" height="189" rx="4" fill="url(#wardrobeDoorPanel)" />
      <rect
        x="314"
        y="125"
        width="96"
        height="165"
        rx="3"
        fill="#3D1609"
        stroke="#1A0702"
        strokeWidth="3"
      />
      <rect x="317" y="128" width="90" height="159" rx="2" fill="url(#wardrobeCabinetGrad)" />
      <path
        d="M 318,129 L 406,129 L 406,286"
        fill="none"
        stroke="#A04F28"
        strokeWidth="1.5"
        opacity="0.4"
      />

      <line x1="300" y1="113" x2="300" y2="302" stroke="#0A0200" strokeWidth="3" />

      {/* Crown cornice */}
      <path
        d="M 145,80 L 455,80 L 440,105 L 160,105 Z"
        fill="url(#wardrobeCorniceGrad)"
        stroke="#120401"
        strokeWidth="3"
      />
      <path d="M 148,83 L 452,83" stroke="#D16943" strokeWidth="2" opacity="0.6" />
      <path
        d="M 145,80 L 455,80"
        stroke="url(#wardrobeGoldRimGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M 160,103 L 440,103" stroke="url(#wardrobeGoldRimGrad)" strokeWidth="3" />

      {/* Gold corner brackets */}
      <path d="M 165,100 L 190,100 L 165,125 Z" fill="url(#wardrobeGoldRimGrad)" />
      <circle cx="173" cy="108" r="1.5" fill="#3D2200" />
      <path d="M 435,100 L 410,100 L 435,125 Z" fill="url(#wardrobeGoldRimGrad)" />
      <circle cx="427" cy="108" r="1.5" fill="#3D2200" />
      <path d="M 165,315 L 190,315 L 165,290 Z" fill="url(#wardrobeGoldRimGrad)" />
      <circle cx="173" cy="307" r="1.5" fill="#3D2200" />
      <path d="M 435,315 L 410,315 L 435,290 Z" fill="url(#wardrobeGoldRimGrad)" />
      <circle cx="427" cy="307" r="1.5" fill="#3D2200" />

      {/* Ring handles */}
      <g transform="translate(283, 205)">
        <circle cx="0" cy="0" r="8" fill="url(#wardrobeGoldRimGrad)" />
        <circle cx="0" cy="0" r="5" fill="#200A02" />
        <circle
          cx="-6"
          cy="0"
          r="6"
          fill="none"
          stroke="url(#wardrobeGoldRimGrad)"
          strokeWidth="2.5"
        />
      </g>
      <g transform="translate(317, 205)">
        <circle cx="0" cy="0" r="8" fill="url(#wardrobeGoldRimGrad)" />
        <circle cx="0" cy="0" r="5" fill="#200A02" />
        <circle
          cx="6"
          cy="0"
          r="6"
          fill="none"
          stroke="url(#wardrobeGoldRimGrad)"
          strokeWidth="2.5"
        />
      </g>

      {/* Star medallion */}
      <g transform="translate(300, 92)">
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="url(#wardrobeGoldRimGrad)"
          stroke="#1A0702"
          strokeWidth="2"
        />
        <circle cx="0" cy="0" r="18" fill="#3D2200" />
        <circle cx="0" cy="0" r="16" fill="url(#wardrobeGoldMedallion)" />
        <g transform="scale(0.26)">
          <polygon
            points="0,-45 13,-12 43,-10 20,11 27,42 0,25 -27,42 -20,11 -43,-10 -13,-12"
            fill="#422500"
            stroke="#FFE875"
            strokeWidth="2.5"
          />
          <polygon points="0,0 0,-45 -13,-12" fill="url(#wardrobeFacetLight)" />
          <polygon points="0,0 43,-10 13,-12" fill="url(#wardrobeFacetLight)" />
          <polygon points="0,0 27,42 20,11" fill="url(#wardrobeFacetLight)" />
          <polygon points="0,0 -27,42 0,25" fill="url(#wardrobeFacetLight)" />
          <polygon points="0,0 -43,-10 -20,11" fill="url(#wardrobeFacetLight)" />
          <polygon points="0,0 0,-45 13,-12" fill="url(#wardrobeFacetDark)" />
          <polygon points="0,0 43,-10 20,11" fill="url(#wardrobeFacetDark)" />
          <polygon points="0,0 27,42 0,25" fill="url(#wardrobeFacetDark)" />
          <polygon points="0,0 -27,42 -20,11" fill="url(#wardrobeFacetDark)" />
          <polygon points="0,0 -43,-10 -13,-12" fill="url(#wardrobeFacetDark)" />
        </g>
      </g>

      {/* Sparkle */}
      <g transform="translate(314, 78)" filter="url(#wardrobeGlow)">
        <path d="M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="2" fill="#FFFFD0" />
      </g>
    </svg>
  )
}
