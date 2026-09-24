import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap, SplitText, EASE_OUT, PLAY_ONCE } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealLabel, revealLines, revealRule } from '../../lib/reveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useTextLayoutEffect } from '../../hooks/useTextLayoutEffect';
import { REGIONS } from '../../data/regions';
import { STATS } from '../../data/sections';
import { T } from '../../i18n';
import './Journey.css';

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { t, meta, script } = useLanguage();

  // Figures follow the reader's locale (1,779 / 1.779). The count-up reads it
  // through a ref, so a language change never rebuilds its ScrollTrigger.
  const numberFormat = useMemo(() => new Intl.NumberFormat(meta.htmlLang, { maximumFractionDigits: 0 }), [meta.htmlLang]);
  const formatRef = useRef(numberFormat);
  useLayoutEffect(() => {
    formatRef.current = numberFormat;
  }, [numberFormat]);

  // ---- Everything that is not split text: built once -------------------------
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ---- Arrival: paper rising over the last frame of the film -----------
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          section,
          { clipPath: 'inset(0% 7% 0% 7%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
          },
        );

        // Inner parallax: the content drifts slower than the paper carrying it.
        gsap.fromTo(
          '[data-journey-head]',
          { yPercent: 18 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true } },
        );
      });

      // ---- Editorial reveals ------------------------------------------------
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));
      section.querySelectorAll<HTMLElement>('[data-reveal="rule"]').forEach((el) => revealRule(el));

      // ---- Figures count up the first time they are seen --------------------
      mm.add(MQ.motion, () => {
        section.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
          const target = Number(el.dataset.count);
          const counter = { value: 0 };
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: PLAY_ONCE }, delay: i * 0.08 })
            .from(el, { yPercent: 60, opacity: 0, duration: 1.4, ease: EASE_OUT }, 0)
            .to(counter, {
              value: target,
              duration: target > 10 ? 2.2 : 1.2,
              ease: 'expo.out',
              onUpdate: () => {
                el.textContent = formatRef.current.format(counter.value);
              },
            }, 0);
        });
      });

      // ---- The route: a gold point travelling from the Shire to Mordor -------
      mm.add(MQ.motion, () => {
        const route = section.querySelector<HTMLElement>('[data-route]');
        if (!route) return;
        const stops = route.querySelectorAll<HTMLElement>('[data-route-stop]');

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: route, start: 'top 85%', end: 'bottom 35%', scrub: 0.8 },
        });
        tl.fromTo('[data-route-progress]', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          .fromTo('[data-route-marker]', { left: '0%' }, { left: '100%', duration: 1 }, 0);
        stops.forEach((stop, i) => {
          tl.fromTo(stop, { '--stop-on': 0 }, { '--stop-on': 1, duration: 0.08 }, (i / (stops.length - 1)) * 0.96);
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // ---- Split text: rebuilt only when these words change -----------------------
  const titleThe = t('journey.titleThe');
  const titleJourney = t('journey.titleJourney');
  const aside = t('journey.aside');
  const lead = t('journey.lead');
  const text = t('journey.text');

  useTextLayoutEffect(
    (settled) => {
      const section = ref.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        gsap.matchMedia().add(MQ.motion, () => {
          // The title is uncovered by the scroll itself, not by a timer, so it
          // is always exactly as revealed as the paper is risen.
          const words = section.querySelectorAll<HTMLElement>('[data-journey-word]');
          words.forEach((word, i) => {
            const chars = SplitText.create(word, { type: 'chars', charsClass: 'journey__char' }).chars;
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: section,
                  start: `top ${75 - i * 10}%`,
                  end: `top ${5 - i * 10}%`,
                  scrub: 0.6,
                },
              })
              .fromTo(chars, { yPercent: 105 }, { yPercent: 0, stagger: 0.05, ease: 'power3.out' }, 0)
              .fromTo(word, { letterSpacing: '0.08em' }, { letterSpacing: '-0.015em', ease: 'power2.out' }, 0);
          });
        });

        section.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => revealLines(el, { settled }));
      }, section);

      return () => ctx.revert();
    },
    // Lines are split where the current face breaks them: a new face re-splits.
    [titleThe, titleJourney, aside, lead, text, script],
  );

  return (
    <section id="journey" className="journey" ref={ref} data-tone="light" aria-labelledby="journey-title">
      <div className="journey__head grid" data-journey-head>
        <div className="journey__aside">
          <p className="t-label" data-reveal="label">
            02 — <T k="sections.journey" />
          </p>
          <p key={aside} className="journey__aside-note" data-reveal="lines">
            <T k="journey.aside" />
          </p>
        </div>

        <p className="journey__era t-mono" data-reveal="label">
          <T k="journey.era" />
        </p>

        <h2 id="journey-title" className="journey__title t-display">
          <span key={titleThe} className="journey__word journey__word--the" data-journey-word>
            <T k="journey.titleThe" />
          </span>
          <span key={titleJourney} className="journey__word journey__word--journey" data-journey-word>
            <T k="journey.titleJourney" />
          </span>
        </h2>

        <p key={lead} className="journey__lead t-lead" data-reveal="lines">
          <T k="journey.lead" />
        </p>
      </div>

      <div className="journey__body grid">
        <p className="journey__fig t-mono" data-reveal="label">
          <T k="journey.fig" />
        </p>
        <p key={text} className="journey__text t-body" data-reveal="lines">
          <T k="journey.text" />
        </p>
      </div>

      <div className="journey__stats grid">
        <span className="journey__rule" data-reveal="rule" />
        {STATS.map((stat) => (
          <div className="stat" key={stat.id}>
            <p className="stat__num t-num">
              <span className="mask">
                <span aria-hidden="true" data-count={stat.value}>
                  {numberFormat.format(stat.value)}
                </span>
              </span>
              <span className="sr-only">{numberFormat.format(stat.value)}</span>
            </p>
            <p className="stat__label t-label">
              <T k={`journey.stats.${stat.id}.label`} />
            </p>
            <p className="stat__note">
              <T k={`journey.stats.${stat.id}.note`} />
            </p>
          </div>
        ))}
      </div>

      <div className="route" data-route>
        <div className="route__line">
          <span className="route__progress" data-route-progress />
          <span className="route__marker" data-route-marker />
        </div>
        <ol className="route__stops">
          {REGIONS.map((region) => (
            <li className="route__stop" key={region.id} data-route-stop>
              <span className="route__tick" />
              <span className="route__name">
                <T k={`regions.items.${region.id}.name`} />
              </span>
              <span className="route__date t-mono">{region.date}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
