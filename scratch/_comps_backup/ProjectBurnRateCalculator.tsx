"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface ProjectBurnInputs {
  budget: number;
  spent: number;
  elapsedMonths: number;
  plannedMonths: number;
  contingencyPct: number;
}

interface ProjectBurnResult {
  actualBurn: number;
  plannedBurn: number;
  consumedPct: number;
  projectedFinal: number;
  variance: number;
  variancePct: number;
  status: "Over Budget" | "On Track" | "Under Budget";
  adjustedBudget: number;
  chartData: { month: number; planned: number; actual: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcProjectBurn(inputs: ProjectBurnInputs): ProjectBurnResult {
  const actualBurn = inputs.elapsedMonths > 0 ? inputs.spent / inputs.elapsedMonths : 0;
  const plannedBurn = inputs.plannedMonths > 0 ? inputs.budget / inputs.plannedMonths : 0;
  const consumedPct = inputs.budget > 0 ? (inputs.spent / inputs.budget) * 100 : 0;
  const projectedFinal = actualBurn * inputs.plannedMonths;
  const variance = projectedFinal - inputs.budget;
  const variancePct = inputs.budget > 0 ? (variance / inputs.budget) * 100 : 0;
  const status: ProjectBurnResult["status"] = variance > inputs.budget * 0.05 ? "Over Budget" : variance < -inputs.budget * 0.05 ? "Under Budget" : "On Track";
  const adjustedBudget = inputs.budget * (1 + inputs.contingencyPct / 100);

  const chartData: { month: number; planned: number; actual: number }[] = [];
  for (let m = 0; m <= inputs.plannedMonths; m++) {
    const planned = (inputs.budget / inputs.plannedMonths) * m;
    const actual = m <= inputs.elapsedMonths ? (inputs.spent / inputs.elapsedMonths) * m : (inputs.spent / inputs.elapsedMonths) * inputs.elapsedMonths + actualBurn * (m - inputs.elapsedMonths);
    chartData.push({ month: m, planned: Math.round(planned), actual: Math.round(actual) });
  }

  const breakdown = [
    { label: "Total Project Budget", value: `$${inputs.budget.toLocaleString()}` },
    { label: "Amount Spent to Date", value: `$${inputs.spent.toLocaleString()}` },
    { label: "Months Elapsed", value: `${inputs.elapsedMonths} months` },
    { label: "Planned Duration", value: `${inputs.plannedMonths} months` },
    { label: "Actual Burn Rate", value: `$${actualBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`, highlight: true },
    { label: "Planned Burn Rate", value: `$${plannedBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Budget Consumed", value: `${consumedPct.toFixed(1)}%` },
    { label: "Projected Final Cost", value: `$${projectedFinal.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, highlight: true },
    { label: "Variance vs Budget", value: `${variance >= 0 ? "+" : ""}$${variance.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%)` },
    { label: "Status", value: status, highlight: true },
  ];

  const summaryStats = [
    { label: "Actual Burn Rate", value: `$${actualBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Planned Burn Rate", value: `$${plannedBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Budget Consumed", value: `${consumedPct.toFixed(1)}%` },
    { label: "Projected Final Cost", value: `$${projectedFinal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Variance", value: `${variance >= 0 ? "+" : ""}$${variance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Status", value: status },
  ];

  return { actualBurn, plannedBurn, consumedPct, projectedFinal, variance, variancePct, status, adjustedBudget, chartData, breakdown, summaryStats };
}

const DEFAULTS: ProjectBurnInputs = { budget: 100000, spent: 40000, elapsedMonths: 4, plannedMonths: 10, contingencyPct: 10 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">Month {label}</p>
    {payload.map((p: any, i: number) => (
      <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: ${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
    ))}
  </div>
) : null;

export default function ProjectBurnRateCalculator() {
  const [budget, setBudget] = useState("100000");
  const [spent, setSpent] = useState("40000");
  const [elapsedMonths, setElapsedMonths] = useState("4");
  const [plannedMonths, setPlannedMonths] = useState("10");
  const [contingencyPct, setContingencyPct] = useState("10");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ProjectBurnResult | null>(null);

  const calculate = () =>
    setResult(calcProjectBurn({
      budget: parseFloat(budget) || 0,
      spent: parseFloat(spent) || 0,
      elapsedMonths: parseFloat(elapsedMonths) || 0,
      plannedMonths: parseFloat(plannedMonths) || 0,
      contingencyPct: parseFloat(contingencyPct) || 0,
    }));
  const reset = () => { setBudget(DEFAULTS.budget.toString()); setSpent(DEFAULTS.spent.toString()); setElapsedMonths(DEFAULTS.elapsedMonths.toString()); setPlannedMonths(DEFAULTS.plannedMonths.toString()); setContingencyPct(DEFAULTS.contingencyPct.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const varianceColor = result ? (result.variance > 0 ? "text-red-500" : result.variance < 0 ? "text-emerald-600" : "text-amber-500") : "";

  const faqs = [
    { question: "What is project burn rate?", answer: "Project burn rate is how fast a project consumes its budget — the dollars spent per month. It is calculated by dividing the amount spent to date by the months elapsed, then compared against the planned burn rate (budget ÷ planned duration) to spot over- or under-spending early." },
    { question: "What is a healthy project burn rate?", answer: "The ideal is a burn rate at or slightly below plan with a healthy burn-down curve. If actual burn exceeds planned burn for two consecutive reporting periods, the project will likely exceed budget unless scope or pace is adjusted." },
    { question: "How do I fix an over-burning project?", answer: "Re-sequence work, cut scope, add staff temporarily to compress the timeline, or negotiate for additional contingency funding. The calculator's projected final cost tells you how bad the overrun will be if current pace holds — the number to bring to a steering committee." },
    { question: "What is the difference from startup burn rate?", answer: "Startup burn measures cash depletion of a company against its balance sheet. Project burn measures budget consumption of a single initiative with a defined end date. The metric is the same idea — rate of spend — but the denominator is a project budget, not company cash." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Project Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Project Burn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="budget" label="Total Project Budget" value={budget} onChange={setBudget} prefix="$" />
              <CompactInput id="spent" label="Amount Spent to Date" value={spent} onChange={setSpent} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="elapsed" label="Months Elapsed" value={elapsedMonths} onChange={setElapsedMonths} suffix="mo" />
              <CompactInput id="planned" label="Planned Duration" value={plannedMonths} onChange={setPlannedMonths} suffix="mo" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Budget Planning</label>
                    <CompactInput id="contingency" label="Contingency Reserve" value={contingencyPct} onChange={setContingencyPct} suffix="%" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Projected Final Cost</div>
                <div className={`text-4xl font-extrabold mb-1 tracking-tight ${varianceColor}`}>${result.projectedFinal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground font-medium">{result.status} — {result.variance >= 0 ? "+" : ""}${result.variance.toLocaleString("en-US", { maximumFractionDigits: 0 })} vs ${budget} budget</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Actual Burn Rate", `$${result.actualBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`], ["Planned Burn Rate", `$${result.plannedBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`], ["Budget Consumed", `${result.consumedPct.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cumulative Spend vs Plan</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="planned" name="Planned" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    <Line type="monotone" dataKey="actual" name="Actual / Projected" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Measuring Budget Consumption</h2>
            <p>Project burn rate answers one question: are we spending money faster than planned? The math is straightforward — actual spend divided by elapsed time versus budget divided by planned duration. This <strong>project burn rate calculator</strong> turns those two rates into a projected final cost and an early overrun warning.</p>
            <h2 className="text-2xl font-bold mb-3">The 5% Rule of Thumb</h2>
            <p>Tracking is simpler when you set tolerance: a projected overrun within 5% of budget is normal noise, while anything beyond it needs a formal variance response. The calculator flags On Track, Over Budget, or Under Budget using that 5% band around your approved budget.</p>
            <h2 className="text-2xl font-bold mb-3">Contingency Discipline</h2>
            <p>Projects typically reserve 5–15% of budget as contingency. The calculator's advanced setting shows your adjusted budget ceiling — the number you can spend before the project officially exceeds its authorized envelope. Using contingency early is the most common project-finance mistake; track it explicitly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/project-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/project-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
