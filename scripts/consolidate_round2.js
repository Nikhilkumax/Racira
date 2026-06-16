const fs = require('fs');
const path = require('path');

const toSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/&/g, '') // remove &
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // double hyphens to single
    .replace(/^-|-$/g, ''); // trim hyphens
};

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/calculators');
const SUMMARY_FILE = path.join(ROOT, 'src/app/calculator/summaryData.ts');
const NEXT_CONFIG = path.join(ROOT, 'next.config.mjs');

const merges = [
  // Business
  { cat: "business", sourceSlug: "saas-startup", targetSlug: "saas-startups" },
  
  // Math
  { cat: "math", sourceSlug: "algebra-geometry", targetSlug: "algebra" },
  { cat: "math", sourceSlug: "binary-hex", targetSlug: "number-theory-discrete-math" },
  { cat: "math", sourceSlug: "applied-financial-math", targetSlug: "financial-mathematics" },
  { cat: "math", sourceSlug: "applied-mathematics", targetSlug: "financial-mathematics" }, // Manual decision
  { cat: "math", sourceSlug: "discrete-math-logic", targetSlug: "number-theory-discrete-math" },

  // Science
  { cat: "science", sourceSlug: "biology-genetics", targetSlug: "biology-life-sciences" },
  { cat: "science", sourceSlug: "physics-waves-optics", targetSlug: "waves-optics-nuclear" },
  { cat: "science", sourceSlug: "physics-thermodynamics", targetSlug: "thermodynamics-fluids" },
  { cat: "science", sourceSlug: "astrophysics-relativity", targetSlug: "astronomy-space-science" },
  { cat: "science", sourceSlug: "kinematics-dynamics", targetSlug: "mechanics-motion" },
  { cat: "science", sourceSlug: "aquatics-marine-science", targetSlug: "earth-atmosphere-geography" },

  // Engineering
  { cat: "engineering", sourceSlug: "civil-engineering", targetSlug: "civil-structural-engineering" },
  { cat: "engineering", sourceSlug: "process-industrial", targetSlug: "industrial-manufacturing" },
  { cat: "engineering", sourceSlug: "materials-vibration", targetSlug: "materials-science" },

  // Technology
  { cat: "technology", sourceSlug: "software-development", targetSlug: "programming-software" },
  { cat: "technology", sourceSlug: "ai-machine-learning", targetSlug: "data-science-ai-ml" },
  { cat: "technology", sourceSlug: "web-seo", targetSlug: "web-digital" },
  { cat: "technology", sourceSlug: "cloud-infrastructure", targetSlug: "cloud-devops" },
  { cat: "technology", sourceSlug: "performance-devops", targetSlug: "cloud-devops" },
  { cat: "technology", sourceSlug: "storage-hardware", targetSlug: "database-storage" },
  { cat: "technology", sourceSlug: "marketing-analytics", targetSlug: "web-digital" },
  { cat: "technology", sourceSlug: "gaming-display", targetSlug: "programming-software" },

  // Everyday Life
  { cat: "everyday-life", sourceSlug: "food-kitchen-cooking", targetSlug: "food-cooking" },
  { cat: "everyday-life", sourceSlug: "home-garden", targetSlug: "home-household" },
  { cat: "everyday-life", sourceSlug: "time-dates-productivity", targetSlug: "time-productivity" },
  { cat: "everyday-life", sourceSlug: "shopping-personal-finance", targetSlug: "consumer-shopping" },
  { cat: "everyday-life", sourceSlug: "fantasy-betting", targetSlug: "gaming-hobbies" },
  { cat: "everyday-life", sourceSlug: "pets-animals", targetSlug: "gaming-hobbies" },

  // Construction
  { cat: "construction", sourceSlug: "surveying-gis", targetSlug: "surveying-site-work" },
  { cat: "construction", sourceSlug: "project-management-estimating", targetSlug: "estimating-costs" }
];

async function run() {
  console.log("Starting consolidation Round 2...");

  // 1. Read summaryData.ts to build slug -> name map
  let summaryContent = fs.readFileSync(SUMMARY_FILE, 'utf-8');
  let categorySummaryMatch = summaryContent.match(/export const CATEGORY_SUMMARY = (\[[\s\S]*?\]);\n/);
  if (!categorySummaryMatch) {
      console.log("Could not parse CATEGORY_SUMMARY.");
      return;
  }
  let summaryData = eval(categorySummaryMatch[1]);
  
  const getSubcategoryName = (catSlug, subSlug) => {
    let cat = summaryData.find(c => toSlug(c.category) === catSlug || c.category.toLowerCase().replace('_', '-') === catSlug);
    if (!cat) return null;
    let sub = cat.subcategories.find(s => toSlug(s.name) === subSlug);
    return sub ? sub.name : null;
  };

  // Build replacements map for each category file
  let fileReplacements = {};
  for (let merge of merges) {
    let sourceName = getSubcategoryName(merge.cat, merge.sourceSlug);
    let targetName = getSubcategoryName(merge.cat, merge.targetSlug);
    if (!sourceName || !targetName) {
      console.log(`Missing name for ${merge.cat}: ${merge.sourceSlug} -> ${merge.targetSlug}`);
      continue;
    }
    if (!fileReplacements[merge.cat]) fileReplacements[merge.cat] = [];
    fileReplacements[merge.cat].push({ sourceName, targetName, sourceSlug: merge.sourceSlug, targetSlug: merge.targetSlug });
  }

  // 2. Process all merges in calculator files
  let categoryFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

  for (let file of categoryFiles) {
    let catSlug = file.replace('.ts', '');
    let filePath = path.join(DATA_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    if (fileReplacements[catSlug]) {
      for (let rep of fileReplacements[catSlug]) {
        // We use string replace with quotes to match exactly
        let regex = new RegExp(`subcategory:\\s*(["'])${rep.sourceName.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&')}\\1`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, `subcategory: "${rep.targetName}"`);
            modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated merges in ${file}`);
    }
  }

  // 3. Update SummaryData.ts
  console.log("Rebuilding summaryData.ts...");
  let categoryOrder = [
    "FINANCE", "BUSINESS", "HEALTH", "MATH", "SCIENCE", 
    "ENGINEERING", "TECHNOLOGY", "ENVIRONMENT", "EVERYDAY_LIFE", 
    "TRANSPORTATION", "CONSTRUCTION", "EDUCATION"
  ];
  
  let newSummary = [];
  let allCalcs = [];

  for (let file of categoryFiles) {
      let content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      let lines = content.split('\n');
      for (let line of lines) {
          if (line.trim().startsWith('{') && line.includes('slug:') && line.includes('subcategory:')) {
              let catMatch = line.match(/category:\s*(["'])(.*?)\1/);
              let subMatch = line.match(/subcategory:\s*(["'])(.*?)\1/);
              if (catMatch && subMatch) {
                  allCalcs.push({
                      category: catMatch[2],
                      subcategory: subMatch[2]
                  });
              }
          }
      }
  }

  for (let cat of categoryOrder) {
      let catCalcs = allCalcs.filter(c => c.category === cat);
      let total = catCalcs.length;
      let subCounts = {};
      for (let c of catCalcs) {
          subCounts[c.subcategory] = (subCounts[c.subcategory] || 0) + 1;
      }
      let subcategories = Object.keys(subCounts).map(name => ({
          name, count: subCounts[name]
      })).sort((a, b) => b.count - a.count); // sort by count descending

      newSummary.push({
          category: cat,
          total,
          subcategories
      });
  }

  let summaryOut = "export const CATEGORY_SUMMARY = " + JSON.stringify(newSummary, null, 2) + ";\n";
  fs.writeFileSync(SUMMARY_FILE, summaryOut, 'utf-8');
  console.log("Updated summaryData.ts");

  // 4. Update next.config.mjs with redirects
  console.log("Updating next.config.mjs...");
  let nextConfigContent = fs.readFileSync(NEXT_CONFIG, 'utf-8');
  
  let redirects = merges.map(merge => 
    "{ source: '/calculator/" + merge.cat + "/" + merge.sourceSlug + "', destination: '/calculator/" + merge.cat + "/" + merge.targetSlug + "', permanent: true }"
  );

  if (nextConfigContent.includes('async redirects() {') && nextConfigContent.includes('return [')) {
    // Find the end of the return array inside redirects()
    let newContent = nextConfigContent.replace(/(return \\[[\\s\\S]*?)\\n\\s*\\];/m, (match, p1) => {
        // check if there's a trailing comma before adding
        let updatedArray = p1;
        if (!updatedArray.trim().endsWith(',')) {
            updatedArray += ',';
        }
        return updatedArray + '\\n      ' + redirects.join(',\\n      ') + '\\n    ];';
    });
    fs.writeFileSync(NEXT_CONFIG, newContent, 'utf-8');
    console.log("Appended new redirects to next.config.mjs");
  } else {
    console.log("Could not parse next.config.mjs redirects block automatically.");
  }
  
  console.log("Done Round 2!");
}

run();
