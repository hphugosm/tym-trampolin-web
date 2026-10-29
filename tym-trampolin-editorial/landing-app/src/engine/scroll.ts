import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { EvolutionStore } from './store';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTimeline(section: RefObject<HTMLElement | null>, store: EvolutionStore, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !section.current) return;
    const playhead = { progress: 0 };
    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }).to(playhead, {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => store.setScrollProgress(playhead.progress),
      });
    }, section);
    // Refresh also covers browser-restored scroll positions, without snapping to zero.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      context.revert();
    };
  }, [section, store, enabled]);
}
