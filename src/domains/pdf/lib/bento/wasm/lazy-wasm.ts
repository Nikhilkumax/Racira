/**
 * WASM Lazy-Loading Infrastructure for Bento PDF Tools
 * 
 * All WASM modules MUST be loaded through this file.
 * Never import WASM binaries directly — always use these lazy loaders.
 * 
 * Pattern: () => import('./path/to/wasm-module.wasm')
 * 
 * NOTE: WASM files will be added when converting HARD-tier tools.
 * Until then, these loaders will throw "Module not found" errors
 * if called — which is the correct behavior (fail fast, fail loud).
 * 
 * EXCLUDED:
 * - PyMuPDF: AGPL license — not in approved OSS stack. Do NOT add.
 * - LibreOffice: Ruled out for Phase 1. Placeholder only — do NOT wire.
 */

// ── Ghostscript WASM ────────────────────────────────────────
let ghostscriptInstance: any = null;

/**
 * Lazy-load Ghostscript WASM.
 * Returns cached instance after first load.
 */
export async function loadGhostscriptWasm(): Promise<any> {
  if (ghostscriptInstance) return ghostscriptInstance;
  
  // Dynamic import — webpack will split this into a separate chunk
  // WASM file will be added when converting HARD-tier tools
  const module = await import('./ghostscript.wasm');
  ghostscriptInstance = module.default || module;
  return ghostscriptInstance;
}

// ── PyMuPDF WASM — EXCLUDED (AGPL license, not in approved OSS stack) ──
// DO NOT add a PyMuPDF loader. This placeholder comment exists only to
// document the exclusion. See approved-oss-stack.md for license details.

// ── pdfium WASM ─────────────────────────────────────────────
let pdfiumInstance: any = null;

/**
 * Lazy-load pdfium WASM.
 * Returns cached instance after first load.
 */
export async function loadPdfiumWasm(): Promise<any> {
  if (pdfiumInstance) return pdfiumInstance;
  
  // WASM file will be added when converting HARD-tier tools
  const module = await import('./pdfium.wasm');
  pdfiumInstance = module.default || module;
  return pdfiumInstance;
}

// ── CoherentPDF WASM ────────────────────────────────────────
let cpdfInstance: any = null;

/**
 * Lazy-load CoherentPDF WASM.
 * Returns cached instance after first load.
 */
export async function loadCoherentPdfWasm(): Promise<any> {
  if (cpdfInstance) return cpdfInstance;
  
  // WASM file will be added when converting HARD-tier tools
  const module = await import('./coherentpdf.wasm');
  cpdfInstance = module.default || module;
  return cpdfInstance;
}

// ── wasm-vips WASM ──────────────────────────────────────────
let vipsInstance: any = null;

/**
 * Lazy-load wasm-vips WASM.
 * Returns cached instance after first load.
 */
export async function loadVipsWasm(): Promise<any> {
  if (vipsInstance) return vipsInstance;
  
  // WASM file will be added when converting HARD-tier tools
  const module = await import('./vips.wasm');
  vipsInstance = module.default || module;
  return vipsInstance;
}

// ── LibreOffice WASM — PHASE 2/3 PLACEHOLDER (ruled out for Phase 1) ──
// LibreOffice WASM is too large for Phase 1. Do NOT wire until Phase 2/3.
// When ready, uncomment and implement the loader below.

// ── Tesseract.js (OCR) ──────────────────────────────────────
let tesseractWorker: any = null;

/**
 * Lazy-load Tesseract.js worker.
 * Returns cached worker after first load.
 */
export async function loadTesseractWorker(): Promise<any> {
  if (tesseractWorker) return tesseractWorker;
  
  // Tesseract.js is an npm package, not a .wasm file
  const { createWorker } = await import('tesseract.js');
  tesseractWorker = await createWorker('eng');
  return tesseractWorker;
}

// ── WASM Registry ───────────────────────────────────────────

export type WasmModule = 
  | 'ghostscript'
  // | 'pymupdf'  — EXCLUDED: AGPL license
  // | 'libreoffice'  — Phase 2/3 only
  | 'pdfium'
  | 'coherentpdf'
  | 'vips'
  | 'tesseract';

const wasmLoaders: Record<WasmModule, () => Promise<any>> = {
  ghostscript: loadGhostscriptWasm,
  // pymupdf: REMOVED — AGPL license, not in approved OSS stack
  pdfium: loadPdfiumWasm,
  coherentpdf: loadCoherentPdfWasm,
  vips: loadVipsWasm,
  // libreoffice: Phase 2/3 only — do NOT wire in Phase 1
  tesseract: loadTesseractWorker,
};

/**
 * Load a WASM module by name.
 * Central entry point for all WASM loading.
 */
export async function loadWasmModule(name: WasmModule): Promise<any> {
  const loader = wasmLoaders[name];
  if (!loader) {
    throw new Error(`Unknown WASM module: ${name}`);
  }
  return loader();
}

/**
 * Get all available WASM module names.
 */
export function getAvailableWasmModules(): WasmModule[] {
  return Object.keys(wasmLoaders) as WasmModule[];
}

/**
 * Check if a WASM module is loaded (cached).
 */
export function isWasmLoaded(name: WasmModule): boolean {
  switch (name) {
    case 'ghostscript': return ghostscriptInstance !== null;
    // case 'pymupdf': REMOVED — AGPL license
    case 'pdfium': return pdfiumInstance !== null;
    case 'coherentpdf': return cpdfInstance !== null;
    case 'vips': return vipsInstance !== null;
    // case 'libreoffice': Phase 2/3 only
    case 'tesseract': return tesseractWorker !== null;
    default: return false;
  }
}
