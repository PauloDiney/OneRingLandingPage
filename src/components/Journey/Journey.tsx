import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText, EASE_OUT } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealLabel, revealLines, revealRule } from '../../lib/reveal';
import { REGIONS } from '../../data/regions';
import './Journey.css';

const STATS = [
  { value: 1779, display: '1,779', label: 'Miles on foot', note: 'Bag End to Mount Doom' },
  { value: 6, display: '6', label: 'Months', note: 'September 3018 — March 3019' },
  { value: 9, display: '9', label: 'Companions', note: 'Against nine riders' },
  { value: 1, display: '1', label: 'Ring', note: 'To rule them all' },
];

const format = (n: number) => Math.round(n).toLocaleString('en-US');

export function Journey() {
  const ref = useRef<HTMLElement>(null);

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

        // Inner parallax: the content drifts slower than the paper carrying it.
        gsap.fromTo(
          '[data-journey-head]',
          { yPercent: 18 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true } },
        );
      });

      // ---- Editorial reveals ------------------------------------------------
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));
      section.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => revealLines(el));
      section.querySelectorAll<HTMLElement>('[data-reveal="rule"]').forEach((el) => revealRule(el));

      // ---- Figures count up the first time they are seen --------------------
      mm.add(MQ.motion, () => {
        section.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
          const target = Number(el.dataset.count);
          const counter = { value: 0 };
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true }, delay: i * 0.08 })
            .from(el, { yPercent: 60, opacity: 0, duration: 1.4, ease: EASE_OUT }, 0)
            .to(counter, {
              value: target,
              duration: target > 10 ? 2.2 : 1.2,
              ease: 'expo.out',
              onUpdate: () => {
                el.textContent = format(counter.value);
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

  return (
    <section id="journey" className="journey" ref={ref} data-tone="light" aria-labelledby="journey-title">
      <div className="journey__head grid" data-journey-head>
        <div className="journey__aside">
          <p className="t-label" data-reveal="label">
            02 — The Journey
          </p>
          <p className="journey__aside-note" data-reveal="lines">
            A route traced across the map you have just watched, one region at a time.
          </p>
        </div>

        <p className="journey__era t-mono" data-reveal="label">
          T.A. 3018 — 3019
        </p>

        <h2 id="journey-title" className="journey__title t-display">
          <span className="journey__word journey__word--the" data-journey-word>
            The
          </span>
          <span className="journey__word journey__word--journey" data-journey-word>
            Journey
          </span>
        </h2>

        <p className="journey__lead t-lead" data-reveal="lines">
          From the Shire to Mordor.
        </p>
      </div>

      <div className="journey__body grid">
        <p className="journey__fig t-mono" data-reveal="label">
          Fig. 02 — The road
        </p>
        <p className="journey__text t-body" data-reveal="lines">
          A hobbit, a ring and a road that goes ever on. Six months on foot — across rivers, mountains and
          kingdoms — to return one small object to the only fire in the world that can unmake it.
        </p>
      </div>

      <div className="journey__stats grid">
        <span className="journey__rule" data-reveal="rule" />
        {STATS.map((stat) => (
          <div className="stat" key={stat.label}>
            <p className="stat__num t-num">
              <span className="mask">
                <span aria-hidden="true" data-count={stat.value}>
                  {stat.display}
                </span>
              </span>
              <span className="sr-only">{stat.display}</span>
            </p>
            <p className="stat__label t-label">{stat.label}</p>
            <p className="stat__note">{stat.note}</p>
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
              <span className="route__name">{region.name}</span>
              <span className="route__date t-mono">{region.date}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
