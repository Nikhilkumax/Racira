// import { mdToPdf } from './md-to-pdf';

import { processAndSave } from './duplicate-organize';

import { setupCropperTool } from './cropper';

export const toolLogic: Record<
  string,
  | {
      process?: (...args: unknown[]) => Promise<unknown>;
      setup?: (...args: unknown[]) => Promise<unknown>;
    }
  | ((...args: unknown[]) => unknown)
> = {
  'duplicate-organize': { process: processAndSave },

  cropper: { setup: setupCropperTool },
};
