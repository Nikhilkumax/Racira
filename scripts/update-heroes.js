const fs = require('fs');
const path = require('path');

const data = {
  "pdf": { path: "src/domains/pdf/tools/Index.tsx", count: "175", title: "PDF Tools", tagline: "Merge, Split & Compress", desc: "Professional-grade tools to merge, split, compress, and edit PDF documents securely.", ph: "Search 175+ PDF tools..." },
  "image": { path: "src/app/image/page.tsx", count: "40", title: "Image Tools", tagline: "Convert, Resize & Edit", desc: "Essential utilities to convert formats, resize, crop, and compress your images instantly.", ph: "Search 40+ image tools..." },
  "design": { path: "src/app/design/page.tsx", count: "15", title: "Design Tools", tagline: "Assets, Layouts & Mockups", desc: "Generate mockups, extract assets, and perfect your layouts with our design utilities.", ph: "Search 15+ design tools..." },
  "colors": { path: "src/domains/colors/components/home-client.tsx", count: "450", title: "Color Tools", tagline: "Palettes, Gradients & Converts", desc: "Extract palettes, generate gradients, and convert color spaces for your creative projects.", ph: "Search 450+ color tools..." },
  "typography": { path: "src/app/typography/page.tsx", count: "20", title: "Typography Tools", tagline: "Fonts, Scales & Pairings", desc: "Find perfect font pairings, generate modular scales, and preview typography instantly.", ph: "Search 20+ typography tools..." },
  "photo": { path: "src/app/photo/page.tsx", count: "10", title: "Photo Editor", tagline: "Filters, Retouch & Adjust", desc: "Apply filters, adjust lighting, and retouch your photos right in the browser.", ph: "Search 10+ photo tools..." },
  "video": { path: "src/app/video/page.tsx", count: "4", title: "Video Tools", tagline: "Trim, Crop & Convert", desc: "Basic video utilities to trim, crop, and convert formats without heavy software.", ph: "Search 4+ video tools..." },
  "animator": { path: "src/app/animator/page.tsx", count: "130", title: "Animation Tools", tagline: "CSS, SVG & Keyframes", desc: "Generate CSS animations, SVG paths, and keyframe sequences for your web projects.", ph: "Search 130+ animation tools..." },
  "voice": { path: "src/app/voice/page.tsx", count: "10", title: "Voice Tools", tagline: "Record, Pitch & Modulate", desc: "Browser-based tools to record, change pitch, and modulate your voice securely.", ph: "Search 10+ voice tools..." },
  "audio": { path: "src/app/audio/page.tsx", count: "270", title: "Audio Tools", tagline: "Trim, Merge & Convert", desc: "Edit, merge, trim, and convert audio files with professional-grade sound utilities.", ph: "Search 270+ audio tools..." },
  "writing": { path: "src/app/writing/page.tsx", count: "160", title: "Writing Tools", tagline: "Grammar, Count & Format", desc: "Enhance your writing with grammar checks, word counts, formatters, and text utilities.", ph: "Search 160+ writing tools..." },
  "seo": { path: "src/app/seo/page.tsx", count: "6", title: "SEO Tools", tagline: "Meta, Tags & Analysis", desc: "Optimize your web presence with meta tag generators, keyword analyzers, and SEO utilities.", ph: "Search 6+ SEO tools..." },
  "developers": { path: "src/app/developers/page.tsx", count: "6", title: "Developer Tools", tagline: "JSON, Base64 & Formatters", desc: "Essential utilities for developers including JSON formatters, Base64 encoders, and decoders.", ph: "Search 6+ developer tools..." },
  "business": { path: "src/app/business/page.tsx", count: "45", title: "Business Tools", tagline: "ROI, Margin & Growth", desc: "Calculate ROI, profit margins, and track growth metrics to run your business effectively.", ph: "Search 45+ business tools..." },
  "finance": { path: "src/app/finance/page.tsx", count: "20", title: "Finance Tools", tagline: "Loans, Savings & Taxes", desc: "Professional calculators for loans, mortgages, savings, and personal tax planning.", ph: "Search 20+ finance tools..." },
  "productivity": { path: "src/app/productivity/page.tsx", count: "80", title: "Productivity Tools", tagline: "Timers, Planners & Trackers", desc: "Boost your workflow with Pomodoro timers, planners, and task tracking utilities.", ph: "Search 80+ productivity tools..." },
  "games": { path: "src/app/games/page.tsx", count: "10", title: "Games", tagline: "Casual, Logic & Puzzles", desc: "Relax with browser-based casual games, logic puzzles, and brain teasers.", ph: "Search 10+ games..." },
  "education": { path: "src/app/education/page.tsx", count: "150", title: "Education Tools", tagline: "GPA, Grades & Study", desc: "Academic calculators for GPA, grading, flashcards, and student study planning.", ph: "Search 150+ education tools..." },
  "3d": { path: "src/app/3d/page.tsx", count: "15", title: "3D Tools", tagline: "Viewers, Converters & Models", desc: "Browser-based 3D model viewers, format converters, and spatial utilities.", ph: "Search 15+ 3D tools..." },
  "cad": { path: "src/app/cad/page.tsx", count: "3", title: "CAD Tools", tagline: "Viewers, DXF & Measure", desc: "Essential utilities for viewing, measuring, and converting CAD and DXF files.", ph: "Search 3+ CAD tools..." },
  "fitness": { path: "src/app/fitness/page.tsx", count: "6", title: "Fitness Tools", tagline: "BMI, Macros & Calories", desc: "Track your health with BMI calculators, macro trackers, and calorie estimators.", ph: "Search 6+ fitness tools..." },
  "music": { path: "src/app/music/page.tsx", count: "30", title: "Music Tools", tagline: "BPM, Scales & Tuners", desc: "Essential tools for musicians including BPM counters, scale references, and online tuners.", ph: "Search 30+ music tools..." },
  "data": { path: "src/app/data/page.tsx", count: "10", title: "Data Tools", tagline: "CSV, JSON & Convert", desc: "Clean, convert, and format data across CSV, JSON, and XML formats instantly.", ph: "Search 10+ data tools..." },
  "engineering": { path: "src/app/engineering/page.tsx", count: "15", title: "Engineering Tools", tagline: "Units, Forces & Materials", desc: "Technical calculators for unit conversions, material properties, and engineering formulas.", ph: "Search 15+ engineering tools..." },
  "travel": { path: "src/app/travel/page.tsx", count: "25", title: "Travel Tools", tagline: "Currency, Time & Distance", desc: "Plan your trips with currency converters, time zone calculators, and distance metrics.", ph: "Search 25+ travel tools..." },
  "crypto": { path: "src/app/crypto/page.tsx", count: "100", title: "Crypto Tools", tagline: "Convert, Hash & Track", desc: "Essential utilities for crypto conversion, hashing, and blockchain tracking.", ph: "Search 100+ crypto tools..." },
  "security": { path: "src/app/security/page.tsx", count: "5", title: "Security Tools", tagline: "Passwords, Hashes & Keys", desc: "Generate secure passwords, hash data, and manage keys safely in your browser.", ph: "Search 5+ security tools..." },
  "flowchart": { path: "src/app/flowchart/page.tsx", count: "110", title: "Diagram Tools", tagline: "Flowcharts, Trees & Nodes", desc: "Build flowcharts, mind maps, and node diagrams with our intuitive visual tools.", ph: "Search 110+ diagram tools..." },
  "presentation": { path: "src/app/presentation/page.tsx", count: "190", title: "Presentation Tools", tagline: "Slides, Timers & Prompters", desc: "Everything you need for presentations, from slide timers to teleprompters.", ph: "Search 190+ presentation tools..." },
  "maps": { path: "src/app/maps/page.tsx", count: "160", title: "Maps", tagline: "Routes, Distance & Geo", desc: "Explore geographical tools for route planning, distance measuring, and map coordinates.", ph: "Search 160+ map tools..." },
};

function generateHero(info) {
  return `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            ${info.count}+ Free ${info.title} —{" "}
            <span className="hero-gradient-text">${info.tagline}</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            ${info.desc} No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="${info.ph}"
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search ${info.title}"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
}

function processFile(filePath, info) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the block containing <h1 ... </h1>
  // The hero is usually wrapped in a <section> or a <div>
  const h1Match = content.match(/<h1[\s\S]*?<\/h1>/);
  if (!h1Match) {
    console.error(`No <h1> found in ${filePath}`);
    return false;
  }
  
  const h1Index = h1Match.index;
  // find the closest <section> or <div className="...text-center..."> before h1
  // Simple heuristic: search backwards from h1Index
  const beforeH1 = content.substring(0, h1Index);
  let parentStartMatch = beforeH1.match(/<(section|div)[^>]*?text-center[^>]*?>[^<]*$/);
  
  if (!parentStartMatch) {
      parentStartMatch = beforeH1.match(/<section[^>]*?>[^<]*$/);
  }
  
  if (!parentStartMatch) {
    console.log(`Could not definitively find parent hero block for ${filePath}. Replacing manually...`);
    // Fallback: just replace the <h1 ... <p ...> block with the new content, dropping the old tags
    // This is riskier but might work if the parent is e.g. <main>
    return false;
  }
  
  const startIndex = parentStartMatch.index;
  const tagType = parentStartMatch[1]; // 'section' or 'div'
  
  // Find the matching closing tag
  let depth = 1;
  let endIndex = -1;
  const openRegex = new RegExp(`<${tagType}(?:\\s|>)`, 'g');
  const closeRegex = new RegExp(`</${tagType}>`, 'g');
  
  const remaining = content.substring(startIndex + parentStartMatch[0].length);
  // parse remaining to find balanced closing tag
  let i = 0;
  while(i < remaining.length) {
    if (remaining.startsWith(`<${tagType} `, i) || remaining.startsWith(`<${tagType}>`, i)) {
        depth++;
    } else if (remaining.startsWith(`</${tagType}>`, i)) {
        depth--;
        if (depth === 0) {
            endIndex = startIndex + parentStartMatch[0].length + i + `</${tagType}>`.length;
            break;
        }
    }
    i++;
  }
  
  if (endIndex === -1) {
    console.error(`Could not find closing tag for ${filePath}`);
    return false;
  }
  
  const newContent = content.substring(0, startIndex) + generateHero(info) + content.substring(endIndex);
  
  // Add Search import if not present
  let finalContent = newContent;
  if (!finalContent.includes('lucide-react')) {
      finalContent = `import { Search } from "lucide-react";\n` + finalContent;
  } else if (!finalContent.includes('Search')) {
      finalContent = finalContent.replace(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?/, (match, p1) => {
          return `import { Search, ${p1.trim()} } from "lucide-react";`;
      });
  }
  
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log(`Updated ${filePath}`);
  return true;
}

const failed = [];
for (const [key, info] of Object.entries(data)) {
  const fullPath = path.join(process.cwd(), info.path);
  if (!processFile(fullPath, info)) {
    failed.push(key);
  }
}

if (failed.length > 0) {
    console.log("Failed categories:", failed);
} else {
    console.log("Successfully updated all reachable files.");
}
