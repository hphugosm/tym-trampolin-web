import {
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PointLight,
} from "three";
import { createStorySurface } from "../engine/storyGeometry";
import { applyStoneTexture } from "./stoneTexture";
import { applyCraftFinish } from "./craftFinish";
import { createVisualEffects } from "./visualEffects";
import { createLaunchEffects } from "./launchEffects";
import { PALETTE } from "../theme";

/** The story and its small light details own a fixed set of GPU resources. */
export function createWebsiteRig(
  count: number,
  quality: "standard" | "low" = "standard",
) {
  if (!Number.isInteger(count) || count < 1 || count > 64)
    throw new Error("Surface fragment count must be an integer from 1 to 64.");
  const surface = createStorySurface(quality, 21);
  const material = new MeshPhysicalMaterial({
    color: PALETTE.white,
    roughness: 0.9,
    metalness: 0.02,
    vertexColors: false,
    envMapIntensity: 0.65,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
    ior: 1.46,
    thickness: 0.35,
    // The shader masks transmission to the bulb head. Keeping the feature
    // enabled avoids program churn when scrubbing between stages.
    transmission: 0.78,
    attenuationDistance: 2,
    attenuationColor: PALETTE.white,
  });
  const texture = applyStoneTexture(material);
  const finish = applyCraftFinish(material);
  const object = new Mesh(surface.geometry, material);
  const fragmentGeometry = new OctahedronGeometry(1, 0);
  const fragmentMaterial = new MeshStandardMaterial({
    color: "#777267",
    roughness: 0.9,
  });
  const fragments = new InstancedMesh(
    fragmentGeometry,
    fragmentMaterial,
    count,
  );
  fragments.instanceMatrix.setUsage(DynamicDrawUsage);
  fragments.frustumCulled = false;
  fragments.visible = false;
  const effects = createVisualEffects();
  object.add(effects.filament);
  const launchEffects = createLaunchEffects(quality);
  const engineLight = new PointLight("#FF9A36", 0, 4, 2);
  engineLight.position.y = -1.4;
  const bulbLight = new PointLight("#FFE1A0", 0, 3, 2);
  bulbLight.position.y = 0.35;
  const group = new Group();
  group.add(
    object,
    fragments,
    engineLight,
    bulbLight,
    effects.bulbHalo,
    effects.engineHalo,
    effects.shadow,
  );
  const gpuResources = [
    surface.geometry,
    fragmentGeometry,
    material,
    fragmentMaterial,
    fragments,
    ...effects.geometries,
    ...effects.materials,
    ...launchEffects.gpuResources,
  ];
  let disposed = false;
  return {
    group,
    surface,
    object,
    material,
    fragments,
    fragmentMaterial,
    texture,
    finish,
    effects,
    launchEffects,
    engineLight,
    bulbLight,
    gpuResources,
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      finish.dispose();
      texture.dispose();
      effects.dispose();
      launchEffects.dispose();
      fragments.dispose();
      surface.dispose();
      fragmentGeometry.dispose();
      material.dispose();
      fragmentMaterial.dispose();
    },
  };
}
export type WebsiteRig = ReturnType<typeof createWebsiteRig>;
