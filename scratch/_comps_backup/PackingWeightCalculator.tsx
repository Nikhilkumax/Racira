"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PackingInputs {
  suitcase: number;   // lb
  clothing: number;
  shoes: number;
  toiletries: number;
  electronics: number;
  other: number;
  limit: number;      // airline limit lb
}

interface PackingResults {
  total: number;
  remaining: number;
  overLimit: boolean;
  pctOfLimit: number;
  chartData: { name: string; weight: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcPacking(i: PackingInputs): PackingResults {
  const total = i.suitcase + i.clothing + i.shoes + i.toiletries + i.electronics + i.other;
  const remaining = i.limit - total;
  const overLimit = remaining < 0;
  const pctOfLimit = i.limit > 0 ? (total / i.limit) * 100 : 0;

  const chartData = [
    { name: "Suitcase", weight: +i.suitcase.toFixed(1) },
    { name: "Clothing", weight: +i.clothing.toFixed(1) },
    { name: "Shoes", weight: +i.shoes.toFixed(1) },
    { name: "Toiletries", weight: +i.toiletries.toFixed(1) },
    { name: "Electronics", weight: +i.electronics.toFixed(1) },
    { name: "Other", weight: +i.other.toFixed(1) },
  ];

  const breakdown = [
    { label: "Suitcase", value: `${i.suitcase.toFixed(1)} lb` },
    { label: "Clothing", value: `${i.clothing.toFixed(1)} lb` },
    { label: "Shoes", value: `${i.shoes.toFixed(1)} lb` },
    { label: "Toiletries", value: `${i.toiletries.toFixed(1)} lb` },
    { label: "Electronics", value: `${i.electronics.toFixed(1)} lb` },
    { label: "Other", value: `${i.other.toFixed(1)} lb` },
    { label: "Total Packed Weight", value: `${total.toFixed(1)} lb`, highlight: true, isTotal: true },
    { label: `Airline Limit (${i.limit} lb)`, value: overLimit ? `OVER by ${Math.abs(remaining).toFixed(1)} lb` : `${remaining.toFixed(1)} lb to spare` },
  ];

  const summaryStats = [
    { label: "Total Packed Weight", value: `${total.toFixed(1)} lb` },
    { label: "Airline Limit", value: `${i.limit} lb` },
    { label: "Remaining Capacity", value: `${remaining.toFixed(1)} lb` },
    { label: "Percent of Limit", value: `${pctOfLimit.toFixed(0)}%` },
    { label: "Status", value: overLimit ? "Over limit — unpack!" : "Within limit" },
    { label: "Clothing", value: `${i.clothing.toFixed(1)} lb` },
    { label: "Shoes", value: `${i.shoes.toFixed(1)} lb` },
    { label: "Electronics", value: `${i.electronics.toFixed(1)} lb` },
  ];

  return { total, remaining, overLimit, pctOfLimit, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  suitcase: "8",
  clothing: "10",
  shoes: "5",
  toiletries: "4",
  electronics: "3",
  other: "3",
  limit: "50",
};

// 4. Component
export default function PackingWeightCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PackingResults>(() => calcPacking({ suitcase: 8, clothing: 10, shoes: 5, toiletries: 4, electronics: 3, other: 3, limit: 50 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPacking({ suitcase: 8, clothing: 10, shoes: 5, toiletries: 4, electronics: 3, other: 3, limit: 50 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcPacking({
        suitcase: parseFloat(inputs.suitcase) || 0,
        clothing: parseFloat(inputs.clothing) || 0,
        shoes: parseFloat(inputs.shoes) || 0,
        toiletries: parseFloat(inputs.toiletries) || 0,
        electronics: parseFloat(inputs.electronics) || 0,
        other: parseFloat(inputs.other) || 0,
        limit: parseFloat(inputs.limit) || 50,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPacking({ suitcase: 8, clothing: 10, shoes: 5, toiletries: 4, electronics: 3, other: 3, limit: 50 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const limit = parseFloat(inputs.limit) || 0;
  if (limit < 10 || limit > 100) errors.limit = "Must be 10–100 lb";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much does a packed suitcase weigh?", answer: "A typical 24–26-inch checked suitcase weighs 8–12 lb empty, and a week's worth of packing adds 15–30 lb depending on the destination. The defaults here — 33 lb total — are a realistic mid-range week-long trip. Weighing your suitcase before leaving home is the only way to be sure." },
    { question: "What's the standard checked bag weight limit?", answer: "Most US and international airlines allow 50 lb (23 kg) for standard checked bags. Budget carriers often drop to 40 lb, and some international flights use 30 kg (66 lb) for premium cabins. Overweight bags trigger fees of $50–150 per bag, so knowing your airline's exact limit matters — the calculator's default is the common 50 lb." },
    { question: "How can I cut weight fast?", answer: "Shoes are the heaviest single category — one pair can weigh 2–3 lb — so wear your heaviest pair and pack one versatile pair. Toiletries in travel sizes save 1–2 lb. A hard-shell suitcase is often 2–3 lb heavier than a soft one of the same size. And leave the laptop charger at home if you don't need it: that alone is often 1 lb." },
    { question: "What if my bag is over the limit?", answer: "The calculator shows exactly how many pounds to cut and which category is heaviest. If you can't unpack, options are: wear the heaviest items (a jacket can be 3 lb), move weight to a carry-on, or pay the overweight fee — which at $50–150 is often more than the value of what you're carrying. Budget airlines are least forgiving." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Packing Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Packing Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="suitcase" className={lbl}>Suitcase (empty)</label>
                <div className={inp}>
                  <input id="suitcase" type="number" min="0" step="0.5" value={inputs.suitcase} onChange={(e) => set("suitcase")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
              </div>
              <div>
                <label htmlFor="clothing" className={lbl}>Clothing</label>
                <div className={inp}>
                  <input id="clothing" type="number" min="0" step="0.5" value={inputs.clothing} onChange={(e) => set("clothing")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="shoes" className={lbl}>Shoes</label>
                <div className={inp}>
                  <input id="shoes" type="number" min="0" step="0.5" value={inputs.shoes} onChange={(e) => set("shoes")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
              </div>
              <div>
                <label htmlFor="toiletries" className={lbl}>Toiletries</label>
                <div className={inp}>
                  <input id="toiletries" type="number" min="0" step="0.5" value={inputs.toiletries} onChange={(e) => set("toiletries")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">More Categories & Limit</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="electronics" className={lbl}>Electronics</label>
                        <div className={inp}>
                          <input id="electronics" type="number" min="0" step="0.5" value={inputs.electronics} onChange={(e) => set("electronics")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">lb</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="other" className={lbl}>Other Items</label>
                        <div className={inp}>
                          <input id="other" type="number" min="0" step="0.5" value={inputs.other} onChange={(e) => set("other")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">lb</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="limit" className={lbl}>Airline Weight Limit</label>
                      <div className={inp}>
                        <input id="limit" type="number" min="10" max="100" value={inputs.limit} onChange={(e) => set("limit")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">lb</span>
                      </div>
                      {errors.limit && <p className="text-xs text-red-500 font-medium mt-1">{errors.limit}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Packed Weight</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.total.toFixed(1)} <span className="text-xl text-muted-foreground">lb</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.overLimit ? `Over the ${parseFloat(inputs.limit)} lb limit by ${Math.abs(result.remaining).toFixed(1)} lb — unpack!` : `${result.remaining.toFixed(1)} lb under the ${parseFloat(inputs.limit)} lb limit · ${result.pctOfLimit.toFixed(0)}% of capacity`}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Airline Limit", `${parseFloat(inputs.limit)} lb`],
                ["Remaining", `${result.remaining.toFixed(1)} lb`],
                ["% of Limit", `${result.pctOfLimit.toFixed(0)}%`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? (result.overLimit ? "text-red-600" : "text-green-600") : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Weight Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Weight by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} lb`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="weight" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <ReferenceLine y={parseFloat(inputs.limit)} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Limit ${parseFloat(inputs.limit)} lb`, fontSize: 11, fill: "#ef4444", position: "insideTopRight" }} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Clothing and shoes are the biggest categories — cut there first if you're over.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Know the Number Before the Airport</h2>
            <p>Checked-bag limits are unforgiving: most airlines cap standard bags at 50 lb, and every pound over triggers fees of $50–150. Summing your suitcase and categories before you leave home — rather than at the check-in counter — is the difference between re-packing in the terminal and checking in calmly. The calculator totals every category and flags the overage in pounds.</p>
            <h2 className="text-2xl font-bold mb-3">Weight Hides in the Big Three</h2>
            <p>Suitcase shells alone span 6–12 lb, a full week of clothing runs 8–15 lb, and shoes are the heaviest pound-for-pound category in any bag. Together they typically account for 70% of a packed suitcase. If you're close to the limit, these three categories are where the savings live — not in the toiletries bag.</p>
            <h2 className="text-2xl font-bold mb-3">Pack a Strategy, Not Just Items</h2>
            <p>Wear your heaviest shoes and coat through security. Roll clothing to pack more into the same weight. Know your airline's exact limit — budget carriers often use 40 lb — and remember that carry-on weight limits exist too, usually 15–22 lb. The calculator's limit field lets you model any airline's rules before you zipper the bag.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/packing-weight-calculator" />
          <PopularCalculators exclude="/calculator/packing-weight-calculator" />
        </div>
      </div>
    </>
  );
}
