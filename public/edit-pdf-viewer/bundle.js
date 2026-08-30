const esbuild = require('esbuild');
const path = require('path');

const stubContent = `
export function showAlert(title, message, type, onClose) {
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
    modal.addEventListener('click', (e) => { if (e.target === modal) dismiss(); });
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
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(\`{{\${k}}}\`, String(v));
    }
    return result;
  }
  return key;
}
export async function batchDecryptIfNeeded(files) {
  return [...files];
}
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
`;

esbuild.build({
  entryPoints: [path.join(__dirname, 'public/edit-pdf-viewer/edit-pdf-text-page.ts')],
  bundle: true,
  format: 'esm',
  outfile: path.join(__dirname, 'public/edit-pdf-viewer/edit-pdf-text-page.js'),
  loader: { '.ts': 'ts' },
  define: {
    'import.meta.url': '""',
  },
  plugins: [{
    name: 'bento-stubs',
    setup(build) {
      // Intercept Bento-specific imports and replace with stubs
      const stubs = {
        '../ui.js': stubContent,
        '../ui': stubContent,
        '../i18n/i18n': stubContent,
        '../utils/password-prompt.js': stubContent,
      };
      for (const [mod, content] of Object.entries(stubs)) {
        build.onResolve({ filter: new RegExp(`^${mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }, args => ({
          path: args.path,
          namespace: 'stub-' + args.path,
        }));
        build.onLoad({ filter: /.*/, namespace: 'stub-' + mod }, () => ({
          contents: content,
          loader: 'js',
        }));
      }
    },
  }],
}).then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1); });
