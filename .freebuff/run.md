# Racira Next.js — Run Doc

## How to reproduce the uncommitted artifacts

A fresh checkout needs the wasm/worker assets copied from `node_modules` into
`public/` before dev/build can serve the heavy tools (ffmpeg, espeak-ng,
onnxruntime):

```bash
npm install
```

`postinstall` runs `scripts/patch-lamejs.cjs`, `scripts/copy-ffmpeg-core.cjs`,
`scripts/copy-espeak-core.cjs`, and `scripts/copy-ort-wasm.cjs` automatically.
If you ever skip install (e.g. re-clone into an existing `node_modules`), run
the copies explicitly:

```bash
node scripts/patch-lamejs.cjs
node scripts/copy-ffmpeg-core.cjs
node scripts/copy-espeak-core.cjs
node scripts/copy-ort-wasm.cjs
```

These copy the ffmpeg core + class worker to `public/ffmpeg/`, `espeak-ng.wasm`
to `public/`, and the onnxruntime wasm to `public/` — all served same-origin to
satisfy the site-wide `Cross-Origin-Embedder-Policy: require-corp`.

No `.env.local` is required to run the app. The only env-gated surface is
`/finance/admin`, which the middleware locks behind `ADMIN_SECRET` (see
`.env.example`) — the public site runs without it.

## How to run the server

Default dev port is **3002** (hard-coded in the `dev` script):

```bash
npm run dev
```

`predev` re-runs the copy scripts above, then Next starts on
http://localhost:3002 with hot reload.

Detached start (Windows, keeps running after the terminal closes):

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>.out' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

stdout and stderr must go to DIFFERENT files — PowerShell fails if both point
at one path. Note the server answers on `127.0.0.1:3002`; if the port is taken
by a stale process, kill it (or pick a free port with
`npx next dev -p <port>`).

Production build/start:

```bash
npm run build   # prebuild re-runs the copy scripts
npm run start   # serves on 3002
```

NOTE: `next build` exceeds Node's default ~2 GB heap during its type-check
phase on this project (it OOMs with "JavaScript heap out of memory"). Build
with a larger heap instead:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

Also stop the dev server first — dev and build share `.next` and will
corrupt each other's cache if run concurrently.

## Preview checks

- Landing grids render non-live tools as cards with a "Soon" badge
  (e.g. http://localhost:3002/photo).
- Non-live tool pages emit `<meta name="robots" content="noindex, nofollow">`
  (e.g. http://localhost:3002/photo/raw-file-viewer).
- Sitemap tree: http://localhost:3002/sitemap.xml (total ~1,697 URLs; excludes
  all soon tools).
