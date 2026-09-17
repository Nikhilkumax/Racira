"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  improvementCost: string;
  priceIncreasePct: string;
  revenue: string;
  annualRevenueGain: string;
  retentionGain: string;
  costSavings: string;
  timeframeYears: string;
  discountRate: string;
}

interface Result {
  priceGain: number;
  retentionGainValue: number;
  totalBenefit: number;
  netBenefit: number;
  roiPct: number;
  paybackMonths: number;
}

const DEFAULTS: Inputs = {
  improvementCost: "150000",
  priceIncreasePct: "5",
  revenue: "2500000",
  annualRevenueGain: "4",
  retentionGain: "2",
  costSavings: "30000",
  timeframeYears: "3",
  discountRate: "10",
};

function calculate(inputs: Inputs): Result {
  const improvementCost = Math.max(0, parseFloat(inputs.improvementCost) || 0);
  const priceIncreasePct = Math.min(100, Math.max(0, parseFloat(inputs.priceIncreasePct) || 0));
  const revenue = Math.max(0, parseFloat(inputs.revenue) || 0);
  const annualRevenueGain = Math.min(200, Math.max(0, parseFloat(inputs.annualRevenueGain) || 0));
  const retentionGain = Math.min(100, Math.max(0, parseFloat(inputs.retentionGain) || 0));
  const costSavings = Math.max(0, parseFloat(inputs.costSavings) || 0);
  const timeframeYears = Math.min(20, Math.max(1, parseFloat(inputs.timeframeYears) || 1));
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));

  const priceGain = revenue * (priceIncreasePct / 100);
  const retentionGainValue = revenue * (retentionGain / 100);
  const annualBenefit = priceGain + revenue * (annualRevenueGain / 100) + retentionGainValue + costSavings;
  let totalBenefit = 0;
  for (let y = 1; y <= timeframeYears; y++) {
    totalBenefit += annualBenefit / Math.pow(1 + discountRate / 100, y);
  }
  const netBenefit = totalBenefit - improvementCost;
  const roiPct = improvementCost > 0 ? (netBenefit / improvementCost) * 100 : 0;
  const paybackMonths = annualBenefit > 0 ? (improvementCost / annualBenefit) * 12 : 0;

  return { priceGain, retentionGainValue, totalBenefit, netBenefit, roiPct, paybackMonths };
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

export default function ValuePropositionRoiCalculator() {
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
    num(inputs.improvementCost) < 0 ||
    num(inputs.priceIncreasePct) < 0 || num(inputs.priceIncreasePct) > 100 ||
    num(inputs.revenue) < 0 ||
    num(inputs.annualRevenueGain) < 0 || num(inputs.annualRevenueGain) > 200 ||
    num(inputs.retentionGain) < 0 || num(inputs.retentionGain) > 100 ||
    num(inputs.costSavings) < 0 ||
    num(inputs.timeframeYears) < 1 || num(inputs.timeframeYears) > 20 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100;

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
    { label: "Improvement Investment", value: fmtMoney(num(inputs.improvementCost)) },
    { label: `Price Increase (${fmt(num(inputs.priceIncreasePct), 1)}%)`, value: fmtMoney(result.priceGain) + "/yr" },
    { label: `New Business Growth (${fmt(num(inputs.annualRevenueGain), 1)}%)`, value: fmtMoney(num(inputs.revenue) * (num(inputs.annualRevenueGain) / 100)) + "/yr" },
    { label: `Retention Gain (${fmt(num(inputs.retentionGain), 1)}%)`, value: fmtMoney(result.retentionGainValue) + "/yr" },
    { label: "Cost Savings", value: fmtMoney(num(inputs.costSavings)) + "/yr" },
    { label: `Discounted Total Benefit (${fmt(num(inputs.timeframeYears))} yrs @ ${fmt(num(inputs.discountRate), 1)}%)`, value: fmtMoney(result.totalBenefit) },
    { label: "Net Benefit", value: fmtMoney(result.netBenefit), total: true },
    { label: "Payback Period", value: fmt(result.paybackMonths, 1) + " months", highlight: true },
  ];

  const summaryStats = [
    { label: "Investment", value: fmtMoney(num(inputs.improvementCost)) },
    { label: "Price Increase", value: fmt(num(inputs.priceIncreasePct), 1) + "%" },
    { label: "Annual Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "Price Gain / Year", value: fmtMoney(result.priceGain) },
    { label: "Growth Gain / Year", value: fmtMoney(num(inputs.revenue) * (num(inputs.annualRevenueGain) / 100)) },
    { label: "Retention Gain / Year", value: fmtMoney(result.retentionGainValue) },
    { label: "Cost Savings / Year", value: fmtMoney(num(inputs.costSavings)) },
    { label: "Total Annual Benefit", value: fmtMoney(result.priceGain + num(inputs.revenue) * (num(inputs.annualRevenueGain) / 100) + result.retentionGainValue + num(inputs.costSavings)) },
    { label: "Discounted Total Benefit", value: fmtMoney(result.totalBenefit) },
    { label: "Net Benefit", value: fmtMoney(result.netBenefit), bold: true },
    { label: "ROI", value: fmt(result.roiPct, 1) + "%" },
    { label: "Payback", value: fmt(result.paybackMonths, 1) + " months" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Value Proposition ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Value Proposition ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vp-cost" label="Improvement Investment" value={inputs.improvementCost} onChange={set("improvementCost")} prefix="$" />
              <NumInput id="vp-price" label="Price Increase" value={inputs.priceIncreasePct} onChange={set("priceIncreasePct")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vp-revenue" label="Annual Revenue" value={inputs.revenue} onChange={set("revenue")} prefix="$" />
              <NumInput id="vp-growth" label="New Business Growth" value={inputs.annualRevenueGain} onChange={set("annualRevenueGain")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Retention, Savings & Time Value</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="vp-retention" label="Retention Gain" value={inputs.retentionGain} onChange={set("retentionGain")} suffix="%" />
                    <NumInput id="vp-savings" label="Cost Savings" value={inputs.costSavings} onChange={set("costSavings")} prefix="$" suffix="/yr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="vp-years" label="Evaluation Period" value={inputs.timeframeYears} onChange={set("timeframeYears")} suffix="years" />
                    <NumInput id="vp-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; price and retention between 0 and 100; growth between 0 and 200; evaluation period between 1 and 20 years.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Value Proposition ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roiPct, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.netBenefit)} net benefit over {fmt(num(inputs.timeframeYears))} years — payback in {fmt(result.paybackMonths, 1)} months</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Benefit</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.priceGain + num(inputs.revenue) * (num(inputs.annualRevenueGain) / 100) + result.retentionGainValue + num(inputs.costSavings))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Benefit</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.netBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback</span>
                <span className="font-extrabold text-red-600">{fmt(result.paybackMonths, 1)} mo</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Value Proposition Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Value Proposition ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A value proposition ROI calculator estimates the return on investment from a product, service, or business improvement by measuring its impact on the levers that drive revenue: what customers will pay, how much new business the offering attracts, how well it retains existing customers, and what it saves in operating costs. A value proposition is only as good as the numbers behind it, and this tool converts qualitative claims into a discounted financial forecast. The price lever captures willingness to pay, the growth lever captures market pull, the retention lever captures loyalty, and the cost lever captures efficiency, and the model sums all four into an annual benefit, discounts it over the evaluation period to account for the time value of money, and compares it against the investment required to deliver the improvement, producing an ROI, a net benefit, and a payback period.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four benefit levers correspond to the four ways a value proposition creates money: the price lever captures what customers will pay more for, the growth lever captures the new customers the offering attracts, the retention lever captures the customers it keeps, and the cost lever captures the efficiency it creates, and each is converted into an annual dollar figure so they can be summed. The discount rate performs the time-value adjustment, because a dollar of benefit in year three is worth less than a dollar of benefit today, and the evaluation period should match the realistic life of the improvement rather than an arbitrary planning window. The payback period divides the investment by the annual benefit without discounting, which makes it the most conservative quick check in the model. When presenting the case, show the breakdown table first, because showing which levers carry the value is more persuasive than a single ROI percentage.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the improvement investment, the price increase percentage, the annual revenue, and the new business growth percentage. The price gain is the annual revenue multiplied by the price increase, and the growth gain is the annual revenue multiplied by the growth percentage, both representing additional annual income attributable to the improvement. With the default inputs, a $150,000 investment against $2.5 million of revenue generates $125,000 a year from a 5% price increase alone. The advanced options add the retention gain, valued as a percentage of revenue for the customers kept that would otherwise churn; the annual cost savings; the evaluation period in years; and the discount rate. The annual benefit is the sum of all four levers, and the discounted total benefit sums the annual benefit across the evaluation period, reducing each year's value by the discount rate. The net benefit subtracts the investment, the ROI divides it by the investment, and the payback period divides the investment by the annual benefit and converts to months.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The ROI is the headline metric for comparing the improvement against alternative investments, and the payback period tells you how long the business must wait to recover its money, with anything under twelve months generally considered strong. The breakdown table shows which levers carry the value proposition: if price dominates, the offering supports premium positioning; if retention dominates, it is a loyalty play. Be conservative with the growth and retention assumptions, since improvements rarely deliver their full modeled effect in year one, and the discount rate lets you penalize distant benefits fairly. Re-run the calculator across optimistic and pessimistic scenarios, and use the payback figure as the sanity check that keeps over-optimistic value propositions honest.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="value-proposition-roi-calculator" />
        </div>
      </div>
    </>
  );
}