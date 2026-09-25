import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { T } from '../../i18n';

/** The opening: a short, dark, typographic page. The regions are the images. */
export function RegionsHero() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap
          .timeline({ delay: 0.35, defaults: { ease: EASE_OUT } })
          .from('.rg-intro__kicker .mask > span', { yPercent: 110, duration: 1.3 })
          .from('.rg-intro__line', { yPercent: 108, duration: 1.9, stagger: 0.12 }, 0.1)
          .from('.rg-intro__lead', { y: 18, opacity: 0, duration: 1.5 }, 0.7)
          .from('.rg-intro__cue', { opacity: 0, duration: 1.4 }, 1.1);

        // Leaving: the words lift and dim as the first land opens beneath them.
        gsap.to('.rg-intro__inner', {
          yPercent: -8,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      mm.add(MQ.reduced, () => {
        gsap.from('.rg-intro__inner', { opacity: 0, duration: 0.6, ease: 'power1.out' });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="regions-intro" className="rg-intro" data-tone="dark" aria-labelledby="regions-title">
      <div className="rg-intro__inner">
        <p className="rg-intro__kicker t-label">
          <span className="mask">
            <span>
              <T k="regionsPage.kicker" />
            </span>
          </span>
        </p>

        <h1 id="regions-title" className="rg-intro__title">
          <span className="mask">
            <span className="rg-intro__line t-display">
              <T k="regionsPage.titleA" />
            </span>
          </span>{' '}
          <span className="mask">
            <span className="rg-intro__line rg-intro__line--em t-italic">
              <T k="regionsPage.titleB" />
            </span>
          </span>
        </h1>

        <p className="rg-intro__lead">
          <T k="regionsPage.lead" />
        </p>

        <p className="rg-intro__cue t-label" aria-hidden="true">
          <span className="rg-intro__cue-line" />
          <T k="regionsPage.cue" />
        </p>
      </div>
    </section>
  );
}
