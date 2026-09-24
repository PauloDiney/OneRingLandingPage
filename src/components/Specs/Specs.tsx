import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealChars, revealLabel, revealLines, revealRule } from '../../lib/reveal';
import { SPECS } from '../../data/sections';
import './Specs.css';

/** The Ring's specification, set as an editorial index rather than a table. */
export function Specs() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));
      const title = section.querySelector<HTMLElement>('[data-specs-title]');
      if (title) revealChars(title, { stagger: 0.015 });

      gsap.utils.toArray<HTMLElement>('[data-spec]').forEach((row) => {
        revealRule(row.querySelector('[data-spec-rule]')!, { trigger: row, start: 'top 88%' });
        revealChars(row.querySelector<HTMLElement>('[data-spec-value]')!, { trigger: row, start: 'top 82%', delay: 0.15 });
        revealLines(row.querySelector<HTMLElement>('[data-spec-note]')!, { trigger: row, start: 'top 80%', delay: 0.3 });

        gsap.matchMedia().add(MQ.motion, () => {
          gsap.from(row.querySelectorAll('[data-spec-num], [data-spec-label]'), {
            yPercent: 100,
            opacity: 0,
            duration: 1.3,
            stagger: 0.08,
            ease: EASE_OUT,
            scrollTrigger: { trigger: row, start: 'top 86%', once: true },
          });
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="specs" className="specs" ref={ref} data-tone="dark" aria-labelledby="specs-title">
      <header className="specs__head grid">
        <p className="specs__label t-label" data-reveal="label">
          04.1 — Specification
        </p>
        <h2 id="specs-title" className="specs__title" data-specs-title>
          An object, <em>described plainly.</em>
        </h2>
      </header>

      <ol className="specs__list">
        {SPECS.map((spec) => (
          <li className="spec grid" key={spec.index} data-spec>
            <span className="spec__rule" data-spec-rule />
            <span className="mask spec__num-mask" aria-hidden="true">
              <span className="spec__num t-num" data-spec-num>
                {spec.index}
              </span>
            </span>
            <span className="mask spec__label-mask">
              <h3 className="spec__label t-label" data-spec-label>
                {spec.label}
              </h3>
            </span>
            <p className="spec__value" data-spec-value>
              {spec.value}
            </p>
            <p className="spec__note" data-spec-note>
              {spec.note}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
