import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/** Editorial entrances are independent of the scrubbed 3D timeline. */
export function useChapterReveal(
  root: RefObject<HTMLElement | null>,
  reduced: boolean,
) {
  useEffect(() => {
    const main = root.current;
    if (reduced || !main || !("IntersectionObserver" in window)) return;
    const scope = main.closest<HTMLElement>(".website") ?? main;
    const masks: HTMLElement[] = [];
    const timelines = new Map<Element, gsap.core.Timeline>();
    // Ordinary spaces preserve natural speech/copying; semantic headings stay intact.
    const wrapWords = (heading: HTMLElement) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      for (const node of nodes) {
        const fragment = document.createDocumentFragment();
        for (const part of (node.textContent ?? "").split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part))
            fragment.append(document.createTextNode(part));
          else {
            const mask = document.createElement("span");
            const word = document.createElement("span");
            mask.className = "motion-word-mask";
            word.className = "motion-word";
            word.textContent = part;
            mask.append(word);
            fragment.append(mask);
            masks.push(mask);
          }
        }
        node.replaceWith(fragment);
      }
    };
    const context = gsap.context(() => {
      scope
        .querySelectorAll<HTMLElement>(
          ".chapter-lead h1, .chapter-lead h2, .launch-copy",
        )
        .forEach(wrapWords);
      const groups = scope.querySelectorAll<HTMLElement>(
        ".chapter-lead, .result, .person, .team-photo, .team-photo-caption, .launch-runway, .finale, .footer-top, .footer-bottom",
      );
      for (const group of groups) {
        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });
        const words = group.querySelectorAll(".motion-word");
        if (words.length) {
          const eyebrow = group.querySelector(".eyebrow");
          if (eyebrow)
            timeline.from(eyebrow, { opacity: 0, y: 10, duration: 0.48 }, 0);
          timeline.from(
            words,
            {
              yPercent: 112,
              rotate: 2.5,
              duration: 0.76,
              stagger: { amount: 0.15 },
              transformOrigin: "0% 100%",
            },
            0.055,
          );
          const supporting = group.querySelectorAll(
            ".lead-description, .quiet-copy, .actions, :scope > .primary-link, :scope > span.eyebrow",
          );
          if (supporting.length)
            timeline.from(
              supporting,
              {
                opacity: 0,
                y: 16,
                duration: 0.58,
                stagger: 0.055,
              },
              0.2,
            );
        } else {
          const items = group.matches(".team-photo")
            ? [group]
            : Array.from(group.children);
          if (items.length)
            timeline.from(
              items,
              {
                opacity: 0,
                y: group.matches(".result, .person") ? 22 : 14,
                duration: 0.65,
                stagger: { amount: 0.14 },
              },
              0,
            );
        }
        if (group.matches(".result, .person, .finale, .footer-top")) {
          group.classList.add("motion-rule");
          timeline.fromTo(
            group,
            { "--rule-progress": 0 },
            {
              "--rule-progress": 1,
              duration: 0.9,
              ease: "power2.inOut",
            },
            0,
          );
        }
        timelines.set(group, timeline);
      }
      const header = scope.querySelector(".header");
      if (header)
        gsap.from(Array.from(header.children), {
          opacity: 0,
          y: -9,
          duration: 0.6,
          stagger: 0.045,
          ease: "power3.out",
          delay: 0.08,
        });
    }, scope);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          timelines.get(entry.target)?.play();
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.03 },
    );
    for (const group of timelines.keys()) observer.observe(group);
    // Keyboard navigation immediately exposes the focused content.
    const revealFocused = (event: FocusEvent) => {
      for (const [group, timeline] of timelines) {
        if (group.contains(event.target as Node)) timeline.progress(1);
      }
    };
    scope.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      scope.removeEventListener("focusin", revealFocused);
      context.revert();
      for (const group of timelines.keys())
        group.classList.remove("motion-rule");
      for (const mask of masks)
        mask.replaceWith(document.createTextNode(mask.textContent ?? ""));
      scope
        .querySelectorAll("h1, h2, .launch-copy")
        .forEach((heading) => heading.normalize());
    };
  }, [root, reduced]);
}
