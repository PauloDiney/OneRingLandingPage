import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT, PLAY_ONCE } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { useLanguage } from '../../hooks/useLanguage';
import { MAP_LINK } from '../../data/sections';
import { JOURNEY_HREF } from '../../data/regionsPage';
import { T } from '../../i18n';

/** After Mordor: a short, quiet coda, and the two ways on. */
export function RegionsClosing() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add(MQ.motion, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: PLAY_ONCE }, defaults: { ease: EASE_OUT } })
          .from('.rg-end__kicker > span', { y: 12, opacity: 0, duration: 1.3, stagger: 0.1 })
          .from('.rg-end__line .mask > span', { yPercent: 108, duration: 1.8 }, 0.15)
          .from('.rg-end__action', { y: 14, opacity: 0, duration: 1.3, stagger: 0.1 }, 0.6);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="regions-end" className="rg-end" data-tone="dark" aria-labelledby="regions-end-title">
      <div className="rg-end__inner grid">
        <p className="rg-end__kicker t-label">
          <span>
            <T k="regionsPage.closing.kickerA" />
          </span>
          <span>
            <T k="regionsPage.closing.kickerB" />
          </span>
        </p>
        <h2 id="regions-end-title" className="rg-end__line t-serif">
          <span className="mask">
            <span>
              <T k="regionsPage.closing.line" />
            </span>
          </span>
        </h2>
        <div className="rg-end__actions">
          <a className="rg-end__action t-label" href={MAP_LINK.href} data-cursor={t('cursor.explore')}>
            <span>
              <T k="regionsPage.closing.explore" />
            </span>
            <span className="rg-end__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="rg-end__action rg-end__action--quiet t-label" href={JOURNEY_HREF} data-cursor={t('cursor.explore')}>
            <span>
              <T k="regionsPage.closing.continue" />
            </span>
            <span className="rg-end__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
