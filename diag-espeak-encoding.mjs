// diag-espeak-encoding.mjs — isolate WHERE non-ASCII input breaks.
// All non-ASCII is \u-escaped so this file is pure ASCII and paste-safe.
import ESpeakNg from "espeak-ng";

const OUT = "generated";

// \u00E1 = a-acute, \u00F3 = o-acute, \u00BF = inverted question mark
const INPUTS = [
  { name: "ASCII control", text: "casa" },
  { name: "a-acute alone", text: "\u00E1" },
  { name: "o-acute alone", text: "\u00F3" },
  { name: "inv-question",  text: "\u00BF" },
  { name: "full Spanish",  text: "Hola, \u00BFc\u00F3mo est\u00E1s?" },
];

const VARIANTS = [
  { name: "A  -b=1  + literal quotes  (README shape, as probed)", b: ["-b=1"],     quote: true  },
  { name: "B  -b=1  + no quotes",                                 b: ["-b=1"],     quote: false },
  { name: "C  -b 1  (separate arg)   + no quotes",                b: ["-b", "1"],  quote: false },
  { name: "D  -b1   (attached)       + no quotes",                b: ["-b1"],      quote: false },
  { name: "E  (no -b flag at all)    + no quotes",                b: [],           quote: false },
];

const SUSPECT = /tilde|circunflejo|acute|agudo|invertid|interrogaci|signo|letra/i;

async function run(bFlags, quote, text) {
  const t0 = Date.now();
  try {
    const espeak = await ESpeakNg({
      arguments: [
        "--phonout", OUT,
        "-q",
        "--ipa=3",
        ...bFlags,
        "-v", "es",
        quote ? `"${text}"` : text,
      ],
    });
    const raw = espeak.FS.readFile(OUT, { encoding: "utf8" });
    return { ok: true, out: raw.trim(), ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}

console.log("=== espeak-ng non-ASCII input diagnosis (-v es) ===");
console.log("Source is pure ASCII via \\u escapes: paste corruption is ruled out.\n");

const clean = [];

for (const v of VARIANTS) {
  console.log("=".repeat(72));
  console.log(v.name);
  console.log("=".repeat(72));

  let variantClean = true;

  for (const inp of INPUTS) {
    const r = await run(v.b, v.quote, inp.text);
    if (!r.ok) {
      console.log(`  ${inp.name.padEnd(15)} [THROW] ${r.err}`);
      variantClean = false;
      continue;
    }
    const flagged = SUSPECT.test(r.out);
    const empty = r.out.length === 0;
    const tag = empty ? "EMPTY " : flagged ? "SUSPECT" : "ok     ";
    if (flagged || empty) variantClean = false;
    console.log(`  ${inp.name.padEnd(15)} [${tag}] ${JSON.stringify(r.out)}`);
  }

  if (variantClean) clean.push(v.name);
  console.log("");
}

console.log("=".repeat(72));
console.log("VARIANTS WITH NO SUSPECT/EMPTY OUTPUT:");
console.log(clean.length ? clean.map((c) => "  " + c).join("\n") : "  *** NONE ***");
console.log("=".repeat(72));
console.log("\nReading the result:");
console.log("  - If A is SUSPECT and C/D are ok -> '-b=1' was the bug (atoi(\"=1\")==0).");
console.log("  - If A is SUSPECT and B is ok    -> literal quote-wrapping was the bug.");
console.log("  - If ALL variants are SUSPECT    -> real espeak-ng WASM limitation.");
