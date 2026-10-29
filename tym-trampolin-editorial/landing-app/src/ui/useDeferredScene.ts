import { useEffect, useState } from "react";
import {
  getConnectionHints,
  readSceneCapabilities,
  shouldUseStaticScene,
} from "../engine/scenePolicy";

/** Wait for a painted, visible page, then use an idle window for the 3D chunk. */
export function useDeferredScene(blocked: boolean) {
  const [visible, setVisible] = useState(() => document.visibilityState !== "hidden");
  const [conserve, setConserve] = useState(() => shouldUseStaticScene(readSceneCapabilities()));
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    const visibility = () => setVisible(document.visibilityState !== "hidden");
    const hints = () => setConserve(shouldUseStaticScene(readSceneCapabilities()));
    const connection = getConnectionHints();
    document.addEventListener("visibilitychange", visibility);
    connection?.addEventListener("change", hints);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      connection?.removeEventListener("change", hints);
    };
  }, []);
  useEffect(() => {
    if (blocked || conserve || !visible || requested) return;
    let frame = 0;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if ("requestIdleCallback" in window)
          idle = window.requestIdleCallback(() => setRequested(true), { timeout: 1800 });
        else timer = setTimeout(() => setRequested(true), 250);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [blocked, conserve, visible, requested]);
  return { conserve, requested, visible };
}
