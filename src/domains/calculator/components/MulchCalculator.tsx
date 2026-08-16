"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, TreePine } from "lucide-react";

interface MulchResult {
  cubicYards: number;
  cubicFeet: number;
  bags2CuFt: number;
  bags3CuFt: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateMulch = (
  lengthStr: string,
  widthStr: string,
  depthStr: string // inches
): MulchResult | null => {
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

    // Bag estimates (standard mulch bags are usually 2 cu ft or 3 cu ft)
    const bags2 = Math.ceil(cuFt / 2);
    const bags3 = Math.ceil(cuFt / 3);

    return {
      cubicYards: parseFloat(cuYards.toFixed(2)),
      cubicFeet: parseFloat(cuFt.toFixed(1)),
      bags2CuFt: bags2,
      bags3CuFt: bags3,
      isError: false
    };

  } catch (err) {
    return { cubicYards: 0, cubicFeet: 0, bags2CuFt: 0, bags3CuFt: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const MulchCalculator = () => {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");
  const [depth, setDepth] = useState("3");

  const [result, setResult] = useState<MulchResult | null>(null);

  const calculate = () => {
    setResult(calculateMulch(length, width, depth));
  };

  useEffect(() => { calculate(); }, [length, width, depth]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How deep should I spread mulch?", answer: "The golden rule for landscaping mulch is 3 inches deep. A 3-inch layer is deep enough to completely block sunlight from reaching the soil, effectively suppressing weed seeds. It is also thick enough to retain soil moisture during hot summers. Spreading mulch 1 inch deep is purely cosmetic and will do nothing to stop weeds." },
    { question: "Can I put down too much mulch?", answer: "Yes, 'mulch volcanoes' are a very common mistake. If you pile mulch 6 inches deep around the trunk of a tree, the mulch will trap moisture directly against the bark. Over time, this rots the bark, introduces fungal diseases, and can eventually kill the tree. Keep mulch at 3 inches deep, and pull it a few inches away from tree trunks." },
    { question: "Should I buy bags or bulk?", answer: "A standard bag of mulch holds 2 cubic feet. Since there are 27 cubic feet in a yard, it takes exactly 13.5 bags of mulch to equal 1 cubic yard. If your project calculation is less than 1 or 2 cubic yards, buying bags at a hardware store is much easier and cleaner. If you need 3 or more cubic yards (over 40 bags), it is significantly cheaper to order a bulk delivery from a landscape supply company." },
    { question: "Does mulch physically break down?", answer: "Yes. Unlike gravel, wood mulch is organic matter. As it sits on top of the soil, bacteria and fungi slowly break it down, turning it into rich, nutritious compost that feeds your plants. Because it decomposes, a 3-inch layer of mulch will shrink to about 1 inch over the course of a year, requiring you to top it off annually." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Mulch Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mulch Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Bed Length</span>
                  <span className="text-xs text-muted-foreground self-end">feet</span>
                </label>
                <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Bed Width</span>
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
              <p className="text-xs text-muted-foreground mt-1.5">Industry standard for weed suppression is 3 inches.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { setLength("20"); setWidth("10"); setDepth("3"); }} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Bulk Delivery Order</div>
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                      {result.cubicYards}
                    </span>
                    <span className="text-xl font-bold text-muted-foreground font-mono">Cubic Yards</span>
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.cubicFeet} <span className="text-sm font-normal text-muted-foreground font-sans">cu ft</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Store-Bought Bags</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center border-b-4 border-b-zinc-400">
                    <div className="text-3xl font-bold text-foreground font-mono mb-1">{result.bags2CuFt.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">2 cu ft Bags</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center border-b-4 border-b-zinc-600">
                    <div className="text-3xl font-bold text-foreground font-mono mb-1">{result.bags3CuFt.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">3 cu ft Bags</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground leading-relaxed text-center">
                  <p>1 Cubic Yard = exactly 13.5 bags (of the 2 cu ft size).</p>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Landscaping</h2>
            <p>One of the most difficult parts of landscaping is visualizing exactly how much material you need. Unlike water, mulch and dirt do not level themselves perfectly, and it is incredibly easy to vastly underestimate the volume required to fill a garden bed.</p>
            <p>To accurately calculate mulch, you must convert three-dimensional space into the universal landscaping unit: the <strong>Cubic Yard</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">What is a Cubic Yard?</h2>
            <p>A cubic yard is a volumetric measurement representing a block of space that is exactly 3 feet long, 3 feet wide, and 3 feet tall. Because 3 × 3 × 3 = 27, there are exactly <strong>27 cubic feet in one cubic yard</strong>.</p>
            <p>When you call a bulk landscape supplier, they will only sell dirt, mulch, and rock by the cubic yard. A standard pickup truck bed can physically hold about 1.5 to 2.0 cubic yards of material before it starts spilling over the sides.</p>

            <h2 className="text-2xl font-bold mb-3">Why Depth Matters</h2>
            <p>The depth of your mulch layer completely dictates its functionality.</p>
            <ul>
              <li><strong>1 Inch (Cosmetic Only):</strong> Spreading mulch 1 inch thick looks nice for a week, but it will do absolutely nothing to suppress weeds. Sunlight will easily penetrate the thin layer of wood chips, and weeds will immediately grow through it.</li>
              <li><strong>3 Inches (Industry Standard):</strong> This is the golden rule of landscaping. A 3-inch layer is thick enough to completely block sunlight from reaching the soil, killing off dormant weed seeds. It is also thick enough to insulate the soil, trapping moisture during the scorching heat of summer so you don't have to water your plants as frequently.</li>
              <li><strong>Over 4 Inches (Dangerous):</strong> Adding too much mulch restricts oxygen flow to the soil and traps too much water. If you pile heavy, wet mulch directly against the bark of a tree, it will cause the bark to rot and introduce fungal diseases that can kill the plant.</li>
            </ul>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mulch-calculator" />
          <PopularCalculators exclude="/calculator/mulch-calculator" />
        </div>
      </div>
    </>
  );
};
export default MulchCalculator;
