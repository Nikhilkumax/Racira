import * as pdfTools from '../lib/pdf-tools';

/**
 * Service layer acting as an intermediary between the UI components/hooks
 * and the raw PDF processing logic in pdf-lib.
 * All processing is fully client-side.
 */
export const PdfService = {
  ...pdfTools
};

