const locale=document.body.dataset.locale;
const menu=document.querySelector('.menu-toggle'),mobile=document.querySelector('#mobile-menu');
const updateMenuLabel=open=>{const label=menu?.querySelector('[data-menu-label]');if(label)label.textContent=open?(locale==='cs'?'Zavřít −':'Close −'):'Menu +';};
function closeMenu(){if(!menu)return;updateMenuLabel(false);menu.setAttribute('aria-expanded','false');mobile.hidden=true;document.body.classList.remove('menu-open');document.querySelector('main').inert=false;document.querySelector('footer').inert=false;menu.setAttribute('aria-label',locale==='cs'?'Otevřít menu':'Open menu');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));updateMenuLabel(open);mobile.hidden=!open;document.body.classList.toggle('menu-open',open);document.querySelector('main').inert=open;document.querySelector('footer').inert=open;menu.setAttribute('aria-label',open?(locale==='cs'?'Zavřít menu':'Close menu'):(locale==='cs'?'Otevřít menu':'Open menu'));if(open)mobile.querySelector('a')?.focus();});
mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(other=>{const active=other===b;other.setAttribute('aria-pressed',String(active));other.classList.toggle('active',active);});let count=0;document.querySelectorAll('.project-card[data-category]').forEach(card=>{card.hidden=b.dataset.filter!=='all'&&card.dataset.category!==b.dataset.filter;if(!card.hidden)count++;});const status=document.querySelector('[data-filter-count]');if(status)status.textContent=locale==='cs'?`Zobrazené projekty: ${count}`:`Projects shown: ${count}`;}));
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const value=b.dataset.copy||'team@tymtrampolin.cz';try{await navigator.clipboard.writeText(value);const previous=b.textContent;b.textContent=locale==='cs'?'Zkopírováno ✓':'Copied ✓';setTimeout(()=>b.textContent=previous,2200);}catch{b.textContent=value;}}));
const dialog=document.querySelector('#lightbox'),photos=[...document.querySelectorAll('[data-lightbox]')];let photoIndex=0,lastPhoto;
function showPhoto(i){photoIndex=(i+photos.length)%photos.length;const p=photos[photoIndex],img=p.querySelector('img');dialog.querySelector('figure img').src=p.dataset.lightbox||img.src;dialog.querySelector('figure img').alt=img?.alt||p.dataset.alt||'';dialog.querySelector('figcaption').textContent=p.dataset.caption||img?.alt||'';dialog.querySelector('[data-lightbox-count]').textContent=`${String(photoIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;}
photos.forEach((p,i)=>p.addEventListener('click',()=>{lastPhoto=p;showPhoto(i);dialog.showModal();document.body.style.overflow='hidden';}));
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click',()=>dialog.close());
dialog?.querySelector('[data-lightbox-prev]')?.addEventListener('click',()=>showPhoto(photoIndex-1));
dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click',()=>showPhoto(photoIndex+1));
dialog?.addEventListener('close',()=>{document.body.style.overflow='';lastPhoto?.focus();});
dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}});
document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(other=>{if(other!==a)other.pause();})));

document.addEventListener('keydown',e=>{if(e.key!=='Tab'||menu?.getAttribute('aria-expanded')!=='true')return;const focusables=[menu,...mobile.querySelectorAll('a')],first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});

// Clipboard enhancement stays local: these are only the public, prewritten briefs.
document.querySelectorAll('[data-copy-message]').forEach(button=>{
 const choice=button.closest('.collab-choice');
 const text=choice?.querySelector('[data-copy-message-text]');
 const fallback=choice?.querySelector('[data-copy-message-fallback]');
 const status=choice?.querySelector('[data-copy-message-status]');
 const select=choice?.querySelector('[data-select-message]');
 if(!text||!fallback||!status||!select)return;
 select.addEventListener('click',()=>{text.focus();text.select();text.setSelectionRange(0,text.value.length);});
 button.addEventListener('click',async()=>{
  button.disabled=true;
  status.textContent='';
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(text.value);
   fallback.hidden=true;
   status.textContent=locale==='cs'?'Celá zpráva včetně adresy a předmětu je zkopírovaná. Vložte ji do svého e-mailu.':'The complete message, address, and subject are copied. Paste them into your email.';
  }catch{
   fallback.hidden=false;
   status.textContent=locale==='cs'?'Zprávu se nepodařilo zkopírovat. Text je připravený níže pro ruční zkopírování.':'The message could not be copied. The text is available below for manual copying.';
   text.focus();
   text.select();
   text.setSelectionRange(0,text.value.length);
  }finally{button.disabled=false;}
 });
 button.hidden=false;
});
