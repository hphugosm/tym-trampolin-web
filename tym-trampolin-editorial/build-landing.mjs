import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,cpSync,mkdirSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {siteOrigin as origin} from './site-config.mjs';
const app=fileURLToPath(new URL('./landing-app/',import.meta.url));
const result=spawnSync('npm',['run','build'],{cwd:app,stdio:'inherit'});
if(result.status!==0)throw new Error('Landing page build failed');
const built=new URL('./landing-app/dist/',import.meta.url);
const deployed=new URL('./dist/landing/',import.meta.url);
rmSync(deployed,{recursive:true,force:true});
cpSync(built,deployed,{recursive:true});
cpSync(new URL('media/',built),new URL('./dist/media/',import.meta.url),{recursive:true});
const html=readFileSync(new URL('index.html',built),'utf8').replaceAll('"./assets/','"/landing/assets/').replace(/"\.\/(favicon\.(?:png|svg)|apple-touch-icon\.png)"/g,'"/$1"');
for(const route of ['', 'cs/']){
 const target=new URL('./dist/'+route,import.meta.url);
 mkdirSync(target,{recursive:true});
 const lang=route?'cs':'en';
 const title=lang==='cs'?'Tým Trampolín — My děláme skoky.':'Tým Trampolín — We take leaps.';
 const description=lang==='cs'?'Studentský technologický tým. Experimentujeme, vyvíjíme a soutěžíme. Programování, AI, hardware a kreativní tvorba.':'A student technology team. We experiment, build, and compete. Programming, AI, hardware, and creative projects.';
 let output=html.replace('<html lang="cs">',`<html lang="${lang}">`).replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`);
 output=output.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/,`<meta name="description" content="${description}">`)
  .replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?\s*>/,`<meta property="og:locale" content="${lang==='cs'?'cs_CZ':'en_US'}">`)
  .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/,`<meta property="og:title" content="${title}">`)
  .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/,`<meta property="og:description" content="${description}">`)
  .replace('name="twitter:card" content="summary"','name="twitter:card" content="summary_large_image"');
 output=output.replace('</head>',`<link rel="canonical" href="${origin}/${route}"><link rel="alternate" hreflang="en" href="${origin}/"><link rel="alternate" hreflang="cs" href="${origin}/cs/"><meta property="og:url" content="${origin}/${route}"><meta property="og:image" content="${origin}/assets/social/team-${lang}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${origin}/assets/social/team-${lang}.png"></head>`);
 writeFileSync(new URL('index.html',target),output);
}
console.log('Published landing page is built from the supplied ZIP; portfolio routes retained.');
