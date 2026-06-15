"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Shovel } from "lucide-react";

interface GravelResult {
  cubicYards: number;
  tons: number;
  cubicFeet: number;
  bags50lb: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateGravel = (
  lengthStr: string,
  widthStr: string,
  depthStr: string, // inches
  rockType: string // "standard", "river", "lava", "sand"
): GravelResult | null => {
  const l = parseFloat(lengthStr);
  const w = parseFloat(widthStr);
  const d = parseFloat(depthStr);

  if (isNaN(l) || isNaN(w) || isNaN(d) || l <= 0 || w <= 0 || d <= 0) return null;

  try {
    // Standard volume calc
    const areaSqFt = l * w;
    const depthFt = d / 12;
    const cuFt = areaSqFt * depthFt;
    const cuYards = cuFt / 27;

    // Density mapping (approximate tons per cubic yard)
    // Standard crushed stone/gravel: ~1.4 tons/yd
    // River rock: ~1.35 tons/yd
    // Lava rock (very light): ~0.8 tons/yd
    // Sand (wet): ~1.5 tons/yd
    let density = 1.4;
    if (rockType === "river") density = 1.35;
    else if (rockType === "lava") density = 0.8;
    else if (rockType === "sand") density = 1.5;

    const tons = cuYards * density;

    // Bag estimate (standard 50lb bags)
    const totalLbs = tons * 2000;
    const bags = Math.ceil(totalLbs / 50);

    return {
      cubicYards: parseFloat(cuYards.toFixed(2)),
      tons: parseFloat(tons.toFixed(2)),
      cubicFeet: parseFloat(cuFt.toFixed(1)),
      bags50lb: bags,
      isError: false
    };

  } catch (err) {
    return { cubicYards: 0, tons: 0, cubicFeet: 0, bags50lb: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const GravelCalculator = () => {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");
  const [depth, setDepth] = useState("2");
  const [rockType, setRockType] = useState("standard");

  const [result, setResult] = useState<GravelResult | null>(null);

  const calculate = () => {
    setResult(calculateGravel(length, width, depth, rockType));
  };

  useEffect(() => { calculate(); }, [length, width, depth, rockType]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How deep should I lay the gravel?", answer: "For general landscaping, garden beds, or decorative pathways with light foot traffic, a depth of 2 inches is standard to suppress weeds and cover the dirt completely. For a gravel driveway that will support the immense weight of cars and trucks, you need a minimum depth of 4 to 6 inches over a compacted base." },
    { question: "What is a Cubic Yard?", answer: "A cubic yard is the standard measurement unit used by bulk landscape supply yards. It represents a three-dimensional block that is exactly 3 feet long, 3 feet wide, and 3 feet tall (27 cubic feet). A standard pickup truck bed can usually hold about 1.5 to 2 cubic yards of material before maxing out its weight capacity." },
    { question: "Why do you calculate Tons?", answer: "While volume (cubic yards) dictates how much space the gravel will fill, the weight (Tons) is critical for logistics. Standard crushed gravel is incredibly heavy, weighing about 1.4 Tons per cubic yard. If you order 3 cubic yards for a driveway, that is over 4 Tons of weight. You must know this to ensure your truck or trailer can safely haul the load without breaking the suspension." },
    { question: "Should I buy bags or bulk?", answer: "If your project requires less than half a cubic yard (e.g., filling a few small pots or a tiny dog run), buying 50lb bags at a hardware store is convenient. However, if your project exceeds 1 cubic yard, buying in bulk from a landscape supply yard and having it delivered in a dump truck is vastly cheaper and saves you from carrying thousands of pounds of individual bags." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Gravel Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gravel & Landscape Rock Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Area Length</span>
                  <span className="text-xs text-muted-foreground self-end">feet</span>
                </label>
                <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Area Width</span>
                  <span className="text-xs text-muted-foreground self-end">feet</span>
                </label>
                <div className={wrap}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} min="1" step="any" /></div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Desired Depth</span>
                <span className="text-xs text-muted-foreground self-end">inches</span>
              </label>
              <div className={wrap}><input type="number" value={depth} onChange={e => setDepth(e.target.value)} className={ci} min="0.1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Standard landscaping: 2 inches. Driveways: 4 to 6 inches.</p>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Material Type</span>
              </label>
              <div className={wrap}>
                <select value={rockType} onChange={e => setRockType(e.target.value)} className={ci}>
                  <option value="standard">Crushed Stone / Gravel / Pea Gravel</option>
                  <option value="river">River Rock / Cobble</option>
                  <option value="sand">Sand (Wet/Packed)</option>
                  <option value="lava">Lava Rock (Lightweight)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Shovel className="h-5 w-5" /> Calculate Material
              </button>
              <button type="button" onClick={() => { setLength("20"); setWidth("10"); setDepth("2"); setRockType("standard"); }} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your dimensions and try again.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Bulk Delivery Order</div>
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                      {result.cubicYards}
                    </span>
                    <span className="text-xl font-bold text-muted-foreground font-mono">Cubic Yards</span>
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Estimated Weight</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.tons} <span className="text-sm font-normal text-muted-foreground font-sans">Tons</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">DIY Bags vs Bulk</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Store-Bought Bags</div>
                    <div className="text-3xl font-bold text-foreground font-mono">{result.bags50lb.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase mt-1">50 lb Bags</div>
                  </div>
                  <div className="flex flex-col justify-center text-sm text-muted-foreground leading-relaxed">
                    <p>If your project requires more than <strong>1 cubic yard</strong> (roughly 55 bags), it is almost always significantly cheaper to buy in bulk from a local landscape supply yard and have it delivered by dump truck.</p>
                  </div>
                </div>
                {result.cubicYards >= 1 && (
                  <p className="text-xs font-bold text-red-500 mt-4 text-center">
                    * WARNING: You need over 2,000 lbs of rock. Do not attempt to haul this in a standard SUV or half-ton pickup truck. Order delivery.
                  </p>
                )}
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Mathematics of Landscaping</h2>
            <p>One of the most difficult parts of landscaping is visualizing exactly how much material you need. Unlike water, rock and dirt do not level themselves perfectly, and it is incredibly easy to vastly underestimate the volume required to fill a garden bed.</p>
            <p>To accurately calculate gravel, you must convert three-dimensional space into the universal landscaping unit: the <strong>Cubic Yard</strong>.</p>

            <h2>What is a Cubic Yard?</h2>
            <p>A cubic yard is a volumetric measurement representing a block of space that is exactly 3 feet long, 3 feet wide, and 3 feet tall. Because 3 × 3 × 3 = 27, there are exactly <strong>27 cubic feet in one cubic yard</strong>.</p>
            <p>When you call a bulk landscape supplier, they will only sell dirt, mulch, and rock by the cubic yard. A standard pickup truck bed can physically hold about 1.5 to 2.0 cubic yards of material before it starts spilling over the sides.</p>

            <h2>Volume vs. Weight (The Density Trap)</h2>
            <p>Calculating the volume is easy, but ignoring the physical weight of the rock is a dangerous mistake. Different materials have vastly different densities. While 1 cubic yard of mulch might only weigh 600 lbs, 1 cubic yard of crushed granite gravel weighs a massive <strong>2,800 lbs (1.4 Tons)</strong>.</p>
            <p>A standard "half-ton" pickup truck (like a Ford F-150) typically has a maximum payload capacity of roughly 1,500 to 2,000 lbs. If you tell the tractor operator at the supply yard to dump 2 cubic yards of gravel into the back of your half-ton truck, the 5,600-pound load will instantly crush your suspension, blow your tires, and permanently damage the vehicle's frame. <strong>Never overload a truck based on volume; always check the calculated tonnage first.</strong></p>

            <h2>Why Depth Matters</h2>
            <p>The depth of your rock layer completely dictates its functionality.</p>
            <ul>
              <li><strong>2 Inches (Decorative):</strong> This is the absolute minimum depth for landscape beds. It provides enough coverage to hide the dirt below and suppress minor weed growth, assuming you have laid professional weed barrier fabric underneath.</li>
              <li><strong>4 to 6 Inches (Structural):</strong> If you are building a gravel driveway or a French drain, you need immense structural stability. A 2-inch layer of rock will simply be pushed into the mud the first time a heavy car drives over it. Driveways require a deep, compacted base layer of crushed stone.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gravel-calculator" />
          <PopularCalculators exclude="/calculator/gravel-calculator" />
        </div>
      </div>
    </>
  );
};
export default GravelCalculator;
