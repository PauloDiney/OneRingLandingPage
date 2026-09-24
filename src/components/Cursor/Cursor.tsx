import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './Cursor.css';

const INTERACTIVE = 'a[href], button, [data-cursor]';

/**
 * A small dot that trails the pointer. Over anything interactive it opens into
 * a thin ring, and shows the element's `data-cursor` word (VIEW, EXPLORE…).
 * Only exists on fine pointers without reduced motion; everyone else keeps
 * the system cursor.
 */
export function Cursor() {
  const finePointer = useMediaQuery(MQ.finePointer);
  const reduced = useMediaQuery(MQ.reduced);
  return finePointer && !reduced ? <CursorElement /> : null;
}

function CursorElement() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;

    const root = document.documentElement;
    root.classList.add('has-cursor');

    const xTo = gsap.quickTo(el, 'x', { duration: 0.42, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.42, ease: 'power3.out' });

    let visible = false;
    let current: HTMLElement | null = null;

    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      gsap.to(el, { autoAlpha: v ? 1 : 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visible) gsap.set(el, { x: e.clientX, y: e.clientY });
      xTo(e.clientX);
      yTo(e.clientY);
      setVisible(true);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE) ?? null;
      if (target === current) return;
      current = target;

      // `data-cursor="none"`: the control is its own affordance (the round
      // MENU and TOP buttons), so the cursor steps aside instead of doubling it.
      const word = target?.dataset.cursor ?? '';
      const hidden = word === 'none';
      if (word && !hidden) label.textContent = word;
      el.classList.toggle('is-hidden', hidden);
      el.classList.toggle('is-active', Boolean(target) && !hidden);
      el.classList.toggle('has-label', Boolean(word) && !hidden);
    };

    const onDown = () => el.classList.add('is-pressed');
    const onUp = () => el.classList.remove('is-pressed');
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointerleave', onLeave);

    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div className="cursor script-exempt" ref={ref} aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__dot" />
      <span className="cursor__label" ref={labelRef} />
    </div>
  );
}
