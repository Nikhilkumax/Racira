// Compute the live (discoverable) tool count per domain, matching the filters
// used by sitemap + grids (onlyLive / gameLiveSlugs).
const path = require("path");
const { execSync } = require("child_process");

// We can't require .ts directly in plain node; use tsx via npx? Simpler: replicate
// the filter logic against the registries by extracting counts with grep on the
// status fields is unreliable. Instead run a small tsx one-off.
const script = `
import { onlyLive, isComponentGatedDomain } from "./src/lib/tools/liveToolFilters";
import { gameLiveSlugs } from "./src/lib/tools/gameLiveSlugs";

const domains: Record<string, string> = {
  "3d": "./src/domains/3d/registry.ts",
  "animator": "./src/domains/animator/registry.ts",
  "audio": "./src/domains/audio/registry.ts",
  "cad": "./src/domains/cad/registry.ts",
  "calculator": "./src/domains/calculator/registry.ts",
  "colors": "./src/domains/colors/registry.ts",
  "design": "./src/domains/design/registry.ts",
  "developers": "./src/domains/developers/registry.ts",
  "finance": "./src/domains/finance/registry.ts",
  "games": "./src/domains/games/registry.ts",
  "image": "./src/domains/image/registry.ts",
  "pdf": "./src/domains/pdf/registry.ts",
  "photo": "./src/domains/photo/registry.ts",
  "productivity": "./src/domains/productivity/registry.ts",
  "seo": "./src/domains/seo/registry.ts",
  "typography": "./src/domains/typography/registry.ts",
  "video": "./src/domains/video/registry.ts",
  "voice": "./src/domains/voice/registry.ts",
  "writing": "./src/domains/writing/registry.ts",
};

for (const [domain, file] of Object.entries(domains)) {
  let mod: any;
  try {
    mod = await import(file);
  } catch (e: any) {
    console.log(domain.padEnd(12), "ERR", String(e.message).slice(0, 80));
    continue;
  }
  // registries export `categories` (array of { tools }) or `tools` or default
  const raw = mod.categories
    ? mod.categories.flatMap((c: any) => c.tools || [])
    : mod.tools || mod.default || [];
  let live: number;
  if (domain === "games") {
    const slugs = new Set(gameLiveSlugs);
    live = raw.filter((t: any) => slugs.has(t.slug)).length;
  } else {
    live = onlyLive(raw, domain).length;
  }
  const total = raw.length;
  console.log(
    domain.padEnd(12),
    "registry=" + String(total).padStart(4),
    "live=" + live,
    isComponentGatedDomain(domain) ? "(gated)" : ""
  );
}
`;
require("child_process").execSync("npx --yes tsx -e " + JSON.stringify(script), {
  stdio: "inherit",
  cwd: path.resolve(__dirname, "../.."),
});
