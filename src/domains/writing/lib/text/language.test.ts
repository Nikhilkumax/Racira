/**
 * Unit tests for the in-house language detector.
 *
 * One ordinary sentence per supported language is the positive sample; each is
 * a real sentence in that language (not a word list), so the engine has to
 * separate languages the way it will in use. Near-misses pin the refusals:
 * short text must say "not enough text" rather than guess, non-Latin script
 * must be reported as unsupported, and loanwords must not flip a result.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LATIN_SCRIPT_SHARE,
  MIN_LANGUAGE_LETTERS,
  MIN_LANGUAGE_WORDS,
  detectLanguage,
  detectScript,
  formatDetectionReport,
} from "./language.ts";
import { LANGUAGE_PROFILES } from "./language-profiles.ts";

/** One clear sentence per supported language. */
const SAMPLES: { text: string; code: string }[] = [
  { text: "The quick brown fox jumps over the lazy dog and the sleepy cat.", code: "en" },
  { text: "El zorro marrón rápido salta sobre el perro perezoso y el gato.", code: "es" },
  { text: "Le renard brun rapide saute par-dessus le chien paresseux et le chat.", code: "fr" },
  { text: "Der schnelle braune Fuchs springt über den faulen Hund und die Katze.", code: "de" },
  { text: "La rapida volpe marrone salta sopra il cane pigro e il gatto.", code: "it" },
  { text: "A rápida raposa marrom salta sobre o cão preguiçoso e o gato.", code: "pt" },
  { text: "Het is een snelle bruine vos die over de luie hond en de kat springt.", code: "nl" },
  { text: "Den snabba bruna räven hoppar över den lata hunden och katten.", code: "sv" },
  { text: "Szybki brązowy lis przeskakuje nad leniwym psem i kotem w ogrodzie.", code: "pl" },
  { text: "Liška se rychle pohybuje přes líného psa a kočku.", code: "cs" },
  { text: "Bu hızlı kahverengi tilki bir tembel köpeğin üzerinden atlar ve o kedi uyur.", code: "tr" },
  { text: "Nopea ruskea kettu hyppää laiskan koiran yli ja kissa nukkuu.", code: "fi" },
];

test("detectLanguage: every supported language wins on its own sentence", () => {
  for (const { text, code } of SAMPLES) {
    const detection = detectLanguage(text, LANGUAGE_PROFILES);
    assert.equal(detection.status, "ok", `${code}: ${detection.notes.join(" ")}`);
    assert.equal(detection.best?.code, code, `expected ${code}, got ${detection.best?.name}`);
    assert.notEqual(detection.confidence, "low", `${code} should not be a low-confidence result`);
    assert.equal(detection.scores[0].code, code, "the score table is sorted with the winner first");
  }
});

test("detectLanguage: short input is refused, never guessed", () => {
  for (const text of ["Hola", "The cat", "de la", "a b c d"]) {
    const detection = detectLanguage(text, LANGUAGE_PROFILES);
    assert.equal(detection.status, "insufficient", `"${text}" must not produce a language`);
    assert.equal(detection.best, null);
    assert.ok(detection.scores.length === 0 || detection.scores.every((score) => score.score >= 0));
  }
  assert.ok(MIN_LANGUAGE_WORDS >= 3);
  assert.ok(MIN_LANGUAGE_LETTERS >= 20);
});

test("detectLanguage: numbers and punctuation carry no language", () => {
  const detection = detectLanguage("12345 67,89 - 10:30 (2026)", LANGUAGE_PROFILES);
  assert.equal(detection.status, "insufficient");
  assert.ok(detection.notes[0].includes("No letters"));
});

test("detectLanguage: non-Latin scripts are reported as unsupported", () => {
  const cyrillic = detectLanguage("Привет, как дела сегодня? Всё хорошо.", LANGUAGE_PROFILES);
  assert.equal(cyrillic.status, "unsupported-script");
  assert.equal(cyrillic.script, "Cyrillic");
  assert.equal(cyrillic.best, null);

  const han = detectLanguage("こんにちは世界、今日はいい天気ですね。", LANGUAGE_PROFILES);
  assert.equal(han.status, "unsupported-script");
  assert.notEqual(han.script, "Latin");
});

test("detectLanguage: loanwords in an English sentence do not flip the result", () => {
  const loanwords = detectLanguage(
    "The menu includes tacos, salsa and guacamole for the whole table at the café.",
    LANGUAGE_PROFILES,
  );
  assert.equal(loanwords.status, "ok");
  assert.equal(loanwords.best?.code, "en");

  const frenchLoan = detectLanguage(
    "The chef said the sauce was très good and the whole table was ready.",
    LANGUAGE_PROFILES,
  );
  assert.equal(frenchLoan.best?.code, "en");
});

test("detectLanguage: a close race is labelled, not hidden", () => {
  const detection = detectLanguage(
    "La table est en bois et la porte est fermée.",
    LANGUAGE_PROFILES,
  );
  assert.equal(detection.status, "ok");
  assert.equal(detection.best?.code, "fr");
  assert.ok(["high", "medium", "low"].includes(detection.confidence));
  // The runner-up is always named in the notes when one exists.
  assert.ok(detection.notes.some((note) => note.includes("Closest alternative")));
});

test("detectLanguage: an empty profile list cannot fabricate a result", () => {
  const detection = detectLanguage(
    "The quick brown fox jumps over the lazy dog and the sleepy cat.",
    [],
  );
  assert.equal(detection.status, "insufficient");
  assert.equal(detection.best, null);
  assert.ok(detection.notes.some((note) => note.includes("No function words")));
});

test("detectScript: counts Latin and reports the dominant script", () => {
  const latin = detectScript("Hello, world!");
  assert.equal(latin.script, "Latin");
  assert.equal(latin.latinLetters, 10);
  assert.equal(latin.letters, 10);

  // Six Cyrillic letters beat five Latin ones, so the dominant script is Cyrillic
  // even though the sample starts with English.
  const mixed = detectScript("Hello Привет");
  assert.equal(mixed.script, "Cyrillic");
  assert.equal(mixed.latinLetters, 5);
  assert.equal(mixed.letters, 11);

  // The 80% share is the boundary the detector uses.
  assert.ok(LATIN_SCRIPT_SHARE > 0.5 && LATIN_SCRIPT_SHARE < 1);

  assert.equal(detectScript("123 !?").script, "None");
  assert.equal(detectScript("123 !?").letters, 0);
});

test("LANGUAGE_PROFILES: twelve unique, well-formed Latin-script profiles", () => {
  assert.equal(LANGUAGE_PROFILES.length, 12);
  const codes = LANGUAGE_PROFILES.map((profile) => profile.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.ok(codes.includes("en"));
  for (const profile of LANGUAGE_PROFILES) {
    assert.ok(profile.name.length > 2);
    assert.ok(profile.stopwords.length >= 30, `${profile.code} has enough function words`);
    assert.ok(profile.endings.length >= 4, `${profile.code} has endings`);
  }
});

test("formatDetectionReport: states the result, the scores and the limits", () => {
  const detection = detectLanguage(SAMPLES[0].text, LANGUAGE_PROFILES);
  const report = formatDetectionReport(detection);
  assert.ok(report.includes("Detected: English"));
  assert.ok(report.includes("Confidence:"));
  assert.ok(report.includes("Scores"));

  const refused = formatDetectionReport(detectLanguage("Hi", LANGUAGE_PROFILES));
  assert.ok(refused.includes("not enough text"));
});
