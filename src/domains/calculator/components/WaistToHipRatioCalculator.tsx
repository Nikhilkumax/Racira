"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WaistHipInput {
  waist: number;
  hip: number;
  sex: "male" | "female";
}

interface WaistHipResult {
  ratio: number;
  status: string;
  statusColor: string;
  threshold: number;
  chartData: { name: string; inches: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWaistHip(input: WaistHipInput): WaistHipResult {
  const ratio = input.hip > 0 ? input.waist / input.hip : 0;
  const threshold = input.sex === "male" ? 0.9 : 0.85;
  const status = ratio > 0 && ratio < threshold ? "Low Risk" : "Increased Risk";
  const statusColor = ratio > 0 && ratio < threshold ? "text-emerald-600" : "text-red-500";

  const chartData = [
    { name: "Waist", inches: Math.max(0, input.waist), fill: "hsl(var(--primary))" },
    { name: "Hip", inches: Math.max(0, input.hip), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Waist Circumference", value: `${input.waist.toFixed(1)} in` },
    { label: "Hip Circumference", value: `${input.hip.toFixed(1)} in` },
    { label: "Sex", value: input.sex === "male" ? "Male" : "Female" },
    { label: "Waist-to-Hip Ratio", value: ratio > 0 ? ratio.toFixed(2) : "—" },
    { label: "WHO Risk Threshold", value: threshold.toFixed(2) },
    { label: "Health Risk Level", value: status },
  ];

  const summaryStats = [
    { label: "Waist-to-Hip Ratio", value: ratio > 0 ? ratio.toFixed(2) : "—" },
    { label: "Health Risk Level", value: status },
    { label: "WHO Threshold", value: `> ${threshold.toFixed(2)}` },
    { label: "Waist", value: `${input.waist.toFixed(1)} in` },
    { label: "Hip", value: `${input.hip.toFixed(1)} in` },
    { label: "Waist-Hip Difference", value: `${(input.hip - input.waist).toFixed(1)} in` },
  ];

  return { ratio, status, statusColor, threshold, chartData, breakdown, summaryStats };
}

const DEFAULTS: WaistHipInput = { waist: 32, hip: 40, sex: "female" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WaistToHipRatioCalculator() {
  const [waist, setWaist] = useState(String(DEFAULTS.waist));
  const [hip, setHip] = useState(String(DEFAULTS.hip));
  const [sex, setSex] = useState<WaistHipInput["sex"]>(DEFAULTS.sex);
  const [result, setResult] = useState<WaistHipResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcWaistHip({ waist: parse(waist, DEFAULTS.waist), hip: parse(hip, DEFAULTS.hip), sex }));
  const reset = () => {
    setWaist(String(DEFAULTS.waist));
    setHip(String(DEFAULTS.hip));
    setSex(DEFAULTS.sex);
    setResult(calcWaistHip(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWaistHip(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a waist-to-hip ratio?", answer: "Waist-to-hip ratio (WHR) divides waist circumference by hip circumference. It measures where you store body fat — apple-shaped (central) fat carries higher metabolic risk than fat stored around the hips and thighs." },
    { question: "What is a healthy waist-to-hip ratio?", answer: "The WHO classifies WHR above 0.90 for men and 0.85 for women as substantially increased health risk. Lower values indicate lower cardiovascular and metabolic risk. These thresholds vary slightly by ethnicity and age." },
    { question: "How does WHR compare to BMI?", answer: "BMI measures overall body size but ignores fat distribution. Two people can share a BMI while one carries dangerous central fat and the other does not. WHR captures central adiposity directly, making it a useful complement to BMI." },
    { question: "How can I improve my waist-to-hip ratio?", answer: "Losing abdominal fat lowers WHR — caloric deficit, resistance training, and aerobic exercise all reduce waist circumference. Building glute and hip muscle also increases the denominator, improving the ratio from the other side." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Waist-to-Hip Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Waist-to-Hip Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Waist Circumference</label>
                <div className={inp}><input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hip Circumference</label>
                <div className={inp}><input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value as WaistHipInput["sex"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Waist-to-Hip Ratio</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.statusColor}`}>{result.ratio > 0 ? result.ratio.toFixed(2) : "—"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Risk level: {result.status} · WHO threshold: {result.threshold.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Ratio", result.ratio > 0 ? result.ratio.toFixed(2) : "—"], ["Waist", `${result.chartData[0].inches.toFixed(1)} in`], ["Hip", `${result.chartData[1].inches.toFixed(1)} in`]].map(([l, v], i) => (
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
            <h2 className="text-2xl font-bold mb-3">What the Ratio Tells You</h2>
            <p>Waist-to-hip ratio is a marker of central obesity — fat stored around the abdomen. Central fat is metabolically active and strongly associated with cardiovascular disease, type 2 diabetes, and hypertension, independent of total body weight.</p>
            <h2 className="text-2xl font-bold mb-3">WHO Classification</h2>
            <p>The World Health Organization defines a waist-to-hip ratio above 0.90 for men and 0.85 for women as substantially increased health risk. Ratios below these thresholds are classified as low risk. Measure at the narrowest waist point and the widest hip point, breathing normally.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Ratio</h2>
            <p>Abdominal fat responds well to a caloric deficit combined with resistance and aerobic training. Hip circumference can be increased with glute-focused strength work. Monitoring WHR alongside waist circumference alone gives a fuller picture of metabolic health than either metric by itself.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/waist-to-hip-ratio-calculator" />
          <PopularCalculators exclude="/calculator/waist-to-hip-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
