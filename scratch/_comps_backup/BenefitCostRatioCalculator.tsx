"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualBenefits: string;
  initialCost: string;
  annualCosts: string;
  discountRate: string;
  years: string;
  benefitGrowth: string;
  costGrowth: string;
}

interface Result {
  pvBenefits: number;
  pvCosts: number;
  bcr: number;
  npv: number;
  annualNet: number;
  roiPct: number;
}

const DEFAULTS: Inputs = {
  annualBenefits: "120000",
  initialCost: "150000",
  annualCosts: "40000",
  discountRate: "8",
  years: "5",
  benefitGrowth: "2",
  costGrowth: "1",
};

function calculate(inputs: Inputs): Result {
  const annualBenefits = Math.max(0, parseFloat(inputs.annualBenefits) || 0);
  const initialCost = Math.max(0, parseFloat(inputs.initialCost) || 0);
  const annualCosts = Math.max(0, parseFloat(inputs.annualCosts) || 0);
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const years = Math.min(30, Math.max(1, parseFloat(inputs.years) || 1));
  const benefitGrowth = Math.min(100, Math.max(0, parseFloat(inputs.benefitGrowth) || 0));
  const costGrowth = Math.min(100, Math.max(0, parseFloat(inputs.costGrowth) || 0));

  let pvBenefits = 0;
  let pvCosts = 0;
  let annualNet = 0;
  let b = annualBenefits;
  let c = annualCosts;
  for (let y = 1; y <= years; y++) {
    pvBenefits += b / Math.pow(1 + discountRate / 100, y);
    pvCosts += c / Math.pow(1 + discountRate / 100, y);
    annualNet += b - c;
    b *= 1 + benefitGrowth / 100;
    c *= 1 + costGrowth / 100;
  }
  pvCosts += initialCost;
  const bcr = pvCosts > 0 ? pvBenefits / pvCosts : 0;
  const npv = pvBenefits - pvCosts;
  const roiPct = pvCosts > 0 ? (npv / pvCosts) * 100 : 0;

  return { pvBenefits, pvCosts, bcr, npv, annualNet, roiPct };
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

export default function BenefitCostRatioCalculator() {
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
    num(inputs.annualBenefits) < 0 ||
    num(inputs.initialCost) < 0 ||
    num(inputs.annualCosts) < 0 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.years) < 1 || num(inputs.years) > 30 ||
    num(inputs.benefitGrowth) < 0 || num(inputs.benefitGrowth) > 100 ||
    num(inputs.costGrowth) < 0 || num(inputs.costGrowth) > 100;

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
    { label: "Initial (One-Time) Cost", value: fmtMoney(num(inputs.initialCost)) },
    { label: `Annual Benefits (${fmtMoney(num(inputs.annualBenefits))}/yr)`, value: fmtMoney(result.pvBenefits) + " PV" },
    { label: `Annual Costs (${fmtMoney(num(inputs.annualCosts))}/yr)`, value: fmtMoney(result.pvCosts - num(inputs.initialCost)) + " PV" },
    { label: "Total Present Value of Benefits", value: fmtMoney(result.pvBenefits) },
    { label: "Total Present Value of Costs", value: fmtMoney(result.pvCosts) },
    { label: "Net Present Value (NPV)", value: fmtMoney(result.npv) },
    { label: "Benefit-Cost Ratio (BCR)", value: fmt(result.bcr, 2), total: true },
    { label: "BCR Verdict", value: result.bcr >= 1 ? "Accept — benefits exceed costs" : "Reject — costs exceed benefits", highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Benefits", value: fmtMoney(num(inputs.annualBenefits)) },
    { label: "Initial Cost", value: fmtMoney(num(inputs.initialCost)) },
    { label: "Annual Costs", value: fmtMoney(num(inputs.annualCosts)) },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "Evaluation Period", value: fmt(num(inputs.years)) + " years" },
    { label: "Benefit Growth", value: fmt(num(inputs.benefitGrowth), 1) + "%" },
    { label: "Cost Growth", value: fmt(num(inputs.costGrowth), 1) + "%" },
    { label: "PV of Benefits", value: fmtMoney(result.pvBenefits) },
    { label: "PV of Costs", value: fmtMoney(result.pvCosts) },
    { label: "Benefit-Cost Ratio", value: fmt(result.bcr, 2), bold: true },
    { label: "Net Present Value", value: fmtMoney(result.npv) },
    { label: "ROI on Present Value", value: fmt(result.roiPct, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Benefit Cost Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Benefit Cost Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bcr-benefits" label="Annual Benefits" value={inputs.annualBenefits} onChange={set("annualBenefits")} prefix="$" suffix="/yr" />
              <NumInput id="bcr-initial" label="Initial One-Time Cost" value={inputs.initialCost} onChange={set("initialCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bcr-costs" label="Annual Operating Costs" value={inputs.annualCosts} onChange={set("annualCosts")} prefix="$" suffix="/yr" />
              <NumInput id="bcr-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Growth & Horizon</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="bcr-years" label="Evaluation Period" value={inputs.years} onChange={set("years")} suffix="years" />
                    <NumInput id="bcr-benefit-growth" label="Benefit Growth" value={inputs.benefitGrowth} onChange={set("benefitGrowth")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="bcr-cost-growth" label="Cost Growth" value={inputs.costGrowth} onChange={set("costGrowth")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; discount rate and growth between 0 and 100; period between 1 and 30 years.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Benefit-Cost Ratio</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.bcr, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.bcr >= 1 ? "Accept — benefits outweigh costs" : "Reject — costs outweigh benefits"} — NPV {fmtMoney(result.npv)}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">PV of Benefits</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.pvBenefits)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">PV of Costs</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.pvCosts)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">NPV</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.npv)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Benefit-Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Benefit Cost Ratio Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A benefit cost ratio calculator estimates whether a project's benefits justify its costs by comparing the present value of everything the project returns against the present value of everything it consumes. The benefit-cost ratio, or BCR, is the standard screening metric in public-sector and capital project analysis: a ratio above one means the benefits, discounted to today's dollars, exceed the costs, while a ratio below one means the project destroys value. Unlike a simple profit figure, the BCR properly accounts for the timing of money, since benefits received years in the future are worth less than costs paid today, and it expresses the result as a dimensionless ratio that can be compared across projects of very different sizes. This calculator converts annual benefits and costs into their present values over the evaluation period, adds the initial investment to the cost side, and reports the BCR, the net present value, and the verdict.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the annual benefits, the initial one-time cost, the annual operating costs, and the discount rate. The model projects both the benefits and the costs forward over the evaluation period, growing them at their respective growth rates, and discounts each year's value back to the present using the discount rate. With the default inputs, $120,000 of annual benefits growing at 2% over five years at an 8% discount rate produce roughly $502,000 of present-value benefits, while the $150,000 initial cost plus $40,000 of annual costs growing at 1% produce about $314,000 of present-value costs. The advanced options add the evaluation period, the benefit growth rate, and the cost growth rate. The benefit-cost ratio divides the present value of benefits by the present value of costs, the net present value subtracts the costs from the benefits, and the ROI on present value divides the NPV by the present value of costs. A BCR of 1.0 is the break-even threshold, and the verdict row applies that rule directly.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The BCR is the ranking metric for projects competing for the same capital, because it normalizes returns across projects of different sizes, but it should be read alongside the NPV, since a project with a high ratio and a tiny NPV may matter less than a large project with a modest ratio. The verdict row gives the accept-reject answer at the 1.0 threshold, which is the standard rule for public and private project screening alike. The discount rate is the assumption that moves the result most, so test the BCR at a higher rate, and remember that benefit estimates are the least reliable input in most analyses. A BCR that only clears 1.0 in the optimistic case is a risky approval, while one that stays above 1.0 across a range of assumptions is a robust investment. Re-run the model as benefit and cost forecasts are refined during project planning.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="benefit-cost-ratio-calculator" />
        </div>
      </div>
    </>
  );
}