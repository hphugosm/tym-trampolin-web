import { describe, expect, it, vi } from "vitest";
import { Group } from "three";
import { evaluateStory } from "../engine/story";
import { createWebsiteRig } from "./websiteResources";

describe("Website story GPU ownership", () => {
  it("reuses one opaque mesh and fixed buffers through every stage in both directions", () => {
    const rig = createWebsiteRig(24, "low");
    const object = rig.object;
    const geometry = object.geometry;
    const material = object.material;
    const attributes = Object.entries(geometry.attributes).map(
      ([name, attribute]) => ({ name, attribute, array: attribute.array }),
    );
    const rest = Array.from(geometry.getAttribute("aRestPosition").array);
    try {
      for (const p of [
        0, 0.1, 0.18, 0.3, 0.38, 0.5, 0.56, 0.7, 0.77, 0.9, 1, 0.77, 0.5, 0.18,
        0,
      ]) {
        rig.surface.update(evaluateStory(p));
        expect(rig.object).toBe(object);
        expect(object.geometry).toBe(geometry);
        expect(object.material).toBe(material);
        expect(material.vertexColors).toBe(false);
        expect(material.isMeshPhysicalMaterial).toBe(true);
        expect(material.transmission).toBeGreaterThan(0);
        expect(material.transparent).toBe(false);
        expect(material.opacity).toBe(1);
        for (const { name, attribute, array } of attributes) {
          expect(geometry.getAttribute(name)).toBe(attribute);
          expect(geometry.getAttribute(name).array).toBe(array);
        }
        expect(
          Array.from(geometry.getAttribute("aRestPosition").array),
        ).toEqual(rest);
      }
    } finally {
      rig.dispose();
    }
  });

  it("disposes every owned GPU resource exactly once and detaches the scene", () => {
    const rig = createWebsiteRig(24, "low");
    const parent = new Group();
    parent.add(rig.group);
    const resources: Array<{
      addEventListener: (type: "dispose", listener: () => void) => void;
    }> = rig.gpuResources;
    const listeners = resources.map((resource) => {
      const listener = vi.fn();
      resource.addEventListener("dispose", listener);
      return listener;
    });
    rig.dispose();
    rig.dispose();
    for (const listener of listeners) expect(listener).toHaveBeenCalledTimes(1);
    expect(parent.children).toHaveLength(0);
    expect(rig.group.children).toHaveLength(0);
  });

  it.each([0, 65, 1.5, NaN])(
    "rejects an invalid fragment budget %s",
    (count) => {
      expect(() => createWebsiteRig(count)).toThrow();
    },
  );
});
