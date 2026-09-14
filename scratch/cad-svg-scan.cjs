// Static scan: SVG shape elements in CAD tool components that carry a text-* class
// but no stroke= and no fill= attribute (the invisible-shape defect class).
const { readFileSync, readdirSync } = require('fs');
const { resolve } = require('path');
const dirs = [
  'src/domains/cad/components/tools/easy',
  'src/domains/cad/components/tools/medium',
  'src/domains/cad/components/tools',
  'src/domains/cad/components',
  'src/app/cad',
];
const hits = [];
const BACKSLASH = String.fromCharCode(92);
const walk = (d) => {
  let ents;
  try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = resolve(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.tsx')) continue;
    const src = readFileSync(p, 'utf-8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!/<(line|rect|circle|ellipse|path|polygon)\b/.test(line)) return;
      if (/stroke=/.test(line)) return;
      // fill alone is fine (filled shape); flag text-* class with no fill either
      if (/className="text-|className=\{`text-/.test(line) && !/\bfill=/.test(line)) {
        hits.push(p.split(BACKSLASH).join('/') + ':' + (i + 1) + ': ' + line.trim().slice(0, 160));
      }
    });
  }
};
dirs.forEach(walk);
console.log(hits.length ? hits.join('\n') : 'NO static hits: no text-* class without stroke/fill on any SVG shape in CAD');
