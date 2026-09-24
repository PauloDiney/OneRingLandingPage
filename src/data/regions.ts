/** Text for each region lives in the dictionaries, under `regions.items.<id>`. */
export type RegionId = 'shire' | 'rivendell' | 'rohan' | 'gondor' | 'mordor';

export type Region = {
  id: RegionId;
  index: string;
  /** Detail crops of the map seen in the film, extracted with ffmpeg. */
  image: string;
  width: number;
  height: number;
  date: string;
  /** Temperature of the panel's image grade. */
  tone: 'warm' | 'cool' | 'straw' | 'stone' | 'ember';
  /** Composition variant, so consecutive panels never mirror each other. */
  layout: 'a' | 'b';
};

export const REGIONS: Region[] = [
  { id: 'shire', index: '01', image: '/images/regions/shire.webp', width: 600, height: 750, date: '23.09.3018', tone: 'warm', layout: 'a' },
  { id: 'rivendell', index: '02', image: '/images/regions/rivendell.webp', width: 720, height: 480, date: '25.10.3018', tone: 'cool', layout: 'b' },
  { id: 'rohan', index: '03', image: '/images/regions/rohan.webp', width: 520, height: 650, date: '03.03.3019', tone: 'straw', layout: 'a' },
  { id: 'gondor', index: '04', image: '/images/regions/gondor.webp', width: 840, height: 560, date: '15.03.3019', tone: 'stone', layout: 'b' },
  { id: 'mordor', index: '05', image: '/images/regions/mordor.webp', width: 630, height: 420, date: '25.03.3019', tone: 'ember', layout: 'a' },
];
