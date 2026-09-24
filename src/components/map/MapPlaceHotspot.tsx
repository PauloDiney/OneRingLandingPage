import { useMemo, useRef, type RefObject } from 'react';
import type { Object3D } from 'three';
import { Html } from '@react-three/drei';
import { useLanguage } from '../../hooks/useLanguage';
import { Text } from '../../i18n';
import type { MapPlace } from '../../data/mapPlaces';
import type { Vec3 } from '../../data/mapRegions';
import { mapCamera } from './mapCamera';

/** Lifted a hair off the surface, so the ground under the point never counts as "in front". */
const LIFT = 0.012;

/*
 * Each place's point on the terrain, found once: a ray straight down through
 * the model (BVH-accelerated) wherever the place's [x, z] falls. Places only
 * appear after the entrance, when the map sits at its final position.
 */
const anchors = new Map<string, Vec3>();
function anchorOf(place: MapPlace): Vec3 {
  const cached = anchors.get(place.id);
  if (cached) return cached;
  const [x, z] = place.position;
  const ground = mapCamera.groundAt(x, z);
  // Rivers are carved below sea level: a place on one (Osgiliath, a ford, a
  // bridge) stands at the water line, where its own banks cannot hide it.
  const anchor: Vec3 = [x, Math.max(ground ?? 0, 0) + LIFT, z];
  if (ground !== null) anchors.set(place.id, anchor);
  return anchor;
}

type Props = {
  place: MapPlace;
  /** Fading out before it unmounts. */
  leaving: boolean;
  occluder: RefObject<Object3D | null>;
};

/**
 * A place: a smaller point, a short hairline, a small tracked name. No index,
 * no subtitle, no ring — a quieter voice than the six regions above it.
 */
export function MapPlaceHotspot({ place, leaving, occluder }: Props) {
  const { t } = useLanguage();
  const ref = useRef<HTMLButtonElement>(null);
  const anchor = useMemo(() => anchorOf(place), [place]);

  // <Html> content is its own React root: strings are resolved here.
  const name = t(`map.places.${place.id}.name`);
  const category = t(`map.categories.${place.category}`);

  return (
    <Html
      position={anchor}
      occlude={[occluder as RefObject<Object3D>]}
      onOcclude={(hidden) => ref.current?.toggleAttribute('data-occluded', hidden)}
      zIndexRange={[10, 0]}
      wrapperClass="place-anchor"
    >
      <button
        ref={ref}
        type="button"
        className="place"
        data-tier={place.tier}
        data-label={place.label ?? 'center'}
        data-leaving={leaving || undefined}
        tabIndex={leaving ? -1 : 0}
        aria-label={t('map.focusPlace', { name })}
        onClick={() => mapCamera.focusPlace(place)}
      >
        <span className="place__label" aria-hidden="true">
          <span className="place__category">{category}</span>
          <span className="place__name">
            <Text>{name}</Text>
          </span>
        </span>
        <span className="place__line" aria-hidden="true" />
        <span className="place__dot" aria-hidden="true" />
      </button>
    </Html>
  );
}
