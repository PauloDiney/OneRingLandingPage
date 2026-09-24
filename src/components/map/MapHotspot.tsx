import { useRef, type RefObject } from 'react';
import type { Object3D } from 'three';
import { Html } from '@react-three/drei';
import { useLanguage } from '../../hooks/useLanguage';
import { Text } from '../../i18n';
import type { MapRegion } from '../../data/mapRegions';
import { mapCamera } from './mapCamera';
import { mapStore, useMapState } from './mapStore';

type Props = {
  region: MapRegion;
  /** The terrain: a label hides when a mountain stands between it and the camera. */
  occluder: RefObject<Object3D | null>;
};

/**
 * A point on the land, a hairline, a name. No pins, no glow: the hotspot is
 * typography standing on the terrain.
 */
export function MapHotspot({ region, occluder }: Props) {
  const { t } = useLanguage();
  const ref = useRef<HTMLButtonElement>(null);
  const ready = useMapState((s) => s.phase === 'ready');
  const selected = useMapState((s) => s.selected);
  const flying = useMapState((s) => s.flying);

  const [x, y, z] = region.position;
  // <Html> content is a separate React root: no context reaches it, so every
  // string is resolved here and handed in as plain text.
  const name = t(`map.regions.${region.id}.name`);
  const subtitle = t(`map.regions.${region.id}.subtitle`);
  const state = !ready ? 'hidden' : flying ? 'quiet' : selected === region.id ? 'current' : selected ? 'quiet' : 'idle';

  return (
    // Lifted a hair off the surface, so the terrain under the point never counts as "in front".
    <Html
      position={[x, y + 0.015, z]}
      occlude={[occluder as RefObject<Object3D>]}
      onOcclude={(hidden) => ref.current?.toggleAttribute('data-occluded', hidden)}
      zIndexRange={[20, 0]}
      wrapperClass="hotspot-anchor"
    >
      <button
        ref={ref}
        type="button"
        className="hotspot"
        data-state={state}
        tabIndex={state === 'hidden' ? -1 : 0}
        aria-label={t('map.flyTo', { name })}
        onClick={() => mapCamera.flyTo(region.id)}
        onPointerEnter={() => mapStore.set({ hovered: region.id })}
        onPointerLeave={() => mapStore.get().hovered === region.id && mapStore.set({ hovered: null })}
      >
        <span className="hotspot__label" aria-hidden="true">
          <span className="hotspot__index">{region.index}</span>
          <span className="hotspot__name">
            <Text>{name}</Text>
          </span>
          <span className="hotspot__sub">
            <Text>{subtitle}</Text>
          </span>
        </span>
        <span className="hotspot__line" aria-hidden="true" />
        <span className="hotspot__dot" aria-hidden="true" />
      </button>
    </Html>
  );
}
