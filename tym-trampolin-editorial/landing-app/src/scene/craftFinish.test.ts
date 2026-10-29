import { describe, expect, it, vi } from "vitest";
import {
  MeshPhysicalMaterial,
  ShaderLib,
  UniformsUtils,
  type WebGLRenderer,
} from "three";
import { applyCraftFinish } from "./craftFinish";
import { applyStoneTexture } from "./stoneTexture";

function compile(material: MeshPhysicalMaterial) {
  const shader = {
    uniforms: UniformsUtils.clone(ShaderLib.physical.uniforms),
    vertexShader: ShaderLib.physical.vertexShader,
    fragmentShader: ShaderLib.physical.fragmentShader,
  };
  material.onBeforeCompile(
    shader as Parameters<MeshPhysicalMaterial["onBeforeCompile"]>[0],
    {} as WebGLRenderer,
  );
  return shader;
}

describe("craft finishes", () => {
  it("keeps bulb power uniform stable and isolates warm glass emission to glass in the bulb phase", () => {
    const material = new MeshPhysicalMaterial();
    const craft = applyCraftFinish(material);
    const shader = compile(material);
    const version = material.version;
    expect(craft.uniforms.bulbLight.value).toBe(0);
    for (const power of [0, 0.5, 1, 0]) {
      craft.uniforms.bulbLight.value = power;
      expect(shader.uniforms.uBulbLight.value).toBe(power);
      expect(material.version).toBe(version);
    }
    expect(compile(material).uniforms.uBulbLight).toBe(
      shader.uniforms.uBulbLight,
    );
    expect(shader.fragmentShader).toContain(
      "clamp(uBulbLight, 0.0, 1.0) * glassHead * uCraftWeights.y",
    );
    expect(shader.fragmentShader).not.toContain("filamentCoil");
    expect(shader.fragmentShader).not.toContain("filamentSupports");
    const emissionPosition = shader.fragmentShader.indexOf(
      "totalEmissiveRadiance += uBulbWarm",
    );
    expect(emissionPosition).toBeGreaterThan(
      shader.fragmentShader.indexOf("#include <emissivemap_fragment>"),
    );
    expect(emissionPosition).toBeLessThan(
      shader.fragmentShader.indexOf("#include <lights_physical_fragment>"),
    );
    craft.dispose();
    material.dispose();
  });

  it("layers after natural flint and masks glass transmission before refraction", () => {
    const material = new MeshPhysicalMaterial();
    const stone = applyStoneTexture(material);
    const craft = applyCraftFinish(material);
    const shader = compile(material);
    expect(shader.vertexShader).toContain("vCraftPosition = transformed;");
    expect(shader.vertexShader).toContain(
      "vStoneRestPosition = aRestPosition;",
    );
    const source = shader.fragmentShader;
    expect(source.indexOf("mineralColor =")).toBeLessThan(
      source.indexOf("vec3 gearColor"),
    );
    expect(source.indexOf("roughnessFactor = mix")).toBeLessThan(
      source.indexOf("float gearRoughness"),
    );
    expect(
      source.indexOf(
        "material.transmission = transmission * glassHead * uCraftWeights.y;",
      ),
    ).toBeLessThan(source.indexOf("vec4 transmitted ="));
    for (const chunk of [
      "metalnessmap_fragment",
      "normal_fragment_begin",
      "clearcoat_normal_fragment_begin",
    ]) {
      expect(source.split(`#include <${chunk}>`)).toHaveLength(2);
    }
    craft.dispose();
    stone.dispose();
    material.dispose();
  });

  it("reuses uniforms during forward/backward scrubbing and restores the stacked hook once", () => {
    const material = new MeshPhysicalMaterial();
    const original = vi.fn();
    material.onBeforeCompile = original;
    const stone = applyStoneTexture(material);
    const stoneHook = material.onBeforeCompile;
    const stoneKey = material.customProgramCacheKey;
    const craft = applyCraftFinish(material);
    const first = compile(material);
    const version = material.version;
    const key = material.customProgramCacheKey();
    for (const mix of [0, 0.25, 1, 0.25, 0]) {
      craft.uniforms.weights.value.set(1 - mix, mix, 0, 0);
      expect(first.uniforms.uCraftWeights.value).toBe(
        craft.uniforms.weights.value,
      );
      expect(material.version).toBe(version);
      expect(material.customProgramCacheKey()).toBe(key);
    }
    expect(compile(material).uniforms.uCraftWeights).toBe(
      first.uniforms.uCraftWeights,
    );
    expect(original).toHaveBeenCalledTimes(2);
    craft.dispose();
    const disposedVersion = material.version;
    craft.dispose();
    expect(material.version).toBe(disposedVersion);
    expect(material.onBeforeCompile).toBe(stoneHook);
    expect(material.customProgramCacheKey).toBe(stoneKey);
    stone.dispose();
    expect(material.onBeforeCompile).toBe(original);
    material.dispose();
  });
});
