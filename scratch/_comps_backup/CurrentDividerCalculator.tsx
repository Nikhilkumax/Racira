"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Zap } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DividerResult {
  is: number;
  r1: number;
  r2: number;
  i1: number;
  i2: number;
  voltage: number;
  chartData: { name: string; value: number }[];
}

function calcDivider(is: number, r1: number, r2: number): DividerResult {
  const total = r1 + r2;
  const i1 = (is * r2) / total;
  const i2 = (is * r1) / total;
  const voltage = is * ((r1 * r2) / total);
  const chartData = [
    { name: "Through R1", value: i1 },
    { name: "Through R2", value: i2 },
  ];
  return { is, r1, r2, i1, i2, voltage, chartData };
}

const DEFAULTS = { is: "1", r1: "100", r2: "300" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "What is the current divider rule?", answer: "In a parallel circuit, the source current splits inversely to resistance: the branch with the smaller resistance carries the larger share. For two resistors, I1 = Is × R2 ÷ (R1 + R2) and I2 = Is × R1 ÷ (R1 + R2)." },
  { question: "Why does the smaller resistor carry more current?", answer: "Each branch sees the same voltage. By Ohm's law (I = V/R), the branch with lower resistance draws a proportionally larger current — hence current divides inversely with resistance." },
  { question: "How do I check the result?", answer: "The two branch currents must sum to the source current (Kirchhoff's current law). The calculator verifies this: I1 + I2 = Is always." },
];

export default function CurrentDividerCalculator() {
  const [is, setIs] = useState(DEFAULTS.is);
  const [r1, setR1] = useState(DEFAULTS.r1);
  const [r2, setR2] = useState(DEFAULTS.r2);
  const [result, setResult] = useState<DividerResult>(() => calcDivider(1, 100, 300));

  useEffect(() => {
    const i = parseFloat(is);
    const a = parseFloat(r1);
    const b = parseFloat(r2);
    if (!isNaN(i) && !isNaN(a) && !isNaN(b) && a > 0 && b > 0 && i >= 0) setResult(calcDivider(i, a, b));
  }, []);

  const reset = () => { setIs(DEFAULTS.is); setR1(DEFAULTS.r1); setR2(DEFAULTS.r2); setResult(calcDivider(parseFloat(DEFAULTS.is), parseFloat(DEFAULTS.r1), parseFloat(DEFAULTS.r2))); };
  const invalid = isNaN(parseFloat(is)) || isNaN(parseFloat(r1)) || isNaN(parseFloat(r2)) || parseFloat(r1) <= 0 || parseFloat(r2) <= 0 || parseFloat(is) < 0;

  const breakdown = [
    { label: "Source Current (Is)", value: `${result.is.toFixed(3)} A` },
    { label: "Resistor R1", value: `${result.r1.toLocaleString()} Ω` },
    { label: "Resistor R2", value: `${result.r2.toLocaleString()} Ω` },
    { label: "Current Through R1", value: `${result.i1.toFixed(3)} A`, highlight: true },
    { label: "Current Through R2", value: `${result.i2.toFixed(3)} A` },
    { label: "Voltage Across Pair", value: `${result.voltage.toFixed(3)} V` },
    { label: "Check (I1 + I2)", value: `${(result.i1 + result.i2).toFixed(3)} A = Is ✓` },
  ];

  const summaryStats = [
    { label: "Current Through R1", value: `${result.i1.toFixed(3)} A` },
    { label: "Current Through R2", value: `${result.i2.toFixed(3)} A` },
    { label: "Source Current", value: `${result.is.toFixed(3)} A` },
    { label: "R1 Share", value: `${((result.i1 / (result.is || 1)) * 100).toFixed(1)}%` },
    { label: "R2 Share", value: `${((result.i2 / (result.is || 1)) * 100).toFixed(1)}%` },
    { label: "Voltage Across Pair", value: `${result.voltage.toFixed(3)} V` },
  ];

  const totalPct = result.is > 0 ? 100 : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Current Divider Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Current Divider Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cd-is" className="block text-sm font-medium mb-1 text-foreground">Source Current (A)</label>
              <input id="cd-is" type="number" min="0" step="0.1" value={is} onChange={(e) => setIs(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cd-r1" className="block text-sm font-medium mb-1 text-foreground">Resistor R1 (Ω)</label>
                <input id="cd-r1" type="number" min="1" value={r1} onChange={(e) => setR1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cd-r2" className="block text-sm font-medium mb-1 text-foreground">Resistor R2 (Ω)</label>
                <input id="cd-r2" type="number" min="1" value={r2} onChange={(e) => setR2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative source current and positive resistances.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Current Through R1</div>
              <div className="text-4xl font-extrabold text-primary">{result.i1.toFixed(3)} A</div>
              <div className="text-sm text-muted-foreground mt-1">{((result.i1 / (result.is || 1)) * 100).toFixed(1)}% of the {result.is.toFixed(2)} A source · R1 = {result.r1.toLocaleString()} Ω</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Through R2</div>
                <div className="text-lg font-bold text-primary">{result.i2.toFixed(3)} A</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Voltage Across</div>
                <div className="text-lg font-bold text-primary">{result.voltage.toFixed(3)} V</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">R1 Share</div>
                <div className="text-lg font-bold text-primary">{((result.i1 / (result.is || 1)) * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
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
              <h3 className="text-base font-bold mb-3">Current Split</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(3)} A (${((v / (result.is || 1)) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Split sums to {totalPct.toFixed(0)}% of source current</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Current Divider Calculator</h2>
            <p>The current divider rule finds the current in each branch of a parallel circuit without solving the full network. For two parallel resistors, I1 = Is × R2 ÷ (R1 + R2). The voltage across the pair is V = Is × (R1·R2 ÷ (R1 + R2)), the equivalent parallel resistance times the source current.</p>
            <h3>Why Current Divides Inversely</h3>
            <p>Because every branch shares the same voltage, Ohm's law dictates that lower resistance draws more current. Doubling R1 while holding R2 fixed shifts a larger share of the source current into R2 — the divider is exactly the resistance ratio inverted.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/current-divider-calculator" />
          <PopularCalculators exclude="/calculator/current-divider-calculator" />
        </div>
      </div>
    </>
  );
}
