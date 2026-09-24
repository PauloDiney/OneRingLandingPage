export type Region = {
  id: string;
  index: string;
  name: string;
  kicker: string;
  description: string;
  /** Detail crops of the map seen in the film, extracted with ffmpeg. */
  image: string;
  alt: string;
  width: number;
  height: number;
  seat: string;
  event: string;
  date: string;
  /** Temperature of the panel's image grade. */
  tone: 'warm' | 'cool' | 'straw' | 'stone' | 'ember';
  /** Composition variant, so consecutive panels never mirror each other. */
  layout: 'a' | 'b';
};

export const REGIONS: Region[] = [
  {
    id: 'shire',
    index: '01',
    name: 'The Shire',
    kicker: 'Where the road begins',
    description:
      'Green hills, round doors and long afternoons. The quietest corner of the map — and the one the whole story turns on.',
    image: '/images/regions/shire.webp',
    alt: 'Soft-focus detail of the north-western map: rivers and forests drawn in ink on aged paper.',
    width: 600,
    height: 750,
    seat: 'Bag End, Hobbiton',
    event: 'Frodo leaves Bag End',
    date: '23.09.3018',
    tone: 'warm',
    layout: 'a',
  },
  {
    id: 'rivendell',
    index: '02',
    name: 'Rivendell',
    kicker: 'The last homely house',
    description:
      'A hidden valley of waterfalls and old counsel. Here the road was chosen, and nine walkers set out against nine riders.',
    image: '/images/regions/rivendell.webp',
    alt: 'Map detail lettered Rivendell and Lothlórien, with rivers and a line of forest.',
    width: 720,
    height: 480,
    seat: 'Imladris',
    event: 'The Council of Elrond',
    date: '25.10.3018',
    tone: 'cool',
    layout: 'b',
  },
  {
    id: 'rohan',
    index: '03',
    name: 'Rohan',
    kicker: 'Land of the horse-lords',
    description:
      'Open grassland under an open sky. A kingdom measured in horses, and in the distance a rider can cover before dark.',
    image: '/images/regions/rohan.webp',
    alt: 'Map detail lettered Rohan above a range of inked mountains.',
    width: 520,
    height: 650,
    seat: 'Edoras',
    event: 'Battle of the Hornburg',
    date: '03.03.3019',
    tone: 'straw',
    layout: 'a',
  },
  {
    id: 'gondor',
    index: '04',
    name: 'Gondor',
    kicker: 'The white city',
    description:
      'Stone terraces climbing a mountain’s shoulder — the last great bulwark of the West, watching the shadow across the river.',
    image: '/images/regions/gondor.webp',
    alt: 'Map detail lettered Gondor and Osgiliath, where the river Anduin bends toward the sea.',
    width: 840,
    height: 560,
    seat: 'Minas Tirith',
    event: 'Battle of the Pelennor Fields',
    date: '15.03.3019',
    tone: 'stone',
    layout: 'b',
  },
  {
    id: 'mordor',
    index: '05',
    name: 'Mordor',
    kicker: 'Where the shadows lie',
    description:
      'Ash, iron and a mountain that never cools. Every road on this map bends, eventually, toward this one place.',
    image: '/images/regions/mordor.webp',
    alt: 'Map detail of the mountains of Mordor, with Mount Doom marked in red.',
    width: 630,
    height: 420,
    seat: 'Barad-dûr',
    event: 'The Ring is unmade',
    date: '25.03.3019',
    tone: 'ember',
    layout: 'a',
  },
];
