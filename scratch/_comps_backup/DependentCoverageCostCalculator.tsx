"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employeeOnlyPremium: string;
  dependentPremium: string;
  dependents: string;
  employerShare: string;
  deductibleIncrease: string;
  oopIncrease: string;
  copayEstimate: string;
}

interface Result {
  premiumCost: number;
  employerPaid: number;
  employeePaidPremium: number;
  annualPremium: number;
  totalCost: number;
  perDependent: number;
  perPaycheck: number;
  deductibleIncrease: number;
  oopIncrease: number;
  copayEstimate: number;
}

const DEFAULTS: Inputs = {
  employeeOnlyPremium: "350",
  dependentPremium: "650",
  dependents: "2",
  employerShare: "30",
  deductibleIncrease: "1500",
  oopIncrease: "3000",
  copayEstimate: "2400",
};

function calculate(inputs: Inputs): Result {
  const employeeOnlyPremium = Math.max(0, parseFloat(inputs.employeeOnlyPremium) || 0);
  const dependentPremium = Math.max(0, parseFloat(inputs.dependentPremium) || 0);
  const dependents = Math.max(0, parseFloat(inputs.dependents) || 0);
  const employerShare = Math.min(100, Math.max(0, parseFloat(inputs.employerShare) || 0));
  const deductibleIncrease = Math.max(0, parseFloat(inputs.deductibleIncrease) || 0);
  const oopIncrease = Math.max(0, parseFloat(inputs.oopIncrease) || 0);
  const copayEstimate = Math.max(0, parseFloat(inputs.copayEstimate) || 0);

  const annualPremium = dependentPremium * dependents * 12;
  const employerPaid = annualPremium * (employerShare / 100);
  const employeePaidPremium = annualPremium - employerPaid;
  const premiumCost = employeePaidPremium;
  const totalCost = premiumCost + deductibleIncrease + oopIncrease + copayEstimate;
  const perDependent = dependents > 0 ? totalCost / dependents : 0;
  const perPaycheck = totalCost / 26;

  return { premiumCost, employerPaid, employeePaidPremium, annualPremium, totalCost, perDependent, perPaycheck, deductibleIncrease, oopIncrease, copayEstimate };
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

export default function DependentCoverageCostCalculator() {
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
    num(inputs.employeeOnlyPremium) < 0 ||
    num(inputs.dependentPremium) < 0 ||
    num(inputs.dependents) < 0 ||
    num(inputs.employerShare) < 0 || num(inputs.employerShare) > 100 ||
    num(inputs.deductibleIncrease) < 0 ||
    num(inputs.oopIncrease) < 0 ||
    num(inputs.copayEstimate) < 0;

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
    { label: "Dependents Covered", value: fmt(num(inputs.dependents)) },
    { label: `Dependent Premium (${fmt(num(inputs.dependentPremium))}/mo each)`, value: fmtMoney(result.annualPremium) },
    { label: `Employer Contribution (${fmt(num(inputs.employerShare), 1)}%)`, value: "-" + fmtMoney(result.employerPaid) },
    { label: "Employee-Paid Premium", value: fmtMoney(result.premiumCost) },
    { label: "Deductible Increase (Family Plan)", value: fmtMoney(result.deductibleIncrease) },
    { label: "Out-of-Pocket Max Increase", value: fmtMoney(result.oopIncrease) },
    { label: "Copays & Services Estimate", value: fmtMoney(result.copayEstimate) },
    { label: "Total Annual Cost of Dependents", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Dependent", value: fmtMoney(result.perDependent), highlight: true },
  ];

  const summaryStats = [
    { label: "Employee-Only Premium", value: fmtMoney(num(inputs.employeeOnlyPremium)) + "/mo" },
    { label: "Dependent Premium", value: fmtMoney(num(inputs.dependentPremium)) + "/mo" },
    { label: "Dependents Covered", value: fmt(num(inputs.dependents)) },
    { label: "Employer Share", value: fmt(num(inputs.employerShare), 1) + "%" },
    { label: "Annual Dependent Premium", value: fmtMoney(result.annualPremium) },
    { label: "Employer Contribution", value: fmtMoney(result.employerPaid) },
    { label: "Employee-Paid Premium", value: fmtMoney(result.employeePaidPremium) },
    { label: "Deductible Increase", value: fmtMoney(result.deductibleIncrease) },
    { label: "OOP Max Increase", value: fmtMoney(result.oopIncrease) },
    { label: "Copays & Services", value: fmtMoney(result.copayEstimate) },
    { label: "Total Annual Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Per Paycheck (biweekly)", value: fmtMoney(result.perPaycheck) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Dependent Coverage Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dependent Coverage Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dc-employee-premium" label="Employee-Only Premium" value={inputs.employeeOnlyPremium} onChange={set("employeeOnlyPremium")} prefix="$" suffix="/mo" />
              <NumInput id="dc-dependent-premium" label="Dependent Premium" value={inputs.dependentPremium} onChange={set("dependentPremium")} prefix="$" suffix="/mo each" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dc-dependents" label="Number of Dependents" value={inputs.dependents} onChange={set("dependents")} suffix="people" />
              <NumInput id="dc-employer-share" label="Employer Contribution" value={inputs.employerShare} onChange={set("employerShare")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Plan Design — Family Coverage</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dc-deductible" label="Deductible Increase" value={inputs.deductibleIncrease} onChange={set("deductibleIncrease")} prefix="$" suffix="/yr" />
                    <NumInput id="dc-oop" label="Out-of-Pocket Max Increase" value={inputs.oopIncrease} onChange={set("oopIncrease")} prefix="$" suffix="/yr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="dc-copay" label="Copays & Services" value={inputs.copayEstimate} onChange={set("copayEstimate")} prefix="$" suffix="/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and employer contribution must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Cost of Dependent Coverage</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.perDependent)} per dependent — {fmtMoney(result.perPaycheck)} per biweekly paycheck</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employee-Paid Premium</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.premiumCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employer Pays</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.employerPaid)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Dependent</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.perDependent)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Dependent Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Dependent Coverage Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A dependent coverage cost calculator estimates the full annual expense an employee carries when they add a spouse, partner, or children to their employer-sponsored health plan. Most people compare only the monthly premium listed on the benefits portal and never look at the complete picture, which includes the jump in the family deductible, the higher out-of-pocket maximum, and the copays, coinsurance, and services the dependents actually use during the year. Adding a family to a health plan typically costs far more than the premium line suggests because the plan design itself shifts: family plans carry separate deductibles and out-of-pocket caps, and those limits reset every January. This calculator totals the employee-paid premium for all dependents, the employer's contribution toward it, and the non-premium healthcare costs a family realistically incurs, producing a single annual figure you can weigh against salary changes, spousal coverage alternatives, or marketplace plans.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with four core inputs: the employee-only monthly premium, the per-dependent monthly premium, the number of dependents, and the employer's contribution percentage toward dependent coverage. The annual dependent premium is the per-dependent premium multiplied by the number of dependents and twelve months. The employer contribution is that annual premium multiplied by the employer share, and the employee-paid premium is the difference. With the default inputs, two dependents at $650 a month produce a $15,600 annual premium, of which a 30% employer contribution covers $4,680, leaving $10,920 in employee-paid premium. The advanced options add the plan-design costs that rarely appear on a benefits summary: the family deductible increase over the employee-only plan, the increase in the out-of-pocket maximum, and a realistic annual estimate of copays and services for the dependents. The total annual cost is the employee-paid premium plus these three plan-design amounts. The result section shows the total, the per-dependent cost, and the per-paycheck impact at a biweekly cadence, which is the number most households actually feel. All figures update only when you press Calculate, so you can adjust dependents or premiums and compare scenarios side by side.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual cost is the number to compare against alternatives such as a spousal surcharge, a marketplace plan for the family, or a high-deductible plan paired with an HSA. If the per-paycheck figure strains your budget, look first at the premium inputs, since premiums are the largest single line, then at the deductible increase, which can often be reduced by choosing a plan with a separate per-person deductible structure. A red flag is a total that approaches or exceeds what a comparable marketplace family plan would cost, since employer plans usually include an employer contribution that marketplace coverage lacks. The employer-paid figure is useful in negotiations, because it shows the value of the subsidy you receive, while the per-dependent figure helps you sanity-check whether the plan is priced fairly for each covered person. Remember that these estimates use the utilization and plan-design assumptions you enter, so revisit them at open enrollment each year when premiums, deductibles, and family circumstances all change.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="dependent-coverage-cost-calculator" />
        </div>
      </div>
    </>
  );
}