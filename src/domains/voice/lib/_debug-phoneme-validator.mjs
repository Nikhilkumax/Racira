/**
 * Throwaway diagnostic — NOT shipped, NOT imported by anything.
 *
 * Answers one question: when espeak-ng phonemizes Spanish, which characters
 * does Kokoro's tokenizer silently delete?
 *
 * Why this exists: the tokenizer in
 *   onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer.json
 * runs a `Replace` normalizer with content "" before tokenizing. Any character
 * outside its allow-list is replaced with the empty string. It does NOT become
 * <unk> — `unk_token` is "$", but unknown chars never reach the vocab lookup
 * because the normalizer already removed them. So a phoneme Kokoro doesn't know
 * just vanishes, with no error and nothing in any log. The only way to see it is
 * to diff the string before and after.
 *
 * Known trap this is built to catch: ASCII "g" (U+0067) is absent from both the
 * normalizer class and the vocab. Only IPA script "ɡ" (U+0261) is accepted.
 * They look nearly identical. If espeak emits ASCII g for "guitarra", the
 * consonant is silently dropped.
 *
 * Run from the repo root:
 *   node src/domains/voice/lib/_debug-phoneme-validator.mjs
 *
 * Delete this file once the real per-language post-processing lands.
 */

import { readFileSync } from "node:fs";
import { phonemize } from "phonemizer";

// ---------------------------------------------------------------------------
// Test inputs
// ---------------------------------------------------------------------------

const SENTENCES = [
  {
    label: "primary",
    // pero/perro = tap vs trill minimal pair; niño = ɲ; llegó = ʎ or ʝ;
    // guitarra = the g trap, plus a second trill.
    text: "Pero el perro corrió rápido. El niño pequeño llegó con su guitarra.",
  },
  { label: "probe:tap-vs-trill", text: "pero perro" },
  { label: "probe:g-words", text: "gato guitarra pagar guerra" },
  { label: "probe:palatals", text: "niño llave yo calle" },
  { label: "probe:fricatives", text: "haba nada lago" },
];

// ---------------------------------------------------------------------------
// Normalizer + vocab, read from the cached tokenizer where possible
// ---------------------------------------------------------------------------

const TOKENIZER_URL = new URL(
  "../../../../node_modules/@huggingface/transformers/.cache/" +
    "onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer.json",
  import.meta.url,
);

/**
 * Transcribed from the cached tokenizer.json. Only used if the cache is
 * missing. Written as \u escapes on purpose — these characters are too easy to
 * corrupt through an editor or a terminal copy/paste.
 */
const FALLBACK_PATTERN =
  '[^$;:,.!?—…"()“” ̃ʣʥʦʨ' +
  "ᵝꭧAIOQSTWYᵊabcdefhijklmnopqrstuvwxyzɑɐɒ" +
  "æβɔɕçɖðʤəɚɛɜ" +
  "ɟɡɥɨɪʝɯɰŋɳɲɴ" +
  "øɸθœɹɾɻʁɽʂʃʈ" +
  "ʧʊʋʌɣɤχʎʒʔˈˌ" +
  "ːʰʲ↓→↗↘ᵻ]";

let pattern = FALLBACK_PATTERN;
let vocab = null;
let source = "embedded fallback (cache not found)";

try {
  const raw = JSON.parse(readFileSync(TOKENIZER_URL, "utf8"));
  pattern = raw.normalizer.pattern.Regex;
  vocab = raw.model.vocab;
  source = "cached tokenizer.json";
  if (pattern !== FALLBACK_PATTERN) {
    console.log(
      "NOTE: on-disk normalizer differs from the transcribed fallback. " +
        "Using on-disk. The fallback in this file is stale.",
    );
  }
} catch (err) {
  console.log(`NOTE: could not read cached tokenizer (${err.code ?? err.message}).`);
}

/** Matches exactly the characters the normalizer deletes. */
const DELETES = new RegExp(pattern, "gu");
/** Single-char test — the class is negated, so a match means "gets deleted". */
const isDeleted = (ch) => new RegExp(pattern, "u").test(ch);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hex = (ch) => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

/** Names for the characters we specifically care about in the Spanish path. */
const NOTES = {
  "g": "ASCII g — THE TRAP. Kokoro only accepts IPA script ɡ (U+0261).",
  "r": "ASCII r — trill. In vocab (id 60). Must NOT be mapped to ɹ.",
  "ɾ": "tap ɾ — in vocab (id 125). Distinguishes pero from perro.",
  "ɡ": "IPA script ɡ — in vocab (id 92). This is the g Kokoro wants.",
  "ɲ": "ɲ — in vocab (id 114). niño.",
  "ʎ": "ʎ — in vocab (id 143).",
  "ʝ": "ʝ — in vocab (id 103).",
  "ˈ": "primary stress — in vocab (id 156).",
  "ˌ": "secondary stress — in vocab (id 157).",
  "_": "espeak separator — not a phoneme; expected to be stripped.",
  "-": "hyphen — not in the allow-list.",
  "'": "ASCII apostrophe — not in the allow-list (ˈ is the stress mark).",
};

function report({ label, text }, ipa) {
  const normalized = ipa.replace(DELETES, "");

  console.log("\n" + "=".repeat(72));
  console.log(`[${label}]`);
  console.log("=".repeat(72));
  console.log("  input      : " + text);
  console.log("  raw IPA    : " + ipa);
  console.log("  normalized : " + normalized);
  console.log(`  length     : ${[...ipa].length} -> ${[...normalized].length}`);

  // --- characters the normalizer deletes -----------------------------------
  const dropped = new Map();
  for (const ch of ipa) {
    if (isDeleted(ch)) dropped.set(ch, (dropped.get(ch) ?? 0) + 1);
  }

  if (dropped.size === 0) {
    console.log("\n  DELETED: none — every character survives the normalizer.");
  } else {
    console.log(`\n  DELETED (${dropped.size} distinct):`);
    for (const [ch, n] of [...dropped].sort((a, b) => b[1] - a[1])) {
      const note = NOTES[ch] ? `  <-- ${NOTES[ch]}` : "";
      console.log(`    ${JSON.stringify(ch).padEnd(8)} ${hex(ch).padEnd(8)} x${String(n).padEnd(3)}${note}`);
    }
  }

  // --- survives the normalizer but has no vocab entry ----------------------
  // A different failure class: the normalizer allows it through, then the
  // vocab lookup has nothing for it. Should be empty; if it isn't, that's a
  // real inconsistency in the tokenizer worth knowing about.
  if (vocab) {
    const orphans = new Map();
    for (const ch of normalized) {
      if (!Object.hasOwn(vocab, ch)) orphans.set(ch, (orphans.get(ch) ?? 0) + 1);
    }
    if (orphans.size > 0) {
      console.log(`\n  IN NORMALIZER BUT NOT IN VOCAB (${orphans.size} distinct):`);
      for (const [ch, n] of orphans) {
        console.log(`    ${JSON.stringify(ch).padEnd(8)} ${hex(ch).padEnd(8)} x${n}`);
      }
    }
  }

  // --- targeted checks -----------------------------------------------------
  const has = (ch) => ipa.includes(ch);
  const flags = [];
  if (has("g")) flags.push("ASCII g PRESENT -> silently deleted. Needs g -> ɡ.");
  if (has("ɡ")) flags.push("IPA ɡ present -> fine, no mapping needed.");
  if (has("r") && has("ɾ")) flags.push("BOTH r and ɾ present -> tap/trill contrast survives.");
  else if (has("r")) flags.push("r present, ɾ absent.");
  else if (has("ɾ")) flags.push("ɾ present, r absent -> check whether the trill is being flattened.");
  if (flags.length) {
    console.log("\n  CHECKS:");
    for (const f of flags) console.log("    - " + f);
  }

  return { label, dropped, normalized };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("Kokoro / espeak-ng Spanish phoneme validator");
console.log("normalizer source: " + source);
console.log("vocab entries    : " + (vocab ? Object.keys(vocab).length : "unavailable"));
console.log('espeak lang      : "es"');

// Sanity-check the two characters the whole g question turns on, so the run is
// self-validating rather than relying on my reading of the vocab.
if (vocab) {
  console.log("\nvocab spot-check:");
  for (const ch of ["g", "ɡ", "r", "ɾ", "ɲ", "ʎ", "ʝ"]) {
    const inNorm = !isDeleted(ch);
    const id = Object.hasOwn(vocab, ch) ? vocab[ch] : "ABSENT";
    console.log(
      `  ${JSON.stringify(ch).padEnd(8)} ${hex(ch).padEnd(8)} ` +
        `normalizer=${inNorm ? "keeps" : "DELETES"}  vocab=${id}`,
    );
  }
}

const results = [];
for (const s of SENTENCES) {
  try {
    const out = await phonemize(s.text, "es");
    const ipa = Array.isArray(out) ? out.join(" ") : String(out);
    results.push(report(s, ipa));
  } catch (err) {
    console.log(`\n[${s.label}] PHONEMIZE FAILED: ${err.message}`);
    console.log(err.stack);
  }
}

// ---------------------------------------------------------------------------
// Summary — the actual deliverable
// ---------------------------------------------------------------------------

console.log("\n" + "=".repeat(72));
console.log("SUMMARY — every character deleted across all inputs");
console.log("=".repeat(72));

const all = new Map();
for (const r of results) {
  for (const [ch, n] of r.dropped) all.set(ch, (all.get(ch) ?? 0) + n);
}

if (all.size === 0) {
  console.log("Nothing deleted in any sentence.");
  console.log("=> CASE 1: raw espeak-ng Spanish is already tokenizer-clean.");
  console.log("   No post-processing needed beyond NOT applying the English rules.");
} else {
  console.log(`${all.size} distinct character(s) would be silently dropped:\n`);
  for (const [ch, n] of [...all].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${JSON.stringify(ch).padEnd(8)} ${hex(ch).padEnd(8)} x${String(n).padEnd(4)}${NOTES[ch] ?? ""}`);
  }
  console.log("\n=> CASE 2: post-processing IS required. Each character above needs");
  console.log("   an explicit decision: map to a vocab member, or drop deliberately.");
}

console.log("\nReminder: this says nothing about whether the audio sounds correct.");
console.log("It only proves which symbols reach the model at all.");
