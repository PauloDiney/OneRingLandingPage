import { useLayoutEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { useLanguage } from '../../hooks/useLanguage';
import { T } from '../../i18n';
import { useDownloadProgress } from './mapProgress';
import { useMapState } from './mapStore';

/**
 * Black, a name, a figure, a hairline filling. Leaves the moment the terrain
 * is ready, and the land is revealed underneath it.
 */
export function MapLoader() {
  const { t } = useLanguage();
  const phase = useMapState((s) => s.phase);
  const bytes = useDownloadProgress();
  // Bytes from the loader under useGLTF; drei's item count as a floor.
  const { progress } = useProgress();
  const pct = Math.round(Math.max(bytes, progress / 100) * 100);
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const leaving = phase === 'entering' || phase === 'ready';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !leaving) return;
    const reduced = prefersReducedMotion();
    const tl = gsap
      .timeline({ onComplete: () => setGone(true) })
      .to(el.querySelectorAll('[data-loader-item]'), {
        y: reduced ? 0 : -12,
        opacity: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: 'power2.in',
      })
      .to(el, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 0.25);
    return () => {
      tl.kill();
    };
  }, [leaving]);

  if (gone) return null;

  return (
    <div className="atlas-loader" ref={ref} role="status" aria-live="polite" aria-label={phase === 'error' ? t('map.error') : `${t('map.loading')} ${pct}%`}>
      <div className="atlas-loader__inner" aria-hidden="true">
        <p className="atlas-loader__brand t-label" data-loader-item>
          <T k="brand.name" />
        </p>
        <p className="atlas-loader__state t-label" data-loader-item>
          <T k={phase === 'error' ? 'map.error' : 'map.loading'} />
        </p>
        <p className="atlas-loader__pct" data-loader-item>
          {pct}
          <span>%</span>
        </p>
        <span className="atlas-loader__bar" data-loader-item>
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </span>
      </div>
      {phase === 'error' && (
        <button type="button" className="atlas-loader__retry t-label" onClick={() => window.location.reload()}>
          <T k="map.retry" />
        </button>
      )}
    </div>
  );
}
