// scratch-step3-redo.cjs
// TIER 2 STEP 3 REDO — voice validation unlock, with the proof built in.
//
// WHY THIS IS ONE SCRIPT AND NOT THREE COMMANDS
// The previous attempt edited node_modules in one step and regenerated the patch
// in a separate manual step that never ran. The edit was reported as done; the
// patch file never received it. So this script does edit -> patch-package ->
// BOTH Select-String proofs in a single invocation, and exits non-zero if any
// stage fails. There is no separate step left to skip.
//
// SCOPE: node_modules/kokoro-js/dist/{kokoro.js,kokoro.cjs} and patches/.
// kokoro.web.js is deliberately NOT widened — see PATCH 3 note below.

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = __dirname;
const DIST = path.join(ROOT, "node_modules", "kokoro-js", "dist");
const PATCH = path.join(ROOT, "patches", "kokoro-js+1.2.1.patch");
const line = (c = "=") => c.repeat(78);

let failures = 0;
const fail = (m) => { console.log(`  [FAIL] ${m}`); failures++; };
const ok = (m) => console.log(`  [ok]   ${m}`);

// Exactly-one-match guard. A minified bundle can repeat a substring; a blind
// replace would silently corrupt an unrelated site or no-op. Both are fatal.
function replaceOnce(src, find, repl, label) {
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: expected exactly 1 match, found ${n}`);
  return src.replace(find, repl);
}

// The 13 voices Kokoro ships style vectors for (node_modules/kokoro-js/voices/*.bin,
// all 13 confirmed present) but whose ids kokoro-js's VOICES table omits. Values are
// the espeak language, for the error listing only — the runtime language code is
// still derived by _validate_voice's own `e.at(0)`, which __raciraLang then maps.
// Keys must stay in sync with KOKORO_VOICES in src/domains/voice/lib/kokoroVoices.ts.
const PRELUDE = [
  `const __RACIRA_VOICES={ef_dora:"es",em_alex:"es",em_santa:"es",ff_siwis:"fr",if_sara:"it",im_nicola:"it",pf_dora:"pt-BR",pm_alex:"pt-BR",pm_santa:"pt-BR",hf_alpha:"hi",hf_beta:"hi",hm_omega:"hi",hm_psi:"hi"};`,
  // hasOwnProperty.call, not `in`: `in` would accept "constructor"/"toString" and
  // hand a garbage id to the style-vector fetch. Matches __raciraLang's style.
  `function __raciraHasVoice(v){return Object.prototype.hasOwnProperty.call(__RACIRA_VOICES,v)}`,
].join("\n");

const ANCHOR = `const __RACIRA_ESPEAK={e:"es",f:"fr",i:"it",p:"pt-BR",h:"hi"};`;

// VOICES is minified to a different identifier per bundle: $ in kokoro.js, v in
// kokoro.cjs. Verified unique (1 match each) before writing this.
const TARGETS = [
  { file: "kokoro.js", V: "$" },
  { file: "kokoro.cjs", V: "v" },
];

console.log("=== TIER 2 STEP 3 REDO — validation unlock + proof ===\n");
console.log(line());
console.log("1. EDIT node_modules");
console.log(line());

for (const { file, V } of TARGETS) {
  const p = path.join(DIST, file);
  let src = fs.readFileSync(p, "utf8");

  if (src.includes("__raciraHasVoice")) {
    ok(`${file}: already widened, skipping edit`);
    continue;
  }
  if (!src.includes(ANCHOR)) {
    fail(`${file}: Step 2 prelude anchor missing — Step 2 is not applied. STOP.`);
    continue;
  }

  try {
    src = replaceOnce(src, ANCHOR, `${ANCHOR}\n${PRELUDE}`, `${file} prelude`);
    src = replaceOnce(
      src,
      `_validate_voice(e){if(!${V}.hasOwnProperty(e))throw`,
      `_validate_voice(e){if(!${V}.hasOwnProperty(e)&&!__raciraHasVoice(e))throw`,
      `${file} validate`,
    );
    // Keep the thrown message truthful: it tells the caller what IS accepted.
    src = replaceOnce(
      src,
      `Should be one of: \${Object.keys(${V}).join(", ")}.`,
      `Should be one of: \${Object.keys(${V}).concat(Object.keys(__RACIRA_VOICES)).join(", ")}.`,
      `${file} message`,
    );
    fs.writeFileSync(p, src);
    ok(`${file}: widened (VOICES=${V})`);
  } catch (e) {
    fail(`${file}: ${e.message}`);
  }
}

// PATCH 3 — kokoro.web.js left strict, deliberately.
// Confirmed by reading it: it carries the full espeak prelude but never calls
// __raciraPhon (1 occurrence = the definition alone). Its pipeline calls
// __raciraLang then hands the code to its own inlined English-only phonemizer,
// which throws `Invalid language`. Widening validation there would admit
// ef_dora only to throw later, from deeper, with a worse message. Neither path
// makes audio; the strict one fails at the right place. It is also the CDN
// entry, not this repo's resolution path.
{
  const p = path.join(DIST, "kokoro.web.js");
  const src = fs.readFileSync(p, "utf8");
  if (src.includes("__raciraHasVoice")) fail("kokoro.web.js: unexpectedly widened");
  else ok("kokoro.web.js: left strict (intentional — see PATCH 3 note)");
}

if (failures) {
  console.log(`\n  ${failures} failure(s) during edit — NOT running patch-package.`);
  process.exit(1);
}

console.log(`\n${line()}`);
console.log("2. REGENERATE patch  (npx patch-package kokoro-js)");
console.log(line());
try {
  const out = execFileSync("npx", ["patch-package", "kokoro-js"], {
    cwd: ROOT, encoding: "utf8", shell: true, stdio: "pipe",
  });
  console.log(out.trim().split("\n").map((l) => "  " + l).join("\n"));
} catch (e) {
  console.log(`  [FAIL] patch-package failed:\n${e.stdout || ""}${e.stderr || ""}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// THE TWO MANDATORY PROOFS. Literal matches, printed verbatim.
// node_modules alone is not sufficient — that is exactly the gap that produced
// tonight's false "done". The patch file is what survives a fresh npm install.
// ---------------------------------------------------------------------------
console.log(`\n${line()}`);
console.log("3. PROOF — literal hf_alpha matches");
console.log(line());

function show(label, file, needle) {
  const txt = fs.readFileSync(file, "utf8");
  const hits = [];
  txt.split("\n").forEach((l, i) => {
    if (l.includes(needle)) {
      const at = l.indexOf(needle);
      hits.push(`    ${path.basename(file)}:${i + 1}: …${l.slice(Math.max(0, at - 60), at + 90)}…`);
    }
  });
  console.log(`\n  ${label}  (${needle})`);
  if (hits.length === 0) { fail(`NO MATCH in ${path.basename(file)} — fix did not land`); return false; }
  console.log(hits.slice(0, 4).join("\n"));
  console.log(`    -> ${hits.length} matching line(s)`);
  return true;
}

show("A. node_modules/kokoro-js/dist/kokoro.js", path.join(DIST, "kokoro.js"), "hf_alpha");
show("B. patches/kokoro-js+1.2.1.patch", PATCH, "hf_alpha");

// Step 2 must have SURVIVED regeneration, not been replaced by Step 3's diff.
console.log(`\n  C. Step 2 routing still present in the patch file`);
const patchTxt = fs.readFileSync(PATCH, "utf8");
for (const marker of ["__raciraLang", "__RACIRA_ESPEAK", "__raciraEspeak", "__raciraPhon"]) {
  const n = patchTxt.split(marker).length - 1;
  if (n > 0) ok(`${marker}: ${n} occurrence(s)`);
  else fail(`${marker}: MISSING — Step 3 overwrote Step 2's diff`);
}
console.log(`    patch file: ${patchTxt.split("\n").length} lines, ${patchTxt.length} bytes`);

// ---------------------------------------------------------------------------
console.log(`\n${line()}`);
console.log("4. FUNCTIONAL TEST");
console.log(line());

(async () => {
  // Load the two patched bundles explicitly by path. Resolving "kokoro-js" by
  // name could land on a different condition and silently test the wrong file.
  const mods = [];
  try {
    const esm = await import(require("node:url").pathToFileURL(path.join(DIST, "kokoro.js")).href);
    mods.push(["kokoro.js (esm)", esm.KokoroTTS, esm.__raciraLang]);
  } catch (e) { fail(`could not import kokoro.js: ${e.message}`); }
  try {
    const cjs = require(path.join(DIST, "kokoro.cjs"));
    mods.push(["kokoro.cjs", cjs.KokoroTTS, cjs.__raciraLang]);
  } catch (e) { fail(`could not require kokoro.cjs: ${e.message}`); }

  const ACCEPT = ["hf_alpha", "hf_beta", "hm_omega", "hm_psi", "ef_dora", "em_alex",
    "em_santa", "ff_siwis", "if_sara", "im_nicola", "pf_dora", "pm_alex", "pm_santa"];
  // Near-misses on purpose: wrong prefix, wrong case, right prefix + wrong name,
  // and the out-of-scope ja/zh ids that must keep throwing.
  const REJECT = ["xx_fake", "ef_nonexistent", "ef_heart", "EF_DORA", "ja_tanaka", "zf_xiaobei", "constructor", "toString"];

  for (const [name, KokoroTTS, langOf] of mods) {
    if (!KokoroTTS) { fail(`${name}: no KokoroTTS export`); continue; }
    console.log(`\n  ${name}`);
    const v = (id) => KokoroTTS.prototype._validate_voice.call({}, id);

    let accepted = 0;
    for (const id of ACCEPT) {
      try {
        const code = v(id);
        const esp = langOf ? langOf(code) : "?";
        accepted++;
        console.log(`    ${id.padEnd(12)} -> code "${code}" -> espeak "${esp}"`);
      } catch (e) { fail(`${id} REJECTED: ${e.message.slice(0, 60)}`); }
    }
    if (accepted === ACCEPT.length) ok(`all ${ACCEPT.length} new voices accepted`);

    const leaked = REJECT.filter((id) => { try { v(id); return true; } catch { return false; } });
    if (leaked.length) fail(`these should have thrown: ${leaked.join(", ")}`);
    else ok(`all ${REJECT.length} invalid ids still throw`);

    // The original English voices must be untouched.
    try { v("af_heart"); ok("af_heart still accepted (English unaffected)"); }
    catch (e) { fail(`af_heart broke: ${e.message.slice(0, 60)}`); }
  }

  console.log(`\n${line()}`);
  console.log(failures === 0
    ? "RESULT: STEP 3 APPLIED AND PROVEN (node_modules + patch file)"
    : `RESULT: ${failures} FAILURE(S) — Step 3 is NOT done`);
  console.log(line());
  process.exit(failures ? 1 : 0);
})();
