"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  complianceStaff: string;
  staffSalary: string;
  consultingCost: string;
  trainingHours: string;
  trainingRate: string;
  auditCost: string;
  softwareCost: string;
  penaltiesPct: string;
  finesReserve: string;
}

interface Result {
  staffCost: number;
  trainingCost: number;
  subtotal: number;
  penaltyRisk: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  complianceStaff: "3",
  staffSalary: "85000",
  consultingCost: "40000",
  trainingHours: "400",
  trainingRate: "45",
  auditCost: "30000",
  softwareCost: "25000",
  penaltiesPct: "15",
  finesReserve: "50000",
};

function calculate(inputs: Inputs): Result {
  const complianceStaff = Math.max(0, parseFloat(inputs.complianceStaff) || 0);
  const staffSalary = Math.max(0, parseFloat(inputs.staffSalary) || 0);
  const consultingCost = Math.max(0, parseFloat(inputs.consultingCost) || 0);
  const trainingHours = Math.max(0, parseFloat(inputs.trainingHours) || 0);
  const trainingRate = Math.max(0, parseFloat(inputs.trainingRate) || 0);
  const auditCost = Math.max(0, parseFloat(inputs.auditCost) || 0);
  const softwareCost = Math.max(0, parseFloat(inputs.softwareCost) || 0);
  const penaltiesPct = Math.min(100, Math.max(0, parseFloat(inputs.penaltiesPct) || 0));
  const finesReserve = Math.max(0, parseFloat(inputs.finesReserve) || 0);

  const staffCost = complianceStaff * staffSalary;
  const trainingCost = trainingHours * trainingRate;
  const subtotal = staffCost + consultingCost + trainingCost + auditCost + softwareCost;
  const penaltyRisk = finesReserve * (penaltiesPct / 100);
  const totalCost = subtotal + penaltyRisk;
  const costPerEmployee = complianceStaff > 0 ? totalCost / complianceStaff : 0;

  return { staffCost, trainingCost, subtotal, penaltyRisk, totalCost, costPerEmployee };
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

export default function RegulatoryCostImpactCalculator() {
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
    num(inputs.complianceStaff) < 0 ||
    num(inputs.staffSalary) < 0 ||
    num(inputs.consultingCost) < 0 ||
    num(inputs.trainingHours) < 0 ||
    num(inputs.trainingRate) < 0 ||
    num(inputs.auditCost) < 0 ||
    num(inputs.softwareCost) < 0 ||
    num(inputs.penaltiesPct) < 0 || num(inputs.penaltiesPct) > 100 ||
    num(inputs.finesReserve) < 0;

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
    { label: `Compliance Staff (${fmt(num(inputs.complianceStaff))} × ${fmtMoney(num(inputs.staffSalary))})`, value: fmtMoney(result.staffCost) },
    { label: "External Consulting & Counsel", value: fmtMoney(num(inputs.consultingCost)) },
    { label: `Staff Training (${fmt(num(inputs.trainingHours))} hrs × ${fmtMoney(num(inputs.trainingRate))})`, value: fmtMoney(result.trainingCost) },
    { label: "Audits & Assessments", value: fmtMoney(num(inputs.auditCost)) },
    { label: "Compliance Software & Tools", value: fmtMoney(num(inputs.softwareCost)) },
    { label: "Direct Compliance Subtotal", value: fmtMoney(result.subtotal) },
    { label: `Expected Fines & Penalties (${fmt(num(inputs.penaltiesPct), 1)}% of ${fmtMoney(num(inputs.finesReserve))})`, value: fmtMoney(result.penaltyRisk) },
    { label: "Total Regulatory Cost Impact", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Compliance Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Compliance Staff", value: fmt(num(inputs.complianceStaff)) },
    { label: "Staff Cost", value: fmtMoney(result.staffCost) },
    { label: "Consulting & Counsel", value: fmtMoney(num(inputs.consultingCost)) },
    { label: "Training Cost", value: fmtMoney(result.trainingCost) },
    { label: "Audits & Assessments", value: fmtMoney(num(inputs.auditCost)) },
    { label: "Compliance Software", value: fmtMoney(num(inputs.softwareCost)) },
    { label: "Direct Subtotal", value: fmtMoney(result.subtotal) },
    { label: "Fines & Penalties Reserve", value: fmtMoney(num(inputs.finesReserve)) },
    { label: "Penalty Risk", value: fmtMoney(result.penaltyRisk) },
    { label: "Total Cost Impact", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Compliance Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Penalty Probability", value: fmt(num(inputs.penaltiesPct), 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Regulatory Cost Impact Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Regulatory Cost Impact Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rc-staff" label="Compliance Staff" value={inputs.complianceStaff} onChange={set("complianceStaff")} suffix="people" />
              <NumInput id="rc-salary" label="Avg Compliance Salary" value={inputs.staffSalary} onChange={set("staffSalary")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rc-consulting" label="Consulting & Counsel" value={inputs.consultingCost} onChange={set("consultingCost")} prefix="$" />
              <NumInput id="rc-training" label="Training Hours" value={inputs.trainingHours} onChange={set("trainingHours")} suffix="hrs/yr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Training & Assurance</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rc-training-rate" label="Training Cost / Hour" value={inputs.trainingRate} onChange={set("trainingRate")} prefix="$" />
                    <NumInput id="rc-audit" label="Audits & Assessments" value={inputs.auditCost} onChange={set("auditCost")} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Tools & Penalty Risk</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rc-software" label="Compliance Software" value={inputs.softwareCost} onChange={set("softwareCost")} prefix="$" />
                    <NumInput id="rc-penalties" label="Penalty Probability" value={inputs.penaltiesPct} onChange={set("penaltiesPct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="rc-fines" label="Potential Fines Exposure" value={inputs.finesReserve} onChange={set("finesReserve")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and penalty probability between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Regulatory Cost Impact</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.subtotal)} direct compliance cost — {fmtMoney(result.penaltyRisk)} expected penalty exposure</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Staff Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.staffCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Direct Subtotal</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.subtotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Compliance EE</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Regulatory Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Regulatory Cost Impact Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A regulatory cost impact calculator estimates the total annual cost of regulatory compliance for a business. Compliance is an operating expense that rarely appears as a single budget line: it is spread across the staff who manage it, the lawyers and consultants who interpret it, the training that keeps employees current, the audits that verify it, and the software that automates it. On top of these direct costs sits penalty risk, because non-compliance carries fines that are a probability-weighted expense rather than a certainty. Regulations also impose indirect costs such as slower processes and documentation burdens, but the direct costs alone are substantial, frequently exceeding 1% of revenue at mid-size companies. This calculator assembles the direct compliance program, adds the expected value of fines and penalties, and reports the total impact and the cost per compliance employee.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The staff and consulting lines capture the human cost of compliance, and the split between them matters for planning: in-house staff provide continuity and institutional knowledge, while external counsel and consultants bring specialty expertise that is cheaper to buy per engagement than to maintain in payroll. The training line reflects the recurring nature of regulatory education, since rules change, staff turn over, and annual refresher requirements are common, and the training hours input should include both initial and recurring training across the affected workforce rather than just the compliance team. The audit line covers the assessments that verify the program, including internal audits, external certifications, and regulator inspections, and the software line captures the tools that automate monitoring, reporting, and documentation. The expected penalty line multiplies the fines exposure by the probability of a fine, which is the risk-adjusted way to compare the cost of compliance against the cost of non-compliance, and it is the figure that justifies spending on controls that reduce either the probability or the exposure.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of compliance staff, their average salary, the external consulting and counsel cost, and the annual training hours. The staff cost multiplies the headcount by the salary, and the training cost multiplies the training hours by the hourly training rate, which with the default inputs produces $255,000 of staff cost and $18,000 of training cost across 400 hours at $45 an hour. The advanced options add the hourly training rate, the audits and assessments cost, the compliance software cost, the penalty probability, and the potential fines exposure. The direct subtotal sums the staff, consulting, training, audit, and software costs, and the expected penalty risk multiplies the fines exposure by the penalty probability. The total cost adds the expected penalties to the direct subtotal, and the cost per compliance employee divides the total by the compliance headcount, showing the fully loaded cost of the compliance function.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total regulatory cost impact is the number to budget and to track against industry benchmarks for your sector, since compliance cost intensity varies enormously by industry. The expected penalty line is the risk-adjusted figure, and it is the metric that justifies compliance investment: spending on controls that reduce either the probability or the exposure of fines is directly comparable against this number. The staff cost is usually the largest line, and it is also the most flexible, since automation and external specialists can shift the mix. A low cost per compliance employee may signal efficiency, or it may signal under-investment in a high-risk industry, so interpret it alongside the penalty probability. Re-run the calculator when regulations change, since new rules typically add training, audit, and software costs in the first year.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="regulatory-cost-impact-calculator" />
        </div>
      </div>
    </>
  );
}