/**
 * Verify the PolymorphicPage routing logic:
 * - "soon" slug + NODE_ENV=production → should render ComingSoonView (not ToolPage)
 * - "live" slug + NODE_ENV=production → should render ToolPage (not ComingSoonView)
 * - "soon" slug + NODE_ENV=development → should render ToolPage (dev bypass)
 *
 * We can't import page.tsx directly (Next.js server components), so we
 * extract the exact conditional logic and test it.
 */
process.env.NODE_ENV = 'production';

import { tools } from '../src/domains/pdf/registry/tools';

const toolBySlug = new Map(tools.map(t => [t.slug, t]));

// Simulate the PolymorphicPage conditional
function getRoute(slug: string, env: string): 'ComingSoonView' | 'ToolPage' | 'not-found' {
  const tool = toolBySlug.get(slug);
  if (!tool) return 'not-found';
  if (tool.status === 'soon' && env !== 'development') return 'ComingSoonView';
  return 'ToolPage';
}

const cases: [string, string, string][] = [
  ['compress-pdf', 'production', 'ComingSoonView'],   // Hard, soon → coming-soon in prod
  ['ocr-pdf', 'production', 'ComingSoonView'],         // Hard, soon → coming-soon in prod
  ['merge', 'production', 'ToolPage'],                 // Easy, live → tool page
  ['compress-pdf', 'development', 'ToolPage'],         // Hard, soon → dev bypass
  ['pdf-to-text', 'production', 'ToolPage'],            // now live (duplicate removed) → tool page
  ['metadata-editor', 'production', 'ToolPage'],       // Medium, live → tool page
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
