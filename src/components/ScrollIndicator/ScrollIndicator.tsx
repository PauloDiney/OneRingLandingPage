import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE_OUT } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { useSurfaceTone } from '../../hooks/useSurfaceTone';
import { SECTIONS } from '../../data/sections';
import './ScrollIndicator.css';

/**
 * The lateral indicator: five numbered ticks for the page's chapters and a
 * hairline filling with overall progress.
 *
 * Mounted after every section, so the pinned sections have already inserted
 * their spacers by the time anything here is measured.
 */
export function ScrollIndicator() {
  const ref = useRef<HTMLElement>(null);

  useSurfaceTone(ref);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = [...root.querySelectorAll<HTMLElement>('[data-indicator-item]')];
    let active = -1;
    const setActive = (index: number) => {
      if (index === active) return;
      active = index;
      items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    };

    // Where each chapter starts, in document coordinates. Pinned sections are
    // measured through their spacer, which stays in the flow while they are fixed.
    let starts: number[] = [];
    const measure = () => {
      starts = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return Infinity;
        const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
        return box.getBoundingClientRect().top + window.scrollY;
      });
    };

    // The active chapter is the last one whose top has passed 55% of the
    // screen. Derived from the position alone, so a jump from the footer to
    // the top lands on 01 like any other scroll.
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.55;
      let index = 0;
      starts.forEach((start, i) => {
        if (line >= start) index = i;
      });
      setActive(index);
    };

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        gsap.from(root, { opacity: 0, x: 12, duration: 1.4, delay: 1.5, ease: EASE_OUT });
      }

      gsap.fromTo(
        '[data-indicator-fill]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
        },
      );

      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    }, root);

    const onRefresh = () => {
      measure();
      update();
    };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    onRefresh();

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <aside className="indicator" ref={ref} aria-hidden="true" data-tone="dark">
      <ol className="indicator__list">
        {SECTIONS.map((s) => (
          <li key={s.id} className="indicator__item" data-indicator-item>
            <span className="indicator__num t-mono">{s.index}</span>
            <span className="indicator__tick" />
          </li>
        ))}
      </ol>
      <span className="indicator__rail">
        <span className="indicator__fill" data-indicator-fill />
      </span>
    </aside>
  );
}
