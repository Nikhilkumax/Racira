"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ConcreteResult {
  cubicYards: number;
  cubicFeet: number;
  cubicMeters: number;
  bags60lb: number;
  bags80lb: number;
  weight: number;
  cost: number;
  breakdown: { label: string; value: string }[];
  shapeData: { shape: string; volume: number }[];
  summaryStats: { label: string; value: string }[];
}

type ConcreteShape = "slab" | "footing" | "column";

function calcConcrete(
  shape: ConcreteShape, l: number, w: number, h: number,
  pricePerYard: number, wastePct: number
): ConcreteResult {
  let cubicFeet = 0;
  if (shape === "slab") cubicFeet = l * w * (h / 12); // h in inches
  else if (shape === "footing") cubicFeet = l * w * (h / 12);
  else if (shape === "column") {
    // l = diameter in inches, w = length in feet
    const r = (l / 12) / 2;
    cubicFeet = Math.PI * r * r * w;
  }

  const withWaste = cubicFeet * (1 + wastePct / 100);
  const cubicYards = withWaste / 27;
  const cubicMeters = withWaste * 0.0283168;
  const bags60lb = Math.ceil(withWaste * 0.45 / 0.45); // ~0.45 ft³ per 60lb bag
  const bags80lb = Math.ceil(withWaste / 0.6); // ~0.6 ft³ per 80lb bag
  const weight = cubicYards * 4050; // lbs per cubic yard of concrete
  const cost = cubicYards * pricePerYard;

  const breakdown = [
    { label: "Shape", value: shape.charAt(0).toUpperCase() + shape.slice(1) },
    { label: "Raw Volume", value: `${cubicFeet.toFixed(2)} ft³` },
    { label: `With ${wastePct}% Waste`, value: `${withWaste.toFixed(2)} ft³` },
    { label: "Cubic Yards (order)", value: `${cubicYards.toFixed(2)} yd³` },
    { label: "Cubic Meters", value: `${cubicMeters.toFixed(3)} m³` },
    { label: "60-lb Bags Needed", value: `${bags60lb} bags` },
    { label: "80-lb Bags Needed", value: `${bags80lb} bags` },
    { label: "Estimated Weight", value: `${(weight / 2000).toFixed(2)} tons` },
    { label: "Estimated Cost", value: `$${cost.toFixed(2)}` },
  ];

  const shapeData = [
    { shape: "Cubic Feet", volume: parseFloat(withWaste.toFixed(2)) },
    { shape: "Cubic Yards", volume: parseFloat(cubicYards.toFixed(2)) },
    { shape: "60-lb Bags", volume: bags60lb },
    { shape: "80-lb Bags", volume: bags80lb },
  ];

  const summaryStats = [
    { label: "Cubic Yards", value: cubicYards.toFixed(2) },
    { label: "Cubic Feet", value: withWaste.toFixed(2) },
    { label: "60-lb Bags", value: `${bags60lb}` },
    { label: "80-lb Bags", value: `${bags80lb}` },
    { label: "Weight", value: `${(weight / 2000).toFixed(2)} tons` },
    { label: "Cost Estimate", value: `$${cost.toFixed(2)}` },
  ];

  return { cubicYards, cubicFeet: withWaste, cubicMeters, bags60lb, bags80lb, weight, cost, breakdown, shapeData, summaryStats };
}

export default function ConcreteCalculator() {
  const [shape, setShape] = useState<ConcreteShape>("slab");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");
  const [depth, setDepth] = useState("4");
  const [pricePerYard, setPricePerYard] = useState("150");
  const [wastePct, setWastePct] = useState("10");
  const [result, setResult] = useState<ConcreteResult | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0, w = parseFloat(width) || 0, d = parseFloat(depth) || 0;
    if (l > 0 && w > 0 && d > 0) setResult(calcConcrete(shape, l, w, d, parseFloat(pricePerYard) || 150, parseFloat(wastePct) || 10));
  };

  useEffect(() => { setResult(calcConcrete("slab", 20, 10, 4, 150, 10)); }, []);

  const dimLabel = shape === "slab" ? ["Length (ft)", "Width (ft)", "Depth (in)"]
    : shape === "footing" ? ["Length (ft)", "Width (ft)", "Depth (in)"]
    : ["Diameter (in)", "Length (ft)", "—"];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How do I calculate concrete in cubic yards?", answer: "For a slab: Volume (ft³) = Length (ft) × Width (ft) × Thickness (inches) ÷ 12. Then divide by 27 to get cubic yards (1 yd³ = 27 ft³). Example: 20 × 10 ft slab at 4-inch depth: 20 × 10 × (4/12) = 66.67 ft³ ÷ 27 = 2.47 yd³. Always add 10% for waste and spillage. Order in whole or half-yard increments." },
    { question: "How many 60-lb bags of concrete do I need?", answer: "A standard 60-lb bag of concrete yields approximately 0.45 cubic feet of mixed concrete. A 80-lb bag yields approximately 0.6 cubic feet. To find the number of bags: Bags = Total Volume (ft³) ÷ Volume per bag. For our 20×10 slab: 73.3 ft³ (with 10% waste) ÷ 0.45 = 163 sixty-pound bags. For large pours over 1 yd³, ready-mix concrete from a truck is more economical." },
    { question: "How much does ready-mix concrete cost?", answer: "Ready-mix concrete costs approximately $100–$200 per cubic yard delivered, depending on region and concrete strength specification. Most suppliers have a minimum order of 1 yd³ and charge additional fees for short loads (less than 8–10 yd³). Short-load fees range from $50–$200. A standard 4-inch thick 20×10 ft driveway section (~2.5 yd³) costs approximately $375–$500 for materials alone." },
    { question: "What is the minimum concrete thickness for a driveway?", answer: "Residential driveways should be a minimum of 4 inches thick for passenger vehicles. For heavier vehicles (trucks, RVs), 5–6 inches is recommended. Patios and walkways: 3.5–4 inches minimum. Footings: at least 8 inches deep and the width of the structure being supported. Always compact the base, use at least a 3,000 PSI mix, and consider reinforcing with rebar or wire mesh." },
    { question: "How much waste factor should I add for concrete?", answer: "A 10% waste factor is standard for most concrete pours. Use 12–15% for irregular shapes, forms with irregular geometry, or projects where soil unevenness means depth varies. A 5% waste factor may suffice for very precise, well-formed pours. It's always better to have slightly extra than to run short — a partial load from a ready-mix truck is very expensive, and re-mixing bagged concrete for a patchwork finish looks unprofessional." },
    { question: "How much concrete do I need for a 10x10 slab?", answer: "For a 10×10 ft slab at 4-inch thickness: Volume = 10 × 10 × (4/12) = 33.33 ft³. Add 10% waste: 36.67 ft³ ÷ 27 = 1.36 cubic yards. You'd need approximately 1.5 yd³ ordered (ready-mix suppliers round up). Using bags: 36.67 ÷ 0.45 = 82 sixty-pound bags, or 36.67 ÷ 0.6 = 62 eighty-pound bags. Cost at $150/yd: approximately $200 for ready-mix materials." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Concrete Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Concrete Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {(["slab", "footing", "column"] as ConcreteShape[]).map(s => (
                  <button key={s} onClick={() => setShape(s)} className={`h-10 rounded-md border text-sm font-medium capitalize transition-colors ${shape === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">{dimLabel[0]}</label>
                <div className={inp}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} /></div>
              </div>
              {shape !== "column" && (
                <div>
                  <label className="text-base font-medium mb-1.5 block">{dimLabel[1]}</label>
                  <div className={inp}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} /></div>
                </div>
              )}
            </div>
            {shape !== "column" && (
              <div>
                <label className="text-base font-medium mb-1.5 block">{dimLabel[2]}</label>
                <div className={inp}><input type="number" value={depth} onChange={e => setDepth(e.target.value)} className={ci} /><span className={suf}>in</span></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Price per yd³</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={pricePerYard} onChange={e => setPricePerYard(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Waste Factor</label>
                <div className={inp}><input type="number" value={wastePct} onChange={e => setWastePct(e.target.value)} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setShape("slab"); setLength("20"); setWidth("10"); setDepth("4"); setPricePerYard("150"); setWastePct("10"); setResult(calcConcrete("slab", 20, 10, 4, 150, 10)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Concrete Required</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.cubicYards.toFixed(2)} yd³</div>
                <div className="text-base text-muted-foreground mt-1">{result.bags80lb} bags (80-lb) · {result.bags60lb} bags (60-lb) · Est. ${result.cost.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Cubic Feet", `${result.cubicFeet.toFixed(1)}`], ["Cubic Meters", `${result.cubicMeters.toFixed(2)}`], ["Est. Weight", `${(result.weight / 2000).toFixed(1)} T`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Volume Units Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.shapeData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="shape" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Calculate Concrete Volume</h2>
            <p>This <strong>concrete calculator</strong> computes the exact volume of concrete needed for slabs, footings, and columns in cubic yards, cubic feet, and cubic meters. The core formula for rectangular shapes: <strong>Volume (ft³) = Length (ft) × Width (ft) × Depth (in) ÷ 12</strong>. Divide by 27 to convert to cubic yards (the standard ordering unit for ready-mix concrete). Always add 10% waste to account for spillage, uneven subgrade, and settling.</p>
            <h2 className="text-2xl font-bold mb-3">Ready-Mix vs. Bagged Concrete</h2>
            <p>For projects under 1 cubic yard (27 ft³): use bagged concrete. A 60-lb bag covers ≈0.45 ft³; an 80-lb bag ≈0.6 ft³. For projects 1–3 yd³: consider renting a concrete mixer and using bulk dry concrete. For projects over 1 yd³: ready-mix concrete trucks offer 3,000–4,000 PSI concrete delivered and poured at approximately $125–$200/yd³. Short-load fees apply for small orders.</p>
            <h2 className="text-2xl font-bold mb-3">Concrete Thickness Guidelines</h2>
            <p>Driveway (cars): 4 inches minimum. Driveway (trucks/RVs): 5–6 inches. Patio/walkway: 3.5–4 inches. Garage floor: 4–6 inches. Structural footings: minimum 8 inches deep. Basement walls: 8–10 inches. Higher PSI concrete (3,500–5,000) is recommended for driveways and areas with freeze-thaw cycles. Use rebar (#4 or #5 bar) on a 2-foot grid for driveways; wire mesh for patios.</p>
            <h2 className="text-2xl font-bold mb-3">Estimating Cost</h2>
            <p>Ready-mix concrete: $100–$200/yd³ delivered (varies by region and mix spec). Bags: 80-lb bags at $6–$8 each; cost per yd³ ≈ $270–$360. Labor: $2–$5/ft² for a typical slab pour. Pumping (if needed): $500–$1,500 for pump truck. Reinforcement: rebar $0.25–$0.50/lb; wire mesh $0.10–$0.20/ft². Finishing and sealing: $1–$2/ft² additional. Related tools: <a href="/calculator/area-calculator">Area Calculator</a>, <a href="/calculator/volume-calculator">Volume Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/concrete-calculator" />
          <PopularCalculators exclude="/calculator/concrete-calculator" />
        </div>
      </div>
    </>
  );
}
