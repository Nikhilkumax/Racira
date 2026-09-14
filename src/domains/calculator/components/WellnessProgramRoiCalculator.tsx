"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  programCost: string;
  healthcareCost: string;
  healthcareSavings: string;
  absenteeismCost: string;
  absenteeismReduction: string;
  presenteeismCost: string;
  presenteeismReduction: string;
}

interface Result {
  programTotal: number;
  healthcareSavingsTotal: number;
  absenteeismSavings: number;
  presenteeismSavings: number;
  totalSavings: number;
  netBenefit: number;
  roiPct: number;
}

const DEFAULTS: Inputs = {
  employees: "300",
  programCost: "600",
  healthcareCost: "12000",
  healthcareSavings: "8",
  absenteeismCost: "3500",
  absenteeismReduction: "15",
  presenteeismCost: "2000",
  presenteeismReduction: "10",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const programCost = Math.max(0, parseFloat(inputs.programCost) || 0);
  const healthcareCost = Math.max(0, parseFloat(inputs.healthcareCost) || 0);
  const healthcareSavings = Math.min(100, Math.max(0, parseFloat(inputs.healthcareSavings) || 0));
  const absenteeismCost = Math.max(0, parseFloat(inputs.absenteeismCost) || 0);
  const absenteeismReduction = Math.min(100, Math.max(0, parseFloat(inputs.absenteeismReduction) || 0));
  const presenteeismCost = Math.max(0, parseFloat(inputs.presenteeismCost) || 0);
  const presenteeismReduction = Math.min(100, Math.max(0, parseFloat(inputs.presenteeismReduction) || 0));

  const programTotal = employees * programCost;
  const healthcareSavingsTotal = employees * healthcareCost * (healthcareSavings / 100);
  const absenteeismSavings = employees * absenteeismCost * (absenteeismReduction / 100);
  const presenteeismSavings = employees * presenteeismCost * (presenteeismReduction / 100);
  const totalSavings = healthcareSavingsTotal + absenteeismSavings + presenteeismSavings;
  const netBenefit = totalSavings - programTotal;
  const roiPct = programTotal > 0 ? (netBenefit / programTotal) * 100 : 0;

  return { programTotal, healthcareSavingsTotal, absenteeismSavings, presenteeismSavings, totalSavings, netBenefit, roiPct };
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

export default function WellnessProgramRoiCalculator() {
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
    num(inputs.employees) <= 0 ||
    num(inputs.programCost) < 0 ||
    num(inputs.healthcareCost) < 0 ||
    num(inputs.healthcareSavings) < 0 || num(inputs.healthcareSavings) > 100 ||
    num(inputs.absenteeismCost) < 0 ||
    num(inputs.absenteeismReduction) < 0 || num(inputs.absenteeismReduction) > 100 ||
    num(inputs.presenteeismCost) < 0 ||
    num(inputs.presenteeismReduction) < 0 || num(inputs.presenteeismReduction) > 100;

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
    { label: `Program Cost (${fmtMoney(num(inputs.programCost))}/employee)`, value: fmtMoney(result.programTotal) },
    { label: `Healthcare Savings (${fmt(num(inputs.healthcareSavings), 1)}%)`, value: fmtMoney(result.healthcareSavingsTotal) },
    { label: `Absenteeism Savings (${fmt(num(inputs.absenteeismReduction), 1)}%)`, value: fmtMoney(result.absenteeismSavings) },
    { label: `Presenteeism Savings (${fmt(num(inputs.presenteeismReduction), 1)}%)`, value: fmtMoney(result.presenteeismSavings) },
    { label: "Total Annual Savings", value: fmtMoney(result.totalSavings), total: true },
    { label: "Net Annual Benefit", value: fmtMoney(result.netBenefit) },
    { label: "Wellness Program ROI", value: result.roiPct.toFixed(1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Employees Covered", value: fmt(num(inputs.employees)) },
    { label: "Program Cost", value: fmtMoney(result.programTotal) },
    { label: "Healthcare Savings", value: fmtMoney(result.healthcareSavingsTotal) },
    { label: "Absenteeism Savings", value: fmtMoney(result.absenteeismSavings) },
    { label: "Presenteeism Savings", value: fmtMoney(result.presenteeismSavings) },
    { label: "Total Savings", value: fmtMoney(result.totalSavings), bold: true },
    { label: "Net Benefit", value: fmtMoney(result.netBenefit) },
    { label: "ROI", value: result.roiPct.toFixed(1) + "%" },
    { label: "Healthcare Cost / Employee", value: fmtMoney(num(inputs.healthcareCost)) },
    { label: "Absenteeism Cost / Employee", value: fmtMoney(num(inputs.absenteeismCost)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Wellness Program ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wellness Program ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="wroi-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="employees" />
              <NumInput id="wroi-cost" label="Program Cost per Employee" value={inputs.programCost} onChange={set("programCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="wroi-healthcare" label="Healthcare Cost per Employee" value={inputs.healthcareCost} onChange={set("healthcareCost")} prefix="$" />
              <NumInput id="wroi-savings" label="Healthcare Cost Savings" value={inputs.healthcareSavings} onChange={set("healthcareSavings")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Productivity & Absence</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="wroi-absence" label="Absenteeism Cost per Employee" value={inputs.absenteeismCost} onChange={set("absenteeismCost")} prefix="$" />
                    <NumInput id="wroi-absence-red" label="Absenteeism Reduction" value={inputs.absenteeismReduction} onChange={set("absenteeismReduction")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="wroi-presenteeism" label="Presenteeism Cost per Employee" value={inputs.presenteeismCost} onChange={set("presenteeismCost")} prefix="$" />
                    <NumInput id="wroi-presenteeism-red" label="Presenteeism Reduction" value={inputs.presenteeismReduction} onChange={set("presenteeismReduction")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Employee count must be greater than zero; all costs must be non-negative; all reduction rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Wellness Program ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.roiPct.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.totalSavings)} in savings on a {fmtMoney(result.programTotal)} program</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Annual Savings</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.totalSavings)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Healthcare Savings</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.healthcareSavingsTotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Program Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.programTotal)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Wellness Program Analysis</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Wellness Program ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A wellness program ROI calculator estimates the financial return a company earns from investing in employee health and wellness initiatives. Workplace wellness programs, which include fitness benefits, health screenings, mental health support, and healthy living incentives, are evaluated by finance teams on the same basis as any other investment: does the return justify the cost? The return arrives through several measurable channels. Healthier employees file fewer healthcare claims, so medical costs fall; they take fewer sick days, so absenteeism falls; and they work more effectively when present, so presenteeism losses shrink. Each of these channels has a dollar value per employee, and applying a realistic reduction rate to each produces a total annual saving that can be compared directly against the program's cost. This calculator assembles all three channels, applies the reduction assumptions, and produces the program ROI that belongs in the budget justification.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The number of employees sets the scale of both the cost and the benefit. The program cost per employee is the annual price of the wellness offerings, and multiplying it by the headcount gives the total program cost, which is the investment side of the ROI. The healthcare cost per employee is the average annual medical claims cost per covered employee, and the healthcare savings percentage is the reduction in those claims that the wellness program is expected to achieve. The healthcare savings are the headcount times the healthcare cost times the savings rate. With the default inputs, a 300-employee company with $12,000 of healthcare cost per employee and an 8% savings rate saves roughly $288,000 a year on medical claims alone, against a program cost of $180,000.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the productivity channels that are often the largest part of the return. The absenteeism cost per employee is the annual cost of sick days and unplanned absence, and the absenteeism reduction is the percentage improvement the program delivers, with the savings being the headcount times the cost times the reduction. Presenteeism, the productivity lost when employees work while unwell, is modeled the same way with its own cost per employee and reduction rate. The total annual savings sum all three channels, the net benefit subtracts the program cost, and the ROI divides the net benefit by the program cost. With the default inputs, adding a 15% absenteeism reduction on a $3,500 cost per employee and a 10% presenteeism reduction on a $2,000 cost per employee brings total savings to about $505,500, for a net benefit of roughly $325,500 and an ROI near 181%.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the wellness program ROI, and a positive ROI means the savings from the program exceed its cost, while the net benefit shows the actual dollars returned. The breakdown is important because the three channels have very different reliability: healthcare savings take years to materialize and are the hardest to attribute to the program, while absenteeism and presenteeism improvements show up quickly and are easier to measure with absence records and productivity data. Be disciplined with the reduction assumptions, because wellness ROI estimates are frequently inflated by optimistic rates, and the safest approach is to run the calculator with conservative reductions and then validate with a year of actual claims and absence data. The full value of wellness also includes employee satisfaction and retention, which this model does not price, so a program that breaks even on the three channels may still be a strong investment when engagement is included. Use the calculator to size the program budget and to set measurable targets for claims, absence, and productivity that will be reviewed at the end of the year.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/wellness-program-roi-calculator" />
        </div>
      </div>
    </>
  );
}