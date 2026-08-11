/**
 * Hand-drawn icon set.
 *
 * Replaces the stock icon library so the marks match the poster line — uneven,
 * slightly wobbly strokes with round caps, drawn on a 48×48 grid at a single
 * weight. They inherit `currentColor` and scale with the type around them.
 *
 * Every icon is decorative: labels always sit next to them, so they are hidden
 * from assistive tech.
 */

type IconProps = { className?: string; strokeWidth?: number };

const base = (className: string) => `${className}`;

function Svg({ children, className = '', strokeWidth = 2.4 }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Stacked swell lines — surf skill. */
export function IconSwell(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 30c4-6 8-6 12 0s8 6 12 0 8-6 12 0" />
      <path d="M4 19c4-6 8-6 12 0s8 6 12 0 8-6 12 0" />
    </Svg>
  );
}

/** Lightning bolt with a lopsided kick — vibe. */
export function IconBolt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M27 4 13 27h9l-3 17 16-24h-10l2-16Z" />
    </Svg>
  );
}

/** Sun with uneven rays — season. */
export function IconSun(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="24" cy="24" r="8.5" />
      <path d="M24 5.5v4M24 38.5v4M5.5 24h4M38.5 24h4M11 11l2.8 2.8M34.2 34.2 37 37M37 11l-2.8 2.8M13.8 34.2 11 37" />
    </Svg>
  );
}

/** Leaf with a vein — sustainability / CSR. */
export function IconLeaf(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M41 8C24 6 9 15 8 28c-.6 8 5 12 11 11 10-1.7 19-13 22-31Z" />
      <path d="M35 14C26 21 20 30 16 40" />
    </Svg>
  );
}

/** Two-stroke heart, drawn slightly off-centre — perfect for. */
export function IconHeart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M24 41C11 32 6 25 6 18.5 6 12 11 8 16 8c3.6 0 6.4 2 8 5 1.6-3 4.4-5 8-5 5 0 10 4 10 10.5C42 25 37 32 24 41Z" />
    </Svg>
  );
}

/** Curved arrow — duration. */
export function IconArrow(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 20c8-9 20-11 33-4" />
      <path d="M30 8.5 38 16l-8 5" />
    </Svg>
  );
}

/** Surfboard, three-quarter — local instruction. */
export function IconBoard(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M31 4c8 8 11 22 6 30-4.7 7.5-14 10.4-21 8-2.6-.9-3.6-3-3-6C15 26 21 12 31 4Z" />
      <path d="M25 12c-2.5 8-4 18-4 26" />
    </Svg>
  );
}

/** Roof-racked van — sorted gear / rides to the spot. */
export function IconVan(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 30V19c0-2 1.4-3 3-3h20l8 7h4c1.7 0 3 1.3 3 3v4" />
      <path d="M5 30h5M18 30h12M39 30h4" />
      <circle cx="14" cy="31" r="4.5" />
      <circle cx="35" cy="31" r="4.5" />
      <path d="M12 13h18" />
    </Svg>
  );
}

/** Two cups clinked — social vibes. */
export function IconCheers(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 11h13l-2.4 12.5c-.4 2-2 3.5-4.1 3.5s-3.7-1.5-4.1-3.5Z" />
      <path d="M27 11h13l-2.4 12.5c-.4 2-2 3.5-4.1 3.5s-3.7-1.5-4.1-3.5Z" />
      <path d="M14.5 27v10M33.5 27v10M9 40h11M28 40h11" />
    </Svg>
  );
}

/** Small four-point sparkle used as a list bullet. */
export function IconSparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={base(className)} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M24 2c2 12 10 20 22 22-12 2-20 10-22 22-2-12-10-20-22-22 12-2 20-10 22-22Z"
      />
    </svg>
  );
}

/** Ticked circle used for the "also included" lists. */
export function IconTick({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 25.5 19 35 39 12" />
    </svg>
  );
}
