"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  monthlyPremium: string;
  employeeShare: string;
  dependentsRate: string;
  age65Plus: string;
  adminFee: string;
  claimsFactor: string;
}

interface Result {
  annualPremium: number;
  employerShare: number;
  dependentPremium: number;
  seniorPremium: number;
  adminTotal: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  employees: "250",
  monthlyPremium: "620",
  employeeShare: "20",
  dependentsRate: "55",
  age65Plus: "120",
  adminFee: "4.5",
  claimsFactor: "8",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const monthlyPremium = Math.max(0, parseFloat(inputs.monthlyPremium) || 0);
  const employeeShare = Math.min(100, Math.max(0, parseFloat(inputs.employeeShare) || 0));
  const dependentsRate = Math.min(300, Math.max(0, parseFloat(inputs.dependentsRate) || 0));
  const age65Plus = Math.min(300, Math.max(0, parseFloat(inputs.age65Plus) || 0));
  const adminFee = Math.min(50, Math.max(0, parseFloat(inputs.adminFee) || 0));
  const claimsFactor = Math.min(200, Math.max(0, parseFloat(inputs.claimsFactor) || 0));

  const annualPremium = monthlyPremium * 12 * employees;
  const employerShare = annualPremium * (1 - employeeShare / 100);
  const dependentPremium = monthlyPremium * (dependentsRate / 100) * 12 * employees;
  const seniorPremium = monthlyPremium * (age65Plus / 100) * 12 * employees;
  const adminTotal = annualPremium * (adminFee / 100);
  const totalCost = employerShare + dependentPremium + seniorPremium + adminTotal + annualPremium * (claimsFactor / 100);
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;

  return { annualPremium, employerShare, dependentPremium, seniorPremium, adminTotal, totalCost, costPerEmployee };
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

export default function GroupHealthPremiumCostCalculator() {
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
    num(inputs.employees) < 0 ||
    num(inputs.monthlyPremium) < 0 ||
    num(inputs.employeeShare) < 0 || num(inputs.employeeShare) > 100 ||
    num(inputs.dependentsRate) < 0 || num(inputs.dependentsRate) > 300 ||
    num(inputs.age65Plus) < 0 || num(inputs.age65Plus) > 300 ||
    num(inputs.adminFee) < 0 || num(inputs.adminFee) > 50 ||
    num(inputs.claimsFactor) < 0 || num(inputs.claimsFactor) > 200;

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
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: `Base Premium (${fmtMoney(num(inputs.monthlyPremium))}/mo)`, value: fmtMoney(result.annualPremium) },
    { label: `Employer Premium Share (${fmt(100 - num(inputs.employeeShare), 1)}%)`, value: fmtMoney(result.employerShare) },
    { label: `Dependent Coverage Surcharge (${fmt(num(inputs.dependentsRate), 1)}%)`, value: fmtMoney(result.dependentPremium) },
    { label: `Age 65+ Surcharge (${fmt(num(inputs.age65Plus), 1)}%)`, value: fmtMoney(result.seniorPremium) },
    { label: `Administration Fee (${fmt(num(inputs.adminFee), 1)}%)`, value: fmtMoney(result.adminTotal) },
    { label: `Claims Reserve (${fmt(num(inputs.claimsFactor), 1)}%)`, value: fmtMoney(result.annualPremium * (num(inputs.claimsFactor) / 100)) },
    { label: "Total Group Health Premium Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Monthly Premium / EE", value: fmtMoney(num(inputs.monthlyPremium)) },
    { label: "Employee Share", value: fmt(num(inputs.employeeShare), 1) + "%" },
    { label: "Base Annual Premium", value: fmtMoney(result.annualPremium) },
    { label: "Employer Premium Share", value: fmtMoney(result.employerShare) },
    { label: "Dependent Surcharge", value: fmtMoney(result.dependentPremium) },
    { label: "Age 65+ Surcharge", value: fmtMoney(result.seniorPremium) },
    { label: "Admin Fee", value: fmtMoney(result.adminTotal) },
    { label: "Claims Reserve", value: fmtMoney(result.annualPremium * (num(inputs.claimsFactor) / 100)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Cost / EE / Month", value: fmtMoney(result.costPerEmployee / 12) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Group Health Premium Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Group Health Premium Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="gh-employees" label="Employees Covered" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="gh-premium" label="Monthly Premium / Employee" value={inputs.monthlyPremium} onChange={set("monthlyPremium")} prefix="$" suffix="/mo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="gh-share" label="Employee Contribution" value={inputs.employeeShare} onChange={set("employeeShare")} suffix="%" />
              <NumInput id="gh-dependents" label="Dependent Coverage Surcharge" value={inputs.dependentsRate} onChange={set("dependentsRate")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Plan Demographics & Reserves</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="gh-senior" label="Age 65+ Surcharge" value={inputs.age65Plus} onChange={set("age65Plus")} suffix="%" />
                    <NumInput id="gh-admin" label="Administration Fee" value={inputs.adminFee} onChange={set("adminFee")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="gh-claims" label="Claims Reserve" value={inputs.claimsFactor} onChange={set("claimsFactor")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; employee share between 0 and 100; surcharges between 0 and 300; admin fee between 0 and 50.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Group Health Premium Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee — {fmtMoney(result.costPerEmployee / 12)} per employee per month</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employer Premium Share</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.employerShare)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base Annual Premium</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.annualPremium)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Group Premium Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Group Health Premium Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A group health premium cost calculator estimates the total annual premium a company pays for its group health plan, including the surcharges and reserves that renewal quotes rarely show as line items. Group plans price each employee at a base monthly rate, but the actual cost to the employer depends on the contribution split with employees, the share of members carrying dependent coverage, the age composition of the group, the administration fee charged by the insurer or third-party administrator, and the claims reserve held against future claims. A plan that looks affordable at the per-employee rate can double in cost once dependents, older members, and fees are included. This calculator builds the full picture from the base premium outward, computing the employer's premium share, the dependent and age-based surcharges, the administration fee, and a claims reserve, then reporting the total and the true per-employee cost.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The dependent surcharge and age 65+ surcharge inputs are percentage-based proxies for the two demographic factors that move group health costs most: the share of members covering families and the share of members in high-claims age bands. A plan where most members elect family coverage carries a materially higher blended cost than the employee-only rate suggests, and the surcharge percentage lets you reflect that without entering every tier. The administration fee is the broker commission and third-party administrator charge that insurers and TPAs quote as a percentage of premium, and the claims reserve is the buffer self-funded plans hold against claims volatility, which is a working-capital figure rather than a paid expense. Because renewal quotes shift costs among these lines, comparing two quotes requires running both through the same model structure, which is exactly what this calculator allows.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of covered employees, the monthly premium per employee, the employee contribution percentage, and the dependent coverage surcharge percentage. The base annual premium multiplies the monthly rate by twelve and the headcount, and the employer share is the base premium multiplied by one minus the employee contribution share. With the default inputs, 250 employees at $620 a month carry a $1,860,000 base annual premium, of which a 20% employee contribution leaves $1,488,000 for the employer. The dependent surcharge applies the entered percentage to the base premium to reflect members with family coverage, and the age 65+ surcharge does the same for older participants, whose claims run substantially higher. The advanced options add the administration fee and the claims reserve, each applied as a percentage of the base premium. The total cost is the sum of the employer share, both surcharges, the administration fee, and the claims reserve, and the per-employee figures divide by the headcount and by twelve for a monthly view.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total cost is the number to compare against competing renewal quotes, which may shift costs between premium, fees, and reserves in ways that are invisible in the monthly rate alone. The per-employee monthly figure is the benchmark for industry surveys and for budgeting headcount growth, since each new hire with the same coverage adds roughly that amount. If the dependent surcharge dominates your result, consider pricing options that separate employee-only and family tiers more sharply, and if the age 65+ surcharge is large, examine whether your group's age mix justifies it. The claims reserve is a planning buffer, not a paid fee, so treat it as a working-capital figure rather than an expense. Re-run the model with each renewal option and with projected headcount and demographics changes to see the multi-year trajectory of your health plan cost.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="group-health-premium-cost-calculator" />
        </div>
      </div>
    </>
  );
}