"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Shirt } from "lucide-react"; // Using Shirt as a proxy for clothing size

interface BraResult {
  bandSize: string;
  cupSize: string;
  fullSize: string;
  sisterSizeDown: string;
  sisterSizeUp: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateBraSize = (
  unit: string,
  underbustStr: string,
  bustStr: string
): BraResult | null => {
  const underbustRaw = parseFloat(underbustStr);
  const bustRaw = parseFloat(bustStr);

  if (isNaN(underbustRaw) || isNaN(bustRaw) || underbustRaw <= 0 || bustRaw <= 0) return null;

  try {
    let underbust = underbustRaw;
    let bust = bustRaw;

    // Convert cm to inches for the standard US calculation
    if (unit === "cm") {
      underbust = underbustRaw / 2.54;
      bust = bustRaw / 2.54;
    }

    // Modern US Sizing Method (+0 or +4 method)
    // We will use the traditional +4/+5 method as it is highly prevalent in standard US retail, 
    // but the modern "A Bra That Fits" method (+0) is preferred by enthusiasts. 
    // Let's use a hybrid or the standard +0 method for accuracy.
    // +0 Method:
    // Band Size = underbust rounded to nearest even number.
    let bandSizeNum = Math.round(underbust);
    if (bandSizeNum % 2 !== 0) {
      bandSizeNum += 1; // Round up to nearest even
    }

    // Cup Size = Bust - Band Size
    const cupDifference = Math.round(bust - bandSizeNum);

    if (cupDifference < 0) {
      return { bandSize: "", cupSize: "", fullSize: "", sisterSizeDown: "", sisterSizeUp: "", isError: true, errorMsg: "Bust measurement cannot be smaller than band measurement." };
    }

    const cups = ["AA", "A", "B", "C", "D", "DD", "DDD", "G", "H", "I", "J", "K", "L", "M"];
    
    let cupIndex = cupDifference;
    if (cupIndex >= cups.length) cupIndex = cups.length - 1;

    const cupSize = cups[cupIndex] || "AA";

    const fullSize = `${bandSizeNum}${cupSize}`;

    // Sister Sizes (Up a band, down a cup OR down a band, up a cup)
    let sisterDown = "N/A";
    if (bandSizeNum > 28 && cupIndex < cups.length - 1) {
      sisterDown = `${bandSizeNum - 2}${cups[cupIndex + 1]}`;
    }

    let sisterUp = "N/A";
    if (cupIndex > 0) {
      sisterUp = `${bandSizeNum + 2}${cups[cupIndex - 1]}`;
    }

    return {
      bandSize: bandSizeNum.toString(),
      cupSize: cupSize,
      fullSize: fullSize,
      sisterSizeDown: sisterDown,
      sisterSizeUp: sisterUp,
      isError: false
    };

  } catch (err) {
    return { bandSize: "", cupSize: "", fullSize: "", sisterSizeDown: "", sisterSizeUp: "", isError: true, errorMsg: "Calculation error." };
  }
};

const BraSizeCalculator = () => {
  const [unit, setUnit] = useState("inches");
  const [underbust, setUnderbust] = useState("31.5");
  const [bust, setbust] = useState("35");

  const [result, setResult] = useState<BraResult | null>(null);

  const calculate = () => {
    setResult(calculateBraSize(unit, underbust, bust));
  };

  useEffect(() => { calculate(); }, [unit, underbust, bust]);

  const handleUnitChange = (newUnit: "inches" | "cm") => {
    setUnit(newUnit);
    if (newUnit === "inches") {
      setUnderbust("31.5"); setbust("35");
    } else {
      setUnderbust("80"); setbust("89");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What is a 'Sister Size'?", answer: "Cup sizes are not static volumes; they scale with the band size. The cup on a 36C holds more volume than the cup on a 32C. If you try on a 34C and the band is too tight but the cups fit perfectly, you cannot simply go up to a 36C (the cups will be too big). You must 'Sister Size' by going up a band and down a cup: try a 36B." },
    { question: "Why do my measurements result in the wrong size at Victoria's Secret?", answer: "Many massive retail chains use the outdated '+4 Method'. This was invented in the 1930s when fabrics were stiff and had no elastic stretch. You had to add 4 inches to your underbust to mathematically create breathing room. Modern fabrics have spandex, meaning your true underbust measurement IS your band size. Retailers still use the +4 method to artificially squeeze more women into a very limited range of stock sizes (like 32-38 A-DD)." },
    { question: "How do I measure properly?", answer: "You must take two measurements using a soft measuring tape. First, the 'Underbust': measure snugly directly underneath your breasts where the band will sit. Second, the 'Standing Bust': measure loosely around the fullest part of your breasts while standing up straight. For the most accurate result, take these measurements while completely braless." },
    { question: "Why does the Cup Size change so wildly?", answer: "The cup letter is simply a mathematical difference. In the modern US system, every 1-inch difference between your Bust and Underbust equals one cup letter. A 1-inch difference is an A. A 3-inch difference is a C. A 5-inch difference is a DD." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Bra Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bra Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full mb-3">
                <button type="button" onClick={() => handleUnitChange("inches")} className={`flex-1 text-sm font-bold transition-colors ${unit === "inches" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Inches (US)</button>
                <button type="button" onClick={() => handleUnitChange("cm")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "cm" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Centimeters (CM)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Snug Underbust</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "inches" ? "in" : "cm"}</span>
              </label>
              <div className={wrap}><input type="number" value={underbust} onChange={e => setUnderbust(e.target.value)} className={ci} min="10" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Measure directly underneath where the band sits.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Standing Bust</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "inches" ? "in" : "cm"}</span>
              </label>
              <div className={wrap}><input type="number" value={bust} onChange={e => setbust(e.target.value)} className={ci} min="10" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Measure loosely around the fullest part of the chest.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Estimated US Size</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.fullSize}
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Cup Letter</div>
                  <div className="text-3xl font-bold text-foreground font-mono">{result.cupSize}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Sister Sizes (Alternative Fits)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">If Band is Too Tight</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sisterSizeDown}</div>
                    <div className="text-xs text-muted-foreground mt-1">Up a band, down a cup</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">If Band is Too Loose</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sisterSizeUp}</div>
                    <div className="text-xs text-muted-foreground mt-1">Down a band, up a cup</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed border-t border-border/50 pt-4">
                  * Note: Because cup volume scales with band size, your "Sister Sizes" hold the exact same physical breast volume as your estimated size, just with a different band length.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Sizing</h2>
            <p>It is estimated that over 70% of women are wearing the wrong size. This massive statistical error is not due to bad measurements, but rather terrible mathematics forced upon the market by major clothing retailers.</p>
            <p>The modern, mathematically accurate system (often referred to online as the <em>A Bra That Fits</em> method) relies on a simple +0 formula:</p>
            <ol>
              <li><strong>Band Size:</strong> Your snug underbust measurement, rounded to the nearest even number.</li>
              <li><strong>Cup Size:</strong> The mathematical difference between your Bust and your Band. Every 1-inch difference is a cup letter (1" = A, 2" = B, 3" = C, 4" = D, 5" = DD).</li>
            </ol>

            <h2 className="text-2xl font-bold mb-3">The "+4" Retail Scam</h2>
            <p>If the math is so simple, why is everyone wearing the wrong size? The answer is the outdated <strong>+4 Method</strong>. In the 1930s, fabrics did not have elastic or spandex. If your ribs measured 32 inches, and you put on a 32-inch band made of stiff, unyielding fabric, you wouldn't be able to breathe. To solve this, manufacturers told women to mathematically add 4 inches to their underbust measurement to create breathing room.</p>
            <p>Today, fabrics are incredibly stretchy. A modern 32-inch band can easily stretch to 34 or 35 inches. However, massive retail chains continue to use the +4 method in their fitting rooms. Why? Because it is cheaper for their supply chain. It is incredibly expensive to manufacture a massive matrix of sizes (from 28A to 40K). It is much cheaper to only manufacture sizes 32 to 38 in cups A to DD.</p>
            <p>If a woman walks into a store with a 28-inch underbust and a 34-inch bust, the +0 math says she is a <strong>28E</strong>. The store doesn't sell that size. So, the clerk uses the +4 method (28 + 4 = 32 band). Now the difference between the 34 bust and the 32 band is only 2 inches. The clerk sells her a <strong>32B</strong>. The store makes a sale, but the customer goes home with a band that is 4 inches too big and provides absolutely no support.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bra-size-calculator" />
          <PopularCalculators exclude="/calculator/bra-size-calculator" />
        </div>
      </div>
    </>
  );
};
export default BraSizeCalculator;
