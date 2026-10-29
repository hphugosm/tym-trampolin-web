/* Progressive enhancement: every boss file remains readable without JavaScript. */
for(const root of document.querySelectorAll('[data-doom-case]')){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const effectsButton=root.querySelector('[data-dc-effects-toggle]');
 const screens=[...root.querySelectorAll('.dc-crt-screen,.dc-boss-art')];
 let manuallyReduced=false;
 const pixels=screens.map(screen=>{
  const img=screen.querySelector('img');
  let canvas=screen.querySelector('canvas');
  if(!canvas){canvas=document.createElement('canvas');canvas.className='dc-pixel-canvas';canvas.setAttribute('aria-hidden','true');screen.append(canvas);}
  const paint=()=>{
   if(!img?.naturalWidth)return;
   const ctx=canvas.getContext('2d');
   if(!ctx)return;
   canvas.width=screen.classList.contains('dc-crt-screen')?320:192;
   canvas.height=Math.round(canvas.width*img.naturalHeight/img.naturalWidth);
   ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,canvas.width,canvas.height);
   screen.toggleAttribute('data-pixel-ready',root.dataset.dcEffects==='on');
  };
  img?.addEventListener('load',paint,{once:true});
  return {screen,paint,img};
 });
 const applyEffects=()=>{
  const off=reduced.matches||manuallyReduced;
  root.dataset.dcEffects=off?'off':'on';
  pixels.forEach(({screen,paint})=>{screen.classList.remove('is-booting');if(off)screen.removeAttribute('data-pixel-ready');else paint();});
  if(effectsButton){effectsButton.hidden=false;effectsButton.disabled=reduced.matches;effectsButton.setAttribute('aria-pressed',String(off));effectsButton.textContent=off?effectsButton.dataset.reduced:effectsButton.dataset.normal;}
 };
 effectsButton?.addEventListener('click',()=>{manuallyReduced=!manuallyReduced;applyEffects();});
 reduced.addEventListener('change',applyEffects);
 applyEffects();
 // CRT motion runs only while the screen is visible, with a single boot sequence.
 if('IntersectionObserver' in window){
  const booted=new WeakSet();
  const visible=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
   target.toggleAttribute('data-dc-visible',isIntersecting);
   if(isIntersecting&&root.dataset.dcEffects==='on'&&!booted.has(target)){
    target.classList.add('is-booting');booted.add(target);
   }
  }),{threshold:.1});
  const crtScreens=[...root.querySelectorAll('.dc-crt-screen')];
  crtScreens.forEach(screen=>{visible.observe(screen);screen.addEventListener('animationend',()=>screen.classList.remove('is-booting'));});
  window.addEventListener('pagehide',()=>{visible.disconnect();crtScreens.forEach(screen=>screen.removeAttribute('data-dc-visible'));});
  window.addEventListener('pageshow',event=>{if(event.persisted)crtScreens.forEach(screen=>visible.observe(screen));});
 }
 const selector=root.querySelector('[data-dc-selector]');
 const buttons=[...root.querySelectorAll('[data-dc-boss]')];
 const panels=[...root.querySelectorAll('[data-dc-panel]')];
 if(!selector||!buttons.length||buttons.length!==panels.length)continue;
 const select=index=>{buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panels.forEach((p,i)=>{p.hidden=i!==index;});};
 buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index)));
 selector.addEventListener('keydown',event=>{
  const current=buttons.indexOf(document.activeElement);
  if(current<0)return;
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(current+1)%buttons.length;
  if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(current+buttons.length-1)%buttons.length;
  if(event.key==='Home')next=0;
  if(event.key==='End')next=buttons.length-1;
  if(next!==undefined){event.preventDefault();buttons[next].focus();select(next);}
 });
 select(0);selector.hidden=false;
 // Deep links to a dossier must reveal the addressed file before native scrolling.
 const revealHash=()=>{const index=panels.findIndex(p=>'#'+p.id===location.hash);if(index>=0){select(index);panels[index].scrollIntoView({block:'start'});}};
 window.addEventListener('hashchange',revealHash);revealHash();
}
