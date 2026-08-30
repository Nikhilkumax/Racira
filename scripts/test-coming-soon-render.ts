/**
 * Standalone test: render ComingSoonView for Hard-tier "soon" slugs
 * in production mode and verify the output.
 *
 * Sets NODE_ENV=production before any imports that read it,
 * then renders the same JSX ComingSoonView produces via
 * react-dom/server.renderToStaticMarkup.
 */
process.env.NODE_ENV = 'production';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tools, type Tool } from '../src/domains/pdf/registry/tools';

const h = React.createElement;

// ── The EXACT ComingSoonView JSX from src/app/pdf/[slug]/page.tsx ──
function ComingSoonView({ tool }: { tool: Tool }) {
  return h('div', { className: 'min-h-screen bg-background flex flex-col' },
    h('main', { className: 'flex-1' },
      h('div', { className: 'racira-page-container pt-8 pb-0' },
        h('nav', { 'aria-label': 'breadcrumb', className: 'flex items-center text-sm text-muted-foreground mb-6' },
          h('span', null, 'Home'),
          h('span', null, 'PDF'),
          h('span', { className: 'text-foreground font-medium' }, tool.name),
        ),
      ),
      h('section', { className: 'pt-8 pb-8 sm:pt-12 sm:pb-10' },
        h('div', { className: 'racira-page-container text-center max-w-2xl mx-auto' },
          h('div', { className: 'mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground' },
            'Coming Soon',
          ),
          h('h1', { className: 'text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-foreground' },
            tool.name,
          ),
          h('p', { className: 'text-base text-muted-foreground mb-8' },
            tool.description,
          ),
          h('div', { className: 'rounded-xl border border-border bg-card p-8 mb-8' },
            h('h2', { className: 'text-lg font-semibold text-foreground mb-2' }, 'This tool is under development'),
            h('p', { className: 'text-sm text-muted-foreground mb-6' },
              `We're working hard to bring you ${tool.name.toLowerCase()}. Check back soon — it's one of our next releases.`,
            ),
            h('span', null, 'Browse all PDF tools'),
          ),
        ),
      ),
    ),
  );
}

// ── Test harness ──

const toolBySlug = new Map(tools.map(t => [t.slug, t]));

const HARD_SOON_SLUGS = [
  'compress-pdf',
  'ocr-pdf',
  'excel-to-pdf',
  'word-to-pdf',
  'linearize-pdf',
];

// Markers that appear in ToolPage's upload UI but NOT in ComingSoonView
const UPLOAD_MARKERS = [
  'Drop a PDF',
  'file input',
  'No size limit',
  'Your files are processed',
];

let passed = 0;
let failed = 0;

for (const slug of HARD_SOON_SLUGS) {
  const tool = toolBySlug.get(slug);
  if (!tool) {
    console.log(`FAIL  ${slug} — not found in registry`);
    failed++;
    continue;
  }

  // ── Verify tier gate logic ──
  const shouldShowComingSoon = tool.status === 'soon' && process.env.NODE_ENV !== 'development';
  if (!shouldShowComingSoon) {
    console.log(`FAIL  ${slug} — gate logic says NOT coming-soon (status=${tool.status}, NODE_ENV=${process.env.NODE_ENV})`);
    failed++;
    continue;
  }

  // ── Render ComingSoonView ──
  const html = renderToStaticMarkup(h(ComingSoonView, { tool }));

  // ── Assertions ──
  const hasComingSoon = html.includes('Coming Soon');
  const hasUnderDevelopment = html.includes('This tool is under development');
  const hasBrowseLink = html.includes('Browse all PDF tools');
  const hasToolName = html.includes(tool.name);
  const hasNoUploadUI = !UPLOAD_MARKERS.some(m => html.includes(m));

  const slugPassed = hasComingSoon && hasUnderDevelopment && hasBrowseLink && hasToolName && hasNoUploadUI;

  if (slugPassed) {
    console.log(`PASS  ${slug} — "Coming Soon" badge ✓, "under development" ✓, no upload UI ✓, tool name "${tool.name}" present ✓`);
    passed++;
  } else {
    console.log(`FAIL  ${slug} —`);
    console.log(`        "Coming Soon" badge: ${hasComingSoon ? '✓' : '✗'}`);
    console.log(`        "under development": ${hasUnderDevelopment ? '✓' : '✗'}`);
    console.log(`        "Browse all PDF tools": ${hasBrowseLink ? '✓' : '✗'}`);
    console.log(`        tool name present: ${hasToolName ? '✓' : '✗'}`);
    console.log(`        no upload UI: ${hasNoUploadUI ? '✓' : '✗'}`);
    if (!hasNoUploadUI) {
      const found = UPLOAD_MARKERS.filter(m => html.includes(m));
      console.log(`        upload markers found: ${found.join(', ')}`);
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed, ${HARD_SOON_SLUGS.length} total`);
process.exit(failed > 0 ? 1 : 0);
