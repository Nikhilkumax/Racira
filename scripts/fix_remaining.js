const fs = require('fs');

function applyFix(file, replaceFunc) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = replaceFunc(content);
    
    // Add Search import if not present
    if (content.indexOf('lucide-react') !== -1 && content.indexOf('Search') === -1) {
      content = content.replace(/import\s+{([^}]*)}\s+from\s+["']lucide-react["'];?/, (match, p1) => {
        return `import { Search, ${p1.trim()} } from "lucide-react";`;
      });
    } else if (content.indexOf('lucide-react') === -1) {
      content = `import { Search } from "lucide-react";\n` + content;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  } catch (e) {
    console.error('Error on ' + file, e.message);
  }
}

// 1. Typography
applyFix("src/app/typography/page.tsx", (content) => {
  const start = content.indexOf('<section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              20+ Free Typography Tools —{" "}
              <span className="hero-gradient-text">Fonts, Scales & Pairings</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Find perfect font pairings, generate modular scales, and preview typography instantly. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 20+ typography tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Typography Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 2. Photo
applyFix("src/app/photo/page.tsx", (content) => {
  const start = content.indexOf('<section className="border-b">');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              10+ Free Photo Tools —{" "}
              <span className="hero-gradient-text">Filters, Retouch & Adjust</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Apply filters, adjust lighting, and retouch your photos right in the browser. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="Search 10+ photo tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Photo Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 3. Audio
applyFix("src/app/audio/page.tsx", (content) => {
  const start = content.indexOf('<section className="relative overflow-hidden"');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              270+ Free Audio Tools —{" "}
              <span className="hero-gradient-text">Trim, Merge & Convert</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Edit, merge, trim, and convert audio files with professional-grade sound utilities. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search 270+ audio tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Audio Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 4. Voice
applyFix("src/app/voice/page.tsx", (content) => {
  const start = content.indexOf('<TTSHero />');
  if (start === -1) throw new Error('Cannot find TTSHero');
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Voice Tools —{" "}
            <span className="hero-gradient-text">Record, Pitch & Modulate</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browser-based tools to record, change pitch, and modulate your voice securely. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ voice tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Voice Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(start + '<TTSHero />'.length);
});

// 5. Developers
applyFix("src/app/developers/page.tsx", (content) => {
  const start = content.indexOf('<section className="py-12 sm:py-16 text-center">');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            6+ Free Developer Tools —{" "}
            <span className="hero-gradient-text">JSON, Base64 & Formatters</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential utilities for developers including JSON formatters, Base64 encoders, and decoders. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 6+ developer tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Developer Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 6. Finance
applyFix("src/app/finance/page.tsx", (content) => {
  const start = content.indexOf('<section className="relative overflow-hidden"');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            20+ Free Finance Tools —{" "}
            <span className="hero-gradient-text">Loans, Savings & Taxes</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Professional calculators for loans, mortgages, savings, and personal tax planning. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 20+ finance tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Finance Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 7. Productivity
applyFix("src/app/productivity/page.tsx", (content) => {
  const start = content.indexOf('<section className="relative overflow-hidden">');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            80+ Free Productivity Tools —{" "}
            <span className="hero-gradient-text">Timers, Planners & Trackers</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Boost your workflow with Pomodoro timers, planners, and task tracking utilities. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="Search 80+ productivity tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Productivity Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 8. 3D
applyFix("src/app/3d/page.tsx", (content) => {
  const start = content.indexOf('<section className="px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-20">');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  if (start === -1) throw new Error('Cannot find start');
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            15+ Free 3D Tools —{" "}
            <span className="hero-gradient-text">Viewers, Converters & Models</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browser-based 3D model viewers, format converters, and spatial utilities. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 15+ 3D tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search 3D Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 9. Insight (Data)
applyFix("src/app/insight/page.tsx", (content) => {
  const start = content.indexOf('<section className="py-16 md:py-24 lg:py-32 bg-dot-black/[0.05]');
  if (start === -1) {
      // let's try just finding the first <section
      const startFallback = content.indexOf('<section');
      if (startFallback === -1) throw new Error('Cannot find start');
      const endFallback = content.indexOf('</section>', startFallback) + '</section>'.length;
      
      const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Data Tools —{" "}
            <span className="hero-gradient-text">CSV, JSON & Convert</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Clean, convert, and format data across CSV, JSON, and XML formats instantly. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ data tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Data Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
      return content.substring(0, startFallback) + newHero + content.substring(endFallback);
  } else {
      const end = content.indexOf('</section>', start) + '</section>'.length;
      const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Data Tools —{" "}
            <span className="hero-gradient-text">CSV, JSON & Convert</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Clean, convert, and format data across CSV, JSON, and XML formats instantly. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ data tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Data Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
      return content.substring(0, start) + newHero + content.substring(end);
  }
});

// 10. Engineering
applyFix("src/app/engineering/page.tsx", (content) => {
  const start = content.indexOf('<section');
  if (start === -1) throw new Error('Cannot find start');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            15+ Free Engineering Tools —{" "}
            <span className="hero-gradient-text">Units, Forces & Materials</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Technical calculators for unit conversions, material properties, and engineering formulas. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 15+ engineering tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Engineering Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 11. Security
applyFix("src/app/security/page.tsx", (content) => {
  const start = content.indexOf('<section');
  if (start === -1) throw new Error('Cannot find start');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            5+ Free Security Tools —{" "}
            <span className="hero-gradient-text">Passwords, Hashes & Keys</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Generate secure passwords, hash data, and manage keys safely in your browser. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 5+ security tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Security Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});

// 12. Maps
applyFix("src/app/maps/page.tsx", (content) => {
  const start = content.indexOf('<section');
  if (start === -1) throw new Error('Cannot find start');
  const end = content.indexOf('</section>', start) + '</section>'.length;
  const newHero = `      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            160+ Free Map Tools —{" "}
            <span className="hero-gradient-text">Routes, Distance & Geo</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore geographical tools for route planning, distance measuring, and map coordinates. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 160+ map tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Map Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>`;
  return content.substring(0, start) + newHero + content.substring(end);
});
