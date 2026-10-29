import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
import {projects,ui,brand,pageCopy,esc,tx,url,arrow,projectCard,sectionHead,contact} from './shared.mjs';
import {renderPage,pageKeys,blogSlugs} from './pages.mjs';
import {home} from './homepage.mjs';
import {shell} from './page-shell.mjs';
import './sync-page-assets.mjs';
import {siteOrigin as origin} from './site-config.mjs';
import {members} from './member-data.mjs';
import {renderMemberPage} from './member-pages.mjs';
const routeList=[];
function write(l,key,id,body){const route=url(l,key,id);const file='dist'+route+'index.html';mkdirSync(file.slice(0,file.lastIndexOf('/')),{recursive:true});writeFileSync(file,shell(body,l,key,id));routeList.push(route);}
for(const l of ['en','cs']){write(l,'home',null,home(l));for(const key of pageKeys){write(l,key,null,renderPage(key,l));}for(const p of projects)write(l,'projects',p.id,renderPage('project',l,p.id));}
for(const l of ['en','cs'])for(const slug of blogSlugs)write(l,'blog',slug,renderPage('blog',l,slug));
for(const l of ['en','cs'])for(const member of members)write(l,'members',member.id,renderMemberPage(member,l));
writeFileSync('dist/404.html',shell(`<section class="page-hero wrap"><span class="micro">404</span><h1>Tak tady<br>jsme přeskočili.</h1><p>Tahle stránka neexistuje. Naše projekty ano.</p><a class="btn-primary" href="/cs/projekty/">Prohlédnout projekty ↗</a></section>`,'cs'));
writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routeList.map(p=>`<url><loc>${origin}${p}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${routeList.length} bilingual pages.`);

await import('./build-landing.mjs');
