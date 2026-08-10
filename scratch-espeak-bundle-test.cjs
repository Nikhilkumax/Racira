// scratch-espeak-bundle-test.cjs
// TIER 2: forensics on V3's "undefined 18240 KB" asset + the locateFile bypass (V4).
//
// WHY THE FIRST RUN COULDN'T ANSWER THIS
// Only .espeak-bundle-scratch/out-V2-plus-module-false/ exists on disk. V1 and
// V3 wrote nothing. Both had build errors, and webpack 5 sets
// optimization.emitOnErrors = false in `mode: "production"`, so an errored
// compilation reports assets in its stats object but never writes them. That is
// why V3's 18,240 KB asset has no file behind it — nothing to check magic bytes
// against. This run sets emitOnErrors: true so V3 actually emits, then reads the
// real bytes.
//
// THE "undefined" NAME IS A HARNESS DEFECT, NOT A WEBPACK ONE — but I am not
// asserting that from memory. Every variant below prints THREE views of its
// assets so the script proves it either way:
//   (a) stats.toJson({all:false, assets:true})  <- what the old harness used
//   (b) compilation.getAssets()                 <- authoritative in-memory list
//   (c) an fs walk of the output dir            <- ground truth on disk
// If (a) shows "undefined" while (b) and (c) show a real name, the old
// "NOT emitted" verdict was a false negative from my own reporting logic.
//
// SIZE ARITHMETIC WORTH TESTING: 18,240 KB - 18,052 KB (real wasm) = 188 KB,
// which is about the size of a bundle containing espeak-ng.js. So "undefined"
// may be a TOTAL across two assets rather than one mislabelled file. The
// per-asset listing below settles it.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SCRATCH = path.join(ROOT, ".espeak-bundle-scratch");
const ESPEAK_DIR = path.join(ROOT, "node_modules", "espeak-ng", "dist");

const wp = require("next/dist/compiled/webpack/webpack.js");
wp.init();
const webpack = wp.webpack;

fs.mkdirSync(SCRATCH, { recursive: true });

// --------------------------------------------------------------------------
// magic-byte helpers — never infer a file's identity from its size
// --------------------------------------------------------------------------
const WASM_MAGIC = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

function head(file, n = 8) {
  const fd = fs.openSync(file, "r");
  try {
    const b = Buffer.alloc(n);
    const read = fs.readSync(fd, b, 0, n, 0);
    return b.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
}

function identify(file) {
  const size = fs.statSync(file).size;
  const h = head(file, 8);
  const hex = [...h].map((b) => b.toString(16).padStart(2, "0")).join(" ");
  let kind;
  if (h.subarray(0, 4).equals(WASM_MAGIC.subarray(0, 4))) {
    kind = h.equals(WASM_MAGIC) ? "REAL WASM (magic + version 1)" : "WASM magic, unexpected version";
  } else {
    const printable = h.toString("utf8").replace(/[^\x20-\x7e]/g, ".");
    kind = `not wasm (text/JS? "${printable}")`;
  }
  return { size, hex, kind };
}

function kb(n) {
  return (n / 1024).toFixed(0) + " KB";
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// --------------------------------------------------------------------------
// entry sources
// --------------------------------------------------------------------------
// Default: let espeak-ng resolve its own wasm (the import.meta.url path).
const ENTRY_DEFAULT = path.join(SCRATCH, "entry-default.mjs");
fs.writeFileSync(
  ENTRY_DEFAULT,
  [
    'import ESpeakNg from "espeak-ng";',
    "export async function probe(text) {",
    '  const m = await ESpeakNg({ arguments: ["--phonout","generated","-q","--ipa=3","-v","es",text] });',
    '  return m.FS.readFile("generated", { encoding: "utf8" });',
    "}",
    "globalThis.__probe = probe;",
  ].join("\n"),
);

// V4: the ffmpeg precedent, applied to espeak-ng.
//
// Read from src/domains/audio/lib/ffmpegEngine.ts before writing this — the
// established pattern in this repo is NOT a bundler trick, it is:
//   1. a const same-origin base URL under public/  (ffmpegEngine.ts:22)
//   2. runtime URL strings handed to the engine    (ffmpegEngine.ts:166-171)
//   3. scripts/copy-ffmpeg-core.cjs populates public/ on postinstall + prebuild
// webpack never sees those files, which is the entire point.
//
// espeak-ng's equivalent hook is Module['locateFile'] (espeak-ng.js:73-78),
// which is checked BEFORE the import.meta.url fallback (espeak-ng.js:749-757).
const ENTRY_LOCATEFILE = path.join(SCRATCH, "entry-locatefile.mjs");
fs.writeFileSync(
  ENTRY_LOCATEFILE,
  [
    'import ESpeakNg from "espeak-ng";',
    "",
    "// Mirrors CORE_BASE_URL in ffmpegEngine.ts:22. Same-origin keeps",
    "// COEP: require-corp satisfied without CORS headers.",
    'const ESPEAK_BASE_URL = "/espeak";',
    "",
    "export async function probe(text) {",
    "  const m = await ESpeakNg({",
    "    locateFile: (file) => `${ESPEAK_BASE_URL}/${file}`,",
    '    arguments: ["--phonout","generated","-q","--ipa=3","-v","es",text],',
    "  });",
    '  return m.FS.readFile("generated", { encoding: "utf8" });',
    "}",
    "globalThis.__probe = probe;",
  ].join("\n"),
);

// --------------------------------------------------------------------------
// Next 14.2.15 client fallback set — webpack-config.js:1321-1347
// --------------------------------------------------------------------------
const nextClientFallback = {
  assert: require.resolve("next/dist/compiled/assert"),
  buffer: require.resolve("next/dist/compiled/buffer/"),
  constants: require.resolve("next/dist/compiled/constants-browserify"),
  crypto: require.resolve("next/dist/compiled/crypto-browserify"),
  domain: require.resolve("next/dist/compiled/domain-browser"),
  http: require.resolve("next/dist/compiled/stream-http"),
  https: require.resolve("next/dist/compiled/https-browserify"),
  os: require.resolve("next/dist/compiled/os-browserify"),
  path: require.resolve("next/dist/compiled/path-browserify"),
  punycode: require.resolve("next/dist/compiled/punycode"),
  process: require.resolve("next/dist/build/polyfills/process"),
  querystring: require.resolve("next/dist/compiled/querystring-es3"),
  stream: require.resolve("next/dist/compiled/stream-browserify"),
  string_decoder: require.resolve("next/dist/compiled/string_decoder"),
  sys: require.resolve("next/dist/compiled/util/"),
  timers: require.resolve("next/dist/compiled/timers-browserify"),
  tty: require.resolve("next/dist/compiled/tty-browserify"),
  util: require.resolve("next/dist/compiled/util/"),
  vm: require.resolve("next/dist/compiled/vm-browserify"),
  zlib: require.resolve("next/dist/compiled/browserify-zlib"),
  events: require.resolve("next/dist/compiled/events/"),
  setImmediate: require.resolve("next/dist/compiled/setimmediate"),
};

// next.config.mjs:53-58
const repoFallbackOverride = { fs: false, path: false, "fs/promises": false };

function makeConfig({ name, entry, extraFallback, parserUrl }) {
  return {
    name,
    mode: "production",
    target: "web",
    entry,
    output: {
      path: path.join(SCRATCH, "out-" + name),
      filename: "bundle.js",
      assetModuleFilename: "static/media/[name].[hash:8][ext]", // webpack-config.js:1665-1668
    },
    resolve: {
      fallback: { ...nextClientFallback, ...repoFallbackOverride, ...extraFallback },
      extensionAlias: { ".js": [".js", ".ts", ".tsx"] }, // next.config.mjs:45-47
    },
    module: {
      parser: { javascript: { url: parserUrl } },
      rules: [{ test: /\.mjs$/, include: /node_modules/, type: "javascript/auto" }],
    },
    // THE FIX THAT MAKES STEP 1 POSSIBLE: production mode defaults this to
    // false, which is why errored V1/V3 left no files to inspect.
    optimization: { minimize: false, emitOnErrors: true },
    performance: false,
    infrastructureLogging: { level: "error" },
  };
}

const VARIANTS = [
  {
    name: "V1-as-configured-today",
    note: "repo's next.config.mjs unchanged",
    entry: ENTRY_DEFAULT,
    extraFallback: {},
    parserUrl: false,
  },
  {
    name: "V2-plus-module-false",
    note: "V1 + resolve.fallback.module = false",
    entry: ENTRY_DEFAULT,
    extraFallback: { module: false },
    parserUrl: false,
  },
  {
    name: "V3-plus-url-relative",
    note: "V2 + parser url:'relative' (Next default) — now emitting on errors",
    entry: ENTRY_DEFAULT,
    extraFallback: { module: false },
    parserUrl: "relative",
  },
  {
    name: "V4-locatefile-bypass",
    note: "V2 config + Module.locateFile at runtime (the ffmpeg precedent)",
    entry: ENTRY_LOCATEFILE,
    extraFallback: { module: false },
    parserUrl: false,
  },
];

function run(spec) {
  return new Promise((resolve) => {
    const outDir = path.join(SCRATCH, "out-" + spec.name);
    fs.rmSync(outDir, { recursive: true, force: true });
    webpack(makeConfig(spec), (err, stats) => {
      if (err) return resolve({ fatal: err.stack || String(err) });

      // (a) exactly what the previous harness asked for — the suspect view
      const viaToJson = stats
        .toJson({ all: false, assets: true })
        .assets?.map((a) => ({ name: a.name, size: a.size }));

      // (b) authoritative in-memory asset list
      const viaGetAssets = stats.compilation
        .getAssets()
        .map((a) => ({ name: a.name, size: a.source ? a.source.size() : null }));

      const j = stats.toJson({ all: false, errors: true, warnings: true });
      resolve({
        fatal: null,
        errors: (j.errors || []).map((e) => e.message || String(e)),
        warnings: (j.warnings || []).map((w) => w.message || String(w)),
        viaToJson: viaToJson || [],
        viaGetAssets,
        outDir,
      });
    });
  });
}

(async () => {
  console.log("=== V3 asset forensics + V4 locateFile bypass ===\n");

  // ---- the reference file we are comparing everything against -------------
  const realWasm = path.join(ESPEAK_DIR, "espeak-ng.wasm");
  const realJs = path.join(ESPEAK_DIR, "espeak-ng.js");
  console.log("REFERENCE — node_modules/espeak-ng/dist/");
  for (const f of [realWasm, realJs]) {
    const id = identify(f);
    console.log(`  ${path.basename(f).padEnd(16)} ${kb(id.size).padStart(10)}  ${id.hex}  ${id.kind}`);
  }

  // ---- pre-existing scratch state, before we overwrite anything -----------
  console.log("\nPRE-EXISTING scratch files (from the first run):");
  const before = walk(SCRATCH).filter((f) => !f.endsWith(".mjs"));
  if (!before.length) console.log("  (none)");
  for (const f of before) {
    const id = identify(f);
    console.log(`  ${path.relative(SCRATCH, f).padEnd(52)} ${kb(id.size).padStart(10)}  ${id.kind}`);
  }

  // ---- all four variants --------------------------------------------------
  const results = [];
  for (const v of VARIANTS) {
    console.log(`\n${"=".repeat(74)}`);
    console.log(`${v.name}  —  ${v.note}`);
    console.log("=".repeat(74));

    const r = await run(v);
    results.push({ v, r });

    if (r.fatal) {
      console.log("FATAL (webpack threw):\n" + r.fatal);
      continue;
    }

    console.log(`errors: ${r.errors.length}   warnings: ${r.warnings.length}`);
    r.errors.forEach((e, i) => console.log(`\n  --- ERROR ${i + 1} ---\n${e}`));
    r.warnings.slice(0, 4).forEach((w, i) => console.log(`\n  --- WARNING ${i + 1} ---\n${w}`));
    if (r.warnings.length > 4) console.log(`\n  (+${r.warnings.length - 4} more warnings)`);

    console.log("\n  (a) stats.toJson({all:false, assets:true})  <- the suspect view:");
    if (!r.viaToJson.length) console.log("      (empty)");
    r.viaToJson.forEach((a) =>
      console.log(`      name=${JSON.stringify(a.name)}  size=${a.size}  (${a.size ? kb(a.size) : "?"})`),
    );

    console.log("\n  (b) compilation.getAssets()  <- authoritative:");
    if (!r.viaGetAssets.length) console.log("      (empty)");
    r.viaGetAssets.forEach((a) =>
      console.log(`      name=${JSON.stringify(a.name)}  size=${a.size} (${a.size ? kb(a.size) : "?"})`),
    );

    console.log("\n  (c) on disk, with magic bytes  <- ground truth:");
    const files = walk(r.outDir);
    if (!files.length) console.log("      (nothing written)");
    for (const f of files) {
      const id = identify(f);
      console.log(
        `      ${path.relative(r.outDir, f).padEnd(44)} ${kb(id.size).padStart(10)}  ${id.hex}  ${id.kind}`,
      );
    }

    const diskWasm = files.filter((f) => identify(f).kind.startsWith("REAL WASM"));
    console.log(
      `\n  real wasm on disk? ${diskWasm.length ? `YES (${diskWasm.length}) — ` + diskWasm.map((f) => path.basename(f)).join(", ") : "NO"}`,
    );
    if (diskWasm.length) {
      const same = diskWasm.some((f) => fs.statSync(f).size === fs.statSync(realWasm).size);
      console.log(`  byte-size match against node_modules copy? ${same ? "YES" : "no"}`);
    }
  }

  // ---- V4's mechanism check: is locateFile actually honoured? -------------
  // Bundling clean proves the BUILD works. It does not prove espeak-ng takes
  // the locateFile branch. Run that branch for real, in Node, against a copy
  // deliberately placed where the default resolver would never look.
  console.log(`\n${"=".repeat(74)}`);
  console.log("V4 MECHANISM CHECK — is Module.locateFile actually honoured?");
  console.log("=".repeat(74));
  console.log("Node-side, not browser: proves espeak-ng.js:749 takes the locateFile");
  console.log("branch and loads from a path the default resolver would never find.");
  console.log("The browser difference is fetch() vs fs — same branch either way.\n");

  const fakeServed = path.join(SCRATCH, "served", "espeak-ng.wasm");
  try {
    fs.mkdirSync(path.dirname(fakeServed), { recursive: true });
    fs.copyFileSync(realWasm, fakeServed);
    const id = identify(fakeServed);
    console.log(`  copied to: ${path.relative(ROOT, fakeServed)}`);
    console.log(`  verified : ${kb(id.size)}  ${id.hex}  ${id.kind}\n`);

    const { default: ESpeakNg } = await import("espeak-ng");
    let asked = null;
    const t0 = Date.now();
    const m = await ESpeakNg({
      locateFile: (file) => {
        asked = file;
        return path.join(path.dirname(fakeServed), file);
      },
      arguments: ["--phonout", "generated", "-q", "--ipa=3", "-v", "es", "Hola, ¿cómo estás?"],
    });
    const out = m.FS.readFile("generated", { encoding: "utf8" }).trim();
    console.log(`  locateFile called with : ${JSON.stringify(asked)}`);
    console.log(`  phonemized output      : ${JSON.stringify(out)}`);
    console.log(`  time                   : ${Date.now() - t0}ms`);
    console.log(
      `  VERDICT                : ${asked === "espeak-ng.wasm" && out.length ? "locateFile HONOURED, wasm loaded from our path" : "INCONCLUSIVE — inspect above"}`,
    );
  } catch (e) {
    console.log(`  [THROW] ${e && e.message ? e.message : e}`);
    console.log("  VERDICT: locateFile mechanism NOT confirmed.");
  }

  // ---- summary ------------------------------------------------------------
  console.log(`\n\n${"=".repeat(74)}`);
  console.log("SUMMARY");
  console.log("=".repeat(74));
  for (const { v, r } of results) {
    if (r.fatal) {
      console.log(`\n${v.name}\n  FATAL`);
      continue;
    }
    const files = walk(r.outDir);
    const wasm = files.filter((f) => identify(f).kind.startsWith("REAL WASM"));
    const toJsonNames = r.viaToJson.map((a) => String(a.name)).join(", ") || "(none)";
    const realNames = r.viaGetAssets.map((a) => a.name).join(", ") || "(none)";
    console.log(`\n${v.name}`);
    console.log(`  ${v.note}`);
    console.log(`  build          : ${r.errors.length ? r.errors.length + " error(s)" : "CLEAN"}`);
    console.log(`  toJson names   : ${toJsonNames}`);
    console.log(`  real names     : ${realNames}`);
    console.log(`  wasm on disk   : ${wasm.length ? "YES — " + wasm.map((f) => path.basename(f)).join(", ") : "no"}`);
  }
  console.log(
    "\nNOTE ON V4: a clean V4 build with NO wasm asset is the CORRECT result," +
      "\nnot a failure. Under the locateFile pattern the wasm is deliberately kept" +
      "\nout of webpack and served from public/, exactly as ffmpeg-core.wasm already" +
      "\nis (ffmpegEngine.ts:22, scripts/copy-ffmpeg-core.cjs). Judge V4 on: build" +
      "\nclean + locateFile honoured, NOT on asset presence.",
  );
  console.log(
    "\nScratch left in .espeak-bundle-scratch/ for inspection." +
      "\nRemove with:  Remove-Item -Recurse -Force .espeak-bundle-scratch",
  );
  console.log("=".repeat(74));
})();
