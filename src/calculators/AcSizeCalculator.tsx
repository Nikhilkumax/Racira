"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const CEILING_HEIGHT = 9; // ft default
const BTU_PER_SQFT = 20; // base for comfortable rooms
const ROOM_PRESETS = [
  { label: "Bedroom (150 sq ft)", sqft: 150 },
  { label: "Living Room (300 sq ft)", sqft: 300 },
  { label: "Office (200 sq ft)", sqft: 200 },
  { label: "Studio Apt (450 sq ft)", sqft: 450 },
  { label: "2BR Apartment (800 sq ft)", sqft: 800 },
];

const AcSizeCalculator = () => {
  const [sqft, setSqft] = useState("300");
  const [ceilingHeight, setCeilingHeight] = useState("9");
  const [sunExposure, setSunExposure] = useState<"shaded" | "normal" | "sunny">("normal");
  const [occupants, setOccupants] = useState("2");
  const [kitchen, setKitchen] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = (s = sqft, ch = ceilingHeight, sun = sunExposure, occ = occupants, kit = kitchen) => {
    const area = parseFloat(s);
    const height = parseFloat(ch);
    const numOcc = parseInt(occ);
    if (isNaN(area) || area <= 0 || isNaN(height) || height <= 0) return;

    // Base BTU: 20 BTU/sqft is standard
    let btu = area * BTU_PER_SQFT;

    // Ceiling height adjustment (base is 8ft)
    const heightFactor = height / 8;
    btu *= heightFactor;

    // Sun exposure
    if (sun === "sunny") btu *= 1.1;
    if (sun === "shaded") btu *= 0.9;

    // Occupants (base 2, add 600 BTU per extra person)
    if (!isNaN(numOcc) && numOcc > 2) btu += (numOcc - 2) * 600;

    // Kitchen adds 4000 BTU
    if (kit) btu += 4000;

    const tons = btu / 12000;
    const kw = btu * 0.000293071;

    // Round up to nearest standard AC size
    const standardSizes = [0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
    const recommendedTons = standardSizes.find(t => t >= tons) || 5;
    const recommendedBtu = recommendedTons * 12000;

    const chartData = [
      { label: "Base Load", btu: Math.round(area * BTU_PER_SQFT * (height / 8)), color: "#3b82f6" },
      { label: "Sun Adj.", btu: Math.round(area * BTU_PER_SQFT * (height / 8) * (sun === "sunny" ? 0.1 * area * BTU_PER_SQFT * (height / 8) / area / BTU_PER_SQFT * area * BTU_PER_SQFT * (height / 8) : sun === "shaded" ? -0.1 * area * BTU_PER_SQFT * (height / 8) : 0) / (area * BTU_PER_SQFT * (height / 8))), color: sun === "sunny" ? "#f59e0b" : "#10b981" },
      { label: "Occupants", btu: Math.max(0, (!isNaN(numOcc) && numOcc > 2) ? (numOcc - 2) * 600 : 0), color: "#8b5cf6" },
      { label: "Kitchen", btu: kit ? 4000 : 0, color: "#ef4444" },
    ];

    // Simpler chart
    const simpleChart = [
      { label: "Calculated", btu: Math.round(btu), color: "#3b82f6" },
      { label: "Recommended", btu: recommendedBtu, color: "#10b981" },
    ];

    setResult({ area, btu: Math.round(btu), tons: parseFloat(tons.toFixed(2)), kw: parseFloat(kw.toFixed(2)), recommendedTons, recommendedBtu, simpleChart });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setSqft("300"); setCeilingHeight("9"); setSunExposure("normal"); setOccupants("2"); setKitchen(false);
    calculate("300", "9", "normal", "2", false);
  };

  const faqs = [
    { question: "How many BTU do I need per square foot?", answer: "The standard rule of thumb is 20 BTU per square foot for a standard ceiling height of 8–9 feet. A 300 sq ft room needs about 6,000 BTU. However, adjust for ceiling height, sun exposure, number of occupants, and heat sources like kitchens. Window AC units typically come in sizes from 5,000 BTU (100–150 sqft) to 25,000 BTU (up to 1,500 sqft)." },
    { question: "What does 1 ton of AC mean?", answer: "One ton of refrigeration = 12,000 BTU/hour. Originally, it was the amount of heat required to melt 1 ton of ice in 24 hours (2000 lbs × 144 BTU/lb ÷ 24h = 12,000 BTU/h). Residential AC units typically range from 1 to 5 tons (12,000–60,000 BTU). Central air conditioners are rated in tons; window units are rated in BTU directly." },
    { question: "Does ceiling height affect AC size?", answer: "Yes. A higher ceiling increases room volume, meaning more air to cool. A 300 sq ft room with 10 ft ceilings has 3,000 cubic feet of air vs 2,400 cubic feet with 8 ft ceilings — 25% more. This calculator adjusts BTU by the ceiling height factor (actual height / 8 ft baseline). For rooms with very high ceilings (12+ ft), add 10–20% more capacity." },
    { question: "What size AC for a 300 square foot room?", answer: "A 300 sq ft room with normal sun exposure and 9 ft ceilings needs approximately 6,750 BTU. The nearest standard size is 8,000 BTU (0.67 tons) or a standard 1-ton (12,000 BTU) unit. The 12,000 BTU provides headroom for hot days and maintains efficiency. An undersized unit will run constantly; an oversized unit short-cycles and creates humidity problems." },
    { question: "Why shouldn't I buy a bigger AC unit?", answer: "Bigger is not always better for AC. An oversized unit cools the room quickly but short-cycles (turns on and off frequently). Short-cycling prevents proper dehumidification, leaving the room feeling clammy even if it's cool. It also causes more wear on the compressor and uses more electricity. The ideal AC runs for 15–20 minutes per cycle to properly dehumidify and maintain even temperature." },
    { question: "Does sun exposure really matter?", answer: "Yes, significantly. A south or west-facing room with large windows can receive 30–50% more solar heat gain than a north-facing room. This calculator adds 10% capacity for sunny rooms and subtracts 10% for well-shaded ones. In very hot, sunny climates (Phoenix, Las Vegas), you may want to add an additional 10–20% on top of this adjustment." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home", href: "/calculator#home" }, { label: "AC Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AC Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            {/* Presets */}
            <div>
              <label className="text-base font-medium block mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {ROOM_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => { setSqft(String(p.sqft)); }} className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${sqft === String(p.sqft) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Room Area (sq ft)</label>
                <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Ceiling Height (ft)</label>
                <input type="number" value={ceilingHeight} onChange={(e) => setCeilingHeight(e.target.value)} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Occupants</label>
                <input type="number" value={occupants} onChange={(e) => setOccupants(e.target.value)} min={1} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Sun Exposure</label>
              <div className="flex gap-2">
                {(["shaded", "normal", "sunny"] as const).map((opt) => (
                  <button key={opt} onClick={() => setSunExposure(opt)} className={`flex-1 h-9 rounded-md border text-sm font-medium capitalize transition-colors ${sunExposure === opt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{opt}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="kitchen" checked={kitchen} onChange={(e) => setKitchen(e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="kitchen" className="text-sm font-medium cursor-pointer">Room has/is adjacent to kitchen (+4,000 BTU)</label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Recommended AC Size</div>
                <div className="text-4xl font-bold text-primary">{result.recommendedTons} Ton</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.recommendedBtu, 0)} BTU/h • {fmt(result.recommendedTons * 3.517, 2)} kW</div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Room Area", value: `${fmt(result.area, 0)} sq ft` },
                    { label: "Calculated BTU", value: `${fmt(result.btu, 0)} BTU/h` },
                    { label: "Calculated Tons", value: `${result.tons} tons` },
                    { label: "Calculated kW", value: `${result.kw} kW` },
                    { label: "Recommended Size", value: `${result.recommendedTons} ton (${fmt(result.recommendedBtu, 0)} BTU)` },
                    { label: "Standard AC Options", value: "1 ton = 12,000 BTU" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">BTU Comparison</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={result.simpleChart} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} BTU`, ""]} />
                    <Bar dataKey="btu" radius={[4, 4, 0, 0]}>
                      {result.simpleChart.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Standard AC Sizes Reference</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[[0.75, "Small bedroom"], [1.0, "Bedroom"], [1.5, "Large bedroom"], [2.0, "Living room"], [2.5, "Large living room"], [3.0, "Open plan"]].map(([t, label]) => (
                    <div key={String(t)} className={`rounded-lg p-2 text-center border ${result.recommendedTons === t ? "bg-primary/10 border-primary text-primary font-semibold" : "border-border"}`}>
                      <div className="font-bold">{t} ton</div>
                      <div className="text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an AC Size Calculator?</h2>
            <p>An AC size calculator determines the right cooling capacity (in BTU/hour or tons) for your room. Pre-filled with a 300 sq ft room at normal sun exposure, it recommends a 1-ton (12,000 BTU) unit. Inputs include ceiling height, occupants, sun exposure, and whether the room has a kitchen — all factors that affect heat load significantly.</p>
            <h2>The BTU Formula</h2>
            <p><strong>Base BTU = Area (sq ft) × 20 BTU/sqft × (ceiling height / 8)</strong>. Then add adjustments: sunny rooms +10%, shaded −10%; each extra occupant beyond 2 adds 600 BTU; kitchen adds 4,000 BTU. Round up to the nearest standard AC size (0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, or 5 tons).</p>
            <h2>How Many BTU Per Square Foot?</h2>
            <p>The standard is 20 BTU per square foot at 8–9 ft ceiling height. This baseline was established by ASHRAE (American Society of Heating, Refrigerating and Air-Conditioning Engineers). In hot, humid climates (Florida, Texas), consider using 25 BTU/sqft. In mild climates (Pacific Northwest), 18 BTU/sqft may suffice. Always size up rather than down.</p>
            <h2>Tons vs BTU: AC Capacity Units</h2>
            <p>1 ton = 12,000 BTU/hour = 3.517 kW of cooling capacity. Central AC units are sold in half-ton increments (1, 1.5, 2, 2.5, 3 tons). Window AC units are sold by BTU (5,000 to 25,000 BTU). Mini-split (ductless) systems typically range 9,000–36,000 BTU (0.75–3 tons) per indoor unit, with multi-zone systems combining multiple indoor units.</p>
            <h2>The Danger of Oversizing AC</h2>
            <p>An oversized AC cools the room too quickly, short-cycling before adequately removing humidity. This leaves a room that feels cold and clammy — the "meat locker" feeling. Short-cycling also increases compressor wear and electricity consumption from frequent startups. For best comfort and efficiency, choose a unit that runs 15–20 minutes per cycle to complete the dehumidification process.</p>
            <h2>SEER Rating and Efficiency</h2>
            <p>SEER (Seasonal Energy Efficiency Ratio) measures cooling output / electrical input over a season. Higher SEER = more efficient. Minimum SEER in the US is 14 (new regulations). High-efficiency units achieve SEER 20–28. An 18 SEER unit uses 22% less electricity than a 14 SEER unit. If you run AC 8 hours/day for 120 days, upgrading from SEER 14 to SEER 20 saves approximately $150/year on electricity for a 2-ton unit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ac-size-calculator" />
          <PopularCalculators exclude="/calculator/ac-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default AcSizeCalculator;
