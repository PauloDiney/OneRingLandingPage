import type { RegionId } from './mapRegions';

/*
 * The atlas's finer detail: places that appear as the camera comes closer.
 *
 * Regions (mapRegions.ts) are the six chapters of the journey; places are the
 * towns, fortresses and landmarks inside them. They live apart because they
 * behave apart: a region is always on the map, a place only when the camera
 * is near enough for it to matter.
 *
 * ── Coordinates ──────────────────────────────────────────────────────────
 * Atlas space (see mapRegions.ts): x west → east, z north → south.
 * Only [x, z] is stored. The height is read from the terrain itself when the
 * place first appears (a ray straight down through the model), so a place on
 * a mountain stands on the mountain and a place on the plains on the plains.
 *
 * To refine one: open /map/?debug under `npm run dev`, click the terrain, and
 * copy the "MapPlace position: [x, z]" line from the console (Shift+click
 * logs only that line).
 */

export type MapPlaceCategory = 'city' | 'settlement' | 'fortress' | 'landmark' | 'natural' | 'ruin';

/** Which layer a place belongs to: `regional` appears first, `local` only up close. */
export type MapPlaceTier = 'regional' | 'local';

/** Every place has a name in each dictionary (`map.places.<id>.name`); the type keeps them in step. */
export type PlaceId =
  | 'hobbiton' | 'buckland' | 'bree' | 'weathertop'
  | 'last-bridge' | 'ford-of-bruinen'
  | 'caradhras' | 'dimrill-dale' | 'lothlorien'
  | 'fangorn' | 'isengard' | 'edoras' | 'helms-deep' | 'dunharrow'
  | 'argonath' | 'amon-hen' | 'minas-tirith' | 'osgiliath' | 'pelargir' | 'dol-amroth'
  | 'dead-marshes' | 'black-gate' | 'minas-morgul' | 'cirith-ungol' | 'mount-doom' | 'barad-dur';

export type MapPlace = {
  id: PlaceId;
  parentRegion: RegionId;
  category: MapPlaceCategory;
  tier: MapPlaceTier;
  /** [x, z] in atlas space. Height comes from the terrain; never store it here. */
  position: [number, number];
  /**
   * Which side of its hairline the name sits on. Only for neighbours close
   * enough that centred names would collide.
   */
  label?: 'left' | 'right';
  /** How the camera frames the place when it is clicked; defaults below. */
  view?: {
    distance?: number;
    elevation?: number;
    azimuth?: number;
  };
};

/* ── Detail levels ─────────────────────────────────────────────────────── */

export type MapDetailLevel = 'overview' | 'regional' | 'local';

/**
 * Camera distance (camera → the point it looks at) at which each layer
 * appears. Region views sit at 3.6–4.2, so choosing a region enters REGIONAL;
 * Explore Region goes to 72% of that (2.6–3.0), so it enters LOCAL.
 * On portrait screens every distance is scaled by the same factor as the
 * region views themselves (mapCamera.ts).
 */
export const DETAIL = {
  regional: 5.2,
  local: 3.1,
  /** A layer leaves only this much further out than it arrived: no flicker at the edge. */
  hysteresis: 0.12,
  /**
   * In free exploration, only places this near the point the camera looks at
   * are shown, so zooming in reveals a neighbourhood, not the whole world.
   * About what those distances show of the land, plus a little for the 0.5
   * grid the look-at point is snapped to.
   */
  radius: { regional: 2.4, local: 1.6 },
} as const;

/** Clicking a place frames it like this, unless the place says otherwise. */
export const PLACE_VIEW = { distance: 2, elevation: 30 } as const;

/* ── Places ─────────────────────────────────────────────────────────────── */

/*
 * ⚠ INITIAL APPROXIMATIONS — refine with DEBUG_MAP.
 * Derived from the six region anchors and the geography between them, not
 * surveyed on the model. Points marked TODO were seen to sit visibly off on
 * the terrain (see the note beside each); they are left as supplied.
 * Names are in src/i18n/locales (`map.places`).
 */
export const MAP_PLACES: MapPlace[] = [
  /* The Shire / Eriador */
  { id: 'hobbiton', parentRegion: 'shire', category: 'settlement', tier: 'local', position: [-2.97, -1.36], label: 'left' },
  // TODO refine with DEBUG_MAP: west of the large river from the northern lake (likely the Brandywine, x ≈ -1.88 here); Buckland lies on its east bank.
  { id: 'buckland', parentRegion: 'shire', category: 'settlement', tier: 'local', position: [-2.62, -1.28], label: 'right' },
  // TODO refine with DEBUG_MAP: west of that same river (x ≈ -1.98 here); Bree lies east of it.
  { id: 'bree', parentRegion: 'shire', category: 'settlement', tier: 'regional', position: [-2.3, -1.46] },
  { id: 'weathertop', parentRegion: 'shire', category: 'ruin', tier: 'regional', position: [-1.78, -1.58] },

  /* Rivendell */
  { id: 'last-bridge', parentRegion: 'rivendell', category: 'landmark', tier: 'local', position: [-1.52, -1.47], label: 'left' },
  { id: 'ford-of-bruinen', parentRegion: 'rivendell', category: 'landmark', tier: 'local', position: [-1.23, -1.5], label: 'right' },

  /* Moria / the Misty Mountains */
  // TODO refine with DEBUG_MAP: on the western foothills (y 0.08); the Misty Mountains crest runs at x ≈ -0.25 here.
  { id: 'caradhras', parentRegion: 'moria', category: 'natural', tier: 'local', position: [-0.68, -0.72] },
  { id: 'dimrill-dale', parentRegion: 'moria', category: 'natural', tier: 'local', position: [-0.45, -0.5], label: 'right' },
  { id: 'lothlorien', parentRegion: 'moria', category: 'landmark', tier: 'regional', position: [-0.15, -0.52] },

  /* Rohan */
  { id: 'fangorn', parentRegion: 'rohan', category: 'natural', tier: 'local', position: [-0.03, 0.12] },
  { id: 'isengard', parentRegion: 'rohan', category: 'fortress', tier: 'regional', position: [-0.68, 0.28] },
  { id: 'edoras', parentRegion: 'rohan', category: 'city', tier: 'regional', position: [-0.08, 0.74] },
  { id: 'helms-deep', parentRegion: 'rohan', category: 'fortress', tier: 'regional', position: [-0.5, 0.8] },
  { id: 'dunharrow', parentRegion: 'rohan', category: 'landmark', tier: 'local', position: [0.1, 1.04] },

  /* Gondor */
  // TODO refine with DEBUG_MAP: ~0.33 west of the Anduin (x ≈ 0.96 here); the pillars stand on the river.
  { id: 'argonath', parentRegion: 'gondor', category: 'landmark', tier: 'local', position: [0.63, 0.53], label: 'left' },
  { id: 'amon-hen', parentRegion: 'gondor', category: 'ruin', tier: 'local', position: [0.77, 0.59], label: 'right' },
  { id: 'minas-tirith', parentRegion: 'gondor', category: 'city', tier: 'regional', position: [1.34, 1.33], label: 'left' },
  { id: 'osgiliath', parentRegion: 'gondor', category: 'ruin', tier: 'regional', position: [1.57, 1.34], label: 'right' },
  { id: 'pelargir', parentRegion: 'gondor', category: 'city', tier: 'local', position: [1.17, 2.05] },
  { id: 'dol-amroth', parentRegion: 'gondor', category: 'city', tier: 'local', position: [0.42, 2.14] },

  /* Mordor */
  // TODO refine with DEBUG_MAP: on the flank of Mordor's mountain wall (y 0.22); the low ground begins west of x ≈ 1.65.
  { id: 'dead-marshes', parentRegion: 'mordor', category: 'natural', tier: 'local', position: [1.82, 0.78], label: 'left' },
  { id: 'black-gate', parentRegion: 'mordor', category: 'fortress', tier: 'regional', position: [2.25, 0.74], label: 'right' },
  // TODO refine with DEBUG_MAP: east of the Ephel Dúath crest (x ≈ 1.87 here), inside Mordor; the Morgul Vale opens west.
  { id: 'minas-morgul', parentRegion: 'mordor', category: 'city', tier: 'local', position: [2.06, 1.36], label: 'left' },
  { id: 'cirith-ungol', parentRegion: 'mordor', category: 'fortress', tier: 'local', position: [2.18, 1.32], label: 'right' },
  // TODO refine with DEBUG_MAP: on the flat plain (y 0.04); the model's isolated cone peaks at ≈ [2.35, 1.19].
  { id: 'mount-doom', parentRegion: 'mordor', category: 'natural', tier: 'regional', position: [2.61, 1.44] },
  { id: 'barad-dur', parentRegion: 'mordor', category: 'fortress', tier: 'regional', position: [3.02, 1.35] },
];
