"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Approximate GMAT Focus Edition score → percentile anchors (published GMAC data)
const TOTAL_PERCENTILES: [number, number][] = [
  [205, 1], [225, 3], [245, 6], [265, 10], [285, 15], [305, 21], [325, 28], [345, 37],
  [365, 46], [385, 55], [405, 63], [425, 71], [445, 79], [465, 85], [485, 91], [505, 95],
  [525, 98], [545, 99], [565, 100],
];

const QUANT_PERCENTILES: [number, number][] = [
  [60, 1], [65, 3], [70, 6], [75, 12], [80, 22], [83, 32], [85, 45], [87, 60], [89, 74], [90, 90],
];

const VERBAL_PERCENTILES: [number, number][] = [
  [60, 1], [65, 4], [70, 10], [75, 20], [80, 35], [83, 50], [85, 64], [87, 78], [89, 90], [90, 96],
];

function percentileFor(score: number, table: [number, number][]): number {
  if (score <= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [s1, p1] = table[i];
    const [s2, p2] = table[i + 1];
    if (score >= s1 && score <= s2) {
      const t = (score - s1) / (s2 - s1);
      return Math.round(p1 + (p2 - p1) * t);
    }
  }
  return table[table.length - 1][1];
}

interface GmatResult {
  total: number;
  quant: number;
  verbal: number;
  data: number;
  totalPct: number;
  quantPct: number;
  verbalPct: number;
  assessment: string;
  chartData: { name: string; value: number }[];
}

function calcGmat(total: number, quant: number, verbal: number, data: number): GmatResult {
  const totalPct = percentileFor(total, TOTAL_PERCENTILES);
  const quantPct = percentileFor(quant, QUANT_PERCENTILES);
  const verbalPct = percentileFor(verbal, VERBAL_PERCENTILES);
  let assessment: string;
  if (total >= 505) assessment = "Outstanding — competitive at top-tier programs";
  else if (total >= 445) assessment = "Strong — competitive at most selective programs";
  else if (total >= 385) assessment = "Solid — meets or exceeds many program averages";
  else if (total >= 325) assessment = "Developing — consider a prep plan and retake";
  else assessment = "Needs work — most programs expect higher";
  const chartData = [
    { name: "Total", value: totalPct },
    { name: "Quant", value: quantPct },
    { name: "Verbal", value: verbalPct },
  ];
  return { total, quant, verbal, data, totalPct, quantPct, verbalPct, assessment, chartData };
}

const DEFAULTS = { total: "445", quant: "80", verbal: "83", data: "80" };

const faqs = [
  { question: "What is the GMAT Focus Edition scoring scale?", answer: "The GMAT Focus Edition (2023+) scores each section (Quantitative, Verbal, Data Insights) 60–90 and the total 205–805 in 10-point steps. The old GMAT used 200–800 with a 0–6 essay. This calculator uses the Focus Edition scale." },
  { question: "What is a good GMAT score?", answer: "Percentile is what matters: 445 is roughly the median (≈55th), 505 lands near the 95th, and 545+ is the 99th. Top-10 MBA programs report averages around 515–545 on the Focus scale." },
  { question: "How do schools use the score?", answer: "Admissions committees compare your percentile against their applicant pool, then weight it against GPA, work experience, essays, and interviews. A strong quant percentile reassures them about your analytical skills; a strong verbal percentile signals communication ability." },
];

export default function GmatScoreCalculator() {
  const [total, setTotal] = useState(DEFAULTS.total);
  const [quant, setQuant] = useState(DEFAULTS.quant);
  const [verbal, setVerbal] = useState(DEFAULTS.verbal);
  const [data, setData] = useState(DEFAULTS.data);
  const [result, setResult] = useState<GmatResult>(() => calcGmat(445, 80, 83, 80));

  const handleCalculate = () => {
    const t = parseInt(total, 10);
    const q = parseInt(quant, 10);
    const v = parseInt(verbal, 10);
    const d = parseInt(data, 10);
    if (isNaN(t) || isNaN(q) || isNaN(v) || isNaN(d)) return;
    setResult(calcGmat(t, q, v, d));
  };

  const reset = () => {
    setTotal(DEFAULTS.total); setQuant(DEFAULTS.quant); setVerbal(DEFAULTS.verbal); setData(DEFAULTS.data);
    setResult(calcGmat(445, 80, 83, 80));
  };

  const breakdown = [
    { label: "Total Score (205–805)", value: `${result.total}`, highlight: false },
    { label: "Total Percentile", value: `${result.totalPct}th`, highlight: true },
    { label: "Quant Percentile", value: `${result.quantPct}th`, highlight: false },
    { label: "Verbal Percentile", value: `${result.verbalPct}th`, highlight: false },
    { label: "Data Insights", value: `${result.data}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "GMAT Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GMAT Score Percentile Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <GraduationCap className="w-4 h-4" /> Score → Percentile
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Total Score (205–805)</label>
                <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="input-calc" placeholder="445" min={205} max={805} step={10} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Quant (60–90)</label>
                  <input type="number" value={quant} onChange={(e) => setQuant(e.target.value)} className="input-calc" placeholder="80" min={60} max={90} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Verbal (60–90)</label>
                  <input type="number" value={verbal} onChange={(e) => setVerbal(e.target.value)} className="input-calc" placeholder="83" min={60} max={90} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Data Insights (60–90)</label>
                <input type="number" value={data} onChange={(e) => setData(e.target.value)} className="input-calc" placeholder="80" min={60} max={90} />
              </div>
              <p className="text-xs text-muted-foreground">Percentiles are approximate, based on GMAC's published Focus Edition data.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <GraduationCap className="w-4 h-4 text-primary" /> TOTAL PERCENTILE
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.totalPct}th</span>
                <span className="text-sm text-muted-foreground">percentile</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.assessment}</p>
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
              <h3 className="text-base font-bold mb-3">Percentile by Section</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => [`${v}th percentile`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Score Range", value: "205–805 (Focus Edition)" },
                  { label: "Median Total", value: "≈ 445 (55th)" },
                  { label: "Top-10 Program Avg", value: "≈ 515–545" },
                  { label: "Retake Policy", value: "Up to 5 attempts / 12 months" },
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
            <h2 className="text-2xl font-bold mb-3">About the GMAT Score Percentile Calculator</h2>
            <p>The GMAT Focus Edition scores each of its three sections from 60 to 90 and the total from 205 to 805 in 10-point steps. A raw score alone is hard to interpret — a 445 sounds like a failure but sits at the 55th percentile, while 505 is already a 95th-percentile score. Percentiles, which show where you stand among all test takers, are what admissions committees actually compare.</p>
            <h3>How schools read your profile</h3>
            <p>Admissions look at the total percentile first, then the section split. A balanced profile (near-equal quant and verbal) signals well-rounded preparation; a lopsided one can still work if the high section matches your target program's emphasis — finance programs value quant, consulting values verbal. If your score is below a program's 80th percentile, most applicants improve with structured prep and a retake, since the GMAT rewards test strategy as much as raw ability.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gmat-score-calculator" />
          <PopularCalculators exclude="/calculator/gmat-score-calculator" />
        </div>
      </div>
    </>
  );
}
