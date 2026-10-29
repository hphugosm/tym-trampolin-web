import {projects, ui, brand, pageCopy, esc, tx, url, arrow, contact} from './shared.mjs';
import {articleMeta} from './article-copy.mjs';
import {siteOrigin as origin} from './site-config.mjs';
import {getMember} from './member-data.mjs';

const navKeys = ['projects', 'about', 'journey', 'blog', 'collaborate'];
const wordmark = '<img class="brand-symbol" src="/assets/brand/tt-symbol-small.webp" width="112" height="84" alt=""><span class="brand-wordmark">TÝM<br>TRAMPOLÍN</span>';

function header(l, key, id) {
  const home = url(l);
  const navigation = navKeys.map(k => `<a href="${url(l,k)}"${k === key || (key === 'members' && k === 'about') ? ' aria-current="page"' : ''}>${ui[l][k]}</a>`).join('');
  return `<header class="site-header wrap"><a class="site-name" href="${home}" aria-label="Tým Trampolín — ${ui[l].home}">${wordmark}</a><span class="header-note">${tx(l,'STUDENTSKÝ TECHNOLOGICKÝ TÝM','STUDENT TECHNOLOGY TEAM')}</span><nav class="desktop-nav" aria-label="${tx(l,'Hlavní navigace','Main navigation')}">${navigation}</nav><div class="header-tools"><div class="locale-switch" aria-label="${ui[l].language}"><a href="${url('cs',key,id)}" lang="cs"${l === 'cs' ? ' aria-current="true"' : ''}>CS</a><span>/</span><a href="${url('en',key,id)}" lang="en"${l === 'en' ? ' aria-current="true"' : ''}>EN</a></div><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu"><span data-menu-label>${tx(l,'Menu +','Menu +')}</span></button></div></header><nav id="mobile-menu" class="mobile-nav" hidden aria-label="${tx(l,'Mobilní navigace','Mobile navigation')}">${navigation}</nav>`;
}

function footer(l) {
  return `<footer class="site-footer"><div class="wrap footer-invite"><p class="micro">${tx(l,'DALŠÍ SKOK ZAČÍNÁ ZPRÁVOU.','THE NEXT LEAP STARTS WITH A MESSAGE.')}</p><a class="footer-email" href="mailto:${contact.email}">${contact.email}</a></div><div class="wrap footer-top"><div><a class="site-name" href="${url(l)}" aria-label="Tým Trampolín — ${ui[l].home}">${wordmark}</a><p>${ui[l].footer}</p></div><nav class="footer-links" aria-label="${tx(l,'Další stránky','More pages')}">${['projects','about','journey','blog','collaborate','gallery','music'].map(k => `<a href="${url(l,k)}">${ui[l][k]}</a>`).join('')}</nav><div class="footer-contact"><a href="tel:+420731544015">${contact.phone}</a><a href="${contact.instagram}" target="_blank" rel="noopener noreferrer">Instagram ${arrow}</a><a href="${contact.twitch}" target="_blank" rel="noopener noreferrer">Twitch ${arrow}</a><a href="https://github.com/hphugosm/tym-trampolin-web" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></div></div><div class="wrap footer-bottom"><span>© 2026 TÝM TRAMPOLÍN · ${tx(l,'ZVĚDAVOST NÁS POSOUVÁ.','CURIOSITY MOVES US FORWARD.')}</span><div>${['privacy','cookies','accessibility'].map(k => `<a href="${url(l,k)}">${ui[l][k]}</a>`).join('')}</div><a href="#main">${tx(l,'Zpátky nahoru','Back to top')} ↑</a></div></footer>`;
}

export function shell(body,l,key = 'home',id) {
  const project = key === 'projects' && id ? projects.find(p => p.id === id) : null;
  const member = key === 'members' ? getMember(id) : null;
  const title = member ? member.name : id ? (key === 'blog' ? articleMeta[l].title : project?.text[l].title) : pageCopy[l][key]?.title;
  const description = member ? member.intro[l] : key === 'about' ? tx(l,'Hugo, Dan, Vojta a Honza. Studentský technologický tým z Prahy.','Hugo, Dan, Vojta, and Honza. A student technology team from Prague.') : (id ? (key === 'blog' ? articleMeta[l].description : project?.text[l].summary) : pageCopy[l][key]?.description);
  const current = url(l,key,id);
  const isCase = key === 'projects' && Boolean(id);
  const styles = [
    'landing-fonts','pages','experimental-heroes','experimental-layouts',
    ...(['gallery','music'].includes(key) ? ['experimental-archives'] : []),
    'experimental-motion','experimental-hover',
    ...(key === 'projects' || key === 'home' || key === 'members' ? ['project-art'] : []),
    ...(isCase ? [id === 'doom-bounce' ? 'doom-case' : 'case-studies','next-project'] : []),
    ...(key === 'collaborate' ? ['collaboration-choices'] : []),
    ...(key === 'about' ? ['team-profiles'] : []),
    ...(key === 'members' ? ['member-pages'] : []),
    ...(['about','members'].includes(key) ? ['member-transitions'] : []),
    'brand-ui','mobile-polish',
    ...(id === 'doom-bounce' ? ['doom-retro'] : [])
  ].map(name => `<link rel="stylesheet" href="/assets/${name}.css">`).join('');
  return `<!doctype html><html lang="${l}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title || brand[l])} — Tým Trampolín</title><meta name="description" content="${esc(description || pageCopy[l].home.description)}"><meta name="theme-color" content="#173DA5"><link rel="canonical" href="${origin}${current}"><link rel="alternate" hreflang="en" href="${origin}${url('en',key,id)}"><link rel="alternate" hreflang="cs" href="${origin}${url('cs',key,id)}"><meta property="og:title" content="${esc(title)} — Tým Trampolín"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${origin}/assets/social/${project ? project.id : 'team'}-${l}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(title || brand[l])}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}/assets/social/${project ? project.id : 'team'}-${l}.png"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${current}"><link rel="icon" href="/favicon.png" type="image/png"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${styles}<script defer src="/assets/app.js"></script><script type="module" src="/assets/experimental-motion.js"></script>${id === 'doom-bounce' ? '<script type="module" src="/assets/doom-case.js"></script>' : ''}${key === 'blog' && id ? '<script type="module" src="/assets/article-challenge.js"></script>' : ''}</head><body data-locale="${l}" data-page="${key}" data-detail="${esc(id||'')}"><a class="skip" href="#main">${tx(l,'Přejít na obsah','Skip to content')}</a>${header(l,key,id)}<main id="main">${body}</main>${footer(l)}<dialog id="lightbox" class="lightbox"><div class="lightbox-toolbar"><span data-lightbox-count></span><button type="button" data-lightbox-close aria-label="${ui[l].close}">×</button></div><button class="lightbox-prev" data-lightbox-prev aria-label="${ui[l].previous}">←</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" data-lightbox-next aria-label="${ui[l].nextPhoto}">→</button></dialog></body></html>`;
}
