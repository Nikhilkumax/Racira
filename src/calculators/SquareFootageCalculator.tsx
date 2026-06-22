"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Maximize } from "lucide-react";

interface SqFtResult {
  sqFt: number;
  sqYards: number;
  sqMeters: number;
  acres: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateSqFt = (
  shape: "rectangle" | "triangle" | "circle",
  len1Str: string,
  len2Str: string // width for rect, height for tri, empty for circle
): SqFtResult | null => {
  const L1 = parseFloat(len1Str);
  const L2 = parseFloat(len2Str);

  try {
    let areaSqFt = 0;

    if (shape === "rectangle") {
      if (isNaN(L1) || isNaN(L2) || L1 <= 0 || L2 <= 0) return null;
      areaSqFt = L1 * L2;
    } else if (shape === "triangle") {
      if (isNaN(L1) || isNaN(L2) || L1 <= 0 || L2 <= 0) return null;
      // base * height * 0.5
      areaSqFt = 0.5 * L1 * L2;
    } else if (shape === "circle") {
      // L1 is diameter
      if (isNaN(L1) || L1 <= 0) return null;
      const radius = L1 / 2;
      areaSqFt = Math.PI * Math.pow(radius, 2);
    }

    // Conversions
    const sqYards = areaSqFt / 9;
    const sqMeters = areaSqFt * 0.092903;
    const acres = areaSqFt / 43560;

    return {
      sqFt: parseFloat(areaSqFt.toFixed(2)),
      sqYards: parseFloat(sqYards.toFixed(2)),
      sqMeters: parseFloat(sqMeters.toFixed(2)),
      acres: parseFloat(acres.toFixed(5)),
      isError: false
    };

  } catch (err) {
    return { sqFt: 0, sqYards: 0, sqMeters: 0, acres: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const SquareFootageCalculator = () => {
  const [shape, setShape] = useState<"rectangle" | "triangle" | "circle">("rectangle");
  const [val1, setVal1] = useState("20");
  const [val2, setVal2] = useState("15");

  const [result, setResult] = useState<SqFtResult | null>(null);

  const calculate = () => {
    setResult(calculateSqFt(shape, val1, val2));
  };

  useEffect(() => { calculate(); }, [shape, val1, val2]);

  const handleShapeChange = (newShape: "rectangle" | "triangle" | "circle") => {
    setShape(newShape);
    if (newShape === "rectangle") { setVal1("20"); setVal2("15"); }
    if (newShape === "triangle") { setVal1("20"); setVal2("15"); }
    if (newShape === "circle") { setVal1("10"); setVal2(""); }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What exactly is a Square Foot?", answer: "A square foot is a two-dimensional unit of area. It represents a perfect square that is exactly 12 inches long on every side. If a room is 10 feet long and 10 feet wide, the floor physically contains 100 of those 1-foot by 1-foot squares." },
    { question: "How do I calculate an odd-shaped room?", answer: "If your room is an 'L' shape or has strange alcoves, you cannot calculate the area in one step. You must break the room down into smaller, perfect rectangles. Measure the Length x Width of the main rectangle, then measure the Length x Width of the alcove rectangle. Finally, add the two areas together." },
    { question: "Why is an Acre exactly 43,560 sq ft?", answer: "The acre has historical roots in medieval agriculture. It was originally defined as the amount of land that could be plowed by a yoke of oxen in a single day. Specifically, it was a strip of land exactly one furlong (660 feet) long and one chain (66 feet) wide. 660 x 66 = 43,560 square feet." },
    { question: "How is Square Yards different?", answer: "A square yard is a square that is 3 feet long on all sides (3 feet x 3 feet). Therefore, 1 square yard is equal to exactly 9 square feet. Carpeting is historically priced and sold by the square yard in the US, so you must divide your square footage by 9 to know how many yards of carpet to buy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Square Footage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Square Footage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Space Shape</label>
              <div className="flex flex-col sm:flex-row gap-2 rounded-md border border-input p-1 bg-background w-full">
                <button type="button" onClick={() => handleShapeChange("rectangle")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "rectangle" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Rectangle / Square</button>
                <button type="button" onClick={() => handleShapeChange("triangle")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "triangle" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Triangle</button>
                <button type="button" onClick={() => handleShapeChange("circle")} className={`py-2 px-3 text-sm font-bold flex-1 rounded transition-colors text-center ${shape === "circle" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Circle</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            {shape === "rectangle" && (<>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Length</span><span className="text-xs text-muted-foreground self-end">feet</span></label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Width</span><span className="text-xs text-muted-foreground self-end">feet</span></label>
                <div className={wrap}><input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            </>)}

            {shape === "triangle" && (<>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Base Length</span><span className="text-xs text-muted-foreground self-end">feet</span></label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Perpendicular Height</span><span className="text-xs text-muted-foreground self-end">feet</span></label>
                <div className={wrap}><input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            </>)}

            {shape === "circle" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between"><span>Diameter (width across center)</span><span className="text-xs text-muted-foreground self-end">feet</span></label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Maximize className="h-5 w-5" /> Calculate Area
              </button>
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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Total Area</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.sqFt.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase mt-1">Square Feet (sq ft)</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Area Conversions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Square Yards</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sqYards.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">For carpeting</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-600">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Square Meters</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sqMeters.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Metric equivalent</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-emerald-600">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Acres</div>
                    <div className="text-xl font-bold text-foreground font-mono">{result.acres.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">For large land plots</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Area Measurement</h2>
            <p>Whether you are buying real estate, ordering flooring, or applying fertilizer to a lawn, almost everything related to physical land or structure is measured in two-dimensional area. In the United States, the fundamental unit of this measurement is the <strong>Square Foot</strong>.</p>
            <p>If you have a tape measure, you are measuring a single line (one-dimensional length). To get square footage, you are multiplying two perpendicular lines (Length × Width) to calculate the size of the flat surface between them.</p>

            <h2>Deconstructing Complex Rooms</h2>
            <p>Very few rooms in a house are perfect, unbroken rectangles. Most rooms have closets jutting into them, hallways attached, or bay windows bumping out of the wall. You cannot measure a complex room in a single mathematical step.</p>
            <p>The secret is <strong>Decomposition</strong>. You must mentally break the complex room down into smaller, perfect rectangles. If you have an "L" shaped living room, imagine a line cutting the "L" into two separate rectangles. Measure the Length x Width of the first block, then measure the Length x Width of the second block. Add those two numbers together, and you have the exact square footage of the entire complex room.</p>

            <h2>When to use Square Yards?</h2>
            <p>While hardwood flooring and tile are sold by the square foot, wall-to-wall carpeting and artificial turf are historically sold by the <strong>Square Yard</strong>. Because a yard is 3 feet long, a square yard is a 3 ft by 3 ft block, meaning it contains exactly 9 square feet. If your living room is 300 square feet, you must divide by 9 to know you need to order 33.3 square yards of carpet.</p>

            <h2>Acres vs. Square Feet</h2>
            <p>When measuring vast plots of land, square feet becomes an unwieldy number (a standard city block would be hundreds of thousands of square feet). Instead, real estate uses the <strong>Acre</strong>.</p>
            <p>An acre is exactly <strong>43,560 square feet</strong>. If a developer tells you a suburban housing lot is "a quarter acre," they mean the lot contains exactly 10,890 square feet of land (usually roughly 100 feet deep and 100 feet wide).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/square-footage-calculator" />
          <PopularCalculators exclude="/calculator/square-footage-calculator" />
        </div>
      </div>
    </>
  );
};
export default SquareFootageCalculator;
