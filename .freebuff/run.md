# Racira Calculator — run doc

Next.js 14 app (App Router). This workspace IS the main checkout, so node_modules
and env files are already in place — nothing needs copying for the calculator
domain to run.

## Reproduce uncommitted artifacts

None required for the calculator domain.

- `.env.example` exists at the root; the calculator domain runs without a local
  env file. If other domains (PDF, games, etc.) are needed later, copy
  `.env.local` from the main checkout root (same path in this worktree) — never
  symlink it; values such as ports may need adapting.
- Native media helpers (ffmpeg/espeak/ort wasm) are copied into `public/` by the
  package.json `predev`/`prebuild` scripts on first run; they are committed
  build outputs and already present. If missing, they are regenerated
  automatically by `npm run dev`.

## Run the server

```powershell
npm run dev
```

- Script: `next dev -p 3002` — default port **3002**.
- If 3002 is occupied, the running server is likely already this project
  (verify: `Get-CimInstance Win32_Process -Filter 'ProcessId=<pid>'` should show
  `...\node_modules\next\dist\server\lib\start-server.js`); reuse it instead of
  spawning a duplicate. To force a fresh server on another port:
  `npm run dev -- -p 3003`.
- Memory note for builds/typechecks: `NODE_OPTIONS=--max-old-space-size=6144`
  (the project's own `build` script sets this; plain `tsc --noEmit` can OOM on a
  cold incremental cache without it).

### Detached start (Windows / PowerShell)

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

- stdout and stderr MUST go to different files (PowerShell requirement).
- Confirm it survived: `powershell -NoProfile -Command "Get-Process -Id <pid>"`.
- Wait for `http://localhost:3002` to answer (e.g. `curl -s -o NUL -w "%{http_code}"`)
  before registering the preview.

## Sanity check

`http://localhost:3002/calculator/ppf-calculator` should render the PPF
calculator with an empty results column; clicking Calculate fills it
(two-column Mortgage-template layout).
