import { Component, memo, useEffect, useRef, type ReactNode } from 'react';
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color, Group, Object3D, PMREMGenerator, Quaternion, Vector3, type BufferAttribute, type WebGLRenderTarget } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createEvolutionRig, type EvolutionRig } from './resources';
import { evaluateEvolution } from '../engine/timeline';
import type { EvolutionStore } from '../engine/store';
import type { QualityProfile } from '../engine/quality';
import { PALETTE } from '../theme';

function EvolutionScene({ store, quality }: { store: EvolutionStore; quality: QualityProfile }) {
  const host = useRef<Group>(null);
  const rig = useRef<EvolutionRig | null>(null);
  const scratch = useRef({ dummy: new Object3D(), axis: new Vector3(), tilt: new Quaternion(), stone: new Color(PALETTE.white), flint: new Color('#777267'), metal: new Color(PALETTE.blue) });
  const motion = useRef({ time: 0, active: true, lastProgress: -1, lastFragments: false, frames: 0 });
  const invalidate = useThree((state) => state.invalidate);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const owned = createEvolutionRig(quality.fragments, quality.surface);
    const parent = host.current;
    rig.current = owned;
    motion.current.lastProgress = -1;
    parent?.add(owned.group);
    // A small procedural studio, baked once, supplies real metal reflections.
    const previous = scene.environment;
    let studio: RoomEnvironment | undefined;
    let pmrem: PMREMGenerator | undefined;
    let environment: WebGLRenderTarget | undefined;
    try {
      studio = new RoomEnvironment();
      pmrem = new PMREMGenerator(gl);
      environment = pmrem.fromScene(studio, 0.04, 0.1, 100, { size: 128 });
      scene.environment = environment.texture;
    } catch (error) {
      rig.current = null;
      parent?.remove(owned.group);
      owned.dispose();
      environment?.dispose();
      scene.environment = previous;
      throw error;
    } finally {
      studio?.dispose();
      pmrem?.dispose();
    }
    invalidate();
    return () => {
      rig.current = null;
      parent?.remove(owned.group);
      owned.dispose();
      scene.environment = previous;
      environment?.dispose();
    };
  }, [quality.fragments, quality.surface, gl, scene, invalidate]);

  useEffect(() => store.subscribe(invalidate), [store, invalidate]);
  useEffect(() => addAfterEffect(() => {
    // Renderer counts are valid only after the draw uploads new attributes.
    gl.domElement.dataset.geometryCount = String(gl.info.memory.geometries);
    gl.domElement.dataset.textureCount = String(gl.info.memory.textures);
  }), [gl]);
  useEffect(() => {
    let intersecting = true;
    const updateActivity = () => {
      motion.current.active = intersecting && document.visibilityState !== 'hidden';
      if (motion.current.active) invalidate();
    };
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; updateActivity(); });
    observer.observe(gl.domElement);
    document.addEventListener('visibilitychange', updateActivity);
    updateActivity();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', updateActivity); };
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    const owned = rig.current;
    if (!owned) return;
    const snapshot = store.getSnapshot();
    const state = evaluateEvolution(snapshot.progress);
    const mobile = size.width <= 760;
    const baseScale = mobile
      ? Math.min(viewport.height * 0.16, viewport.width * 0.30) / 1.4
      : Math.min(viewport.height * 0.225, viewport.width * 0.16) / 1.4;
    const anchor = viewport.width * (mobile ? 0.065 : 0.225);
    const arc = Math.sin(Math.PI * state.transferAmount);
    const scale = baseScale * state.modelScale * (mobile ? 0.94 + 0.06 * state.rounding : 1);
    const baseY = viewport.height * (mobile ? 0.23 : 0.025);
    const ambient = snapshot.ambient && motion.current.active;
    if (ambient) motion.current.time += Math.min(delta, 0.05);
    const t = snapshot.ambient ? motion.current.time : 0;
    const float = snapshot.ambient ? Math.sin(t * 0.7) * 0.055 * scale : 0;
    owned.group.position.set(anchor * (1 - 2 * state.transferAmount), baseY + arc * (mobile ? -0.035 : 0.07) * viewport.height + float, 0);
    owned.group.scale.setScalar(scale);
    owned.group.rotation.set(state.rotationX, state.rotationY, state.rotationZ);
    // Ambient transforms are separate from the geometry and pure scroll pose.
    // The axis bends toward Z as the wheel forms, preserving a readable axle.
    const { dummy, axis, tilt, stone, flint, metal } = scratch.current;
    axis.set(0, 1 - state.flattening, state.flattening).normalize();
    dummy.quaternion.setFromAxisAngle(axis, t * 0.065);
    tilt.setFromAxisAngle(axis.set(1, 0, 0), snapshot.ambient ? Math.sin(t * 0.43) * 0.025 : 0);
    dummy.quaternion.multiply(tilt);
    owned.object.quaternion.copy(dummy.quaternion);
    owned.fragments.quaternion.copy(dummy.quaternion);
    owned.material.wireframe = snapshot.wireframe;

    if (snapshot.progress !== motion.current.lastProgress || snapshot.surfaceFragments !== motion.current.lastFragments) {
      owned.surface.update(state);
      const metalMix = (state.metalness - 0.02) / 0.84;
      owned.material.color.lerpColors(stone, metal, metalMix);
      owned.material.roughness = state.roughness;
      owned.material.metalness = state.metalness;
      owned.texture.uniforms.strength.value = 1 - state.teeth;
      owned.material.envMapIntensity = 0.5 + 0.7 * metalMix;
      owned.fragmentMaterial.color.lerpColors(flint, metal, metalMix);
      const amount = Math.sin(Math.PI * state.morph) ** 2;
      owned.fragments.visible = snapshot.surfaceFragments && amount > 0.001;
      if (owned.fragments.visible) {
        const { angularSegments: n, radialSegments: r, geometry } = owned.surface;
        const positions = geometry.getAttribute('position');
        for (let i = 0; i < owned.fragments.count; i++) {
          const sample = (r + 1) * n + Math.floor(i / owned.fragments.count * n);
          const angle = i / owned.fragments.count * Math.PI * 2;
          const lift = (0.025 + (i % 5) * 0.008) * amount;
          dummy.position.set(positions.getX(sample) + Math.cos(angle) * lift, positions.getY(sample) + Math.sin(angle) * lift, positions.getZ(sample) + Math.sin(i * 2.3) * 0.06);
          dummy.rotation.set(i * 0.8, i * 0.2, i * 1.4);
          dummy.scale.setScalar((0.013 + (i % 4) * 0.004) * amount);
          dummy.updateMatrix();
          owned.fragments.setMatrixAt(i, dummy.matrix);
        }
        owned.fragments.instanceMatrix.needsUpdate = true;
      }
      motion.current.lastProgress = snapshot.progress;
      motion.current.lastFragments = snapshot.surfaceFragments;
    }
    // Readable diagnostics support debug/test checks without exposing GPU objects.
    const canvas = gl.domElement;
    canvas.dataset.vertexCount = String(owned.surface.geometry.getAttribute('position').count);
    canvas.dataset.meshId = String(owned.object.id);
    canvas.dataset.geometryId = String(owned.surface.geometry.id);
    canvas.dataset.positionVersion = String((owned.surface.geometry.getAttribute('position') as BufferAttribute).version);
    canvas.dataset.frame = String(++motion.current.frames);
    canvas.dataset.ambient = String(snapshot.ambient);
    canvas.dataset.wireframe = String(snapshot.wireframe);
    canvas.dataset.surfaceFragments = String(owned.fragments.visible);
    canvas.dataset.objectX = String(owned.group.position.x);
    canvas.dataset.objectY = String(owned.group.position.y);
    canvas.dataset.modelScale = String(scale);
    if (ambient) invalidate();
  });

  return <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[-4, 6, 5]} intensity={2.4} color={PALETTE.white} />
    <directionalLight position={[5, 1, -3]} intensity={1.4} color={PALETTE.electric} />
    <directionalLight position={[2, -3, 4]} intensity={0.35} color={PALETTE.ice} />
    <group ref={host} />
  </>;
}

class CanvasBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function EvolutionCanvas({ store, quality, onFailure }: { store: EvolutionStore; quality: QualityProfile; onFailure: () => void }) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => () => { canvas.current?.removeEventListener('webglcontextlost', onFailure); }, [onFailure]);
  return <CanvasBoundary onFailure={onFailure}>
    <Canvas aria-hidden="true" frameloop="demand" dpr={[1, quality.maxDpr]}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }}
      onCreated={({ gl }) => {
        canvas.current = gl.domElement;
        gl.domElement.addEventListener('webglcontextlost', onFailure);
      }}>
      <EvolutionScene store={store} quality={quality} />
    </Canvas>
  </CanvasBoundary>;
}
export default memo(EvolutionCanvas);
