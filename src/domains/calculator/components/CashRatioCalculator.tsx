"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DEFAULTS = { cash: "120000", cashEquivalents: "30000", currentLiabilities: "200000" };

interface CashRatioResult {
  cashRatio: number;
  totalLiquid: number;
  coverage: number;
  shortfall: number;
  rating: string;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): CashRatioResult {
  const cash = parseFloat(v.cash) || 0;
  const ce = parseFloat(v.cashEquivalents) || 0;
  const cl = parseFloat(v.currentLiabilities) || 0;

  // Cash Ratio = (Cash + Cash Equivalents) / Current Liabilities
  const totalLiquid = cash + ce;
  const cashRatio = cl > 0 ? totalLiquid / cl : 0;
  const coverage = Math.min(cashRatio * 100, 100);
  const shortfall = cl > totalLiquid ? cl - totalLiquid : 0;

  let rating = "";
  if (cashRatio >= 1) rating = "Strong — full cash coverage";
  else if (cashRatio >= 0.5) rating = "Adequate — reasonable coverage";
  else if (cashRatio >= 0.2) rating = "Low — limited immediate liquidity";
  else rating = "Critical — very low cash buffer";

  const chartData = [
    { name: "Cash", value: cash, fill: "hsl(var(--primary))" },
    { name: "Cash Equivalents", value: ce, fill: "#10b981" },
    { name: "Remaining Liabilities", value: Math.max(0, cl - totalLiquid), fill: "#f87171" },
  ].filter((d) => d.value > 0);

  return { cashRatio, totalLiquid, coverage, shortfall, rating, chartData };
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function CashRatioCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CashRatioResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is the Cash Ratio?", answer: "The Cash Ratio = (Cash + Cash Equivalents) ÷ Current Liabilities. It measures a company's ability to pay off short-term obligations using only its most liquid assets — cash on hand and near-cash instruments. It's the most conservative liquidity ratio." },
    { question: "What is a good Cash Ratio?", answer: "A cash ratio of 0.5–1.0 is generally considered healthy. Above 1.0 means the company can pay all current liabilities with cash alone — very conservative. Below 0.2 may indicate liquidity risk. Most companies operate between 0.2–0.5 since holding excess cash reduces returns on invested capital." },
    { question: "What counts as cash equivalents?", answer: "Cash equivalents are highly liquid investments with maturities of three months or less: Treasury bills, money market funds, commercial paper, and short-term government bonds. They're considered as safe and liquid as cash itself for financial analysis purposes." },
    { question: "How does Cash Ratio differ from Current Ratio?", answer: "Current Ratio = Current Assets ÷ Current Liabilities (includes inventory and receivables). Quick Ratio = (Cash + Equivalents + Receivables) ÷ Current Liabilities. Cash Ratio = (Cash + Equivalents) ÷ Current Liabilities only. Cash Ratio is the most stringent — it ignores receivables and inventory entirely." },
    { question: "Why do companies hold low cash ratios?", answer: "Excess cash earns low returns. CFOs aim to deploy capital productively — through investments, acquisitions, or returning cash to shareholders. Apple, despite being cash-rich, maintains a disciplined cash management policy. Most healthy companies operate with cash ratios of 0.2–0.5, supplemented by credit lines for emergency liquidity." },
    { question: "When is a high cash ratio a warning sign?", answer: "A very high cash ratio (>2.0) can indicate management is hoarding cash unproductively rather than investing in growth or returning value to shareholders. Activist investors often pressure cash-rich companies to initiate dividends, buybacks, or acquisitions to deploy excess capital." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Cash Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cash Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            {[
              { key: "cash" as const, label: "Cash ($)" },
              { key: "cashEquivalents" as const, label: "Cash Equivalents ($)" },
              { key: "currentLiabilities" as const, label: "Current Liabilities ($)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-foreground mb-1 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals[key]} onChange={set(key)}
                    className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0" />
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Cash Ratio</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{result.cashRatio.toFixed(2)}×</div>
                  <div className="text-sm text-muted-foreground font-medium">{result.rating}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Cash", value: `$${fmt(parseFloat(vals.cash))}` },
                        { label: "Cash Equivalents", value: `$${fmt(parseFloat(vals.cashEquivalents))}` },
                        { label: "Total Liquid Assets", value: `$${fmt(result.totalLiquid)}` },
                        { label: "Current Liabilities", value: `$${fmt(parseFloat(vals.currentLiabilities))}` },
                        { label: "Cash Ratio", value: `${result.cashRatio.toFixed(2)}×`, bold: true },
                        { label: "Liability Coverage", value: `${Math.min(result.cashRatio * 100, 100).toFixed(1)}%` },
                        { label: result.shortfall > 0 ? "Liquidity Shortfall" : "Surplus Cash", value: `$${fmt(result.shortfall > 0 ? result.shortfall : result.totalLiquid - parseFloat(vals.currentLiabilities))}` },
                      ].map((r) => (
                        <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.bold ? "bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Liquidity Coverage vs. Liabilities</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Liquidity Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Cash Ratio", value: `${result.cashRatio.toFixed(2)}×` },
                      { label: "Total Liquid", value: `$${fmt(result.totalLiquid)}` },
                      { label: "Current Liabilities", value: `$${fmt(parseFloat(vals.currentLiabilities))}` },
                      { label: "Coverage", value: `${Math.min(result.cashRatio * 100, 100).toFixed(1)}%` },
                      { label: result.shortfall > 0 ? "Shortfall" : "Surplus", value: `$${fmt(result.shortfall > 0 ? result.shortfall : result.totalLiquid - parseFloat(vals.currentLiabilities))}` },
                      { label: "Rating", value: result.cashRatio >= 1 ? "Strong" : result.cashRatio >= 0.5 ? "Adequate" : result.cashRatio >= 0.2 ? "Low" : "Critical", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Cash Ratio?</h2>
            <p>The Cash Ratio is the most conservative liquidity ratio in financial analysis. <strong>Cash Ratio = (Cash + Cash Equivalents) ÷ Current Liabilities.</strong> Unlike the Current Ratio or Quick Ratio, it only counts the most liquid assets — actual cash and near-cash instruments like T-bills and money market funds — against short-term obligations.</p>
            <p>Our calculator is pre-filled with $120,000 cash + $30,000 equivalents against $200,000 current liabilities → Cash Ratio = 0.75×. This means the company can cover 75% of its short-term obligations with available cash.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting the Cash Ratio</h2>
            <p>A ratio of 0.5–1.0 is generally healthy for most businesses. Above 1.0 means full cash coverage of all current liabilities — very conservative. Below 0.2 may signal liquidity risk. Most profitable companies operate at 0.2–0.5, supplemented by credit lines, because holding excess cash earns poor returns compared to deploying it in the business.</p>

            <h2 className="text-2xl font-bold mb-3">Cash Ratio vs. Other Liquidity Ratios</h2>
            <p>The three standard liquidity ratios from most to least conservative: <strong>Cash Ratio</strong> (only cash + equivalents), <strong>Quick Ratio</strong> (adds receivables), <strong>Current Ratio</strong> (adds all current assets including inventory). Lenders and creditors evaluate all three together to assess short-term solvency from multiple angles.</p>

            <h2 className="text-2xl font-bold mb-3">What Counts as Cash Equivalents?</h2>
            <p>Cash equivalents are instruments with original maturities of three months or less: US Treasury bills, money market mutual funds, commercial paper, and certificates of deposit (CDs) maturing within 90 days. They're reported alongside cash on the balance sheet and treated identically for liquidity analysis purposes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cash-ratio-calculator" />
          <PopularCalculators exclude="/calculator/cash-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
