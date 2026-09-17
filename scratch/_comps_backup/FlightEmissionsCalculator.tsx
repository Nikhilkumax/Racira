"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

const CLASS_MULT: Record<string, number> = { economy: 1, premium_economy: 1.5, business: 2.9, first: 4.0 };
const CLASS_LABELS: Record<string, string> = { economy: "Economy", premium_economy: "Premium Economy", business: "Business", first: "First" };
const RFI = 1.9;

interface Inputs { distance: string; passengers: string; cabin: string; roundTrip: boolean; }

interface Result {
  baseKg: number;
  totalKg: number;
  tons: number;
  perPersonKg: number;
  treesNeeded: number;
  drivingMiles: number;
  factor: number;
  chart: { name: string; value: number; selected: boolean }[];
}

const DEFAULTS: Inputs = { distance: "1000", passengers: "1", cabin: "economy", roundTrip: true };

function calculate(inputs: Inputs): Result | null {
  const dist = Math.max(0, parseFloat(inputs.distance) || 0);
  const pax = Math.max(0, parseFloat(inputs.passengers) || 0);
  if (pax === 0 && dist === 0) return null;
  let baseFactor = 0.15;
  if (dist > 0 && dist < 300) baseFactor = 0.25;
  else if (dist > 1500) baseFactor = 0.12;
  const mult = CLASS_MULT[inputs.cabin] ?? 1;
  const baseKg = dist * baseFactor * mult * pax;
  const totalKg = baseKg * RFI * (inputs.roundTrip ? 2 : 1);
  const tons = totalKg / 1000;
  const perPersonKg = pax > 0 ? totalKg / pax : 0;
  const treesNeeded = Math.ceil(totalKg / 20);
  const drivingMiles = totalKg / 0.4;
  const chart = Object.keys(CLASS_MULT).map((key) => ({
    name: CLASS_LABELS[key],
    value: Math.round(dist * baseFactor * CLASS_MULT[key] * pax * RFI * (inputs.roundTrip ? 2 : 1)),
    selected: key === inputs.cabin,
  }));
  return { baseKg, totalKg, tons, perPersonKg, treesNeeded, drivingMiles, factor: baseFactor, chart };
}

const FlightEmissionsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.distance) < 0 || num(inputs.passengers) < 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Flight Distance (one-way)", value: fmt(num(inputs.distance)) + " miles" },
    { label: "Passengers", value: fmt(num(inputs.passengers)) },
    { label: "Cabin Class", value: CLASS_LABELS[inputs.cabin] ?? inputs.cabin },
    { label: "Trip Type", value: inputs.roundTrip ? "Round Trip" : "One Way" },
    { label: "Emissions Factor", value: fmt(r.factor, 2) + " kg/mi + RFI 1.9" },
    { label: "Total CO2e (with RFI)", value: fmt(r.totalKg) + " kg (" + fmt(r.tons, 2) + " t)", highlight: true },
    { label: "Trees Needed to Offset", value: fmt(r.treesNeeded) + " trees", total: true },
  ] : [];

  const faqs = [
    { question: "Why is business class more polluting?", answer: "Business and first-class seats occupy much more cabin space, so fewer passengers fit per flight. Emissions per passenger are roughly 1.5-4× economy depending on class and aircraft layout." },
    { question: "What are 'non-CO2' effects in aviation?", answer: "Planes emit nitrogen oxides and create contrails at altitude, which warm the climate beyond the CO2 alone. The Radiative Forcing Index (RFI) of ~1.9-2.5 captures this — this calculator uses 1.9." },
    { question: "Is one long flight better than two short ones?", answer: "Usually yes. Takeoff and landing are the most fuel-intensive phases, so a non-stop flight covering the same distance with one takeoff is cleaner than a connection — and short flights are also assigned a higher per-mile factor." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Flight Emissions Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flight Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Flight Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="distance" label="Distance (one-way)" value={inputs.distance} onChange={set("distance")} min="0" suffix="miles" />
              <NumInput id="passengers" label="Passengers" value={inputs.passengers} onChange={set("passengers")} min="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="cabin" label="Cabin Class" value={inputs.cabin} onChange={set("cabin")} options={[
                { value: "economy", label: "Economy" },
                { value: "premium_economy", label: "Premium Economy" },
                { value: "business", label: "Business Class" },
                { value: "first", label: "First Class" },
              ]} />
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Trip Type</label>
                <div className="flex items-center gap-2.5 h-10 rounded-md border border-input bg-background px-3 shadow-sm">
                  <button type="button" onClick={() => setInputs(prev => ({ ...prev, roundTrip: true }))} className={`flex-1 h-7 rounded text-sm font-semibold transition-colors ${inputs.roundTrip ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Round Trip</button>
                  <button type="button" onClick={() => setInputs(prev => ({ ...prev, roundTrip: false }))} className={`flex-1 h-7 rounded text-sm font-semibold transition-colors ${!inputs.roundTrip ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>One Way</button>
                </div>
              </div>
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Distance and passengers must be ≥ 0.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Trip CO2e (with RFI)</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.totalKg)} <span className="text-2xl">kg</span></div>
                  <div className="text-sm text-muted-foreground font-medium">{fmt(r.tons, 2)} metric tons · <span className="font-bold text-foreground">{fmt(r.treesNeeded)} trees</span> to offset for a year</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Person</span>
                    <span className="font-extrabold text-primary">{fmt(r.perPersonKg)} kg</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (no RFI)</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.baseKg)} kg</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Driving Equivalent</span>
                    <span className="font-extrabold text-foreground">{fmt(r.drivingMiles)} miles</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.map((row) => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Emissions by Cabin Class (kg CO2e, same flight)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v) + " kg", "CO2e"]} />
                      <Bar dataKey="value" name="CO2e (kg)" radius={[4, 4, 0, 0]}>
                        {r.chart.map((c) => (
                          <Cell key={c.name} fill={c.selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Highlighted bar = your cabin class.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Distance", value: fmt(num(inputs.distance)) + " mi (one-way)" },
                      { label: "Trip Type", value: inputs.roundTrip ? "Round Trip" : "One Way" },
                      { label: "Per Person", value: fmt(r.perPersonKg) + " kg", bold: true },
                      { label: "Total CO2e", value: fmt(r.totalKg) + " kg", bold: true },
                      { label: "Tons CO2e", value: fmt(r.tons, 2) + " t" },
                      { label: "Driving Equivalent", value: fmt(r.drivingMiles) + " miles" },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                        <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>A <strong>1,000-mile round-trip economy flight for one person</strong> emits about 570 kg CO2e after the 1.9 RFI — equal to driving 1,425 miles in an average car, and needing 29 trees to offset for a year. The same flight in first class emits over 1,100 kg.</p>
            <h2 className="text-2xl font-bold mb-3">Factors Behind the Numbers</h2>
            <p>Per-mile factors rise for short hops (0.25 kg/mi — takeoff-heavy) and fall for long-haul cruise (0.12 kg/mi). Cabin multipliers (economy 1, premium 1.5, business 2.9, first 4.0) reflect space per passenger. The RFI of 1.9 accounts for contrails and nitrogen oxides at altitude.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flight-emissions-calculator" />
          <PopularCalculators exclude="/calculator/flight-emissions-calculator" />
        </div>
      </div>
    </>
  );
};
export default FlightEmissionsCalculator;
