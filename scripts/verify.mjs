import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../dist/', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');

const required = ['index.html', 'styles.css', 'app.js', 'data.json', 'manifest.webmanifest', 'service-worker.js', 'icons/mirshad.svg', 'archive/Mirshad-AI-Guide-Master-V1.4.html'];
for (const file of required) {
  if (!fs.existsSync(new URL(file, root))) throw new Error(`Missing file: ${file}`);
}

const data = JSON.parse(read('data.json'));
if (Object.keys(data.categories).length !== 21) throw new Error('Expected 21 categories');
if (data.tools.length !== 332) throw new Error('Expected 332 tools');
if (data.workflows.length !== 24) throw new Error('Expected 24 workflows');
if (new Set(data.tools.map((item) => item.id)).size !== data.tools.length) throw new Error('Duplicate tool IDs');
if (new Set(data.tools.map((item) => item.name.toLowerCase())).size !== data.tools.length) throw new Error('Duplicate tool names');
if (new Set(data.workflows.map((item) => item.id)).size !== data.workflows.length) throw new Error('Duplicate workflow IDs');

const html = read('index.html');
for (const id of ['main', 'view-home', 'view-search', 'view-workflows', 'view-tools', 'view-video', 'view-favorites', 'detail-dialog']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing HTML landmark: ${id}`);
}
if (!html.includes('lang="ar" dir="rtl"')) throw new Error('Arabic RTL document settings missing');

const app = read('app.js');
new vm.Script(app, { filename: 'app.js' });
JSON.parse(read('manifest.webmanifest'));

console.log(JSON.stringify({ ok: true, categories: 21, tools: 332, workflows: 24, rtl: true, pwa: true }));
