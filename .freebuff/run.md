# Preview run doc — racira-nextjs

## How to reproduce the artifacts

A fresh checkout needs two things before the dev server will behave correctly:

1. **Dependencies** — install with the project's package manager:
   ```
   npm install
   ```
   `postinstall` runs `scripts/patch-lamejs.cjs` and the three wasm copy
   scripts, so a plain install already reproduces the runtime artifacts.

2. **WASM/runtime artifacts** — `predev` (and `prebuild`) re-run these
   idempotent copy scripts on every start, so no manual step is needed:
   - `node scripts/copy-ffmpeg-core.cjs` → `public/ffmpeg` (from `@ffmpeg/core-mt`)
   - `node scripts/copy-espeak-core.cjs` → `public/espeak` (from `espeak-ng`)
   - `node scripts/copy-ort-wasm.cjs` → `public/ort` (from onnxruntime-web)

   There is no `.env.local` in this repo — no env file is required.

## How to run the server

```
npm run dev
```

- `dev` = `next dev -p 3002` (fixed port 3002; `predev` runs first).
- Expected output: `✓ Ready in ~3s`, then `Local: http://localhost:3002`.
- First request to any route compiles on demand and can take 10–50s
  (13k+ modules); subsequent hits are fast.
- Stop with Ctrl+C. Logs for the preview instance live in
  `.freebuff/preview-*.log` (stdout) and `.freebuff/preview-*.log.err`
  (stderr).
