import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { gsap, ScrollTrigger, EASE_OUT } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { scrollToHash } from '../../lib/scroll';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useSurfaceTone } from '../../hooks/useSurfaceTone';
import { NAV_LINKS, SECTIONS } from '../../data/sections';
import './Navbar.css';

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  useMagnetic(buttonRef);
  // Frosted ink over film, frosted paper over paper.
  useSurfaceTone(headerRef);

  // ---- Entrance and the transparent → frosted transition --------------------
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        gsap.from('[data-nav-item]', { y: -16, opacity: 0, duration: 1.3, stagger: 0.07, ease: EASE_OUT, delay: 1 });
      }

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top -48',
        end: 'bottom top',
        onToggle: (self) =>
          gsap.to(header, {
            '--nav-bg': self.isActive ? 0.75 : 0,
            '--nav-blur': self.isActive ? '16px' : '0px',
            '--nav-line': self.isActive ? 1 : 0,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: 'auto',
          }),
      });
    }, header);

    return () => ctx.revert();
  }, []);

  // ---- Fullscreen menu timeline (built once, played and reversed) -----------
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion();
      menuTl.current = gsap
        .timeline({ paused: true, defaults: { ease: EASE_OUT } })
        .set(menu, { autoAlpha: 1 })
        .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: reduced ? 0.01 : 0.9, ease: 'expo.inOut' })
        .from('.menu__text', { yPercent: 110, duration: reduced ? 0.01 : 1.1, stagger: 0.06 }, reduced ? 0 : 0.45)
        .from('.menu__num, .menu__foot > *', { opacity: 0, y: reduced ? 0 : 12, duration: 0.8, stagger: 0.04 }, reduced ? 0 : 0.6);
    }, menu);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;

    const root = document.documentElement;
    if (open) {
      root.classList.add('menu-open');
      tl.timeScale(1).play();
      menuRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    } else {
      root.classList.remove('menu-open');
      tl.timeScale(1.6).reverse();
    }
  }, [open]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape closes; Tab cycles between the toggle and the menu links.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current || !buttonRef.current) return;

      const focusables = [buttonRef.current, ...menuRef.current.querySelectorAll<HTMLElement>('a[href]')];
      const index = focusables.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? (index <= 0 ? focusables.length : index) - 1
        : (index + 1) % focusables.length;
      e.preventDefault();
      focusables[next].focus();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const onNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    const hash = e.currentTarget.getAttribute('href');
    if (!hash?.startsWith('#')) return;
    e.preventDefault();
    if (open) {
      close(false);
      // Let the menu start closing before the page moves underneath it.
      window.setTimeout(() => scrollToHash(hash), 280);
    } else {
      scrollToHash(hash);
    }
  };

  return (
    <>
      <header className="nav" ref={headerRef} data-tone="dark">
        <a className="nav__logo t-label" href="#top" onClick={onNavigate} data-nav-item data-cursor="Top">
          <span className="nav__mark" aria-hidden="true" />
          <span>Middle-earth</span>
          <span className="sr-only"> — back to the top</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} data-nav-item>
                <a className="nav__link t-label" href={link.href} onClick={onNavigate} data-cursor="Explore">
                  <span className="nav__roll" data-text={link.label}>
                    <span>{link.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className={`nav__menu t-label ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
          data-nav-item
          data-cursor="none"
        >
          <span className="nav__menu-label">{open ? 'Close' : 'Menu'}</span>
        </button>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        className="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        data-tone="dark"
      >
        <nav className="menu__nav" aria-label="Sections">
          <ol className="menu__list">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a className="menu__link" href={`#${section.id}`} onClick={onNavigate} data-cursor="Explore">
                  <span className="menu__num t-mono">{section.index}</span>
                  <span className="mask">
                    {/* GSAP moves the outer span; CSS hover moves the inner one.
                        A CSS transform transition on a GSAP target corrupts its tween. */}
                    <span className="menu__text">
                      <span className="menu__label">{section.label}</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="menu__foot">
          <p className="t-lead">“Not all those who wander are lost.”</p>
          <p className="t-label">Middle-earth / 001 — A digital study</p>
        </div>
      </div>
    </>
  );
}
