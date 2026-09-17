"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface VectorResult {
  magA: number;
  magB: number;
  dot: number;
  cross: Vector3;
  crossMag: number;
  angleDeg: number | null;
  sum: Vector3;
  diff: Vector3;
  chartData: { name: string; mag: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function vfmt(v: Vector3): string {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
}

function calcVectors(A: Vector3, B: Vector3): VectorResult {
  const magA = Math.sqrt(A.x * A.x + A.y * A.y + A.z * A.z);
  const magB = Math.sqrt(B.x * B.x + B.y * B.y + B.z * B.z);
  const dot = A.x * B.x + A.y * B.y + A.z * B.z;
  const cross: Vector3 = {
    x: A.y * B.z - A.z * B.y,
    y: A.z * B.x - A.x * B.z,
    z: A.x * B.y - A.y * B.x,
  };
  const crossMag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
  const angleDeg = magA > 0 && magB > 0 ? (Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB)))) * 180) / Math.PI : null;
  const sum: Vector3 = { x: A.x + B.x, y: A.y + B.y, z: A.z + B.z };
  const diff: Vector3 = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };

  const chartData = [
    { name: "|A|", mag: magA, fill: "hsl(var(--primary))" },
    { name: "|B|", mag: magB, fill: "#10b981" },
    { name: "|A + B|", mag: Math.sqrt(sum.x * sum.x + sum.y * sum.y + sum.z * sum.z), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Vector A", value: vfmt(A) },
    { label: "Vector B", value: vfmt(B) },
    { label: "|A| (magnitude)", value: magA.toFixed(2) },
    { label: "|B| (magnitude)", value: magB.toFixed(2) },
    { label: "A + B (sum)", value: vfmt(sum) },
    { label: "A − B (difference)", value: vfmt(diff) },
    { label: "A · B (dot product)", value: dot.toFixed(2) },
    { label: "A × B (cross product)", value: vfmt(cross) },
    { label: "|A × B|", value: crossMag.toFixed(2) },
    { label: "Angle between A and B", value: angleDeg !== null ? `${angleDeg.toFixed(1)}°` : "—" },
  ];

  const summaryStats = [
    { label: "|A|", value: magA.toFixed(2) },
    { label: "|B|", value: magB.toFixed(2) },
    { label: "Dot Product", value: dot.toFixed(2) },
    { label: "Cross Product", value: vfmt(cross) },
    { label: "Angle", value: angleDeg !== null ? `${angleDeg.toFixed(1)}°` : "—" },
    { label: "A + B", value: vfmt(sum) },
  ];

  return { magA, magB, dot, cross, crossMag, angleDeg, sum, diff, chartData, breakdown, summaryStats };
}

const DEFAULT_A: Vector3 = { x: 3, y: 4, z: 0 };
const DEFAULT_B: Vector3 = { x: 1, y: 2, z: 2 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VectorOperationsCalculator() {
  const [ax, setAx] = useState(String(DEFAULT_A.x));
  const [ay, setAy] = useState(String(DEFAULT_A.y));
  const [az, setAz] = useState(String(DEFAULT_A.z));
  const [bx, setBx] = useState(String(DEFAULT_B.x));
  const [by, setBy] = useState(String(DEFAULT_B.y));
  const [bz, setBz] = useState(String(DEFAULT_B.z));
  const [result, setResult] = useState<VectorResult | null>(null);

  const p = (s: string, f: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : f;
  };

  const calculate = () =>
    setResult(
      calcVectors(
        { x: p(ax, DEFAULT_A.x), y: p(ay, DEFAULT_A.y), z: p(az, DEFAULT_A.z) },
        { x: p(bx, DEFAULT_B.x), y: p(by, DEFAULT_B.y), z: p(bz, DEFAULT_B.z) }
      )
    );
  const reset = () => {
    setAx(String(DEFAULT_A.x));
    setAy(String(DEFAULT_A.y));
    setAz(String(DEFAULT_A.z));
    setBx(String(DEFAULT_B.x));
    setBy(String(DEFAULT_B.y));
    setBz(String(DEFAULT_B.z));
    setResult(calcVectors(DEFAULT_A, DEFAULT_B));
  };
  useEffect(() => {
    setResult(calcVectors(DEFAULT_A, DEFAULT_B));
  }, []);

  const faqs = [
    { question: "What is a vector?", answer: "A vector is a quantity with both magnitude and direction, written here as three components (x, y, z). Velocity, force, and acceleration are vectors — unlike scalars such as mass or temperature, they cannot be added by simple arithmetic." },
    { question: "What is the dot product used for?", answer: "The dot product A·B = |A||B|cos(θ) measures how much two vectors point in the same direction. It is zero when the vectors are perpendicular, and it powers the angle calculation: cos(θ) = A·B ÷ (|A||B|). Physically, work done by a force is a dot product." },
    { question: "What is the cross product?", answer: "The cross product A × B produces a new vector perpendicular to both inputs, with magnitude |A||B|sin(θ) equal to the area of the parallelogram they span. It is central to torque, angular momentum, and magnetic force. Note that A × B = −(B × A): order matters." },
    { question: "What is vector addition?", answer: "Add component by component: A + B = (ax+bx, ay+by, az+bz). This is how velocities combine (a plane's velocity plus the wind) or how forces acting on the same point are summed into a resultant force." },
    { question: "Why does |A + B| matter?", answer: "The triangle inequality says |A + B| ≤ |A| + |B|, with equality only when the vectors point the same way. The third bar in the chart shows this: adding perpendicular vectors produces a resultant shorter than the sum of the magnitudes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Vector Operations Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Vector Operations Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">A — x</label>
                <div className={inp}><input type="number" value={ax} onChange={(e) => setAx(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">A — y</label>
                <div className={inp}><input type="number" value={ay} onChange={(e) => setAy(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">A — z</label>
                <div className={inp}><input type="number" value={az} onChange={(e) => setAz(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">B — x</label>
                <div className={inp}><input type="number" value={bx} onChange={(e) => setBx(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">B — y</label>
                <div className={inp}><input type="number" value={by} onChange={(e) => setBy(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">B — z</label>
                <div className={inp}><input type="number" value={bz} onChange={(e) => setBz(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">A · B (Dot Product)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.dot.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Angle between vectors: {result.angleDeg !== null ? `${result.angleDeg.toFixed(1)}°` : "—"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["|A|", result.magA.toFixed(2)], ["|B|", result.magB.toFixed(2)], ["A × B", `(${result.cross.x.toFixed(1)}, ${result.cross.y.toFixed(1)}, ${result.cross.z.toFixed(1)})`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Result Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Vector Magnitudes</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Magnitude"]} />
                      <Bar dataKey="mag" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Triangle inequality: |A + B| is always at most |A| + |B|, and equals it only when A and B point the same way.</p>
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
            <h2 className="text-2xl font-bold mb-3">Vector Operations Explained</h2>
            <p>Vectors describe quantities that have both size and direction. In physics and engineering they represent displacement, velocity, force, and momentum; in machine learning they represent data points in feature space. This calculator performs the four fundamental 3D vector operations in one pass.</p>
            <h2 className="text-2xl font-bold mb-3">The Four Operations</h2>
            <p><strong>Addition and subtraction</strong> are component-wise: A + B = (ax+bx, ay+by, az+bz). The <strong>dot product</strong> A·B = ax·bx + ay·by + az·bz is a scalar measuring directional agreement, and the <strong>cross product</strong> produces a perpendicular vector whose magnitude equals the parallelogram area |A||B|sin(θ).</p>
            <h2 className="text-2xl font-bold mb-3">From Dot Product to Angle</h2>
            <p>Rearranging the dot-product identity gives cos(θ) = A·B ÷ (|A||B|), the standard way to find the angle between two vectors in 3D. When the dot product is zero the vectors are perpendicular; when it is positive they point mostly the same way, and when negative they point mostly apart.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vector-operations-calculator" />
          <PopularCalculators exclude="/calculator/vector-operations-calculator" />
        </div>
      </div>
    </>
  );
}
