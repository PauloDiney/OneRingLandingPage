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
    map: 'Map',
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
  map: {
    meta: {
      title: 'Interactive Atlas — Middle-earth',
      description: 'A 3D atlas of Middle-earth: fly from the Shire to Mordor across the terrain itself.',
    },
    skip: 'Skip to the list of regions',
    kicker: 'Interactive atlas',
    titleA: 'Explore',
    titleB: 'the world',
    lead: 'Move through the lands, follow the paths and discover the places that shaped the journey.',
    hintDrag: 'Drag to explore',
    hintZoom: 'Scroll to zoom',
    hintPinch: 'Pinch to zoom',
    cursorDrag: 'Drag',
    modesLabel: 'Atlas modes',
    modes: {
      explore: 'Explore',
      journey: 'Journey',
      discover: 'Discover',
    },
    soon: 'Soon',
    loading: 'Loading terrain',
    error: 'The terrain could not be loaded.',
    retry: 'Try again',
    regionsLabel: 'Regions',
    flyTo: 'Fly to {name}',
    back: 'Back to map',
    exploreRegion: 'Explore region',
    focusPlace: 'Focus on {name}',
    categories: {
      city: 'City',
      settlement: 'Settlement',
      fortress: 'Fortress',
      landmark: 'Landmark',
      natural: 'Wild',
      ruin: 'Ruin',
    },
    places: {
      hobbiton: { name: 'Hobbiton' },
      buckland: { name: 'Buckland' },
      bree: { name: 'Bree' },
      weathertop: { name: 'Weathertop' },
      'last-bridge': { name: 'Last Bridge' },
      'ford-of-bruinen': { name: 'Ford of Bruinen' },
      caradhras: { name: 'Caradhras' },
      'dimrill-dale': { name: 'Dimrill Dale' },
      lothlorien: { name: 'Lothlórien' },
      fangorn: { name: 'Fangorn' },
      isengard: { name: 'Isengard' },
      edoras: { name: 'Edoras' },
      'helms-deep': { name: 'Helm’s Deep' },
      dunharrow: { name: 'Dunharrow' },
      argonath: { name: 'Argonath' },
      'amon-hen': { name: 'Amon Hen' },
      'minas-tirith': { name: 'Minas Tirith' },
      osgiliath: { name: 'Osgiliath' },
      pelargir: { name: 'Pelargir' },
      'dol-amroth': { name: 'Dol Amroth' },
      'dead-marshes': { name: 'Dead Marshes' },
      'black-gate': { name: 'Black Gate' },
      'minas-morgul': { name: 'Minas Morgul' },
      'cirith-ungol': { name: 'Cirith Ungol' },
      'mount-doom': { name: 'Mount Doom' },
      'barad-dur': { name: 'Barad-dûr' },
    },
    regions: {
      shire: {
        name: 'The Shire',
        subtitle: 'Where the road begins',
        description: 'Soft hills, slow rivers and round green doors: the smallest country on the map, and the one the whole story turns on.',
      },
      rivendell: {
        name: 'Rivendell',
        subtitle: 'The Last Homely House',
        description: 'A hidden valley at the feet of the Misty Mountains, where the Fellowship was formed.',
      },
      moria: {
        name: 'Moria',
        subtitle: 'Khazad-dûm',
        description: 'The great dwarf-realm beneath the mountains, dark and silent since the Balrog woke.',
      },
      rohan: {
        name: 'Rohan',
        subtitle: 'The Riddermark',
        description: 'Open plains stretching beneath the White Mountains.',
      },
      gondor: {
        name: 'Gondor',
        subtitle: 'The South-kingdom',
        description: 'Cities of stone along the Anduin, keeping watch over the east.',
      },
      mordor: {
        name: 'Mordor',
        subtitle: 'The Land of Shadow',
        description: 'Plains of ash ringed by mountains, with Mount Doom burning at their heart.',
      },
    },
  },

  /* The Regions page (regions/index.html). */
  regionsPage: {
    meta: {
      title: 'Regions of Middle-earth',
      description: 'Six lands, six identities: an editorial journey through the regions of Middle-earth, from the Shire to Mordor.',
    },
    skip: 'Skip to the first region',
    kicker: 'Middle-earth / Regions',
    titleA: 'Regions',
    titleB: 'of Middle-earth',
    lead: 'Six lands. Six identities. One world shaped by distance, history and memory.',
    cue: 'Scroll to explore',
    indexLabel: 'Regions',
    goTo: 'Go to {name}',
    progress: 'Region {current} of {total}',
    labels: {
      location: 'Location',
      terrain: 'Terrain',
      identity: 'Identity',
    },
    viewOnMap: 'View on map',
    viewOnMapLabel: 'View {name} on the interactive map',
    regions: {
      shire: {
        name: 'The Shire',
        short: 'Shire',
        tagline: 'A land untouched by great ambition.',
        description: 'Rolling hills, quiet roads and a life defined by simplicity.',
        location: 'Western Middle-earth',
        terrain: 'Rolling hills',
        identity: 'Peace',
        detailLabel: 'People',
        detail: 'Hobbits',
        alt: 'Dawn over the Shire: misted hills, a still lake and a round green door set into a hillside, beyond a wooden fence and a dirt path.',
      },
      rivendell: {
        name: 'Rivendell',
        short: 'Rivendell',
        tagline: 'A sanctuary between mountains.',
        description: 'Waterfalls, carved stone and a quiet older than the kingdoms around it. The valley keeps its counsel.',
        location: 'Hidden valley',
        terrain: 'Falls and cliffs',
        identity: 'Refuge',
        detailLabel: 'People',
        detail: 'Elves',
        alt: 'Rivendell at first light: elven halls and a slender bridge above a gorge of waterfalls, with snow-capped mountains beyond.',
      },
      moria: {
        name: 'Moria',
        short: 'Moria',
        tagline: 'A kingdom beneath the mountains.',
        description: 'Halls carved by a people who loved stone. Now only silence moves through them.',
        location: 'Beneath the Misty Mountains',
        terrain: 'Stone and depth',
        identity: 'Silence',
        detailLabel: 'Dwarven realm',
        detail: 'Khazad-dûm',
        alt: 'The halls of Moria: vast carved pillars and a stone bridge in the dark, lit by a single shaft of daylight from far above.',
      },
      rohan: {
        name: 'Rohan',
        short: 'Rohan',
        tagline: 'Where the horizon never ends.',
        description: 'Grass to the edge of the sky, and a people who measure distance by the speed of a horse.',
        location: 'The Riddermark',
        terrain: 'Grassland',
        identity: 'Wind and horses',
        detailLabel: 'People',
        detail: 'Rohirrim',
        alt: 'The plains of Rohan at sunset: wind-bent grass, a river winding through the valley, horses grazing and a golden hall on a hill beneath the mountains.',
      },
      gondor: {
        name: 'Gondor',
        short: 'Gondor',
        tagline: 'The white city beneath the mountains.',
        description: 'Stone raised in tiers against the mountain. A kingdom that remembers every king it ever had.',
        location: 'Southern kingdom',
        terrain: 'White Mountains',
        identity: 'Legacy',
        detailLabel: 'Seat',
        detail: 'Minas Tirith',
        alt: 'Minas Tirith, the white city, rising in tiers against the mountainside above a wide valley and a winding river.',
      },
      mordor: {
        name: 'Mordor',
        short: 'Mordor',
        tagline: 'Where the shadows lie.',
        description: 'A plain of ash beneath a mountain that never cools. Every road bends, in the end, toward this place.',
        location: 'Land of Shadow',
        terrain: 'Volcanic land',
        identity: 'Ash and shadow',
        detailLabel: 'Landmark',
        detail: 'Mount Doom',
        alt: 'Mordor: a plain of ash and lava beneath Mount Doom in eruption, with the dark tower of Barad-dûr to the right.',
      },
    },
    closing: {
      kickerA: 'Six regions',
      kickerB: 'One Middle-earth',
      line: 'The world continues beyond the horizon.',
      explore: 'Explore the map',
      continue: 'Continue the journey',
    },
  },
};
