import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { MQ, matches } from '../../lib/media';
import './Mordor.css';

/**
 * The most intense part of the page, and its ending.
 *
 *   arrive   the picture opens out of a narrow window
 *   hold     parallax; the word MORDOR drifts wider than the screen;
 *            a single ember line draws itself across the dark
 *   end      everything goes to black except that line, which collapses
 *            to a point — then the last sentence
 */
export function Mordor() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const reduced = matches(MQ.reduced);
      const travel = reduced ? 0 : 1;

      // ---- Arrival -------------------------------------------------------
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
      })
        .fromTo('[data-mordor-media]', { clipPath: reduced ? 'inset(0% 0% 0% 0%)' : 'inset(24% 32% 24% 32%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
        .fromTo('[data-mordor-img]', { scale: 1.08 + 0.22 * travel }, { scale: 1.08 }, 0);

      // ---- Hold and ending ------------------------------------------------
      const word = section.querySelector<HTMLElement>('[data-mordor-word]')!;
      const chars = SplitText.create(word, { type: 'chars', charsClass: 'mordor__char' }).chars;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.8 },
      });

      // Stays within the 8% the image is scaled beyond its frame.
      tl.fromTo('[data-mordor-img]', { yPercent: 0 }, { yPercent: -3.5 * travel, duration: 0.7 }, 0)
        .fromTo(chars, { yPercent: 105 * travel, opacity: reduced ? 0 : 1 },
          { yPercent: 0, opacity: 1, stagger: 0.018, duration: 0.12, ease: 'power3.out' }, 0)
        .fromTo(word, { xPercent: 5 * travel }, { xPercent: -7 * travel, duration: 0.72 }, 0)
        .fromTo('[data-mordor-line]', { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.inOut' }, 0.12)
        .fromTo('[data-mordor-copy] > *', { y: 24 * travel, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.1, ease: 'power2.out' }, 0.2)
        // Darkness takes everything but the heat.
        .to('[data-mordor-black]', { opacity: 1, duration: 0.16, ease: 'power1.in' }, 0.62)
        .to('[data-mordor-copy] > *, [data-mordor-meta]', { opacity: 0, duration: 0.08 }, 0.62)
        .to(chars, { yPercent: -60 * travel, opacity: 0, stagger: 0.012, duration: 0.12, ease: 'power2.in' }, 0.64)
        .to('[data-mordor-line]', { scaleX: 0.004, duration: 0.16, ease: 'power3.inOut' }, 0.76)
        .to('[data-mordor-line]', { opacity: 0, duration: 0.08 }, 0.95)
        .fromTo('[data-mordor-final]', { opacity: 0, y: 16 * travel, filter: reduced ? 'blur(0px)' : 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.12, ease: 'power2.out' }, 0.86);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="mordor" className="mordor" ref={ref} data-tone="dark" aria-labelledby="mordor-title">
      <div className="mordor__stage">
        <div className="mordor__media" data-mordor-media>
          <img
            src="/images/mordor.webp"
            alt="The Ring at rest on the map beside the word Mordor, its inscription glowing in the dark."
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            data-mordor-img
          />
          <div className="mordor__shade" />
        </div>

        <p className="mordor__label t-label" data-mordor-meta>
          05 — Mordor
        </p>
        <p className="mordor__coords t-mono" data-mordor-meta>
          Orodruin <span aria-hidden="true">—</span> Mount Doom
        </p>

        {/* The wrapper centres; the word inside is free to move and overflow. */}
        <div className="mordor__title">
          <h2 id="mordor-title" className="mordor__word" data-mordor-word>
            Mordor
          </h2>
        </div>

        <span className="mordor__line" data-mordor-line aria-hidden="true" />

        <div className="mordor__copy" data-mordor-copy>
          <p className="t-lead">Where the shadows lie.</p>
          <p className="t-body">
            The journey ends where the Ring began: in the fires of Orodruin, the one place in all of Middle-earth hot
            enough to unmake it.
          </p>
        </div>

        <div className="mordor__black" data-mordor-black aria-hidden="true" />

        <p className="mordor__final" data-mordor-final>
          The road goes ever on.
        </p>
      </div>
    </section>
  );
}
