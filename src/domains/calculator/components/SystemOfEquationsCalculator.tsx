"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, Cell } from "recharts";

interface SysInput {
  size: 2 | 3;
  a11: number; a12: number; a13: number; b1: number;
  a21: number; a22: number; a23: number; b2: number;
  a31: number; a32: number; a33: number; b3: number;
}

interface SysResult {
  x: number;
  y: number;
  z: number;
  det: number;
  status: string;
  chart2d: { x: number; y1: number; y2: number }[];
  chart3d: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function det3(m: number[][]): number {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
    - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
    + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}

function calcSys(input: SysInput): SysResult {
  let x = 0, y = 0, z = 0, det = 0, status = "";
  let chart2d: { x: number; y1: number; y2: number }[] = [];
  let chart3d: { name: string; value: number; fill: string }[] = [];

  if (input.size === 2) {
    const A = [[input.a11, input.a12], [input.a21, input.a22]];
    const B = [input.b1, input.b2];
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (Math.abs(det) < 1e-9) {
      status = "No unique solution (singular system)";
    } else {
      const detX = B[0] * A[1][1] - A[0][1] * B[1];
      const detY = A[0][0] * B[1] - B[0] * A[1][0];
      x = detX / det;
      y = detY / det;
      status = "Unique solution";
    }
    // Line chart of both equations
    const pts: { x: number; y1: number; y2: number }[] = [];
    for (let xi = -5; xi <= 5; xi += 1) {
      const y1v = A[0][1] !== 0 ? (B[0] - A[0][0] * xi) / A[0][1] : NaN;
      const y2v = A[1][1] !== 0 ? (B[1] - A[1][0] * xi) / A[1][1] : NaN;
      pts.push({ x: xi, y1: Number(y1v.toFixed(2)), y2: Number(y2v.toFixed(2)) });
    }
    chart2d = pts;
  } else {
    const A = [[input.a11, input.a12, input.a13], [input.a21, input.a22, input.a23], [input.a31, input.a32, input.a33]];
    const B = [input.b1, input.b2, input.b3];
    det = det3(A);
    if (Math.abs(det) < 1e-9) {
      status = "No unique solution (singular system)";
    } else {
      const replaceCol = (col: number) => A.map((row, i) => row.map((v, j) => (j === col ? B[i] : v)));
      x = det3(replaceCol(0)) / det;
      y = det3(replaceCol(1)) / det;
      z = det3(replaceCol(2)) / det;
      status = "Unique solution";
    }
    chart3d = [
      { name: "x", value: Number(x.toFixed(2)), fill: "hsl(var(--primary))" },
      { name: "y", value: Number(y.toFixed(2)), fill: "#10b981" },
      { name: "z", value: Number(z.toFixed(2)), fill: "#f59e0b" },
    ];
  }

  const breakdown = [
    { label: "System Size", value: `${input.size}×${input.size}` },
    { label: "Determinant", value: `${det.toFixed(4)}` },
    { label: "Status", value: status },
    ...(input.size === 2
      ? [
          { label: "x", value: `${x.toFixed(2)}` },
          { label: "y", value: `${y.toFixed(2)}` },
          { label: "Equations", value: `${input.a11}x + ${input.a12}y = ${input.b1}  ·  ${input.a21}x + ${input.a22}y = ${input.b2}` },
        ]
      : [
          { label: "x", value: `${x.toFixed(2)}` },
          { label: "y", value: `${y.toFixed(2)}` },
          { label: "z", value: `${z.toFixed(2)}` },
          { label: "Equations", value: `${input.a11}x + ${input.a12}y + ${input.a13}z = ${input.b1}  ·  ${input.a21}x + ${input.a22}y + ${input.a23}z = ${input.b2}  ·  ${input.a31}x + ${input.a32}y + ${input.a33}z = ${input.b3}` },
        ]),
  ];

  const summaryStats = [
    { label: "x", value: `${x.toFixed(2)}` },
    { label: "y", value: `${y.toFixed(2)}` },
    ...(input.size === 3 ? [{ label: "z", value: `${z.toFixed(2)}` }] : []),
    { label: "Determinant", value: `${det.toFixed(4)}` },
    { label: "Status", value: status },
  ];

  return { x, y, z, det, status, chart2d, chart3d, breakdown, summaryStats };
}

const DEFAULTS: SysInput = { size: 2, a11: 1, a12: 1, a13: 1, b1: 5, a21: 2, a22: 3, a23: 1, b2: 12, a31: 1, a32: 1, a33: 1, b3: 0 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SystemOfEquationsCalculator() {
  const [size, setSize] = useState<2 | 3>(DEFAULTS.size);
  const [a11, setA11] = useState(String(DEFAULTS.a11));
  const [a12, setA12] = useState(String(DEFAULTS.a12));
  const [a13, setA13] = useState(String(DEFAULTS.a13));
  const [b1, setB1] = useState(String(DEFAULTS.b1));
  const [a21, setA21] = useState(String(DEFAULTS.a21));
  const [a22, setA22] = useState(String(DEFAULTS.a22));
  const [a23, setA23] = useState(String(DEFAULTS.a23));
  const [b2, setB2] = useState(String(DEFAULTS.b2));
  const [a31, setA31] = useState(String(DEFAULTS.a31));
  const [a32, setA32] = useState(String(DEFAULTS.a32));
  const [a33, setA33] = useState(String(DEFAULTS.a33));
  const [b3, setB3] = useState(String(DEFAULTS.b3));
  const [result, setResult] = useState<SysResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSys({
      size,
      a11: parse(a11, DEFAULTS.a11), a12: parse(a12, DEFAULTS.a12), a13: parse(a13, DEFAULTS.a13), b1: parse(b1, DEFAULTS.b1),
      a21: parse(a21, DEFAULTS.a21), a22: parse(a22, DEFAULTS.a22), a23: parse(a23, DEFAULTS.a23), b2: parse(b2, DEFAULTS.b2),
      a31: parse(a31, DEFAULTS.a31), a32: parse(a32, DEFAULTS.a32), a33: parse(a33, DEFAULTS.a33), b3: parse(b3, DEFAULTS.b3),
    }));
  const reset = () => {
    setSize(DEFAULTS.size);
    setA11(String(DEFAULTS.a11)); setA12(String(DEFAULTS.a12)); setA13(String(DEFAULTS.a13)); setB1(String(DEFAULTS.b1));
    setA21(String(DEFAULTS.a21)); setA22(String(DEFAULTS.a22)); setA23(String(DEFAULTS.a23)); setB2(String(DEFAULTS.b2));
    setA31(String(DEFAULTS.a31)); setA32(String(DEFAULTS.a32)); setA33(String(DEFAULTS.a33)); setB3(String(DEFAULTS.b3));
    setResult(calcSys(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSys(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is Cramer's rule?", answer: "Cramer's rule solves linear systems using determinants: x = det(Aₓ)/det(A), where Aₓ replaces the x-column with the constants. It works for every square system with a nonzero determinant and is exact (no iteration)." },
    { question: "What does the determinant tell me?", answer: "A nonzero determinant means a unique solution. A zero determinant means the system is singular: either no solution (parallel lines/planes) or infinitely many (coincident lines/planes) — the calculator flags this case." },
    { question: "When should I use elimination instead?", answer: "For 2×2 and 3×3 systems, Cramer's rule is convenient. For larger systems, Gaussian elimination is faster and numerically stabler. Both methods give the same answer; this calculator uses determinants for its compactness." },
    { question: "What does the 2×2 chart show?", answer: "Each equation is a straight line; the solution is their intersection. Parallel lines (no solution) and identical lines (infinite solutions) are immediately visible on the chart." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "System of Equations Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">System of Equations Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">System Size</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value) as 2 | 3)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value={2}>2×2 (two variables)</option>
                <option value={3}>3×3 (three variables)</option>
              </select>
            </div>

            {size === 2 ? (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Equation 1: a₁x + a₂y = c₁</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={inp}><input type="number" value={a11} onChange={(e) => setA11(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a12} onChange={(e) => setA12(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={b1} onChange={(e) => setB1(e.target.value)} className={ci} /></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Equation 2: a₁x + a₂y = c₁</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={inp}><input type="number" value={a21} onChange={(e) => setA21(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a22} onChange={(e) => setA22(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={b2} onChange={(e) => setB2(e.target.value)} className={ci} /></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Equation 1</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={inp}><input type="number" value={a11} onChange={(e) => setA11(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a12} onChange={(e) => setA12(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a13} onChange={(e) => setA13(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={b1} onChange={(e) => setB1(e.target.value)} className={ci} /></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Equation 2</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={inp}><input type="number" value={a21} onChange={(e) => setA21(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a22} onChange={(e) => setA22(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a23} onChange={(e) => setA23(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={b2} onChange={(e) => setB2(e.target.value)} className={ci} /></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Equation 3</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={inp}><input type="number" value={a31} onChange={(e) => setA31(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a32} onChange={(e) => setA32(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={a33} onChange={(e) => setA33(e.target.value)} className={ci} /></div>
                    <div className={inp}><input type="number" value={b3} onChange={(e) => setB3(e.target.value)} className={ci} /></div>
                  </div>
                </div>
              </>
            )}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Solution</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary break-all">{size === 2 ? `x = ${result.x.toFixed(2)}, y = ${result.y.toFixed(2)}` : `x = ${result.x.toFixed(2)}, y = ${result.y.toFixed(2)}, z = ${result.z.toFixed(2)}`}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.status} · determinant = {result.det.toFixed(4)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {size === 2
                    ? [["x", `${result.x.toFixed(2)}`], ["y", `${result.y.toFixed(2)}`], ["Det", `${result.det.toFixed(4)}`]].map(([l, v], i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                          <div className="text-base font-bold">{v}</div>
                        </div>
                      ))
                    : [["x", `${result.x.toFixed(2)}`], ["y", `${result.y.toFixed(2)}`], ["z", `${result.z.toFixed(2)}`]].map(([l, v], i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                          <div className="text-base font-bold">{v}</div>
                        </div>
                      ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Solution Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                {size === 2 ? (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">The Two Lines (intersection = solution)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={result.chart2d} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="linear" dataKey="y1" name="Equation 1" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="linear" dataKey="y2" name="Equation 2" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Solution Values</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.chart3d} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chart3d.map((d, i) => <Cell key={i} fill={d.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

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
            <h2 className="text-2xl font-bold mb-3">Solving Linear Systems</h2>
            <p>A system of linear equations asks which values satisfy every equation at once. In 2D, each equation is a line and the solution is their intersection; in 3D, each is a plane. This calculator solves 2×2 and 3×3 systems exactly using Cramer's rule.</p>
            <h2 className="text-2xl font-bold mb-3">Determinants Decide Everything</h2>
            <p>The coefficient determinant tells you the outcome: nonzero → one unique solution; zero → either no solution (parallel, never meeting) or infinitely many (coincident). The chart makes the 2×2 case visually obvious.</p>
            <h2 className="text-2xl font-bold mb-3">Real Applications</h2>
            <p>Linear systems model supply-and-demand equilibrium, circuit currents (Kirchhoff's laws), chemical reaction balancing, and economic input-output tables. Solving them reliably is foundational to science and engineering.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/system-of-equations-calculator" />
          <PopularCalculators exclude="/calculator/system-of-equations-calculator" />
        </div>
      </div>
    </>
  );
}
