"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Matrix = number[][];

interface InvResult {
  det: number;
  invertible: boolean;
  inverse: Matrix | null;
  verify: Matrix | null;
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

function detN(m: Matrix): number {
  const n = m.length;
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (n === 3) return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  if (n === 1) return m[0][0];
  let d = 0;
  for (let c = 0; c < n; c++) {
    const minor = m.slice(1).map((r) => r.filter((_, j) => j !== c));
    d += (c % 2 === 0 ? 1 : -1) * m[0][c] * detN(minor);
  }
  return d;
}

function inverse(m: Matrix): Matrix | null {
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

function mul(a: Matrix, b: Matrix): Matrix {
  return a.map((r, i) => b[0].map((_, j) => b.map((_, k) => r[k] * b[k][j]).reduce((s, v) => s + v, 0)));
}

function calcInv(m: Matrix): InvResult {
  const det = detN(m);
  const invertible = Math.abs(det) > 1e-12;
  const inv = inverse(m);
  const verify = inv ? mul(m, inv) : null;
  const breakdown = [
    { label: "Matrix A", value: fmtM(m) },
    { label: "Determinant", value: `${fmt(det, 4)}` },
    { label: "Invertible?", value: invertible ? "Yes — nonzero determinant" : "No — singular matrix" },
    ...(inv ? [{ label: "A⁻¹ (adj(A)/det)", value: fmtM(inv) }] : []),
    ...(verify ? [{ label: "Verification A·A⁻¹ (≈ I)", value: fmtM(verify) }] : []),
  ];
  const summaryStats = [
    { label: "Determinant", value: `${fmt(det, 4)}` },
    { label: "Invertible", value: invertible ? "Yes" : "No" },
    { label: "Size", value: `${m.length} × ${m.length}` },
    ...(inv ? [{ label: "A·A⁻¹ ≈ I", value: verify ? "Yes" : "No" }] : []),
  ];
  const chartData = inv
    ? inv.map((r, i) => ({ name: `Row ${i + 1} |Σ|`, value: Number(r.reduce((s, v) => s + Math.abs(v), 0).toFixed(3)), fill: i === 0 ? "hsl(var(--primary))" : "#f59e0b" }))
    : [{ name: "Det = 0", value: 0, fill: "hsl(var(--primary))" }];
  return { det, invertible, inverse: inv, verify, breakdown, summaryStats, chartData };
}

const DEFAULT_2 = "2 3\n1 4";
const DEFAULT_3 = "1 2 3\n0 1 4\n5 6 0";

export default function MatrixInverseCalculator() {
  const [size, setSize] = useState("2");
  const [mat, setMat] = useState(DEFAULT_2);
  const [result, setResult] = useState<InvResult | null>(null);

  const n = parseInt(size) || 2;
  const m = parse(mat, n);
  const errs: string[] = [];
  if (mat.trim().split("\n").length !== n) errs.push(`Matrix must have exactly ${n} rows.`);
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInv(m)); };
  const reset = () => {
    setSize("2"); setMat(DEFAULT_2);
    setResult(calcInv([[2, 3], [1, 4]]));
  };
  const changeSize = (s: string) => {
    setSize(s);
    const v = s === "2" ? DEFAULT_2 : "1 2 3\n0 1 4\n5 6 0";
    setMat(v);
    setResult(calcInv(parse(v, parseInt(s))));
  };
  useEffect(() => { setResult(calcInv([[2, 3], [1, 4]])); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm min-h-[64px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a matrix inverse?", answer: "The inverse A⁻¹ is the matrix that undoes A: multiplying A by A⁻¹ yields the identity matrix I. It exists exactly when the determinant is nonzero — i.e., when A is not singular." },
    { question: "How is the inverse computed?", answer: "A⁻¹ = adj(A) / det(A). The adjugate is the transpose of the cofactor matrix: for each element, take the minor's determinant with alternating signs, transpose, and divide by the determinant." },
    { question: "How do I verify the result?", answer: "Multiply A by the computed A⁻¹. If the product is the identity matrix (diagonal 1s, off-diagonal 0s), the inverse is correct — this calculator performs that check for you automatically." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Matrix Inverse Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Matrix Inverse Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Matrix Size</label>
              <select value={size} onChange={e => changeSize(e.target.value)} className={inp}>
                <option value="2">2×2</option>
                <option value="3">3×3</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Matrix A (one row per line)</label>
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
              <div className={`${result.invertible ? "bg-primary/10 border-l-4 border-primary" : "bg-destructive/10 border-l-4 border-destructive"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.invertible ? "text-primary" : "text-destructive"}`}>{result.invertible ? "Matrix Inverse" : "No Inverse"}</div>
                {result.invertible ? (
                  <div className="text-xl font-extrabold tracking-tight font-mono">{fmtM(result.inverse!)}</div>
                ) : (
                  <div className="text-4xl font-extrabold tracking-tight text-destructive">Singular</div>
                )}
                <div className="text-sm text-muted-foreground mt-1">det(A) = {fmt(result.det, 4)} · {result.invertible ? "A·A⁻¹ ≈ I — verified" : "zero determinant, A⁻¹ does not exist"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Det(A)", fmt(result.det, 4)], ["Invertible", result.invertible ? "Yes" : "No"], ["A·A⁻¹ ≈ I", result.verify ? "Yes" : "—"]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Inverse Row Magnitudes</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Sum of absolute values per row of A⁻¹ — large values mean a near-singular matrix</p>
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
            <h2 className="text-2xl font-bold mb-3">Undoing a Matrix</h2>
            <p>Just as division undoes multiplication, the <strong>matrix inverse</strong> undoes a linear transformation. If A maps x to b, then A⁻¹ maps b back to x — the reason inverse matrices solve systems of equations in one step.</p>
            <h2 className="text-2xl font-bold mb-3">The Adjugate Formula</h2>
            <p>A⁻¹ = adj(A) / det(A). Build the cofactor matrix by computing each element's minor with alternating signs, transpose it to get the adjugate, and divide every entry by the determinant. For 2×2 matrices this collapses to the familiar swap-and-negate shortcut.</p>
            <h2 className="text-2xl font-bold mb-3">When It Fails</h2>
            <p>A zero determinant means no inverse exists — the transformation squashes space onto a lower dimension, so information is lost and nothing can undo it. The calculator flags this case and shows the identity-matrix verification whenever an inverse does exist.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/matrix-inverse-calculator" />
          <PopularCalculators exclude="/calculator/matrix-inverse-calculator" />
        </div>
      </div>
    </>
  );
}
