"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface VecInput {
  ux: number;
  uy: number;
  uz: number;
  vx: number;
  vy: number;
  vz: number;
}

interface VecResult {
  rx: number;
  ry: number;
  rz: number;
  magnitude: number;
  dot: number;
  angleDeg: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCross(input: VecInput): VecResult {
  const rx = input.uy * input.vz - input.uz * input.vy;
  const ry = input.uz * input.vx - input.ux * input.vz;
  const rz = input.ux * input.vy - input.uy * input.vx;
  const magnitude = Math.sqrt(rx * rx + ry * ry + rz * rz);
  const dot = input.ux * input.vx + input.uy * input.vy + input.uz * input.vz;
  const magU = Math.sqrt(input.ux * input.ux + input.uy * input.uy + input.uz * input.uz);
  const magV = Math.sqrt(input.vx * input.vx + input.vy * input.vy + input.vz * input.vz);
  const angleDeg = magU > 0 && magV > 0 ? (Math.acos(Math.min(1, Math.max(-1, dot / (magU * magV)))) * 180) / Math.PI : 0;

  const chartData = [
    { name: "u × v (x)", value: rx, fill: "hsl(var(--primary))" },
    { name: "u × v (y)", value: ry, fill: "#10b981" },
    { name: "u × v (z)", value: rz, fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "u", value: `(${input.ux}, ${input.uy}, ${input.uz})` },
    { label: "v", value: `(${input.vx}, ${input.vy}, ${input.vz})` },
    { label: "u × v", value: `(${rx}, ${ry}, ${rz})` },
    { label: "Magnitude |u × v|", value: `${magnitude.toFixed(2)}` },
    { label: "u · v (Dot Product)", value: `${dot}` },
    { label: "Angle Between u and v", value: `${angleDeg.toFixed(1)}°` },
    { label: "Area of Parallelogram", value: `${magnitude.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "u × v", value: `(${rx}, ${ry}, ${rz})` },
    { label: "Magnitude", value: `${magnitude.toFixed(2)}` },
    { label: "Dot Product", value: `${dot}` },
    { label: "Angle", value: `${angleDeg.toFixed(1)}°` },
    { label: "u × v (x)", value: `${rx}` },
    { label: "u × v (y, z)", value: `(${ry}, ${rz})` },
  ];

  return { rx, ry, rz, magnitude, dot, angleDeg, chartData, breakdown, summaryStats };
}

const DEFAULTS: VecInput = { ux: 1, uy: 2, uz: 3, vx: 4, vy: 5, vz: 6 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VectorCrossProductCalculator() {
  const [ux, setUx] = useState(String(DEFAULTS.ux));
  const [uy, setUy] = useState(String(DEFAULTS.uy));
  const [uz, setUz] = useState(String(DEFAULTS.uz));
  const [vx, setVx] = useState(String(DEFAULTS.vx));
  const [vy, setVy] = useState(String(DEFAULTS.vy));
  const [vz, setVz] = useState(String(DEFAULTS.vz));
  const [result, setResult] = useState<VecResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcCross({ ux: parse(ux, DEFAULTS.ux), uy: parse(uy, DEFAULTS.uy), uz: parse(uz, DEFAULTS.uz), vx: parse(vx, DEFAULTS.vx), vy: parse(vy, DEFAULTS.vy), vz: parse(vz, DEFAULTS.vz) }));
  const reset = () => {
    setUx(String(DEFAULTS.ux));
    setUy(String(DEFAULTS.uy));
    setUz(String(DEFAULTS.uz));
    setVx(String(DEFAULTS.vx));
    setVy(String(DEFAULTS.vy));
    setVz(String(DEFAULTS.vz));
    setResult(calcCross(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcCross(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the cross product?", answer: "The cross product u × v produces a vector perpendicular to both u and v, with magnitude |u||v|sin θ. Its components are (uy·vz − uz·vy, uz·vx − ux·vz, ux·vy − uy·vx). The magnitude equals the area of the parallelogram spanned by the two vectors." },
    { question: "Is the cross product commutative?", answer: "No — u × v = −(v × u). Swapping the order flips the direction (the right-hand rule), which is why cross products encode orientation while dot products do not." },
    { question: "When does the cross product vanish?", answer: "When the vectors are parallel (θ = 0° or 180°), sin θ = 0, so the cross product is the zero vector. It is also zero when either vector is zero." },
    { question: "How is it used?", answer: "Cross products compute torque, angular momentum, magnetic force, surface normals for 3D graphics, and the area of parallelograms and triangles in space — every situation needing a perpendicular direction or a signed area." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Vector Cross Product Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Vector Cross Product Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Vector u = (ux, uy, uz)</label>
              <div className="grid grid-cols-3 gap-2">
                <div className={inp}><input type="number" value={ux} onChange={(e) => setUx(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={uy} onChange={(e) => setUy(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={uz} onChange={(e) => setUz(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Vector v = (vx, vy, vz)</label>
              <div className="grid grid-cols-3 gap-2">
                <div className={inp}><input type="number" value={vx} onChange={(e) => setVx(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={vy} onChange={(e) => setVy(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={vz} onChange={(e) => setVz(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">u × v</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary break-all">({result.rx}, {result.ry}, {result.rz})</div>
                  <div className="text-sm text-muted-foreground mt-1">|u × v| = {result.magnitude.toFixed(2)} · area of parallelogram</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Magnitude", `${result.magnitude.toFixed(2)}`], ["Dot Product", `${result.dot}`], ["Angle", `${result.angleDeg.toFixed(1)}°`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Computation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Result Components</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Cross Product</h2>
            <p>u × v is a vector perpendicular to both inputs, following the right-hand rule. Its magnitude, |u||v| sin θ, is the area of the parallelogram the vectors span — zero when they are parallel, maximum when perpendicular.</p>
            <h2 className="text-2xl font-bold mb-3">Computation</h2>
            <p>Component-wise: u × v = (uy·vz − uz·vy, uz·vx − ux·vz, ux·vy − uy·vx). A convenient memory aid is the determinant of the matrix with unit vectors i, j, k in the first row and the vector components in the next two.</p>
            <h2 className="text-2xl font-bold mb-3">Where It Appears</h2>
            <p>Torque (τ = r × F), angular momentum (L = r × p), and the Lorentz force (F = qv × B) all use cross products. In graphics and geometry, cross products produce surface normals and compute signed areas — essential for lighting, collision, and mesh work.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vector-cross-product-calculator" />
          <PopularCalculators exclude="/calculator/vector-cross-product-calculator" />
        </div>
      </div>
    </>
  );
}
