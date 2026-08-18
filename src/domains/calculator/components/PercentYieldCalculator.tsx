"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const DEFAULTS = { actual: "8.4", theoretical: "10.0" };

export default function PercentYieldCalculator() {
  const [actual, setActual] = useState(DEFAULTS.actual);
  const [theoretical, setTheoretical] = useState(DEFAULTS.theoretical);
  const [calculated, setCalculated] = useState(false);

  const a = parseFloat(actual);
  const t = parseFloat(theoretical);
  const valid = !isNaN(a) && !isNaN(t) && t > 0;

  const pct = valid ? (a / t) * 100 : 0;
  const lost = valid ? t - a : 0;
  const efficiency = valid ? (pct >= 90 ? "High yield (>90%)" : pct >= 75 ? "Good yield (75–90%)" : pct >= 50 ? "Moderate yield (50–75%)" : "Low yield (<50%)") : "";

  const chartData = valid ? [
    { name: "Theoretical", value: t, fill: "hsl(var(--primary))" },
    { name: "Actual", value: a, fill: "#10b981" },
  ] : [];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setActual(DEFAULTS.actual); setTheoretical(DEFAULTS.theoretical); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is percent yield?", answer: "It is the actual amount of product you recovered divided by the theoretical amount the balanced equation predicts, times 100. Real reactions never reach 100% because of side reactions, incomplete reactions, and product lost during purification." },
    { question: "Why can't yield exceed 100%?", answer: "It shouldn't — unless your product is wet, contaminated, or the theoretical yield was calculated from the wrong limiting reagent. A yield above 100% is a red flag that something in the measurement is off, not a sign of a miracle reaction." },
    { question: "How is theoretical yield found?", answer: "Convert the limiting reactant's mass to moles, use the balanced equation's mole ratio to find the moles of product, then multiply by the product's molar mass. This calculator compares two masses directly; pair it with a stoichiometry or molar mass tool for the full pipeline." },
    { question: "What is a good percent yield?", answer: "Above 90% is excellent for most lab work; 75–90% is good; 50–75% is moderate and worth investigating. Below 50% usually signals a major loss — an incomplete reaction, a poor extraction, or product left behind on glassware." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Percent Yield Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Percent Yield Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Actual yield (grams recovered)</label>
              <input type="number" min={0} value={actual} onChange={e => setActual(e.target.value)} className={inp} placeholder="8.4" />
            </div>
            <div>
              <label className={lbl}>Theoretical yield (grams predicted)</label>
              <input type="number" min={0} value={theoretical} onChange={e => setTheoretical(e.target.value)} className={inp} placeholder="10.0" />
            </div>
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Theoretical yield must be greater than zero.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-5`}>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Percent Yield</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(pct)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(a)} g recovered ÷ {fmt(t)} g predicted × 100</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Product lost", `${fmt(lost)} g`, "actual vs. predicted"], ["Efficiency", efficiency.split(" ")[0], efficiency], ["Recovery", `${fmt(pct)}%`, "of theoretical mass"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Yield Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(Number(v))} g`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The green bar is what you actually recovered — the gap is unrecovered product</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Reaction Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Theoretical yield:</span><span className="font-semibold">{fmt(t)} g</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Actual yield:</span><span className="font-semibold">{fmt(a)} g</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Mass unaccounted:</span><span className="font-semibold">{fmt(Math.max(0, lost))} g</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Percent yield:</span><span className="font-semibold">{fmt(pct)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Verdict:</span><span className="font-semibold">{efficiency}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Above 100%?</span><span className="font-semibold">{pct > 100 ? "Yes — check for impurities" : "No — within bounds"}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From Equation to Bench</h2>
            <p>The balanced equation predicts exactly how much product a reaction should make. This <strong>percent yield calculator</strong> compares that theoretical mass against what you actually recovered, turning lab results into the yield percentage that appears in every chemistry report.</p>
            <h2 className="text-2xl font-bold mb-3">Where the Product Goes</h2>
            <p>Side reactions consume starting material. Equilibrium reactions stop short of completion. Products stick to glassware, get lost in transfers, or dissolve during washing. Each of these shaves points off the yield — and the percentage tells you how much of the loss is worth chasing.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Number</h2>
            <p>Pair the yield with the efficiency verdict: above 90% is a clean reaction, 75–90% is typical lab fare, and anything below 50% is worth troubleshooting step by step. A yield over 100% means the product is wet or contaminated — dry it and reweigh.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percent-yield-calculator" />
          <PopularCalculators exclude="/calculator/percent-yield-calculator" />
        </div>
      </div>
    </>
  );
}
