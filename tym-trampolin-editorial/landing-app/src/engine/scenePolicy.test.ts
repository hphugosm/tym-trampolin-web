import { describe, expect, it } from "vitest";
import { shouldUseStaticScene } from "./scenePolicy";

describe("landing 3D capability policy", () => {
  it("keeps 3D on capable phones, ordinary desktops and browsers without optional hints", () => {
    for (const hints of [
      { mobile: true, cores: 8, memory: 8 },
      { mobile: true, cores: 4, memory: 4 },
      { mobile: true },
      { mobile: false, cores: 2, memory: 2 },
      { mobile: true, cores: 0, memory: 0 },
    ]) expect(shouldUseStaticScene(hints)).toBe(false);
  });
  it("avoids GPU setup for mobile devices reporting a small CPU or memory budget", () => {
    expect(shouldUseStaticScene({ mobile: true, cores: 2 })).toBe(true);
    expect(shouldUseStaticScene({ mobile: true, cores: 8, memory: 2 })).toBe(true);
  });
  it("respects data saver on any viewport and avoids the 3D chunk on a 2G link", () => {
    expect(shouldUseStaticScene({ mobile: false, saveData: true })).toBe(true);
    expect(shouldUseStaticScene({ mobile: true, effectiveType: "slow-2g" })).toBe(true);
    expect(shouldUseStaticScene({ mobile: false, effectiveType: "2g" })).toBe(true);
    expect(shouldUseStaticScene({ mobile: true, effectiveType: "4g" })).toBe(false);
  });
});
