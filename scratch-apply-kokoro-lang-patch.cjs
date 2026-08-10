// scratch-apply-kokoro-lang-patch.cjs
// TIER 2 STEP 2: route Kokoro codes e/f/i/p/h through espeak-ng.
// English (a/b) stays on the existing `phonemizer` package, untouched.
//
// Run this, then `npx patch-package kokoro-js` to capture the result.
// Idempotent, in the style of scripts/patch-lamejs.cjs — re-running is a no-op.
//
// EVERY replacement below asserts it matched EXACTLY ONCE before writing. These
// are minified bundles; a silently-zero-match edit that still exits 0 is the
// same failure class as the empty probe script and the -b=1 encoding bug from
// earlier tonight. Zero or multiple matches = hard exit, no file written.
//
// THREE DIST FILES, THREE DIFFERENT SHAPES (the minifier renamed variables):
//   kokoro.js   `n="a"===a?"en-us":"en"` ... `(await l(a,n)).join(" ")`
//   kokoro.cjs  `c="a"===t?"en-us":"en"` ... `(await a.phonemize(t,c)).join(" ")`
//   kokoro.web.js  same lang line, but the phonemizer is INLINED as an IIFE
//
// kokoro.web.js gets the language lookup ONLY — see the note at PATCH 3.

const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "node_modules", "kokoro-js", "dist");

if (!fs.existsSync(DIST)) {
  console.log("[kokoro-lang] kokoro-js not found, skipping");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// The helper block injected at the top of each file.
//
// Design notes that matter:
//  - LAZY import: `await import("espeak-ng")` inside the call, never at module
//    top level. The wasm is ~17.6MB; eager import would put it in the initial
//    /voice bundle. This is what makes Step 5's lazy-loading requirement work.
//  - locateFile ONLY in the browser. In Node there is no /espeak/ URL, and the
//    default import.meta.url resolution already works (proven tonight). Testing
//    the real patched helper from Node therefore needs no special-casing.
//  - Cached module ref, NOT a cached instance. espeak-ng runs its CLI at
//    instantiation, so every call needs a fresh instance. Caching the *module*
//    avoids re-downloading the wasm; caching an instance would break output.
//    No pooling — explicitly out of scope.
//  - Unknown code THROWS. Silent English fallback is the exact bug this whole
//    effort exists to kill.
// ---------------------------------------------------------------------------
const HELPER = `/* racira: multi-language phonemization (see patches/kokoro-js+1.2.1.patch) */
const __RACIRA_EN={a:"en-us",b:"en"};
const __RACIRA_ESPEAK={e:"es",f:"fr",i:"it",p:"pt-BR",h:"hi"};
let __raciraEspeakModule=null;
function __raciraLang(c){
if(Object.prototype.hasOwnProperty.call(__RACIRA_EN,c))return __RACIRA_EN[c];
if(Object.prototype.hasOwnProperty.call(__RACIRA_ESPEAK,c))return __RACIRA_ESPEAK[c];
throw new Error('[racira] Unsupported Kokoro language code "'+c+'". Supported: '+Object.keys(__RACIRA_EN).concat(Object.keys(__RACIRA_ESPEAK)).join(", ")+'. Refusing to silently fall back to English.');
}
function __raciraIsEspeak(l){return l!=="en-us"&&l!=="en"}
async function __raciraEspeak(text,lang){
if(!__raciraEspeakModule){__raciraEspeakModule=(await import("espeak-ng")).default}
const opts={arguments:["--phonout","generated","-q","--ipa=3","-v",lang,text]};
if(typeof window!=="undefined"){opts.locateFile=(f)=>"/espeak/"+f}
const m=await __raciraEspeakModule(opts);
return m.FS.readFile("generated",{encoding:"utf8"}).trim();
}
async function __raciraPhon(enPhonemize,text,lang){
if(!__raciraIsEspeak(lang))return (await enPhonemize(text,lang)).join(" ");
return await __raciraEspeak(text,lang);
}
`;

/** Replace `find` with `repl`, asserting exactly one occurrence. */
function replaceOnce(src, find, repl, label, file) {
  const parts = src.split(find);
  const n = parts.length - 1;
  if (n !== 1) {
    console.error(`[kokoro-lang] ABORT — ${file}: "${label}" matched ${n} times, expected exactly 1.`);
    console.error(`  looked for: ${find}`);
    process.exit(1);
  }
  return parts.join(repl);
}

function patchFile(file, edits, { addExports = false } = {}) {
  const p = path.join(DIST, file);
  if (!fs.existsSync(p)) {
    console.log(`[kokoro-lang] ${file} not present, skipping`);
    return;
  }
  let src = fs.readFileSync(p, "utf8");

  if (src.includes("__raciraLang")) {
    console.log(`[kokoro-lang] ${file} already patched, skipping`);
    return;
  }

  for (const [label, find, repl] of edits) {
    src = replaceOnce(src, find, repl, label, file);
  }

  src = HELPER + src;

  // Exported so the verification script can exercise the REAL patched code
  // path rather than a re-implementation of it. Remove this line if you'd
  // rather not widen kokoro-js's public surface — the routing works without it.
  if (addExports) src = src + "\nexport{__raciraLang,__raciraPhon,__raciraEspeak};\n";

  fs.writeFileSync(p, src);
  console.log(`[kokoro-lang] Patched ${file} (${edits.length} edit(s)${addExports ? " + test exports" : ""})`);
}

// --- PATCH 1: kokoro.js — the file webpack actually resolves ----------------
// kokoro-js's package.json "exports" has only types/node/default (no "browser"
// condition), so a webpack web-target build takes "default" -> ./dist/kokoro.js.
patchFile(
  "kokoro.js",
  [
    ["lang lookup", `n="a"===a?"en-us":"en"`, `n=__raciraLang(a)`],
    ["phonemize dispatch", `(await l(a,n)).join(" ")`, `(await __raciraPhon(l,a,n))`],
  ],
  { addExports: true },
);

// --- PATCH 2: kokoro.cjs — CommonJS consumers -------------------------------
patchFile("kokoro.cjs", [
  ["lang lookup", `c="a"===t?"en-us":"en"`, `c=__raciraLang(t)`],
  ["phonemize dispatch", `(await a.phonemize(t,c)).join(" ")`, `(await __raciraPhon(a.phonemize,t,c))`],
]);

// --- PATCH 3: kokoro.web.js — LANGUAGE LOOKUP ONLY, deliberately ------------
// This file inlines its own copy of phonemizer rather than importing it, so
// there is no `l(text, lang)` seam to redirect. It is also the jsdelivr/unpkg
// CDN entry (package.json:63-64) and is NOT in this repo's resolution path.
//
// Patching the lookup alone is still worth doing: a non-English code now
// reaches the inlined English-only phonemizer and throws loudly, instead of
// silently phonemizing Spanish as English. Loud failure over silent garbling —
// same principle as the explicit throw in __raciraLang.
patchFile("kokoro.web.js", [["lang lookup", `n="a"===A?"en-us":"en"`, `n=__raciraLang(A)`]]);

console.log("\n[kokoro-lang] Done. Next:  npx patch-package kokoro-js");
