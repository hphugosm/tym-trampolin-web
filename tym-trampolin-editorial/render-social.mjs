/** Rebuild bilingual sharing images: node render-social.mjs. Requires sharp. */
import {createRequire} from 'node:module';
import {writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {projectArtwork,artProjectIds} from './project-art.mjs';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp')}catch{const root=process.env.SITES_NODE_MODULES||'/Users/hugo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';sharp=require(path.join(root,'sharp'))}
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'social');
const fontCache=await mkdtemp(path.join(tmpdir(),'tt-social-fonts-'));
const fontConfig=path.join(fontCache,'fonts.conf');
await writeFile(fontConfig,`<fontconfig><dir>${out}/fonts</dir><cachedir>${fontCache}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE=fontConfig;
const blue='#173DA5',ink='#0A0C12',white='#FFFFFF',cloud='#F3F5F9';
const projects=[
 ['ClearMessage','ClearMessage','Kyberbezpečnost · AI','Cybersecurity · AI'],
 ['Realitní|videa','Real estate|video','Kreativní tvorba · Klientský projekt','Creative work · Client project'],
 ['Ukázkové|weby','Website|studies','Vývoj webů · Vzdělávání','Web development · Learning'],
 ['DOOM|Bounce','DOOM|Bounce','Hra v prohlížeči · Kreativní experiment','Browser game · Creative experiment'],
 ['Digitalizace|školství','Education|tools','Vzdělávání · Webové aplikace','Education · Web applications'],
 ['AI rádio','AI radio','AI hudba · Probíhající výzkum','AI music · Research in progress']
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
async function textImage(text,size,color,font='manrope',maxWidth=690){
 const buffer=await sharp({text:{text:`<span foreground="${color}">${esc(text)}</span>`,font:`${font==='manrope'?'Manrope ExtraBold':'DM Sans'} ${size}`,fontfile:path.join(out,'fonts',font+'.ttf'),dpi:72,rgba:true}}).png().toBuffer();
 const m=await sharp(buffer).metadata();return m.width>maxWidth?sharp(buffer).resize({width:maxWidth}).png().toBuffer():buffer;
}
const css=`svg{fill:none;stroke:LINE;stroke-width:2;stroke-linejoin:miter}.tt-art-contours{opacity:.5;stroke-width:1.2}.tt-art-fill-paper{fill:#fff}.tt-art-fill-cloud{fill:#f3f5f9;stroke:#173da5}.tt-art-fill-blue{fill:#173da5;stroke:#173da5}.tt-art-house-back{fill:#fff;stroke:#173da5}.tt-art-house,.tt-art-web,.tt-art-choices{stroke:#173da5}.tt-art-choice-path{stroke-width:12}.tt-art-orbit{stroke:#173da5;stroke-width:7}.tt-art-symbol{fill:#fff;stroke:none;font-size:52px;text-anchor:middle;font-family:sans-serif}.tt-art-record{stroke:#fff}.tt-art-frames{opacity:.6}.tt-art-target{stroke-width:3}`;
await mkdir(out,{recursive:true});
// Composite the supplied symbol faithfully, preserving its transparent alpha.
const symbol=await sharp(path.join(root,'brand','tt-symbol.webp')).resize(64,48,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
for(const locale of ['cs','en'])for(let index=0;index<7;index++){
 const team=index===6,id=team?'team':artProjectIds[index];
 const dark=index===3,solid=index===1||index===5;const bg=dark?ink:solid?blue:index===2?cloud:white,fg=dark||solid?white:ink,accent=dark||solid?white:blue;
 let motif='';
 if(!team){let svg=projectArtwork(id,locale).match(/<svg[\s\S]*?<\/svg>/)[0];svg=svg.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="510" height="510" `).replace('>',`><style>${css.replaceAll('LINE',accent)}</style>`);motif=svg;}
 else motif=`<svg xmlns="http://www.w3.org/2000/svg" width="510" height="510" viewBox="0 0 510 510"><g fill="none" stroke="${blue}" stroke-width="3">${Array.from({length:24},(_,i)=>{const y=18+i*20;return `<path d="M-40 ${y} C60 ${y} 70 ${y-100*Math.sin(i/24*Math.PI)} 190 ${y-100*Math.sin(i/24*Math.PI)} S350 ${y+90*Math.sin(i/24*Math.PI)} 550 ${y}"/>`}).join('')}</g></svg>`;
 const base=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${bg}"/>${solid?'<rect width="1200" height="102" fill="#FFFFFF"/>':''}<path d="M64 102H1136M64 545H1136" stroke="${accent}" stroke-opacity=".5"/><path d="M1114 561h22v22m0-22-22 22" fill="none" stroke="${accent}" stroke-width="2"/></svg>`;
 const layers=[{input:await sharp(Buffer.from(motif)).png().toBuffer(),left:690,top:80},{input:symbol,left:64,top:40}];
 async function add(t,size,c,x,y,font='manrope',max=690){layers.push({input:await textImage(t,size,c,font,max),left:x,top:y})}
 await add(locale==='cs'?'TÝM TRAMPOLÍN':'TEAM TRAMPOLIN',27,solid?blue:accent,148,52,'manrope',600);
 await add(team?'TT / 2026':`TT / ${String(index+1).padStart(2,'0')} — ${locale==='cs'?'PROJEKT':'PROJECT'}`,18,accent,64,130,'dm-sans');
 const title=team?(locale==='cs'?['Historie zná','velké kroky.','My děláme skoky.']:['History remembers','great steps.','We make leaps.']):projects[index][locale==='cs'?0:1].split('|');
 let y=team?205:title.length===1?240:210;for(const line of title){await add(line,team?57:index===0?86:82,fg,64,y,'manrope',team?700:650);y+=team?73:96}
 const cat=team?(locale==='cs'?'STUDENTSKÝ TECHNOLOGICKÝ TÝM':'STUDENT TECHNOLOGY TEAM'):projects[index][locale==='cs'?2:3];
 await add(cat,21,accent,64,490,'dm-sans',650);
 await add('tymtrampolin.cz',19,accent,64,571,'dm-sans');
 const file=path.join(out,`${id}-${locale}.png`);await sharp(Buffer.from(base)).composite(layers).png({compressionLevel:9}).toFile(file);console.log(path.basename(file));
}

await rm(fontCache,{recursive:true,force:true});
