import { describe, expect, it, vi } from "vitest";
import { createStorySurface } from "./storyGeometry";
import { Color } from "three";
const state = (from: number, to: number, mix: number, stoneProgress = 1) => ({
  from,
  to,
  mix,
  stoneProgress,
});
function bounds(surface: ReturnType<typeof createStorySurface>) {
  const p = surface.geometry.getAttribute("position");
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (let v = 0; v < p.count; v++) {
    minX = Math.min(minX, p.getX(v));
    maxX = Math.max(maxX, p.getX(v));
    minY = Math.min(minY, p.getY(v));
    maxY = Math.max(maxY, p.getY(v));
    minZ = Math.min(minZ, p.getZ(v));
    maxZ = Math.max(maxZ, p.getZ(v));
  }
  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    minY,
    maxY,
  };
}
describe("single story surface", () => {
  it("keeps finite deterministic geometry and attribute identities across forward/reverse sampling", () => {
    const surface = createStorySurface("low");
    const geometry = surface.geometry;
    const attributes = Object.fromEntries(
      Object.entries(geometry.attributes).map(([key, value]) => [
        key,
        { value, array: value.array },
      ]),
    );
    const originalIndex = geometry.index;
    const rest = Array.from(geometry.getAttribute("aRestPosition").array);
    for (let from = 0; from < 4; from++)
      for (let step = 0; step <= 32; step++) {
        const t = step / 32;
        surface.update(state(from, from + 1, t, t));
        for (const key of ["position", "normal", "color"])
          expect(
            Array.from(geometry.getAttribute(key).array).every(Number.isFinite),
          ).toBe(true);
      }
    surface.update(state(2, 3, 0.371));
    const forward = Array.from(geometry.getAttribute("position").array);
    surface.update(state(4, 4, 1));
    surface.update(state(0, 1, 0, 0));
    surface.update(state(2, 3, 0.371));
    expect(Array.from(geometry.getAttribute("position").array)).toEqual(
      forward,
    );
    expect(Array.from(geometry.getAttribute("aRestPosition").array)).toEqual(
      rest,
    );
    expect(geometry.index).toBe(originalIndex);
    for (const [key, original] of Object.entries(attributes)) {
      expect(geometry.getAttribute(key)).toBe(original.value);
      expect(geometry.getAttribute(key).array).toBe(original.array);
    }
    surface.dispose();
  });
  it("preserves the gear aperture then closes it continuously into recognizable solids", () => {
    const surface = createStorySurface("standard");
    surface.update(state(1, 2, 0));
    const p = surface.geometry.getAttribute("position");
    expect(Math.hypot(p.getX(0), p.getY(0))).toBeGreaterThan(0.43);
    const gear = Array.from(p.array);
    surface.update(state(0, 1, 1, 1));
    expect(Array.from(p.array)).toEqual(gear);
    surface.update(state(2, 2, 1));
    const bulb = bounds(surface);
    const colors = surface.geometry.getAttribute("color");
    const frost = new Color("#DCE7FF"),
      metal = new Color("#7C8494"),
      contact = new Color("#252A34");
    for (let v = 0; v < p.count; v++) {
      const expected =
        p.getY(v) < -1.13 ? contact : p.getY(v) < -0.61 ? metal : frost;
      expect(colors.getX(v)).toBeCloseTo(expected.r, 6);
      expect(colors.getY(v)).toBeCloseTo(expected.g, 6);
      expect(colors.getZ(v)).toBeCloseTo(expected.b, 6);
    }
    expect(bulb.height).toBeGreaterThan(2.5);
    expect(bulb.width).toBeGreaterThan(1.9);
    expect(Math.hypot(p.getX(0), p.getZ(0))).toBeLessThan(0.001);
    for (let v = 1; v < surface.angularSegments; v++) {
      expect(p.getX(v)).toBe(p.getX(0));
      expect(p.getY(v)).toBe(p.getY(0));
      expect(p.getZ(v)).toBe(p.getZ(0));
    }
    surface.update(state(3, 3, 1));
    const chip = bounds(surface);
    expect(chip.width).toBeGreaterThan(2.2);
    expect(chip.height).toBeGreaterThan(2.2);
    expect(chip.depth).toBeLessThan(0.46);
    let contacts = 0,
      die = 0;
    for (let v = 0; v < p.count; v++) {
      if (Math.max(Math.abs(p.getX(v)), Math.abs(p.getY(v))) > 1.0) contacts++;
      if (
        Math.abs(p.getX(v)) < 0.42 &&
        Math.abs(p.getY(v)) < 0.42 &&
        Math.abs(p.getZ(v)) > 0.2
      )
        die++;
    }
    expect(contacts).toBeGreaterThan(50);
    expect(die).toBeGreaterThan(50);
    // Complete coplanar package rows must retain flat +Z normals, not radiate
    // through sloping silver triangles as a spherical-ray package would.
    const normals = surface.geometry.getAttribute("normal");
    for (let row = 10; row <= 12; row++)
      for (let i = 0; i < surface.angularSegments; i++) {
        const v = row * surface.angularSegments + i;
        expect(p.getZ(v)).toBeCloseTo(0.13, 6);
        expect(normals.getX(v)).toBeCloseTo(0, 6);
        expect(normals.getY(v)).toBeCloseTo(0, 6);
        expect(normals.getZ(v)).toBeCloseTo(1, 6);
      }
    let pinGroups = 0;
    const outerRow = surface.radialSegments * surface.angularSegments;
    const isPin = (i: number) =>
      Math.max(Math.abs(p.getX(outerRow + i)), Math.abs(p.getY(outerRow + i))) >
      1;
    for (let i = 0; i < surface.angularSegments; i++)
      if (
        isPin(i) &&
        !isPin((i + surface.angularSegments - 1) % surface.angularSegments)
      )
        pinGroups++;
    expect(pinGroups).toBe(16);
    surface.update(state(4, 4, 1));
    const rocket = bounds(surface);
    expect(rocket.height).toBeGreaterThan(3);
    expect(rocket.width).toBeGreaterThan(1.8);
    expect(rocket.maxY).toBeGreaterThan(1.6);
    surface.update(state(2, 3, 0.5));
    const middle = Float32Array.from(p.array);
    surface.update(state(2, 3, 0.5 - 1e-5));
    const before = Float32Array.from(p.array);
    surface.update(state(2, 3, 0.5 + 1e-5));
    for (let k = 0; k < p.array.length; k++) {
      expect(Math.abs(p.array[k] - before[k])).toBeLessThan(0.0001);
      expect(Math.abs((p.array[k] + before[k]) * 0.5 - middle[k])).toBeLessThan(
        0.000001,
      );
    }
    surface.dispose();
  });
  it("resolves manufactured details within bounded quality tiers and keeps unit normals", () => {
    for (const quality of ["low", "standard"] as const) {
      const surface = createStorySurface(quality);
      const p = surface.geometry.getAttribute("position");
      const normal = surface.geometry.getAttribute("normal");
      expect(p.count).toBeLessThan(quality === "low" ? 6000 : 12000);
      surface.update(state(2, 2, 1));
      let ribs = 0;
      for (let row = 1; row < 2 * surface.radialSegments + 3; row++) {
        const v = row * surface.angularSegments;
        const previous = p.getX(v - surface.angularSegments);
        const next = p.getX(v + surface.angularSegments);
        if (
          p.getY(v) < -0.67 &&
          p.getY(v) > -1.08 &&
          p.getX(v) > previous &&
          p.getX(v) > next
        )
          ribs++;
      }
      expect(ribs).toBeGreaterThanOrEqual(quality === "low" ? 2 : 3);
      surface.update(state(4, 4, 1));
      let row = 0,
        closest = Infinity;
      for (let j = 0; j < 2 * surface.radialSegments + 4; j++) {
        const distance = Math.abs(p.getY(j * surface.angularSegments) + 0.88);
        if (distance < closest) {
          closest = distance;
          row = j;
        }
      }
      const radii = Array.from({ length: surface.angularSegments }, (_, i) =>
        Math.hypot(
          p.getX(row * surface.angularSegments + i),
          p.getZ(row * surface.angularSegments + i),
        ),
      );
      const fins = radii.map((radius) => radius > 0.8);
      expect(
        fins.filter(
          (fin, i) => fin && !fins[(i + fins.length - 1) % fins.length],
        ),
      ).toHaveLength(4);
      expect(Math.min(...radii)).toBeCloseTo(0.42, 4);
      for (let i = 0; i < normal.count; i++)
        expect(
          Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)),
        ).toBeCloseTo(1, 5);
      surface.dispose();
    }
  });
  it("keeps the manufactured gear plate coplanar outside its circular hub", () => {
    const surface = createStorySurface("standard");
    surface.update(state(1, 1, 1));
    const p = surface.geometry.getAttribute("position");
    const normal = surface.geometry.getAttribute("normal");
    let plateVertices = 0;
    for (let v = 0; v < p.count; v++) {
      const radius = Math.hypot(p.getX(v), p.getY(v));
      if (radius > 0.8 && radius < 1.0 && p.getZ(v) > 0) {
        expect(p.getZ(v)).toBeCloseTo(0.22, 6);
        expect(normal.getX(v)).toBeCloseTo(0, 6);
        expect(normal.getY(v)).toBeCloseTo(0, 6);
        expect(normal.getZ(v)).toBeCloseTo(1, 6);
        plateVertices++;
      }
    }
    expect(plateVertices).toBeGreaterThan(500);
    surface.dispose();
  });
  it("disposes its sole geometry once and ignores updates after disposal", () => {
    const surface = createStorySurface("low");
    const dispose = vi.spyOn(surface.geometry, "dispose");
    const initial = Array.from(surface.geometry.getAttribute("position").array);
    surface.dispose();
    surface.dispose();
    surface.update(state(3, 4, 0.5));
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(Array.from(surface.geometry.getAttribute("position").array)).toEqual(
      initial,
    );
  });
});
