"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  baseSalary: string;
  bonusPct: string;
  payrollTaxPct: string;
  benefitsCost: string;
  matchPct: string;
  ptoDays: string;
  trainingBudget: string;
  perks: string;
}

interface Result {
  bonus: number;
  payrollTax: number;
  matchCost: number;
  ptoCost: number;
  totalCost: number;
  hourlyRate: number;
  burdenPct: number;
}

const DEFAULTS: Inputs = {
  baseSalary: "75000",
  bonusPct: "10",
  payrollTaxPct: "8.5",
  benefitsCost: "18500",
  matchPct: "4",
  ptoDays: "15",
  trainingBudget: "1200",
  perks: "800",
};

function calculate(inputs: Inputs): Result {
  const baseSalary = Math.max(0, parseFloat(inputs.baseSalary) || 0);
  const bonusPct = Math.min(100, Math.max(0, parseFloat(inputs.bonusPct) || 0));
  const payrollTaxPct = Math.min(100, Math.max(0, parseFloat(inputs.payrollTaxPct) || 0));
  const benefitsCost = Math.max(0, parseFloat(inputs.benefitsCost) || 0);
  const matchPct = Math.min(100, Math.max(0, parseFloat(inputs.matchPct) || 0));
  const ptoDays = Math.max(0, parseFloat(inputs.ptoDays) || 0);
  const trainingBudget = Math.max(0, parseFloat(inputs.trainingBudget) || 0);
  const perks = Math.max(0, parseFloat(inputs.perks) || 0);

  const bonus = baseSalary * (bonusPct / 100);
  const payrollTax = (baseSalary + bonus) * (payrollTaxPct / 100);
  const matchCost = baseSalary * (matchPct / 100);
  const ptoCost = ptoDays * (baseSalary / 260);
  const totalCost = baseSalary + bonus + payrollTax + benefitsCost + matchCost + ptoCost + trainingBudget + perks;
  const hourlyRate = baseSalary / 2080;
  const burdenPct = baseSalary > 0 ? ((totalCost - baseSalary) / baseSalary) * 100 : 0;

  return { bonus, payrollTax, matchCost, ptoCost, totalCost, hourlyRate, burdenPct };
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

export default function EmployerTotalCompensationCostCalculator() {
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
    num(inputs.baseSalary) < 0 ||
    num(inputs.bonusPct) < 0 || num(inputs.bonusPct) > 100 ||
    num(inputs.payrollTaxPct) < 0 || num(inputs.payrollTaxPct) > 100 ||
    num(inputs.benefitsCost) < 0 ||
    num(inputs.matchPct) < 0 || num(inputs.matchPct) > 100 ||
    num(inputs.ptoDays) < 0 ||
    num(inputs.trainingBudget) < 0 ||
    num(inputs.perks) < 0;

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
    { label: "Base Salary", value: fmtMoney(num(inputs.baseSalary)) },
    { label: `Bonus (${fmt(num(inputs.bonusPct), 1)}%)`, value: fmtMoney(result.bonus) },
    { label: `Payroll Taxes (${fmt(num(inputs.payrollTaxPct), 1)}%)`, value: fmtMoney(result.payrollTax) },
    { label: "Benefits & Insurance", value: fmtMoney(num(inputs.benefitsCost)) },
    { label: `401(k) Match (${fmt(num(inputs.matchPct), 1)}%)`, value: fmtMoney(result.matchCost) },
    { label: `Paid Time Off (${fmt(num(inputs.ptoDays))} days)`, value: fmtMoney(result.ptoCost) },
    { label: "Training & Development", value: fmtMoney(num(inputs.trainingBudget)) },
    { label: "Other Perks", value: fmtMoney(num(inputs.perks)) },
    { label: "Total Cost per Employee", value: fmtMoney(result.totalCost), total: true },
    { label: `Burden Rate (${fmt(result.burdenPct, 1)}%)`, value: fmtMoney(result.totalCost - num(inputs.baseSalary)), highlight: true },
  ];

  const summaryStats = [
    { label: "Base Salary", value: fmtMoney(num(inputs.baseSalary)) },
    { label: "Bonus", value: fmtMoney(result.bonus) },
    { label: "Payroll Taxes", value: fmtMoney(result.payrollTax) },
    { label: "Benefits & Insurance", value: fmtMoney(num(inputs.benefitsCost)) },
    { label: "401(k) Match", value: fmtMoney(result.matchCost) },
    { label: "PTO Cost", value: fmtMoney(result.ptoCost) },
    { label: "Training & Development", value: fmtMoney(num(inputs.trainingBudget)) },
    { label: "Other Perks", value: fmtMoney(num(inputs.perks)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Burden Rate", value: fmt(result.burdenPct, 1) + "%" },
    { label: "Effective Hourly Rate", value: fmtMoney(result.hourlyRate) + "/hr" },
    { label: "Monthly Cost", value: fmtMoney(result.totalCost / 12) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employer Total Compensation Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employer Total Compensation Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="etc-salary" label="Base Salary" value={inputs.baseSalary} onChange={set("baseSalary")} prefix="$" />
              <NumInput id="etc-bonus" label="Bonus" value={inputs.bonusPct} onChange={set("bonusPct")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="etc-tax" label="Payroll Tax Rate" value={inputs.payrollTaxPct} onChange={set("payrollTaxPct")} suffix="%" />
              <NumInput id="etc-benefits" label="Benefits Cost / Employee" value={inputs.benefitsCost} onChange={set("benefitsCost")} prefix="$" suffix="/yr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Retirement & Time Off</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="etc-match" label="401(k) Match" value={inputs.matchPct} onChange={set("matchPct")} suffix="%" />
                    <NumInput id="etc-pto" label="Paid Time Off" value={inputs.ptoDays} onChange={set("ptoDays")} suffix="days/yr" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Development & Perks</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="etc-training" label="Training Budget" value={inputs.trainingBudget} onChange={set("trainingBudget")} prefix="$" suffix="/yr" />
                    <NumInput id="etc-perks" label="Other Perks" value={inputs.perks} onChange={set("perks")} prefix="$" suffix="/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; percentage inputs must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Cost per Employee</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.totalCost / 12)} per month — burden rate {fmt(result.burdenPct, 1)}% of base salary</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Burden Rate</span>
                <span className="font-extrabold text-amber-600">{fmt(result.burdenPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Benefits & Taxes</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalCost - num(inputs.baseSalary))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hourly Rate</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.hourlyRate)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Compensation Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Employer Total Compensation Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An employer total compensation cost calculator estimates the complete annual expense a company carries for a single employee, far beyond the base salary shown in an offer letter. Compensation professionals call the gap between salary and true cost the burden rate, and it routinely lands between 25% and 40% of base pay depending on the payroll taxes, benefits, retirement matching, paid time off, and perks the employer provides. Budgeting with salary alone understates headcount costs, misprices work for contractors and agencies, and distorts per-unit economics in cost-plus contracts. This calculator assembles every major component: base salary, bonus, employer payroll taxes, benefits and insurance, the 401(k) match, the cash value of paid time off, training and development spending, and other perks, then reports the total, the monthly cost, the effective hourly rate, and the burden percentage.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation assumes a standard working year of 260 days and 2,080 hours, which is the convention most compensation analysts use for salaried positions; if your organization uses a different calendar, adjust the paid time off valuation accordingly. The payroll tax rate input is the combined employer share of Social Security, Medicare, federal and state unemployment taxes, and any state payroll taxes, which together typically land between 7% and 10% of taxable wages. The benefits line is deliberately entered as a dollar amount rather than a percentage because health insurance premiums, life and disability coverage, and flexible spending contributions vary with plan design and family status rather than with salary. When comparing this total against a contractor or agency rate, remember that the contractor's billable rate already embeds their own burden, so the fairest comparison is against the fully loaded hourly figure this calculator produces.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the base salary, the bonus percentage, the combined employer payroll tax rate, and the annual benefits cost per employee. The bonus is the salary multiplied by the bonus percentage, and payroll taxes are applied to the sum of salary and bonus, reflecting that bonus pay is generally subject to the same employer tax obligations. Benefits and insurance are entered directly because health, dental, vision, life, and disability premiums vary widely by plan and family size. The advanced options add the retirement match, calculated as the salary multiplied by the match percentage; paid time off, valued at the PTO days multiplied by the daily pay rate based on 260 working days per year; and the annual training budget and other perks as flat amounts. With the default inputs, a $75,000 salary with a 10% bonus and an 8.5% payroll tax rate carries $7,500 of bonus and $7,013 of payroll tax, and the full package totals about $113,000 a year, a burden rate near 50% that is typical for a fully loaded salaried position. The burden rate divides the difference between total cost and base salary by the base salary, and the hourly rate divides the base salary by 2,080 working hours.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual cost is the figure to use in department budgets, project cost allocations, and build-versus-buy decisions, since it reflects what the employee actually consumes. The burden rate tells you how efficient your compensation structure is: a high rate driven by generous benefits is a retention strategy, while a high rate driven by payroll tax assumptions may deserve a second look. The effective hourly rate is the number to compare against contractors and agencies, who bill at rates that already include their own overhead. Use the monthly cost to sanity-check cash flow, and revisit the inputs whenever open enrollment, salary bands, or bonus targets change. The calculator assumes a standard 260-day and 2,080-hour year, so adjust the PTO valuation if your organization uses a different work calendar.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="employer-total-compensation-cost-calculator" />
        </div>
      </div>
    </>
  );
}