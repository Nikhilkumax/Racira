const http = require("http");

const domains = [
  "animator", "audio", "business", "cad"
];

// Provide exact valid URLs for each
const urlsToTest = {
  "animator": { cat: "2d-animation-software", tool: "2d-animation-maker" },
  "audio": { cat: "audio-editing-and-processing", tool: "audio-editor" },
  "business": { cat: "business-planning", tool: "business-plan-generator" },
  "cad": { cat: "2d-cad", tool: "2d-cad" }
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
  
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const d = urlsToTest[domain];
    
    const urls = [
      `http://localhost:3002/${domain}`,
      `http://localhost:3002/${domain}/${d.cat}`,
      null,
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
