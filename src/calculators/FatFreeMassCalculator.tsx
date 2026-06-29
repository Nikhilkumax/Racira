"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getFFMIRating = (ffmi: number, sex: string) => {
  if (sex === "male") {
    if (ffmi < 18) return { label: "Below Average", color: "#f59e0b", desc: "Below typical male lean mass." };
    if (ffmi < 20) return { label: "Average", color: "#3b82f6", desc: "Typical lean mass for an adult male." };
    if (ffmi < 22) return { label: "Above Average", color: "#10b981", desc: "Good muscular development." };
    if (ffmi < 25) return { label: "Excellent / Athletic", color: "#22c55e", desc: "Excellent muscular development — advanced trainee." };
    return { label: "Exceptional / Elite", color: "#a855f7", desc: "Near natural muscular potential — elite athlete." };
  }
  if (ffmi < 14) return { label: "Below Average", color: "#f59e0b", desc: "Below typical female lean mass." };
  if (ffmi < 16) return { label: "Average", color: "#3b82f6", desc: "Typical lean mass for an adult female." };
  if (ffmi < 18) return { label: "Above Average", color: "#10b981", desc: "Good muscular development." };
  if (ffmi < 21) return { label: "Excellent / Athletic", color: "#22c55e", desc: "Excellent muscular development — advanced trainee." };
  return { label: "Exceptional / Elite", color: "#a855f7", desc: "Near natural muscular potential." };
};

const FatFreeMassCalculator = () => {
  const DEFAULTS = { weight: "185", bodyFat: "18", height: "70", sex: "male", unit: "imperial" };
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<any>(null);

  const calculate = (w = weight, bf = bodyFat, h = height, s = sex, u = unit) => {
    const W = parseFloat(w) || 0;
    const BF = parseFloat(bf) || 0;
    const H = parseFloat(h) || 0;
    if (!W || W <= 0 || BF < 0 || BF >= 100 || !H || H <= 0) return;
    let wKg: number, hM: number;
    if (u === "imperial") { wKg = W * 0.453592; hM = H * 0.0254; } else { wKg = W; hM = H / 100; }
    const fatMass = wKg * (BF / 100);
    const ffm = wKg - fatMass;
    const ffmi = ffm / (hM * hM);
    const adjustedFFMI = ffmi + 6.1 * (1.8 - hM);
    const rating = getFFMIRating(ffmi, s);
    const pieData = [
      { name: "Fat-Free Mass", value: parseFloat(ffm.toFixed(1)), color: "#10b981" },
      { name: "Fat Mass", value: parseFloat(fatMass.toFixed(1)), color: "#ef4444" },
    ];
    const toUnit = (kg: number) => u === "imperial" ? kg / 0.453592 : kg;
    const wU = u === "imperial" ? "lbs" : "kg";
    setResult({ W, BF, H, wKg, hM, fatMass, ffm, ffmi, adjustedFFMI, rating, pieData, toUnit, wU, s, u });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setWeight(DEFAULTS.weight); setBodyFat(DEFAULTS.bodyFat); setHeight(DEFAULTS.height);
    setSex(DEFAULTS.sex); setUnit(DEFAULTS.unit);
    calculate(DEFAULTS.weight, DEFAULTS.bodyFat, DEFAULTS.height, DEFAULTS.sex, DEFAULTS.unit);
  };

  const wLabel = unit === "imperial" ? "lbs" : "kg";
  const hLabel = unit === "imperial" ? "in" : "cm";

  const faqs = [
    { question: "What is fat-free mass (FFM)?", answer: "Fat-free mass (FFM) is your total body weight minus all fat tissue. It includes muscle, bone, water, organs, and connective tissue. FFM = Total Weight × (1 − Body Fat %). FFM is the primary determinant of basal metabolic rate, physical strength, and functional capacity." },
    { question: "What is the Fat-Free Mass Index (FFMI)?", answer: "FFMI = Fat-Free Mass (kg) / Height (m)². It is essentially a BMI calculation applied to lean mass only, removing the confounding effect of body fat. FFMI allows direct comparison of muscularity between individuals of different heights and body fat levels." },
    { question: "What is a normal FFMI?", answer: "For men: Average FFMI is 18–20. Above-average trained individuals reach 20–22. Excellent athletes: 22–25. The natural upper limit (without performance-enhancing drugs) is generally considered to be FFMI 25–26 (Kouri et al., 1995). For women: Average is 14–16, athletic is 16–18, and elite natural is 18–21." },
    { question: "What is the adjusted FFMI?", answer: "Adjusted FFMI normalizes for height differences: Adjusted FFMI = FFMI + 6.1 × (1.8 − Height in meters). This adjusts everyone to a reference height of 1.80 m (5'11\"), allowing fairer comparison between tall and short individuals. Taller individuals naturally have slightly lower FFMI due to the squared height denominator." },
    { question: "Can FFMI detect steroid use?", answer: "Research by Kouri et al. (1995) found that natural male bodybuilders rarely exceed FFMI of 25–26, while steroid-using bodybuilders frequently exceed 28–30+. While FFMI alone cannot 'prove' steroid use, values above 25 are exceptionally rare in natural athletes and warrant scrutiny in drug-tested competition." },
    { question: "How do I increase my FFM?", answer: "Progressive resistance training with adequate protein intake (1.6–2.2 g/kg/day) is the primary driver of lean mass gain. Additional factors: adequate sleep (7–9 hours), caloric surplus (200–500 kcal/day during building phases), creatine supplementation (3–5 g/day), and training program periodization. Natural muscle gain rates: beginners 1–2 lbs/month, intermediates 0.5–1 lb/month, advanced 0.25–0.5 lbs/month." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fat Free Mass Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fat-Free Mass (FFM) &amp; FFMI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {(["imperial", "metric"] as const).map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(weight, bodyFat, height, sex, u); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {u === "imperial" ? "Imperial" : "Metric"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Sex</label>
              <div className="flex gap-2">
                {["male", "female"].map((s) => (
                  <button key={s} onClick={() => { setSex(s); calculate(weight, bodyFat, height, s, unit); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weight ({wLabel})</label>
              <div className="relative">
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "185" : "84"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{wLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Body Fat (%)</label>
              <div className="relative">
                <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="h-10 w-full px-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="18" min="1" max="70" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({hLabel})</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "70" : "178"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{hLabel}</span>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Fat-Free Mass Index (FFMI)</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.ffmi, 1)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Body Composition Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Total Weight", value: `${fmt(result.toUnit(result.wKg), 1)} ${result.wU}` },
                    { label: "Body Fat %", value: `${fmt(result.BF, 1)}%` },
                    { label: "Fat Mass", value: `${fmt(result.toUnit(result.fatMass), 1)} ${result.wU}` },
                    { label: "Fat-Free Mass (FFM)", value: `${fmt(result.toUnit(result.ffm), 1)} ${result.wU}` },
                    { label: "FFMI", value: fmt(result.ffmi, 1) },
                    { label: "Adjusted FFMI (height-norm.)", value: fmt(result.adjustedFFMI, 1) },
                    { label: "Muscularity Rating", value: result.rating.label },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Body Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value} kg`} labelLine={false}>
                      {result.pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} kg`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">FFMI Reference Ranges ({result.s})</h3>
                <div className="space-y-2 text-sm">
                  {(result.s === "male"
                    ? [["Below Average", "< 18", "#f59e0b"], ["Average", "18–20", "#3b82f6"], ["Above Average", "20–22", "#10b981"], ["Excellent", "22–25", "#22c55e"], ["Natural Limit", "~25–26", "#a855f7"]]
                    : [["Below Average", "< 14", "#f59e0b"], ["Average", "14–16", "#3b82f6"], ["Above Average", "16–18", "#10b981"], ["Excellent", "18–21", "#22c55e"], ["Natural Limit", "~21–22", "#a855f7"]]
                  ).map(([label, range, color], i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                      <span className="font-medium">{range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Fat-Free Mass Calculator?</h2>
            <p>A fat-free mass (FFM) calculator computes your total lean body mass — everything in your body except stored fat: muscle, bone, water, organs, and connective tissue. It also calculates the Fat-Free Mass Index (FFMI), which normalizes lean mass by height to enable fair comparison across different body sizes. Pre-filled with 185 lbs, 18% body fat, and 70 inches height for a male, the FFM is 68.8 kg (151.7 lbs) and the FFMI is 21.7 — classified as above-average muscularity.</p>
            <h2>FFM and FFMI Formulas</h2>
            <p><strong>FFM = Weight × (1 − Body Fat % / 100)</strong></p>
            <p><strong>FFMI = FFM (kg) / Height (m)²</strong></p>
            <p><strong>Adjusted FFMI = FFMI + 6.1 × (1.80 − Height in m)</strong></p>
            <p>The adjusted FFMI normalizes for height, making comparisons between individuals of different heights more meaningful. A 5'6" person and a 6'2" person with identical muscle development will have the same adjusted FFMI.</p>
            <h2>The Natural Muscular Potential (Kouri Study)</h2>
            <p>The landmark 1995 study by Kouri, Pope, Katz, and Oliva found that among competitive natural male bodybuilders, FFMI rarely exceeded 25. The average FFMI of non-steroid-using competition bodybuilders was 22.8, while steroid users averaged 24.8. The researchers proposed FFMI of 25 as a reasonable upper boundary for natural male muscularity. This has become a widely referenced benchmark in the fitness and bodybuilding community.</p>
            <h2>Why FFMI Matters More Than BMI for Athletes</h2>
            <p>BMI classifies many athletes as "overweight" or "obese" because it cannot distinguish muscle from fat. FFMI solves this by isolating lean mass from body fat. A 200-lb male at 5'10" has BMI 28.7 (overweight). At 12% body fat, his FFMI is 24.9 (excellent muscularity). At 30% body fat, his FFMI is 19.8 (average). Same BMI, vastly different body compositions. FFMI reveals the truth that BMI obscures.</p>
            <h2>How to Increase Your FFMI</h2>
            <p>Building lean mass requires: progressive resistance training (2–5 sessions/week), adequate protein (1.6–2.2 g/kg/day — Schoenfeld &amp; Aragon, 2018), moderate caloric surplus (200–500 kcal above maintenance), sufficient sleep (7–9 hours for optimal growth hormone release), and training periodization. Realistic rates: beginners gain 1–2 lbs lean mass/month, intermediates 0.5–1 lb/month, advanced 0.25–0.5 lbs/month. Creatine monohydrate (3–5g/day) is the most evidence-based supplement for lean mass and strength gains.</p>
            <h2>Body Recomposition: Losing Fat While Gaining Muscle</h2>
            <p>Simultaneously losing fat and gaining muscle (recomposition) is possible, especially for: beginners with high body fat, individuals returning to training after a break, overweight/obese individuals, and those using optimal protein intake. During recomposition, body weight may not change significantly, but body fat percentage decreases while FFM increases. Track progress with body fat measurements and FFMI rather than scale weight alone.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fat-free-mass-calculator" />
          <PopularCalculators exclude="/calculator/fat-free-mass-calculator" />
        </div>
      </div>
    </>
  );
};

export default FatFreeMassCalculator;
