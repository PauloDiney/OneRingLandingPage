import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { MQ, matches } from '../../lib/media';
import { createRingRenderer, type RingRenderer, type RingState } from './ringRenderer';
import './Ring.css';

const VERSE = [
  'One Ring to rule them all,',
  'One Ring to find them,',
  'One Ring to bring them all',
  'and in the darkness bind them.',
];

/** Set at build time when /public/images/one-ring.png exists (vite.config.ts). */
const RING_IMAGE = __RING_IMAGE__;

/**
 * The Ring, alone on black. Pinned for a few screens while the camera closes
 * in, the band turns, and the light moves from a cool studio to fire.
 *
 * Three ways to draw it, in order of preference:
 *   1. /public/images/one-ring.png, if the project provides one;
 *   2. a real-time WebGL render (see ringRenderer.ts);
 *   3. a CSS ring, if WebGL is unavailable.
 * All three are driven by the same state object and the same timeline.
 */
export function Ring() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = matches(MQ.reduced);
    const state: RingState = { tilt: 1.36, yaw: -0.7, roll: 0.16, distance: 10.5, warm: 0, exposure: 0.95 };

    let renderer: RingRenderer | null = null;
    if (!RING_IMAGE && canvasRef.current) {
      renderer = createRingRenderer(canvasRef.current, { maxDpr: matches(MQ.desktop) ? 1.5 : 1 });
      if (!renderer) section.classList.add('ring--fallback');
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=240%',
          pin: true,
          scrub: reduced ? true : 1,
          anticipatePin: 1,
        },
      });

      // ---- The object ------------------------------------------------------
      const turn = reduced ? 0.6 : 1;
      tl.to(state, { yaw: -0.7 + 2.9 * turn, roll: -0.12, duration: 1, ease: 'power1.inOut' }, 0)
        .to(state, { tilt: 1.0, duration: 1, ease: 'power2.inOut' }, 0)
        .to(state, { distance: 3.35, duration: 1, ease: 'power2.in' }, 0)
        .to(state, { warm: 1, exposure: 1.2, duration: 0.55, ease: 'power1.inOut' }, 0.4)
        .fromTo('[data-ring-glow]', { opacity: 0.25, scale: 0.8 }, { opacity: 1, scale: 1.35, duration: 1 }, 0)
        .fromTo('[data-ring-heat]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45);

      // Image and CSS fallbacks read the same values through transforms.
      const proxy = section.querySelector<HTMLElement>('[data-ring-proxy]');
      if (proxy) {
        tl.fromTo(proxy, { scale: 0.62, rotate: -10, rotateX: 58, filter: 'brightness(0.75) saturate(0.85)' },
          { scale: 1.9, rotate: 14, rotateX: 22, filter: 'brightness(1.12) saturate(1.1)', duration: 1, ease: 'power2.in' }, 0);
      }

      // ---- The verse, one line at a time ------------------------------------
      const lines = gsap.utils.toArray<HTMLElement>('[data-verse]');
      const blur = (px: number) => (reduced ? 'blur(0px)' : `blur(${px}px)`);
      lines.forEach((line, i) => {
        const at = 0.06 + i * 0.16;
        tl.fromTo(line,
          { opacity: 0, yPercent: reduced ? 0 : 40, clipPath: 'inset(0% 0% 100% 0%)', filter: blur(8) },
          { opacity: 1, yPercent: 0, clipPath: 'inset(0% 0% -20% 0%)', filter: blur(0), duration: 0.09, ease: 'power3.out' }, at);
        if (i < lines.length - 1) tl.to(line, { opacity: 0.22, duration: 0.08 }, at + 0.16);
      });
      tl.to(lines, { opacity: 0, yPercent: reduced ? 0 : -30, filter: blur(6), duration: 0.08, stagger: 0.012 }, 0.78)
        .fromTo('[data-ring-caption]', { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.02)
        .to('[data-ring-caption]', { opacity: 0, duration: 0.06 }, 0.86);

      // Heading and labels: a quiet entrance as the section arrives.
      gsap.from('[data-ring-intro]', {
        opacity: 0,
        y: reduced ? 0 : 16,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      });
    }, section);

    // ---- Render loop: only while the section is anywhere near the screen ----
    let visible = false;
    const pin = ScrollTrigger.getAll().find((st) => st.pin === section);
    const near = ScrollTrigger.create({
      trigger: section,
      start: () => (pin ? pin.start : 0) - window.innerHeight,
      end: () => (pin ? pin.end : 0) + window.innerHeight,
      onToggle: (self) => {
        visible = self.isActive;
      },
    });

    let frame = 0;
    const draw = (time: number) => {
      if (!renderer || !visible) return;
      // Phones draw every other frame: the band turns slowly, it does not need 60.
      if (!matches(MQ.desktop) && frame++ % 2) return;
      renderer.render(state, reduced ? 0 : time);
    };
    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      near.kill();
      ctx.revert();
      renderer?.dispose();
      section.classList.remove('ring--fallback');
    };
  }, []);

  return (
    <section id="ring" className="ring" ref={sectionRef} data-tone="dark" aria-labelledby="ring-title">
      <div className="ring__glow" data-ring-glow aria-hidden="true" />
      <div className="ring__heat" data-ring-heat aria-hidden="true" />

      <div className="ring__object" aria-hidden="true">
        {RING_IMAGE ? (
          <img className="ring__image" src={RING_IMAGE} alt="" data-ring-proxy />
        ) : (
          <>
            <canvas className="ring__canvas" ref={canvasRef} />
            <div className="ring__css" data-ring-proxy />
          </>
        )}
      </div>

      <header className="ring__head">
        <p className="t-label" data-ring-intro>
          04 — The Ring
        </p>
        <h2 id="ring-title" className="ring__title t-lead" data-ring-intro>
          A plain band of gold, and the verse written for it.
        </h2>
      </header>

      <blockquote className="ring__verse">
        {VERSE.map((line, i) => (
          <p key={line} className={`ring__line ring__line--${i + 1}`} data-verse>
            {line}
          </p>
        ))}
      </blockquote>

      <div className="ring__foot t-mono" data-ring-caption aria-hidden="true">
        <span>Fig. 04 — Real-time study</span>
        <span>Au · polished · no ornament</span>
      </div>
    </section>
  );
}
