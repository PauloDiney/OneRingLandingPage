import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText, EASE_OUT } from '../../lib/gsap';
import { MQ, matches } from '../../lib/media';
import { revealChars, revealLabel, revealLines } from '../../lib/reveal';
import { REGIONS } from '../../data/regions';
import { RegionPanel } from './RegionPanel';
import './Regions.css';

/** Same query as the horizontal layout in Regions.css. */
const HORIZONTAL = `${MQ.desktop} and ${MQ.motion}`;
const VERTICAL = `${MQ.mobile}, ${MQ.reduced}`;

export function Regions() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
          const name = panel.querySelector<HTMLElement>('[data-region-name]')!;

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

          // The name assembles as its panel arrives.
          const chars = SplitText.create(name, { type: 'chars', charsClass: 'region__char' }).chars;
          gsap.timeline({ scrollTrigger: inTrack(panel, 'left 70%', 'left 20%') })
            .fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out' }, 0)
            .fromTo(name, { letterSpacing: '0.1em' }, { letterSpacing: '-0.015em', ease: 'power2.out' }, 0);

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
          const name = panel.querySelector<HTMLElement>('[data-region-name]')!;
          if (!reduced) {
            gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.4,
              ease: 'expo.inOut',
              scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
            });
          }
          revealChars(name, { trigger: name, start: 'top 92%' });
        });

        // Stacked, the Mordor panel is simply dark (see Regions.css).
        const mordor = panels[panels.length - 1];
        mordor.dataset.tone = 'dark';
        return () => {
          delete mordor.dataset.tone;
        };
      });

      // ---- Shared: the intro copy ----------------------------------------------
      section.querySelectorAll<HTMLElement>('[data-reveal="label"]').forEach((el) => revealLabel(el));
      section.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => revealLines(el));
      const title = section.querySelector<HTMLElement>('[data-regions-title]');
      if (title) revealChars(title, { stagger: 0.02 });

      mm.add(HORIZONTAL, () => {
        gsap.fromTo('[data-regions-hint]', { scaleX: 0.35 }, { scaleX: 1, duration: 1.4, ease: EASE_OUT, repeat: -1, repeatDelay: 0.3 });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="regions" className="regions" ref={sectionRef} data-tone="light" aria-labelledby="regions-title">
      <div className="regions__track" ref={trackRef}>
        <header className="regions__intro" data-regions-intro>
          <p className="t-label" data-reveal="label">
            03 — Regions
          </p>
          <h2 id="regions-title" className="regions__title" data-regions-title>
            Five lands, <em>one road.</em>
          </h2>
          <div className="regions__drift" data-regions-drift>
            <p className="regions__lede" data-reveal="lines">
              Each region on the map is a chapter of the same walk — from the quietest valley in the west to the only
              mountain that matters.
            </p>
            <p className="regions__hint t-label" aria-hidden="true">
              <span>Keep scrolling</span>
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
