const fs = require('fs');
const { execSync } = require('child_process');

// Step 1: Generate TypeScript from JSON files
const jsonFiles = [
  'scratch/seo-convert-to-pdf.json',
  'scratch/seo-combined-small.json',
  'scratch/seo-forms-sig.json',
  'scratch/seo-info-inspect.json',
];

jsonFiles.forEach(f => {
  console.log('Converting ' + f + '...');
  execSync('npx tsx scripts/json-to-seo.ts ' + f, { encoding: 'utf8' });
});

// Step 2: Convert Organize PDF TS to JSON-compatible format
// Read the existing TS file and extract const declarations
const organizeTs = fs.readFileSync('scratch/seo-organize-batch-v2.ts', 'utf8');
const convertFromPdfTs = fs.readFileSync('scratch/seo-convert-from-pdf-batch.ts', 'utf8');
const convertFromPdfTemplate = fs.readFileSync('scratch/seo-convert-from-pdf-template.ts', 'utf8');

// Step 3: Build the complete tool-seo.ts
const base = fs.readFileSync('src/domains/pdf/registry/tool-seo.ts', 'utf8');

// Collect all generated TypeScript
const generatedFiles = [
  'scratch/seo-convert-to-pdf-generated.ts',
  'scratch/seo-combined-small-generated.ts',
  'scratch/seo-forms-sig-generated.ts',
  'scratch/seo-info-inspect-generated.ts',
];

let allGenerated = '';

// Add Organize PDF content (from TS file)
allGenerated += '// ── Organize PDF batch ──\n';
allGenerated += organizeTs.replace(/^\/\*[\s\S]*?\*\/\n/, '').trim() + '\n\n';

// Add Convert from PDF content (from TS files)
allGenerated += '// ── Convert from PDF batch ──\n';
allGenerated += convertFromPdfTemplate.replace(/^\/\*[\s\S]*?\*\/\n/, '').trim() + '\n\n';
allGenerated += convertFromPdfTs.replace(/^\/\*[\s\S]*?\*\/\n/, '').trim() + '\n\n';

// Add other batches from generated files
generatedFiles.forEach(f => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    allGenerated += content.trim() + '\n\n';
  }
});

// Step 4: Build the full explicitSeo registrations
const registrations = [];

// Organize PDF registrations
const organizeRegEx = /const (seo\w+): ToolSeo/g;
let m;
const organizeConsts = [];
const organizeSrc = organizeTs;
while ((m = organizeRegEx.exec(organizeSrc)) !== null) organizeConsts.push(m[1]);

// Extract slug mappings from the organize file
const organizeSlugs = [
  ['add-margin', 'seoAddMargin'], ['add-page-labels', 'seoAddPageLabels'],
  ['add-page-numbers', 'seoAddPageNumbers'], ['bates-numbering', 'seoBatesNumbering'],
  ['bookmark-pdf', 'seoBookmarkPdf'], ['crop-pages', 'seoCropPages'],
  ['divide-pages', 'seoDividePages'], ['edit-attachments', 'seoEditAttachments'],
  ['extract-pages', 'seoExtractPages'], ['headers-footers', 'seoHeadersFooters'],
  ['insert-blank-pages', 'seoInsertBlankPages'], ['keep-nth-page', 'seoKeepNthPage'],
  ['organize-pages', 'seoOrganizePages'], ['pdf-multi-tool', 'seoPdfMultiTool'],
  ['posterize', 'seoPosterize'], ['replace-page', 'seoReplacePage'],
  ['rotate-custom', 'seoRotateCustom'], ['split-every-n', 'seoSplitEveryN'],
  ['split-odd-even', 'seoSplitOddEven'], ['table-of-contents', 'seoTableOfContents'],
  ['tint-pages', 'seoTintPages'],
];

// Convert from PDF registrations
const convertFromSlugs = [
  ['pdf-to-text', 'seoPdfToText'], ['pdf-to-bmp', 'seoPdfToBmp'],
  ['pdf-to-cbz', 'seoPdfToCbz'], ['pdf-to-epub', 'seoPdfToEpub'],
  ['pdf-to-html', 'seoPdfToHtml'], ['pdf-to-image', 'seoPdfToImage'],
  ['pdf-to-markdown', 'seoPdfToMarkdown'], ['pdf-to-odt', 'seoPdfToOdt'],
  ['pdf-to-png', 'seoPdfToPng'], ['pdf-to-powerpoint', 'seoPdfToPowerpoint'],
  ['pdf-to-rtf', 'seoPdfToRtf'], ['pdf-to-tiff', 'seoPdfToTiff'],
  ['pdf-to-webp', 'seoPdfToWebp'], ['pdf-to-word', 'seoPdfToWord'],
  ['pdf-to-xml', 'seoPdfToXml'],
];

// Convert to PDF registrations
const convertToSlugs = [
  ['text-to-pdf', 'seoTextToPdf'], ['html-to-pdf', 'seoHtmlToPdf'],
  ['csv-to-pdf', 'seoCsvToPdf'], ['rtf-to-pdf', 'seoRtfToPdf'],
  ['svg-to-pdf', 'seoSvgToPdf'],
];

// Combined small batch registrations
const combinedSlugs = [
  ['unlock', 'seoUnlock'], ['set-owner-password', 'seoSetOwnerPassword'],
  ['validate-signature', 'seoValidateSignature'], ['timestamp-pdf', 'seoTimestampPdf'],
  ['n-up-layout', 'seoNUpLayout'], ['create-booklet', 'seoCreateBooklet'],
  ['duplex-simulator', 'seoDuplexSimulator'], ['add-text-box', 'seoAddTextBox'],
  ['compare-pdfs', 'seoComparePdfs'],
];

// Forms & Signatures registrations
const formsSlugs = [
  ['form-field-extract', 'seoFormFieldExtract'], ['remove-signatures', 'seoRemoveSignatures'],
  ['sign-pdf', 'seoSignPdf'], ['uniform-page-size', 'seoUniformPageSize'],
  ['highlight-form-fields', 'seoHighlightFormFields'],
];

// Info & Inspection registrations
const infoSlugs = [
  ['extract-hyperlinks', 'seoExtractHyperlinks'], ['extract-headings', 'seoExtractHeadings'],
  ['extract-email-addresses', 'seoExtractEmailAddresses'], ['extract-phone-numbers', 'seoExtractPhoneNumbers'],
  ['extract-tables', 'seoExtractTables'], ['pdf-size-analyzer', 'seoPdfSizeAnalyzer'],
  ['version-checker', 'seoVersionChecker'], ['attachment-inspector', 'seoAttachmentInspector'],
  ['pdf-statistics', 'seoPdfStatistics'], ['view-metadata', 'seoViewMetadata'],
  ['page-dimensions', 'seoPageDimensions'], ['certificate-inspector', 'seoCertificateInspector'],
];

// Pilot batch registrations (already in the file)
const pilotSlugs = [
  ['merge', 'mergeSeo'],
];

// Batch 1 registrations (already in the file)
const batch1Slugs = [
  ['split', 'splitSeo'], ['compress', 'compressSeo'], ['rotate', 'rotateSeo'],
];

// Build the explicitSeo block
let explicitSeoBlock = 'const explicitSeo: Record<string, ToolSeo> = {\n';

function addReg(slug, varName) {
  explicitSeoBlock += '  "' + slug + '": ' + varName + ',\n';
}

explicitSeoBlock += '  /* ── Pilot batch v2 ── */\n';
pilotSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Batch 1 (existing) ── */\n';
batch1Slugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Organize PDF batch ── */\n';
organizeSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Convert from PDF batch ── */\n';
convertFromSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Convert to PDF batch ── */\n';
convertToSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Combined small batch ── */\n';
combinedSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Forms & Signatures batch ── */\n';
formsSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '\n  /* ── Info & Inspection batch ── */\n';
infoSlugs.forEach(([s, v]) => addReg(s, v));

explicitSeoBlock += '};\n';

// Step 5: Assemble the final file
// Insert all generated const declarations before explicitSeo
const insertPoint = base.indexOf('const explicitSeo');
const before = base.slice(0, insertPoint);
const after = base.slice(insertPoint);

// Replace the explicitSeo block
const afterExplicitSeo = after.replace(/const explicitSeo[\s\S]*?};/, explicitSeoBlock);

const final = before + allGenerated + '\n\n' + afterExplicitSeo;

// Deduplicate consecutive };
const lines = final.split('\n');
const deduped = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '};' && i > 0 && lines[i-1].trim() === '};') continue;
  deduped.push(lines[i]);
}

fs.writeFileSync('src/domains/pdf/registry/tool-seo.ts', deduped.join('\n'), 'utf8');
console.log('Rebuilt tool-seo.ts with all ' + (organizeSlugs.length + convertFromSlugs.length + convertToSlugs.length + combinedSlugs.length + formsSlugs.length + infoSlugs.length + pilotSlugs.length + batch1Slugs.length) + ' tools');
