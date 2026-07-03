// Dependency-free gallery lightbox built on <dialog>.
// Arrow keys / buttons navigate, Esc or backdrop click closes.

function initLightbox() {
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  const img = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const counter = document.getElementById('lb-counter');
  if (!dialog || !img || !counter || dialog.dataset.lbInit) return;
  dialog.dataset.lbInit = '1';

  const items = Array.from(document.querySelectorAll<HTMLElement>('.gallery-item'));
  // Use the largest generated source for the lightbox
  const sources = items.map((btn) => {
    const thumb = btn.querySelector('img');
    if (!thumb) return '';
    const srcset = thumb.getAttribute('srcset');
    if (srcset) {
      const candidates = srcset.split(',').map((s) => s.trim().split(' ')[0]);
      return candidates[candidates.length - 1] || thumb.src;
    }
    return thumb.src;
  });

  let current = 0;

  function show(i: number) {
    current = (i + sources.length) % sources.length;
    img!.src = sources[current];
    img!.alt = `Fotka ${current + 1} z ${sources.length}`;
    counter!.textContent = `${String(current + 1).padStart(2, '0')} / ${String(sources.length).padStart(2, '0')}`;
  }

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      show(i);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    dialog!.close();
  }

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  document.getElementById('lb-close')?.addEventListener('click', close);
  document.getElementById('lb-prev')?.addEventListener('click', () => show(current - 1));
  document.getElementById('lb-next')?.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === document.getElementById('lightbox-surface')) close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });
}

initLightbox();
document.addEventListener('astro:page-load', initLightbox);
