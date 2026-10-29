const variants = ['projects', 'about', 'journey', 'blog', 'collaborate', 'gallery', 'music'];

export function contourField(key) {
  const variant = Math.max(0, variants.indexOf(key));
  const lines = Array.from({length: 31}, (_, i) => {
    const t = i / 30;
    const envelope = Math.sin(Math.PI * t) ** .8;
    const points = Array.from({length: 81}, (_, j) => {
      const x = j * 10;
      const bend = -85 * Math.exp(-(((x - (205 + t * 150 + variant * 12)) / 130) ** 2))
        + 105 * Math.exp(-(((x - (460 - t * 110)) / 135) ** 2))
        - 50 * Math.exp(-(((x - (690 - t * 60)) / 105) ** 2));
      return `${j ? 'L' : 'M'}${x},${(18 + t * 464 + envelope * bend).toFixed(2)}`;
    }).join(' ');
    return `<path d="${points}" stroke-width="${(1.7 + t * 4.4).toFixed(2)}"/>`;
  }).join('');
  return `<div class="page-field" aria-hidden="true"><svg viewBox="0 0 800 500" preserveAspectRatio="none" focusable="false"><g fill="none" stroke="currentColor">${lines}</g></svg></div>`;
}
