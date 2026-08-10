// scratch-verify-kokoro-lang.mjs
// TIER 2 STEP 2 verification: exercise the PATCHED kokoro-js routing directly.
//
// Imports __raciraLang / __raciraPhon from the patched node_modules/kokoro-js —
// the real code path, not a re-implementation. A re-implementation that passes
// while the patch is broken is worse than no test.
//
// Verification logic reused from probe-espeak-ng.mjs, including the two checks
// that caught real bugs earlier tonight:
//   - word-shape: output groups must track input words ("different from English"
//     is too weak — garbage is also different)
//   - mojibake regex: espeak NAMING an accent instead of pronouncing it, the
//     signature of the -b=1 encoding bug
//
// Node runs the espeak-ng branch without locateFile (browser-only in the patch),
// so this exercises routing + argument shape, not wasm delivery. Wasm delivery
// is Step 5 and needs a real build.

import { __raciraLang, __raciraPhon } from "kokoro-js";
import { phonemize as enPhonemize } from "phonemizer";

const CASES = [
  { code: "a", label: "English-US",     text: "Hello, how are you?",          engine: "phonemizer" },
  { code: "b", label: "English-GB",     text: "Hello, how are you?",          engine: "phonemizer" },
  { code: "e", label: "Spanish",        text: "Hola, ¿cómo estás?",           engine: "espeak-ng" },
  { code: "f", label: "French",         text: "Bonjour, comment allez-vous?", engine: "espeak-ng" },
  { code: "i", label: "Italian",        text: "Ciao, come stai?",             engine: "espeak-ng" },
  { code: "p", label: "Portuguese-BR",  text: "Olá, como você está?",         engine: "espeak-ng" },
  { code: "h", label: "Hindi",          text: "नमस्ते, आप कैसे हैं?",              engine: "espeak-ng" },
];

const norm = (s) => s.replace(/\s+/g, " ").trim();
const inputWords = (s) => s.split(/[\s,.;:!?¡¿"()—–-]+/u).filter(Boolean);
const outputGroups = (s) =>
  s.split(/\s+/u).map((g) => g.replace(/^[|/]+|[|/]+$/gu, "")).filter(Boolean);

console.log("=== Step 2 verification: patched kokoro-js routing ===\n");

// --- routing table, before any phonemization -------------------------------
console.log("--- language code -> espeak/phonemizer voice ---");
for (const c of CASES) {
  let resolved;
  try {
    resolved = __raciraLang(c.code);
  } catch (e) {
    resolved = `[THROW] ${e.message}`;
  }
  console.log(`  ${c.code}  ${c.label.padEnd(15)} -> ${resolved}`);
}

// --- unknown codes MUST throw, never fall back to English ------------------
// This is the regression test for the original silent-garbling bug.
console.log("\n--- unsupported codes must THROW (not silently use English) ---");
for (const bad of ["j", "z", "x", "", "en", "A"]) {
  let r;
  try {
    r = `NO THROW — returned ${JSON.stringify(__raciraLang(bad))}  <-- BUG`;
  } catch (e) {
    r = `throws OK: ${e.message.slice(0, 72)}...`;
  }
  console.log(`  ${JSON.stringify(bad).padEnd(6)} ${r}`);
}
// j/z are Japanese/Chinese: deliberately OUT of scope, so throwing is correct.

// --- real phonemization per language ---------------------------------------
const results = [];

for (const c of CASES) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${c.label}  (code ${c.code}, expected engine: ${c.engine})`);
  console.log(`input: ${c.text}`);
  console.log("=".repeat(70));

  let lang;
  try {
    lang = __raciraLang(c.code);
  } catch (e) {
    console.log(`  [THROW at routing] ${e.message}`);
    results.push({ ...c, verdict: "ROUTING THROW" });
    continue;
  }

  // English baseline on identical input — the silent-fallback detector.
  let baseline = null;
  try {
    baseline = (await enPhonemize(c.text, "en-us")).join(" ").trim();
  } catch (e) {
    baseline = null;
    console.log(`  [baseline failed] ${e.message}`);
  }

  const t0 = Date.now();
  let out, err = null;
  try {
    out = (await __raciraPhon(enPhonemize, c.text, lang)).trim();
  } catch (e) {
    err = e && e.message ? e.message : String(e);
  }
  const ms = Date.now() - t0;

  if (err) {
    console.log(`  [THROW] ${err}`);
    results.push({ ...c, verdict: "THROW", detail: err });
    continue;
  }

  const empty = out.length === 0;
  const identical = baseline !== null && out === baseline;
  const nearIdentical = baseline !== null && !identical && norm(out) === norm(baseline);
  const mojibake = /tilde|circunflejo|acute|agudo|invertid|interrogaci|signo|letra/i.test(out);

  const nWords = inputWords(c.text).length;
  const nGroups = outputGroups(out).length;
  const shapeOk = nGroups === nWords;
  const shapeClose = !shapeOk && Math.abs(nGroups - nWords) <= 1;

  // English SHOULD match the baseline — same engine, same input. For English
  // that is the pass condition; for the other five it means routing failed.
  const isEnglish = c.engine === "phonemizer";

  let verdict;
  if (empty) verdict = "SUSPICIOUS (empty output)";
  else if (mojibake) verdict = "SUSPICIOUS (accent NAMED, not pronounced — encoding bug)";
  else if (isEnglish) verdict = identical || nearIdentical ? "OK (matches phonemizer baseline, as expected)" : "OK (English, differs from en-us baseline — expected for b/en)";
  else if (identical) verdict = "SUSPICIOUS (identical to English — routing did NOT take effect)";
  else if (nearIdentical) verdict = "SUSPICIOUS (near-identical to English)";
  else if (shapeOk) verdict = "OK";
  else if (shapeClose) verdict = "OK (word count off by 1 — check by eye)";
  else verdict = `SUSPICIOUS (shape mismatch: ${nWords} words in, ${nGroups} groups out)`;

  console.log(`  voice   : ${lang}`);
  console.log(`  output  : ${JSON.stringify(out)}`);
  console.log(`  English : ${baseline !== null ? JSON.stringify(baseline) : "(failed)"}`);
  console.log(`  length  : ${out.length}   time: ${ms}ms`);
  console.log(`  shape   : ${nWords} words in -> ${nGroups} groups out  ${shapeOk ? "MATCH" : shapeClose ? "off-by-1" : "MISMATCH"}`);
  console.log(`  words   : ${JSON.stringify(inputWords(c.text))}`);
  console.log(`  groups  : ${JSON.stringify(outputGroups(out))}`);
  console.log(`  verdict : ${verdict}`);

  results.push({ ...c, lang, out, ms, verdict, nWords, nGroups });
}

// --- summary ---------------------------------------------------------------
console.log(`\n\n${"=".repeat(70)}`);
console.log("SUMMARY");
console.log("=".repeat(70));
for (const r of results) {
  console.log(`\n${r.label} (${r.code} -> ${r.lang ?? "?"})`);
  console.log(`  output : ${r.out !== undefined ? JSON.stringify(r.out) : "(none)"}`);
  console.log(`  shape  : ${r.nWords !== undefined ? `${r.nWords} -> ${r.nGroups}` : "n/a"}   time: ${r.ms ?? "?"}ms`);
  console.log(`  verdict: ${r.verdict}`);
}

const ok = results.filter((r) => r.verdict.startsWith("OK")).length;
console.log(`\n${"=".repeat(70)}`);
console.log(`RESULT: ${ok}/${CASES.length} languages routing correctly`);
const espeakTimes = results.filter((r) => r.engine === "espeak-ng" && r.ms).map((r) => r.ms);
if (espeakTimes.length) {
  console.log(`espeak-ng per call: ${Math.min(...espeakTimes)}-${Math.max(...espeakTimes)}ms (fresh instance each)`);
}
console.log("=".repeat(70));
