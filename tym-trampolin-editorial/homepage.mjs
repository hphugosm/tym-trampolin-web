import {projects,ui,brand,esc,tx,url,arrow,projectCard,contact} from './shared.mjs';

export function home(l){
 const cs=l==='cs';
 return `<section class="editorial-hero wrap" aria-label="${brand[l]}">
  <div class="editorial-stage">
   <nav class="hero-index" aria-label="${tx(l,'Na této stránce','On this page')}">
    <a href="#selected"><span>01</span>${ui[l].projects}</a>
    <a href="#team"><span>02</span>${ui[l].about}</a>
    <a href="#archive"><span>03</span>${tx(l,'Archiv','Archive')}</a>
   </nav>
   <div class="hero-edition micro">${tx(l,'EXPERIMENTÁLNÍ TÝM','EXPERIMENTAL TEAM')}<br>PRAGUE, CZ / EST. 2026</div>
   <h1 class="collage-title" aria-label="${tx(l,'Historie zná velké kroky. My děláme skoky.','History remembers great steps. We make leaps.')}"><span class="collage-sentence">${tx(l,'Historie zná<br>velké kroky.','History remembers<br>great steps.')}<span class="sentence-end">${tx(l,'My děláme','We make')}</span></span><span class="collage-word">${tx(l,'skoky','leaps')}<span>.</span></span></h1>
   <figure class="collage-photo"><img src="/assets/team-coding.webp" width="1024" height="1024" alt="${tx(l,'Tým při práci na technologickém projektu','The team working on a technology project')}" fetchpriority="high"><figcaption><span>FIG. 01</span><span>${tx(l,'Vlastní cesta.','Our own path.')}</span></figcaption></figure>
   <span class="editorial-plus" aria-hidden="true">+</span>
   <span class="hero-side-note micro">${tx(l,'ZKOUŠÍME. STAVÍME. LADÍME.','TRY. BUILD. REFINE.')}</span>
   <a class="hero-next micro" href="#selected">${tx(l,'VYBRANÁ PRÁCE','SELECTED WORK')}<span aria-hidden="true">↓</span></a>
  </div>
  <div class="hero-colophon"><span class="micro">( 001 — ${tx(l,'ÚVOD','INTRO')} )</span><p>${tx(l,'Jsme studentský technologický tým z Prahy. Zkoušíme AI, stavíme weby, tvoříme hry a video. Učíme se na věcech, které opravdu vzniknou.','We’re a student technology team from Prague. Exploring AI, building websites, making games and video. Learning through things we actually make.')}</p><a class="small-link" href="${url(l,'about')}">${tx(l,'O týmu','About us')} ${arrow}</a></div>
 </section>
 <section class="work-editorial wrap" id="selected">
  <div class="work-title-row"><span class="micro">01 / ${tx(l,'VÝBĚR Z PORTFOLIA','SELECTED PORTFOLIO')}</span><h2>${tx(l,'Nápady<br>v provozu.','Ideas<br>in motion.')}</h2><span class="work-count">( 06 )</span></div>
  <div class="work-stream">${projects.slice(0,4).map((p,i)=>projectCard(p,l,i)).join('')}</div>
  <a class="work-more" href="${url(l,'projects')}"><span class="micro">${tx(l,'POKRAČOVAT V PORTFOLIU','CONTINUE EXPLORING')}</span><span>${ui[l].allProjects} <sup>06</sup></span>${arrow}</a>
 </section>
 <section class="editorial-team wrap" id="team">
  <span class="micro team-index">02 / ${tx(l,'LIDÉ ZA PROJEKTY','PEOPLE BEHIND THE PROJECTS')}</span>
  <figure class="team-main-photo"><img src="/assets/team-trio.webp" width="1400" height="775" loading="lazy" alt="${tx(l,'Předávání cen v celostátním finále DemocraTIConu v Olomouci','Award ceremony at the DemocraTICon national final in Olomouc')}"><figcaption class="micro">OLOMOUC / APRIL 2026</figcaption></figure>
  <div class="team-story"><h2>${tx(l,'Tři lidi.<br>Vlastní cesta.','Three people.<br>Our own path.')}</h2><p>${tx(l,'Hugo, Dan a Vojta. Dali jsme se dohromady v lednu 2026 kvůli DemocraTIConu. Dnes nás spojují technologie, kreativní tvorba a chuť zkusit něco nového.','Hugo, Dan, and Vojta. We came together in January 2026 for DemocraTICon. Today, technology, creative work, and curiosity keep us moving.')}</p><a class="small-link" href="${url(l,'about')}">${tx(l,'Poznat tým','Meet the team')} ${arrow}</a></div>
  <div class="team-vertical" aria-hidden="true">${tx(l,'spolu','together')}.</div>
 </section>
 <section class="editorial-proof wrap">
  <div class="proof-heading"><span class="micro">${tx(l,'ZKOUŠELI JSME. A NĚKAM TO VEDLO.','WE TRIED. IT LED SOMEWHERE.')}</span><h2>${tx(l,'Pár dobrých<br>odrazů.','A few good<br>leaps.')}</h2></div>
  <div class="proof-rows"><a href="https://devpost.com/software/clearmessage-ai-phishing-detection" target="_blank" rel="noopener noreferrer"><strong>02</strong><div><h3>EVOHACKS 2026</h3><p>ClearMessage · AI for Automation</p></div><span class="micro">${tx(l,'MÍSTO','PLACE')}</span>${arrow}</a><a href="${url(l,'journey')}"><strong>03</strong><div><h3>DemocraTICon</h3><p>${tx(l,'Celostátní finále · Olomouc 2026','National final · Olomouc 2026')}</p></div><span class="micro">${tx(l,'MÍSTO','PLACE')}</span>${arrow}</a><a href="${url(l,'projects','real-estate-video')}"><strong>06</strong><div><h3>${tx(l,'Realitních videí','Real estate videos')}</h3><p>${tx(l,'3 klientské projekty · 2026','3 client projects · 2026')}</p></div><span class="micro">${tx(l,'VÝSTUPŮ','OUTPUTS')}</span>${arrow}</a></div>
 </section>
 <section class="editorial-archive wrap" id="archive">
  <div class="archive-top"><span class="micro">03 / ${tx(l,'VEDLEJŠÍ FREKVENCE','SIDE FREQUENCIES')}</span><a class="small-link" href="${url(l,'gallery')}">${ui[l].gallery} ${arrow}</a></div>
  <div class="archive-composition"><div class="archive-list"><span class="micro">${tx(l,'PERMANENTNĚ VE VÝVOJI.','FROM THE ARCHIVE')}</span><h2>${tx(l,'I tohle<br>jsme my.','This is<br>us, too.')}</h2><p>${tx(l,'Školní nástroje, experiment s AI rádiem a hymna v deseti verzích. Něco už funguje, něco právě ladíme.','School tools, an AI radio experiment, and our anthem in ten versions. Some things work. Others are still taking shape.')}</p>${projects.slice(4).map(p=>`<a href="${url(l,'projects',p.id)}"><span>${esc(p.text[l].title)}</span><span class="micro">${esc(p.text[l].status)}</span>${arrow}</a>`).join('')}</div><div class="archive-album"><a class="album-image-link" href="${url(l,'music')}" aria-label="${ui[l].music}"><img src="/assets/historical-costumes.webp" width="1024" height="682" loading="lazy" alt="${tx(l,'Soutěžní vystoupení týmu v historických kostýmech','The team’s competition performance in historical costumes')}"><span class="album-play" aria-hidden="true">↗</span></a><div class="album-caption"><span class="micro">TT / VOL. 01</span><a href="${url(l,'music')}">${tx(l,'Týmová hymna','Team anthem')} ${arrow}</a></div><audio controls preload="none" aria-label="${tx(l,'Hymna TT — Original','TT Anthem — Original')}"><source src="/assets/album/original.mp3" type="audio/mpeg"></audio><span class="micro album-note">ORIGINAL / ${tx(l,'DALŠÍCH 9 VERZÍ V ARCHIVU','9 MORE VERSIONS IN THE ARCHIVE')}</span></div><span class="archive-big-type" aria-hidden="true">play.</span></div>
 </section>
 <section class="editorial-contact wrap"><div class="contact-kicker"><span class="micro">${tx(l,'DALŠÍ KAPITOLA MŮŽE BÝT SPOLEČNÁ','THE NEXT CHAPTER COULD BE TOGETHER')}</span><span class="micro">( 004 )</span></div><a class="editorial-contact-title" href="${url(l,'collaborate')}"><span>${tx(l,'Co zkusíme<br>příště?','What shall we<br>try next?')}</span><span aria-hidden="true">↗</span></a><div class="editorial-contact-bottom"><p>${tx(l,'Máš nápad, zadání nebo chuť tvořit? Ozvi se.','Have an idea, a brief, or the urge to build? Say hello.')}</p><a href="mailto:${contact.email}">${contact.email}</a></div></section>`;
}
