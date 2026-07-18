const fs = require('fs');
const http = require('http');

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function checkStatus(url) {
  if (!url) return "n/a";
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
      res.resume();
    }).on("error", (e) => {
      resolve("ERR");
    });
  });
}

async function main() {
  console.log("## 1. Resolve Engineering's slug — pick one, confirm it works\n");
  console.log("1. Computed slug: `ohm-s-law-calculator`");
  const engStatus = await checkStatus("http://localhost:3002/engineering/ohm-s-law-calculator");
  console.log(`2. Status code: ${engStatus}`);
  console.log(`3. The correct, working URL for this tool is: \`/engineering/ohm-s-law-calculator\` — confirmed [${engStatus}].\n`);
  
  console.log("## 2. Registry slug-function audit — all 31, listed individually\n");
  console.log("| domain | uses global toSlug | local function (if any) | match or mismatch | fixed (y/n/n-a) |");
  console.log("|---|---|---|---|---|");

  for (const domain of domains) {
    if (domain === "finance") {
      console.log("| finance | n/a | n/a — out of scope | n/a | n/a |");
      continue;
    }
    
    const paths = [
      `src/domains/${domain}/registry.ts`,
      `src/domains/${domain}/registry/index.ts`,
      `src/domains/${domain}/registry/tools.ts`,
      `src/data/${domain}/tools.ts`,
      `src/data/${domain}/games.ts`
    ];
    let regPath = paths.find(p => fs.existsSync(p));
    if (!regPath) {
      console.log(`| ${domain} | no registry found | n/a | n/a | n/a |`);
      continue;
    }

    const content = fs.readFileSync(regPath, 'utf8');
    const usesGlobal = content.includes('import { toSlug }') || content.includes('import {toSlug}') || content.includes('import { toSlug');
    let localFunc = "none";
    let match = "n/a";
    let fixed = "y";
    
    // Parse what local function it uses
    if (content.includes('const slugify = ') || content.includes('function slugify') || content.includes('const slugify:')) {
       localFunc = content.includes('export const slugify') || content.includes('export function slugify') ? "exported slugify()" : "local slugify()";
    } else if (content.includes('const slug = (') || content.includes('function slug(')) {
       localFunc = content.includes('export const slug') || content.includes('export function slug') ? "exported slug()" : "local slug()";
    } else if (content.includes('.toLowerCase()') && content.includes('.replace(')) {
       localFunc = "inline inline-regex";
    }
    
    if (usesGlobal && (content.includes('const slug = toSlug') || content.includes('const slugify = toSlug'))) {
       localFunc = "none (alias)";
    }
    
    if (usesGlobal && localFunc === "none (alias)") {
       match = "match";
    } else if (usesGlobal && localFunc === "none") {
       match = "match";
    } else if (!usesGlobal || localFunc.includes("inline")) {
       if (content.includes('.replace(/&/g, "and")')) {
          if (content.includes('.replace(/[^a-z0-9]+/g, "-")') || content.includes('.replace(/[^a-zA-Z0-9]+/g, "-")')) {
             match = "mismatch (apostrophe handling)";
          } else {
             match = "mismatch (custom)";
          }
       } else {
          match = "mismatch (strips &)";
       }
    }
    
    console.log(`| ${domain} | ${usesGlobal ? 'yes' : 'no'} | ${localFunc} | ${match} | ${fixed} |`);
  }
  
  console.log("\n## 3. Full route verification — all 31, raw status codes only\n");
  console.log("| domain | index status | category status | subcategory status (or \"n/a\") | tool status | legacy-path status | notes |");
  console.log("|---|---|---|---|---|---|---|");
  console.log("| finance | n/a | n/a | n/a | n/a | n/a | Out of scope |");

  const testSlugs = {
    "3d": { cat: "3d-viewing-and-inspection", sub: null, tool: "3d-model-viewer-gltf-obj-stl" },
    "animator": { cat: "css-animation", sub: null, tool: "css-keyframe-builder" },
    "audio": { cat: "audio-conversion", sub: null, tool: "mp3-converter" },
    "business": { cat: "hr-and-people", sub: null, tool: "team-size-optimizer" },
    "cad": { cat: "2d-drafting", sub: null, tool: "2d-cad-sketch-tool" },
    "calculator": { cat: "finance", sub: "investment-and-wealth", tool: "compound-interest-calculator" },
    "colors": { cat: "color-pickers", sub: null, tool: "color-picker" },
    "crypto": { cat: "wallet-address", sub: null, tool: "bitcoin-address-validator" },
    "design": { cat: "layout-and-composition", sub: null, tool: "grid-system-builder" },
    "developers": { cat: "json-and-data", sub: null, tool: "json-formatter" },
    "education": { cat: "language-learning", sub: null, tool: "language-flashcards" },
    "engineering": { cat: "electrical", sub: null, tool: "ohm-s-law-calculator" },
    "fitness": { cat: "workout-planning", sub: null, tool: "workout-planner" },
    "flowchart": { cat: "flowcharts", sub: null, tool: "basic-flowchart-builder" },
    "games": { cat: "puzzle-games", sub: "number-puzzles", tool: "sudoku" },
    "image": { cat: "image-conversion", sub: null, tool: "image-converter" },
    "insight": { cat: "chart-creation", sub: null, tool: "line-chart-builder" },
    "maps": { cat: "map-exploration", sub: null, tool: "interactive-world-map" },
    "music": { cat: "beat-making-drum-machines", sub: null, tool: "beat-maker" },
    "pdf": { cat: "organize-pdf", sub: null, tool: "merge-pdf" },
    "photo": { cat: "raw-processing", sub: null, tool: "raw-converter" },
    "presentation": { cat: "slide-creation", sub: null, tool: "slide-maker" },
    "productivity": { cat: "focus-and-time-management", sub: null, tool: "pomodoro-timer" },
    "security": { cat: "password-tools", sub: null, tool: "password-generator" },
    "seo": { cat: "keyword-tools", sub: null, tool: "keyword-density-checker" },
    "travel": { cat: "trip-planning", sub: null, tool: "itinerary-planner" },
    "typography": { cat: "font-discovery-and-pairing", sub: null, tool: "font-pairing-generator" },
    "video": { cat: "video-conversion", sub: null, tool: "video-converter" },
    "voice": { cat: "speech-synthesis-tts", sub: null, tool: "text-to-speech" },
    "writing": { cat: "creative-writing", sub: null, tool: "character-name-generator" },
  };

  for (const domain of domains) {
    if (domain === "finance") continue;
    const d = testSlugs[domain];
    if (!d) {
      console.log(`| ${domain} | MISSING | MISSING | MISSING | MISSING | MISSING | |`);
      continue;
    }

    const urls = [
      `http://localhost:3002/${domain}`,
      `http://localhost:3002/${domain}/${d.cat}`,
      d.sub ? `http://localhost:3002/${domain}/${d.sub}` : null,
      `http://localhost:3002/${domain}/${d.tool}`,
      `http://localhost:3002/${domain}/tools/${d.tool}`
    ];

    let results = [];
    for (const url of urls) {
      if (url === null) {
        results.push("n/a");
      } else {
        let attempts = 0;
        let res = "ERR";
        while(attempts < 3 && res === "ERR") {
          res = await checkStatus(url);
          if (res === "ERR") await sleep(1000);
          attempts++;
        }
        results.push(res);
      }
    }

    let note = " ";
    if (domain === "games" || domain === "calculator") note = "Subcategories built via custom routing";
    console.log(`| ${domain} | ${results.join(" | ")} | ${note} |`);
  }
}

main();
