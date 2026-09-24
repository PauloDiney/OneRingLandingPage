import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { MQ, matches } from '../lib/media';

/**
 * Lets an element lean a few pixels toward the pointer while it hovers, then
 * settle back. Fine pointers only, and never under reduced motion.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.28) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !matches(MQ.finePointer) || matches(MQ.reduced)) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, strength]);
}
