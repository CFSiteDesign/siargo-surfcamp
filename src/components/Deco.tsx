import elWave from '@/assets/elements/wave.png';
import elSurfboard from '@/assets/elements/surfboard.png';
import elSun from '@/assets/elements/sun.png';
import elHibiscus from '@/assets/elements/hibiscus.png';
import elPalm from '@/assets/elements/palm.png';
import elSmokeRun from '@/assets/elements/smoke-run.png';
import elSmokeCorner from '@/assets/elements/smoke-corner.png';

/**
 * Decorative SVG kit for the poster look.
 *
 * Two jobs:
 *   1. `LiquidOverlay` — the melting 70s blob field that sits *on top of* hero
 *      photography, as on the "Currents of Devotion" poster.
 *   2. The small shapes (`Sun`, `Squiggle`, `Star`, `Leaf`, `Blob`) used as the
 *      bits that float between sections.
 *
 * All of it is inline SVG rather than image files so the shapes inherit the
 * palette from CSS custom properties and stay crisp at any size. Everything is
 * `aria-hidden` — it is texture, not content.
 */

type ShapeProps = {
  className?: string;
  /** Rotation for the drift keyframes, which preserve it via --drift-rot. */
  rotate?: number;
};

const style = (rotate?: number) =>
  rotate === undefined ? undefined : ({ ['--drift-rot' as string]: `${rotate}deg`, transform: `rotate(${rotate}deg)` } as React.CSSProperties);

/* ── Liquid blob field ──────────────────────────────────────────────────────
   Irregular organic masses with the pinched waists and rounded lobes of poured
   paint. Sized to span a hero and read as a single connected form. */
export function LiquidOverlay({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 900"
      /* Stretched rather than sliced — slicing on a wide hero zooms the shapes
         until a single lobe fills the frame and the composition is lost. */
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="hsl(var(--yellow))">
        {/* upper mass */}
        <path d="M-20,150 C60,110 130,175 205,150 C270,128 300,60 370,72 C440,84 430,160 500,168 C575,177 620,120 690,140 C760,160 790,120 830,150 L830,250 C770,290 700,235 630,255 C560,275 545,330 470,320 C400,310 400,245 330,240 C255,235 230,300 160,290 C90,280 40,230 -20,255 Z" />
        {/* mid-left tendril */}
        <path d="M-20,420 C50,390 95,440 150,425 C205,410 215,350 275,362 C335,374 320,440 375,455 C430,470 470,425 480,470 C490,520 430,530 385,520 C330,508 320,560 260,552 C200,544 200,495 145,498 C90,501 40,540 -20,515 Z" />
        {/* right column */}
        <path d="M560,380 C610,350 665,395 700,375 C740,352 745,300 790,310 L830,318 L830,700 C780,715 745,670 700,682 C650,695 640,750 585,740 C530,730 545,675 505,655 C462,634 430,675 425,630 C420,580 470,575 505,555 C545,532 520,405 560,380 Z" />
        {/* lower mass */}
        <path d="M-20,760 C55,730 120,790 195,772 C265,755 285,695 355,708 C425,721 415,790 485,800 C560,811 610,760 680,778 C750,796 790,760 830,788 L830,920 L-20,920 Z" />
      </g>
    </svg>
  );
}

/* ── Poster smoke ───────────────────────────────────────────────────────────
   The liquid meander from the lilac poster (reference image 3). Each tendril is
   a stroked path with round caps and joins — that is precisely the constant-
   width, blob-ended ribbon of the reference — plus a few detached droplets.
   The soft offset shadow comes from a CSS drop-shadow on the group so it wraps
   every tendril identically. */

const SMOKE_SHADOW = { filter: 'drop-shadow(5px 7px 3px hsl(var(--ink) / 0.28))' } as const;

/**
 * A wandering horizontal smoke run, roughly 4:1. Use `flip` to mirror it so two
 * runs never read as copies.
 */
export function SmokeRun({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 800 200"
      className={className}
      style={{ ...SMOKE_SHADOW, ...(flip ? { transform: 'scaleX(-1)' } : {}) }}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28,150 C90,150 96,88 150,88 C204,88 200,146 260,146 C320,146 330,60 396,60 C450,60 448,118 400,118 C360,118 368,74 420,74" strokeWidth="34" />
        <path d="M470,150 C530,150 540,96 600,96 C656,96 650,150 710,150 C744,150 766,128 772,104" strokeWidth="30" />
        <path d="M520,44 C570,44 590,70 640,62 C690,54 700,30 748,36" strokeWidth="24" />
      </g>
      <g fill="currentColor">
        <circle cx="60" cy="70" r="17" />
        <circle cx="212" cy="52" r="11" />
        <path d="M712,58 C726,50 744,58 742,74 C740,90 718,92 710,80 C704,71 704,63 712,58 Z" />
      </g>
    </svg>
  );
}

/**
 * A corner tendril, roughly square, weighted into one corner. Rotate with the
 * `rotate` prop (quarter turns) to fit any corner of a framed area.
 */
export function SmokeCorner({ className = '', rotate = 0 }: { className?: string; rotate?: 0 | 90 | 180 | 270 }) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      style={{ ...SMOKE_SHADOW, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36,264 C36,204 44,160 92,140 C136,122 160,150 148,180 C138,206 100,204 100,168 C100,124 148,96 196,96 C240,96 256,120 252,150" strokeWidth="32" />
        <path d="M60,96 C60,64 88,42 124,48 C156,53 166,80 148,96" strokeWidth="24" />
      </g>
      <g fill="currentColor">
        <circle cx="222" cy="216" r="15" />
        <circle cx="196" cy="36" r="10" />
      </g>
    </svg>
  );
}

/**
 * Full smoke frame for the hero: tendrils hugging all four edges with the
 * middle left open, as on the poster. Rendered as one SVG so the shadow and
 * scale stay coherent; stretch it over the framed area with absolute
 * positioning. Stroke widths are generous because the hero downsizes it.
 */
export function SmokeFrame({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="none"
      className={className}
      style={SMOKE_SHADOW}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* top run */}
        <path d="M60,86 C130,86 140,150 210,150 C280,150 280,80 360,80 C430,80 430,140 500,140 C560,140 560,86 640,86 C700,86 720,120 740,150" strokeWidth="40" />
        {/* left column */}
        <path d="M74,150 C74,240 130,250 130,330 C130,404 60,400 60,480 C60,560 140,560 140,640 C140,720 80,730 80,810" strokeWidth="38" />
        {/* right column */}
        <path d="M726,180 C726,260 660,270 660,350 C660,424 740,430 740,510 C740,590 660,600 660,680 C660,750 720,770 726,830" strokeWidth="38" />
        {/* bottom run */}
        <path d="M80,910 C150,910 160,846 230,846 C300,846 300,916 380,916 C450,916 450,850 520,850 C590,850 590,912 660,912 C700,912 720,890 740,870" strokeWidth="40" />
        {/* inner flicks */}
        <path d="M170,260 C210,240 250,260 250,300" strokeWidth="26" />
        <path d="M630,560 C590,580 550,560 550,520" strokeWidth="26" />
      </g>
      <g fill="currentColor">
        <circle cx="200" cy="200" r="20" />
        <circle cx="610" cy="230" r="14" />
        <circle cx="180" cy="760" r="16" />
        <circle cx="620" cy="770" r="20" />
      </g>
    </svg>
  );
}


/* ── Generated poster elements ──────────────────────────────────────────────
   Charlie's generated artwork (sliced from the icon sheet, 2026-08-11), used
   for every floating decoration. Shadows are baked into the PNGs, so no CSS
   shadow on top. */

export const ELEMENTS = {
  wave: elWave,
  surfboard: elSurfboard,
  sun: elSun,
  hibiscus: elHibiscus,
  palm: elPalm,
  smokeRun: elSmokeRun,
  smokeCorner: elSmokeCorner,
} as const;

export function Floater({
  name,
  className = '',
  rotate,
  flip = false,
}: {
  name: keyof typeof ELEMENTS;
  className?: string;
  /** Works with the drift keyframes via --drift-rot, like the SVG shapes. */
  rotate?: number;
  flip?: boolean;
}) {
  const transforms = [rotate !== undefined ? `rotate(${rotate}deg)` : '', flip ? 'scaleX(-1)' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <img
      src={ELEMENTS[name]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
      style={
        transforms
          ? ({ ['--drift-rot' as string]: rotate !== undefined ? `${rotate}deg` : '0deg', transform: transforms } as React.CSSProperties)
          : undefined
      }
    />
  );
}

/* ── Small floating shapes ─────────────────────────────────────────────── */

export function Blob({ className = '', rotate }: ShapeProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style(rotate)} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M46,22 C78,4 118,10 144,32 C172,56 196,86 188,124 C180,164 142,190 102,192 C60,194 22,172 10,136 C-2,100 14,40 46,22 Z"
      />
    </svg>
  );
}

export function Sun({ className = '', rotate }: ShapeProps) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 360) / 12;
    return <rect key={i} x="97.5" y="4" width="5" height="22" rx="2.5" fill="currentColor" transform={`rotate(${a} 100 100)`} />;
  });
  return (
    <svg viewBox="0 0 200 200" className={className} style={style(rotate)} aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="46" fill="currentColor" />
      {rays}
    </svg>
  );
}

export function Squiggle({ className = '', rotate }: ShapeProps) {
  return (
    <svg viewBox="0 0 240 60" className={className} style={style(rotate)} aria-hidden="true" focusable="false">
      <path
        d="M6,34 C26,4 46,4 66,34 C86,64 106,64 126,34 C146,4 166,4 186,34 C206,64 226,64 234,44"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Star({ className = '', rotate }: ShapeProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style(rotate)} aria-hidden="true" focusable="false">
      {/* four-point sparkle with concave sides */}
      <path
        fill="currentColor"
        d="M100,0 C108,52 148,92 200,100 C148,108 108,148 100,200 C92,148 52,108 0,100 C52,92 92,52 100,0 Z"
      />
    </svg>
  );
}

export function Leaf({ className = '', rotate }: ShapeProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style(rotate)} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M172,26 C120,20 52,44 32,104 C20,140 34,168 58,178 C96,194 152,164 170,110 C178,84 176,50 172,26 Z"
      />
      <path d="M160,40 C120,80 92,124 74,172" fill="none" stroke="hsl(var(--cream))" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** Wave-shaped section divider, used to cut one background band into the next. */
export function WaveDivider({ className = '', fill = 'hsl(var(--cream))', flip = false }: { className?: string; fill?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0,52 C90,16 180,16 270,46 C360,76 450,76 540,50 C630,24 720,24 810,50 C900,76 990,76 1080,48 C1170,20 1260,20 1350,44 C1395,56 1420,60 1440,58 L1440,90 L0,90 Z"
        fill={fill}
      />
    </svg>
  );
}

/**
 * The band of shapes that floats in the gap between two sections.
 * Rendered absolutely inside a relatively-positioned spacer so it can bleed
 * over the boundary without affecting layout.
 */
export function FloatingBand({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' }) {
  // Generated artwork floats between sections; placement varies per gap so no
  // two read alike.
  if (variant === 'a') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-x-clip" aria-hidden="true">
        <Floater name="wave" className="absolute left-[4%] -top-4 w-24 animate-drift md:w-32" rotate={-6} />
        <Floater name="sun" className="absolute right-[30%] -top-2 w-14 animate-spin-slow md:w-20" />
        <Floater name="surfboard" className="absolute right-[8%] -top-6 w-10 animate-drift-slow md:w-14" rotate={22} />
      </div>
    );
  }
  if (variant === 'b') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-x-clip" aria-hidden="true">
        <Floater name="hibiscus" className="absolute left-[8%] -top-3 w-16 animate-drift-slow md:w-24" rotate={-14} />
        <Floater name="smokeRun" className="absolute right-[2%] top-1 w-56 animate-drift md:w-72" flip />
        <Floater name="wave" className="absolute left-[44%] -top-1 w-16 animate-drift md:w-24" rotate={6} flip />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-x-clip" aria-hidden="true">
      <Floater name="palm" className="absolute left-[6%] -top-4 w-20 animate-drift md:w-28" rotate={-8} />
      <Floater name="surfboard" className="absolute left-[50%] -top-5 w-9 animate-drift-slow md:w-12" rotate={-16} />
      <Floater name="hibiscus" className="absolute right-[10%] -top-2 w-14 animate-drift md:w-20" rotate={18} flip />
    </div>
  );
}
