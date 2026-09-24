import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import './Hero.css';

/**
 * The opening composition, layered over the first frame of the film.
 *
 * Two owners, never overlapping: this component plays the one-off entrance on
 * the inner elements (`.hero__word`, `[data-intro]`), while ScrollVideo's
 * scrubbed timeline moves the outer wrappers (`[data-hero-exit]`) as the
 * scroll begins. Separate elements means the two can run at the same time
 * without fighting over a property.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.from('.hero__word, [data-intro]', { opacity: 0, duration: 0.8, ease: 'power1.out' });
        return;
      }

      gsap
        .timeline({ delay: 0.2, defaults: { ease: EASE_OUT } })
        // The title rises out of its masks while its tracking closes up.
        .from('.hero__word', { yPercent: 108, duration: 1.7, stagger: 0.11 }, 0.15)
        .from('.hero__word', { letterSpacing: '0.12em', duration: 2.2, stagger: 0.11 }, 0.15)
        .from('.hero__word--the', { xPercent: -12, duration: 1.8 }, 0.15)
        // Labels are uncovered, not faded.
        .from(
          '[data-intro="label"]',
          { clipPath: 'inset(0 100% 0 0)', x: -14, duration: 1.3, stagger: 0.12, clearProps: 'clipPath' },
          0.85,
        )
        .from('[data-intro="rise"]', { y: 18, opacity: 0, duration: 1.3, stagger: 0.12 }, 1)
        .from('.hero__cue-line', { scaleY: 0, transformOrigin: 'top', duration: 1.2 }, 1.3);
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero" ref={ref}>
      <div className="hero__scrim" data-hero-exit="scrim" aria-hidden="true" />

      <p className="hero__index t-label" data-hero-exit="index">
        <span data-intro="label">Middle-earth</span>
        <span className="hero__slash" data-intro="label" aria-hidden="true">
          /
        </span>
        <span data-intro="label">001</span>
      </p>

      <h1 className="hero__title t-display" id="film-title">
        <span className="hero__row hero__row--the" data-hero-exit="the">
          <span className="mask">
            <span className="hero__word hero__word--the t-italic">The</span>
          </span>
        </span>
        <span className="hero__row" data-hero-exit="one">
          <span className="mask">
            <span className="hero__word">One</span>
          </span>
        </span>
        <span className="hero__row hero__row--ring" data-hero-exit="ring">
          <span className="mask">
            <span className="hero__word">Ring</span>
          </span>
        </span>
      </h1>

      <div className="hero__caption" data-hero-exit="caption">
        <p className="hero__lead t-lead" data-intro="rise">
          A journey across Middle-earth.
        </p>
        <p className="hero__tech t-mono" data-intro="rise">
          Scroll-driven film <span aria-hidden="true">·</span> 301 frames{' '}
          <span aria-hidden="true">·</span> 10.03 s
        </p>
      </div>

      <div className="hero__cue" data-hero-exit="cue" aria-hidden="true">
        <span className="t-label" data-intro="label">
          Scroll to explore
        </span>
        <span className="hero__cue-track">
          <span className="hero__cue-line" />
        </span>
      </div>
    </div>
  );
}
