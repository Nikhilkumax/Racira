"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  teamSize: string;
  dailyRate: string;
  projectDays: string;
  utilization: string;
  overtimeHours: string;
  overtimePremium: string;
  travelCost: string;
  trainingCost: string;
  inflationPct: string;
}

interface Result {
  baseCost: number;
  overtimeCost: number;
  inflatedCost: number;
  totalCost: number;
  costPerDay: number;
  billedDays: number;
  costPerPerson: number;
}

const DEFAULTS: Inputs = {
  teamSize: "8",
  dailyRate: "450",
  projectDays: "60",
  utilization: "85",
  overtimeHours: "120",
  overtimePremium: "50",
  travelCost: "18000",
  trainingCost: "9000",
  inflationPct: "3",
};

function calculate(inputs: Inputs): Result {
  const teamSize = Math.max(0, parseFloat(inputs.teamSize) || 0);
  const dailyRate = Math.max(0, parseFloat(inputs.dailyRate) || 0);
  const projectDays = Math.max(0, parseFloat(inputs.projectDays) || 0);
  const utilization = Math.min(100, Math.max(0, parseFloat(inputs.utilization) || 0));
  const overtimeHours = Math.max(0, parseFloat(inputs.overtimeHours) || 0);
  const overtimePremium = Math.min(200, Math.max(0, parseFloat(inputs.overtimePremium) || 0));
  const travelCost = Math.max(0, parseFloat(inputs.travelCost) || 0);
  const trainingCost = Math.max(0, parseFloat(inputs.trainingCost) || 0);
  const inflationPct = Math.min(100, Math.max(0, parseFloat(inputs.inflationPct) || 0));

  const hourlyEquivalent = dailyRate / 8;
  const baseCost = teamSize * dailyRate * projectDays * (utilization / 100);
  const overtimeCost = overtimeHours * hourlyEquivalent * (1 + overtimePremium / 100);
  const inflatedCost = (baseCost + overtimeCost) * (1 + inflationPct / 100);
  const totalCost = inflatedCost + travelCost + trainingCost;
  const billedDays = teamSize * projectDays * (utilization / 100);
  const costPerDay = projectDays > 0 ? totalCost / projectDays : 0;
  const costPerPerson = teamSize > 0 ? totalCost / teamSize : 0;

  return { baseCost, overtimeCost, inflatedCost, totalCost, costPerDay, billedDays, costPerPerson };
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

export default function ProjectResourceCostCalculator() {
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
    num(inputs.teamSize) < 0 ||
    num(inputs.dailyRate) < 0 ||
    num(inputs.projectDays) < 0 ||
    num(inputs.utilization) < 0 || num(inputs.utilization) > 100 ||
    num(inputs.overtimeHours) < 0 ||
    num(inputs.overtimePremium) < 0 || num(inputs.overtimePremium) > 200 ||
    num(inputs.travelCost) < 0 ||
    num(inputs.trainingCost) < 0 ||
    num(inputs.inflationPct) < 0 || num(inputs.inflationPct) > 100;

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
    { label: `Team Size (${fmt(num(inputs.teamSize))} people)`, value: fmt(num(inputs.teamSize)) },
    { label: `Daily Rate (${fmtMoney(num(inputs.dailyRate))})`, value: fmtMoney(num(inputs.dailyRate)) },
    { label: `Project Duration (${fmt(num(inputs.projectDays))} days)`, value: fmt(num(inputs.projectDays)) + " days" },
    { label: `Utilization (${fmt(num(inputs.utilization), 1)}%)`, value: fmtMoney(result.baseCost) },
    { label: `Overtime (${fmt(num(inputs.overtimeHours))} hrs @ ${fmt(num(inputs.overtimePremium), 1)}%)`, value: fmtMoney(result.overtimeCost) },
    { label: `Inflation (${fmt(num(inputs.inflationPct), 1)}%)`, value: fmtMoney(result.inflatedCost - result.baseCost - result.overtimeCost) },
    { label: "Travel & Lodging", value: fmtMoney(num(inputs.travelCost)) },
    { label: "Training & Onboarding", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Total Resource Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Project Day", value: fmtMoney(result.costPerDay), highlight: true },
  ];

  const summaryStats = [
    { label: "Team Size", value: fmt(num(inputs.teamSize)) },
    { label: "Daily Rate", value: fmtMoney(num(inputs.dailyRate)) },
    { label: "Project Days", value: fmt(num(inputs.projectDays)) },
    { label: "Utilization", value: fmt(num(inputs.utilization), 1) + "%" },
    { label: "Base Cost", value: fmtMoney(result.baseCost) },
    { label: "Overtime Cost", value: fmtMoney(result.overtimeCost) },
    { label: "Inflation Cost", value: fmtMoney(result.inflatedCost - result.baseCost - result.overtimeCost) },
    { label: "Travel & Lodging", value: fmtMoney(num(inputs.travelCost)) },
    { label: "Training", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Day", value: fmtMoney(result.costPerDay) },
    { label: "Cost per Person", value: fmtMoney(result.costPerPerson) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Project Resource Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Project Resource Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="prc-team" label="Team Size" value={inputs.teamSize} onChange={set("teamSize")} suffix="people" />
              <NumInput id="prc-rate" label="Daily Rate per Person" value={inputs.dailyRate} onChange={set("dailyRate")} prefix="$" suffix="/day" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="prc-days" label="Project Duration" value={inputs.projectDays} onChange={set("projectDays")} suffix="days" />
              <NumInput id="prc-util" label="Utilization" value={inputs.utilization} onChange={set("utilization")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overtime & Escalation</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="prc-ot" label="Overtime Hours" value={inputs.overtimeHours} onChange={set("overtimeHours")} suffix="hrs" />
                    <NumInput id="prc-ot-premium" label="Overtime Premium" value={inputs.overtimePremium} onChange={set("overtimePremium")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="prc-inflation" label="Rate Escalation / Inflation" value={inputs.inflationPct} onChange={set("inflationPct")} suffix="%" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Travel & Training</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="prc-travel" label="Travel & Lodging" value={inputs.travelCost} onChange={set("travelCost")} prefix="$" />
                    <NumInput id="prc-training" label="Training & Onboarding" value={inputs.trainingCost} onChange={set("trainingCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; utilization between 0 and 100; overtime premium between 0 and 200.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Project Resource Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerDay)} per project day — {fmtMoney(result.costPerPerson)} per person</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.baseCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Billed Days</span>
                <span className="font-extrabold text-amber-600">{fmt(result.billedDays)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Person</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerPerson)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Resource Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Project Resource Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A project resource cost calculator estimates the total cost of the people assigned to a project, which for most projects is the largest single cost category. Resource cost is more than the team's daily rates multiplied by the calendar: it depends on utilization, because people are not productive every hour they are on the project calendar, on overtime premiums when deadlines compress, on rate escalation for long projects, and on the travel, lodging, and training that staffing a project requires. This calculator models the full picture: the base cost of the team at their daily rates over the project duration at the planned utilization, the overtime premium, the escalation applied to the labor, and the travel and training costs, producing a total resource cost, a cost per project day, and a cost per person that belong in the project budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the team size, the daily rate per person, the project duration in days, and the utilization percentage. The base cost multiplies the team size by the daily rate, the project days, and the utilization, so an eight-person team at $450 a day over 60 days at 85% utilization carries a base cost of $183,600. The advanced options add the overtime hours, valued at the hourly equivalent of the daily rate with the overtime premium added; the rate escalation or inflation percentage, applied to the combined labor; the travel and lodging cost; and the training and onboarding cost. The total resource cost is the escalated labor plus travel and training, the cost per project day divides it by the duration, and the cost per person divides it by the team size. The billed days output shows how many paid project days the utilization assumption actually buys, which is the number that reconciles the resource plan with the schedule.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total resource cost is the budget figure, and the cost per project day is the number to use when comparing the project against alternatives or when negotiating the internal charge. The utilization input is the assumption to validate, because a team booked at 100% utilization is rarely achievable, and overstating utilization understates cost exactly when projects are most likely to slip. The cost per person shows the fully loaded cost of each team member, which is the figure to use when adding or removing headcount from the plan. Overtime and escalation are the levers that compress or extend the timeline: a small team with heavy overtime can cost more than a larger team working normal hours. Re-run the model when the schedule or team changes, since resource cost is the most sensitive line in most project budgets.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="project-resource-cost-calculator" />
        </div>
      </div>
    </>
  );
}