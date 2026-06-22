"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = { operatingCashFlow: "420000", capitalExpenditures: "95000", workingCapitalChange: "15000" };

interface FCFResult {
  fcf: number;
  fcfMarginEst: number;
  capexIntensity: number;
  fcfYield: number;
  reinvestmentRate: number;
  rating: string;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): FCFResult {
  const ocf = parseFloat(v.operatingCashFlow) || 0;
  const capex = parseFloat(v.capitalExpenditures) || 0;
  const wc = parseFloat(v.workingCapitalChange) || 0;

  // FCF = Operating Cash Flow - Capital Expenditures
  // (Working capital change is already embedded in OCF from the cash flow statement,
  //  but we show it separately for transparency)
  const fcf = ocf - capex;

  // Capex as % of OCF (reinvestment rate)
  const reinvestmentRate = ocf > 0 ? (capex / ocf) * 100 : 0;

  // Capex intensity (capex relative to total cash generated)
  const capexIntensity = (ocf + Math.abs(wc)) > 0 ? (capex / (ocf + Math.abs(wc))) * 100 : 0;

  // FCF margin estimate (assuming revenue ≈ OCF / 0.15 for typical companies)
  const estimatedRevenue = ocf / 0.15;
  const fcfMarginEst = estimatedRevenue > 0 ? (fcf / estimatedRevenue) * 100 : 0;

  // FCF yield (assuming market cap ≈ FCF × 20 for reference)
  const impliedMktCap = fcf * 20;
  const fcfYield = impliedMktCap > 0 ? (fcf / impliedMktCap) * 100 : 5;

  let rating = fcf < 0 ? "Negative FCF — cash burn"
    : reinvestmentRate > 80 ? "Very High CapEx — limited FCF"
    : reinvestmentRate > 60 ? "High CapEx — moderate FCF"
    : reinvestmentRate > 40 ? "Balanced — healthy FCF generation"
    : "Low CapEx — strong FCF generation";

  const chartData = [
    { name: "Operating CF", value: ocf, fill: "hsl(var(--primary))" },
    { name: "CapEx", value: -capex, fill: "#ef4444" },
    { name: "Free Cash Flow", value: fcf, fill: fcf >= 0 ? "#10b981" : "#f87171" },
  ];

  return { fcf, fcfMarginEst, capexIntensity, fcfYield, reinvestmentRate, rating, chartData };
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtCurrency = (n: number) => `${n < 0 ? "-" : ""}$${fmt(Math.abs(n))}`;

export default function FreeCashFlowCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<FCFResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is Free Cash Flow (FCF)?", answer: "Free Cash Flow = Operating Cash Flow − Capital Expenditures. It represents the cash a business generates after spending the money required to maintain or expand its asset base. FCF is the purest measure of financial health — it's the cash available to pay dividends, buy back shares, reduce debt, or fund acquisitions." },
    { question: "Why is FCF more important than net income?", answer: "Net income includes non-cash items (depreciation, amortization, stock-based compensation) and accrual accounting adjustments. FCF reflects actual cash movement. Warren Buffett calls owner earnings (approximately FCF) the true measure of business value. Many profitable companies on paper can have negative FCF due to high capex requirements." },
    { question: "What is a good FCF?", answer: "Positive and growing FCF is the goal. FCF yield (FCF ÷ Market Cap) above 5% is often considered attractive for value investors. FCF margin (FCF ÷ Revenue) of 10%+ indicates a capital-efficient business. Technology companies like Apple and Microsoft achieve FCF margins of 20–30%, while capital-intensive industries like airlines and steel may have FCF margins of 2–5%." },
    { question: "What is the difference between FCF and EBITDA?", answer: "EBITDA = Earnings before interest, taxes, depreciation, and amortization. It approximates operating cash flow but ignores working capital changes and actual capex spending. FCF is more conservative — it deducts actual capex rather than adding back depreciation. A company with EBITDA of $500K but $400K in capex has only $100K of FCF." },
    { question: "What is CapEx reinvestment rate?", answer: "Reinvestment Rate = CapEx ÷ Operating Cash Flow × 100. It shows what fraction of operating cash flow must be reinvested in the business to maintain and grow operations. Asset-light companies (software, consulting) have reinvestment rates of 10–20%, retaining 80–90% as FCF. Capital-intensive businesses (telecom, manufacturing) may have rates of 60–80%." },
    { question: "How is FCF used in DCF valuation?", answer: "Discounted Cash Flow (DCF) analysis projects future FCF and discounts it back to present value at the company's WACC (Weighted Average Cost of Capital). Intrinsic Value = Σ [FCF_t ÷ (1+WACC)^t] + Terminal Value. FCF-based DCF is the gold standard for company valuation, used by analysts at Goldman Sachs, JP Morgan, and every major investment bank." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Free Cash Flow Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Free Cash Flow Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>
            {[
              { key: "operatingCashFlow" as const, label: "Operating Cash Flow ($)" },
              { key: "capitalExpenditures" as const, label: "Capital Expenditures (CapEx) ($)" },
              { key: "workingCapitalChange" as const, label: "Change in Working Capital ($)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-foreground mb-1 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals[key]} onChange={set(key)}
                    className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            ))}

            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className={`bg-gradient-to-br ${result.fcf >= 0 ? "from-primary/10 to-primary/5 border-primary/20" : "from-red-500/10 to-red-500/5 border-red-500/20"} border rounded-xl p-5 text-center`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Free Cash Flow</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtCurrency(result.fcf)}</div>
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
                        { label: "Operating Cash Flow", value: fmtCurrency(parseFloat(vals.operatingCashFlow)) },
                        { label: "Capital Expenditures (CapEx)", value: `−$${fmt(parseFloat(vals.capitalExpenditures))}` },
                        { label: "Free Cash Flow (FCF)", value: fmtCurrency(result.fcf), bold: true },
                        { label: "CapEx Reinvestment Rate", value: `${result.reinvestmentRate.toFixed(1)}%` },
                        { label: "FCF as % of OCF", value: `${((result.fcf / (parseFloat(vals.operatingCashFlow) || 1)) * 100).toFixed(1)}%` },
                        { label: "Change in Working Capital", value: fmtCurrency(parseFloat(vals.workingCapitalChange)) },
                        { label: "Implied FCF Yield (P/FCF=20×)", value: `${result.fcfYield.toFixed(2)}%` },
                      ].map((r) => (
                        <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.bold ? "bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">OCF → CapEx → FCF Waterfall</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.chartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(Number(v)), "Amount"]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">FCF Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Operating CF", value: fmtCurrency(parseFloat(vals.operatingCashFlow)) },
                      { label: "CapEx", value: fmtCurrency(parseFloat(vals.capitalExpenditures)) },
                      { label: "Free Cash Flow", value: fmtCurrency(result.fcf) },
                      { label: "Reinvestment Rate", value: `${result.reinvestmentRate.toFixed(1)}%` },
                      { label: "FCF Yield (est.)", value: `${result.fcfYield.toFixed(2)}%` },
                      { label: "Quality", value: result.fcf <= 0 ? "Negative" : result.reinvestmentRate < 40 ? "Strong" : result.reinvestmentRate < 70 ? "Moderate" : "Constrained", bold: true },
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Free Cash Flow?</h2>
            <p><strong>Free Cash Flow (FCF) = Operating Cash Flow − Capital Expenditures.</strong> It is the cash a company generates after all spending required to maintain or expand its productive asset base. FCF is considered by many analysts — including Warren Buffett — to be the single most important indicator of a company's true financial health and intrinsic value.</p>
            <p>Our calculator is pre-filled with a typical mid-size company: $420,000 operating cash flow minus $95,000 in capital expenditures = $325,000 in free cash flow. The CapEx reinvestment rate of 22.6% means the company retains 77.4% of its operating cash flow as free cash — a healthy, asset-light profile.</p>

            <h2>Why FCF Beats Net Income</h2>
            <p>Net income is subject to accounting choices — depreciation schedules, revenue recognition timing, and non-cash charges. Companies can report profits while destroying cash. FCF strips away these distortions: if the cash isn't in the bank account, it doesn't count. Amazon famously prioritized FCF over reported earnings for years, investing aggressively while showing thin profits — correctly reflecting its cash-generating power to sophisticated investors who analyzed FCF.</p>

            <h2>FCF and Business Quality</h2>
            <p>Capital-light businesses (software, professional services, franchise models) convert most of their revenue to FCF with minimal reinvestment. Technology giants like Apple and Microsoft generate FCF margins of 20–30%. Capital-intensive industries (airlines, mining, semiconductors) may generate strong operating cash flow but spend most of it on maintenance capex, producing thin FCF margins. FCF margin = FCF ÷ Revenue. A FCF margin above 10% generally signals a high-quality, capital-efficient business worth a premium valuation multiple.</p>

            <h2>FCF in DCF Valuation</h2>
            <p>The most rigorous business valuation method — Discounted Cash Flow (DCF) — projects FCF over 5–10 years, applies a terminal value, and discounts everything back to present value at the company's WACC. Intrinsic Value = PV of FCF + PV of Terminal Value. Analysts at Goldman Sachs, Morgan Stanley, and every major bank use FCF-based DCF as their primary valuation tool. A company generating $325,000 in annual FCF growing at 8% per year, valued at 20× FCF, has an intrinsic value of approximately $6.5M.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/free-cash-flow-calculator" />
          <PopularCalculators exclude="/calculator/free-cash-flow-calculator" />
        </div>
      </div>
    </>
  );
}
