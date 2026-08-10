// scratch-apply-kokoro-step5.cjs
// TIER 2 STEP 5c: refine the locateFile wiring injected in Step 2.
//
// Run after this, as with every previous step:
//     npx patch-package kokoro-js
// which regenerates patches/kokoro-js+1.2.1.patch from the current tree — it
// does NOT create a fourth patch file.
//
// Idempotent (guarded on __RACIRA_ESPEAK_BASE_URL); every replacement asserts
// exactly one match before writing. Same discipline as Steps 2-4.
//
// Step 2 already routed the wasm through Module.locateFile, and that mechanism
// is proven. Two things about the SHAPE are worth fixing now that it is being
// wired into the real build:
//
// ---------------------------------------------------------------------------
// FIX 1 — named base URL, mirroring ffmpegEngine.ts
//
// src/domains/audio/lib/ffmpegEngine.ts:22 establishes the repo pattern:
//     const CORE_BASE_URL = "/ffmpeg";
//     const CLASS_WORKER_URL = `${CORE_BASE_URL}/ffmpeg-worker.js`;
// A named constant, then interpolation. Step 2 inlined "/espeak/"+f instead.
// Behaviourally identical; this aligns the shape so the served path has one
// definition rather than a literal buried mid-expression.
//
// ---------------------------------------------------------------------------
// FIX 2 — the guard misses Web Workers (latent, not currently firing)
//
// Step 2 wrote:  if (typeof window !== "undefined")
// `window` is undefined inside a Web Worker, where the global is `self`. In a
// worker the guard is false, locateFile is never set, and espeak-ng falls
// through to `new URL('espeak-ng.wasm', import.meta.url)` (espeak-ng.js:756) —
// which next.config.mjs's `url: false` prevents webpack from ever emitting. The
// wasm request would 404 at runtime.
//
// This does NOT fire today: src/domains/voice/lib/kokoroEngine.ts:19 loads
// kokoro-js with a plain dynamic import on the main thread, and grepping
// src/domains/voice for `new Worker` returns nothing. So today `window` is
// always defined when this runs.
//
// It is patched anyway because moving Kokoro into a worker is a plausible next
// move — WebGPU inference on the main thread is exactly what one offloads — and
// the failure it would cause is a runtime 404 inside a worker, about as far
// from the edit that caused it as a bug can get.
//
// Node still takes the default path: Node does not define a global `self`, so
// the espeak-ng verification scripts keep resolving the wasm from node_modules.
// ---------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "node_modules", "kokoro-js", "dist");

if (!fs.existsSync(DIST)) {
  console.log("[kokoro-step5] kokoro-js not found, skipping");
  process.exit(0);
}

function replaceOnce(src, find, repl, label, file) {
  const parts = src.split(find);
  const n = parts.length - 1;
  if (n !== 1) {
    console.error(`[kokoro-step5] ABORT — ${file}: "${label}" matched ${n} times, expected exactly 1.`);
    console.error(`  looked for: ${find}`);
    process.exit(1);
  }
  return parts.join(repl);
}

const EDITS = [
  [
    "base URL constant",
    `let __raciraEspeakModule=null;`,
    `const __RACIRA_ESPEAK_BASE_URL="/espeak";\nlet __raciraEspeakModule=null;`,
  ],
  [
    "locateFile guard + base URL",
    `if(typeof window!=="undefined"){opts.locateFile=(f)=>"/espeak/"+f}`,
    `if(typeof window!=="undefined"||typeof self!=="undefined"){opts.locateFile=(f)=>\`\${__RACIRA_ESPEAK_BASE_URL}/\${f}\`}`,
  ],
];

let patched = 0;
for (const file of ["kokoro.js", "kokoro.cjs", "kokoro.web.js"]) {
  const p = path.join(DIST, file);
  if (!fs.existsSync(p)) {
    console.log(`[kokoro-step5] ${file} not present, skipping`);
    continue;
  }
  let src = fs.readFileSync(p, "utf8");

  if (!src.includes("__raciraEspeakModule")) {
    console.log(`[kokoro-step5] ${file} has no espeak helper (expected for kokoro.web.js), skipping`);
    continue;
  }
  if (src.includes("__RACIRA_ESPEAK_BASE_URL")) {
    console.log(`[kokoro-step5] ${file} already patched, skipping`);
    continue;
  }

  for (const [label, find, repl] of EDITS) {
    src = replaceOnce(src, find, repl, label, file);
  }

  fs.writeFileSync(p, src);
  console.log(`[kokoro-step5] Patched ${file} (${EDITS.length} edits)`);
  patched++;
}

console.log(`\n[kokoro-step5] Done (${patched} file(s)). Next:  npx patch-package kokoro-js`);
