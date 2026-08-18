"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WellsInput {
  criteria: boolean[]; // 10 criteria
}

interface WellsResult {
  score: number;
  category: string;
  categoryColor: string;
  prevalence: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const CRITERIA = [
  "Active cancer (treatment within 6 months or palliative)",
  "Paralysis, paresis, or recent plaster immobilization of lower extremity",
  "Recently bedridden ≥3 days or major surgery within 12 weeks",
  "Localized tenderness along the deep venous system",
  "Entire leg swollen",
  "Calf swelling ≥3 cm compared to the asymptomatic leg",
  "Pitting edema confined to the symptomatic leg",
  "Collateral superficial veins (non-varicose)",
  "Previously documented DVT",
  "Alternative diagnosis as likely or more likely than DVT (−2)",
];

const CRITERIA_POINTS = [1, 1, 1, 1, 1, 1, 1, 1, 1, -2];

function calcWells(input: WellsInput): WellsResult {
  const score = input.criteria.reduce((sum, checked, i) => sum + (checked ? CRITERIA_POINTS[i] : 0), 0);
  const category = score >= 2 ? "DVT Likely" : "DVT Unlikely";
  const categoryColor = score >= 2 ? "text-red-500" : "text-emerald-600";
  const prevalence = score >= 2 ? 28 : 5; // original two-tier Wells study prevalence

  const donutData = [
    { name: "DVT Probability", value: prevalence, color: score >= 2 ? "#ef4444" : "#10b981" },
    { name: "No DVT", value: 100 - prevalence, color: "#e2e8f0" },
  ];

  const breakdown = [
    { label: "Score", value: `${score}` },
    { label: "Category", value: category },
    { label: "Estimated DVT Prevalence", value: `${prevalence}%` },
    ...CRITERIA.map((c, i) => ({
      label: c,
      value: input.criteria[i] ? `${CRITERIA_POINTS[i] > 0 ? "+" : ""}${CRITERIA_POINTS[i]}` : "No",
    })),
  ];

  const summaryStats = [
    { label: "Total Score", value: `${score}` },
    { label: "Category", value: category },
    { label: "DVT Probability", value: `${prevalence}%` },
    { label: "Criteria Present", value: `${input.criteria.filter(Boolean).length} of 10` },
    { label: "Positive Criteria", value: `${input.criteria.filter((c, i) => c && CRITERIA_POINTS[i] > 0).length}` },
    { label: "Negative Criteria", value: `${input.criteria.filter((c, i) => c && CRITERIA_POINTS[i] < 0).length}` },
  ];

  return { score, category, categoryColor, prevalence, donutData, breakdown, summaryStats };
}

const DEFAULTS: WellsInput = { criteria: [false, false, false, true, false, true, true, false, false, false] };

export default function WellsScoreForDvtCalculator() {
  const [criteria, setCriteria] = useState<boolean[]>(DEFAULTS.criteria);
  const [result, setResult] = useState<WellsResult | null>(null);

  const calculate = () => setResult(calcWells({ criteria }));
  const reset = () => {
    setCriteria(DEFAULTS.criteria);
    setResult(calcWells(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWells(DEFAULTS));
  }, []);

  const toggle = (i: number) => {
    const next = [...criteria];
    next[i] = !next[i];
    setCriteria(next);
  };

  const faqs = [
    { question: "What is the Wells score for DVT?", answer: "The Wells score is a validated clinical prediction rule for deep vein thrombosis. Ten clinical findings are scored (+1 or −2) and totaled: a score of 2 or higher means DVT is likely; below 2 means DVT is unlikely. It is used to decide whether imaging (ultrasound) is warranted." },
    { question: "What does the score mean for the patient?", answer: "In the original two-tier studies, roughly 28% of patients scoring 2+ had DVT on imaging, versus about 5% of those scoring below 2. The score never rules DVT in or out — it stratifies risk and guides further testing, usually combined with a D-dimer test." },
    { question: "Can I use this instead of seeing a doctor?", answer: "No. This calculator is an educational tool based on the published Wells criteria. Leg swelling, pain, and shortness of breath can signal DVT or pulmonary embolism, which require urgent medical evaluation. Never delay care based on a self-computed score." },
    { question: "Why does 'alternative diagnosis' subtract 2 points?", answer: "The single strongest indicator against DVT is finding another explanation that fits just as well or better — for example, a Baker's cyst or cellulitis. When such an alternative is likely, the Wells score drops by 2 points, pushing most patients into the 'unlikely' category." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Wells Score for DVT Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wells Score for DVT Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Clinical Criteria — select all that apply</label>
              <div className="flex flex-col gap-1.5">
                {CRITERIA.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${criteria[i] ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
                  >
                    <span className="leading-snug">{c}</span>
                    <span className={`shrink-0 text-xs font-bold ${criteria[i] ? "text-primary" : ""}`}>{CRITERIA_POINTS[i] > 0 ? `+${CRITERIA_POINTS[i]}` : CRITERIA_POINTS[i]}</span>
                  </button>
                ))}
              </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Wells Score</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.categoryColor}`}>{result.score} <span className="text-xl font-bold text-muted-foreground">/ 10 criteria</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Category: {result.category} · Estimated DVT prevalence {result.prevalence}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Score", `${result.score}`], ["Category", result.category], ["DVT Prevalence", `${result.prevalence}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Criteria Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Estimated DVT Probability</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                      <Legend />
                    </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">The Wells Clinical Prediction Rule</h2>
            <p>The Wells score is the most widely used pre-test probability tool for deep vein thrombosis. Nine clinical features add a point each, and one — an alternative diagnosis at least as likely as DVT — subtracts 2. A score of 2 or higher classifies the patient as DVT-likely; below 2, DVT-unlikely.</p>
            <h2 className="text-2xl font-bold mb-3">How It Guides Testing</h2>
            <p>In the original two-tier validation, about 28% of high-score patients had confirmed DVT versus about 5% of low-score patients. Clinically, the score is combined with a D-dimer test: low score + negative D-dimer usually rules out DVT without ultrasound; high score typically goes straight to imaging.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations and Safety</h2>
            <p>This calculator is an educational reproduction of the published criteria. It is not a diagnostic tool and does not replace clinical judgment. DVT and pulmonary embolism are medical emergencies — sudden leg swelling, chest pain, or shortness of breath warrant immediate medical attention regardless of the score.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wells-score-for-dvt-calculator" />
          <PopularCalculators exclude="/calculator/wells-score-for-dvt-calculator" />
        </div>
      </div>
    </>
  );
}
