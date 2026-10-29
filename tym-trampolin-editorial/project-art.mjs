export const artProjectIds = ['clearmessage','real-estate-video','website-studies','doom-bounce','education-tools','ai-radio'];
const aliases = {'realitni-videa':'real-estate-video',weby:'website-studies',doom:'doom-bounce',skolstvi:'education-tools',radio:'ai-radio'};
const lines = (variant=0) => Array.from({length:22},(_,i)=>{const y=36+i*19;const a=variant===1?54:28;return `<path d="M-60 ${y} C90 ${y-a},140 ${y+a},230 ${y} S370 ${y-a},560 ${y}"/>`;}).join('');
const rings = Array.from({length:20},(_,i)=>`<ellipse cx="${286-i*1.5}" cy="${248+i*1.4}" rx="${45+i*10}" ry="${29+i*7}"/>`).join('');
const copy = {
 'clearmessage':['CLEAR','MESSAGE','VERIFY / 01','OVĚŘIT / 01'],
 'real-estate-video':['PROSTOR','V POHYBU','SPACE IN MOTION','PROSTOR V POHYBU'],
 'website-studies':['WEB','STUDIES','DESIGN / INTERACTION','DESIGN / INTERAKCE'],
 'doom-bounce':['DOOM','BOUNCE','RAYCAST / PLAY','RAYCAST / HRA'],
 'education-tools':['NEXT','CHOICE','LEARN / EXPLORE','UČIT SE / OBJEVOVAT'],
 'ai-radio':['AI','RADIO','MVP / PAUSED','MVP / POZASTAVENO']
};
function drawing(id){
 if(id==='clearmessage') return `<g class="tt-art-contours">${lines()}</g><g class="tt-art-subject tt-art-envelope"><path class="tt-art-fill-paper" d="M111 162 355 133 390 318 146 348Z"/><path d="m111 162 153 93 91-122M146 348l74-128m170 98L284 227"/><path class="tt-art-fill-blue" d="m292 170 74-9 8 69-74 9Z"/><text x="331" y="217" class="tt-art-symbol">?</text></g><g class="tt-art-measure"><path d="M83 144v-26h28M388 343v29h-29"/></g>`;
 if(id==='real-estate-video') return `<g class="tt-art-contours">${lines(1)}</g><g class="tt-art-subject tt-art-house"><path class="tt-art-house-back" d="m127 225 120-86 125 71-120 88Z"/><path class="tt-art-fill-paper" d="m127 225 125 73v104l-125-73Z"/><path class="tt-art-fill-cloud" d="m252 298 120-88v104l-120 88Z"/><path class="tt-art-fill-blue" d="m151 253 35 20v52l-35-20Zm137 46 33-24v50l-33 24Z"/><path d="m247 139 5 159M127 225l120 71 125-86"/></g><g class="tt-art-frames"><path d="M88 120h325v264H88zM104 104h325v264M120 88h325v264"/><path class="tt-art-fill-paper" d="m398 326 29 17-29 17Z"/></g>`;
 if(id==='website-studies') return `<g class="tt-art-contours">${lines()}</g><g class="tt-art-subject tt-art-web"><path class="tt-art-fill-cloud" d="m90 117 284 28-15 206-284-28Z"/><path class="tt-art-fill-paper" d="m135 146 284 28-15 206-284-28Z"/><path d="m133 177 284 28M150 163l3 .3m8 .8 3 .3m8 .8 3 .3"/><ellipse class="tt-art-orbit" cx="267" cy="272" rx="102" ry="55" transform="rotate(-28 267 272)"/><ellipse class="tt-art-orbit" cx="267" cy="272" rx="55" ry="83" transform="rotate(-28 267 272)"/><path class="tt-art-fill-blue" d="m339 307 11 85 24-25 31-9Z"/></g>`;
 if(id==='doom-bounce') return `<g class="tt-art-tunnel tt-art-contours">${Array.from({length:13},(_,i)=>{const t=i/13,x=22+t*177,y=91+t*102,w=456-t*354,h=321-t*236;return `<path d="m${x} ${y} ${w} ${-18*(1-t)} ${-12*(1-t)} ${h} ${-w} ${18*(1-t)}Z"/>`;}).join('')}<path d="m0 30 250 211L500 0M0 500l250-259 250 259"/></g><g class="tt-art-subject tt-art-target"><path d="M216 200h-25v25m93-25h25v25m0 54v25h-25m-68 0h-25v-25M250 224v54m-27-27h54"/><path class="tt-art-fill-paper" d="m242 316 28-11 25 28-28 11Z"/></g>`;
 if(id==='education-tools') return `<g class="tt-art-contours">${lines(1)}</g><g class="tt-art-subject tt-art-choices"><path class="tt-art-fill-cloud" d="M102 122h247v234H102Z"/><path class="tt-art-fill-paper" d="M143 153h247v234H143Z"/><path d="M173 187h76m-76 14h50M173 222h179M173 263h179M173 304h179M173 345h179M226 222v123m63-123v123"/><path class="tt-art-choice-path" d="M193 345v-61h66v-42h62v-39"/><path d="m308 214 13-13 13 13"/><circle class="tt-art-fill-blue" cx="193" cy="345" r="12"/><circle class="tt-art-fill-blue" cx="321" cy="201" r="12"/><path class="tt-art-fill-blue" d="m348 91 10 23 24 2-18 16 5 24-21-12-21 12 5-24-18-16 24-2Z"/></g>`;
 return `<g class="tt-art-contours tt-art-radio-rings">${rings}</g><g class="tt-art-subject tt-art-record"><circle class="tt-art-fill-blue" cx="260" cy="253" r="73"/><circle cx="260" cy="253" r="60"/><path class="tt-art-fill-paper" d="M240 225h13v57h-13zm27 0h13v57h-13z"/><path d="m347 117 69 18-31 119m-47 0h47"/></g>`;
}
export function projectArtwork(input, locale='cs') {
 const id=aliases[input]||input;if(!artProjectIds.includes(id)) return '';
 const index=artProjectIds.indexOf(id)+1,c=copy[id];
 const themes={'clearmessage':'paper','real-estate-video':'blue','website-studies':'cloud','doom-bounce':'ink','education-tools':'paper','ai-radio':'blue'};
 const title=id==='real-estate-video'&&locale==='en'?['SPACE','IN MOTION']:[c[0],c[1]];
 return `<div class="tt-project-art tt-art-${id} tt-art-theme-${themes[id]}" aria-hidden="true"><div class="tt-art-top"><span>TT / EXPERIMENT ${String(index).padStart(2,'0')}</span><span>2026</span></div><svg class="tt-art-drawing" viewBox="0 0 500 500" aria-hidden="true" focusable="false">${drawing(id)}</svg><div class="tt-art-title"><span>${title[0]}</span><span>${title[1]}</span></div><div class="tt-art-bottom"><span>${c[locale==='en'?2:3]}</span><span class="tt-art-arrow">↗</span></div></div>`;
}
