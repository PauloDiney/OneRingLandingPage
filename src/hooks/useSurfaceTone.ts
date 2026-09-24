import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';

/** How often, in ticks, the surface underneath is checked. */
const SAMPLE_EVERY = 6;

/**
 * Keeps `data-tone` on a fixed element in step with the surface under its
 * centre: 'light' over paper, 'dark' over film and ink.
 *
 * Sampling what is actually underneath beats mirroring every section's colour
 * in ScrollTriggers — it also covers the paper rising over the film and the
 * regions track turning dark halfway along.
 */
export function useSurfaceTone(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tick = 0;
    let tone = el.dataset.tone ?? '';

    const sample = () => {
      if (tick++ % SAMPLE_EVERY) return;
      const box = el.getBoundingClientRect();
      if (!box.width) return;

      let next = 'dark';
      for (const hit of document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2)) {
        if (el.contains(hit)) continue;
        const surface = hit.closest<HTMLElement>('[data-tone]');
        if (surface?.dataset.tone) {
          next = surface.dataset.tone;
          break;
        }
      }

      if (next !== tone) {
        tone = next;
        el.dataset.tone = next;
      }
    };

    gsap.ticker.add(sample);
    return () => gsap.ticker.remove(sample);
  }, [ref]);
}
