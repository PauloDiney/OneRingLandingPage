/*
 * English — the source dictionary. Its shape defines `Messages`, so every
 * other locale is checked against it at compile time.
 *
 * Elvish and Dwarvish are script modes of this same text (see scripts.ts):
 * they never have a dictionary of their own.
 */
export const en = {
  meta: {
    title: 'The One Ring — A Journey Across Middle-earth',
    description:
      'A scroll-driven film following the One Ring across the map of Middle-earth, from the Shire to Mount Doom.',
  },

  brand: {
    name: 'Middle-earth',
  },

  skip: 'Skip the film',

  sections: {
    film: 'The One Ring',
    journey: 'The Journey',
    regions: 'Regions',
    ring: 'The Ring',
    mordor: 'Mordor',
  },

  nav: {
    primary: 'Primary',
    backToTop: '— back to the top',
    menu: 'Menu',
    close: 'Close',
    siteMenu: 'Site menu',
    sectionsLabel: 'Sections',
  },

  menu: {
    quote: '“Not all those who wander are lost.”',
    study: 'A digital study',
  },

  cursor: {
    explore: 'Explore',
    view: 'View',
    top: 'Top',
  },

  language: {
    label: 'Language',
    select: 'Select language — current: {name}',
    note: 'Script modes redraw the English text in Tengwar-style letters or runes. A change of letters, not a translation.',
    names: {
      'pt-BR': 'Português',
      en: 'English',
      elvish: 'Elvish',
      dwarvish: 'Dwarvish',
    },
    scripts: {
      elvish: 'Tengwar-style letters',
      dwarvish: 'Runic letters',
    },
  },

  hero: {
    the: 'The',
    one: 'One',
    ring: 'Ring',
    lead: 'A journey across Middle-earth.',
    film: 'Scroll-driven film',
    frames: '301 frames',
    duration: '10.03 s',
    cue: 'Scroll to explore',
  },

  film: {
    chapters: {
      shire: { region: 'Eriador', name: 'The Shire', line: 'Where the road begins.' },
      rivendell: { region: 'Imladris', name: 'Rivendell', line: 'Where the burden is given a name.' },
      kingdoms: { region: 'The kingdoms of Men', name: 'Rohan & Gondor', line: 'Across the realms that held the line.' },
      mordor: { region: 'The Black Land', name: 'Mordor', line: 'Where the shadows lie.' },
    },
    finale: {
      quote: 'One Ring to rule them all.',
      inscription: 'Ash nazg durbatulûk',
      source: 'The inscription · Black Speech of Mordor',
    },
    srTitle: 'The film, in four moments',
    srFinale: 'At rest in Mordor, the ring’s inscription faces the camera: “One Ring to rule them all.”',
  },

  journey: {
    aside: 'A route traced across the map you have just watched, one region at a time.',
    era: 'T.A. 3018 — 3019',
    titleThe: 'The',
    titleJourney: 'Journey',
    lead: 'From the Shire to Mordor.',
    fig: 'Fig. 02 — The road',
    text:
      'A hobbit, a ring and a road that goes ever on. Six months on foot — across rivers, mountains and kingdoms — to return one small object to the only fire in the world that can unmake it.',
    stats: {
      miles: { label: 'Miles on foot', note: 'Bag End to Mount Doom' },
      months: { label: 'Months', note: 'September 3018 — March 3019' },
      companions: { label: 'Companions', note: 'Against nine riders' },
      ring: { label: 'Ring', note: 'To rule them all' },
    },
  },

  regions: {
    titleLead: 'Five lands,',
    titleEm: 'one road.',
    lede:
      'Each region on the map is a chapter of the same walk — from the quietest valley in the west to the only mountain that matters.',
    hint: 'Keep scrolling',
    fig: 'Fig.',
    facts: {
      seat: 'Seat',
      event: 'Event',
      date: 'Date',
    },
    items: {
      shire: {
        name: 'The Shire',
        kicker: 'Where the road begins',
        description:
          'Green hills, round doors and long afternoons. The quietest corner of the map — and the one the whole story turns on.',
        alt: 'Soft-focus detail of the north-western map: rivers and forests drawn in ink on aged paper.',
        seat: 'Bag End, Hobbiton',
        event: 'Frodo leaves Bag End',
      },
      rivendell: {
        name: 'Rivendell',
        kicker: 'The last homely house',
        description:
          'A hidden valley of waterfalls and old counsel. Here the road was chosen, and nine walkers set out against nine riders.',
        alt: 'Map detail lettered Rivendell and Lothlórien, with rivers and a line of forest.',
        seat: 'Imladris',
        event: 'The Council of Elrond',
      },
      rohan: {
        name: 'Rohan',
        kicker: 'Land of the horse-lords',
        description:
          'Open grassland under an open sky. A kingdom measured in horses, and in the distance a rider can cover before dark.',
        alt: 'Map detail lettered Rohan above a range of inked mountains.',
        seat: 'Edoras',
        event: 'Battle of the Hornburg',
      },
      gondor: {
        name: 'Gondor',
        kicker: 'The white city',
        description:
          'Stone terraces climbing a mountain’s shoulder — the last great bulwark of the West, watching the shadow across the river.',
        alt: 'Map detail lettered Gondor and Osgiliath, where the river Anduin bends toward the sea.',
        seat: 'Minas Tirith',
        event: 'Battle of the Pelennor Fields',
      },
      mordor: {
        name: 'Mordor',
        kicker: 'Where the shadows lie',
        description:
          'Ash, iron and a mountain that never cools. Every road on this map bends, eventually, toward this one place.',
        alt: 'Map detail of the mountains of Mordor, with Mount Doom marked in red.',
        seat: 'Barad-dûr',
        event: 'The Ring is unmade',
      },
    },
  },

  ring: {
    title: 'A plain band of gold, and the verse written for it.',
    verse: ['One Ring to rule them all,', 'One Ring to find them,', 'One Ring to bring them all', 'and in the darkness bind them.'],
    study: 'Fig. 04 — Real-time study',
    material: 'Au · polished · no ornament',
  },

  specs: {
    kicker: 'Specification',
    titleLead: 'An object,',
    titleEm: 'described plainly.',
    items: {
      object: {
        label: 'Object',
        value: 'The One Ring',
        note: 'The Ruling Ring. One of twenty, and the only one that answers to no other.',
      },
      material: {
        label: 'Material',
        value: 'Gold',
        note: 'A plain, unadorned band. Its inscription shows only in fire.',
      },
      origin: {
        label: 'Origin',
        value: 'Middle-earth',
        note: 'Forged by Sauron in the fires of Orodruin, around the year 1600 of the Second Age.',
      },
      destination: {
        label: 'Destination',
        value: 'Mount Doom',
        note: 'Unmade where it was made — the only fire hot enough. 25 March, 3019.',
      },
    },
  },

  mordor: {
    alt: 'The Ring at rest on the map beside the word Mordor, its inscription glowing in the dark.',
    place: 'Orodruin',
    mountain: 'Mount Doom',
    word: 'Mordor',
    lead: 'Where the shadows lie.',
    body:
      'The journey ends where the Ring began: in the fires of Orodruin, the one place in all of Middle-earth hot enough to unmake it.',
    final: 'The road goes ever on.',
  },

  footer: {
    note:
      'A non-commercial digital study inspired by J.R.R. Tolkien’s {work}. Not affiliated with the Tolkien Estate, Middle-earth Enterprises or Warner Bros.',
    work: 'The Lord of the Rings',
    nav: 'Footer',
    index: 'Index',
    colophon: 'Colophon',
    colophonNote:
      'React, GSAP and a single scroll-driven video. Set in Instrument Serif and Geist; scripts in Tengwar Annatar (Johan Winge) and Moria (Neale Davidson).',
    backTo: 'Back to the ',
    top: 'Top',
  },
};
