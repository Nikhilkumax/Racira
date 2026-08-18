"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface EbitdaResult {
  revenue: number;
  netIncome: number;
  interest: number;
  taxes: number;
  depreciation: number;
  amortization: number;
  ebitda: number;
  ebitdaMargin: number;
  operatingIncome: number;
  netMargin: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function calcEbitda(revenue: number, netIncome: number, interest: number, taxes: number, depreciation: number, amortization: number): EbitdaResult {
  const ebitda = netIncome + interest + taxes + depreciation + amortization;
  const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  const operatingIncome = ebitda - depreciation - amortization;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  const breakdown = [
    { label: "Revenue", value: fmt$(revenue) },
    { label: "Net Income", value: fmt$(netIncome) },
    { label: "+ Interest Expense", value: fmt$(interest) },
    { label: "+ Tax Expense", value: fmt$(taxes) },
    { label: "+ Depreciation", value: fmt$(depreciation) },
    { label: "+ Amortization", value: fmt$(amortization) },
    { label: "EBITDA", value: fmt$(ebitda) },
    { label: "EBITDA Margin", value: fmtPct(ebitdaMargin) },
    { label: "Operating Income (EBIT)", value: fmt$(operatingIncome) },
    { label: "Net Profit Margin", value: fmtPct(netMargin) },
  ];
  const summaryStats = [
    { label: "EBITDA", value: fmt$(ebitda) },
    { label: "EBITDA Margin", value: fmtPct(ebitdaMargin) },
    { label: "Operating Income", value: fmt$(operatingIncome) },
    { label: "Net Income", value: fmt$(netIncome) },
    { label: "Revenue", value: fmt$(revenue) },
    { label: "Interest", value: fmt$(interest) },
    { label: "Taxes", value: fmt$(taxes) },
    { label: "D&A", value: fmt$(depreciation + amortization) },
  ];
  const chartData = [
    { name: "Net Income", value: Math.max(0, Math.round(netIncome)), fill: "hsl(var(--primary))" },
    { name: "Interest", value: Math.max(0, Math.round(interest)), fill: "#8b5cf6" },
    { name: "Taxes", value: Math.max(0, Math.round(taxes)), fill: "#f59e0b" },
    { name: "D&A", value: Math.max(0, Math.round(depreciation + amortization)), fill: "#10b981" },
  ];
  return { revenue, netIncome, interest, taxes, depreciation, amortization, ebitda, ebitdaMargin, operatingIncome, netMargin, breakdown, summaryStats, chartData };
}

const DEFAULTS = { revenue: "500000", netIncome: "75000", interest: "12000", taxes: "25000", dep: "30000", amort: "10000" };

export default function EbitdaCalculator() {
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  const [netIncome, setNetIncome] = useState(DEFAULTS.netIncome);
  const [interest, setInterest] = useState(DEFAULTS.interest);
  const [taxes, setTaxes] = useState(DEFAULTS.taxes);
  const [dep, setDep] = useState(DEFAULTS.dep);
  const [amort, setAmort] = useState(DEFAULTS.amort);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<EbitdaResult | null>(null);

  const rev = parseFloat(revenue) || 0;
  const ni = parseFloat(netIncome) || 0;
  const intr = parseFloat(interest) || 0;
  const tx = parseFloat(taxes) || 0;
  const dp = parseFloat(dep) || 0;
  const am = parseFloat(amort) || 0;
  const errs: string[] = [];
  if (rev <= 0) errs.push("Revenue must be greater than 0.");
  if (ni < 0 || intr < 0 || tx < 0 || dp < 0 || am < 0) errs.push("Income and expense inputs cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEbitda(rev, ni, intr, tx, dp, am)); };
  const reset = () => {
    setRevenue(DEFAULTS.revenue); setNetIncome(DEFAULTS.netIncome); setInterest(DEFAULTS.interest); setTaxes(DEFAULTS.taxes); setDep(DEFAULTS.dep); setAmort(DEFAULTS.amort);
    setResult(calcEbitda(500000, 75000, 12000, 25000, 30000, 10000));
  };
  useEffect(() => { setResult(calcEbitda(500000, 75000, 12000, 25000, 30000, 10000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What does EBITDA measure?", answer: "EBITDA — earnings before interest, taxes, depreciation, and amortization — approximates a company's operating cash generation before capital structure, tax environment, and non-cash accounting charges." },
    { question: "Why add back depreciation and amortization?", answer: "D&A are non-cash expenses that spread the cost of assets over their useful lives. Adding them back isolates the cash-generating performance of the core business." },
    { question: "What are EBITDA's limitations?", answer: "EBITDA ignores working capital changes, capital expenditures, and debt repayments, so it can flatter companies with heavy investment needs. Pair it with free cash flow for a complete picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "EBITDA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">EBITDA Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Revenue</label>
                <div className={inp}><input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Net Income</label>
                <div className={inp}><input type="number" value={netIncome} onChange={e => setNetIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Interest Expense</label>
                <div className={inp}><input type="number" value={interest} onChange={e => setInterest(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Tax Expense</label>
                <div className={inp}><input type="number" value={taxes} onChange={e => setTaxes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Non-Cash Add-Backs</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Depreciation</label>
                      <div className={inp}><input type="number" value={dep} onChange={e => setDep(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Amortization</label>
                      <div className={inp}><input type="number" value={amort} onChange={e => setAmort(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">EBITDA</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.ebitda)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtPct(result.ebitdaMargin)} margin on {fmt$(result.revenue)} revenue</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`EBITDA Margin`, fmtPct(result.ebitdaMargin)], ["Operating Income", fmt$(result.operatingIncome)], ["Net Margin", fmtPct(result.netMargin)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">EBITDA Build-Up</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">EBITDA Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Share of EBITDA by component</p>
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
            <h2 className="text-2xl font-bold mb-3">How EBITDA Is Computed</h2>
            <p>This <strong>EBITDA calculator</strong> starts from net income and adds back interest expense, tax expense, depreciation, and amortization. The result isolates core operating profitability before financing decisions and accounting charges. EBITDA margin — EBITDA divided by revenue — lets you compare profitability across companies and industries.</p>
            <h2 className="text-2xl font-bold mb-3">EBITDA vs Operating Income</h2>
            <p>Operating income (EBIT) sits below EBITDA: it is EBITDA minus depreciation and amortization, and it reflects the profit a business earns from its actual operations after consuming its fixed and intangible assets.</p>
            <h2 className="text-2xl font-bold mb-3">When to Use It</h2>
            <p>Lenders and acquirers commonly use EBITDA multiples to value businesses and assess debt capacity. Because it strips out non-cash charges, it is most meaningful for capital-intensive companies when combined with free cash flow and capex figures.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ebitda-calculator" />
          <PopularCalculators exclude="/calculator/ebitda-calculator" />
        </div>
      </div>
    </>
  );
}
