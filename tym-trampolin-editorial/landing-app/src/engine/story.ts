import { clampProgress, evaluateEvolution, smoothstep } from "./timeline";

export const STORY_STOPS = [
  { id: "hero", label: "Začátek", progress: 0 },
  { id: "about", label: "O nás", progress: 0.18 },
  { id: "projects", label: "Projekty", progress: 0.38 },
  { id: "results", label: "Výsledky", progress: 0.56 },
  { id: "team", label: "Tým", progress: 0.77 },
  { id: "future", label: "Budoucnost", progress: 0.96 },
] as const;
export const CHAPTERS = STORY_STOPS;
export type StoryPhase =
  | "stone"
  | "gear"
  | "bulb"
  | "chip"
  | "rocket"
  | "finale";
export interface StoryState {
  progress: number;
  phase: StoryPhase;
  from: number;
  to: number;
  mix: number;
  stoneProgress: number;
  x: number;
  y: number;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  stoneStrength: number;
  metalness: number;
  roughness: number;
  emissive: number;
  ignition: number;
  launch: number;
  finale: number;
}
const transitions = [
  [0.035, 0.18],
  [0.23, 0.38],
  [0.42, 0.56],
  [0.61, 0.77],
] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Every geometric and spatial channel depends solely on scroll, never on frame time. */
export function evaluateStory(progress: number): StoryState {
  const p = clampProgress(progress);
  let from = 0;
  while (from < 3 && p >= transitions[from][1]) from++;
  if (p >= 0.77) from = 4;
  const to = Math.min(4, from + 1);
  const mix =
    from === 4 ? 0 : smoothstep(transitions[from][0], transitions[from][1], p);
  const stage = from + mix;
  const positions = [0.23, -0.23, 0.23, -0.23, 0.23];
  const tilts = [0.08, -0.1, 0.09, -0.08, -0.12];
  const yaw = [-0.25, -0.2, 0.28, -0.25, 0.16];
  const stoneProgress = smoothstep(0.035, 0.18, p);
  const stone = evaluateEvolution(stoneProgress);
  // Keep the original mineral-to-metal response, then evolve into frosted glass,
  // a ceramic chip package and painted rocket metal without swapping materials.
  const metalness = [0.02, 0.86, 0.06, 0.35, 0.24];
  const roughness = [0.9, 0.25, 0.45, 0.55, 0.42];
  const straighten = smoothstep(0.77, 0.82, p);
  const launch = smoothstep(0.85, 0.94, p);
  return {
    progress: p,
    phase:
      p < 0.18
        ? "stone"
        : p < 0.38
          ? "gear"
          : p < 0.56
            ? "bulb"
            : p < 0.77
              ? "chip"
              : p < 0.94
                ? "rocket"
                : "finale",
    from,
    to,
    mix,
    stoneProgress,
    x: lerp(
      lerp(positions[from], positions[to], mix),
      0,
      smoothstep(0.78, 0.85, p),
    ),
    // Positive Y is upward in the scene. The launch clears even a tall mobile viewport.
    y: Math.sin(mix * Math.PI) * 0.055 + launch * 1.45,
    scale: lerp(lerp(0.98, 1.08, Math.min(stage, 1)), 0.7, launch),
    rotationX: lerp(0.18 - Math.min(stage, 1) * 0.06, 0, straighten),
    rotationY: lerp(lerp(yaw[from], yaw[to], mix), 0, straighten),
    rotationZ: lerp(lerp(tilts[from], tilts[to], mix), 0, straighten),
    stoneStrength: 1 - stone.teeth,
    metalness:
      from === 0 ? stone.metalness : lerp(metalness[from], metalness[to], mix),
    roughness:
      from === 0 ? stone.roughness : lerp(roughness[from], roughness[to], mix),
    emissive: smoothstep(0.3, 0.38, p) * (1 - smoothstep(0.42, 0.53, p)),
    ignition: smoothstep(0.81, 0.86, p) * (1 - smoothstep(0.94, 0.98, p)),
    launch,
    finale: smoothstep(0.94, 0.99, p),
  };
}

/** Piecewise mapping keeps native section anchors and the story's authored beats aligned. */
export function mapScrollToStory(
  scroll: number,
  anchors: ReadonlyArray<{ scroll: number; progress: number }>,
): number {
  if (!Number.isFinite(scroll) || anchors.length === 0) return 0;
  if (scroll <= anchors[0].scroll) return clampProgress(anchors[0].progress);
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    if (scroll <= b.scroll) {
      const t =
        b.scroll > a.scroll
          ? clampProgress((scroll - a.scroll) / (b.scroll - a.scroll))
          : 1;
      return clampProgress(lerp(a.progress, b.progress, t));
    }
  }
  return clampProgress(anchors[anchors.length - 1].progress);
}
