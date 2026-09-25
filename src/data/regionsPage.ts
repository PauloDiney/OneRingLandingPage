import { MAP_LINK } from './sections';
import type { RegionId as MapRegionId } from './mapRegions';

/*
 * The Regions page (regions/index.html): six chapters, in scroll order.
 *
 * Structure only. Every word is in the dictionaries under
 * `regionsPage.regions.<id>` (src/i18n/locales), so it follows the language.
 * Each chapter's look — its ground, its composition, its motion — lives with
 * its component (components/RegionsPage), keyed by the same id.
 */

export type ChapterId = 'shire' | 'rivendell' | 'moria' | 'rohan' | 'gondor' | 'mordor';

export type Chapter = {
  id: ChapterId;
  index: string;
  /**
   * The cinematic still. Source art: /public/images/PageRegion/<Name>Regions.png
   * (1536×1024). The page serves WebP encoded from it — the full width and a
   * 960px copy for phones — beside the originals, which stay untouched.
   */
  image: { src: string; small: string; width: number; height: number };
  /**
   * What must stay in frame when the image is cropped: the hobbit-hole, the
   * falls, the shaft of light, the hall on its hill, the white city, the
   * mountain. Mobile crops are narrower, so they aim more tightly.
   */
  focus: { desktop: string; mobile: string };
  /** The surface the chapter sits on. The navbar and the index read it (`data-tone`). */
  tone: 'light' | 'dark';
  /** The region the 3D map flies to from this chapter. */
  mapRegion: MapRegionId;
};

const still = (name: string) => ({
  src: `/images/PageRegion/${name}Regions.webp`,
  small: `/images/PageRegion/${name}Regions-960.webp`,
  width: 1536,
  height: 1024,
});

export const CHAPTERS: Chapter[] = [
  { id: 'shire', index: '01', image: still('Condado'), focus: { desktop: '62% 55%', mobile: '74% 50%' }, tone: 'light', mapRegion: 'shire' },
  { id: 'rivendell', index: '02', image: still('Valfenda'), focus: { desktop: '74% 45%', mobile: '72% 42%' }, tone: 'light', mapRegion: 'rivendell' },
  { id: 'moria', index: '03', image: still('Moria'), focus: { desktop: '58% 40%', mobile: '62% 40%' }, tone: 'dark', mapRegion: 'moria' },
  { id: 'rohan', index: '04', image: still('Rohan'), focus: { desktop: '58% 56%', mobile: '80% 45%' }, tone: 'light', mapRegion: 'rohan' },
  { id: 'gondor', index: '05', image: still('Gondor'), focus: { desktop: '74% 40%', mobile: '74% 36%' }, tone: 'light', mapRegion: 'gondor' },
  { id: 'mordor', index: '06', image: still('Mordor'), focus: { desktop: '70% 40%', mobile: '76% 30%' }, tone: 'dark', mapRegion: 'mordor' },
];

export const CHAPTER_TOTAL = String(CHAPTERS.length).padStart(2, '0');

/** The atlas, opened on a region: it reads `?region=` and flies there once the land is in. */
export const mapHref = (region: MapRegionId) => `${MAP_LINK.href}?region=${region}`;

/**
 * Where "Continue the journey" leads. There is no Journey page yet, so it is
 * the Journey chapter of the home page; point it at the page when it exists.
 */
export const JOURNEY_HREF = '/#journey';
