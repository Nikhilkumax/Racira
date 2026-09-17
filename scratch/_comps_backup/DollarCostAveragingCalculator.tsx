"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DcaResult {
  totalInvested: number;
  monthlyAmount: number;
  months: number;
  annualReturn: number;
  dcaFinal: number;
  lumpSumFinal: number;
  difference: number;
  yearRows: { month: number; dca: number; lump: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { month: number; dca: number; lump: number }[];
}

function calcDca(total: number, months: number, annualReturn: number): DcaResult {
  const r = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const monthlyAmount = total / months;
  let dca = 0;
  const yearRows: DcaResult["yearRows"] = [];
  for (let m = 1; m <= months; m++) {
    dca = (dca + monthlyAmount) * (1 + r);
    yearRows.push({ month: m, dca, lump: total * Math.pow(1 + r, m) });
  }
  const lumpSumFinal = total * Math.pow(1 + r, months);
  const dcaFinal = dca;
  const difference = lumpSumFinal - dcaFinal;
  const fmt = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const breakdown = [
    { label: "Total Invested", value: fmt(total) },
    { label: "Monthly Investment", value: fmt(monthlyAmount) },
    { label: "Investment Period", value: `${months} months (${(months / 12).toFixed(1)} years)` },
    { label: "Annual Return", value: `${annualReturn}%` },
    { label: "DCA Final Value", value: fmt(dcaFinal) },
    { label: "Lump-Sum Final Value", value: fmt(lumpSumFinal) },
    { label: "Difference (Lump − DCA)", value: `${difference >= 0 ? "+" : "−"}${fmt(Math.abs(difference))}` },
    { label: "DCA Gain", value: fmt(dcaFinal - total) },
  ];
  const summaryStats = [
    { label: "DCA Final", value: fmt(dcaFinal) },
    { label: "Lump-Sum Final", value: fmt(lumpSumFinal) },
    { label: "Difference", value: `${difference >= 0 ? "+" : "−"}${fmt(Math.abs(difference))}` },
    { label: "Total Invested", value: fmt(total) },
    { label: "Monthly", value: fmt(monthlyAmount) },
    { label: "Return", value: `${annualReturn}%` },
    { label: "Period", value: `${months} months` },
    { label: "DCA Gain", value: fmt(dcaFinal - total) },
  ];
  const chartData = yearRows.map(r => ({ month: r.month, dca: Math.round(r.dca), lump: Math.round(r.lump) }));
  return { totalInvested: total, monthlyAmount, months, annualReturn, dcaFinal, lumpSumFinal, difference, yearRows, breakdown, summaryStats, chartData };
}

const DEFAULTS = { total: "12000", months: "12", ret: "8" };

export default function DollarCostAveragingCalculator() {
  const [total, setTotal] = useState(DEFAULTS.total);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [ret, setRet] = useState(DEFAULTS.ret);
  const [result, setResult] = useState<DcaResult | null>(null);

  const t = parseFloat(total) || 0;
  const m = parseInt(months) || 0;
  const r = parseFloat(ret) || 0;
  const errs: string[] = [];
  if (t <= 0) errs.push("Total investment must be greater than 0.");
  if (m < 1 || m > 600) errs.push("Months must be 1–600.");
  if (r < -50 || r > 50) errs.push("Annual return must be between -50% and 50%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDca(t, m, r)); };
  const reset = () => {
    setTotal(DEFAULTS.total); setMonths(DEFAULTS.months); setRet(DEFAULTS.ret);
    setResult(calcDca(12000, 12, 8));
  };
  useEffect(() => { setResult(calcDca(12000, 12, 8)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is dollar cost averaging?", answer: "DCA spreads a lump sum into equal periodic investments — $1,000 a month instead of $12,000 at once. It removes timing risk: you buy more shares when prices are low and fewer when high, smoothing your average cost over the period." },
    { question: "Does DCA beat lump-sum investing?", answer: "Mathematically, lump sum wins about two-thirds of the time in rising markets because money is invested longer. But DCA wins on risk: it limits the pain of buying right before a crash, which matters for investor psychology and for large windfalls." },
    { question: "When does DCA make sense?", answer: "For a sudden windfall (inheritance, bonus, sale proceeds) that you are nervous to deploy all at once. For regular paycheck investing, you are already DCA-ing — just keep contributing automatically. The longer your horizon, the weaker the case for waiting." },
    { question: "What are the costs of DCA?", answer: "Time in market is sacrificed: uninvested cash earns nothing (or a low money-market rate) while waiting. Over a year, a 12-month DCA plan at 8% returns typically trails lump sum by about half a year's return on half the money — a few percent of the total." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Dollar Cost Averaging Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Dollar Cost Averaging Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Total to Invest</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Investment Period</label>
                <div className={inp}><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">months</span></div>
              </div>
            </div>
            <div>
              <label className={lbl}>Expected Annual Return</label>
              <div className={inp}><input type="number" value={ret} onChange={e => setRet(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">DCA Final Value</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.dcaFinal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className={`font-semibold ${result.difference >= 0 ? "text-muted-foreground" : "text-emerald-600"}`}>
                    {result.difference >= 0 ? `Lump sum beat DCA by $${result.difference.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `DCA beat lump sum by $${Math.abs(result.difference).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Lump-Sum Final", `$${result.lumpSumFinal.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Monthly Investment", `$${result.monthlyAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["DCA Gain", `$${(result.dcaFinal - result.totalInvested).toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Strategy Comparison</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Path Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "dca" ? "DCA" : "Lump Sum"]} />
                    <Area type="monotone" dataKey="lump" stroke="#10b981" fill="#10b98122" strokeWidth={2} />
                    <Area type="monotone" dataKey="dca" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
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
            <h2 className="text-2xl font-bold mb-3">How DCA Works</h2>
            <p>Dollar cost averaging invests a fixed amount at regular intervals regardless of price. You buy more shares in down markets and fewer in up markets, which mechanically lowers your average cost per share. This <strong>dollar cost averaging calculator</strong> compares the DCA path against investing the full amount upfront.</p>
            <h2 className="text-2xl font-bold mb-3">Lump Sum vs DCA</h2>
            <p>Studies (Vanguard, 2012) show lump sum outperforms DCA about 67% of the time over 6–12 months because markets trend upward and time-in-market dominates. DCA wins when the market falls after your start date. The right choice depends on your tolerance for a possible early drawdown.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Advice</h2>
            <p>For paychecks: automate monthly contributions — that IS dollar cost averaging and needs no decision. For windfalls: a middle path — invest half immediately, DCA the rest over 6–12 months — balances expected return with sleep at night. Whatever you choose, stay invested for the full horizon.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dollar-cost-averaging-calculator" />
          <PopularCalculators exclude="/calculator/dollar-cost-averaging-calculator" />
        </div>
      </div>
    </>
  );
}
