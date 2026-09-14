"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualSalary: string;
  daysVacant: string;
  lostPct: string;
  coveragePct: string;
  tempPremium: string;
  managerHours: string;
  managerRate: string;
  adminCost: string;
}

interface Result {
  lostProductivity: number;
  tempCoverage: number;
  managerTime: number;
  adminCost: number;
  totalCost: number;
  costPerDay: number;
}

const DEFAULTS: Inputs = {
  annualSalary: "70000",
  daysVacant: "45",
  lostPct: "50",
  coveragePct: "25",
  tempPremium: "30",
  managerHours: "1.5",
  managerRate: "65",
  adminCost: "2500",
};

function calculate(inputs: Inputs): Result {
  const annualSalary = Math.max(0, parseFloat(inputs.annualSalary) || 0);
  const daysVacant = Math.max(0, parseFloat(inputs.daysVacant) || 0);
  const lostPct = Math.min(100, Math.max(0, parseFloat(inputs.lostPct) || 0));
  const coveragePct = Math.min(200, Math.max(0, parseFloat(inputs.coveragePct) || 0));
  const tempPremium = Math.min(300, Math.max(0, parseFloat(inputs.tempPremium) || 0));
  const managerHours = Math.max(0, parseFloat(inputs.managerHours) || 0);
  const managerRate = Math.max(0, parseFloat(inputs.managerRate) || 0);
  const adminCost = Math.max(0, parseFloat(inputs.adminCost) || 0);

  const dailyRate = annualSalary / 260;
  const lostProductivity = dailyRate * daysVacant * (lostPct / 100);
  const tempCoverage = dailyRate * daysVacant * (coveragePct / 100) * (1 + tempPremium / 100);
  const managerTime = managerHours * daysVacant * managerRate;
  const totalCost = lostProductivity + tempCoverage + managerTime + adminCost;
  const costPerDay = daysVacant > 0 ? totalCost / daysVacant : 0;

  return { lostProductivity, tempCoverage, managerTime, adminCost, totalCost, costPerDay };
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

export default function VacancyCostCalculator() {
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
    num(inputs.daysVacant) < 0 ||
    num(inputs.lostPct) < 0 || num(inputs.lostPct) > 100 ||
    num(inputs.coveragePct) < 0 || num(inputs.coveragePct) > 200 ||
    num(inputs.tempPremium) < 0 || num(inputs.tempPremium) > 300 ||
    num(inputs.managerHours) < 0 ||
    num(inputs.managerRate) < 0 ||
    num(inputs.adminCost) < 0;

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
    { label: `Lost Productivity (${fmt(num(inputs.lostPct), 1)}% of work uncovered)`, value: fmtMoney(result.lostProductivity) },
    { label: `Temp / Overtime Coverage (${fmt(num(inputs.coveragePct), 1)}% @ ${fmt(num(inputs.tempPremium), 1)}% premium)`, value: fmtMoney(result.tempCoverage) },
    { label: `Manager & Team Time (${fmt(num(inputs.managerHours), 1)} hrs/day)`, value: fmtMoney(result.managerTime) },
    { label: "Admin & Recruiting Overhead", value: fmtMoney(result.adminCost) },
    { label: "Total Vacancy Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Vacant Day", value: fmtMoney(result.costPerDay), highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Salary", value: fmtMoney(num(inputs.annualSalary)) },
    { label: "Days Vacant", value: fmt(num(inputs.daysVacant)) + " days" },
    { label: "Lost Productivity", value: fmtMoney(result.lostProductivity) },
    { label: "Temp / Overtime", value: fmtMoney(result.tempCoverage) },
    { label: "Manager & Team Time", value: fmtMoney(result.managerTime) },
    { label: "Admin & Recruiting", value: fmtMoney(result.adminCost) },
    { label: "Total Vacancy Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Vacant Day", value: fmtMoney(result.costPerDay) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Vacancy Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vacancy Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vc-salary" label="Annual Salary" value={inputs.annualSalary} onChange={set("annualSalary")} prefix="$" />
              <NumInput id="vc-days" label="Days Position Vacant" value={inputs.daysVacant} onChange={set("daysVacant")} suffix="days" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vc-lost" label="Work Uncovered" value={inputs.lostPct} onChange={set("lostPct")} suffix="%" />
              <NumInput id="vc-coverage" label="Temp / Overtime Coverage" value={inputs.coveragePct} onChange={set("coveragePct")} suffix="% of role" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Coverage & Overhead</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="vc-premium" label="Temp / Overtime Premium" value={inputs.tempPremium} onChange={set("tempPremium")} suffix="%" />
                    <NumInput id="vc-mgr-hours" label="Manager Time per Day" value={inputs.managerHours} onChange={set("managerHours")} suffix="hours" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="vc-mgr-rate" label="Manager Hourly Rate" value={inputs.managerRate} onChange={set("managerRate")} prefix="$" />
                    <NumInput id="vc-admin" label="Admin & Recruiting Overhead" value={inputs.adminCost} onChange={set("adminCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; work uncovered must be between 0 and 100%; coverage between 0 and 200%; premium between 0 and 300%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Vacancy Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerDay)} per vacant day across {fmt(num(inputs.daysVacant))} days</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lost Productivity</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.lostProductivity)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Temp / Overtime</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.tempCoverage)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Day</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerDay)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Vacancy Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Vacancy Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A vacancy cost calculator estimates the total financial impact of an unfilled position, from the day the employee leaves until the day the replacement is fully productive. Open positions are usually tracked as a recruiting metric, but the real cost of a vacancy is far broader. The work still needs to be done, so it is either dropped, absorbed by remaining staff, covered with overtime, or handled by temporary workers at premium rates. Managers spend hours redistributing work, interviewing candidates, and checking in on coverage. Each of these carries a price, and the price grows every day the position stays open. This calculator assembles those costs into a single number: the lost productivity of the uncovered work, the extra cost of temporary or overtime coverage, the manager and team time spent compensating for the gap, and the administrative overhead of the search itself. The result is both a total vacancy cost and a cost per vacant day, which makes the urgency of filling open roles concrete for leadership.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts from the annual salary of the position, converted to a daily rate using a 260-day working year. The days the position sits vacant set the duration of the impact, and the two core percentages divide the work between what goes uncovered and what gets covered. The percentage of work uncovered reflects the portion of the role's output that simply drops while the position is empty, and its cost is the daily rate multiplied by the days vacant and that percentage. With the default inputs, a $70,000 role costing $269 a day that sits vacant for 45 days with half its work uncovered carries about $6,058 in lost productivity. The temporary or overtime coverage percentage captures the portion of the work that is picked up by others, and its cost is the daily rate times the days vacant times the coverage percentage, multiplied by a premium that reflects the markup of agencies or the overtime rate paid to existing staff, adding another $3,933 with the defaults.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the less obvious costs. The manager time per day captures the hours managers spend redistributing work, screening candidates, and managing coverage, valued at the manager's hourly rate, which contributes about $4,388 across 45 days at 1.5 hours per day. The admin and recruiting overhead covers job postings, background checks, and HR processing. Adding all four components gives a total vacancy cost of roughly $16,879 for the defaults, about $375 per vacant day. That per-day figure is the most useful output for planning, because it lets a company estimate the cost of any open position simply by multiplying it by the expected days to fill, and it makes the trade-off between paying more for a faster search and letting a position sit visible in plain dollar terms.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total vacancy cost, and the cost per vacant day is the figure to carry into planning conversations, because it lets you estimate the cost of any future vacancy before it happens. The breakdown shows where the impact concentrates: large lost productivity lines suggest the role's work genuinely depends on the position, while large coverage lines suggest the burden is falling on the rest of the team, which carries its own retention risk. Compare vacancy costs against the cost of faster hiring paths, like broader sourcing, referral bonuses, or a strong bench of internal candidates, and the investment case usually writes itself. Use the calculator when a departure is announced, when reviewing open requisitions in the quarterly plan, or when deciding whether to backfill a role at all. It also supports honest conversations about turnaround time, because reducing the time to fill by even a week saves the per-day cost multiplied by the number of open roles.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/vacancy-cost-calculator" />
        </div>
      </div>
    </>
  );
}