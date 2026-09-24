import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { MQ, prefersReducedMotion } from '../../lib/media';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLanguage } from '../../hooks/useLanguage';
import { T } from '../../i18n';
import { MAP_REGIONS, type RegionId } from '../../data/mapRegions';
import { mapCamera } from './mapCamera';
import { mapStore, useMapState, type MapMode } from './mapStore';

const TOTAL = String(MAP_REGIONS.length).padStart(2, '0');
const MODES: { id: MapMode; ready: boolean }[] = [
  { id: 'explore', ready: true },
  // Prepared, not built: the structure is here so they can be added later.
  { id: 'journey', ready: false },
  { id: 'discover', ready: false },
];

/* ── The editorial panel for a focused region ─────────────────────────────── */

function RegionPanel() {
  const selected = useMapState((s) => s.selected);
  const flying = useMapState((s) => s.flying);
  const compact = useMediaQuery(MQ.mobile);
  // The region on show lags the selection: it leaves first, then the next arrives.
  const [shown, setShown] = useState<RegionId | null>(null);
  const ref = useRef<HTMLElement>(null);

  // Arrive once the camera has; leave as soon as the reader turns away.
  useEffect(() => {
    if (selected && !flying && shown !== selected) {
      if (!shown) setShown(selected);
      else leave(() => setShown(selected));
    } else if (!selected && shown) {
      leave(() => setShown(null));
    }
  }, [selected, flying]);

  const leave = (then: () => void) => {
    const el = ref.current;
    if (!el) return then();
    gsap.to(el.querySelectorAll('[data-panel-item]'), {
      opacity: 0,
      y: prefersReducedMotion() ? 0 : -10,
      duration: 0.35,
      stagger: 0.03,
      ease: 'power2.in',
      overwrite: true,
      onComplete: then,
    });
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !shown) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: EASE_OUT } })
        .fromTo('[data-panel-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
        .fromTo('[data-panel-item]', { opacity: 0, y: reduced ? 0 : 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.07 }, 0.1);
    }, el);
    return () => ctx.revert();
  }, [shown]);

  // Escape returns to the atlas.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && mapCamera.back();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (!shown) return null;
  const region = MAP_REGIONS.find((r) => r.id === shown)!;

  return (
    <section
      ref={ref}
      className={`atlas-panel ${compact ? 'atlas-panel--sheet' : ''}`}
      aria-labelledby="atlas-panel-title"
      aria-live="polite"
    >
      <p className="atlas-panel__count t-mono" data-panel-item>
        {region.index} / {TOTAL}
      </p>
      <span className="atlas-panel__rule" data-panel-rule />
      <h2 id="atlas-panel-title" className="atlas-panel__name" data-panel-item>
        <T k={`map.regions.${region.id}.name`} />
      </h2>
      <p className="atlas-panel__subtitle t-label" data-panel-item>
        <T k={`map.regions.${region.id}.subtitle`} />
      </p>
      <p className="atlas-panel__text" data-panel-item>
        <T k={`map.regions.${region.id}.description`} />
      </p>
      <div className="atlas-panel__actions" data-panel-item>
        <button type="button" className="atlas-action t-label" onClick={() => mapCamera.exploreRegion()} disabled={flying}>
          <T k="map.exploreRegion" /> <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="atlas-action atlas-action--back t-label" onClick={() => mapCamera.back()}>
          <span aria-hidden="true">←</span> <T k="map.back" />
        </button>
      </div>
    </section>
  );
}

/* ── Everything else around the map ─────────────────────────────────────── */

type Props = { debug: boolean };

export function MapInterface({ debug }: Props) {
  const { t } = useLanguage();
  const phase = useMapState((s) => s.phase);
  const selected = useMapState((s) => s.selected);
  const hovered = useMapState((s) => s.hovered);
  const mode = useMapState((s) => s.mode);
  const touch = useMediaQuery('(hover: none)');
  const ref = useRef<HTMLDivElement>(null);
  const shown = phase === 'entering' || phase === 'ready';

  // The interface arrives after the land has begun to rise.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !shown) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 1.4, defaults: { ease: EASE_OUT } })
        .fromTo('[data-ui-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', stagger: 0.1 }, 0)
        .fromTo('[data-ui-item]', { opacity: 0, y: reduced ? 0 : 16 }, { opacity: 1, y: 0, duration: 1.3, stagger: 0.06 }, 0.1);
    }, el);
    return () => ctx.revert();
  }, [shown]);

  const counter = selected ?? hovered;
  const counterIndex = counter ? MAP_REGIONS.find((r) => r.id === counter)!.index : '—';

  return (
    <div className="atlas-ui" ref={ref} data-state={selected ? 'focused' : 'free'} hidden={!shown}>
      {/* Top left: what this is. Steps aside while a region is in focus. */}
      <header className="atlas-intro">
        <p className="atlas-intro__kicker t-label" data-ui-item>
          <T k="map.kicker" /> <span className="atlas-intro__num">/ 01</span>
        </p>
        <h1 className="atlas-intro__title" data-ui-item>
          <span className="atlas-intro__line">
            <T k="map.titleA" />
          </span>
          <span className="atlas-intro__line atlas-intro__line--em">
            <T k="map.titleB" />
          </span>
        </h1>
        <p className="atlas-intro__lead" data-ui-item>
          <T k="map.lead" />
        </p>
      </header>

      {/* Top right: the three ways into the atlas. Only Explore exists yet. */}
      <nav className="atlas-modes" aria-label={t('map.modesLabel')} data-ui-item>
        <ul>
          {MODES.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="atlas-modes__item t-label"
                aria-pressed={mode === m.id}
                disabled={!m.ready}
                onClick={() => mapStore.set({ mode: m.id })}
              >
                <T k={`map.modes.${m.id}`} />
                {!m.ready && (
                  <span className="atlas-modes__soon t-mono">
                    <T k="map.soon" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom left: how to move. */}
      <p className="atlas-hint t-label" data-ui-item>
        <span className="atlas-hint__rule" data-ui-rule aria-hidden="true" />
        <T k="map.hintDrag" />
        <span aria-hidden="true"> · </span>
        <T k={touch ? 'map.hintPinch' : 'map.hintZoom'} />
      </p>

      {/* Bottom right: the regions, as a list anyone can use (keyboard,
          screen reader, or simply preferring not to hunt on the terrain). */}
      <nav id="atlas-regions" className="atlas-index" aria-label={t('map.regionsLabel')} data-ui-item>
        <p className="atlas-index__count t-mono" aria-hidden="true">
          <span className="atlas-index__current">{counterIndex}</span> / {TOTAL}
        </p>
        <ol className="atlas-index__list">
          {MAP_REGIONS.map((region) => (
            <li key={region.id}>
              <button
                type="button"
                className="atlas-index__item"
                aria-current={selected === region.id ? 'true' : undefined}
                aria-label={t('map.flyTo', { name: t(`map.regions.${region.id}.name`) })}
                onClick={() => mapCamera.flyTo(region.id)}
                onPointerEnter={() => mapStore.set({ hovered: region.id })}
                onPointerLeave={() => mapStore.get().hovered === region.id && mapStore.set({ hovered: null })}
              >
                <span className="atlas-index__num t-mono">{region.index}</span>
                <span className="atlas-index__name t-label">
                  <T k={`map.regions.${region.id}.name`} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <RegionPanel />
      {debug && <DebugReadout />}
    </div>
  );
}

/* ── DEBUG_MAP only ─────────────────────────────────────────────────────── */

function DebugReadout() {
  const point = useMapState((s) => s.debugPoint);
  const level = useMapState((s) => s.detailLevel);

  // C logs the current camera as a region `view`, ready to paste.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey) return;
      const view = mapCamera.describe();
      if (view) console.info(`Camera view:\nview: ${JSON.stringify(view).replace(/"(\w+)":/g, '$1: ')},`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="atlas-debug script-exempt" aria-hidden="true">
      <p>DEBUG_MAP — click the terrain (Shift: place format) · C logs the camera</p>
      <p>{point ? `region [${point.join(', ')}]   place [${point[0]}, ${point[2]}]` : 'no point yet'}</p>
      <p>detail: {level}</p>
    </div>
  );
}
