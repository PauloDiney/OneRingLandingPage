/** Top-level chapters of the page, in scroll order. Drives the side indicator. */
export const SECTIONS = [
  { id: 'film', index: '01', label: 'The One Ring' },
  { id: 'journey', index: '02', label: 'The Journey' },
  { id: 'regions', index: '03', label: 'Regions' },
  { id: 'ring', index: '04', label: 'The Ring' },
  { id: 'mordor', index: '05', label: 'Mordor' },
] as const;

/** Primary navigation, in the order the brief asks for. */
export const NAV_LINKS = [
  { href: '#ring', label: 'The Ring' },
  { href: '#journey', label: 'The Journey' },
  { href: '#regions', label: 'Regions' },
  { href: '#mordor', label: 'Mordor' },
] as const;

export const SPECS = [
  {
    index: '01',
    label: 'Object',
    value: 'The One Ring',
    note: 'The Ruling Ring. One of twenty, and the only one that answers to no other.',
  },
  {
    index: '02',
    label: 'Material',
    value: 'Gold',
    note: 'A plain, unadorned band. Its inscription shows only in fire.',
  },
  {
    index: '03',
    label: 'Origin',
    value: 'Middle-earth',
    note: 'Forged by Sauron in the fires of Orodruin, around the year 1600 of the Second Age.',
  },
  {
    index: '04',
    label: 'Destination',
    value: 'Mount Doom',
    note: 'Unmade where it was made — the only fire hot enough. 25 March, 3019.',
  },
] as const;
