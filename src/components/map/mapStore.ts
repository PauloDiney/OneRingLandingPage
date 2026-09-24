import { useSyncExternalStore } from 'react';
import type { RegionId, Vec3 } from '../../data/mapRegions';

/*
 * The atlas's UI state, shared by the 3D scene and the DOM around it.
 * Only discrete moments live here (loading, a region chosen, a flight under
 * way) — never anything that changes per frame: the camera itself is moved
 * by GSAP directly on Three.js objects (mapCamera.ts).
 */

export type MapPhase = 'loading' | 'entering' | 'ready' | 'error';
export type MapMode = 'explore' | 'journey' | 'discover';

export type MapState = {
  phase: MapPhase;
  mode: MapMode;
  /** The focused region, or null in free exploration. */
  selected: RegionId | null;
  /** A camera flight is in progress: controls are locked. */
  flying: boolean;
  hovered: RegionId | null;
  /** DEBUG_MAP only: the last point clicked on the terrain. */
  debugPoint: Vec3 | null;
};

let state: MapState = { phase: 'loading', mode: 'explore', selected: null, flying: false, hovered: null, debugPoint: null };
const listeners = new Set<() => void>();

export const mapStore = {
  get: () => state,
  set(patch: Partial<MapState>) {
    const next = { ...state, ...patch };
    if (Object.keys(patch).every((k) => next[k as keyof MapState] === state[k as keyof MapState])) return;
    state = next;
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/** Subscribe to one slice; re-renders only when that slice changes. */
export function useMapState<T>(select: (s: MapState) => T): T {
  return useSyncExternalStore(mapStore.subscribe, () => select(mapStore.get()));
}
