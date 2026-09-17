"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, max }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} max={max} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
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

interface Inputs { verbalRaw: string; quantRaw: string; writing: string; }

interface Result {
  vScaled: number;
  qScaled: number;
  total: number;
  writing: number;
  vPercentile: string;
  qPercentile: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { verbalRaw: "15", quantRaw: "20", writing: "4.0" };

function calculate(inputs: Inputs): Result {
  const vRaw = Math.min(27, Math.max(0, parseFloat(inputs.verbalRaw) || 0));
  const qRaw = Math.min(27, Math.max(0, parseFloat(inputs.quantRaw) || 0));
  const writing = Math.min(6, Math.max(0, parseFloat(inputs.writing) || 0));
  // Linear approximation of ETS raw-to-scaled conversion for the shorter GRE (130-170 per section)
  const vScaled = Math.min(170, Math.max(130, Math.round(130 + (vRaw / 27) * 40)));
  const qScaled = Math.min(170, Math.max(130, Math.round(130 + (qRaw / 27) * 40)));
  const total = vScaled + qScaled;
  const vPercentile = vScaled >= 165 ? "96th" : vScaled >= 155 ? "65th" : "Below 50th";
  const qPercentile = qScaled >= 165 ? "80th" : qScaled >= 160 ? "66th" : "Below 50th";
  return {
    vScaled,
    qScaled,
    total,
    writing,
    vPercentile,
    qPercentile,
    chart: [
      { name: "Verbal", value: vScaled },
      { name: "Quant", value: qScaled },
    ],
  };
}

const GREScoreCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.verbalRaw) < 0 || num(inputs.verbalRaw) > 27 || num(inputs.quantRaw) < 0 || num(inputs.quantRaw) > 27 || num(inputs.writing) < 0 || num(inputs.writing) > 6;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Verbal Raw (0-27)", value: fmt(num(inputs.verbalRaw)) },
    { label: "Quant Raw (0-27)", value: fmt(num(inputs.quantRaw)) },
    { label: "Verbal Scaled (130-170)", value: fmt(result.vScaled) },
    { label: "Quant Scaled (130-170)", value: fmt(result.qScaled) },
    { label: "Analytical Writing (0-6)", value: result.writing.toFixed(1) },
    { label: "Estimated Total GRE Score (260-340)", value: fmt(result.total), total: true },
  ];

  const faqs = [
    { question: "How is the GRE scored?", answer: "The GRE General Test reports Verbal Reasoning (130-170), Quantitative Reasoning (130-170), and Analytical Writing (0-6 in half-point increments). Raw correct answers convert to scaled scores via equating, and the shorter format introduced in September 2023 uses the same 130-170 scale." },
    { question: "What is a good GRE score?", answer: "A total around 300 is near the average for many programs, 310-315 is strong for most master's degrees, and 320+ is competitive for top-tier PhD and business school programs. Target scores depend on your field and school." },
    { question: "Is the GRE adaptive?", answer: "Yes — the GRE is section-level adaptive. The difficulty of the second Verbal and Quant sections depends on your first-section performance. This calculator uses a linear estimate from total raw correct answers; the actual scaled score can differ by a few points." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "GRE Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GRE Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Reasoning Sections</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="verbalRaw" label="Verbal Raw (0-27)" value={inputs.verbalRaw} onChange={set("verbalRaw")} min="0" max="27" />
              <NumInput id="quantRaw" label="Quant Raw (0-27)" value={inputs.quantRaw} onChange={set("quantRaw")} min="0" max="27" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Analytical Writing</div>
            <div>
              <SelectInput id="writing" label="Writing Score (0-6)" value={inputs.writing} onChange={set("writing")} options={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].map(v => ({ value: v.toFixed(1), label: v.toFixed(1) }))} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Raw scores must be within 0-27 and writing within 0-6.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Estimated Total GRE Score</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.total)}</div>
              <div className="text-sm text-muted-foreground font-medium">Verbal + Quantitative (260-340)</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Verbal</span>
                <span className="font-extrabold text-primary">{fmt(result.vScaled)}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{result.vPercentile}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quantitative</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.qScaled)}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{result.qPercentile}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Writing</span>
                <span className="font-extrabold text-foreground">{result.writing.toFixed(1)}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">/ 6.0</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Score Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.total ? "text-primary" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.total ? "text-primary" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Scaled Section Scores (130-170)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[130, 170]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Scaled Score"]} />
                  <ReferenceLine y={155} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "65th percentile", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Verbal Raw", value: fmt(num(inputs.verbalRaw)) + " / 27" },
                  { label: "Quant Raw", value: fmt(num(inputs.quantRaw)) + " / 27" },
                  { label: "Verbal Scaled", value: fmt(result.vScaled), bold: true },
                  { label: "Quant Scaled", value: fmt(result.qScaled), bold: true },
                  { label: "Writing Score", value: result.writing.toFixed(1) },
                  { label: "Total GRE Score", value: fmt(result.total), bold: true },
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
            <h2 className="text-2xl font-bold mb-3">Understanding GRE Scoring</h2>
            <p>With the defaults (15/27 Verbal raw, 20/27 Quant raw, 4.0 writing), the estimate is 152 Verbal + 160 Quant = <strong>312 total</strong>. That lands Verbal near the 65th percentile and Quant near the 66th percentile — a solid result for most master's programs.</p>
            <h2 className="text-2xl font-bold mb-3">The Shorter GRE</h2>
            <p>Since September 2023 the GRE is under two hours with fewer questions per section, so each correct answer moves your scaled score more than on the old test. This calculator applies a linear approximation of the conversion — treat it as an estimate within a few points of the official equated score.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gre-score-calculator" />
          <PopularCalculators exclude="/calculator/gre-score-calculator" />
        </div>
      </div>
    </>
  );
};
export default GREScoreCalculator;
