import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../dist/', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');

const required = ['index.html', 'styles.css', 'app.js', 'data.json', 'radar.json', 'guide.json', 'study.html', 'manifest.webmanifest', 'service-worker.js', 'icons/mirshad.svg', 'archive/Mirshad-AI-Guide-Master-V1.4.html'];
for (const file of required) {
  if (!fs.existsSync(new URL(file, root))) throw new Error(`Missing file: ${file}`);
}

const data = JSON.parse(read('data.json'));
const radar = JSON.parse(read('radar.json'));
const guide = JSON.parse(read('guide.json'));
if (Object.keys(data.categories).length !== 21) throw new Error('Expected 21 categories');
if (data.tools.length !== 391) throw new Error('Expected 391 tools');
if (data.workflows.length !== 24) throw new Error('Expected 24 workflows');
if (new Set(data.tools.map((item) => item.id)).size !== data.tools.length) throw new Error('Duplicate tool IDs');
if (new Set(data.tools.map((item) => item.name.toLowerCase())).size !== data.tools.length) throw new Error('Duplicate tool names');
if (new Set(data.workflows.map((item) => item.id)).size !== data.workflows.length) throw new Error('Duplicate workflow IDs');
for (const intent of guide.intents) {
  if (!intent.terms.length || !intent.categories.length) throw new Error(`Incomplete intent: ${intent.id}`);
  for (const category of intent.categories) if (!(category in data.categories)) throw new Error(`Unknown category: ${category}`);
  for (const id of intent.workflowIds) if (!data.workflows.some((workflow) => workflow.id === id)) throw new Error(`Unknown workflow: ${id}`);
}
for (const [name, price] of Object.entries(guide.pricing)) {
  if (!data.tools.some((tool) => tool.name === name)) throw new Error(`Unknown pricing tool: ${name}`);
  if (!price.source.startsWith('https://')) throw new Error(`Pricing source not HTTPS: ${name}`);
}
if (!radar.generatedAt || !radar.cycle || !Array.isArray(radar.updates)) throw new Error('Invalid radar data');
if (new Set(radar.updates.map((item) => item.id)).size !== radar.updates.length) throw new Error('Duplicate radar IDs');
for (const item of radar.updates) {
  for (const key of ['id', 'product', 'category', 'type', 'date', 'priority', 'decision', 'title', 'summary', 'impact', 'contentIdea', 'sourceUrl']) {
    if (!item[key]) throw new Error(`Radar item missing ${key}: ${item.id || 'unknown'}`);
  }
  if (!item.sourceUrl.startsWith('https://')) throw new Error(`Radar source must be HTTPS: ${item.id}`);
}

const html = read('index.html');
for (const id of ['main', 'view-radar', 'view-home', 'view-search', 'view-workflows', 'view-tools', 'view-video', 'view-favorites', 'detail-dialog']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing HTML landmark: ${id}`);
}
if (!html.includes('lang="ar" dir="rtl"')) throw new Error('Arabic RTL document settings missing');
if (!read('study.html').includes('lang="ar" dir="rtl"')) throw new Error('Arabic RTL study missing');
for (const id of ['search-category', 'search-pricing', 'search-evidence', 'search-sort', 'intent-shortcuts']) if (!html.includes(`id="${id}"`)) throw new Error(`Missing search control: ${id}`);

const app = read('app.js');
new vm.Script(app, { filename: 'app.js' });
JSON.parse(read('manifest.webmanifest'));

console.log(JSON.stringify({ ok: true, categories: 21, tools: 391, workflows: 24, radarUpdates: radar.updates.length, rtl: true, pwa: true }));
