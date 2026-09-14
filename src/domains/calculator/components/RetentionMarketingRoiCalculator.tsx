"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  programSpend: string;
  customerBase: string;
  churnWithout: string;
  churnWith: string;
  annualValue: string;
  grossMargin: string;
  durationMonths: string;
  incentivePct: string;
  additionalCosts: string;
}

interface Result {
  churnReduction: number;
  customersSaved: number;
  revenueSaved: number;
  profitSaved: number;
  incentiveCost: number;
  totalCost: number;
  roi: number;
  costPerCustomerSaved: number;
}

const DEFAULTS: Inputs = {
  programSpend: "15000",
  customerBase: "10000",
  churnWithout: "15",
  churnWith: "10",
  annualValue: "500",
  grossMargin: "50",
  durationMonths: "12",
  incentivePct: "10",
  additionalCosts: "2000",
};

function calculate(inputs: Inputs): Result {
  const programSpend = Math.max(0, parseFloat(inputs.programSpend) || 0);
  const customerBase = Math.max(0, parseFloat(inputs.customerBase) || 0);
  const churnWithout = Math.min(100, Math.max(0, parseFloat(inputs.churnWithout) || 0));
  const churnWith = Math.min(100, Math.max(0, parseFloat(inputs.churnWith) || 0));
  const annualValue = Math.max(0, parseFloat(inputs.annualValue) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const durationMonths = Math.max(1, parseFloat(inputs.durationMonths) || 1);
  const incentivePct = Math.min(100, Math.max(0, parseFloat(inputs.incentivePct) || 0));
  const additionalCosts = Math.max(0, parseFloat(inputs.additionalCosts) || 0);

  const churnReduction = Math.max(0, churnWithout - churnWith);
  const customersSaved = customerBase * (churnReduction / 100);
  const revenueSaved = customersSaved * annualValue * (durationMonths / 12);
  const profitSaved = revenueSaved * (grossMargin / 100);
  const incentiveCost = revenueSaved * (incentivePct / 100);
  const totalCost = programSpend + additionalCosts + incentiveCost;
  const roi = totalCost > 0 ? ((profitSaved - totalCost) / totalCost) * 100 : 0;
  const costPerCustomerSaved = customersSaved > 0 ? totalCost / customersSaved : 0;

  return { churnReduction, customersSaved, revenueSaved, profitSaved, incentiveCost, totalCost, roi, costPerCustomerSaved };
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

export default function RetentionMarketingRoiCalculator() {
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
    num(inputs.programSpend) < 0 ||
    num(inputs.customerBase) < 0 ||
    num(inputs.churnWithout) < 0 || num(inputs.churnWithout) > 100 ||
    num(inputs.churnWith) < 0 || num(inputs.churnWith) > 100 ||
    num(inputs.churnWith) >= num(inputs.churnWithout) ||
    num(inputs.annualValue) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.durationMonths) <= 0 ||
    num(inputs.incentivePct) < 0 || num(inputs.incentivePct) > 100 ||
    num(inputs.additionalCosts) < 0;

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

  const rows: { label: string; value: string; total?: boolean; highlight?: boolean }[] = [
    { label: "Program Spend", value: fmtMoney(num(inputs.programSpend)) },
    { label: "Additional Program Costs", value: fmtMoney(num(inputs.additionalCosts)) },
    { label: `Incentive / Discount Cost (${fmt(num(inputs.incentivePct))}%)`, value: fmtMoney(result.incentiveCost) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: `Churn Without Program (${fmt(num(inputs.churnWithout))}%)`, value: fmt(num(inputs.churnWithout)) + "%" },
    { label: `Churn With Program (${fmt(num(inputs.churnWith))}%)`, value: fmt(num(inputs.churnWith)) + "%" },
    { label: "Churn Reduction", value: fmt(result.churnReduction, 1) + " pts" },
    { label: "Customers Saved", value: fmt(Math.round(result.customersSaved)) },
    { label: "Revenue Saved", value: fmtMoney(result.revenueSaved) },
    { label: "Profit Saved", value: fmtMoney(result.profitSaved) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Program Spend", value: fmtMoney(num(inputs.programSpend)) },
    { label: "Customer Base", value: fmt(Math.round(num(inputs.customerBase))) },
    { label: "Churn Without", value: fmt(num(inputs.churnWithout)) + "%" },
    { label: "Churn With", value: fmt(num(inputs.churnWith)) + "%" },
    { label: "Churn Reduction", value: fmt(result.churnReduction, 1) + " pts" },
    { label: "Customers Saved", value: fmt(Math.round(result.customersSaved)) },
    { label: "Revenue Saved", value: fmtMoney(result.revenueSaved) },
    { label: "Profit Saved", value: fmtMoney(result.profitSaved) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Cost per Customer Saved", value: fmtMoney(result.costPerCustomerSaved) },
    { label: "Program Duration", value: fmt(num(inputs.durationMonths)) + " months" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Retention Marketing ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retention Marketing ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rm-spend" label="Retention Program Spend" value={inputs.programSpend} onChange={set("programSpend")} prefix="$" />
              <NumInput id="rm-base" label="Customer Base" value={inputs.customerBase} onChange={set("customerBase")} suffix="customers" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rm-without" label="Churn Rate Without Program" value={inputs.churnWithout} onChange={set("churnWithout")} suffix="%" />
              <NumInput id="rm-with" label="Churn Rate With Program" value={inputs.churnWith} onChange={set("churnWith")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rm-value" label="Avg Annual Customer Value" value={inputs.annualValue} onChange={set("annualValue")} prefix="$" />
              <NumInput id="rm-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Program Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rm-duration" label="Program Duration" value={inputs.durationMonths} onChange={set("durationMonths")} suffix="months" />
                    <NumInput id="rm-incentive" label="Incentive / Discount Cost" value={inputs.incentivePct} onChange={set("incentivePct")} suffix="% of saved value" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="rm-additional" label="Additional Program Costs" value={inputs.additionalCosts} onChange={set("additionalCosts")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; duration must be greater than zero; churn rates and margin must be between 0 and 100%; churn with program must be below churn without program.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Retention Marketing ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.profitSaved)} profit saved on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Customers Saved</span>
                <span className="font-extrabold text-emerald-600">{fmt(Math.round(result.customersSaved))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue Saved</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.revenueSaved)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Customer Saved</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerCustomerSaved)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Program Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Retention Marketing ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A retention marketing ROI calculator values the customers a retention program keeps. Retention programs — win-back campaigns, loyalty tiers, renewal incentives, and customer success outreach — exist to lower churn, and their return is the revenue and profit of the customers who would otherwise have left. The calculation compares the churn rate before the program with the churn rate during it, multiplies the difference across the customer base to count the customers saved, and values them with annual customer value and gross margin. With the default inputs, a $15,000 program that cuts churn from 15% to 10% across a 10,000-customer base saves 500 customers, whose $250,000 of annual revenue carries $125,000 of profit at a 50% margin. After the incentive cost and additional program expenses, the total program cost is $42,000, producing a return of nearly 198% — retention work is frequently the cheapest growth available because it re-sells to people who already trust you.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The churn reduction is the churn rate without the program minus the churn rate with it, capped at zero so a program that increases churn cannot claim savings. Customers saved multiplies that reduction by the customer base. Revenue saved annualizes the customer value across the program's duration — a twelve-month program keeps the full annual value, while a six-month program counts half. Gross margin turns revenue saved into profit saved, which is the honest measure of value because revenue alone overstates what retention is worth. On the cost side, the incentive or discount cost is the percentage of the saved revenue given away to earn it, which many budgets forget, and it is added to the program spend and any additional costs. Return on investment divides profit saved minus total cost by total cost. The cost per customer saved divides total cost by customers saved, giving the acquisition-cost equivalent — compare it to what paid acquisition spends per new customer, and retention nearly always wins.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A positive ROI means the program paid for itself purely in prevented churn; the percentage is the multiple of cost recovered. The churn rates are the assumptions to pressure-test — a one-point overstatement of the improvement can swing the ROI by hundreds of percentage points, so measure the program's churn rate over a full cohort cycle before trusting the result. The incentive cost deserves special attention: discounts that approach the margin percentage convert retained revenue into retained customers at nearly zero profit, and the ROI will show it. The cost per customer saved is the number to present when justifying the program to finance — if it is below your blended CAC, the program is a better use of the same dollars. Run the model for different program durations, since retention benefits typically persist after the program ends; a program that holds churn lower even after incentives stop is worth far more than the twelve-month window this calculator measures by default.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/retention-marketing-roi-calculator" />
        </div>
      </div>
    </>
  );
}