"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  monthlyPremium: string;
  employerShare: string;
  employees: string;
  adminCost: string;
  wellnessCost: string;
  stopLossCost: string;
  dentalVision: string;
}

interface Result {
  employerPremium: number;
  annualPremium: number;
  adminTotal: number;
  wellnessTotal: number;
  stopLossTotal: number;
  dentalVisionTotal: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  monthlyPremium: "650",
  employerShare: "75",
  employees: "100",
  adminCost: "120",
  wellnessCost: "350",
  stopLossCost: "60",
  dentalVision: "420",
};

function calculate(inputs: Inputs): Result {
  const monthlyPremium = Math.max(0, parseFloat(inputs.monthlyPremium) || 0);
  const employerShare = Math.min(100, Math.max(0, parseFloat(inputs.employerShare) || 0));
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const adminCost = Math.max(0, parseFloat(inputs.adminCost) || 0);
  const wellnessCost = Math.max(0, parseFloat(inputs.wellnessCost) || 0);
  const stopLossCost = Math.max(0, parseFloat(inputs.stopLossCost) || 0);
  const dentalVision = Math.max(0, parseFloat(inputs.dentalVision) || 0);

  const annualPremium = monthlyPremium * 12 * employees;
  const employerPremium = annualPremium * (employerShare / 100);
  const adminTotal = adminCost * employees;
  const wellnessTotal = wellnessCost * employees;
  const stopLossTotal = stopLossCost * employees;
  const dentalVisionTotal = dentalVision * employees;
  const totalCost = employerPremium + adminTotal + wellnessTotal + stopLossTotal + dentalVisionTotal;
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;

  return { employerPremium, annualPremium, adminTotal, wellnessTotal, stopLossTotal, dentalVisionTotal, totalCost, costPerEmployee };
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

export default function HealthBenefitCostPerEmployeeCalculator() {
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
    num(inputs.monthlyPremium) < 0 ||
    num(inputs.employerShare) < 0 || num(inputs.employerShare) > 100 ||
    num(inputs.employees) < 0 ||
    num(inputs.adminCost) < 0 ||
    num(inputs.wellnessCost) < 0 ||
    num(inputs.stopLossCost) < 0 ||
    num(inputs.dentalVision) < 0;

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
    { label: "Employees Covered", value: fmt(num(inputs.employees)) },
    { label: `Monthly Premium (${fmt(num(inputs.monthlyPremium))}/employee)`, value: fmtMoney(result.annualPremium) },
    { label: `Employer Share (${fmt(num(inputs.employerShare), 1)}%)`, value: fmtMoney(result.employerPremium) },
    { label: "Plan Administration", value: fmtMoney(result.adminTotal) },
    { label: "Wellness Program", value: fmtMoney(result.wellnessTotal) },
    { label: "Stop-Loss / Reinsurance", value: fmtMoney(result.stopLossTotal) },
    { label: "Dental & Vision", value: fmtMoney(result.dentalVisionTotal) },
    { label: "Total Annual Health Benefit Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees Covered", value: fmt(num(inputs.employees)) },
    { label: "Monthly Premium / EE", value: fmtMoney(num(inputs.monthlyPremium)) },
    { label: "Employer Share", value: fmt(num(inputs.employerShare), 1) + "%" },
    { label: "Annual Premium Total", value: fmtMoney(result.annualPremium) },
    { label: "Employer Premium Cost", value: fmtMoney(result.employerPremium) },
    { label: "Plan Administration", value: fmtMoney(result.adminTotal) },
    { label: "Wellness Program", value: fmtMoney(result.wellnessTotal) },
    { label: "Stop-Loss / Reinsurance", value: fmtMoney(result.stopLossTotal) },
    { label: "Dental & Vision", value: fmtMoney(result.dentalVisionTotal) },
    { label: "Total Annual Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Cost per Employee / Month", value: fmtMoney(result.costPerEmployee / 12) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Health Benefit Cost Per Employee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Health Benefit Cost Per Employee Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="hb-premium" label="Monthly Premium / Employee" value={inputs.monthlyPremium} onChange={set("monthlyPremium")} prefix="$" suffix="/mo" />
              <NumInput id="hb-share" label="Employer Share of Premium" value={inputs.employerShare} onChange={set("employerShare")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="hb-employees" label="Employees Covered" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="hb-admin" label="Admin Cost / Employee" value={inputs.adminCost} onChange={set("adminCost")} prefix="$" suffix="/yr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Supplemental Programs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="hb-wellness" label="Wellness Program" value={inputs.wellnessCost} onChange={set("wellnessCost")} prefix="$" suffix="/EE/yr" />
                    <NumInput id="hb-stoploss" label="Stop-Loss / Reinsurance" value={inputs.stopLossCost} onChange={set("stopLossCost")} prefix="$" suffix="/EE/yr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="hb-dental" label="Dental & Vision" value={inputs.dentalVision} onChange={set("dentalVision")} prefix="$" suffix="/EE/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and employer share must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Health Benefit Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee — {fmtMoney(result.costPerEmployee / 12)} per employee per month</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employer Premium Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.employerPremium)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">/ Month / Employee</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerEmployee / 12)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Health Benefit Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Health Benefit Cost Per Employee Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A health benefit cost per employee calculator estimates the full annual amount an employer spends on health coverage for its workforce. Group health plans are priced per employee per month, but the employer's true outlay includes only its share of the premium, plus the administrative fees paid to the broker or third-party administrator, wellness initiatives, stop-loss insurance for self-funded plans, and companion coverage such as dental and vision. Total annual costs can easily reach six or seven figures at mid-size companies, and per-employee figures are the metric HR teams quote when comparing renewal quotes, benchmarking against industry surveys, or projecting next year's budget. This calculator takes the monthly premium, the employer's contribution share, and the headcount, then layers on the per-employee cost of administration, wellness, stop-loss, and dental and vision programs to produce a total annual cost and a clean per-employee figure.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Group health premiums are community-rated for small employers and experience-rated for larger ones, which means your own claims history shapes future renewals; the premium input should reflect the blended employee-only and family rate most employees actually elect, since a plan with a low single rate but expensive family tiers can still produce a high per-employee cost. The administration fee covers the third-party administrator, the broker commission, enrollment platform, and compliance filings, and it is typically charged per employee per month or per year, which is why it is entered as an annual per-employee figure here. The wellness and stop-loss lines are optional programs whose costs are easy to overlook in budget reviews, and the dental and vision line captures companion coverage that is often billed separately from the medical plan. For self-funded plans, the stop-loss figure is a real insurance premium, while for fully insured plans it can be set to zero.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the monthly premium per employee, the employer's share of that premium, the number of covered employees, and the annual administration cost per employee. The annual premium total is the monthly premium multiplied by twelve months and the headcount, and the employer premium cost is that total multiplied by the employer share percentage. Administration covers broker fees, enrollment systems, and third-party administrator charges that are billed per employee per year. The advanced options add the wellness program cost per employee, which covers screenings, incentives, and health coaching; the stop-loss or reinsurance cost per employee, which protects self-funded plans against catastrophic claims; and the dental and vision cost per employee when those plans are billed separately. With the default inputs, 100 employees at a $650 monthly premium with a 75% employer share produce a $585,000 annual employer premium, and the full package totals roughly $650,000 a year, or about $6,500 per employee. The per-employee monthly figure divides the total by the headcount and by twelve, giving the number most useful for renewal comparisons.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual cost is the planning number for your benefits budget, while the per-employee figure is the one to benchmark against national and industry surveys, which commonly report cost per employee per year. If your per-employee cost runs well above survey medians, examine the premium input first, then look at whether wellness and stop-loss programs are priced competitively. The employer premium cost line shows the direct subsidy you provide, a number that is also useful in compensation discussions because it is part of each employee's total rewards. Remember that renewal quotes can arrive with different plan designs, so a lower premium may hide higher deductibles that shift cost to employees. Re-run the calculator with each renewal option to compare true employer outlay side by side.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="health-benefit-cost-per-employee-calculator" />
        </div>
      </div>
    </>
  );
}