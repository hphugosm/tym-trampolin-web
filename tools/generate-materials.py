#!/usr/bin/env python3
"""Build bilingual print profiles, press ZIP and sharing images from site data.

Usage: node --experimental-strip-types tools/export-materials.mjs | python3 tools/generate-materials.py
Requires: reportlab, Pillow. Fonts included under the SIL Open Font License.
"""
import io
import json
from pathlib import Path
import shutil
import sys
from xml.sax.saxutils import escape
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

TOOLS = Path(__file__).resolve().parent
PUBLIC = TOOLS.parent / 'tym-trampolin-astro/public'
PRESS = PUBLIC / 'press'
OG = PUBLIC / 'media/og'
OG.mkdir(parents=True, exist_ok=True)
data = json.load(sys.stdin)
heading_font = TOOLS / 'material-fonts/ChakraPetch-SemiBold.ttf'
body_font = TOOLS / 'material-fonts/Archivo-Regular.ttf'
pdfmetrics.registerFont(TTFont('Heading', str(heading_font)))
pdfmetrics.registerFont(TTFont('Body', str(body_font)))
INK, CYAN, VIOLET = '#030814', '#4fc8ff', '#7d8bff'

def paragraph(canvas, text, x, y, width, size=9.6, color='#26374d', leading=13.6, font='Body'):
    p = Paragraph(text, ParagraphStyle('p', fontName=font, fontSize=size, leading=leading, textColor=HexColor(color)))
    _, height = p.wrap(width, 1000)
    p.drawOn(canvas, x, y - height)
    return y - height

def profile(locale):
    cs = locale == 'cs'
    path = PRESS / f'team-profile-{locale}.pdf'
    c = Canvas(str(path), pagesize=(595.28, 841.89), invariant=1)
    c.setTitle(f'{data["brand"][locale]} | {"Profil týmu" if cs else "Team profile"} | 2026-10')
    c.setAuthor(data['brand'][locale])
    c.setFillColor(HexColor(INK)); c.rect(0, 670, 595.28, 172, fill=1, stroke=0)
    c.setFillColor(HexColor(CYAN)); c.rect(42, 789, 36, 3, fill=1, stroke=0)
    paragraph(c, 'PROFIL TÝMU // ŘÍJEN 2026' if cs else 'TEAM PROFILE // OCTOBER 2026', 90, 795, 460, 9, CYAN, 12, 'Heading')
    paragraph(c, data['brand'][locale].upper(), 42, 757, 515, 37, '#edf4ff', 43, 'Heading')
    paragraph(c, 'Studentský technologický tým z Prahy' if cs else 'A student technology team from Prague', 44, 700, 500, 13, '#b9cbe2', 18)
    y = paragraph(c, ('Kyberbezpečnost, AI, weby, hry, vzdělávání a video. Nápady ověřujeme prototypy, soutěžemi a kreativní prací pro klienty. Tým vznikl v lednu 2026 na Gymnáziu Amazon.' if cs else 'Cybersecurity, AI, websites, games, education, and video. We explore ideas through prototypes, competitions, and creative work for clients. Founded in January 2026 at Gymnázium Amazon.'), 42, 646, 511, 10.5, leading=15)
    y -= 22
    facts = [('2.', 'EVOHACKS 2026'), ('3.', 'DemocraTICon 2026'), ('6', 'videí / 3 realitní projekty')] if cs else [('2nd', 'EVOHACKS 2026'), ('3rd', 'DemocraTICon 2026'), ('6', 'videos / 3 property projects')]
    for i, (value, label) in enumerate(facts):
        x = 42 + i * 174
        c.setFillColor(HexColor('#eff5fa')); c.rect(x, y - 59, 163, 62, fill=1, stroke=0)
        paragraph(c, value, x + 12, y - 3, 140, 25, '#182c48', 29, 'Heading')
        paragraph(c, label, x + 12, y - 36, 140, 8.1, leading=11)
    y -= 84
    y = paragraph(c, 'VYBRANÁ PRÁCE' if cs else 'SELECTED WORK', 42, y, 511, 13, '#182c48', 16, 'Heading') - 13
    descriptions = {
      'cs': [
        ('ClearMessage', 'Výzkumný prototyp pro porozumění podezřelým zprávám. 2. místo na EVOHACKS. Veřejné demo přehrává zaznamenaný výsledek.'),
        ('AI videa pro reality', 'Tři projekty a šest videí pro makléřku RE/MAX: možné rekonstrukce, vizualizace staveb a atmosféra života v domě.'),
        ('Weby a školní nástroje', 'Ukázkové weby, Academic Vanguard pro volbu maturitních seminářů a informační web školního výletu Berlín 2026.'),
        ('DOOM Bounce', 'Hra v prohlížeči s vlastními bossy, AI animacemi a hlasy. Experiment s tvorbou hry ve stylu klasického DOOMu.'),
        ('AI rádio', 'MVP ze září 2026. Vysílání je pozastavené; připravujeme udržitelnější verzi, benchmarky modelů a plánovanou publikaci.'),
      ],
      'en': [
        ('ClearMessage', 'A research prototype for understanding suspicious messages. 2nd place at EVOHACKS. The public demo replays a recorded result.'),
        ('AI real estate video', 'Three projects and six videos for a RE/MAX agent: possible renovations, building visualisations, and the atmosphere of a lived-in home.'),
        ('Websites & school tools', 'Website studies, Academic Vanguard for choosing school-leaving exam seminars, and an information site for the Berlin 2026 school trip.'),
        ('DOOM Bounce', 'A browser game with custom bosses, AI animations, and voiceovers. An experiment in building a game inspired by classic DOOM.'),
        ('AI radio', 'September 2026 MVP. Broadcasting is paused while we develop a more sustainable version, benchmark models, and prepare a planned paper.'),
      ],
    }
    for title, text in descriptions[locale]:
        y = paragraph(c, escape(title), 42, y, 511, 11, '#182c48', 14, 'Heading') - 3
        y = paragraph(c, escape(text), 42, y, 511) - 11
    y = paragraph(c, 'LIDÉ A SPOLUPRÁCE' if cs else 'PEOPLE & COLLABORATION', 42, y - 1, 511, 13, '#182c48', 16, 'Heading') - 7
    people = ('Hugo Kubíček vede tým a vytvořil ostatní projekty portfolia. Daniel Voženílek a Vojtěch Čakrt s ním pracovali na DemocraTIConu. Hledáme nové členy, zakázky, stáže, mentoring a podporu konkrétních experimentů.' if cs else 'Hugo Kubíček leads the team and built the other portfolio projects. Daniel Voženílek and Vojtěch Čakrt worked with him on DemocraTICon. We welcome new members, client briefs, internships, mentoring, and support for concrete experiments.')
    y = paragraph(c, people, 42, y, 511)
    assert y > 97, f'Profile content overlaps footer: {locale} {y}'
    c.setStrokeColor(HexColor('#c6d7e6')); c.line(42, 88, 553, 88)
    paragraph(c, f'<link href="mailto:{data["contact"]["email"]}">{data["contact"]["email"]}</link>', 42, 74, 300, 13, '#182c48', 17, 'Heading')
    paragraph(c, '<link href="https://tymtrampolin.cz/">tymtrampolin.cz</link>', 390, 73, 163, 11, '#182c48', 15, 'Heading')
    paragraph(c, 'Výsledky a ukázky: <link href="https://devpost.com/software/clearmessage-ai-phishing-detection">Devpost</link> / <link href="https://www.democraticon.cz/">DemocraTICon</link> / <link href="https://tymtrampolin.cz/cs/projekty/">portfolio</link>' if cs else 'Results and work: <link href="https://devpost.com/software/clearmessage-ai-phishing-detection">Devpost</link> / <link href="https://www.democraticon.cz/">DemocraTICon</link> / <link href="https://tymtrampolin.cz/projects/">portfolio</link>', 42, 48, 511, 8, leading=11)
    c.showPage(); c.save()

def wrap(draw, text, font, width):
    lines, line = [], ''
    for word in text.split():
        test = f'{line} {word}'.strip()
        if draw.textlength(test, font=font) > width and line:
            lines.append(line); line = word
        else: line = test
    if line: lines.append(line)
    return lines

def sharing(locale, project=None):
    img = Image.new('RGB', (1200, 630), INK)
    d = ImageDraw.Draw(img)
    for x in range(24, 1200, 24):
        for y in range(24, 630, 24):
            d.point((x, y), fill='#14253c')
    body = lambda size: ImageFont.truetype(str(body_font), size)
    heading = lambda size: ImageFont.truetype(str(heading_font), size)
    d.rectangle((56, 52, 64, 96), fill=CYAN)
    d.text((82, 51), data['brand'][locale].upper(), font=heading(26), fill='#edf4ff')
    d.text((82, 83), 'PRAGUE // 2026' if locale == 'en' else 'PRAHA // 2026', font=body(16), fill='#9db2cc')
    title = project['text'][locale]['title'] if project else ('STUDENT TECHNOLOGY TEAM' if locale == 'en' else 'STUDENTSKÝ TECHNOLOGICKÝ TÝM')
    tag = project['text'][locale]['category'] if project else ('CYBERSECURITY / AI / CREATIVE WORK' if locale == 'en' else 'KYBERBEZPEČNOST / AI / KREATIVNÍ TVORBA')
    d.text((58, 157), tag.upper(), font=body(19), fill=CYAN)
    font = heading(78)
    while len(wrap(d, title.upper(), font, 1068)) > 2: font = heading(font.size - 2)
    lines = wrap(d, title.upper(), font, 1068)
    for i, line in enumerate(lines): d.text((53, 209 + i * 88), line, font=font, fill='#edf4ff')
    subtitle = project['text'][locale]['status'] if project else ('2nd · EVOHACKS 2026      3rd · DemocraTICon 2026' if locale == 'en' else '2. místo · EVOHACKS 2026      3. místo · DemocraTICon 2026')
    d.text((58, 425), subtitle, font=body(25), fill='#b9cbe2')
    d.line((58, 521, 1142, 521), fill='#293e5c', width=2)
    d.text((58, 550), 'tymtrampolin.cz', font=heading(25), fill=CYAN)
    d.text((865, 554), 'PROJECT / ' + locale.upper() if project else 'PORTFOLIO / ' + locale.upper(), font=body(19), fill='#b9cbe2')
    for i in range(6): d.rectangle((1090 + i * 9, 558, 1094 + i * 9, 578), fill=CYAN if i < 3 else VIOLET)
    img.save(OG / f'{project["id"] if project else "default"}-{locale}.png', optimize=True)

for locale in ('en', 'cs'):
    profile(locale); sharing(locale)
    for project in data['projects']: sharing(locale, project)
shutil.copyfile(PRESS / 'team-profile-cs.pdf', PRESS / 'partner-onepager.pdf')
shutil.copyfile(OG / 'default-en.png', PUBLIC / 'media/og-default.png')
with ZipFile(PRESS / 'press-kit.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ('team-profile-en.pdf', 'team-profile-cs.pdf', 'partner-onepager.pdf', 'logo-trampolin.svg', 'logo-trampolin-dark.svg', *[f'press-foto-{i}.jpg' for i in range(1, 5)]):
        archive.write(PRESS / name, name)
    archive.writestr('README.txt', 'Team Trampolin / Tym Trampolin - October 2026\nContact: ' + data['contact']['email'] + '\nhttps://tymtrampolin.cz\n\nThe photographs document team activities and the 2026 DemocraTICon competition. They are archive photographs, not individual member portraits. Logos retain the current identity. Please contact us about image credits and reuse.\n')
print('Generated EN/CS profiles, legacy PDF alias, media ZIP and 14 localized sharing images.')
