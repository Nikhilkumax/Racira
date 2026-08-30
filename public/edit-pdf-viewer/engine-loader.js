// Patched engine-loader: loads the vendored bentopdf-pdfium WASM directly
const WASM_URL = new URL('./editcore.wasm', import.meta.url).href;
export const ENGINE_BUILD = 'bentopdf-pdfium';

let cachedModule = null;

export async function createEngineModule(options) {
  if (cachedModule) return cachedModule;
  // Import the vendored bentopdf-pdfium ES module
  const { default: createPdfium } = await import('./bentopdf-pdfium.js');
  cachedModule = createPdfium({
    ...(options || {}),
    locateFile: (file, prefix) => {
      if (file.endsWith('.wasm')) return WASM_URL;
      return prefix + file;
    },
  });
  return cachedModule;
}
