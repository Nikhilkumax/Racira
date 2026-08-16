"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BufferResult {
  ph: number;
  pKa: number;
  ratio: number;
  acidConc: number;
  baseConc: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBuffer(pKa: number, acidConc: number, baseConc: number): BufferResult {
  const acid = Math.max(0.0000001, acidConc);
  const base = Math.max(0.0000001, baseConc);
  const ratio = base / acid;
  const ph = pKa + Math.log10(ratio);

  return {
    ph,
    pKa,
    ratio,
    acidConc: acid,
    baseConc: base,
    chartData: [
      { name: "Acid", value: acid },
      { name: "Conjugate Base", value: base },
    ],
    breakdown: [
      { label: "Acid Dissociation Constant (pKa)", value: `${pKa.toFixed(2)}` },
      { label: "Weak Acid Concentration", value: `${acidConc.toFixed(3)} M` },
      { label: "Conjugate Base Concentration", value: `${baseConc.toFixed(3)} M` },
      { label: "Base / Acid Ratio", value: ratio.toFixed(3) },
      { label: "log₁₀(Ratio)", value: Math.log10(ratio).toFixed(3) },
      { label: "Buffer pH", value: ph.toFixed(2) },
      { label: "Buffering Region", value: Math.abs(ph - pKa) <= 1 ? "Effective (±1 of pKa)" : "Outside effective range" },
    ],
    summaryStats: [
      { label: "pH", value: ph.toFixed(2) },
      { label: "pKa", value: pKa.toFixed(2) },
      { label: "Ratio [Base]/[Acid]", value: ratio.toFixed(2) },
      { label: "[Acid]", value: `${acid.toFixed(3)} M` },
      { label: "[Base]", value: `${base.toFixed(3)} M` },
      { label: "H⁺ Concentration", value: `${(Math.pow(10, -ph)).toExponential(2)} M` },
    ],
  };
}

const DEFAULTS = { pKa: "4.76", acid: "0.10", base: "0.10" };

export default function BufferSolutionCalculator() {
  const [pKa, setPKa] = useState(DEFAULTS.pKa);
  const [acid, setAcid] = useState(DEFAULTS.acid);
  const [base, setBase] = useState(DEFAULTS.base);
  const [result, setResult] = useState<BufferResult>(() => calcBuffer(4.76, 0.10, 0.10));

  const calculate = () => setResult(calcBuffer(parseFloat(pKa) || 0, parseFloat(acid) || 0, parseFloat(base) || 0));
  const reset = () => { setPKa(DEFAULTS.pKa); setAcid(DEFAULTS.acid); setBase(DEFAULTS.base); setResult(calcBuffer(4.76, 0.10, 0.10)); };
  useEffect(() => { setResult(calcBuffer(4.76, 0.10, 0.10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a buffer solution?", answer: "A buffer is a solution of a weak acid and its conjugate base (or a weak base and its conjugate acid) that resists pH changes when small amounts of acid or base are added. Blood, cell cytoplasm, and most biochemical assays depend on buffers." },
    { question: "What is the Henderson-Hasselbalch equation?", answer: "pH = pKa + log₁₀([Base]/[Acid]). It relates the pH of a buffer to the acid's pKa and the ratio of conjugate base to acid concentrations. It is most accurate when the ratio is between 0.1 and 10." },
    { question: "What is pKa?", answer: "pKa is the negative logarithm of the acid dissociation constant. At pH = pKa, the acid and conjugate base concentrations are equal — the buffer is at its maximum capacity. Acetic acid has pKa 4.76; phosphoric acid pKa 2.15; carbonic acid pKa 6.35." },
    { question: "When is a buffer most effective?", answer: "Buffers work best within one pH unit of the acid's pKa (ratio between 0.1 and 10). Outside that range the ratio term dominates and the solution barely resists change." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Buffer Solution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Buffer Solution Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Acid pKa</label>
              <div className={inp}><input type="number" value={pKa} onChange={e => setPKa(e.target.value)} className={ci} step={0.01} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weak Acid Concentration</label>
                <div className={inp}><input type="number" value={acid} onChange={e => setAcid(e.target.value)} className={ci} min={0} step={0.01} /><span className="pr-3 text-muted-foreground text-sm">M</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Conjugate Base Concentration</label>
                <div className={inp}><input type="number" value={base} onChange={e => setBase(e.target.value)} className={ci} min={0} step={0.01} /><span className="pr-3 text-muted-foreground text-sm">M</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Buffer pH</div>
              <div className="text-4xl font-extrabold text-primary">{result.ph.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">pH = pKa + log₁₀([Base]/[Acid]) = {result.pKa.toFixed(2)} + {Math.log10(result.ratio).toFixed(3)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["pKa", result.pKa.toFixed(2)], ["Ratio B/A", result.ratio.toFixed(2)], ["H⁺ Conc", Math.pow(10, -result.ph).toExponential(2)]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Buffer Composition</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Acid vs Conjugate Base Concentration</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(3)} M`, "Concentration"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={70}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Buffer Solution?</h2>
            <p>A <strong>buffer solution calculator</strong> uses the Henderson-Hasselbalch equation to compute the pH of a buffer made from a weak acid and its conjugate base. Buffers resist pH change — when you add acid, the conjugate base neutralizes it; when you add base, the weak acid neutralizes it. That stability is why buffers regulate blood pH, maintain enzyme activity, and calibrate laboratory assays.</p>
            <h2 className="text-2xl font-bold mb-3">The Henderson-Hasselbalch Equation</h2>
            <p>pH = pKa + log₁₀([conjugate base] ÷ [weak acid]). The pKa is a property of the acid; the ratio is set by how you prepare the solution. When the two concentrations are equal the ratio is 1, the log term is 0, and pH equals pKa — the point of maximum buffering.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Buffer</h2>
            <p>Pick an acid whose pKa sits within one unit of your target pH. Acetic acid (pKa 4.76) buffers around pH 4–5.6; phosphoric acid's first proton (pKa 2.15) and second (pKa 7.20) cover acidic and neutral ranges; carbonic acid (pKa 6.35) buffers near blood pH. The closer the target pH is to the pKa, the stronger the buffer.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/buffer-solution-calculator" />
          <PopularCalculators exclude="/calculator/buffer-solution-calculator" />
        </div>
      </div>
    </>
  );
}
