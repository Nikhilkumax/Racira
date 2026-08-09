"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Printer, Percent, Landmark, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PointsInputs {
  loanAmount: number;
  baseRate: number;
  termYears: number;
  pointsBought: number;
  pointCostPercent: number;
  rateReductionPerPoint: number;
  proMode: boolean;
  expectedTenureYears: number;
  marginalTaxRate: number;
  alternativeReturnRate: number;
}

interface ChartPoint {
  name: string;
  value: number;
  isWithPoints: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface PointsResult {
  newRate: number;
  upfrontCost: number;
  originalMonthly: number;
  newMonthly: number;
  monthlySavings: number;
  breakEvenMonths: number;
  totalInterestOriginal: number;
  totalInterestNew: number;
  interestSaved: number;
  lifetimeNetSavings: number;
  verdict: string;
  verdictColor: string;
  chartData: ChartPoint[];
  rows: TableRow[];
  savingsAtTenure: number;
  netAtTenure: number;
  taxAdjustedBreakEven: number;
  opportunityCost: number;
  breakEvenWithOpportunity: number;
}

function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

const DEFAULTS: PointsInputs = {
  loanAmount: 350000,
  baseRate: 7.0,
  termYears: 30,
  pointsBought: 2,
  pointCostPercent: 1,
  rateReductionPerPoint: 0.25,
  proMode: false,
  expectedTenureYears: 7,
  marginalTaxRate: 24,
  alternativeReturnRate: 5,
};

export function calculatePoints(i: PointsInputs): PointsResult {
  const loan = Math.max(0, i.loanAmount);
  const months = Math.max(1, Math.round(i.termYears * 12));
  const points = Math.max(0, i.pointsBought);

  const originalMonthly = monthlyPayment(loan, Math.max(0, i.baseRate), months);
  const totalInterestOriginal = Math.max(0, originalMonthly * months - loan);

  const newRate = Math.max(0, i.baseRate - points * Math.max(0, i.rateReductionPerPoint));
  const newMonthly = monthlyPayment(loan, newRate, months);
  const totalInterestNew = Math.max(0, newMonthly * months - loan);

  const upfrontCost = loan * ((points * Math.max(0, i.pointCostPercent)) / 100);
  const monthlySavings = originalMonthly - newMonthly;
  const breakEvenMonths = monthlySavings > 0 ? upfrontCost / monthlySavings : 0;

  const interestSaved = totalInterestOriginal - totalInterestNew;
  const lifetimeNetSavings = interestSaved - upfrontCost;

  const tenureMonths = Math.max(1, Math.round(i.expectedTenureYears * 12));
  const savingsAtTenure = monthlySavings * tenureMonths;
  const netAtTenure = savingsAtTenure - upfrontCost;

  // Discount points on a purchase loan are generally deductible as prepaid
  // interest in the year paid, which lowers the effective upfront cost.
  const taxRate = Math.min(100, Math.max(0, i.marginalTaxRate)) / 100;
  const afterTaxCost = upfrontCost * (1 - taxRate);
  const taxAdjustedBreakEven = monthlySavings > 0 ? afterTaxCost / monthlySavings : 0;

  // The cash spent on points could have been invested instead. Compare the
  // forgone growth over the break-even window against the savings.
  const altRate = Math.max(0, i.alternativeReturnRate) / 100;
  const beYears = breakEvenMonths / 12;
  const opportunityCost = upfrontCost * (Math.pow(1 + altRate, Math.max(0, beYears)) - 1);
  const breakEvenWithOpportunity =
    monthlySavings > 0 ? (upfrontCost + opportunityCost) / monthlySavings : 0;

  let verdict: string;
  let verdictColor: string;
  if (monthlySavings <= 0 || breakEvenMonths <= 0) {
    verdict = "Points buy no rate reduction — do not purchase";
    verdictColor = "text-red-600";
  } else if (breakEvenMonths <= tenureMonths * 0.6) {
    verdict = "Strong — recovered well inside your expected tenure";
    verdictColor = "text-emerald-600";
  } else if (breakEvenMonths <= tenureMonths) {
    verdict = "Marginal — break-even lands close to when you expect to leave";
    verdictColor = "text-amber-600";
  } else {
    verdict = "Poor — you would sell or refinance before recovering the cost";
    verdictColor = "text-red-600";
  }

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const chartData: ChartPoint[] = [
    { name: "Monthly (no pts)", value: Math.round(originalMonthly), isWithPoints: false },
    { name: "Monthly (with pts)", value: Math.round(newMonthly), isWithPoints: true },
  ];

  const rows: TableRow[] = [
    { label: "Loan Amount", value: money(loan) },
    { label: "Base Interest Rate", value: `${i.baseRate.toFixed(3)}%` },
    { label: "Points Purchased", value: `${points.toFixed(2)} pts @ ${i.pointCostPercent.toFixed(2)}% each` },
    { label: "Buydown Rate", value: `${newRate.toFixed(3)}%` },
    { label: "Upfront Cost at Closing", value: money(upfrontCost) },
    { label: "Monthly Payment Without Points", value: money(originalMonthly) },
    { label: "Monthly Payment With Points", value: money(newMonthly) },
    { label: "Monthly Savings", value: `${money(monthlySavings)} / mo` },
    { label: "Break-Even Point", value: breakEvenMonths > 0 ? `${breakEvenMonths.toFixed(1)} months` : "Never", key: true },
    { label: "Total Interest Without Points", value: money(totalInterestOriginal) },
    { label: "Total Interest With Points", value: money(totalInterestNew) },
    { label: "Lifetime Net Savings", value: money(lifetimeNetSavings) },
  ];

  return {
    newRate,
    upfrontCost,
    originalMonthly,
    newMonthly,
    monthlySavings,
    breakEvenMonths,
    totalInterestOriginal,
    totalInterestNew,
    interestSaved,
    lifetimeNetSavings,
    verdict,
    verdictColor,
    chartData,
    rows,
    savingsAtTenure,
    netAtTenure,
    taxAdjustedBreakEven,
    opportunityCost,
    breakEvenWithOpportunity,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function MortgagePointsCalculator() {
  const [inputs, setInputs] = useState<PointsInputs>(DEFAULTS);
  const [result, setResult] = useState<PointsResult>(calculatePoints(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculatePoints(inputs));
  }, []);

  const calculate = () => setResult(calculatePoints(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePoints(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof PointsInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "What are mortgage discount points?",
      answer:
        "Mortgage discount points are optional upfront fees paid to the lender at closing in exchange for a lower interest rate. One point traditionally costs 1% of the loan amount — $3,500 on a $350,000 loan — and conventionally buys about 0.25% off the rate. You are effectively prepaying interest to shrink the monthly payment for the life of the loan. Whether that trade is worthwhile is purely a function of how long you keep the loan.",
    },
    {
      question: "How is the break-even point calculated?",
      answer:
        "Break-even is the upfront cost of the points divided by the monthly payment savings they produce. On a $350,000 loan, 2 points cost $7,000 and a 0.5% buydown saves roughly $111 per month, so break-even is $7,000 ÷ $111 ≈ 63 months. Every month beyond that is profit; every month before it is a loss. The figure is only as good as your tenure estimate, which is why selling or refinancing before break-even is the classic way to lose money on points.",
    },
    {
      question: "How much does one point reduce my rate?",
      answer:
        "There is no legally mandated schedule. The conventional rule of thumb is 0.25% per point, but lender pricing varies daily with the bond market and can run from 0.125% to 0.375%. The number that matters is your lender's actual pricing sheet. This calculator defaults to the 0.25% convention but takes whatever reduction your lender quotes — using the real figure is what separates a meaningful answer from an optimistic one.",
    },
    {
      question: "Is buying points tax-deductible?",
      answer:
        "Discount points paid on a purchase mortgage are generally deductible as prepaid interest in the year paid, which effectively lowers their cost by your marginal tax rate. On refinances the deduction is typically spread over the life of the loan. Professional Mode applies your tax rate to compute a tax-adjusted break-even. Deductibility assumes you itemize, so the benefit phases out if the standard deduction is more advantageous for you.",
    },
    {
      question: "Should I buy points if I might refinance?",
      answer:
        "Very likely not. If rates drop and you refinance, the original loan is closed and the money you paid for its points is gone, unrecouped regardless of how close you were to break-even. The decision framework is the same for points as for any prepayment: they pay off only if you keep the loan past break-even, and the risk is that you do not. Many borrowers in high-rate environments buy points and then refinance within a few years, converting what looked like a good deal into a guaranteed loss.",
    },
    {
      question: "What about the opportunity cost of the cash?",
      answer:
        "The $7,000 you hand to the lender at closing could have been invested instead. Over a 5.25-year break-even window at a 5% alternative return, that cash would have grown by roughly $1,940 — which makes break-even meaningfully longer in economic terms. Professional Mode computes this explicitly. The comparison is most relevant when buying points competes with building an emergency fund or paying down higher-rate debt.",
    },
    {
      question: "Why compare against my expected tenure rather than the loan term?",
      answer:
        "Because almost nobody holds a 30-year mortgage for 30 years. The median U.S. mortgage is closed out in roughly 7 to 10 years through sale or refinance, and the average is skewed by the minority who stay the full term. Comparing break-even against the full loan term overstates the case for points; comparing against your realistic tenure — the number this calculator's verdict uses — is the honest test.",
    },
    {
      question: "Do zero-point loans change the math?",
      answer:
        "Yes, in your favor. Lenders typically offer a higher-rate, zero-point option with a lender credit, and the correct baseline for evaluating points is always the loan you would take without them — often the zero-point rate, not the advertised rate. If the no-point loan already covers your closing costs with a credit, the effective cost of buying down the rate is even higher than 1% per point, and break-even stretches accordingly.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator/finance" },
          { label: "Mortgage Points Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Points Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="loanAmount" className={lbl}>Loan Amount</label>
                <input id="loanAmount" type="number" min="0" step="1000" className={inp} value={inputs.loanAmount}
                  onChange={(e) => setNum("loanAmount", e.target.value)} />
              </div>
              <div>
                <label htmlFor="baseRate" className={lbl}>Base Rate (%)</label>
                <input id="baseRate" type="number" min="0" step="0.125" className={inp} value={inputs.baseRate}
                  onChange={(e) => setNum("baseRate", e.target.value)} />
              </div>
              <div>
                <label htmlFor="pointsBought" className={lbl}>Points to Buy</label>
                <input id="pointsBought" type="number" min="0" step="0.125" className={inp} value={inputs.pointsBought}
                  onChange={(e) => setNum("pointsBought", e.target.value)} />
              </div>
              <div>
                <label htmlFor="termYears" className={lbl}>Loan Term (yrs)</label>
                <input id="termYears" type="number" min="1" step="1" className={inp} value={inputs.termYears}
                  onChange={(e) => setNum("termYears", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Percent className="h-3.5 w-3.5" /> Lender Pricing
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="pointCostPercent" className={lbl}>Cost per Point (%)</label>
                        <input id="pointCostPercent" type="number" min="0" step="0.1" className={inp}
                          value={inputs.pointCostPercent} onChange={(e) => setNum("pointCostPercent", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="rateReductionPerPoint" className={lbl}>Rate Cut per Point (%)</label>
                        <input id="rateReductionPerPoint" type="number" min="0" step="0.05" className={inp}
                          value={inputs.rateReductionPerPoint} onChange={(e) => setNum("rateReductionPerPoint", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <TrendingUp className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock tenure, tax, and opportunity-cost analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="expectedTenureYears" className={lbl}>Expected Tenure (yrs)</label>
                          <input id="expectedTenureYears" type="number" min="0" step="0.5" className={inp}
                            value={inputs.expectedTenureYears} onChange={(e) => setNum("expectedTenureYears", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="marginalTaxRate" className={lbl}>Marginal Tax Rate (%)</label>
                          <input id="marginalTaxRate" type="number" min="0" max="50" step="1" className={inp}
                            value={inputs.marginalTaxRate} onChange={(e) => setNum("marginalTaxRate", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="alternativeReturnRate" className={lbl}>Alternative Return on Cash (%)</label>
                          <input id="alternativeReturnRate" type="number" min="0" step="0.5" className={inp}
                            value={inputs.alternativeReturnRate} onChange={(e) => setNum("alternativeReturnRate", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Break-Even Time</div>
              <div className="text-4xl font-bold text-primary my-1">
                {result.breakEvenMonths > 0 ? `${result.breakEvenMonths.toFixed(1)} mo` : "Never"}
              </div>
              <div className="text-sm text-muted-foreground">
                Recover {money(result.upfrontCost)} at {money(result.monthlySavings)}/mo — new rate {result.newRate.toFixed(3)}%
              </div>
              <div className={`text-base font-bold mt-2 ${result.verdictColor}`}>{result.verdict}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Monthly Savings</div>
                <div className={`text-lg font-bold ${result.monthlySavings > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {money(result.monthlySavings)}/mo
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Lifetime Net</div>
                <div className={`text-lg font-bold ${result.lifetimeNetSavings >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {money(result.lifetimeNetSavings)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">New Rate</div>
                <div className="text-lg font-bold text-amber-600">{result.newRate.toFixed(3)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 pr-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Lifetime Net Savings</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{money(result.lifetimeNetSavings)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Monthly Payment Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                    <RTooltip formatter={(value: number) => money(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isWithPoints ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Without points
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> With points
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Tenure, Tax &amp; Opportunity Cost</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Savings at Tenure ({inputs.expectedTenureYears} yrs)</div>
                    <div className="text-base font-bold text-emerald-600">{money(result.savingsAtTenure)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Position at Tenure</div>
                    <div className={`text-base font-bold ${result.netAtTenure >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {money(result.netAtTenure)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax-Adjusted Break-Even</div>
                    <div className="text-base font-bold text-foreground">{result.taxAdjustedBreakEven.toFixed(1)} months</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Forgone Growth at Break-Even</div>
                    <div className="text-base font-bold text-amber-600">{money(result.opportunityCost)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even Including Opportunity Cost</div>
                    <div className="text-base font-bold text-foreground">{result.breakEvenWithOpportunity.toFixed(1)} months</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Buying Down the Rate Actually Buys</h2>
            <p className="mb-4">
              Mortgage discount points are a straightforward trade: cash at closing in exchange for a lower rate. One
              point conventionally costs 1% of the loan amount and buys about 0.25% off the rate, though lender pricing
              moves daily with the bond market and can range from 0.125% to 0.375% per point. The entire question of
              whether to buy them reduces to one comparison — how long you keep the loan versus how long the savings take
              to repay the upfront cost. Everything else is decoration.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Break-Even That Decides It</h2>
            <p className="mb-4">
              On a $350,000 loan, two points cost $7,000 and a 0.5% buydown cuts the payment by roughly $111 per month,
              placing break-even at about 63 months. Stay past that point and the deal compounds in your favor; sell or
              refinance before it and you lose. The median U.S. mortgage is closed out within about 7 to 10 years through
              sale or refinance, which is why comparing break-even against the full 30-year term — the way many loan
              estimates present it — systematically overstates the case for buying points. The honest baseline is your
              realistic tenure, and this calculator's verdict is built on exactly that comparison.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Refinance Trap and the Tax Angle</h2>
            <p className="mb-4">
              The classic failure mode is buying points in a high-rate environment and then refinancing when rates fall.
              The old loan closes, and the cash spent on its points is gone regardless of how close you came to
              break-even. Two factors soften the true cost: points on a purchase mortgage are generally deductible as
              prepaid interest in the year paid, which Professional Mode converts into a tax-adjusted break-even, and
              the cash could otherwise have been invested, which extends break-even by the forgone return. Both run the
              same direction — a realistic break-even is longer than the headline number suggests.
            </p>

            <h2 className="text-2xl font-bold mb-3">Compare Against the Loan You Would Actually Take</h2>
            <p>
              One more baseline matters: points are only worth evaluating against the zero-point version of the same
              loan. Many lenders offer a higher-rate option with a lender credit that already covers closing costs, and
              some quote rates that embed points in the first place. If the no-point loan credits your closing costs, the
              effective cost of a buydown is higher than 1% per point and break-even stretches accordingly. Run the
              comparison with your lender's exact pricing sheet — the rate reduction they quote, not the 0.25% convention
              — and treat the result as one input into a decision that also weighs how much cash you need at closing and
              whether that money has better uses.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-points-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-points-calculator" />
        </div>
      </div>
    </>
  );
}
