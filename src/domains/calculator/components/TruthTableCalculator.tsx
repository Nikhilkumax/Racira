"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const OPS: Record<string, { label: string; fn: (a: boolean, b: boolean) => boolean }> = {
  and: { label: "A AND B", fn: (a, b) => a && b },
  or: { label: "A OR B", fn: (a, b) => a || b },
  xor: { label: "A XOR B", fn: (a, b) => a !== b },
  nand: { label: "A NAND B", fn: (a, b) => !(a && b) },
  nor: { label: "A NOR B", fn: (a, b) => !(a || b) },
  imp: { label: "A → B (implication)", fn: (a, b) => !a || b },
  bicond: { label: "A ↔ B (biconditional)", fn: (a, b) => a === b },
  notA: { label: "NOT A", fn: (a) => !a },
};

interface TruthRow {
  a: boolean;
  b: boolean;
  notA: boolean;
  notB: boolean;
  result: boolean;
}

interface TruthResult {
  opLabel: string;
  rows: TruthRow[];
  trueCount: number;
  falseCount: number;
  truePct: number;
  chartData: { name: string; count: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTruthTable(opKey: string, showNotA: boolean, showNotB: boolean): TruthResult {
  const op = OPS[opKey] ?? OPS.and;
  const combos: [boolean, boolean][] = [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ];
  const rows: TruthRow[] = combos.map(([a, b]) => ({
    a,
    b,
    notA: !a,
    notB: !b,
    result: op.fn(a, b),
  }));
  const trueCount = rows.filter((r) => r.result).length;
  const falseCount = rows.length - trueCount;
  const truePct = (trueCount / rows.length) * 100;

  const chartData = [
    { name: "True", count: trueCount, fill: "#10b981" },
    { name: "False", count: falseCount, fill: "#ef4444" },
  ];

  const breakdown = rows.map((r) => ({
    label: `A=${r.a ? 1 : 0}${showNotA ? `, ¬A=${r.notA ? 1 : 0}` : ""}, B=${r.b ? 1 : 0}${showNotB ? `, ¬B=${r.notB ? 1 : 0}` : ""}`,
    value: r.result ? "1 (True)" : "0 (False)",
  }));

  const summaryStats = [
    { label: "Operation", value: op.label },
    { label: "True Outcomes", value: `${trueCount} of ${rows.length}` },
    { label: "False Outcomes", value: `${falseCount} of ${rows.length}` },
    { label: "% True", value: `${truePct.toFixed(0)}%` },
    { label: "Classification", value: trueCount === 0 ? "Contradiction" : trueCount === rows.length ? "Tautology" : "Contingent" },
    { label: "Rows", value: `${rows.length}` },
  ];

  return { opLabel: op.label, rows, trueCount, falseCount, truePct, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TruthTableCalculator() {
  const [opKey, setOpKey] = useState("and");
  const [showNotA, setShowNotA] = useState(false);
  const [showNotB, setShowNotB] = useState(false);
  const [result, setResult] = useState<TruthResult | null>(null);

  const calculate = () => setResult(calcTruthTable(opKey, showNotA, showNotB));
  const reset = () => {
    setOpKey("and");
    setShowNotA(false);
    setShowNotB(false);
    setResult(calcTruthTable("and", false, false));
  };
  useEffect(() => {
    setResult(calcTruthTable("and", false, false));
  }, []);

  const faqs = [
    { question: "What is a truth table?", answer: "A truth table lists every possible combination of input values (0/1 or True/False) and shows the output of a logical operation for each combination. For two inputs there are exactly 2² = 4 rows; for three inputs, 2³ = 8." },
    { question: "What do the operations mean?", answer: "AND is true only when both inputs are true; OR is true when at least one is true; XOR (exclusive or) is true when exactly one is true; NAND and NOR are their negations; the implication A → B is false only when A is true and B is false." },
    { question: "What are tautologies and contradictions?", answer: "A tautology is an expression that is true for every combination of inputs (like A OR ¬A); a contradiction is false for every combination (like A AND ¬A). Anything else is contingent — sometimes true, sometimes false." },
    { question: "Why is the implication A → B odd?", answer: "The statement 'if A then B' is only violated when A holds but B does not. When A is false, the implication is vacuously true — that is why A → B has three true rows and one false row, which surprises many learners." },
    { question: "Where are truth tables used?", answer: "They are the foundation of digital circuit design (every logic gate is defined by its truth table), computer hardware, programming conditionals, and mathematical proofs in logic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Truth Table Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Truth Table Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Operation</label>
              <div className={inp}>
                <select value={opKey} onChange={(e) => setOpKey(e.target.value)} className={ci}>
                  <option value="and">A AND B</option>
                  <option value="or">A OR B</option>
                  <option value="xor">A XOR B</option>
                  <option value="nand">A NAND B</option>
                  <option value="nor">A NOR B</option>
                  <option value="imp">A → B (implication)</option>
                  <option value="bicond">A ↔ B (biconditional)</option>
                  <option value="notA">NOT A</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer rounded-md border border-border p-3">
                <input type="checkbox" checked={showNotA} onChange={(e) => setShowNotA(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                Show ¬A column
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer rounded-md border border-border p-3">
                <input type="checkbox" checked={showNotB} onChange={(e) => setShowNotB(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                Show ¬B column
              </label>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">True Outcomes</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.trueCount} <span className="text-2xl text-muted-foreground">/ {result.rows.length}</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.opLabel} · {result.truePct.toFixed(0)}% of rows are true</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["True", `${result.trueCount}`], ["False", `${result.falseCount}`], ["% True", `${result.truePct.toFixed(0)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Truth Table</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${r.value.startsWith("1") ? "bg-emerald-500/5" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Outcome Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [v, "Rows"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Truth Table?</h2>
            <p>A truth table enumerates every possible combination of boolean inputs and records the output of a logical expression for each. With two inputs there are four combinations — (0,0), (0,1), (1,0), (1,1) — and each operation produces a distinct pattern across them. That pattern is the operation's complete definition.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Key Operations</h2>
            <p><strong>AND</strong> lights up only on (1,1). <strong>OR</strong> lights up everywhere except (0,0). <strong>XOR</strong> lights up on the two mixed rows. <strong>NAND</strong> and <strong>NOR</strong> are the exact inverses. The <strong>implication</strong> A → B is the famously counter-intuitive one: false only when the premise holds and the conclusion fails, which gives it three true rows.</p>
            <h2 className="text-2xl font-bold mb-3">From Truth Tables to Circuits</h2>
            <p>Every digital device is built from logic gates whose behavior is specified by truth tables: AND, OR, NOT, NAND, NOR, XOR, and XNOR. Complex circuits — adders, memory, processors — are designed by combining these primitives, and boolean algebra simplifies the results. Understanding the four-row tables here is the first step into that world.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/truth-table-calculator" />
          <PopularCalculators exclude="/calculator/truth-table-calculator" />
        </div>
      </div>
    </>
  );
}
