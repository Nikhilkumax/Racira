/**
 * Regenerates src/domains/voice/lib/voiceCatalog.ts from the voice list that
 * ships inside @mintplex-labs/piper-tts-web.
 *
 * Why generate instead of hand-copying: the library's bundled voice list is
 * the only authoritative set of voices that the installed version can actually
 * synthesize (PATH_MAP is keyed off the same ids), and it changes between
 * versions. A hand-maintained copy silently drifts — a voice appears in the
 * picker that the engine cannot fetch, or a new voice is missing until someone
 * notices. Run `npm run gen:voices` after any bump of that dependency.
 *
 * Source of truth: the `VoiceId` union in
 * node_modules/@mintplex-labs/piper-tts-web/dist/types.d.ts, unioned with the
 * keys of the library's own `PATH_MAP` in dist/piper-tts-web.js. Every id is
 * `{language}_{REGION}-{speaker}-{quality}`, e.g. "en_US-amy-medium".
 *
 * Both sources are needed, not just the union: `PATH_MAP` is what the engine
 * actually looks a voice up in at synthesis time, and it carries ids the union
 * was never updated for. Reading only the union leaves those voices (including
 * a standard-tier Italian voice and an entire language) unreachable in the
 * picker even though the engine can fetch and synthesize them.
 *
 * Usage: node scripts/generate-voice-catalog.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const pkgDir = path.join(root, "node_modules", "@mintplex-labs", "piper-tts-web");
const typesPath = path.join(pkgDir, "dist", "types.d.ts");
const outPath = path.join(root, "src", "domains", "voice", "lib", "voiceCatalog.ts");

// ── Source parsing ──────────────────────────────────────────────────────

if (!fs.existsSync(typesPath)) {
  console.error(
    `[voices] ${path.relative(root, typesPath)} not found — run npm install first.`,
  );
  process.exit(1);
}

const types = fs.readFileSync(typesPath, "utf8");
const version = JSON.parse(
  fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
).version;

const unionMatch = types.match(/export type VoiceId =([^;]+);/);
if (!unionMatch) {
  console.error("[voices] Could not locate the VoiceId union — did the library change shape?");
  process.exit(1);
}

const unionVoiceIds = [...unionMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

// The union is not the full set of voices the installed version can fetch —
// PATH_MAP is, because PATH_MAP is what `TtsSession` resolves the model path
// through. Parse its keys straight out of the bundle (a key is a line of the
// object that maps an id to an .onnx path) and union them in.
const bundlePath = path.join(pkgDir, "dist", "piper-tts-web.js");
const bundle = fs.readFileSync(bundlePath, "utf8");
const pathMapStart = bundle.indexOf("const PATH_MAP");
if (pathMapStart < 0) {
  console.error("[voices] Could not locate PATH_MAP in dist/piper-tts-web.js — did the bundle change shape?");
  process.exit(1);
}
const pathMapBlock = bundle.slice(pathMapStart, bundle.indexOf("};", pathMapStart));
const pathMapIds = [...pathMapBlock.matchAll(/"([^"]+)"\s*:\s*"[^"]*\.onnx"/g)].map((m) => m[1]);

// A PATH_MAP that parses to fewer ids than the union means the parse broke;
// failing here is better than quietly writing a catalog that drops voices.
if (pathMapIds.length < unionVoiceIds.length) {
  console.error(
    `[voices] PATH_MAP parsed to ${pathMapIds.length} ids, fewer than the ` +
      `${unionVoiceIds.length} in the union — parsing is broken.`,
  );
  process.exit(1);
}

const voiceIds = [...new Set([...unionVoiceIds, ...pathMapIds])];

// The CountryCode union is the library's own list of language-region codes.
// Parsed rather than assumed so a new code cannot slip in uncharted.
const countryMatch = types.match(/export type CountryCode =([^;]+);/);
const countryCodes = countryMatch
  ? [...countryMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  : [];

const QUALITY_LABELS = {
  x_low: "Very light",
  low: "Light",
  medium: "Standard",
  high: "High fidelity",
};

// Display names for the language-region codes in the union. A missing entry is
// a hard error rather than a silent fallback to a raw code, so a library bump
// that adds a language stops the build instead of shipping "xx_XX" to the UI.
const LANGUAGE_LABELS = {
  ar_JO: "Arabic (Jordan)",
  ca_ES: "Catalan (Spain)",
  cs_CZ: "Czech (Czechia)",
  cy_GB: "Welsh",
  da_DK: "Danish (Denmark)",
  de_DE: "German (Germany)",
  el_GR: "Greek (Greece)",
  en_GB: "English (United Kingdom)",
  en_US: "English (United States)",
  es_ES: "Spanish (Spain)",
  es_MX: "Spanish (Mexico)",
  fa_IR: "Persian (Iran)",
  fi_FI: "Finnish (Finland)",
  fr_FR: "French (France)",
  hu_HU: "Hungarian (Hungary)",
  is_IS: "Icelandic (Iceland)",
  it_IT: "Italian (Italy)",
  ka_GE: "Georgian (Georgia)",
  kk_KZ: "Kazakh (Kazakhstan)",
  lb_LU: "Luxembourgish (Luxembourg)",
  ne_NP: "Nepali (Nepal)",
  nl_BE: "Dutch (Belgium)",
  nl_NL: "Dutch (Netherlands)",
  no_NO: "Norwegian (Norway)",
  pl_PL: "Polish (Poland)",
  pt_BR: "Portuguese (Brazil)",
  pt_PT: "Portuguese (Portugal)",
  ro_RO: "Romanian (Romania)",
  ru_RU: "Russian (Russia)",
  sk_SK: "Slovak (Slovakia)",
  sl_SI: "Slovenian (Slovenia)",
  sr_RS: "Serbian (Serbia)",
  sv_SE: "Swedish (Sweden)",
  sw_CD: "Swahili (DR Congo)",
  tr_TR: "Turkish (Türkiye)",
  uk_UA: "Ukrainian (Ukraine)",
  vi_VN: "Vietnamese (Vietnam)",
  zh_CN: "Chinese (China)",
};

// English-first shortlist pinned to the top of the picker. Every id must exist
// in the union; a stale entry fails the generator rather than rendering a
// dead option. The first entry is the picker's default: Ryan, the flagship US
// male voice — at *standard* quality. The high-fidelity model is twice the
// download and roughly four times the synthesis time per part, and the default
// is the first impression of the tool, so the fast tier leads. High fidelity
// sits one row below it and every tier stays selectable.
const FEATURED_VOICE_IDS = [
  "en_US-ryan-medium",
  "en_US-ryan-high",
  "en_US-amy-medium",
  "en_US-lessac-medium",
  "en_US-hfc_female-medium",
  "en_US-joe-medium",
  "en_US-libritts_r-medium",
  "en_GB-alba-medium",
  "en_GB-cori-high",
  "en_GB-jenny_dioco-medium",
  "en_GB-northern_english_male-medium",
];

// English first, then every other language in label order. Everything is
// derived from the union below, so the UI order cannot point at a voice the
// engine does not ship.
const ENGLISH_FIRST = ["en_US", "en_GB"];

// ── Curated names and gender ──────────────────────────────────────────

// Display names and gender tags live in the domain (voiceNames.ts), written by
// hand and reviewed like any other copy. This script — plain Node — cannot
// import TypeScript, so it extracts the entries structurally. The file's shape
// is enforced here: any line inside the mapping that is not a comment and does
// not match the entry pattern aborts the run, so a hand-edit that breaks the
// format surfaces immediately instead of silently dropping names.
const namesPath = path.join(root, "src", "domains", "voice", "lib", "voiceNames.ts");
const namesSource = fs.readFileSync(namesPath, "utf8");
const mappingStart = namesSource.indexOf("VOICE_NAME_OVERRIDES");
if (mappingStart < 0) {
  console.error("[voices] VOICE_NAME_OVERRIDES not found in voiceNames.ts — did the file change shape?");
  process.exit(1);
}
// Start just after the declaration's "= {" so the export line itself is
// never parsed as an entry. Searching for "= {" rather than the first "{" avoids
// matching braces inside the key type's template literal.
const openBrace = namesSource.indexOf("= {", mappingStart);
if (openBrace < 0) {
  console.error("[voices] VOICE_NAME_OVERRIDES has no opening brace — did the file change shape?");
  process.exit(1);
}
const bodyStart = openBrace + "= {".length;

const ENTRY_PATTERN = /^'([a-z]{2}_[A-Z]{2}\|[^']+)':\s*\{\s*name:\s*'([^']*)',\s*gender:\s*'(male|female)',?\s*\},?$/;

const overrides = new Map();
for (const rawLine of namesSource.slice(bodyStart).split("\n")) {
  const line = rawLine.trim();
  if (!line || line.startsWith("//") || line.startsWith("export") || line === "};") continue;

  const match = line.match(ENTRY_PATTERN);
  if (!match) {
    console.error(`[voices] Unparsable line in voiceNames.ts mapping: ${line}`);
    process.exit(1);
  }
  const [, key, name, gender] = match;
  if (overrides.has(key)) {
    console.error(`[voices] Duplicate key in voiceNames.ts: ${key}`);
    process.exit(1);
  }
  if (!name.trim()) {
    console.error(`[voices] Empty name in voiceNames.ts for: ${key}`);
    process.exit(1);
  }
  overrides.set(key, { name, gender });
}

if (overrides.size === 0) {
  console.error("[voices] No entries parsed from voiceNames.ts — extraction is broken.");
  process.exit(1);
}

// ── Derivation ──────────────────────────────────────────────────────────

const seen = new Set();
const matchedOverrides = new Set();
// lang -> Map<displayName, firstSpeakerSlugUsingIt>, for the duplicate check.
const nameOwners = new Map();
const voices = [];
const problems = [];

for (const id of voiceIds) {
  // \p{L} rather than A-Za-z: speaker slugs are not ASCII-only ("pt_PT-tugão-medium").
  if (!/^[a-z]{2}_[A-Z]{2}-[\p{L}\p{N}_]+-(x_low|low|medium|high)$/u.test(id)) {
    problems.push(`Unrecognised voice id shape: ${id}`);
    continue;
  }

  const dash = id.indexOf("-");
  const lastDash = id.lastIndexOf("-");
  const lang = id.slice(0, dash);
  const speaker = id.slice(dash + 1, lastDash);
  const quality = id.slice(lastDash + 1);

  if (!LANGUAGE_LABELS[lang]) {
    problems.push(`No display label for language code: ${lang} (voice ${id})`);
  }
  if (!QUALITY_LABELS[quality]) {
    problems.push(`No display label for quality tier: ${quality} (voice ${id})`);
  }
  if (seen.has(id)) problems.push(`Duplicate voice id: ${id}`);
  seen.add(id);

  // Names and gender come only from the curated mapping. A missing entry is a
  // hard error — the fallback would be a raw corpus label like "Vctk" or
  // "Mls", which is exactly what the mapping exists to prevent.
  const overrideKey = `${lang}|${speaker}`;
  const override = overrides.get(overrideKey);
  if (!override) {
    problems.push(`No curated name/gender for ${id} — add "${overrideKey}" to voiceNames.ts`);
  }
  matchedOverrides.add(overrideKey);

  // Two different speakers in one language must not share a display name —
  // the dropdown would offer the same person twice. Quality variants of one
  // speaker ("Amy — Standard" vs "Amy — Light") are legitimate and excluded.
  if (override) {
    const owners = nameOwners.get(lang) ?? new Map();
    const owner = owners.get(override.name);
    if (owner && owner !== speaker) {
      problems.push(
        `Duplicate display name "${override.name}" in ${lang}: speakers "${owner}" and "${speaker}"`,
      );
    } else if (!owner) {
      owners.set(override.name, speaker);
      nameOwners.set(lang, owners);
    }
  }

  voices.push({
    id,
    lang,
    langName: LANGUAGE_LABELS[lang] ?? lang,
    speaker,
    name: override?.name ?? speaker,
    gender: override?.gender ?? "female",
    quality,
    qualityLabel: QUALITY_LABELS[quality] ?? quality,
  });
}

// The mapping must cover exactly the installed library: an override no voice
// uses is a stale entry (a renamed or removed speaker) and would silently rot.
for (const key of overrides.keys()) {
  if (!matchedOverrides.has(key)) {
    problems.push(`Stale override "${key}" in voiceNames.ts — no such voice in the installed library`);
  }
}

for (const id of FEATURED_VOICE_IDS) {
  if (!seen.has(id)) problems.push(`Featured voice is not in the union: ${id}`);
}

if (countryCodes.length) {
  const unlabelled = countryCodes.filter((code) => !LANGUAGE_LABELS[code]);
  if (unlabelled.length) {
    problems.push(`CountryCode values with no label: ${unlabelled.join(", ")}`);
  }
}

if (problems.length) {
  console.error("[voices] Refusing to write a catalog with gaps:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const languageCodes = [...new Set(voices.map((v) => v.lang))];
const sortedLanguages = [
  ...ENGLISH_FIRST.filter((code) => languageCodes.includes(code)),
  ...languageCodes
    .filter((code) => !ENGLISH_FIRST.includes(code))
    .sort((a, b) => LANGUAGE_LABELS[a].localeCompare(LANGUAGE_LABELS[b])),
];

/** Featured first (in shortlist order), then everything else alphabetically. */
function orderVoicesForLanguage(code) {
  const inLanguage = voices.filter((v) => v.lang === code);
  const featured = FEATURED_VOICE_IDS.filter((id) => inLanguage.some((v) => v.id === id))
    .map((id) => inLanguage.find((v) => v.id === id));
  const rest = inLanguage
    .filter((v) => !FEATURED_VOICE_IDS.includes(v.id))
    .sort((a, b) => a.name.localeCompare(b.name) || a.qualityLabel.localeCompare(b.qualityLabel));
  return [...featured, ...rest];
}

const catalogEntries = sortedLanguages
  .flatMap((code) => orderVoicesForLanguage(code))
  .map((v) => `  ${JSON.stringify(v)},`)
  .join("\n");

const languageEntries = sortedLanguages
  .map(
    (code) =>
      `  { code: ${JSON.stringify(code)}, label: ${JSON.stringify(LANGUAGE_LABELS[code])}, ` +
      `voiceCount: ${voices.filter((v) => v.lang === code).length} },`,
  )
  .join("\n");

const out = `// AUTO-GENERATED — do not edit by hand.
//
// Source: @mintplex-labs/piper-tts-web@${version} — the VoiceId union
// (dist/types.d.ts) unioned with the engine's PATH_MAP keys (dist/piper-tts-web.js),
// which is the authoritative set of ids the installed version can fetch.
// Regenerate with: npm run gen:voices
//
// ${voices.length} voices across ${sortedLanguages.length} languages. The picker reads
// everything from here, so a dependency bump is a regeneration rather than a
// code change. Display names and gender tags are curated in voiceNames.ts —
// the generator hard-fails if any voice is missing from that mapping, if the
// mapping names a voice the library no longer ships, or if two speakers in one
// language share a display name.

export interface VoiceOption {
  /** Engine-facing id, e.g. "en_US-ryan-high". */
  id: string;
  /** Language-region code, e.g. "en_US". */
  lang: string;
  /** Human-readable language name, e.g. "English (United States)". */
  langName: string;
  /** Speaker slug as published, e.g. "ryan". */
  speaker: string;
  /** Curated display name, e.g. "Ryan" (from voiceNames.ts). */
  name: string;
  /** Voice gender for the picker's filter (from voiceNames.ts). */
  gender: "male" | "female";
  /** Quality tier as published. */
  quality: "x_low" | "low" | "medium" | "high";
  /** Display label for the quality tier. */
  qualityLabel: string;
}

export const VOICE_CATALOG: VoiceOption[] = [
${catalogEntries}
];

export interface VoiceLanguage {
  /** Language-region code, e.g. "en_GB". */
  code: string;
  /** Display label, e.g. "English (United Kingdom)". */
  label: string;
  voiceCount: number;
}

/**
 * Every language the installed engine can synthesize, English first (the
 * featured accents) and alphabetical after that.
 */
export const VOICE_LANGUAGES: VoiceLanguage[] = [
${languageEntries}
];

/**
 * English-first shortlist shown at the top of a language's voice list.
 * All ids are guaranteed to exist in VOICE_CATALOG (the generator fails
 * otherwise).
 */
export const FEATURED_VOICE_IDS: string[] = [
${FEATURED_VOICE_IDS.map((id) => `  ${JSON.stringify(id)},`).join("\n")}
];

export const VOICE_COUNT = VOICE_CATALOG.length;
export const LANGUAGE_COUNT = VOICE_LANGUAGES.length;

/** Initial picker value — the flagship US male voice at standard quality. */
export const DEFAULT_VOICE_ID = FEATURED_VOICE_IDS[0];

export function voicesForLanguage(code: string): VoiceOption[] {
  return VOICE_CATALOG.filter((voice) => voice.lang === code);
}

export function findVoice(id: string): VoiceOption | undefined {
  return VOICE_CATALOG.find((voice) => voice.id === id);
}

export function isFeaturedVoice(id: string): boolean {
  return FEATURED_VOICE_IDS.includes(id);
}
`;

fs.writeFileSync(outPath, out);
console.log(
  `[voices] Wrote ${path.relative(root, outPath)} — ${voices.length} voices, ` +
    `${sortedLanguages.length} languages (piper-tts-web@${version})`,
);
