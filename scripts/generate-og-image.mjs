import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const width = 1200;
const height = 630;

// SVG representation of the 1200x630 OpenGraph Banner
const ogSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#09090b" />
      <stop offset="50%" stopColor="#111827" />
      <stop offset="100%" stopColor="#030712" />
    </linearGradient>

    <radialGradient id="emerald-glow" cx="25%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#059669" stopOpacity="0" />
    </radialGradient>

    <radialGradient id="accent-glow" cx="80%" cy="80%" r="40%">
      <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
    </radialGradient>

    <!-- Crest Paths -->
    <path id="crest-top-arc" d="M 36,100 A 64,64 0 0,1 164,100" fill="none" />
    <path id="crest-bottom-arc" d="M 164,104 A 64,64 0 0,1 36,104" fill="none" />

    <linearGradient id="crest-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4B5563" />
      <stop offset="50%" stopColor="#1F2937" />
      <stop offset="100%" stopColor="#374151" />
    </linearGradient>

    <linearGradient id="flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#F9FAFB" />
      <stop offset="60%" stopColor="#E5E7EB" />
      <stop offset="100%" stopColor="#9CA3AF" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" fill="url(#bg-grad)" />
  <rect width="${width}" height="${height}" fill="url(#emerald-glow)" />
  <rect width="${width}" height="${height}" fill="url(#accent-glow)" />

  <!-- Subtle Pitch / Stadium Tactical Pattern -->
  <g opacity="0.07" stroke="#FFFFFF" stroke-width="1.5">
    <line x1="0" y1="150" x2="1200" y2="150" stroke-dasharray="8 8" />
    <line x1="0" y1="315" x2="1200" y2="315" />
    <line x1="0" y1="480" x2="1200" y2="480" stroke-dasharray="8 8" />
    <circle cx="280" cy="315" r="190" fill="none" />
    <line x1="280" y1="0" x2="280" y2="630" />
  </g>

  <!-- Border Card Accent -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#27272a" stroke-width="2" />
  <rect x="25" y="25" width="1150" height="2" fill="#059669" opacity="0.8" />

  <!-- LEFT: Official Night Curlers Crest (Scales to 340x340 at (90, 145)) -->
  <g transform="translate(100, 140) scale(1.75)">
    <!-- Outer Glow & Background -->
    <circle cx="100" cy="100" r="96" fill="#09090b" />
    <circle cx="100" cy="100" r="94" stroke="url(#crest-silver)" stroke-width="3.5" fill="#111827" />

    <!-- Outer Ring Border -->
    <circle cx="100" cy="100" r="88" stroke="#374151" stroke-width="1.5" />
    <circle cx="100" cy="100" r="76" fill="#18181b" stroke="#27272a" stroke-width="1.5" />

    <!-- Top Arc Text: NIGHT CURLERS -->
    <text fill="#FFFFFF" font-size="16.5" font-weight="900" letter-spacing="2.8" font-family="system-ui, -apple-system, sans-serif">
      <textPath href="#crest-top-arc" startOffset="50%" text-anchor="middle">
        NIGHT CURLERS
      </textPath>
    </text>

    <!-- Bottom Arc Text: Don't Do Drugs, Play Football -->
    <text fill="#E5E7EB" font-size="8.5" font-weight="700" letter-spacing="0.8" font-family="system-ui, -apple-system, sans-serif">
      <textPath href="#crest-bottom-arc" startOffset="50%" text-anchor="middle">
        Don&apos;t Do Drugs, Play Football
      </textPath>
    </text>

    <!-- Inner Crest Core -->
    <circle cx="100" cy="100" r="56" fill="#FFFFFF" />
    <circle cx="100" cy="100" r="54" fill="#18181B" stroke="#3F3F46" stroke-width="2" />

    <!-- Flaming Velocity Trails -->
    <g transform="translate(15, 10)">
      <path
        d="M 50,118 C 30,118 18,105 16,92 C 14,80 24,70 32,64 C 42,56 46,45 42,32 C 55,42 62,56 60,70 C 66,62 70,52 68,40 C 76,52 82,65 80,78 C 85,72 88,64 88,55 C 96,68 96,85 88,96 C 80,108 65,118 50,118 Z"
        fill="url(#flame-grad)"
        stroke="#111827"
        stroke-width="3.5"
        stroke-linejoin="round"
      />
      <path
        d="M 32,98 C 24,94 22,86 26,78 C 30,70 38,65 42,55 C 44,65 48,74 46,84 C 52,78 56,70 56,62 C 62,72 65,82 62,92"
        fill="none"
        stroke="#111827"
        stroke-width="2.5"
        stroke-linecap="round"
      />

      <!-- Soccer Ball -->
      <g transform="translate(70, 32)">
        <circle cx="34" cy="34" r="32" fill="#FFFFFF" stroke="#111827" stroke-width="4" />
        <polygon points="34,22 44,29 40,41 28,41 24,29" fill="#111827" />
        <line x1="34" y1="22" x2="34" y2="4" stroke="#111827" stroke-width="3" stroke-linecap="round" />
        <polygon points="28,2 40,2 44,9 24,9" fill="#111827" />
        <line x1="44" y1="29" x2="60" y2="21" stroke="#111827" stroke-width="3" stroke-linecap="round" />
        <polygon points="58,16 66,22 62,34 52,28" fill="#111827" />
        <line x1="40" y1="41" x2="52" y2="57" stroke="#111827" stroke-width="3" stroke-linecap="round" />
        <polygon points="56,48 64,56 54,64 46,56" fill="#111827" />
        <line x1="28" y1="41" x2="16" y2="57" stroke="#111827" stroke-width="3" stroke-linecap="round" />
        <polygon points="12,48 22,56 14,64 4,56" fill="#111827" />
        <line x1="24" y1="29" x2="8" y2="21" stroke="#111827" stroke-width="3" stroke-linecap="round" />
        <polygon points="10,16 16,28 6,34 2,22" fill="#111827" />
      </g>
    </g>
  </g>

  <!-- RIGHT: Typography & Feature Highlights -->
  <g transform="translate(520, 130)">
    <!-- Club Badge Pill -->
    <g>
      <rect x="0" y="0" width="310" height="34" rx="17" fill="#064e3b" stroke="#059669" stroke-width="1.5" />
      <circle cx="16" cy="17" r="5" fill="#34d399" />
      <text x="32" y="22" fill="#6ee7b7" font-size="12" font-weight="800" letter-spacing="1.5" font-family="system-ui, -apple-system, sans-serif">
        NIGHT CURLERS FC · OFFICIAL
      </text>
    </g>

    <!-- Main Title -->
    <text x="0" y="96" fill="#FFFFFF" font-size="52" font-weight="900" letter-spacing="-1.5" font-family="system-ui, -apple-system, sans-serif">
      Team Drafter
    </text>

    <!-- Subtitle / Motto -->
    <text x="0" y="142" fill="#34d399" font-size="20" font-weight="700" font-style="italic" font-family="system-ui, -apple-system, sans-serif">
      &quot;Don&apos;t Do Drugs, Play Football&quot;
    </text>

    <!-- Description -->
    <text x="0" y="194" fill="#D1D5DB" font-size="18" font-weight="400" font-family="system-ui, -apple-system, sans-serif">
      Turn pasted WhatsApp rosters into evenly-positioned football
    </text>
    <text x="0" y="224" fill="#D1D5DB" font-size="18" font-weight="400" font-family="system-ui, -apple-system, sans-serif">
      teams with scattered list numbers and exportable match sheets.
    </text>

    <!-- Feature Pills -->
    <g transform="translate(0, 275)">
      <!-- Pill 1: Position Balanced -->
      <g>
        <rect x="0" y="0" width="186" height="38" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
        <circle cx="20" cy="19" r="6" fill="#10b981" />
        <text x="34" y="24" fill="#f3f4f6" font-size="13" font-weight="700" font-family="system-ui, -apple-system, sans-serif">
          Position Balanced
        </text>
      </g>

      <!-- Pill 2: Number Scattered -->
      <g transform="translate(198, 0)">
        <rect x="0" y="0" width="186" height="38" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
        <circle cx="20" cy="19" r="6" fill="#3b82f6" />
        <text x="34" y="24" fill="#f3f4f6" font-size="13" font-weight="700" font-family="system-ui, -apple-system, sans-serif">
          Numbers Scattered
        </text>
      </g>

      <!-- Pill 3: PNG & Text Export -->
      <g transform="translate(396, 0)">
        <rect x="0" y="0" width="180" height="38" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
        <circle cx="20" cy="19" r="6" fill="#f59e0b" />
        <text x="34" y="24" fill="#f3f4f6" font-size="13" font-weight="700" font-family="system-ui, -apple-system, sans-serif">
          PNG &amp; WhatsApp Export
        </text>
      </g>
    </g>

    <!-- Bottom Footer Note inside banner -->
    <g transform="translate(0, 350)">
      <text x="0" y="16" fill="#6B7280" font-size="12" font-weight="600" font-mono="true" font-family="monospace">
        DETERMINISTIC · OFFLINE READY · 100% CLIENT-SIDE
      </text>
    </g>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG source
  const svgPath = path.join(publicDir, 'og-image.svg');
  fs.writeFileSync(svgPath, ogSvg.trim());
  console.log('Created:', svgPath);

  // Generate PNG version at 1200x630
  const pngPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(ogSvg))
    .resize(width, height)
    .png({ quality: 95 })
    .toFile(pngPath);
  console.log('Rendered:', pngPath);

  // Also create a 512x512 apple-touch-icon / app icon from the crest
  const crestSvg = `
<svg width="512" height="512" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="nc-top-arc" d="M 32,100 A 68,68 0 0,1 168,100" fill="none" />
    <path id="nc-bottom-arc" d="M 168,104 A 68,68 0 0,1 32,104" fill="none" />
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
  <circle cx="100" cy="100" r="96" fill="#09090b" />
  <circle cx="100" cy="100" r="94" stroke="url(#crest-border-grad)" stroke-width="3.5" fill="#111827" />
  <circle cx="100" cy="100" r="88" stroke="#374151" stroke-width="1.5" />
  <circle cx="100" cy="100" r="76" fill="#18181b" stroke="#27272a" stroke-width="1.5" />
  <text fill="#FFFFFF" font-size="17" font-weight="900" letter-spacing="2.8" font-family="system-ui, -apple-system, sans-serif">
    <textPath href="#nc-top-arc" startOffset="50%" text-anchor="middle">NIGHT CURLERS</textPath>
  </text>
  <text fill="#E5E7EB" font-size="8.5" font-weight="700" letter-spacing="0.8" font-family="system-ui, -apple-system, sans-serif">
    <textPath href="#nc-bottom-arc" startOffset="50%" text-anchor="middle">Don&apos;t Do Drugs, Play Football</textPath>
  </text>
  <circle cx="100" cy="100" r="56" fill="#FFFFFF" />
  <circle cx="100" cy="100" r="54" fill="#18181B" stroke="#3F3F46" stroke-width="2" />
  <g transform="translate(15, 10)">
    <path
      d="M 50,118 C 30,118 18,105 16,92 C 14,80 24,70 32,64 C 42,56 46,45 42,32 C 55,42 62,56 60,70 C 66,62 70,52 68,40 C 76,52 82,65 80,78 C 85,72 88,64 88,55 C 96,68 96,85 88,96 C 80,108 65,118 50,118 Z"
      fill="url(#flame-grad)"
      stroke="#111827"
      stroke-width="3.5"
      stroke-linejoin="round"
    />
    <path
      d="M 32,98 C 24,94 22,86 26,78 C 30,70 38,65 42,55 C 44,65 48,74 46,84 C 52,78 56,70 56,62 C 62,72 65,82 62,92"
      fill="none"
      stroke="#111827"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <g transform="translate(70, 32)">
      <circle cx="34" cy="34" r="32" fill="#FFFFFF" stroke="#111827" stroke-width="4" />
      <polygon points="34,22 44,29 40,41 28,41 24,29" fill="#111827" />
      <line x1="34" y1="22" x2="34" y2="4" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <polygon points="28,2 40,2 44,9 24,9" fill="#111827" />
      <line x1="44" y1="29" x2="60" y2="21" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <polygon points="58,16 66,22 62,34 52,28" fill="#111827" />
      <line x1="40" y1="41" x2="52" y2="57" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <polygon points="56,48 64,56 54,64 46,56" fill="#111827" />
      <line x1="28" y1="41" x2="16" y2="57" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <polygon points="12,48 22,56 14,64 4,56" fill="#111827" />
      <line x1="24" y1="29" x2="8" y2="21" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <polygon points="10,16 16,28 6,34 2,22" fill="#111827" />
    </g>
  </g>
</svg>
  `;

  const faviconPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(faviconPath, crestSvg.trim());
  console.log('Created favicon.svg');

  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(Buffer.from(crestSvg))
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('Created apple-touch-icon.png');
}

main().catch(console.error);
