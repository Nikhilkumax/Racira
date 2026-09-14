// Static verification for the 39 wired slugs: registry live, lazy route, target
// file, stub exclusion, isLiveTool simulation, duplicate lazy keys.
const fs = require("fs");
const path = require("path");

const stubSrc = fs.readFileSync("src/lib/tools/calculatorStubSlugs.ts", "utf8");
const stub = new Set([...stubSrc.matchAll(/^\s*"([a-z0-9-]+)",?$/gm)].map((m) => m[1]));

const slugs = fs
  .readFileSync("status_rebuild.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => l.split(" — ")[0]);

const lazySrc = fs.readFileSync("src/app/calculator/lazyComponents.tsx", "utf8");
const keys = [...lazySrc.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]);
const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
console.log("lazyComponents total keys:", keys.length, "duplicates:", dup.length ? JSON.stringify(dup) : "none");

function findEntry(slug) {
  for (const rf of fs.readdirSync("src/domains/calculator/registry").filter((f) => f.endsWith(".ts"))) {
    const c = fs.readFileSync("src/domains/calculator/registry/" + rf, "utf8");
    const parts = c.split(/\{\s*slug:/);
    for (let i = 1; i < parts.length; i++) {
      const b = "{slug:" + parts[i];
      if ((b.match(/slug:\s*"([^"]+)"/) || [])[1] === slug) return { file: rf, block: b };
    }
  }
  return null;
}

let live = 0;
let bad = 0;
for (const s of slugs) {
  const e = findEntry(s);
  const st = e ? (e.block.match(/status:\s*"(\w+)"/) || [])[1] : "missing";
  const entryRe = new RegExp('"' + s + '":\\s*\\(\\)\\s*=>\\s*import\\("([^"]+)"\\)');
  const imp = (lazySrc.match(entryRe) || [])[1];
  const fileOk = imp && fs.existsSync(path.join("src/domains/calculator/components", imp.split("/").pop() + ".tsx"));
  const isLive = st === "live" && !stub.has(s) && !!imp && !!fileOk;
  if (!isLive) {
    bad++;
    console.log("NOT LIVE:", s, "status=" + st, "stub=" + stub.has(s), "lazy=" + !!imp, "file=" + fileOk, "in=" + (e ? e.file : "?"));
  } else live++;
}
console.log("isLiveTool+route simulation:", live + "/" + slugs.length, "fully live");
process.exit(bad ? 1 : 0);
