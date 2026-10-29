import { describe, expect, it, vi } from 'vitest';
import { Group } from 'three';
import { evaluateEvolution } from '../engine/timeline';
import { createEvolutionRig } from './resources';

describe('Evolution rig resource ownership', () => {
  it('disposes exactly five owned GPU resources once and detaches its cleared group', () => {
    const rig = createEvolutionRig(32);
    const parent = new Group();
    parent.add(rig.group);
    const resources: Array<{ addEventListener: (type: 'dispose', listener: () => void) => void }> = [
      rig.surface.geometry, rig.fragments.geometry, rig.material, rig.fragmentMaterial, rig.fragments,
    ];
    expect(new Set(resources).size).toBe(5);
    const listeners = resources.map((resource) => {
      const listener = vi.fn();
      resource.addEventListener('dispose', listener);
      return listener;
    });
    rig.dispose();
    rig.dispose();
    for (const listener of listeners) expect(listener).toHaveBeenCalledTimes(1);
    expect(rig.group.children).toHaveLength(0);
    expect(rig.group.parent).toBeNull();
    expect(parent.children).toHaveLength(0);
  });

  it('keeps the opaque main mesh and all buffer identities throughout forward and reverse evolution', () => {
    const rig = createEvolutionRig(1, 'low');
    const object = rig.object;
    const geometry = object.geometry;
    const material = object.material;
    const index = geometry.index;
    const indexArray = index?.array;
    const attributes = Object.entries(geometry.attributes).map(([name, attribute]) => ({ name, attribute, array: attribute.array }));
    try {
      for (const p of [...Array.from({ length: 101 }, (_, i) => i / 100), ...Array.from({ length: 101 }, (_, i) => 1 - i / 100)]) {
        rig.surface.update(evaluateEvolution(p));
        expect(rig.object).toBe(object);
        expect(object.geometry).toBe(geometry);
        expect(object.material).toBe(material);
        expect(geometry.index).toBe(index);
        expect(geometry.index?.array).toBe(indexArray);
        for (const { name, attribute, array } of attributes) {
          expect(geometry.getAttribute(name)).toBe(attribute);
          expect(geometry.getAttribute(name).array).toBe(array);
        }
        expect(rig.material.transparent).toBe(false);
        expect(rig.material.opacity).toBe(1);
        expect(rig.object.visible).toBe(true);
      }
    } finally { rig.dispose(); }
  });

  it('restores the same geometry from pure state after an intervening finished gear', () => {
    const rig = createEvolutionRig(1, 'low');
    try {
      rig.surface.update(evaluateEvolution(0.475));
      const positions = Array.from(rig.surface.geometry.getAttribute('position').array);
      const normals = Array.from(rig.surface.geometry.getAttribute('normal').array);
      rig.surface.update(evaluateEvolution(1));
      expect(Array.from(rig.surface.geometry.getAttribute('position').array)).not.toEqual(positions);
      rig.surface.update(evaluateEvolution(0.475));
      expect(Array.from(rig.surface.geometry.getAttribute('position').array)).toEqual(positions);
      expect(Array.from(rig.surface.geometry.getAttribute('normal').array)).toEqual(normals);
    } finally { rig.dispose(); }
  });

  it('recreates fresh resources with identical fixed geometry arrays after effect replay', () => {
    const first = createEvolutionRig(32);
    first.dispose();
    const second = createEvolutionRig(32);
    try {
      expect(second.group).not.toBe(first.group);
      for (const key of ['object', 'fragments'] as const) {
        expect(second[key]).not.toBe(first[key]);
        expect(second[key].geometry).not.toBe(first[key].geometry);
        expect(second[key].material).not.toBe(first[key].material);
        for (const name of Object.keys(first[key].geometry.attributes)) {
          const a = first[key].geometry.getAttribute(name).array;
          const b = second[key].geometry.getAttribute(name).array;
          expect(b).not.toBe(a);
          expect(b).toEqual(a);
        }
        expect(second[key].geometry.index?.array).toEqual(first[key].geometry.index?.array);
      }
    } finally { second.dispose(); }
  });

  it.each([1, 64])('accepts the fragment count limit %s', count => {
    const rig = createEvolutionRig(count, 'low');
    expect(rig.fragments.count).toBe(count);
    rig.dispose();
  });

  it.each([0, -1, 1.5, 65, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid count %s before allocating a rig', count => {
    expect(() => createEvolutionRig(count)).toThrow('Surface fragment count must be an integer from 1 to 64.');
  });
});
