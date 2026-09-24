import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealLabel, revealLines } from '../../lib/reveal';
import { scrollToHash } from '../../lib/scroll';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useLanguage } from '../../hooks/useLanguage';
import { useTextLayoutEffect } from '../../hooks/useTextLayoutEffect';
import { SECTIONS } from '../../data/sections';
import { T } from '../../i18n';
import './Footer.css';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLAnchorElement>(null);

  const { t, script } = useLanguage();

  useMagnetic(topRef, 0.35);

  useLayoutEffect(() => {
    const footer = ref.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      footer.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el, { start: 'top 95%' }));

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

  // The notes are split into lines, so they are rebuilt when their words change.
  const note = t('footer.note') + t('footer.work');
  const colophonNote = t('footer.colophonNote');

  useTextLayoutEffect(
    (settled) => {
      const footer = ref.current;
      if (!footer) return;

      const ctx = gsap.context(() => {
        footer
          .querySelectorAll<HTMLElement>('[data-reveal="lines"]')
          .forEach((el) => revealLines(el, { start: 'top 95%', settled }));
      }, footer);

      return () => ctx.revert();
    },
    // Lines are split where the current face breaks them: a new face re-splits.
    [note, colophonNote, script],
  );

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
            <T k="brand.name" /> / 001
          </p>
          <p key={note} className="footer__note" data-reveal="lines">
            <T
              k="footer.note"
              values={{
                work: (
                  <em>
                    <T k="footer.work" />
                  </em>
                ),
              }}
            />
          </p>
        </div>

        <nav className="footer__nav" aria-label={t('footer.nav')}>
          <p className="t-label" data-reveal="label">
            <T k="footer.index" />
          </p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={onNavigate} data-cursor={t('cursor.explore')}>
                  <span className="t-mono">{s.index}</span>
                  <span>
                    <T k={`sections.${s.id}`} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="footer__meta">
          <p className="t-label" data-reveal="label">
            <T k="footer.colophon" />
          </p>
          <p key={colophonNote} className="footer__note" data-reveal="lines">
            <T k="footer.colophonNote" />
          </p>
          <a className="footer__top t-label" href="#top" ref={topRef} onClick={onNavigate} data-cursor="none">
            <span aria-hidden="true">↑</span>
            <span className="sr-only">{t('footer.backTo')}</span>
            <span>
              <T k="footer.top" />
            </span>
          </a>
        </div>
      </div>

      <div className="footer__base" aria-hidden="true">
        <p className="footer__wordmark" data-wordmark>
          <T k="brand.name" />
        </p>
      </div>
    </footer>
  );
}
