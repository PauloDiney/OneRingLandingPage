import { PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { LIMITS, MAP_REGIONS, OVERVIEW, type MapView, type RegionId, type Vec3 } from '../../data/mapRegions';
import { DETAIL, PLACE_VIEW, type MapDetailLevel, type MapPlace } from '../../data/mapPlaces';
import { mapStore } from './mapStore';

/*
 * The atlas camera. Every move is GSAP acting on the real Three.js camera and
 * the OrbitControls target — never React state, never a CSS transform.
 *
 *   free exploration ──flyTo──► focused region ──back──► free exploration
 *        (orbit, zoom, pan        (controls locked in       (the exact view
 *         within limits)           flight, then a tighter    the reader left)
 *                                  orbit around the region)
 *
 * It also watches how close the camera is — on every controls change, which
 * includes every frame of a flight — and tells the store only when a detail
 * threshold is crossed (overview ⇄ regional ⇄ local). Nothing per frame
 * reaches React.
 */

const DEG = Math.PI / 180;

type Pose = { position: Vector3; target: Vector3 };
type Rig = { camera: PerspectiveCamera; controls: OrbitControlsImpl; invalidate: () => void };

let rig: Rig | null = null;
let overview: MapView = { ...OVERVIEW, distance: 12 };
/** Viewport width ÷ height. Portrait screens frame things differently. */
let aspect = 16 / 9;
/** Where free exploration was when a region was chosen: "back" returns here. */
let saved: Pose | null = null;
let flight: gsap.core.Tween | null = null;
/** Height of the terrain under a point; set by the scene once the model is in. */
let groundAt: ((x: number, z: number) => number) | null = null;
/** How close the camera may come to the land beneath it, in atlas units. */
const CLEARANCE = 0.14;

/** Camera position for a view (azimuth 0 = from the south, looking north). */
export function viewPose(view: MapView): Pose {
  const el = view.elevation * DEG;
  const az = view.azimuth * DEG;
  const target = new Vector3(...view.target);
  const flat = view.distance * Math.cos(el);
  const position = new Vector3(
    target.x + flat * Math.sin(az),
    target.y + view.distance * Math.sin(el),
    target.z + flat * Math.cos(az),
  );
  return { position, target };
}

/**
 * Portrait screens see less land at the same distance (the frame is narrow),
 * so every framing distance — region views, place views, detail thresholds —
 * is stretched by the same factor.
 */
const portraitScale = () => (aspect < 1 ? Math.min(1.8, Math.pow(1 / aspect, 0.6)) : 1);

export function regionView(id: RegionId): MapView {
  const region = MAP_REGIONS.find((r) => r.id === id)!;
  const view: MapView = { ...region.view, target: region.view.target ?? region.position };
  if (aspect >= 1) return view;
  // Portrait: step back, and aim a little in front of the region, lifting it
  // clear of the bottom sheet that carries its text.
  const distance = view.distance * portraitScale();
  const az = view.azimuth * DEG;
  const lift = distance * 0.16;
  const [x, y, z] = view.target;
  return { ...view, distance, target: [x + Math.sin(az) * lift, y, z + Math.cos(az) * lift] };
}

/** The opening angle: steeper on portrait screens, where depth has more room than width. */
export const overviewElevation = (ratio: number) => (ratio < 0.9 ? OVERVIEW.elevation + 12 : OVERVIEW.elevation);

/**
 * The overview distance that frames the whole map for this viewport. Portrait
 * screens let the east and west edges run off rather than shrink the land.
 */
export function fitOverview(aspect: number, fovDeg: number, halfX: number, halfZ: number): number {
  const v = (fovDeg * DEG) / 2;
  const h = Math.atan(Math.tan(v) * aspect);
  const el = overviewElevation(aspect) * DEG;
  const byWidth = (halfX * 1.06) / Math.tan(h);
  const byDepth = (halfZ * Math.sin(el) * 1.18) / Math.tan(v);
  return aspect < 0.9 ? Math.max(byDepth, byWidth * 0.7) : Math.max(byWidth, byDepth);
}

/* ── Limits ─────────────────────────────────────────────────────────────── */

function setOrbit(controls: OrbitControlsImpl, o: { minD: number; maxD: number; minEl: number; maxEl: number; az: number; range: number; pan: boolean }) {
  controls.minDistance = o.minD;
  controls.maxDistance = o.maxD;
  // OrbitControls measures the polar angle from straight up.
  controls.minPolarAngle = (90 - o.maxEl) * DEG;
  controls.maxPolarAngle = (90 - o.minEl) * DEG;
  controls.minAzimuthAngle = (o.az - o.range) * DEG;
  controls.maxAzimuthAngle = (o.az + o.range) * DEG;
  controls.enablePan = o.pan;
}

function freeLimits(controls: OrbitControlsImpl) {
  setOrbit(controls, {
    minD: LIMITS.minDistance,
    maxD: overview.distance * 1.08,
    minEl: LIMITS.minElevation,
    maxEl: LIMITS.maxElevation,
    az: overview.azimuth,
    range: LIMITS.azimuthRange,
    pan: true,
  });
}

/** Around a region: a closer, tighter orbit, no panning away. */
function focusedLimits(controls: OrbitControlsImpl, view: MapView) {
  setOrbit(controls, {
    minD: Math.max(LIMITS.minDistance * 0.8, view.distance * 0.7),
    maxD: view.distance * 1.5,
    minEl: Math.max(LIMITS.minElevation, view.elevation - 8),
    maxEl: Math.min(LIMITS.maxElevation, view.elevation + 24),
    az: view.azimuth,
    range: 28,
    pan: false,
  });
}

/** In flight nothing may clamp the path. */
function openLimits(controls: OrbitControlsImpl) {
  setOrbit(controls, { minD: 0, maxD: Infinity, minEl: -90, maxEl: 90, az: 0, range: Infinity, pan: false });
}

/**
 * After every move: the camera never sinks into a mountain, and in free
 * exploration the point it looks at stays over the land.
 */
function guard() {
  if (!rig) return;
  const { camera } = rig;
  if (groundAt) {
    const floor = groundAt(camera.position.x, camera.position.z) + CLEARANCE;
    if (camera.position.y < floor) camera.position.y = floor;
  }
  trackDetail();
  if (mapStore.get().selected) return;
  const t = rig.controls.target;
  const { x, z } = LIMITS.panBounds;
  const cx = Math.min(Math.max(t.x, -x), x);
  const cz = Math.min(Math.max(t.z, -z), z);
  if (cx !== t.x || cz !== t.z) {
    // Move camera and target together, so the view slides rather than tilts.
    rig.camera.position.x += cx - t.x;
    rig.camera.position.z += cz - t.z;
    t.x = cx;
    t.z = cz;
  }
}

/* ── Detail level ─────────────────────────────────────────────────────────── */

/**
 * Which layer of labels a camera distance calls for. Arriving at a closer
 * layer happens at its threshold; leaving it takes a little more distance
 * (hysteresis), so a zoom resting on the edge never flickers.
 */
function levelFor(distance: number, current: MapDetailLevel): MapDetailLevel {
  const k = portraitScale();
  const local = DETAIL.local * k + (current === 'local' ? DETAIL.hysteresis * k : 0);
  const regional = DETAIL.regional * k + (current === 'overview' ? 0 : DETAIL.hysteresis * k);
  if (distance <= local) return 'local';
  if (distance <= regional) return 'regional';
  return 'overview';
}

const snap = (n: number) => Math.round(n * 2) / 2;

/** Cheap: a subtraction, a comparison or two, and a store write only on change. */
function trackDetail() {
  if (!rig) return;
  const { camera, controls } = rig;
  const state = mapStore.get();
  const detailLevel = levelFor(camera.position.distanceTo(controls.target), state.detailLevel);
  // Where the camera looks matters only for free exploration past the overview.
  const detailFocus =
    detailLevel !== 'overview' && !state.selected ? `${snap(controls.target.x)},${snap(controls.target.z)}` : state.detailFocus;
  if (detailLevel !== state.detailLevel || detailFocus !== state.detailFocus) mapStore.set({ detailLevel, detailFocus });
}

/* ── Flights ──────────────────────────────────────────────────────────────── */

function fly(to: Pose, done: () => void, opts: { duration?: number; ease?: string; arc?: number } = {}) {
  if (!rig) return;
  const { camera, controls, invalidate } = rig;
  flight?.kill();
  controls.enabled = false;
  openLimits(controls);

  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const travel = fromTarget.distanceTo(to.target) + fromPos.distanceTo(to.position) * 0.5;
  const reduced = prefersReducedMotion();
  const duration = reduced ? 0.45 : (opts.duration ?? gsap.utils.clamp(1.8, 3, 1.5 + travel * 0.22));
  // A flight, not a zoom: the camera lifts a little on the way, then settles lower.
  const arc = reduced ? 0 : (opts.arc ?? Math.min(1.1, travel * 0.16));
  const p = { t: 0 };

  flight = gsap.to(p, {
    t: 1,
    duration,
    ease: opts.ease ?? 'power3.inOut',
    onUpdate: () => {
      camera.position.lerpVectors(fromPos, to.position, p.t);
      camera.position.y += Math.sin(Math.PI * p.t) * arc;
      controls.target.lerpVectors(fromTarget, to.target, p.t);
      controls.update();
      invalidate();
    },
    onComplete: () => {
      flight = null;
      done();
      trackDetail();
      controls.enabled = true;
      invalidate();
    },
  });
}

/* ── Public API ───────────────────────────────────────────────────────────── */

export const mapCamera = {
  attach(next: Rig) {
    rig = next;
    rig.controls.addEventListener('change', guard);
  },

  detach() {
    flight?.kill();
    groundAt = null;
    rig?.controls.removeEventListener('change', guard);
    rig = null;
    saved = null;
  },

  /** The terrain, for keeping the camera above it. */
  setGround(fn: (x: number, z: number) => number) {
    groundAt = fn;
  },

  /** Height of the terrain under a point in atlas space, once the model is in. */
  groundAt(x: number, z: number): number | null {
    return groundAt ? groundAt(x, z) : null;
  },

  /** The overview for the current viewport; also bounds how far one may zoom out. */
  setOverview(distance: number, ratio: number) {
    aspect = ratio;
    // Portrait: centred on the land itself, from the Shire to Mordor.
    const target: Vec3 = ratio < 0.9 ? [0, OVERVIEW.target[1], OVERVIEW.target[2]] : OVERVIEW.target;
    overview = { ...OVERVIEW, target, distance, elevation: overviewElevation(ratio) };
    if (rig && !mapStore.get().selected && !flight) freeLimits(rig.controls);
  },

  overviewPose: () => viewPose(overview),

  /** The opening move: from a little further and higher, settle onto the atlas. */
  intro(duration: number) {
    if (!rig) return;
    const end = viewPose(overview);
    const start = viewPose({ ...overview, distance: overview.distance * 1.16, elevation: overview.elevation + 7 });
    rig.camera.position.copy(start.position);
    rig.controls.target.copy(start.target);
    rig.controls.update();
    fly(end, () => freeLimits(rig!.controls), { duration, ease: 'power3.out', arc: 0 });
  },

  flyTo(id: RegionId) {
    if (!rig) return;
    const { selected } = mapStore.get();
    if (selected === id && !flight) return;
    // Remember free exploration exactly as the reader left it.
    if (!selected) saved = { position: rig.camera.position.clone(), target: rig.controls.target.clone() };
    const view = regionView(id);
    mapStore.set({ selected: id, flying: true, hovered: null });
    fly(viewPose(view), () => {
      focusedLimits(rig!.controls, view);
      mapStore.set({ flying: false });
    });
  },

  /** A closer, lower pass across the chosen region, from its other side. */
  exploreRegion() {
    const { selected } = mapStore.get();
    if (!rig || !selected) return;
    const base = regionView(selected);
    const view: MapView = {
      ...base,
      distance: base.distance * 0.72,
      elevation: Math.max(LIMITS.minElevation + 2, base.elevation - 7),
      azimuth: base.azimuth + (base.azimuth >= 0 ? -34 : 34),
    };
    mapStore.set({ flying: true });
    fly(viewPose(view), () => {
      focusedLimits(rig!.controls, view);
      mapStore.set({ flying: false });
    }, { duration: 2.8, ease: 'power2.inOut', arc: 0 });
  },

  /**
   * A gentle recentre on a place: its own point on the terrain, from about
   * where the camera already faces. Close enough to enter the local layer.
   * Within a region it stays in that region (switching to the place's own
   * region if needed); in free exploration it stays free.
   */
  focusPlace(place: MapPlace) {
    if (!rig || !groundAt) return;
    const [x, z] = place.position;
    const { selected } = mapStore.get();
    const current = this.describe();
    const k = portraitScale();
    // Keep facing the way the reader was facing, within what free exploration allows.
    const facing = current?.azimuth ?? overview.azimuth;
    const azimuth = place.view?.azimuth ?? (selected ? facing : Math.max(-LIMITS.azimuthRange, Math.min(LIMITS.azimuthRange, facing)));
    const view: MapView = {
      target: [x, groundAt(x, z), z],
      distance: (place.view?.distance ?? PLACE_VIEW.distance) * k,
      elevation: place.view?.elevation ?? PLACE_VIEW.elevation,
      azimuth,
    };
    mapStore.set({ selected: selected ? place.parentRegion : null, flying: true, hovered: null });
    fly(viewPose(view), () => {
      if (mapStore.get().selected) focusedLimits(rig!.controls, view);
      else freeLimits(rig!.controls);
      mapStore.set({ flying: false });
    });
  },

  back() {
    if (!rig || !mapStore.get().selected) return;
    const to = saved ?? viewPose(overview);
    mapStore.set({ selected: null, flying: true });
    fly(to, () => {
      saved = null;
      freeLimits(rig!.controls);
      mapStore.set({ flying: false });
    });
  },

  /** Debug and tests: put the camera on a view at once. */
  jump(view: MapView) {
    if (!rig) return;
    flight?.kill();
    openLimits(rig.controls);
    const pose = viewPose(view);
    rig.camera.position.copy(pose.position);
    rig.controls.target.copy(pose.target);
    rig.controls.update();
    rig.invalidate();
  },

  /** Debug and tests: how high the camera is above the terrain directly beneath it. */
  clearance(): number | null {
    if (!rig || !groundAt) return null;
    const p = rig.camera.position;
    return p.y - groundAt(p.x, p.z);
  },

  /** Debug and tests: where an atlas point falls on screen, in CSS pixels of the canvas. */
  project(point: Vec3): [number, number] | null {
    if (!rig) return null;
    const v = new Vector3(...point).project(rig.camera);
    const el = rig.controls.domElement as HTMLElement | undefined;
    const w = el?.clientWidth ?? window.innerWidth;
    const h = el?.clientHeight ?? window.innerHeight;
    return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
  },

  /** For DEBUG_MAP: the current camera as a region `view`, ready to paste. */
  describe(): MapView | null {
    if (!rig) return null;
    const { camera, controls } = rig;
    const offset = camera.position.clone().sub(controls.target);
    const distance = offset.length();
    const r = (n: number, d = 2) => Number(n.toFixed(d));
    return {
      target: [r(controls.target.x), r(controls.target.y), r(controls.target.z)],
      distance: r(distance),
      elevation: r(Math.asin(offset.y / distance) / DEG, 1),
      azimuth: r(Math.atan2(offset.x, offset.z) / DEG, 1),
    };
  },
};
