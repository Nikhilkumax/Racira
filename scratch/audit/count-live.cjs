const fs = require("fs");

const files = [
  ["animator", "src/domains/animator/registry.ts", /ACTIVE_SLUGS\s*=\s*new Set(?:<[^>]*>)?\(\[([\s\S]*?)\]\)/],
  ["3d", "src/domains/3d/registry.ts", /ACTIVE_SLUGS\s*=\s*new Set(?:<[^>]*>)?\(\[([\s\S]*?)\]\)/],
  ["video", "src/domains/video/registry.ts", /LIVE_SLUGS\s*=\s*new Set(?:<[^>]*>)?\(\[([\s\S]*?)\]\)/],
];

for (const [name, f, re] of files) {
  const s = fs.readFileSync(f, "utf8");
  const m = s.match(re);
  const n = m ? (m[1].match(/["'][^"']+["']/g) || []).length : "NO MATCH";
  console.log(name.padEnd(10), "->", n);
}
