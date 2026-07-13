"use client";
import { RotateCcw, Package, Layers, ArrowDown, AlertTriangle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const baseImages = [
  { id: "alpine", name: "Alpine Linux", size: 5 },
  { id: "ubuntu", name: "Ubuntu", size: 75 },
  { id: "debian", name: "Debian Slim", size: 30 },
  { id: "node-alpine", name: "Node.js (Alpine)", size: 40 },
  { id: "node", name: "Node.js (Standard)", size: 350 },
  { id: "python-slim", name: "Python (Slim)", size: 45 },
  { id: "python", name: "Python (Standard)", size: 300 },
];

const commonPackages = [
  { id: "build-essential", name: "Build Tools (gcc, make)", size: 150 },
  { id: "git", name: "Git", size: 15 },
  { id: "curl", name: "Curl", size: 5 },
  { id: "python3", name: "Python 3", size: 50 },
  { id: "nodejs", name: "Node.js", size: 30 },
  { id: "ffmpeg", name: "FFmpeg", size: 100 },
];

const DockerImageSizeCalculator = () => {
  const [selectedBase, setSelectedBase] = useState(baseImages[0].id);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [customFilesMB, setCustomFilesMB] = useState("10");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const togglePackage = (pkgId: string) => {
    setSelectedPackages(prev => 
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleCalculate = () => {
    setShowResults(true);
    const base = baseImages.find(b => b.id === selectedBase) || baseImages[0];
    const baseSize = base.size;

    let pkgsSize = 0;
    const pkgsList: any[] = [];
    selectedPackages.forEach(pkgId => {
      const pkg = commonPackages.find(p => p.id === pkgId);
      if (pkg) {
        pkgsSize += pkg.size;
        pkgsList.push(pkg);
      }
    });

    const customSize = parseFloat(customFilesMB) || 0;
    
    // Docker layer overhead (approx 5% per major layer)
    const overhead = (baseSize + pkgsSize + customSize) * 0.05;
    
    const totalSize = baseSize + pkgsSize + customSize + overhead;

    setResults({
      totalSize,
      baseSize,
      pkgsSize,
      customSize,
      overhead,
      pkgsList,
      isHeavy: totalSize > 250
    });
  };

  const reset = () => {
    setSelectedBase(baseImages[0].id);
    setSelectedPackages([]);
    setCustomFilesMB("10");
  };

  const faqs = [
    { question: "Why is Alpine Linux so small?", answer: "Alpine Linux is built around musl libc and busybox. This makes it much smaller and more resource-efficient than traditional GNU/Linux distributions like Ubuntu, while still providing a complete runtime environment." },
    { question: "What makes Docker images large?", answer: "Large images are typically caused by heavy base images (like full Ubuntu), installing build tools that are only needed during compilation, and copying unnecessary files (like source code, test suites, or node_modules) into the final production layer." },
    { question: "What is a multi-stage build?", answer: "A multi-stage build allows you to use one large Docker image to compile your code (installing all heavy dependencies), and then copy only the final compiled artifact into a tiny, fresh base image for production. This drastically reduces the final image size." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Docker Image Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Docker Image Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Layers className="h-5 w-5 text-primary" /> Image Configuration
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Base Image</label>
                    <div className="grid grid-cols-1 gap-2">
                       {baseImages.map(base => (
                          <button 
                            key={base.id} 
                            onClick={() => setSelectedBase(base.id)}
                            className={`flex justify-between items-center p-3 rounded-lg border text-sm transition-colors ${selectedBase === base.id ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-secondary/10 border-border text-foreground hover:border-primary/30'}`}
                          >
                             <span>{base.name}</span>
                             <span className="text-xs">{base.size} MB</span>
                          </button>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Package className="h-3 w-3" /> System Packages</label>
                    <div className="flex flex-wrap gap-2">
                       {commonPackages.map(pkg => (
                          <button 
                            key={pkg.id} 
                            onClick={() => togglePackage(pkg.id)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selectedPackages.includes(pkg.id) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-secondary border-border text-muted-foreground hover:border-muted'}`}
                          >
                             {pkg.name} (+{pkg.size}MB)
                          </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Your App Code & Assets</label>
                    <div className="relative">
                      <input type="number" value={customFilesMB} onChange={(e) => setCustomFilesMB(e.target.value)} className="input-calc" min="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">MB</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </section>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">
                     <ArrowDown className="h-5 w-5 text-primary" /> Size Breakdown
                  </h2>
                  
                  <div className="p-6 rounded-2xl bg-secondary/10 border border-border text-center mb-6">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated Image Size</p>
                     <p className="text-5xl font-black text-foreground">{results.totalSize.toFixed(0)} <span className="text-2xl font-normal text-muted-foreground">MB</span></p>
                  </div>

                  <div className="space-y-4 flex-1">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base OS Image</span>
                        <span className="font-bold">{results.baseSize} MB</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Installed Packages</span>
                        <span className="font-bold">{results.pkgsSize} MB</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">App & Assets</span>
                        <span className="font-bold">{results.customSize} MB</span>
                     </div>
                     <div className="flex justify-between text-sm pb-4 border-b border-border">
                        <span className="text-muted-foreground">Layer Overhead (~5%)</span>
                        <span className="font-bold">{results.overhead.toFixed(1)} MB</span>
                     </div>
                     
                     {results.isHeavy && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-xl text-sm flex items-start gap-2 mt-4">
                          <AlertTriangle className="h-5 w-5 shrink-0" />
                          <div>
                            <strong>Large Image Warning</strong>
                            <p className="mt-1 opacity-90">Images over 250MB increase deployment time and bandwidth costs. Consider using an Alpine base image or Multi-stage builds to exclude build tools.</p>
                          </div>
                        </div>
                     )}
                  </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Optimizing Docker Images</h2>
              <p>In the world of containerization, size matters. Smaller Docker images deploy faster, consume less network bandwidth, boot up quicker, and present a smaller attack surface for security vulnerabilities.</p>
              
              <h3>Choose the Right Base</h3>
              <p>The easiest way to reduce image size is by starting small. A standard `node:18` image is over 300MB because it includes hundreds of system libraries and utilities you likely won't use. Swapping to `node:18-alpine` reduces the base size to around 40MB.</p>

              <h3>Beware of Build Tools</h3>
              <p>If your application requires compiling native extensions (like certain Python packages or Node.js modules), you need heavy tools like `gcc` and `make`. However, these tools are only needed during the build process, not when the app is running. Using Docker Multi-stage builds allows you to compile your code in a heavy container, and then copy the compiled files into a fresh, tiny container, leaving the massive build tools behind.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/docker-image-size" />
          <PopularCalculators exclude="/calculator/docker-image-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default DockerImageSizeCalculator;

