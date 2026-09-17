"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HipWaistInput {
  hip: number;
  waist: number;
  sex: "male" | "female";
}

interface HipWaistResult {
  ratio: number;
  status: string;
  statusColor: string;
  threshold: number;
  chartData: { name: string; inches: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHipWaist(input: HipWaistInput): HipWaistResult {
  const ratio = input.waist > 0 ? input.hip / input.waist : 0;
  // Inverse of the WHO waist-to-hip thresholds: men 0.90, women 0.85
  const threshold = input.sex === "male" ? 1.111 : 1.176;
  const status = ratio > 0 && ratio >= threshold ? "Low Risk" : "Elevated Risk";
  const statusColor = ratio > 0 && ratio >= threshold ? "text-emerald-600" : "text-amber-500";

  const chartData = [
    { name: "Hip", inches: Math.max(0, input.hip), fill: "#10b981" },
    { name: "Waist", inches: Math.max(0, input.waist), fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Hip Circumference", value: `${input.hip.toFixed(1)} in` },
    { label: "Waist Circumference", value: `${input.waist.toFixed(1)} in` },
    { label: "Sex", value: input.sex === "male" ? "Male" : "Female" },
    { label: "Hip-to-Waist Ratio", value: ratio > 0 ? ratio.toFixed(2) : "—" },
    { label: "Low-Risk Threshold", value: `≥ ${threshold.toFixed(2)}` },
    { label: "Health Risk Level", value: status },
  ];

  const summaryStats = [
    { label: "Hip-to-Waist Ratio", value: ratio > 0 ? ratio.toFixed(2) : "—" },
    { label: "Health Risk Level", value: status },
    { label: "Low-Risk Threshold", value: `≥ ${threshold.toFixed(2)}` },
    { label: "Hip", value: `${input.hip.toFixed(1)} in` },
    { label: "Waist", value: `${input.waist.toFixed(1)} in` },
    { label: "Hip-Waist Difference", value: `${(input.hip - input.waist).toFixed(1)} in` },
  ];

  return { ratio, status, statusColor, threshold, chartData, breakdown, summaryStats };
}

const DEFAULTS: HipWaistInput = { hip: 40, waist: 32, sex: "female" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function HipToWaistRatioCalculator() {
  const [hip, setHip] = useState(String(DEFAULTS.hip));
  const [waist, setWaist] = useState(String(DEFAULTS.waist));
  const [sex, setSex] = useState<HipWaistInput["sex"]>(DEFAULTS.sex);
  const [result, setResult] = useState<HipWaistResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcHipWaist({ hip: parse(hip, DEFAULTS.hip), waist: parse(waist, DEFAULTS.waist), sex }));
  const reset = () => {
    setHip(String(DEFAULTS.hip));
    setWaist(String(DEFAULTS.waist));
    setSex(DEFAULTS.sex);
    setResult(calcHipWaist(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcHipWaist(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a hip-to-waist ratio?", answer: "Hip-to-waist ratio divides hip circumference by waist circumference — the inverse of the more common waist-to-hip ratio. A larger ratio means a narrower waist relative to the hips, which is associated with lower cardiovascular risk." },
    { question: "What is a healthy hip-to-waist ratio?", answer: "Inverting the WHO waist-to-hip thresholds, a hip-to-waist ratio of roughly 1.11 or higher for men and 1.18 or higher for women indicates low metabolic risk. Values below those thresholds signal elevated central obesity risk." },
    { question: "Why use hip-to-waist instead of waist-to-hip?", answer: "Both measure the same underlying relationship — fat distribution. Hip-to-waist is a simple reciprocal of waist-to-hip (1 ÷ WHR). Some people find larger-is-better framing more intuitive, since a higher ratio is the healthier direction." },
    { question: "How should I measure my hip?", answer: "Measure around the widest part of the buttocks, with the tape parallel to the floor, standing relaxed. For the waist, measure at the narrowest point between the ribs and the navel after a normal exhale. Consistency in tape placement matters most for tracking change." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Hip-to-Waist Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hip-to-Waist Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Hip Circumference</label>
                <div className={inp}><input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Waist Circumference</label>
                <div className={inp}><input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value as HipWaistInput["sex"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Hip-to-Waist Ratio</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.statusColor}`}>{result.ratio > 0 ? result.ratio.toFixed(2) : "—"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Risk level: {result.status} · Low-risk threshold: {result.threshold.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Ratio", result.ratio > 0 ? result.ratio.toFixed(2) : "—"], ["Hip", `${result.chartData[0].inches.toFixed(1)} in`], ["Waist", `${result.chartData[1].inches.toFixed(1)} in`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Measurement Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Circumference Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} in`, ""]} />
                      <Bar dataKey="inches" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Reading Your Ratio</h2>
            <p>The hip-to-waist ratio is the reciprocal of the waist-to-hip ratio: divide hip circumference by waist circumference. Higher values are healthier because they indicate a narrower waist relative to the hips, which reflects lower central (visceral) fat.</p>
            <h2 className="text-2xl font-bold mb-3">Thresholds</h2>
            <p>Inverting the WHO waist-to-hip cutoffs, men are at low risk at 1.11 or higher, and women at 1.18 or higher. Below these values, fat distribution shifts toward the abdomen and cardiovascular and metabolic risk rises.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Measurement</h2>
            <p>Track the ratio over time with consistent tape placement — the narrowest waist point and the widest hip point. Combine it with BMI and waist circumference for a complete picture: BMI for overall size, waist and hip measures for where fat sits.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hip-to-waist-ratio-calculator" />
          <PopularCalculators exclude="/calculator/hip-to-waist-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
