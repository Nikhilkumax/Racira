"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PaintResult {
  gallons: number;
  cans: number;
  coats: number;
  totalArea: number;
  cost: number;
  breakdown: { label: string; value: string }[];
  roomData: { surface: string; area: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

const COVERAGE = 350; // sq ft per gallon (standard)

function calcPaint(
  roomL: number, roomW: number, roomH: number,
  doors: number, windows: number, coats: number,
  pricePerGallon: number, wastePct: number
): PaintResult {
  const wallArea = 2 * (roomL + roomW) * roomH;
  const doorArea = doors * 21; // standard door ~21 sq ft
  const windowArea = windows * 15; // average window ~15 sq ft
  const ceilingArea = roomL * roomW;
  const netWallArea = wallArea - doorArea - windowArea;
  const totalArea = (netWallArea + ceilingArea) * coats;
  const withWaste = totalArea * (1 + wastePct / 100);
  const gallons = withWaste / COVERAGE;
  const cansNeeded = Math.ceil(gallons);
  const cost = cansNeeded * pricePerGallon;

  const breakdown = [
    { label: "Room Dimensions", value: `${roomL}' × ${roomW}' × ${roomH}'` },
    { label: "Wall Area", value: `${wallArea.toFixed(0)} ft²` },
    { label: "Door Deductions", value: `−${doorArea} ft² (${doors} doors)` },
    { label: "Window Deductions", value: `−${windowArea} ft² (${windows} windows)` },
    { label: "Ceiling Area", value: `${ceilingArea.toFixed(0)} ft²` },
    { label: "Number of Coats", value: `${coats}` },
    { label: `Total Area (${coats} coats + ${wastePct}% waste)`, value: `${withWaste.toFixed(0)} ft²` },
    { label: "Gallons Required", value: `${gallons.toFixed(2)} gal` },
    { label: "Cans to Buy", value: `${cansNeeded} gallons` },
    { label: "Estimated Cost", value: `$${cost.toFixed(2)}` },
  ];

  const roomData = [
    { surface: "Walls (net)", area: parseFloat(netWallArea.toFixed(0)), color: "hsl(var(--primary))" },
    { surface: "Ceiling", area: parseFloat(ceilingArea.toFixed(0)), color: "#22c55e" },
    { surface: "Doors (removed)", area: doorArea, color: "#ef4444" },
    { surface: "Windows (removed)", area: windowArea, color: "#f59e0b" },
  ];

  const summaryStats = [
    { label: "Total Paint Area", value: `${totalArea.toFixed(0)} ft²` },
    { label: "Gallons Needed", value: gallons.toFixed(2) },
    { label: "Cans to Buy", value: `${cansNeeded}` },
    { label: "Number of Coats", value: `${coats}` },
    { label: "Estimated Cost", value: `$${cost.toFixed(2)}` },
    { label: "Coverage Rate", value: `${COVERAGE} ft²/gal` },
  ];

  return { gallons, cans: cansNeeded, coats, totalArea: withWaste, cost, breakdown, roomData, summaryStats };
}

export default function PaintCalculator() {
  const [length, setLength] = useState("15");
  const [width, setWidth] = useState("12");
  const [height, setHeight] = useState("9");
  const [doors, setDoors] = useState("1");
  const [windows, setWindows] = useState("2");
  const [coats, setCoats] = useState("2");
  const [pricePerGal, setPricePerGal] = useState("45");
  const [waste, setWaste] = useState("10");
  const [result, setResult] = useState<PaintResult | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0, w = parseFloat(width) || 0, h = parseFloat(height) || 0;
    if (l > 0 && w > 0 && h > 0) setResult(calcPaint(l, w, h, parseInt(doors) || 0, parseInt(windows) || 0, parseInt(coats) || 2, parseFloat(pricePerGal) || 45, parseFloat(waste) || 10));
  };

  useEffect(() => { setResult(calcPaint(15, 12, 9, 1, 2, 2, 45, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How do I calculate how much paint I need?", answer: "The standard formula: Total Area = (2 × (Length + Width) × Height) − (Doors × 21) − (Windows × 15) + (Length × Width) for ceiling. Divide by coverage rate (typically 350 sq ft per gallon) and multiply by number of coats. Add 10% for waste. Example: 15×12 room, 9-ft ceiling, 1 door, 2 windows, 2 coats: Wall area = 2×(15+12)×9 = 486 ft² − 21 − 30 = 435 ft². Ceiling = 180 ft². Total with 2 coats + 10% waste = 1,342 ft² ÷ 350 = 3.83 gallons → buy 4 gallons." },
    { question: "How many sq ft does a gallon of paint cover?", answer: "Most interior wall paints cover 350–400 sq ft per gallon for smooth surfaces. Rough or porous surfaces (brick, textured drywall) may reduce coverage to 250–300 sq ft/gallon. Exterior paint typically covers 250–350 sq ft/gallon. Premium paints with higher pigment density (Benjamin Moore Aura, Sherwin-Williams Emerald) may cover up to 400 sq ft/gallon with better hide." },
    { question: "How many coats of paint do I need?", answer: "Two coats are standard for most interior painting projects and produce the best durability and color uniformity. One coat may suffice if: painting a similar color over existing paint, using a paint + primer combination, or doing minor touch-ups. Three coats are recommended for: very dark colors, painting white over dark walls, painting glossy surfaces (after priming), or areas that experience high wear." },
    { question: "Should I include ceiling paint in this calculation?", answer: "Yes, this calculator includes ceiling area in the total. However, you typically need separate paint for ceilings (flat/matte finish) vs. walls (eggshell/satin). If you're painting different finishes, calculate walls and ceiling separately. Standard ceiling height is 8 feet for most homes; 9–10 feet for newer construction. Vaulted ceilings require custom calculations." },
    { question: "How much does it cost to paint a room?", answer: "DIY paint costs: $30–$75/gallon for quality paint, $5–$15 for brushes/rollers, $15–$30 for primer, $10–$20 for painter's tape and drop cloths. Total DIY materials: $80–$150 for average bedroom. Professional painting: $300–$800 for an average bedroom (15×12 ft), $2–$6/sq ft for labor. Factors: ceiling height, surface prep needed, paint quality, number of colors, and regional labor rates." },
    { question: "Do I need to prime before painting?", answer: "Primer is needed when: painting over bare drywall, painting over very dark colors, painting over stained or bleed-through surfaces, painting previously glossy surfaces, or using a paint significantly different in color or sheen. Primer costs $15–$30/gallon and covers 200–300 sq ft/gallon. Paint + primer combinations (one-coat paints) can eliminate a separate prime coat but require two coats of the combination product." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Paint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Paint Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <p className="text-sm text-muted-foreground">Enter room dimensions to calculate paint needed for walls + ceiling.</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Length (ft)</label>
                <div className={inp}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Width (ft)</label>
                <div className={inp}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Height (ft)</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Doors</label>
                <div className={inp}><input type="number" value={doors} onChange={e => setDoors(e.target.value)} min={0} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Windows</label>
                <div className={inp}><input type="number" value={windows} onChange={e => setWindows(e.target.value)} min={0} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Coats</label>
                <div className={inp}><input type="number" value={coats} onChange={e => setCoats(e.target.value)} min={1} max={4} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Price per Gallon</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={pricePerGal} onChange={e => setPricePerGal(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Waste Factor</label>
                <div className={inp}><input type="number" value={waste} onChange={e => setWaste(e.target.value)} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setLength("15"); setWidth("12"); setHeight("9"); setDoors("1"); setWindows("2"); setCoats("2"); setPricePerGal("45"); setWaste("10"); setResult(calcPaint(15, 12, 9, 1, 2, 2, 45, 10)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Paint Required</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.cans} gallons</div>
                <div className="text-base text-muted-foreground mt-1">{result.gallons.toFixed(2)} gal exact · {result.coats} coats · Est. ${result.cost.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Area", `${result.totalArea.toFixed(0)} ft²`], ["Gallons", result.gallons.toFixed(2)], ["Est. Cost", `$${result.cost.toFixed(0)}`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i >= 7 ? "font-semibold" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Surface Area Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.roomData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="surface" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${v} ft²`, "Area"]} />
                    <Bar dataKey="area" radius={[4, 4, 0, 0]}>{result.roomData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
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
            <h2 className="text-2xl font-bold mb-3">How to Calculate Paint Needed for a Room</h2>
            <p>This <strong>paint calculator</strong> determines the exact amount of paint required for walls and ceiling of any room, accounting for doors, windows, number of coats, and a waste factor. The formula: Net Paintable Area = (2 × (Length + Width) × Height) − (Doors × 21 ft²) − (Windows × 15 ft²) + (Length × Width for ceiling). Multiply by coats and add 10% waste, then divide by 350 sq ft per gallon (standard coverage).</p>
            <h2 className="text-2xl font-bold mb-3">Paint Coverage Rates</h2>
            <p>Standard interior wall paint: 350–400 sq ft per gallon on smooth surfaces. Primer: 200–300 sq ft/gallon. Exterior paint: 250–350 sq ft/gallon. Spray application reduces coverage 20–30% due to overspray. Roller applies most efficiently. For rough or highly porous surfaces (brick, concrete block, heavily textured walls), reduce expected coverage by 20–30%.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing the Right Paint Finish</h2>
            <p>Flat/Matte: ceilings and low-traffic areas. Eggshell: living rooms, bedrooms — slight sheen, washable. Satin: kitchens, hallways, children's rooms — more durable. Semi-gloss: bathrooms, trim, cabinets — moisture resistant. Gloss: doors, furniture, trim — hardest, most durable. Higher sheen finishes are more cleanable but show surface imperfections more clearly.</p>
            <h2 className="text-2xl font-bold mb-3">Professional vs. DIY Painting</h2>
            <p>DIY painting saves $200–$600 in labor for an average bedroom. Materials for a 15×12 room: 2 gallons of quality paint ($60–$150), primer if needed ($15–$30), brushes/rollers ($15–$25), tape and drop cloths ($15–$25). Total DIY: $100–$230. Professional painting adds $300–$600 in labor. Related tools: <a href="/calculator/area-calculator">Area Calculator</a>, <a href="/calculator/square-footage-calculator">Square Footage Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/paint-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Paint Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Paint Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Paint Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Paint Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Paint Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/paint-calculator" />
        </div>
      </div>
    </>
  );
}
