import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { DirectionalLight, Fog, Group, HemisphereLight, PerspectiveCamera } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/media';
import { MAP_REGIONS } from '../../data/mapRegions';
import { MapModel, type MapFit } from './MapModel';
import { MapHotspot } from './MapHotspot';
import { fitOverview, mapCamera } from './mapCamera';
import { mapStore } from './mapStore';

/* Light, as a studio would set it for a relief model seen from the south: a
   low key from the west-south-west raking across the ranges (so the slopes the
   camera faces are the lit ones, and shadows fall away east), a cool whisper
   of fill from the east, and a soft sky so valleys never go to pure black. */
const KEY = { position: [-6.8, 4.6, 1.8] as const, intensity: 2.8, color: '#f2efe8' };
const FILL = { position: [6, 3, -2.5] as const, intensity: 0.35, color: '#9fb0c2' };
const SKY = { sky: '#cfd3d8', ground: '#060607', intensity: 0.6 };
const EXPOSURE = 1.4;
const FOV = 30;

type SceneProps = { shadows: boolean; debug: boolean };

function Scene({ shadows, debug }: SceneProps) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const world = useRef<Group>(null);
  const model = useRef<Group>(null);
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const sky = useRef<HemisphereLight>(null);
  const fog = useRef<Fog>(null);
  const fit = useRef<MapFit | null>(null);

  useLayoutEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.enabled = false; // the entrance hands control over when it ends
    mapCamera.attach({ camera: camera as PerspectiveCamera, controls: c, invalidate });
    return () => mapCamera.detach();
  }, [camera, invalidate]);

  /** Frames the whole map for this viewport; fog follows, so the far edge dissolves. */
  const frame = useCallback(() => {
    if (!fit.current) return;
    const ratio = size.width / size.height;
    const distance = fitOverview(ratio, FOV, fit.current.halfX, fit.current.halfZ);
    mapCamera.setOverview(distance, ratio);
    if (fog.current) {
      fog.current.near = distance * 0.9;
      fog.current.far = distance * 1.9;
    }
    invalidate();
  }, [size, invalidate]);

  useEffect(frame, [frame]);

  const onReady = useCallback(
    (measured: MapFit) => {
      fit.current = measured;
      mapCamera.setGround(measured.groundAt);
      frame();
      const w = world.current!;
      const lights = [key.current!, fill.current!, sky.current!];
      // Compile every shader now, so the reveal never stalls on its first frame.
      gl.compile(scene, camera);

      const reduced = prefersReducedMotion();
      w.position.y = reduced ? 0 : -0.32;
      w.scale.setScalar(reduced ? 1 : 0.955);
      lights.forEach((l) => (l.intensity = 0));
      mapStore.set({ phase: 'entering' });

      // Shadows are drawn while the land moves, then frozen: nothing casts them afterwards.
      const redraw = () => {
        gl.shadowMap.needsUpdate = true;
        invalidate();
      };
      gsap
        .timeline({ delay: 0.35, onUpdate: redraw, onComplete: () => (redraw(), mapStore.set({ phase: 'ready' })) })
        .to(w.position, { y: 0, duration: reduced ? 0.6 : 2.6, ease: 'power3.out' }, 0)
        .to(w.scale, { x: 1, y: 1, z: 1, duration: reduced ? 0.6 : 2.6, ease: 'power3.out' }, 0)
        .to(sky.current!, { intensity: SKY.intensity, duration: 1.8, ease: 'power2.out' }, 0)
        .to(key.current!, { intensity: KEY.intensity, duration: 2.4, ease: 'power2.inOut' }, 0.15)
        .to(fill.current!, { intensity: FILL.intensity, duration: 2.4, ease: 'power2.inOut' }, 0.3);
      mapCamera.intro(reduced ? 0.6 : 3.1);
    },
    [camera, frame, gl, invalidate, scene],
  );

  return (
    <>
      <fog ref={fog} attach="fog" args={['#050505', 10, 30]} />
      <hemisphereLight ref={sky} args={[SKY.sky, SKY.ground, SKY.intensity]} />
      <directionalLight
        ref={key}
        position={KEY.position}
        intensity={KEY.intensity}
        color={KEY.color}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.025}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={24}
      />
      <directionalLight ref={fill} position={FILL.position} intensity={FILL.intensity} color={FILL.color} />

      <group ref={world}>
        <MapModel ref={model} onReady={onReady} debug={debug} />
        {MAP_REGIONS.map((region) => (
          <MapHotspot key={region.id} region={region} occluder={model} />
        ))}
      </group>

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.45}
        zoomSpeed={0.75}
        panSpeed={0.7}
        screenSpacePanning={false}
      />
    </>
  );
}

/** Missing file, broken WebGL: the page says so instead of going blank. */
class AtlasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[atlas] The map could not be shown:', error);
    mapStore.set({ phase: 'error' });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props = { compact: boolean; debug: boolean };

export function MiddleEarthMap({ compact, debug }: Props) {
  return (
    <AtlasBoundary>
      <Canvas
        className="atlas__canvas"
        // Draw only when something moves: controls, a flight, the reveal.
        frameloop="demand"
        dpr={[1, compact ? 1.25 : 1.5]}
        shadows={!compact}
        camera={{ fov: FOV, near: 0.05, far: 80, position: [0, 9, 11] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.shadowMap.autoUpdate = false;
          gl.toneMappingExposure = EXPOSURE;
        }}
      >
        <color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <Scene shadows={!compact} debug={debug} />
        </Suspense>
      </Canvas>
    </AtlasBoundary>
  );
}
