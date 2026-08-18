"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MarkupResult {
  mode: string;
  cost: number;
  selling: number;
  profit: number;
  markupPct: number;
  marginPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function calcMarkup(cost: number, selling: number, markupPct: number, mode: string): MarkupResult {
  const c = mode === "from-cost-selling" ? cost : cost;
  const s = mode === "from-cost-selling" ? selling : cost * (1 + markupPct / 100);
  const profit = s - c;
  const mp = c > 0 ? (profit / c) * 100 : 0;
  const mg = s > 0 ? (profit / s) * 100 : 0;
  const breakdown = [
    { label: "Cost Price", value: money(c) },
    { label: "Selling Price", value: money(s) },
    { label: "Profit", value: money(profit) },
    { label: "Markup Percentage", value: `${fmt(mp)}%` },
    { label: "Gross Margin", value: `${fmt(mg)}%` },
  ];
  const summaryStats = [
    { label: "Markup", value: `${fmt(mp)}%` },
    { label: "Margin", value: `${fmt(mg)}%` },
    { label: "Profit", value: money(profit) },
    { label: "Selling Price", value: money(s) },
    { label: "Cost Price", value: money(c) },
  ];
  const chartData = [
    { name: "Cost", value: Number(c.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Profit", value: Number(profit.toFixed(2)), fill: "#f59e0b" },
  ];
  return { mode, cost: c, selling: s, profit, markupPct: mp, marginPct: mg, breakdown, summaryStats, chartData };
}

const DEFAULTS = { cost: "100", selling: "150", markup: "50" };

export default function MarkupCalculator() {
  const [mode, setMode] = useState<string>("from-cost-selling");
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [selling, setSelling] = useState(DEFAULTS.selling);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [result, setResult] = useState<MarkupResult | null>(null);

  const costNum = parseFloat(cost);
  const sellingNum = parseFloat(selling);
  const markupNum = parseFloat(markup);
  const errs: string[] = [];
  if (!costNum || costNum <= 0) errs.push("Cost price must be greater than 0.");
  if (mode === "from-cost-selling" && (!sellingNum || sellingNum <= 0)) errs.push("Selling price must be greater than 0.");
  if (mode === "from-cost-markup" && isNaN(markupNum)) errs.push("Markup percentage is required.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMarkup(costNum, sellingNum, markupNum, mode)); };
  const reset = () => {
    setMode("from-cost-selling"); setCost(DEFAULTS.cost); setSelling(DEFAULTS.selling); setMarkup(DEFAULTS.markup);
    setResult(calcMarkup(100, 150, 50, "from-cost-selling"));
  };
  useEffect(() => { setResult(calcMarkup(100, 150, 50, "from-cost-selling")); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the difference between markup and margin?", answer: "Markup is profit expressed as a percentage of cost: (price − cost) ÷ cost. Margin is profit expressed as a percentage of price: (price − cost) ÷ price. A 50% markup is only a 33.3% margin, because the denominators differ." },
    { question: "How do I convert markup to margin?", answer: "Given markup m as a decimal, margin = m ÷ (1 + m). So a 100% markup (double the cost) is a 50% margin, and a 25% markup is a 20% margin. The two only coincide at 0%." },
    { question: "Which should I use for pricing?", answer: "Margin is the better planning metric because it shows how much of each revenue dollar survives as profit. Markup is convenient for quoting from cost, but businesses that quote in markup often underpricе — a common retail pitfall." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Markup Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Markup Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>What do you want to calculate?</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className={inp}>
                <option value="from-cost-selling">Markup % from cost &amp; selling price</option>
                <option value="from-cost-markup">Selling price from cost &amp; markup %</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Cost Price ($)</label>
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} className={inp} placeholder="100" />
              </div>
              {mode === "from-cost-selling" ? (
                <div>
                  <label className={lbl}>Selling Price ($)</label>
                  <input type="number" value={selling} onChange={e => setSelling(e.target.value)} className={inp} placeholder="150" />
                </div>
              ) : (
                <div>
                  <label className={lbl}>Markup (%)</label>
                  <input type="number" value={markup} onChange={e => setMarkup(e.target.value)} className={inp} placeholder="50" />
                </div>
              )}
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Markup Percentage</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.markupPct)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Gross margin: {fmt(result.marginPct)}% · profit {money(result.profit)} on {money(result.cost)} cost</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Selling Price`, money(result.selling)], ["Cost Price", money(result.cost)], ["Profit", money(result.profit)]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost vs Profit Split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [money(v), ""]} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Markup measures profit against cost; margin measures it against price</p>
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
            <h2 className="text-2xl font-bold mb-3">Markup vs Margin, Once and for All</h2>
            <p>This <strong>markup calculator</strong> computes both sides of the same coin: markup — profit as a share of cost — and gross margin — profit as a share of price. Buy at $100, sell at $150: that is a 50% markup but only a 33.3% margin.</p>
            <h2 className="text-2xl font-bold mb-3">Two Ways to Price</h2>
            <p>Give the calculator cost plus selling price and it derives the markup; or give it cost plus a target markup and it derives the selling price. The math is the same either direction: price = cost × (1 + markup/100).</p>
            <h2 className="text-2xl font-bold mb-3">Why the Confusion Costs Money</h2>
            <p>Retailers who target "50% markup" are actually earning a 33% margin, and margin-based targets need a higher markup to hit. Converting is simple: margin = markup ÷ (1 + markup). Knowing which number you are quoting keeps your pricing honest.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/markup-calculator" />
          <PopularCalculators exclude="/calculator/markup-calculator" />
        </div>
      </div>
    </>
  );
}
