// scratch-verify-tier2-final.mjs
// TIER 2 FINAL VERIFICATION — items 1 and 3.
//
// Drives the REAL patched kokoro-js and the REAL UI data tables. Nothing here
// re-implements the pipeline; every step calls into node_modules or src.
//
// WHAT THIS CAN AND CANNOT PROVE
// Audio synthesis needs WebGPU. kokoroEngine.ts:29-31 pins device:"webgpu" with
// no fallback (deliberately — the wasm fallback was deleted in a prior pass), and
// Node has no navigator.gpu. So this verifies the pipeline up to and including
// phonemization + tokenization, and stops where synthesis would begin.
// Audio itself is NOT confirmed here. Item 1's browser steps are the only thing
// that can confirm it.
//
// Tokenization is included on purpose: it is the last stage before the model, and
// it is where a phoneme outside Kokoro's vocab would surface as an UNK. Phonemes
// alone would not catch that.

import { readFileSync } from "node:fs";
import { KokoroTTS, __raciraLang, __raciraPhonemize } from "kokoro-js";
import { AutoTokenizer } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const line = (c = "=") => c.repeat(78);
const validate = (v) => KokoroTTS.prototype._validate_voice.call({}, v);

// Parse the UI table straight out of the .ts source. Importing it would need a
// TS loader; this keeps the check honest about what the file actually contains
// without adding a build step.
const src = readFileSync(new URL("./src/domains/voice/lib/kokoroVoices.ts", import.meta.url), "utf8");
const uiVoices = [...src.matchAll(/\{ id: "([^"]+)", name: "([^"]+)", language: "([^"]+)"/g)]
  .map(([, id, name, language]) => ({ id, name, language }));
const uiLangs = [...src.matchAll(/\{ code: "([^"]+)", label: "([^"]+)" \}/g)]
  .map(([, code, label]) => ({ code, label }));

// One case per language now live. Text is real prose in each language — the
// point is to exercise the language's own orthography, not a transliteration.
const CASES = [
  { lang: "en-us", voice: "af_heart",  text: "Hello, how are you today?" },
  { lang: "en-gb", voice: "bf_emma",   text: "Hello, how are you today?" },
  { lang: "es",    voice: "ef_dora",   text: "Hola, ¿cómo estás? Me llamo Jorge." },
  { lang: "fr",    voice: "ff_siwis",  text: "Bonjour, comment allez-vous?" },
  { lang: "it",    voice: "if_sara",   text: "Ciao, come stai oggi?" },
  { lang: "pt-BR", voice: "pf_dora",   text: "Olá, como você está?" },
  { lang: "hi",    voice: "hf_alpha",  text: "नमस्ते, आप कैसे हैं?" },
];

console.log("=== TIER 2 FINAL VERIFICATION (items 1 + 3) ===\n");

// ---------------------------------------------------------------------------
// UI table vs. patched validator. Catches the failure where the dropdown offers
// a voice the engine rejects, or a language whose voices were never added.
// ---------------------------------------------------------------------------
console.log(line());
console.log("A. UI tables agree with the patched engine");
console.log(line());
console.log(`  KOKORO_VOICES entries    : ${uiVoices.length}`);
console.log(`  KOKORO_LANGUAGES entries : ${uiLangs.length}\n`);

let mismatches = 0;
for (const l of uiLangs) {
  const voices = uiVoices.filter((v) => v.language === l.code);
  let note = `${String(voices.length).padStart(2)} voice(s)`;
  if (voices.length === 0) {
    note += "   <-- BUG: language in dropdown with no selectable voice";
    mismatches++;
  } else {
    // KokoroGenerator.tsx:109 auto-selects filtered[0] on language change, so
    // that specific voice must survive validation or the UI breaks on switch.
    try {
      const prefix = validate(voices[0].id);
      note += `   default ${voices[0].id} -> "${prefix}" -> ${__raciraLang(prefix)}`;
    } catch (e) {
      note += `   <-- BUG: default ${voices[0].id} REJECTED: ${e.message.slice(0, 40)}`;
      mismatches++;
    }
  }
  console.log(`  ${l.code.padEnd(7)} ${l.label.padEnd(22)} ${note}`);
}

console.log("\n  every UI voice id accepted by _validate_voice?");
const rejected = uiVoices.filter((v) => {
  try { validate(v.id); return false; } catch { return true; }
});
console.log(`    ${uiVoices.length - rejected.length}/${uiVoices.length} accepted` +
  (rejected.length ? `   REJECTED: ${rejected.map((v) => v.id).join(", ")}  <-- BUG` : ""));
mismatches += rejected.length;

// ---------------------------------------------------------------------------
// The pipeline, per language, exactly as generate() runs it.
// ---------------------------------------------------------------------------
console.log(`\n${line()}`);
console.log("B. Full pipeline per language: voice -> lang code -> phonemes -> tokens");
console.log(line());

let tokenizer = null;
try {
  tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
  console.log("  tokenizer: loaded from cache/hub\n");
} catch (e) {
  console.log(`  tokenizer: UNAVAILABLE (${e.message.slice(0, 60)}) — skipping token stage\n`);
}

const results = [];
for (const c of CASES) {
  console.log(`\n${"-".repeat(78)}`);
  console.log(`${c.lang}  voice=${c.voice}`);
  console.log(`input: ${c.text}`);

  const row = { ...c, ok: false };
  try {
    // Exactly the generate() sequence: _validate_voice -> phonemize(text, code).
    const code = validate(c.voice);
    const espeak = __raciraLang(code);
    const t0 = Date.now();
    const phonemes = await __raciraPhonemize(c.text, code);
    const ms = Date.now() - t0;

    console.log(`  voice id -> code    : "${c.voice}" -> "${code}"`);
    console.log(`  code -> espeak voice: "${code}" -> "${espeak}"`);
    console.log(`  engine              : ${espeak === "en-us" || espeak === "en" ? "phonemizer (English)" : "espeak-ng"}`);
    console.log(`  phonemes            : ${JSON.stringify(phonemes)}`);
    console.log(`  phoneme length      : ${phonemes.length}   time: ${ms}ms`);

    Object.assign(row, { code, espeak, phonemes, ms });

    if (tokenizer) {
      const { input_ids } = tokenizer(phonemes, { truncation: true });
      const ids = input_ids.tolist()[0];
      // An UNK here means a phoneme outside Kokoro's vocab — the failure mode
      // the x->k / r->ɹ remap was originally suspected to be protecting against.
      const unk = tokenizer.unk_token_id;
      const unkCount = unk === undefined || unk === null ? 0 : ids.filter((i) => i === unk).length;
      console.log(`  tokens              : ${ids.length} ids  [${ids.slice(0, 12).join(", ")}${ids.length > 12 ? ", …" : ""}]`);
      console.log(`  unknown tokens      : ${unkCount}${unkCount ? "   <-- phoneme(s) outside Kokoro's vocab" : ""}`);
      row.tokens = ids.length;
      row.unk = unkCount;
      row.ok = phonemes.length > 0 && unkCount === 0;
    } else {
      row.ok = phonemes.length > 0;
    }
  } catch (e) {
    console.log(`  [THROW] ${e.message}`);
    row.error = e.message;
  }
  results.push(row);
}

// ---------------------------------------------------------------------------
// Item 3: the original bug. Hindi text through hf_alpha must NOT come out as
// English phonemes. Compared against the English baseline for the SAME text.
// ---------------------------------------------------------------------------
console.log(`\n\n${line()}`);
console.log("C. ORIGINAL BUG — hf_alpha + Hindi text must not silently use English");
console.log(line());

const hindiText = "नमस्ते, आप कैसे हैं?";
try {
  const code = validate("hf_alpha");
  const viaHindi = await __raciraPhonemize(hindiText, code);
  const viaEnglish = await __raciraPhonemize(hindiText, "a");

  console.log(`  text                     : ${hindiText}`);
  console.log(`  hf_alpha -> code         : "${code}"  -> espeak "${__raciraLang(code)}"`);
  console.log(`  phonemes via hf_alpha    : ${JSON.stringify(viaHindi)}`);
  console.log(`  phonemes via af_heart(a) : ${JSON.stringify(viaEnglish)}`);

  const identical = viaHindi === viaEnglish;
  const empty = viaHindi.trim().length === 0;
  console.log(`\n  distinct from English?   : ${identical ? "NO  <-- BUG, routing did not take effect" : "YES"}`);
  console.log(`  non-empty?               : ${empty ? "NO  <-- BUG" : "YES"}`);
  console.log(`  VERDICT                  : ${!identical && !empty ? "FIXED — Hindi routes through espeak-ng hi" : "NOT FIXED"}`);

  // The pre-fix behaviour, reproduced deliberately: before the patch every code
  // resolved to "en-us"/"en", so this is what the user actually heard.
  console.log(`\n  (for contrast — what the old code did: every non-a code fell to "en",`);
  console.log(`   producing the af_heart line above regardless of the voice selected)`);
} catch (e) {
  console.log(`  [THROW] ${e.message}`);
}

// ---------------------------------------------------------------------------
console.log(`\n\n${line()}`);
console.log("SUMMARY");
console.log(line());
for (const r of results) {
  const status = r.error ? `THROW: ${r.error.slice(0, 40)}` : r.ok ? "OK" : "CHECK BY EYE";
  console.log(
    `  ${r.lang.padEnd(7)} ${r.voice.padEnd(10)} -> ${String(r.espeak ?? "?").padEnd(7)}` +
      ` ${String(r.phonemes?.length ?? 0).padStart(4)} ph` +
      ` ${String(r.tokens ?? "-").padStart(4)} tok` +
      ` ${String(r.ms ?? "-").padStart(5)}ms   ${status}`,
  );
}
const okCount = results.filter((r) => r.ok).length;
console.log(`\n  pipeline OK       : ${okCount}/${CASES.length} languages`);
console.log(`  UI/engine mismatch: ${mismatches}`);
console.log(`\n  AUDIO NOT VERIFIED HERE — synthesis requires WebGPU, which Node lacks.`);
console.log(`  This confirms the pipeline through tokenization only. Confirm audio in`);
console.log(`  the browser at /voice.`);
console.log(line());
