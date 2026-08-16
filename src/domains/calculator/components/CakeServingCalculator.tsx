"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ServingResult {
  servings: number;
  area: number;
  shape: string;
  tierCount: number;
  servingVolume: number;
  perTier: { name: string; value: number }[];
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcServings(diameter: number, height: number, shape: "round" | "square" | "sheet", servingsPerSlice: number, tiers: number): ServingResult {
  const d = Math.max(0, diameter);
  const h = Math.max(1, height);
  const area = shape === "round" ? Math.PI * Math.pow(d / 2, 2) : shape === "square" ? d * d : d * (d * 0.67);
  // Standard party serving ≈ 8 in³ (2"x2"x2"); wedding serving ≈ 4 in³ (1"x2"x2")
  const servingVolume = servingsPerSlice;
  const servingsPerTier = Math.max(0, Math.floor((area * h) / servingVolume));
  const total = servingsPerTier * Math.max(1, tiers);

  const perTier: { name: string; value: number }[] = [];
  for (let t = 0; t < Math.max(1, tiers); t++) {
    const tierD = Math.max(4, d - t * 3);
    const tierArea = shape === "round" ? Math.PI * Math.pow(tierD / 2, 2) : shape === "square" ? tierD * tierD : tierD * (tierD * 0.67);
    perTier.push({ name: `Tier ${t + 1} (${tierD}")`, value: Math.max(0, Math.floor((tierArea * h) / servingVolume)) });
  }

  return {
    servings: total,
    area,
    shape,
    tierCount: Math.max(1, tiers),
    servingVolume,
    perTier,
    chartData: perTier,
    breakdown: [
      { label: "Cake Diameter/Width", value: `${d} in` },
      { label: "Cake Height", value: `${h} in` },
      { label: "Shape", value: shape === "round" ? "Round" : shape === "square" ? "Square" : "Sheet" },
      { label: "Surface Area", value: `${area.toFixed(0)} in²` },
      { label: "Serving Size", value: `${servingVolume} in³ per serving` },
      { label: "Number of Tiers", value: `${Math.max(1, tiers)}` },
      { label: "Servings per Tier", value: `${perTier.length > 0 ? perTier[0].value : 0}` },
      { label: "Total Servings", value: `${total}` },
    ],
    summaryStats: [
      { label: "Total Servings", value: `${total}` },
      { label: "Servings/Tier", value: `${perTier.length > 0 ? perTier[0].value : 0}` },
      { label: "Tiers", value: `${Math.max(1, tiers)}` },
      { label: "Area", value: `${area.toFixed(0)} in²` },
      { label: "Serving Size", value: `${servingVolume} in³` },
      { label: "Guests Served", value: `${total} people` },
    ],
  };
}

const DEFAULTS = { diameter: "10", height: "4", shape: "round" as "round" | "square" | "sheet", serving: "8", tiers: "1" };

export default function CakeServingCalculator() {
  const [diameter, setDiameter] = useState(DEFAULTS.diameter);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [shape, setShape] = useState<"round" | "square" | "sheet">(DEFAULTS.shape);
  const [serving, setServing] = useState(DEFAULTS.serving);
  const [tiers, setTiers] = useState(DEFAULTS.tiers);
  const [result, setResult] = useState<ServingResult>(() => calcServings(10, 4, "round", 8, 1));

  const calculate = () => setResult(calcServings(parseFloat(diameter) || 0, parseFloat(height) || 0, shape, parseFloat(serving) || 8, parseInt(tiers) || 1));
  const reset = () => { setDiameter(DEFAULTS.diameter); setHeight(DEFAULTS.height); setShape(DEFAULTS.shape); setServing(DEFAULTS.serving); setTiers(DEFAULTS.tiers); setResult(calcServings(10, 4, "round", 8, 1)); };
  useEffect(() => { setResult(calcServings(10, 4, "round", 8, 1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How many servings are in a 10-inch cake?", answer: "A standard 10-inch round cake, 4 inches tall with party slices, serves about 25–30 people. This calculator uses the cake's volume (area × height) divided by the serving size, which gives a more accurate estimate than diameter alone." },
    { question: "What is the difference between party and wedding servings?", answer: "Party servings are roughly 2\"×2\"×2\" (8 in³) — generous dessert portions. Wedding servings are 1\"×2\"×2\" (4 in³) — smaller slices served after dinner. Wedding portions yield about twice as many servings per cake." },
    { question: "How do I size a tiered wedding cake?", answer: "Each tier shrinks in diameter as it stacks. Common stack sizes are 6\", 8\", 10\", and 12\". This calculator estimates servings per tier using the progressively smaller diameters so your total reflects the real cake." },
    { question: "How much cake do I need for 50 guests?", answer: "For 50 party servings you need about 400 in³ of cake — a single 14-inch round, two 10-inch rounds, or a half-sheet cake. For 50 wedding servings, roughly half that volume works." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Cake Serving Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cake Serving Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cake Shape</label>
              <div className="grid grid-cols-3 gap-2 rounded-md border border-input p-1 bg-background">
                {([["round", "Round"], ["square", "Square"], ["sheet", "Sheet"]] as const).map(([s, label]) => (
                  <button key={s} onClick={() => setShape(s)} className={`h-9 rounded-md text-sm font-semibold transition-colors ${shape === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Diameter / Width</label>
                <div className={inp}><input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} className={ci} min={0} step={0.5} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Cake Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min={0} step={0.5} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Serving Size</label>
                <div className={inp}><input type="number" value={serving} onChange={e => setServing(e.target.value)} className={ci} min={1} step={1} /><span className="pr-3 text-muted-foreground text-sm">in³</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number of Tiers</label>
                <div className={inp}><input type="number" value={tiers} onChange={e => setTiers(e.target.value)} className={ci} min={1} max={5} step={1} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Servings</div>
              <div className="text-4xl font-extrabold text-primary">{result.servings} <span className="text-2xl">people</span></div>
              <div className="text-sm text-muted-foreground mt-1">{shape === "round" ? `${diameter}" round` : shape === "square" ? `${diameter}" square` : `${diameter}" sheet`} · {result.area.toFixed(0)} in² · {result.servingVolume} in³ slices</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Servings/Tier", `${result.perTier.length > 0 ? result.perTier[0].value : 0}`], ["Tiers", `${result.tierCount}`], ["Serving Size", `${result.servingVolume} in³`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Serving Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Servings per Tier</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.perTier} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v} servings`]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={55}>
                    {result.perTier.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Cake Servings Are Calculated</h2>
            <p>A <strong>cake serving calculator</strong> estimates how many people a cake feeds by computing its volume — surface area times height — and dividing by the serving size. This is far more reliable than diameter-only charts, because a tall 8-inch cake feeds more people than a short 10-inch one.</p>
            <h2 className="text-2xl font-bold mb-3">Serving Size Conventions</h2>
            <p>Party slices are about 2\" × 2\" × 2\", or 8 cubic inches — a generous dessert portion. Wedding slices are about 1\" × 2\" × 2\", or 4 cubic inches, roughly doubling the yield. Bakeries quote either number, so always confirm which convention applies before ordering.</p>
            <h2 className="text-2xl font-bold mb-3">Tiered Cakes</h2>
            <p>For stacked cakes, each tier is a smaller diameter than the one below it (commonly 6\", 8\", 10\", 12\"). This calculator models the shrinking tiers and sums each one's servings, giving an accurate total for tiered wedding cakes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cake-serving-calculator" />
          <PopularCalculators exclude="/calculator/cake-serving-calculator" />
        </div>
      </div>
    </>
  );
}
