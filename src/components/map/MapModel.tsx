import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Box3, Color, Mesh, MeshStandardMaterial, Raycaster, Vector2, Vector3, type Group, type Material } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Bvh, useGLTF } from '@react-three/drei';
import { ATLAS_WIDTH, MAP_URL, RELIEF, type Vec3 } from '../../data/mapRegions';
import { trackProgress } from './mapProgress';
import { mapStore } from './mapStore';

/*
 * Mapa3D.glb, as supplied: no Draco, no meshopt, no textures — 35 terrain
 * tiles on a grey "Mesher" material and three ocean tiles on "oceon".
 * Loaded once (useGLTF caches it), never cloned; only its materials are
 * replaced, because relief and light are meant to carry the look.
 */

// Neither decoder is needed, so neither is ever fetched (drei's Draco default is a CDN).
const useAtlasModel = () => useGLTF(MAP_URL, false, false, trackProgress);
useGLTF.preload(MAP_URL, false, false, trackProgress);

/** Graphite lowlands rising to pale stone on the peaks: height alone decides. */
function terrainMaterial(range: Vector2) {
  const material = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLow = { value: new Color('#2a2c2f') };
    shader.uniforms.uMid = { value: new Color('#3a3d41') };
    shader.uniforms.uHigh = { value: new Color('#8d9094') };
    shader.uniforms.uRange = { value: range };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vAtlasY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAtlasY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vAtlasY;\nuniform vec3 uLow;\nuniform vec3 uMid;\nuniform vec3 uHigh;\nuniform vec2 uRange;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float h = clamp((vAtlasY - uRange.x) / (uRange.y - uRange.x), 0.0, 1.0);
        vec3 tone = mix(uLow, uMid, smoothstep(0.0, 0.35, h));
        tone = mix(tone, uHigh, smoothstep(0.35, 1.0, h));
        diffuseColor.rgb = tone;`,
      );
  };
  return material;
}

const water = new MeshStandardMaterial({ color: '#0b0f12', roughness: 0.82, metalness: 0 });

export type MapFit = {
  /** Half extents of the map in atlas space. */
  halfX: number;
  halfZ: number;
  /** Highest point of the terrain, in atlas space. */
  top: number;
  /** Height of the land (or sea) under a point, in atlas space. */
  groundAt: (x: number, z: number) => number;
};

type Props = {
  onReady: (fit: MapFit) => void;
  debug: boolean;
};

export const MapModel = forwardRef<Group, Props>(function MapModel({ onReady, debug }, ref) {
  const { scene } = useAtlasModel();
  const [marker, setMarker] = useState<Vec3 | null>(null);

  // Measure the model as it is, then derive the atlas transform from it:
  // nothing assumes the file has a sensible origin or scale.
  const fit = useMemo(() => {
    // Each mesh's role, read once from the file's own material names. Recorded
    // on the mesh because the materials are replaced below (and StrictMode runs
    // this twice in development, when the original names would already be gone).
    scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh && !mesh.userData.atlasRole) {
        mesh.userData.atlasRole = (mesh.material as Material).name === 'oceon' ? 'water' : 'land';
      }
    });
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = ATLAS_WIDTH / Math.max(size.x, size.z);

    const land = new Box3();
    const sea = new Box3();
    scene.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      (o.userData.atlasRole === 'land' ? land : sea).expandByObject(o);
    });
    // Sea level is y = 0: the plains stand just above it, the peaks well above.
    const y0 = sea.isEmpty() ? land.min.y : sea.max.y;
    const toAtlasY = (y: number) => (y - y0) * scale * RELIEF;
    const top = toAtlasY(land.max.y);

    const terrain = terrainMaterial(new Vector2(top * 0.04, top * 0.85));
    scene.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const isWater = mesh.userData.atlasRole === 'water';
      mesh.material = isWater ? water : terrain;
      mesh.castShadow = !isWater;
      mesh.receiveShadow = true;
    });

    // One ray straight down through the BVH: cheap enough to run every frame.
    const ray = new Raycaster();
    const down = new Vector3(0, -1, 0);
    const from = new Vector3();
    const groundAt = (x: number, z: number) => {
      ray.set(from.set(x, top + 10, z), down);
      const hit = ray.intersectObject(scene, true)[0];
      return hit ? hit.point.y : 0;
    };

    return {
      scale: [scale, scale * RELIEF, scale] as Vec3,
      position: [-center.x * scale, -y0 * scale * RELIEF, -center.z * scale] as Vec3,
      info: { halfX: (size.x * scale) / 2, halfZ: (size.z * scale) / 2, top, groundAt },
    };
  }, [scene]);

  // A passive effect: by now every ref in the scene (the group the entrance
  // moves, the lights it brightens) is attached.
  useEffect(() => {
    onReady(fit.info);
    // Once: the fit never changes for a given file.
  }, [fit]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return; // a drag, not a click
    e.stopPropagation();
    const r = (n: number) => Number(n.toFixed(2));
    const p: Vec3 = [r(e.point.x), r(e.point.y), r(e.point.z)];
    if (e.nativeEvent.shiftKey) {
      // Shift+click: only what a place needs (its height comes from the terrain).
      console.info(`PLACE POSITION\nposition: [${p[0]}, ${p[2]}],`);
    } else {
      console.info(
        `Clicked terrain:\nx: ${p[0]}\ny: ${p[1]}\nz: ${p[2]}\n\nposition: [${p.join(', ')}],\n\nMapPlace position:\n[${p[0]}, ${p[2]}]`,
      );
    }
    setMarker(p);
    mapStore.set({ debugPoint: p });
  };

  return (
    <group ref={ref}>
      {/* Accelerated raycasting: hotspot occlusion and debug picking stay cheap on 450k triangles. */}
      <Bvh firstHitOnly>
        <group scale={fit.scale} position={fit.position}>
          <primitive object={scene} onClick={debug ? onClick : undefined} />
        </group>
      </Bvh>
      {debug && marker && (
        <group position={marker}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.12, 6]} />
            <meshBasicMaterial color="#e8e7e3" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color="#e8e7e3" />
          </mesh>
        </group>
      )}
    </group>
  );
});
