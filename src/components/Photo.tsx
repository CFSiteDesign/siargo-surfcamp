/**
 * Photo slot.
 *
 * The Siargao photography hasn't landed yet — the brand-assets Drive folder in
 * the brief isn't reachable from here — so every image on the page goes through
 * this component. Pass `src` and it renders the real photograph, graded and
 * grained to match the poster look. Leave `src` off and it renders a designed
 * stand-in in palette colours that states which shot belongs there, so the
 * layout can be reviewed at full fidelity and nothing ships as a broken icon.
 *
 * Dropping the real photos in is therefore a one-line change per slot:
 *   <Photo brief="…" />  →  <Photo src={heroSurf} brief="…" />
 */

type PhotoProps = {
  /** Imported asset. When absent, the placeholder is drawn instead. */
  src?: string;
  /** What this shot should show. Doubles as the alt text for real images. */
  brief: string;
  className?: string;
  /** Palette tint for the placeholder. */
  tone?: 'blue' | 'coral' | 'yellow' | 'pink' | 'sea' | 'lilac';
  loading?: 'lazy' | 'eager';
  /** Suppress the placeholder caption where copy is layered over the slot. */
  hideLabel?: boolean;
};

const TONES: Record<NonNullable<PhotoProps['tone']>, { from: string; to: string }> = {
  blue: { from: 'hsl(var(--blue))', to: 'hsl(var(--cream))' },
  coral: { from: 'hsl(var(--coral))', to: 'hsl(var(--yellow))' },
  yellow: { from: 'hsl(var(--yellow))', to: 'hsl(var(--cream))' },
  pink: { from: 'hsl(var(--pink))', to: 'hsl(var(--blue))' },
  /* Poster tones: the green-teal ocean of the reference photograph, and the
     lilac wash for slots that sit under smoke. */
  sea: { from: 'hsl(var(--blue))', to: 'hsl(var(--sea))' },
  lilac: { from: 'hsl(var(--lilac))', to: 'hsl(var(--sea))' },
};

export default function Photo({ src, brief, className = '', tone = 'blue', loading = 'lazy', hideLabel = false }: PhotoProps) {
  if (src) {
    return <img src={src} alt={brief} loading={loading} className={`film-grade object-cover ${className}`} />;
  }

  const { from, to } = TONES[tone];

  /*
   * Layered with a single-cell grid rather than absolute children, so the
   * wrapper never needs `position: relative` of its own. Callers routinely pass
   * `absolute inset-0` to use a photo as a background, and Tailwind emits
   * `.relative` after `.absolute` — a hardcoded `relative` here would silently
   * win and drop the image back into normal flow.
   */
  return (
    <div className={`grid overflow-hidden bg-muted ${className}`} role="img" aria-label={`Placeholder — ${brief}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full [grid-area:1/1]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#g-${tone})`} />
        {/* horizon + swell, so the empty slot still reads as ocean */}
        <circle cx="312" cy="78" r="34" fill="hsl(var(--cream))" opacity="0.55" />
        <path d="M0,186 C48,168 96,168 144,184 C192,200 240,200 288,182 C336,164 372,166 400,178 L400,300 L0,300 Z" fill="hsl(var(--ink))" opacity="0.10" />
        <path d="M0,214 C56,196 112,198 168,214 C224,230 280,228 336,212 C364,204 384,204 400,208 L400,300 L0,300 Z" fill="hsl(var(--ink))" opacity="0.14" />
      </svg>

      {/* Grain, so placeholders sit in the same texture as graded photographs */}
      <div className="grain relative [grid-area:1/1]" />

      {/* Centred rather than anchored to an edge: several slots are used as card
          backgrounds that already carry a label top and title bottom. */}
      {!hideLabel && (
        <div className="flex items-center justify-center p-4 [grid-area:1/1]">
          <p className="max-w-full rounded-lg bg-ink/70 px-3 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-wider text-cream backdrop-blur-sm">
            Photo to come
            <span className="block font-normal normal-case tracking-normal opacity-80">{brief}</span>
          </p>
        </div>
      )}
    </div>
  );
}
