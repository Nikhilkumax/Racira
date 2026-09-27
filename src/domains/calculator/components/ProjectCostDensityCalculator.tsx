"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  totalCost: string;
  totalLinesOfCode: string;
  totalWorkItems: string;
  totalDocs: string;
  totalHours: string;
  totalDeliverables: string;
}

interface Result {
  costPerLoc: number;
  costPerWorkItem: number;
  costPerDoc: number;
  costPerHour: number;
  costPerDeliverable: number;
  avgDensity: number;
}

const DEFAULTS: Inputs = {
  totalCost: "500000",
  totalLinesOfCode: "85000",
  totalWorkItems: "420",
  totalDocs: "35",
  totalHours: "6200",
  totalDeliverables: "48",
};

function calculate(inputs: Inputs): Result {
  const totalCost = Math.max(0, parseFloat(inputs.totalCost) || 0);
  const totalLinesOfCode = Math.max(0, parseFloat(inputs.totalLinesOfCode) || 0);
  const totalWorkItems = Math.max(0, parseFloat(inputs.totalWorkItems) || 0);
  const totalDocs = Math.max(0, parseFloat(inputs.totalDocs) || 0);
  const totalHours = Math.max(0, parseFloat(inputs.totalHours) || 0);
  const totalDeliverables = Math.max(0, parseFloat(inputs.totalDeliverables) || 0);

  const costPerLoc = totalLinesOfCode > 0 ? totalCost / totalLinesOfCode : 0;
  const costPerWorkItem = totalWorkItems > 0 ? totalCost / totalWorkItems : 0;
  const costPerDoc = totalDocs > 0 ? totalCost / totalDocs : 0;
  const costPerHour = totalHours > 0 ? totalCost / totalHours : 0;
  const costPerDeliverable = totalDeliverables > 0 ? totalCost / totalDeliverables : 0;
  const densities = [costPerLoc > 0 ? costPerLoc : null, costPerWorkItem > 0 ? costPerWorkItem : null, costPerDoc > 0 ? costPerDoc : null, costPerHour > 0 ? costPerHour : null, costPerDeliverable > 0 ? costPerDeliverable : null].filter((d): d is number => d !== null);
  const avgDensity = densities.length > 0 ? densities.reduce((a, b) => a + b, 0) / densities.length : 0;

  return { costPerLoc, costPerWorkItem, costPerDoc, costPerHour, costPerDeliverable, avgDensity };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

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

const ProjectCostDensityCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.totalCost) < 0 || num(inputs.totalLinesOfCode) < 0 ||
    num(inputs.totalWorkItems) < 0 || num(inputs.totalDocs) < 0 ||
    num(inputs.totalHours) < 0 || num(inputs.totalDeliverables) < 0;

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

  const breakdown = [
    { label: "Total Project Cost", value: fmtMoney(num(inputs.totalCost)) },
    { label: "Lines of Code", value: fmt(num(inputs.totalLinesOfCode)) },
    { label: "Cost per Line of Code", value: fmt2(result.costPerLoc) },
    { label: "Work Items", value: fmt(num(inputs.totalWorkItems)) },
    { label: "Cost per Work Item", value: fmt2(result.costPerWorkItem) },
    { label: "Documents", value: fmt(num(inputs.totalDocs)) },
    { label: "Cost per Document", value: fmt2(result.costPerDoc) },
    { label: "Total Hours", value: fmt(num(inputs.totalHours)) },
    { label: "Cost per Hour", value: fmt2(result.costPerHour) },
    { label: "Deliverables", value: fmt(num(inputs.totalDeliverables)) },
    { label: "Cost per Deliverable", value: fmt2(result.costPerDeliverable) },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="total-cost" label="Total Project Cost" value={inputs.totalCost} onChange={set("totalCost")} prefix="$" />
            <NumInput id="total-loc" label="Lines of Code" value={inputs.totalLinesOfCode} onChange={set("totalLinesOfCode")} />
            <NumInput id="total-work-items" label="Work Items" value={inputs.totalWorkItems} onChange={set("totalWorkItems")} />
            <NumInput id="total-docs" label="Documents" value={inputs.totalDocs} onChange={set("totalDocs")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Additional Scope</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="total-hours" label="Total Hours" value={inputs.totalHours} onChange={set("totalHours")} />
                  <NumInput id="total-deliverables" label="Deliverables" value={inputs.totalDeliverables} onChange={set("totalDeliverables")} />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter non-negative values for all fields.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost per Line of Code</div>
            <div className="text-4xl font-bold text-primary">{fmt2(result.costPerLoc)}</div>
            <div className="text-sm text-muted-foreground mt-1">across {fmt(num(inputs.totalLinesOfCode))} lines · {fmtMoney(result.costPerHour)} per hour</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost per Work Item</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.costPerWorkItem)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost per Document</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.costPerDoc)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost per Hour</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt2(result.costPerHour)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Cost Density Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Average Cost Density</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt2(result.avgDensity)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Average Cost Density</div>
                <div className="text-base font-bold text-primary">{fmt2(result.avgDensity)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Project Cost Density?</h2>
            <p className="text-muted-foreground leading-relaxed">Project cost density is the project's total cost divided by a unit of delivered output, revealing how much money each unit of work actually costs. A software project can be measured per line of code, per work item, per document, per hour, or per deliverable — each denominator answers a different question, and each one exposes a different cost structure. Cost density is the key metric for comparing projects of different sizes, benchmarking against industry norms, and spotting where money concentrates. Two projects can have identical total budgets yet very different densities: one might spend heavily on code, the other on documentation and coordination. Knowing the density profile tells management what the project is really paying for.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Cost Density Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Each density figure is simply total project cost divided by the relevant unit count. Cost per line of code divides the budget by the lines delivered; cost per work item divides by the number of tasks, stories, or tickets closed; cost per document divides by the documents produced; cost per hour divides by the total effort hours; and cost per deliverable divides by the completed outputs. Because each denominator is measured in different units, the figures are not directly comparable to each other — a cost per hour of $80 and a cost per line of code of $5.88 describe different things. The average cost density is the mean of the individual densities, which is a convenient summary for trending the same project across periods or for comparing projects that use the same set of denominators. The advanced inputs let you include hours and deliverables in the profile when those are tracked. When comparing projects, always confirm that the denominators are defined identically — one team's line of code may count generated code and tests while another counts only hand-written production code, and one project's work item may be a user story while another's is a bug ticket. The calculator leaves the definitions to you, so document the conventions once and apply them consistently across periods. For organizations that track all five denominators, the average density line is the most stable single number to report to leadership, because it dampens the noise inherent in any one unit of measure.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Use the density profile to diagnose where a project's budget goes. A very high cost per line of code with a low cost per work item suggests small, expensive code changes — possibly heavy documentation, review, or integration overhead per change. A high cost per hour indicates expensive blended team rates or low productivity per hour, while a high cost per document flags process-heavy delivery. Compare your figures across quarters: rising cost per work item with flat team size is an early signal of scope complexity creep or declining velocity. The average density is most useful as a trend line — plot it over several projects to establish your organization's baseline, then investigate any project that diverges sharply, in either direction.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/project-cost-density-calculator" />
      </div>
    </div>
  );
};

export default ProjectCostDensityCalculator;