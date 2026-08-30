import * as pdfjsLib from 'pdfjs-dist';

// TODO(wiring): Replace with actual pdf.js worker URL for Next.js/webpack.
// In BentoPDF this was: import pdfWorkerUrl from '../pdf.worker?worker&url';
// In Racira, use: new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
// or configure via next.config.js worker support.
const pdfWorkerUrl = typeof window !== 'undefined'
  ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
  : '';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
