// scratch-apply-kokoro-step34.cjs
// TIER 2 STEP 3 + 4, applied ON TOP of the Step 2 routing patch.
//
//   STEP 3  expand _validate_voice to accept the 13 non-English voice IDs
//   STEP 4  gate English-only text normalization to language codes a/b
//   STEP 4b gate the English-only PHONEME remapping (see FINDING below)
//
// Run this, then re-run `npx patch-package kokoro-js` to FOLD IT INTO THE
// EXISTING patches/kokoro-js+1.2.1.patch (patch-package regenerates the whole
// file from the current node_modules state — it does not create a second one).
//
// Idempotent: guarded on __raciraHasVoice, so re-running is a no-op. Every
// replacement asserts EXACTLY ONE match before writing; zero or multiple =
// hard exit, nothing written. Same discipline as Step 2.
//
// ---------------------------------------------------------------------------
// WHY STEP 3 IS THE LOAD-BEARING HALF
//
// _validate_voice does NOT merely validate. Its body is:
//     _validate_voice(e){ if(!$.hasOwnProperty(e)) throw ...; return e.at(0) }
// It returns the FIRST CHARACTER of the voice ID, and that return value is
// what feeds Step 2's routing:
//     const r = this._validate_voice(a), n = await m(e, r)   // generate()
//     m(text, langCode) -> n = __raciraLang(langCode)        // Step 2 patch
//
// So the prefix letters line up exactly with the Step 2 map already in place:
//     ef_dora -> "e" -> es      ff_siwis  -> "f" -> fr
//     if_sara -> "i" -> it      pf_dora   -> "p" -> pt-BR
//     hf_alpha-> "h" -> hi
// Until _validate_voice accepts these IDs, Step 2's routing is unreachable —
// every non-English voice throws before phonemization is ever called.
//
// VOICE ID vs ESPEAK LANGUAGE CODE (the conflation the brief warned about)
// These are two independent paths and the patch keeps them independent:
//   - FULL voice id  -> the .bin style vector:
//       `https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/${e}.bin`
//     reached via generate_from_ids -> `(await k(a))`, where `a` is the full id.
//     "pf_dora" fetches voices/pf_dora.bin. The string "pt-BR" never touches it.
//   - FIRST CHAR ONLY -> the espeak voice, via _validate_voice -> __raciraLang.
//     "pf_dora".at(0) === "p" -> "pt-BR" -> espeak-ng -v pt-BR.
// Nothing derives one from the other, so the "pf"/"pt-BR" mismatch is correct
// by construction rather than by coincidence.
// ---------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "node_modules", "kokoro-js", "dist");

if (!fs.existsSync(DIST)) {
  console.log("[kokoro-step34] kokoro-js not found, skipping");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Helper block appended after Step 2's block.
//
// __raciraEnPhon gates three PHONEME-level rewrites. See the FINDING note at
// PATCH 1 edit 4 — these are provably lossy for es/it/pt/hi, and the Kokoro
// tokenizer vocab was checked directly to confirm the untransformed symbols
// are legal tokens rather than UNKs.
// ---------------------------------------------------------------------------
const HELPER2 = `/* racira: step 3+4 — voice validation unlock + English-only normalization gate */
const __RACIRA_VOICES={
ef_dora:{name:"Dora",language:"es",gender:"Female"},
em_alex:{name:"Alex",language:"es",gender:"Male"},
em_santa:{name:"Santa",language:"es",gender:"Male"},
ff_siwis:{name:"Siwis",language:"fr",gender:"Female"},
if_sara:{name:"Sara",language:"it",gender:"Female"},
im_nicola:{name:"Nicola",language:"it",gender:"Male"},
pf_dora:{name:"Dora",language:"pt-BR",gender:"Female"},
pm_alex:{name:"Alex",language:"pt-BR",gender:"Male"},
pm_santa:{name:"Santa",language:"pt-BR",gender:"Male"},
hf_alpha:{name:"Alpha",language:"hi",gender:"Female"},
hf_beta:{name:"Beta",language:"hi",gender:"Female"},
hm_omega:{name:"Omega",language:"hi",gender:"Male"},
hm_psi:{name:"Psi",language:"hi",gender:"Male"}};
function __raciraHasVoice(v){return Object.prototype.hasOwnProperty.call(__RACIRA_VOICES,v)}
function __raciraIsEnCode(c){return c==="a"||c==="b"}
function __raciraEnPhon(s,c){return __raciraIsEnCode(c)?s.replace(/\u02b2/g,"j").replace(/r/g,"\u0279").replace(/x/g,"k"):s}
`;

/** Replace `find` with `repl`, asserting exactly one occurrence. */
function replaceOnce(src, find, repl, label, file) {
  const parts = src.split(find);
  const n = parts.length - 1;
  if (n !== 1) {
    console.error(`[kokoro-step34] ABORT — ${file}: "${label}" matched ${n} times, expected exactly 1.`);
    console.error(`  looked for: ${find}`);
    process.exit(1);
  }
  return parts.join(repl);
}

function patchFile(file, edits, { extraExports = null } = {}) {
  const p = path.join(DIST, file);
  if (!fs.existsSync(p)) {
    console.log(`[kokoro-step34] ${file} not present, skipping`);
    return;
  }
  let src = fs.readFileSync(p, "utf8");

  if (!src.includes("__raciraLang")) {
    console.error(`[kokoro-step34] ABORT — ${file} has no Step 2 patch (__raciraLang missing).`);
    console.error(`  Step 3+4 build on Step 2. Apply scratch-apply-kokoro-lang-patch.cjs first.`);
    process.exit(1);
  }
  if (src.includes("__raciraHasVoice")) {
    console.log(`[kokoro-step34] ${file} already patched, skipping`);
    return;
  }

  for (const [label, find, repl] of edits) {
    src = replaceOnce(src, find, repl, label, file);
  }

  src = HELPER2 + src;

  if (extraExports) {
    src = replaceOnce(src, extraExports[0], extraExports[1], "export list", file);
  }

  fs.writeFileSync(p, src);
  console.log(`[kokoro-step34] Patched ${file} (${edits.length} edit(s)${extraExports ? " + exports" : ""})`);
}

// ===========================================================================
// PATCH 1: kokoro.js — the file webpack resolves for this repo
//   phonemize fn : m(e, a="a", t=!0)   -> language variable is `a`
//   VOICES map   : $
//   phoneme str  : s   -> post-processed into `i`
// ===========================================================================
patchFile(
  "kokoro.js",
  [
    // --- STEP 3 -----------------------------------------------------------
    // Widen the accepted set. The check itself is NOT weakened: an unknown id
    // still throws. Only the accepted set grows, 28 -> 41.
    ["validate: accept racira voices", `if(!$.hasOwnProperty(e))throw`, `if(!$.hasOwnProperty(e)&&!__raciraHasVoice(e))throw`],
    // Keep the thrown message truthful — it enumerates what is accepted, so it
    // has to list the new ids too or it misreports the real accepted set.
    [
      "validate: error lists new voices",
      'Should be one of: ${Object.keys($).join(", ")}.',
      'Should be one of: ${Object.keys($).concat(Object.keys(__RACIRA_VOICES)).join(", ")}.',
    ],

    // --- STEP 4: split the normalization chain at its natural seam ---------
    // The chain is one long .replace() run inside an IIFE. Everything up to
    // and including the blank-line squeeze is punctuation/whitespace work;
    // everything from `Dr.` onward emits ENGLISH WORDS or assumes English
    // number formatting. The seam falls exactly between them, so neither half
    // is rewritten — the agnostic half and the English half both stay
    // byte-identical, and only their control flow changes.
    //
    // Closes the IIFE early, then re-applies the English tail conditionally
    // via the comma operator:
    //   t&&(e=function(e){...AGNOSTIC.trim()}(e), __raciraIsEnCode(a)&&(e=e...ENGLISH.trim()))
    [
      "normalize: close IIFE at English seam",
      `.replace(/(?<=\\n) +(?=\\n)/g,"").replace(/\\bD[Rr]\\.(?= [A-Z])/g,"Doctor")`,
      `.replace(/(?<=\\n) +(?=\\n)/g,"").trim()}(e),__raciraIsEnCode(a)&&(e=e.replace(/\\bD[Rr]\\.(?= [A-Z])/g,"Doctor")`,
    ],
    [
      "normalize: rebalance chain tail",
      `.replace(/(?<=[A-Z])\\.(?=[A-Z])/gi,"-").trim()}(e));`,
      `.replace(/(?<=[A-Z])\\.(?=[A-Z])/gi,"-").trim()));`,
    ],

    // --- STEP 4b: gate the English-only PHONEME remapping -----------------
    // FINDING (beyond the flagged examples). AFTER phonemization, kokoro-js
    // unconditionally rewrites the IPA:
    //     .replace(/ʲ/g,"j").replace(/r/g,"ɹ").replace(/x/g,"k")
    // For the five target languages that is destructive, not protective:
    //     r -> ɹ  kills the es/it/pt/hi trill, replacing it with the English
    //             approximant:  "perro" /ˈpero/ -> /ˈpeɹo/
    //     x -> k  destroys the Spanish jota:     "Jorge" /ˈxoɾxe/ -> /ˈkoɾke/
    // The obvious worry is that these exist to keep phonemes inside Kokoro's
    // token vocabulary. Checked directly rather than assumed —
    // node_modules/@huggingface/transformers/.cache/onnx-community/
    // Kokoro-82M-v1.0-ONNX/tokenizer.json lists "r":60, "x":66 and "ʲ":164 as
    // real tokens, alongside ɾ:125 ɲ:114 ʎ:143 β:75 ɣ:139 ʁ:128 œ:120 ʈ:132
    // ɖ:80 ɳ:113 ʰ:162. The vocab is multilingual; the remap is lossy.
    //
    // /ɬ/g->"l" is deliberately LEFT UNCONDITIONAL: ɬ is Welsh and is NOT in
    // the vocab, so dropping that mapping would produce an unknown token.
    // Order is preserved exactly — the later `hˈʌndɹɪd` lookbehind depends on
    // ɹ already existing, so the gate wraps in place rather than reordering.
    [
      "phonemes: gate English-only IPA remap",
      `let i=s.replace(/k\u0259k\u02c8o\u02d0\u0279o\u028a/g,"k\u02c8o\u028ak\u0259\u0279o\u028a").replace(/k\u0259k\u02c8\u0254\u02d0\u0279\u0259\u028a/g,"k\u02c8\u0259\u028ak\u0259\u0279\u0259\u028a").replace(/\u02b2/g,"j").replace(/r/g,"\u0279").replace(/x/g,"k").replace(/\u026c/g,"l")`,
      `let i=__raciraEnPhon(s.replace(/k\u0259k\u02c8o\u02d0\u0279o\u028a/g,"k\u02c8o\u028ak\u0259\u0279o\u028a").replace(/k\u0259k\u02c8\u0254\u02d0\u0279\u0259\u028a/g,"k\u02c8\u0259\u028ak\u0259\u0279\u0259\u028a"),a).replace(/\u026c/g,"l")`,
    ],
  ],
  {
    // `m` is the internal phonemize(text, langCode, norm). Exporting it gives
    // the verifier a real seam to observe normalization gating end to end,
    // instead of re-implementing the chain and testing the re-implementation.
    extraExports: [
      `export{__raciraLang,__raciraPhon,__raciraEspeak};`,
      `export{__raciraLang,__raciraPhon,__raciraEspeak,__raciraHasVoice,__raciraIsEnCode,__RACIRA_VOICES,m as __raciraPhonemize};`,
    ],
  },
);

// ===========================================================================
// PATCH 2: kokoro.cjs — CommonJS consumers
//   phonemize fn : c(e, t="a", r=!0)   -> language variable is `t`
//   VOICES map   : v
//   phoneme str  : g   -> post-processed into `u`
// Same chain text, different minifier names. Verified by direct read, not
// assumed from kokoro.js.
// ===========================================================================
patchFile("kokoro.cjs", [
  ["validate: accept racira voices", `if(!v.hasOwnProperty(e))throw`, `if(!v.hasOwnProperty(e)&&!__raciraHasVoice(e))throw`],
  [
    "validate: error lists new voices",
    'Should be one of: ${Object.keys(v).join(", ")}.',
    'Should be one of: ${Object.keys(v).concat(Object.keys(__RACIRA_VOICES)).join(", ")}.',
  ],
  [
    "normalize: close IIFE at English seam",
    `.replace(/(?<=\\n) +(?=\\n)/g,"").replace(/\\bD[Rr]\\.(?= [A-Z])/g,"Doctor")`,
    `.replace(/(?<=\\n) +(?=\\n)/g,"").trim()}(e),__raciraIsEnCode(t)&&(e=e.replace(/\\bD[Rr]\\.(?= [A-Z])/g,"Doctor")`,
  ],
  [
    "normalize: rebalance chain tail",
    `.replace(/(?<=[A-Z])\\.(?=[A-Z])/gi,"-").trim()}(e));`,
    `.replace(/(?<=[A-Z])\\.(?=[A-Z])/gi,"-").trim()));`,
  ],
  [
    "phonemes: gate English-only IPA remap",
    `let u=g.replace(/k\u0259k\u02c8o\u02d0\u0279o\u028a/g,"k\u02c8o\u028ak\u0259\u0279o\u028a").replace(/k\u0259k\u02c8\u0254\u02d0\u0279\u0259\u028a/g,"k\u02c8\u0259\u028ak\u0259\u0279\u0259\u028a").replace(/\u02b2/g,"j").replace(/r/g,"\u0279").replace(/x/g,"k").replace(/\u026c/g,"l")`,
    `let u=__raciraEnPhon(g.replace(/k\u0259k\u02c8o\u02d0\u0279o\u028a/g,"k\u02c8o\u028ak\u0259\u0279o\u028a").replace(/k\u0259k\u02c8\u0254\u02d0\u0279\u0259\u028a/g,"k\u02c8\u0259\u028ak\u0259\u0279\u0259\u028a"),t).replace(/\u026c/g,"l")`,
  ],
]);

// ===========================================================================
// PATCH 3: kokoro.web.js — DELIBERATELY NOT WIDENED
//
// This file inlines its own English-only phonemizer as an IIFE, so Step 2
// could patch its language lookup but had no seam to redirect phonemization.
// Widening _validate_voice here would let "ef_dora" pass validation and then
// hand Spanish text to an English-only phonemizer — silent garbling, the exact
// bug this whole effort exists to kill.
//
// Leaving it strict means a non-English voice throws upstream's own
// "Voice not found" error: loud, immediate, correct. It is also only the
// jsdelivr/unpkg CDN entry (kokoro-js/package.json:63-64) and is NOT in this
// repo's resolution path — kokoro-js's "exports" declares types/node/default
// with no "browser" condition, so a webpack web build takes default ->
// dist/kokoro.js.
//
// No edit. Recorded here so the omission reads as a decision, not an oversight.
// ===========================================================================
console.log("[kokoro-step34] kokoro.web.js intentionally NOT widened (no phonemizer seam — see PATCH 3 note)");

console.log("\n[kokoro-step34] Done. Next:  npx patch-package kokoro-js");
