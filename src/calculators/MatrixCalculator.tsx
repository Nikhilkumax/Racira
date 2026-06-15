"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Matrix = number[][];

const parse = (s: string, rows: number, cols: number): Matrix => {
  const lines = s.trim().split("\n");
  return Array.from({ length: rows }, (_, r) => {
    const vals = (lines[r] || "").trim().split(/[\s,]+/);
    return Array.from({ length: cols }, (_, c) => parseFloat(vals[c]) || 0);
  });
};

const fmt = (m: Matrix) => m.map(r => r.map(v => v.toFixed(2)).join("  ")).join("\n");

const det2 = (m: Matrix): number => m[0][0] * m[1][1] - m[0][1] * m[1][0];
const det3 = (m: Matrix): number =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

const matMul = (a: Matrix, b: Matrix): Matrix => {
  const rows = a.length, cols = b[0].length, inner = b.length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      Array.from({ length: inner }, (_, k) => a[i][k] * b[k][j]).reduce((s, v) => s + v, 0)
    )
  );
};

const matAdd = (a: Matrix, b: Matrix, sub = false): Matrix =>
  a.map((r, i) => r.map((v, j) => sub ? v - b[i][j] : v + b[i][j]));

const transpose = (m: Matrix): Matrix =>
  Array.from({ length: m[0].length }, (_, j) => m.map(r => r[j]));

const MatrixCalculator = () => {
  const [op, setOp] = useState<"add" | "multiply" | "determinant" | "transpose">("add");
  const [size, setSize] = useState("2");
  const [matA, setMatA] = useState("1 2\n3 4");
  const [matB, setMatB] = useState("5 6\n7 8");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const n = parseInt(size) || 2;
    const a = parse(matA, n, n);

    if (op === "determinant") {
      if (n === 2) setResult({ type: "det", value: det2(a) });
      else if (n === 3) setResult({ type: "det", value: det3(a) });
      else return;
    } else if (op === "transpose") {
      setResult({ type: "matrix", label: "Transpose", matrix: transpose(a) });
    } else {
      const b = parse(matB, n, n);
      if (op === "add") {
        setResult({ type: "matrix", label: "A + B", matrix: matAdd(a, b) });
      } else {
        setResult({ type: "matrix", label: "A × B", matrix: matMul(a, b) });
      }
    }
  };

  const reset = () => {
    setShowResults(false); setMatA("1 2\n3 4"); setMatB("5 6\n7 8"); setResult(null); };

  const faqs = [
    { question: "How do I enter a matrix?", answer: "Enter each row on a new line, separating values with spaces or commas. For a 2×2 matrix: '1 2' on line 1 and '3 4' on line 2." },
    { question: "What is a determinant?", answer: "The determinant is a scalar value computed from a square matrix that indicates whether the matrix is invertible and represents the scaling factor of the linear transformation." },
    { question: "What is matrix multiplication?", answer: "Matrix multiplication combines two matrices by computing the dot product of rows from the first matrix with columns of the second. The number of columns in A must equal the number of rows in B." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Matrix Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Matrix Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-wrap gap-2 mb-6">
                {(["add", "multiply", "determinant", "transpose"] as const).map(m => (
                  <button key={m} onClick={() => { setOp(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${op === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "add" ? "Add (A+B)" : m === "multiply" ? "Multiply (A×B)" : m === "determinant" ? "Determinant" : "Transpose"}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Matrix Size (n×n)</label>
                <select value={size} onChange={e => setSize(e.target.value)} className="input-calc">
                  <option value="2">2×2</option>
                  <option value="3">3×3</option>
                </select>
              </div>

              <div className={`grid ${op === "add" || op === "multiply" ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-6`}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Matrix A</label>
                  <textarea value={matA} onChange={e => setMatA(e.target.value)} rows={parseInt(size) || 2} className="input-calc font-mono text-sm" placeholder="1 2&#10;3 4" />
                </div>
                {(op === "add" || op === "multiply") && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Matrix B</label>
                    <textarea value={matB} onChange={e => setMatB(e.target.value)} rows={parseInt(size) || 2} className="input-calc font-mono text-sm" placeholder="5 6&#10;7 8" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                {result.type === "det" ? (
                  <ResultDisplay items={[{ label: "Determinant", value: 0, textValue: result.value.toFixed(4), highlight: true }]} />
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{result.label}</p>
                    <pre className="bg-secondary rounded-lg p-4 font-mono text-sm text-foreground">{fmt(result.matrix)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Matrix Operations</h2>
              <p>Matrices are rectangular arrays of numbers used in linear algebra. This calculator supports addition, multiplication, determinant calculation, and transposition for 2×2 and 3×3 matrices.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/matrix-calculator" />
          <PopularCalculators exclude="/matrix-calculator" />
        </div>
      </div>
    </>
  );
};

export default MatrixCalculator;


