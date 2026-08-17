const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

const DOMAINS = ["3d","animator","audio","cad","calculator","colors","design","developers","finance","games","image","pdf","photo","productivity","seo","typography","video","voice","writing"];

function collect(dir) {
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e)) files.push(p);
    }
  })(dir);
  let live = 0, soon = 0, slugLines = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const m1 = src.match(/status:\s*"live"/g) || [];
    const m2 = src.match(/status:\s*"soon"/g) || [];
    live += m1.length;
    soon += m2.length;
    const m3 = src.match(/^\s*slug:\s*"/gm) || [];
    slugLines += m3.length;
  }
  return { live, soon, slugLines, files: files.length };
}

for (const d of DOMAINS) {
  const dir = path.join(ROOT, "src", "domains", d);
  if (!fs.existsSync(dir)) { console.log(d, "MISSING"); continue; }
  const s = collect(dir);
  console.log(`${d.padEnd(13)} slugs=${String(s.slugLines).padStart(5)} live=${String(s.live).padStart(5)} soon=${String(s.soon).padStart(6)} files=${s.files}`);
}
