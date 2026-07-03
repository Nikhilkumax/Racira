"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getBFRating = (bf: number, sex: string, age: number) => {
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

// U.S. Army body fat standards (max allowed %)
const ARMY_STANDARDS: Record<string, Record<string, number>> = {
  male: { "17-20": 20, "21-27": 22, "28-39": 24, "40+": 26 },
  female: { "17-20": 30, "21-27": 32, "28-39": 34, "40+": 36 },
};

const getAgeGroup = (age: number): string => {
  if (age <= 20) return "17-20";
  if (age <= 27) return "21-27";
  if (age <= 39) return "28-39";
  return "40+";
};

const ArmyBodyFatCalculator = () => {
  const DEFAULTS = { sex: "male", age: "25", height: "70", neck: "15.5", waist: "33", hip: "" };
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [unit, setUnit] = useState("in");
  const [result, setResult] = useState<any>(null);

  const calculate = (s = sex, a = age, h = height, n = neck, w = waist, hp = hip, u = unit) => {
    const A = parseFloat(a) || 0;
    const H = parseFloat(h) || 0;
    const N = parseFloat(n) || 0;
    const W = parseFloat(w) || 0;
    const HP = parseFloat(hp) || 0;
    if (!H || !N || !W || H <= 0 || A <= 0) return;
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
    const ageGroup = getAgeGroup(A);
    const armyMax = ARMY_STANDARDS[s][ageGroup];
    const passesStandard = bf <= armyMax;
    const rating = getBFRating(bf, s, A);
    const leanMass = 100 - bf;
    const pieData = [
      { name: "Body Fat", value: parseFloat(bf.toFixed(1)), color: "#ef4444" },
      { name: "Lean Mass", value: parseFloat(leanMass.toFixed(1)), color: "#10b981" },
    ];
    setResult({ H, N, W, HP, hIn, nIn, wIn, hpIn, A, bf, leanMass, rating, pieData, armyMax, passesStandard, ageGroup, s, u });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setSex(DEFAULTS.sex); setAge(DEFAULTS.age); setHeight(DEFAULTS.height);
    setNeck(DEFAULTS.neck); setWaist(DEFAULTS.waist); setHip(DEFAULTS.hip);
    calculate(DEFAULTS.sex, DEFAULTS.age, DEFAULTS.height, DEFAULTS.neck, DEFAULTS.waist, DEFAULTS.hip, unit);
  };

  const unitLabel = unit === "in" ? "in" : "cm";

  const faqs = [
    { question: "What is the Army Body Fat Calculator?", answer: "The Army Body Fat Calculator uses the same circumference-based formula as the Navy method (Hodgdon & Beckett, 1984) to estimate body fat percentage, then compares your result against U.S. Army Regulation 600-9 body fat standards for your age group and sex. It determines whether you meet Army fitness standards." },
    { question: "What are the U.S. Army body fat standards?", answer: "Army maximum body fat % by age: Males: 17–20 (20%), 21–27 (22%), 28–39 (24%), 40+ (26%). Females: 17–20 (30%), 21–27 (32%), 28–39 (34%), 40+ (36%). Soldiers exceeding these thresholds are enrolled in the Army Body Composition Program (ABCP) and must reduce body fat within 90 days or face administrative actions." },
    { question: "How does the Army body fat formula work?", answer: "The formula uses circumference measurements: for men, it calculates the log of (waist − neck) relative to height. For women, it uses (waist + hip − neck) relative to height. These measurements correlate with body fat percentage based on research conducted at the Naval Health Research Center in San Diego." },
    { question: "What if I fail the Army body fat standard?", answer: "Soldiers who exceed body fat standards are flagged and enrolled in the Army Body Composition Program (ABCP). They receive a nutrition and exercise plan and are re-measured every 90 days. Failure to meet standards within 6 months can result in denial of promotion, reassignment, or administrative separation from service." },
    { question: "Is the Army formula the same as the Navy formula?", answer: "Yes — the Army and Navy use the same mathematical formula developed by Hodgdon and Beckett in 1984. The difference lies in the standards: the Army uses AR 600-9 standards (which vary by age and sex), while the Navy uses separate standards under OPNAVINST 6110.1J. Marine Corps uses a similar circumference method with different thresholds." },
    { question: "How should I take measurements for the Army test?", answer: "Army regulations specify: Neck — just below the larynx, sloping upward to back. Waist (men) — at the navel, horizontal. Waist (women) — at the natural waist (narrowest point). Hip (women) — at maximum extension of buttocks. Measurements are rounded down to nearest 0.5 inch. The average of three neck measurements and three abdominal measurements is used." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Army Body Fat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Army Body Fat Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {["in", "cm"].map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(sex, age, height, neck, waist, hip, u); }}
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
                  <button key={s} onClick={() => { setSex(s); setHip(""); calculate(s, age, height, neck, waist, "", unit); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Age (years)</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="25" min="17" max="60" />
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
                <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "15.5" : "39"} min="1" step="0.5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Waist ({unitLabel}) <span className="text-xs text-muted-foreground">{sex === "male" ? "at navel" : "narrowest point"}</span></label>
              <div className="relative">
                <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "33" : "84"} min="1" step="0.5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
              </div>
            </div>
            {sex === "female" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Hip ({unitLabel}) <span className="text-xs text-muted-foreground">widest point</span></label>
                <div className="relative">
                  <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "in" ? "38" : "97"} min="1" step="0.5" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unitLabel}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(sex, age, height, neck, waist, hip, unit)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-4 ${result.passesStandard ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Army Body Fat Assessment</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.bf, 1)}%</div>
                <div className="text-sm mt-1 font-semibold" style={{ color: result.passesStandard ? "#10b981" : "#ef4444" }}>
                  {result.passesStandard ? `✓ Meets Army Standard (max ${result.armyMax}% for age ${result.ageGroup})` : `✗ Exceeds Army Standard (max ${result.armyMax}% for age ${result.ageGroup})`}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Detailed Results</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Estimated Body Fat", value: `${fmt(result.bf, 1)}%` },
                    { label: "Lean Mass", value: `${fmt(result.leanMass, 1)}%` },
                    { label: "Fitness Category", value: result.rating.label },
                    { label: `Army Max (Age ${result.ageGroup})`, value: `${result.armyMax}%` },
                    { label: "Army Standard", value: result.passesStandard ? "PASS ✓" : "FAIL ✗" },
                    { label: "Margin", value: result.passesStandard ? `${fmt(result.armyMax - result.bf, 1)}% under limit` : `${fmt(result.bf - result.armyMax, 1)}% over limit` },
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
                <h3 className="text-base font-semibold mb-4">Army Standards — All Age Groups ({result.s})</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(ARMY_STANDARDS[result.s]).map(([grp, max]) => (
                    <div key={grp} className="flex justify-between">
                      <span className="text-muted-foreground">Age {grp}</span>
                      <span className={`font-medium ${result.ageGroup === grp ? "text-primary font-bold" : ""}`}>Max {max}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Army Body Fat Calculator?</h2>
            <p>The Army Body Fat Calculator uses the U.S. Army's official circumference-based method (AR 600-9) to estimate body fat percentage and evaluate compliance with U.S. Army fitness standards. Pre-filled with age 25, height 70 inches, neck 15.5 inches, and waist 33 inches for a male, the estimated body fat is approximately 17% — well within the Army standard of 22% for the 21–27 age group. This calculator is essential for soldiers, recruits, and fitness-conscious individuals tracking military fitness readiness.</p>
            <h2>Army Body Fat Formula</h2>
            <p>The formula is identical to the Navy method (Hodgdon &amp; Beckett, 1984): <strong>Men:</strong> BF% = 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76. <strong>Women:</strong> BF% = 163.205 × log₁₀(waist + hip − neck) − 97.684 × log₁₀(height) − 78.387. The Army rounds all measurements to the nearest half-inch.</p>
            <h2>AR 600-9 Body Fat Standards</h2>
            <p>Army Regulation 600-9 specifies maximum body fat percentages by age group: <strong>Males:</strong> Ages 17–20: 20%, 21–27: 22%, 28–39: 24%, 40+: 26%. <strong>Females:</strong> Ages 17–20: 30%, 21–27: 32%, 28–39: 34%, 40+: 36%. These standards allow for age-related increases in acceptable body fat, acknowledging natural physiological changes while maintaining operational readiness requirements.</p>
            <h2>Army Body Composition Program (ABCP)</h2>
            <p>Soldiers who exceed body fat standards are placed in the Army Body Composition Program. Under ABCP, soldiers receive mandatory nutrition counseling, an exercise program, and are re-measured every 90 days. The program allows up to 6 months to reach compliance. Failure to meet standards can result in: bar to reenlistment, promotion denial, or administrative separation from service. However, the program also emphasizes health education and sustainable lifestyle changes.</p>
            <h2>Measurement Protocol (AR 600-9)</h2>
            <p>The Army specifies a precise measurement protocol: Three separate measurements of each site (neck, waist, hip for women) are taken. Each measurement is rounded down to the nearest 0.5 inch before recording. The average of the three measurements is calculated for each site. Neck measurements should slope upward to the back, taken just below the larynx. Waist measurements should be horizontal at the navel for men, at the natural waist for women.</p>
            <h2>Formula Accuracy and Limitations</h2>
            <p>The circumference method has a standard error of approximately ±3–4% body fat compared to DEXA scanning. For very muscular soldiers, the formula may overestimate body fat (larger neck measurement reduces the differential). For soldiers with unusual fat distribution, it may underestimate. The Army acknowledges these limitations but uses the method due to its practicality, reproducibility, and low equipment requirements in field conditions.</p>
            <h2>Army vs Navy vs Marine Corps Standards</h2>
            <p>All three services use the same Hodgdon &amp; Beckett circumference formula. The differences are in standards and administrative procedures: Navy uses OPNAVINST 6110.1J with slightly higher thresholds in some age groups. Marine Corps uses a similar method with stricter standards (especially for younger males). Army uses AR 600-9, which is updated periodically. For 2024, the Army shifted focus toward overall body composition and fitness rather than body fat alone, incorporating ACFT (Army Combat Fitness Test) performance data alongside body fat measurements.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/army-body-fat-calculator" />
          <PopularCalculators exclude="/calculator/army-body-fat-calculator" />
        </div>
      </div>
    </>
  );
};

export default ArmyBodyFatCalculator;
