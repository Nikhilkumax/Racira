"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  setupMinutes: string;
  changeoversPerMonth: string;
  laborRate: string;
  downtimeCost: string;
  scrapPerChangeover: string;
  reworkPerChangeover: string;
}

interface Result {
  setupHours: number;
  laborCost: number;
  downtimeCostPerChangeover: number;
  wastePerChangeover: number;
  costPerChangeover: number;
  monthlyCost: number;
  annualCost: number;
  monthlyDowntimeCost: number;
}

const DEFAULTS: Inputs = {
  setupMinutes: "45",
  changeoversPerMonth: "12",
  laborRate: "28",
  downtimeCost: "450",
  scrapPerChangeover: "150",
  reworkPerChangeover: "100",
};

function calculate(inputs: Inputs): Result {
  const setupMinutes = Math.max(0, parseFloat(inputs.setupMinutes) || 0);
  const changeoversPerMonth = Math.max(0, parseFloat(inputs.changeoversPerMonth) || 0);
  const laborRate = Math.max(0, parseFloat(inputs.laborRate) || 0);
  const downtimeCost = Math.max(0, parseFloat(inputs.downtimeCost) || 0);
  const scrapPerChangeover = Math.max(0, parseFloat(inputs.scrapPerChangeover) || 0);
  const reworkPerChangeover = Math.max(0, parseFloat(inputs.reworkPerChangeover) || 0);

  const setupHours = setupMinutes / 60;
  const laborCost = setupHours * laborRate;
  const downtimeCostPerChangeover = setupHours * downtimeCost;
  const wastePerChangeover = scrapPerChangeover + reworkPerChangeover;
  const costPerChangeover = laborCost + downtimeCostPerChangeover + wastePerChangeover;
  const monthlyCost = costPerChangeover * changeoversPerMonth;
  const annualCost = monthlyCost * 12;
  const monthlyDowntimeCost = downtimeCostPerChangeover * changeoversPerMonth;

  return { setupHours, laborCost, downtimeCostPerChangeover, wastePerChangeover, costPerChangeover, monthlyCost, annualCost, monthlyDowntimeCost };
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

export default function SetupCostCalculator() {
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
    num(inputs.setupMinutes) < 0 ||
    num(inputs.changeoversPerMonth) < 0 ||
    num(inputs.laborRate) < 0 ||
    num(inputs.downtimeCost) < 0 ||
    num(inputs.scrapPerChangeover) < 0 ||
    num(inputs.reworkPerChangeover) < 0;

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
    { label: "Setup Time per Changeover", value: fmt(num(inputs.setupMinutes)) + " min (" + fmt(result.setupHours, 2) + " hrs)" },
    { label: "Changeovers per Month", value: fmt(num(inputs.changeoversPerMonth)) },
    { label: "Setup Labor Cost per Changeover", value: fmtMoney(result.laborCost) },
    { label: "Downtime Cost per Changeover", value: fmtMoney(result.downtimeCostPerChangeover) },
    { label: "Scrap + Rework per Changeover", value: fmtMoney(result.wastePerChangeover) },
    { label: "Cost per Changeover", value: fmtMoney(result.costPerChangeover), total: true },
    { label: "Monthly Setup Cost", value: fmtMoney(result.monthlyCost), highlight: true },
    { label: "Monthly Downtime Cost", value: fmtMoney(result.monthlyDowntimeCost) },
    { label: "Annual Setup Cost", value: fmtMoney(result.annualCost) },
  ];

  const summaryStats = [
    { label: "Setup Time", value: fmt(num(inputs.setupMinutes)) + " min" },
    { label: "Changeovers / Month", value: fmt(num(inputs.changeoversPerMonth)) },
    { label: "Labor Rate", value: "$" + fmt(num(inputs.laborRate), 2) + "/hr" },
    { label: "Downtime Cost", value: "$" + fmt(num(inputs.downtimeCost), 2) + "/hr" },
    { label: "Labor Cost / Changeover", value: fmtMoney(result.laborCost) },
    { label: "Downtime / Changeover", value: fmtMoney(result.downtimeCostPerChangeover) },
    { label: "Cost per Changeover", value: fmtMoney(result.costPerChangeover) },
    { label: "Monthly Setup Cost", value: fmtMoney(result.monthlyCost), bold: true },
    { label: "Annual Setup Cost", value: fmtMoney(result.annualCost) },
    { label: "Monthly Downtime Cost", value: fmtMoney(result.monthlyDowntimeCost) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Setup Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Setup Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="setup-time" label="Setup Time per Changeover" value={inputs.setupMinutes} onChange={set("setupMinutes")} suffix="min" />
              <NumInput id="setup-count" label="Changeovers per Month" value={inputs.changeoversPerMonth} onChange={set("changeoversPerMonth")} suffix="setups" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="setup-labor" label="Labor Rate" value={inputs.laborRate} onChange={set("laborRate")} prefix="$" suffix="/hr" />
              <NumInput id="setup-downtime" label="Production Downtime Cost" value={inputs.downtimeCost} onChange={set("downtimeCost")} prefix="$" suffix="/hr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Setup Waste</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="setup-scrap" label="Scrap per Changeover" value={inputs.scrapPerChangeover} onChange={set("scrapPerChangeover")} prefix="$" />
                    <NumInput id="setup-rework" label="Rework per Changeover" value={inputs.reworkPerChangeover} onChange={set("reworkPerChangeover")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All setup times, costs, and rates must be non-negative values.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Monthly Setup Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.monthlyCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerChangeover)} per changeover across {fmt(num(inputs.changeoversPerMonth))} setups</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Changeover</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerChangeover)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Downtime Cost / Mo</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.monthlyDowntimeCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Setup Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.annualCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Setup Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Setup Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A setup cost calculator measures the full expense of changing over a production line from one product to another. Every time a manufacturer switches a machine or line from producing one item to producing the next, the line stops, staff work on the change, and the first units of the new run often come out imperfect. That combination of labor time, idle production capacity, and startup waste is the setup cost, and it is one of the most controllable costs in manufacturing. Setup cost is also the force that drives batch sizing: when setups are expensive, companies run larger batches to spread the cost, which inflates inventory; when setups are cheap, they can run smaller batches more often, which slashes inventory and improves responsiveness. This tool calculates the cost per changeover and rolls it up to monthly and annual totals, giving production teams the number they need to justify setup reduction programs and to size batches correctly.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The setup time per changeover is the minutes the line is out of production during a change, converted to hours by dividing by sixty. The changeovers per month is how many times the line switches products in a typical month. The labor rate is the hourly cost of the staff performing the changeover, and the production downtime cost is the value of lost production capacity per hour, which for a constrained machine can be far larger than the wage bill. The labor cost per changeover is the setup hours multiplied by the labor rate, and the downtime cost per changeover is the setup hours multiplied by the downtime cost per hour, capturing the profit contribution of the production that did not happen while the line was stopped.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the waste that accompanies most changeovers. The scrap per changeover is the value of the defective startup units discarded, and the rework per changeover is the value of the units that must be corrected before they can ship. Summing labor, downtime, scrap, and rework gives the total cost per changeover, and multiplying by the monthly changeover count gives the monthly setup cost, with the annual figure being twelve times the monthly total. The monthly downtime cost is broken out separately because it is often the largest and least visible component. With the default inputs, a forty-five minute setup with a $28 labor rate and a $450 per hour downtime cost, plus $250 of scrap and rework, costs about $609 per changeover, and across twelve changeovers a month that is roughly $7,300 monthly and $87,600 a year.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the monthly setup cost, and the breakdown identifies which component to attack first. On most lines, the downtime cost dominates, which means reducing setup time by even a few minutes is worth far more than the labor saved, and the annual figure shows what a single minute of setup reduction is worth across the year. Setup reduction follows a well-established playbook: move internal setup steps, which require the machine to stop, to external steps that can be done while the machine runs, standardize tools and fixtures, and use quick-change methods. Every minute of setup time removed cuts both the labor and the downtime cost, and it also permits smaller, more frequent batches, which lowers inventory holding cost and improves delivery flexibility. Re-run the calculator after each improvement initiative to document the savings, and use the cost per changeover to justify the investment in better tooling and training.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/setup-cost-calculator" />
        </div>
      </div>
    </>
  );
}