/**
 * Test the updated dev-mode gate:
 *   stubs (not in IMPLEMENTED_SLUGS) → ComingSoonView in dev AND prod
 *   implemented (in IMPLEMENTED_SLUGS) → ToolPage in dev, ComingSoonView in prod
 */
import { tools } from '../src/domains/pdf/registry/tools';
import { IMPLEMENTED_SLUGS } from '../src/domains/pdf/registry/implementedSlugs';

const toolBySlug = new Map(tools.map(t => [t.slug, t]));

function getRoute(slug: string, env: string): 'ComingSoonView' | 'ToolPage' | 'not-found' {
  const tool = toolBySlug.get(slug);
  if (!tool) return 'not-found';
  const isStub = !IMPLEMENTED_SLUGS.has(slug);
  if (tool.status === 'soon' && (isStub || env !== 'development')) return 'ComingSoonView';
  return 'ToolPage';
}

const cases: [string, string, string][] = [
  // Stubs → ComingSoonView in both dev and prod
  ['batch-merge', 'development', 'ComingSoonView'],
  ['batch-merge', 'production', 'ComingSoonView'],
  ['merge-with-toc', 'development', 'ComingSoonView'],
  ['page-range-picker', 'production', 'ComingSoonView'],
  // Implemented → ToolPage in dev, ComingSoonView in prod
  ['compress-pdf', 'development', 'ToolPage'],
  ['compress-pdf', 'production', 'ComingSoonView'],
  ['word-to-pdf', 'development', 'ToolPage'],
  ['word-to-pdf', 'production', 'ComingSoonView'],
  ['ocr-pdf', 'development', 'ToolPage'],
  ['pdf-to-csv', 'development', 'ToolPage'],
  // Live tools → always ToolPage
  ['merge', 'development', 'ToolPage'],
  ['merge', 'production', 'ToolPage'],
  ['pdf-to-text', 'production', 'ToolPage'],  // now live after dedup
];

let passed = 0;
let failed = 0;

for (const [slug, env, expected] of cases) {
  const got = getRoute(slug, env);
  if (got === expected) {
    console.log(`PASS  ${slug} (${env}) → ${got}`);
    passed++;
  } else {
    console.log(`FAIL  ${slug} (${env}) → expected ${expected}, got ${got}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed > 0 ? 1 : 0);
