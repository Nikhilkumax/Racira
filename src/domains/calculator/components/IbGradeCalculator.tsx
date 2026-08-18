"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SubjectGrade {
  name: string;
  score: string;
}

interface IbInputs {
  subjects: SubjectGrade[];
  tok: string;
  ee: string;
}

interface ChartPoint {
  name: string;
  points: number;
  bonus: boolean;
}

interface IbResults {
  subjectTotal: number;
  bonusPoints: number;
  totalScore: number;
  classification: string;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const GRADE_VALUES = ["1", "2", "3", "4", "5", "6", "7"];

function bonusPoints(tok: string, ee: string): number {
  const t = tok === "" ? "X" : tok;
  const e = ee === "" ? "X" : ee;
  if (t === "D" || t === "E" || t === "X" || e === "D" || e === "E" || e === "X") return 0;
  if (t === "A" && e === "A") return 3;
  if (t === "B" && e === "B") return 2;
  if ((t === "A" && e === "B") || (t === "B" && e === "A")) return 2;
  return 1;
}

function classification(total: number): string {
  if (total < 24) return "No Pass (below 24)";
  if (total <= 27) return "Pass (24-27)";
  if (total <= 32) return "Good (28-32)";
  if (total <= 38) return "Strong (33-38)";
  return "Excellent (39-45)";
}

function calcIb(i: IbInputs): IbResults {
  const subjectTotal = i.subjects.reduce((p, s) => p + (parseInt(s.score, 10) || 0), 0);
  const bonus = bonusPoints(i.tok, i.ee);
  const totalScore = subjectTotal + bonus;

  const chartData: ChartPoint[] = i.subjects.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name,
    points: parseInt(s.score, 10) || 0,
    bonus: false,
  }));
  if (bonus > 0) chartData.push({ name: "TOK+EE Bonus", points: bonus, bonus: true });

  const breakdown = [
    ...i.subjects.map((s) => ({ label: s.name, value: s.score })),
    { label: "Subject Total (max 42)", value: `${subjectTotal}` },
    { label: "TOK Grade", value: i.tok || "—" },
    { label: "EE Grade", value: i.ee || "—" },
    { label: "Bonus Points (TOK+EE)", value: `${bonus}`, highlight: true },
    { label: "Total IB Score", value: `${totalScore} / 45`, isTotal: true },
  ];

  const summaryStats = [
    { label: "Subject Total", value: `${subjectTotal} / 42` },
    { label: "Bonus Points", value: `${bonus}` },
    { label: "Total IB Score", value: `${totalScore} / 45` },
    { label: "Classification", value: classification(totalScore) },
    { label: "TOK Grade", value: i.tok || "—" },
    { label: "EE Grade", value: i.ee || "—" },
    { label: "Pass Threshold", value: "24" },
    { label: "Max Possible", value: "45" },
  ];

  return { subjectTotal, bonusPoints: bonus, totalScore, classification: classification(totalScore), chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULT_SUBJECTS: SubjectGrade[] = [
  { name: "HL Math", score: "5" },
  { name: "HL Physics", score: "5" },
  { name: "HL Chemistry", score: "5" },
  { name: "SL English A", score: "6" },
  { name: "SL History", score: "6" },
  { name: "SL Spanish B", score: "5" },
];

// 4. Component
export default function IbGradeCalculator() {
  const [subjects, setSubjects] = useState<SubjectGrade[]>(DEFAULT_SUBJECTS);
  const [tok, setTok] = useState("B");
  const [ee, setEe] = useState("B");
  const [result, setResult] = useState<IbResults>(() =>
    calcIb({ subjects: DEFAULT_SUBJECTS, tok: "B", ee: "B" })
  );

  useEffect(() => {
    setResult(calcIb({ subjects: DEFAULT_SUBJECTS, tok: "B", ee: "B" }));
  }, []);

  const updateRow = (i: number, field: keyof SubjectGrade, value: string) => {
    setSubjects((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const calculate = () => setResult(calcIb({ subjects, tok, ee }));
  const reset = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setTok("B");
    setEe("B");
    setResult(calcIb({ subjects: DEFAULT_SUBJECTS, tok: "B", ee: "B" }));
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is the IB Diploma score calculated?", answer: "Your IB score is the sum of your six subject grades (each graded 1-7, for a maximum of 42 points) plus up to 3 bonus points from TOK and the Extended Essay. The maximum total is 45 points, and the diploma is awarded with a minimum of 24 points." },
    { question: "How do TOK and EE bonus points work?", answer: "Theory of Knowledge and the Extended Essay are each graded A-E. The official matrix awards 3 points for two A grades, 2 points for combinations of A and B or two B grades, 1 point for combinations involving C, and 0 points if either is D or E." },
    { question: "What score do I need to pass?", answer: "The IB diploma requires at least 24 total points, plus conditions such as no grade 1 in any subject, no more than two grade 2s (at HL), at least 12 points across HL subjects, and completion of CAS. Many universities expect 30+; elite programs often look for 38-42." },
    { question: "What do the classification bands mean?", answer: "This calculator uses common reference bands: 24-27 is a pass, 28-32 is solid for many universities, 33-38 is competitive for selective programs, and 39-45 is exceptional — roughly the top 5% of IB candidates worldwide." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "IB Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IB Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-sm font-semibold text-foreground">Six Subjects (Graded 1-7)</div>
            <div className="space-y-2">
              {subjects.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                  <input type="text" value={s.name} onChange={(e) => updateRow(i, "name", e.target.value)} className={inp} placeholder="Subject" />
                  <select value={s.score} onChange={(e) => updateRow(i, "score", e.target.value)} className={`${inp} cursor-pointer font-medium`}>
                    {GRADE_VALUES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Core: TOK & Extended Essay</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tok" className={lbl}>TOK Grade</label>
                  <select id="tok" value={tok} onChange={(e) => setTok(e.target.value)} className={`${inp} cursor-pointer font-medium`}>
                    {["A", "B", "C", "D", "E"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ee" className={lbl}>Extended Essay Grade</label>
                  <select id="ee" value={ee} onChange={(e) => setEe(e.target.value)} className={`${inp} cursor-pointer font-medium`}>
                    {["A", "B", "C", "D", "E"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={calculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total IB Score</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.totalScore} <span className="text-xl text-muted-foreground">/ 45</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.classification}</div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Subject Total", `${result.subjectTotal} / 42`],
                ["Bonus Points", `${result.bonusPoints}`],
                ["Diploma Status", result.totalScore >= 24 ? "Pass (24+)" : "Below 24"],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? (result.totalScore >= 24 ? "text-emerald-600" : "text-red-500") : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Score Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Subject Scores (1-7 Scale)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 7]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip formatter={(v: number) => [`${v} points`, "Score"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={d.bonus ? "#10b981" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Green bar shows the TOK + EE bonus points added to your six subject grades.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the IB Diploma Is Scored</h2>
            <p>The International Baccalaureate Diploma Programme awards each of six subjects a grade from 1 (lowest) to 7 (highest), for a maximum of 42 points. Three additional points are available through the Theory of Knowledge (TOK) course and the Extended Essay (EE). The total possible score is 45.</p>
            <h2 className="text-2xl font-bold mb-3">TOK and EE Bonus Matrix</h2>
            <p>The bonus is awarded from an official matrix: two A grades earn 3 points; combinations of A and B or two B grades earn 2 points; any combination involving a C earns 1 point; and a D or E in either component earns 0 points. This calculator applies the matrix exactly.</p>
            <h2 className="text-2xl font-bold mb-3">Diploma Requirements</h2>
            <p>Earning 24 points is only the start of the requirements. Candidates must also complete CAS (Creativity, Activity, Service), have no grade 1 in any subject, no more than two grade 2s, no more than three grade 3s, score at least 12 points across HL subjects (11 for those taking four HLs), and earn at least 8 points across SL subjects.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ib-grade-calculator" />
          <PopularCalculators exclude="/calculator/ib-grade-calculator" />
        </div>
      </div>
    </>
  );
}
