import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealLabel, revealLines } from '../../lib/reveal';
import { scrollToHash } from '../../lib/scroll';
import { useMagnetic } from '../../hooks/useMagnetic';
import { SECTIONS } from '../../data/sections';
import './Footer.css';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLAnchorElement>(null);

  useMagnetic(topRef, 0.35);

  useLayoutEffect(() => {
    const footer = ref.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      footer.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el, { start: 'top 95%' }));
      footer.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => revealLines(el, { start: 'top 95%' }));

      // The wordmark rises out of the bottom edge as the page runs out.
      gsap.matchMedia().add(MQ.motion, () => {
        gsap.fromTo('[data-wordmark]', { yPercent: 55 }, {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true },
        });
      });
    }, footer);

    return () => ctx.revert();
  }, []);

  const onNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    const hash = e.currentTarget.getAttribute('href');
    if (!hash?.startsWith('#')) return;
    e.preventDefault();
    scrollToHash(hash);
  };

  return (
    <footer id="colophon" className="footer" ref={ref} data-tone="dark">
      <div className="footer__grid grid">
        <div className="footer__intro">
          <p className="t-label" data-reveal="label">
            Middle-earth / 001
          </p>
          <p className="footer__note" data-reveal="lines">
            A non-commercial digital study inspired by J.R.R. Tolkien’s <em>The Lord of the Rings</em>. Not affiliated
            with the Tolkien Estate, Middle-earth Enterprises or Warner Bros.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <p className="t-label" data-reveal="label">
            Index
          </p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={onNavigate} data-cursor="Explore">
                  <span className="t-mono">{s.index}</span>
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="footer__meta">
          <p className="t-label" data-reveal="label">
            Colophon
          </p>
          <p className="footer__note" data-reveal="lines">
            React, GSAP and a single scroll-driven video. Set in Instrument Serif and Geist.
          </p>
          <a className="footer__top t-label" href="#top" ref={topRef} onClick={onNavigate} data-cursor="none">
            <span aria-hidden="true">↑</span>
            <span className="sr-only">Back to the </span>
            <span>Top</span>
          </a>
        </div>
      </div>

      <div className="footer__base" aria-hidden="true">
        <p className="footer__wordmark" data-wordmark>
          Middle-earth
        </p>
      </div>
    </footer>
  );
}
