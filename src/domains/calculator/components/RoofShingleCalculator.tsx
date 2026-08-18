"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ShingleInput {
  roofArea: number;
  coveragePerBundle: number;
  wasteFactor: number;
  pricePerBundle: number;
}

interface ShingleResult {
  roofSquares: number;
  netBundles: number;
  wasteBundles: number;
  totalBundles: number;
  totalCost: number;
  chartData: { name: string; bundles: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcShingles(input: ShingleInput): ShingleResult {
  const roofSquares = input.roofArea > 0 ? input.roofArea / 100 : 0;
  const netBundles = input.coveragePerBundle > 0 ? Math.ceil(input.roofArea / input.coveragePerBundle) : 0;
  const wasteBundles = Math.ceil(netBundles * (Math.max(0, input.wasteFactor) / 100));
  const totalBundles = netBundles + wasteBundles;
  const totalCost = totalBundles * input.pricePerBundle;

  const chartData = [
    { name: "Net Bundles", bundles: netBundles, fill: "hsl(var(--primary))" },
    { name: "Waste Bundles", bundles: wasteBundles, fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Roof Area", value: `${input.roofArea.toLocaleString()} sq ft` },
    { label: "Roof Squares (100 sq ft)", value: `${roofSquares.toFixed(1)} squares` },
    { label: "Coverage per Bundle", value: `${input.coveragePerBundle.toFixed(1)} sq ft` },
    { label: "Net Bundles Required", value: `${netBundles} bundles` },
    { label: "Waste Allowance", value: `${Math.max(0, input.wasteFactor).toFixed(1)}% (${wasteBundles} bundles)` },
    { label: "Total Bundles to Buy", value: `${totalBundles} bundles` },
    { label: "Price per Bundle", value: `$${input.pricePerBundle.toFixed(2)}` },
    { label: "Estimated Material Cost", value: `$${totalCost.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Total Bundles", value: `${totalBundles}` },
    { label: "Roof Squares", value: `${roofSquares.toFixed(1)}` },
    { label: "Est. Material Cost", value: `$${totalCost.toLocaleString()}` },
    { label: "Net Bundles", value: `${netBundles}` },
    { label: "Waste Bundles", value: `${wasteBundles}` },
    { label: "Cost per Square", value: `$${roofSquares > 0 ? (totalCost / roofSquares).toFixed(2) : "—"}` },
  ];

  return { roofSquares, netBundles, wasteBundles, totalBundles, totalCost, chartData, breakdown, summaryStats };
}

const DEFAULTS: ShingleInput = { roofArea: 1500, coveragePerBundle: 33.33, wasteFactor: 10, pricePerBundle: 38 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RoofShingleCalculator() {
  const [roofArea, setRoofArea] = useState(String(DEFAULTS.roofArea));
  const [coverage, setCoverage] = useState(String(DEFAULTS.coveragePerBundle));
  const [waste, setWaste] = useState(String(DEFAULTS.wasteFactor));
  const [price, setPrice] = useState(String(DEFAULTS.pricePerBundle));
  const [result, setResult] = useState<ShingleResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcShingles({ roofArea: parse(roofArea, DEFAULTS.roofArea), coveragePerBundle: parse(coverage, DEFAULTS.coveragePerBundle), wasteFactor: parse(waste, DEFAULTS.wasteFactor), pricePerBundle: parse(price, DEFAULTS.pricePerBundle) }));
  const reset = () => {
    setRoofArea(String(DEFAULTS.roofArea));
    setCoverage(String(DEFAULTS.coveragePerBundle));
    setWaste(String(DEFAULTS.wasteFactor));
    setPrice(String(DEFAULTS.pricePerBundle));
    setResult(calcShingles(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcShingles(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How many shingles do I need?", answer: "Divide your roof area by the coverage per bundle, round up, then add a waste allowance of 5–15% for cutoffs, valleys, and mistakes. A standard bundle of three-tab or architectural shingles covers about 33.3 sq ft, so a 1,500 sq ft roof needs roughly 45 net bundles plus waste." },
    { question: "What is a roofing square?", answer: "A roofing square is 100 square feet of roof surface. Roofing materials are quoted per square: a typical bundle covers 1/3 of a square, so three bundles per square. Your 1,500 sq ft roof is 15 squares, needing about 45 bundles before waste." },
    { question: "How much waste should I add?", answer: "Add 10% for standard gable roofs with simple valleys. Complex roofs with hips, valleys, dormers, and penetrations may need 15–20%. Steep slopes increase waste from cut shingles. Buy slightly more than estimated — leftover bundles are usually returnable, but running short mid-job costs far more." },
    { question: "How do I measure my roof area?", answer: "Measure each roof plane (length × width), add the planes together, then apply the roof pitch multiplier: a 4/12 pitch adds about 5%, a 6/12 about 12%, and an 8/12 about 20% over the flat footprint. For a single-story home, you can often measure the footprint from the ground and multiply by the pitch factor." },
    { question: "What else affects cost?", answer: "Beyond shingles, budget for underlayment (felt or synthetic), drip edge, flashing, ridge caps, nails, and labor — typically 40–60% of the total project cost. Removal and disposal of the old roof adds $1–$2 per square foot. Get 3–4 contractor quotes to compare." },
    { question: "Are ridge cap shingles included?", answer: "Ridge cap shingles are usually cut from standard bundles: one bundle yields roughly 20–25 linear feet of hip and ridge cap. Most roofers include this in the standard waste allowance, but confirm with your supplier that your bundle count covers ridge coverage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Roof Shingle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Roof Shingle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Roof Area</label>
                <div className={inp}><input type="number" value={roofArea} onChange={(e) => setRoofArea(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sq ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Coverage per Bundle</label>
                <div className={inp}><input type="number" value={coverage} onChange={(e) => setCoverage(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sq ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Waste Factor</label>
                <div className={inp}><input type="number" value={waste} onChange={(e) => setWaste(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Price per Bundle</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Bundles Needed</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.totalBundles} bundles</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.roofSquares.toFixed(1)} squares · Est. material cost: ${result.totalCost.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Total Bundles", `${result.totalBundles}`], ["Roof Squares", `${result.roofSquares.toFixed(1)}`], ["Est. Cost", `$${result.totalCost.toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Material Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Bundle Requirement</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} bundles`, ""]} />
                      <Bar dataKey="bundles" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Many Roof Shingles Do You Need?</h2>
            <p>Roofing materials are sold by the bundle and quoted by the square (100 sq ft). Most bundles of architectural shingles cover 33.3 sq ft — three bundles per square. To estimate your requirement, divide the total roof area by bundle coverage, round up to whole bundles, and add a waste allowance for valleys, hips, cutoffs, and mistakes.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Waste Factor</h2>
            <p>Simple gable roofs: add 10%. Complex roofs with hips, valleys, and dormers: add 15–20%. Steep pitches increase cutting waste and may warrant a higher factor. Buying a few extra bundles is inexpensive insurance — a mid-job shortage means a second delivery, possible color-mismatch risk, and delayed progress.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond the Shingles</h2>
            <p>Your material estimate should also include underlayment, drip edge, flashing, ridge caps, and nails. Labor typically represents 40–60% of total roofing cost. Use this calculator to establish the shingle budget, then add roughly $3.50–$5.50 per square foot for a fully installed asphalt shingle roof.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roof-shingle-calculator" />
          <PopularCalculators exclude="/calculator/roof-shingle-calculator" />
        </div>
      </div>
    </>
  );
}
