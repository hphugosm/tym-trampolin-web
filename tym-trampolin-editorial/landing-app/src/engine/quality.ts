export interface QualityProfile {
  label: string;
  fragments: number;
  maxDpr: number;
  surface: 'standard' | 'low';
}

export function chooseQuality(): QualityProfile {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const low = matchMedia('(max-width: 760px)').matches || navigator.hardwareConcurrency <= 4 || (memory !== undefined && memory <= 4);
  return low
    ? { label: 'Úsporná', fragments: 24, maxDpr: 1, surface: 'low' }
    : { label: 'Standard', fragments: 48, maxDpr: 1.5, surface: 'standard' };
}

let webglAvailable: boolean | undefined;
export function supportsWebGL2(): boolean {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    webglAvailable = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglAvailable = false;
  }
  return webglAvailable;
}
