const http = require("http");

const domains = [
  "3d", "animator", "audio", "business", "cad", "calculator", "colors", "crypto",
  "design", "developers", "education", "engineering", "finance", "fitness",
  "flowchart", "games", "image", "insight", "maps", "music", "pdf", "photo",
  "presentation", "productivity", "security", "seo", "travel", "typography",
  "video", "voice", "writing"
];

const testSlugs = {
  "3d": { cat: "3d-viewing-and-inspection", sub: null, tool: "3d-model-viewer-gltf-obj-stl" },
  "animator": { cat: "2d-animation", sub: null, tool: "2d-animation-maker" },
  "audio": { cat: "audio-editing", sub: null, tool: "audio-editor" },
  "business": { cat: "business-planning-and-strategy", sub: null, tool: "business-plan-generator" },
  "cad": { cat: "2d-drafting", sub: null, tool: "2d-cad" },
  "calculator": { cat: "finance", sub: "investment-and-wealth", tool: "compound-interest-calculator" },
  "colors": { cat: "palettes-and-schemes", sub: null, tool: "color-palette-generator" },
  "crypto": { cat: "wallet-and-address", sub: null, tool: "ethereum-address-validator" },
  "design": { cat: "layout-and-composition", sub: null, tool: "grid-system-builder" },
  "developers": { cat: "json-and-data", sub: null, tool: "json-formatter" },
  "education": { cat: "learning-management", sub: null, tool: "lms-dashboard" },
  "engineering": { cat: "electrical", sub: null, tool: "ohms-law-calculator" },
  "fitness": { cat: "strength-and-resistance", sub: null, tool: "one-rep-max-calculator" },
  "flowchart": { cat: "flowcharts", sub: null, tool: "basic-flowchart-maker" },
  "games": { cat: "puzzle-and-trivia", sub: "number-puzzles", tool: "sudoku" },
  "image": { cat: "conversion", sub: null, tool: "image-converter" },
  "insight": { cat: "chart-creation", sub: null, tool: "line-chart-builder" },
  "maps": { cat: "map-viewing", sub: null, tool: "interactive-world-map" },
  "music": { cat: "beat-making-and-drum-machines", sub: null, tool: "beat-maker" },
  "pdf": { cat: "organize-pdf", sub: null, tool: "merge-pdf" },
  "photo": { cat: "raw-processing", sub: null, tool: "raw-converter" },
  "presentation": { cat: "slide-creation-and-editing", sub: null, tool: "slide-maker" },
  "productivity": { cat: "focus-and-time-management", sub: null, tool: "pomodoro-timer" },
  "security": { cat: "password-tools", sub: null, tool: "password-generator" },
  "seo": { cat: "keyword-tools", sub: null, tool: "keyword-density-checker" },
  "travel": { cat: "trip-planning", sub: null, tool: "itinerary-planner" },
  "typography": { cat: "font-discovery-and-pairing", sub: null, tool: "font-pairing-generator" },
  "video": { cat: "video-conversion", sub: null, tool: "video-converter" },
  "voice": { cat: "speech-synthesis-and-tts", sub: null, tool: "text-to-speech" },
  "writing": { cat: "creative-writing", sub: null, tool: "character-name-generator" },
};

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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log("| Domain | Index | Category | Subcategory | Tool | Legacy-404 |");
  console.log("|---|---|---|---|---|---|");
  console.log(`| finance | Skipped (Out of scope, blog only) | | | | |`);
  
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    if (domain === "finance") continue;
    
    const d = testSlugs[domain];
    if (!d) {
      console.log(`| ${domain} | MISSING TEST DATA |`);
      continue;
    }
    
    const urls = [
      `http://localhost:3002/${domain}`,
      `http://localhost:3002/${domain}/${d.cat}`,
      d.sub ? `http://localhost:3002/${domain}/${d.sub}` : null,
      `http://localhost:3002/${domain}/${d.tool}`,
      `http://localhost:3002/${domain}/tools/${d.tool}` // legacy
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
          if (res === "ERR") await sleep(2000);
          attempts++;
        }
        results.push(res);
      }
    }
    
    console.log(`| ${domain} | ${results.join(" | ")} |`);
  }
}

run();
