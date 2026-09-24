import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, EASE_OUT, PLAY_ONCE } from '../../lib/gsap';
import { MQ, matches } from '../../lib/media';
import { revealChars, revealLabel, revealLines } from '../../lib/reveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useTextLayoutEffect } from '../../hooks/useTextLayoutEffect';
import { REGIONS } from '../../data/regions';
import { T } from '../../i18n';
import { RegionPanel } from './RegionPanel';
import './Regions.css';

/** Same query as the horizontal layout in Regions.css. */
const HORIZONTAL = `${MQ.desktop} and ${MQ.motion}`;
const VERTICAL = `${MQ.mobile}, ${MQ.reduced}`;

/** The pinned track's tween, which the per-panel triggers ride on. */
const TRACK_ID = 'regions-track';

export function Regions() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { t, script } = useLanguage();

  // ---- The pin, the track and everything that is not split text --------------
  // Built once. A pin created later than the triggers below it would be
  // measured in the wrong order, so a language change must never rebuild this.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const panels = gsap.utils.toArray<HTMLElement>('[data-region]');

      // ---- Desktop: vertical scroll drives a horizontal track -------------
      mm.add(HORIZONTAL, () => {
        const distance = () => track.scrollWidth - window.innerWidth;

        const move = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            id: TRACK_ID,
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        const inTrack = (trigger: Element, start: string, end: string) => ({
          trigger,
          containerAnimation: move,
          start,
          end,
          scrub: true,
        });

        gsap.fromTo('[data-regions-bar]', { scaleX: 0 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: 0.9 },
        });

        // The intro's title and lede leave faster than the track, at different
        // speeds: a first depth cue. (Inner elements move, never the trigger.)
        const intro = section.querySelector<HTMLElement>('[data-regions-intro]')!;
        gsap.to('[data-regions-title]', { xPercent: -22, ease: 'none', scrollTrigger: inTrack(intro, 'left left', 'right left') });
        gsap.to('[data-regions-drift]', { xPercent: -45, ease: 'none', scrollTrigger: inTrack(intro, 'left left', 'right left') });

        panels.forEach((panel) => {
          const frame = panel.querySelector<HTMLElement>('[data-region-frame]')!;
          const img = panel.querySelector<HTMLElement>('[data-region-img]')!;
          const num = panel.querySelector<HTMLElement>('[data-region-num]')!;

          // Image: uncovered from its leading edge while it slides in…
          gsap.fromTo(frame, { clipPath: 'inset(0% 0% 0% 100%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'power2.out',
            scrollTrigger: inTrack(panel, 'left 92%', 'left 30%'),
          });
          // …and drifting inside its frame for the whole passage.
          gsap.fromTo(img, { xPercent: -9, scale: 1.24 }, {
            xPercent: 9,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: inTrack(panel, 'left right', 'right left'),
          });

          // The big number travels faster than the panel.
          gsap.fromTo(num, { xPercent: 35 }, { xPercent: -30, ease: 'none', scrollTrigger: inTrack(panel, 'left right', 'right left') });

          gsap.fromTo(panel.querySelectorAll('.region__copy > *, .region__facts > div, .region__index'),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out', scrollTrigger: inTrack(panel, 'left 65%', 'left 25%') });
        });

        // Paper gives way to ink as the road reaches Mordor.
        const mordor = panels[panels.length - 1];
        gsap.timeline({
          scrollTrigger: {
            ...inTrack(mordor, 'left 110%', 'left 45%'),
            onUpdate: (self) => {
              section.dataset.tone = self.progress > 0.5 ? 'dark' : 'light';
            },
          },
        })
          .to(section, { '--bg': '#0a0a0a', ease: 'none', duration: 1 }, 0)
          .to(section, { '--fg': '#e8e7e3', '--fg-muted': '#a7a6a1', '--line': 'rgba(232, 231, 227, 0.14)', ease: 'power2.inOut', duration: 0.5 }, 0.3);

        return () => {
          section.dataset.tone = 'light';
        };
      });

      // ---- Mobile and reduced motion: a vertical sequence --------------------
      mm.add(VERTICAL, () => {
        const reduced = matches(MQ.reduced);
        panels.forEach((panel) => {
          const frame = panel.querySelector<HTMLElement>('[data-region-frame]')!;
          if (!reduced) {
            gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.4,
              ease: 'expo.inOut',
              scrollTrigger: { trigger: frame, start: 'top 88%', toggleActions: PLAY_ONCE },
            });
          }
        });

        // Stacked, the Mordor panel is simply dark (see Regions.css).
        const mordor = panels[panels.length - 1];
        mordor.dataset.tone = 'dark';
        return () => {
          delete mordor.dataset.tone;
        };
      });

      // ---- Shared: the intro label ---------------------------------------------
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));

      mm.add(HORIZONTAL, () => {
        gsap.fromTo('[data-regions-hint]', { scaleX: 0.35 }, { scaleX: 1, duration: 1.4, ease: EASE_OUT, repeat: -1, repeatDelay: 0.3 });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // ---- Split text: the title, the lede and the region names -----------------
  const titleLead = t('regions.titleLead');
  const titleEm = t('regions.titleEm');
  const lede = t('regions.lede');
  const names = REGIONS.map((region) => t(`regions.items.${region.id}.name`));

  useTextLayoutEffect(
    (settled) => {
      const section = sectionRef.current;
      if (!section) return;

      // Triggers riding the track update only when the track moves. Rebuilt
      // mid-track, they must be told where it already is — once they have been
      // measured, which happens when their matchMedia callback returns.
      let riders: ScrollTrigger[] = [];
      const syncRiders = () => riders.forEach((st) => st.update(false, false, true));

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        const panels = gsap.utils.toArray<HTMLElement>('[data-region]');

        // Each name assembles as its panel arrives, riding the pinned track.
        mm.add(HORIZONTAL, () => {
          const move = ScrollTrigger.getById(TRACK_ID)?.animation;
          if (!move) return;

          // Riders hook themselves onto the track's onUpdate, and killing a
          // rider does not unhook it. Keep the chain as it was before these
          // were added, and put it back when they are rebuilt.
          const trackUpdate = move.eventCallback('onUpdate');

          riders = panels.map((panel) => {
            const name = panel.querySelector<HTMLElement>('[data-region-name]')!;
            const chars = SplitText.create(name, { type: 'chars', charsClass: 'region__char' }).chars;
            return gsap
              .timeline({ scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 70%', end: 'left 20%', scrub: true } })
              .fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out' }, 0)
              .fromTo(name, { letterSpacing: '0.1em' }, { letterSpacing: '-0.015em', ease: 'power2.out' }, 0)
              .scrollTrigger!;
          });

          return () => {
            riders = [];
            move.eventCallback('onUpdate', trackUpdate);
          };
        });

        mm.add(VERTICAL, () => {
          panels.forEach((panel) => {
            const name = panel.querySelector<HTMLElement>('[data-region-name]')!;
            revealChars(name, { trigger: name, start: 'top 92%', settled });
          });
        });

        section.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => revealLines(el, { settled }));
        const title = section.querySelector<HTMLElement>('[data-regions-title-text]');
        if (title) revealChars(title, { stagger: 0.02, settled });
      }, section);

      syncRiders();

      return () => ctx.revert();
    },
    // Lines are split where the current face breaks them: a new face re-splits.
    [titleLead, titleEm, lede, ...names, script],
  );

  return (
    <section id="regions" className="regions" ref={sectionRef} data-tone="light" aria-labelledby="regions-title">
      <div className="regions__track" ref={trackRef} data-layout-probe>
        <header className="regions__intro" data-regions-intro>
          <p className="t-label" data-reveal="label">
            03 — <T k="sections.regions" />
          </p>
          {/* The wrapper drifts with the track; the heading inside is split. */}
          <div data-regions-title>
            <h2 key={titleLead + titleEm} id="regions-title" className="regions__title" data-regions-title-text>
              <T k="regions.titleLead" />{' '}
              <em>
                <T k="regions.titleEm" />
              </em>
            </h2>
          </div>
          <div className="regions__drift" data-regions-drift>
            <p key={lede} className="regions__lede" data-reveal="lines">
              <T k="regions.lede" />
            </p>
            <p className="regions__hint t-label" aria-hidden="true">
              <span>
                <T k="regions.hint" />
              </span>
              <span className="regions__hint-line" data-regions-hint />
            </p>
          </div>
        </header>

        {REGIONS.map((region, i) => (
          <RegionPanel key={region.id} region={region} position={i} />
        ))}
      </div>

      <div className="regions__progress" aria-hidden="true">
        <span data-regions-bar />
      </div>
    </section>
  );
}
