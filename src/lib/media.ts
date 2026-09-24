/*
 * Media queries shared by CSS and JS. Wherever layout differs between them
 * (the horizontal regions track, for instance) the CSS uses the same strings,
 * so the stylesheet and the animation can never disagree about which layout
 * is on screen.
 */
export const MQ = {
  reduced: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 900px)',
  mobile: '(max-width: 899px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export const matches = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches;

export const prefersReducedMotion = () => matches(MQ.reduced);
