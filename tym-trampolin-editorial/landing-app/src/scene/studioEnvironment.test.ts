import { describe, expect, it, vi } from "vitest";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";
import { createStudioEnvironment } from "./studioEnvironment";

describe("PMREM source studio ownership", () => {
  it("shares its plane, points panels into the room and disposes every owned resource exactly once", () => {
    const studio = createStudioEnvironment();
    const panels = studio.scene.children as Mesh[];
    expect(panels).toHaveLength(4);
    const geometries = new Set(panels.map((panel) => panel.geometry));
    const materials = new Set(
      panels.map((panel) => panel.material as MeshBasicMaterial),
    );
    expect(geometries.size).toBe(1);
    expect(materials.size).toBe(3);
    for (const panel of panels) {
      const inward = panel.position.clone().negate().normalize();
      expect(panel.getWorldDirection(new Vector3()).dot(inward)).toBeCloseTo(
        1,
        10,
      );
    }
    const resources = [...geometries, ...materials];
    const listeners = resources.map((resource) => {
      const listener = vi.fn();
      resource.addEventListener("dispose", listener);
      return listener;
    });
    studio.dispose();
    studio.dispose();
    expect(studio.scene.children).toHaveLength(0);
    expect(studio.scene.background).toBeNull();
    listeners.forEach((listener) => expect(listener).toHaveBeenCalledTimes(1));
  });
});
