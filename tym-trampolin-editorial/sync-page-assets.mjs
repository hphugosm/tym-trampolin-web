import {cpSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync} from 'node:fs';

mkdirSync('dist/assets/fonts', {recursive:true});
for(const destination of ['dist','landing-app/public']){
 mkdirSync(`${destination}/assets/brand`,{recursive:true});
 for(const file of ['tt-symbol-small.webp','tt-symbol.webp']) copyFileSync(`brand/${file}`,`${destination}/assets/brand/${file}`);
 for(const file of ['favicon.png','apple-touch-icon.png']) copyFileSync(`brand/${file}`,`${destination}/${file}`);
 const icon=readFileSync('brand/favicon.png').toString('base64');
 writeFileSync(`${destination}/favicon.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${icon}"/></svg>`);
}
let faces = '';
for (const [name, weights] of [['manrope',[800]], ['dm-sans',[400,500,700]]]) {
  const base = `landing-app/node_modules/@fontsource/${name}`;
  for (const weight of weights) {
    const css = readFileSync(`${base}/${weight}.css`, 'utf8');
    for (const match of css.matchAll(/@font-face\s*\{[^}]+\}/g)) {
      const filename = match[0].match(/url\(\.\/files\/([^)]*-(?:latin|latin-ext)-[^)]*\.woff2)\)/)?.[1];
      if (!filename) continue;
      copyFileSync(`${base}/files/${filename}`, `dist/assets/fonts/${filename}`);
      faces += match[0].replace(/src:[^;]+;/, `src: url('/assets/fonts/${filename}') format('woff2');`) + '\n';
    }
  }
  if (existsSync(`${base}/LICENSE`)) copyFileSync(`${base}/LICENSE`, `dist/assets/fonts/${name}-LICENSE.txt`);
}
writeFileSync('dist/assets/landing-fonts.css', faces);
copyFileSync('pages.css', 'dist/assets/pages.css');
copyFileSync('project-art.css', 'dist/assets/project-art.css');
copyFileSync('page-interactions.js', 'dist/assets/app.js');
copyFileSync('article-challenge.js', 'dist/assets/article-challenge.js');

for (const name of ['experimental-heroes.css','experimental-layouts.css','experimental-archives.css']) copyFileSync(name, 'dist/assets/'+name);

for (const name of ['experimental-motion.css','experimental-hover.css','experimental-motion.js']) copyFileSync(name, 'dist/assets/'+name);

for(const name of ['doom-retro.css','case-studies.css','doom-case.css','doom-case.js','next-project.css','collaboration-choices.css','team-profiles.css']) copyFileSync(name,'dist/assets/'+name);
for(const name of ['brand-ui.css','mobile-polish.css']) copyFileSync(name,'dist/assets/'+name);
if(existsSync('case-assets')) cpSync('case-assets','dist/assets/cases',{recursive:true});
if(existsSync('gallery-assets')) cpSync('gallery-assets','dist/assets/gallery',{recursive:true});
if(existsSync('press')) cpSync('press','dist/press',{recursive:true});
if(existsSync('social')) cpSync('social','dist/assets/social',{recursive:true});
