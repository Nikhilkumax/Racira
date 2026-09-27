/**
 * Flip audio registry entries from "soon" to "live".
 *
 * Usage: node scripts/audio-flip-live.cjs slug1 slug2 [...]
 *
 * STRUCTURAL ORDER GATE (added after flip-before-verify slipped three times):
 * a slug may only flip when ALL of the following hold, checked for every
 * slug before anything is written:
 *   1. it is listed in implemented.ts   (EASY_TOOL_SLUG_LIST / FORMATS)
 *   2. it is listed in ToolRenderer.tsx (the lazy component map)
 *   3. a verification marker exists: .freebuff/verify/<slug>.ok, and its
 *      content mentions the slug. The marker is created after the batch's
 *      NODE tests pass (pre-flip evidence — the tool route only renders
 *      live, so real-browser verification necessarily happens after the
 *      flip and is then APPENDED to the marker as a "browser:" line; a
 *      marker without that line is an audit flag, not a gate).
 * If any check fails for any slug, nothing is written and the script says
 * which gate blocked which slug. The mandatory flip-grep remains: the
 * printed LIVE/SOON line plus a real grep afterwards.
 *
 * Matches the registry's canonical one-line entry shape. Refuses to run on a
 * partial match set: if any slug does not match exactly once, nothing is
 * written (avoids half-flipped batches).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const registryPath = path.join(root, "src", "domains", "audio", "registry.ts");
const implementedPath = path.join(root, "src", "domains", "audio", "components", "tools", "implemented.ts");
const rendererPath = path.join(root, "src", "domains", "audio", "components", "tools", "ToolRenderer.tsx");
const verifyDir = path.join(root, ".freebuff", "verify");

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("usage: node scripts/audio-flip-live.cjs slug1 [slug2 ...]");
  process.exit(1);
}

const implemented = fs.readFileSync(implementedPath, "utf8");
const renderer = fs.readFileSync(rendererPath, "utf8");

const blocked = [];
for (const slug of slugs) {
  const gates = [];
  if (!implemented.includes(`"${slug}"`)) gates.push("not listed in implemented.ts (wire it first)");
  if (!renderer.includes(`"${slug}"`)) gates.push("not listed in ToolRenderer.tsx (wire it first)");
  const marker = path.join(verifyDir, slug + ".ok");
  if (!fs.existsSync(marker)) {
    gates.push(`no verification marker ${path.relative(root, marker)} — run Node tests + real-browser verification, then create it (content must mention the slug)`);
  } else if (!fs.readFileSync(marker, "utf8").includes(slug)) {
    gates.push(`verification marker exists but does not mention "${slug}"`);
  }
  if (gates.length > 0) blocked.push(slug + ": " + gates.join("; "));
}
if (blocked.length > 0) {
  console.error("REFUSING TO FLIP — order gate failed:");
  blocked.forEach((b) => console.error("  " + b));
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
