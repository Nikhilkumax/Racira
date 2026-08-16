"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp } from "lucide-react";

interface GpResult {
  a: number;
  r: number;
  n: number;
  nthTerm: number;
  sumN: number;
  sumInf: number | null;
  convergent: boolean;
  sequence: number[];
}

function calcGp(a: number, r: number, n: number): GpResult {
  const nthTerm = a * Math.pow(r, n - 1);
  let sumN: number;
  if (r === 1) sumN = a * n;
  else sumN = a * (1 - Math.pow(r, n)) / (1 - r);
  const convergent = Math.abs(r) < 1;
  const sumInf = convergent ? a / (1 - r) : null;
  const sequence = Array.from({ length: Math.min(n, 8) }, (_, i) => a * Math.pow(r, i));
  return { a, r, n, nthTerm, sumN, sumInf, convergent, sequence };
}

const DEFAULTS = { a: "3", r: "2", n: "6" };

const faqs = [
  { question: "What is a geometric progression?", answer: "A sequence where each term is the previous term times a constant ratio r. With a = 3 and r = 2: 3, 6, 12, 24, 48… The nth term is a·r^(n−1)." },
  { question: "When does a geometric series converge?", answer: "The infinite sum exists only when |r| < 1, giving S∞ = a/(1−r). With r = 1/2 and a = 1, the series 1 + 1/2 + 1/4 + … converges to exactly 2. If |r| ≥ 1 the terms grow without bound." },
  { question: "Where do geometric progressions appear?", answer: "Everywhere: compound interest, population growth, radioactive decay, loan amortization, music tuning (equal temperament), and even the classic chessboard wheat problem — 64 doublings produce more wheat than exists on Earth." },
];

export default function GeometricProgressionCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [r, setR] = useState(DEFAULTS.r);
  const [n, setN] = useState(DEFAULTS.n);
  const [result, setResult] = useState<GpResult>(() => calcGp(3, 2, 6));

  const handleCalculate = () => {
    const av = parseFloat(a);
    const rv = parseFloat(r);
    const nv = parseInt(n, 10);
    if (isNaN(av) || isNaN(rv) || isNaN(nv) || nv < 1) return;
    setResult(calcGp(av, rv, nv));
  };

  const reset = () => {
    setA(DEFAULTS.a); setR(DEFAULTS.r); setN(DEFAULTS.n);
    setResult(calcGp(3, 2, 6));
  };

  const breakdown = [
    { label: "First Term (a)", value: `${result.a}`, highlight: false },
    { label: "Common Ratio (r)", value: `${result.r}`, highlight: false },
    { label: "Term Count (n)", value: `${result.n}`, highlight: false },
    { label: `nth Term (a·r^(n−1))`, value: `${result.nthTerm.toLocaleString("en-US", { maximumFractionDigits: 6 })}`, highlight: true },
    { label: "Sum of First n Terms", value: `${result.sumN.toLocaleString("en-US", { maximumFractionDigits: 6 })}`, highlight: false },
    { label: "Infinite Sum (S∞)", value: result.sumInf !== null ? `${result.sumInf.toLocaleString("en-US", { maximumFractionDigits: 6 })}` : "Diverges (|r| ≥ 1)", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Geometric Progression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Geometric Progression Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <TrendingUp className="w-4 h-4" /> Geometric Sequence
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">First Term (a)</label>
                <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="input-calc" placeholder="3" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Ratio (r)</label>
                <input type="number" value={r} onChange={(e) => setR(e.target.value)} className="input-calc" placeholder="2" step="0.1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Terms (n)</label>
                <input type="number" value={n} onChange={(e) => setN(e.target.value)} className="input-calc" placeholder="6" min={1} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" /> NTH TERM
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {result.nthTerm.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                aₙ = {result.a} × {result.r}^({result.n}−1) — {result.convergent ? "this series converges to " + result.sumInf!.toLocaleString("en-US", { maximumFractionDigits: 6 }) : "this series diverges (|r| ≥ 1)"}.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Sequence (first {Math.min(result.n, 8)} terms)</h3>
              <div className="flex flex-wrap gap-2">
                {result.sequence.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-md bg-secondary/40 text-sm font-semibold">
                    {t.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Growth per Step", value: `${((Math.abs(result.r) - 1) * 100).toFixed(1)}% ${result.r >= 1 ? "growth" : result.r > 0 ? "decay" : "alternating"}` },
                  { label: "Doubling Steps (r=2)", value: "each term ×2" },
                  { label: "Sum Formula", value: "Sₙ = a(1−rⁿ)/(1−r)" },
                  { label: "Infinite Sum", value: result.sumInf !== null ? `S∞ = a/(1−r) = ${result.sumInf.toLocaleString("en-US", { maximumFractionDigits: 6 })}` : "diverges" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Geometric Progression Calculator</h2>
            <p>A geometric progression multiplies each term by a constant ratio r: a, ar, ar², ar³, …. The nth term is a·r^(n−1), and the sum of the first n terms is a(1−rⁿ)/(1−r) — with the special case r = 1 giving simply a·n. Growth by a fixed percentage is always geometric: a 5% annual return on $1,000 produces the sequence 1,050, 1,102.50, 1,157.63, …</p>
            <h3>Convergence and divergence</h3>
            <p>When the ratio's magnitude is below 1 — like r = 1/2 — each term shrinks and the infinite sum converges to a/(1−r). The classic example: 1 + 1/2 + 1/4 + 1/8 + … = 2. With |r| ≥ 1 the series grows without bound, which is why doubling sequences (the chessboard wheat problem) explode so quickly. The calculator reports both the finite sum and, when it exists, the infinite limit.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/geometric-progression-calculator" />
          <PopularCalculators exclude="/calculator/geometric-progression-calculator" />
        </div>
      </div>
    </>
  );
}
