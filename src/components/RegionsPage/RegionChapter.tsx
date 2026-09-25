import { Fragment, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { MQ } from '../../lib/media';
import { useLanguage } from '../../hooks/useLanguage';
import { T, Text } from '../../i18n';
import { CHAPTER_TOTAL, mapHref, type Chapter, type ChapterId } from '../../data/regionsPage';
import { CHAPTER_MOTION } from './chapterMotion';

/*
 * One region, one chapter. Every chapter says the same things — index, name,
 * image, tagline, description, a small catalog of facts, the way to the map —
 * but each arranges them in its own composition (the layouts below) and moves
 * them its own way (chapterMotion.ts). Shared parts, separate art direction.
 */

/** What every chapter says, in `regionsPage.regions.<id>`. */
type RegionField = 'name' | 'short' | 'tagline' | 'description' | 'location' | 'terrain' | 'identity' | 'detailLabel' | 'detail' | 'alt';

type Parts = {
  label: ReactNode;
  location: ReactNode;
  title: ReactNode;
  figure: ReactNode;
  body: ReactNode;
};

/** A name set as display type, each word on its own line, rising out of a mask. */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        // Keyed by position: a new language patches the words in place, so
        // their animation state survives the change. The space between the
        // lines is for assistive technology: it reads "The Shire", not "TheShire".
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="mask">
            <span className="ch__line">
              <Text>{word}</Text>
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

/** The longest word, which decides how large a name can be set in its column. */
const longest = (text: string) => Math.max(...text.split(' ').map((w) => w.length));

/* ── The six compositions ──────────────────────────────────────────────── */

/** Asymmetric and airy: the words on the left, the land opening on the right. */
function ShireLayout({ label, location, title, figure, body }: Parts) {
  return (
    <div className="ch__layout grid">
      {label}
      {location}
      {title}
      {figure}
      {body}
    </div>
  );
}

/** Vertical: the name climbs beside a tall image; the words float in the space to its right. */
function RivendellLayout({ label, location, title, figure, body, index }: Parts & { index: string }) {
  return (
    <div className="ch__layout grid">
      {label}
      {title}
      {figure}
      <p className="ch__numeral t-num" aria-hidden="true">
        {index}
      </p>
      {location}
      {body}
    </div>
  );
}

/** Monumental: a held, full-bleed stage; the name is too large for it and is cut by the dark. */
function MoriaLayout({ label, location, title, figure, body }: Parts) {
  return (
    <div className="ch__stage">
      {figure}
      <div className="ch__shade" aria-hidden="true" />
      {title}
      {location}
      <div className="ch__panel">
        {label}
        {body}
      </div>
    </div>
  );
}

/** Wide: the name spans the page, the land runs past both edges of it. */
function RohanLayout({ label, location, title, figure, body }: Parts) {
  return (
    <div className="ch__layout">
      <div className="ch__head">
        {label}
        {location}
      </div>
      {title}
      {figure}
      {body}
    </div>
  );
}

/** Ordered: the column system drawn on the page, and everything set on it. */
function GondorLayout({ label, location, title, figure, body }: Parts) {
  return (
    <>
      <div className="ch__columns grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="ch__column" />
        ))}
      </div>
      <div className="ch__layout grid">
        {label}
        {location}
        {title}
        <span className="ch__rule ch__rule--title" aria-hidden="true" />
        {figure}
        {body}
      </div>
      <div className="ch__dim" aria-hidden="true" />
    </>
  );
}

/** The climax: a held stage, the image slowly nearer, the name larger than the screen. */
function MordorLayout({ label, location, title, figure, body }: Parts) {
  return (
    <div className="ch__stage">
      {figure}
      <div className="ch__shade" aria-hidden="true" />
      {location}
      <div className="ch__panel">
        {label}
        {body}
      </div>
      {title}
    </div>
  );
}

/* ── The chapter ───────────────────────────────────────────────────────── */

type Props = {
  chapter: Chapter;
  /** The first chapter's image is fetched straight away; the rest as the reader nears them. */
  eager?: boolean;
};

export function RegionChapter({ chapter, eager = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const { id, index, image, focus, tone, mapRegion } = chapter;
  const key = (field: RegionField) => `regionsPage.regions.${id}.${field}` as const;
  const name = t(`regionsPage.regions.${id}.name`);
  const titleId = `${id}-title`;

  // Structure-only animation: it moves wrappers, never the words inside
  // them, so a change of language never has to rebuild it.
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      // Fetch the still well before its reveal begins (two screens ahead),
      // rather than at the browser's own lazy-loading distance.
      const img = section.querySelector('img');
      ScrollTrigger.create({
        trigger: section,
        start: 'top 300%',
        onEnter: () => {
          if (img && img.loading !== 'eager') img.loading = 'eager';
        },
      });

      gsap.matchMedia().add({ motion: MQ.motion, desktop: MQ.desktop }, (mm) => {
        const { motion, desktop } = mm.conditions as { motion: boolean; desktop: boolean };
        // Reduced motion: nothing is hidden, nothing travels. The page is simply there.
        if (motion) CHAPTER_MOTION[id](section, { desktop });
      });
    }, section);
    return () => ctx.revert();
  }, [id]);

  const label = (
    <p className="ch__label t-label">
      <span className="ch__index t-mono">
        {index} / {CHAPTER_TOTAL}
      </span>
      <span className="ch__label-name">
        <T k={key('name')} />
      </span>
    </p>
  );

  const location = (
    <p className="ch__location t-label">
      <span className="sr-only">{t('regionsPage.labels.location')}: </span>
      <T k={key('location')} />
    </p>
  );

  const titleText = t(key('name'));
  const title =
    id === 'rohan' ? (
      // Spread letter by letter across the whole width.
      <h2 id={titleId} className="ch__title t-display">
        <span className="sr-only">{titleText}</span>
        <Text>
          <span className="ch__letters" aria-hidden="true">
            {[...titleText].map((letter, i) => (
              <span key={i} className="ch__letter">
                {letter}
              </span>
            ))}
          </span>
        </Text>
      </h2>
    ) : (
      <h2 id={titleId} className="ch__title t-display" style={{ '--chars': longest(titleText) } as CSSProperties}>
        <span className="ch__title-inner">
          <Lines text={titleText} />
        </span>
      </h2>
    );

  const figure = (
    <figure className="ch__figure">
      <img
        className="ch__img"
        src={image.src}
        srcSet={`${image.small} 960w, ${image.src} ${image.width}w`}
        sizes={SIZES[id]}
        width={image.width}
        height={image.height}
        alt={t(key('alt'))}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        style={{ '--focus': focus.desktop, '--focus-m': focus.mobile } as CSSProperties}
      />
      {id === 'rivendell' && <span className="ch__veil" aria-hidden="true" />}
    </figure>
  );

  const body = (
    <div className="ch__body">
      <p className="ch__tagline">
        <T k={key('tagline')} />
      </p>
      {id === 'gondor' && <span className="ch__rule" aria-hidden="true" />}
      <p className="ch__description t-body">
        <T k={key('description')} />
      </p>
      <dl className="ch__facts">
        <div className="ch__fact">
          <dt className="t-label">
            <T k="regionsPage.labels.terrain" />
          </dt>
          <dd>
            <T k={key('terrain')} />
          </dd>
        </div>
        <div className="ch__fact">
          <dt className="t-label">
            <T k="regionsPage.labels.identity" />
          </dt>
          <dd>
            <T k={key('identity')} />
          </dd>
        </div>
        <div className="ch__fact">
          <dt className="t-label">
            <T k={key('detailLabel')} />
          </dt>
          <dd>
            <T k={key('detail')} />
          </dd>
        </div>
      </dl>
      <a
        className="ch__link t-label"
        href={mapHref(mapRegion)}
        aria-label={t('regionsPage.viewOnMapLabel', { name })}
        data-cursor={t('cursor.explore')}
      >
        <span>
          <T k="regionsPage.viewOnMap" />
        </span>
        <span className="ch__arrow" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );

  const parts: Parts = { label, location, title, figure, body };

  return (
    <section ref={ref} id={id} className={`ch ch--${id}`} data-tone={tone} data-chapter aria-labelledby={titleId}>
      <div className="ch__ground" aria-hidden="true" />
      {LAYOUTS[id]({ ...parts, index })}
    </section>
  );
}

const LAYOUTS: Record<ChapterId, (parts: Parts & { index: string }) => ReactNode> = {
  shire: ShireLayout,
  rivendell: RivendellLayout,
  moria: MoriaLayout,
  rohan: RohanLayout,
  gondor: GondorLayout,
  mordor: MordorLayout,
};

/** How wide each still is drawn, so a phone fetches the 960px copy and a large screen the full one. */
const SIZES: Record<ChapterId, string> = {
  shire: '(max-width: 899px) 100vw, 58vw',
  rivendell: '(max-width: 899px) 100vw, 48vw',
  moria: '100vw',
  rohan: '(max-width: 899px) 100vw, 112vw',
  gondor: '(max-width: 899px) 100vw, 58vw',
  mordor: '100vw',
};

/* ── Between chapters ──────────────────────────────────────────────────── */

type BridgeProps = { to: ChapterId; from: 'light' | 'dark'; into: 'light' | 'dark' };

/**
 * The ground turning from one chapter's colour into the next as the reader
 * scrolls through it. Each half carries its own tone, so the navbar and the
 * index change colour where the ground does, not at a section boundary.
 */
export function Bridge({ to, from, into }: BridgeProps) {
  return (
    <div className={`rg-bridge rg-bridge--${to}`} aria-hidden="true">
      <span data-tone={from} />
      <span data-tone={into} />
    </div>
  );
}
