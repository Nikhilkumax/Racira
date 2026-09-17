"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  handleTime: string;
  afterCallWork: string;
  callsPerDay: string;
  workdaysPerMonth: string;
  numAgents: string;
  hourlyCost: string;
  overheadLoad: string;
  shrinkageRate: string;
}

interface Result {
  minutesPerCall: number;
  totalMinutes: number;
  totalHours: number;
  costPerHour: number;
  monthlyCost: number;
  costPerCall: number;
  agentsNeeded: number;
  availableMinutesPerAgent: number;
  annualCost: number;
}

const DEFAULTS: Inputs = {
  handleTime: "6",
  afterCallWork: "2",
  callsPerDay: "500",
  workdaysPerMonth: "22",
  numAgents: "10",
  hourlyCost: "25",
  overheadLoad: "30",
  shrinkageRate: "25",
};

function calculate(inputs: Inputs): Result {
  const handleTime = Math.max(0, parseFloat(inputs.handleTime) || 0);
  const afterCallWork = Math.max(0, parseFloat(inputs.afterCallWork) || 0);
  const callsPerDay = Math.max(0, parseFloat(inputs.callsPerDay) || 0);
  const workdaysPerMonth = Math.max(1, parseFloat(inputs.workdaysPerMonth) || 1);
  const numAgents = Math.max(0, parseFloat(inputs.numAgents) || 0);
  const hourlyCost = Math.max(0, parseFloat(inputs.hourlyCost) || 0);
  const overheadLoad = Math.min(500, Math.max(0, parseFloat(inputs.overheadLoad) || 0));
  const shrinkageRate = Math.min(100, Math.max(0, parseFloat(inputs.shrinkageRate) || 0));

  const minutesPerCall = handleTime + afterCallWork;
  const totalMinutes = minutesPerCall * callsPerDay * workdaysPerMonth;
  const totalHours = totalMinutes / 60;
  const costPerHour = hourlyCost * (1 + overheadLoad / 100);
  const monthlyCost = totalHours * costPerHour;
  const costPerCall = callsPerDay * workdaysPerMonth > 0 ? monthlyCost / (callsPerDay * workdaysPerMonth) : 0;
  const availableMinutesPerAgent = workdaysPerMonth * 8 * 60 * (1 - shrinkageRate / 100);
  const agentsNeeded = availableMinutesPerAgent > 0 ? totalMinutes / availableMinutesPerAgent : 0;
  const annualCost = monthlyCost * 12;

  return { minutesPerCall, totalMinutes, totalHours, costPerHour, monthlyCost, costPerCall, agentsNeeded, availableMinutesPerAgent, annualCost };
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

export default function AverageHandleTimeCostCalculator() {
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
    num(inputs.handleTime) < 0 ||
    num(inputs.afterCallWork) < 0 ||
    num(inputs.callsPerDay) < 0 ||
    num(inputs.workdaysPerMonth) <= 0 ||
    num(inputs.numAgents) < 0 ||
    num(inputs.hourlyCost) < 0 ||
    num(inputs.overheadLoad) < 0 ||
    num(inputs.shrinkageRate) < 0 || num(inputs.shrinkageRate) > 100;

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

  const rows: { label: string; value: string; total?: boolean; highlight?: boolean }[] = [
    { label: "Avg Handle Time", value: fmt(num(inputs.handleTime), 1) + " min" },
    { label: "After-Call Work", value: fmt(num(inputs.afterCallWork), 1) + " min" },
    { label: "Minutes per Call", value: fmt(result.minutesPerCall, 1) + " min" },
    { label: "Total Call Minutes / Month", value: fmt(Math.round(result.totalMinutes)) + " min" },
    { label: "Total Agent Hours / Month", value: fmt(result.totalHours, 1) + " hrs" },
    { label: `Agent Cost / Hour (${fmt(num(inputs.overheadLoad))}% overhead)`, value: fmtMoney(result.costPerHour) },
    { label: "Monthly Handle Time Cost", value: fmtMoney(result.monthlyCost), highlight: true },
    { label: "Cost per Call", value: fmtMoney(result.costPerCall) },
    { label: "Agents Needed (at volume)", value: fmt(result.agentsNeeded, 1) },
    { label: "Annual Cost", value: fmtMoney(result.annualCost), total: true },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Avg Handle Time", value: fmt(num(inputs.handleTime), 1) + " min" },
    { label: "After-Call Work", value: fmt(num(inputs.afterCallWork), 1) + " min" },
    { label: "Calls per Day", value: fmt(num(inputs.callsPerDay)) },
    { label: "Working Days / Month", value: fmt(num(inputs.workdaysPerMonth)) },
    { label: "Number of Agents", value: fmt(num(inputs.numAgents)) },
    { label: "Agent Hourly Cost", value: fmtMoney(num(inputs.hourlyCost)) },
    { label: "Minutes per Call", value: fmt(result.minutesPerCall, 1) + " min" },
    { label: "Monthly Cost", value: fmtMoney(result.monthlyCost) },
    { label: "Cost per Call", value: fmtMoney(result.costPerCall) },
    { label: "Agents Needed", value: fmt(result.agentsNeeded, 1) },
    { label: "Annual Cost", value: fmtMoney(result.annualCost) },
    { label: "Overhead Load", value: fmt(num(inputs.overheadLoad)) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Average Handle Time Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Average Handle Time Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="aht-time" label="Average Handle Time" value={inputs.handleTime} onChange={set("handleTime")} suffix="min" />
              <NumInput id="aht-acw" label="After-Call Work" value={inputs.afterCallWork} onChange={set("afterCallWork")} suffix="min" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="aht-calls" label="Calls per Day" value={inputs.callsPerDay} onChange={set("callsPerDay")} suffix="calls" />
              <NumInput id="aht-days" label="Working Days per Month" value={inputs.workdaysPerMonth} onChange={set("workdaysPerMonth")} suffix="days" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="aht-agents" label="Number of Agents" value={inputs.numAgents} onChange={set("numAgents")} suffix="agents" />
              <NumInput id="aht-rate" label="Agent Hourly Cost" value={inputs.hourlyCost} onChange={set("hourlyCost")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cost & Capacity</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="aht-overhead" label="Overhead Load" value={inputs.overheadLoad} onChange={set("overheadLoad")} suffix="%" />
                    <NumInput id="aht-shrinkage" label="Shrinkage Rate" value={inputs.shrinkageRate} onChange={set("shrinkageRate")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; working days must be greater than zero; shrinkage must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Monthly Handle Time Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.monthlyCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerCall)} per call across {fmt(Math.round(num(inputs.callsPerDay) * num(inputs.workdaysPerMonth)))} monthly calls</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Call</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerCall)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Agents Needed</span>
                <span className="font-extrabold text-amber-600">{fmt(result.agentsNeeded, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.annualCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Average Handle Time Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An average handle time cost calculator converts a support team's call durations into a real monthly dollar figure. Average handle time is the minutes an agent spends on a call, and after-call work adds the follow-up time spent writing notes, updating records, and closing the ticket. Every one of those minutes carries the fully loaded cost of the agent — salary plus benefits, payroll taxes, facilities, and management overhead — so a small reduction in handle time produces a surprisingly large saving across thousands of calls. In the default scenario, 8 minutes of total work per call across 500 daily calls and 22 working days adds up to 1,467 hours a month. At a $25 hourly rate loaded to $32.50 with 30% overhead, that is $47,667 a month, or over $572,000 a year — and that is before counting the cost of the team being understaffed, which the agents-needed figure exposes. This calculator makes the case that call center efficiency is not a soft metric; it is a hard line on the P&L.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Minutes per call is the handle time plus after-call work. Total monthly minutes multiply that by the daily call volume and the working days per month, and dividing by 60 gives total agent hours. The fully loaded cost per hour is the agent's base rate multiplied by one plus the overhead load percentage, which captures the benefits and support costs that make an hour of agent time cost more than the paycheck. Monthly cost is total hours times the loaded rate, cost per call divides it by monthly call volume, and the annual figure is the monthly cost times twelve. The staffing side of the model computes how many agents the current volume actually requires: each agent has 8 hours per day, 22 days a month, but the shrinkage rate subtracts the share of paid time spent in meetings, training, breaks, and away-from-desk activities. With the defaults, each agent has 7,920 available minutes a month, and the 88,000 total call minutes require 11.1 agents — meaning a team of 10 is already 11% under capacity, which shows up in hold times and abandon rates long before it shows up in the budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The monthly cost is what the current call volume costs at current efficiency. The cost per call is the number to benchmark against industry averages, which typically run between $5 and $15 for phone support depending on complexity. The agents-needed figure is the operational insight: if it exceeds your actual headcount, the team is borrowing capacity through overtime, hold queues, and abandoned calls, all of which carry their own hidden costs. The highest-leverage levers, in order, are usually shrinkage (reduce meeting and break time), after-call work (improve the CRM and note templates), and handle time itself (better scripts and knowledge bases). A one-minute reduction in total work per call saves roughly $6,000 a month in the default scenario, which is the arithmetic to present when arguing for knowledge management investment. Re-run the model after any process change, and track cost per call quarterly to confirm the improvement is holding.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/average-handle-time-cost-calculator" />
        </div>
      </div>
    </>
  );
}