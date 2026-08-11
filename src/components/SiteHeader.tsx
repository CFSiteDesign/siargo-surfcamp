import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, User, MessageSquare, Home } from 'lucide-react';
import logo from '@/assets/menu-bar-logo.png';
import { withTracking } from '@/lib/tracking';

const MM_BASE = 'https://madmonkeyhostels.com';

/** Main-site URL with any campaign params from the landing page forwarded on. */
const mm = (path = '') => withTracking(`${MM_BASE}${path}`);

const sleepLocations = {
  AUSTRALIA: [{ name: 'Coogee Beach Sydney', slug: 'coogee-beach-sydney' }],
  CAMBODIA: [
    { name: 'Koh Sdach', slug: 'koh-sdach' },
    { name: 'Koh Rong', slug: 'koh-rong' },
    { name: 'Phnom Penh', slug: 'phnom-penh' },
    { name: 'Siem Reap', slug: 'siem-reap' },
  ],
  INDONESIA: [
    { name: 'Gili Trawangan', slug: 'gili-trawangan' },
    { name: 'Kuta Lombok', slug: 'kuta-lombok' },
    { name: 'Nusa Lembongan', slug: 'nusa-lembongan' },
    { name: 'Uluwatu', slug: 'uluwatu' },
  ],
  LAOS: [
    { name: 'Luang Prabang', slug: 'luang-prabang' },
    { name: 'Vang Vieng', slug: 'vang-vieng' },
  ],
  PHILIPPINES: [
    { name: 'Dumaguete', slug: 'dumaguete' },
    { name: 'Nacpan Beach', slug: 'nacpan-beach' },
    { name: 'Manila', slug: 'manila' },
    { name: 'Panglao', slug: 'panglao' },
    { name: 'Siargao', slug: 'siargao' },
    { name: 'Siquijor', slug: 'siquijor' },
  ],
  THAILAND: [
    { name: 'Bangkok', slug: 'bangkok' },
    { name: 'Chiang Mai', slug: 'chiang-mai' },
    { name: 'Pai', slug: 'pai' },
    { name: 'Phuket', slug: 'phuket' },
  ],
  VIETNAM: [
    { name: 'Ha Giang', slug: 'ha-giang' },
    { name: 'Hanoi', slug: 'hanoi' },
    { name: 'Hoi An', slug: 'hoi-an' },
  ],
};

const experienceLinks = [
  { name: 'Ha Giang Loop', slug: 'ha-giang-loop' },
  { name: 'Surf Camp Siargao', slug: 'siargao' },
  { name: 'Surf Camp Lombok', slug: 'kuta-lombok' },
  { name: 'Island Hopping', slug: 'island-hopping' },
];

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const sleepRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sleepRef.current && !sleepRef.current.contains(e.target as Node)) setSleepOpen(false);
      if (expRef.current && !expRef.current.contains(e.target as Node)) setExpOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const textColor = isScrolled ? 'text-foreground' : 'text-primary-foreground';
  const hoverColor = 'hover:text-coral';

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-cream shadow-lg' : 'bg-transparent'}`}>
        {/* Top bar - hidden on mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo */}
            <a href={mm()} className="shrink-0">
              <img src={logo} alt="Mad Monkey Surf Camp" className="h-8 md:h-10 w-auto object-contain" />
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <a href={mm('/our-story')} className={`px-3 py-2 text-sm font-semibold ${textColor} ${hoverColor} transition-colors`}>
                Our Story
              </a>

              {/* Sleep Dropdown */}
              <div ref={sleepRef} className="relative">
                <button
                  onClick={() => { setSleepOpen(!sleepOpen); setExpOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold ${textColor} ${hoverColor} transition-colors`}
                >
                  Sleep <ChevronDown size={14} className={`transition-transform ${sleepOpen ? 'rotate-180' : ''}`} />
                </button>
                {sleepOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-card rounded-2xl shadow-2xl p-6 min-w-[520px] grid grid-cols-3 gap-4 animate-fade-in z-50">
                    {Object.entries(sleepLocations).map(([region, locations]) => (
                      <div key={region}>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{region}</p>
                        {locations.map(loc => (
                          <a key={loc.slug} href={mm(`/${loc.slug}`)} className="block text-sm py-1 text-foreground hover:text-coral transition-colors">
                            {loc.name}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Dropdown */}
              <div ref={expRef} className="relative">
                <button
                  onClick={() => { setExpOpen(!expOpen); setSleepOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold ${textColor} ${hoverColor} transition-colors`}
                >
                  Experience <ChevronDown size={14} className={`transition-transform ${expOpen ? 'rotate-180' : ''}`} />
                </button>
                {expOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-card rounded-2xl shadow-2xl p-4 min-w-[200px] animate-fade-in z-50">
                    {experienceLinks.map(link => (
                      <a key={link.slug} href={mm(`/${link.slug}`)} className="block text-sm py-2 text-foreground hover:text-coral transition-colors">
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a href={mm('/mad-loyalty')} className={`px-3 py-2 text-sm font-semibold ${textColor} ${hoverColor} transition-colors`}>
                Mad Loyalty
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <a href={mm('/login')} target="_self" className={`hidden lg:block px-3 py-2 text-sm font-semibold ${textColor} ${hoverColor} transition-colors`}>
                Login
              </a>
              <a
                href="#basecamp"
                className="bg-coral text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:bg-coral/90 transition-all shadow-sm"
              >
                Book Now
              </a>

              {/* Mobile hamburger */}
              <button className="lg:hidden ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <div className={`space-y-1.5 ${mobileMenuOpen ? '' : ''}`}>
                  <span className={`block w-6 h-0.5 transition-all ${isScrolled ? 'bg-foreground' : 'bg-primary-foreground'} ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block w-6 h-0.5 transition-all ${isScrolled ? 'bg-foreground' : 'bg-primary-foreground'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block w-6 h-0.5 transition-all ${isScrolled ? 'bg-foreground' : 'bg-primary-foreground'} ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cream shadow-lg py-6 px-6 flex flex-col gap-3 animate-fade-in max-h-[80vh] overflow-y-auto">
            <a href={mm('/our-story')} className="font-semibold text-lg">Our Story</a>
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                Sleep <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 ml-2 grid grid-cols-2 gap-3">
                {Object.entries(sleepLocations).map(([region, locations]) => (
                  <div key={region}>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{region}</p>
                    {locations.map(loc => (
                      <a key={loc.slug} href={mm(`/${loc.slug}`)} className="block text-sm py-0.5 hover:text-coral">{loc.name}</a>
                    ))}
                  </div>
                ))}
              </div>
            </details>
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                Experience <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 ml-2">
                {experienceLinks.map(link => (
                  <a key={link.slug} href={mm(`/${link.slug}`)} className="block text-sm py-1 hover:text-coral">{link.name}</a>
                ))}
              </div>
            </details>
            <a href={mm('/mad-loyalty')} className="font-semibold text-lg">Mad Loyalty</a>
            <a href={mm('/login')} target="_self" className="font-semibold text-lg">Login</a>
          </div>
        )}
      </nav>

    </>
  );
}
