"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getWHtRRating = (ratio: number, sex: string) => {
  const isFemale = sex === "female";
  if (ratio < 0.4) return { label: "Underweight Risk", color: "#3b82f6", desc: "Waist too small relative to height — possible underweight concern." };
  if (ratio < 0.5) return { label: "Healthy", color: "#10b981", desc: "Optimal range. Associated with lowest cardiometabolic risk." };
  if (ratio < (isFemale ? 0.6 : 0.55)) return { label: "Overweight", color: "#f59e0b", desc: "Moderate central adiposity. Consider lifestyle improvements." };
  return { label: "Obese / High Risk", color: "#ef4444", desc: "High abdominal obesity. Elevated cardiovascular and metabolic risk." };
};

const WaistToHeightRatioCalculator = () => {
  const DEFAULTS = { waist: "32", height: "68", sex: "male", unit: "in" };
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<any>(null);

  const calculate = (w = waist, h = height, s = sex, u = unit) => {
    const W = parseFloat(w) || 0;
    const H = parseFloat(h) || 0;
    if (!W || !H || H <= 0) return;
    const wCm = u === "in" ? W * 2.54 : W;
    const hCm = u === "in" ? H * 2.54 : H;
    const ratio = W / H;
    const rating = getWHtRRating(ratio, s);
    const healthyMaxWaist = H * 0.5;
    const borderlineWaist = H * (s === "female" ? 0.6 : 0.55);
    const chartData = [
      { name: "Healthy (<0.5)", threshold: 0.5, color: "#10b981" },
      { name: "Overweight", threshold: s === "female" ? 0.6 : 0.55, color: "#f59e0b" },
      { name: "Your WHtR", threshold: parseFloat(ratio.toFixed(3)), color: rating.color },
    ];
    setResult({ W, H, wCm, hCm, ratio, rating, healthyMaxWaist, borderlineWaist, chartData, u, s });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setWaist(DEFAULTS.waist); setHeight(DEFAULTS.height); setSex(DEFAULTS.sex); setUnit(DEFAULTS.unit);
    calculate(DEFAULTS.waist, DEFAULTS.height, DEFAULTS.sex, DEFAULTS.unit);
  };

  const faqs = [
    { question: "What is the waist-to-height ratio?", answer: "The waist-to-height ratio (WHtR) divides your waist circumference by your height. Research shows it is a better predictor of cardiometabolic risk than BMI because it specifically measures central (abdominal) adiposity — the most dangerous fat depot. The simple rule: 'Keep your waist less than half your height.'" },
    { question: "What is a healthy waist-to-height ratio?", answer: "A WHtR below 0.5 is associated with the lowest risk. Between 0.5 and 0.6 (0.55 for men) indicates overweight. Above 0.6 (men: above 0.55) indicates central obesity with significantly elevated cardiovascular and metabolic risk. Age-adjusted thresholds exist for elderly populations." },
    { question: "Is WHtR better than BMI?", answer: "Multiple studies show WHtR better predicts cardiovascular disease, type 2 diabetes, hypertension, and all-cause mortality than BMI. BMI doesn't distinguish between muscle and fat mass, or between visceral and subcutaneous fat. WHtR specifically captures central adiposity, which is the most metabolically active and harmful fat storage pattern." },
    { question: "How do I measure my waist for this calculator?", answer: "Measure at the midpoint between your lowest rib and the top of your hip bone (iliac crest). Stand relaxed, exhale naturally, and measure without compressing the skin. This is typically at or just above your navel level. Use a soft measuring tape held level around the waist." },
    { question: "What waist size should I target?", answer: "Your target waist should be less than half your height. For a 5'8\" (68-inch) person, this means keeping waist below 34 inches. For a 5'4\" (64-inch) person, waist should stay below 32 inches. This rule applies across ethnicities and is height-independent, making it universally applicable." },
    { question: "Does gender affect the WHtR thresholds?", answer: "Yes, slightly. Women naturally carry more subcutaneous fat than men, so the 'overweight' threshold for women is 0.6 vs 0.55 for men. Both sexes share the same healthy upper limit of 0.5. Some studies use 0.53 for men and 0.54 for women as the universal optimal boundary." },
  ];

  const unitLabel = unit === "in" ? "in" : "cm";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Waist to Height Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Waist to Height Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {["in", "cm"].map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(waist, height, sex, u); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {u === "in" ? "Imperial (in)" : "Metric (cm)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Sex</label>
              <div className="flex gap-2">
                {["male", "female"].map((s) => (
                  <button key={s} onClick={() => { setSex(s); calculate(waist, height, s, unit); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Waist Circumference ({unitLabel})</label>
              <div className="relative">
                <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "32" : "81"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({unitLabel})</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "68" : "173"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Waist-to-Height Ratio (WHtR)</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.ratio, 3)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Measurement Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Waist Circumference", value: `${fmt(result.W)} ${unitLabel} (${fmt(result.wCm)} cm)` },
                    { label: "Height", value: `${fmt(result.H)} ${unitLabel} (${fmt(result.hCm)} cm)` },
                    { label: "WHtR", value: fmt(result.ratio, 3) },
                    { label: "Healthy Max Waist", value: `< ${fmt(result.healthyMaxWaist)} ${unitLabel}` },
                    { label: "Waist Surplus / Deficit", value: result.W <= result.healthyMaxWaist ? `${fmt(result.healthyMaxWaist - result.W)} ${unitLabel} under limit ✓` : `${fmt(result.W - result.healthyMaxWaist)} ${unitLabel} over limit ✗` },
                    { label: "Health Category", value: result.rating.label },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">WHtR vs Reference Thresholds</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 0.7]} tickFormatter={(v) => v.toFixed(2)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => Number(v).toFixed(3)} />
                    <ReferenceLine y={0.5} stroke="#10b981" strokeDasharray="4 2" />
                    <Bar dataKey="threshold" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Health Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "WHtR", value: fmt(result.ratio, 3) },
                    { label: "Healthy Range", value: "< 0.500" },
                    { label: "Healthy Max Waist", value: `< ${fmt(result.healthyMaxWaist)} ${unitLabel}` },
                    { label: "Category", value: result.rating.label, border: true, bold: true },
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

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Waist to Height Ratio Calculator?</h2>
            <p>A waist-to-height ratio (WHtR) calculator divides your waist circumference by your height to produce a simple, powerful index of central obesity and cardiometabolic risk. The landmark rule is: <strong>keep your waist less than half your height</strong>. Pre-filled with a 32-inch waist and 68-inch height (5'8"), the WHtR is 0.471 — comfortably in the healthy range. This single measurement predicts cardiovascular disease, type 2 diabetes, hypertension, and metabolic syndrome better than BMI alone.</p>
            <h2>The WHtR Formula</h2>
            <p><strong>WHtR = Waist Circumference / Height</strong></p>
            <p>Both measurements must be in the same units (inches or centimeters). Result: 32 in / 68 in = 0.471. The ideal range is 0.40–0.49. The critical threshold is 0.50 — above this, cardiometabolic risk begins escalating rapidly.</p>
            <h2>WHtR vs BMI: Why WHtR Wins</h2>
            <p>BMI (weight / height²) is widely used but has major limitations: it cannot distinguish muscle from fat, and it doesn't identify where fat is stored. Visceral abdominal fat — the fat inside your abdomen surrounding organs — is metabolically active and releases inflammatory cytokines that directly cause insulin resistance, atherosclerosis, and hypertension. A slim person with a large waist (called "TOFI" — Thin Outside, Fat Inside) can have normal BMI but a dangerously high WHtR. Multiple systematic reviews confirm WHtR outperforms BMI in predicting cardiometabolic outcomes across diverse populations.</p>
            <h2>Reference Thresholds by Category</h2>
            <p>Below 0.40: Possibly underweight. 0.40–0.49: Healthy — lowest cardiometabolic risk zone. 0.50–0.59 (women: 0.50–0.59, men: 0.50–0.54): Overweight — increasing risk. 0.60+ (men: 0.55+): Obese — substantially elevated cardiovascular and metabolic risk. These thresholds apply across ethnicities, though some studies suggest Asian populations have higher risk at lower WHtR values and may benefit from threshold of 0.46–0.47.</p>
            <h2>How to Reduce Your WHtR</h2>
            <p>To reduce WHtR, focus on reducing waist circumference through: (1) caloric deficit targeting 500–1000 kcal/day below maintenance — this preferentially reduces visceral fat. (2) Aerobic exercise — 150–300 minutes/week of moderate-intensity cardio is the most effective visceral fat reducer. (3) Resistance training preserves muscle while reducing fat mass. (4) Sleep optimization — poor sleep (under 6 hours) is independently associated with visceral fat accumulation. (5) Stress management — cortisol directly promotes visceral fat deposition via glucocorticoid receptors in abdominal adipose tissue.</p>
            <h2>Clinical Applications</h2>
            <p>WHtR is increasingly used in clinical screening because it requires only two measurements (waist circumference and height) and can be done in 30 seconds without laboratory equipment. It is incorporated into NHS (UK) health checks, the International Diabetes Federation's metabolic syndrome criteria, and many preventive cardiology screening protocols. Its simplicity and validity make it ideal for population-level screening and individual self-monitoring.</p>
            <h2>Ethnic Adjustments</h2>
            <p>While WHtR is more ethnicity-neutral than absolute waist circumference thresholds, South Asian, East Asian, and Southeast Asian populations have higher visceral fat percentage at lower WHtR values than Caucasian or African populations. Some guidelines recommend a lower threshold of 0.46 for these groups, reflecting earlier onset of cardiometabolic complications at smaller waist sizes. This calculator uses universal thresholds; consult a physician for ethnicity-specific guidance.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/waist-to-height-ratio-calculator" />
          <PopularCalculators exclude="/calculator/waist-to-height-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default WaistToHeightRatioCalculator;
