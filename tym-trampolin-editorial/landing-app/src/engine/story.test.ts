import { describe, expect, it } from "vitest";
import { evaluateStory, mapScrollToStory, STORY_STOPS } from "./story";
import { evaluateEvolution } from "./timeline";

describe("website story timeline", () => {
  it("retains chapter beats and clamps invalid scroll", () => {
    expect(STORY_STOPS.map((s) => s.progress)).toEqual([
      0, 0.18, 0.38, 0.56, 0.77, 0.96,
    ]);
    for (const p of [NaN, Infinity, -Infinity, -2])
      expect(evaluateStory(p)).toEqual(evaluateStory(0));
    expect(evaluateStory(2)).toEqual(evaluateStory(1));
  });
  it("holds shapes before morphing and keeps the stone timeline isolated", () => {
    expect(evaluateStory(0.02)).toMatchObject({
      from: 0,
      to: 1,
      mix: 0,
      stoneProgress: 0,
    });
    expect(evaluateStory(0.2)).toMatchObject({
      from: 1,
      to: 2,
      mix: 0,
      stoneProgress: 1,
    });
    expect(evaluateStory(0.4)).toMatchObject({ from: 2, to: 3, mix: 0 });
    expect(evaluateStory(0.59)).toMatchObject({ from: 3, to: 4, mix: 0 });
    expect(evaluateStory(0.8)).toMatchObject({ from: 4, to: 4, mix: 0 });
  });
  it("preserves the original stone material and smoothly varies later physical surfaces", () => {
    for (let i = 0; i < 180; i++) {
      const state = evaluateStory(i / 1000);
      const original = evaluateEvolution(state.stoneProgress);
      expect(state.metalness).toBe(original.metalness);
      expect(state.roughness).toBe(original.roughness);
      expect(state.stoneStrength).toBe(1 - original.teeth);
    }
    for (const [progress, metalness, roughness] of [
      [0.2, 0.86, 0.25],
      [0.4, 0.06, 0.45],
      [0.59, 0.35, 0.55],
      [0.8, 0.24, 0.42],
    ]) {
      expect(evaluateStory(progress).metalness).toBeCloseTo(metalness);
      expect(evaluateStory(progress).roughness).toBeCloseTo(roughness);
      expect(evaluateStory(progress).stoneStrength).toBe(0);
    }
    expect(evaluateStory(0.305).metalness).toBeCloseTo(0.46);
    expect(evaluateStory(0.305).roughness).toBeCloseTo(0.35);
  });
  it("has continuous effective geometry, material and motion at every boundary", () => {
    for (const p of [
      0.035, 0.18, 0.23, 0.38, 0.42, 0.56, 0.61, 0.77, 0.78, 0.81, 0.82, 0.85,
      0.86, 0.94, 0.96, 0.98, 0.99,
    ]) {
      const a = evaluateStory(p - 1e-7);
      const b = evaluateStory(p + 1e-7);
      expect(Math.abs(a.from + a.mix - b.from - b.mix)).toBeLessThan(0.0001);
      for (const key of [
        "stoneProgress",
        "x",
        "y",
        "scale",
        "rotationX",
        "rotationY",
        "rotationZ",
        "stoneStrength",
        "metalness",
        "roughness",
        "emissive",
        "ignition",
        "launch",
        "finale",
      ] as const)
        expect(Math.abs(a[key] - b[key]), `${key} at ${p}`).toBeLessThan(
          0.0001,
        );
    }
  });
  it("reverses launch and all earlier geometry without time or hidden state", () => {
    const forward = Array.from({ length: 1001 }, (_, i) =>
      evaluateStory(i / 1000),
    );
    for (let i = 1000; i >= 0; i--)
      expect(evaluateStory(i / 1000)).toEqual(forward[i]);
    expect(evaluateStory(0.94).y).toBeGreaterThan(1);
    expect(evaluateStory(0.8).launch).toBe(0);
    expect(evaluateStory(1).finale).toBe(1);
  });
  it("maps actual chapter positions without footer drift or stale manual state", () => {
    const anchors = [
      { scroll: 0, progress: 0 },
      { scroll: 600, progress: 0.18 },
      { scroll: 1600, progress: 0.38 },
      { scroll: 2400, progress: 1 },
    ];
    expect(mapScrollToStory(600, anchors)).toBe(0.18);
    expect(mapScrollToStory(1100, anchors)).toBeCloseTo(0.28);
    expect(mapScrollToStory(9999, anchors)).toBe(1);
    expect(mapScrollToStory(-50, anchors)).toBe(0);
    expect(mapScrollToStory(100, [])).toBe(0);
    expect(mapScrollToStory(NaN, anchors)).toBe(0);
  });
});
