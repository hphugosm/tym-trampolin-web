import { Component, memo, useEffect, useRef, type ReactNode } from "react";
import { addAfterEffect, Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  Group,
  Object3D,
  PMREMGenerator,
  Quaternion,
  MathUtils,
  type ShaderMaterial,
  Vector3,
  type BufferAttribute,
  type WebGLRenderTarget,
} from "three";
import { createStudioEnvironment } from "./studioEnvironment";
import { createWebsiteRig, type WebsiteRig } from "./websiteResources";
import { evaluateStory } from "../engine/story";
import type { EvolutionStore } from "../engine/store";
import type { QualityProfile } from "../engine/quality";
import { PALETTE } from "../theme";

function WebsiteScene({
  store,
  quality,
  active,
  onReady,
}: {
  store: EvolutionStore;
  quality: QualityProfile;
  active: boolean;
  onReady: () => void;
}) {
  const host = useRef<Group>(null);
  const rig = useRef<WebsiteRig | null>(null);
  const scratch = useRef({
    dummy: new Object3D(),
    axis: new Vector3(),
    tilt: new Quaternion(),
    flint: new Color("#777267"),
    metal: new Color(PALETTE.ice),
    billboard: new Quaternion(),
    lightPosition: new Vector3(),
  });
  const pointer = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 });
  const lightHost = useRef<HTMLElement | null>(null);
  const motion = useRef({
    time: 0,
    active: true,
    lastProgress: -1,
    lastFragments: false,
    lastBulbLight: -1,
    frames: 0,
  });
  const performanceBudget = useRef({
    warmup: 0,
    samples: 0,
    seconds: 0,
    reductions: 0,
    lastReduction: -Infinity,
  });
  const invalidate = useThree((state) => state.invalidate);
  const setDpr = useThree((state) => state.setDpr);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const owned = createWebsiteRig(quality.fragments, quality.surface);
    const parent = host.current;
    rig.current = owned;
    motion.current.lastProgress = -1;
    motion.current.lastBulbLight = -1;
    parent?.add(owned.group, owned.launchEffects.group);
    lightHost.current = gl.domElement.closest<HTMLElement>(".website");
    // A small procedural studio, baked once, supplies real metal reflections.
    const previous = scene.environment;
    const previousBackground = scene.background;
    let studio: ReturnType<typeof createStudioEnvironment> | undefined;
    let pmrem: PMREMGenerator | undefined;
    let environment: WebGLRenderTarget | undefined;
    try {
      studio = createStudioEnvironment();
      pmrem = new PMREMGenerator(gl);
      environment = pmrem.fromScene(studio.scene, 0.025, 0.1, 100, {
        size: quality.surface === "low" ? 128 : 256,
      });
      // A white transmission backdrop matches the page and lets glass refract
      // the internal filament without sampling a transparent black surface.
      scene.background = new Color(PALETTE.white);
      scene.environment = environment.texture;
    } catch (error) {
      rig.current = null;
      parent?.remove(owned.group);
      owned.dispose();
      lightHost.current?.style.removeProperty("--bulb-light");
      lightHost.current?.style.removeProperty("--bulb-x");
      lightHost.current?.style.removeProperty("--bulb-y");
      lightHost.current = null;
      environment?.dispose();
      scene.environment = previous;
      scene.background = previousBackground;
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
      lightHost.current?.style.removeProperty("--bulb-light");
      lightHost.current?.style.removeProperty("--bulb-x");
      lightHost.current?.style.removeProperty("--bulb-y");
      lightHost.current = null;
      scene.environment = previous;
      scene.background = previousBackground;
      environment?.dispose();
    };
  }, [quality.fragments, quality.surface, gl, scene, invalidate]);

  useEffect(() => {
    if (!active) return;
    invalidate();
    return store.subscribe(invalidate);
  }, [store, invalidate, active]);
  useEffect(() => {
    let ready = false;
    return addAfterEffect(() => {
      if (!ready && rig.current && motion.current.frames > 0) {
        ready = true;
        onReady();
      }
    });
  }, [onReady]);
  useEffect(
    () =>
      addAfterEffect(() => {
        // Renderer counts are valid only after the draw uploads new attributes.
        gl.domElement.dataset.geometryCount = String(gl.info.memory.geometries);
        gl.domElement.dataset.textureCount = String(gl.info.memory.textures);
        gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      }),
    [gl],
  );
  useEffect(() => {
    let intersecting = true;
    const updateActivity = () => {
      motion.current.active =
        active && intersecting && document.visibilityState !== "hidden";
      if (motion.current.active) invalidate();
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(gl.domElement);
    document.addEventListener("visibilitychange", updateActivity);
    updateActivity();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, [gl, invalidate, active]);

  useEffect(() => {
    if (!active || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      pointer.current.targetX = (event.clientX / innerWidth - 0.5) * 2;
      pointer.current.targetY = (event.clientY / innerHeight - 0.5) * 2;
    };
    const reset = () => {
      pointer.current.targetX = pointer.current.targetY = 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
    };
  }, [active]);

  useFrame((_, delta) => {
    const owned = rig.current;
    if (!owned || !active || !motion.current.active) return;
    const snapshot = store.getSnapshot();
    const state = evaluateStory(snapshot.progress);
    const cameraRise = Math.sin(Math.PI * state.launch) * 0.25;
    camera.position.y = cameraRise;
    camera.lookAt(0, cameraRise, 0);
    const mobile = size.width <= 760;
    const baseScale = mobile
      ? Math.min((viewport.height * 0.4) / 1.65, (viewport.width * 0.28) / 1.15)
      : Math.min((viewport.height * 0.22) / 1.5, (viewport.width * 0.16) / 1.5);
    const scale = baseScale * state.scale;
    const ambient = snapshot.ambient && motion.current.active;
    if (ambient) motion.current.time += Math.min(delta, 0.05);
    // Only continuously rendered ambient frames are a useful load signal. The
    // first second and resumed/background gaps never lower resolution. Three
    // bounded quarter-DPR steps resize the drawing buffer, never the geometry.
    const budget = performanceBudget.current;
    if (!ambient || delta <= 0 || delta > 0.1) {
      budget.warmup = 0;
      budget.samples = 0;
      budget.seconds = 0;
    } else if (budget.warmup < 60) {
      budget.warmup++;
    } else {
      budget.samples++;
      budget.seconds += delta;
      if (budget.samples >= 60) {
        const now = performance.now();
        const currentDpr = gl.getPixelRatio();
        if (
          budget.seconds / budget.samples > 0.024 &&
          now - budget.lastReduction >= 5000 &&
          budget.reductions < 3 &&
          currentDpr > 0.75
        ) {
          setDpr(Math.max(0.75, Math.min(quality.maxDpr, currentDpr - 0.25)));
          budget.reductions++;
          budget.lastReduction = now;
          invalidate();
        }
        budget.samples = 0;
        budget.seconds = 0;
      }
    }
    const t = snapshot.ambient ? motion.current.time : 0;
    const float = snapshot.ambient ? Math.sin(t * 0.7) * 0.055 * scale : 0;
    owned.group.position.set(
      viewport.width * state.x * (mobile ? 0.15 : 1),
      viewport.height * (0.015 + state.y) + float,
      0,
    );
    owned.group.scale.setScalar(scale);
    owned.group.rotation.set(state.rotationX, state.rotationY, state.rotationZ);
    // Ambient transforms are separate from the geometry and pure scroll pose.
    // The axis bends toward Z as the wheel forms, preserving a readable axle.
    const { dummy, axis, tilt, flint, metal, billboard, lightPosition } =
      scratch.current;
    const axle =
      Math.min(state.stoneProgress, 1) *
      (state.from === 0 ? 1 : state.from === 1 ? 1 - state.mix : 0);
    axis.set(0, 1 - axle, axle).normalize();
    // Stone and wheel rotate freely; later crafted objects gently turn toward
    // the viewer so the chip die and rocket window remain readable over time.
    const crafted = MathUtils.smoothstep(state.progress, 0.38, 0.56);
    const turn = MathUtils.lerp(t * 0.065, Math.sin(t * 0.27) * 0.15, crafted);
    dummy.quaternion.setFromAxisAngle(axis, turn);
    tilt.setFromAxisAngle(
      axis.set(1, 0, 0),
      snapshot.ambient ? Math.sin(t * 0.43) * 0.025 : 0,
    );
    dummy.quaternion.multiply(tilt);
    const cursor = pointer.current;
    cursor.x =
      snapshot.ambient && !mobile
        ? MathUtils.damp(cursor.x, cursor.targetX, 4, Math.min(delta, 0.05))
        : 0;
    cursor.y =
      snapshot.ambient && !mobile
        ? MathUtils.damp(cursor.y, cursor.targetY, 4, Math.min(delta, 0.05))
        : 0;
    tilt.setFromAxisAngle(axis.set(0, 1, 0), cursor.x * 0.1);
    dummy.quaternion.multiply(tilt);
    tilt.setFromAxisAngle(axis.set(1, 0, 0), cursor.y * 0.065);
    dummy.quaternion.multiply(tilt);
    owned.object.quaternion.copy(dummy.quaternion);
    owned.fragments.quaternion.copy(dummy.quaternion);
    owned.material.wireframe = snapshot.wireframe;

    if (
      snapshot.progress !== motion.current.lastProgress ||
      snapshot.surfaceFragments !== motion.current.lastFragments
    ) {
      owned.surface.update(state);
      const gearAmount =
        state.from === 0
          ? 1 - state.stoneStrength
          : state.from === 1
            ? 1 - state.mix
            : 0;
      const metalMix = Math.max(0, gearAmount);
      const weight = (index: number) =>
        (state.from === index ? 1 - state.mix : 0) +
        (state.to === index ? state.mix : 0);
      owned.finish.uniforms.weights.value.set(
        metalMix,
        weight(2),
        weight(3),
        weight(4),
      );
      owned.material.roughness = state.roughness;
      owned.material.metalness = state.metalness;
      owned.texture.uniforms.strength.value = state.stoneStrength;
      owned.material.envMapIntensity = 0.65 + (1 - state.stoneStrength) * 0.65;
      owned.fragmentMaterial.color.lerpColors(flint, metal, metalMix);
      const amount =
        state.from === 0 ? Math.sin(Math.PI * state.stoneProgress) ** 2 : 0;
      owned.fragments.visible = snapshot.surfaceFragments && amount > 0.001;
      if (owned.fragments.visible) {
        const {
          angularSegments: n,
          radialSegments: r,
          geometry,
        } = owned.surface;
        const positions = geometry.getAttribute("position");
        for (let i = 0; i < owned.fragments.count; i++) {
          const sample =
            (r + 1) * n + Math.floor((i / owned.fragments.count) * n);
          const angle = (i / owned.fragments.count) * Math.PI * 2;
          const lift = (0.025 + (i % 5) * 0.008) * amount;
          dummy.position.set(
            positions.getX(sample) + Math.cos(angle) * lift,
            positions.getY(sample) + Math.sin(angle) * lift,
            positions.getZ(sample) + Math.sin(i * 2.3) * 0.06,
          );
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
    const effects = owned.effects;
    const bulbWeight = owned.finish.uniforms.weights.value.y;
    const bulbPower = state.emissive * bulbWeight;
    const lightPulse = snapshot.ambient ? 0.985 + Math.sin(t * 1.3) * 0.015 : 1;
    const bulbLight = bulbPower * lightPulse;
    owned.finish.uniforms.bulbLight.value = state.emissive * lightPulse;
    const filamentReveal = MathUtils.smoothstep(bulbWeight, 0.45, 0.96);
    effects.filament.visible = filamentReveal > 0.001;
    effects.filament.scale.setScalar(filamentReveal);
    effects.filamentMaterial.emissiveIntensity = 1.5 + bulbLight * 8;
    owned.bulbLight.intensity = bulbLight * 4.5;
    owned.bulbLight.position
      .set(0, 0.36, 0)
      .applyQuaternion(owned.object.quaternion);
    // Project the same light source into viewport coordinates. DOM and WebGL
    // share the scroll channel without any React state updates per frame.
    const page = lightHost.current;
    if (page && (bulbLight > 0 || motion.current.lastBulbLight !== 0)) {
      if (bulbLight > 0) {
        camera.updateMatrixWorld();
        owned.object.updateWorldMatrix(true, false);
        lightPosition
          .set(0, 0.36, 0)
          .applyMatrix4(owned.object.matrixWorld)
          .project(camera);
        const bounds = gl.domElement.getBoundingClientRect();
        page.style.setProperty(
          "--bulb-x",
          `${bounds.left + (lightPosition.x * 0.5 + 0.5) * bounds.width}px`,
        );
        page.style.setProperty(
          "--bulb-y",
          `${bounds.top + (-lightPosition.y * 0.5 + 0.5) * bounds.height}px`,
        );
      }
      page.style.setProperty("--bulb-light", bulbLight.toFixed(4));
      motion.current.lastBulbLight = bulbLight;
    }
    // The small soft light planes face the camera independently of the scroll pose.
    billboard.copy(owned.group.quaternion).invert();
    effects.bulbHalo.quaternion.copy(billboard);
    effects.bulbHalo.position.set(0, 0.42, -0.9);
    effects.bulbHalo.scale.setScalar(5.2);
    (effects.bulbHalo.material as ShaderMaterial).uniforms.strength.value =
      bulbLight * 0.38;
    effects.engineHalo.quaternion.copy(billboard);
    effects.engineHalo.position.set(0, -1.45, 0.1);
    effects.engineHalo.scale.setScalar(1.8);
    (effects.engineHalo.material as ShaderMaterial).uniforms.strength.value =
      state.ignition * 0.48;
    effects.shadow.quaternion.copy(billboard);
    effects.shadow.position.set(0, -1.73, -1);
    effects.shadow.scale.set(2.5, 0.23, 1);
    (effects.shadow.material as ShaderMaterial).uniforms.strength.value =
      0.16 * (1 - state.launch) ** 2;
    owned.launchEffects.update(
      { ...state, ambient: snapshot.ambient },
      t,
      owned.group,
      camera,
    );
    owned.engineLight.intensity = state.ignition * 4;
    // Readable diagnostics support debug/test checks without exposing GPU objects.
    const canvas = gl.domElement;
    canvas.dataset.vertexCount = String(
      owned.surface.geometry.getAttribute("position").count,
    );
    canvas.dataset.meshId = String(owned.object.id);
    canvas.dataset.geometryId = String(owned.surface.geometry.id);
    canvas.dataset.positionVersion = String(
      (owned.surface.geometry.getAttribute("position") as BufferAttribute)
        .version,
    );
    canvas.dataset.frame = String(++motion.current.frames);
    canvas.dataset.ambient = String(snapshot.ambient);
    canvas.dataset.wireframe = String(snapshot.wireframe);
    canvas.dataset.surfaceFragments = String(owned.fragments.visible);
    canvas.dataset.objectX = String(owned.group.position.x);
    canvas.dataset.objectY = String(owned.group.position.y);
    canvas.dataset.modelScale = String(scale);
    canvas.dataset.stage = state.phase;
    canvas.dataset.morph = String(state.mix);
    canvas.dataset.dpr = String(gl.getPixelRatio());
    canvas.dataset.bulbLight = bulbLight.toFixed(4);
    canvas.dataset.launchEffects = String(owned.launchEffects.group.visible);
    canvas.dataset.smokeCount = String(
      owned.launchEffects.diagnostics.smokeCount,
    );
    if (ambient) invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[-4, 6, 5]}
        intensity={2.8}
        color={PALETTE.white}
      />
      <directionalLight
        position={[5, 1, -3]}
        intensity={0.65}
        color={PALETTE.electric}
      />
      <directionalLight
        position={[2, -3, 4]}
        intensity={0.35}
        color={PALETTE.ice}
      />
      <group ref={host} />
    </>
  );
}

class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function WebsiteCanvas({
  store,
  quality,
  onFailure,
  active,
  onReady,
}: {
  store: EvolutionStore;
  quality: QualityProfile;
  onFailure: () => void;
  active: boolean;
  onReady: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  useEffect(
    () => () => {
      canvas.current?.removeEventListener("webglcontextlost", onFailure);
    },
    [onFailure],
  );
  return (
    <CanvasBoundary onFailure={onFailure}>
      <Canvas
        aria-hidden="true"
        frameloop={active ? "demand" : "never"}
        dpr={[1, quality.maxDpr]}
        camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true,
        }}
        onCreated={({ gl }) => {
          gl.transmissionResolutionScale =
            quality.surface === "low" ? 0.5 : 0.75;
          canvas.current = gl.domElement;
          gl.domElement.addEventListener("webglcontextlost", onFailure);
        }}
      >
        <WebsiteScene store={store} quality={quality} active={active} onReady={onReady} />
      </Canvas>
    </CanvasBoundary>
  );
}
export default memo(WebsiteCanvas);
