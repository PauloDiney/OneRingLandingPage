export type Chapter = {
  id: string;
  index: string;
  region: string;
  name: string;
  line: string;
  date: string;
  /** Film progress (0–1) at which the chapter starts to arrive. */
  in: number;
  /** Film progress at which it has finished leaving. */
  out: number;
  align: 'left' | 'right';
};

/*
 * Calibrated against the footage (10.03 s, 301 frames), not guessed:
 *   0.00–0.07  the empty map — the opening title holds here
 *   0.07–0.27  the ring falls, lands and lies still
 *   0.27–0.45  it rises onto its edge and starts to roll
 *   0.45–0.70  it rolls across the map
 *   0.70–0.88  a warm red cast rises as Mordor approaches; the ring falls
 *   0.88–1.00  at rest, inscription facing the camera
 * Re-derive from a contact sheet if the video is ever replaced (see README).
 */
export const CHAPTERS: Chapter[] = [
  {
    id: 'shire',
    index: '01',
    region: 'Eriador',
    name: 'The Shire',
    line: 'Where the road begins.',
    date: '23 · IX · 3018',
    in: 0.085,
    out: 0.28,
    align: 'left',
  },
  {
    id: 'rivendell',
    index: '02',
    region: 'Imladris',
    name: 'Rivendell',
    line: 'Where the burden is given a name.',
    date: '25 · X · 3018',
    in: 0.3,
    out: 0.48,
    align: 'right',
  },
  {
    id: 'kingdoms',
    index: '03',
    region: 'The kingdoms of Men',
    name: 'Rohan & Gondor',
    line: 'Across the realms that held the line.',
    date: '15 · III · 3019',
    in: 0.5,
    out: 0.685,
    align: 'left',
  },
  {
    id: 'mordor',
    index: '04',
    region: 'The Black Land',
    name: 'Mordor',
    line: 'Where the shadows lie.',
    date: '25 · III · 3019',
    in: 0.71,
    out: 0.885,
    align: 'right',
  },
];

/** When the closing inscription arrives. It stays until the film ends. */
export const FINALE_IN = 0.905;

/** Frame rate of the encoded files — seeks are snapped to this grid. */
export const FILM_FPS = 30;
