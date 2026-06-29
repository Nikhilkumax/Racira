"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Home } from "lucide-react";

interface RoofingResult {
  baseFootprint: number; // sq ft
  roofArea: number; // sq ft
  squares: number; // Roofing squares
  shingleBundles: number;
  underlaymentRolls: number; // 15lb or 30lb rolls (usually 4 or 2 squares per roll)
  nailsLbs: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateRoofing = (
  houseLStr: string,
  houseWStr: string,
  pitchStr: string, // "4:12" format or just the rise "4"
  wasteStr: string
): RoofingResult | null => {
  const l = parseFloat(houseLStr);
  const w = parseFloat(houseWStr);
  const rise = parseFloat(pitchStr);
  const waste = parseFloat(wasteStr) / 100;

  if (isNaN(l) || isNaN(w) || isNaN(rise) || l <= 0 || w <= 0 || rise < 0) return null;

  try {
    const baseArea = l * w;

    // Pitch multiplier calculation
    // Pitch is rise over 12 inch run.
    // So the slope length is hypotenuse = sqrt(12^2 + rise^2)
    // Multiplier = hypotenuse / 12
    const hypotenuse = Math.sqrt(144 + Math.pow(rise, 2));
    const pitchMultiplier = hypotenuse / 12;

    const exactRoofArea = baseArea * pitchMultiplier;
    const roofAreaWithWaste = exactRoofArea * (1 + waste);

    // 1 Roofing Square = 100 sq ft
    const squares = Math.ceil(roofAreaWithWaste / 100);

    // Standard 3-tab or architectural shingles typically require 3 bundles per square.
    const bundles = squares * 3;

    // Underlayment (Felt Paper)
    // 15lb felt covers approx 4 squares per roll. 30lb felt covers approx 2 squares per roll.
    // We'll estimate using heavy 30lb felt (2 squares/roll) for a conservative material count.
    const rolls = Math.ceil(squares / 2);

    // Nails
    // Generally need about 320 nails per square (4 per shingle).
    // A standard 5lb box of roofing nails covers about 1.5 to 2 squares.
    // Roughly 2.5 lbs per square.
    const nails = Math.ceil(squares * 2.5);

    return {
      baseFootprint: parseFloat(baseArea.toFixed(1)),
      roofArea: parseFloat(roofAreaWithWaste.toFixed(1)),
      squares: squares,
      shingleBundles: bundles,
      underlaymentRolls: rolls,
      nailsLbs: nails,
      isError: false
    };

  } catch (err) {
    return { baseFootprint: 0, roofArea: 0, squares: 0, shingleBundles: 0, underlaymentRolls: 0, nailsLbs: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const RoofingCalculator = () => {
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("30");
  const [pitch, setPitch] = useState("6"); // 6/12 pitch
  const [waste, setWaste] = useState("10"); // 10% waste

  const [result, setResult] = useState<RoofingResult | null>(null);

  const calculate = () => {
    setResult(calculateRoofing(length, width, pitch, waste));
  };

  useEffect(() => { calculate(); }, [length, width, pitch, waste]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a 'Roofing Square'?", answer: "In the roofing industry in the United States, materials are not sold by the square foot. They are sold by the 'Square'. A roofing square is equal to exactly 100 square feet of roof area (e.g., a 10 ft by 10 ft section). If your roof is 2,400 square feet, you need 24 Squares of material." },
    { question: "How many bundles of shingles are in a Square?", answer: "For standard asphalt shingles (both 3-tab and architectural styles), there are exactly 3 bundles per Square. This is because a single bundle covering an entire square would weigh over 200 pounds and be impossible for a roofer to carry up a ladder safely." },
    { question: "How does Roof Pitch affect the area?", answer: "The footprint of your house (Length x Width) is perfectly flat. But your roof is angled upwards. The steeper the angle (pitch), the more physical surface area it has. A very steep 12/12 pitch roof actually has about 41% more physical surface area than the flat footprint of the house below it." },
    { question: "What is the Pitch Ratio?", answer: "Pitch is measured as 'Rise over Run'. The run is always 12 inches. So a '6/12 pitch' means that for every 12 inches you move horizontally toward the center of the house, the roof rises 6 inches vertically. A 4/12 is a low-slope roof, while a 12/12 is an extremely steep 'A-Frame' style roof." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Roofing Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Roofing Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>House / Structure Footprint</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 flex justify-between"><span>Length</span><span className="self-end">feet</span></label>
                  <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 flex justify-between"><span>Width</span><span className="self-end">feet</span></label>
                  <div className={wrap}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Include the eaves/overhangs in your measurement, not just the interior walls.</p>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Roof Pitch (Slope)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 w-24">
                  <input type="number" value={pitch} onChange={e => setPitch(e.target.value)} className="w-full h-full px-3 text-lg bg-transparent outline-none border-none text-foreground font-mono text-center" min="0" max="24" step="any" />
                </div>
                <div className="text-xl font-bold text-muted-foreground">/ 12</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">e.g., A 6/12 pitch rises 6 inches for every 12 inches of horizontal run.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Waste Factor</span>
                <span className="text-xs text-muted-foreground self-end">% (10% Recommended)</span>
              </label>
              <div className={wrap}><input type="number" value={waste} onChange={e => setWaste(e.target.value)} className={ci} min="0" step="any" /></div>
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
                  <div className="text-base font-medium text-foreground">Please check your inputs and try again.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Roofing Squares Required</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.squares}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold mt-1">1 Square = 100 sq ft</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">True Roof Area</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.roofArea.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">sq ft</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Material Estimate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-500">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Shingles</div>
                    <div className="text-3xl font-bold text-foreground font-mono">{result.shingleBundles}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Bundles (3 per Square)</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-800">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Underlayment</div>
                    <div className="text-3xl font-bold text-foreground font-mono">{result.underlaymentRolls}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Rolls (30 lb felt)</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-stone-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Roofing Nails</div>
                    <div className="text-3xl font-bold text-foreground font-mono">{result.nailsLbs}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Pounds (Lbs)</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
                  * Note: Estimates include your {waste}% waste margin. Complex roofs with hips, valleys, or dormers require significantly more waste. Starter strips and ridge caps are not included and must be purchased separately.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Secret of the Pitch Multiplier</h2>
            <p>If your house is exactly 40 feet long and 30 feet wide, the footprint of your house is 1,200 square feet. A massive amateur mistake is assuming you only need 1,200 square feet of roofing materials. <strong>This is completely wrong.</strong></p>
            <p>Your house footprint is flat, but your roof is angled upwards like a triangle. The steeper the angle, the longer the sides of the triangle become, meaning the physical surface area of the roof increases significantly. To calculate the actual square footage of your roof, you must multiply the flat footprint area by a <strong>Pitch Multiplier</strong> derived from the Pythagorean theorem.</p>

            <h2>Understanding Pitch (Rise over Run)</h2>
            <p>In North America, roof slope is almost universally measured in "Pitch". The denominator is always 12 inches (the run). The numerator is how many inches the roof rises vertically over that 12-inch horizontal span.</p>
            <ul>
              <li><strong>4/12 Pitch:</strong> A low-slope roof, common in ranch-style homes. Multiplier = 1.05. (A 1,200 sq ft house has a 1,260 sq ft roof).</li>
              <li><strong>6/12 Pitch:</strong> A standard, walkable roof. Multiplier = 1.12. (A 1,200 sq ft house has a 1,344 sq ft roof).</li>
              <li><strong>12/12 Pitch:</strong> An extremely steep, A-Frame style roof. Multiplier = 1.41. (A 1,200 sq ft house has a massive 1,692 sq ft roof).</li>
            </ul>

            <h2>What is a Roofing Square?</h2>
            <p>Once you calculate your total roof area, you don't order materials by the square foot. The roofing industry operates entirely on the "Square". <strong>One Square equals exactly 100 square feet.</strong> If your final roof calculation (including waste) is 2,400 square feet, you need 24 Squares of material.</p>
            <p>A single square of asphalt shingles weighs roughly 200 to 250 pounds. Because a 250-pound package is impossible for a roofer to safely carry up a ladder, manufacturers split each Square into exactly <strong>three bundles</strong>. Therefore, if you need 24 Squares, you will order 72 bundles of shingles.</p>

            <h2>The Waste Factor</h2>
            <p>Roofs are rarely simple rectangles. You will have to cut shingles at every edge, along the roof peak (the ridge), and in the valleys where two roof sections meet. These cuts create unusable scrap. For a simple gable roof (two flat sides like a tent), a 10% waste factor is standard. For complex roofs with many dormers, hips, and valleys, you must use a 15% to 20% waste factor, or you will run out of material before the job is done.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roofing-calculator" />
          <PopularCalculators exclude="/calculator/roofing-calculator" />
        </div>
      </div>
    </>
  );
};
export default RoofingCalculator;
