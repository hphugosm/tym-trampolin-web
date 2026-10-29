import { DynamicDrawUsage, Group, InstancedMesh, Mesh, MeshStandardMaterial, OctahedronGeometry } from 'three';
import { createMorphSurface, type MorphSurface } from '../engine/morphGeometry';
import { applyStoneTexture, type StoneTexture } from './stoneTexture';
import { PALETTE } from '../theme';

export interface EvolutionRig {
  group: Group;
  surface: MorphSurface;
  object: Mesh;
  material: MeshStandardMaterial;
  fragments: InstancedMesh;
  fragmentMaterial: MeshStandardMaterial;
  texture: StoneTexture;
  dispose: () => void;
}

/** One main object, one material, fixed buffers: never swap or crossfade models. */
export function createEvolutionRig(count: number, quality: 'standard' | 'low' = 'standard'): EvolutionRig {
  if (!Number.isInteger(count) || count < 1 || count > 64) throw new Error('Surface fragment count must be an integer from 1 to 64.');
  const surface = createMorphSurface(quality, 21);
  const material = new MeshStandardMaterial({ color: PALETTE.white, roughness: 0.9, metalness: 0.02, vertexColors: false, envMapIntensity: 0.5 });
  const texture = applyStoneTexture(material);
  const object = new Mesh(surface.geometry, material);
  const fragmentGeometry = new OctahedronGeometry(1, 0);
  const fragmentMaterial = new MeshStandardMaterial({ color: PALETTE.electric, roughness: 0.7, metalness: 0.1 });
  const fragments = new InstancedMesh(fragmentGeometry, fragmentMaterial, count);
  fragments.instanceMatrix.setUsage(DynamicDrawUsage);
  fragments.frustumCulled = false;
  fragments.visible = false;
  const group = new Group();
  group.add(object, fragments);
  let disposed = false;
  return {
    group, surface, object, material, fragments, fragmentMaterial, texture,
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      fragments.dispose();
      surface.dispose();
      fragmentGeometry.dispose();
      texture.dispose();
      material.dispose();
      fragmentMaterial.dispose();
    },
  };
}
