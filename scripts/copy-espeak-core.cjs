const fs = require("fs");
const path = require("path");

// espeak-ng.wasm has to be served as a static, same-origin asset out of public/.
//
// Two separate reasons, both load-bearing:
//
// 1. Keeping it away from webpack. espeak-ng resolves its wasm with
//    `new URL('espeak-ng.wasm', import.meta.url)`
//    (node_modules/espeak-ng/dist/espeak-ng.js:756). next.config.mjs sets
//    module.parser.javascript.url = false — load-bearing for ffmpeg/onnxruntime —
//    which stops webpack turning that into an emitted asset, so the file would
//    simply never be produced. espeak-ng checks Module['locateFile'] FIRST
//    (espeak-ng.js:750-752), and the kokoro-js patch supplies it, so the wasm is
//    fetched at runtime from a path webpack never sees. Same trick, and the same
//    reasoning, as classWorkerURL in copy-ffmpeg-core.cjs.
//
// 2. COEP. next.config.mjs sends Cross-Origin-Embedder-Policy: require-corp
//    site-wide. require-corp only constrains CROSS-origin subresources, so
//    self-hosting sidesteps needing a CDN to send permissive CORS headers.
//
// One file only: the espeak-ng-data dictionaries are compiled into the wasm with
// --embed-file, so there is no sidecar .data to copy. Checked against
// node_modules/espeak-ng/dist/, which contains exactly espeak-ng.js + .wasm.
//
// Runs on postinstall and again before dev/build, so a fresh clone, a fresh
// install, or a bumped espeak-ng version all end up with the right file.

const destDir = path.join(__dirname, "..", "public", "espeak");
const nodeModules = path.join(__dirname, "..", "node_modules");

const espeakDir = path.join(nodeModules, "espeak-ng", "dist");

/** [sourceDir, sourceName, destName] */
const FILES = [
  // Name must stay as-is: locateFile is called with the bare filename
  // 'espeak-ng.wasm' and the patch maps it to /espeak/<that name>.
  [espeakDir, "espeak-ng.wasm", "espeak-ng.wasm"],
];

if (!fs.existsSync(espeakDir)) {
  console.log("[espeak-core] espeak-ng package not found, skipping copy");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

let copied = 0;
let missing = 0;

for (const [srcDir, srcName, destName] of FILES) {
  const src = path.join(srcDir, srcName);
  const dest = path.join(destDir, destName);

  if (!fs.existsSync(src)) {
    console.error(`[espeak-core] MISSING in node_modules: ${srcName}`);
    missing++;
    continue;
  }

  // Skip identical files so repeated dev starts don't rewrite ~18 MB each time.
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest)) {
    const destStat = fs.statSync(dest);
    if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
      continue;
    }
  }

  fs.copyFileSync(src, dest);
  console.log(`[espeak-core] Copied ${destName} (${(srcStat.size / 1024).toFixed(0)} KB)`);
  copied++;
}

if (missing > 0) {
  console.error(
    `[espeak-core] ${missing} file(s) missing — non-English phonemization will fail to load`,
  );
  process.exit(1);
}

// A truncated or HTML-substituted wasm would still satisfy the size/mtime skip
// above on a later run, so confirm the magic bytes rather than mere presence.
// \0asm + version 1. Cheap, and it catches the failure mode that would otherwise
// surface as an opaque WebAssembly.instantiate error in the browser.
const finalPath = path.join(destDir, "espeak-ng.wasm");
if (fs.existsSync(finalPath)) {
  const fd = fs.openSync(finalPath, "r");
  const head = Buffer.alloc(8);
  try {
    fs.readSync(fd, head, 0, 8, 0);
  } finally {
    fs.closeSync(fd);
  }
  const expected = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
  if (!head.equals(expected)) {
    console.error(
      `[espeak-core] public/espeak/espeak-ng.wasm is not a valid wasm module ` +
        `(header ${head.toString("hex")}, expected ${expected.toString("hex")})`,
    );
    process.exit(1);
  }
}

console.log(
  copied > 0
    ? `[espeak-core] ${copied} file(s) copied to public/espeak`
    : "[espeak-core] public/espeak already up to date",
);
