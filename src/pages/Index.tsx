import { useEffect, useState } from 'react';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Photo from '@/components/Photo';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import { FloatingBand, WaveDivider, Floater } from '@/components/Deco';
import {
  IconSwell, IconBolt, IconSun, IconLeaf, IconHeart, IconArrow,
  IconSparkle, IconTick,
} from '@/components/Icons';
import { withTracking } from '@/lib/tracking';

import surfCampLogo from '@/assets/surf-camp-logo.png';

import heroPhoto from '@/assets/photos/hero.jpg';
import breakJackingHorse from '@/assets/photos/break-jacking-horse.jpg';
import breakCemetery from '@/assets/photos/break-cemetery.jpg';
import breakTuason from '@/assets/photos/break-tuason.jpg';
import groupPhoto from '@/assets/photos/group.jpg';
import vibesBoat from '@/assets/photos/vibes-boat.jpg';
import vibesPacifico from '@/assets/photos/vibes-pacifico.jpg';
import vibesAdventure from '@/assets/photos/vibes-adventure.jpg';
import vibesWake from '@/assets/photos/vibes-wake.jpg';
import digsRooms from '@/assets/photos/digs-rooms.jpg';
import digsFacilities from '@/assets/photos/digs-facilities.jpg';
import digsFood from '@/assets/photos/digs-food.jpg';

/**
 * Booking destinations on the main site.
 *
 * TODO(charlie): confirm these slugs — the brief doesn't name them. Modelled on
 * the Kuta Lombok camp, which uses /tours-events/surf-camp and
 * /tours-events/surf-camp-4-day. Campaign params are forwarded by withTracking.
 */
const BOOK_URLS = {
  '7': 'https://madmonkeyhostels.com/tours-events/siargao-surf-camp',
  '4': 'https://madmonkeyhostels.com/tours-events/siargao-surf-camp-4-day',
} as const;

/**
 * Prices are the GM's listing prices, confirmed by Lexie 2026-08-11. PHP is the
 * fixed cost and leads; the USD figure is approximate and labelled as such.
 */
const PACKAGES = [
  {
    id: '7',
    ribbon: 'Prefer a shorter stay? There is a 4-day package too',
    level: 'Level 1 - 3',
    name: '7 Days / 6 Nights',
    price: '₱48,000',
    usd: 'approx. $790 USD',
    per: 'per person',
    pitch: 'The full island run. Longest water time, the Pacifico trip, and every night sorted.',
    unique: [
      '10 hours of surf coaching',
      'Pacifico surf trip with Magpupungko',
      'Phone & drone video analysis',
      'Welcome dinner',
    ],
    included: [
      "6 nights' accommodation",
      'All breakfasts and lunches',
      'Board hire',
      'Surf fees',
      'Theory session',
      'Tri-Island Party Boat Tour',
      'Surf merch pack',
      'Nightly social events',
    ],
  },
  {
    id: '4',
    ribbon: null,
    level: 'Level 1 - 3',
    name: '4 Days / 3 Nights',
    price: '₱28,000',
    usd: 'approx. $460 USD',
    per: 'per person',
    pitch: 'Short stay, same standard. Enough water time to stand up and stay up.',
    unique: ['6 hours of surf coaching', 'Phone video analysis'],
    included: [
      "3 nights' accommodation",
      'All breakfasts and lunches',
      'Board hire',
      'Surf fees',
      'Theory session',
      'Tri-Island Party Boat Tour',
      'Surf merch pack',
      'Nightly social events',
    ],
  },
] as const;

const EXPECT = [
  {
    title: 'Local instruction',
    copy: 'Paired with an instructor based on how you ride — from gentle beach setups to open ocean reef breaks.',
    bg: 'bg-lilac',
  },
  {
    title: 'Sorted gear',
    copy: 'Boards, zinc, and daily rides to the spot are set before you wake up.',
    bg: 'bg-blue/60',
  },
  {
    title: 'Social vibes',
    copy: 'Easygoing hostel setup — grab a drink by the pool, join group dinners, or do your own thing.',
    bg: 'bg-lilac/50',
  },
];

const BREAKS = [
  {
    label: 'For Beginners',
    name: 'Jacking Horse',
    copy: 'Gentle, accessible waves a short walk from the boardwalk. Designed for early wins.',
    src: breakJackingHorse,
    tone: 'sea' as const,
    photo: 'Beginners on the whitewater at Jacking Horse, boardwalk behind',
  },
  {
    label: 'For Intermediates',
    name: 'Cemetery',
    copy: 'A forgiving right-hand reef break with open faces, giving you time to read the wave and work on speed.',
    src: breakCemetery,
    tone: 'lilac' as const,
    photo: 'Surfer on an open right-hand face at Cemetery',
  },
  {
    label: 'For Stepping It Up',
    name: 'Tuason Point',
    copy: 'Faster, more powerful lefts for confident surfers looking for speed before taking on Cloud 9.',
    src: breakTuason,
    tone: 'sea' as const,
    photo: 'Fast left-hander breaking over reef at Tuason Point',
  },
];

const GOOD_VIBES = [
  { name: 'Tri-Island Boat Party Tour', tag: 'Included', note: null, src: vibesBoat, tone: 'sea' as const, photo: 'Boat party between Naked, Daku and Guyam islands' },
  { name: 'Pacifico surf trip with Magpupungko', tag: 'Included', note: '7 days only', src: vibesPacifico, tone: 'lilac' as const, photo: 'Magpupungko rock pools at low tide' },
  { name: 'Adventure Land Tour', tag: 'Add-on', note: 'Buy at camp', src: vibesAdventure, tone: 'sea' as const, photo: 'Palm-lined road on a motorbike island tour' },
  { name: 'Siargao Wakeboarding', tag: 'Add-on', note: 'Buy at camp', src: vibesWake, tone: 'lilac' as const, photo: 'Wakeboarding on the lagoon cable park' },
];

const DIGS = [
  {
    name: 'Rooms',
    copy: 'At our surf camp, all the rooms have a rustic design, plenty of light, comfortable beds & modern facilities.',
    src: digsRooms,
    tone: 'lilac' as const,
    photo: 'Rustic room with natural light and timber ceiling',
  },
  {
    name: 'Facilities',
    copy: 'Go for a dip in the pool, order a tropical cocktail in the bar, chill in the sun or get to know your fellow travellers.',
    src: digsFacilities,
    tone: 'sea' as const,
    photo: 'Pool with travellers hanging out, palms behind',
  },
  {
    name: 'Food',
    copy: 'Enjoy a mix of local favs, delicious tacos, exotic flavours and western favourites. We serve breakfast and lunch every day at the camp.',
    src: digsFood,
    tone: 'sea' as const,
    photo: 'Fresh poke-style bowl held by the pool',
  },
];

const FAQS = [
  {
    q: 'Never surfed before?',
    a: "You're good. Beginners start on mellow spots like Jacking Horse or Guiuan with full 1-on-1 coaching.",
  },
  {
    q: 'What do I need to pack?',
    a: 'Boardshorts or bikini, sunscreen/zinc, and a rashguard. We handle boards, wax, and boats.',
  },
];

type StatItem = { Icon: (p: { className?: string }) => JSX.Element; label: string; value: string };

/** The small stat row lifted from the reference layout. */
function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-y-10 md:grid-cols-4">
      {items.map(({ Icon, label, value }, i) => (
        <Reveal key={label} delay={i * 70} className="flex flex-col items-center px-1 text-center">
          <Icon className="mb-3.5 h-7 w-7 text-ink" />
          <p className="font-display text-[11px] uppercase tracking-[0.14em] text-ink sm:text-xs">{label}</p>
          <p className="mt-1.5 text-[13px] leading-snug text-ink/70 sm:text-sm">{value}</p>
        </Reveal>
      ))}
    </div>
  );
}

/** Small caps eyebrow above each section heading. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-display text-[11px] uppercase tracking-[0.24em] text-lilac-deep sm:mb-4 sm:text-xs">{children}</p>;
}

export default function Index() {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <SiteHeader />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="halftone-frame grain relative flex min-h-[88svh] items-center justify-center overflow-hidden bg-sea md:min-h-[92vh]">
        <Photo
          src={heroPhoto}
          brief="Surfer sitting on their board in green-glass water, sun path behind"
          tone="sea"
          loading="eager"
          hideLabel
          className="absolute inset-0 h-full w-full object-[42%_center] sm:object-[30%_center] md:object-[20%_center] lg:scale-[1.08]"
        />

        {/* Light scrim to settle the photograph, then a loose frame of the
            generated smoke elements hugging the edges, centre left open. */}
        <div className="absolute inset-0 bg-ink/25" />
        {/* Mirrored pairs, same size and offset each side, per Charlie. */}
        <Floater name="smokeRun" className="absolute left-[3%] top-[8%] w-52 animate-drift-slow sm:w-64 lg:w-80" />
        <Floater name="smokeRun" flip className="absolute right-[3%] top-[8%] hidden w-52 animate-drift-slow sm:block sm:w-64 lg:w-80" />
        <Floater name="smokeCorner" className="absolute left-[3%] top-[42%] w-20 animate-drift sm:w-28 lg:w-36" />
        <Floater name="smokeCorner" flip className="absolute right-[3%] top-[42%] hidden w-20 animate-drift sm:block sm:w-28 lg:w-36" />
        <Floater name="smokeRun" flip className="absolute left-[3%] bottom-[6%] w-44 animate-drift sm:w-56 lg:w-72" />
        <Floater name="smokeRun" className="absolute right-[3%] bottom-[6%] hidden w-44 animate-drift sm:block sm:w-56 lg:w-72" />

        <div className="relative z-20 mx-auto w-full max-w-4xl px-5 py-20 text-center sm:py-24">
          <Reveal>
            <img
              src={surfCampLogo}
              alt="Mad Monkey Surf Camp"
              className="mx-auto mb-6 w-36 drop-shadow-[6px_6px_0_rgba(0,0,0,0.25)] sm:mb-8 sm:w-48 md:w-60"
            />
          </Reveal>

          <Reveal delay={90}>
            <h1 className="bubble-type font-groovy text-[2.1rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
              Warm water, good waves,
              <br />
              zero hassle.
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-relaxed text-cream/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] sm:mt-7 sm:text-base md:text-lg">
              Whether you're standing up for the first time or trying to clean up your pop-up, we get you in the
              water at the right spots with local instructors who know the island inside out.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <a
              href="#packages"
              className="poster-shadow mt-8 inline-block rounded-full border-2 border-ink bg-lilac px-7 py-4 font-display text-[13px] uppercase tracking-[0.12em] text-ink transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:mt-10 sm:px-9 sm:text-sm md:text-base"
            >
              Check Dates &amp; Pricing
            </a>
          </Reveal>
        </div>

        <div className="absolute bottom-0 left-0 z-20 w-full">
          <WaveDivider className="block h-[44px] w-full sm:h-[64px] md:h-[90px]" />
        </div>
      </section>

      {/* Poster ticker */}
      <div className="border-y-2 border-ink bg-lilac py-2.5 text-ink sm:py-3">
        <Marquee items={['Warm water', 'Good waves', 'Zero hassle', 'Local instructors', 'Camps all year']} />
      </div>

      {/* ═══════════════════ WHAT TO EXPECT ═══════════════════ */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-28">
        <Floater name="palm" className="absolute -left-8 top-10 hidden w-32 animate-drift-slow sm:block md:w-44" rotate={-10} />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="mb-10 max-w-3xl sm:mb-14">
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="font-display text-[1.7rem] uppercase leading-[1.08] sm:text-3xl md:text-5xl">
              Most surf camps make things complicated.
              <span className="text-lilac-deep"> We keep it simple.</span>
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {EXPECT.map(({ title, copy, bg }, i) => (
              <Reveal
                key={title}
                delay={i * 90}
                className={`poster-shadow-sm rounded-2xl border-2 border-ink ${bg} p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7`}
              >
                <h3 className="font-display text-base uppercase tracking-wide sm:text-lg">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/80">{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="relative h-14 sm:h-16 md:h-24">
        <FloatingBand variant="a" />
      </div>

      {/* ═══════════════════ THE BREAKS WE SURF ═══════════════════ */}
      <section id="breaks" className="relative overflow-hidden bg-blue/35 py-16 sm:py-20 md:py-28">
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="mb-10 max-w-3xl sm:mb-14">
            <Eyebrow>The breaks we surf</Eyebrow>
            <h2 className="bubble-type font-groovy text-[2rem] leading-[1.05] sm:text-4xl md:text-6xl">Spots picked daily</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/80 sm:mt-5 sm:text-base md:text-lg">
              We pick spots daily based on tide, wind, and your progression level so you spend time riding, not
              paddling against the drift.
            </p>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {BREAKS.map((b, i) => (
              <Reveal as="article" key={b.name} delay={i * 90} className="group">
                <div className="torn-edge overflow-hidden">
                  <Photo
                    src={b.src}
                    brief={b.photo}
                    tone={b.tone}
                    className="h-56 w-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] sm:h-64 md:h-72"
                  />
                </div>
                <p className="mt-4 inline-block rounded-full bg-ink px-3 py-1 font-display text-[10px] uppercase tracking-[0.14em] text-cream sm:mt-5">
                  {b.label}
                </p>
                <h3 className="mt-2.5 font-display text-xl uppercase leading-tight sm:mt-3 sm:text-2xl">{b.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{b.copy}</p>
                {i === 0 && <Floater name="wave" className="mt-4 hidden w-20 md:block" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PACKAGES ═══════════════════ */}
      <section id="packages" className="relative scroll-mt-20 bg-cream py-16 sm:py-20 md:py-28">
        <Floater name="smokeCorner" className="absolute right-2 top-8 w-16 animate-drift sm:right-5 sm:w-20 md:w-28" rotate={12} />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="mb-10 max-w-3xl sm:mb-14">
            <Eyebrow>Packages</Eyebrow>
            <h2 className="bubble-type font-groovy text-[2rem] leading-[1.05] sm:text-4xl md:text-6xl">No hidden costs</h2>
            <p className="mt-4 text-[15px] text-ink/80 sm:mt-5 sm:text-base md:text-lg">
              No mandatory add-ons. What you see is what you pay.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 md:gap-7">
            {PACKAGES.map((pkg, i) => (
              <Reveal
                key={pkg.id}
                delay={i * 110}
                className="poster-shadow flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card"
              >
                {pkg.ribbon ? (
                  <p className="bg-ink px-5 py-2.5 text-center text-[11px] font-semibold leading-snug text-cream sm:px-6 sm:py-3 sm:text-xs">
                    {pkg.ribbon}
                  </p>
                ) : (
                  <div className="h-2 bg-lilac" />
                )}

                <div className="flex flex-1 flex-col p-6 sm:p-7 md:p-8">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-ink/50 sm:text-[11px]">{pkg.level}</p>
                  <h3 className="mt-2.5 font-display text-2xl uppercase leading-none sm:text-3xl md:text-4xl">{pkg.name}</h3>

                  <p className="mt-4 font-groovy text-[2.1rem] leading-none text-lilac-deep sm:text-4xl md:text-5xl">{pkg.price}</p>
                  <p className="mt-1.5 text-sm text-ink/60">
                    {pkg.per} · <span className="whitespace-nowrap">{pkg.usd}</span>
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-ink/80 sm:mt-5">{pkg.pitch}</p>

                  <a
                    href={withTracking(BOOK_URLS[pkg.id])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block rounded-full border-2 border-ink bg-lilac py-4 text-center font-display text-[13px] uppercase tracking-[0.12em] text-ink transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:mt-7 sm:text-sm"
                  >
                    Book this trip
                  </a>

                  <div className="mt-7">
                    <p className="font-display text-[11px] uppercase tracking-[0.16em] sm:text-xs">Unique for this package</p>
                    <ul className="mt-3.5 space-y-2.5">
                      {pkg.unique.map(item => (
                        <li key={item} className="flex gap-3 text-sm text-ink/85">
                          <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-lilac-deep" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 sm:mt-7">
                    <p className="font-display text-[11px] uppercase tracking-[0.16em] sm:text-xs">Also included</p>
                    <ul className="mt-3.5 space-y-2.5">
                      {pkg.included.map(item => (
                        <li key={item} className="flex gap-3 text-sm text-ink/85">
                          <IconTick className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 border-t border-ink/10 pt-11 sm:mt-16 sm:pt-14">
            <StatStrip
              items={[
                { Icon: IconSwell, label: 'Surf skill', value: 'Beginner to Advanced' },
                { Icon: IconBolt, label: 'Vibe', value: 'Surfy & Social' },
                { Icon: IconSun, label: 'Season', value: 'All year' },
                { Icon: IconLeaf, label: 'Sustainability', value: 'Dedicated CSR Partner' },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="relative h-14 sm:h-16 md:h-24">
        <FloatingBand variant="b" />
      </div>

      {/* ═══════════════════ ALL THE GOOD VIBES ═══════════════════ */}
      <section id="good-vibes" className="relative bg-ink py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="mb-10 text-center font-display text-2xl uppercase leading-none text-lilac sm:mb-14 sm:text-3xl md:text-5xl">
              All the good vibes
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-4">
            {GOOD_VIBES.map((v, i) => (
              <Reveal as="article" key={v.name} delay={i * 80} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Photo
                  src={v.src}
                  brief={v.photo}
                  tone={v.tone}
                  className="absolute inset-0 h-full w-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/45" />
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 sm:p-5">
                  <div>
                    <p className="font-display text-[9px] uppercase tracking-[0.16em] text-cream sm:text-[10px]">{v.tag}</p>
                    {v.note && <p className="mt-1 text-[11px] text-cream/75 sm:text-xs">{v.note}</p>}
                  </div>
                  <h3 className="font-display text-sm uppercase leading-tight text-cream sm:text-base md:text-lg">{v.name}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ IS THIS FOR ME? ═══════════════════ */}
      <section id="is-this-for-me" className="relative overflow-hidden bg-lilac/35 py-16 sm:py-20 md:py-28">
        <Floater name="smokeRun" flip className="absolute right-[3%] top-10 hidden w-56 animate-drift sm:block md:w-72" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:gap-12 lg:gap-16">
            <Reveal>
              <Eyebrow>Is this for me?</Eyebrow>
              <h2 className="bubble-type font-groovy text-[2rem] leading-[1.05] sm:text-4xl md:text-5xl">Short answer: yes</h2>
              <div className="torn-edge mt-6 overflow-hidden sm:mt-8">
                <Photo src={groupPhoto} brief="Group of surf camp guests laughing with boards after a session" tone="sea" className="h-60 w-full sm:h-72 md:h-80" />
              </div>
            </Reveal>

            <div className="space-y-5 sm:space-y-6">
              {FAQS.map((f, i) => (
                <Reveal
                  key={f.q}
                  delay={i * 90}
                  className="poster-shadow-sm rounded-2xl border-2 border-ink bg-cream p-5 sm:p-6 md:p-7"
                >
                  <h3 className="font-display text-base uppercase leading-tight sm:text-lg">{f.q}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/80 md:text-base">{f.a}</p>
                </Reveal>
              ))}

              <div className="pt-3 sm:pt-4">
                <StatStrip
                  items={[
                    { Icon: IconHeart, label: 'Perfect for', value: 'Solo travellers, Couples, Friends' },
                    { Icon: IconSwell, label: 'Surf skill', value: 'Beginner to Advanced' },
                    { Icon: IconArrow, label: 'Duration', value: '4 or 7 days' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative h-14 sm:h-16 md:h-24">
        <FloatingBand variant="c" />
      </div>

      {/* ═══════════════════ THE DIGS ═══════════════════ */}
      <section id="the-digs" className="relative bg-cream py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mb-10 max-w-3xl sm:mb-14">
            <Eyebrow>The digs</Eyebrow>
            <h2 className="font-display text-[1.7rem] uppercase leading-[1.08] sm:text-3xl md:text-5xl">Mad Monkey Siargao</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/80 sm:mt-5 sm:text-base md:text-lg">
              Your island headquarters for sunrise surfs, coconut-lined roads, and afternoons that somehow turn
              into unforgettable nights.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {DIGS.map((d, i) => (
              <Reveal
                as="article"
                key={d.name}
                delay={i * 90}
                className="poster-shadow-sm overflow-hidden rounded-2xl border-2 border-ink bg-card transition-transform duration-300 hover:-translate-y-1"
              >
                <Photo src={d.src} brief={d.photo} tone={d.tone} className="h-48 w-full sm:h-56" />
                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-lg uppercase leading-tight sm:text-xl">{d.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/80">{d.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CLOSING CTA ═══════════════════ */}
      <section className="grain relative overflow-hidden bg-sea-deep py-16 sm:py-20 md:py-28">
        <Floater name="smokeRun" className="absolute left-[3%] top-4 w-56 animate-drift-slow md:w-80" />
        <Floater name="smokeRun" flip className="absolute right-[3%] bottom-2 w-48 animate-drift md:w-72" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <h2 className="bubble-type font-groovy text-[2rem] leading-[1.05] sm:text-4xl md:text-6xl">
              Get in the water
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] text-cream/95 sm:mt-6 sm:text-base md:text-lg">
              Camps run year round. Grab your dates and we'll sort the rest.
            </p>
            <a
              href={withTracking(BOOK_URLS['7'])}
              target="_blank"
              rel="noopener noreferrer"
              className="poster-shadow mt-8 inline-block rounded-full border-2 border-ink bg-lilac px-7 py-4 font-display text-[13px] uppercase tracking-[0.12em] text-ink transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:mt-9 sm:px-9 sm:text-sm md:text-base"
            >
              Check Dates &amp; Pricing
            </a>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {/* ═══════════════════ STICKY MOBILE BOOKING BAR ═══════════════════
          Phones carry the bulk of this traffic and the page is long, so the
          price and the booking link stay within thumb reach once the hero has
          scrolled away. Desktop keeps the in-page CTAs instead. */}
      <div
        className={`pb-safe fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-cream px-4 pt-3 transition-transform duration-300 ease-out md:hidden ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] uppercase tracking-[0.14em] text-ink/55">From</p>
            <p className="font-groovy text-xl leading-none text-lilac-deep">₱28,000</p>
          </div>
          <a
            href="#packages"
            className="shrink-0 rounded-full border-2 border-ink bg-lilac px-5 py-3 font-display text-[12px] uppercase tracking-[0.1em] text-ink"
          >
            See packages
          </a>
          <a
            href={withTracking(BOOK_URLS['7'])}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border-2 border-ink bg-lilac-deep px-5 py-3 font-display text-[12px] uppercase tracking-[0.1em] text-cream"
          >
            Book
          </a>
        </div>
      </div>
    </div>
  );
}
