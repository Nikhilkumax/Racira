import { readFileSync } from 'fs';

const src = readFileSync('src/domains/pdf/registry/tools.ts', 'utf-8');
const lines = src.split('\n');

// Map slug → [{ line, status }]
const slugMap = new Map<string, { line: number; status: string }[]>();

for (let i = 0; i < lines.length; i++) {
  const slugMatch = /slug:\s*'([^']+)'/.exec(lines[i]);
  if (!slugMatch) continue;
  const slug = slugMatch[1];
  // Find status on the same line
  const statusMatch = /status:\s*'([^']+)'/.exec(lines[i]);
  const status = statusMatch ? statusMatch[1] : '(shared line)';
  if (!slugMap.has(slug)) slugMap.set(slug, []);
  slugMap.get(slug)!.push({ line: i + 1, status });
}

const dupes = [...slugMap.entries()]
  .filter(([, entries]) => entries.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log('| Slug | Occurrences | Line #s | Statuses |');
console.log('|------|-------------|---------|----------|');
for (const [slug, entries] of dupes) {
  const lineNums = entries.map(e => `L${e.line}`).join(', ');
  const statuses = entries.map(e => e.status).join(', ');
  console.log(`| ${slug} | ${entries.length} | ${lineNums} | ${statuses} |`);
}
console.log(`\nTotal slugs with duplicates: ${dupes.length}`);
console.log(`Total extra occurrences (beyond 1st): ${dupes.reduce((s, [, e]) => s + e.length - 1, 0)}`);
