"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TriangleResult {
  mode: string;
  a: number; b: number; c: number;
  A: number; B: number; C: number;
  area: number;
  perimeter: number;
  classification: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function degrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function classify(a: number, b: number, c: number): string {
  const sides = [a, b, c].sort((x, y) => x - y);
  const [p, q, r] = sides;
  const cmp = p * p + q * q - r * r;
  if (Math.abs(cmp) < 1e-9) return "Right triangle";
  return cmp > 0 ? "Acute triangle" : "Obtuse triangle";
}

function solveTriangle(mode: string, x1: number, x2: number, x3: number): TriangleResult {
  let a = 0, b = 0, c = 0, A = 0, B = 0, C = 0, area = 0;
  if (mode === "SSS") {
    [a, b, c] = [x1, x2, x3];
    A = degrees(Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))));
    B = degrees(Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))));
    C = 180 - A - B;
    const s = (a + b + c) / 2;
    area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
  } else {
    // SAS: sides b, c with included angle A
    [b, c, A] = [x1, x2, x3];
    const radA = (A * Math.PI) / 180;
    a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(radA));
    B = degrees(Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))));
    C = 180 - A - B;
    area = 0.5 * b * c * Math.sin(radA);
  }
  const perimeter = a + b + c;
  const classification = classify(a, b, c);
  const breakdown = [
    { label: "Side a (opposite A)", value: fmt(a) },
    { label: "Side b (opposite B)", value: fmt(b) },
    { label: "Side c (opposite C)", value: fmt(c) },
    { label: "Angle A", value: `${fmt(A)}°` },
    { label: "Angle B", value: `${fmt(B)}°` },
    { label: "Angle C", value: `${fmt(C)}°` },
    { label: "Area", value: fmt(area) },
    { label: "Perimeter", value: fmt(perimeter) },
    { label: "Classification", value: classification },
  ];
  const summaryStats = [
    { label: "Area", value: fmt(area) },
    { label: "Perimeter", value: fmt(perimeter) },
    { label: "Angle Sum Check", value: `${fmt(A + B + C)}°` },
    { label: "Classification", value: classification },
    { label: "Side a", value: fmt(a) },
    { label: "Side b", value: fmt(b) },
    { label: "Side c", value: fmt(c) },
    { label: "Mode", value: mode },
  ];
  const chartData = [
    { name: "Angle A", value: Number(A.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Angle B", value: Number(B.toFixed(2)), fill: "#8b5cf6" },
    { name: "Angle C", value: Number(C.toFixed(2)), fill: "#f59e0b" },
  ];
  return { mode, a, b, c, A, B, C, area, perimeter, classification, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "SAS", s1: "5", s2: "6", s3: "60" };

export default function LawOfCosinesCalculator() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [s1, setS1] = useState(DEFAULTS.s1);
  const [s2, setS2] = useState(DEFAULTS.s2);
  const [s3, setS3] = useState(DEFAULTS.s3);
  const [result, setResult] = useState<TriangleResult | null>(null);

  const v1 = parseFloat(s1) || 0;
  const v2 = parseFloat(s2) || 0;
  const v3 = parseFloat(s3) || 0;
  const errs: string[] = [];
  if (v1 <= 0 || v2 <= 0 || v3 <= 0) errs.push("All values must be greater than 0.");
  if (mode === "SSS" && v1 > 0 && v2 > 0 && v3 > 0 && (v1 + v2 <= v3 || v1 + v3 <= v2 || v2 + v3 <= v1)) errs.push("These sides violate the triangle inequality — the largest side must be shorter than the other two combined.");
  if (mode === "SAS" && v3 >= 180) errs.push("The included angle must be less than 180°.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(solveTriangle(mode, v1, v2, v3)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setS1(DEFAULTS.s1); setS2(DEFAULTS.s2); setS3(DEFAULTS.s3);
    setResult(solveTriangle("SAS", 5, 6, 60));
  };
  useEffect(() => { setResult(solveTriangle("SAS", 5, 6, 60)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the law of cosines?", answer: "It generalizes the Pythagorean theorem to any triangle: c² = a² + b² − 2ab·cos C. It lets you solve a triangle from three sides (SSS) or from two sides and the included angle (SAS) — cases the law of sines cannot handle directly." },
    { question: "How do I use it for SSS input?", answer: "Rearrange to find an angle, e.g. cos A = (b² + c² − a²)/(2bc), then compute B and C. The three angles always sum to 180°, which this calculator verifies." },
    { question: "What does the classification mean?", answer: "Comparing the square of the longest side with the sum of the squares of the other two tells you whether the triangle is acute (less), right (equal), or obtuse (greater)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Law of Cosines Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Law of Cosines Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Known Values</label>
                <select value={mode} onChange={e => setMode(e.target.value)} className={sel}>
                  <option value="SAS">SAS — two sides + included angle</option>
                  <option value="SSS">SSS — three sides</option>
                </select>
              </div>
              {mode === "SSS" ? (<>
                <div>
                  <label className={lbl}>Side a</label>
                  <div className={inp}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className={lbl}>Side b</label>
                  <div className={inp}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} /></div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Side c</label>
                  <div className={inp}><input type="number" value={s3} onChange={e => setS3(e.target.value)} className={ci} /></div>
                </div>
              </>) : (<>
                <div>
                  <label className={lbl}>Side b</label>
                  <div className={inp}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className={lbl}>Side c</label>
                  <div className={inp}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} /></div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Included Angle A (deg)</label>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "SAS" ? "Side a (opposite the given angle)" : "Area of the Triangle"}</div>
                <div className="text-4xl font-extrabold tracking-tight">{mode === "SAS" ? fmt(result.a) : fmt(result.area)}</div>
                <div className="text-sm text-muted-foreground mt-1">{mode === "SAS" ? `from b = ${fmt(result.b)}, c = ${fmt(result.c)}, A = ${fmt(result.A)}°` : `${result.classification} with sides ${fmt(result.a)}, ${fmt(result.b)}, ${fmt(result.c)}`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Area`, fmt(result.area)], ["Perimeter", fmt(result.perimeter)], ["Classification", result.classification.replace(" triangle", "")]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
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
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${fmt(v)}°`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">The Law of Cosines</h2>
            <p>For any triangle with sides a, b, c opposite angles A, B, C, the law of cosines states c² = a² + b² − 2ab·cos C. It is the tool of choice when you know three sides (SSS) or two sides and the included angle (SAS) — the cases where the law of sines alone cannot start.</p>
            <h2 className="text-2xl font-bold mb-3">Solving SSS and SAS</h2>
            <p>With SAS, the law of cosines directly yields the third side, then the remaining angles follow. With SSS, rearrange the formula to isolate each angle's cosine. This calculator uses exact trigonometric inverses, so results are limited only by display precision.</p>
            <h2 className="text-2xl font-bold mb-3">Area and Classification</h2>
            <p>Area is computed with Heron's formula for SSS and the ½·b·c·sin A formula for SAS. Comparing the squares of the sides also classifies the triangle as acute, right, or obtuse — a built-in consistency check on your inputs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/law-of-cosines-calculator" />
          <PopularCalculators exclude="/calculator/law-of-cosines-calculator" />
        </div>
      </div>
    </>
  );
}
