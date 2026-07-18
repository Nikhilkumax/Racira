import { calculatorRegistry } from "@/domains/calculator/registry";
import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { ALL_TOOLS as THREED_TOOLS, CATEGORIES as THREED_CATEGORIES } from "@/domains/3d/registry";
import { allTools as ANIMATOR_TOOLS, categories as ANIMATOR_CATEGORIES } from "@/domains/animator/registry";
import { allTools as AUDIO_TOOLS, categories as AUDIO_CATEGORIES } from "@/domains/audio/registry";
import { allTools as BUSINESS_TOOLS, categories as BUSINESS_CATEGORIES } from "@/domains/business/registry";
import { allTools as CAD_TOOLS, categories as CAD_CATEGORIES } from "@/domains/cad/registry";
import { TOOLS as COLORS_TOOLS } from "@/domains/colors/registry";
import { CATEGORY_META as COLORS_CATEGORIES } from "@/domains/colors/registry/types";
// Batch-rollout domains
import { TOOLS as CRYPTO_TOOLS, CATEGORIES as CRYPTO_CATS, slugify as cryptoSlugify } from "@/domains/crypto/registry";
import { categories as DESIGN_CATS, allTools as DESIGN_TOOLS } from "@/domains/design/registry";
import { categories as EDUCATION_CATS } from "@/domains/education/registry";
import { categories as FITNESS_CATS, allTools as FITNESS_TOOLS } from "@/domains/fitness/registry";
import { CATEGORIES as FLOWCHART_CATS, ALL_TOOLS as FLOWCHART_TOOLS } from "@/domains/flowchart/registry";
import { categories as IMAGE_CATS } from "@/domains/image/registry";
import { CATEGORIES as INSIGHT_CATS, ALL_TOOLS as INSIGHT_TOOLS, slugify as insightSlugify } from "@/domains/insight/registry";
import { sections as MAPS_SECTIONS } from "@/domains/maps/registry";
import { categories as MUSIC_CATS, allTools as MUSIC_TOOLS } from "@/domains/music/registry";
import { CATEGORIES as PHOTO_CATS, ALL_TOOLS as PHOTO_TOOLS } from "@/domains/photo/registry";
import { tools as SECURITY_TOOLS, categories as SECURITY_CATS } from "@/domains/security/registry";
import { CATEGORIES as SEO_CATS, TOOL_BY_SLUG as SEO_TOOL_MAP } from "@/domains/seo/registry";
import { categories as TRAVEL_CATS, allTools as TRAVEL_TOOLS } from "@/domains/travel/registry";
import { categories as WRITING_CATS, allTools as WRITING_TOOLS } from "@/domains/writing/registry";
import { categories as ENGINEERING_CATS, tools as ENGINEERING_TOOLS } from "@/domains/engineering/registry";
import { tools as PDF_TOOLS } from "@/domains/pdf/registry/tools";
import { TOOLS as VIDEO_TOOLS, CATEGORY_ORDER as VIDEO_CAT_ORDER } from "@/data/video/tools";
import { tools as DEV_TOOLS, categories as DEV_CATS, categorySlug as devCategorySlug } from "@/data/developers/tools";
import { categories as PRESENTATION_CATS, allTools as PRESENTATION_TOOLS } from "@/data/presentation/tools";
import { CATEGORIES as PRODUCTIVITY_CATS } from "@/data/productivity/tools";
import { categories as TYPOGRAPHY_CATS, allTools as TYPOGRAPHY_TOOLS } from "@/data/typography/tools";
import { CATEGORIES as GAMES_CATS, slugify as gameSlugify } from "@/data/games/games";
import { toSlug } from "@/lib/utils/slug";
const MAX_URLS_PER_SITEMAP = 45000; // headroom under Google's 50k cap

// Use a fixed date unless Step 0 found real per-item date metadata.
const FALLBACK_LASTMOD = "2026-06-17";

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
}

export interface SitemapSource {
  key: string; // single word, no hyphens — used as /sitemap-{key}-{categorySlug}-{page}.xml
  getCategorySlugs: () => string[];
  getEntriesForCategory: (categorySlug: string) => SitemapUrlEntry[];
}

const baseUrl = "https://racira.com";

export const sitemapSources: SitemapSource[] = [
  {
    key: "calculators",
    getCategorySlugs: () => CATEGORY_SUMMARY.map(c => toSlug(c.category)),
    getEntriesForCategory: (categorySlug) =>
      calculatorRegistry
        .filter(calc => calc && toSlug(calc.category || "general") === categorySlug)
        .map(calc => ({
          loc: `${baseUrl}/calculator/${calc.slug || toSlug(calc.name)}`,
          lastmod: calc.updatedAt || FALLBACK_LASTMOD, // swap in real field if Step 0 found one
        })),
  },
  {
    key: "3d",
    getCategorySlugs: () => THREED_CATEGORIES.map(c => toSlug(c.title)),
    getEntriesForCategory: (categorySlug) =>
      THREED_TOOLS
        .filter(t => toSlug(t.category) === categorySlug)
        .map(t => ({
          loc: `${baseUrl}/3d/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  {
    key: "animator",
    getCategorySlugs: () => ANIMATOR_CATEGORIES.map(c => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      ANIMATOR_TOOLS
        .filter(t => toSlug(t.category) === categorySlug)
        .map(t => ({
          loc: `${baseUrl}/animator/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  {
    key: "audio",
    getCategorySlugs: () => AUDIO_CATEGORIES.map(c => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      AUDIO_TOOLS
        .filter(t => toSlug(t.category!) === categorySlug)
        .map(t => ({
          loc: `${baseUrl}/audio/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  {
    key: "business",
    getCategorySlugs: () => BUSINESS_CATEGORIES.map(c => toSlug(c.label)),
    getEntriesForCategory: (categorySlug) =>
      BUSINESS_TOOLS
        .filter(t => {
          const parentCat = BUSINESS_CATEGORIES.find(c => c.tools.some(x => x.slug === t.slug));
          return parentCat && toSlug(parentCat.label) === categorySlug;
        })
        .map(t => ({
          loc: `${baseUrl}/business/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  {
    key: "cad",
    getCategorySlugs: () => CAD_CATEGORIES.map(c => toSlug(c.title)),
    getEntriesForCategory: (categorySlug) =>
      CAD_TOOLS
        .filter(t => toSlug((t as any).category) === categorySlug)
        .map(t => ({
          loc: `${baseUrl}/cad/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  {
    key: "colors",
    getCategorySlugs: () => Object.values(COLORS_CATEGORIES).map((c: any) => toSlug(c.label)),
    getEntriesForCategory: (categorySlug) =>
      COLORS_TOOLS
        .filter(t => {
          const meta = (COLORS_CATEGORIES as any)[t.category];
          return meta && toSlug(meta.label) === categorySlug;
        })
        .map(t => ({
          loc: `${baseUrl}/colors/${t.slug}`,
          lastmod: FALLBACK_LASTMOD,
        })),
  },
  // ── Batch rollout: Domains 9–31 ──────────────────────────────────────────
  {
    key: "crypto",
    getCategorySlugs: () => CRYPTO_CATS.map(c => cryptoSlugify(c)),
    getEntriesForCategory: (categorySlug) =>
      CRYPTO_TOOLS
        .filter(t => cryptoSlugify(t.category) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/crypto/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "design",
    getCategorySlugs: () => DESIGN_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      DESIGN_TOOLS
        .filter((t: any) => toSlug(t.category) === categorySlug)
        .map((t: any) => ({ loc: `${baseUrl}/design/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "education",
    getCategorySlugs: () => EDUCATION_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) => {
      const cat = EDUCATION_CATS.find((c: any) => toSlug(c.name) === categorySlug);
      return (cat?.tools ?? []).map((t: any) => ({ loc: `${baseUrl}/education/${t.slug}`, lastmod: FALLBACK_LASTMOD }));
    },
  },
  {
    key: "fitness",
    getCategorySlugs: () => FITNESS_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      FITNESS_TOOLS
        .filter((t: any) => {
          const cat = FITNESS_CATS.find((c: any) => c.tools.some((x: any) => x.slug === t.slug));
          return cat && toSlug(cat.name) === categorySlug;
        })
        .map((t: any) => ({ loc: `${baseUrl}/fitness/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "flowchart",
    getCategorySlugs: () => FLOWCHART_CATS.map((c: any) => toSlug(c.title)),
    getEntriesForCategory: (categorySlug) =>
      FLOWCHART_TOOLS
        .filter((t: any) => {
          const cat = FLOWCHART_CATS.find((c: any) => c.tools.some((x: any) => x.slug === t.slug));
          return cat && toSlug(cat.title) === categorySlug;
        })
        .map((t: any) => ({ loc: `${baseUrl}/flowchart/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "image",
    getCategorySlugs: () => IMAGE_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) => {
      const cat = IMAGE_CATS.find((c: any) => toSlug(c.name) === categorySlug);
      return (cat?.tools ?? []).map((t: any) => ({ loc: `${baseUrl}/image/${t.slug}`, lastmod: FALLBACK_LASTMOD }));
    },
  },
  {
    key: "insight",
    getCategorySlugs: () => INSIGHT_CATS.map((c: any) => insightSlugify(c.name)),
    getEntriesForCategory: (categorySlug) =>
      INSIGHT_TOOLS
        .filter(item => insightSlugify(item.category) === categorySlug)
        .map(item => ({ loc: `${baseUrl}/insight/${item.tool.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "maps",
    getCategorySlugs: () => MAPS_SECTIONS.map(s => toSlug(s.title)),
    getEntriesForCategory: (categorySlug) => {
      const sec = MAPS_SECTIONS.find(s => toSlug(s.title) === categorySlug);
      return (sec?.tools ?? []).map((t: any) => ({ loc: `${baseUrl}/maps/${t.slug}`, lastmod: FALLBACK_LASTMOD }));
    },
  },
  {
    key: "music",
    getCategorySlugs: () => MUSIC_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      MUSIC_TOOLS
        .filter((t: any) => {
          const cat = MUSIC_CATS.find((c: any) => c.tools.some((x: any) => x.slug === t.slug));
          return cat && toSlug(cat.name) === categorySlug;
        })
        .map((t: any) => ({ loc: `${baseUrl}/music/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "photo",
    getCategorySlugs: () => PHOTO_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      PHOTO_TOOLS
        .filter(t => toSlug((t as any).category) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/photo/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "security",
    getCategorySlugs: () => SECURITY_CATS.map((c: any) => toSlug(c)),
    getEntriesForCategory: (categorySlug) =>
      SECURITY_TOOLS
        .filter(t => toSlug((t as any).category) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/security/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "seo",
    getCategorySlugs: () => ARRAY_FROM_CATS(SEO_CATS).map((c: any) => c.slug),
    getEntriesForCategory: (categorySlug) =>
      Array.from(SEO_TOOL_MAP.values())
        .filter((t: any) => toSlug(t.category) === categorySlug)
        .map((t: any) => ({ loc: `${baseUrl}/seo/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "travel",
    getCategorySlugs: () => TRAVEL_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      TRAVEL_TOOLS
        .filter((t: any) => {
          const cat = TRAVEL_CATS.find((c: any) => c.tools.some((x: any) => x.slug === t.slug));
          return cat && toSlug(cat.name) === categorySlug;
        })
        .map((t: any) => ({ loc: `${baseUrl}/travel/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "writing",
    getCategorySlugs: () => WRITING_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      WRITING_TOOLS
        .filter((t: any) => toSlug((t as any).category) === categorySlug)
        .map((t: any) => ({ loc: `${baseUrl}/writing/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "engineering",
    getCategorySlugs: () => ENGINEERING_CATS.map(c => c.id),
    getEntriesForCategory: (categorySlug) =>
      ENGINEERING_TOOLS
        .filter(t => t.category === categorySlug)
        .map(t => ({ loc: `${baseUrl}/engineering/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "pdf",
    getCategorySlugs: () => Array.from(new Set(PDF_TOOLS.map(t => t.subCategory).filter(Boolean))).map(s => toSlug(s as string)),
    getEntriesForCategory: (categorySlug) =>
      PDF_TOOLS
        .filter(t => t.subCategory && toSlug(t.subCategory) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/pdf/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "video",
    getCategorySlugs: () => VIDEO_CAT_ORDER.map(c => toSlug(c)),
    getEntriesForCategory: (categorySlug) =>
      VIDEO_TOOLS
        .filter(t => toSlug(t.category) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/video/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "developers",
    getCategorySlugs: () => DEV_CATS.map(c => devCategorySlug(c)),
    getEntriesForCategory: (categorySlug) =>
      DEV_TOOLS
        .filter(t => devCategorySlug(t.category) === categorySlug)
        .map(t => ({ loc: `${baseUrl}/developers/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "presentation",
    getCategorySlugs: () => PRESENTATION_CATS.map(c => c.slug || toSlug(c.title)),
    getEntriesForCategory: (categorySlug) => {
      const cat = PRESENTATION_CATS.find(c => (c.slug || toSlug(c.title)) === categorySlug);
      return (cat?.tools ?? []).map((t: any) => ({ loc: `${baseUrl}/presentation/${t.slug}`, lastmod: FALLBACK_LASTMOD }));
    },
  },
  {
    key: "productivity",
    getCategorySlugs: () => PRODUCTIVITY_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) => {
      const cat = PRODUCTIVITY_CATS.find((c: any) => toSlug(c.name) === categorySlug);
      return ((cat as any)?.tools ?? []).map((t: any) => ({ loc: `${baseUrl}/productivity/${t.slug}`, lastmod: FALLBACK_LASTMOD }));
    },
  },
  {
    key: "typography",
    getCategorySlugs: () => TYPOGRAPHY_CATS.map((c: any) => toSlug(c.name)),
    getEntriesForCategory: (categorySlug) =>
      TYPOGRAPHY_TOOLS
        .filter((t: any) => {
          const cat = TYPOGRAPHY_CATS.find((c: any) => c.tools.some((x: any) => x.slug === t.slug));
          return cat && toSlug(cat.name) === categorySlug;
        })
        .map((t: any) => ({ loc: `${baseUrl}/typography/${t.slug}`, lastmod: FALLBACK_LASTMOD })),
  },
  {
    key: "games",
    getCategorySlugs: () => GAMES_CATS.map(c => gameSlugify(c.name)),
    getEntriesForCategory: (categorySlug) => {
      const cat = GAMES_CATS.find(c => gameSlugify(c.name) === categorySlug);
      if (!cat) return [];
      return cat.subcategories.flatMap(sub =>
        sub.games.map(name => ({ loc: `${baseUrl}/games/${gameSlugify(name)}`, lastmod: FALLBACK_LASTMOD })),
      );
    },
  },
];

// Helper: safely convert Map or Array to Array for SEO
function ARRAY_FROM_CATS(cats: any): any[] {
  return Array.isArray(cats) ? cats : [];
}

// Empty categories return [] — they must NOT produce a phantom single empty page.
export function paginate(entries: SitemapUrlEntry[]): SitemapUrlEntry[][] {
  if (entries.length === 0) return [];
  const pages: SitemapUrlEntry[][] = [];
  for (let i = 0; i < entries.length; i += MAX_URLS_PER_SITEMAP) {
    pages.push(entries.slice(i, i + MAX_URLS_PER_SITEMAP));
  }
  return pages;
}
