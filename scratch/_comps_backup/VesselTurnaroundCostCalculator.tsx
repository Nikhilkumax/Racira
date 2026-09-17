"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

const NumInput = ({ id, label, value, onChange, prefix, suffix, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  portFees: string;
  crewCosts: string;
  cargoHandling: string;
  maintenance: string;
  turnaroundDays: string;
  bunkering: string;
  demurragePerDay: string;
}

interface Result {
  totalCost: number;
  costPerDay: number;
  portFees: number;
  crewCosts: number;
  cargoHandling: number;
  maintenance: number;
  bunkering: number;
  demurrage: number;
}

const DEFAULTS: Inputs = { portFees: "25000", crewCosts: "15000", cargoHandling: "30000", maintenance: "10000", turnaroundDays: "7", bunkering: "8000", demurragePerDay: "2000" };

function calculate(inputs: Inputs): Result {
  const portFees = Math.max(0, parseFloat(inputs.portFees) || 0);
  const crewCosts = Math.max(0, parseFloat(inputs.crewCosts) || 0);
  const cargoHandling = Math.max(0, parseFloat(inputs.cargoHandling) || 0);
  const maintenance = Math.max(0, parseFloat(inputs.maintenance) || 0);
  const turnaroundDays = Math.max(1, parseFloat(inputs.turnaroundDays) || 1);
  const bunkering = Math.max(0, parseFloat(inputs.bunkering) || 0);
  const demurragePerDay = Math.max(0, parseFloat(inputs.demurragePerDay) || 0);
  const demurrage = demurragePerDay * turnaroundDays;
  const totalCost = portFees + crewCosts + cargoHandling + maintenance + bunkering + demurrage;
  return { totalCost, costPerDay: totalCost / turnaroundDays, portFees, crewCosts, cargoHandling, maintenance, bunkering, demurrage };
}

const VesselTurnaroundCostCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.turnaroundDays) <= 0 || num(inputs.portFees) < 0 || num(inputs.crewCosts) < 0 || num(inputs.cargoHandling) < 0 || num(inputs.maintenance) < 0 || num(inputs.bunkering) < 0 || num(inputs.demurragePerDay) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const breakdown = [
    { label: "Port Fees (dues, pilotage, towage)", value: result.portFees },
    { label: "Crew Costs", value: result.crewCosts },
    { label: "Cargo Handling (stevedoring)", value: result.cargoHandling },
    { label: "Maintenance & Repairs", value: result.maintenance },
    { label: "Bunkering & Fuel", value: result.bunkering },
    { label: "Demurrage / Idle Cost", value: result.demurrage, highlight: true },
    { label: "Total Turnaround Cost", value: result.totalCost, total: true },
  ];

  const chartData = [
    { name: "Port Fees", value: result.portFees },
    { name: "Crew", value: result.crewCosts },
    { name: "Cargo", value: result.cargoHandling },
    { name: "Maint.", value: result.maintenance },
    { name: "Bunkering", value: result.bunkering },
    { name: "Demurrage", value: result.demurrage },
  ];

  const faqs = [
    { question: "What is vessel turnaround cost?", answer: "It is the total cost of a ship's time in port — port dues, crew costs, cargo handling (stevedoring), maintenance, bunkering, and any demurrage — divided across the turnaround time. Ports and operators track cost per day to price calls and optimize schedules." },
    { question: "What is turnaround time?", answer: "Turnaround time is the time a vessel spends in port from arrival to departure, including berthing, cargo operations, bunkering, and paperwork. Faster turnaround reduces cost per day because fixed costs are spread over fewer days." },
    { question: "What is demurrage?", answer: "Demurrage is a charge paid when cargo remains at a terminal or a vessel remains at berth longer than the agreed free time. It compensates the terminal or owner for the occupied capacity and can be a major cost driver in congested ports." },
    { question: "How can turnaround costs be reduced?", answer: "Pre-arrival clearance, coordinated stevedoring shifts, on-time documentation, and berthing at the right terminal all shorten the port stay. Reducing turnaround time by one day can save the full daily cost — with the defaults, roughly $14,571 per day." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Vessel Turnaround Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vessel Turnaround Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="port-fees" label="Port Fees" value={inputs.portFees} onChange={set("portFees")} prefix="$" />
              <NumInput id="crew" label="Crew Costs" value={inputs.crewCosts} onChange={set("crewCosts")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cargo" label="Cargo Handling" value={inputs.cargoHandling} onChange={set("cargoHandling")} prefix="$" />
              <NumInput id="maint" label="Maintenance & Repairs" value={inputs.maintenance} onChange={set("maintenance")} prefix="$" />
            </div>
            <div>
              <NumInput id="days" label="Turnaround Time" value={inputs.turnaroundDays} onChange={set("turnaroundDays")} suffix="days" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(o => !o)} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Additional Vessel Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="bunkering" label="Bunkering & Fuel" value={inputs.bunkering} onChange={set("bunkering")} prefix="$" />
                    <NumInput id="demurrage" label="Demurrage / Day" value={inputs.demurragePerDay} onChange={set("demurragePerDay")} prefix="$" />
                  </div>
                </div>
              )}
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Turnaround time must be &gt; 0; all cost fields must be ≥ 0.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost per Turnaround Day</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerDay)}</div>
              <div className="text-sm text-muted-foreground font-medium">Total turnaround cost: <span className="font-bold text-foreground">{fmtMoney(result.totalCost)}</span> over {num(inputs.turnaroundDays)} days</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Turnaround Time</span>
                <span className="font-extrabold text-primary">{num(inputs.turnaroundDays)} days</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Day</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.costPerDay)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{fmtMoney(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Turnaround Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => "$" + fmt(Math.round(v / 1000)) + "k"} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), ""]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Port Fees", value: fmtMoney(result.portFees) },
                  { label: "Crew Costs", value: fmtMoney(result.crewCosts) },
                  { label: "Cargo Handling", value: fmtMoney(result.cargoHandling) },
                  { label: "Maintenance", value: fmtMoney(result.maintenance) },
                  { label: "Bunkering & Fuel", value: fmtMoney(result.bunkering) },
                  { label: "Demurrage / Idle Cost", value: fmtMoney(result.demurrage) },
                  { label: "Total Turnaround Cost", value: fmtMoney(result.totalCost) },
                  { label: "Cost per Day", value: fmtMoney(result.costPerDay), bold: true },
                ].map((s) => (
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Vessel Turnaround Cost Matters</h2>
            <p>A container ship costs far more per day at berth than the visible port dues suggest. Crew, cargo handling, maintenance, bunkering and demurrage all accumulate while the vessel sits in port. With the defaults, a 7-day call costs $102,000 — about $14,571 per day. Shaving one day off the turnaround saves roughly that entire daily amount.</p>
            <p>Terminal operators use the cost-per-day figure to price calls and justify investment in faster cranes and automated gates. Ship operators use it to negotiate berthing windows and to evaluate which ports are worth the schedule delay.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vessel-turnaround-cost-calculator" />
          <PopularCalculators exclude="/calculator/vessel-turnaround-cost-calculator" />
        </div>
      </div>
    </>
  );
};
export default VesselTurnaroundCostCalculator;
