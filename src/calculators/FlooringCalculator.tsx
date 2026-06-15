"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, PanelsTopLeft } from "lucide-react";

interface FlooringResult {
  areaSqFt: number;
  totalBoxes: number;
  totalMaterialCost: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateFlooring = (
  unit: string,
  roomLStr: string,
  roomWStr: string,
  wasteStr: string,
  sqFtPerBoxStr: string,
  pricePerBoxStr: string
): FlooringResult | null => {
  const roomL = parseFloat(roomLStr);
  const roomW = parseFloat(roomWStr);
  const waste = parseFloat(wasteStr) / 100;
  const sqFtPerBox = parseFloat(sqFtPerBoxStr);
  const pricePerBox = parseFloat(pricePerBoxStr);

  if (isNaN(roomL) || isNaN(roomW) || isNaN(waste) || isNaN(sqFtPerBox) || isNaN(pricePerBox) || roomL <= 0 || roomW <= 0 || sqFtPerBox <= 0 || pricePerBox < 0) return null;

  try {
    let area = 0;

    if (unit === "imperial") {
      area = roomL * roomW;
    } else {
      // Room is in meters, convert to sq m
      const sqMeters = roomL * roomW;
      // Convert to sq ft because flooring boxes in this market are almost always sold by sq ft.
      // 1 sq meter = 10.7639 sq ft
      area = sqMeters * 10.7639;
    }

    const areaWithWaste = area * (1 + waste);

    const boxes = Math.ceil(areaWithWaste / sqFtPerBox);
    const cost = boxes * pricePerBox;

    return {
      areaSqFt: parseFloat(area.toFixed(2)),
      totalBoxes: boxes,
      totalMaterialCost: parseFloat(cost.toFixed(2)),
      isError: false
    };

  } catch (err) {
    return { areaSqFt: 0, totalBoxes: 0, totalMaterialCost: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const FlooringCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [roomL, setRoomL] = useState("15"); // ft or m
  const [roomW, setRoomW] = useState("12"); // ft or m
  const [waste, setWaste] = useState("10"); // %
  const [sqFtPerBox, setSqFtPerBox] = useState("24"); // sq ft
  const [price, setPrice] = useState("45"); // per box

  const [result, setResult] = useState<FlooringResult | null>(null);

  const calculate = () => {
    setResult(calculateFlooring(unit, roomL, roomW, waste, sqFtPerBox, price));
  };

  useEffect(() => { calculate(); }, [unit, roomL, roomW, waste, sqFtPerBox, price]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setRoomL("15"); setRoomW("12");
    } else {
      setRoomL("4.5"); setRoomW("3.5");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const faqs = [
    { question: "How much waste should I plan for?", answer: "For a perfectly square or rectangular room where you are laying the flooring parallel to the walls, a 10% waste factor is standard to account for the cut pieces at the ends of the rows. If you are laying the flooring diagonally, or if the room is complex with many closets, angles, or kitchen islands, increase the waste factor to 15%." },
    { question: "Why do I buy by the box instead of square feet?", answer: "Laminate, luxury vinyl plank (LVP), and engineered hardwood are packed tightly in dense cardboard cartons at the factory to protect the interlocking edges during shipping. Stores do not break open boxes to sell individual planks. If you calculate that you need 240 sq ft, and the boxes hold 23.5 sq ft, you cannot buy exactly 240. You must round up and purchase exactly 11 full boxes (258.5 sq ft)." },
    { question: "Do I need to calculate underlayment separately?", answer: "Many modern Luxury Vinyl Plank (LVP) products come with a thin foam or cork underlayment pad pre-attached to the back of every plank. If your flooring has an attached pad, you only need to calculate the planks themselves. If you are buying traditional laminate or hardwood, you must buy rolls of foam underlayment equal to the square footage of the room." },
    { question: "What is the 'Stagger' rule?", answer: "When laying plank flooring, you never want the end joints of adjacent rows to align (forming an 'H' pattern). This compromises the structural integrity of the floor and looks unnatural. You must stagger the joints by at least 6 to 8 inches. The cut-off piece from the end of the first row is usually carried over to start the second row, which helps minimize waste while creating a random stagger." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Flooring Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flooring Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Room Dimensions</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full mb-3">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (ft)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (m)</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 flex justify-between"><span>Length</span><span className="self-end">{unit === "imperial" ? "feet" : "meters"}</span></label>
                  <div className={wrap}><input type="number" value={roomL} onChange={e => setRoomL(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 flex justify-between"><span>Width</span><span className="self-end">{unit === "imperial" ? "feet" : "meters"}</span></label>
                  <div className={wrap}><input type="number" value={roomW} onChange={e => setRoomW(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Coverage Per Box</span>
                <span className="text-xs text-muted-foreground self-end">Square Feet</span>
              </label>
              <div className={wrap}><input type="number" value={sqFtPerBox} onChange={e => setSqFtPerBox(e.target.value)} className={ci} min="1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Check the product label online or in-store. (Usually 18 to 24 sq ft).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Price Per Box</span>
                  <span className="text-xs text-muted-foreground self-end">$</span>
                </label>
                <div className={wrap}><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Waste Margin</span>
                  <span className="text-xs text-muted-foreground self-end">%</span>
                </label>
                <div className={wrap}><input type="number" value={waste} onChange={e => setWaste(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <PanelsTopLeft className="h-5 w-5" /> Calculate Flooring
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
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Material Cost Estimate</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {formatCurrency(result.totalMaterialCost)}
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Room Area</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.areaSqFt} <span className="text-sm font-normal text-muted-foreground font-sans">sq ft</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Boxes Required</h3>
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-5xl font-extrabold text-primary font-mono">{result.totalBoxes}</div>
                  <div>
                    <div className="font-bold text-foreground mb-1 uppercase tracking-wider">Full Boxes to Purchase</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      Includes a {waste}% waste margin for cutting. Since boxes cannot be split, this number is rounded up to the nearest whole box.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Always keep at least one half-box of leftover planks stored in a closet for future repairs if a plank becomes damaged or deeply scratched.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Secret to Estimating Hard Floors</h2>
            <p>Whether you are laying traditional hardwood, laminate, or modern waterproof Luxury Vinyl Plank (LVP), accurately estimating flooring is not just about finding the area of a rectangle. You must account for how the material is physically cut, laid, and packaged by the manufacturer.</p>

            <h2>Why is the Waste Margin Mandatory?</h2>
            <p>Flooring planks are manufactured in long strips (usually 3 to 4 feet long). When you start laying a row against a wall and reach the opposite wall, the last plank in the row will almost certainly be too long to fit. You have to cut it. While you can sometimes use the cut-off scrap piece to start the very next row, many cuts—especially complex angled cuts around doorways, heating vents, or kitchen islands—result in useless scrap.</p>
            <p>Furthermore, laminate and LVP rely on delicate "click-lock" tongues and grooves machined into the edges. These interlocking edges are easily broken if dropped or forced too hard during installation, rendering the entire plank useless. <strong>Always factor in a 10% waste margin for simple square rooms, and 15% for complex layouts.</strong></p>

            <h2>Understanding "Per Box" Pricing</h2>
            <p>The flooring industry advertises price per square foot (e.g., "$2.99 / sq ft") because it sounds cheap to the consumer. However, you cannot buy 1 square foot. You must buy the entire box.</p>
            <p>Because planks vary in width and length between brands, the coverage area inside a box also varies wildly. A dense hardwood might pack 18 sq ft per box, while a thin LVP might pack 24 sq ft per box. You must physically read the label on the product you want to buy to find the "Coverage per Carton."</p>
            <p>If your room (including the 10% waste margin) requires 300 square feet, and the boxes hold 24 square feet, you need 12.5 boxes. You will be forced to buy exactly 13 boxes, meaning the final cost will be slightly higher than simply multiplying the raw area by the per-square-foot price.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flooring-calculator" />
          <PopularCalculators exclude="/calculator/flooring-calculator" />
        </div>
      </div>
    </>
  );
};
export default FlooringCalculator;
