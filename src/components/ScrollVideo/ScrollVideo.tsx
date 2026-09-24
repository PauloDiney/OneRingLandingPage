import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { MQ, matches } from '../../lib/media';
import { useScrollVideo } from '../../hooks/useScrollVideo';
import { CHAPTERS, FILM_FPS, FINALE_IN } from '../../data/film';
import { Hero } from '../Hero/Hero';
import './ScrollVideo.css';

const SOURCES = {
  desktop: { src: '/videos/one-ring.mp4', poster: '/images/poster.webp' },
  mobile: { src: '/videos/one-ring-720.mp4', poster: '/images/poster-720.webp' },
} as const;

/** How much film progress one chapter entrance or exit consumes. */
const IN = 0.05;
const OUT = 0.04;

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (frame: number) =>
  `${pad(Math.floor(frame / FILM_FPS / 60))}:${pad(Math.floor(frame / FILM_FPS) % 60)}:${pad(frame % FILM_FPS)}`;

/**
 * The opening film. A tall section whose stage is `position: sticky`; the
 * section's scroll range is the video's timeline.
 *
 *   ┌ section (600svh) ────────────────────────────────────────────┐
 *   │ film: 0 → 1                               │ curtain (1 screen) │
 *   └───────────────────────────────────────────┴────────────────────┘
 *
 * The final screen of travel does not advance the film: it is where The
 * Journey (pulled up by a negative margin) rises over the last frame.
 */
export function ScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);

  // Resolved once. Swapping `src` on resize would drop the buffer mid-scroll.
  const [source] = useState(() => (matches('(max-width: 900px)') ? SOURCES.mobile : SOURCES.desktop));

  /** Scroll distance the film occupies: the section minus the stage and the curtain. */
  const filmDistance = useCallback(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return 1;
    return Math.max(1, section.offsetHeight - stage.offsetHeight * 2);
  }, []);

  const filmEnd = useCallback(() => `+=${filmDistance()}`, [filmDistance]);

  const onFrame = useCallback((frame: number, total: number) => {
    const el = timecodeRef.current;
    if (el) el.textContent = timecode(Math.min(frame, total));
  }, []);

  useScrollVideo({ videoRef, triggerRef: sectionRef, end: filmEnd, fps: FILM_FPS, onFrame });

  // ---- Entrance: the film settles into place behind the title -------------
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = matches(MQ.reduced);
      gsap.fromTo(
        '[data-film-intro-shade]',
        { opacity: 1 },
        { opacity: 0, duration: reduced ? 0.6 : 2.4, ease: 'power2.inOut', delay: 0.1 },
      );
      if (!reduced) {
        gsap.from('[data-film-intro]', { scale: 1.14, duration: 3.2, ease: 'expo.out', delay: 0.1 });
      }
    }, stageRef);
    return () => ctx.revert();
  }, []);

  // ---- The scrubbed choreography over the film ------------------------------
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // `always` matters: matchMedia only runs the function while at least one
      // condition matches, and a phone without reduced motion matches neither.
      mm.add({ always: 'all', desktop: MQ.desktop, reduced: MQ.reduced }, (context) => {
        const { desktop, reduced } = context.conditions as { desktop: boolean; reduced: boolean };
        // Animated blur on large type is the expensive part on phones, and
        // exactly the embellishment reduced motion asks us to drop.
        const blur = (px: number) => (desktop && !reduced ? `blur(${px}px)` : 'blur(0px)');
        const travel = reduced ? 0 : 1;

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: filmEnd,
            // Roughly matches the video's own easing, so type and picture move together.
            scrub: reduced ? true : 0.45,
            // No `invalidateOnRefresh` here, deliberately: `end` is a function and
            // is re-measured on every refresh anyway, while invalidating would wipe
            // the from-state of every staggered target but the first.
          },
        });

        // 1 — The opening title parts and dissolves as the ring begins to fall.
        tl.to('[data-hero-exit="the"]', { yPercent: -60 * travel, opacity: 0, duration: 0.05 }, 0.004)
          .to('[data-hero-exit="one"]', { xPercent: -6 * travel, opacity: 0, filter: blur(14), duration: 0.062 }, 0.008)
          .to('[data-hero-exit="ring"]', { xPercent: 8 * travel, opacity: 0, filter: blur(14), duration: 0.062 }, 0.014)
          .to('[data-hero-exit="index"], [data-hero-exit="caption"], [data-hero-exit="cue"]',
            { y: -24 * travel, opacity: 0, duration: 0.04, stagger: 0.006 }, 0.004)
          .to('[data-hero-exit="scrim"]', { opacity: 0, duration: 0.09 }, 0.01)
          // The house lights come up on the map.
          .to('[data-film-shade]', { opacity: 0.08, duration: 0.12, ease: 'power1.inOut' }, 0.01)
          .fromTo('[data-film-meta]', { opacity: 0, y: 10 * travel }, { opacity: 1, y: 0, duration: 0.04 }, 0.06)
          .fromTo('[data-film-bar]', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);

        // 2 — Chapters. Each arrives with a mask, a rise and a change of focus.
        CHAPTERS.forEach((chapter, i) => {
          const root = section.querySelector<HTMLElement>(`[data-chapter="${chapter.id}"]`);
          if (!root) return;

          const name = root.querySelector<HTMLElement>('[data-chapter-name]')!;
          const meta = root.querySelector<HTMLElement>('[data-chapter-meta]')!;
          const rule = root.querySelector<HTMLElement>('[data-chapter-rule]')!;
          const rest = root.querySelectorAll<HTMLElement>('[data-chapter-rest]');
          const chars = SplitText.create(name, { type: 'chars', charsClass: 'chapter__char' }).chars;

          gsap.set(root, { autoAlpha: 1 });
          const from = chapter.align === 'left' ? 'right' : 'left';

          tl.fromTo(meta, { clipPath: `inset(0 ${from === 'right' ? '100%' : '0'} 0 ${from === 'left' ? '100%' : '0'})` },
            { clipPath: 'inset(0 0% 0 0%)', duration: IN * 0.8, ease: 'power2.out' }, chapter.in)
            .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: IN, ease: 'power2.out' }, chapter.in)
            .fromTo(chars, { yPercent: 110 * travel, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: IN * 0.7, stagger: IN * 0.3 / chars.length, ease: 'power3.out' }, chapter.in + 0.004)
            .fromTo(name, { letterSpacing: '0.09em', filter: blur(10) },
              { letterSpacing: '-0.01em', filter: blur(0), duration: IN, ease: 'power2.out' }, chapter.in)
            .fromTo(rest, { y: 16 * travel, opacity: 0 },
              { y: 0, opacity: 1, duration: IN * 0.7, stagger: 0.008, ease: 'power2.out' }, chapter.in + IN * 0.4);

          const leave = chapter.out - OUT;
          tl.to(chars, { yPercent: -105 * travel, opacity: 0, duration: OUT * 0.8, stagger: OUT * 0.2 / chars.length, ease: 'power2.in' }, leave)
            .to(name, { filter: blur(8), duration: OUT, ease: 'power2.in' }, leave)
            .to(meta, { clipPath: 'inset(0 0% 0 100%)', duration: OUT * 0.8, ease: 'power2.in' }, leave)
            .to(rule, { scaleX: 0, transformOrigin: 'right center', duration: OUT, ease: 'power2.in' }, leave)
            .to(rest, { y: -12 * travel, opacity: 0, duration: OUT * 0.7, ease: 'power2.in' }, leave);

          // The counter rolls like an odometer: 01 → 02 → 03 → 04.
          if (i > 0) {
            tl.to('[data-counter-track]', { yPercent: -(100 / CHAPTERS.length) * i, duration: 0.02, ease: 'power2.inOut' }, chapter.in);
          }
        });

        // 3 — Mordor's heat, following the red cast already in the footage.
        tl.fromTo('[data-film-ember]', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, 0.68);

        // 4 — The inscription faces the camera. The film's last words stay.
        const quote = section.querySelector<HTMLElement>('[data-finale-quote]')!;
        const quoteChars = SplitText.create(quote, { type: 'words,chars', mask: 'words', wordsClass: 'split-word' }).chars;
        gsap.set('[data-finale]', { autoAlpha: 1 });
        tl.fromTo(quoteChars, { yPercent: 110 * travel }, { yPercent: 0, duration: 0.045, stagger: 0.03 / quoteChars.length, ease: 'power3.out' }, FINALE_IN)
          .fromTo(quote, { filter: blur(10), opacity: 0 }, { filter: blur(0), opacity: 1, duration: 0.05 }, FINALE_IN)
          .fromTo('[data-finale-rest]', { y: 14 * travel, opacity: 0 }, { y: 0, opacity: 1, duration: 0.04, stagger: 0.01 }, FINALE_IN + 0.025);

        // Pin the timeline's length to exactly 1 so positions map to progress.
        tl.set({}, {}, 1);

        // 5 — The curtain: the film recedes while The Journey rises over it.
        // Its targets are wrappers the timeline above never touches, so the
        // two ScrollTriggers can never fight over a property.
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: () => `top+=${filmDistance()} top`,
            end: 'bottom bottom',
            scrub: true,
          },
        })
          .fromTo('[data-film-media]', { scale: 1, yPercent: 0 }, { scale: reduced ? 1 : 0.9, yPercent: -4 * travel, duration: 1 }, 0)
          .fromTo('[data-film-dim]', { opacity: 0 }, { opacity: 0.85, duration: 1 }, 0)
          .fromTo('[data-film-overlay]', { yPercent: 0, opacity: 1 }, { yPercent: -30 * travel, opacity: 0, duration: 0.6 }, 0);
      });
    }, section);

    return () => ctx.revert();
  }, [filmEnd, filmDistance]);

  return (
    <section id="film" className="film" ref={sectionRef} aria-labelledby="film-title">
      <div className="film__stage" ref={stageRef}>
        <div className="film__media" data-film-media>
          <div className="film__intro" data-film-intro>
            <video
              ref={videoRef}
              className="film__video"
              poster={source.poster}
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={source.src} type="video/mp4" />
            </video>
          </div>
          <div className="film__shade" data-film-shade />
          <div className="film__ember" data-film-ember />
          <div className="film__vignette" />
          <div className="film__dim" data-film-dim />
          <div className="film__intro-shade" data-film-intro-shade />
        </div>

        <Hero />

        {/* Visual layer only: it changes with every frame of scroll, so it is
            hidden from assistive tech. The same story is told in the list below. */}
        <div className="film__overlay" data-film-overlay aria-hidden="true">
          <div className="film__chapters">
            {CHAPTERS.map((chapter) => (
              <div key={chapter.id} className={`chapter chapter--${chapter.align}`} data-chapter={chapter.id}>
                <p className="chapter__meta t-label" data-chapter-meta>
                  <span className="chapter__index">{chapter.index}</span>
                  <span className="chapter__rule" data-chapter-rule />
                  <span>{chapter.region}</span>
                </p>
                <p className="chapter__name" data-chapter-name>
                  {chapter.name}
                </p>
                <p className="chapter__line t-lead" data-chapter-rest>
                  {chapter.line}
                </p>
                <p className="chapter__date t-mono" data-chapter-rest>
                  {chapter.date}
                </p>
              </div>
            ))}

            <div className="finale" data-finale>
              <p className="finale__quote" data-finale-quote>
                One Ring to rule them all.
              </p>
              <div className="finale__source">
                <p className="t-italic" data-finale-rest>
                  Ash nazg durbatulûk
                </p>
                <p className="t-label" data-finale-rest>
                  The inscription · Black Speech of Mordor
                </p>
              </div>
            </div>
          </div>

          <div className="film__meta" data-film-meta>
            <p className="film__counter t-mono">
              <span className="film__counter-mask">
                <span className="film__counter-track" data-counter-track>
                  {CHAPTERS.map((c) => (
                    <span key={c.id}>{c.index}</span>
                  ))}
                </span>
              </span>
              <span className="film__counter-total">/ {pad(CHAPTERS.length)}</span>
            </p>

            <p className="film__time t-mono">
              <span>TC</span>
              <span ref={timecodeRef} className="film__timecode">
                00:00:00
              </span>
              <span className="film__bar">
                <span data-film-bar />
              </span>
              <span className="film__duration">00:10:01</span>
            </p>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <h2>The film, in four moments</h2>
        <ol>
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              {c.name} — {c.line}
            </li>
          ))}
          <li>At rest in Mordor, the ring’s inscription faces the camera: “One Ring to rule them all.”</li>
        </ol>
      </div>
    </section>
  );
}
