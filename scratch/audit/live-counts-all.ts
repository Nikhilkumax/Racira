import { onlyLive, isComponentGatedDomain } from "../../src/lib/tools/liveToolFilters";
import { gameLiveSlugs } from "../../src/lib/tools/gameLiveSlugs";

const domains: Record<string, string> = {
  "3d": "../../src/domains/3d/registry.ts",
  animator: "../../src/domains/animator/registry.ts",
  audio: "../../src/domains/audio/registry.ts",
  cad: "../../src/domains/cad/registry.ts",
  calculator: "../../src/domains/calculator/registry.ts",
  colors: "../../src/domains/colors/registry.ts",
  design: "../../src/domains/design/registry.ts",
  developers: "../../src/domains/developers/registry.ts",
  finance: "../../src/domains/finance/registry.ts",
  games: "../../src/domains/games/registry.ts",
  image: "../../src/domains/image/registry.ts",
  pdf: "../../src/domains/pdf/registry.ts",
  photo: "../../src/domains/photo/registry.ts",
  productivity: "../../src/domains/productivity/registry.ts",
  seo: "../../src/domains/seo/registry.ts",
  typography: "../../src/domains/typography/registry.ts",
  video: "../../src/domains/video/registry.ts",
  voice: "../../src/domains/voice/registry.ts",
  writing: "../../src/domains/writing/registry.ts",
};

async function main() {
  for (const [domain, file] of Object.entries(domains)) {
    let mod: any;
    try {
      mod = await import(file);
    } catch (e: any) {
      console.log(domain.padEnd(12), "ERR", String(e.message).slice(0, 80));
      continue;
    }
    const raw: any[] = mod.categories
      ? mod.categories.flatMap((c: any) => c.tools || [])
      : mod.tools || mod.default || [];
    let live: number;
    if (domain === "games") {
      const slugs = new Set(gameLiveSlugs);
      live = raw.filter((t: any) => slugs.has(t.slug)).length;
    } else {
      live = onlyLive(raw, domain).length;
    }
    console.log(
      domain.padEnd(12),
      "registry=" + String(raw.length).padStart(4),
      "live=" + live,
      isComponentGatedDomain(domain) ? "(gated)" : ""
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
