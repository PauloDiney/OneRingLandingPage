import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { scrollToHash } from '../../lib/scroll';
import { useLanguage } from '../../hooks/useLanguage';
import { useSurfaceTone } from '../../hooks/useSurfaceTone';
import { CHAPTERS, CHAPTER_TOTAL } from '../../data/regionsPage';
import { T } from '../../i18n';

/**
 * The fixed chapter index (wide screens) and its compact counter (phones,
 * centred in the navbar, where it never covers the page).
 *
 * One ScrollTrigger per chapter decides which is current: React state changes
 * only when the reader crosses into another chapter, never per frame. The
 * hairline beside the list fills with progress from the first chapter to the
 * last. Both stay out of sight in the introduction and the closing.
 *
 * Mounted after the chapters, so every section is in the document to measure.
 */
export function RegionsIndex() {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);

  // Ink over pale ground, bone over dark ground and over the images.
  useSurfaceTone(navRef);
  useSurfaceTone(counterRef);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const first = sections[0];
    const last = sections[sections.length - 1];

    const ctx = gsap.context(() => {
      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      ScrollTrigger.create({
        trigger: first,
        endTrigger: last,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => setShown(self.isActive),
      });

      gsap.fromTo(
        '[data-index-fill]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: first, endTrigger: last, start: 'top center', end: 'bottom center', scrub: 0.3 },
        },
      );
    }, nav);

    return () => ctx.revert();
  }, []);

  const onNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash(e.currentTarget.hash);
  };

  const current = CHAPTERS[active];

  return (
    <>
      <nav
        ref={navRef}
        className={`rg-index ${shown ? 'is-shown' : ''}`}
        aria-label={t('regionsPage.indexLabel')}
        data-tone="dark"
      >
        <ol className="rg-index__list">
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter.id}>
              <a
                className={`rg-index__item ${i === active ? 'is-active' : ''}`}
                href={`#${chapter.id}`}
                onClick={onNavigate}
                aria-label={t('regionsPage.goTo', { name: t(`regionsPage.regions.${chapter.id}.name`) })}
                aria-current={i === active && shown ? 'location' : undefined}
                data-cursor="none"
              >
                <span className="rg-index__name t-label">
                  <T k={`regionsPage.regions.${chapter.id}.short`} />
                </span>
                <span className="rg-index__tick" aria-hidden="true" />
                <span className="rg-index__num t-mono" aria-hidden="true">
                  {chapter.index}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <span className="rg-index__rail" aria-hidden="true">
          <span className="rg-index__fill" data-index-fill />
        </span>
      </nav>

      <p ref={counterRef} className={`rg-counter t-mono ${shown ? 'is-shown' : ''}`} data-tone="dark" aria-hidden="true">
        <span className="rg-counter__num">{current.index}</span>
        <span className="rg-counter__total"> / {CHAPTER_TOTAL}</span>
      </p>
    </>
  );
}
