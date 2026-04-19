import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShield } from 'react-icons/fi';

const NAV_LINKS = [
  { href: '/#about',          label: 'About',        section: 'about' },
  { href: '/#skills',         label: 'Skills',       section: 'skills' },
  { href: '/#experience',     label: 'Experience',   section: 'experience' },
  { href: '/#projects',       label: 'Projects',     section: 'projects' },
  { href: '/#certifications', label: 'Certs',        section: 'certifications' },
  { href: '/#arsenal',        label: 'Arsenal',      section: 'arsenal' },
  { href: '/#hall-of-fame',   label: 'Hall of Fame', section: 'hall-of-fame' },
  { href: '/blog',            label: 'Blog',         section: null },
  { href: '/ctf',             label: 'CTF',          section: null },
  { href: '/#news',           label: 'News',         section: 'news' },
  { href: '/#contact',        label: 'Contact',      section: 'contact' },
];

const SECTION_IDS = NAV_LINKS.map(l => l.section).filter(Boolean);

export default function Navbar() {
  const [open,          setOpen]          = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(''); return; }

    const observers = [];
    const visible = new Map();

    const pick = () => {
      let best = '';
      let bestTop = Infinity;
      visible.forEach((rect, id) => {
        if (rect.top < bestTop) { bestTop = rect.top; best = id; }
      });
      setActiveSection(best);
    };

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.set(id, entry.boundingClientRect);
          } else {
            visible.delete(id);
          }
          pick();
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [location.pathname]);

  const isActive = (link) => {
    if (link.section) return activeSection === link.section;
    return location.pathname === link.href;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-darker/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-primary/50 flex items-center justify-center
                          group-hover:bg-primary/10 transition-colors rounded">
            <FiShield className="text-primary" size={16} />
          </div>
          <span className="font-display text-xs font-bold text-primary tracking-widest hidden sm:block">
            NITESH.DEV
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <a
                key={link.href}
                href={link.href}
                className="nav-link relative transition-colors duration-200"
                style={{ color: active ? 'var(--color-primary, #00d4ff)' : undefined }}
              >
                <span className="text-primary/40 mr-1">›</span>
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-primary p-2 rounded hover:bg-primary/10 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-darker/98 backdrop-blur-md border-b border-border px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-sm py-3 border-b border-border/40 flex items-center gap-2 transition-colors"
                style={{ color: active ? '#00d4ff' : '#9ca3af' }}
              >
                <span className="text-primary">$</span> {link.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
