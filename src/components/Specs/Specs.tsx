import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT, PLAY_ONCE } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { revealChars, revealLabel, revealLines, revealRule } from '../../lib/reveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useTextLayoutEffect } from '../../hooks/useTextLayoutEffect';
import { SPECS } from '../../data/sections';
import { T } from '../../i18n';
import './Specs.css';

/** The Ring's specification, set as an editorial index rather than a table. */
export function Specs() {
  const ref = useRef<HTMLElement>(null);
  const { t, script } = useLanguage();

  // ---- Labels, rules and numbers: built once --------------------------------
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));

      gsap.utils.toArray<HTMLElement>('[data-spec]').forEach((row) => {
        revealRule(row.querySelector('[data-spec-rule]')!, { trigger: row, start: 'top 88%' });

        gsap.matchMedia().add(MQ.motion, () => {
          gsap.from(row.querySelectorAll('[data-spec-num], [data-spec-label]'), {
            yPercent: 100,
            opacity: 0,
            duration: 1.3,
            stagger: 0.08,
            ease: EASE_OUT,
            scrollTrigger: { trigger: row, start: 'top 86%', toggleActions: PLAY_ONCE },
          });
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // ---- Split text: the title, each value and its note -----------------------
  const titleLead = t('specs.titleLead');
  const titleEm = t('specs.titleEm');
  const values = SPECS.map((spec) => t(`specs.items.${spec.id}.value`));
  const notes = SPECS.map((spec) => t(`specs.items.${spec.id}.note`));

  useTextLayoutEffect(
    (settled) => {
      const section = ref.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const title = section.querySelector<HTMLElement>('[data-specs-title]');
        if (title) revealChars(title, { stagger: 0.015, settled });

        gsap.utils.toArray<HTMLElement>('[data-spec]').forEach((row) => {
          revealChars(row.querySelector<HTMLElement>('[data-spec-value]')!, { trigger: row, start: 'top 82%', delay: 0.15, settled });
          revealLines(row.querySelector<HTMLElement>('[data-spec-note]')!, { trigger: row, start: 'top 80%', delay: 0.3, settled });
        });
      }, section);

      return () => ctx.revert();
    },
    // Lines are split where the current face breaks them: a new face re-splits.
    [titleLead, titleEm, ...values, ...notes, script],
  );

  return (
    <section id="specs" className="specs" ref={ref} data-tone="dark" aria-labelledby="specs-title">
      <header className="specs__head grid">
        <p className="specs__label t-label" data-reveal="label">
          04.1 — <T k="specs.kicker" />
        </p>
        <h2 key={titleLead + titleEm} id="specs-title" className="specs__title" data-specs-title>
          <T k="specs.titleLead" />{' '}
          <em>
            <T k="specs.titleEm" />
          </em>
        </h2>
      </header>

      <ol className="specs__list">
        {SPECS.map((spec, i) => (
          <li className="spec grid" key={spec.id} data-spec>
            <span className="spec__rule" data-spec-rule />
            <span className="mask spec__num-mask" aria-hidden="true">
              <span className="spec__num t-num" data-spec-num>
                {spec.index}
              </span>
            </span>
            <span className="mask spec__label-mask">
              <h3 className="spec__label t-label" data-spec-label>
                <T k={`specs.items.${spec.id}.label`} />
              </h3>
            </span>
            <p key={values[i]} className="spec__value" data-spec-value>
              <T k={`specs.items.${spec.id}.value`} />
            </p>
            <p key={notes[i]} className="spec__note" data-spec-note>
              <T k={`specs.items.${spec.id}.note`} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
