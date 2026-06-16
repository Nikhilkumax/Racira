const fs = require('fs');
const path = require('path');

// Recreate slug function locally
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
  // Finance
  { cat: "finance", sourceSlug: "loans", targetSlug: "loans-mortgages" },
  { cat: "finance", sourceSlug: "savings", targetSlug: "savings-banking" },
  { cat: "finance", sourceSlug: "crypto", targetSlug: "crypto-defi" },
  { cat: "finance", sourceSlug: "investment", targetSlug: "investment-wealth" },
  { cat: "finance", sourceSlug: "real-estate", targetSlug: "real-estate-finance" },
  { cat: "finance", sourceSlug: "income-tax", targetSlug: "tax" },
  { cat: "finance", sourceSlug: "interest", targetSlug: "savings-banking" },
  { cat: "finance", sourceSlug: "employment", targetSlug: "personal-finance" },
  { cat: "finance", sourceSlug: "growth", targetSlug: "investment-wealth" },
  { cat: "finance", sourceSlug: "general", targetSlug: "personal-finance" },
  { cat: "finance", sourceSlug: "auto", targetSlug: "loans-mortgages" },
  // Business
  { cat: "business", sourceSlug: "business", targetSlug: "business-finance" },
  // Health
  { cat: "health", sourceSlug: "body-metrics", targetSlug: "body-metrics-anthropometry" },
  { cat: "health", sourceSlug: "clinical-dosing", targetSlug: "pharmacy-dosing" },
  { cat: "health", sourceSlug: "pediatric", targetSlug: "pediatric-health" },
  { cat: "health", sourceSlug: "nutrition", targetSlug: "nutrition-diet" },
  { cat: "health", sourceSlug: "pregnancy", targetSlug: "pregnancy-fertility" },
  { cat: "health", sourceSlug: "mental-health", targetSlug: "sleep-mental-health" },
  { cat: "health", sourceSlug: "running", targetSlug: "running-endurance" },
  { cat: "health", sourceSlug: "cycling", targetSlug: "cycling-water-sports" },
  { cat: "health", sourceSlug: "weightlifting", targetSlug: "weightlifting-strength" },
  { cat: "health", sourceSlug: "activity", targetSlug: "fitness-exercise" },
  { cat: "health", sourceSlug: "medical", targetSlug: "clinical-medical" },
  { cat: "health", sourceSlug: "triathlon", targetSlug: "running-endurance" },
  { cat: "health", sourceSlug: "bowling", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "baseball", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "basketball", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "football", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "tennis", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "billiards", targetSlug: "ball-sports" },
  { cat: "health", sourceSlug: "swimming", targetSlug: "cycling-water-sports" },
  { cat: "health", sourceSlug: "walking", targetSlug: "running-endurance" },
  // Math
  { cat: "math", sourceSlug: "basic", targetSlug: "basic-arithmetic" },
  { cat: "math", sourceSlug: "discrete-math", targetSlug: "number-theory-discrete-math" },
  { cat: "math", sourceSlug: "number-theory", targetSlug: "number-theory-discrete-math" },
  // Science
  { cat: "science", sourceSlug: "physics", targetSlug: "physics-mechanics" },
  { cat: "science", sourceSlug: "earth-science", targetSlug: "earth-science-geology" },
  { cat: "science", sourceSlug: "electricity-magnetism", targetSlug: "physics-electricity-magnetism" },
  { cat: "science", sourceSlug: "weather", targetSlug: "earth-atmosphere-geography" },
  // Engineering
  { cat: "engineering", sourceSlug: "electronics", targetSlug: "electronics-embedded-systems" },
  // Technology
  { cat: "technology", sourceSlug: "networking", targetSlug: "networking-infrastructure" },
  { cat: "technology", sourceSlug: "storage", targetSlug: "storage-hardware" },
  { cat: "technology", sourceSlug: "hardware", targetSlug: "storage-hardware" },
  { cat: "technology", sourceSlug: "security", targetSlug: "cybersecurity" },
  { cat: "technology", sourceSlug: "infrastructure", targetSlug: "cloud-infrastructure" },
  { cat: "technology", sourceSlug: "software", targetSlug: "software-development" },
  { cat: "technology", sourceSlug: "display", targetSlug: "gaming-display" },
  { cat: "technology", sourceSlug: "gaming", targetSlug: "gaming-display" },
  { cat: "technology", sourceSlug: "web", targetSlug: "web-seo" },
  { cat: "technology", sourceSlug: "marketing", targetSlug: "marketing-analytics" },
  { cat: "technology", sourceSlug: "network", targetSlug: "networking-infrastructure" },
  { cat: "technology", sourceSlug: "general", targetSlug: "programming-software" },
  { cat: "technology", sourceSlug: "design", targetSlug: "web-seo" },
  { cat: "technology", sourceSlug: "creator", targetSlug: "web-digital" },
  // Environment
  { cat: "environment", sourceSlug: "footprint", targetSlug: "carbon-footprint" },
  { cat: "environment", sourceSlug: "offset", targetSlug: "offset-sequestration" },
  { cat: "environment", sourceSlug: "energy", targetSlug: "renewable-energy" },
  { cat: "environment", sourceSlug: "gardening", targetSlug: "crops-soil" },
  { cat: "environment", sourceSlug: "conservation", targetSlug: "ecology-biodiversity" },
  { cat: "environment", sourceSlug: "analysis", targetSlug: "climate-carbon" },
  // Everyday Life
  { cat: "everyday-life", sourceSlug: "food", targetSlug: "food-kitchen-cooking" },
  { cat: "everyday-life", sourceSlug: "home", targetSlug: "home-household" },
  { cat: "everyday-life", sourceSlug: "garden", targetSlug: "home-garden" },
  { cat: "everyday-life", sourceSlug: "travel", targetSlug: "travel-recreation" },
  { cat: "everyday-life", sourceSlug: "finance", targetSlug: "shopping-personal-finance" },
  { cat: "everyday-life", sourceSlug: "general", targetSlug: "personal-family" },
  { cat: "everyday-life", sourceSlug: "animals", targetSlug: "gaming-hobbies" },
  { cat: "everyday-life", sourceSlug: "pets", targetSlug: "gaming-hobbies" },
  { cat: "everyday-life", sourceSlug: "time-dates", targetSlug: "time-productivity" },
  { cat: "everyday-life", sourceSlug: "shopping-lifestyle", targetSlug: "consumer-shopping" },
  { cat: "everyday-life", sourceSlug: "food-kitchen", targetSlug: "food-kitchen-cooking" },
  // Transportation
  { cat: "transportation", sourceSlug: "costs", targetSlug: "costs-ownership" },
  { cat: "transportation", sourceSlug: "performance", targetSlug: "performance-engine" },
  { cat: "transportation", sourceSlug: "general", targetSlug: "automotive" },
  // Construction
  { cat: "construction", sourceSlug: "green-building", targetSlug: "green-building-energy-efficiency" },
  { cat: "construction", sourceSlug: "real-estate", targetSlug: "estimating-costs" },
  { cat: "construction", sourceSlug: "general", targetSlug: "materials-quantities" },
  // Education
  { cat: "education", sourceSlug: "grades", targetSlug: "gpa-grades" },
  { cat: "education", sourceSlug: "finance", targetSlug: "education-finance" },
  { cat: "education", sourceSlug: "study-skills", targetSlug: "study-skills-productivity" },
  { cat: "education", sourceSlug: "general", targetSlug: "academic-planning" },
  { cat: "education", sourceSlug: "admissions", targetSlug: "academic-planning" },
];

const relocations = [
  { fromCat: "finance", slug: "saas-startup", toCat: "business" },
  { fromCat: "health", slug: "fantasy-betting", toCat: "everyday-life" },
  { fromCat: "health", slug: "motorsports-special", toCat: "transportation" },
  { fromCat: "health", slug: "pets-animals", toCat: "everyday-life" }
];

async function run() {
  console.log("Starting consolidation...");

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
  let counts = {}; // Keep track of moved counts for assertions
  let categoryFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

  for (let file of categoryFiles) {
    let catSlug = file.replace('.ts', '');
    let filePath = path.join(DATA_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    if (fileReplacements[catSlug]) {
      for (let rep of fileReplacements[catSlug]) {
        // Regex to match subcategory exactly
        let regex = new RegExp(`subcategory:\\s*(["'])${rep.sourceName}\\1`, 'g');
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

  // 3. Process Relocations
  // For each relocation, we need to find all objects in the source file, remove them, and append them to the target file.
  // Actually, wait, the relocation is just a subcategory.
  // Example: all calculators with subcategory "SaaS & Startup" in finance.ts move to business.ts, and category changes to "BUSINESS".
  // Let's do this via regex matching entire objects or we can do it line by line since each calculator is mostly on one line.
  
  for (let rel of relocations) {
    let sourceFile = path.join(DATA_DIR, `${rel.fromCat}.ts`);
    let targetFile = path.join(DATA_DIR, `${rel.toCat}.ts`);
    let sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    let targetContent = fs.readFileSync(targetFile, 'utf-8');

    let subName = getSubcategoryName(rel.fromCat, rel.slug);
    if (!subName) {
        console.log(`Could not find name for relocation ${rel.slug}`);
        continue;
    }

    let extractedLines = [];
    let newSourceLines = [];
    
    let lines = sourceContent.split('\n');
    for (let line of lines) {
        if (line.includes(`subcategory: "${subName}"`) || line.includes(`subcategory: '${subName}'`)) {
            // Fix category field
            let newCatStr = rel.toCat.toUpperCase().replace('-', '_');
            let updatedLine = line.replace(/category:\s*(["'])[A-Z_]+\1/, `category: "${newCatStr}"`);
            extractedLines.push(updatedLine);
        } else {
            newSourceLines.push(line);
        }
    }

    if (extractedLines.length > 0) {
        // Find where to insert in target file
        let tLines = targetContent.split('\n');
        let insertIdx = -1;
        for (let i = tLines.length - 1; i >= 0; i--) {
            if (tLines[i].includes('];')) {
                insertIdx = i;
                break;
            }
        }
        
        if (insertIdx !== -1) {
            // Need to handle missing commas. If the line before insertIdx doesn't end with comma, add one (except if it's the start of array).
            // Actually, we can just ensure our extracted lines end with comma, or target array handles it.
            // Let's just insert them before '];'.
            let prevLineIdx = insertIdx - 1;
            if (prevLineIdx >= 0 && tLines[prevLineIdx].trim().endsWith('}') && !tLines[prevLineIdx].trim().endsWith(',')) {
                tLines[prevLineIdx] = tLines[prevLineIdx] + ',';
            }
            
            for (let i = 0; i < extractedLines.length; i++) {
               let eLine = extractedLines[i];
               if (!eLine.trim().endsWith(',')) eLine += ',';
               tLines.splice(insertIdx + i, 0, eLine);
            }
            
            // Collect any icons needed
            let iconsNeeded = new Set();
            for (let eLine of extractedLines) {
                let m = eLine.match(/icon:\s*([A-Za-z]+)/);
                if (m) iconsNeeded.add(m[1]);
            }
            
            // Add imports to target file
            let importLineIdx = tLines.findIndex(l => l.includes('import {') && l.includes('lucide-react'));
            if (importLineIdx !== -1) {
                let importLine = tLines[importLineIdx];
                for (let icon of iconsNeeded) {
                    if (!importLine.includes(icon)) {
                        importLine = importLine.replace('import {', `import { ${icon},`);
                    }
                }
                tLines[importLineIdx] = importLine;
            }

            fs.writeFileSync(sourceFile, newSourceLines.join('\n'), 'utf-8');
            fs.writeFileSync(targetFile, tLines.join('\n'), 'utf-8');
            console.log(`Moved ${extractedLines.length} calculators from ${rel.fromCat} to ${rel.toCat} (${subName})`);
        }
    }
  }

  // 4. Update SummaryData.ts
  // We need to rebuild it by reading all calculator files and counting.
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

  let summaryOut = `export const CATEGORY_SUMMARY = ${JSON.stringify(newSummary, null, 2)};\n`;
  fs.writeFileSync(SUMMARY_FILE, summaryOut, 'utf-8');
  console.log("Updated summaryData.ts");

  // 5. Update next.config.mjs with redirects
  console.log("Updating next.config.mjs...");
  let nextConfigContent = fs.readFileSync(NEXT_CONFIG, 'utf-8');
  
  let redirects = [];
  for (let merge of merges) {
      redirects.push(`{ source: '/calculator/${merge.cat}/${merge.sourceSlug}', destination: '/calculator/${merge.cat}/${merge.targetSlug}', permanent: true }`);
  }
  for (let rel of relocations) {
      redirects.push(`{ source: '/calculator/${rel.fromCat}/${rel.slug}', destination: '/calculator/${rel.toCat}/${rel.slug}', permanent: true }`);
  }

  let redirectsCode = `
  async redirects() {
    return [
      ${redirects.join(',\n      ')}
    ];
  },
  webpack:`;

  if (nextConfigContent.includes('async redirects()')) {
      // Update existing
      console.log("Redirects already exist. Need manual replacement.");
  } else {
      nextConfigContent = nextConfigContent.replace('webpack:', redirectsCode);
      fs.writeFileSync(NEXT_CONFIG, nextConfigContent, 'utf-8');
      console.log("Added redirects to next.config.mjs");
  }
  
  console.log("Done!");
}

run();
