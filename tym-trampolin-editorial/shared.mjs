import {projects, contact, brand, ui, pageCopy} from './reference/site.ts';
import {projectArtwork} from './project-art.mjs';
import {articleSlug} from './article-routes.mjs';
export {projects, contact, brand, ui, pageCopy};
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tx = (l,cs,en) => l === 'cs' ? cs : en;
const slugs = {projects:['projects','projekty'],about:['about','o-nas'],members:['team','tym'],journey:['journey','nase-cesta'],collaborate:['collaborate','spoluprace'],gallery:['gallery','galerie'],music:['music','hudba'],blog:['blog','blog'],privacy:['privacy','soukromi'],cookies:['cookies','cookies'],accessibility:['accessibility','pristupnost']};
export const url = (l,key='home',id) => (l==='cs'?'/cs/':'/') + (key==='home'?'':(slugs[key]?.[l==='cs'?1:0]??key)+'/') + (id?(key==='blog'?articleSlug(l,id):id)+'/':'');
export const arrow = '<span aria-hidden="true">↗</span>';
export function visual(p,l='cs') {
 return `<div class="project-visual project-poster">${projectArtwork(p.id,l)}</div>`;
}
export function projectCard(p,l='cs',i=0) {const t=p.text[l];return `<article class="project-card" data-project="${p.id}" data-category="${p.id==='clearmessage'?'ai':p.id==='ai-radio'?'ai':p.id==='real-estate-video'?'creative':p.id==='doom-bounce'?'games':'web'}"><a href="${url(l,'projects',p.id)}" aria-label="${esc(t.title)}">${visual(p,l)}<div class="card-meta micro"><span class="project-order">${String(i+1).padStart(2,'0')}</span><span>${esc(t.category)}</span><span>${p.year}</span></div><h3>${esc(t.title)} ${arrow}</h3><p>${esc(t.summary)}</p><span class="card-status">${esc(t.status)}</span></a></article>`;}
export const sectionHead = (num,title,text='')=>`<div class="section-head"><span class="micro">${num}</span><h2>${title}</h2>${text?`<p>${text}</p>`:''}</div>`;
