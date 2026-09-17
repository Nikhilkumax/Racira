"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { total: string; recycled: string; composted: string; reused: string; }

interface Result {
  diverted: number;
  landfilled: number;
  rate: number;
  recycledPct: number;
  compostedPct: number;
  reusedPct: number;
  landfilledPct: number;
  label: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { total: "1000", recycled: "300", composted: "150", reused: "50" };

function calculate(inputs: Inputs): Result | null {
  const total = Math.max(0, parseFloat(inputs.total) || 0);
  const recycled = Math.max(0, parseFloat(inputs.recycled) || 0);
  const composted = Math.max(0, parseFloat(inputs.composted) || 0);
  const reused = Math.max(0, parseFloat(inputs.reused) || 0);
  const diverted = recycled + composted + reused;
  if (total <= 0 || diverted > total) return null;
  const rate = (diverted / total) * 100;
  const label = rate >= 90 ? "Zero Waste Achieved" : rate >= 50 ? "Good Progress" : "Needs Improvement";
  return {
    diverted,
    landfilled: total - diverted,
    rate,
    recycledPct: (recycled / total) * 100,
    compostedPct: (composted / total) * 100,
    reusedPct: (reused / total) * 100,
    landfilledPct: ((total - diverted) / total) * 100,
    label,
    chart: [
      { name: "Recycled", value: Math.round(recycled) },
      { name: "Composted", value: Math.round(composted) },
      { name: "Reused", value: Math.round(reused) },
      { name: "Landfilled", value: Math.round(total - diverted) },
    ],
  };
}

const WasteDiversionCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const overError = num(inputs.recycled) + num(inputs.composted) + num(inputs.reused) > num(inputs.total);
  const hasErrors = num(inputs.total) < 0 || num(inputs.recycled) < 0 || num(inputs.composted) < 0 || num(inputs.reused) < 0 || overError || num(inputs.total) === 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Total Waste Generated", value: fmt(num(inputs.total)) },
    { label: "Recycled", value: fmt(num(inputs.recycled)) + " (" + fmt(r.recycledPct, 1) + "%)" },
    { label: "Composted", value: fmt(num(inputs.composted)) + " (" + fmt(r.compostedPct, 1) + "%)" },
    { label: "Reused / Donated", value: fmt(num(inputs.reused)) + " (" + fmt(r.reusedPct, 1) + "%)" },
    { label: "Total Diverted", value: fmt(r.diverted), highlight: true },
    { label: "Landfilled", value: fmt(r.landfilled) + " (" + fmt(r.landfilledPct, 1) + "%)" },
    { label: "Diversion Rate", value: fmt(r.rate, 1) + "%", total: true },
  ] : [];

  const faqs = [
    { question: "What is a waste diversion rate?", answer: "It's the percentage of total waste generated that is kept out of landfills and incinerators through recycling, composting, or reuse: (recycled + composted + reused) ÷ total × 100." },
    { question: "What is a 'good' diversion rate?", answer: "About 50% is solid for an eco-conscious business or municipality. 90% or higher qualifies as 'Zero Waste' under most international certifications like TRUE or Zero Waste International Alliance." },
    { question: "How can I improve my diversion rate?", answer: "Color-coded bin systems, regular waste audits to catch what's mis-thrown, and switching to compostable or recyclable packaging are the three highest-impact changes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Waste Diversion Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Waste Diversion Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Waste Data (lbs or kg)</div>
            <div>
              <NumInput id="total" label="Total Waste Generated" value={inputs.total} onChange={set("total")} min="0" hint="Include everything: trash, recycling, and compost." />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Diverted Streams</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="recycled" label="Recycled" value={inputs.recycled} onChange={set("recycled")} min="0" />
              <NumInput id="composted" label="Composted" value={inputs.composted} onChange={set("composted")} min="0" />
            </div>
            <div>
              <NumInput id="reused" label="Reused / Donated" value={inputs.reused} onChange={set("reused")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">{overError ? "Diverted streams cannot exceed total waste generated." : "Total must be > 0 and all values ≥ 0."}</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Waste Diversion Rate</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.rate, 1)}<span className="text-2xl">%</span></div>
                  <div className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{r.label}</span> · {fmt(r.diverted)} of {fmt(num(inputs.total))} diverted</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Diverted</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.diverted)}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{fmt(100 - r.landfilledPct, 1)}% of total</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Landfilled</span>
                    <span className="font-extrabold text-red-500">{fmt(r.landfilled)}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{fmt(r.landfilledPct, 1)}% of total</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Streams</span>
                    <span className="font-extrabold text-primary">{num(inputs.recycled) > 0 && num(inputs.composted) > 0 && num(inputs.reused) > 0 ? "3 active" : "Mixed"}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Stream</th>
                        <th className="p-2.5 pr-3 text-right w-[140px]">Amount</th>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Waste Stream Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={r.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value)}`} labelLine={false}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="hsl(var(--secondary))" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Total Waste", value: fmt(num(inputs.total)) },
                      { label: "Diverted", value: fmt(r.diverted), bold: true },
                      { label: "Recycled", value: fmt(r.recycledPct, 1) + "%" },
                      { label: "Composted", value: fmt(r.compostedPct, 1) + "%" },
                      { label: "Reused", value: fmt(r.reusedPct, 1) + "%" },
                      { label: "Diversion Rate", value: fmt(r.rate, 1) + "%", bold: true },
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
            <p>With the defaults (1,000 total; 300 recycled, 150 composted, 50 reused), the diversion rate is <strong>50.0%</strong> — 500 units kept out of the landfill. That earns "Good Progress," halfway to the 90% Zero Waste threshold.</p>
            <h2 className="text-2xl font-bold mb-3">Why Landfills Matter</h2>
            <p>Landfills are a leading source of human-made methane, a greenhouse gas ~25× more potent than CO2, and burying paper, plastic, and metal forces new extraction to replace them. The international Zero Waste standard is 90% diversion; the last 10% is materials with no viable recovery infrastructure yet.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/waste-diversion-calculator" />
          <PopularCalculators exclude="/calculator/waste-diversion-calculator" />
        </div>
      </div>
    </>
  );
};
export default WasteDiversionCalculator;
