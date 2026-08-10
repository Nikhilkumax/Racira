// probe-espeak-ng.mjs
// Phase 2 Step 5: verify real per-language phonemization for es/fr/it/pt-BR/hi.
//
// Facts already confirmed by test-espeak-instance.mjs (do not re-verify):
//   - espeak-ng@1.0.2 instance exposes FS (readFile/writeFile/mkdir/analyzePath)
//   - factory resolves after the CLI has run; output is readable immediately
//   - data mounted at /usr/local/share/espeak-ng-data
//   - es/fr/it/pt/hi dictionaries all present
//
// NOTE ON THE API: the CLI runs once at instantiation, so every phonemization
// needs its OWN instance. There is no reusable phonemize(text, lang) call here.
// That has a real perf cost for integration later; this probe just measures it.
//
// ARGUMENT SHAPE — corrected after diag-espeak-encoding.mjs. Three things the
// package README gets wrong for an args-ARRAY (shell-less) caller:
//   1. "-b=1" does NOT select UTF-8. getopt gives optarg "=1", atoi("=1")==0,
//      so it fell through to a broken default and UTF-8 input was read as
//      8-bit. That was the "circunflejo"/"atilde" garbling. Omitting -b
//      entirely auto-detects correctly (confirmed variant E).
//   2. '"${text}"' wrapped the text in LITERAL quote characters. Emscripten
//      passes argv straight through (espeak-ng.js:4988) — there is no shell
//      to strip them. Not the root cause here, but wrong; removed.
//   3. '--sep=""' has the same defect as #1: the value arrives as two literal
//      quote chars, not an empty string. Removed — the confirmed-good variant
//      did not include it, so keeping it would reintroduce an untested arg.

import ESpeakNg from "espeak-ng";

const DATA = "/usr/local/share/espeak-ng-data";
const OUT = "generated";

const SAMPLES = {
  es: { label: "Spanish",         text: "Hola, ¿cómo estás?" },
  fr: { label: "French",          text: "Bonjour, comment allez-vous?" },
  it: { label: "Italian",         text: "Ciao, come stai?" },
  pt: { label: "Portuguese-BR",   text: "Olá, como você está?" },
  hi: { label: "Hindi",           text: "नमस्ते, आप कैसे हैं?" },
};

// Candidate voice codes per language, most specific first.
// Portuguese is the open question: pt_dict exists, but espeak-ng voices SHARE
// dictionaries, so a pt-BR voice can exist while the dict is still named pt_dict.
// Step 0 below resolves this from the real lang/ tree instead of guessing.
const CANDIDATES = {
  es: ["es", "es-419"],
  fr: ["fr", "fr-FR", "fr-BE"],
  it: ["it"],
  pt: ["pt-BR", "pt"],
  hi: ["hi"],
};

function ls(fs, path) {
  try {
    return fs.readdir(path).filter((f) => f !== "." && f !== "..");
  } catch {
    return null;
  }
}

// One instance per call — the CLI executes during instantiation.
async function phonemize(lang, text) {
  const t0 = Date.now();
  const espeak = await ESpeakNg({
    arguments: [
      "--phonout", OUT,
      "-q",
      "--ipa=3",
      "-v", lang,
      text,
    ],
  });
  const raw = espeak.FS.readFile(OUT, { encoding: "utf8" });
  return { raw, ms: Date.now() - t0 };
}

async function tryPhonemize(lang, text) {
  try {
    const { raw, ms } = await phonemize(lang, text);
    return { ok: true, raw, out: raw.trim(), ms };
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}

const norm = (s) => s.replace(/\s+/g, " ").trim();

// Word-shape sanity check. "different from the English baseline" is too weak a
// test — garbage is also different. What we actually want is evidence the output
// maps onto the REAL input words, the way "ˈola kˈomo estˈas" visibly tracks
// "Hola / cómo / estás". So: count input words, count output phoneme groups,
// and compare. Equal counts is strong evidence of real phonemization.
const inputWords = (s) => s.split(/[\s,.;:!?¡¿"()—–-]+/u).filter(Boolean);

// CAREFUL: with --ipa=3 espeak separates PHONEMES with "_". Words stay
// separated by whitespace. So splitting output on "_" would count phonemes,
// not words, and every language would fail the shape check for entirely the
// wrong reason. Split on whitespace for word groups; report "_" segments
// separately as phonemes-per-word — useful eyeball evidence, not a pass/fail.
// (If no underscores turn up in the real output, ph/word is all 1s. Harmless.)
const outputGroups = (s) =>
  s.split(/\s+/u).map((g) => g.replace(/^[|/]+|[|/]+$/gu, "")).filter(Boolean);
const phonemesPerGroup = (s) => outputGroups(s).map((g) => g.split("_").filter(Boolean).length);

console.log("=== espeak-ng 5-language probe ===\n");

// ---------------------------------------------------------------------------
// STEP 0 — discover REAL voice codes from the lang/ tree (don't guess)
// ---------------------------------------------------------------------------
console.log("--- STEP 0: discovering real voice codes ---");
let discovered = null;
try {
  const boot = await ESpeakNg({
    arguments: ["--phonout", OUT, "-q", "--ipa=3", "-v", "en-us", "probe"],
  });
  const fs = boot.FS;

  const families = ls(fs, `${DATA}/lang`);
  console.log("lang/ families:", families ? families.join(", ") : "(unreadable)");

  discovered = {};
  for (const fam of families || []) {
    for (const v of ls(fs, `${DATA}/lang/${fam}`) || []) discovered[v] = fam;
  }

  // Portuguese is the one that actually needs disambiguating.
  console.log("\nPortuguese voice codes present:");
  for (const code of Object.keys(discovered).filter((c) => /^pt/i.test(c))) {
    console.log(`  ${discovered[code]}/${code}`);
  }
  console.log("\nCandidate codes — present in lang/ tree?");
  for (const [lang, codes] of Object.entries(CANDIDATES)) {
    for (const c of codes) {
      console.log(`  ${lang.padEnd(3)} ${c.padEnd(8)} ${discovered[c] ? `YES (${discovered[c]}/${c})` : "no"}`);
    }
  }
} catch (e) {
  console.log("[WARN] code discovery failed:", e && e.message ? e.message : e);
  console.log("       falling back to testing all candidates blind.");
}

// ---------------------------------------------------------------------------
// STEP 1-3 — per language: real call + en-us baseline on identical input
// ---------------------------------------------------------------------------
const results = [];

for (const [lang, { label, text }] of Object.entries(SAMPLES)) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${label}  (${lang})`);
  console.log(`input: ${text}`);
  console.log("=".repeat(70));

  // Same text through en-us — this is the garbling we're checking against.
  const base = await tryPhonemize("en-us", text);
  console.log(`\n  en-us baseline : ${base.ok ? JSON.stringify(base.out) : `[THROW] ${base.err}`}`);

  const attempts = [];
  for (const code of CANDIDATES[lang]) {
    // Skip codes the lang/ tree says don't exist, but only if discovery worked.
    if (discovered && !discovered[code]) {
      console.log(`\n  -v ${code} — SKIPPED (not in lang/ tree)`);
      continue;
    }

    const r = await tryPhonemize(code, text);
    console.log(`\n  -v ${code}`);
    if (!r.ok) {
      console.log(`    [THROW] ${r.err}`);
      attempts.push({ code, verdict: "ERROR", detail: r.err });
      continue;
    }

    const empty = r.out.length === 0;
    const identical = base.ok && r.out === base.out;
    const nearIdentical = base.ok && !identical && norm(r.out) === norm(base.out);

    // Latin-1 mojibake signature: espeak NAMING an accent instead of
    // pronouncing it. This is what -b=1 produced. Belt-and-braces — the fix
    // should mean we never see it again, but the probe should catch it if we do.
    const mojibake = /tilde|circunflejo|acute|agudo|invertid|interrogaci|signo|letra/i.test(r.out);

    const nWords = inputWords(text).length;
    const nGroups = outputGroups(r.out).length;
    const shapeOk = nGroups === nWords;
    const shapeClose = !shapeOk && Math.abs(nGroups - nWords) <= 1;

    let verdict;
    if (empty) verdict = "SUSPICIOUS (empty output)";
    else if (mojibake) verdict = "SUSPICIOUS (accent NAMED, not pronounced — encoding bug)";
    else if (identical) verdict = "SUSPICIOUS (identical to en-us — silent fallback)";
    else if (nearIdentical) verdict = "SUSPICIOUS (near-identical to en-us)";
    else if (shapeOk) verdict = "OK";
    else if (shapeClose) verdict = "OK (word count off by 1 — check by eye)";
    else verdict = `SUSPICIOUS (shape mismatch: ${nWords} words in, ${nGroups} groups out)`;

    console.log(`    output : ${JSON.stringify(r.out)}`);
    console.log(`    length : ${r.out.length}   time: ${r.ms}ms`);
    console.log(`    shape  : ${nWords} input words -> ${nGroups} output groups  ${shapeOk ? "MATCH" : shapeClose ? "off-by-1" : "MISMATCH"}`);
    console.log(`    words  : ${JSON.stringify(inputWords(text))}`);
    console.log(`    groups : ${JSON.stringify(outputGroups(r.out))}`);
    console.log(`    ph/word: ${JSON.stringify(phonemesPerGroup(r.out))}`);
    console.log(`    verdict: ${verdict}`);

    attempts.push({ code, verdict, out: r.out, ms: r.ms, nWords, nGroups });
  }

  const winner = attempts.find((a) => a.verdict.startsWith("OK"));
  results.push({ lang, label, text, baseline: base.ok ? base.out : null, attempts, winner });
}

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log(`\n\n${"=".repeat(70)}`);
console.log("SUMMARY — working code per language");
console.log("=".repeat(70));
for (const r of results) {
  const w = r.winner;
  console.log(`\n${r.label} (${r.lang})`);
  console.log(`  code    : ${w ? w.code : "*** NONE WORKING ***"}`);
  console.log(`  input   : ${r.text}`);
  console.log(`  output  : ${w ? JSON.stringify(w.out) : "(none)"}`);
  console.log(`  en-us   : ${r.baseline !== null ? JSON.stringify(r.baseline) : "(baseline failed)"}`);
  console.log(`  shape   : ${w ? `${w.nWords} words in -> ${w.nGroups} groups out${w.nWords === w.nGroups ? " (MATCH)" : " (off by " + Math.abs(w.nWords - w.nGroups) + ")"}` : "(n/a)"}`);
  console.log(`  verdict : ${w ? w.verdict : r.attempts.map((a) => `${a.code}=${a.verdict}`).join("; ") || "(no attempts)"}`);
}

const okCount = results.filter((r) => r.winner).length;
console.log(`\n${"=".repeat(70)}`);
console.log(`RESULT: ${okCount}/5 languages phonemizing correctly`);
if (results.some((r) => r.winner)) {
  const times = results.filter((r) => r.winner).map((r) => r.winner.ms);
  console.log(`Per-call instantiation: ${Math.min(...times)}-${Math.max(...times)}ms (fresh WASM instance each call)`);
}
console.log("=".repeat(70));
