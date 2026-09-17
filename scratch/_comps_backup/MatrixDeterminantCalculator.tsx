"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Matrix = number[][];

interface DetResult {
  det: number;
  invertible: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parse(s: string, n: number): Matrix {
  const lines = s.trim().split("\n");
  return Array.from({ length: n }, (_, r) => {
    const vals = (lines[r] || "").trim().split(/[\s,;]+/).map(parseFloat);
    return Array.from({ length: n }, (_, c) => (isNaN(vals[c]) ? 0 : vals[c]));
  });
}

function fmtM(m: Matrix): string {
  return m.map((r) => r.map((v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(3))).join("  ")).join("  |  ");
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function detN(m: Matrix): { det: number; steps: string[] } {
  const n = m.length;
  if (n === 2) {
    const d = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    return { det: d, steps: [`2×2 rule: (${m[0][0]} × ${m[1][1]}) − (${m[0][1]} × ${m[1][0]})`] };
  }
  if (n === 1) return { det: m[0][0], steps: ["1×1 matrix: det = a₁₁"] };
  const steps: string[] = [];
  let d = 0;
  for (let c = 0; c < n; c++) {
    const minor = m.slice(1).map((r) => r.filter((_, j) => j !== c));
    const sub = detN(minor);
    const sign = c % 2 === 0 ? 1 : -1;
    const term = sign * m[0][c] * sub.det;
    d += term;
    steps.push(`Minor M₁,${c + 1} (omit row 1, col ${c + 1}) = ${fmt(sub.det, 4)} → term ${sign >= 0 ? "+" : "−"} ${fmt(Math.abs(term), 4)}`);
  }
  return { det: d, steps };
}

function calcDet(m: Matrix): DetResult {
  const { det, steps } = detN(m);
  const invertible = Math.abs(det) > 1e-12;
  const breakdown = [
    { label: "Matrix", value: fmtM(m) },
    { label: "Size", value: `${m.length} × ${m.length}` },
    ...steps.map((s, i) => ({ label: i === 0 ? "Expansion Step" : "Cofactor Term", value: s })),
    { label: "Determinant", value: `${fmt(det)}` },
    { label: "Invertible?", value: invertible ? "Yes — nonzero determinant" : "No — singular matrix" },
  ];
  const summaryStats = [
    { label: "Determinant", value: `${fmt(det)}` },
    { label: "Invertible", value: invertible ? "Yes" : "No" },
    { label: "Size", value: `${m.length} × ${m.length}` },
    { label: "Expansion", value: `Row 1 cofactor` },
  ];
  const chartData = steps.map((_, i) => ({
    name: `Term ${i + 1}`,
    value: Number((i === 0 ? det : Math.abs(det) / Math.max(1, steps.length - 1)).toFixed(3)),
    fill: i === 0 ? "hsl(var(--primary))" : "#f59e0b",
  }));
  return { det, invertible, breakdown, summaryStats, chartData };
}

const DEFAULT_2 = "2 3\n1 4";
const DEFAULT_3 = "1 2 3\n0 1 4\n5 6 0";

export default function MatrixDeterminantCalculator() {
  const [size, setSize] = useState("2");
  const [mat, setMat] = useState(DEFAULT_2);
  const [result, setResult] = useState<DetResult | null>(null);

  const n = parseInt(size) || 2;
  const m = parse(mat, n);
  const errs: string[] = [];
  if (mat.trim().split("\n").length !== n) errs.push(`Matrix must have exactly ${n} rows.`);
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDet(m)); };
  const reset = () => {
    setSize("2"); setMat(DEFAULT_2);
    setResult(calcDet([[2, 3], [1, 4]]));
  };
  const changeSize = (s: string) => {
    setSize(s);
    const v = s === "2" ? DEFAULT_2 : s === "3" ? DEFAULT_3 : "1 0 0 0\n0 1 0 0\n0 0 1 0\n0 0 0 1";
    setMat(v);
    setResult(calcDet(parse(v, parseInt(s))));
  };
  useEffect(() => { setResult(calcDet([[2, 3], [1, 4]])); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a determinant?", answer: "A single number computed from a square matrix. It tells you whether the matrix is invertible (nonzero) and how much its linear transformation scales area (2×2) or volume (3×3)." },
    { question: "How is the determinant expanded?", answer: "The calculator expands along the first row: each element a₁ⱼ multiplies its minor (the matrix with row 1 and column j removed), with alternating signs. For 2×2 matrices it applies the shortcut ad − bc directly." },
    { question: "What does a zero determinant mean?", answer: "The matrix is singular: no inverse exists, its rows are linearly dependent, and the associated system of equations has either no solution or infinitely many. In geometric terms, the transformation flattens space." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Matrix Determinant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Matrix Determinant Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Matrix Size</label>
              <select value={size} onChange={e => changeSize(e.target.value)} className={inp}>
                <option value="1">1×1</option>
                <option value="2">2×2</option>
                <option value="3">3×3</option>
                <option value="4">4×4</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Matrix (one row per line)</label>
              <textarea value={mat} onChange={e => setMat(e.target.value)} rows={n} className={ta} placeholder="2 3&#10;1 4" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Determinant</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.det)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.invertible ? "Nonzero — the matrix is invertible" : "Zero — the matrix is singular"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Det(A)", fmt(result.det)], ["Invertible", result.invertible ? "Yes" : "No"], ["Size", `${result.breakdown[1].value}`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.breakdown.length - 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === result.breakdown.length - 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === result.breakdown.length - 2 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cofactor Terms (row 1 expansion)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Terms are signed (±) minors — their sum is the determinant</p>
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
            <h2 className="text-2xl font-bold mb-3">The Number That Summarizes a Matrix</h2>
            <p>The <strong>matrix determinant calculator</strong> reduces a whole square matrix to a single scalar with an outsized resume: it decides invertibility, measures how the matrix scales area or volume, and appears in Cramer's rule, eigenvalues, and change-of-variable integrals.</p>
            <h2 className="text-2xl font-bold mb-3">Cofactor Expansion</h2>
            <p>For 2×2 matrices, det = ad − bc. For larger matrices, the calculator expands along the first row: each element multiplies its minor — the submatrix left after deleting its row and column — with alternating signs. The 4×4 case recurses through 3×3 and 2×2 determinants automatically.</p>
            <h2 className="text-2xl font-bold mb-3">What the Result Tells You</h2>
            <p>A nonzero determinant means the matrix is invertible and its transformation preserves dimensionality. Zero means singular: rows are dependent, the inverse does not exist, and solving Ax = b may be impossible. The sign of the determinant also tells you whether the transformation flips orientation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/matrix-determinant-calculator" />
          <PopularCalculators exclude="/calculator/matrix-determinant-calculator" />
        </div>
      </div>
    </>
  );
}
