import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showMotto?: boolean;
}

/**
 * Official Night Curlers FC Club Crest
 * Features the circular crest, curved text 'NIGHT CURLERS' & 'Don't Do Drugs, Play Football',
 * and the flaming curling football.
 */
export const NightCurlersLogo: React.FC<LogoProps> = ({
  className = '',
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Night Curlers Football Club Crest"
    >
      <defs>
        {/* Curved text paths */}
        <path
          id="nc-top-arc"
          d="M 32,100 A 68,68 0 0,1 168,100"
          fill="none"
        />
        <path
          id="nc-bottom-arc"
          d="M 168,104 A 68,68 0 0,1 32,104"
          fill="none"
        />
        {/* Gradients */}
        <linearGradient id="crest-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="50%" stopColor="#111827" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F3F4F6" />
          <stop offset="60%" stopColor="#E5E7EB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>

      {/* Outer Glow & Background */}
      <circle cx="100" cy="100" r="96" fill="#09090b" />
      <circle cx="100" cy="100" r="94" stroke="url(#crest-border-grad)" strokeWidth="3.5" fill="#111827" />

      {/* Outer Ring Border */}
      <circle cx="100" cy="100" r="88" stroke="#374151" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="76" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />

      {/* Top Arc Text: NIGHT CURLERS */}
      <text
        fill="#FFFFFF"
        fontSize="17"
        fontWeight="900"
        letterSpacing="2.8"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        <textPath href="#nc-top-arc" startOffset="50%" textAnchor="middle">
          NIGHT CURLERS
        </textPath>
      </text>

      {/* Bottom Arc Text: Don't Do Drugs, Play Football */}
      <text
        fill="#E5E7EB"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.8"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        <textPath href="#nc-bottom-arc" startOffset="50%" textAnchor="middle">
          Don&apos;t Do Drugs, Play Football
        </textPath>
      </text>

      {/* Inner Crest Core */}
      <circle cx="100" cy="100" r="56" fill="#FFFFFF" />
      <circle cx="100" cy="100" r="54" fill="#18181B" stroke="#3F3F46" strokeWidth="2" />

      {/* Flaming Velocity Trails (Flame wrapping around ball) */}
      <g transform="translate(15, 10)">
        {/* Outer White Flame Swooshes */}
        <path
          d="M 50,118 C 30,118 18,105 16,92 C 14,80 24,70 32,64 C 42,56 46,45 42,32 C 55,42 62,56 60,70 C 66,62 70,52 68,40 C 76,52 82,65 80,78 C 85,72 88,64 88,55 C 96,68 96,85 88,96 C 80,108 65,118 50,118 Z"
          fill="url(#flame-grad)"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Flame Detail Stroke */}
        <path
          d="M 32,98 C 24,94 22,86 26,78 C 30,70 38,65 42,55 C 44,65 48,74 46,84 C 52,78 56,70 56,62 C 62,72 65,82 62,92"
          fill="none"
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Soccer Ball */}
        <g transform="translate(70, 32)">
          {/* Ball Base */}
          <circle cx="34" cy="34" r="32" fill="#FFFFFF" stroke="#111827" strokeWidth="4" />

          {/* Pentagons & Seams */}
          {/* Center Pentagon */}
          <polygon
            points="34,22 44,29 40,41 28,41 24,29"
            fill="#111827"
          />

          {/* Top Seam & Patch */}
          <line x1="34" y1="22" x2="34" y2="4" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="28,2 40,2 44,9 24,9" fill="#111827" />

          {/* Top-Right Seam & Patch */}
          <line x1="44" y1="29" x2="60" y2="21" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="58,16 66,22 62,34 52,28" fill="#111827" />

          {/* Bottom-Right Seam & Patch */}
          <line x1="40" y1="41" x2="52" y2="57" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="56,48 64,56 54,64 46,56" fill="#111827" />

          {/* Bottom-Left Seam & Patch */}
          <line x1="28" y1="41" x2="16" y2="57" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="12,48 22,56 14,64 4,56" fill="#111827" />

          {/* Top-Left Seam & Patch */}
          <line x1="24" y1="29" x2="8" y2="21" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="10,16 16,28 6,34 2,22" fill="#111827" />

          {/* Gloss highlight on ball */}
          <ellipse cx="24" cy="18" rx="8" ry="4" transform="rotate(-30 24 18)" fill="#FFFFFF" fillOpacity="0.4" />
        </g>
      </g>
    </svg>
  );
};
