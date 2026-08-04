const fs = require("fs");
const path = require("path");

// ffmpeg.wasm needs two sets of files served as static, same-origin assets.
//
// 1. The core (@ffmpeg/core-mt): Next only serves static assets out of public/,
//    and the worker script has to be same-origin to satisfy COEP: require-corp.
//
// 2. The class worker (@ffmpeg/ffmpeg's own worker.js) — this one is subtler.
//    That file loads the core with `await import(coreURL)`, where coreURL is a
//    runtime variable. When webpack bundles the worker it rewrites that call
//    into a "lazy context" over dist/esm/, which resolves nothing and throws
//    `Cannot find module '<coreURL>'` at load time. Serving the vendor worker
//    from public/ keeps webpack away from it, so the import stays a native
//    browser dynamic import. Passed to ffmpeg.load() as `classWorkerURL`.
//
// Runs on postinstall and again before dev/build, so a fresh clone, a fresh
// install, or a bumped @ffmpeg version all end up with the right files.

const destDir = path.join(__dirname, "..", "public", "ffmpeg");
const nodeModules = path.join(__dirname, "..", "node_modules");

const coreDir = path.join(nodeModules, "@ffmpeg", "core-mt", "dist", "esm");
const ffmpegDir = path.join(nodeModules, "@ffmpeg", "ffmpeg", "dist", "esm");

/** [sourceDir, sourceName, destName] */
const FILES = [
  [coreDir, "ffmpeg-core.js", "ffmpeg-core.js"],
  [coreDir, "ffmpeg-core.wasm", "ffmpeg-core.wasm"],
  [coreDir, "ffmpeg-core.worker.js", "ffmpeg-core.worker.js"],
  // The class worker plus the two modules it imports relatively. Names must
  // stay as-is: worker.js does `import ... from "./const.js"` / "./errors.js".
  [ffmpegDir, "worker.js", "ffmpeg-worker.js"],
  [ffmpegDir, "const.js", "const.js"],
  [ffmpegDir, "errors.js", "errors.js"],
];

if (!fs.existsSync(coreDir) || !fs.existsSync(ffmpegDir)) {
  console.log("[ffmpeg-core] @ffmpeg packages not found, skipping copy");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

let copied = 0;
let missing = 0;

for (const [srcDir, srcName, destName] of FILES) {
  const src = path.join(srcDir, srcName);
  const dest = path.join(destDir, destName);

  if (!fs.existsSync(src)) {
    console.error(`[ffmpeg-core] MISSING in node_modules: ${srcName}`);
    missing++;
    continue;
  }

  // Skip identical files so repeated dev starts don't rewrite ~31 MB each time.
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest)) {
    const destStat = fs.statSync(dest);
    if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
      continue;
    }
  }

  fs.copyFileSync(src, dest);
  console.log(`[ffmpeg-core] Copied ${destName} (${(srcStat.size / 1024).toFixed(0)} KB)`);
  copied++;
}

if (missing > 0) {
  console.error(
    `[ffmpeg-core] ${missing} file(s) missing — audio conversion will fail to load the engine`,
  );
  process.exit(1);
}

console.log(
  copied > 0
    ? `[ffmpeg-core] ${copied} file(s) copied to public/ffmpeg`
    : "[ffmpeg-core] public/ffmpeg already up to date",
);
