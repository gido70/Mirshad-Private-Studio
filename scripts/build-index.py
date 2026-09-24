"""Extract searchable sections from the archived research index without altering it."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'
SOURCE = DIST / 'archive' / 'Mirshad-AI-Guide-Master-V1.4.html'
OUTPUT = DIST / 'index-sections.json'


class Sections(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.hidden = 0
        self.heading = 0
        self.rows = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'svg'):
            self.hidden += 1
        if tag == 'section':
            row = {'id': attrs.get('id'), 'title': '', 'parts': []} if attrs.get('id') else None
            self.stack.append(row)
            if row is not None:
                self.rows.append(row)
        if tag in ('h2', 'h3'):
            self.heading += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'svg'):
            self.hidden = max(0, self.hidden - 1)
        if tag in ('h2', 'h3'):
            self.heading = max(0, self.heading - 1)
        if tag == 'section' and self.stack:
            self.stack.pop()

    def handle_data(self, value):
        if self.hidden or not self.stack:
            return
        row = next((item for item in reversed(self.stack) if item is not None), None)
        if row is None:
            return
        value = re.sub(r'\s+', ' ', value).strip()
        if value:
            row['parts'].append(value)
            if self.heading and not row['title']:
                row['title'] = value


parser = Sections()
parser.feed(SOURCE.read_text(encoding='utf-8'))
sections = []
for row in parser.rows:
    body = ' '.join(row['parts'])
    if row['id'] and row['title'] and len(body) >= 80:
        sections.append({'id': row['id'], 'title': row['title'], 'text': body})
result = json.dumps({'source': 'الإندكس الأصلي V1.4', 'path': './archive/Mirshad-AI-Guide-Master-V1.4.html', 'sections': sections}, ensure_ascii=False, indent=2) + '\n'
if '--check' in sys.argv:
    if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != result:
        raise SystemExit('index-sections.json is stale; run python3 scripts/build-index.py')
else:
    OUTPUT.write_text(result, encoding='utf-8')
print(f'Indexed {len(sections)} sections from the original index')
