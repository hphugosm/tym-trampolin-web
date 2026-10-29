export interface SceneCapabilities {
  mobile: boolean;
  cores?: number;
  memory?: number;
  saveData?: boolean;
  effectiveType?: string;
}

/** Missing browser hints are not evidence of a slow device (notably iOS). */
export function shouldUseStaticScene(hints: SceneCapabilities): boolean {
  return Boolean(
    hints.saveData ||
      hints.effectiveType === "slow-2g" ||
      hints.effectiveType === "2g" ||
      (hints.mobile &&
        ((hints.cores !== undefined && hints.cores > 0 && hints.cores <= 2) ||
          (hints.memory !== undefined && hints.memory > 0 && hints.memory <= 2))),
  );
}

export interface ConnectionHints extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
}
export function getConnectionHints(): ConnectionHints | undefined {
  return (navigator as Navigator & { connection?: ConnectionHints }).connection;
}
export function readSceneCapabilities(): SceneCapabilities {
  return {
    mobile: matchMedia("(max-width: 760px), (pointer: coarse)").matches,
    cores: navigator.hardwareConcurrency,
    memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    saveData: getConnectionHints()?.saveData,
    effectiveType: getConnectionHints()?.effectiveType,
  };
}
