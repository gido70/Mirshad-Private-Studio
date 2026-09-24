import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const sourcePath = process.argv[2];
const outputPath = process.argv[3];

if (!sourcePath || !outputPath) {
  throw new Error('Usage: node extract-data.mjs <source-html> <output-json>');
}

const html = fs.readFileSync(sourcePath, 'utf8');

function literalBetween(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing marker: ${startMarker}`);
  const literalStart = start + startMarker.length;
  const end = html.indexOf(endMarker, literalStart);
  if (end < 0) throw new Error(`Missing marker: ${endMarker}`);
  return html.slice(literalStart, end).trim();
}

const categories = vm.runInNewContext(`(${literalBetween('const categories =', ';\n    const tools =')})`);
const toolRows = vm.runInNewContext(`(${literalBetween('const tools =', '].map(([name,category,kind,access,evidence,note,url])')}] )`);
const workflowRows = vm.runInNewContext(`(${literalBetween('const workflows =', '].map(([title,input,steps,gate,risk,human],i)')}] )`);

const tools = toolRows.map(([name, category, kind, access, evidence, note, url], index) => ({
  id: index + 1,
  name,
  category,
  categoryLabel: categories[category] || category,
  kind,
  access,
  evidence,
  note,
  url,
  status: evidence === 'H' ? 'حجر تحقق' : evidence === 'C' ? 'يحتاج اختبارًا' : 'مرشح نشط'
}));

const workflows = workflowRows.map(([title, input, steps, gate, risk, human], index) => ({
  id: index + 1,
  title,
  input,
  steps,
  gate,
  risk,
  human
}));

const payload = {
  version: '1.0.0',
  sourceVersion: 'V1.4',
  generatedAt: new Date().toISOString(),
  categories,
  tools,
  workflows
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ categories: Object.keys(categories).length, tools: tools.length, workflows: workflows.length }));
