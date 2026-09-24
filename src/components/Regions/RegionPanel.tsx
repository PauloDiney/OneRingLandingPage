import type { Region } from '../../data/regions';
import { REGIONS } from '../../data/regions';
import { useLanguage } from '../../hooks/useLanguage';
import { T } from '../../i18n';

type Props = { region: Region; position: number };

export function RegionPanel({ region, position }: Props) {
  const { t } = useLanguage();
  const portrait = region.height > region.width;
  const item = `regions.items.${region.id}` as const;
  const name = t(`${item}.name`);

  return (
    <article
      className={`region region--${region.layout} region--${region.tone}`}
      data-region
      data-region-id={region.id}
      aria-labelledby={`region-${region.id}`}
    >
      <p className="region__index t-mono">
        <span>{region.index}</span>
        <span className="region__index-rule" />
        <span>{String(REGIONS.length).padStart(2, '0')}</span>
      </p>

      <p className="region__num t-num" aria-hidden="true" data-region-num>
        {region.index}
      </p>

      <div className="region__copy">
        <p className="region__kicker t-lead">
          <T k={`${item}.kicker`} />
        </p>
        <p className="region__desc">
          <T k={`${item}.description`} />
        </p>
      </div>

      <figure
        className={`region__frame ${portrait ? 'region__frame--portrait' : 'region__frame--landscape'}`}
        style={{ aspectRatio: `${region.width} / ${region.height}` }}
        data-region-frame
        data-cursor={t('cursor.view')}
      >
        <img
          src={region.image}
          alt={t(`${item}.alt`)}
          width={region.width}
          height={region.height}
          loading="lazy"
          decoding="async"
          data-region-img
        />
        <span className="region__tint" aria-hidden="true" />
        <figcaption className="region__caption t-mono">
          <T k="regions.fig" /> 03.{position + 1} — <T k={`${item}.seat`} />
        </figcaption>
      </figure>

      {/* Split into characters by GSAP (see Regions.tsx), so keyed by its text. */}
      <h3 key={name} className="region__name" id={`region-${region.id}`} data-region-name>
        <T k={`${item}.name`} />
      </h3>

      <dl className="region__facts">
        <div>
          <dt className="t-label">
            <T k="regions.facts.seat" />
          </dt>
          <dd>
            <T k={`${item}.seat`} />
          </dd>
        </div>
        <div>
          <dt className="t-label">
            <T k="regions.facts.event" />
          </dt>
          <dd>
            <T k={`${item}.event`} />
          </dd>
        </div>
        <div>
          <dt className="t-label">
            <T k="regions.facts.date" />
          </dt>
          <dd className="t-mono">{region.date}</dd>
        </div>
        {/* Where this region sits on the road: the one discreet graphic. */}
        <div className="region__road" aria-hidden="true">
          {REGIONS.map((r, i) => (
            <span key={r.id} className={i === position ? 'is-here' : i < position ? 'is-past' : ''} />
          ))}
        </div>
      </dl>
    </article>
  );
}
