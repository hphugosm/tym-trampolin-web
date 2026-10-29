import { Camera, DynamicDrawUsage, Group, InstancedMesh } from "three";
import { describe, expect, it, vi } from "vitest";
import {
  createLaunchEffects,
  sampleLaunchSmoke,
  type SmokeSample,
} from "./launchEffects";

describe("deterministic launch effects", () => {
  it("restores smoke positions and scale when scrubbing back without an age clock", () => {
    const out: SmokeSample = { x: 0, y: 0, z: 0, scale: 0 };
    const state = { ignition: 1, launch: 0.4, progress: 0.89 };
    const expected = { ...sampleLaunchSmoke(7, 24, state, out) };
    sampleLaunchSmoke(7, 24, { ignition: 1, launch: 1, progress: 0.94 }, out);
    expect(sampleLaunchSmoke(7, 24, state, out)).toEqual(expected);
    expect(
      sampleLaunchSmoke(7, 24, { ignition: 0, launch: 0, progress: 0.7 }, out)
        .scale,
    ).toBe(0);
  });
  it("scales flame and smoke with the rocket on compact layouts", () => {
    const effect = createLaunchEffects("low");
    const rocket = new Group();
    const camera = new Camera();
    const state = { ignition: 1, launch: 0.5, progress: 0.9 };
    rocket.updateMatrixWorld(true);
    effect.update(state, 0, rocket, camera);
    const smoke = effect.group.children[0] as InstancedMesh;
    const flame = (effect.group.children[1] as Group).children[0];
    const firstFlame = flame.scale.clone();
    const firstSmoke = Array.from(smoke.instanceMatrix.array);
    rocket.scale.setScalar(0.5);
    rocket.updateMatrixWorld(true);
    effect.update(state, 0, rocket, camera);
    expect(flame.scale.x).toBeCloseTo(firstFlame.x * 0.5);
    expect(flame.scale.y).toBeCloseTo(firstFlame.y * 0.5);
    for (let index = 0; index < firstSmoke.length; index++) {
      if (index % 16 !== 15)
        expect(smoke.instanceMatrix.array[index]).toBeCloseTo(
          firstSmoke[index] * 0.5,
        );
    }
    expect(smoke.instanceMatrix.usage).toBe(DynamicDrawUsage);
    effect.dispose();
  });
  it("owns a fixed pool and disposes its four GPU resources exactly once", () => {
    const effect = createLaunchEffects("low");
    expect(effect.diagnostics.smokeCount).toBe(12);
    expect(new Set(effect.gpuResources).size).toBe(4);
    const resources = effect.gpuResources as Array<{
      addEventListener: (type: "dispose", listener: () => void) => void;
    }>;
    const listeners = resources.map((resource) => {
      const listener = vi.fn();
      resource.addEventListener("dispose", listener);
      return listener;
    });
    effect.dispose();
    effect.dispose();
    listeners.forEach((listener) => expect(listener).toHaveBeenCalledTimes(1));
    expect(effect.group.children).toHaveLength(0);
  });
});
