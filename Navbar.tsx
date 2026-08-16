import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { Globe } from 'lucide-react';

export default function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { getContent } = useContent();
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const navContent = getContent('navigation_links');
  
  const navLinks = useMemo(() => {
    if (navContent && navContent.body) {
      try {
        const parsed = JSON.parse(navContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any) => ({ name: item.label, href: item.href }));
        }
      } catch (e) {}
    }
    return [
      { name: t.nav.services, href: '/services' },
      { name: t.nav.portfolio, href: '/portfolio' },
      { name: t.nav.faq, href: '/faq' },
    ];
  }, [navContent]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMobileNavOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav id="nav" className={isScrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo flex items-center gap-3" onClick={() => window.scrollTo(0,0)}>
            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
                <defs>
                  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5D76E" />
                    <stop offset="50%" stopColor="#C59B27" />
                    <stop offset="100%" stopColor="#8A6B1C" />
                  </linearGradient>
                  <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#A0B2C6" />
                    <stop offset="100%" stopColor="#5A728A" />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3" />
                  </filter>
                </defs>
                
                {/* Z */}
                <path d="M25 35 L75 35 L40 85 L95 85" fill="none" stroke="url(#silver)" strokeWidth="16" strokeLinejoin="miter" filter="url(#shadow)" />
                
                {/* R */}
                <path d="M50 25 L85 25 C100 25 105 35 105 45 C105 55 95 62 85 62 L50 62 Z M50 25 L50 95 M75 62 L100 95" fill="none" stroke="url(#gold)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold leading-tight text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>{t.common.riyadhGlass}</span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-gray-500 uppercase leading-none mt-1">Zujaj Alriyad</span>
            </div>
          </Link>

          <ul className="nav-links">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                {link.href.startsWith('#') ? (
                  <a href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href.substring(1)); }}>{link.name}</a>
                ) : (
                  <Link to={link.href}>{link.name}</Link>
                )}
              </li>
            ))}
            <li><Link to="/contact" className="btn nav-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {t.nav.contact}
            </Link></li>
          </ul>

          <button className={`hamburger ${isMobileNavOpen ? 'open' : ''}`} aria-label="القائمة" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>

        <div className={`mobile-nav ${isMobileNavOpen ? 'open' : ''}`}>
          {navLinks.map((link, idx) => (
             link.href.startsWith('#') ? (
               <a key={idx} href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href.substring(1)); }}>{link.name}</a>
             ) : (
               <Link key={idx} to={link.href} onClick={() => setIsMobileNavOpen(false)}>{link.name}</Link>
             )
          ))}
          <button onClick={() => { toggleLanguage(); setIsMobileNavOpen(false); }} className="nav-cta-mobile flex justify-center items-center gap-2 mb-4 bg-slate-100 text-slate-800">
            <Globe className="w-5 h-5" />
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
          <Link to="/contact" className="nav-cta-mobile" onClick={() => setIsMobileNavOpen(false)}>{t.nav.requestQuote}</Link>
        </div>
      </nav>
    </>
  );
}
