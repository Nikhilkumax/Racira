"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface PaybackResult {
  paybackYears: number;
  paybackMonths: number;
  totalCashFlow: number;
  npv: number;
  irr: number;
  roi: number;
  isPositive: boolean;
  cumulativeData: { year: number; cumulative: number; undiscounted: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPayback(initialCost: number, annualCashFlow: number, discountRate: number, lifespan: number): PaybackResult {
  const paybackYears = annualCashFlow > 0 ? initialCost / annualCashFlow : Infinity;
  const paybackMonths = paybackYears * 12;
  const isPositive = paybackYears <= lifespan;

  // NPV calculation
  let npv = -initialCost;
  for (let t = 1; t <= lifespan; t++) {
    npv += annualCashFlow / Math.pow(1 + discountRate / 100, t);
  }

  // Simple IRR (Newton-Raphson approximation)
  let irr = discountRate;
  for (let i = 0; i < 100; i++) {
    let f = -initialCost;
    let df = 0;
    for (let t = 1; t <= lifespan; t++) {
      f += annualCashFlow / Math.pow(1 + irr / 100, t);
      df -= t * annualCashFlow / (100 * Math.pow(1 + irr / 100, t + 1));
    }
    if (Math.abs(f) < 0.001) break;
    irr = irr - f / df;
  }

  const totalCashFlow = annualCashFlow * lifespan;
  const roi = ((totalCashFlow - initialCost) / initialCost) * 100;

  const cumulativeData = Array.from({ length: lifespan + 1 }, (_, i) => {
    let disc = -initialCost;
    let undisc = -initialCost;
    for (let t = 1; t <= i; t++) {
      disc += annualCashFlow / Math.pow(1 + discountRate / 100, t);
      undisc += annualCashFlow;
    }
    return { year: i, cumulative: parseFloat(disc.toFixed(0)), undiscounted: parseFloat(undisc.toFixed(0)) };
  });

  const breakdown = [
    { label: "Initial Investment", value: `$${initialCost.toLocaleString()}` },
    { label: "Annual Cash Flow", value: `$${annualCashFlow.toLocaleString()}` },
    { label: "Simple Payback Period", value: paybackYears === Infinity ? "Never" : `${paybackYears.toFixed(2)} years` },
    { label: "Payback in Months", value: paybackYears === Infinity ? "Never" : `${paybackMonths.toFixed(1)} months` },
    { label: "Project Lifespan", value: `${lifespan} years` },
    { label: "Total Cash Flow", value: `$${totalCashFlow.toLocaleString()}` },
    { label: "Net Profit", value: `$${(totalCashFlow - initialCost).toLocaleString()}` },
    { label: "ROI", value: `${roi.toFixed(1)}%` },
    { label: "NPV (at discount rate)", value: `$${npv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Internal Rate of Return", value: `${Math.max(0, irr).toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Payback Period", value: paybackYears === Infinity ? "Never" : `${paybackYears.toFixed(2)} yrs` },
    { label: "ROI", value: `${roi.toFixed(1)}%` },
    { label: "NPV", value: `$${npv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "IRR", value: `${Math.max(0, irr).toFixed(1)}%` },
    { label: "Total Cash Flow", value: `$${totalCashFlow.toLocaleString()}` },
    { label: "Net Profit", value: `$${(totalCashFlow - initialCost).toLocaleString()}` },
  ];

  return { paybackYears, paybackMonths, totalCashFlow, npv, irr: Math.max(0, irr), roi, isPositive, cumulativeData, breakdown, summaryStats };
}

export default function PaybackPeriodCalculatorAdvanced() {
  const [initialCost, setInitialCost] = useState("100000");
  const [annualCashFlow, setAnnualCashFlow] = useState("25000");
  const [discountRate, setDiscountRate] = useState("8");
  const [lifespan, setLifespan] = useState("10");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PaybackResult | null>(null);

  const calculate = () => {
    const ic = parseFloat(initialCost) || 0, acf = parseFloat(annualCashFlow) || 0;
    const dr = parseFloat(discountRate) || 0, ls = parseInt(lifespan) || 10;
    if (ic > 0 && acf > 0) setResult(calcPayback(ic, acf, dr, ls));
  };

  useEffect(() => { setResult(calcPayback(100000, 25000, 8, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is the payback period?", answer: "The payback period is the time required for an investment to generate cash flows equal to the initial cost. Payback Period = Initial Investment ÷ Annual Cash Flow. Example: $100,000 investment returning $25,000/year = 4-year payback. It's a simple, intuitive metric but ignores the time value of money (a dollar today is worth more than a dollar in 5 years) and cash flows after the payback point." },
    { question: "What is a good payback period?", answer: "A 'good' payback period depends heavily on the industry and investment type. Capital equipment: 2–5 years. Real estate: 7–15 years. Solar panels: 6–12 years. Software/IT investments: 1–3 years. Startups and high-risk ventures: investors often look for 2–4 year paybacks. Generally, shorter payback periods are preferred as they reduce risk and improve liquidity." },
    { question: "What is the difference between simple payback and discounted payback?", answer: "Simple payback ignores the time value of money — it treats a dollar received in year 10 the same as a dollar received in year 1. Discounted payback accounts for the fact that future cash flows are worth less than present ones, by discounting them at a required rate of return (typically the cost of capital or WACC). Discounted payback is always longer than simple payback and provides a more accurate picture of when you truly 'break even' in real terms." },
    { question: "What is NPV and why does it matter?", answer: "Net Present Value (NPV) is the sum of all discounted future cash flows minus the initial investment. NPV = −Initial Cost + Σ (Cash Flow_t / (1 + r)^t). A positive NPV means the investment creates value above the required return rate. NPV is generally considered superior to payback period for investment decisions because it considers all cash flows over the investment's life and accounts for the time value of money." },
    { question: "What is IRR and how is it interpreted?", answer: "Internal Rate of Return (IRR) is the discount rate at which NPV = 0. If IRR exceeds your cost of capital (WACC), the investment is worthwhile. Example: IRR of 15% with 8% cost of capital means the investment returns 7% above the required rate. Multiple IRRs can occur with non-conventional cash flows. Limitations: IRR assumes reinvestment at the IRR rate, which may be unrealistic for high-IRR projects." },
    { question: "What is a good ROI for a business investment?", answer: "ROI (Return on Investment) = (Total Cash Flow − Initial Investment) ÷ Initial Investment × 100%. Context matters: S&P 500 returns average 10–12%/year over long periods; a 'good' business investment should exceed this hurdle. Venture capital targets 10×+ returns. Real estate: 8–12% annual returns. Equipment investments: 15–25% ROI are common targets. The relevant comparison is your cost of capital (cost of borrowing or opportunity cost)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Payback Period Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Payback Period Calculator (Advanced)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Initial Investment</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={initialCost} onChange={e => setInitialCost(e.target.value)} className={ci} /></div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Annual Cash Flow</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualCashFlow} onChange={e => setAnnualCashFlow(e.target.value)} className={ci} /></div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-1.5 text-base font-semibold text-primary hover:underline">
                Advanced Options <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Discount Rate</label>
                    <div className={inp}><input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} step={0.5} className={ci} /><span className={suf}>%</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Project Lifespan</label>
                    <div className={inp}><input type="number" value={lifespan} onChange={e => setLifespan(e.target.value)} min={1} max={30} className={ci} /><span className={suf}>yrs</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setInitialCost("100000"); setAnnualCashFlow("25000"); setDiscountRate("8"); setLifespan("10"); setResult(calcPayback(100000, 25000, 8, 10)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.isPositive ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.isPositive ? "text-green-600" : "text-red-600"}`}>Payback Period</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.paybackYears.toFixed(2)} years</div>
                <div className="text-base text-muted-foreground mt-1">{result.paybackMonths.toFixed(1)} months · ROI: {result.roi.toFixed(1)}% · IRR: {result.irr.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["NPV", `$${(result.npv / 1000).toFixed(1)}K`], ["IRR", `${result.irr.toFixed(1)}%`], ["Total ROI", `${result.roi.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${l === "NPV" && result.npv < 0 ? "text-red-500" : ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Investment Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Cumulative Cash Flow Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.cumulativeData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="undiscounted" name="Simple" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cumulative" name="Discounted" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
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
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Payback Period?</h2>
            <p>The payback period is the length of time required for an investment to recoup its initial cost from generated cash flows. It's one of the most widely used capital budgeting metrics because of its simplicity and intuitive interpretation. This <strong>advanced payback period calculator</strong> goes beyond the basic formula to include discounted payback period, Net Present Value (NPV), and Internal Rate of Return (IRR) — giving you a comprehensive investment analysis.</p>
            <h2>Simple vs. Discounted Payback Period</h2>
            <p>Simple Payback = Initial Investment ÷ Annual Cash Flow. For $100,000 generating $25,000/year: 4 years. Simple payback ignores time value of money. Discounted Payback accounts for the fact that future cash flows are worth less than present cash — it discounts each year's cash flow by the required rate of return. At 8% discount rate, the discounted payback will be longer than 4 years because early year discounted cash flows are worth less than $25,000 in today's dollars.</p>
            <h2>Net Present Value (NPV)</h2>
            <p>NPV = −Investment + Σ (Cash Flow_t ÷ (1 + r)^t) summed over all years. A positive NPV means the investment creates value above the required return. For our example at 8% discount rate over 10 years: NPV = −$100,000 + PV of $25,000/year for 10 years at 8% = −$100,000 + $167,770 = +$67,770. This positive NPV confirms the investment is worthwhile at an 8% hurdle rate.</p>
            <h2>Internal Rate of Return (IRR)</h2>
            <p>IRR is the discount rate at which NPV equals zero. It represents the effective compound annual return of the investment. Decision rule: accept the investment if IRR {'>'} Cost of Capital (WACC). Our example yields IRR ≈ 21.4%, well above the 8% discount rate, confirming strong value creation. Related tools: <a href="/calculator/roi-calculator">ROI Calculator</a>, <a href="/calculator/npv-calculator">NPV Calculator</a>, <a href="/calculator/investment-calculator">Investment Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payback-period-calculator-advanced" />
          <PopularCalculators exclude="/calculator/payback-period-calculator-advanced" />
        </div>
      </div>
    </>
  );
}
