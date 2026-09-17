"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const ZONES = [
  { name: "50–60% Max HR", min: 0.5, max: 0.6, color: "#3b82f6", label: "Warm-up / Recovery" },
  { name: "60–70% Max HR", min: 0.6, max: 0.7, color: "#22c55e", label: "Fat Burning Zone" },
  { name: "70–80% Max HR", min: 0.7, max: 0.8, color: "#f59e0b", label: "Aerobic / Endurance" },
  { name: "80–90% Max HR", min: 0.8, max: 0.9, color: "#f97316", label: "Lactate Threshold" },
  { name: "90–100% Max HR", min: 0.9, max: 1.0, color: "#ef4444", label: "VO₂ Max / Anaerobic" },
];

const MaxHeartRateCalculator = () => {
  const DEFAULTS = { age: "35", restingHR: "65", sex: "male" };
  const [age, setAge] = useState(DEFAULTS.age);
  const [restingHR, setRestingHR] = useState(DEFAULTS.restingHR);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [result, setResult] = useState<any>(null);

  const calculate = (a = age, rhr = restingHR, s = sex) => {
    const A = parseFloat(a) || 0;
    const RHR = parseFloat(rhr) || 0;
    if (!A || A <= 0 || A > 120) return;
    const foxMax = 220 - A;
    const gulatiMax = s === "female" ? Math.round(206 - 0.88 * A) : foxMax;
    const tanaka = Math.round(208 - 0.7 * A);
    const haskell = foxMax;
    const maxHR = s === "female" ? gulatiMax : tanaka;
    const hrReserve = RHR > 0 ? maxHR - RHR : null;
    const zones = ZONES.map((z) => ({
      ...z,
      bpmMin: Math.round(maxHR * z.min),
      bpmMax: Math.round(maxHR * z.max),
      karvMin: hrReserve ? Math.round(RHR + hrReserve * z.min) : null,
      karvMax: hrReserve ? Math.round(RHR + hrReserve * z.max) : null,
    }));
    const chartData = zones.map((z) => ({
      name: z.name,
      "BPM Min": z.bpmMin,
      "BPM Range": z.bpmMax - z.bpmMin,
      color: z.color,
    }));
    setResult({ A, RHR, maxHR, foxMax, gulatiMax, tanaka, hrReserve, zones, chartData, s });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setAge(DEFAULTS.age); setRestingHR(DEFAULTS.restingHR); setSex(DEFAULTS.sex);
    calculate(DEFAULTS.age, DEFAULTS.restingHR, DEFAULTS.sex);
  };

  const faqs = [
    { question: "What is maximum heart rate (MHR)?", answer: "Maximum heart rate (MHR) is the highest number of times your heart can beat per minute during intense exercise. It decreases with age and is used to define training zones for aerobic and anaerobic exercise. It does NOT directly reflect fitness level — a trained athlete and a sedentary person of the same age may have similar maximum heart rates." },
    { question: "What is the most accurate MHR formula?", answer: "The Tanaka formula (208 − 0.7 × Age) is generally considered more accurate for most adults than the traditional Fox formula (220 − Age). The Gulati formula (206 − 0.88 × Age) was specifically derived for women. This calculator uses Tanaka for men and Gulati for women, with comparisons to Fox/Haskell." },
    { question: "What are heart rate training zones?", answer: "Training zones divide your heart rate range between rest and maximum into effort levels: Zone 1 (50–60%): warm-up, recovery. Zone 2 (60–70%): fat burning, base endurance. Zone 3 (70–80%): aerobic conditioning. Zone 4 (80–90%): lactate threshold, race pace. Zone 5 (90–100%): VO₂ max intervals, maximum effort." },
    { question: "What is heart rate reserve (HRR)?", answer: "Heart rate reserve = Maximum HR − Resting HR. It represents the functional range of your cardiovascular system. The Karvonen method uses HRR to calculate more personalized training zones: Target HR = Resting HR + (HRR × % intensity). Athletes with low resting heart rates (40–50 bpm) benefit most from the Karvonen method." },
    { question: "What is the fat-burning zone?", answer: "The fat-burning zone is 60–70% of maximum heart rate. At this intensity, fat provides a higher percentage of fuel than at higher intensities. However, total calorie burn is lower than at higher intensities. Both high-intensity and moderate-intensity training contribute to fat loss — the 'fat burning zone' is optimal for long-duration, sustainable aerobic work." },
    { question: "Can I actually reach my calculated MHR?", answer: "Technically yes, but it requires maximum exertion during a formal VO₂ max test. In casual exercise, most people reach 85–90% of MHR during very hard efforts. The calculated MHR is an estimate — actual MHR can vary ±10–12 bpm from formula predictions. The most accurate MHR comes from a supervised graded exercise stress test." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Max Heart Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Maximum Heart Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Sex</label>
              <div className="flex gap-2">
                {["male", "female"].map((s) => (
                  <button key={s} onClick={() => { setSex(s); calculate(age, restingHR, s); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Age (years)</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="35" min="10" max="100" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Resting Heart Rate <span className="text-muted-foreground font-normal">(optional, for Karvonen zones)</span></label>
              <div className="relative">
                <input type="number" value={restingHR} onChange={(e) => setRestingHR(e.target.value)} className="h-10 w-full px-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="65" min="30" max="100" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">bpm</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Estimated Maximum Heart Rate</div>
                <div className="text-4xl font-bold text-primary">{result.maxHR} <span className="text-2xl font-semibold">bpm</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  Using {result.s === "female" ? "Gulati (women's)" : "Tanaka"} formula for age {result.A}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Formula Comparison</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Fox / Haskell (220 − Age)", value: `${result.foxMax} bpm` },
                    { label: "Tanaka (208 − 0.7 × Age)", value: `${result.tanaka} bpm` },
                    { label: "Gulati — Women (206 − 0.88 × Age)", value: `${result.gulatiMax} bpm` },
                    { label: "Recommended (this session)", value: `${result.maxHR} bpm` },
                    ...(result.hrReserve ? [{ label: "Resting HR", value: `${result.RHR} bpm` }, { label: "Heart Rate Reserve (HRR)", value: `${result.hrReserve} bpm` }] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Heart Rate Training Zones</h3>
                <div className="space-y-2">
                  {result.zones.map((z: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md" style={{ backgroundColor: z.color + "18" }}>
                      <div className="w-3 h-8 rounded-sm flex-shrink-0" style={{ backgroundColor: z.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{z.label}</div>
                        <div className="text-xs text-muted-foreground">{z.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{z.bpmMin}–{z.bpmMax} bpm</div>
                        {z.karvMin && <div className="text-xs text-muted-foreground">Karvonen: {z.karvMin}–{z.karvMax}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Quick Reference</h3>
                <div className="space-y-3">
                  {[
                    { label: "Max Heart Rate", value: `${result.maxHR} bpm` },
                    { label: "Fat Burn Zone (60–70%)", value: `${Math.round(result.maxHR * 0.6)}–${Math.round(result.maxHR * 0.7)} bpm` },
                    { label: "Aerobic Zone (70–80%)", value: `${Math.round(result.maxHR * 0.7)}–${Math.round(result.maxHR * 0.8)} bpm` },
                    { label: "Peak Zone (90–100%)", value: `${Math.round(result.maxHR * 0.9)}–${result.maxHR} bpm`, border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Maximum Heart Rate Calculator?</h2>
            <p>A maximum heart rate (MHR) calculator estimates the highest number of heartbeats per minute your cardiovascular system can sustain during peak exercise. Pre-filled with age 35 and 65 bpm resting heart rate, the Tanaka formula gives a maximum heart rate of 183 bpm for men, with training zones ranging from 92 bpm (warm-up) to 183 bpm (maximum effort). MHR is the foundation of heart rate-based training and essential for designing effective workout programs.</p>
            <h2 className="text-2xl font-bold mb-3">Heart Rate Formulas Compared</h2>
            <p>The classic <strong>Fox / Haskell formula (220 − Age)</strong> has been used since 1970 but was never based on rigorous research. The <strong>Tanaka formula (208 − 0.7 × Age)</strong>, published in 2001 in JAMA, was derived from a meta-analysis of 351 studies and 18,712 subjects — considered more accurate for most adults. The <strong>Gulati formula (206 − 0.88 × Age)</strong> was specifically developed from a study of 5,437 women and is more accurate for female athletes. This calculator uses the most appropriate formula by sex.</p>
            <h2 className="text-2xl font-bold mb-3">Training Zones Explained</h2>
            <p><strong>Zone 1 (50–60%):</strong> Warm-up and active recovery. Feels easy. Used before and after harder sessions. <strong>Zone 2 (60–70%):</strong> The "fat burning zone" — fat provides the primary fuel. Builds aerobic base. Ideal for long easy runs, cycling, and swimming. <strong>Zone 3 (70–80%):</strong> Aerobic conditioning. Improves cardiovascular efficiency. Sustainable for 30–90 minutes. <strong>Zone 4 (80–90%):</strong> Lactate threshold training. Builds race fitness. Hard but maintainable for 20–40 minutes. <strong>Zone 5 (90–100%):</strong> VO₂ max intervals. Maximum cardiovascular stress. Only sustainable 1–10 minutes. Used for peak performance training.</p>
            <h2 className="text-2xl font-bold mb-3">The Karvonen Method</h2>
            <p>The Karvonen formula uses your heart rate reserve (HRR = MHR − Resting HR) to calculate more personalized zones: Target HR = Resting HR + (HRR × % intensity). For a 35-year-old with resting HR of 65: HRR = 183 − 65 = 118 bpm. Fat burning zone (60–70% Karvonen): 65 + (118 × 0.60) = 136 bpm to 65 + (118 × 0.70) = 148 bpm. These Karvonen zones are more individualized than simple MHR percentage zones — especially valuable for people with unusually high or low resting heart rates.</p>
            <h2 className="text-2xl font-bold mb-3">MHR Accuracy Limitations</h2>
            <p>Formula-based MHR estimates have a standard deviation of ±10–12 bpm. Individual MHR can vary significantly from formulas due to genetics, fitness level, medications (beta-blockers lower MHR by 20–30%), caffeine, hydration, and heat. The most accurate MHR measurement requires a graded exercise stress test (VO₂ max test) in a laboratory or supervised clinical setting. Use formula estimates as starting points and adjust based on your actual perceived exertion during training.</p>
            <h2 className="text-2xl font-bold mb-3">How Resting Heart Rate Affects Training</h2>
            <p>A lower resting heart rate is generally associated with higher aerobic fitness. Elite endurance athletes can have resting heart rates of 35–50 bpm, compared to the average of 60–80 bpm. Low resting heart rate increases heart rate reserve, which means more functional cardiovascular range and better ability to modulate intensity. The Karvonen method correctly accounts for this by centering zones around the available working range, not just maximum heart rate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/max-heart-rate-calculator" />
          <PopularCalculators exclude="/calculator/max-heart-rate-calculator" />
        </div>
      </div>
    </>
  );
};

export default MaxHeartRateCalculator;
