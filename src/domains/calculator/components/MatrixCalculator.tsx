"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Matrix = number[][];
type Op = "add" | "multiply" | "determinant" | "inverse" | "transpose";

interface MxResult {
  op: Op;
  matrix: Matrix | null;
  det: number | null;
  singular: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parse(s: string, rows: number, cols: number): Matrix {
  const lines = s.trim().split("\n");
  return Array.from({ length: rows }, (_, r) => {
    const vals = (lines[r] || "").trim().split(/[\s,;]+/).map(parseFloat);
    return Array.from({ length: cols }, (_, c) => (isNaN(vals[c]) ? 0 : vals[c]));
  });
}

function fmtM(m: Matrix): string {
  return m.map((r) => r.map((v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(3))).join("  ")).join("  |  ");
}

function fmt(v: number, d = 3): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function det2(m: Matrix): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}
function det3(m: Matrix): number {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}
function detN(m: Matrix): number {
  const n = m.length;
  if (n === 2) return det2(m);
  if (n === 3) return det3(m);
  if (n === 1) return m[0][0];
  let d = 0;
  for (let c = 0; c < n; c++) {
    const minor = m.slice(1).map((r) => r.filter((_, j) => j !== c));
    d += (c % 2 === 0 ? 1 : -1) * m[0][c] * detN(minor);
  }
  return d;
}
function inverseN(m: Matrix): Matrix | null {
  const n = m.length;
  const d = detN(m);
  if (Math.abs(d) < 1e-12) return null;
  if (n === 2) {
    return [
      [m[1][1] / d, -m[0][1] / d],
      [-m[1][0] / d, m[0][0] / d],
    ];
  }
  const cof = (i: number, j: number) => {
    const minor = m.filter((_, r) => r !== i).map((r) => r.filter((_, c) => c !== j));
    return ((i + j) % 2 === 0 ? 1 : -1) * detN(minor);
  };
  const adj = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => cof(j, i) / d));
  return adj;
}
function matMul(a: Matrix, b: Matrix): Matrix {
  const rows = a.length, cols = b[0].length, inner = b.length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => Array.from({ length: inner }, (_, k) => a[i][k] * b[k][j]).reduce((s, v) => s + v, 0)));
}
function matAdd(a: Matrix, b: Matrix, sub = false): Matrix {
  return a.map((r, i) => r.map((v, j) => (sub ? v - b[i][j] : v + b[i][j])));
}
function transpose(m: Matrix): Matrix {
  return Array.from({ length: m[0].length }, (_, j) => m.map((r) => r[j]));
}

function rowSums(m: Matrix): number[] {
  return m.map((r) => r.reduce((s, v) => s + Math.abs(v), 0));
}

function calcMx(op: Op, a: Matrix, b: Matrix | null): MxResult {
  let matrix: Matrix | null = null;
  let det: number | null = null;
  let singular = false;
  if (op === "add") matrix = matAdd(a, b!);
  else if (op === "multiply") matrix = matMul(a, b!);
  else if (op === "determinant") det = detN(a);
  else if (op === "inverse") {
    matrix = inverseN(a);
    singular = matrix === null;
  } else matrix = transpose(a);

  const label = op === "add" ? "A + B" : op === "multiply" ? "A × B" : op === "determinant" ? "det(A)" : op === "inverse" ? "A⁻¹" : "Aᵀ";
  const breakdown = [
    { label: "Operation", value: label },
    ...(matrix ? [{ label: "Result Matrix", value: fmtM(matrix) }] : []),
    ...(det !== null ? [{ label: "Determinant", value: `${fmt(det, 4)}` }] : []),
    ...(singular ? [{ label: "Singular", value: "Yes — determinant is zero, no inverse exists" }] : []),
  ];
  const summaryStats = matrix
    ? [
        { label: "Operation", value: label },
        { label: "Rows × Cols", value: `${matrix.length} × ${matrix[0].length}` },
        { label: "Row Sum 1 (|Σ|)", value: `${fmt(rowSums(matrix)[0])}` },
        ...(matrix.length > 1 ? [{ label: "Row Sum 2 (|Σ|)", value: `${fmt(rowSums(matrix)[1])}` }] : []),
      ]
    : [
        { label: "Operation", value: label },
        { label: "Determinant", value: `${fmt(det!, 4)}` },
        { label: "Invertible", value: singular ? "No" : "Yes" },
      ];
  const chartData = matrix
    ? rowSums(matrix).map((v, i) => ({ name: `Row ${i + 1}`, value: Number(v.toFixed(3)), fill: i === 0 ? "hsl(var(--primary))" : i === 1 ? "#f59e0b" : "#10b981" }))
    : [{ name: "Determinant", value: Number((det ?? 0).toFixed(3)), fill: "hsl(var(--primary))" }];
  return { op, matrix, det, singular, breakdown, summaryStats, chartData };
}

const DEFAULT_A = "1 2\n3 4";
const DEFAULT_B = "5 6\n7 8";

export default function MatrixCalculator() {
  const [op, setOp] = useState<Op>("add");
  const [size, setSize] = useState("2");
  const [matA, setMatA] = useState(DEFAULT_A);
  const [matB, setMatB] = useState(DEFAULT_B);
  const [result, setResult] = useState<MxResult | null>(null);

  const n = parseInt(size) || 2;
  const a = parse(matA, n, n);
  const b = op === "add" || op === "multiply" ? parse(matB, n, n) : null;
  const errs: string[] = [];
  if (matA.trim().split("\n").length !== n) errs.push(`Matrix A must have exactly ${n} rows.`);
  if (b && matB.trim().split("\n").length !== n) errs.push(`Matrix B must have exactly ${n} rows.`);
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMx(op, a, b)); };
  const reset = () => {
    setOp("add"); setSize("2"); setMatA(DEFAULT_A); setMatB(DEFAULT_B);
    setResult(calcMx("add", [[1, 2], [3, 4]], [[5, 6], [7, 8]]));
  };
  useEffect(() => { setResult(calcMx("add", [[1, 2], [3, 4]], [[5, 6], [7, 8]])); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I enter a matrix?", answer: "Enter each row on a new line, separating values with spaces or commas. For a 2×2 matrix, type '1 2' on the first line and '3 4' on the second." },
    { question: "What is a determinant?", answer: "A scalar computed from a square matrix that reveals whether it is invertible (nonzero determinant) and how much the linear transformation scales areas or volumes." },
    { question: "When is a matrix invertible?", answer: "Exactly when its determinant is nonzero. The inverse A⁻¹ satisfies A·A⁻¹ = I; for 2×2 and 3×3 matrices this calculator computes it from the cofactors divided by the determinant." },
  ];

  const opButtons: { key: Op; label: string }[] = [
    { key: "add", label: "Add (A+B)" },
    { key: "multiply", label: "Multiply (A×B)" },
    { key: "determinant", label: "Determinant" },
    { key: "inverse", label: "Inverse" },
    { key: "transpose", label: "Transpose" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Matrix Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Matrix Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Operation</label>
              <div className="flex flex-wrap gap-2">
                {opButtons.map((o) => (
                  <button key={o.key} onClick={() => { setOp(o.key); setResult(null); }} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${op === o.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Matrix Size (n×n)</label>
              <select value={size} onChange={e => setSize(e.target.value)} className={inp}>
                <option value="2">2×2</option>
                <option value="3">3×3</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Matrix A</label>
                <textarea value={matA} onChange={e => setMatA(e.target.value)} rows={n} className={ta} placeholder="1 2&#10;3 4" />
              </div>
              {b && (
                <div>
                  <label className={lbl}>Matrix B</label>
                  <textarea value={matB} onChange={e => setMatB(e.target.value)} rows={n} className={ta} placeholder="5 6&#10;7 8" />
                </div>
              )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.op === "determinant" ? "Determinant" : result.op === "inverse" && result.singular ? "Inverse — Singular" : `Result: ${result.op === "add" ? "A + B" : result.op === "multiply" ? "A × B" : result.op === "transpose" ? "Aᵀ" : "A⁻¹"}`}</div>
                {result.det !== null ? (
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(result.det, 4)}</div>
                ) : result.singular ? (
                  <div className="text-4xl font-extrabold tracking-tight text-destructive">No Inverse</div>
                ) : (
                  <div className="text-xl font-extrabold tracking-tight font-mono">{fmtM(result.matrix!)}</div>
                )}
                <div className="text-sm text-muted-foreground mt-1">{result.matrix ? `${result.matrix.length} × ${result.matrix[0].length} matrix` : result.op === "determinant" ? `det(${n}×${n})` : "singular matrix — determinant is zero"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.det !== null
                  ? [["Determinant", fmt(result.det, 4)], ["Invertible", result.det !== 0 ? "Yes" : "No"], ["Size", `${n}×${n}`]].map(([l, v], i) => (
                      <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                        <div className="text-base font-bold">{v}</div>
                      </div>
                    ))
                  : result.singular
                    ? [["Det(A)", "0"], ["Invertible", "No"], ["Size", `${n}×${n}`]].map(([l, v], i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                          <div className="text-base font-bold">{v}</div>
                        </div>
                      ))
                    : rowSums(result.matrix!).map((v, i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Row {i + 1} |Σ|</div>
                          <div className="text-base font-bold">{fmt(v)}</div>
                        </div>
                      ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 0 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">{result.matrix ? "Row Magnitudes (|Σ| per row)" : "Determinant"}</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">{result.matrix ? "Sum of absolute values per row of the result" : "Nonzero determinant means the matrix is invertible"}</p>
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
            <h2 className="text-2xl font-bold mb-3">Matrix Operations</h2>
            <p>Matrices are rectangular arrays of numbers that power linear algebra — solving systems of equations, transforming geometry, and compressing data. This <strong>matrix calculator</strong> handles the core operations for 2×2 and 3×3 matrices.</p>
            <h2 className="text-2xl font-bold mb-3">The Operations</h2>
            <p>Addition combines element-by-element; multiplication is the row-by-column dot product; the determinant is a single number encoding invertibility and scaling; the inverse (when it exists) undoes the matrix; the transpose flips rows and columns. Together they cover most coursework and quick engineering checks.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Results</h2>
            <p>If the determinant is zero, the matrix is singular — no inverse exists and the system it represents has no unique solution. Otherwise A⁻¹ = adj(A)/det(A), computed here via cofactor expansion. Use the row-magnitude chart to eyeball which rows dominate the result.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/matrix-calculator" />
          <PopularCalculators exclude="/calculator/matrix-calculator" />
        </div>
      </div>
    </>
  );
}
