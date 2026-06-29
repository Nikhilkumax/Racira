"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const QuadraticFormulaCalculator = () => {
  const DEFAULTS = { a: "1", b: "-5", c: "6" };
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [result, setResult] = useState<any>(null);

  const calculate = (aV = a, bV = b, cV = c) => {
    const an = parseFloat(aV), bn = parseFloat(bV), cn = parseFloat(cV);
    if (isNaN(an) || isNaN(bn) || isNaN(cn) || an === 0) return;
    const disc = bn * bn - 4 * an * cn;
    const vertex_x = -bn / (2 * an);
    const vertex_y = an * vertex_x * vertex_x + bn * vertex_x + cn;
    let roots: string[], rootsArr: number[] = [];

    if (disc > 0) {
      const r1 = (-bn + Math.sqrt(disc)) / (2 * an);
      const r2 = (-bn - Math.sqrt(disc)) / (2 * an);
      roots = [`x₁ = ${r1.toFixed(6)}`, `x₂ = ${r2.toFixed(6)}`];
      rootsArr = [r1, r2];
    } else if (disc === 0) {
      const r = -bn / (2 * an);
      roots = [`x = ${r.toFixed(6)} (double root)`];
      rootsArr = [r];
    } else {
      const real = (-bn / (2 * an)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * an)).toFixed(4);
      roots = [`x₁ = ${real} + ${imag}i`, `x₂ = ${real} − ${imag}i`];
    }

    const xMin = vertex_x - 5, xMax = vertex_x + 5;
    const chartData = Array.from({ length: 21 }, (_, i) => {
      const x = xMin + (i / 20) * (xMax - xMin);
      return { x: parseFloat(x.toFixed(2)), y: parseFloat((an * x * x + bn * x + cn).toFixed(4)) };
    });

    setResult({
      primary: disc >= 0 ? roots.join(",  ") : "Complex Roots",
      subtitle: disc > 0 ? "Two real roots" : disc === 0 ? "One real root (double)" : "Two complex conjugate roots",
      rows: [
        { label: "Equation", value: `${an}x² ${bn >= 0 ? "+" : ""}${bn}x ${cn >= 0 ? "+" : ""}${cn} = 0` },
        { label: "Discriminant (b²−4ac)", value: disc.toFixed(4) },
        { label: "Nature of Roots", value: disc > 0 ? "Two distinct real roots" : disc === 0 ? "One repeated real root" : "Two complex roots" },
        ...roots.map((r, i) => ({ label: `Root ${i + 1}`, value: r })),
        { label: "Vertex x-coordinate", value: vertex_x.toFixed(6) },
        { label: "Vertex y-coordinate", value: vertex_y.toFixed(6) },
        { label: "Parabola opens", value: an > 0 ? "Upward ↑" : "Downward ↓" },
      ],
      chartData, rootsArr,
      summary: [
        { label: "Discriminant", value: disc.toFixed(4) },
        { label: "Vertex", value: `(${vertex_x.toFixed(3)}, ${vertex_y.toFixed(3)})` },
        { label: "Opens", value: an > 0 ? "Upward" : "Downward" },
        { label: "Roots", value: roots.join(", "), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); calculate(DEFAULTS.a, DEFAULTS.b, DEFAULTS.c); };

  const faqs = [
    { question: "What is the quadratic formula?", answer: "x = (−b ± √(b²−4ac)) / (2a). It finds the roots (x-intercepts) of the equation ax² + bx + c = 0 where a ≠ 0." },
    { question: "What is the discriminant?", answer: "The discriminant is b²−4ac. If positive: two distinct real roots. If zero: one repeated real root. If negative: two complex conjugate roots." },
    { question: "What is the vertex of a parabola?", answer: "The vertex is the minimum or maximum point: x = −b/(2a), y = ax² + bx + c at that x. It is the axis of symmetry of the parabola." },
    { question: "When does a quadratic have no real solutions?", answer: "When the discriminant b²−4ac is negative. The parabola does not cross the x-axis. The solutions are complex numbers involving √(−discriminant)." },
    { question: "What does 'double root' mean?", answer: "When the discriminant equals zero, both roots are identical: x = −b/(2a). The parabola touches the x-axis at exactly one point (tangent)." },
    { question: "Can I factor instead of using the formula?", answer: "Yes — if the discriminant is a perfect square, the quadratic factors nicely. For x²−5x+6=0: (x−2)(x−3)=0, giving x=2 and x=3. The formula always works even when factoring is difficult." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Quadratic Formula Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quadratic Formula Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <p className="text-sm text-muted-foreground -mt-2">Solve ax² + bx + c = 0</p>
            <div>
              <label className="text-base font-medium block mb-1.5">a (coefficient of x²)</label>
              <input type="number" value={a} onChange={e => setA(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">b (coefficient of x)</label>
              <input type="number" value={b} onChange={e => setB(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="-5" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">c (constant term)</label>
              <input type="number" value={c} onChange={e => setC(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6" step="any" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Roots (x-values)</div>
                <div className="text-3xl font-bold text-primary break-words">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Parabola Graph</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [v, "y"]} labelFormatter={(l: any) => `x = ${l}`} />
                      <ReferenceLine y={0} stroke="#666" strokeWidth={1.5} />
                      {result.rootsArr?.map((r: number, i: number) => (
                        <ReferenceLine key={i} x={parseFloat(r.toFixed(2))} stroke="#10b981" strokeDasharray="4 4" />
                      ))}
                      <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Quadratic Formula Calculator?</h2>
            <p>This quadratic formula calculator solves any quadratic equation of the form ax² + bx + c = 0 using the quadratic formula, plots the parabola, and shows the vertex, discriminant, and nature of the roots. Pre-filled with x² − 5x + 6 = 0 (which factors as (x−2)(x−3) = 0, giving roots x=2 and x=3), the calculator demonstrates a clean example with two positive real roots.</p>
            <p>Quadratic equations appear in physics (projectile motion), engineering (structural analysis), economics (profit maximization), and geometry (area and distance problems). The quadratic formula provides a universal solution — working for any quadratic regardless of whether it factors easily.</p>
            <h2>The Quadratic Formula</h2>
            <p><strong>x = (−b ± √(b² − 4ac)) / (2a)</strong></p>
            <p>The ± symbol means there are generally two solutions: one using + and one using −. For x² − 5x + 6 = 0 (a=1, b=−5, c=6): Discriminant = (−5)² − 4(1)(6) = 25 − 24 = 1. x = (5 ± √1) / 2 = (5 ± 1) / 2. So x₁ = 3 and x₂ = 2.</p>
            <h2>The Discriminant: Nature of Roots</h2>
            <p>The discriminant D = b² − 4ac determines what kind of roots the equation has without actually solving it. <strong>D &gt; 0:</strong> Two distinct real roots — the parabola crosses the x-axis at two points. <strong>D = 0:</strong> One repeated real root — the parabola is tangent to the x-axis. <strong>D &lt; 0:</strong> Two complex conjugate roots — the parabola never crosses the x-axis.</p>
            <h2>The Vertex and Parabola</h2>
            <p>The vertex is the turning point of the parabola at x = −b/(2a). For our example: x_vertex = −(−5)/(2×1) = 2.5. y_vertex = 1(2.5)² − 5(2.5) + 6 = 6.25 − 12.5 + 6 = −0.25. The vertex (2.5, −0.25) is the minimum point (since a &gt; 0). The axis of symmetry is x = 2.5 — note that the two roots 2 and 3 are symmetric around 2.5.</p>
            <h2>Completing the Square</h2>
            <p>An alternative solution method: rewrite ax² + bx + c = 0 as (x + b/2a)² = (b² − 4ac)/(4a²). Taking the square root of both sides gives the quadratic formula. Completing the square is also used to convert the standard form to vertex form: y = a(x − h)² + k where (h, k) is the vertex.</p>
            <h2>Applications of Quadratic Equations</h2>
            <p><strong>Projectile motion:</strong> Height h = −½gt² + v₀t + h₀. Setting h=0 and solving for t gives the time of landing. <strong>Area problems:</strong> If a rectangle has perimeter 20m and area 21m², the dimensions satisfy x(10−x) = 21, or x²−10x+21 = 0, giving x=3 and x=7. <strong>Break-even analysis:</strong> Revenue and cost functions often intersect at quadratic solutions. Pair with the <a href="/calculator/break-even-calculator">break-even calculator</a> for business applications.</p>
            <h2>Tips for This Calculator</h2>
            <p>Enter a ≠ 0 (if a=0, the equation is linear, not quadratic). The parabola graph shows the function with green dashed vertical lines at real roots. The vertex is clearly identified. For complex roots, the parabola does not cross the x-axis — this is visible in the graph. Combine with the <a href="/calculator/polynomial-calculator">polynomial calculator</a> for higher-degree equations.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quadratic-formula-calculator" />
          <PopularCalculators exclude="/calculator/quadratic-formula-calculator" />
        </div>
      </div>
    </>
  );
};
export default QuadraticFormulaCalculator;
