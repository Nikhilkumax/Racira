"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Gauge } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EfficiencyResult {
  output: number;
  input: number;
  efficiency: number;
  wasted: number;
  lossPct: number;
  ratio: number;
  chartData: { name: string; value: number }[];
}

function calcEfficiency(output: number, input: number): EfficiencyResult {
  const efficiency = input > 0 ? (output / input) * 100 : 0;
  const wasted = Math.max(0, input - output);
  const lossPct = input > 0 ? (wasted / input) * 100 : 0;
  const ratio = output / input;
  const chartData = [
    { name: "Useful Output", value: output },
    { name: "Wasted Energy", value: wasted },
  ];
  return { output, input, efficiency, wasted, lossPct, ratio, chartData };
}

const DEFAULTS = { output: "800", input: "1000" };

const COLORS = ["hsl(var(--primary))", "hsl(0 72% 51%)"];

const faqs = [
  { question: "What is efficiency?", answer: "Efficiency is the fraction of input energy converted into useful output: η = output ÷ input × 100. The rest is lost, mostly as heat. An 80% efficient motor turns 20% of its electricity into heat." },
  { question: "Why can't efficiency exceed 100%?", answer: "Conservation of energy: you cannot get more useful energy out than went in. Output above input indicates measurement error or energy drawn from a second source (like a battery or solar input) not counted in the input." },
  { question: "What are typical efficiencies?", answer: "LED bulbs ~90%+, electric motors 85–95%, gasoline engines 25–35%, power plants 33–45%, human muscle ~25%. The rest is always lost as heat, sound, or friction." },
];

export default function EfficiencyCalculator() {
  const [output, setOutput] = useState(DEFAULTS.output);
  const [input, setInput] = useState(DEFAULTS.input);
  const [result, setResult] = useState<EfficiencyResult>(() => calcEfficiency(800, 1000));

  useEffect(() => {
    const o = parseFloat(output);
    const i = parseFloat(input);
    if (!isNaN(o) && !isNaN(i) && o >= 0 && i > 0) setResult(calcEfficiency(o, i));
  }, [output, input]);

  const reset = () => { setOutput(DEFAULTS.output); setInput(DEFAULTS.input); };
  const invalid = isNaN(parseFloat(output)) || isNaN(parseFloat(input)) || parseFloat(output) < 0 || parseFloat(input) <= 0;

  const breakdown = [
    { label: "Useful Output Energy", value: `${result.output.toLocaleString()} J` },
    { label: "Total Input Energy", value: `${result.input.toLocaleString()} J` },
    { label: "Efficiency", value: `${result.efficiency.toFixed(1)}%`, highlight: true },
    { label: "Wasted Energy", value: `${result.wasted.toLocaleString()} J` },
    { label: "Energy Loss", value: `${result.lossPct.toFixed(1)}%` },
    { label: "Output / Input Ratio", value: `${result.ratio.toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "Efficiency", value: `${result.efficiency.toFixed(1)}%` },
    { label: "Useful Output", value: `${result.output.toLocaleString()} J` },
    { label: "Input Energy", value: `${result.input.toLocaleString()} J` },
    { label: "Wasted", value: `${result.wasted.toLocaleString()} J` },
    { label: "Loss", value: `${result.lossPct.toFixed(1)}%` },
    { label: "Grade", value: result.efficiency >= 90 ? "Excellent" : result.efficiency >= 70 ? "Good" : result.efficiency >= 40 ? "Fair" : "Poor" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Efficiency Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Efficiency Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="ef-out" className="block text-sm font-medium mb-1 text-foreground">Useful Output Energy (J)</label>
              <input id="ef-out" type="number" min="0" step="10" value={output} onChange={(e) => setOutput(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="ef-in" className="block text-sm font-medium mb-1 text-foreground">Total Input Energy (J)</label>
              <input id="ef-in" type="number" min="0.1" step="10" value={input} onChange={(e) => setInput(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Gauge className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative output and a positive input.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Efficiency</div>
              <div className="text-4xl font-extrabold text-primary">{result.efficiency.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{result.output.toLocaleString()} J out of {result.input.toLocaleString()} J in · {result.wasted.toLocaleString()} J wasted</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Wasted Energy</div>
                <div className="text-lg font-bold text-primary">{result.wasted.toLocaleString()} J</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Energy Loss</div>
                <div className="text-lg font-bold text-primary">{result.lossPct.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ratio</div>
                <div className="text-lg font-bold text-primary">{result.ratio.toFixed(3)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Where the Energy Goes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} J (${((v / result.input) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Output + wasted = input ({result.input.toLocaleString()} J)</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Efficiency Calculator</h2>
            <p>Efficiency compares useful work to total energy supplied: η = output ÷ input. The difference between the two — energy that cannot be recovered — is almost always lost as heat. For 800 J of useful work from 1000 J of input, efficiency is 80% and 200 J are wasted.</p>
            <h3>Efficiency in Context</h3>
            <p>Engineering decisions hinge on this ratio: replacing a 30%-efficient gasoline engine with an 85% electric motor cuts energy use by more than half. But efficiency is a system property — motors, drivetrains, and charging multiply together, so each stage must be efficient for the total to be.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/efficiency-calculator" />
          <PopularCalculators exclude="/calculator/efficiency-calculator" />
        </div>
      </div>
    </>
  );
}
