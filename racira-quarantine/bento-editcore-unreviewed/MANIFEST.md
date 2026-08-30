# Quarantine: BentoPDF editcore/ + BentoPDF-package-importing files

**Quarantined:** 2026-08-23
**Reason:** Step 1 violation — app-shell and/or BentoPDF-package imports extracted into clean processing-logic directory.

## Files

### editcore/ (7 files — entire directory moved)

| File | Size | Why quarantined | Clean logic? |
|------|------|-----------------|--------------|
| `app.js` | 305 KB | App shell: `window.addEventListener`, DOM manipulation, toolbar wiring, zoom controls | **No** — app shell |
| `core.js` | 55 KB | Imports `engine-loader.js` → `bentopdf-pdfium` | **No** — depends on excluded WASM package |
| `engine-loader.js` | 708 B | `import createModule from 'bentopdf-pdfium'` | **No** — BentoPDF vendor package |
| `shadingsurgery.js` | 22 KB | Zero imports, pure PDF shading/pattern surgery | **Yes** — candidates for re-extraction |
| `streamsplice.js` | 23 KB | Imports only `./shadingsurgery` | **Yes** — candidates for re-extraction |
| `tagsurgery.js` | 8 KB | Zero imports, pure PDF tag structure surgery | **Yes** — candidates for re-extraction |
| `type3surgery.js` | 23 KB | Imports only `./shadingsurgery` | **Yes** — candidates for re-extraction |

**Note:** `shadingsurgery.js`, `streamsplice.js`, `tagsurgery.js`, and `type3surgery.js` are pure processing logic with zero external dependencies. They were marked "converted" in the original manifest and could be re-extracted to `src/domains/pdf/lib/bento/editcore/` after removing the three app-shell files. Nothing currently imports them from outside `editcore/`.

### logic/edit-pdf-page.ts (1 file)

| File | Why quarantined |
|------|-----------------|
| `logic/edit-pdf-page.ts` | `import ... from 'bentopdf-pdfium/editcore.wasm'` and `import type { EmbedPdfContainer } from 'bentopdf-viewer'` — both BentoPDF vendor packages not in approved OSS stack |

**Note:** Nothing imports from this file within the bento/ tree. It was blocked in the original manifest.

## Total: 8 files, 422 KB

## Re-extraction candidates

After review, these 4 files from editcore/ can be re-extracted:
1. `shadingsurgery.js` → `src/domains/pdf/lib/bento/editcore/shadingsurgery.js`
2. `streamsplice.js` → `src/domains/pdf/lib/bento/editcore/streamsplice.js`
3. `tagsurgery.js` → `src/domains/pdf/lib/bento/editcore/tagsurgery.js`
4. `type3surgery.js` → `src/domains/pdf/lib/bento/editcore/type3surgery.js`
