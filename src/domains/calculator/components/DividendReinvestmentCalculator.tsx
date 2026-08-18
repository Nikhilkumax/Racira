"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DripResult {
  finalWithDrip: number;
  finalWithoutDrip: number;
  totalContributions: number;
  totalDividends: number;
  dripAdvantage: number;
  yearRows: { year: number; withDrip: number; withoutDrip: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; withDrip: number; withoutDrip: number }[];
}

function calcDrip(initial: number, annualReturn: number, dividendYield: number, years: number, monthlyContrib: number): DripResult {
  const apprMonthly = Math.pow(1 + (annualReturn - dividendYield) / 100, 1 / 12) - 1;
  const divMonthly = dividendYield / 100 / 12;
  let withDrip = initial;
  let withoutDrip = initial;
  let cashDividends = 0;
  let totalDividends = 0;
  const yearRows: DripResult["yearRows"] = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      withDrip = withDrip * (1 + apprMonthly) + monthlyContrib;
      const div = withDrip * divMonthly;
      withDrip += div; // reinvested
      totalDividends += div;
      withoutDrip = withoutDrip * (1 + apprMonthly) + monthlyContrib;
      cashDividends += withoutDrip * divMonthly; // taken as cash
    }
    yearRows.push({ year: y, withDrip: Math.round(withDrip), withoutDrip: Math.round(withoutDrip + cashDividends) });
  }
  const totalContributions = initial + monthlyContrib * 12 * years;
  const finalWithDrip = withDrip;
  const finalWithoutDrip = withoutDrip + cashDividends;
  const dripAdvantage = finalWithDrip - finalWithoutDrip;
  const fmt = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const breakdown = [
    { label: "Initial Investment", value: fmt(initial) },
    { label: "Total Contributions", value: fmt(totalContributions) },
    { label: "Annual Return", value: `${annualReturn}%` },
    { label: "Dividend Yield", value: `${dividendYield}%` },
    { label: "Final Value — DRIP", value: fmt(finalWithDrip) },
    { label: "Final Value — Cash Dividends", value: fmt(finalWithoutDrip) },
    { label: "Dividends Reinvested", value: fmt(totalDividends) },
    { label: "DRIP Advantage", value: fmt(dripAdvantage) },
  ];
  const summaryStats = [
    { label: "Final Value (DRIP)", value: fmt(finalWithDrip) },
    { label: "Final (No DRIP)", value: fmt(finalWithoutDrip) },
    { label: "DRIP Advantage", value: fmt(dripAdvantage) },
    { label: "Total Contributions", value: fmt(totalContributions) },
    { label: "Dividends Reinvested", value: fmt(totalDividends) },
    { label: "Return", value: `${annualReturn}%` },
    { label: "Yield", value: `${dividendYield}%` },
    { label: "Horizon", value: `${years} years` },
  ];
  const chartData = yearRows.map(r => ({ year: r.year, withDrip: r.withDrip, withoutDrip: r.withoutDrip }));
  return { finalWithDrip, finalWithoutDrip, totalContributions, totalDividends, dripAdvantage, yearRows, breakdown, summaryStats, chartData };
}

const DEFAULTS = { initial: "10000", ret: "8", yield: "3", years: "20", contrib: "200" };

export default function DividendReinvestmentCalculator() {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [ret, setRet] = useState(DEFAULTS.ret);
  const [yieldPct, setYieldPct] = useState(DEFAULTS.yield);
  const [years, setYears] = useState(DEFAULTS.years);
  const [contrib, setContrib] = useState(DEFAULTS.contrib);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DripResult | null>(null);

  const i = parseFloat(initial) || 0;
  const r = parseFloat(ret) || 0;
  const yd = parseFloat(yieldPct) || 0;
  const y = parseInt(years) || 0;
  const m = parseFloat(contrib) || 0;
  const errs: string[] = [];
  if (i < 0) errs.push("Initial investment cannot be negative.");
  if (r < -50 || r > 50) errs.push("Annual return must be between -50% and 50%.");
  if (yd < 0 || yd > 20) errs.push("Dividend yield must be between 0% and 20%.");
  if (y < 1 || y > 60) errs.push("Years must be 1–60.");
  if (m < 0) errs.push("Monthly contribution cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDrip(i, r, yd, y, m)); };
  const reset = () => {
    setInitial(DEFAULTS.initial); setRet(DEFAULTS.ret); setYieldPct(DEFAULTS.yield); setYears(DEFAULTS.years); setContrib(DEFAULTS.contrib);
    setResult(calcDrip(10000, 8, 3, 20, 200));
  };
  useEffect(() => { setResult(calcDrip(10000, 8, 3, 20, 200)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a DRIP?", answer: "A dividend reinvestment plan (DRIP) automatically uses dividend payments to buy more shares instead of paying them out as cash. Over decades, compounding turns dividends into an enormous share of total return — roughly half of the S&P 500's long-term return comes from reinvested dividends." },
    { question: "How does reinvesting compare to taking cash?", answer: "With a 3% yield and 8% total return over 20 years, reinvesting beats taking cash by tens of thousands of dollars because each dividend buys shares that then earn their own dividends and appreciation. This calculator models both paths month by month." },
    { question: "Are reinvested dividends taxed?", answer: "Reinvested dividends are still taxable income in the year they are paid — DRIP does not defer tax. In tax-advantaged accounts (IRA, 401k) dividends compound tax-free; in taxable accounts, qualified dividends face preferential rates." },
    { question: "What dividend yields are realistic?", answer: "The S&P 500 yields about 1.3–1.6%. Dividend-focused funds run 2.5–4%. Utilities and REITs often yield 3–5%+ (REIT dividends are taxed as ordinary income). A 6%+ yield is a red flag worth investigating — it can signal a cut coming." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Dividend Reinvestment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Dividend Reinvestment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Initial Investment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Annual Return</label>
                <div className={inp}><input type="number" value={ret} onChange={e => setRet(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Dividend Yield</label>
                <div className={inp}><input type="number" value={yieldPct} onChange={e => setYieldPct(e.target.value)} step="0.25" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Time Horizon</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Contributions</div>
                  <div>
                    <label className={lbl}>Monthly Contribution</label>
                    <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={contrib} onChange={e => setContrib(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Final Value with DRIP</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.finalWithDrip.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="text-emerald-600 font-semibold">+${result.dripAdvantage.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> vs taking dividends as cash
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Without DRIP", `$${result.finalWithoutDrip.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Contributions", `$${result.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Dividends Reinvested", `$${result.totalDividends.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">DRIP vs Cash Dividends</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "withDrip" ? "With DRIP" : "Cash Dividends"]} />
                    <Area type="monotone" dataKey="withDrip" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                    <Area type="monotone" dataKey="withoutDrip" stroke="#10b981" fill="#10b98122" strokeWidth={2} />
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
            <h2 className="text-2xl font-bold mb-3">The Power of Reinvested Dividends</h2>
            <p>Reinvesting dividends converts a one-time income stream into continuous compounding: each dividend buys fractional shares that earn future dividends of their own. This <strong>dividend reinvestment calculator</strong> models the DRIP path against taking cash, month by month, across your full horizon.</p>
            <h2 className="text-2xl font-bold mb-3">Model Mechanics</h2>
            <p>Each month the portfolio appreciates at the capital-appreciation rate (annual return minus dividend yield), receives a dividend equal to yield ÷ 12 of its value, and — under DRIP — that dividend is added to the balance. Contributions compound the same way in both scenarios.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Gap Grows</h2>
            <p>The DRIP advantage starts small and compounds. Over 20 years at 8% return and 3% yield, reinvesting adds roughly 10–15% more than taking cash — and the gap widens exponentially with time. Starting early is the single biggest lever in dividend investing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-reinvestment-calculator" />
          <PopularCalculators exclude="/calculator/dividend-reinvestment-calculator" />
        </div>
      </div>
    </>
  );
}
