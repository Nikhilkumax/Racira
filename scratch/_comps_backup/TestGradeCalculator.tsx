"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const PIE_COLORS = ["#10b981", "#ef4444"];

const NumInput = ({ id, label, value, onChange, min, step }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; step?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step={step || "any"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

interface Inputs { questions: string; wrong: string; }

interface Result {
  score: number;
  correct: number;
  letter: string;
  pie: { name: string; value: number; pct: number; color: string }[];
  scale: { wrong: number; grade: string }[];
}

const DEFAULTS: Inputs = { questions: "50", wrong: "5" };

function calculate(inputs: Inputs): Result {
  const total = Math.max(1, parseFloat(inputs.questions) || 0);
  const wrong = Math.min(total, Math.max(0, parseFloat(inputs.wrong) || 0));
  const correct = total - wrong;
  const score = (correct / total) * 100;
  const letter = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const parts = [
    { name: "Correct Answers", value: correct, color: PIE_COLORS[0] },
    { name: "Wrong Answers", value: wrong, color: PIE_COLORS[1] },
  ];
  let sum = 0;
  const pcts = parts.map(p => {
    const v = Math.round((p.value / total) * 1000) / 10;
    sum += v;
    return v;
  });
  if (sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] = Math.round((pcts[maxIdx] + diff) * 10) / 10;
  }
  const pie = parts.map((p, i) => ({ ...p, pct: pcts[i] })).filter(p => p.value > 0);
  const scale = Array.from({ length: Math.min(21, Math.ceil(total) + 1) }, (_, i) => ({ wrong: i, grade: (((total - Math.min(i, wrong + 10)) / total) * 100).toFixed(1) }));
  return { score, correct, letter, pie, scale: scale.map(s => ({ wrong: s.wrong, grade: (((total - Math.min(s.wrong, total)) / total) * 100).toFixed(1) })) };
}

const TestGradeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.questions) <= 0 || num(inputs.wrong) < 0 || num(inputs.wrong) > num(inputs.questions);

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const scoreColor = result.score >= 90 ? "text-emerald-600" : result.score >= 80 ? "text-primary" : result.score >= 70 ? "text-amber-600" : "text-red-500";

  const rows = [
    { label: "Number of Questions", value: fmt(num(inputs.questions)) },
    { label: "Number Wrong", value: fmt(num(inputs.wrong)) },
    { label: "Number Correct", value: fmt(result.correct) },
    { label: "Percentage Score", value: result.score.toFixed(1) + "%", highlight: true },
    { label: "Letter Grade", value: result.letter, highlight: true },
  ];

  const faqs = [
    { question: "How is the test grade calculated?", answer: "Score = (Total − Wrong) ÷ Total × 100. With the defaults, 50 questions with 5 wrong gives 45 correct ÷ 50 = 90.0%, an A." },
    { question: "Can I enter partial credit?", answer: "Yes — enter fractional wrong counts (e.g., 2.5) to model partial credit, or treat 'wrong' as points lost." },
    { question: "Does this use a curve?", answer: "No — it returns a straight percentage using the standard scale: A ≥ 90%, B ≥ 80%, C ≥ 70%, D ≥ 60%, F below." },
    { question: "How do I use the quick grading scale?", answer: "The scale shows the percentage for each number of wrong answers, letting a teacher grade a whole stack of tests without a calculator." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Test Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Test Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="total" label="Number of Questions" value={inputs.questions} onChange={set("questions")} min="1" />
              <NumInput id="wrong" label="Number Wrong" value={inputs.wrong} onChange={set("wrong")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Total questions must be &gt; 0 and wrong answers cannot exceed the total.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Percentage Score</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.score.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Letter grade: <span className={`font-bold ${scoreColor}`}>{result.letter}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Correct</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.correct)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wrong</span>
                <span className="font-extrabold text-red-600">{fmt(num(inputs.wrong))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Questions</span>
                <span className="font-extrabold text-primary">{fmt(num(inputs.questions))}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Correct vs Wrong Answers</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [fmt(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {result.pie.map((p) => (
                  <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />{p.name} — {p.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Quick Grading Scale</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {result.scale.map(s => (
                  <div key={s.wrong} className="flex justify-between px-2 py-1.5 rounded-md bg-background border border-border text-xs font-medium">
                    <span className="text-muted-foreground">-{s.wrong}</span>
                    <span className="text-foreground font-bold">{s.grade}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Effective Grading for Teachers</h2>
            <p>Grading a stack of papers is faster with a fixed scale. For a 50-question test, 5 wrong is 90.0% (A), 10 wrong is 80.0% (B), 15 wrong is 70.0% (C), and 20 wrong is 60.0% (D). The quick scale above prints those percentages for every count of wrong answers.</p>
            <h2 className="text-2xl font-bold mb-3">Partial Credit</h2>
            <p>When students earn partial credit, subtract only the points actually lost. A student who misses a 5-point question but earns 3 points of partial credit lost just 2 points — enter 2 (or 2.5 for half-credit) in the "Number Wrong" field to grade accordingly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/test-grade-calculator" />
          <PopularCalculators exclude="/calculator/test-grade-calculator" />
        </div>
      </div>
    </>
  );
};
export default TestGradeCalculator;
