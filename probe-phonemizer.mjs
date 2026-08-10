import { phonemize, list_voices } from "phonemizer";
console.log("IMPORT DONE");

// Kokoro code -> candidate espeak language arguments, most-specific first.
// The audit found VFS paths (roa/pt-BR, sit/cmn, ...) but only "en-us" and
// "es-419" appear as bare literals, so the accepted argument form is unproven.
const CANDIDATES = {
  a: { text: "Hello world.",        langs: ["en-us", "en-US", "gmw/en-US", "en"] },
  b: { text: "Hello world.",        langs: ["en-gb", "en-GB", "gmw/en", "en"] },
  j: { text: "こんにちは世界",         langs: ["ja", "ja-JP", "jpx/ja"] },
  z: { text: "你好世界",             langs: ["cmn", "zh", "zh-CN", "sit/cmn"] },
  e: { text: "Hola mundo.",         langs: ["es", "es-ES", "es-419", "roa/es"] },
  f: { text: "Bonjour le monde.",   langs: ["fr", "fr-fr", "fr-FR", "roa/fr"] },
  h: { text: "नमस्ते दुनिया",          langs: ["hi", "hi-IN", "inc/hi"] },
  i: { text: "Ciao mondo.",         langs: ["it", "it-IT", "roa/it"] },
  p: { text: "Olá mundo.",          langs: ["pt-br", "pt-BR", "pt", "roa/pt-BR"] },
};

// Baseline: what English produces for the SAME non-English text. Any candidate
// whose output equals this is silently falling back to English, not resolving.
async function englishBaseline(text) {
  try {
    return (await phonemize(text, "en-us")).join(" ");
  } catch {
    return null;
  }
}

console.log("=== phonemizer language argument probe ===\n");

const resolved = {};

for (const [code, { text, langs }] of Object.entries(CANDIDATES)) {
  const baseline = await englishBaseline(text);
  console.log(`--- Kokoro code "${code}"  text: ${JSON.stringify(text)}`);
  console.log(`    en-us baseline: ${JSON.stringify(baseline)}`);

  for (const lang of langs) {
    try {
      const out = (await phonemize(text, lang)).join(" ");
      const isFallback = out === baseline && !lang.startsWith("en");
      const flag = isFallback ? "SILENT-FALLBACK-TO-EN" : "OK";
      console.log(`    [${flag}] ${lang.padEnd(12)} -> ${JSON.stringify(out)}`);
      if (!isFallback && !resolved[code]) resolved[code] = { lang, out };
    } catch (e) {
      console.log(`    [THROW]  ${lang.padEnd(12)} -> ${e.message}`);
    }
  }
  console.log("");
}

console.log("=== FIRST NON-FALLBACK ARGUMENT PER CODE ===");
for (const code of Object.keys(CANDIDATES)) {
  const r = resolved[code];
  console.log(`  ${code}: ${r ? r.lang : "*** NONE RESOLVED ***"}`);
}

console.log("\n=== list_voices() for the 9 targets ===");
for (const q of ["en-us", "en-gb", "ja", "cmn", "es", "fr", "hi", "it", "pt-br"]) {
  try {
    console.log(`  ${q.padEnd(7)} ->`, JSON.stringify(await list_voices(q)));
  } catch (e) {
    console.log(`  ${q.padEnd(7)} -> THROW: ${e.message}`);
  }
}
