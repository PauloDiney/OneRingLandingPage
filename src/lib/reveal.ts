import { gsap, SplitText, EASE_OUT } from './gsap';
import { prefersReducedMotion } from './media';

/*
 * Reusable scroll reveals. Each one combines two or three small movements
 * (a mask, a rise, a change of tracking or focus) rather than a bare fade.
 * All of them must be called inside a gsap.context() so they are reverted —
 * SplitText included — when the component unmounts.
 */

type RevealOptions = {
  /** Element whose position starts the reveal. Defaults to the target. */
  trigger?: Element;
  start?: string;
  delay?: number;
  stagger?: number;
};

const scrollTrigger = (el: Element, opts: RevealOptions) => ({
  trigger: opts.trigger ?? el,
  start: opts.start ?? 'top 86%',
  once: true,
});

/** Reduced motion: content still arrives, but without travelling. */
function fadeIn(el: Element, opts: RevealOptions) {
  return gsap.from(el, {
    opacity: 0,
    duration: 0.6,
    ease: 'power1.out',
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTrigger(el, opts),
  });
}

/**
 * Body copy: every line rises out of its own mask.
 * `autoSplit` re-splits when fonts land or the width changes, and because the
 * tween is returned from `onSplit`, its progress survives the re-split.
 */
export function revealLines(el: HTMLElement, opts: RevealOptions = {}) {
  if (prefersReducedMotion()) return fadeIn(el, opts);

  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        opacity: 0.2,
        duration: 1.3,
        ease: EASE_OUT,
        stagger: opts.stagger ?? 0.085,
        delay: opts.delay ?? 0,
        scrollTrigger: scrollTrigger(el, opts),
      }),
  });
}

/**
 * Display type: characters rise from below the baseline while they draw
 * together and the focus sharpens. Words stay unbroken.
 *
 * The "tracking closing up" is done with transforms, never `letter-spacing`:
 * wider tracking can push wrapping text onto an extra line, and the layout
 * shift when it settles would move every ScrollTrigger below it.
 */
export function revealChars(el: HTMLElement, opts: RevealOptions = {}) {
  if (prefersReducedMotion()) return fadeIn(el, opts);

  const split = SplitText.create(el, {
    type: 'words,chars',
    mask: 'words',
    wordsClass: 'split-word',
  });
  const spread = parseFloat(getComputedStyle(el).fontSize) * 0.05;

  gsap
    .timeline({ scrollTrigger: scrollTrigger(el, opts), delay: opts.delay ?? 0 })
    .from(split.chars, {
      yPercent: 115,
      x: (i: number, _t: Element, all: Element[]) => (i - (all.length - 1) / 2) * spread,
      duration: 1.4,
      ease: EASE_OUT,
      stagger: opts.stagger ?? 0.025,
    })
    .from(el, { filter: 'blur(8px)', duration: 1, ease: 'power2.out', clearProps: 'filter' }, 0);

  return split;
}

/** A hairline drawing itself from one side. */
export function revealRule(el: Element, opts: RevealOptions & { origin?: 'left' | 'right' } = {}) {
  if (prefersReducedMotion()) return fadeIn(el, opts);

  return gsap.from(el, {
    scaleX: 0,
    transformOrigin: `${opts.origin ?? 'left'} center`,
    duration: 1.6,
    ease: 'expo.inOut',
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTrigger(el, opts),
  });
}

/** Small labels: slide out from behind a clip edge. */
export function revealLabel(el: Element, opts: RevealOptions = {}) {
  if (prefersReducedMotion()) return fadeIn(el, opts);

  return gsap.from(el, {
    clipPath: 'inset(0 100% 0 0)',
    x: -12,
    opacity: 0,
    duration: 1.1,
    ease: EASE_OUT,
    delay: opts.delay ?? 0,
    clearProps: 'clipPath',
    scrollTrigger: scrollTrigger(el, opts),
  });
}
