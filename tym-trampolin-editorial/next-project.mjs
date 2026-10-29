import {projects,esc,tx,url,visual} from './shared.mjs';

export function nextProject(current,l){
 const index=projects.findIndex(p=>p.id===current.id), next=projects[(index+1)%projects.length];
 return `<section class="next-project" aria-labelledby="next-project-title"><a class="next-project-link" href="${url(l,'projects',next.id)}"><div class="next-project-copy"><span class="micro">${tx(l,'POKRAČUJTE V OBJEVOVÁNÍ','KEEP EXPLORING')} / ${String((index+1)%projects.length+1).padStart(2,'0')}</span><h2 id="next-project-title">${tx(l,'DALŠÍ<br>SKOK.','THE NEXT<br>LEAP.')}<span aria-hidden="true">↗</span></h2><strong>${esc(next.text[l].title)}</strong><span class="next-project-category">${esc(next.text[l].category)}</span></div><div class="next-project-art">${visual(next,l)}</div></a><a class="next-project-all" href="${url(l,'projects')}">${tx(l,'Zpět na všechny projekty','Back to all projects')} <span aria-hidden="true">↗</span></a></section>`;
}
