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

// kg CO2 sequestered per tree per year — Arbor Day Foundation / Ecotree averages
const TREE_RATES: Record<string, number> = { average: 22, tropical: 30, coniferous: 18, deciduous: 24 };
const TREE_LABELS: Record<string, string> = { average: "Mixed Average", tropical: "Tropical", coniferous: "Evergreen", deciduous: "Leafy" };

interface Inputs { target: string; treeType: string; years: string; }

interface Result {
  treesNeeded: number;
  ratePerYear: number;
  totalPerTree: number;
  forestAreaHa: number;
  forestAreaM2: number;
  annualAbsorption: number;
  monthlyAbsorption: number;
  chart: { name: string; value: number; selected: boolean }[];
}

const DEFAULTS: Inputs = { target: "5000", treeType: "average", years: "10" };

function calculate(inputs: Inputs): Result | null {
  const target = Math.max(0, parseFloat(inputs.target) || 0);
  const years = Math.max(0.1, parseFloat(inputs.years) || 0.1);
  const ratePerYear = TREE_RATES[inputs.treeType] ?? 22;
  const totalPerTree = ratePerYear * years;
  const treesNeeded = totalPerTree > 0 ? Math.ceil(target / totalPerTree) : 0;
  const forestAreaM2 = treesNeeded * 10;
  const forestAreaHa = forestAreaM2 / 10000;
  const annualAbsorption = treesNeeded * ratePerYear;
  const monthlyAbsorption = annualAbsorption / 12;
  const chart = Object.entries(TREE_RATES).map(([key, rate]) => ({
    name: TREE_LABELS[key],
    value: Math.round(rate * years * 10) / 10,
    selected: key === inputs.treeType,
  }));
  return { treesNeeded, ratePerYear, totalPerTree, forestAreaHa, forestAreaM2, annualAbsorption, monthlyAbsorption, chart };
}

const TreePlantingOffsetCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.target) < 0 || num(inputs.years) <= 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "CO₂ to Offset", value: fmt(num(inputs.target)) + " kg" },
    { label: "Tree Category", value: TREE_LABELS[inputs.treeType] ?? inputs.treeType },
    { label: "Timeframe", value: fmt(num(inputs.years)) + " years" },
    { label: "Sequestration Rate", value: fmt(r.ratePerYear) + " kg/tree/yr", highlight: true },
    { label: "Per-Tree Capacity", value: fmt(r.totalPerTree) + " kg over " + fmt(num(inputs.years)) + " yrs", highlight: true },
    { label: "Forest Area Required", value: fmt(r.forestAreaHa, 2) + " ha (" + fmt(r.forestAreaM2) + " m²)" },
    { label: "Trees to Plant", value: fmt(r.treesNeeded), total: true },
  ] : [];

  const faqs = [
    { question: "How much CO2 does one tree absorb?", answer: "A mature mixed-forest tree absorbs roughly 22 kg (48 lbs) of CO2 per year — about 30 kg for fast-growing tropical species and 18 kg for evergreens. The rate is lower for young saplings and rises toward maturity." },
    { question: "How many trees make a forest?", answer: "In offset terms, 1,000 trees at ~10 m² spacing cover about 1 hectare and sequester roughly 22 tons of CO2 per year at the average rate." },
    { question: "Can I offset my whole footprint with trees?", answer: "Planting is essential but slow — a sapling can take 10-20 years to reach full absorption. Offsets should complement, not replace, cutting direct emissions first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Tree Planting Offset Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tree Planting Offset Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Offset Target</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="target" label="CO₂ to Offset" value={inputs.target} onChange={set("target")} min="0" suffix="kg" />
              <NumInput id="years" label="Timeframe" value={inputs.years} onChange={set("years")} min="0.1" suffix="yrs" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Tree Type</div>
            <div>
              <SelectInput id="treeType" label="Tree Category" value={inputs.treeType} onChange={set("treeType")} options={[
                { value: "average", label: "Mixed Average (22 kg/yr)" },
                { value: "tropical", label: "Tropical (30 kg/yr)" },
                { value: "coniferous", label: "Evergreen — Pine/Spruce (18 kg/yr)" },
                { value: "deciduous", label: "Leafy — Oak/Maple (24 kg/yr)" },
              ]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Target must be ≥ 0 and timeframe must be greater than 0.</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Trees to Plant</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.treesNeeded)}</div>
                  <div className="text-sm text-muted-foreground font-medium">to offset {fmt(num(inputs.target))} kg over {fmt(num(inputs.years))} years</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Forest Area</span>
                    <span className="font-extrabold text-primary">{fmt(r.forestAreaHa, 2)} ha</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{fmt(r.forestAreaM2)} m²</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Absorption</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.annualAbsorption)} kg/yr</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Progress</span>
                    <span className="font-extrabold text-foreground">{fmt(r.monthlyAbsorption, 1)} kg/mo</span>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Per-Tree Sequestration by Type (kg over {fmt(num(inputs.years))} yrs)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v) + " kg", "Capacity"]} />
                      <Bar dataKey="value" name="kg per tree" radius={[4, 4, 0, 0]}>
                        {r.chart.map((c) => (
                          <Cell key={c.name} fill={c.selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Highlighted bar = your tree type.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Trees to Plant", value: fmt(r.treesNeeded), bold: true },
                      { label: "Rate / Tree", value: fmt(r.ratePerYear) + " kg/yr" },
                      { label: "Per-Tree Total", value: fmt(r.totalPerTree) + " kg" },
                      { label: "Forest Area", value: fmt(r.forestAreaHa, 2) + " ha", bold: true },
                      { label: "Annual Absorption", value: fmt(r.annualAbsorption) + " kg" },
                      { label: "Monthly Progress", value: fmt(r.monthlyAbsorption, 1) + " kg/mo" },
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
            <p>Offsetting <strong>5,000 kg over 10 years</strong> at the average 22 kg/tree/yr rate needs about <strong>23 trees</strong> — roughly 230 m² of new forest, absorbing 506 kg per year. Each tree captures 220 kg over the decade.</p>
            <h2 className="text-2xl font-bold mb-3">The Time Factor</h2>
            <p>Tree planting is a decades-long commitment: saplings take 10-20 years to reach peak absorption. That's why preserving existing mature forests matters more per hectare, and why offsets should come after cutting direct emissions. Diverse native forests beat monoculture plantations for both carbon and wildlife.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tree-planting-offset-calculator" />
          <PopularCalculators exclude="/calculator/tree-planting-offset-calculator" />
        </div>
      </div>
    </>
  );
};
export default TreePlantingOffsetCalculator;
