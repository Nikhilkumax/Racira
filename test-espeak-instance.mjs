// Read-only probe: does the espeak-ng INSTANCE expose FS, and does a
// baseline en-us call actually produce phonemes?
// Confirmed by reading dist/espeak-ng.js:
//   line 4684  Module['FS'] = FS;
//   line 5043  readyPromiseResolve(Module);
//   line 5128  export default ESpeakNG;
// So FS should be on the RESOLVED INSTANCE, not the module namespace.

import ESpeakNg from "espeak-ng";

const OUT = "generated";

console.log("=== espeak-ng instance probe ===\n");

const ns = await import("espeak-ng");
console.log("module namespace keys:", Object.keys(ns));
console.log("default export type  :", typeof ns.default, "\n");

let espeak;
try {
  espeak = await ESpeakNg({
    arguments: [
      "--phonout", OUT,
      '--sep=""',
      "-q",
      "-b=1",
      "--ipa=3",
      "-v", "en-us",
      '"Hello world"',
    ],
  });
  console.log("[OK] factory resolved\n");
} catch (e) {
  console.log("[FATAL] factory threw/rejected:", e && e.message ? e.message : e);
  console.log(e && e.stack ? e.stack : "(no stack)");
  process.exit(1);
}

console.log("--- instance shape ---");
console.log("typeof instance :", typeof espeak);
console.log("has .FS         :", "FS" in espeak, "/ typeof:", typeof espeak.FS);

if (espeak.FS) {
  const fsKeys = Object.keys(espeak.FS);
  console.log("FS key count    :", fsKeys.length);
  console.log("FS has readFile :", typeof espeak.FS.readFile === "function");
  console.log("FS has writeFile:", typeof espeak.FS.writeFile === "function");
  console.log("FS has mkdir    :", typeof espeak.FS.mkdir === "function");
  console.log("FS has analyzePath:", typeof espeak.FS.analyzePath === "function");
} else {
  console.log("\n*** FS NOT FOUND — full instance surface ***");
  console.log("own keys:", Object.keys(espeak).sort().join(", "));
  const proto = Object.getPrototypeOf(espeak);
  console.log("proto keys:", proto ? Object.getOwnPropertyNames(proto).join(", ") : "(none)");
  const fsish = Object.keys(espeak).filter((k) => /fs|file|path|mount|node/i.test(k));
  console.log("filesystem-adjacent keys:", fsish.length ? fsish.join(", ") : "(none)");
}

console.log("\n--- en-us baseline: \"Hello world\" ---");
if (espeak.FS && typeof espeak.FS.readFile === "function") {
  try {
    const phonemes = espeak.FS.readFile(OUT, { encoding: "utf8" });
    console.log("raw   :", JSON.stringify(phonemes));
    console.log("trimmed:", JSON.stringify(phonemes.trim()));
    console.log("length:", phonemes.length);
    console.log(
      phonemes.trim().length > 0
        ? "[OK] non-empty output — CLI ran before promise resolved"
        : "[WARN] file exists but EMPTY — output may not be flushed at resolve time"
    );
  } catch (e) {
    console.log("[THROW] readFile failed:", e && e.message ? e.message : e);
    try {
      console.log("readdir('.'):", espeak.FS.readdir("."));
      console.log("cwd         :", espeak.FS.cwd ? espeak.FS.cwd() : "(no cwd)");
    } catch (e2) {
      console.log("readdir also failed:", e2 && e2.message ? e2.message : e2);
    }
  }
} else {
  console.log("(skipped — no FS.readFile)");
}

console.log("\n--- locate embedded espeak-ng-data ---");
if (espeak.FS && typeof espeak.FS.readdir === "function") {
  for (const p of [
    "/usr/local/share/espeak-ng-data",
    "/usr/share/espeak-ng-data",
    "/usr/local/share",
    "/usr/share",
  ]) {
    try {
      const entries = espeak.FS.readdir(p).filter((f) => f !== "." && f !== "..");
      console.log(`[FOUND] ${p} -> ${entries.length} entries: ${entries.slice(0, 12).join(", ")}${entries.length > 12 ? ", ..." : ""}`);
    } catch {
      console.log(`[none ] ${p}`);
    }
  }
  for (const base of ["/usr/local/share/espeak-ng-data", "/usr/share/espeak-ng-data"]) {
    try {
      const dicts = espeak.FS.readdir(base).filter((f) => f.endsWith("_dict"));
      if (dicts.length) {
        console.log(`\n*** DICTIONARIES in ${base} (${dicts.length}) ***`);
        console.log(dicts.sort().join(", "));
        for (const d of ["es_dict", "fr_dict", "it_dict", "pt_dict", "hi_dict", "en_dict"]) {
          const present = dicts.includes(d);
          let size = "";
          try {
            size = ` (${espeak.FS.stat(`${base}/${d}`).size} B)`;
          } catch {}
          console.log(`  ${present ? "YES" : "NO "} ${d}${present ? size : ""}`);
        }
      }
    } catch {}
  }
} else {
  console.log("(skipped — no FS.readdir)");
}

console.log("\n=== probe complete ===");
