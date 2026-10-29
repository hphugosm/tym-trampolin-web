import {esc, tx} from './shared.mjs';

export function archiveHero(key,l,eyebrow,title,description) {
  if(key === 'gallery') return `<section class="archive-opening gallery-opening"><div class="wrap"><div class="micro">${esc(eyebrow)}</div><h1>${esc(title)}</h1><div class="gallery-opening-bottom"><p>${esc(description)}</p><figure><img src="/assets/gallery/01-800.webp" srcset="/assets/gallery/01-480.webp 480w, /assets/gallery/01-800.webp 800w, /assets/gallery/01-1200.webp 1200w" sizes="(max-width: 760px) 50vw, (max-width: 1739px) 37vw, 600px" decoding="async" alt="${tx(l,'Řečníci na pódiu finále DemocraTIConu','Speakers on stage at the DemocraTICon final')}" width="1500" height="2000"><figcaption class="micro">DEMOCRATICON / OLOMOUC / 2026</figcaption></figure><span class="archive-total" aria-hidden="true">15<small>↙</small></span></div></div></section>`;
  if(key === 'music') {
    const grooves = Array.from({length:24},(_,i)=>`<circle cx="240" cy="240" r="${100+i*5.4}"/>`).join('');
    return `<section class="archive-opening record-opening"><div class="wrap"><div class="record-copy"><div class="micro">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p><a class="text-link" href="#tracks">${tx(l,'Deset podob jedné hymny','Ten versions of one anthem')} <span aria-hidden="true">↓</span></a></div><div class="record-sleeve" aria-hidden="true"><div class="record-disc"><svg viewBox="0 0 480 480" focusable="false"><g fill="none" stroke="currentColor" stroke-width=".65">${grooves}</g></svg><span>TT<br>VOL.01<small>2026</small></span></div><div class="record-corner">10<br>TRACKS</div></div></div></section>`;
  }
  return null;
}
