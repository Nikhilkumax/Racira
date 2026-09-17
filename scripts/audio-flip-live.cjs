/**
 * Flip audio registry entries from "soon" to "live".
 *
 * Usage: node scripts/audio-flip-live.cjs slug1 slug2 [...]
 *
 * Matches the registry's canonical one-line entry shape. Refuses to run on a
 * partial match set: if any slug does not match exactly once, nothing is
 * written (avoids half-flipped batches). Prints the post-flip live/soon count
 * — the mandatory flip-grep is this line plus a real grep afterwards.
 */
const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "..", "src", "domains", "audio", "registry.ts");
const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("usage: node scripts/audio-flip-live.cjs slug1 [slug2 ...]");
  process.exit(1);
}

let reg = fs.readFileSync(registryPath, "utf8");
let flipped = 0;
const misses = [];
for (const slug of slugs) {
  // Anchor on slug -> status within the same single-line entry. Do NOT try to
  // match inferIcon's argument list with [^)]* — names like "Loudness Meter
  // (LUFS)" contain a ')' and broke the match entirely.
  const re = new RegExp('(slug: "' + slug + '".*status: ")soon(" \\})');
  const matches = reg.match(new RegExp(re.source, "g"));
  if (matches && matches.length === 1) {
    reg = reg.replace(re, "$1live$2");
    flipped++;
  } else {
    misses.push(`${slug} (${matches ? matches.length : 0} matches)`);
  }
}

if (misses.length > 0) {
  console.error("REFUSING TO WRITE — match count not exactly 1 for:");
  misses.forEach((m) => console.error("  " + m));
  process.exit(1);
}

fs.writeFileSync(registryPath, reg);
console.log(`flipped: ${flipped}/${slugs.length}`);
const live = (reg.match(/status: "live"/g) || []).length;
const soon = (reg.match(/status: "soon"/g) || []).length;
console.log(`LIVE=${live} SOON=${soon} TOTAL=${live + soon}`);
