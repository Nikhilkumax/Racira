// scratch-verify-kokoro-step34.mjs
// TIER 2 STEP 3 + 4 verification.
//
// Exercises the REAL patched kokoro-js, never a re-implementation:
//   - validation via KokoroTTS.prototype._validate_voice
//   - normalization via the exported internal phonemize (`__raciraPhonemize`)
// A re-implementation that passes while the patch is broken is worse than no
// test, so both halves call into node_modules directly.
//
// _validate_voice touches only the module-scope VOICES map and its argument —
// no `this` state — so it can be called on a dummy receiver without loading
// the 82M model or a WebGPU device.

import { KokoroTTS, __raciraLang, __raciraHasVoice, __raciraPhonemize, __RACIRA_VOICES } from "kokoro-js";

const line = (c = "=") => c.repeat(74);
const validate = (v) => KokoroTTS.prototype._validate_voice.call({}, v);

console.log("=== Step 3 + 4 verification ===\n");

// ===========================================================================
// STEP 3a — the 13 newly-accepted voice IDs must validate AND yield the right
// espeak language. Both halves matter: passing validation while resolving to
// the wrong espeak voice would still ship Spanish read as English.
// ===========================================================================
console.log(line());
console.log("STEP 3a — new voice IDs: validate + resolve to correct espeak voice");
console.log(line());
console.log("  voice id     prefix  espeak    expected  result");
console.log("  " + "-".repeat(60));

const EXPECT = {
  ef_dora: "es", em_alex: "es", em_santa: "es",
  ff_siwis: "fr",
  if_sara: "it", im_nicola: "it",
  pf_dora: "pt-BR", pm_alex: "pt-BR", pm_santa: "pt-BR",
  hf_alpha: "hi", hf_beta: "hi", hm_omega: "hi", hm_psi: "hi",
};

let acceptFails = 0;
for (const [voice, want] of Object.entries(EXPECT)) {
  let prefix = "-", espeak = "-", status;
  try {
    prefix = validate(voice);
    espeak = __raciraLang(prefix);
    const ok = espeak === want;
    if (!ok) acceptFails++;
    status = ok ? "OK" : `WRONG (wanted ${want})`;
  } catch (e) {
    acceptFails++;
    status = `THROW: ${e.message.slice(0, 40)}`;
  }
  console.log(`  ${voice.padEnd(12)} ${String(prefix).padEnd(7)} ${String(espeak).padEnd(9)} ${want.padEnd(9)} ${status}`);
}

// ===========================================================================
// STEP 3b — the check must still REJECT. Expanding an allowlist into an
// accept-everything is the failure mode worth guarding against, so this
// asserts throws rather than counting successes.
//
// Includes near-misses on purpose: a fabricated id sharing a real prefix
// (ef_nonexistent) and a real English name under a wrong prefix (ef_heart)
// would both slip through a prefix-only check.
// ===========================================================================
console.log(`\n${line()}`);
console.log("STEP 3b — invalid voice IDs must still THROW");
console.log(line());

const MUST_REJECT = [
  "xx_fake", "ef_nonexistent", "ef_heart", "totally_made_up",
  "", "af_heart_", "EF_DORA", "e", "ja_tanaka", "zf_xiaobei",
];
let rejectFails = 0;
for (const bad of MUST_REJECT) {
  let status;
  try {
    const r = validate(bad);
    status = `NO THROW — returned ${JSON.stringify(r)}   <-- BUG`;
    rejectFails++;
  } catch {
    status = "throws OK";
  }
  console.log(`  ${JSON.stringify(bad).padEnd(20)} ${status}`);
}
// ja_/zf_ are Japanese/Chinese: out of scope by decision, so rejection is correct.

// Sanity: English must be untouched by Step 3.
console.log(`\n  English regression check (must still work):`);
for (const v of ["af_heart", "bm_george"]) {
  try {
    console.log(`    ${v.padEnd(12)} -> ${validate(v)} -> ${__raciraLang(validate(v))}   OK`);
  } catch (e) {
    acceptFails++;
    console.log(`    ${v.padEnd(12)} THROW: ${e.message}   <-- REGRESSION`);
  }
}

// ===========================================================================
// STEP 4 — normalization gating, English vs non-English, same input.
//
// Each probe targets one specific normalization step. The decimal-comma case
// is the important one: "3,14" is 3.14 in es/fr/it/pt, and the unconditional
// thousands-separator strip turned it into "314" — a silent numeric
// corruption, not merely an accent problem.
// ===========================================================================
console.log(`\n${line()}`);
console.log("STEP 4 — English-only normalization must NOT run for e/f/i/p/h");
console.log(line());

const PROBES = [
  { text: "Dr. Smith",       targets: "Dr. -> Doctor" },
  { text: "It cost $5.",     targets: "currency -> 'five dollars'" },
  { text: "In 1990.",        targets: "year -> 'nineteen ninety'" },
  { text: "Son 3,14 euros.", targets: "decimal comma -> '314'  (CORRUPTION)" },
];

for (const probe of PROBES) {
  console.log(`\ninput: ${JSON.stringify(probe.text)}`);
  console.log(`  step under test: ${probe.targets}`);
  for (const [code, label] of [["a", "English-US"], ["e", "Spanish"]]) {
    try {
      const t0 = Date.now();
      const out = await __raciraPhonemize(probe.text, code);
      console.log(`  ${label.padEnd(11)} (${code}) -> ${JSON.stringify(out)}   [${Date.now() - t0}ms]`);
    } catch (e) {
      console.log(`  ${label.padEnd(11)} (${code}) -> THROW: ${e.message}`);
    }
  }
}

// ===========================================================================
// STEP 4b — the phoneme remap gate.
//
// "Jorge" is the sharpest probe available: espeak Spanish gives /ˈxoɾxe/, and
// the unconditional x->k remap turns it into /ˈkoɾke/. If the Spanish output
// below still contains "k" where "x" belongs, the gate did not take effect.
// ===========================================================================
console.log(`\n${line()}`);
console.log("STEP 4b — English-only IPA remap (x->k, r->ɹ) must NOT run for e/f/i/p/h");
console.log(line());

for (const probe of ["Jorge", "perro"]) {
  console.log(`\ninput: ${JSON.stringify(probe)}`);
  for (const [code, label] of [["a", "English-US"], ["e", "Spanish"]]) {
    try {
      const out = await __raciraPhonemize(probe, code);
      const hasX = out.includes("x"), hasTrill = /(?<![ː])r/.test(out), hasApprox = out.includes("ɹ");
      console.log(
        `  ${label.padEnd(11)} (${code}) -> ${JSON.stringify(out).padEnd(24)}` +
          `  x:${hasX ? "yes" : "no "}  r:${hasTrill ? "yes" : "no "}  ɹ:${hasApprox ? "yes" : "no "}`,
      );
    } catch (e) {
      console.log(`  ${label.padEnd(11)} (${code}) -> THROW: ${e.message}`);
    }
  }
}

// ===========================================================================
console.log(`\n\n${line()}`);
console.log("SUMMARY");
console.log(line());
console.log(`  new voices accepted + correctly routed : ${13 - acceptFails}/13`);
console.log(`  invalid voices correctly rejected      : ${MUST_REJECT.length - rejectFails}/${MUST_REJECT.length}`);
console.log(`  accepted set size                      : 28 English + ${Object.keys(__RACIRA_VOICES).length} non-English`);
console.log(`  __raciraHasVoice('ef_dora')            : ${__raciraHasVoice("ef_dora")}`);
console.log(`  __raciraHasVoice('af_heart')           : ${__raciraHasVoice("af_heart")}  (English lives in upstream VOICES, not this map)`);
console.log(line());
console.log("Read the Step 4 outputs by eye — a pass count cannot tell you whether");
console.log("the Spanish column is genuinely unnormalized or merely non-empty.");
console.log(line());
