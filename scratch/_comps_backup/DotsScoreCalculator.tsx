"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type GenderKey = "male" | "female";

interface DotsResult {
  gender: GenderKey;
  bodyweight: number;
  total: number;
  coefficient: number;
  score: number;
  chartData: { name: string; value: number }[];
}

const COEFFS: Record<GenderKey, { A: number; B: number; C: number; D: number; E: number }> = {
  male: { A: -307.75076, B: 24.0900756, C: -0.1918759221, D: 0.0007391293, E: -0.000001093 },
  female: { A: -57.96288, B: 13.6175032, C: -0.1126655495, D: 0.0005158568, E: -0.0000010706 },
};

function calcDots(gender: GenderKey, bodyweight: number, total: number): DotsResult {
  const c = COEFFS[gender];
  const x = bodyweight;
  const denom = c.A + c.B * x + c.C * x * x + c.D * x * x * x + c.E * x * x * x * x;
  const coefficient = denom !== 0 ? 500 / denom : 0;
  const score = coefficient * total;
  const chartData = [
    { name: "Total Lifted (kg)", value: total },
    { name: "DOTS Score", value: score },
  ];
  return { gender, bodyweight, total, coefficient, score, chartData };
}

const DEFAULTS = { gender: "male" as GenderKey, weight: "75", total: "500" };

const faqs = [
  { question: "What is a DOTS score?", answer: "DOTS (Dynamic Objective Total Score) adjusts a powerlifting total for bodyweight so lifters of different sizes can be compared fairly. It replaced Wilks as the standard in the USAPL, USPA, and other federations." },
  { question: "How is DOTS calculated?", answer: "DOTS = total × 500 ÷ (A + Bx + Cx² + Dx³ + Ex⁴), where x is bodyweight in kg and A–E are gender-specific coefficients fitted to competitive data. The polynomial is the bodyweight adjustment." },
  { question: "What is a good DOTS score?", answer: "Club-level lifters often score 300–380, regional competitors 380–450, national-class 450–520, and elite/world-class lifters exceed 520–550, depending on weight class." },
];

export default function DotsScoreCalculator() {
  const [gender, setGender] = useState<GenderKey>(DEFAULTS.gender);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [result, setResult] = useState<DotsResult>(() => calcDots("male", 75, 500));

  useEffect(() => {
    const w = parseFloat(weight);
    const t = parseFloat(total);
    if (!isNaN(w) && !isNaN(t) && w > 0 && t >= 0) setResult(calcDots(gender, w, t));
  }, []);

  const reset = () => { setGender(DEFAULTS.gender); setWeight(DEFAULTS.weight); setTotal(DEFAULTS.total); setResult(calcDots(DEFAULTS.gender, parseFloat(DEFAULTS.weight), parseFloat(DEFAULTS.total))); };
  const invalid = isNaN(parseFloat(weight)) || isNaN(parseFloat(total)) || parseFloat(weight) <= 0 || parseFloat(total) < 0;

  const breakdown = [
    { label: "Gender", value: gender === "male" ? "Male" : "Female" },
    { label: "Bodyweight", value: `${result.bodyweight.toFixed(1)} kg` },
    { label: "Competition Total", value: `${result.total.toFixed(1)} kg` },
    { label: "DOTS Coefficient", value: `${result.coefficient.toFixed(4)}` },
    { label: "DOTS Score", value: `${result.score.toFixed(2)}`, highlight: true },
    { label: "Performance Class", value: result.score >= 520 ? "Elite / world class" : result.score >= 450 ? "National class" : result.score >= 380 ? "Regional class" : result.score >= 300 ? "Club level" : "Developing" },
  ];

  const summaryStats = [
    { label: "DOTS Score", value: `${result.score.toFixed(2)}` },
    { label: "Coefficient", value: `${result.coefficient.toFixed(4)}` },
    { label: "Total", value: `${result.total.toFixed(1)} kg` },
    { label: "Bodyweight", value: `${result.bodyweight.toFixed(1)} kg` },
    { label: "Gender", value: gender === "male" ? "Male" : "Female" },
    { label: "Class", value: result.score >= 450 ? "National+" : result.score >= 380 ? "Regional" : "Club / developing" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "DOTS Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DOTS Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dots-gender" className="block text-sm font-medium mb-1 text-foreground">Gender</label>
                <select id="dots-gender" value={gender} onChange={(e) => setGender(e.target.value as GenderKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="dots-weight" className="block text-sm font-medium mb-1 text-foreground">Bodyweight (kg)</label>
                <input id="dots-weight" type="number" min="1" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="dots-total" className="block text-sm font-medium mb-1 text-foreground">Competition Total (kg)</label>
              <input id="dots-total" type="number" min="0" step="0.5" value={total} onChange={(e) => setTotal(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Squat + bench press + deadlift, in kg</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Dumbbell className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive bodyweight and non-negative total.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">DOTS Score</div>
              <div className="text-4xl font-extrabold text-primary">{result.score.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.total.toFixed(1)} kg total at {result.bodyweight.toFixed(1)} kg · coefficient {result.coefficient.toFixed(4)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Coefficient</div>
                <div className="text-lg font-bold text-primary">{result.coefficient.toFixed(4)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total (kg)</div>
                <div className="text-lg font-bold text-primary">{result.total.toFixed(1)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Class</div>
                <div className="text-lg font-bold text-primary">{result.score >= 450 ? "National+" : result.score >= 380 ? "Regional" : "Club"}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">Total vs Adjusted Score</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(1), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the DOTS Score Calculator</h2>
            <p>DOTS adjusts a raw total for bodyweight using a fourth-order polynomial fitted to competitive powerlifting data. The score is total × 500 ÷ P(bodyweight), where P uses gender-specific coefficients — larger lifters get a lower coefficient because their raw totals are naturally heavier, not proportionally stronger.</p>
            <h3>DOTS vs Wilks</h3>
            <p>DOTS was adopted because Wilks over-rewarded mid-weight classes and penalized the heaviest and lightest lifters. DOTS produces flatter, fairer comparisons across weight classes, which is why the USAPL and USPA use it for best-lifter awards (with McCulloch coefficients for masters).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dots-score-calculator" />
          <PopularCalculators exclude="/calculator/dots-score-calculator" />
        </div>
      </div>
    </>
  );
}
