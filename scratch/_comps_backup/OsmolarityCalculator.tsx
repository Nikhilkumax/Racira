"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OsmResult {
  osmolarity: number;
  naTerm: number;
  gluTerm: number;
  bunTerm: number;
  gap: number | null;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 1): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcOsm(na: number, glucose: number, bun: number, measured: number | null): OsmResult {
  const naTerm = 2 * na;
  const gluTerm = glucose / 18;
  const bunTerm = bun / 2.8;
  const osmolarity = naTerm + gluTerm + bunTerm;
  const gap = measured !== null ? measured - osmolarity : null;
  const breakdown = [
    { label: "Sodium (Na⁺)", value: `${fmt(na)} mmol/L` },
    { label: "Glucose", value: `${fmt(glucose)} mg/dL` },
    { label: "BUN", value: `${fmt(bun)} mg/dL` },
    { label: "2 × Na⁺", value: `${fmt(naTerm)} mmol/L` },
    { label: "Glucose ÷ 18", value: `${fmt(gluTerm)} mmol/L` },
    { label: "BUN ÷ 2.8", value: `${fmt(bunTerm)} mmol/L` },
    { label: "Calculated Osmolarity", value: `${fmt(osmolarity)} mOsm/L` },
    ...(gap !== null ? [
      { label: "Measured Osmolarity", value: `${fmt(measured!)} mOsm/L` },
      { label: "Osmolar Gap (measured − calc)", value: `${fmt(gap)} mOsm/L` },
    ] : []),
  ];
  const summaryStats = [
    { label: "Osmolarity", value: `${fmt(osmolarity)} mOsm/L` },
    { label: "Normal Range", value: "275–295 mOsm/L" },
    { label: "2×Na + Glu/18 + BUN/2.8", value: `${fmt(osmolarity)}` },
    ...(gap !== null ? [{ label: "Osmolar Gap", value: `${fmt(gap)} mOsm/L` }] : []),
  ];
  const chartData = [
    { name: "2 × Na⁺", value: Number(naTerm.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Glucose/18", value: Number(gluTerm.toFixed(1)), fill: "#f59e0b" },
    { name: "BUN/2.8", value: Number(bunTerm.toFixed(1)), fill: "#10b981" },
    { name: "Total", value: Number(osmolarity.toFixed(1)), fill: "#8b5cf6" },
  ];
  return { osmolarity, naTerm, gluTerm, bunTerm, gap, breakdown, summaryStats, chartData };
}

const DEFAULTS = { na: "140", glucose: "100", bun: "14", measured: "" };

export default function OsmolarityCalculator() {
  const [na, setNa] = useState(DEFAULTS.na);
  const [glucose, setGlucose] = useState(DEFAULTS.glucose);
  const [bun, setBun] = useState(DEFAULTS.bun);
  const [measured, setMeasured] = useState(DEFAULTS.measured);
  const [result, setResult] = useState<OsmResult | null>(null);

  const naNum = parseFloat(na);
  const gNum = parseFloat(glucose);
  const bNum = parseFloat(bun);
  const mNum = measured.trim() === "" ? null : parseFloat(measured);
  const errs: string[] = [];
  if (isNaN(naNum) || naNum < 0) errs.push("Sodium must be 0 or greater.");
  if (isNaN(gNum) || gNum < 0) errs.push("Glucose must be 0 or greater.");
  if (isNaN(bNum) || bNum < 0) errs.push("BUN must be 0 or greater.");
  if (mNum !== null && (isNaN(mNum) || mNum <= 0)) errs.push("Measured osmolarity must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOsm(naNum, gNum, bNum, mNum)); };
  const reset = () => {
    setNa(DEFAULTS.na); setGlucose(DEFAULTS.glucose); setBun(DEFAULTS.bun); setMeasured(DEFAULTS.measured);
    setResult(calcOsm(140, 100, 14, null));
  };
  useEffect(() => { setResult(calcOsm(140, 100, 14, null)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is osmolarity?", answer: "The number of osmotically active particles per liter of solution — for serum, roughly 2 × sodium plus glucose and BUN contributions. It estimates how concentrated the blood is, a key input in fluid and electrolyte management." },
    { question: "What is the formula?", answer: "Osmolarity ≈ 2 × Na⁺ + glucose/18 + BUN/2.8, in mOsm/L, with glucose and BUN in mg/dL. Normal serum osmolarity is 275–295 mOsm/L; high values suggest dehydration or hyperglycemia." },
    { question: "What is the osmolar gap?", answer: "The difference between measured and calculated osmolarity. A gap over ~10 mOsm/L hints at unmeasured solutes — ethanol, methanol, ethylene glycol — which is why the gap matters in toxicology workups." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Osmolarity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Osmolarity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Sodium (mmol/L)</label>
                <input type="number" value={na} onChange={e => setNa(e.target.value)} className={inp} placeholder="140" />
              </div>
              <div>
                <label className={lbl}>Glucose (mg/dL)</label>
                <input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} className={inp} placeholder="100" />
              </div>
              <div>
                <label className={lbl}>BUN (mg/dL)</label>
                <input type="number" value={bun} onChange={e => setBun(e.target.value)} className={inp} placeholder="14" />
              </div>
              <div className="col-span-3">
                <label className={lbl}>Measured Osmolarity (mOsm/L) — optional, for the osmolar gap</label>
                <input type="number" value={measured} onChange={e => setMeasured(e.target.value)} className={inp} placeholder="Leave blank" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Calculated Osmolarity</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.osmolarity)} mOsm/L</div>
                <div className="text-sm text-muted-foreground mt-1">Normal 275–295 · {result.gap !== null ? `gap ${fmt(result.gap)} mOsm/L` : "2 × 140 + 100/18 + 14/2.8"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["2 × Na⁺", `${fmt(result.naTerm)}`], ["Glucose/18", `${fmt(result.gluTerm)}`], ["BUN/2.8", `${fmt(result.bunTerm)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Component Contributions</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v) + " mOsm/L", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Sodium dominates — glucose and BUN are divided by 18 and 2.8</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Concentration of Your Blood</h2>
            <p><strong>Osmolarity</strong> measures solute particles per liter of serum — the number that guides intravenous fluids, hydration assessment, and electrolyte management. This <strong>osmolarity calculator</strong> applies the standard clinical formula to your lab values.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>Osmolarity ≈ 2 × Na⁺ + glucose/18 + BUN/2.8. Sodium is doubled because its counter-ions contribute equally; glucose and BUN are divided to convert mg/dL into mmol/L. The result lands in the normal band of 275–295 mOsm/L for healthy patients.</p>
            <h2 className="text-2xl font-bold mb-3">The Osmolar Gap</h2>
            <p>Enter a measured osmolarity and the calculator reports the gap. A gap above ~10 mOsm/L signals unmeasured osmotically active substances — the classic screening clue for methanol, ethylene glycol, or other alcohol poisonings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/osmolarity-calculator" />
          <PopularCalculators exclude="/calculator/osmolarity-calculator" />
        </div>
      </div>
    </>
  );
}
