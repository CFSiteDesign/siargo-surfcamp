import { useEffect, useRef, useState } from 'react';

/**
 * Fades and lifts its children into place the first time they scroll into view.
 *
 * Deliberately understated: 14px of travel over 600ms, once, never replayed on
 * scroll-back. Anything larger reads as a slideshow rather than a page.
 *
 * Two safety rails:
 *   - `prefers-reduced-motion` skips the animation entirely and renders visible.
 *   - if IntersectionObserver is unavailable, content renders visible rather
 *     than being stranded at opacity 0.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  /** Stagger in ms, for sequencing a row of cards. */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    /*
     * IntersectionObserver alone is not enough here: embedded/preview panes can
     * suspend observer callbacks entirely, which left above-the-fold content
     * stranded at opacity 0. So visibility is decided by plain geometry — run
     * synchronously now (content already in view reveals immediately, which is
     * the better behaviour for the hero anyway) and again on scroll as a
     * fallback. The observer stays as the cheap wake-up for the common case.
     */
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };

    if (inView()) {
      setShown(true);
      return;
    }

    let io: IntersectionObserver | null = null;
    const show = () => {
      setShown(true);
      io?.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (inView()) show();
    };

    io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) show();
        }
      },
      // Fire a little before the element is fully on screen so the motion has
      // finished by the time the reader's eye arrives.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-[14px] opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
