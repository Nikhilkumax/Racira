"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Matrix = number[][];

interface MulResult {
  matrix: Matrix;
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

function fmt(v: number, d = 3): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function mul(a: Matrix, b: Matrix): { matrix: Matrix; steps: string[] } {
  const n = a.length;
  const matrix = a.map((r, i) => b[0].map((_, j) => b.map((_, k) => r[k] * b[k][j]).reduce((s, v) => s + v, 0)));
  const steps: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const terms = a[i].map((v, k) => `${v}×${b[k][j]}`);
      steps.push(`C${i + 1}${j + 1} = ${terms.join(" + ")} = ${fmt(matrix[i][j])}`);
    }
  }
  return { matrix, steps };
}

function rowSums(m: Matrix): number[] {
  return m.map((r) => r.reduce((s, v) => s + Math.abs(v), 0));
}

function calcMul(a: Matrix, b: Matrix): MulResult {
  const { matrix, steps } = mul(a, b);
  const breakdown = [
    { label: "Matrix A", value: fmtM(a) },
    { label: "Matrix B", value: fmtM(b) },
    { label: "Result A × B", value: fmtM(matrix) },
    ...steps.map((s, i) => ({ label: i === 0 ? "Dot Product Step" : "Element Step", value: s })),
  ];
  const summaryStats = [
    { label: "Result", value: fmtM(matrix) },
    { label: "Size", value: `${matrix.length} × ${matrix.length}` },
    { label: "Row Sum 1 (|Σ|)", value: `${fmt(rowSums(matrix)[0])}` },
    ...(matrix.length > 1 ? [{ label: "Row Sum 2 (|Σ|)", value: `${fmt(rowSums(matrix)[1])}` }] : []),
  ];
  const chartData = rowSums(matrix).map((v, i) => ({ name: `Row ${i + 1}`, value: Number(v.toFixed(3)), fill: i === 0 ? "hsl(var(--primary))" : i === 1 ? "#f59e0b" : "#10b981" }));
  return { matrix, breakdown, summaryStats, chartData };
}

const DEFAULT_2 = ["1 2\n3 4", "5 6\n7 8"];
const DEFAULT_3 = ["1 2 3\n4 5 6\n7 8 9", "9 8 7\n6 5 4\n3 2 1"];

export default function MatrixMultiplicationCalculator() {
  const [size, setSize] = useState("2");
  const [matA, setMatA] = useState(DEFAULT_2[0]);
  const [matB, setMatB] = useState(DEFAULT_2[1]);
  const [result, setResult] = useState<MulResult | null>(null);

  const n = parseInt(size) || 2;
  const a = parse(matA, n);
  const b = parse(matB, n);
  const errs: string[] = [];
  if (matA.trim().split("\n").length !== n) errs.push(`Matrix A must have exactly ${n} rows.`);
  if (matB.trim().split("\n").length !== n) errs.push(`Matrix B must have exactly ${n} rows.`);
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMul(a, b)); };
  const reset = () => {
    setSize("2"); setMatA(DEFAULT_2[0]); setMatB(DEFAULT_2[1]);
    setResult(calcMul([[1, 2], [3, 4]], [[5, 6], [7, 8]]));
  };
  const changeSize = (s: string) => {
    setSize(s);
    const d = s === "2" ? DEFAULT_2 : DEFAULT_3;
    setMatA(d[0]); setMatB(d[1]);
    setResult(calcMul(parse(d[0], parseInt(s)), parse(d[1], parseInt(s))));
  };
  useEffect(() => { setResult(calcMul([[1, 2], [3, 4]], [[5, 6], [7, 8]])); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How does matrix multiplication work?", answer: "Each entry Cᵢⱼ of the product is the dot product of row i of A with column j of B: multiply corresponding elements and sum them. The number of columns of A must equal the number of rows of B." },
    { question: "Is A×B the same as B×A?", answer: "Almost never. Matrix multiplication is not commutative — the row-column orientation changes the result, and often one product is undefined while the other is fine. Order matters whenever matrices are involved." },
    { question: "Why is matrix multiplication useful?", answer: "It composes linear transformations: applying A then B is exactly B×A applied once. It also powers networks — adjacency matrix powers count paths — and compresses data in machine learning and graphics." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Matrix Multiplication Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Matrix Multiplication Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Matrix Size (n×n)</label>
              <select value={size} onChange={e => changeSize(e.target.value)} className={inp}>
                <option value="2">2×2</option>
                <option value="3">3×3</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Matrix A</label>
                <textarea value={matA} onChange={e => setMatA(e.target.value)} rows={n} className={ta} placeholder="1 2&#10;3 4" />
              </div>
              <div>
                <label className={lbl}>Matrix B</label>
                <textarea value={matB} onChange={e => setMatB(e.target.value)} rows={n} className={ta} placeholder="5 6&#10;7 8" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">A × B</div>
                <div className="text-xl font-extrabold tracking-tight font-mono">{fmtM(result.matrix)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.matrix.length} × {result.matrix.length} result — computed entry-by-entry as dot products</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {rowSums(result.matrix).map((v, i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Result Row Magnitudes</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Sum of absolute values per row of the product</p>
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
            <h2 className="text-2xl font-bold mb-3">Row Times Column</h2>
            <p>Matrix multiplication is the workhorse of linear algebra: each entry of the product is a dot product — row i of A dotted with column j of B. This <strong>matrix multiplication calculator</strong> performs it step by step for 2×2 and 3×3 matrices.</p>
            <h2 className="text-2xl font-bold mb-3">Why Order Matters</h2>
            <p>Unlike ordinary multiplication, A×B ≠ B×A in general. Each orientation pairs different rows with different columns, and the two products often tell completely different stories. The calculator always multiplies A on the left by B on the right.</p>
            <h2 className="text-2xl font-bold mb-3">Where It Shows Up</h2>
            <p>Composing rotations in graphics, chaining layers in neural networks, counting paths in graphs, and solving systems via Cramer's rule all reduce to matrix products. Once you can multiply, a surprising amount of applied math opens up.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/matrix-multiplication-calculator" />
          <PopularCalculators exclude="/calculator/matrix-multiplication-calculator" />
        </div>
      </div>
    </>
  );
}
