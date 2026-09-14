"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sigma } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EigenResult {
  a: number;
  b: number;
  c: number;
  d: number;
  trace: number;
  det: number;
  disc: number;
  lambda1: number;
  lambda2: number;
  real1: number;
  imag1: number;
  real2: number;
  imag2: number;
  complex: boolean;
  chartData: { name: string; value: number }[];
}

function calcEigen(a: number, b: number, c: number, d: number): EigenResult {
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;
  const complex = disc < 0;
  const sqrtDisc = Math.sqrt(Math.abs(disc));
  const real1 = trace / 2;
  const real2 = trace / 2;
  const imag1 = complex ? sqrtDisc / 2 : 0;
  const imag2 = complex ? -sqrtDisc / 2 : 0;
  const lambda1 = complex ? real1 : (trace + Math.sqrt(disc)) / 2;
  const lambda2 = complex ? real1 : (trace - Math.sqrt(disc)) / 2;
  const chartData = complex
    ? [
        { name: "Re(λ)", value: real1 },
        { name: "|Im(λ)|", value: sqrtDisc / 2 },
      ]
    : [
        { name: "λ₁", value: lambda1 },
        { name: "λ₂", value: lambda2 },
      ];
  return { a, b, c, d, trace, det, disc, lambda1, lambda2, real1, imag1, real2, imag2, complex, chartData };
}

const DEFAULTS = { a: "4", b: "1", c: "2", d: "3" };

const faqs = [
  { question: "What is an eigenvalue?", answer: "An eigenvalue λ satisfies A·v = λ·v: the matrix scales the eigenvector v without changing its direction. Eigenvalues reveal a matrix's stretching behavior, stability, and natural frequencies." },
  { question: "How are eigenvalues found for a 2×2 matrix?", answer: "From the characteristic equation det(A − λI) = 0, which expands to λ² − trace·λ + det = 0. The quadratic formula gives λ = (trace ± √(trace² − 4·det)) ÷ 2." },
  { question: "What does a negative discriminant mean?", answer: "The eigenvalues are complex conjugates (a ± bi). Complex eigenvalues mean rotational dynamics — the system spirals rather than expanding or decaying along fixed axes." },
];

export default function EigenvalueCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [d, setD] = useState(DEFAULTS.d);
  const [result, setResult] = useState<EigenResult>(() => calcEigen(4, 1, 2, 3));

  useEffect(() => {
    const va = parseFloat(a);
    const vb = parseFloat(b);
    const vc = parseFloat(c);
    const vd = parseFloat(d);
    if (!isNaN(va) && !isNaN(vb) && !isNaN(vc) && !isNaN(vd)) setResult(calcEigen(va, vb, vc, vd));
  }, []);

  const reset = () => { setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); setD(DEFAULTS.d); setResult(calcEigen(parseFloat(DEFAULTS.a), parseFloat(DEFAULTS.b), parseFloat(DEFAULTS.c), parseFloat(DEFAULTS.d))); };
  const invalid = [a, b, c, d].some(v => isNaN(parseFloat(v)));

  const fmtLambda = (r: number, im: number) => (Math.abs(im) < 1e-10 ? r.toFixed(4) : `${r.toFixed(4)} ${im >= 0 ? "+" : "−"} ${Math.abs(im).toFixed(4)}i`);

  const breakdown = [
    { label: "Matrix", value: `[[${result.a}, ${result.b}], [${result.c}, ${result.d}]]` },
    { label: "Trace (a + d)", value: `${result.trace.toFixed(4)}` },
    { label: "Determinant (ad − bc)", value: `${result.det.toFixed(4)}` },
    { label: "Discriminant (t² − 4d)", value: `${result.disc.toFixed(4)}` },
    { label: "Eigenvalue λ₁", value: fmtLambda(result.lambda1, result.imag1), highlight: true },
    { label: "Eigenvalue λ₂", value: fmtLambda(result.lambda2, result.imag2) },
    { label: "Type", value: result.complex ? "Complex conjugate pair" : "Real eigenvalues" },
    { label: "Stability", value: result.complex ? "Rotational (spiral)" : Math.max(result.lambda1, result.lambda2) > 0 ? "Unstable (growth)" : "Stable (decay)" },
  ];

  const summaryStats = [
    { label: "λ₁", value: fmtLambda(result.lambda1, result.imag1) },
    { label: "λ₂", value: fmtLambda(result.lambda2, result.imag2) },
    { label: "Trace", value: `${result.trace.toFixed(4)}` },
    { label: "Determinant", value: `${result.det.toFixed(4)}` },
    { label: "Discriminant", value: `${result.disc.toFixed(4)}` },
    { label: "Type", value: result.complex ? "Complex" : "Real" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Eigenvalue Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Eigenvalue Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="text-sm font-medium mb-1 text-foreground">2×2 Matrix</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-a" className="block text-sm font-medium mb-1 text-foreground">a</label>
                <input id="ev-a" type="number" step="0.1" value={a} onChange={(e) => setA(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ev-b" className="block text-sm font-medium mb-1 text-foreground">b</label>
                <input id="ev-b" type="number" step="0.1" value={b} onChange={(e) => setB(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-c" className="block text-sm font-medium mb-1 text-foreground">c</label>
                <input id="ev-c" type="number" step="0.1" value={c} onChange={(e) => setC(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ev-d" className="block text-sm font-medium mb-1 text-foreground">d</label>
                <input id="ev-d" type="number" step="0.1" value={d} onChange={(e) => setD(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Sigma className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter numeric values for all four entries.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Eigenvalues</div>
              <div className="text-3xl md:text-4xl font-extrabold text-primary break-all">
                {fmtLambda(result.lambda1, result.imag1)} <span className="text-xl font-bold">,</span> {fmtLambda(result.lambda2, result.imag2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{result.complex ? "Complex conjugate pair" : "Real eigenvalues"} · λ² − {result.trace.toFixed(2)}λ + {result.det.toFixed(2)} = 0</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Trace</div>
                <div className="text-lg font-bold text-primary">{result.trace.toFixed(3)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Determinant</div>
                <div className="text-lg font-bold text-primary">{result.det.toFixed(3)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Discriminant</div>
                <div className="text-lg font-bold text-primary">{result.disc.toFixed(3)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
              <h3 className="text-base font-bold mb-3">{result.complex ? "Real and Imaginary Parts" : "Eigenvalues"}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(4), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold break-all">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Eigenvalue Calculator</h2>
            <p>For a 2×2 matrix, eigenvalues come from the characteristic equation λ² − trace·λ + det = 0. The quadratic formula yields both roots exactly: λ = (trace ± √(trace² − 4·det)) ÷ 2. For [[4, 1], [2, 3]]: trace 7, det 10, discriminant 9 → λ = (7 ± 3)/2 = 5 and 2.</p>
            <h3>What Eigenvalues Tell You</h3>
            <p>In dynamics, eigenvalues of the system matrix decide stability: all real parts negative means decay to equilibrium; any positive real part means growth; nonzero imaginary parts mean oscillation or spiraling. This is the same math behind vibrating beams, population models, and circuit transients.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/eigenvalue-calculator" />
          <PopularCalculators exclude="/calculator/eigenvalue-calculator" />
        </div>
      </div>
    </>
  );
}
