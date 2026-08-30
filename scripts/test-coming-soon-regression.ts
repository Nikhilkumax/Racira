import { hasComingSoonPage } from '../src/lib/tools/comingSoonPage';

const tests: [string, { status?: string } | null, string | undefined, boolean][] = [
  ['calculator soon', { status: 'soon' }, 'calculator', true],
  ['pdf soon', { status: 'soon' }, 'pdf', true],
  ['image soon', { status: 'soon' }, 'image', false],
  ['calculator live', { status: 'live' }, 'calculator', false],
  ['null tool', null, 'calculator', false],
  ['no domain', { status: 'soon' }, undefined, false],
];

let passed = 0;
let failed = 0;

for (const [label, tool, domain, expected] of tests) {
  const got = hasComingSoonPage(tool, domain);
  if (got === expected) {
    console.log(`PASS  ${label}: ${got}`);
    passed++;
  } else {
    console.log(`FAIL  ${label}: expected ${expected}, got ${got}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
