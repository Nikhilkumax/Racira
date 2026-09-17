/**
 * Full static sweep over the live queue:
 * - "use client" directive present
 * - no "Value A" stub-template UI (fabrication pattern from prior audit)
 * - Calculate handler present
 */
const fs = require('fs');
const queue = JSON.parse(fs.readFileSync('scratch/_audit_live_queue.json', 'utf8'));
const noClient = [];
const stubUI = [];
const noCalc = [];
for (const item of queue) {
  const f = `src/domains/calculator/components/${item.compName}.tsx`;
  let src;
  try { src = fs.readFileSync(f, 'utf8'); } catch (e) { stubUI.push(item.slug + ' (FILE MISSING)'); continue; }
  if (!/["']use client["']/.test(src.slice(0, 200))) noClient.push(item.slug);
  if (/Value A/.test(src)) stubUI.push(item.slug);
  if (!/handleCalculate|const calculate|function calculate|onClick=\{calc/i.test(src)) noCalc.push(item.slug);
}
console.log('queue:', queue.length);
console.log('missing "use client":', noClient.length, noClient);
console.log('stub "Value A" UI:', stubUI.length, stubUI);
console.log('no calculate handler:', noCalc.length, noCalc);
