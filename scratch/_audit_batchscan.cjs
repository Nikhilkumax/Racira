/**
 * Static pre-scan for a given list of component files.
 * Checks: "use client" directive, results-gating (results only after Calculate), suspicious auto-calc.
 * Usage: node scratch/_audit_batchscan.cjs <json-queue-file> <start> <count>
 */
const fs = require('fs');

const [queueFile, startArg, countArg] = process.argv.slice(2);
const start = parseInt(startArg || '0', 10);
const count = parseInt(countArg || '4', 10);
const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
const slice = queue.slice(start, start + count);

for (const item of slice) {
  const file = `src/domains/calculator/components/${item.compName}.tsx`;
  console.log('='.repeat(70));
  console.log(`SLUG: ${item.slug}  (${item.category})  comp: ${item.compName}`);
  if (!fs.existsSync(file)) {
    console.log('  !! FILE MISSING:', file);
    continue;
  }
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  // 1. use client
  const firstChunk = src.slice(0, 200);
  const hasUseClient = /["']use client["']/.test(firstChunk);
  console.log(`  use-client: ${hasUseClient ? 'OK' : 'MISSING'}`);

  // 2. results gating: look for useState<...Result...> or results state + conditional render
  const hasResultsState = /useState<[^>]*Result[^>]*>\(\s*null\s*\)/.test(src) || /useState\(\s*null\s*\)/.test(src);
  // conditional render of results area
  const gatedRender = /\{(?:\s*)?(?:results|result|calc(?:ulation)?s?|res)\s*(?:&&|\?)/.test(src);
  // calculate handler
  const hasCalcHandler = /const handleCalculate|function handleCalculate|const calculate\s*=|onClick=\{handleCalculate\}/.test(src);
  console.log(`  results-state(null-init): ${hasResultsState ? 'OK' : 'check'} | gated-render: ${gatedRender ? 'OK' : 'CHECK'} | calc-handler: ${hasCalcHandler ? 'OK' : 'MISSING'}`);

  // 3. auto-calc suspicion: useEffect calling calculate/setResults on mount or input change
  const effectLines = [];
  lines.forEach((l, i) => {
    if (/useEffect\(/.test(l)) {
      // capture a window
      const win = lines.slice(i, Math.min(i + 8, lines.length)).join(' ');
      if (/setResults|calculate\(|handleCalculate|setCalculated/.test(win)) {
        effectLines.push(i + 1);
      }
    }
  });
  console.log(`  useEffect-with-setResults: ${effectLines.length ? 'SUSPECT lines ' + effectLines.join(',') : 'none'}`);

  // 4. two-column hint
  const twoCol = /grid md:grid-cols|lg:grid-cols-2|md:grid-cols-2|lg:grid-cols-5|grid-cols-\[/.test(src);
  console.log(`  two-col-layout-hint: ${twoCol ? 'likely' : 'single-col?'}`);

  // 5. line count
  console.log(`  lines: ${lines.length}`);
}
