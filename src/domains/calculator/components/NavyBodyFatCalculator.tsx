"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getBFRating = (bf: number, sex: string) => {
  if (sex === "male") {
    if (bf < 6) return { label: "Essential Fat", color: "#3b82f6" };
    if (bf < 14) return { label: "Athletic", color: "#10b981" };
    if (bf < 18) return { label: "Fit", color: "#22c55e" };
    if (bf < 25) return { label: "Average", color: "#f59e0b" };
    return { label: "Obese", color: "#ef4444" };
  } else {
    if (bf < 14) return { label: "Essential Fat", color: "#3b82f6" };
    if (bf < 21) return { label: "Athletic", color: "#10b981" };
    if (bf < 25) return { label: "Fit", color: "#22c55e" };
    if (bf < 32) return { label: "Average", color: "#f59e0b" };
    return { label: "Obese", color: "#ef4444" };
  }
};

const NavyBodyFatCalculator = () => {
  const DEFAULTS = { sex: "male", height: "70", neck: "15", waist: "33", hip: "" };
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [unit, setUnit] = useState("in");
  const [result, setResult] = useState<any>(null);

  const calculate = (s = sex, h = height, n = neck, w = waist, hp = hip, u = unit) => {
    const H = parseFloat(h) || 0;
    const N = parseFloat(n) || 0;
    const W = parseFloat(w) || 0;
    const HP = parseFloat(hp) || 0;
    if (!H || !N || !W || H <= 0) return;
    const toIn = (v: number) => u === "cm" ? v / 2.54 : v;
    const hIn = toIn(H), nIn = toIn(N), wIn = toIn(W), hpIn = u === "cm" ? HP / 2.54 : HP;
    let bf: number;
    if (s === "male") {
      if (wIn <= nIn) return;
      bf = 86.010 * Math.log10(wIn - nIn) - 70.041 * Math.log10(hIn) + 36.76;
    } else {
      if (!HP || hpIn <= nIn) return;
      bf = 163.205 * Math.log10(wIn + hpIn - nIn) - 97.684 * Math.log10(hIn) - 78.387;
    }
    bf = Math.max(0, Math.min(bf, 70));
    const rating = getBFRating(bf, s);
    const leanMass = 100 - bf;
    const pieData = [
      { name: "Body Fat", value: parseFloat(bf.toFixed(1)), color: "#ef4444" },
      { name: "Lean Mass", value: parseFloat(leanMass.toFixed(1)), color: "#10b981" },
    ];
    setResult({ H, N, W, HP, hIn, nIn, wIn, hpIn, bf, leanMass, rating, pieData, s, u });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setSex(DEFAULTS.sex); setHeight(DEFAULTS.height); setNeck(DEFAULTS.neck);
    setWaist(DEFAULTS.waist); setHip(DEFAULTS.hip);
    calculate(DEFAULTS.sex, DEFAULTS.height, DEFAULTS.neck, DEFAULTS.waist, DEFAULTS.hip, unit);
  };

  const unitLabel = unit === "in" ? "in" : "cm";

  const faqs = [
    { question: "What is the Navy Body Fat formula?", answer: "The U.S. Navy Body Fat formula estimates body fat percentage using circumference measurements and height. For men: BF% = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76. For women: BF% = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387. All measurements are in inches." },
    { question: "How accurate is the Navy Body Fat formula?", answer: "The Navy formula is reasonably accurate for most individuals, with an error of approximately ±3–4% body fat compared to DEXA scanning. It performs well for people with typical body proportions but can overestimate body fat for very muscular individuals (who tend to have larger necks) and underestimate for those with unusual fat distribution patterns." },
    { question: "Where do I measure my waist, neck, and hip?", answer: "Neck: just below the larynx (Adam's apple), perpendicular to the long axis. Waist (men): at the navel level, measured horizontally. Waist (women): at the narrowest point between navel and ribs. Hip (women only): at the widest point of the hips/buttocks. All measurements should be taken while standing relaxed, breathing normally." },
    { question: "What are healthy body fat percentages?", answer: "For men: Essential fat 2–5%, Athletic 6–13%, Fit 14–17%, Average 18–24%, Obese 25%+. For women: Essential fat 10–13%, Athletic 14–20%, Fit 21–24%, Average 25–31%, Obese 32%+. Women naturally carry more essential body fat due to hormonal and reproductive physiology." },
    { question: "Why does the women's formula include hip measurement?", answer: "Women naturally distribute more fat in the gluteal-femoral region (hips, thighs, buttocks) compared to men who store more centrally (abdomen). The hip measurement is essential for accurately estimating total body fat in women — without it, the formula would significantly underestimate body fat for gynoid (pear-shaped) fat distribution patterns." },
    { question: "How does Navy BF% compare to DEXA scanning?", answer: "DEXA (Dual-Energy X-ray Absorptiometry) is considered the gold standard for body composition measurement, with accuracy to within 1–2%. The Navy formula has an average error of 3–4%. Other methods: hydrostatic weighing (2–3% error), bioelectrical impedance (3–5%, highly variable), skinfold calipers (3–5% with trained measurer). The Navy formula is a convenient and reasonably accurate field measurement tool." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Navy Body Fat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Navy Body Fat Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {["in", "cm"].map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(sex, height, neck, waist, hip, u); }}
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
                  <button key={s} onClick={() => { setSex(s); setHip(""); calculate(s, height, neck, waist, "", unit); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({unitLabel})</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "70" : "178"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Neck Circumference ({unitLabel})</label>
              <div className="relative">
                <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "15" : "38"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Waist Circumference ({unitLabel}) <span className="text-xs text-muted-foreground">{sex === "male" ? "at navel" : "narrowest point"}</span></label>
              <div className="relative">
                <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "33" : "84"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            {sex === "female" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Hip Circumference ({unitLabel}) <span className="text-xs text-muted-foreground">widest point</span></label>
                <div className="relative">
                  <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "38" : "97"} min="1" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(sex, height, neck, waist, hip, unit)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Estimated Body Fat Percentage</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.bf, 1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — Lean Mass: {fmt(result.leanMass, 1)}%
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Measurement Summary</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Height", value: `${fmt(result.H)} ${unitLabel}` },
                    { label: "Neck", value: `${fmt(result.N)} ${unitLabel}` },
                    { label: "Waist", value: `${fmt(result.W)} ${unitLabel}` },
                    ...(result.s === "female" && result.HP ? [{ label: "Hip", value: `${fmt(result.HP)} ${unitLabel}` }] : []),
                    { label: "Body Fat %", value: `${fmt(result.bf, 1)}%` },
                    { label: "Lean Mass %", value: `${fmt(result.leanMass, 1)}%` },
                    { label: "Category", value: result.rating.label },
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
                    <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                      {result.pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Body Fat Reference Ranges ({result.s})</h3>
                <div className="space-y-2 text-sm">
                  {(result.s === "male"
                    ? [["Essential Fat", "2–5%", "#3b82f6"], ["Athletic", "6–13%", "#10b981"], ["Fit", "14–17%", "#22c55e"], ["Average", "18–24%", "#f59e0b"], ["Obese", "25%+", "#ef4444"]]
                    : [["Essential Fat", "10–13%", "#3b82f6"], ["Athletic", "14–20%", "#10b981"], ["Fit", "21–24%", "#22c55e"], ["Average", "25–31%", "#f59e0b"], ["Obese", "32%+", "#ef4444"]]
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Navy Body Fat Calculator?</h2>
            <p>The Navy Body Fat Calculator uses the U.S. Navy circumference method to estimate body fat percentage from simple tape measurements — height, neck, waist, and hip (women). Pre-filled with height 70 inches, neck 15 inches, and waist 33 inches for a male, the estimated body fat is approximately 18% — in the average fitness category. This method was developed by Hodgdon and Beckett in 1984 for the U.S. military and is still used by the Navy, Army, and Marine Corps for fitness standards compliance.</p>
            <h2 className="text-2xl font-bold mb-3">The Navy Body Fat Formulas</h2>
            <p><strong>Men:</strong> BF% = 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76</p>
            <p><strong>Women:</strong> BF% = 163.205 × log₁₀(waist + hip − neck) − 97.684 × log₁₀(height) − 78.387</p>
            <p>All measurements are in inches. The formula uses the difference between waist and neck (men) or the sum of waist and hip minus neck (women) to capture the contrast between abdominal circumference and upper body lean mass.</p>
            <h2 className="text-2xl font-bold mb-3">How to Take Accurate Measurements</h2>
            <p><strong>Neck:</strong> Measure below the larynx (Adam's apple), perpendicular to the long axis of the neck. <strong>Waist (men):</strong> Horizontal measurement at the navel. <strong>Waist (women):</strong> At the narrowest point, typically between navel and bottom of ribs. <strong>Hip (women):</strong> At the widest point across the buttocks. Use a flexible measuring tape and take each measurement twice, rounding down to the nearest 0.5 inch. Measurements should be taken while standing and breathing normally.</p>
            <h2 className="text-2xl font-bold mb-3">U.S. Military Body Fat Standards</h2>
            <p>The U.S. Navy maximum body fat standards by age: Males 17–21: 22%, 22–29: 23%, 30–39: 24%, 40+: 26%. Females 17–21: 33%, 22–29: 34%, 30–39: 35%, 40+: 36%. Exceeding these thresholds can result in separation from military service, making the Navy formula both a personal health tool and a career-relevant measurement.</p>
            <h2 className="text-2xl font-bold mb-3">Accuracy and Comparison to Other Methods</h2>
            <p>The Navy method has a margin of error of approximately ±3–4% body fat compared to DEXA scanning. It overestimates body fat in very muscular individuals (larger neck circumference reduces the waist-neck differential) and may underestimate in those with unusual fat distribution. For most individuals, it provides a useful, accessible estimate without requiring laboratory equipment. DEXA scanning, hydrostatic weighing, and air displacement plethysmography (Bod Pod) offer greater precision for clinical or research use.</p>
            <h2 className="text-2xl font-bold mb-3">Body Fat and Health Outcomes</h2>
            <p>Excess body fat — particularly visceral fat — is associated with insulin resistance, type 2 diabetes, cardiovascular disease, hypertension, certain cancers, and reduced longevity. The relationship between body fat and health outcomes is nonlinear: both very low body fat (below essential levels) and high body fat increase all-cause mortality risk. The healthiest ranges for most adults are 10–18% for men and 18–28% for women, representing the "fit" to "average" categories.</p>
            <h2 className="text-2xl font-bold mb-3">How to Reduce Body Fat Percentage</h2>
            <p>To reduce body fat: create a moderate caloric deficit (300–500 kcal/day) while maintaining adequate protein (1.6–2.2 g/kg body weight) to preserve lean mass. Combine resistance training (stimulates muscle protein synthesis) with aerobic exercise (expands caloric expenditure). Target 0.5–1% body fat reduction per month for sustainable, muscle-preserving fat loss. Aggressive deficits (1,000+ kcal/day) often result in significant muscle loss, especially without adequate protein and resistance training.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/navy-body-fat-calculator" />
          <PopularCalculators exclude="/calculator/navy-body-fat-calculator" />
        </div>
      </div>
    </>
  );
};

export default NavyBodyFatCalculator;
