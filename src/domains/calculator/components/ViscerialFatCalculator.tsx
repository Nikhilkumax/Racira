"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Activity } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const RISK_LEVELS = [
  { level: "Low", color: "text-emerald-600", bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20", max: 3.9 },
  { level: "Moderate", color: "text-amber-600", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20", max: 5.9 },
  { level: "High", color: "text-orange-600", bg: "from-orange-500/10 to-orange-500/5", border: "border-orange-500/20", max: 7.9 },
  { level: "Very High", color: "text-red-600", bg: "from-red-500/10 to-red-500/5", border: "border-red-500/20", max: 15 },
];

function getRisk(level: number) {
  return RISK_LEVELS.find(r => level <= r.max) || RISK_LEVELS[3];
}

export default function ViscerialFatCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("35");
  const [waist, setWaist] = useState("90");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("80");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [res, setRes] = useState<{ level: number; whr: number; whtR: number; riskInfo: typeof RISK_LEVELS[0]; bmi: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const w = parseFloat(waist) || 0;
    const h = parseFloat(height) || 0;
    const wt = parseFloat(weight) || 0;
    const a = parseFloat(age) || 0;
    if (!w || !h || !wt) return;

    const waistCm = unit === "in" ? w * 2.54 : w;
    const heightCm = unit === "in" ? h * 2.54 : h;

    // Waist-to-height ratio (WHtR)
    const whtR = waistCm / heightCm;

    // Estimated visceral fat level (1-15 scale, approximate model)
    let level: number;
    const baseRisk = gender === "male"
      ? (waistCm - 80) / 8 + a / 25
      : (waistCm - 68) / 8 + a / 30;

    level = Math.max(1, Math.min(15, Math.round(baseRisk * 10) / 10));

    // WHR (waist-hip ratio proxy using waist and estimated hip from weight/height)
    const bmi = wt / Math.pow(heightCm / 100, 2);
    const estimatedHip = gender === "male" ? waistCm * 0.95 + bmi * 0.3 : waistCm * 1.15 + bmi * 0.2;
    const whr = waistCm / estimatedHip;

    const riskInfo = getRisk(level);
    setRes({ level, whr, whtR, riskInfo, bmi });
  };

  const reset = () => {
    setGender("male"); setAge("35"); setWaist("90"); setHeight("175"); setWeight("80");
  };

  const chartData = res ? [
    { name: "Your Level", value: Math.min(100, (res.level / 15) * 100), fill: "hsl(var(--primary))" },
  ] : [];

  const benchmarkData = [
    { name: "Low (1-4)", max: 4, fill: "#10b981" },
    { name: "Moderate (4-6)", max: 6, fill: "#f59e0b" },
    { name: "High (6-8)", max: 8, fill: "#f97316" },
    { name: "Very High (8+)", max: 15, fill: "#ef4444" },
    ...(res ? [{ name: "Your Level", max: res.level, fill: "hsl(var(--primary))" }] : []),
  ];

  const faqs = [
    { question: "What is visceral fat?", answer: "Visceral fat is fat stored deep inside the abdominal cavity surrounding the liver, intestines, and other organs. Unlike subcutaneous fat (under the skin), visceral fat is metabolically active and strongly linked to insulin resistance, type 2 diabetes, heart disease, and certain cancers. It is measured on a scale from 1–15 in most health monitors." },
    { question: "What is a healthy visceral fat level?", answer: "A visceral fat level below 4 is considered low risk. Levels of 4–6 are moderate. Levels 7–8 indicate high risk, and anything above 9 is very high risk and warrants medical attention. Most health guidelines recommend keeping visceral fat at or below level 12 as an absolute maximum." },
    { question: "How is visceral fat measured accurately?", answer: "The gold standard is a DEXA scan or MRI/CT scan, which directly images the fat tissue around the organs. Consumer body composition scales estimate visceral fat using bioelectrical impedance analysis (BIA). Waist circumference and waist-to-height ratio are low-tech proxies that correlate well with visceral fat levels." },
    { question: "How do I reduce visceral fat?", answer: "Visceral fat responds well to aerobic exercise — aim for 150–300 minutes of moderate-intensity cardio per week. Reducing refined carbohydrates and added sugar, improving sleep quality, and managing stress (which drives cortisol-related fat storage) are all effective strategies. Strength training also helps by improving insulin sensitivity." },
    { question: "Why is waist circumference important?", answer: "Waist circumference is one of the strongest predictors of visceral fat accumulation. For men, a waist over 94 cm (37 in) signals elevated risk; over 102 cm (40 in) is high risk. For women, the thresholds are 80 cm (31.5 in) and 88 cm (34.5 in) respectively." },
    { question: "What is the waist-to-height ratio (WHtR)?", answer: "The waist-to-height ratio is your waist circumference divided by your height. A WHtR below 0.5 is considered healthy for most adults — a simple rule of thumb is 'keep your waist circumference less than half your height.' WHtR is increasingly recommended over BMI as a better predictor of cardiometabolic risk." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Visceral Fat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Visceral Fat Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Body Measurements</h2>
            <div className="flex gap-2">
              {(["male", "female"] as const).map(g => (
                <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${gender === g ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["cm", "in"] as const).map(u => (
                <button key={u} type="button" onClick={() => setUnit(u)} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${unit === u ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{u === "cm" ? "Metric (cm/kg)" : "Imperial (in/lb)"}</button>
              ))}
            </div>
            <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" min="18" max="100" />
            <CompactInput id="waist" label="Waist Circumference" value={waist} onChange={setWaist} suffix={unit} />
            <CompactInput id="height" label="Height" value={height} onChange={setHeight} suffix={unit} />
            <CompactInput id="weight" label="Weight" value={weight} onChange={setWeight} suffix={unit === "cm" ? "kg" : "lbs"} />
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Visceral Fat Analysis</h2>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className={`bg-primary/10 border-l-4 bg-gradient-to-br ${res.riskInfo.bg} border ${res.riskInfo.border} rounded-xl p-5 text-center`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Visceral Fat Level</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.level.toFixed(1)}</div>
                  <div className={`text-sm font-bold ${res.riskInfo.color}`}>Risk Level: {res.riskInfo.level}</div>
                  <div className="text-xs text-muted-foreground mt-1">Scale: 1–15 (healthy = below 4)</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Estimated Visceral Fat Level", value: res.level.toFixed(1), bold: true },
                        { label: "Risk Category", value: res.riskInfo.level },
                        { label: "Waist-to-Height Ratio (WHtR)", value: res.whtR.toFixed(3) },
                        { label: "WHtR Status", value: res.whtR < 0.5 ? "Healthy (< 0.5)" : res.whtR < 0.6 ? "Elevated" : "High Risk" },
                        { label: "Body Mass Index (BMI)", value: res.bmi.toFixed(1) },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-bold text-foreground`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Your Level vs Risk Zones</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { zone: "Low (1–4)", upper: 4, fill: "#10b981" },
                        { zone: "Moderate (4–6)", upper: 6, fill: "#f59e0b" },
                        { zone: "High (6–8)", upper: 8, fill: "#f97316" },
                        { zone: "Very High (8+)", upper: 15, fill: "#ef4444" },
                        { zone: "Your Level", upper: res.level, fill: "hsl(var(--primary))" },
                      ]} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="zone" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 15]} />
                        <Tooltip formatter={(v: any) => [Number(v).toFixed(1), "Level"]} />
                        <Bar dataKey="upper" radius={[4, 4, 0, 0]}>
                          {[
                            { fill: "#10b981" }, { fill: "#f59e0b" }, { fill: "#f97316" }, { fill: "#ef4444" }, { fill: "hsl(var(--primary))" }
                          ].map((entry, index) => (
                            <rect key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Visceral Fat?</h2>
            <p>Visceral fat is the fat that accumulates deep in the abdominal cavity, surrounding vital organs like the liver, pancreas, and intestines. Unlike subcutaneous fat — the soft fat you can pinch under your skin — visceral fat is metabolically active tissue that secretes inflammatory compounds, disrupts hormonal signals, and significantly raises the risk of chronic disease.</p>
            <p>Consumer-grade body composition monitors (like Tanita and InBody scales) express visceral fat as a level from 1 to 15 (or 1 to 30 in some systems). Levels below 4 are considered healthy. Levels above 9 represent very high risk and are associated with metabolic syndrome, elevated triglycerides, low HDL cholesterol, insulin resistance, and systemic inflammation.</p>

            <h2 className="text-2xl font-bold mb-3">Why Waist Circumference Matters</h2>
            <p>Waist circumference is the single most accessible way to proxy visceral fat without medical imaging. Unlike BMI, which can't distinguish between muscle and fat mass, waist circumference directly reflects central adiposity — fat concentrated around the midsection, which correlates strongly with visceral fat depots.</p>
            <p>International health organizations use the following waist circumference thresholds: Men — elevated risk above 94 cm (37 in), high risk above 102 cm (40 in). Women — elevated risk above 80 cm (31.5 in), high risk above 88 cm (34.5 in). These thresholds are adjusted downward for Asian populations, where metabolic complications arise at smaller waist circumferences.</p>

            <h2 className="text-2xl font-bold mb-3">Waist-to-Height Ratio: A Better Single Metric</h2>
            <p>The waist-to-height ratio (WHtR) divides waist circumference by total height. A WHtR below 0.5 — "keep your waist less than half your height" — is a simple, universally applicable rule that performs better than BMI in predicting cardiometabolic risk across diverse ethnicities and age groups. A WHtR of 0.5–0.6 represents moderate risk; above 0.6 indicates high risk of cardiovascular and metabolic disease.</p>

            <h2 className="text-2xl font-bold mb-3">Health Risks of Elevated Visceral Fat</h2>
            <p>Visceral fat is not merely storage — it is hormonally and immunologically active. It releases adipokines like leptin and resistin, drives systemic inflammation through cytokine secretion, and impairs the liver's ability to process insulin. High visceral fat levels are independently associated with type 2 diabetes, non-alcoholic fatty liver disease (NAFLD), cardiovascular disease, hypertension, sleep apnea, and certain cancers (particularly colorectal and breast cancer).</p>

            <h2 className="text-2xl font-bold mb-3">How to Reduce Visceral Fat</h2>
            <p>Visceral fat is more responsive to lifestyle interventions than subcutaneous fat. The most evidence-backed strategies include: aerobic exercise (brisk walking, cycling, swimming — 150+ minutes/week), reducing ultra-processed foods and added sugars, improving sleep quality (7–9 hours/night — sleep deprivation increases cortisol, which promotes fat storage), stress management (cortisol directly promotes visceral fat accumulation), and a diet rich in fiber, lean protein, and healthy fats.</p>
            <p>Strength training improves insulin sensitivity and preserves muscle mass, creating a metabolic environment less conducive to fat storage. The combination of aerobic exercise and resistance training is more effective than either alone for reducing visceral fat levels.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/visceral-fat-calculator" />
          <PopularCalculators exclude="/calculator/visceral-fat-calculator" />
        </div>
      </div>
    </>
  );
}
