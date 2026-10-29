const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function initMotion() {
  const main = document.querySelector('main');
  if (!main || !('IntersectionObserver' in window)) return;

  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const compact = window.matchMedia('(max-width: 760px)');
  const targets = new Map();
  const add = (selector, kind = 'rise') => {
    document.querySelectorAll(selector).forEach(node => {
      if (!node.closest('dialog, .shake-challenge-controls, .track-row audio')) targets.set(node, kind);
    });
  };

  // Animate the designed line breaks, without splitting or duplicating readable text.
  add('.exp-collaborate h1 > [aria-hidden] > span, .exp-blog h1 > [aria-hidden] > span', 'title');
  add('.exp-projects h1, .exp-about h1, .exp-journey h1, .exp-article h1, .archive-opening h1, .case-hero h1, .cs-heading h1, .dc-hero h1', 'title');
  add('.exp-description, .exp-count, .exp-year, .exp-blog-index, .case-caption, .record-copy > p');
  add('.exp-photo-main, .exp-photo-small', 'fade');
  add('.record-sleeve, .gallery-opening-bottom figure', 'print');
  add('.project-card, .team-grid > article, .gallery-shot', 'print');
  add('.timeline-chapter, body[data-page="collaborate"] .contact-areas > article', 'side');
  add('.section-head, .media-list > a, .detail-story > section, .detail-note, .study-list > article');
  add('.about-grid > img, .about-grid > div, .blog-feature > div, .archive-links > a');
  add('.resource-title, .contact-band h2, .contact-band > .wrap > p, .contact-actions, .contact-social');
  add('.cs-intro, .cs-filmstrip, .cs-browser, .cs-learning-photo, .cs-message-note, .cs-vinyl', 'print');
  add('.cs-production > article, .cs-learning-paths > article, .cs-message-observations > article, .cs-process > div, .collab-choice', 'side');
  add('.cs-radio-console, .dc-brief-grid, .dc-boss-heading, .dc-play-grid, .next-project-copy');
  add('.album-art, .album-download > *, .track-row, .footer-invite');
  add('.article-body > p, .shake-section-heading, .shake-chart, .shake-sources > h2');

  // One reveal layer per branch: a card can contain controls, but never another reveal.
  for (const node of [...targets.keys()]) {
    if ([...targets.keys()].some(parent => parent !== node && parent.contains(node))) targets.delete(node);
  }
  const revealNodes = [...targets.keys()];
  revealNodes.forEach((node, index) => {
    node.dataset.reveal = targets.get(node);
    const siblings = [...node.parentElement.children].filter(child => targets.has(child));
    const order = siblings.indexOf(node);
    node.style.setProperty('--reveal-delay', `${Math.min(order, 3) * 80}ms`);
    if (node.dataset.reveal === 'side') node.style.setProperty('--reveal-x', `${index % 2 ? -26 : 26}px`);
  });

  const drift = [];
  const addDrift = (selector, distance, rotation = 0) => {
    document.querySelectorAll(selector).forEach(node => {
      node.dataset.drift = '';
      drift.push({node, distance, rotation, top: 0, height: 1, y: 0});
    });
  };
  addDrift('.exp-projects-field .page-field, .exp-collaborate-field .page-field', 24, 1.5);
  addDrift('.exp-photo-main', -17, .8);
  addDrift('.exp-photo-small', 22, -1.1);
  addDrift('.exp-plus, .exp-blog-asterisk', -13, 16);
  addDrift('.exp-year > span:nth-child(2)', 20);
  addDrift('.record-disc', 0, 24);
  const timeline = document.querySelector('.timeline-list');

  let observer;
  let frame = 0;
  let measure = true;
  let active = false;
  let timelineTop = 0;
  let timelineHeight = 1;
  const reveal = node => {
    if (node.classList.contains('is-revealed')) return;
    node.classList.add('is-entering', 'is-revealed');
    observer?.unobserve(node);
  };
  const finish = event => {
    if (event.target.hasAttribute?.('data-reveal')) event.target.classList.remove('is-entering');
  };
  main.addEventListener('transitionend', finish);
  document.querySelector('footer')?.addEventListener('transitionend', finish);

  const paint = () => {
    frame = 0;
    if (!active || document.hidden) return;
    const scroll = window.scrollY;
    const viewport = window.innerHeight;
    const parallax = fine.matches && !compact.matches;
    if (measure) {
      // Batch geometry reads before any style writes.
      drift.forEach(item => {
        const box = item.node.getBoundingClientRect();
        item.top = box.top + scroll - item.y;
        item.height = box.height;
      });
      if (timeline) {
        const box = timeline.getBoundingClientRect();
        timelineTop = box.top + scroll;
        timelineHeight = box.height;
      }
      measure = false;
    }
    drift.forEach(item => {
      const top = item.top - scroll;
      const nearby = parallax && top < viewport * 1.2 && top + item.height > -viewport * .2;
      item.node.classList.toggle('is-drifting', nearby);
      if (!nearby && parallax) return;
      const progress = nearby ? clamp((viewport * .5 - top - item.height * .5) / (viewport * .5 + item.height * .5), -1, 1) : 0;
      item.y = progress * item.distance;
      item.node.style.setProperty('--drift-y', `${item.y.toFixed(2)}px`);
      item.node.style.setProperty('--drift-turn', `${(progress * item.rotation).toFixed(2)}deg`);
    });
    if (timeline) timeline.style.setProperty('--timeline-progress', clamp((scroll + viewport * .72 - timelineTop) / timelineHeight).toFixed(4));
  };
  const schedule = () => {
    // Mobile keeps cheap one-shot reveals, without a scroll-driven animation loop.
    if (active && fine.matches && !compact.matches && !frame) frame = requestAnimationFrame(paint);
  };
  const refresh = () => {
    measure = true;
    if (!fine.matches || compact.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      drift.forEach(item => {
        item.y = 0;
        item.node.classList.remove('is-drifting');
        item.node.style.removeProperty('--drift-y');
        item.node.style.removeProperty('--drift-turn');
      });
      timeline?.style.setProperty('--timeline-progress', '1');
      return;
    }
    schedule();
  };

  const stop = () => {
    active = false;
    cancelAnimationFrame(frame);
    frame = 0;
    observer?.disconnect();
    body.dataset.motion = 'off';
    revealNodes.forEach(node => node.classList.remove('is-entering'));
    drift.forEach(({node}) => {
      node.classList.remove('is-drifting');
      node.style.removeProperty('--drift-y');
      node.style.removeProperty('--drift-turn');
    });
  };
  const start = () => {
    stop();
    if (reduced.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, {threshold: 0, rootMargin: '0px 0px -7% 0px'});
    // Restored pages and late-loaded scripts keep already-seen content immediately visible.
    const late = performance.now() > 1500 || window.scrollY > 0;
    revealNodes.forEach(node => {
      if (late && node.getBoundingClientRect().top < window.innerHeight) node.classList.add('is-revealed');
      if (!node.classList.contains('is-revealed')) observer.observe(node);
    });
    body.dataset.motion = 'on';
    active = true;
    refresh();
  };

  // Focusing an animated item must never require waiting for an animation to finish.
  document.addEventListener('focusin', event => {
    event.target.closest?.('[data-reveal]')?.classList.add('is-revealed', 'motion-immediate');
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (!id) return;
    try {
      const target = document.getElementById(decodeURIComponent(id));
      target?.closest('[data-reveal]')?.classList.add('is-revealed', 'motion-immediate');
    } catch { /* Malformed fragments still leave all ordinary page content available. */ }
    refresh();
  });
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', refresh, {passive:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  reduced.addEventListener('change', start);
  fine.addEventListener('change', refresh);
  compact.addEventListener('change', refresh);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  window.addEventListener('pagehide', stop);
  main.addEventListener('load', refresh, true);
  const resize = 'ResizeObserver' in window ? new ResizeObserver(refresh) : null;
  resize?.observe(main);
  document.fonts?.ready.then(refresh);
  // Filtering is synchronous in app.js; react afterwards without touching its hidden state.
  main.addEventListener('click', event => {
    if (!event.target.closest('[data-filter]')) return;
    document.querySelectorAll('.project-card:not([hidden])').forEach(node => reveal(node));
    refresh();
  });

  try { start(); }
  catch { stop(); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion, {once:true});
else initMotion();
