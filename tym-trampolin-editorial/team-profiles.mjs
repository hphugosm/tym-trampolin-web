import {team} from './reference/site.ts';
import {esc,tx,url} from './shared.mjs';

const initials=['HK','DV','VČ','HS'];
const contour=`<svg viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.1">${Array.from({length:16},(_,i)=>{const y=36+i*29;return `<path d="M-50 ${y}H110C205 ${y} 200 ${y-110} 296 ${y-110}S390 ${y+88} 470 ${y+88}H650"/>`;}).join('')}</g></svg>`;

/** Portrait slots are intentionally monograms until real individual photos exist. */
export function renderTeamProfiles(l='en'){
 const tr=(cs,en)=>tx(l,cs,en);
 const members=[...team,{name:'Honza Smrz',role:{cs:'Člen týmu',en:'Team member'},bio:{cs:'Osobní představení připravujeme.',en:'Personal introduction coming soon.'}}];
 return `<section class="team-profiles" id="team-profiles" aria-labelledby="team-profiles-title"><div class="wrap"><header class="tp-heading"><span class="tp-index">01 / ${tr('LIDÉ','PEOPLE')}</span><h2 id="team-profiles-title">${tr('Každý jiný.<br>Společně tým.','Different minds.<br>One team.')}</h2><span class="tp-count" aria-label="${tr('Čtyři členové týmu','Four team members')}">04<span aria-hidden="true">↗</span></span></header><p class="tp-attribution">${tr('Hugo, Dan a Vojta společně pracovali na DemocraTIConu. Ostatní technologické a kreativní projekty v portfoliu vytvořil Hugo.','Hugo, Dan, and Vojta worked together on DemocraTICon. The other technology and creative projects in the portfolio were built by Hugo.')}</p><div class="tp-grid">${members.map((member,i)=>{
 const destination=i===0?url(l,'projects'):i<3?url(l,'journey')+'#competitions':null;
 const label=i===0?tr('Projekty od Huga','Projects by Hugo'):tr('Společně na DemocraTIConu','Together at DemocraTICon');
 return `<article class="tp-card" aria-labelledby="tp-name-${l}-${i}"><div class="tp-portrait" role="img" aria-label="${esc(tr('Monogram: ','Monogram: ')+member.name)}"><span class="tp-portrait-number" aria-hidden="true">0${i+1} / 04</span><div class="tp-lines">${contour}</div><span class="tp-initials" aria-hidden="true">${initials[i]}</span><span class="tp-portrait-note">${tr('Portrét připravujeme','Portrait coming soon')}</span><span class="tp-registration" aria-hidden="true">+</span></div><div class="tp-card-copy"><span class="tp-role">${esc(member.role[l])}</span><h3 id="tp-name-${l}-${i}">${esc(member.name)}</h3><p>${esc(member.bio[l])}</p>${destination?`<a class="tp-contribution" href="${destination}"><span>${label}</span><span aria-hidden="true">↗</span></a>`:`<span class="tp-pending"><span aria-hidden="true">—</span> ${tr('Další informace brzy','More information soon')}</span>`}</div></article>`;
 }).join('')}</div></div></section>`;
}
