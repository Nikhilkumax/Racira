/**
 * Shim for BentoPDF's `src/js/ui.ts`.
 *
 * Provides the same exported call signatures that BentoPDF's logic files expect,
 * backed by Racira's actual UI primitives:
 *   - sonner `toast` for alerts (already wired in the PDF layout)
 *   - DOM-based loader overlay (matches BentoPDF's loader pattern)
 *   - Simple DOM rendering for file display
 *
 * This file is inert dead-code until the wiring phase connects it.
 */

import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────

/** Format byte count to human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ── Loader overlay ─────────────────────────────────────────

const LOADER_ID = 'bento-shim-loader';

function ensureLoaderElement(): HTMLDivElement {
  let el = document.getElementById(LOADER_ID) as HTMLDivElement | null;
  if (el) return el;

  el = document.createElement('div');
  el.id = LOADER_ID;
  el.className =
    'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm';
  el.innerHTML = `
    <div class="flex flex-col items-center gap-3">
      <svg class="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p id="${LOADER_ID}-text" class="text-white text-sm font-medium"></p>
      <div id="${LOADER_ID}-progress-wrap" class="hidden w-64 mt-2">
        <div class="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div id="${LOADER_ID}-progress-bar" class="bg-indigo-500 h-full transition-all duration-300" style="width:0%"></div>
        </div>
        <p id="${LOADER_ID}-progress-text" class="text-xs text-gray-400 mt-1 text-center">0%</p>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

// ── Exported API (matches BentoPDF signatures) ─────────────

/**
 * Show a full-screen loading overlay with optional progress bar.
 * Matches BentoPDF: `showLoader(text?, progress?)`
 */
export const showLoader = (text = 'Loading…', progress?: number): void => {
  const el = ensureLoaderElement();

  const textEl = document.getElementById(`${LOADER_ID}-text`);
  if (textEl) textEl.textContent = text;

  const progressWrap = document.getElementById(`${LOADER_ID}-progress-wrap`);
  const progressBar = document.getElementById(`${LOADER_ID}-progress-bar`);
  const progressText = document.getElementById(`${LOADER_ID}-progress-text`);

  if (progress !== undefined && progress >= 0) {
    progressWrap?.classList.remove('hidden');
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${Math.round(progress)}%`;
  } else {
    progressWrap?.classList.add('hidden');
  }

  el.classList.remove('hidden');
};

/**
 * Hide the loading overlay.
 * Matches BentoPDF: `hideLoader()`
 */
export const hideLoader = (): void => {
  const el = document.getElementById(LOADER_ID);
  if (el) el.classList.add('hidden');
};

/**
 * Show an alert via sonner toast.
 * Matches BentoPDF: `showAlert(title, message, type?, callback?)`
 *
 * BentoPDF's `type` parameter controls modal styling ('error', 'success', 'info').
 * We map it to sonner's variant system.
 */
export const showAlert = (
  title: string,
  message: string,
  type: string = 'error',
  callback?: () => void
): void => {
  const variant =
    type === 'error'
      ? 'error'
      : type === 'success'
        ? 'success'
        : 'default';

  toast[variant === 'error' ? 'error' : variant === 'success' ? 'success' : 'info'](
    title,
    { description: message }
  );

  // Fire callback after a short delay to approximate modal dismiss timing
  if (callback) {
    setTimeout(callback, 300);
  }
};

/**
 * Hide the alert. Since sonner toasts auto-dismiss, this is a no-op
 * for the toast-based implementation. Retained for API compatibility.
 * Matches BentoPDF: `hideAlert()`
 */
export const hideAlert = (): void => {
  // sonner toasts auto-dismiss; no action needed
};

/**
 * Render a list of files into a container element.
 * Matches BentoPDF: `renderFileDisplay(container, files)`
 */
export const renderFileDisplay = (
  container: HTMLElement,
  files: File[]
): void => {
  container.textContent = '';
  for (const file of files) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'truncate font-medium text-gray-200';
    nameSpan.textContent = file.name;

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
    sizeSpan.textContent = formatBytes(file.size);

    fileDiv.append(nameSpan, sizeSpan);
    container.appendChild(fileDiv);
  }
};
