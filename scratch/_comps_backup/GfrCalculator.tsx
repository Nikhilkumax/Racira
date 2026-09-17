"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface GfrResult {
  creatinine: number;
  age: number;
  sex: string;
  egfr: number;
  stage: string;
  stageLabel: string;
  stageDesc: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcGfr(creatinine: number, age: number, sex: string): GfrResult {
  const kappa = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.241 : -0.302;
  const scrK = creatinine / kappa;
  const egfr = 142 * Math.pow(Math.min(scrK, 1), alpha) * Math.pow(Math.max(scrK, 1), -1.2) * Math.pow(0.9938, age) * (sex === "female" ? 1.012 : 1);

  let stage: string, stageLabel: string, stageDesc: string;
  if (egfr >= 90) { stage = "G1"; stageLabel = "Normal"; stageDesc = "Kidney damage with normal function"; }
  else if (egfr >= 60) { stage = "G2"; stageLabel = "Mildly Decreased"; stageDesc = "Slightly reduced function, usually asymptomatic"; }
  else if (egfr >= 45) { stage = "G3a"; stageLabel = "Mild–Moderate"; stageDesc = "Mild to moderately reduced function"; }
  else if (egfr >= 30) { stage = "G3b"; stageLabel = "Moderate–Severe"; stageDesc = "Moderate to severely reduced function"; }
  else if (egfr >= 15) { stage = "G4"; stageLabel = "Severely Decreased"; stageDesc = "Severely reduced function — nephrology referral"; }
  else { stage = "G5"; stageLabel = "Kidney Failure"; stageDesc = "Kidney failure — dialysis or transplant consideration"; }

  const breakdown = [
    { label: "Serum Creatinine", value: `${creatinine} mg/dL` },
    { label: "Age", value: `${age} years` },
    { label: "Sex", value: sex === "female" ? "Female" : "Male" },
    { label: "eGFR (CKD-EPI 2021)", value: `${egfr.toFixed(1)} mL/min/1.73m²` },
    { label: "CKD Stage", value: `${stage} (${stageLabel})` },
    { label: "Classification", value: stageDesc },
    { label: "Kidney Function", value: `${Math.max(0, Math.min(100, egfr)).toFixed(0)}% of normal` },
    { label: "Equation", value: "CKD-EPI 2021 (race-free)" },
  ];
  const summaryStats = [
    { label: "eGFR", value: `${egfr.toFixed(1)} mL/min` },
    { label: "CKD Stage", value: stage },
    { label: "Classification", value: stageLabel },
    { label: "Creatinine", value: `${creatinine} mg/dL` },
    { label: "Age", value: `${age} yrs` },
    { label: "Sex", value: sex === "female" ? "Female" : "Male" },
    { label: "Function", value: `${Math.max(0, Math.min(100, egfr)).toFixed(0)}%` },
    { label: "Reference", value: "≥ 90 normal" },
  ];
  const chartData = [
    { name: "eGFR", value: Math.round(egfr), fill: "hsl(var(--primary))" },
    { name: "Normal (90)", value: 90, fill: "#10b981" },
    { name: "Moderate (45)", value: 45, fill: "#f59e0b" },
    { name: "Failure (15)", value: 15, fill: "#ef4444" },
  ];
  return { creatinine, age, sex, egfr, stage, stageLabel, stageDesc, breakdown, summaryStats, chartData };
}

const DEFAULTS = { creatinine: "1.1", age: "45", sex: "male" };

export default function GfrCalculator() {
  const [creatinine, setCreatinine] = useState(DEFAULTS.creatinine);
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [result, setResult] = useState<GfrResult | null>(null);

  const cr = parseFloat(creatinine) || 0;
  const ag = parseInt(age) || 0;
  const errs: string[] = [];
  if (cr <= 0) errs.push("Serum creatinine must be greater than 0.");
  if (cr > 20) errs.push("Creatinine looks unrealistic — enter mg/dL.");
  if (ag < 18 || ag > 120) errs.push("Age must be between 18 and 120.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcGfr(cr, ag, sex)); };
  const reset = () => {
    setCreatinine(DEFAULTS.creatinine); setAge(DEFAULTS.age); setSex(DEFAULTS.sex);
    setResult(calcGfr(1.1, 45, "male"));
  };
  useEffect(() => { setResult(calcGfr(1.1, 45, "male")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is eGFR?", answer: "Estimated glomerular filtration rate measures how well your kidneys filter blood — how many milliliters of blood they clear per minute per 1.73 m² of body surface." },
    { question: "Which equation is used?", answer: "The CKD-EPI 2021 equation, which is race-free and recommended by the National Kidney Foundation and KDIGO. It uses serum creatinine, age, and sex." },
    { question: "Is this a diagnosis?", answer: "No — eGFR is a screening estimate. A single low value can be caused by dehydration or muscle mass; confirm with repeat testing and a clinician before drawing conclusions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "GFR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">GFR Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Serum Creatinine</label>
                <div className={inp}><input type="number" step="0.1" value={creatinine} onChange={e => setCreatinine(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mg/dL</span></div>
              </div>
              <div>
                <label className={lbl}>Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">years</span></div>
              </div>
              <div>
                <label className={lbl}>Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={sel}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated GFR</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.egfr.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mt-1">mL/min/1.73m² · Stage {result.stage} ({result.stageLabel})</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`CKD Stage`, result.stage], ["Classification", result.stageLabel], ["Kidney Function", `${Math.max(0, Math.min(100, result.egfr)).toFixed(0)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Kidney Function Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">eGFR vs CKD Thresholds</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v} mL/min`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Your eGFR against the 90 / 45 / 15 reference lines</p>
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
            <h2 className="text-2xl font-bold mb-3">The CKD-EPI 2021 Equation</h2>
            <p>This <strong>GFR calculator</strong> implements the 2021 race-free CKD-EPI equation: eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.2 × 0.9938^Age × 1.012 (if female), with κ and α set by sex. It replaced older equations that incorporated race, which overstated kidney function in Black patients.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Stages</h2>
            <p>KDIGO stages run G1 (≥ 90, normal) through G5 (under 15, kidney failure). The GFR threshold at 60 mL/min distinguishes mild loss from chronic kidney disease, and values below 30 warrant nephrology referral.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting with Care</h2>
            <p>eGFR is an estimate, not a measurement. It dips temporarily with dehydration, high protein intake, and certain medications, and rises in pregnancy and with muscle mass. Interpret trends over time with your care team, not single numbers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gfr-calculator" />
          <PopularCalculators exclude="/calculator/gfr-calculator" />
        </div>
      </div>
    </>
  );
}
