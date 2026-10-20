"""Generate the article's original 1200×630 social image with Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / 'tools/material-fonts/Archivo-Regular.ttf'
BLUE, INK, MUTED = '#173DA5', '#151923', '#667085'
image = Image.new('RGB', (1200, 630), 'white')
draw = ImageDraw.Draw(image)
font = lambda size: ImageFont.truetype(str(FONT), size)
draw.text((64, 37), 'SHAKE', font=font(32), fill=INK, stroke_width=1)
draw.text((195, 52), 'MAGAZINE / TECHNOLOGY', font=font(12), fill=MUTED)
draw.line((64, 98, 1136, 98), fill='#E6EAF0', width=2)
for index, line in enumerate(['The AI Trick That', 'Works by', 'Refusing to Help You']):
    draw.text((64, 143 + index * 83), line, font=font(64), fill=INK if index < 2 else BLUE, stroke_width=1)
draw.text((66, 438), 'A little less help. A little more thinking.', font=font(23), fill=MUTED)
draw.text((66, 555), 'Hugo Kubíček  ·  2026  ·  TT Blog', font=font(15), fill=MUTED)
for row in range(6):
    for col in range(6):
        x, y = 866 + col * 36, 232 + row * 36
        draw.rectangle((x, y, x + 36, y + 36), fill='#E9EDF4' if (row + col) % 2 else '#F7F8FA')
draw.rounded_rectangle((813, 140, 1118, 304), radius=10, fill='white', outline=INK, width=2)
draw.polygon([(875, 302), (875, 330), (905, 302)], fill='white')
draw.line((875, 302, 875, 330, 905, 302), fill=INK, width=2)
for index, width in enumerate([150, 224, 184]):
    draw.line((842, 180 + index * 19, 842 + width, 180 + index * 19), fill='#C4CCDA', width=3)
draw.line((842, 264, 897, 264), fill=BLUE, width=3)
draw.ellipse((970, 342, 1134, 506), fill='white', outline='#E6EAF0', width=2)
draw.arc((982, 354, 1122, 494), -90, 180, fill=BLUE, width=4)
draw.text((1052, 407), '30', anchor='mm', font=font(48), fill=BLUE)
draw.text((1052, 450), 'SECONDS', anchor='mm', font=font(10), fill=MUTED)
destination = ROOT / 'tym-trampolin-astro/public/media/blog/ai-trick/cover-en.png'
destination.parent.mkdir(parents=True, exist_ok=True)
image.save(destination, optimize=True)
print(destination)
