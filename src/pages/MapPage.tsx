import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { matches, MQ } from '../lib/media';
import { T } from '../i18n';
import { DEBUG_MAP, MAP_REGIONS } from '../data/mapRegions';
import { Navbar } from '../components/Navbar/Navbar';
import { Cursor } from '../components/Cursor/Cursor';
import { MiddleEarthMap } from '../components/map/MiddleEarthMap';
import { MapInterface } from '../components/map/MapInterface';
import { MapLoader } from '../components/map/MapLoader';
import { mapCamera } from '../components/map/mapCamera';
import { mapStore } from '../components/map/mapStore';
import '../components/map/Map.css';

/**
 * Debug picking: DEBUG_MAP, or `?debug` in the URL — and in either case only
 * under `npm run dev`. A production build never shows it.
 */
const debug = import.meta.env.DEV && (DEBUG_MAP || new URLSearchParams(window.location.search).has('debug'));

// Dev-only console handle, e.g. `__atlas.camera.flyTo('mordor')` or `__atlas.camera.describe()`.
if (import.meta.env.DEV) Object.assign(window, { __atlas: { camera: mapCamera, store: mapStore } });

/** The interactive atlas: the map is the page. */
export function MapPage() {
  const { t } = useLanguage();
  // Decided once: a phone gets lighter rendering for the whole visit.
  const [compact] = useState(() => matches(MQ.mobile) || matches('(pointer: coarse)'));

  useEffect(() => {
    // The page does not scroll: the wheel belongs to the map.
    document.documentElement.classList.add('is-atlas');
    return () => document.documentElement.classList.remove('is-atlas');
  }, []);

  // Arriving with a region in the URL (/map/?region=rohan, from the Regions
  // page): once the land is in and the entrance is over, fly there.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('region');
    const region = MAP_REGIONS.find((r) => r.id === wanted);
    if (!region) return;
    let flown = false;
    const fly = () => {
      if (flown || mapStore.get().phase !== 'ready') return;
      flown = true;
      mapCamera.flyTo(region.id);
    };
    const unsubscribe = mapStore.subscribe(fly);
    fly();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <a className="skip-link script-exempt" href="#atlas-regions">
        <T k="map.skip" />
      </a>

      <Navbar page="map" />

      <main className="atlas" data-tone="dark">
        <div className="atlas__stage" data-cursor={t('map.cursorDrag')}>
          <MiddleEarthMap compact={compact} debug={debug} />
        </div>
        <MapInterface debug={debug} />
      </main>

      <MapLoader />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
