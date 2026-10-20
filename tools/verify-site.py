#!/usr/bin/env python3
"""Check the built public site: locale pairs, navigation, links and redirects."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import xml.etree.ElementTree as ET
import argparse
from zipfile import ZipFile
import struct

ROOT = Path(__file__).resolve().parents[1] / 'tym-trampolin-astro'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dist', type=Path, default=ROOT / 'dist')
DIST = parser.parse_args().dist.resolve()
ORIGIN = 'https://tymtrampolin.cz'
PATHS = json.loads((ROOT / 'src/i18n/paths.json').read_text())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, name, attrs):
        self.tags.append((name, dict(attrs)))


def built_file(url):
    path = unquote(urlsplit(url).path)
    return DIST / (path.lstrip('/') + 'index.html' if path.endswith('/') else path.lstrip('/'))


def attr(page, name, **attrs):
    return [a for tag, a in page.tags if tag == name and all(a.get(k) == v for k, v in attrs.items())]


english_projects = sorted(p.name for p in (DIST / 'projects').iterdir() if p.is_dir())
assert len(english_projects) == 6, 'Expected six public project areas'
pairs = [pair for key, pair in PATHS.items() if key != 'missing']
pairs += [{'en': PATHS['projects']['en'] + slug + '/', 'cs': PATHS['projects']['cs'] + slug + '/'} for slug in english_projects]
blog_pairs = {}
for locale, base in PATHS['blog'].items():
    for file in (DIST / base.lstrip('/')).glob('*/index.html'):
        slug = file.parent.name
        blog_pairs.setdefault(slug, {})[locale] = base + slug + '/'
pairs += list(blog_pairs.values())
public_paths = set()
for pair in pairs:
    for locale, path in pair.items():
        public_paths.add(path)
        file = built_file(path)
        assert file.exists(), f'Missing localized page: {path}'
        text = file.read_text()
        page = Page(text)
        is_shake = any('data-shake-article' in item for item in attr(page, 'article'))
        assert attr(page, 'html')[0]['lang'] == locale, f'Incorrect document language: {path}'
        assert len(attr(page, 'h1')) == 1, f'Expected one main heading: {path}'
        ids = [a['id'] for _, a in page.tags if 'id' in a]
        assert len(ids) == len(set(ids)), f'Duplicate element ids: {path}'
        assert 'hugo.kubicek@icloud.com' not in text, f'Obsolete contact: {path}'
        og = attr(page, 'meta', property='og:image')[0]['content']
        assert og.endswith(f'-{locale}.png'), f'Sharing image is not localized: {path}'
        assert built_file(og).is_file(), f'Missing sharing image: {path}'
        if path in ('/music/', '/cs/hudba/'):
            player = next(a for _, a in page.tags if a.get('id') == 'player-card')
            assert 'reveal' not in player.get('class', '').split(), 'Player is hidden by legacy reveal'
            seek = attr(page, 'input', id='progress-bar')[0]
            assert seek.get('type') == 'range' and seek.get('aria-label'), 'Player needs accessible seeking'
        assert attr(page, 'link', rel='canonical')[0]['href'] == ORIGIN + path, f'Incorrect canonical: {path}'
        for lang in pair:
            assert attr(page, 'link', rel='alternate', hreflang=lang)[0]['href'] == ORIGIN + pair[lang], f'Incorrect alternate: {path}'
        declared_languages = {a['hreflang'] for a in attr(page, 'link', rel='alternate') if a.get('hreflang') != 'x-default'}
        assert declared_languages == set(pair), f'Advertises an unpublished translation: {path}'
        assert attr(page, 'link', rel='alternate', hreflang='x-default')[0]['href'] == ORIGIN + pair.get('en', pair.get('cs'))
        if is_shake:
            assert locale == 'en', 'The SHAKE article is English'
            assert attr(page, 'nav', **{'aria-label': 'Magazine navigation'}), 'Missing magazine navigation'
            assert attr(page, 'a', href=PATHS['blog']['en']), 'Missing link back to TT Blog'
            assert 'Print issue forthcoming.' in text, 'Do not claim an unpublished issue has appeared'
            assert 'data-study-challenge' in text and 'data-copy-prompt' in text and 'data-tutor-comparison' in text
            assert '€100 × 1.20 × 0.80' in text and '€96' in text, 'Incorrect challenge solution'
        else:
            switch = [a for a in attr(page, 'a') if a.get('aria-label') in ('Switch to English', 'Přepnout do češtiny')]
            assert {a['href'] for a in switch} == set(pair.values()), f'Language switch loses the page: {path}'
            nav = re.search(r'<div[^>]*data-desktop-nav[^>]*>(.*?)</div>', text, re.S).group(1)
            assert len(re.findall(r'<a\b', nav)) == 5, f'Expected five navigation categories including TT Blog: {path}'
            assert PATHS['blog'][locale] in nav, f'TT Blog is missing from navigation: {path}'
            assert 'radio' not in nav.lower(), f'Radio returned to main navigation: {path}'
        for name, attributes in page.tags:
            for key in ('href', 'src'):
                target = attributes.get(key, '')
                if target.startswith('#'):
                    assert unquote(target[1:]) in ids, f'Missing on-page anchor: {path} -> {target}'
                    continue
                if not target.startswith('/') or target.startswith('//'):
                    continue
                target_file = built_file(target)
                assert target_file.exists(), f'Broken internal {key}: {path} -> {target}'
                fragment = urlsplit(target).fragment
                if fragment and target_file.suffix == '.html':
                    linked = Page(target_file.read_text())
                    assert any(a.get('id') == fragment for _, a in linked.tags), f'Missing anchor: {target}'
        if '/projects/' in path or '/cs/projekty/' in path:
            assert not re.search(r'e-shop|e‑shop|analytický systém|analytics pipeline', text, re.I), f'Retired project is still presented: {path}'
        if any(path in pair.values() for pair in blog_pairs.values()):
            assert any('data-blog-article' in item for item in attr(page, 'article')), f'Missing article body: {path}'
            assert attr(page, 'meta', property='og:type')[0]['content'] == 'article'
            schemas = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', text, re.S)
            posting = next(json.loads(raw) for raw in schemas if json.loads(raw).get('@type') == 'BlogPosting')
            assert posting['inLanguage'] == locale and posting['mainEntityOfPage'] == ORIGIN + path

for locale, path in [('en', '/projects/ai-radio/'), ('cs', '/cs/projekty/ai-radio/')]:
    text = built_file(path).read_text()
    assert ('Broadcasting paused' if locale == 'en' else 'Vysílání pozastaveno') in text
    assert not re.search(r'LIVE /|LIVE ·|24/7|LIVE →', text), 'Radio still claims to broadcast'
    assert 'Hugo Kubíček' in text

for old, target in [('/radio/', '/projects/ai-radio/'), ('/clearmessage/', '/projects/clearmessage/'), ('/projekty/ai-videa/', '/cs/projekty/real-estate-video/'), ('/projekty/eshop/', '/cs/projekty/'), ('/kontakt/', '/cs/spoluprace/')]:
    text = built_file(old).read_text()
    assert target in text and 'http-equiv="refresh"' in text, f'Missing static Pages redirect: {old}'

xml = ET.parse(DIST / 'sitemap-0.xml')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
entries = xml.findall('s:url', ns)
assert {urlsplit(entry.find('s:loc', ns).text).path for entry in entries} == public_paths, 'Sitemap contains a redirect, preview, or missing locale'
for entry in entries:
    path = urlsplit(entry.find('s:loc', ns).text).path
    pair = next(pair for pair in pairs if path in pair.values())
    links = {link.attrib['hreflang']: link.attrib['href'] for link in entry.findall('x:link', ns)}
    assert links == {locale: ORIGIN + target for locale, target in pair.items()}, f'Incorrect sitemap language alternates: {path}'
with ZipFile(DIST / 'press/press-kit.zip') as archive:
    for filename in ('team-profile-en.pdf', 'team-profile-cs.pdf', 'partner-onepager.pdf'):
        current = (DIST / 'press' / filename).read_bytes()
        assert current.startswith(b'%PDF'), f'Invalid profile: {filename}'
        assert archive.read(filename) == current, f'Stale PDF inside media kit: {filename}'
    assert 'team@tymtrampolin.cz' in archive.read('README.txt').decode(), 'Stale media-kit contact'
assert (DIST / 'press/partner-onepager.pdf').read_bytes() == (DIST / 'press/team-profile-cs.pdf').read_bytes(), 'Legacy profile is out of date'
for file in (DIST / 'media/og').glob('*.png'):
    assert struct.unpack('>II', file.read_bytes()[16:24]) == (1200, 630), f'Invalid sharing-image dimensions: {file.name}'
print(f'PASS: {len(public_paths)} localized public pages; matching language switches, metadata, internal assets and links; six project areas; legacy redirects; bilingual sitemap.')
