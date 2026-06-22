"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Blocks } from "lucide-react";

interface CementResult {
  totalVolume: number;
  cementBags: number; // 50kg bags
  sandWeight: number; // kg
  aggregateWeight: number; // kg
  waterVolume: number; // Liters
  isError: boolean;
  errorMsg?: string;
}

const calculateCement = (
  volumeStr: string,
  mixRatio: string // "1:1.5:3", "1:2:4", "1:3:6", "1:4:8"
): CementResult | null => {
  const volumeCuM = parseFloat(volumeStr);

  if (isNaN(volumeCuM) || volumeCuM <= 0) return null;

  try {
    // Wet volume to Dry volume factor is roughly 1.54 (add 54% for voids and shrinkage)
    const dryVolume = volumeCuM * 1.54;

    // Parse Mix Ratio (Cement : Sand : Aggregate)
    const parts = mixRatio.split(":").map(p => parseFloat(p));
    const cPart = parts[0];
    const sPart = parts[1];
    const aPart = parts[2];
    const totalParts = cPart + sPart + aPart;

    // Volume of each component in cubic meters
    const cementVol = (cPart / totalParts) * dryVolume;
    const sandVol = (sPart / totalParts) * dryVolume;
    const aggVol = (aPart / totalParts) * dryVolume;

    // Densities (approximate standard kg/m^3)
    const cementDensity = 1440;
    const sandDensity = 1600; // River sand
    const aggDensity = 1500; // Crushed stone

    // Weights in kg
    const cementWeight = cementVol * cementDensity;
    const sandWeight = sandVol * sandDensity;
    const aggWeight = aggVol * aggDensity;

    // A standard bag of cement is 50kg
    const bags = Math.ceil(cementWeight / 50);

    // Water-Cement Ratio. Usually ~0.5 for standard mixes, meaning water weight is 50% of cement weight.
    // 1 kg of water = 1 Liter.
    let wcr = 0.5;
    if (mixRatio === "1:1.5:3") wcr = 0.45; // stronger mix, less water
    if (mixRatio === "1:4:8") wcr = 0.6; // weaker mix, more water

    const waterVolume = cementWeight * wcr;

    return {
      totalVolume: parseFloat(volumeCuM.toFixed(2)),
      cementBags: bags,
      sandWeight: parseFloat(sandWeight.toFixed(1)),
      aggregateWeight: parseFloat(aggWeight.toFixed(1)),
      waterVolume: parseFloat(waterVolume.toFixed(1)),
      isError: false
    };

  } catch (err) {
    return { totalVolume: 0, cementBags: 0, sandWeight: 0, aggregateWeight: 0, waterVolume: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const CementCalculator = () => {
  const [volume, setVolume] = useState("1"); // Cubic Meters
  const [mix, setMix] = useState("1:2:4");

  const [result, setResult] = useState<CementResult | null>(null);

  const calculate = () => {
    setResult(calculateCement(volume, mix));
  };

  useEffect(() => { calculate(); }, [volume, mix]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between Cement and Concrete?", answer: "These terms are often used interchangeably, but they are very different. Concrete is the final, hardened building material. Cement is just the grey powder that acts as the 'glue' to bind the sand and rocks together to make the concrete. You cannot build a wall out of just cement; it would crack and crumble." },
    { question: "What do the Mix Ratios mean?", answer: "A mix ratio (like 1:2:4) represents the volumetric proportions of the dry ingredients needed to make concrete. The order is always (Cement : Sand : Aggregate/Gravel). So a 1:2:4 mix means you use 1 bucket of cement, 2 buckets of sand, and 4 buckets of gravel." },
    { question: "Why is M20 (1:1.5:3) used so often?", answer: "M20 grade concrete (1 part cement, 1.5 parts sand, 3 parts aggregate) is the standard mix for residential house construction, slabs, and load-bearing columns. It provides a compressive strength of 20 MPa (megapascals) after 28 days of curing, which is incredibly strong and durable." },
    { question: "Why do we multiply by 1.54?", answer: "Dry materials contain a lot of air voids (empty space between the grains of sand and rocks). When you add water and mix it, the cement paste fills those voids, causing the overall physical volume to shrink dramatically. To get 1 cubic meter of wet concrete, you actually have to start with about 1.54 cubic meters of dry materials." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Cement Mix Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cement Mix Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Total Wet Volume</span>
                <span className="text-xs text-muted-foreground font-normal self-end">Cubic Meters (m³)</span>
              </label>
              <div className={wrap}><input type="number" value={volume} onChange={e => setVolume(e.target.value)} className={ci} min="0.1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Enter the final volume of poured concrete you need.</p>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Mix Proportion (Grade)</span>
              </label>
              <div className="flex flex-col gap-2 rounded-md border border-input p-1 bg-background">
                <button type="button" onClick={() => setMix("1:1.5:3")} className={`py-2 px-3 text-sm font-bold flex flex-col items-start rounded transition-colors text-left ${mix === "1:1.5:3" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  <span>M20 (1 : 1.5 : 3)</span>
                  <span className={`text-xs font-normal ${mix === "1:1.5:3" ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>Strong: Slabs, Beams, Columns</span>
                </button>
                <button type="button" onClick={() => setMix("1:2:4")} className={`py-2 px-3 text-sm font-bold flex flex-col items-start rounded transition-colors text-left ${mix === "1:2:4" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  <span>M15 (1 : 2 : 4)</span>
                  <span className={`text-xs font-normal ${mix === "1:2:4" ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>Standard: Foundations, Pavements</span>
                </button>
                <button type="button" onClick={() => setMix("1:3:6")} className={`py-2 px-3 text-sm font-bold flex flex-col items-start rounded transition-colors text-left ${mix === "1:3:6" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  <span>M10 (1 : 3 : 6)</span>
                  <span className={`text-xs font-normal ${mix === "1:3:6" ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>Mass Concrete: Pathways, non-structural</span>
                </button>
                <button type="button" onClick={() => setMix("1:4:8")} className={`py-2 px-3 text-sm font-bold flex flex-col items-start rounded transition-colors text-left ${mix === "1:4:8" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  <span>M7.5 (1 : 4 : 8)</span>
                  <span className={`text-xs font-normal ${mix === "1:4:8" ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>Lean Mix: Base courses, leveling</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Blocks className="h-5 w-5" /> Calculate Raw Materials
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter a valid positive volume.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Cement Required</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.cementBags}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase mt-1">Standard 50kg Bags</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.totalVolume} <span className="text-sm font-normal text-muted-foreground">m³</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Dry Materials Required</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Sand (Fine Agg.)</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sandWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Kilograms (kg)</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-600">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Gravel (Coarse Agg.)</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.aggregateWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Kilograms (kg)</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-blue-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Water Estimate</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.waterVolume.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Liters (L)</div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Calculation Logic (Metric)</h3>
                <ul className="space-y-3 font-mono text-sm">
                  <li className="flex items-start gap-2 text-muted-foreground border-b border-border/50 pb-2">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">1.</span> 
                    <span>Wet to Dry Volume Conversion:<br/><span className="text-foreground">Wet Vol × 1.54 = Dry Vol</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground border-b border-border/50 pb-2">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">2.</span> 
                    <span>Part Vol = (Ratio Part / Total Parts) × Dry Vol</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground border-b border-border/50 pb-2">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">3.</span> 
                    <span>Weight = Part Vol × Material Density<br/><span className="text-xs">(Cement=1440, Sand=1600, Agg=1500 kg/m³)</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">4.</span> 
                    <span>Cement Bags = Total Cement Weight / 50kg</span>
                  </li>
                </ul>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Cement vs. Concrete: The Ultimate Misconception</h2>
            <p>One of the most common mistakes in DIY construction is confusing cement with concrete. <strong>Cement</strong> is merely an ingredient. It is a fine, grey powder (usually Portland cement) made from burning limestone and clay in a massive kiln. <strong>Concrete</strong> is the rock-solid final product. Concrete is created by mixing cement powder with water, sand, and gravel.</p>
            <p>You cannot pour a sidewalk using just cement and water. Without the structural integrity of the rocks and sand, the dried cement paste would have very little strength and would immediately crack into pieces under any pressure.</p>

            <h2>The Magic Numbers: 1.54 and 1.33</h2>
            <p>When you look at a pile of dry sand and dry gravel, there is an enormous amount of empty air space between the individual rocks and grains. When you add water and cement paste, it acts as a liquid and completely fills in all of those invisible air voids.</p>
            <p>Because the empty space is filled, the physical pile dramatically shrinks in size when wet. To create exactly 1.0 cubic meters of wet, poured concrete, you must start with roughly <strong>1.54 cubic meters of dry materials</strong>. If you are only mixing mortar (just cement and sand, no gravel), the shrinkage is slightly less, requiring a multiplier of roughly 1.33.</p>

            <h2>Understanding Mix Ratios (Grades)</h2>
            <p>Concrete strength is primarily determined by the ratio of the ingredients. Around the world, these ratios are stated as <strong>Cement : Sand : Aggregate</strong>.</p>
            <ul>
              <li><strong>M20 (1 : 1.5 : 3):</strong> A very strong, dense mix. This is the global standard for pouring structural house slabs, load-bearing columns, and reinforced beams. After 28 days of curing, it can withstand 20 megapascals of crushing pressure.</li>
              <li><strong>M15 (1 : 2 : 4):</strong> A standard, general-purpose mix. Used for basic foundations, heavy-duty driveways, and pavements.</li>
              <li><strong>M10 (1 : 3 : 6):</strong> A weaker, "mass concrete" mix. Used where immense strength isn't required, such as non-load-bearing pathways, patio bases, or heavy retaining walls that rely on sheer weight rather than tensile strength.</li>
              <li><strong>M7.5 (1 : 4 : 8):</strong> Known as a "lean mix." It is primarily used to pour a thin, 2-inch leveling course directly onto dirt before pouring the actual structural foundation on top of it.</li>
            </ul>

            <h2>The Water-Cement Ratio</h2>
            <p>The biggest mistake amateurs make is adding too much water. More water makes the concrete easier to pour and shovel, but it permanently destroys the chemical strength of the final cure. A standard water-to-cement ratio is 0.5 (by weight), meaning you use 1 kg of water for every 2 kg of cement. Adding excess water creates tiny microscopic bubbles in the cured concrete, resulting in a weak, flaky, and cracking slab.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cement-calculator" />
          <PopularCalculators exclude="/calculator/cement-calculator" />
        </div>
      </div>
    </>
  );
};
export default CementCalculator;
