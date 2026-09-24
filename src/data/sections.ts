/*
 * Structure only. Every label is looked up in the dictionaries
 * (src/i18n/locales), so it follows the selected language.
 */

/** Top-level chapters of the page, in scroll order. Drives the side indicator. Labels: `sections.<id>`. */
export const SECTIONS = [
  { id: 'film', index: '01' },
  { id: 'journey', index: '02' },
  { id: 'regions', index: '03' },
  { id: 'ring', index: '04' },
  { id: 'mordor', index: '05' },
] as const;

/** Primary navigation, in the order the brief asks for. */
export const NAV_LINKS = [
  { href: '#ring', section: 'ring' },
  { href: '#journey', section: 'journey' },
  { href: '#regions', section: 'regions' },
  { href: '#mordor', section: 'mordor' },
] as const;

/** Labels, values and notes: `specs.items.<id>`. */
export const SPECS = [
  { id: 'object', index: '01' },
  { id: 'material', index: '02' },
  { id: 'origin', index: '03' },
  { id: 'destination', index: '04' },
] as const;

/** Journey figures. Labels and notes: `journey.stats.<id>`; numbers are formatted per locale. */
export const STATS = [
  { id: 'miles', value: 1779 },
  { id: 'months', value: 6 },
  { id: 'companions', value: 9 },
  { id: 'ring', value: 1 },
] as const;
