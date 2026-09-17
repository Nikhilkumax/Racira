"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualSalary: string;
  healthInsurance: string;
  retirementMatch: string;
  ptoDays: string;
  dentalVision: string;
  lifeDisability: string;
  otherCash: string;
  payrollTaxPct: string;
}

interface Result {
  healthInsurance: number;
  dentalVision: number;
  lifeDisability: number;
  retirementMatch: number;
  ptoValue: number;
  otherCash: number;
  payrollTax: number;
  totalBenefits: number;
  benefitsPctOfSalary: number;
}

const DEFAULTS: Inputs = {
  annualSalary: "65000",
  healthInsurance: "7500",
  retirementMatch: "4",
  ptoDays: "15",
  dentalVision: "900",
  lifeDisability: "600",
  otherCash: "2500",
  payrollTaxPct: "7.65",
};

function calculate(inputs: Inputs): Result {
  const annualSalary = Math.max(0, parseFloat(inputs.annualSalary) || 0);
  const healthInsurance = Math.max(0, parseFloat(inputs.healthInsurance) || 0);
  const retirementMatch = Math.min(100, Math.max(0, parseFloat(inputs.retirementMatch) || 0));
  const ptoDays = Math.max(0, parseFloat(inputs.ptoDays) || 0);
  const dentalVision = Math.max(0, parseFloat(inputs.dentalVision) || 0);
  const lifeDisability = Math.max(0, parseFloat(inputs.lifeDisability) || 0);
  const otherCash = Math.max(0, parseFloat(inputs.otherCash) || 0);
  const payrollTaxPct = Math.min(100, Math.max(0, parseFloat(inputs.payrollTaxPct) || 0));

  const retirementCost = annualSalary * (retirementMatch / 100);
  const ptoValue = (annualSalary / 260) * ptoDays;
  const payrollTax = annualSalary * (payrollTaxPct / 100);
  const totalBenefits = healthInsurance + dentalVision + lifeDisability + retirementCost + ptoValue + otherCash + payrollTax;
  const benefitsPctOfSalary = annualSalary > 0 ? (totalBenefits / annualSalary) * 100 : 0;

  return { healthInsurance, dentalVision, lifeDisability, retirementMatch: retirementCost, ptoValue, otherCash, payrollTax, totalBenefits, benefitsPctOfSalary };
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

export default function BenefitsCostPerEmployeeCalculator() {
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
    num(inputs.healthInsurance) < 0 ||
    num(inputs.retirementMatch) < 0 || num(inputs.retirementMatch) > 100 ||
    num(inputs.ptoDays) < 0 ||
    num(inputs.dentalVision) < 0 ||
    num(inputs.lifeDisability) < 0 ||
    num(inputs.otherCash) < 0 ||
    num(inputs.payrollTaxPct) < 0 || num(inputs.payrollTaxPct) > 100;

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
    { label: "Health Insurance (Employer Share)", value: fmtMoney(result.healthInsurance) },
    { label: "Dental & Vision", value: fmtMoney(result.dentalVision) },
    { label: "Life & Disability Insurance", value: fmtMoney(result.lifeDisability) },
    { label: `Retirement Match (${fmt(num(inputs.retirementMatch), 1)}%)`, value: fmtMoney(result.retirementMatch) },
    { label: `Paid Time Off Value (${fmt(num(inputs.ptoDays))} days)`, value: fmtMoney(result.ptoValue) },
    { label: "Bonus & Other Cash Compensation", value: fmtMoney(result.otherCash) },
    { label: `Employer Payroll Taxes (${fmt(num(inputs.payrollTaxPct), 2)}%)`, value: fmtMoney(result.payrollTax) },
    { label: "Total Benefits per Employee", value: fmtMoney(result.totalBenefits), total: true },
    { label: "Benefits as % of Salary", value: fmt(result.benefitsPctOfSalary, 1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Salary", value: fmtMoney(num(inputs.annualSalary)) },
    { label: "Health Insurance", value: fmtMoney(result.healthInsurance) },
    { label: "Dental & Vision", value: fmtMoney(result.dentalVision) },
    { label: "Life & Disability", value: fmtMoney(result.lifeDisability) },
    { label: "Retirement Match", value: fmtMoney(result.retirementMatch) },
    { label: "PTO Value", value: fmtMoney(result.ptoValue) },
    { label: "Other Cash Comp", value: fmtMoney(result.otherCash) },
    { label: "Payroll Taxes", value: fmtMoney(result.payrollTax) },
    { label: "Total Benefits", value: fmtMoney(result.totalBenefits), bold: true },
    { label: "Benefits % of Salary", value: fmt(result.benefitsPctOfSalary, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Benefits Cost per Employee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Benefits Cost per Employee Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bc-salary" label="Annual Salary" value={inputs.annualSalary} onChange={set("annualSalary")} prefix="$" />
              <NumInput id="bc-health" label="Health Insurance (Employer Share)" value={inputs.healthInsurance} onChange={set("healthInsurance")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bc-retirement" label="Retirement Match" value={inputs.retirementMatch} onChange={set("retirementMatch")} suffix="% of salary" />
              <NumInput id="bc-pto" label="Paid Time Off" value={inputs.ptoDays} onChange={set("ptoDays")} suffix="days" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Additional Coverage</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="bc-dental" label="Dental & Vision" value={inputs.dentalVision} onChange={set("dentalVision")} prefix="$" />
                    <NumInput id="bc-life" label="Life & Disability Insurance" value={inputs.lifeDisability} onChange={set("lifeDisability")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="bc-cash" label="Bonus & Other Cash Comp" value={inputs.otherCash} onChange={set("otherCash")} prefix="$" />
                    <NumInput id="bc-tax" label="Employer Payroll Taxes" value={inputs.payrollTaxPct} onChange={set("payrollTaxPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; retirement match between 0 and 100%; payroll taxes between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Benefits Cost per Employee</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalBenefits)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.benefitsPctOfSalary, 1)}% of a {fmtMoney(num(inputs.annualSalary))} salary</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Health Insurance</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.healthInsurance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Retirement Match</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.retirementMatch)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">PTO Value</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.ptoValue)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Benefits Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Benefits Cost per Employee Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A benefits cost per employee calculator estimates the total annual cost of the benefits package an employer provides to a single employee, expressed both as a dollar figure and as a percentage of salary. Benefits are one of the largest hidden costs in any organization, and they are hidden precisely because they never appear on a pay stub. Health insurance premiums, retirement contributions, paid time off, dental and vision coverage, life and disability insurance, bonuses, and the employer's share of payroll taxes all add up to a figure that most managers never see. Understanding the fully loaded benefits cost matters for budgeting, for comparing compensation offers, for pricing contracts and projects that charge out employee time, and for deciding between hiring, contracting, or adding benefits. This calculator assembles the complete benefits picture per employee so the true cost of the workforce is explicit rather than scattered across vendor invoices and payroll accounts.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes the annual salary and the employer's per-employee benefit costs as its core inputs. Health insurance is entered as the employer's share of the annual premium, which is the single largest benefits line for most employers. The retirement match is entered as a percentage of salary and converted into dollars, so with the default inputs a $65,000 salary with a 4 percent match produces a $2,600 employer contribution. The paid time off line converts the days of PTO into a cash value using the daily rate of the salary over a 260-day working year, so 15 days of PTO on a $65,000 salary is worth about $3,750, which reflects the pay the employer carries while the employee is not working. These four inputs form the visible tier of the benefits package.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the remaining benefit lines. Dental and vision coverage and life and disability insurance are entered as the employer's annual premium per employee. Bonus and other cash compensation captures annual bonuses, incentives, and other cash paid outside the base salary. The employer payroll taxes line applies the employer's share of Social Security, Medicare, and unemployment taxes as a percentage of salary, with 7.65 percent as the standard employer FICA share. Summing all seven components gives the total benefits cost per employee, and dividing by the salary gives the benefits percentage. With the defaults, the total comes to roughly $22,200, which is about 34 percent of the $65,000 salary, right in line with the 30 to 40 percent range that compensation surveys consistently report for fully loaded employee cost.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total benefits cost per employee, and the benefits percentage of salary is the benchmark to compare against your industry, because compensation surveys publish this figure and it tells you whether your package is competitive or rich. The breakdown table shows where the cost concentrates, and for most employers health insurance dominates, which is why plan design decisions move the total so much. Use the per-employee figure to build the annual benefits budget by multiplying it by headcount, to compare the cost of a benefits-heavy offer against a higher salary with leaner benefits, and to compute fully loaded rates when quoting services or building project budgets. Track the percentage over time, because benefits costs tend to rise faster than salaries, and an aging workforce or a plan renewal can move the total sharply. The calculation also supports retention planning, since benefits are among the most visible signals of how an employer values its people.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/benefits-cost-per-employee-calculator" />
        </div>
      </div>
    </>
  );
}