#!/usr/bin/env ts-node

/**
 * Compare Bento's tool list against Racira's registry.
 * 
 * This script extracts slugs from:
 * 1. Racira's tool registry (src/domains/pdf/registry/tools.ts)
 * 2. Bento's logic files (src/domains/pdf/lib/bento/logic/*.ts)
 * 
 * Outputs a diff showing:
 * - Overlap (tools that exist in both)
 * - Bento-only (tools only in Bento)
 * - Racira-only (tools only in Racira)
 */

import * as fs from 'fs';
import * as path from 'path';

// Extract slugs from Racira's registry
function extractRaciraSlugs(): string[] {
  const registryPath = path.join(__dirname, '../src/domains/pdf/registry/tools.ts');
  const content = fs.readFileSync(registryPath, 'utf-8');
  
  const slugPattern = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs: string[] = [];
  let match;
  
  while ((match = slugPattern.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  
  return [...new Set(slugs)]; // dedupe
}

// Extract tool names from Bento's logic files
function extractBentoTools(): { slug: string; file: string }[] {
  const bentoLogicPath = path.join(__dirname, '../src/domains/pdf/lib/bento/logic');
  const files = fs.readdirSync(bentoLogicPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
  
  const tools: { slug: string; file: string }[] = [];
  
  for (const file of files) {
    // Convert filename to slug
    // e.g., "merge-pdf-page.ts" → "merge-pdf"
    // e.g., "split-pdf-page.ts" → "split-pdf"
    let slug = file.replace(/-page\.(ts|js)$/, '').replace(/\.(ts|js)$/, '');
    
    // Special cases
    if (slug === 'index') continue;
    if (slug === 'compare-render') continue;
    
    tools.push({ slug, file });
  }
  
  return tools;
}

// Normalize slugs for comparison
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Main comparison
function compareToolLists() {
  console.log('=== Bento vs Racira Tool List Comparison ===\n');
  
  const raciraSlugs = extractRaciraSlugs();
  const bentoTools = extractBentoTools();
  const bentoSlugs = bentoTools.map(t => t.slug);
  
  console.log(`Racira registry: ${raciraSlugs.length} slugs`);
  console.log(`Bento logic files: ${bentoSlugs.length} tools\n`);
  
  // Normalize for comparison
  const raciraNormalized = new Map(raciraSlugs.map(s => [normalizeSlug(s), s]));
  const bentoNormalized = new Map(bentoSlugs.map(s => [normalizeSlug(s), s]));
  
  // Find overlaps
  const overlap: string[] = [];
  for (const [norm, orig] of raciraNormalized) {
    if (bentoNormalized.has(norm)) {
      overlap.push(orig);
    }
  }
  
  // Find Bento-only
  const bentoOnly: string[] = [];
  for (const [norm, orig] of bentoNormalized) {
    if (!raciraNormalized.has(norm)) {
      bentoOnly.push(orig);
    }
  }
  
  // Find Racira-only
  const raciraOnly: string[] = [];
  for (const [norm, orig] of raciraNormalized) {
    if (!bentoNormalized.has(norm)) {
      raciraOnly.push(orig);
    }
  }
  
  // Output results
  console.log('--- OVERLAP (tools in both) ---');
  console.log(`Count: ${overlap.length}`);
  overlap.forEach(s => console.log(`  ${s}`));
  
  console.log('\n--- BENTO-ONLY (new tools from Bento) ---');
  console.log(`Count: ${bentoOnly.length}`);
  bentoOnly.forEach(s => console.log(`  ${s}`));
  
  console.log('\n--- RACIRA-ONLY (existing Racira tools) ---');
  console.log(`Count: ${raciraOnly.length}`);
  raciraOnly.forEach(s => console.log(`  ${s}`));
  
  // Write to JSON for further processing
  const report = {
    timestamp: new Date().toISOString(),
    raciraCount: raciraSlugs.length,
    bentoCount: bentoSlugs.length,
    overlap: overlap.sort(),
    bentoOnly: bentoOnly.sort(),
    raciraOnly: raciraOnly.sort(),
    overlapCount: overlap.length,
    bentoOnlyCount: bentoOnly.length,
    raciraOnlyCount: raciraOnly.length,
  };
  
  const outputPath = path.join(__dirname, '../tool-diff-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${outputPath}`);
}

compareToolLists();
