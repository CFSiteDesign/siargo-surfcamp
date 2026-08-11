/**
 * Poster ticker — a slow band of repeating type, like the strapline printed
 * round the edge of a gig flyer.
 *
 * The track holds the phrase list twice and translates by exactly -50%, so the
 * second copy is in the first copy's starting position when the loop restarts
 * and the seam is invisible. Pure CSS, so it costs nothing on the main thread,
 * and it stops entirely under `prefers-reduced-motion`.
 */
export default function Marquee({
  items,
  className = '',
  reverse = false,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
}) {
  const run = [...items, ...items];

  return (
    <div className={`group relative flex overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 will-change-transform motion-reduce:animate-none"
        style={{
          animation: `marquee 28s linear infinite${reverse ? ' reverse' : ''}`,
        }}
      >
        {run.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8">
            <span className="font-display text-sm uppercase tracking-[0.18em] sm:text-base">{item}</span>
            <span className="text-lg leading-none opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
