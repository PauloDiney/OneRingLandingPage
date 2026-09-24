import { gsap } from './gsap';
import { prefersReducedMotion } from './media';

/**
 * Animated jump to an in-page anchor. Long distances take a little longer, but
 * never so long that the page feels like it has taken control.
 * Focus follows the scroll, so keyboard and screen-reader users land in the
 * section they chose rather than back at the link.
 */
export function scrollToHash(hash: string) {
  const target = hash === '#top' ? document.body : document.querySelector<HTMLElement>(hash);
  if (!target) return;

  const distance = Math.abs(target.getBoundingClientRect().top);
  const reduced = prefersReducedMotion();

  gsap.to(window, {
    scrollTo: { y: hash === '#top' ? 0 : target, autoKill: true },
    duration: reduced ? 0 : Math.min(2.6, 0.9 + distance / 5000),
    ease: 'power3.inOut',
    overwrite: 'auto',
    onComplete: () => {
      if (hash === '#top') return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    },
  });

  history.replaceState(null, '', hash === '#top' ? window.location.pathname : hash);
}
