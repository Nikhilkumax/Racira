// Helper: lookup registry metadata + lazyComponents file for given slugs (read-only)
import fs from "fs";
import path from "path";

const dir = "src/domains/calculator/registry";
const want = new Set(process.argv.slice(2));
const entries = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
  const c = fs.readFileSync(path.join(dir, f), "utf8");
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  const anchors = [];
  while ((m = slugRe.exec(c)) !== null) anchors.push({ slug: m[1], index: m.index });
  for (let i = 0; i < anchors.length; i++) {
    const seg = c.slice(anchors[i].index, i + 1 < anchors.length ? anchors[i + 1].index : c.length);
    if (!/status:\s*"(live|soon)"/.test(seg)) continue;
    entries.push({
      slug: anchors[i].slug,
      name: (seg.match(/name:\s*"((?:[^"\\]|\\.)*)"/) || [])[1],
      category: (seg.match(/category:\s*"([^"]+)"/) || [])[1],
      subcategory: (seg.match(/subcategory:\s*"([^"]+)"/) || [])[1],
    });
  }
}
const lazy = fs.readFileSync("src/app/calculator/lazyComponents.tsx", "utf8");
for (const e of entries.filter((e) => want.has(e.slug))) {
  const re = new RegExp('"' + e.slug + '":\\s*\\(\\)\\s*=>\\s*import\\("[^"]*/([^"]+)"');
  const m = lazy.match(re);
  console.log([e.slug, e.name, e.category, e.subcategory, m ? m[1] : "NO_LAZY"].join(" | "));
}
