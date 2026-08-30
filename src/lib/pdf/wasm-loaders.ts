/**
 * WASM Lazy-Load Infrastructure
 * Phase 3 tools — never eager-load, always dynamic import on first use.
 */

// ── qpdf-wasm ─────────────────────────────────────────────

interface QpdfInstance {
  callMain: (args: string[]) => number;
  FS: {
    writeFile: (path: string, data: Uint8Array | string) => void;
    readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
    unlink: (path: string) => void;
    analyzePath: (path: string) => { exists: boolean };
  };
}

let cachedQpdf: QpdfInstance | null = null;

export async function loadQpdf(): Promise<QpdfInstance> {
  if (cachedQpdf) return cachedQpdf;
  const mod = await import('@neslinesli93/qpdf-wasm');
  const createModule = (mod as any).default || mod;
  cachedQpdf = await createModule({
    locateFile: (file: string) => {
      if (file.endsWith('.wasm')) {
        // Browser: serve from public/wasm/ (copied from node_modules)
        if (typeof window !== 'undefined') {
          return '/wasm/qpdf.wasm';
        }
        // Node/tsx: resolve from node_modules
        try {
          const nodePath = require('path');
          const nodeFs = require('fs');
          let dir = process.cwd();
          while (dir !== nodePath.dirname(dir)) {
            const candidate = nodePath.join(dir, 'node_modules', '@neslinesli93', 'qpdf-wasm', 'dist', 'qpdf.wasm');
            if (nodeFs.existsSync(candidate)) return candidate;
            dir = nodePath.dirname(dir);
          }
        } catch { /* not in node */ }
        return file;
      }
      return file;
    },
  });
  return cachedQpdf!;
}

export async function qpdfProcess(
  inputBytes: Uint8Array,
  args: string[]
): Promise<Uint8Array> {
  const qpdf = await loadQpdf();
  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  try {
    qpdf.FS.writeFile(inputPath, inputBytes);
    qpdf.callMain([inputPath, ...args, outputPath]);
    const output = qpdf.FS.readFile(outputPath);
    return output;
  } finally {
    try {
      if (qpdf.FS.analyzePath(inputPath).exists) qpdf.FS.unlink(inputPath);
      if (qpdf.FS.analyzePath(outputPath).exists) qpdf.FS.unlink(outputPath);
    } catch { /* cleanup best-effort */ }
  }
}

// ── Tesseract.js ──────────────────────────────────────────

let cachedTesseract: any = null;

export async function loadTesseract() {
  if (cachedTesseract) return cachedTesseract;
  const { createWorker } = await import('tesseract.js');
  cachedTesseract = createWorker;
  return cachedTesseract;
}

export async function ocrPdfToText(inputBytes: Uint8Array): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    // Convert first page to image using pdfjs, then OCR
    const pdfjsLib = await import('pdfjs-dist');
    const pdf = await pdfjsLib.getDocument({ data: inputBytes.slice() }).promise;
    let allText = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      // Use OffscreenCanvas if available, else skip in Node
      if (typeof OffscreenCanvas === 'undefined') {
        throw new Error('OCR requires a browser environment with OffscreenCanvas support');
      }
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx as any, viewport }).promise;
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const buffer = await blob.arrayBuffer();
      const { data } = await worker.recognize(new Uint8Array(buffer) as any);
      allText += data.text + '\n\n';
    }
    return allText.trim();
  } finally {
    await worker.terminate();
  }
}

// ── PyMuPDF WASM (CDN) ────────────────────────────────────

const PYMUPDF_CDN = 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/';
let cachedPyMuPDF: any = null;

export async function loadPyMuPDF(): Promise<any> {
  if (cachedPyMuPDF) return cachedPyMuPDF;
  const wrapperUrl = `${PYMUPDF_CDN}dist/index.js`;
  try {
    // Use native import() to bypass webpack's static analysis
    const dynamicImport = new Function('url', 'return import(url)');
    const module = await dynamicImport(wrapperUrl);
    // Bento pattern: new module.PyMuPDF({ assetPath, ghostscriptUrl }) + .load()
    const pymupdfInstance = new module.PyMuPDF({
      assetPath: `${PYMUPDF_CDN}assets/`,
      ghostscriptUrl: `${GS_CDN}gs.js`,
    });
    await pymupdfInstance.load();
    cachedPyMuPDF = pymupdfInstance;
    return cachedPyMuPDF;
  } catch (err: any) {
    console.error('[wasm-loaders] Failed to load PyMuPDF:', err?.message || err);
    throw err;
  }
}

export async function pymupdfConvertToPdf(
  file: File,
  filetype: string
): Promise<Blob> {
  const pymupdf = await loadPyMuPDF();
  return await pymupdf.convertToPdf(file, { filetype });
}

export async function pymupdfCompressPdf(
  file: File,
  options?: any
): Promise<{ blob: Blob; compressedSize: number }> {
  const pymupdf = await loadPyMuPDF();
  return await pymupdf.compressPdf(file, options || {});
}

export async function pymupdfExtractText(
  file: File,
  options?: any
): Promise<string> {
  const pymupdf = await loadPyMuPDF();
  return await pymupdf.extractText(file, options || {});
}

export async function pymupdfExtractTables(
  file: File
): Promise<unknown[]> {
  const pymupdf = await loadPyMuPDF();
  // extractTables doesn't exist on PyMuPDF instance — use open() + findTables()
  const doc = await pymupdf.open(file);
  const pageCount = doc.pageCount;
  const allTables: unknown[] = [];
  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const tables = page.findTables();
    if (tables && tables.forEach) {
      tables.forEach((table: any) => {
        allTables.push(table.rows || []);
      });
    } else if (Array.isArray(tables)) {
      for (const table of tables) {
        allTables.push(table.rows || []);
      }
    }
  }
  return allTables;
}

export async function pymupdfToSvg(
  file: File,
  pageNum: number
): Promise<string> {
  const pymupdf = await loadPyMuPDF();
  // pdfToSvg expects pages as array, returns array of SVGs
  const results = await pymupdf.pdfToSvg(file, [pageNum - 1]); // 1-indexed to 0-indexed
  return results[0] || '';
}

export async function pymupdfRasterizePdf(
  file: File,
  options?: any
): Promise<Blob> {
  const pymupdf = await loadPyMuPDF();
  return await pymupdf.rasterizePdf(file, options || {});
}

export async function pymupdfDeskew(
  file: File
): Promise<Blob> {
  const pymupdf = await loadPyMuPDF();
  const result = await pymupdf.deskewPdf(file);
  // deskewPdf returns { pdf: Blob, result: {...} }
  return result.pdf || result.blob || result;
}

// ── Ghostscript WASM (CDN) ────────────────────────────────

const GS_CDN = 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/';
let cachedGsModule: any = null;

interface GhostscriptModule {
  FS: {
    writeFile: (path: string, data: Uint8Array | string) => void;
    readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
    unlink: (path: string) => void;
  };
  callMain: (args: string[]) => number;
}

export async function loadGhostscript(): Promise<GhostscriptModule> {
  if (cachedGsModule) return cachedGsModule;
  const gsJsUrl = `${GS_CDN}gs.js`;
  const response = await fetch(gsJsUrl);
  const jsText = await response.text();
  const blob = new Blob([jsText], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    const dynamicImport = new Function('url', 'return import(url)');
    const gsModule = await dynamicImport(blobUrl);
    const ModuleFactory = gsModule.default;
    cachedGsModule = await ModuleFactory({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) return `${GS_CDN}gs.wasm`;
        return `${GS_CDN}${path}`;
      },
    });
    return cachedGsModule;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export async function gsConvertFileToOutlines(
  file: File
): Promise<Blob> {
  const gs = await loadGhostscript();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  try {
    gs.FS.writeFile(inputPath, bytes);
    gs.callMain([
      '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite',
      '-dPDFSETTINGS=/prepress',
      '-sOutputFile=' + outputPath,
      inputPath,
    ]);
    const output = gs.FS.readFile(outputPath);
    return new Blob([output.buffer as ArrayBuffer], { type: 'application/pdf' });
  } finally {
    try {
      gs.FS.unlink(inputPath);
      gs.FS.unlink(outputPath);
    } catch { /* cleanup best-effort */ }
  }
}

// ── LibreOffice WASM ──────────────────────────────────────
// Requires COOP/COEP headers — only works from /tools/ route.
const GZIP_MAGIC_FIRST = 0x1f;
const GZIP_MAGIC_SECOND = 0x8b;

async function fetchAsDecompressedUrl(url: string, mimeType: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  let blob = await response.blob();
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] === GZIP_MAGIC_FIRST && head[1] === GZIP_MAGIC_SECOND) {
    const decompressed = blob.stream().pipeThrough(new DecompressionStream('gzip'));
    blob = await new Response(decompressed).blob();
  }
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

let libreOfficeConverter: any = null;

export async function loadLibreOffice(): Promise<any> {
  if (libreOfficeConverter) return libreOfficeConverter;
  const { WorkerBrowserConverter } = await import('@matbee/libreoffice-converter/browser');
  const basePath = '/libreoffice-wasm/';
  const [sofficeWasmUrl, sofficeDataUrl] = await Promise.all([
    fetchAsDecompressedUrl(`${basePath}soffice.wasm.gz`, 'application/wasm'),
    fetchAsDecompressedUrl(`${basePath}soffice.data.gz`, 'application/octet-stream'),
  ]);
  libreOfficeConverter = new WorkerBrowserConverter({
    sofficeJs: `${basePath}soffice.js`,
    sofficeWasm: sofficeWasmUrl,
    sofficeData: sofficeDataUrl,
    sofficeWorkerJs: `${basePath}soffice.worker.js`,
    browserWorkerJs: `${basePath}browser.worker.global.js`,
    verbose: false,
  });
  await libreOfficeConverter.initialize();
  return libreOfficeConverter;
}

export async function libreOfficeConvertToPdf(file: File): Promise<Blob> {
  const converter = await loadLibreOffice();
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const result = await converter.convert(uint8Array, {
    outputFormat: 'pdf',
    inputFormat: ext,
  }, file.name);
  return new Blob([new Uint8Array(result.data)], { type: result.mimeType });
}
