import { sitemapSources as SOURCES } from "./src/lib/sitemap/sitemapSources";
import * as http from "http";

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

function checkStatus(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
      res.resume();
    }).on("error", (e) => {
      resolve("ERR");
    });
  });
}

async function run() {
  console.log("| Domain | Index | Category | Subcategory | Tool | Legacy-404 |");
  console.log("|---|---|---|---|---|---|");
  console.log(`| finance | Skipped (Out of scope, blog only) | | | | |`);
  
  for (const domain of domains) {
    if (domain === "finance") continue;
    const source = SOURCES.find(s => s.key === domain);
    if (!source) {
      console.log(`| ${domain} | MISSING SOURCE |`);
      continue;
    }
    
    // Find category
    let cats = [];
    if (source.getCategorySlugs) {
      cats = await source.getCategorySlugs();
    } else if (source.key === "calculator") {
      cats = ["finance"];
    }
    
    let catSlug = cats[0] || "test-cat";
    let subSlug = null;
    let toolSlug = "test-tool";
    
    if (domain === "games") {
      subSlug = "number-puzzles";
    }
    if (domain === "calculator") {
      subSlug = "investment-wealth";
    }
    if (domain === "pdf") {
      subSlug = "edit-pdf";
    }
    
    // Find tool
    let entries = [];
    if (source.getEntriesForCategory) {
      entries = await source.getEntriesForCategory(catSlug);
    }
    if (entries && entries.length > 0) {
      toolSlug = entries[0].loc.split("/").pop();
    }
    
    const urls = [
      `http://localhost:3002/${domain}`,
      `http://localhost:3002/${domain}/${catSlug}`,
      subSlug ? `http://localhost:3002/${domain}/${subSlug}` : null,
      `http://localhost:3002/${domain}/${toolSlug}`,
      `http://localhost:3002/${domain}/tools/${toolSlug}` // legacy
    ];
    
    let results = [];
    for (const url of urls) {
      if (url === null) {
        results.push("n/a");
      } else {
        results.push(await checkStatus(url));
      }
    }
    
    console.log(`| ${domain} | ${results.join(" | ")} |`);
  }
}

run();
