#!/usr/bin/env python3
"""Rebuild two bilingual team profiles and a self-contained press kit.
Requires Python + reportlab + fonttools + brotli.
Merges bundled Latin and Latin Extended WOFF2 subsets and embeds them.
"""
from pathlib import Path
import os, math, zipfile, json, tempfile
from fontTools.merge import Merger
from fontTools.ttLib import TTFont as WebFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, Color
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'press'; OUT.mkdir(exist_ok=True)
# Prefer source fonts; deployed asset copies also work when rebuilding.
FONTDIR=ROOT/'dist/assets/fonts'
if not FONTDIR.exists():
 FONTDIR=ROOT/'landing-app/node_modules/@fontsource'
FONT_TEMP=tempfile.TemporaryDirectory(prefix='tt-press-fonts-')
for alias,family,weight in [('Body','dm-sans',400),('Heavy','manrope',800)]:
 paths=[]
 for subset in ['latin','latin-ext']:
  source=FONTDIR/f'{family}-{subset}-{weight}-normal.woff2'
  if not source.exists(): source=FONTDIR/family/'files'/source.name
  font=WebFont(source);font.flavor=None
  target=Path(FONT_TEMP.name)/f'{family}-{subset}.ttf';font.save(target);paths.append(str(target))
 merged=Merger().merge(paths);target=Path(FONT_TEMP.name)/f'{family}.ttf';merged.save(target)
 pdfmetrics.registerFont(TTFont(alias,str(target)))
BLUE=HexColor('#173da5'); INK=HexColor('#0a0c12'); RULE=HexColor('#d6d8de')
W,H=595.276,841.89; M=40; productionOrigin='https://tymtrampolin.cz'; BASE=productionOrigin
DATA={
'cs':dict(name='TÝM TRAMPOLÍN',date='28. ŘÍJNA 2026',title=['ZVĚDAVOST','V POHYBU.'],intro='Studentský technologický tým z Prahy. Experimentujeme, vyvíjíme a učíme se tvorbou technologických i kreativních projektů.',people='ČTYŘI LIDÉ. SPOLEČNÁ CESTA.',school='ANGLICKO-ČESKÉ GYMNÁZIUM AMAZON / PRAHA',roles=['Vedoucí týmu','Člen týmu','Člen týmu','Člen týmu'],attribution='Hugo, Daniel a Vojtěch spolu pracovali na DemocraTIConu. Ostatní projekty v portfoliu vytvořil Hugo Kubíček; každý detail uvádí autora.',results='SOUTĚŽNÍ MILNÍKY',awards=[('02','EVOHACKS 2026','ClearMessage / 2. místo'),('03','DemocraTICon','Celostátní finále / 3. místo')],portfolio='ŠEST ZPŮSOBŮ,\nJAK ZKOUŠET NOVÉ VĚCI.',collab='Máte zadání, nabízíte mentoring, nebo se chcete přidat? Ozvěte se.',pages='/cs/projekty/',contact='/cs/spoluprace/',projects=[('clearmessage','ClearMessage','Výzkumný prototyp pro porozumění podezřelým zprávám. Veřejné demo přehrává uložený výsledek.'),('real-estate-video','Realitní videa','Šest AI videí pro tři realitní projekty makléřky RE/MAX: budoucí stavby, renovace a život v domě.'),('website-studies','Ukázkové weby','SkyRing, TitanGOAT a Olomouc. Studie designu, vývoje, interakcí a vizuálního vyprávění.'),('doom-bounce','DOOM Bounce','Hratelný experiment v prohlížeči: vlastní raycasting, bossové a AI animace i hlasy.'),('education-tools','Digitalizace školství','Academic Vanguard pro výběr seminářů a informační web školního zájezdu Berlin 2026.'),('ai-radio','AI rádio','MVP autonomního generování hudby. Vysílání je pozastaveno; další verze a výzkum se připravují.')]),
'en':dict(name='TEAM TRAMPOLIN',date='28 OCTOBER 2026',title=['CURIOSITY','IN MOTION.'],intro='A student technology team from Prague. We experiment, build, and learn by making technology and creative projects.',people='FOUR PEOPLE. ONE SHARED PATH.',school='ANGLICKO-ČESKÉ GYMNÁZIUM AMAZON / PRAGUE',roles=['Team lead','Team member','Team member','Team member'],attribution='Hugo, Daniel, and Vojtěch worked together on DemocraTICon. The other portfolio projects were built by Hugo Kubíček; each detail credits its author.',results='COMPETITION MILESTONES',awards=[('02','EVOHACKS 2026','ClearMessage / 2nd place'),('03','DemocraTICon','National final / 3rd place')],portfolio='SIX WAYS TO\nEXPLORE NEW IDEAS.',collab='Have a brief, offer mentoring, or want to join? Get in touch.',pages='/projects/',contact='/collaborate/',projects=[('clearmessage','ClearMessage','A research prototype for understanding suspicious messages. The public demo replays a recorded result.'),('real-estate-video','Real estate video','Six AI videos for three property projects for a RE/MAX agent: future buildings, renovations, and life at home.'),('website-studies','Website studies','SkyRing, TitanGOAT, and Olomouc. Studies in design, development, interaction, and visual storytelling.'),('doom-bounce','DOOM Bounce','A playable browser experiment with custom raycasting, bosses, and AI-generated animation and voices.'),('education-tools','Education tools','Academic Vanguard for choosing seminars and an information site for the Berlin 2026 school trip.'),('ai-radio','AI radio','An autonomous music generation MVP. Broadcasting is paused; the next version and research are in progress.')])}

def text(c,s,x,y,size=10,font='Body',color=INK):
 c.setFillColor(color)
 if size>=30: size=min(size,(W-M-x)/pdfmetrics.stringWidth(s,font,1))
 c.setFont(font,size); c.drawString(x,y,s)
def para(c,s,x,y,width,size=11,leading=16,color=INK,font='Body'):
 p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading,textColor=color)); _,h=p.wrap(width,1000); p.drawOn(c,x,y-h);return h
def rule(c,y): c.setStrokeColor(RULE);c.setLineWidth(.6);c.line(M,y,W-M,y)
def footer(c,d,n):
 rule(c,38); text(c,d['name'],M,23,7,'Heavy');text(c,d['date'],230,23,7);text(c,f'{n:02d} / 02',W-M-38,23,7)
def contour(c,x,y,w,h):
 c.saveState();c.setStrokeColor(BLUE)
 for k in range(16):
  p=c.beginPath();
  for j in range(121):
   u=j/120; yy=y+k*h/16 + math.sin(u*math.pi*2-.3)*math.exp(-((u-.55)/.3)**2)*(k+2)*2.1
   if j==0:p.moveTo(x,yy)
   else:p.lineTo(x+u*w,yy)
  c.setLineWidth(.7+k*.13);c.drawPath(p)
 c.restoreState()
def make(lang):
 d=DATA[lang];c=canvas.Canvas(str(OUT/f'team-profile-{lang}.pdf'),pagesize=(W,H),pageCompression=1)
 c.setTitle(('Profil týmu' if lang=='cs' else 'Team profile')+' / '+d['name']);c.setAuthor('Tým Trampolín');c.setSubject('Team profile / 28 October 2026')
 text(c,d['name'],M,797,11,'Heavy');text(c,'TEAM PROFILE / '+lang.upper(),365,797,8);rule(c,781)
 text(c,d['title'][0],M,704,57,'Heavy');text(c,d['title'][1],M,645,57,'Heavy',BLUE)
 para(c,d['intro'],M,610,440,15,21)
 contour(c,325,478,230,52)
 text(c,d['people'],M,465,10,'Heavy',BLUE);text(c,d['school'],M,443,7)
 names=['Hugo Kubíček','Daniel Voženílek','Vojtěch Čakrt','Honza Smrz']
 for i,name in enumerate(names):
  xx=M+(i%2)*270;yy=411-(i//2)*51
  text(c,name,xx,yy,16,'Heavy');text(c,d['roles'][i],xx,yy-17,9)
 para(c,d['attribution'],M,293,W-2*M,10,15)
 rule(c,226);text(c,d['results'],M,207,8,'Heavy')
 for i,(num,event,label) in enumerate(d['awards']):
  xx=M+i*270;text(c,num,xx,143,48,'Heavy',BLUE);text(c,event,xx+78,169,12,'Heavy');para(c,label,xx+78,153,155,9,13)
 text(c,'team@tymtrampolin.cz',M,77,13,'Heavy',BLUE);c.linkURL('mailto:team@tymtrampolin.cz',(M,74,250,91),relative=0)
 text(c,'tymtrampolin.cz / Instagram: @tym_trampolin',M,58,9)
 c.linkURL(BASE+d['contact'],(M,54,330,70),relative=0);footer(c,d,1);c.showPage()
 text(c,d['name'],M,797,11,'Heavy');text(c,'PORTFOLIO / 2026',420,797,8);rule(c,781)
 for j,line in enumerate(d['portfolio'].split('\n')):text(c,line,M,736-j*37,33,'Heavy',BLUE)
 for i,(slug,title,desc) in enumerate(d['projects']):
  y=641-i*79;rule(c,y+15);text(c,f'{i+1:02d}',M,y-3,10,'Heavy',BLUE);text(c,title,M+42,y-3,17,'Heavy')
  para(c,desc,M+42,y-18,445,10,14)
  c.linkURL(BASE+d['pages']+slug+'/',(M,y-59,W-M,y+12),relative=0)
 para(c,d['collab'],M,147,440,12,17,font='Heavy')
 text(c,'team@tymtrampolin.cz',M,93,13,'Heavy',BLUE);text(c,'+420 731 544 015',350,93,11)
 c.linkURL('mailto:team@tymtrampolin.cz',(M,89,260,107),relative=0);c.linkURL('tel:+420731544015',(350,89,500,107),relative=0)
 text(c,BASE.replace('https://','')+d['pages'],M,68,8, color=BLUE);c.linkURL(BASE+d['pages'],(M,63,W-M,81),relative=0)
 footer(c,d,2);c.save()
 return d
for lang in DATA:
 d=make(lang)
 body=d['name']+'\n'+d['intro']+'\n\n'+'\n'.join(n+' / '+r for n,r in zip(['Hugo Kubíček','Daniel Voženílek','Vojtěch Čakrt','Honza Smrz'],d['roles']))+'\n\n'+d['attribution']+'\n\n'+'\n'.join(e+' / '+l for _,e,l in d['awards'])+'\n\n'+'\n\n'.join(t+'\n'+s+'\n'+BASE+d['pages']+i+'/' for i,t,s in d['projects'])+'\n\nteam@tymtrampolin.cz\n+420 731 544 015\nhttps://www.instagram.com/tym_trampolin/\n\n'+d['date']+'\n'
 (OUT/f'team-facts-{lang}.txt').write_text(body)
(OUT/'README.md').write_text('''# Tým Trampolín / press kit
Profiles and team facts dated 28 October 2026. Original logo and approved transparent web export added 29 October 2026. Profile links target the planned production domain https://tymtrampolin.cz.

## Contents
- team-profile-cs.pdf / team-profile-en.pdf: two-page editorial team profiles.
- team-facts-cs.txt / team-facts-en.txt: short team description, member names, competition results, six factual project summaries, URLs, and contact details.
- FONT-LICENSE-manrope.txt / FONT-LICENSE-dm-sans.txt: original font licenses and copyright notices.
- Logo.png: unchanged user-provided original logo, supplied 29 October 2026.
- Logo-web.webp: approved derived transparent web export in Editorial Blue (#173DA5), approved 29 October 2026.
- press-kit.zip: both language profiles, both facts files, the original logo, the derived web export, font licenses, and this README.

## Media and rights
Logo.png is an unchanged copy of the original logo supplied by the user on 29 October 2026 (1536 × 1024 pixels). Logo-web.webp is a derived transparent export for website use in Editorial Blue (#173DA5), approved on 29 October 2026; it is not the unchanged original. Inclusion does not grant a general reuse license; contact team@tymtrampolin.cz for permission and usage guidance. No photographs, client media, or third-party game artwork are included. The existing PDFs typeset the team name as text; they do not reconstruct or reproduce the logo. Contour drawings are generated for these documents. Manrope ExtraBold and DM Sans Regular are embedded as subsets for PDF display, using the same bundled fonts as the website. No standalone font binaries are included in this kit. Font software remains subject to its original license (SIL Open Font License).

The facts are provided for identifying and describing the team. This kit does not assert ownership or grant reuse rights for third-party trademarks, client work, photographs, game references, or assets visible on linked sites. For additional logo formats, portraits, licensed media, interviews, or reuse requests, contact team@tymtrampolin.cz. Follow external project links for project-specific information and rights.

## Accuracy and status
Current team: Hugo Kubíček, Daniel Voženílek, Vojtěch Čakrt, and Honza Smrz. Honza is identified only as a member. The historical DemocraTICon participation involved Hugo, Daniel, and Vojtěch. Other portfolio work is credited to Hugo. ClearMessage is a research prototype; its public demo replays a recorded result. AI radio broadcasting is paused. No commercial performance or independent safety claims are made.

Sources: repository reference/site.ts, pages.mjs (current fourth member), and the linked project pages. Contact details are public team contacts.

## Rebuild
Run generate-press.py from the repository root using Python with reportlab, fonttools, and brotli installed. It merges the Latin and Latin Extended subsets of the bundled Manrope ExtraBold and DM Sans Regular fonts from dist/assets/fonts (or the @fontsource packages under landing-app/node_modules). All data and generated contour paths are contained in that script. Render and inspect all four pages after rebuilding.
''')
for family in ['manrope','dm-sans']:
 license_source=ROOT/'landing-app/node_modules/@fontsource'/family/'LICENSE'
 license_dest=OUT/f'FONT-LICENSE-{family}.txt'
 if license_source.exists(): license_dest.write_text(license_source.read_text())
 elif not license_dest.exists(): raise FileNotFoundError(f'Missing bundled font license: {license_dest}')
# Preserve the user-provided logo bytes exactly in future kit rebuilds.
logo_source=ROOT/'brand/tt-original.png'
if not logo_source.exists(): raise FileNotFoundError(f'Missing original logo: {logo_source}')
(OUT/'Logo.png').write_bytes(logo_source.read_bytes())
web_logo_source=ROOT/'brand/tt-symbol.webp'
if not web_logo_source.exists(): raise FileNotFoundError(f'Missing approved web logo: {web_logo_source}')
(OUT/'Logo-web.webp').write_bytes(web_logo_source.read_bytes())
with zipfile.ZipFile(OUT/'press-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(OUT.iterdir()):
  if p.name!='press-kit.zip':z.write(p,p.name)
print('Generated two 2-page profiles and press kit:', OUT)
