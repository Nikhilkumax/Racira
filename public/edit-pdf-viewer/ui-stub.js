// Stubs for Bento-specific imports that edit-pdf-text-page.ts needs.
// showAlert → simple alert dialog in the iframe
// showLoader/hideLoader → show/hide a spinner overlay
// t() → passthrough (no i18n in standalone mode)
// batchDecryptIfNeeded → passthrough (assume unencrypted)

export function showAlert(title, message, _type, onClose) {
  const modal = document.getElementById('alert-modal');
  const titleEl = document.getElementById('alert-title');
  const msgEl = document.getElementById('alert-message');
  if (modal && titleEl && msgEl) {
    titleEl.textContent = title || 'Alert';
    msgEl.textContent = message || '';
    modal.classList.remove('hidden');
    const ok = document.getElementById('alert-ok');
    const dismiss = () => {
      modal.classList.add('hidden');
      ok?.removeEventListener('click', dismiss);
      modal.removeEventListener('click', dismiss);
      if (onClose) onClose();
    };
    ok?.addEventListener('click', dismiss);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) dismiss();
    });
  }
}

let loaderCount = 0;
export function showLoader(text) {
  loaderCount++;
  const modal = document.getElementById('loader-modal');
  const txt = document.getElementById('loader-text');
  if (modal) modal.classList.remove('hidden');
  if (txt && text) txt.textContent = text;
}
export function hideLoader() {
  loaderCount = Math.max(0, loaderCount - 1);
  if (loaderCount === 0) {
    const modal = document.getElementById('loader-modal');
    if (modal) modal.classList.add('hidden');
  }
}

export function t(key, params) {
  // Simple passthrough — return key or interpolated string
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(`{{${k}}}`, String(v));
    }
    return result;
  }
  return key;
}

export async function batchDecryptIfNeeded(files) {
  // Assume files are not encrypted
  return [...files];
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
