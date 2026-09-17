"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface InequalityResult {
  a: number;
  b: number;
  c: number;
  op: string;
  opSymbol: string;
  boundary: number;
  solution: string;
  flipped: boolean;
  testPass: number;
  testFail: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function solveInequality(a: number, b: number, c: number, op: string): InequalityResult {
  const boundary = a !== 0 ? (c - b) / a : 0;
  const flipped = a < 0;
  const opSymbol = op;
  const solution = a === 0
    ? (op === "<" ? (b < c ? "All real numbers" : "No solution") : op === "<=" ? (b <= c ? "All real numbers" : "No solution") : op === ">" ? (b > c ? "All real numbers" : "No solution") : (b >= c ? "All real numbers" : "No solution"))
    : `x ${flipped ? (op.includes("<") ? ">" : "<") : op} ${boundary.toFixed(4)}`;

  const testPass = flipped ? boundary - 1 : boundary - 1;
  const testFail = flipped ? boundary + 1 : boundary + 1;
  const leftAtBoundary = a * boundary + b;

  const breakdown = [
    { label: "Inequality", value: `${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)} ${opSymbol} ${c}` },
    { label: "Standard Form", value: `${a}x + ${b} ${opSymbol} ${c}` },
    { label: "Coefficient a", value: `${a}` },
    { label: "Boundary (x = (c−b)/a)", value: `${boundary.toFixed(4)}` },
    { label: "Direction Flip (a < 0)", value: flipped ? "Yes — reversed" : "No" },
    { label: "Solution Set", value: solution },
    { label: "Test Point Satisfying", value: `x = ${testPass} → ${a * testPass + b} ${opSymbol} ${c} ${a * testPass + b < c === (op === "<" || op === "<=") ? "✓ true" : "—"}` },
    { label: "Left Side at Boundary", value: `${leftAtBoundary.toFixed(4)} (equals ${c})` },
  ];
  const summaryStats = [
    { label: "Solution", value: solution },
    { label: "Boundary", value: `${boundary.toFixed(4)}` },
    { label: "Operator", value: opSymbol },
    { label: "Coefficient a", value: `${a}` },
    { label: "Constant b", value: `${b}` },
    { label: "RHS c", value: `${c}` },
    { label: "Flipped", value: flipped ? "Yes" : "No" },
    { label: "Left at Boundary", value: `${leftAtBoundary.toFixed(2)}` },
  ];
  const chartData = [
    { name: "Left (ax+b)", value: Math.round(leftAtBoundary * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "Right (c)", value: Math.round(c * 100) / 100, fill: "#10b981" },
  ];
  return { a, b, c, op, opSymbol, boundary, solution, flipped, testPass, testFail, breakdown, summaryStats, chartData };
}

const DEFAULTS = { a: "2", b: "3", c: "11", op: "<" };

export default function InequalityCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [op, setOp] = useState(DEFAULTS.op);
  const [result, setResult] = useState<InequalityResult | null>(null);

  const av = parseFloat(a) || 0;
  const bv = parseFloat(b) || 0;
  const cv = parseFloat(c) || 0;
  const errs: string[] = [];
  if (av === 0) errs.push("Coefficient a cannot be zero (linear inequality).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(solveInequality(av, bv, cv, op)); };
  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); setOp(DEFAULTS.op);
    setResult(solveInequality(2, 3, 11, "<"));
  };
  useEffect(() => { setResult(solveInequality(2, 3, 11, "<")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I solve a linear inequality?", answer: "Isolate x the same way you solve an equation — subtract b, divide by a — with one critical exception: multiplying or dividing by a negative number reverses the inequality sign." },
    { question: "Why does the sign flip?", answer: "Multiplying both sides by a negative reflects the number line: 2 < 3 becomes −2 > −3. Since dividing by a negative coefficient does the same, the inequality must reverse." },
    { question: "What does the solution mean?", answer: "x < 4 means every number below 4 satisfies the inequality, while 4 itself (and everything above) does not. The boundary splits the number line into satisfying and non-satisfying halves." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Inequality Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Inequality Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Coefficient a</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Constant b</label>
                <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Operator</label>
                <select value={op} onChange={e => setOp(e.target.value)} className={sel}>
                  <option value="<">&lt;</option>
                  <option value="<=">≤</option>
                  <option value=">">&gt;</option>
                  <option value=">=">≥</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Right Side c</label>
                <div className={inp}><input type="number" value={c} onChange={e => setC(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Solution Set</div>
                <div className="text-4xl font-extrabold tracking-tight break-all">{result.solution}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.a}x {result.b >= 0 ? "+" : "−"} {Math.abs(result.b)} {result.opSymbol} {result.c} · boundary {result.boundary.toFixed(4)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Boundary`, result.boundary.toFixed(4)], ["Sign Flipped", result.flipped ? "Yes (a < 0)" : "No"], ["Operator", result.opSymbol]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Solving Steps</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">At the Boundary</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Both sides are equal at the boundary — the split point of the solution set</p>
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
            <h2 className="text-2xl font-bold mb-3">Solving Linear Inequalities</h2>
            <p>This <strong>inequality calculator</strong> solves ax + b ◯ c by isolating x: subtract b from both sides, then divide by a. The single rule that differs from equation solving — flip the sign when a is negative — is applied and reported automatically.</p>
            <h2 className="text-2xl font-bold mb-3">The Flip Rule</h2>
            <p>Inequalities reverse when both sides are multiplied or divided by a negative number. For 2x + 3 &lt; 11, dividing by positive 2 keeps the direction and yields x &lt; 4. Had the coefficient been −2, the solution would flip to x &gt; −4.</p>
            <h2 className="text-2xl font-bold mb-3">Testing the Solution</h2>
            <p>Verify by plugging in a point: x = 3 gives 9 &lt; 11 ✓, while x = 5 gives 13 &lt; 11 ✗. Any value on the correct side of the boundary satisfies the inequality — that is the whole solution set.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inequality-calculator" />
          <PopularCalculators exclude="/calculator/inequality-calculator" />
        </div>
      </div>
    </>
  );
}
