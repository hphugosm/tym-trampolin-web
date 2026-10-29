import { useEffect, useId, useRef } from "react";
import "./heroContours.css";

const paths = Array.from({ length: 39 }, (_, index) => {
  const t = index / 38;
  const baseline = 26 + t * 748;
  const envelope = Math.sin(Math.PI * t) ** 0.75;
  const points = Array.from({ length: 101 }, (_, sample) => {
    const x = sample * 10;
    const bend =
      -92 * Math.exp(-(((x - (270 + t * 160)) / 140) ** 2)) +
      132 * Math.exp(-(((x - (570 - t * 130)) / 145) ** 2)) -
      65 * Math.exp(-(((x - (820 - t * 80)) / 120) ** 2));
    return `${sample ? "L" : "M"}${x.toFixed(1)},${(baseline + envelope * bend).toFixed(2)}`;
  }).join(" ");
  return <path key={index} d={points} strokeWidth={2.8 + t * 7.4} />;
});

/** A poster-like field: deterministic contours, with a clear space for the stone. */
export function HeroContours() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      // Let the original mesh leave its opening position without crossing the field.
      const visibility = preference.matches ? 1 : Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.22)) ** 1.5;
      host.current?.style.setProperty("--field-visible", String(visibility));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, []);
  const id = useId().replace(/:/g, "");
  const aperture = `hero-aperture-${id}`;
  const mask = `hero-mask-${id}`;
  return (
    <div ref={host} className="hero-contours" aria-hidden="true">
      <svg viewBox="0 0 1000 800" preserveAspectRatio="none" focusable="false">
        <defs>
          <radialGradient id={aperture}>
            <stop offset="0%" stopColor="black" />
            <stop offset="80%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="800">
            <rect width="1000" height="800" fill="white" />
            <ellipse cx="500" cy="340" rx="320" ry="360" fill={`url(#${aperture})`} />
          </mask>
        </defs>
        <g fill="none" stroke="currentColor" strokeLinecap="butt" mask={`url(#${mask})`}>
          {paths}
        </g>
      </svg>
    </div>
  );
}
