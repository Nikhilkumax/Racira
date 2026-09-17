"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  changeRequests: string;
  avgHoursPerChange: string;
  hourlyRate: string;
  reworkPct: string;
  originalBudget: string;
  approvalRate: string;
  creepDays: string;
  teamDailyCost: string;
  docCost: string;
}

interface Result {
  approvedRequests: number;
  changeCost: number;
  reworkCost: number;
  creepCost: number;
  totalCost: number;
  costPerRequest: number;
  costAsPctBudget: number;
}

const DEFAULTS: Inputs = {
  changeRequests: "15",
  avgHoursPerChange: "40",
  hourlyRate: "80",
  reworkPct: "10",
  originalBudget: "400000",
  approvalRate: "70",
  creepDays: "12",
  teamDailyCost: "4500",
  docCost: "6000",
};

function calculate(inputs: Inputs): Result {
  const changeRequests = Math.max(0, parseFloat(inputs.changeRequests) || 0);
  const avgHoursPerChange = Math.max(0, parseFloat(inputs.avgHoursPerChange) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const reworkPct = Math.min(100, Math.max(0, parseFloat(inputs.reworkPct) || 0));
  const originalBudget = Math.max(0, parseFloat(inputs.originalBudget) || 0);
  const approvalRate = Math.min(100, Math.max(0, parseFloat(inputs.approvalRate) || 0));
  const creepDays = Math.max(0, parseFloat(inputs.creepDays) || 0);
  const teamDailyCost = Math.max(0, parseFloat(inputs.teamDailyCost) || 0);
  const docCost = Math.max(0, parseFloat(inputs.docCost) || 0);

  const approvedRequests = changeRequests * (approvalRate / 100);
  const changeCost = approvedRequests * avgHoursPerChange * hourlyRate;
  const reworkCost = originalBudget * (reworkPct / 100);
  const creepCost = creepDays * teamDailyCost;
  const totalCost = changeCost + reworkCost + creepCost + docCost;
  const costPerRequest = approvedRequests > 0 ? totalCost / approvedRequests : 0;
  const costAsPctBudget = originalBudget > 0 ? (totalCost / originalBudget) * 100 : 0;

  return { approvedRequests, changeCost, reworkCost, creepCost, totalCost, costPerRequest, costAsPctBudget };
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

export default function ChangeRequestCostImpactCalculator() {
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
    num(inputs.changeRequests) < 0 ||
    num(inputs.avgHoursPerChange) < 0 ||
    num(inputs.hourlyRate) < 0 ||
    num(inputs.reworkPct) < 0 || num(inputs.reworkPct) > 100 ||
    num(inputs.originalBudget) < 0 ||
    num(inputs.approvalRate) < 0 || num(inputs.approvalRate) > 100 ||
    num(inputs.creepDays) < 0 ||
    num(inputs.teamDailyCost) < 0 ||
    num(inputs.docCost) < 0;

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
    { label: "Change Requests Submitted", value: fmt(num(inputs.changeRequests)) },
    { label: `Approved (${fmt(num(inputs.approvalRate), 1)}%)`, value: fmt(result.approvedRequests, 1) },
    { label: `Change Work (${fmt(num(inputs.avgHoursPerChange))} hrs × ${fmtMoney(num(inputs.hourlyRate))})`, value: fmtMoney(result.changeCost) },
    { label: `Rework of Existing Work (${fmt(num(inputs.reworkPct), 1)}%)`, value: fmtMoney(result.reworkCost) },
    { label: `Schedule Creep (${fmt(num(inputs.creepDays))} days × ${fmtMoney(num(inputs.teamDailyCost))})`, value: fmtMoney(result.creepCost) },
    { label: "Change Control & Documentation", value: fmtMoney(num(inputs.docCost)) },
    { label: "Total Cost Impact of Changes", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Approved Request", value: fmtMoney(result.costPerRequest), highlight: true },
  ];

  const summaryStats = [
    { label: "Change Requests", value: fmt(num(inputs.changeRequests)) },
    { label: "Approval Rate", value: fmt(num(inputs.approvalRate), 1) + "%" },
    { label: "Approved Requests", value: fmt(result.approvedRequests, 1) },
    { label: "Avg Hours per Change", value: fmt(num(inputs.avgHoursPerChange)) },
    { label: "Change Work Cost", value: fmtMoney(result.changeCost) },
    { label: "Rework Cost", value: fmtMoney(result.reworkCost) },
    { label: "Schedule Creep Cost", value: fmtMoney(result.creepCost) },
    { label: "Documentation Cost", value: fmtMoney(num(inputs.docCost)) },
    { label: "Total Cost Impact", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Approved Request", value: fmtMoney(result.costPerRequest) },
    { label: "Original Budget", value: fmtMoney(num(inputs.originalBudget)) },
    { label: "Impact as % of Budget", value: fmt(result.costAsPctBudget, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Change Request Cost Impact Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Change Request Cost Impact Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="crc-requests" label="Change Requests" value={inputs.changeRequests} onChange={set("changeRequests")} suffix="requests" />
              <NumInput id="crc-hours" label="Avg Hours per Change" value={inputs.avgHoursPerChange} onChange={set("avgHoursPerChange")} suffix="hrs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="crc-rate" label="Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" suffix="/hr" />
              <NumInput id="crc-rework" label="Rework of Existing Work" value={inputs.reworkPct} onChange={set("reworkPct")} suffix="% of budget" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Control & Schedule</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="crc-budget" label="Original Project Budget" value={inputs.originalBudget} onChange={set("originalBudget")} prefix="$" />
                    <NumInput id="crc-approval" label="Change Approval Rate" value={inputs.approvalRate} onChange={set("approvalRate")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="crc-creep" label="Schedule Creep" value={inputs.creepDays} onChange={set("creepDays")} suffix="days" />
                    <NumInput id="crc-daily" label="Team Daily Cost" value={inputs.teamDailyCost} onChange={set("teamDailyCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="crc-doc" label="Documentation Cost" value={inputs.docCost} onChange={set("docCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and percentage inputs between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Cost Impact of Changes</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.costAsPctBudget, 1)}% of original budget — {fmtMoney(result.costPerRequest)} per approved request</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Change Work</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.changeCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rework + Creep</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.reworkCost + result.creepCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">% of Budget</span>
                <span className="font-extrabold text-red-600">{fmt(result.costAsPctBudget, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Change Impact Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Change Request Cost Impact Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A change request cost impact calculator estimates the financial effect of scope changes on a project, which is one of the most common causes of project overruns. Every change request carries direct costs, the hours of work required to implement it, but the full impact is larger: changes often require reworking work already completed, they extend the schedule, which carries the team's daily cost, and they consume the change control process itself. Projects that approve changes without quantifying this full impact drift over budget one request at a time. This calculator models the complete cost of a change program: the change work on approved requests, the rework of existing deliverables, the schedule creep from extended timelines, and the documentation cost, then reports the total impact, the cost per approved request, and the impact as a percentage of the original budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of change requests, the average hours per change, the hourly rate, and the rework percentage. The approved requests multiply the submitted count by the approval rate, and the change work cost multiplies the approved requests by the hours and the rate: with the default inputs, 15 requests at a 70% approval rate leaves 10.5 approved, each carrying 40 hours at $80, for a change work cost of $33,600. The advanced options add the original project budget, the change approval rate, the schedule creep in days, the team daily cost, and the documentation cost. The rework cost applies the rework percentage to the original budget, reflecting the work that must be redone because of the changes, and the schedule creep cost multiplies the creep days by the team daily cost. The total impact sums the four components, the cost per approved request divides it by the approved count, and the impact percentage compares it against the original budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total impact and its percentage of the original budget are the numbers to present in the change control meeting, because they convert a stream of individually reasonable requests into the aggregate effect on the project's financial health. The cost per approved request is the figure to use when setting thresholds: if the average approved request costs more than the change control board assumed, the approval criteria are too loose. The rework and schedule creep lines are the hidden costs that make changes expensive, and they are also the most negotiable, since better change sequencing and freeze dates can reduce both. A project where the change impact exceeds 15% to 20% of the original budget is effectively a new project and should be re-baselined rather than continued on the original plan. Track the impact cumulatively as requests are approved.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="change-request-cost-impact-calculator" />
        </div>
      </div>
    </>
  );
}