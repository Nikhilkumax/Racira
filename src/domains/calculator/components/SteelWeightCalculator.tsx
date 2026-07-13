"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Anvil } from "lucide-react";

interface SteelResult {
  weightLbs: number;
  weightKg: number;
  volumeCuIn: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateSteelWeight = (
  shape: "plate" | "round" | "square" | "tube",
  lengthStr: string, // inches
  widthStr: string, // inches (plate)
  thicknessStr: string, // inches (plate, tube wall)
  diameterStr: string, // inches (round, tube OD)
  sizeStr: string // inches (square side)
): SteelResult | null => {
  const l = parseFloat(lengthStr);

  try {
    let volume = 0;

    if (shape === "plate") {
      const w = parseFloat(widthStr);
      const t = parseFloat(thicknessStr);
      if (isNaN(l) || isNaN(w) || isNaN(t) || l <= 0 || w <= 0 || t <= 0) return null;
      volume = l * w * t;
    } else if (shape === "round") {
      const d = parseFloat(diameterStr);
      if (isNaN(l) || isNaN(d) || l <= 0 || d <= 0) return null;
      const r = d / 2;
      volume = Math.PI * Math.pow(r, 2) * l;
    } else if (shape === "square") {
      const s = parseFloat(sizeStr);
      if (isNaN(l) || isNaN(s) || l <= 0 || s <= 0) return null;
      volume = Math.pow(s, 2) * l;
    } else if (shape === "tube") {
      const od = parseFloat(diameterStr); // Outer diameter
      const wall = parseFloat(thicknessStr); // Wall thickness
      if (isNaN(l) || isNaN(od) || isNaN(wall) || l <= 0 || od <= 0 || wall <= 0) return null;
      if (wall >= od / 2) return { weightLbs: 0, weightKg: 0, volumeCuIn: 0, isError: true, errorMsg: "Wall thickness is too large for the given diameter." };
      
      const id = od - (2 * wall); // Inner diameter
      const rOuter = od / 2;
      const rInner = id / 2;
      const volOuter = Math.PI * Math.pow(rOuter, 2) * l;
      const volInner = Math.PI * Math.pow(rInner, 2) * l;
      volume = volOuter - volInner;
    }

    // Density of carbon steel is approximately 0.2833 lbs per cubic inch
    const densityLbs = 0.2833;
    const weightLbs = volume * densityLbs;
    const weightKg = weightLbs * 0.453592;

    return {
      weightLbs: parseFloat(weightLbs.toFixed(2)),
      weightKg: parseFloat(weightKg.toFixed(2)),
      volumeCuIn: parseFloat(volume.toFixed(2)),
      isError: false
    };

  } catch (err) {
    return { weightLbs: 0, weightKg: 0, volumeCuIn: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const SteelWeightCalculator = () => {
  const [shape, setShape] = useState<"plate" | "round" | "square" | "tube">("plate");
  
  // Inputs (all in inches)
  const [length, setLength] = useState("120"); // 10 ft default
  const [width, setWidth] = useState("48"); // 4 ft plate
  const [thickness, setThickness] = useState("0.25"); // 1/4 inch plate
  const [diameter, setDiameter] = useState("2"); // 2 inch round or OD
  const [size, setSize] = useState("2"); // 2 inch square

  const [result, setResult] = useState<SteelResult | null>(null);

  const calculate = () => {
    setResult(calculateSteelWeight(shape, length, width, thickness, diameter, size));
  };

  useEffect(() => { calculate(); }, [shape, length, width, thickness, diameter, size]);

  const handleShapeChange = (newShape: "plate" | "round" | "square" | "tube") => {
    setShape(newShape);
    // Reset defaults based on shape
    setLength("120");
    if (newShape === "plate") { setWidth("48"); setThickness("0.25"); }
    if (newShape === "round") { setDiameter("2"); }
    if (newShape === "square") { setSize("2"); }
    if (newShape === "tube") { setDiameter("2"); setThickness("0.120"); } // 11 gauge wall roughly
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How dense is steel?", answer: "Carbon steel is incredibly dense. It weighs approximately 0.2833 pounds per cubic inch. To put that in perspective, a solid 1-foot block (12x12x12 inches) of steel weighs nearly 490 pounds! This makes accurately estimating the weight of steel beams critical before attempting to move them." },
    { question: "Is Stainless Steel heavier than Carbon Steel?", answer: "The weights are almost identical. Standard carbon steel has a density of about 7,850 kg/m³. 304 Stainless steel (used in kitchen appliances) has a density of roughly 8,000 kg/m³. So stainless steel is technically slightly heavier, but the difference is so small it is usually ignored in rough calculations." },
    { question: "What is the formula for weight?", answer: "To find the weight, you simply calculate the physical volume of the object (in cubic inches) using standard geometry, and then multiply that volume by the density of steel (0.2833 lbs/in³). For example, a plate's volume is Length × Width × Thickness." },
    { question: "Why is knowing the weight important?", answer: "In fabrication and construction, steel is bought and sold by weight, not just length. More importantly, understanding the weight is critical for safety. Knowing a specific steel I-Beam weighs 2,000 lbs dictates what size crane, forklift, or truck is required to safely transport and install it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Steel Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Steel Weight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Material Profile</label>
              <div className="flex flex-col sm:flex-row gap-2 rounded-md border border-input p-1 bg-background w-full">
                <button type="button" onClick={() => handleShapeChange("plate")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "plate" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Flat Plate</button>
                <button type="button" onClick={() => handleShapeChange("round")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "round" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Round Bar</button>
                <button type="button" onClick={() => handleShapeChange("square")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "square" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Square Bar</button>
                <button type="button" onClick={() => handleShapeChange("tube")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "tube" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Round Tube</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Length</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
              <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="0.1" step="any" /></div>
            </div>

            {shape === "plate" && (<>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Width</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Thickness</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={thickness} onChange={e => setThickness(e.target.value)} className={ci} min="0.01" step="any" /></div>
              </div>
            </>)}

            {shape === "round" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Diameter</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            )}

            {shape === "square" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Width / Size</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={size} onChange={e => setSize(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            )}

            {shape === "tube" && (<>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Outer Diameter (OD)</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Wall Thickness</span><span className="text-xs text-muted-foreground self-end">inches</span></label>
                <div className={wrap}><input type="number" value={thickness} onChange={e => setThickness(e.target.value)} className={ci} min="0.01" step="any" /></div>
              </div>
            </>)}

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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Estimated Weight</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.weightLbs.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase mt-1">Pounds (lbs)</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Kilograms</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.weightKg.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Volume Data</h3>
                <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center">
                  <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Physical Volume</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.volumeCuIn.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">cubic inches</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
                  Based on a standard carbon steel density of <strong>0.2833 lbs/in³</strong>. Values may vary slightly depending on the specific alloy.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Importance of Calculating Steel Weight</h2>
            <p>Steel is the backbone of modern construction, from the framing of skyscrapers to the chassis of automobiles. However, steel is extraordinarily dense and heavy. A solid block of steel measuring just 1 foot by 1 foot by 1 foot (a cubic foot) weighs a massive <strong>490 pounds</strong>.</p>
            <p>Accurately calculating the weight of a steel component is absolutely critical for three main reasons:</p>
            <ol>
              <li><strong>Cost Estimating:</strong> Steel mills and fabricators sell steel strictly by weight (usually by the ton or the hundredweight), not just by length. You cannot bid a job accurately without knowing the weight.</li>
              <li><strong>Logistics and Transport:</strong> A standard flatbed 18-wheeler can legally carry roughly 45,000 to 48,000 lbs of freight. If you miscalculate the weight of your steel beams, you could overload a truck, resulting in massive fines or catastrophic tire failure on the highway.</li>
              <li><strong>Rigging Safety:</strong> Before a crane operator lifts a 40-foot I-Beam into the air, they must know exactly what it weighs to ensure they do not exceed the crane's maximum load rating or snap a rigging strap.</li>
            </ol>

            <h2 className="text-2xl font-bold mb-3">How the Math Works</h2>
            <p>Calculating the weight of any metal object requires two steps: calculating its physical volume, and then multiplying that volume by the metal's known density.</p>
            <ul>
              <li><strong>Step 1 (Volume):</strong> Use standard geometry. For a flat rectangular plate, the volume is Length × Width × Thickness. (e.g. 120" × 48" × 0.25" = 1,440 cubic inches).</li>
              <li><strong>Step 2 (Density):</strong> Multiply the volume by the density of the specific alloy. Standard carbon steel has a density of <strong>0.2833 lbs per cubic inch</strong>.</li>
              <li><strong>Step 3 (Result):</strong> 1,440 × 0.2833 = 407.95 lbs. Therefore, a standard 4ft x 10ft sheet of 1/4" steel plate weighs roughly 408 pounds.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Carbon Steel vs. Stainless vs. Aluminum</h2>
            <p>It is important to select the right material multiplier. Carbon steel and Stainless steel are almost identical in weight (Stainless is technically about 1% heavier due to the Chromium and Nickel content). However, Aluminum is completely different. Aluminum is famously lightweight, with a density of roughly 0.098 lbs/in³. An identical volume of Aluminum weighs about one-third the weight of Steel.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/steel-weight-calculator" />
          <PopularCalculators exclude="/calculator/steel-weight-calculator" />
        </div>
      </div>
    </>
  );
};
export default SteelWeightCalculator;
