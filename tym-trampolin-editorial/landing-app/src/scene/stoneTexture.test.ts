import { describe, expect, it, vi } from 'vitest';
import { MeshStandardMaterial, ShaderLib, UniformsUtils, type WebGLRenderer } from 'three';
import { applyStoneTexture } from './stoneTexture';

function compile(material: MeshStandardMaterial) {
  const shader = {
    uniforms: UniformsUtils.clone(ShaderLib.standard.uniforms),
    vertexShader: ShaderLib.standard.vertexShader,
    fragmentShader: ShaderLib.standard.fragmentShader,
  };
  material.onBeforeCompile(shader as Parameters<MeshStandardMaterial['onBeforeCompile']>[0], {} as WebGLRenderer);
  return shader;
}

describe('procedural stone texture lifecycle', () => {
  it('reuses the same uniform across shader recompiles and scrub updates without recompiling', () => {
    const material = new MeshStandardMaterial();
    const texture = applyStoneTexture(material);
    const first = compile(material);
    const version = material.version;
    const key = material.customProgramCacheKey();
    for (const strength of [1, 0.5, 0, 0.5, 1]) {
      texture.uniforms.strength.value = strength;
      expect(first.uniforms.uStoneStrength.value).toBe(strength);
      expect(material.version).toBe(version);
      expect(material.customProgramCacheKey()).toBe(key);
    }
    const second = compile(material);
    expect(second.uniforms.uStoneStrength).toBe(first.uniforms.uStoneStrength);
    expect(second.vertexShader).toBe(first.vertexShader);
    expect(second.fragmentShader).toBe(first.fragmentShader);
    texture.dispose();
    material.dispose();
  });

  it('preserves existing compile hooks and restores them on idempotent cleanup', () => {
    const material = new MeshStandardMaterial();
    const hook = vi.fn();
    const key = () => 'existing-material';
    material.onBeforeCompile = hook;
    material.customProgramCacheKey = key;
    const texture = applyStoneTexture(material);
    compile(material);
    expect(hook).toHaveBeenCalledOnce();
    texture.dispose();
    const version = material.version;
    texture.dispose();
    expect(material.version).toBe(version);
    expect(material.onBeforeCompile).toBe(hook);
    expect(material.customProgramCacheKey).toBe(key);
    material.dispose();
  });
});
