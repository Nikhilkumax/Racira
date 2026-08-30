/**
 * Real structural tests for extracted Bento engines.
 * form-creator-extraction and redact-engine.
 */
import * as fs from 'fs';
import * as path from 'path';
import { extractFormFields } from '../form-creator-extraction';
import { applyRedactions } from '../redact-engine';
import { PDFDocument } from 'pdf-lib';

const TEST_PDF = path.resolve(__dirname, '../../../../public/pdf/test-files/english-test.pdf');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.log(`  ✗ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, msg: string) {
  if (actual !== expected) {
    console.log(`  ✗ FAIL: ${msg} — expected ${expected}, got ${actual}`);
    failed++;
  } else {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  }
}

// Helper: create a PDF with form fields
async function createPdfWithFormFields(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const form = doc.getForm();

  const textField = form.createTextField('test-text-field');
  textField.addToPage(page, { x: 50, y: 700, width: 200, height: 20 });

  const checkBox = form.createCheckBox('test-checkbox');
  checkBox.addToPage(page, { x: 50, y: 650, width: 20, height: 20 });

  const dropdown = form.createDropdown('test-dropdown');
  dropdown.addOptions(['Option 1', 'Option 2', 'Option 3']);
  dropdown.addToPage(page, { x: 50, y: 600, width: 200, height: 20 });

  return doc.save();
}

async function testFormExtraction() {
  console.log('\n=== extractFormFields: PDF with 3 fields ===');
  const pdfBytes = await createPdfWithFormFields();
  const result = await extractFormFields(pdfBytes);

  assert(result.fields.length === 3, `Expected 3 fields, got ${result.fields.length}`);
  assert(result.fieldNames.includes('test-text-field'), 'Contains test-text-field');
  assert(result.fieldNames.includes('test-checkbox'), 'Contains test-checkbox');
  assert(result.fieldNames.includes('test-dropdown'), 'Contains test-dropdown');

  const textField = result.fields.find(f => f.name === 'test-text-field');
  assert(textField !== undefined, 'TextField found');
  assertEqual(textField?.type, 'text', 'TextField type is text');
  assertEqual(textField?.pageIndex, 0, 'TextField on page 0');
  assert(textField!.width > 0, 'TextField has positive width');
  assert(textField!.height > 0, 'TextField has positive height');

  const checkbox = result.fields.find(f => f.name === 'test-checkbox');
  assert(checkbox !== undefined, 'Checkbox found');
  assertEqual(checkbox?.type, 'checkbox', 'Checkbox type is checkbox');

  const dropdown = result.fields.find(f => f.name === 'test-dropdown');
  assert(dropdown !== undefined, 'Dropdown found');
  assertEqual(dropdown?.type, 'dropdown', 'Dropdown type is dropdown');
  assert(
    JSON.stringify(dropdown?.options) === JSON.stringify(['Option 1', 'Option 2', 'Option 3']),
    'Dropdown has correct options'
  );
}

async function testFormExtractionNoFields() {
  console.log('\n=== extractFormFields: PDF without form fields ===');
  const pdfBytes = fs.readFileSync(TEST_PDF);
  const result = await extractFormFields(new Uint8Array(pdfBytes));

  assertEqual(result.fields.length, 0, 'No fields found');
  assertEqual(result.fieldNames.length, 0, 'No field names');
}

async function testFormExtractionMultiPage() {
  console.log('\n=== extractFormFields: Multi-page PDF ===');
  const doc = await PDFDocument.create();
  const page1 = doc.addPage([612, 792]);
  const page2 = doc.addPage([612, 792]);
  const form = doc.getForm();

  const f1 = form.createTextField('page1-field');
  f1.addToPage(page1, { x: 50, y: 700, width: 200, height: 20 });

  const f2 = form.createTextField('page2-field');
  f2.addToPage(page2, { x: 50, y: 700, width: 200, height: 20 });

  const pdfBytes = await doc.save();
  const result = await extractFormFields(pdfBytes);

  assertEqual(result.fields.length, 2, '2 fields found');
  assertEqual(result.fields[0].pageIndex, 0, 'First field on page 0');
  assertEqual(result.fields[1].pageIndex, 1, 'Second field on page 1');
}

async function testRedactSingle() {
  console.log('\n=== applyRedactions: Single redaction ===');
  const pdfBytes = fs.readFileSync(TEST_PDF);
  const result = await applyRedactions(new Uint8Array(pdfBytes), [
    { pageIndex: 0, x: 10, y: 10, width: 100, height: 20 },
  ]);

  assert(result instanceof Uint8Array, 'Output is Uint8Array');
  assert(result.length > 100, `Output size > 100 bytes (got ${result.length})`);
  const header = Buffer.from(result.slice(0, 5)).toString();
  assertEqual(header, '%PDF-', 'Output starts with %PDF-');

  const loadedDoc = await PDFDocument.load(result);
  const origDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
  assertEqual(loadedDoc.getPageCount(), origDoc.getPageCount(), 'Same page count');
}

async function testRedactMultiple() {
  console.log('\n=== applyRedactions: Multiple redactions ===');
  const pdfBytes = fs.readFileSync(TEST_PDF);
  const result = await applyRedactions(new Uint8Array(pdfBytes), [
    { pageIndex: 0, x: 10, y: 10, width: 50, height: 10 },
    { pageIndex: 0, x: 100, y: 50, width: 80, height: 15 },
    { pageIndex: 0, x: 200, y: 100, width: 60, height: 12 },
  ]);

  assert(result.length > 100, `Output size > 100 bytes (got ${result.length})`);
  const header = Buffer.from(result.slice(0, 5)).toString();
  assertEqual(header, '%PDF-', 'Output is valid PDF');
}

async function testRedactOutOfBounds() {
  console.log('\n=== applyRedactions: Out-of-bounds page ===');
  const pdfBytes = fs.readFileSync(TEST_PDF);
  // Should not throw
  const result = await applyRedactions(new Uint8Array(pdfBytes), [
    { pageIndex: 999, x: 10, y: 10, width: 50, height: 10 },
  ]);

  assert(result instanceof Uint8Array, 'Output is Uint8Array');
  assert(result.length > 100, `Output size > 100 bytes (got ${result.length})`);
}

async function testRedactChangesOutput() {
  console.log('\n=== applyRedactions: Output differs from input ===');
  const pdfBytes = fs.readFileSync(TEST_PDF);
  const withRedactions = await applyRedactions(new Uint8Array(pdfBytes), [
    { pageIndex: 0, x: 50, y: 50, width: 200, height: 30 },
  ]);

  assert(withRedactions.length !== pdfBytes.length, `Output size differs (${pdfBytes.length} vs ${withRedactions.length})`);
}

async function main() {
  console.log('=== Extracted Engine Tests ===');

  await testFormExtraction();
  await testFormExtractionNoFields();
  await testFormExtractionMultiPage();
  await testRedactSingle();
  await testRedactMultiple();
  await testRedactOutOfBounds();
  await testRedactChangesOutput();

  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

main().catch(console.error);
