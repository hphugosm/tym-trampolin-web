import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {articleId,articleSlugs} from './article-routes.mjs';
import {url} from './shared.mjs';
import {siteOrigin} from './site-config.mjs';
const root=resolve('dist'),html=[];let checked=0;const issues=[];
function walk(dir){for(const name of readdirSync(dir)){const f=join(dir,name);if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.html'))html.push(f);}}
walk(root);
for(const file of html){const src=readFileSync(file,'utf8');const landing=src.includes('id="root"')&&src.includes('/assets/index-');if(!landing&&!src.includes('<h1'))issues.push(`${file}: missing heading`);if(!src.includes('lang="'))issues.push(`${file}: missing language`);if(!landing&&(src.match(/<h1[ >]/g)||[]).length!==1)issues.push(`${file}: expected one h1`);for(const match of src.matchAll(/(?:href|src)="([^"<>]+)"/g)){let target=match[1].replace(/&amp;/g,'&');if(/^(https?:|mailto:|tel:|data:|#)/.test(target))continue;target=target.split(/[?#]/)[0];if(!target)continue;let dest=target.startsWith('/')?join(root,target):resolve(file,'..',target);if(!existsSync(dest))issues.push(`${file.slice(root.length)}: missing ${target}`);else if(statSync(dest).isDirectory()&&!existsSync(join(dest,'index.html')))issues.push(`${file.slice(root.length)}: directory has no page ${target}`);checked++;}if(src.includes('undefined')||src.includes('null —'))issues.push(`${file}: undefined output`);}
for(const lang of ['en','cs'])for(const id of ['clearmessage','real-estate-video','website-studies','doom-bounce','education-tools','ai-radio']){const path=join(root,lang==='cs'?'cs/projekty':'projects',id,'index.html');const content=readFileSync(path,'utf8');if(!content.includes('detail-story')||!content.includes('Hugo Kubíček'))issues.push(`${path}: incomplete detail`);}
const projectIds=['clearmessage','real-estate-video','website-studies','doom-bounce','education-tools','ai-radio'];
for(const lang of ['cs','en']){
 for(const [i,id] of projectIds.entries()){
  const folder=lang==='cs'?'cs/projekty':'projects',content=readFileSync(join(root,folder,id,'index.html'),'utf8');
  const next=projectIds[(i+1)%projectIds.length],destination=`/${folder}/${next}/`;
  if(!content.includes(`class="next-project-link" href="${destination}"`))issues.push(`${id}/${lang}: invalid next project`);
  if(!content.includes(`/assets/social/${id}-${lang}.png`))issues.push(`${id}/${lang}: wrong sharing image`);
 }
 for(const id of [...projectIds,'team']){
  const path=join(root,'assets/social',`${id}-${lang}.png`);
  if(!existsSync(path))issues.push(`Missing sharing image ${id}-${lang}`);
  else {const png=readFileSync(path);if(png.readUInt32BE(16)!==1200||png.readUInt32BE(20)!==630)issues.push(`${id}-${lang}: invalid sharing dimensions`);}
 }
 const home=readFileSync(join(root,lang==='cs'?'cs':'','index.html'),'utf8');
 if(!home.includes(`<html lang="${lang}">`))issues.push(`${lang}: wrong landing language metadata`);
 const about=readFileSync(join(root,lang==='cs'?'cs/o-nas':'about','index.html'),'utf8');
 if(!about.includes(`class="site-name" href="${lang==='cs'?'/cs/':'/'}"`))issues.push(`${lang}: wrong home link`);
}
const palette=new Set(['#173da5','#0a0c12','#ffffff','#fff','#f3f5f9','#7c8494','#d6d8de','#2455ff']);for(const css of ['main.css','pages.css','editorial.css','experimental-heroes.css','experimental-layouts.css','experimental-archives.css','experimental-motion.css','experimental-hover.css','project-art.css','case-studies.css','doom-case.css','next-project.css','collaboration-choices.css','team-profiles.css'])for(const x of readFileSync(join(root,'assets',css),'utf8').matchAll(/#[0-9a-f]{3,8}\b/gi))if(!palette.has(x[0].toLowerCase()))issues.push(`${css}: unexpected brand color ${x[0]}`);
// The original arcade palette is an explicit project-specific DOOM exception.
for(const lang of ['cs','en']){
 const route=url(lang,'blog',articleId),page=readFileSync(join(root,route,'index.html'),'utf8');
 if(!page.includes(`lang="${lang}" data-shake-article`))issues.push(`${route}: wrong article language`);
 const listing=readFileSync(join(root,url(lang,'blog'),'index.html'),'utf8');
 if(!listing.includes(`href="${route}"`))issues.push(`${lang}: blog listing misses its own language article`);
 for(const target of ['cs','en'])if(!page.includes(`hreflang="${target}" href="${siteOrigin}${url(target,'blog',articleSlugs[target])}"`))issues.push(`${route}: wrong article alternate ${target}`);
}
for(const file of html){const content=readFileSync(file,'utf8');if(content.includes('/assets/doom-retro.css')!==content.includes('data-detail="doom-bounce"'))issues.push(`${file}: incorrect retro skin scope`);}
for(const match of readFileSync(join(root,'assets/doom-retro.css'),'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g))if(!existsSync(join(root,match[1])))issues.push(`Retro skin: missing ${match[1]}`);
if(issues.length){console.error(issues.join('\n'));process.exit(1);}console.log(`Verified ${html.length} HTML files, ${checked} local references, 12 complete project details, brand palette and scoped DOOM skin.`);
