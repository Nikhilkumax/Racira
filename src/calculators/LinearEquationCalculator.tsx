"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const LinearEquationCalculator = () => {
  const [mode, setMode] = useState<"single" | "system2" | "system3">("single");
  const [a1, setA1] = useState("2");
  const [b1, setB1] = useState("5");
  const [a2, setA2] = useState("3");
  const [b2, setB2] = useState("-1");
  const [c1, setC1] = useState("7");
  const [c2, setC2] = useState("4");
  // system 3
  const [a3, setA3] = useState("1");
  const [b3, setB3] = useState("1");
  const [c3, setC3] = useState("1");
  const [d1, setD1] = useState("6");
  const [d2, setD2] = useState("14");
  const [d3, setD3] = useState("6");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    if (mode === "single") {
      const na = parseFloat(a1) || 0, nb = parseFloat(b1) || 0;
      if (na === 0) return;
      const x = -nb / na;
      setResult({ type: "single", equation: `${na}x + ${nb} = 0`, x });
    } else if (mode === "system2") {
      const na1 = parseFloat(a1), nb1 = parseFloat(b1), nc1 = parseFloat(c1);
      const na2 = parseFloat(a2), nb2 = parseFloat(b2), nc2 = parseFloat(c2);
      const det = na1 * nb2 - na2 * nb1;
      if (det === 0) { setResult({ type: "error", message: "No unique solution (determinant = 0)" }); return; }
      const x = (nc1 * nb2 - nc2 * nb1) / det;
      const y = (na1 * nc2 - na2 * nc1) / det;
      setResult({ type: "system2", x, y });
    } else {
      const v = [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3].map(s => parseFloat(s) || 0);
      const [va1, vb1, vc1, vd1, va2, vb2, vc2, vd2, va3, vb3, vc3, vd3] = v;
      const det = va1*(vb2*vc3 - vb3*vc2) - vb1*(va2*vc3 - va3*vc2) + vc1*(va2*vb3 - va3*vb2);
      if (det === 0) { setResult({ type: "error", message: "No unique solution (determinant = 0)" }); return; }
      const x = (vd1*(vb2*vc3 - vb3*vc2) - vb1*(vd2*vc3 - vd3*vc2) + vc1*(vd2*vb3 - vd3*vb2)) / det;
      const y = (va1*(vd2*vc3 - vd3*vc2) - vd1*(va2*vc3 - va3*vc2) + vc1*(va2*vd3 - va3*vd2)) / det;
      const z = (va1*(vb2*vd3 - vb3*vd2) - vb1*(va2*vd3 - va3*vd2) + vd1*(va2*vb3 - va3*vb2)) / det;
      setResult({ type: "system3", x, y, z });
    }
  };

  const reset = () => {
    setShowResults(false);
    setA1("2"); setB1("5"); setA2("3"); setB2("-1"); setC1("7"); setC2("4");
    setA3("1"); setB3("1"); setC3("1"); setD1("6"); setD2("14"); setD3("6");
    setResult(null);
  };

  const faqs = [
    { question: "What is a linear equation?", answer: "A linear equation is an equation where each variable has degree 1, like ax + b = 0 or ax + by = c." },
    { question: "How do you solve a system of equations?", answer: "This calculator uses Cramer's rule (determinants) to find the unique solution for 2×2 and 3×3 systems." },
    { question: "When is there no solution?", answer: "When the determinant of the coefficient matrix is zero, the system has either no solution or infinitely many solutions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Linear Equation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Linear Equation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-wrap gap-2 mb-6">
                {(["single", "system2", "system3"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "single" ? "Single (ax+b=0)" : m === "system2" ? "2×2 System" : "3×3 System"}
                  </button>
                ))}
              </div>

              {mode === "single" && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Solve: ax + b = 0</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField id="a1" label="a" value={a1} onChange={setA1} />
                    <InputField id="b1" label="b" value={b1} onChange={setB1} />
                  </div>
                </div>
              )}

              {mode === "system2" && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-muted-foreground">a₁x + b₁y = c₁ &nbsp;&&nbsp; a₂x + b₂y = c₂</p>
                  <div className="grid grid-cols-3 gap-3">
                    <InputField id="a1" label="a₁" value={a1} onChange={setA1} />
                    <InputField id="b1" label="b₁" value={b1} onChange={setB1} />
                    <InputField id="c1" label="c₁" value={c1} onChange={setC1} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <InputField id="a2" label="a₂" value={a2} onChange={setA2} />
                    <InputField id="b2" label="b₂" value={b2} onChange={setB2} />
                    <InputField id="c2" label="c₂" value={c2} onChange={setC2} />
                  </div>
                </div>
              )}

              {mode === "system3" && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-muted-foreground">a₁x + b₁y + c₁z = d₁</p>
                  <div className="grid grid-cols-4 gap-3">
                    <InputField id="a1" label="a₁" value={a1} onChange={setA1} />
                    <InputField id="b1" label="b₁" value={b1} onChange={setB1} />
                    <InputField id="c1s" label="c₁" value={c1} onChange={setC1} />
                    <InputField id="d1" label="d₁" value={d1} onChange={setD1} />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <InputField id="a2" label="a₂" value={a2} onChange={setA2} />
                    <InputField id="b2" label="b₂" value={b2} onChange={setB2} />
                    <InputField id="c2s" label="c₂" value={c2} onChange={setC2} />
                    <InputField id="d2" label="d₂" value={d2} onChange={setD2} />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <InputField id="a3" label="a₃" value={a3} onChange={setA3} />
                    <InputField id="b3" label="b₃" value={b3} onChange={setB3} />
                    <InputField id="c3" label="c₃" value={c3} onChange={setC3} />
                    <InputField id="d3" label="d₃" value={d3} onChange={setD3} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Solve</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Solution</h2>
                {result.type === "error" ? (
                  <p className="text-destructive font-medium">{result.message}</p>
                ) : result.type === "single" ? (
                  <ResultDisplay items={[
                    { label: "Equation", value: 0, textValue: result.equation },
                    { label: "x", value: 0, textValue: result.x.toFixed(6), highlight: true },
                  ]} />
                ) : result.type === "system2" ? (
                  <ResultDisplay items={[
                    { label: "x", value: 0, textValue: result.x.toFixed(6), highlight: true },
                    { label: "y", value: 0, textValue: result.y.toFixed(6), highlight: true },
                  ]} />
                ) : (
                  <ResultDisplay items={[
                    { label: "x", value: 0, textValue: result.x.toFixed(6), highlight: true },
                    { label: "y", value: 0, textValue: result.y.toFixed(6), highlight: true },
                    { label: "z", value: 0, textValue: result.z.toFixed(6), highlight: true },
                  ]} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Solving Linear Equations</h2>
              <p>Linear equations are the foundation of algebra. This calculator solves single-variable equations (ax + b = 0) and systems of 2 or 3 equations using Cramer's rule with determinants.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/linear-equation-calculator" />
          <PopularCalculators exclude="/linear-equation-calculator" />
        </div>
      </div>
    </>
  );
};

export default LinearEquationCalculator;


