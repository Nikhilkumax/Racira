"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  totalHours: string;
  hourlyWage: string;
  benefitsPct: string;
  overtimeHours: string;
  overtimePremium: string;
  tempHours: string;
  tempRate: string;
  payrollTaxPct: string;
  trainingHours: string;
  trainingRate: string;
}

interface Result {
  baseCost: number;
  overtimeCost: number;
  tempCost: number;
  trainingCost: number;
  benefitsCost: number;
  taxCost: number;
  totalCost: number;
  blendedRate: number;
}

const DEFAULTS: Inputs = {
  totalHours: "5000",
  hourlyWage: "42",
  benefitsPct: "30",
  overtimeHours: "300",
  overtimePremium: "50",
  tempHours: "800",
  tempRate: "38",
  payrollTaxPct: "8",
  trainingHours: "150",
  trainingRate: "55",
};

function calculate(inputs: Inputs): Result {
  const totalHours = Math.max(0, parseFloat(inputs.totalHours) || 0);
  const hourlyWage = Math.max(0, parseFloat(inputs.hourlyWage) || 0);
  const benefitsPct = Math.min(100, Math.max(0, parseFloat(inputs.benefitsPct) || 0));
  const overtimeHours = Math.max(0, parseFloat(inputs.overtimeHours) || 0);
  const overtimePremium = Math.min(200, Math.max(0, parseFloat(inputs.overtimePremium) || 0));
  const tempHours = Math.max(0, parseFloat(inputs.tempHours) || 0);
  const tempRate = Math.max(0, parseFloat(inputs.tempRate) || 0);
  const payrollTaxPct = Math.min(50, Math.max(0, parseFloat(inputs.payrollTaxPct) || 0));
  const trainingHours = Math.max(0, parseFloat(inputs.trainingHours) || 0);
  const trainingRate = Math.max(0, parseFloat(inputs.trainingRate) || 0);

  const benefitsCost = totalHours * hourlyWage * (benefitsPct / 100);
  const taxCost = totalHours * hourlyWage * (payrollTaxPct / 100);
  const baseCost = totalHours * hourlyWage + benefitsCost + taxCost;
  const overtimeCost = overtimeHours * hourlyWage * (1 + overtimePremium / 100) * (1 + benefitsPct / 100 + payrollTaxPct / 100);
  const tempCost = tempHours * tempRate;
  const trainingCost = trainingHours * trainingRate;
  const totalCost = baseCost + overtimeCost + tempCost + trainingCost;
  const blendedRate = totalHours + overtimeHours + tempHours > 0 ? totalCost / (totalHours + overtimeHours + tempHours) : 0;

  return { baseCost, overtimeCost, tempCost, trainingCost, benefitsCost, taxCost, totalCost, blendedRate };
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

export default function TotalProjectLaborCostCalculator() {
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
    num(inputs.totalHours) < 0 ||
    num(inputs.hourlyWage) < 0 ||
    num(inputs.benefitsPct) < 0 || num(inputs.benefitsPct) > 100 ||
    num(inputs.overtimeHours) < 0 ||
    num(inputs.overtimePremium) < 0 || num(inputs.overtimePremium) > 200 ||
    num(inputs.tempHours) < 0 ||
    num(inputs.tempRate) < 0 ||
    num(inputs.payrollTaxPct) < 0 || num(inputs.payrollTaxPct) > 50 ||
    num(inputs.trainingHours) < 0 ||
    num(inputs.trainingRate) < 0;

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
    { label: `Direct Wages (${fmt(num(inputs.totalHours))} hrs × ${fmtMoney(num(inputs.hourlyWage))})`, value: fmtMoney(num(inputs.totalHours) * num(inputs.hourlyWage)) },
    { label: `Benefits (${fmt(num(inputs.benefitsPct), 1)}%)`, value: fmtMoney(result.benefitsCost) },
    { label: `Payroll Taxes (${fmt(num(inputs.payrollTaxPct), 1)}%)`, value: fmtMoney(result.taxCost) },
    { label: `Overtime (${fmt(num(inputs.overtimeHours))} hrs @ ${fmt(num(inputs.overtimePremium), 1)}%)`, value: fmtMoney(result.overtimeCost) },
    { label: `Temporary Staff (${fmt(num(inputs.tempHours))} hrs × ${fmtMoney(num(inputs.tempRate))})`, value: fmtMoney(result.tempCost) },
    { label: `Training (${fmt(num(inputs.trainingHours))} hrs × ${fmtMoney(num(inputs.trainingRate))})`, value: fmtMoney(result.trainingCost) },
    { label: "Total Project Labor Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Blended Hourly Rate", value: fmtMoney(result.blendedRate), highlight: true },
  ];

  const summaryStats = [
    { label: "Total Hours", value: fmt(num(inputs.totalHours)) },
    { label: "Hourly Wage", value: fmtMoney(num(inputs.hourlyWage)) },
    { label: "Benefits %", value: fmt(num(inputs.benefitsPct), 1) + "%" },
    { label: "Payroll Tax %", value: fmt(num(inputs.payrollTaxPct), 1) + "%" },
    { label: "Direct Wages", value: fmtMoney(num(inputs.totalHours) * num(inputs.hourlyWage)) },
    { label: "Benefits Cost", value: fmtMoney(result.benefitsCost) },
    { label: "Tax Cost", value: fmtMoney(result.taxCost) },
    { label: "Overtime Cost", value: fmtMoney(result.overtimeCost) },
    { label: "Temp Staff Cost", value: fmtMoney(result.tempCost) },
    { label: "Training Cost", value: fmtMoney(result.trainingCost) },
    { label: "Total Labor Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Blended Rate", value: fmtMoney(result.blendedRate) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Total Project Labor Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Project Labor Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tplc-hours" label="Total Labor Hours" value={inputs.totalHours} onChange={set("totalHours")} suffix="hrs" />
              <NumInput id="tplc-wage" label="Average Hourly Wage" value={inputs.hourlyWage} onChange={set("hourlyWage")} prefix="$" suffix="/hr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tplc-benefits" label="Benefits & Burden" value={inputs.benefitsPct} onChange={set("benefitsPct")} suffix="%" />
              <NumInput id="tplc-ot" label="Overtime Hours" value={inputs.overtimeHours} onChange={set("overtimeHours")} suffix="hrs" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overtime & Taxes</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tplc-ot-premium" label="Overtime Premium" value={inputs.overtimePremium} onChange={set("overtimePremium")} suffix="%" />
                    <NumInput id="tplc-tax" label="Payroll Tax Rate" value={inputs.payrollTaxPct} onChange={set("payrollTaxPct")} suffix="%" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Temp Staff & Training</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tplc-temp-hours" label="Temp Staff Hours" value={inputs.tempHours} onChange={set("tempHours")} suffix="hrs" />
                    <NumInput id="tplc-temp-rate" label="Temp Rate" value={inputs.tempRate} onChange={set("tempRate")} prefix="$" suffix="/hr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="tplc-training-hours" label="Training Hours" value={inputs.trainingHours} onChange={set("trainingHours")} suffix="hrs" />
                    <NumInput id="tplc-training-rate" label="Training Rate" value={inputs.trainingRate} onChange={set("trainingRate")} prefix="$" suffix="/hr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; benefits between 0 and 100; overtime premium between 0 and 200; tax between 0 and 50.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Project Labor Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.blendedRate)} blended hourly rate across {fmt(num(inputs.totalHours) + num(inputs.overtimeHours) + num(inputs.tempHours))} hours</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Direct Wages</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(num(inputs.totalHours) * num(inputs.hourlyWage))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Burden (Benefits + Tax)</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.benefitsCost + result.taxCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Blended Rate</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.blendedRate)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Labor Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Total Project Labor Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A total project labor cost calculator estimates the complete cost of the labor a project consumes, including every component beyond the direct wages. The direct wages are only part of the bill: benefits and payroll taxes add a burden of 30% to 50% on top of wages, overtime hours carry a premium that raises the effective rate, temporary staff are billed at agency rates that include their own burden, and the training hours required to bring people up to speed cost money too. Project budgets that count only direct wages understate labor cost by a third or more, which is why fully loaded labor costing is a standard discipline in project finance. This calculator assembles all of the components into a total labor cost and a blended hourly rate that reflects the true average cost of every hour the project consumes.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the total labor hours, the average hourly wage, the benefits and burden percentage, and the overtime hours. The direct wages multiply the hours by the wage, and the benefits and payroll tax costs apply their percentages to the direct wages: with the default inputs, 5,000 hours at $42 an hour carries $210,000 of direct wages, $63,000 of benefits at 30%, and $16,800 of payroll taxes at 8%. The advanced options add the overtime premium, the temp staff hours and rate, the payroll tax rate, and the training hours and rate. The overtime cost applies the premium and the full burden to the overtime hours, the temp cost multiplies the temp hours by the agency rate, and the training cost multiplies the training hours by the training rate. The total labor cost sums all six components, and the blended rate divides it by the combined hours, showing the fully loaded cost of every hour regardless of its source.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total labor cost is the budget figure, and the blended hourly rate is the number to use when pricing the project's output or comparing it against external bids, since a project quoted at the raw wage rate is priced below its true cost. The burden percentage is the assumption to validate against your actual benefits program, because it is the largest addition to wages and the easiest to understate. The overtime premium is the lever to watch: heavy overtime inflates the blended rate sharply, and a project with substantial overtime often costs more than one with more staff working normal hours. The temp staff line is worth comparing against overtime, since the two are alternative ways to cover the same capacity. Re-run the model as the staffing plan changes, and track the blended rate against your billing rate to confirm each project remains profitable.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="total-project-labor-cost-calculator" />
        </div>
      </div>
    </>
  );
}