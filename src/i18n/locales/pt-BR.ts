import type { Messages } from '../types';

/*
 * Português (Brasil). Place names follow the Brazilian editions where they
 * differ from the English (o Condado, Valfenda, Montanha da Perdição,
 * Terra-média); Mordor, Gondor, Rohan and the Elvish names stay as they are.
 * "Middle-earth" as the site's wordmark is a brand and is not translated.
 * Map captions keep "Rivendell" etc. where they describe lettering that is
 * literally on the map.
 */
export const ptBR: Messages = {
  meta: {
    title: 'O Um Anel — Uma jornada pela Terra-média',
    description:
      'Um filme guiado pela rolagem que acompanha o Um Anel pelo mapa da Terra-média, do Condado à Montanha da Perdição.',
  },

  brand: {
    name: 'Middle-earth',
  },

  skip: 'Pular o filme',

  sections: {
    film: 'O Um Anel',
    journey: 'A Jornada',
    regions: 'Regiões',
    ring: 'O Anel',
    mordor: 'Mordor',
  },

  nav: {
    primary: 'Principal',
    backToTop: '— voltar ao topo',
    menu: 'Menu',
    close: 'Fechar',
    siteMenu: 'Menu do site',
    sectionsLabel: 'Seções',
    map: 'Mapa',
  },

  menu: {
    quote: '“Nem todos os que vagueiam estão perdidos.”',
    study: 'Um estudo digital',
  },

  cursor: {
    explore: 'Explorar',
    view: 'Ver',
    top: 'Topo',
  },

  language: {
    label: 'Idioma',
    select: 'Selecionar idioma — atual: {name}',
    note: 'Os modos de escrita redesenham o texto em inglês com letras em estilo tengwar ou runas. Muda a escrita, não é uma tradução.',
    names: {
      'pt-BR': 'Português',
      en: 'English',
      elvish: 'Élfico',
      dwarvish: 'Anão',
    },
    scripts: {
      elvish: 'Letras em estilo tengwar',
      dwarvish: 'Letras rúnicas',
    },
  },

  hero: {
    the: 'O',
    one: 'Um',
    ring: 'Anel',
    lead: 'Uma jornada pela Terra-média.',
    film: 'Filme guiado pela rolagem',
    frames: '301 quadros',
    duration: '10,03 s',
    cue: 'Role para explorar',
  },

  film: {
    chapters: {
      shire: { region: 'Eriador', name: 'O Condado', line: 'Onde a estrada começa.' },
      rivendell: { region: 'Imladris', name: 'Valfenda', line: 'Onde o fardo recebe um nome.' },
      kingdoms: { region: 'Os reinos dos Homens', name: 'Rohan & Gondor', line: 'Pelos reinos que não cederam.' },
      mordor: { region: 'A Terra Negra', name: 'Mordor', line: 'Onde as sombras se deitam.' },
    },
    finale: {
      quote: 'Um Anel para a todos governar.',
      inscription: 'Ash nazg durbatulûk',
      source: 'A inscrição · Língua Negra de Mordor',
    },
    srTitle: 'O filme, em quatro momentos',
    srFinale: 'Em repouso em Mordor, a inscrição do Anel encara a câmera: “Um Anel para a todos governar.”',
  },

  journey: {
    aside: 'Uma rota traçada sobre o mapa que você acabou de ver, uma região de cada vez.',
    era: 'T.E. 3018 — 3019',
    titleThe: 'A',
    titleJourney: 'Jornada',
    lead: 'Do Condado a Mordor.',
    fig: 'Fig. 02 — A estrada',
    text:
      'Um hobbit, um anel e uma estrada que segue sempre em frente. Seis meses a pé — atravessando rios, montanhas e reinos — para devolver um pequeno objeto ao único fogo do mundo capaz de destruí-lo.',
    stats: {
      miles: { label: 'Milhas a pé', note: 'Do Bolsão à Montanha da Perdição' },
      months: { label: 'Meses', note: 'Setembro de 3018 — março de 3019' },
      companions: { label: 'Companheiros', note: 'Contra nove cavaleiros' },
      ring: { label: 'Anel', note: 'Para a todos governar' },
    },
  },

  regions: {
    titleLead: 'Cinco terras,',
    titleEm: 'uma estrada.',
    lede:
      'Cada região do mapa é um capítulo da mesma caminhada — do vale mais tranquilo do oeste à única montanha que importa.',
    hint: 'Continue rolando',
    fig: 'Fig.',
    facts: {
      seat: 'Sede',
      event: 'Evento',
      date: 'Data',
    },
    items: {
      shire: {
        name: 'O Condado',
        kicker: 'Onde a estrada começa',
        description:
          'Colinas verdes, portas redondas e tardes longas. O canto mais tranquilo do mapa — e aquele de que toda a história depende.',
        alt: 'Detalhe desfocado do noroeste do mapa: rios e florestas desenhados a nanquim sobre papel envelhecido.',
        seat: 'Bolsão, Vila dos Hobbits',
        event: 'Frodo deixa o Bolsão',
      },
      rivendell: {
        name: 'Valfenda',
        kicker: 'A Última Casa Amiga',
        description:
          'Um vale oculto de cachoeiras e conselhos antigos. Ali o caminho foi escolhido, e nove caminhantes partiram contra nove cavaleiros.',
        alt: 'Detalhe do mapa com as inscrições Rivendell e Lothlórien, rios e uma faixa de floresta.',
        seat: 'Imladris',
        event: 'O Conselho de Elrond',
      },
      rohan: {
        name: 'Rohan',
        kicker: 'Terra dos senhores dos cavalos',
        description:
          'Campos abertos sob um céu aberto. Um reino medido em cavalos, e na distância que um cavaleiro percorre antes do anoitecer.',
        alt: 'Detalhe do mapa com a inscrição Rohan acima de uma cordilheira desenhada a nanquim.',
        seat: 'Edoras',
        event: 'Batalha do Forte da Trombeta',
      },
      gondor: {
        name: 'Gondor',
        kicker: 'A cidade branca',
        description:
          'Terraços de pedra subindo a encosta de uma montanha — o último grande baluarte do Oeste, vigiando a sombra do outro lado do rio.',
        alt: 'Detalhe do mapa com as inscrições Gondor e Osgiliath, onde o rio Anduin se curva em direção ao mar.',
        seat: 'Minas Tirith',
        event: 'Batalha dos Campos de Pelennor',
      },
      mordor: {
        name: 'Mordor',
        kicker: 'Onde as sombras se deitam',
        description:
          'Cinzas, ferro e uma montanha que nunca esfria. Todas as estradas deste mapa se curvam, cedo ou tarde, para este único lugar.',
        alt: 'Detalhe do mapa com as montanhas de Mordor e a Montanha da Perdição marcada em vermelho.',
        seat: 'Barad-dûr',
        event: 'O Anel é destruído',
      },
    },
  },

  ring: {
    title: 'Um simples aro de ouro, e o verso escrito para ele.',
    verse: [
      'Um Anel para a todos governar,',
      'Um Anel para encontrá-los,',
      'Um Anel para a todos trazer',
      'e na escuridão aprisioná-los.',
    ],
    study: 'Fig. 04 — Estudo em tempo real',
    material: 'Au · polido · sem ornamento',
  },

  specs: {
    kicker: 'Especificação',
    titleLead: 'Um objeto,',
    titleEm: 'descrito com simplicidade.',
    items: {
      object: {
        label: 'Objeto',
        value: 'O Um Anel',
        note: 'O Anel Governante. Um de vinte, e o único que não responde a nenhum outro.',
      },
      material: {
        label: 'Material',
        value: 'Ouro',
        note: 'Um aro simples, sem adornos. Sua inscrição só aparece no fogo.',
      },
      origin: {
        label: 'Origem',
        value: 'Terra-média',
        note: 'Forjado por Sauron nos fogos de Orodruin, por volta do ano 1600 da Segunda Era.',
      },
      destination: {
        label: 'Destino',
        value: 'Montanha da Perdição',
        note: 'Destruído onde foi feito — o único fogo quente o bastante. 25 de março de 3019.',
      },
    },
  },

  mordor: {
    alt: 'O Anel em repouso sobre o mapa, ao lado da palavra Mordor, com a inscrição brilhando no escuro.',
    place: 'Orodruin',
    mountain: 'Montanha da Perdição',
    word: 'Mordor',
    lead: 'Onde as sombras se deitam.',
    body:
      'A jornada termina onde o Anel começou: nos fogos de Orodruin, o único lugar em toda a Terra-média quente o bastante para destruí-lo.',
    final: 'A estrada segue sempre em frente.',
  },

  footer: {
    note:
      'Um estudo digital sem fins comerciais inspirado em {work}, de J.R.R. Tolkien. Sem vínculo com o Tolkien Estate, a Middle-earth Enterprises ou a Warner Bros.',
    work: 'O Senhor dos Anéis',
    nav: 'Rodapé',
    index: 'Índice',
    colophon: 'Colofão',
    colophonNote:
      'React, GSAP e um único vídeo guiado pela rolagem. Composto em Instrument Serif e Geist; escritas em Tengwar Annatar (Johan Winge) e Moria (Neale Davidson).',
    backTo: 'Voltar ao ',
    top: 'Topo',
  },
  map: {
    meta: {
      title: 'Atlas Interativo — Terra-média',
      description: 'Um atlas 3D da Terra-média: voe do Condado a Mordor sobre o próprio relevo.',
    },
    skip: 'Pular para a lista de regiões',
    kicker: 'Atlas interativo',
    titleA: 'Explore',
    titleB: 'o mundo',
    lead: 'Percorra as terras, siga os caminhos e descubra os lugares que moldaram a jornada.',
    hintDrag: 'Arraste para explorar',
    hintZoom: 'Role para aproximar',
    hintPinch: 'Use dois dedos para aproximar',
    cursorDrag: 'Arrastar',
    modesLabel: 'Modos do atlas',
    modes: {
      explore: 'Explorar',
      journey: 'Jornada',
      discover: 'Descobrir',
    },
    soon: 'Em breve',
    loading: 'Carregando o relevo',
    error: 'Não foi possível carregar o relevo.',
    retry: 'Tentar novamente',
    regionsLabel: 'Regiões',
    flyTo: 'Voar até {name}',
    back: 'Voltar ao mapa',
    exploreRegion: 'Explorar região',
    regions: {
      shire: {
        name: 'O Condado',
        subtitle: 'Onde a estrada começa',
        description: 'Colinas suaves, rios lentos e portas redondas e verdes: o menor país do mapa, e aquele de que toda a história depende.',
      },
      rivendell: {
        name: 'Valfenda',
        subtitle: 'A Última Casa Amiga',
        description: 'Um vale oculto aos pés das Montanhas Sombrias, onde a Sociedade foi formada.',
      },
      moria: {
        name: 'Moria',
        subtitle: 'Khazad-dûm',
        description: 'O grande reino dos Anões sob as montanhas, escuro e silencioso desde que o Balrog despertou.',
      },
      rohan: {
        name: 'Rohan',
        subtitle: 'A Marca dos Cavaleiros',
        description: 'Planícies abertas que se estendem sob as Montanhas Brancas.',
      },
      gondor: {
        name: 'Gondor',
        subtitle: 'O Reino do Sul',
        description: 'Cidades de pedra ao longo do Anduin, vigiando o leste.',
      },
      mordor: {
        name: 'Mordor',
        subtitle: 'A Terra da Sombra',
        description: 'Planícies de cinzas cercadas por montanhas, com a Montanha da Perdição ardendo em seu centro.',
      },
    },
  },
};
