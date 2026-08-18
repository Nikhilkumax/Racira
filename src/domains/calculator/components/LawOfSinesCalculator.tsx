"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SinesResult {
  mode: string;
  solutions: number;
  a: number; b: number; c: number;
  A: number; B: number; C: number;
  area: number;
  perimeter: number;
  note: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function solveSines(mode: string, x1: number, x2: number, x3: number): SinesResult {
  let a = 0, b = 0, c = 0, A = 0, B = 0, C = 0, area = 0, solutions = 1, note = "";
  if (mode === "AAS") {
    // angles A, B and side a
    [A, B, a] = [x1, x2, x3];
    C = 180 - A - B;
    const k = a / Math.sin((A * Math.PI) / 180);
    b = k * Math.sin((B * Math.PI) / 180);
    c = k * Math.sin((C * Math.PI) / 180);
  } else if (mode === "ASA") {
    // angles A, C and side b (side between them)
    [A, C, b] = [x1, x2, x3];
    B = 180 - A - C;
    const k = b / Math.sin((B * Math.PI) / 180);
    a = k * Math.sin((A * Math.PI) / 180);
    c = k * Math.sin((C * Math.PI) / 180);
  } else {
    // SSA: sides a, b with angle A opposite side a
    [a, b, A] = [x1, x2, x3];
    const sinB = (b * Math.sin((A * Math.PI) / 180)) / a;
    const h = b * Math.sin((A * Math.PI) / 180);
    if (sinB > 1.0000001) {
      note = "No triangle exists — side a is shorter than the altitude from C, so no angle B satisfies the law of sines.";
      solutions = 0;
    } else if (Math.abs(a - h) < 1e-9) {
      B = 90;
      C = 180 - A - B;
      const k = a / Math.sin((A * Math.PI) / 180);
      c = k * Math.sin((C * Math.PI) / 180);
      note = "Exactly one solution — side a equals the altitude, so angle B is a right angle.";
    } else if (a < b) {
      // ambiguous: two solutions
      const B1 = (Math.asin(Math.max(-1, Math.min(1, sinB))) * 180) / Math.PI;
      const B2 = 180 - B1;
      const C1 = 180 - A - B1;
      const C2 = 180 - A - B2;
      const k = a / Math.sin((A * Math.PI) / 180);
      const c1 = k * Math.sin((C1 * Math.PI) / 180);
      const c2 = k * Math.sin((C2 * Math.PI) / 180);
      note = `Ambiguous case — two valid triangles: B₁ = ${fmt(B1)}°, C₁ = ${fmt(C1)}°, c₁ = ${fmt(c1)} and B₂ = ${fmt(B2)}°, C₂ = ${fmt(C2)}°, c₂ = ${fmt(c2)}.`;
      B = B1; C = C1; c = c1;
      solutions = 2;
    } else {
      B = (Math.asin(Math.max(-1, Math.min(1, sinB))) * 180) / Math.PI;
      C = 180 - A - B;
      const k = a / Math.sin((A * Math.PI) / 180);
      c = k * Math.sin((C * Math.PI) / 180);
      note = "Exactly one solution — side a is at least as long as side b.";
    }
  }
  if (solutions > 0) {
    area = 0.5 * a * b * Math.sin((C * Math.PI) / 180);
    if (Math.abs(area) < 1e-9) area = 0.5 * a * c * Math.sin((B * Math.PI) / 180);
  }
  const perimeter = a + b + c;
  const breakdown = [
    { label: "Side a (opposite A)", value: fmt(a) },
    { label: "Side b (opposite B)", value: fmt(b) },
    { label: "Side c (opposite C)", value: fmt(c) },
    { label: "Angle A", value: `${fmt(A)}°` },
    { label: "Angle B", value: `${fmt(B)}°` },
    { label: "Angle C", value: `${fmt(C)}°` },
    { label: "Area", value: fmt(area) },
    { label: "Perimeter", value: fmt(perimeter) },
    { label: "Solutions", value: `${solutions}` },
  ];
  const summaryStats = [
    { label: "Area", value: fmt(area) },
    { label: "Perimeter", value: fmt(perimeter) },
    { label: "Angle Sum", value: `${fmt(A + B + C)}°` },
    { label: "Solutions", value: `${solutions}` },
    { label: "Side Ratio a/sin A", value: fmt(a / Math.sin((A * Math.PI) / 180) || 0) },
    { label: "Side b", value: fmt(b) },
    { label: "Side c", value: fmt(c) },
    { label: "Mode", value: mode },
  ];
  const chartData = solutions > 0 ? [
    { name: "Angle A", value: Number(A.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Angle B", value: Number(B.toFixed(2)), fill: "#8b5cf6" },
    { name: "Angle C", value: Number(C.toFixed(2)), fill: "#f59e0b" },
  ] : [];
  return { mode, solutions, a, b, c, A, B, C, area, perimeter, note, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "AAS", s1: "50", s2: "65", s3: "10" };

export default function LawOfSinesCalculator() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [s1, setS1] = useState(DEFAULTS.s1);
  const [s2, setS2] = useState(DEFAULTS.s2);
  const [s3, setS3] = useState(DEFAULTS.s3);
  const [result, setResult] = useState<SinesResult | null>(null);

  const v1 = parseFloat(s1) || 0;
  const v2 = parseFloat(s2) || 0;
  const v3 = parseFloat(s3) || 0;
  const errs: string[] = [];
  if (v1 <= 0 || v2 <= 0 || v3 <= 0) errs.push("All values must be greater than 0.");
  if ((mode === "AAS" || mode === "ASA") && v1 + v2 >= 180) errs.push("Two angles cannot sum to 180° or more — no triangle exists.");
  if (mode === "SSA" && v3 >= 180) errs.push("Angle A must be less than 180°.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(solveSines(mode, v1, v2, v3)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setS1(DEFAULTS.s1); setS2(DEFAULTS.s2); setS3(DEFAULTS.s3);
    setResult(solveSines("AAS", 50, 65, 10));
  };
  useEffect(() => { setResult(solveSines("AAS", 50, 65, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "When do I use the law of sines?", answer: "The law of sines — a/sin A = b/sin B = c/sin C — solves any triangle where you know two angles and a side (AAS or ASA). Once two angles are known, the third follows from the 180° rule, and the side ratios give the rest." },
    { question: "What is the ambiguous case (SSA)?", answer: "Given two sides and a non-included angle, the data can describe zero, one, or two distinct triangles. If the known side opposite the angle is shorter than the altitude, no triangle exists; if it is between the altitude and the other side, two triangles fit the data." },
    { question: "Which solution should I pick?", answer: "In the two-solution case, both triangles satisfy the inputs — the choice depends on the problem's geometry or the remaining angle. Many textbook problems intend the acute solution, but always confirm against the given diagram or constraints." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Law of Sines Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Law of Sines Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Known Values</label>
                <select value={mode} onChange={e => setMode(e.target.value)} className={sel}>
                  <option value="AAS">AAS — angles A, B + side a</option>
                  <option value="ASA">ASA — angles A, C + side b</option>
                  <option value="SSA">SSA — sides a, b + angle A (ambiguous)</option>
                </select>
              </div>
              {mode === "AAS" && (<>
                <div>
                  <label className={lbl}>Angle A (deg)</label>
                  <div className={inp}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°</span></div>
                </div>
                <div>
                  <label className={lbl}>Angle B (deg)</label>
                  <div className={inp}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°</span></div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Side a</label>
                  <div className={inp}><input type="number" value={s3} onChange={e => setS3(e.target.value)} className={ci} /></div>
                </div>
              </>)}
              {mode === "ASA" && (<>
                <div>
                  <label className={lbl}>Angle A (deg)</label>
                  <div className={inp}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°</span></div>
                </div>
                <div>
                  <label className={lbl}>Angle C (deg)</label>
                  <div className={inp}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°</span></div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Side b (between angles)</label>
                  <div className={inp}><input type="number" value={s3} onChange={e => setS3(e.target.value)} className={ci} /></div>
                </div>
              </>)}
              {mode === "SSA" && (<>
                <div>
                  <label className={lbl}>Side a</label>
                  <div className={inp}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className={lbl}>Side b</label>
                  <div className={inp}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} /></div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Angle A (deg, opposite a)</label>
                  <div className={inp}><input type="number" value={s3} onChange={e => setS3(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°</span></div>
                </div>
              </>)}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.solutions > 0 ? "Side c (opposite angle C)" : "No Triangle"}</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.solutions > 0 ? fmt(result.c) : "—"}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.solutions > 0 ? `A = ${fmt(result.A)}°, B = ${fmt(result.B)}°, C = ${fmt(result.C)}°` : result.note}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Area`, fmt(result.area)], ["Perimeter", fmt(result.perimeter)], ["Solutions", `${result.solutions}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              {result.solutions === 2 && (
                <div className="text-sm text-amber-600 font-semibold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-md">{result.note}</div>
              )}
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Triangle Solution</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Angle Composition</h3>
                {result.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${fmt(v)}°`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">No angles exist for this input combination.</p>
                )}
                <p className="text-center text-sm text-muted-foreground mt-1">Angles sum to 180° · {fmt(result.A + result.B + result.C)}°</p>
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
            <h2 className="text-2xl font-bold mb-3">The Law of Sines</h2>
            <p>In any triangle, each side is proportional to the sine of its opposite angle: a/sin A = b/sin B = c/sin C. This <strong>law of sines calculator</strong> uses that constant ratio to complete a triangle from two angles and one side, or from two sides and a non-included angle.</p>
            <h2 className="text-2xl font-bold mb-3">AAS and ASA</h2>
            <p>Knowing two angles fixes the third at 180° minus their sum, and any one side then scales the entire triangle through the sine ratio. These two configurations always produce exactly one solution.</p>
            <h2 className="text-2xl font-bold mb-3">The Ambiguous SSA Case</h2>
            <p>Two sides and a non-included angle can describe zero, one, or two triangles. The calculator detects all three: no solution when the known side falls short of the altitude, one solution at or beyond the critical length, and two solutions in between — with both reported in the results.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/law-of-sines-calculator" />
          <PopularCalculators exclude="/calculator/law-of-sines-calculator" />
        </div>
      </div>
    </>
  );
}
