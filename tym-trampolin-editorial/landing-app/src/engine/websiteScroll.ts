import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { EvolutionStore } from "./store";
import { mapScrollToStory, STORY_STOPS } from "./story";

gsap.registerPlugin(ScrollTrigger);

export function useWebsiteScroll(
  section: RefObject<HTMLElement | null>,
  store: EvolutionStore,
  enabled: boolean,
) {
  useEffect(() => {
    const element = section.current;
    if (!enabled || !element) return;
    let anchors: Array<{ scroll: number; progress: number }> = [];
    const measure = () => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      anchors = STORY_STOPS.flatMap((chapter) => {
        const target = element.querySelector<HTMLElement>(
          `[data-chapter="${chapter.id}"]`,
        );
        return target
          ? [
              {
                scroll: Math.min(
                  max,
                  Math.max(
                    0,
                    target.getBoundingClientRect().top + window.scrollY,
                  ),
                ),
                progress: chapter.progress,
              },
            ]
          : [];
      });
      // Read the team at rest. Ignition and launch get an unobstructed runway
      // after its photograph and profiles, rather than disappearing behind them.
      const runway = element.querySelector<HTMLElement>("[data-launch-runway]");
      const future = anchors.findIndex((anchor) => anchor.progress === 0.96);
      if (runway && future > 0) {
        const start = runway.getBoundingClientRect().top + window.scrollY;
        if (
          start > anchors[future - 1].scroll &&
          start < anchors[future].scroll
        ) {
          anchors.splice(future, 0, { scroll: start, progress: 0.77 });
        }
      }
      // Finish the reserved finale within the document, after its chapter anchor.
      if (anchors.length && max > anchors[anchors.length - 1].scroll)
        anchors.push({ scroll: max, progress: 1 });
    };
    const update = () =>
      store.setScrollProgress(mapScrollToStory(window.scrollY, anchors));
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onRefresh: update,
        onUpdate: update,
      });
    }, element);
    measure();
    update();
    let frame = 0;
    const refresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        ScrollTrigger.refresh();
        update();
      });
    };
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(element);
    window.addEventListener("pageshow", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pageshow", update);
      context.revert();
    };
  }, [section, store, enabled]);
}
