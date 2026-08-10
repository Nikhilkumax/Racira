/* Verify textChunker behavior on real inputs. Runs under plain node. */
import { splitTextIntoChunks, chunkCharLimit, splitIntoSentences } from "./src/domains/voice/lib/textChunker.ts";

let failures = 0;

function report(label, text, lang) {
  const limit = chunkCharLimit(lang);
  const chunks = splitTextIntoChunks(text, lang);
  console.log(`\n=== ${label} ===`);
  console.log(`lang=${lang}  limit=${limit}  input=${text.length} chars`);
  console.log(`chunk count: ${chunks.length}`);
  chunks.forEach((c, i) => {
    const flag = c.length > limit ? "  <<< OVER LIMIT" : "";
    console.log(`  [${i}] ${String(c.length).padStart(4)} chars  "${c.slice(0, 66)}${c.length > 66 ? "…" : ""}"${flag}`);
  });

  const over = chunks.filter((c) => c.length > limit);
  if (over.length) { failures++; console.log(`  FAIL: ${over.length} chunk(s) exceed ${limit}`); }

  // No text may be lost: concatenated chunks must contain every non-space char
  // of the input, in order.
  const strip = (s) => s.replace(/\s+/g, "");
  if (strip(chunks.join("")) !== strip(text)) {
    failures++;
    console.log("  FAIL: content not preserved");
    const a = strip(chunks.join("")), b = strip(text);
    let k = 0; while (k < a.length && a[k] === b[k]) k++;
    console.log(`    diverges at ${k}: got ${JSON.stringify(a.slice(k, k + 40))} want ${JSON.stringify(b.slice(k, k + 40))}`);
  } else {
    console.log("  ok: all chunks within limit, content preserved");
  }
  return chunks;
}

console.log("chunkCharLimit per language:");
for (const l of ["en-us", "en-gb", "es", "fr", "it", "pt-BR", "hi", "zz-unknown"]) {
  console.log(`  ${l.padEnd(12)} ${chunkCharLimit(l)}`);
}

const en = [
  "The composition of the atmosphere varies with altitude, and at the highest",
  "reaches the distinction between atmosphere and space becomes a matter of",
  "definition rather than measurement, which is why engineers prefer to work",
  "in figures computed from the barometric formula instead of drawing",
  "arbitrary lines through the sky.",
  "Weather balloons climb through the lower layers in a flight that can last",
  "two hours, and the instruments they carry must be small enough to avoid",
  "posing a hazard when the envelope finally bursts and the payload falls",
  "back to the surface under a parachute.",
  "Only the highest flights approach the point where a human could observe",
  "the curvature of the horizon with the naked eye, and even then the",
  "experience is filtered through layers of glass and insulation.",
].join(" ");
report("ENGLISH multi-sentence", en, "en-us");

const hi = [
  "पृथ्वी का वायुमंडल कई परतों में बंटा हुआ है, और सबसे ऊपर की परत में हवा",
  "इतनी पतली हो जाती है कि वहाँ अंतरिक्ष और वायुमंडल के बीच की रेखा केवल",
  "परिभाषा की बात रह जाती है।",
  "मौसम के गुब्बारे वायुमंडल की निचली परतों से होते हुए दो घंटे तक ऊपर चढ़ते",
  "रहते हैं, और उनके साथ जाने वाले उपकरण इतने हल्के होते हैं कि जब गुब्बारा",
  "अंततः फट जाता है और पेलोड पैराशूट के सहारे वापस धरती पर आता है तो किसी",
  "को चोट लगने का खतरा नहीं होता।",
  "केवल सबसे ऊँची उड़ानें ही उस बिंदु तक पहुँचती हैं जहाँ कोई व्यक्ति नंगी",
  "आँखों से क्षितिज की गोलाई देख सके, और तब भी यह अनुभव काँच और इन्सुलेशन",
  "की परतों से होकर गुजरता है।",
  "वैज्ञानिक इन उड़ानों से मिले आँकड़ों का उपयोग मौसम के पूर्वानुमान और",
  "जलवायु के दीर्घकालिक अध्ययन दोनों के लिए करते हैं।",
].join(" ");
report("HINDI multi-sentence (danda)", hi, "hi");

const noTerm = [
  "The committee met at nine, the minutes were approved, the budget was",
  "reviewed, and the meeting was adjourned before noon, which gave everyone",
  "time to catch an early train back to the city, where the afternoon",
  "session was expected to resume at two, though nobody had confirmed the",
  "agenda, and the chairman was reportedly still undecided about whether to",
  "raise the staffing question at all",
].join(" ");
report("ENGLISH single sentence, no terminator (clause fallback)", noTerm, "en-us");

report("HINDI repeated clause (packing)", "नमस्ते दोस्तों, ".repeat(40).trim(), "hi");

const url = "Reference: https://" + "a".repeat(400) + ".example.com/path end.";
report("UNBROKEN TOKEN (hard slice)", url, "hi");

console.log("\n=== SENTENCE SPLIT DETAIL ===");
for (const s of [
  "एक वाक्य। दूसरा वाक्य।। तीसरा वाक्य।",
  "Dr. J. K. Rowling walked 3.14 miles to St. Mary's Rd. She arrived at 10.30 a.m. and left.",
  "Really?! Yes... he said. Then he left.",
  "Heading with no period\nSecond line also bare\nThird line.",
  '"Is this it?" she asked. He nodded.',
]) {
  console.log(`\ninput:  ${JSON.stringify(s)}`);
  console.log(`output: ${JSON.stringify(splitIntoSentences(s))}`);
}

console.log("\n=== SHORT INPUT PASSTHROUGH ===");
for (const [t, l] of [["Hello there.", "en-us"], ["नमस्ते।", "hi"], ["   ", "en-us"], ["", "hi"]]) {
  const r = splitTextIntoChunks(t, l);
  console.log(`${JSON.stringify(t).padEnd(18)} ${l.padEnd(6)} -> ${JSON.stringify(r)} ${r.length <= 1 ? "(single/empty ok)" : "FAIL"}`);
  if (r.length > 1) failures++;
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
