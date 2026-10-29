import { useEffect, useRef } from "react";

/** Safari may restore scroll after React's first paint. Retry only during startup,
 * and yield immediately to any navigation or physical interaction. */
export function useInitialAnchorRestore(layoutReady: boolean) {
  const initialHash = useRef(window.location.hash);
  const scheduleRestore = useRef<(() => void) | null>(null);
  useEffect(() => {
    const hash = initialHash.current;
    if (!hash) return;
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    if (!id || !document.getElementById(id)) return;
    let stopped = false;
    let frame = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const restore = () => {
      if (stopped || window.location.hash !== hash) return;
      const target = document.getElementById(id);
      if (!target) return;
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const desired = Math.min(max, Math.max(0, target.getBoundingClientRect().top + scrollY));
      if (Math.abs(scrollY - desired) > 2)
        target.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const schedule = () => {
      if (stopped) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(restore);
      });
    };
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      scheduleRestore.current = null;
      window.removeEventListener("load", schedule);
      window.removeEventListener("pageshow", pageShow);
      window.removeEventListener("hashchange", stop);
      window.removeEventListener("pointerdown", stop, true);
      window.removeEventListener("touchstart", stop, true);
      window.removeEventListener("wheel", stop, true);
      window.removeEventListener("keydown", stop, true);
    };
    const pageShow = (event: PageTransitionEvent) => {
      // A bfcache return owns its saved position, rather than the original hash.
      if (event.persisted) stop();
      else schedule();
    };
    scheduleRestore.current = schedule;
    window.addEventListener("load", schedule);
    window.addEventListener("pageshow", pageShow);
    window.addEventListener("hashchange", stop);
    window.addEventListener("pointerdown", stop, { capture: true, passive: true });
    window.addEventListener("touchstart", stop, { capture: true, passive: true });
    window.addEventListener("wheel", stop, { capture: true, passive: true });
    window.addEventListener("keydown", stop, true);
    // Late history restoration and image/font layout each have a bounded chance
    // to settle. No scroll listener or perpetual polling is installed.
    schedule();
    for (const delay of [120, 500, 1400, 2600])
      timers.push(setTimeout(schedule, delay));
    timers.push(setTimeout(stop, 3500));
    void document.fonts?.ready.then(schedule);
    return stop;
  }, []);
  useEffect(() => {
    if (layoutReady) scheduleRestore.current?.();
  }, [layoutReady]);
}
