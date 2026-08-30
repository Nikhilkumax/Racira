/**
 * Stub type for BentoPDF's global state module.
 *
 * In the original BentoPDF, this was a reactive global state module imported as:
 *   import { state } from '../state'
 *
 * In Racira, the processing functions should accept these values as explicit parameters.
 * This stub allows the converted files to compile while the state-to-parameters conversion
 * is deferred to the wiring/adapter phase.
 *
 * TODO: Each function that reads `state.files` or `state.pdfDoc` should be refactored
 * to accept these as explicit parameters during the wiring/adapter phase.
 */

/** @deprecated — Replace with explicit function parameters in the wiring phase. */
export const state: {
  files: File[];
  pdfDoc: Awaited<ReturnType<typeof import('pdf-lib').PDFDocument.load>> | null;
} = {
  files: [],
  pdfDoc: null,
};
