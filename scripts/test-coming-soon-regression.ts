import { hasComingSoonPage } from '../src/lib/tools/comingSoonPage';

/**
 * Regression lock for the "does this tool have a real Coming Soon page?" gate.
 *
 * The rule is one-directional: a domain appears here as `true` only if its
 * [slug] route renders the shared Coming Soon template for non-live slugs. A
 * `false` row means non-live tools must stay non-clickable (their route 404s),
 * which is why "games" is pinned to false.
 */
const tests: [string, { status?: string } | null, string | undefined, boolean][] = [
  ['calculator soon', { status: 'soon' }, 'calculator', true],
  ['pdf soon', { status: 'soon' }, 'pdf', true],
  ['developers soon', { status: 'soon' }, 'developers', true],
  ['3d soon', { status: 'soon' }, '3d', true],
  ['animator soon', { status: 'soon' }, 'animator', true],
  ['audio soon', { status: 'soon' }, 'audio', true],
  ['cad soon', { status: 'soon' }, 'cad', true],
  ['design soon', { status: 'soon' }, 'design', true],
  ['image soon', { status: 'soon' }, 'image', true],
  ['photo soon', { status: 'soon' }, 'photo', true],
  ['productivity soon', { status: 'soon' }, 'productivity', true],
  ['seo soon', { status: 'soon' }, 'seo', true],
  ['typography soon', { status: 'soon' }, 'typography', true],
  ['video soon', { status: 'soon' }, 'video', true],
  ['writing soon', { status: 'soon' }, 'writing', true],
  ['games soon (no Coming Soon page by design)', { status: 'soon' }, 'games', false],
  ['colors soon (no non-live tools)', { status: 'soon' }, 'colors', false],
  ['voice soon (no non-live tools)', { status: 'soon' }, 'voice', false],
  ['calculator live', { status: 'live' }, 'calculator', false],
  ['photo live', { status: 'live' }, 'photo', false],
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
