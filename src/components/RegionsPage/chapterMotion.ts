import { gsap, EASE_OUT, PLAY_ONCE, type ScrollTrigger } from '../../lib/gsap';
import type { ChapterId } from '../../data/regionsPage';

/*
 * How each chapter moves. Called inside the chapter's gsap.context and only
 * when motion is welcome, so everything here is reverted with the chapter —
 * and with reduced motion none of it runs: nothing starts hidden.
 *
 * Only transform, opacity and clip-path are animated. Scroll-linked tweens
 * scrub; arrivals play once (PLAY_ONCE, see lib/gsap.ts).
 */

type Options = {
  /** Wide screens get the full composition; narrow ones a gentler version of it. */
  desktop: boolean;
};

type Motion = (section: HTMLElement, options: Options) => void;

/** Linked to the chapter's whole pass across the screen. */
const across = (trigger: Element, scrub: boolean | number = 0.6) => ({
  trigger,
  start: 'top bottom',
  end: 'bottom top',
  scrub,
});

/** A one-shot arrival as the element comes into view. */
const arrive = (trigger: Element, start = 'top 80%') => ({ trigger, start, toggleActions: PLAY_ONCE });

/**
 * While a pale ground is still opening out of the dark, whatever floats over
 * the chapter (the index, the counter) is over black, not over paper. Its
 * `data-tone` — which only those read — turns light once the ground reaches
 * the middle of the screen. Text colours belong to the chapter class, so
 * nothing on the page itself changes with it.
 */
const toneAt = (section: HTMLElement, threshold: number) => (self: ScrollTrigger) => {
  const tone = self.progress >= threshold ? 'light' : 'dark';
  if (section.dataset.tone !== tone) section.dataset.tone = tone;
};

/* ── 01 The Shire: soft, light, open ─────────────────────────────────────── */

const shire: Motion = (s, { desktop }) => {
  const q = gsap.utils.selector(s);
  const [figure] = q('.ch__figure');

  // Out of the dark: the pale ground opens from a smaller frame until it
  // fills the screen — the first breath after the introduction.
  gsap.fromTo(
    q('.ch__ground'),
    { clipPath: 'inset(16% 8% 0% 8%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: s, start: 'top bottom', end: 'top top', scrub: true, onUpdate: toneAt(s, 0.6), onRefresh: toneAt(s, 0.6) },
    },
  );

  // The land is uncovered from its left edge and settles from a little nearer.
  gsap.fromTo(
    figure,
    { clipPath: 'inset(8% 0% 8% 24%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: figure, start: 'top 98%', end: 'top 30%', scrub: true } },
  );
  gsap.fromTo(q('.ch__img'), { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom 40%', scrub: 0.6 } });
  if (desktop) gsap.fromTo(figure, { y: 50 }, { y: -50, ease: 'none', scrollTrigger: across(s) });

  // Words: small, slow, unhurried.
  gsap.from(q('.ch__line'), { yPercent: 108, duration: 1.7, ease: EASE_OUT, stagger: 0.1, scrollTrigger: arrive(q('.ch__title')[0], 'top 85%') });
  gsap.from(q('.ch__label, .ch__location'), { y: 12, opacity: 0, duration: 1.4, ease: EASE_OUT, stagger: 0.08, scrollTrigger: arrive(s, 'top 55%') });
  gsap.from(q('.ch__body > *'), { y: 22, opacity: 0, duration: 1.5, ease: EASE_OUT, stagger: 0.09, scrollTrigger: arrive(q('.ch__body')[0], 'top 88%') });
};

/* ── 02 Rivendell: layered, vertical, fluid ─────────────────────────────── */

const rivendell: Motion = (s, { desktop }) => {
  const q = gsap.utils.selector(s);
  const [figure] = q('.ch__figure');
  const k = desktop ? 1 : 0.35;

  // Four layers, four speeds: the numeral fastest, the image slowest (it lags
  // the scroll a little), the name and the words in between.
  const layer = (selector: string, distance: number) =>
    gsap.fromTo(q(selector), { y: distance * k }, { y: -distance * k, ease: 'none', scrollTrigger: across(s, 0.8) });
  layer('.ch__numeral', 150);
  layer('.ch__title', 60);
  layer('.ch__figure', -36);
  layer('.ch__body', 90);

  // The image opens like a view between two cliffs.
  gsap.fromTo(
    figure,
    { clipPath: 'inset(6% 16% 6% 16%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: figure, start: 'top 95%', end: 'top 25%', scrub: true } },
  );
  gsap.fromTo(q('.ch__img'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });

  // The name draws itself down the page, the way it reads.
  gsap.fromTo(
    q('.ch__title-inner'),
    { clipPath: desktop ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: 'expo.inOut', clearProps: 'clipPath', scrollTrigger: arrive(s, 'top 60%') },
  );
  gsap.from(q('.ch__label, .ch__location'), { y: 14, opacity: 0, duration: 1.4, ease: EASE_OUT, stagger: 0.1, scrollTrigger: arrive(s, 'top 55%') });
  gsap.from(q('.ch__body > *'), { y: 26, opacity: 0, duration: 1.5, ease: EASE_OUT, stagger: 0.1, scrollTrigger: arrive(q('.ch__body')[0], 'top 90%') });

  // Toward Moria: the valley falls into shadow before the ground goes dark.
  gsap.fromTo(q('.ch__veil'), { opacity: 0 }, { opacity: 0.72, ease: 'none', scrollTrigger: { trigger: s, start: 'bottom 85%', end: 'bottom top', scrub: true } });
};

/* ── 03 Moria: dark, vertical, descending ───────────────────────────────── */

const moria: Motion = (s, { desktop }) => {
  const q = gsap.utils.selector(s);
  const [figure] = q('.ch__figure');
  // On wide screens the stage is held (position: sticky) while the chapter
  // scrolls past; its effects run over that hold.
  const through = desktop ? 'bottom bottom' : 'bottom top';

  // Drawn from the top down, as if lit from above on the way in.
  gsap.fromTo(
    figure,
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: s, start: 'top 90%', end: desktop ? 'top top' : 'top 15%', scrub: true } },
  );
  gsap.fromTo(q('.ch__img'), { scale: 1.16, yPercent: -3 }, { scale: 1.03, yPercent: 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: through, scrub: 0.6 } });

  // The name sinks, and the hall darkens the further in the reader goes.
  gsap.fromTo(q('.ch__title-inner'), { yPercent: -24 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: s, start: 'top 70%', end: through, scrub: 0.6 } });
  gsap.fromTo(q('.ch__shade'), { opacity: 0 }, { opacity: 0.55, ease: 'none', scrollTrigger: { trigger: s, start: 'top top', end: through, scrub: true } });

  // The facts come down into place, one below the other.
  gsap.from(q('.ch__label, .ch__body > *'), {
    clipPath: 'inset(0% 0% 100% 0%)',
    y: -14,
    duration: 1.3,
    ease: EASE_OUT,
    stagger: 0.12,
    clearProps: 'clipPath',
    scrollTrigger: desktop ? arrive(s, 'top -8%') : arrive(q('.ch__panel')[0], 'top 85%'),
  });
  gsap.from(q('.ch__location'), { opacity: 0, duration: 1.6, ease: 'power1.out', scrollTrigger: arrive(s, 'top 30%') });
};

/* ── 04 Rohan: wide, open, moving ───────────────────────────────────────── */

const rohan: Motion = (s, { desktop }) => {
  const q = gsap.utils.selector(s);
  const [figure] = q('.ch__figure');

  // After the dark, a horizon: the pale ground widens out of a thin band.
  gsap.fromTo(
    q('.ch__ground'),
    { clipPath: 'inset(46% 0% 46% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'power1.in',
      scrollTrigger: { trigger: s, start: 'top bottom', end: 'top top', scrub: true, onUpdate: toneAt(s, 0.78), onRefresh: toneAt(s, 0.78) },
    },
  );

  // The name stretches out from the middle to fill the width.
  gsap.from(q('.ch__letter'), {
    x: (i: number, _el: Element, all: Element[]) => ((all.length - 1) / 2 - i) * (desktop ? 90 : 26),
    opacity: 0,
    duration: 2,
    ease: EASE_OUT,
    stagger: { each: 0.05, from: 'center' },
    scrollTrigger: arrive(s, 'top 22%'),
  });

  // The image opens sideways, like a view clearing.
  gsap.fromTo(
    figure,
    { clipPath: 'inset(0% 32% 0% 32%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: figure, start: 'top 95%', end: 'top 40%', scrub: true } },
  );

  // Wind: the land and the name drift a little in opposite directions as the
  // page goes down. Wide screens only — a phone has no width to spare.
  if (desktop) {
    gsap.fromTo(figure, { xPercent: 3 }, { xPercent: -3, ease: 'none', scrollTrigger: across(s, 0.8) });
    gsap.fromTo(q('.ch__letters'), { xPercent: -2 }, { xPercent: 2, ease: 'none', scrollTrigger: across(s, 0.8) });
  }

  gsap.from(q('.ch__head > *'), { opacity: 0, duration: 1.4, ease: 'power1.out', stagger: 0.1, scrollTrigger: arrive(s, 'top 30%') });
  gsap.from(q('.ch__body > *'), { x: desktop ? 36 : 0, y: desktop ? 0 : 18, opacity: 0, duration: 1.5, ease: EASE_OUT, stagger: 0.1, scrollTrigger: arrive(q('.ch__body')[0], 'top 90%') });
};

/* ── 05 Gondor: ordered, precise, architectural ─────────────────────────── */

const gondor: Motion = (s) => {
  const q = gsap.utils.selector(s);
  const [figure] = q('.ch__figure');
  const [body] = q('.ch__body');

  // The column system is drawn first, then everything is set on it.
  gsap
    .timeline({ scrollTrigger: arrive(s, 'top 72%'), defaults: { ease: 'expo.inOut' } })
    .from(q('.ch__column'), { scaleY: 0, transformOrigin: 'top center', duration: 1.8, stagger: 0.045 }, 0)
    .from(q('.ch__line'), { yPercent: 106, duration: 1.3, ease: 'power4.out' }, 0.45)
    .from(q('.ch__rule--title'), { scaleX: 0, transformOrigin: 'left center', duration: 1.5 }, 0.5)
    .from(q('.ch__label, .ch__location'), { y: 12, opacity: 0, duration: 1, ease: 'power3.out' }, 0.7);

  // The image is raised from its base line, in one measured stroke.
  gsap.fromTo(
    figure,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut', scrollTrigger: arrive(figure, 'top 82%') },
  );
  gsap.from(q('.ch__img'), { scale: 1.1, duration: 2.4, ease: 'power3.out', scrollTrigger: arrive(figure, 'top 82%') });
  gsap.from(q('.ch__body > *'), { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, scrollTrigger: arrive(body, 'top 84%') });

  // Toward Mordor: the stone dims before the dark arrives.
  gsap.fromTo(q('.ch__dim'), { opacity: 0 }, { opacity: 0.4, ease: 'none', scrollTrigger: { trigger: s, start: 'bottom 75%', end: 'bottom top', scrub: true } });
};

/* ── 06 Mordor: heavy, slow, the climax ──────────────────────────────────── */

const mordor: Motion = (s, { desktop }) => {
  const q = gsap.utils.selector(s);
  const [shade] = q('.ch__shade');

  // Out of the dark, held a while, then back into it.
  gsap
    .timeline({ scrollTrigger: { trigger: s, start: 'top 95%', end: 'bottom bottom', scrub: true } })
    .fromTo(shade, { opacity: 1 }, { opacity: 0.08, duration: 0.35, ease: 'power1.out' })
    .to(shade, { opacity: 0.08, duration: 0.4 })
    .to(shade, { opacity: 0.6, duration: 0.25, ease: 'power1.in' });

  // Slowly nearer, the whole way through.
  gsap.fromTo(q('.ch__img'), { scale: 1.02 }, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } });

  // The name arrives last, and slowest of all.
  gsap.fromTo(
    q('.ch__title-inner'),
    { yPercent: 55, opacity: 0 },
    { yPercent: 0, opacity: 1, ease: 'power1.out', scrollTrigger: { trigger: s, start: 'top 35%', end: desktop ? 'top -45%' : 'top -5%', scrub: 1.2 } },
  );
  gsap.from(q('.ch__label, .ch__body > *'), {
    y: 36,
    opacity: 0,
    duration: 2.2,
    ease: 'power2.out',
    stagger: 0.16,
    scrollTrigger: desktop ? arrive(s, 'top 5%') : arrive(q('.ch__panel')[0], 'top 85%'),
  });
  gsap.from(q('.ch__location'), { opacity: 0, duration: 2, ease: 'power1.out', scrollTrigger: arrive(s, 'top 20%') });
};

export const CHAPTER_MOTION: Record<ChapterId, Motion> = { shire, rivendell, moria, rohan, gondor, mordor };
