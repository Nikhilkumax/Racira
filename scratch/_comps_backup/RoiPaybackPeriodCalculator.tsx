"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  initialInvestment: string;
  annualCashFlow: string;
  growthPct: string;
  discountRate: string;
  salvageValue: string;
  horizonYears: string;
}

interface Result {
  paybackYears: number;
  paybackMonths: number;
  simpleRoi: number;
  cumulativeCash: number;
  discountedNpv: number;
  discountedPaybackYears: number;
}

const DEFAULTS: Inputs = {
  initialInvestment: "100000",
  annualCashFlow: "30000",
  growthPct: "5",
  discountRate: "8",
  salvageValue: "15000",
  horizonYears: "10",
};

function calculate(inputs: Inputs): Result {
  const initialInvestment = Math.max(0, parseFloat(inputs.initialInvestment) || 0);
  const annualCashFlow = Math.max(0, parseFloat(inputs.annualCashFlow) || 0);
  const growthPct = Math.min(100, Math.max(0, parseFloat(inputs.growthPct) || 0));
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const salvageValue = Math.max(0, parseFloat(inputs.salvageValue) || 0);
  const horizonYears = Math.min(50, Math.max(1, parseFloat(inputs.horizonYears) || 1));

  let cumulative = 0;
  let paybackYears = 0;
  let discountedCumulative = 0;
  let discountedPaybackYears = 0;
  let cumulativeCash = 0;
  let discountedNpv = 0;
  let cf = annualCashFlow;
  for (let y = 1; y <= horizonYears; y++) {
    cumulative += cf;
    cumulativeCash += cf;
    if (cumulative >= initialInvestment && paybackYears === 0) paybackYears = y;
    const dcf = cf / Math.pow(1 + discountRate / 100, y);
    discountedCumulative += dcf;
    discountedNpv += dcf;
    if (discountedCumulative >= initialInvestment && discountedPaybackYears === 0) discountedPaybackYears = y;
    cf *= 1 + growthPct / 100;
  }
  const finalYearValue = cumulativeCash;
  const npv = discountedNpv + salvageValue / Math.pow(1 + discountRate / 100, horizonYears) - initialInvestment;
  const simpleRoi = initialInvestment > 0 ? ((finalYearValue + salvageValue - initialInvestment) / initialInvestment) * 100 : 0;
  const paybackMonths = paybackYears > 0 ? paybackYears * 12 : 0;

  return { paybackYears, paybackMonths, simpleRoi, cumulativeCash, discountedNpv: npv, discountedPaybackYears };
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

export default function RoiPaybackPeriodCalculator() {
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
    num(inputs.initialInvestment) < 0 ||
    num(inputs.annualCashFlow) < 0 ||
    num(inputs.growthPct) < 0 || num(inputs.growthPct) > 100 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.salvageValue) < 0 ||
    num(inputs.horizonYears) < 1 || num(inputs.horizonYears) > 50;

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
    { label: "Initial Investment", value: fmtMoney(num(inputs.initialInvestment)) },
    { label: `Year 1 Cash Flow (${fmtMoney(num(inputs.annualCashFlow))})`, value: fmtMoney(num(inputs.annualCashFlow)) },
    { label: `Annual Cash Flow Growth (${fmt(num(inputs.growthPct), 1)}%)`, value: fmtMoney(result.cumulativeCash) + " cumulative" },
    { label: `Salvage / Terminal Value`, value: fmtMoney(num(inputs.salvageValue)) },
    { label: `Discounted NPV @ ${fmt(num(inputs.discountRate), 1)}% (${fmt(num(inputs.horizonYears))} yrs)`, value: fmtMoney(result.discountedNpv) },
    { label: "Simple Payback Period", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " years (" + fmt(result.paybackMonths) + " months)" : "Beyond horizon" },
    { label: "Discounted Payback Period", value: result.discountedPaybackYears > 0 ? fmt(result.discountedPaybackYears) + " years" : "Beyond horizon" },
    { label: "Simple ROI", value: fmt(result.simpleRoi, 1) + "%", total: true },
    { label: "Payback (with growth)", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " yrs" : "N/A", highlight: true },
  ];

  const summaryStats = [
    { label: "Initial Investment", value: fmtMoney(num(inputs.initialInvestment)) },
    { label: "Year 1 Cash Flow", value: fmtMoney(num(inputs.annualCashFlow)) },
    { label: "Cash Flow Growth", value: fmt(num(inputs.growthPct), 1) + "%" },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "Salvage Value", value: fmtMoney(num(inputs.salvageValue)) },
    { label: "Horizon", value: fmt(num(inputs.horizonYears)) + " years" },
    { label: "Cumulative Cash Flow", value: fmtMoney(result.cumulativeCash) },
    { label: "Discounted NPV", value: fmtMoney(result.discountedNpv) },
    { label: "Simple Payback", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " yrs" : "Beyond horizon" },
    { label: "Discounted Payback", value: result.discountedPaybackYears > 0 ? fmt(result.discountedPaybackYears) + " yrs" : "Beyond horizon" },
    { label: "Simple ROI", value: fmt(result.simpleRoi, 1) + "%", bold: true },
    { label: "Payback in Months", value: fmt(result.paybackMonths) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "ROI Payback Period Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ROI Payback Period Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rp-investment" label="Initial Investment" value={inputs.initialInvestment} onChange={set("initialInvestment")} prefix="$" />
              <NumInput id="rp-cashflow" label="Year 1 Annual Cash Flow" value={inputs.annualCashFlow} onChange={set("annualCashFlow")} prefix="$" suffix="/yr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rp-growth" label="Cash Flow Growth" value={inputs.growthPct} onChange={set("growthPct")} suffix="%" />
              <NumInput id="rp-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Terminal Value</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rp-salvage" label="Salvage / Terminal Value" value={inputs.salvageValue} onChange={set("salvageValue")} prefix="$" />
                    <NumInput id="rp-horizon" label="Analysis Horizon" value={inputs.horizonYears} onChange={set("horizonYears")} suffix="years" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; growth and discount rate between 0 and 100; horizon between 1 and 50 years.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Payback Period</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.paybackYears > 0 ? fmt(result.paybackYears) + " yrs" : "N/A"}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.simpleRoi, 1)}% simple ROI — {fmtMoney(result.discountedNpv)} discounted NPV</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback (months)</span>
                <span className="font-extrabold text-amber-600">{fmt(result.paybackMonths)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Discounted Payback</span>
                <span className="font-extrabold text-amber-600">{result.discountedPaybackYears > 0 ? fmt(result.discountedPaybackYears) + " yrs" : "N/A"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Simple ROI</span>
                <span className="font-extrabold text-red-600">{fmt(result.simpleRoi, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Payback & ROI Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an ROI Payback Period Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An ROI payback period calculator estimates how long it takes an investment to recover its initial cost through the cash flow it generates, along with the investment's overall return. The payback period is the most intuitive investment metric: a $100,000 investment producing $30,000 a year pays back in just over three years. The simple version ignores both the growth of cash flows and the time value of money, so this calculator also computes a discounted payback that accounts for both, plus the net present value of the investment's cash flows over a chosen horizon and the simple ROI. Together these metrics answer the three questions every capital decision asks: how fast the money comes back, how much value the investment creates, and whether the return justifies the risk.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The year-by-year loop structure is what makes the model accurate for growing cash flows: rather than assuming a flat annual benefit, each year's cash flow is grown from the previous year's, so the payback calculation reflects the actual cash recovery pattern of investments whose returns increase over time, such as customer acquisitions, market expansions, and efficiency programs that scale. The discount rate should reflect the company's weighted average cost of capital or an appropriate hurdle rate for the project's risk, and the difference between the simple payback and the discounted payback is a direct measure of how much the time value of money matters for the investment. The salvage value is discounted back from the end of the horizon because a dollar of residual value in year ten is worth far less than a dollar today. The simple ROI uses the undiscounted total cash flow plus salvage minus the investment, which makes it the optimistic ceiling, while the NPV is the disciplined floor, and the gap between them shows how sensitive the investment is to the discount rate assumption.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the initial investment, the year-one annual cash flow, the annual cash flow growth rate, and the discount rate. The model projects the cash flow forward year by year, growing it at the growth rate, and accumulates the total until it first covers the initial investment, which is the simple payback period: with the default inputs, $30,000 growing at 5% a year recovers a $100,000 investment in about four years. The discounted payback applies the discount rate to each year's cash flow before accumulating, so it takes longer, reflecting the time value of money. The advanced options add the salvage or terminal value, which is discounted back and added to the cash flows, and the analysis horizon. The net present value is the discounted cash flows plus the discounted salvage value minus the initial investment, and the simple ROI divides the total cash plus salvage minus the investment by the investment itself.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The payback period is the risk metric: the faster the payback, the less time the investment is exposed to changing conditions, which is why short-payback projects are favored in uncertain environments. The discounted payback is the honest version of that number, and if it stretches far past the simple payback, the discount rate assumption deserves scrutiny. A positive NPV means the investment creates value over the horizon, and a negative one means it destroys value even if it eventually pays back. Use the simple ROI to compare projects of different sizes, but remember it ignores timing. Re-run the model with conservative growth and a higher discount rate; if the investment still pays back within the horizon and holds a positive NPV, it can survive scrutiny.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="roi-payback-period-calculator" />
        </div>
      </div>
    </>
  );
}