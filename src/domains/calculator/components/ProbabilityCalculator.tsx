"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function fmt(n: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

interface Inputs {
  pA: string;
  pB: string;
  pAB: string;
  mutExclusive: boolean;
  assumeIndependent: boolean;
}

interface Result {
  a: number;
  b: number;
  ab: number;
  aOrB: number;
  neither: number;
  aGivenB: number;
  bGivenA: number;
  aOnly: number;
  bOnly: number;
  independent: boolean;
  formulaNote: string;
}

function calculate(i: Inputs): Result {
  const a = Math.min(100, Math.max(0, parseFloat(i.pA) || 0)) / 100;
  const b = Math.min(100, Math.max(0, parseFloat(i.pB) || 0)) / 100;
  let ab = Math.min(100, Math.max(0, parseFloat(i.pAB) || 0)) / 100;
  let note = "P(A∩B) entered directly";
  if (i.mutExclusive) {
    ab = 0;
    note = "Mutually exclusive → P(A∩B) = 0";
  } else if (i.assumeIndependent) {
    ab = a * b;
    note = "Independent → P(A∩B) = P(A)×P(B)";
  }
  const aOrB = Math.min(1, Math.max(0, a + b - ab));
  const neither = 1 - aOrB;
  const aGivenB = b > 0 ? ab / b : 0;
  const bGivenA = a > 0 ? ab / a : 0;
  const aOnly = Math.max(0, a - ab);
  const bOnly = Math.max(0, b - ab);
  const independent = Math.abs(ab - a * b) < 1e-9;
  return { a, b, ab, aOrB, neither, aGivenB, bGivenA, aOnly, bOnly, independent, formulaNote: note };
}

const DEFAULTS: Inputs = { pA: "50", pB: "30", pAB: "12", mutExclusive: false, assumeIndependent: false };

function validate(i: Inputs): string[] {
  const errors: string[] = [];
  const pa = parseFloat(i.pA);
  const pb = parseFloat(i.pB);
  const pab = parseFloat(i.pAB);
  if (i.pA.trim() === "" || isNaN(pa)) errors.push("Enter P(A) as a percentage.");
  else if (pa < 0 || pa > 100) errors.push("P(A) must be between 0 and 100%.");
  if (i.pB.trim() === "" || isNaN(pb)) errors.push("Enter P(B) as a percentage.");
  else if (pb < 0 || pb > 100) errors.push("P(B) must be between 0 and 100%.");
  if (i.pAB.trim() === "" || isNaN(pab)) errors.push("Enter P(A∩B) as a percentage.");
  else if (pab < 0 || pab > 100) errors.push("P(A∩B) must be between 0 and 100%.");
  else if (!i.mutExclusive && !i.assumeIndependent && pab > Math.min(pa, pb)) errors.push("P(A∩B) cannot exceed the smaller of P(A) and P(B).");
  return errors;
}

export default function ProbabilityCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  useEffect(() => { setResult(calculate(inputs)); }, []);

  const errors = validate(inputs);
  const valid = errors.length === 0;
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));
  const toggle = (k: keyof Inputs) => () => setInputs(prev => ({ ...prev, [k]: !prev[k] as boolean }));
  const calc = () => { if (valid) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const pct = (v: number) => `${fmt(v * 100, 1)}%`;

  const pieData = [
    { name: "A only", value: result.aOnly * 100, fill: "hsl(var(--primary))" },
    { name: "B only", value: result.bOnly * 100, fill: "#f59e0b" },
    { name: "Both (A∩B)", value: result.ab * 100, fill: "#10b981" },
    { name: "Neither", value: result.neither * 100, fill: "#e2e8f0" },
  ];

  const faqs = [
    { question: "What does P(A ∪ B) mean?", answer: "P(A ∪ B) is the probability that A happens, B happens, or both — the union. It equals P(A) + P(B) − P(A∩B), subtracting the overlap once so it is not double-counted. The result is the chance that at least one of the two events occurs." },
    { question: "What is a conditional probability?", answer: "P(A|B) is the probability of A given that B has already occurred, computed as P(A∩B) / P(B). If knowing B changes the chance of A, the events are dependent; if P(A|B) equals P(A), they are independent." },
    { question: "What does 'mutually exclusive' mean?", answer: "Two events are mutually exclusive when they cannot both happen — P(A∩B) = 0. Rolling a 1 and rolling a 6 on a single die is a classic example. In that case the union formula simplifies to P(A) + P(B)." },
    { question: "How do I check if events are independent?", answer: "Events are independent when P(A∩B) equals P(A) × P(B). The calculator compares the two and flags a mismatch — if your overlap differs from the product, the events influence each other and conditional probabilities will differ from the unconditional ones." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Probability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Probability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>P(A) (%)</label>
                <input type="number" min={0} max={100} step="any" value={inputs.pA} onChange={e => set("pA")(e.target.value)} className={inp} placeholder="50" />
              </div>
              <div>
                <label className={lbl}>P(B) (%)</label>
                <input type="number" min={0} max={100} step="any" value={inputs.pB} onChange={e => set("pB")(e.target.value)} className={inp} placeholder="30" />
              </div>
            </div>
            <div>
              <label className={lbl}>P(A ∩ B) — both occur (%)</label>
              <input type="number" min={0} max={100} step="any" value={inputs.pAB} onChange={e => set("pAB")(e.target.value)} className={inp} placeholder="12" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Assumptions</div>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input type="checkbox" checked={inputs.mutExclusive} onChange={toggle("mutExclusive")} className="h-4 w-4 rounded border-input accent-primary" />
                        Events are mutually exclusive (P(A∩B) = 0)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input type="checkbox" checked={inputs.assumeIndependent} onChange={toggle("assumeIndependent")} className="h-4 w-4 rounded border-input accent-primary" />
                        Assume independence (P(A∩B) = P(A)×P(B))
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!valid && (
              <div className="space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{e}</p>)}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} disabled={!valid} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Enter two event probabilities and their overlap — the union, conditionals, and independence fall out.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">P(A ∪ B) — At Least One Occurs</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{pct(result.aOrB)}</div>
              <div className="text-sm text-muted-foreground font-medium">= {pct(result.a)} + {pct(result.b)} − {pct(result.ab)} · {result.formulaNote}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">P(A)</span>
                <span className="font-extrabold text-foreground">{pct(result.a)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">P(B)</span>
                <span className="font-extrabold text-foreground">{pct(result.b)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">P(A ∩ B)</span>
                <span className="font-extrabold text-foreground">{pct(result.ab)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Neither</span>
                <span className="font-extrabold text-foreground">{pct(result.neither)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">P(A ∪ B) — at least one</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-amber-700">{pct(result.aOrB)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">P(A ∩ B) — both</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{pct(result.ab)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">P(A | B) — A given B</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{pct(result.aGivenB)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">P(B | A) — B given A</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{pct(result.bGivenA)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">P(neither)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{pct(result.neither)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Independence check</td>
                    <td className={`p-2.5 pr-3 text-right font-semibold ${result.independent ? "text-emerald-600" : "text-red-500"}`}>{result.independent ? "Independent" : "Dependent"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Outcome Space</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={95} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${fmt(Number(v), 1)}%`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-1">A only, B only, both, and neither — the four regions always total 100%</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Probability Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">P(A):</span><span className="font-semibold">{pct(result.a)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(B):</span><span className="font-semibold">{pct(result.b)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(A ∩ B):</span><span className="font-semibold">{pct(result.ab)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(A ∪ B):</span><span className="font-semibold">{pct(result.aOrB)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(A | B):</span><span className="font-semibold">{pct(result.aGivenB)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(B | A):</span><span className="font-semibold">{pct(result.bGivenA)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">P(neither):</span><span className="font-semibold">{pct(result.neither)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Independent:</span><span className="font-semibold">{result.independent ? "Yes" : "No"}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Two Events, One Picture</h2>
            <p>Given the chances of event A, event B, and both happening together, this <strong>probability calculator</strong> reconstructs the full relationship between them: the union, the probability that neither occurs, both conditional probabilities, and whether the two events are independent.</p>
            <h2 className="text-2xl font-bold mb-3">The Union Needs the Overlap</h2>
            <p>Adding P(A) and P(B) double-counts the region where both occur. Subtracting P(A∩B) once corrects it — that is the inclusion–exclusion principle in its simplest form. When the events cannot co-occur, the overlap is zero and the formula collapses to plain addition.</p>
            <h2 className="text-2xl font-bold mb-3">Dependence Changes the Story</h2>
            <p>If P(A∩B) differs from P(A) × P(B), the events are dependent: knowing one changes the odds of the other. The conditional probabilities reveal exactly how — P(A|B) tells you the chance of A once B is known, which is the information that drives decision trees and Bayesian reasoning.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/probability-calculator" />
          <PopularCalculators exclude="/calculator/probability-calculator" />
        </div>
      </div>
    </>
  );
}
