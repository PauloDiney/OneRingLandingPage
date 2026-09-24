/*
 * The interactive atlas: every number the map depends on lives in this file.
 *
 * ── Atlas space ───────────────────────────────────────────────────────────
 * Mapa3D.glb is centred on the origin and scaled so its longest side spans
 * ATLAS_WIDTH units, whatever its own units are (MapModel.tsx measures it with
 * a Box3). Heights are then multiplied by RELIEF. In that space:
 *
 *     x  west (−5)  →  east (+5)
 *     z  north (−3.6) → south (+3.6)
 *     y  up; sea level is 0, the plains sit near +0.1, the peaks near +0.5
 *
 * All positions below are in atlas space.
 *
 * ── Finding coordinates ───────────────────────────────────────────────────
 * Set DEBUG_MAP to true (or open /map/?debug while running `npm run dev`),
 * then click the terrain: the exact point is logged to the console, ready to
 * paste as a `position`. Press C to log the current camera as a `view`.
 * Debug mode never runs in a production build.
 */

export const DEBUG_MAP = false;

export const MAP_URL = '/Models/Mapa3D.glb';

/** Width of the map's longest side, in atlas units. */
export const ATLAS_WIDTH = 10;

/**
 * Vertical exaggeration. The model's relief is about 8% of its width —
 * true to the source, but flat under light. A classic cartographic lift
 * makes the mountains read without distorting the plan.
 */
export const RELIEF = 2;

export type Vec3 = [number, number, number];

/**
 * A camera view, described the way a photographer would: what it looks at,
 * from how far, how high above the horizon, and from which side.
 */
export type MapView = {
  target: Vec3;
  /** Distance from the camera to the target. */
  distance: number;
  /** Degrees above the horizon (90 = straight down). */
  elevation: number;
  /** Degrees around the vertical axis; 0 looks north from the south. */
  azimuth: number;
};

/** The opening atlas view: the whole map, from the south, 48° up. */
export const OVERVIEW: Omit<MapView, 'distance'> = {
  // A touch west of centre: the headline sits over the empty northern sea.
  target: [-0.35, 0, 0.3],
  elevation: 48,
  azimuth: 0,
};

export type RegionId = 'shire' | 'rivendell' | 'moria' | 'rohan' | 'gondor' | 'mordor';

export type MapRegion = {
  id: RegionId;
  index: string;
  /** Where the hotspot stands: a point on the terrain surface. */
  position: Vec3;
  /**
   * How the camera frames the region when it is chosen. Omit `target` to
   * look at `position`. Lower and closer reveals more relief, but under ~3
   * units the model's decimated triangles start to show as flat slabs.
   */
  view: Omit<MapView, 'target'> & { target?: Vec3 };
};

/*
 * ⚠ PROVISIONAL COORDINATES — refine them with DEBUG_MAP.
 * Placed by eye on a top-down render of Mapa3D.glb (Mordor's mountain ring,
 * the White Mountains and the Anduin as landmarks), then picked on the actual
 * surface with DEBUG_MAP. Close enough to fly to; not surveyed.
 * Text for each region is in src/i18n/locales (`map.regions`).
 */
export const MAP_REGIONS: MapRegion[] = [
  {
    id: 'shire',
    index: '01',
    position: [-2.82, 0.04, -1.31], // TODO: refine with DEBUG_MAP
    view: { distance: 3.8, elevation: 36, azimuth: -12 },
  },
  {
    id: 'rivendell',
    index: '02',
    position: [-1.1, 0.05, -1.51], // TODO: refine with DEBUG_MAP
    view: { distance: 3.6, elevation: 35, azimuth: 16 },
  },
  {
    id: 'moria',
    index: '03',
    position: [-0.6, 0.14, -0.55], // TODO: refine with DEBUG_MAP
    view: { distance: 3.6, elevation: 34, azimuth: -18 },
  },
  {
    id: 'rohan',
    index: '04',
    position: [-0.1, 0.14, 0.55], // TODO: refine with DEBUG_MAP
    view: { distance: 4, elevation: 36, azimuth: 10 },
  },
  {
    id: 'gondor',
    index: '05',
    position: [0.91, 0.04, 1.61], // TODO: refine with DEBUG_MAP
    view: { distance: 3.8, elevation: 35, azimuth: -14 },
  },
  {
    id: 'mordor',
    index: '06',
    position: [2.71, 0.08, 1.5], // TODO: refine with DEBUG_MAP
    view: { distance: 4.2, elevation: 36, azimuth: 14 },
  },
];

/* ── Camera limits ───────────────────────────────────────────────────────── */

export const LIMITS = {
  /** Degrees above the horizon the camera may reach: never beneath, never flat. */
  minElevation: 16,
  maxElevation: 82,
  /** How far the view may swing either side of north, in degrees. */
  azimuthRange: 40,
  /**
   * Distance from the target, in atlas units. The far limit is the overview's.
   * Whatever the distance, the camera also keeps clear of the terrain under it.
   */
  minDistance: 1,
  /** The target (what the camera looks at) stays over the land. */
  panBounds: { x: 4.4, z: 3.1 },
} as const;
