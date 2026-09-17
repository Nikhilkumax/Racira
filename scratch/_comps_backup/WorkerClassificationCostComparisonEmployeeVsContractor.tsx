"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualSalary: string;
  contractorRate: string;
  hoursPerWeek: string;
  weeksPerYear: string;
  payrollTaxPct: string;
  benefitsPct: string;
  otherCosts: string;
  contractorAdminPct: string;
}

interface Result {
  employeePayroll: number;
  employerTaxes: number;
  benefitsCost: number;
  otherCosts: number;
  employeeTotal: number;
  contractorFees: number;
  contractorAdmin: number;
  contractorTotal: number;
  annualDifference: number;
  cheaperOption: "employee" | "contractor";
}

const DEFAULTS: Inputs = {
  annualSalary: "80000",
  contractorRate: "55",
  hoursPerWeek: "40",
  weeksPerYear: "48",
  payrollTaxPct: "7.65",
  benefitsPct: "25",
  otherCosts: "4000",
  contractorAdminPct: "5",
};

function calculate(inputs: Inputs): Result {
  const annualSalary = Math.max(0, parseFloat(inputs.annualSalary) || 0);
  const contractorRate = Math.max(0, parseFloat(inputs.contractorRate) || 0);
  const hoursPerWeek = Math.min(168, Math.max(0, parseFloat(inputs.hoursPerWeek) || 0));
  const weeksPerYear = Math.max(0, parseFloat(inputs.weeksPerYear) || 0);
  const payrollTaxPct = Math.min(100, Math.max(0, parseFloat(inputs.payrollTaxPct) || 0));
  const benefitsPct = Math.min(500, Math.max(0, parseFloat(inputs.benefitsPct) || 0));
  const otherCosts = Math.max(0, parseFloat(inputs.otherCosts) || 0);
  const contractorAdminPct = Math.min(200, Math.max(0, parseFloat(inputs.contractorAdminPct) || 0));

  const employerTaxes = annualSalary * (payrollTaxPct / 100);
  const benefitsCost = annualSalary * (benefitsPct / 100);
  const employeeTotal = annualSalary + employerTaxes + benefitsCost + otherCosts;
  const contractorFees = contractorRate * hoursPerWeek * weeksPerYear;
  const contractorAdmin = contractorFees * (contractorAdminPct / 100);
  const contractorTotal = contractorFees + contractorAdmin;
  const annualDifference = Math.abs(employeeTotal - contractorTotal);
  const cheaperOption = employeeTotal <= contractorTotal ? "employee" : "contractor";

  return { employeePayroll: annualSalary, employerTaxes, benefitsCost, otherCosts, employeeTotal, contractorFees, contractorAdmin, contractorTotal, annualDifference, cheaperOption };
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

export default function WorkerClassificationCostComparisonEmployeeVsContractor() {
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
    num(inputs.annualSalary) < 0 ||
    num(inputs.contractorRate) < 0 ||
    num(inputs.hoursPerWeek) < 0 || num(inputs.hoursPerWeek) > 168 ||
    num(inputs.weeksPerYear) < 0 ||
    num(inputs.payrollTaxPct) < 0 || num(inputs.payrollTaxPct) > 100 ||
    num(inputs.benefitsPct) < 0 || num(inputs.benefitsPct) > 500 ||
    num(inputs.otherCosts) < 0 ||
    num(inputs.contractorAdminPct) < 0 || num(inputs.contractorAdminPct) > 200;

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

  const cheaperText = result.cheaperOption === "employee"
    ? `${fmtMoney(result.annualDifference)} cheaper per year as an employee`
    : `${fmtMoney(result.annualDifference)} cheaper per year as a contractor`;

  const rows = [
    { label: "Employee Base Salary", value: fmtMoney(result.employeePayroll) },
    { label: `Employer Payroll Taxes (${fmt(num(inputs.payrollTaxPct), 2)}%)`, value: fmtMoney(result.employerTaxes) },
    { label: `Benefits Cost (${fmt(num(inputs.benefitsPct), 1)}%)`, value: fmtMoney(result.benefitsCost) },
    { label: "Other Employer Costs", value: fmtMoney(result.otherCosts) },
    { label: "Employee Total (Annual)", value: fmtMoney(result.employeeTotal), total: true },
    { label: "Contractor Fees", value: fmtMoney(result.contractorFees) },
    { label: `Contractor Admin & Overhead (${fmt(num(inputs.contractorAdminPct), 1)}%)`, value: fmtMoney(result.contractorAdmin) },
    { label: "Contractor Total (Annual)", value: fmtMoney(result.contractorTotal), total: true },
    { label: "Annual Difference", value: fmtMoney(result.annualDifference), highlight: true },
  ];

  const summaryStats = [
    { label: "Employee Salary", value: fmtMoney(result.employeePayroll) },
    { label: "Payroll Taxes", value: fmtMoney(result.employerTaxes) },
    { label: "Benefits", value: fmtMoney(result.benefitsCost) },
    { label: "Other Employer Costs", value: fmtMoney(result.otherCosts) },
    { label: "Employee Total", value: fmtMoney(result.employeeTotal), bold: true },
    { label: "Contractor Fees", value: fmtMoney(result.contractorFees) },
    { label: "Contractor Admin", value: fmtMoney(result.contractorAdmin) },
    { label: "Contractor Total", value: fmtMoney(result.contractorTotal), bold: true },
    { label: "Annual Difference", value: fmtMoney(result.annualDifference) },
    { label: "Cheaper Option", value: result.cheaperOption === "employee" ? "Employee" : "Contractor" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employee vs Contractor Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employee vs Contractor Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="wc-salary" label="Employee Annual Salary" value={inputs.annualSalary} onChange={set("annualSalary")} prefix="$" />
              <NumInput id="wc-rate" label="Contractor Hourly Rate" value={inputs.contractorRate} onChange={set("contractorRate")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="wc-hours" label="Hours per Week" value={inputs.hoursPerWeek} onChange={set("hoursPerWeek")} suffix="hrs" />
              <NumInput id="wc-weeks" label="Weeks per Year" value={inputs.weeksPerYear} onChange={set("weeksPerYear")} suffix="wks" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Employer Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="wc-tax" label="Employer Payroll Tax" value={inputs.payrollTaxPct} onChange={set("payrollTaxPct")} suffix="%" />
                    <NumInput id="wc-benefits" label="Benefits as % of Salary" value={inputs.benefitsPct} onChange={set("benefitsPct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="wc-other" label="Equipment, Training & Other" value={inputs.otherCosts} onChange={set("otherCosts")} prefix="$" />
                    <NumInput id="wc-admin" label="Contractor Admin & Overhead" value={inputs.contractorAdminPct} onChange={set("contractorAdminPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; hours per week between 0 and 168; payroll tax between 0 and 100%; benefits between 0 and 500%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Employee Total Annual Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.employeeTotal)}</div>
              <div className="text-sm text-muted-foreground font-medium">{cheaperText}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employee Total</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.employeeTotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contractor Total</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.contractorTotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Difference</span>
                <span className={`font-extrabold ${result.cheaperOption === "employee" ? "text-green-600" : "text-red-600"}`}>{fmtMoney(result.annualDifference)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Comparison Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Employee vs Contractor Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An employee vs contractor cost calculator compares the true annual cost of engaging a worker as a W-2 employee against engaging them as an independent contractor. The comparison is rarely as simple as the salary versus the hourly rate, because the two arrangements carry very different cost structures. An employee brings base salary, employer payroll taxes, health insurance and retirement contributions, paid time off, and equipment costs on top of the pay itself, and many companies find that the true cost of an employee is 25 to 40 percent above the salary. A contractor brings a higher hourly rate that already includes their own taxes and overhead, plus whatever the company spends on contract administration, onboarding, and compliance. This calculator puts both structures on the same footing by converting them into total annual cost, so the decision is made on comparable numbers rather than a salary that hides half its own expense.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The employee side starts with the annual salary and adds the costs the employer carries on top of it. Employer payroll taxes are the employer's share of Social Security, Medicare, and unemployment contributions, applied as a percentage of the salary, and the default of 7.65 percent reflects the standard employer FICA share. The benefits cost captures health insurance, retirement matching, paid time off, and other benefits, entered as a percentage of salary, and 25 percent is a realistic default for a benefits-heavy employer. The other employer costs line captures one-time and recurring items like equipment, training, and licenses. Summing these gives the employee total, and with the default inputs an $80,000 salary carries about $6,120 in payroll taxes, $20,000 in benefits, and $4,000 in other costs for an employee total near $110,120.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The contractor side is the hourly rate multiplied by the hours per week and the weeks per year the contractor actually works. Because contractors bill only for hours worked, the weeks per year input lets you reflect time off, holidays, and gaps in the engagement rather than assuming a full calendar year. The contractor admin and overhead line adds the cost of contract administration, onboarding, and compliance management as a percentage of the fees. With the defaults, a $55 an hour contractor working 40 hours for 48 weeks bills $105,600 in fees, plus about $5,280 in admin, for a contractor total near $110,880. The annual difference is the absolute gap between the two totals, and the cheaper option line names the winner, which flips depending on the salary, the rate, and the benefits load.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total annual cost of the employee arrangement, with the subtext showing which option is cheaper and by how much. Cost is only one dimension of the classification decision, and the breakdown table is a reminder of why the numbers diverge: the benefits line and payroll taxes are the entire reason an employee can cost more than a contractor at the same nominal pay. Beyond the math, remember that classification is a legal question as much as a financial one, and misclassifying a worker who should be an employee carries back-tax, penalty, and audit risk that no calculator captures. Use the results to compare the fully loaded cost of each option for a specific role, and then weigh the differences in control, availability, loyalty, and compliance risk. Re-run the calculator when a role's hours change, because a contractor engagement that grows to full-time hours quickly approaches and can exceed the employee cost.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/worker-classification-cost-comparison-employee-vs-contractor" />
        </div>
      </div>
    </>
  );
}