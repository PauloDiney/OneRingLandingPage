import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Object3D } from 'three';
import { DETAIL, MAP_PLACES, type MapDetailLevel, type MapPlace } from '../../data/mapPlaces';
import type { RegionId } from '../../data/mapRegions';
import { MapPlaceHotspot } from './MapPlaceHotspot';
import { useMapState } from './mapStore';

/** How long a label stays mounted while it fades away (matches Map.css). */
const LEAVE_MS = 320;

/**
 * Which places a moment calls for. Runs only when the detail level, the
 * selection or the focus cell changes — never per frame.
 *
 *   overview   none: the six regions speak alone
 *   regional   the regional tier — of the chosen region, or near the view
 *   local      both tiers — of the chosen region, or near the view
 */
function placesFor(level: MapDetailLevel, selected: RegionId | null, focus: string): MapPlace[] {
  if (level === 'overview') return [];
  const tiers = level === 'local' ? ['regional', 'local'] : ['regional'];
  const layer = MAP_PLACES.filter((p) => tiers.includes(p.tier));
  // A chosen region is the focus: only its own places, nobody else's.
  if (selected) return layer.filter((p) => p.parentRegion === selected);
  // Free exploration: the neighbourhood around where the camera looks.
  const [fx, fz] = focus.split(',').map(Number);
  const radius = DETAIL.radius[level];
  return layer.filter((p) => Math.hypot(p.position[0] - fx, p.position[1] - fz) <= radius);
}

type Shown = { place: MapPlace; leaving: boolean };

type Props = {
  /** The terrain, for occlusion. */
  occluder: RefObject<Object3D | null>;
};

/** The progressive layer: places arrive and leave as the camera comes and goes. */
export function MapPlaces({ occluder }: Props) {
  const ready = useMapState((s) => s.phase === 'ready');
  const level = useMapState((s) => s.detailLevel);
  const selected = useMapState((s) => s.selected);
  const focus = useMapState((s) => s.detailFocus);

  const wanted = useMemo(() => (ready ? placesFor(level, selected, focus) : []), [ready, level, selected, focus]);

  // Places that are no longer wanted stay a moment, marked leaving, so they
  // can fade out; then they unmount (and stop costing an occlusion ray).
  const [shown, setShown] = useState<Shown[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const ids = new Set(wanted.map((p) => p.id));
    setShown((prev) => {
      const next: Shown[] = wanted.map((place) => ({ place, leaving: false }));
      for (const item of prev) if (!ids.has(item.place.id)) next.push({ place: item.place, leaving: true });
      return next;
    });
    for (const place of wanted) {
      window.clearTimeout(timers.current.get(place.id));
      timers.current.delete(place.id);
    }
  }, [wanted]);

  useEffect(() => {
    for (const item of shown) {
      if (!item.leaving || timers.current.has(item.place.id)) continue;
      const id = item.place.id;
      timers.current.set(
        id,
        window.setTimeout(() => {
          timers.current.delete(id);
          setShown((prev) => prev.filter((s) => !(s.leaving && s.place.id === id)));
        }, LEAVE_MS),
      );
    }
  }, [shown]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <>
      {shown.map(({ place, leaving }) => (
        <MapPlaceHotspot key={place.id} place={place} leaving={leaving} occluder={occluder} />
      ))}
    </>
  );
}
