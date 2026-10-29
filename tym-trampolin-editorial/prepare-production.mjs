import {cp,readFile,writeFile,mkdir,stat,readdir,rm,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ungateKilometry} from './migration/ungate-kilometry.mjs';

// Build upstream Astro first. This command only prepares a sibling artifact;
// it never changes DNS, pushes source, or publishes either website.
const root=path.dirname(fileURLToPath(import.meta.url));
const parent=path.dirname(root);
const options=Object.fromEntries(process.argv.slice(2).map(arg=>{const i=arg.indexOf('=');if(i<0)throw Error('Expected --option=/absolute/path');return [arg.slice(0,i),path.resolve(arg.slice(i+1))];}));
const upstream=options['--upstream']||path.join(parent,'tym-trampolin-production-source','tym-trampolin-astro','dist');
const editorial=path.join(root,'dist');
const destination=options['--destination']||path.join(parent,'tym-trampolin-production');
if([root,editorial,upstream,parent,path.parse(destination).root].includes(destination))throw Error('Destination must be a separate artifact directory.');
const staging=destination+'.preparing';
const preview='https://tym-trampolin-editorial.woodsy-toast-3721.chatgpt.site';
const production='https://tymtrampolin.cz';
const exists=async p=>{try{return (await stat(p)).isFile();}catch{return false;}};
const routeFile=(base,route)=>path.join(base,route.split('#')[0].replace(/^\//,''),route.split('#')[0].endsWith('/')?'index.html':'');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
async function files(base){const out=[];for(const item of await readdir(base,{withFileTypes:true})){const p=path.join(base,item.name);if(item.isDirectory())out.push(...await files(p));else if(item.isFile())out.push(p);}return out;}
const required=['tym_trampolin_doom.html','kilometry-jdes.html','doom_manual.html','sw_doom.js','manifest_doom.json','doom_icon_192.png','doom_icon_512.png','doom.mp3','tracking.js','media/album/tym-trampolin-digital-album.zip'];
const admins=['','ai','doom','finance','github','infra','logs','projekty','spoluprace','uspechy','web'];
for(const name of required)if(!await exists(path.join(upstream,name)))throw Error('Upstream build missing: '+name);
for(const name of admins)if(!await exists(path.join(upstream,'admin',name,'index.html')))throw Error('Upstream dashboard build missing: '+name);
if(!await exists(path.join(editorial,'cs/index.html')))throw Error('Build the editorial website first.');
await rm(staging,{recursive:true,force:true});
await mkdir(staging,{recursive:true});
await cp(upstream,staging,{recursive:true});
await cp(editorial,staging,{recursive:true});
// User-approved public play: transform only the merged artifact, never upstream.
const kilometryFile=path.join(staging,'kilometry-jdes.html');
await writeFile(kilometryFile,ungateKilometry(await readFile(kilometryFile,'utf8')));
// The historical runner still requests this fallback filename.
await cp(path.join(staging,'HymnaTT_original.mp3'),path.join(staging,'HymnaTT.mp3'));
// Exact origin replacement leaves all unrelated services and same-domain games intact.
for(const file of await files(staging))if(/\.(?:html|xml|txt)$/i.test(file)){
 const text=await readFile(file,'utf8');if(text.includes(preview))await writeFile(file,text.replaceAll(preview,production));
}
const routes=JSON.parse(await readFile(path.join(root,'migration/legacy-routes.json'),'utf8'));
for(const [from,to] of Object.entries(routes)){
 const target=routeFile(staging,to);
 if(!await exists(target))throw Error('Legacy redirect has no destination: '+from+' → '+to);
 if(to.includes('#')){const html=await readFile(target,'utf8');const fragment=to.split('#')[1];if(!html.includes('id="'+fragment+'"')&&!html.includes("id='"+fragment+"'"))throw Error('Legacy fragment missing: '+to);}
 const out=routeFile(staging,from);
 if(!await exists(out)){
  await mkdir(path.dirname(out),{recursive:true});
  await writeFile(out,`<!doctype html><html lang="cs"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${escape(to)}"><link rel="canonical" href="${production}${escape(to.split('#')[0])}"><title>Přesměrování — Tým Trampolín</title><p><a href="${escape(to)}">Pokračovat na novou stránku</a></p></html>`);
 }
}
await cp(path.join(staging,'press/team-profile-cs.pdf'),path.join(staging,'press/partner-onepager.pdf'));
await writeFile(path.join(staging,'CNAME'),'tymtrampolin.cz\n');
await writeFile(path.join(staging,'.nojekyll'),'');
// Service worker install is all-or-nothing: every CORE member must survive.
const sw=await readFile(path.join(staging,'sw_doom.js'),'utf8');
const core=sw.match(/const CORE\s*=\s*\[([\s\S]*?)\]/)?.[1];
if(!core)throw Error('Unable to verify DOOM service worker CORE');
for(const match of core.matchAll(/['"]([^'"]+)['"]/g))if(!await exists(path.join(staging,match[1])))throw Error('DOOM service worker dependency missing: '+match[1]);
for(const name of required)if(!await exists(path.join(staging,name)))throw Error('Merged package missing: '+name);
for(const name of admins)if(!await exists(path.join(staging,'admin',name,'index.html')))throw Error('Merged dashboard missing: '+name);
// Retain the complete deployed public inventory, including URLs embedded in game code.
const originalPublic=options['--public']||path.join(parent,'tym-trampolin-production-source','tym-trampolin-astro','public');
for(const file of await files(originalPublic)){
 const relative=path.relative(originalPublic,file);
 if(!await exists(path.join(staging,relative)))throw Error('Historical public URL missing: /'+relative);
}
// The original compiled dashboard imports remain under _assets, never overwritten.
for(const file of await files(path.join(staging,'admin'))){if(!file.endsWith('.html'))continue;const html=await readFile(file,'utf8');for(const match of html.matchAll(/(?:src|href)=["'](\/_assets\/[^"'#?]+)/g))if(!await exists(path.join(staging,match[1].slice(1))))throw Error('Dashboard dependency missing: '+match[1]);}
await rm(destination,{recursive:true,force:true});
await rename(staging,destination);
console.log(`Prepared ${destination}: ${admins.length} dashboard routes, ${Object.keys(routes).length} legacy routes, original games and downloads retained. No publication performed.`);
