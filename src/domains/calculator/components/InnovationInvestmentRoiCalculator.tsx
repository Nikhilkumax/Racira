"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  investment: string;
  incrementalRevenue: string;
  marginPct: string;
  costSavings: string;
  riskAdjPct: string;
  horizonYears: string;
  discountRate: string;
  ongoingCosts: string;
}

interface Result {
  annualBenefit: number;
  totalBenefit: number;
  netBenefit: number;
  roiPct: number;
  paybackMonths: number;
  riskAdjustedNpv: number;
}

const DEFAULTS: Inputs = {
  investment: "500000",
  incrementalRevenue: "350000",
  marginPct: "45",
  costSavings: "80000",
  riskAdjPct: "20",
  horizonYears: "5",
  discountRate: "12",
  ongoingCosts: "40000",
};

function calculate(inputs: Inputs): Result {
  const investment = Math.max(0, parseFloat(inputs.investment) || 0);
  const incrementalRevenue = Math.max(0, parseFloat(inputs.incrementalRevenue) || 0);
  const marginPct = Math.min(100, Math.max(0, parseFloat(inputs.marginPct) || 0));
  const costSavings = Math.max(0, parseFloat(inputs.costSavings) || 0);
  const riskAdjPct = Math.min(100, Math.max(0, parseFloat(inputs.riskAdjPct) || 0));
  const horizonYears = Math.min(20, Math.max(1, parseFloat(inputs.horizonYears) || 1));
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const ongoingCosts = Math.max(0, parseFloat(inputs.ongoingCosts) || 0);

  const annualBenefit = incrementalRevenue * (marginPct / 100) + costSavings - ongoingCosts;
  let totalBenefit = 0;
  for (let y = 1; y <= horizonYears; y++) {
    totalBenefit += annualBenefit / Math.pow(1 + discountRate / 100, y);
  }
  const netBenefit = totalBenefit - investment;
  const roiPct = investment > 0 ? (netBenefit / investment) * 100 : 0;
  const paybackMonths = annualBenefit > 0 ? (investment / annualBenefit) * 12 : 0;
  const riskAdjustedNpv = netBenefit * (1 - riskAdjPct / 100);

  return { annualBenefit, totalBenefit, netBenefit, roiPct, paybackMonths, riskAdjustedNpv };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function InnovationInvestmentRoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.investment) < 0 ||
    num(inputs.incrementalRevenue) < 0 ||
    num(inputs.marginPct) < 0 || num(inputs.marginPct) > 100 ||
    num(inputs.costSavings) < 0 ||
    num(inputs.riskAdjPct) < 0 || num(inputs.riskAdjPct) > 100 ||
    num(inputs.horizonYears) < 1 || num(inputs.horizonYears) > 20 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.ongoingCosts) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Innovation Investment", value: fmtMoney(num(inputs.investment)) },
    { label: `Incremental Revenue (${fmtMoney(num(inputs.incrementalRevenue))}/yr)`, value: fmtMoney(num(inputs.incrementalRevenue) * (num(inputs.marginPct) / 100)) + "/yr margin" },
    { label: "Cost Savings", value: fmtMoney(num(inputs.costSavings)) + "/yr" },
    { label: "Ongoing Operating Costs", value: "-" + fmtMoney(num(inputs.ongoingCosts)) + "/yr" },
    { label: "Annual Net Benefit", value: fmtMoney(result.annualBenefit) + "/yr" },
    { label: `Discounted Total Benefit (${fmt(num(inputs.horizonYears))} yrs @ ${fmt(num(inputs.discountRate), 1)}%)`, value: fmtMoney(result.totalBenefit) },
    { label: "Net Benefit (NPV)", value: fmtMoney(result.netBenefit), total: true },
    { label: `Risk-Adjusted NPV (${fmt(num(inputs.riskAdjPct), 1)}% discount)`, value: fmtMoney(result.riskAdjustedNpv), highlight: true },
  ];

  const summaryStats = [
    { label: "Investment", value: fmtMoney(num(inputs.investment)) },
    { label: "Incremental Revenue", value: fmtMoney(num(inputs.incrementalRevenue)) },
    { label: "Margin", value: fmt(num(inputs.marginPct), 1) + "%" },
    { label: "Cost Savings", value: fmtMoney(num(inputs.costSavings)) },
    { label: "Ongoing Costs", value: fmtMoney(num(inputs.ongoingCosts)) },
    { label: "Annual Net Benefit", value: fmtMoney(result.annualBenefit) },
    { label: "Discounted Total Benefit", value: fmtMoney(result.totalBenefit) },
    { label: "Net Benefit (NPV)", value: fmtMoney(result.netBenefit), bold: true },
    { label: "ROI", value: fmt(result.roiPct, 1) + "%" },
    { label: "Payback", value: fmt(result.paybackMonths, 1) + " months" },
    { label: "Risk-Adjusted NPV", value: fmtMoney(result.riskAdjustedNpv) },
    { label: "Horizon", value: fmt(num(inputs.horizonYears)) + " years" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Innovation Investment ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Innovation Investment ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ir-investment" label="Innovation Investment" value={inputs.investment} onChange={set("investment")} prefix="$" />
              <NumInput id="ir-revenue" label="Incremental Revenue" value={inputs.incrementalRevenue} onChange={set("incrementalRevenue")} prefix="$" suffix="/yr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ir-margin" label="Gross Margin on New Revenue" value={inputs.marginPct} onChange={set("marginPct")} suffix="%" />
              <NumInput id="ir-savings" label="Cost Savings" value={inputs.costSavings} onChange={set("costSavings")} prefix="$" suffix="/yr" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Risk & Time Value</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ir-risk" label="Risk Adjustment" value={inputs.riskAdjPct} onChange={set("riskAdjPct")} suffix="%" />
                    <NumInput id="ir-horizon" label="Evaluation Horizon" value={inputs.horizonYears} onChange={set("horizonYears")} suffix="years" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ir-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
                    <NumInput id="ir-ongoing" label="Ongoing Operating Costs" value={inputs.ongoingCosts} onChange={set("ongoingCosts")} prefix="$" suffix="/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; margin, risk, and discount rate between 0 and 100; horizon between 1 and 20 years.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Innovation Investment ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roiPct, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.netBenefit)} NPV — payback in {fmt(result.paybackMonths, 1)} months — {fmtMoney(result.riskAdjustedNpv)} risk-adjusted</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Net Benefit</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.annualBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Benefit (NPV)</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.netBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Risk-Adjusted NPV</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.riskAdjustedNpv)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Innovation Return Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Innovation Investment ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An innovation investment ROI calculator estimates the financial return on money spent on new products, new capabilities, or new ways of working. Innovation is the hardest investment to justify because its benefits arrive late, spread across many years, and carry high failure risk, but it is also the investment that determines whether a business grows or stagnates. This calculator translates an innovation program into the same language finance teams speak every day: incremental revenue at a realistic margin, cost savings from improved processes, ongoing operating costs, a discount rate that reflects the time value of money, and a risk adjustment that reflects the real odds of failure. The result is a net present value, an ROI percentage, a payback period, and a risk-adjusted NPV that shows what the program is worth if it underdelivers.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The margin application is deliberate: incremental revenue is only worth its gross margin, because the cost of goods and delivery scales with sales, and using the margin rather than the full revenue keeps the benefit estimate from overstating the return. The ongoing operating costs line captures the expense of running the innovation after launch, including maintenance, support, and staffing, without which the model would credit the innovation with revenue it can only earn at a continuing cost. The discount rate reflects the company's cost of capital and the risk profile of the project, and the risk adjustment is applied as a separate haircut on the final NPV rather than inside the discount rate, which keeps the two assumptions visible and independently tunable. This structure mirrors how finance teams actually evaluate innovation portfolios, and it lets you compare an innovation project directly against a capital purchase or an acquisition opportunity using the same metrics.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the total innovation investment, the annual incremental revenue the innovation is expected to generate, the gross margin on that revenue, and the annual cost savings. The margin converts the revenue into profit: with the default inputs, $350,000 of incremental revenue at a 45% margin contributes $157,500 a year. The advanced options add the annual ongoing operating costs, the evaluation horizon in years, the discount rate, and the risk adjustment percentage. The annual net benefit is the margin on incremental revenue plus cost savings minus ongoing costs, which with the defaults is $197,500 a year. The discounted total benefit sums the annual benefit over the horizon, reducing each year by the discount rate, and the net benefit subtracts the investment to produce the net present value. The ROI divides the NPV by the investment, the payback period divides the investment by the annual benefit and converts to months, and the risk-adjusted NPV applies the risk discount to the NPV to show the downside case.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The NPV is the decision number: a positive NPV means the innovation creates value over the horizon, while a negative one means it destroys it even before considering risk. The risk-adjusted NPV is the discipline check, because innovation portfolios fail at meaningful rates and a program that only works in the best case is not a sound investment. The payback period matters for cash-constrained businesses, since innovation benefits arrive slowly and an investment that takes years to recover ties up capital. Compare the ROI against your hurdle rate for other investments, and re-run the model with a conservative revenue case; if the innovation still clears the hurdle at reduced revenue and a higher risk discount, it deserves funding, and if not, the model has saved you the cost of discovering it later.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="innovation-investment-roi-calculator" />
        </div>
      </div>
    </>
  );
}