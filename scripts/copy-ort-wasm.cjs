const fs = require("fs");
const path = require("path");

// onnxruntime-web's .wasm binaries have to be served as static, same-origin
// assets out of public/, with env.wasmPaths pointed at them.
//
// Two reasons, both load-bearing:
//
// 1. COEP. next.config.mjs sends Cross-Origin-Embedder-Policy: require-corp
//    site-wide. transformers.js defaults wasmPaths to a jsDelivr URL
//    (@huggingface/transformers/src/backends/onnx.js:211) whenever it is not
//    already set, which makes the wasm a CROSS-origin subresource — exactly
//    what require-corp blocks unless the CDN sends permissive CORP headers.
//    Self-hosting sidesteps the question entirely. Same reasoning as
//    copy-espeak-core.cjs.
//
// 2. Keeping it away from webpack. next.config.mjs sets
//    module.parser.javascript.url = false, so webpack never turns ORT's
//    internal wasm URL construction into an emitted asset and the file would
//    simply never be produced.
//
// VERSION MATCHING — the important part. There are two copies of
// onnxruntime-web in this tree:
//
//   node_modules/onnxruntime-web                                   1.27.0
//   node_modules/@huggingface/transformers/node_modules/
//     onnxruntime-web                          1.22.0-dev.20250409-89f8206ba4
//
// transformers@3.8.1 pins the nightly, so the JS glue that webpack actually
// bundles is the NESTED one (confirmed by the build's import trace:
// ort.bundle.min.mjs -> transformers.web.js -> kokoro.js -> kokoroEngine.ts).
// ORT's glue and its .wasm are a matched pair — feeding 1.27.0 binaries to
// 1.22.0-dev glue fails at instantiate with an opaque error. So the nested
// copy is the source of truth here, and the top-level package is only a
// fallback for the case where the nesting goes away on a future install.
// The resolved version is printed on every run so a silent drift is visible.
//
// Runs on postinstall and again before dev/build, so a fresh clone, a fresh
// install, or a bumped transformers version all end up with the right files.

const destDir = path.join(__dirname, "..", "public", "ort");
const nodeModules = path.join(__dirname, "..", "node_modules");

// Ordered by preference: the copy transformers actually bundles first.
const CANDIDATE_DIRS = [
  path.join(nodeModules, "@huggingface", "transformers", "node_modules", "onnxruntime-web"),
  path.join(nodeModules, "onnxruntime-web"),
];

// Both builds are copied because which one ORT requests depends on whether the
// session ends up on the jsep (WebGPU-capable) or plain wasm path, and that is
// decided at runtime inside the bundle. They are ~11 MB and ~10 MB; copying
// both is cheaper than guessing wrong.
//
// The .mjs loaders are copied too. The bundle build inlines its glue and will
// not fetch them, but a non-bundle build resolves them relative to wasmPaths,
// so having them present costs a few hundred KB and removes a failure mode.
const FILES = [
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.jsep.mjs",
];

let srcPkgDir = null;
for (const dir of CANDIDATE_DIRS) {
  if (fs.existsSync(path.join(dir, "dist"))) {
    srcPkgDir = dir;
    break;
  }
}

if (!srcPkgDir) {
  console.log("[ort-wasm] onnxruntime-web not found, skipping copy");
  process.exit(0);
}

const srcDir = path.join(srcPkgDir, "dist");

let version = "unknown";
try {
  version = require(path.join(srcPkgDir, "package.json")).version;
} catch {
  // Version is diagnostic only; a missing package.json is not fatal.
}
console.log(
  `[ort-wasm] Source: ${path.relative(path.join(__dirname, ".."), srcPkgDir)} (onnxruntime-web@${version})`,
);

fs.mkdirSync(destDir, { recursive: true });

let copied = 0;
let missing = 0;

for (const name of FILES) {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);

  if (!fs.existsSync(src)) {
    console.error(`[ort-wasm] MISSING in node_modules: ${name}`);
    missing++;
    continue;
  }

  // Skip identical files so repeated dev starts don't rewrite ~21 MB each time.
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest)) {
    const destStat = fs.statSync(dest);
    if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
      continue;
    }
  }

  fs.copyFileSync(src, dest);
  console.log(`[ort-wasm] Copied ${name} (${(srcStat.size / 1024).toFixed(0)} KB)`);
  copied++;
}

if (missing > 0) {
  console.error(
    `[ort-wasm] ${missing} file(s) missing — ONNX inference will fall back to the CDN and be blocked by COEP`,
  );
  process.exit(1);
}

// A truncated or HTML-substituted wasm would still satisfy the size/mtime skip
// above on a later run, so confirm the magic bytes rather than mere presence.
// \0asm + version 1. Cheap, and it catches the failure mode that would
// otherwise surface as an opaque WebAssembly.instantiate error in the browser.
const expected = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
for (const name of FILES.filter((f) => f.endsWith(".wasm"))) {
  const finalPath = path.join(destDir, name);
  if (!fs.existsSync(finalPath)) continue;

  const fd = fs.openSync(finalPath, "r");
  const head = Buffer.alloc(8);
  try {
    fs.readSync(fd, head, 0, 8, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (!head.equals(expected)) {
    console.error(
      `[ort-wasm] public/ort/${name} is not a valid wasm module ` +
        `(header ${head.toString("hex")}, expected ${expected.toString("hex")})`,
    );
    process.exit(1);
  }
}

console.log(
  copied > 0
    ? `[ort-wasm] ${copied} file(s) copied to public/ort`
    : "[ort-wasm] public/ort already up to date",
);
