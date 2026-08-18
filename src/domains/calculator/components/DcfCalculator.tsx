"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DcfResult {
  intrinsicValuePerShare: number;
  enterpriseValue: number;
  terminalValue: number;
  pvProjectedFcf: number;
  yearRows: { year: number; fcf: number; pv: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; fcf: number }[];
}

const M = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;

function calcDcf(fcf: number, growthPct: number, years: number, discountPct: number, terminalPct: number, shares: number): DcfResult {
  const g = growthPct / 100;
  const r = discountPct / 100;
  const t = terminalPct / 100;
  const yearRows: DcfResult["yearRows"] = [];
  const chartData: DcfResult["chartData"] = [];
  let pvSum = 0;
  for (let y = 1; y <= years; y++) {
    const f = fcf * Math.pow(1 + g, y);
    const pv = f / Math.pow(1 + r, y);
    pvSum += pv;
    yearRows.push({ year: y, fcf: f, pv });
    chartData.push({ year: y, fcf });
  }
  const lastFcf = fcf * Math.pow(1 + g, years);
  const terminalValue = r > t ? (lastFcf * (1 + t)) / (r - t) : 0;
  const pvTerminal = terminalValue / Math.pow(1 + r, years);
  const enterpriseValue = pvSum + pvTerminal;
  const intrinsicValuePerShare = shares > 0 ? enterpriseValue / shares : 0;

  const breakdown = [
    { label: "Projected FCF (PV)", value: M(pvSum) },
    { label: "Terminal Value (PV)", value: M(pvTerminal) },
    { label: "Enterprise Value", value: M(enterpriseValue) },
    { label: "Intrinsic Value / Share", value: `$${intrinsicValuePerShare.toFixed(2)}` },
    { label: "Terminal Value (undiscounted)", value: M(terminalValue) },
    { label: "Shares Outstanding", value: `${shares}M` },
    { label: "Discount Rate (WACC)", value: `${discountPct}%` },
    { label: "Terminal Growth", value: `${terminalPct}%` },
  ];
  const summaryStats = [
    { label: "Intrinsic Value/Share", value: `$${intrinsicValuePerShare.toFixed(2)}` },
    { label: "Enterprise Value", value: M(enterpriseValue) },
    { label: "PV of Projected FCF", value: M(pvSum) },
    { label: "PV of Terminal", value: M(pvTerminal) },
    { label: "WACC", value: `${discountPct}%` },
    { label: "Growth (Years 1–N)", value: `${growthPct}%` },
    { label: "Terminal Growth", value: `${terminalPct}%` },
    { label: "Shares", value: `${shares}M` },
  ];
  return { intrinsicValuePerShare, enterpriseValue, terminalValue, pvProjectedFcf: pvSum, yearRows, breakdown, summaryStats, chartData };
}

const DEFAULTS = { fcf: "100", growth: "5", years: "5", discount: "10", terminal: "2.5", shares: "50" };

export default function DcfCalculator() {
  const [fcf, setFcf] = useState(DEFAULTS.fcf);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [years, setYears] = useState(DEFAULTS.years);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [terminal, setTerminal] = useState(DEFAULTS.terminal);
  const [shares, setShares] = useState(DEFAULTS.shares);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DcfResult | null>(null);

  const f = parseFloat(fcf) || 0;
  const g = parseFloat(growth) || 0;
  const y = parseInt(years) || 0;
  const r = parseFloat(discount) || 0;
  const t = parseFloat(terminal) || 0;
  const s = parseFloat(shares) || 0;
  const errs: string[] = [];
  if (f <= 0) errs.push("Free cash flow must be greater than 0.");
  if (g < -50 || g > 50) errs.push("Growth rate must be between -50% and 50%.");
  if (y < 1 || y > 30) errs.push("Projection years must be 1–30.");
  if (r <= 0 || r > 50) errs.push("Discount rate must be 0–50%.");
  if (t >= r) errs.push("Terminal growth must be below the discount rate.");
  if (s <= 0) errs.push("Shares outstanding must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDcf(f, g, y, r, t, s)); };
  const reset = () => {
    setFcf(DEFAULTS.fcf); setGrowth(DEFAULTS.growth); setYears(DEFAULTS.years); setDiscount(DEFAULTS.discount); setTerminal(DEFAULTS.terminal); setShares(DEFAULTS.shares);
    setResult(calcDcf(100, 5, 5, 10, 2.5, 50));
  };
  useEffect(() => { setResult(calcDcf(100, 5, 5, 10, 2.5, 50)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is discounted cash flow (DCF)?", answer: "DCF values a company by projecting its future free cash flows and discounting them back to present value using the weighted average cost of capital (WACC). It adds a terminal value capturing cash flows beyond the projection window, then divides by shares outstanding for a per-share intrinsic value." },
    { question: "How is the terminal value calculated?", answer: "Using the Gordon growth model: Terminal Value = FCF_last × (1 + g) ÷ (WACC − g), where g is the perpetual growth rate — typically 2–3%, near long-run GDP growth. The terminal value often accounts for 60–80% of the total valuation." },
    { question: "What is a good discount rate?", answer: "The WACC reflects the blended cost of debt and equity. Large, stable companies: 7–9%. Growth companies: 10–12%. Early-stage ventures: 15–25%. Small changes in WACC swing valuations dramatically — a 1% higher discount rate can cut intrinsic value by 10–15%." },
    { question: "What are DCF limitations?", answer: "DCF is only as good as its assumptions. Terminal growth, WACC, and near-term growth estimates drive the result far more than current cash flows. Always run sensitivity analysis across a range of assumptions, and combine DCF with comparables and precedent transactions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DCF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">DCF Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Annual Free Cash Flow</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={fcf} onChange={e => setFcf(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">M</span></div>
              </div>
              <div>
                <label className={lbl}>Discount Rate (WACC)</label>
                <div className={inp}><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Growth Rate (Years 1–N)</label>
                <div className={inp}><input type="number" value={growth} onChange={e => setGrowth(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Shares Outstanding</label>
                <div className={inp}><input type="number" value={shares} onChange={e => setShares(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">M</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Projection &amp; Terminal</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Projection Years</label>
                      <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Terminal Growth</label>
                      <div className={inp}><input type="number" value={terminal} onChange={e => setTerminal(e.target.value)} step="0.25" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Intrinsic Value per Share</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.intrinsicValuePerShare.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Enterprise value {M(result.enterpriseValue)} ÷ {shares}M shares</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Enterprise Value", M(result.enterpriseValue)], ["PV of Projected FCF", M(result.pvProjectedFcf)], ["Terminal Value (PV)", M(result.pvProjectedFcf > 0 ? result.enterpriseValue - result.pvProjectedFcf : 0)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">DCF Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.yearRows.map((r, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 text-muted-foreground">Year {r.year} — FCF</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">${r.fcf.toLocaleString("en-US", { maximumFractionDigits: 1 })}M</td>
                      <td className="py-2.5 text-right text-muted-foreground">PV ${r.pv.toLocaleString("en-US", { maximumFractionDigits: 1 })}M</td>
                    </tr>
                  ))}
                  {result.breakdown.map((r, i) => (
                    <tr key={i + 100} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-amber-700" : ""}`} colSpan={2}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Projected Free Cash Flow</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} />
                    <Tooltip formatter={(v: number) => [`$${v.toFixed(1)}M`, "FCF"]} />
                    <Area type="monotone" dataKey="fcf" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
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
            <h2 className="text-2xl font-bold mb-3">Discounted Cash Flow Valuation</h2>
            <p>DCF values a business on the cash it can return to owners. This <strong>DCF calculator</strong> projects free cash flow forward at your growth rate, discounts each year back at the WACC, adds a Gordon-growth terminal value, and divides by shares outstanding to estimate intrinsic value per share.</p>
            <h2 className="text-2xl font-bold mb-3">The Model</h2>
            <p>Intrinsic Value = Σ FCFₜ/(1+r)ᵗ + [FCFₙ(1+g)/(r−g)]/(1+r)ⁿ. The terminal value dominates — often 60–80% of the total — so scrutinize the terminal growth assumption. If terminal growth approaches WACC, the model explodes; keep g well below r.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Result</h2>
            <p>Compare intrinsic value per share to the current market price. If intrinsic exceeds price, the stock may be undervalued — but only under your assumptions. Re-run with pessimistic, base, and optimistic inputs; a stock that is cheap in every scenario is a far stronger signal than one cheap in just one.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dcf-calculator" />
          <PopularCalculators exclude="/calculator/dcf-calculator" />
        </div>
      </div>
    </>
  );
}
