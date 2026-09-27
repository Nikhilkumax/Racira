"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getHRRRating = (drop: number) => {
  if (drop >= 25) return { label: "Excellent", color: "#10b981", desc: "Superior cardiovascular fitness and recovery capacity." };
  if (drop >= 18) return { label: "Good", color: "#22c55e", desc: "Above-average autonomic recovery — well-conditioned." };
  if (drop >= 12) return { label: "Average", color: "#f59e0b", desc: "Normal recovery. Room for cardiovascular improvement." };
  return { label: "Poor / Abnormal", color: "#ef4444", desc: "Below-normal recovery. Consider cardiovascular evaluation." };
};

const HeartRateRecoveryCalculator = () => {
  const DEFAULTS = { peakHR: "175", hr1min: "150", hr2min: "130", hr3min: "115" };
  const [peakHR, setPeakHR] = useState(DEFAULTS.peakHR);
  const [hr1min, setHr1min] = useState(DEFAULTS.hr1min);
  const [hr2min, setHr2min] = useState(DEFAULTS.hr2min);
  const [hr3min, setHr3min] = useState(DEFAULTS.hr3min);
  const [result, setResult] = useState<any>(null);

  const calculate = (pk = peakHR, h1 = hr1min, h2 = hr2min, h3 = hr3min) => {
    const PK = parseFloat(pk) || 0;
    const H1 = parseFloat(h1) || 0;
    const H2 = parseFloat(h2) || 0;
    const H3 = parseFloat(h3) || 0;
    if (!PK || PK <= 0 || !H1) return;
    const drop1 = PK - H1;
    const drop2 = H2 > 0 ? PK - H2 : null;
    const drop3 = H3 > 0 ? PK - H3 : null;
    const rating = getHRRRating(drop1);
    const abnormal = drop1 < 12;
    const chartData = [
      { name: "Peak", hr: PK, color: "#ef4444" },
      { name: "1 min", hr: H1, color: rating.color },
      ...(H2 > 0 ? [{ name: "2 min", hr: H2, color: "#3b82f6" }] : []),
      ...(H3 > 0 ? [{ name: "3 min", hr: H3, color: "#10b981" }] : []),
    ];
    setResult({ PK, H1, H2, H3, drop1, drop2, drop3, rating, abnormal, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setPeakHR(DEFAULTS.peakHR); setHr1min(DEFAULTS.hr1min); setHr2min(DEFAULTS.hr2min); setHr3min(DEFAULTS.hr3min);
    calculate(DEFAULTS.peakHR, DEFAULTS.hr1min, DEFAULTS.hr2min, DEFAULTS.hr3min);
  };

  const faqs = [
    { question: "What is heart rate recovery (HRR)?", answer: "Heart rate recovery is the decline in heart rate measured at fixed intervals (typically 1, 2, and 3 minutes) after stopping peak exercise. It reflects how quickly the parasympathetic (vagal) nervous system reactivates to slow the heart. Faster recovery indicates better cardiovascular fitness and autonomic function." },
    { question: "What is a normal heart rate recovery?", answer: "After 1 minute: a drop of 18+ bpm is considered good, 25+ is excellent. A drop of less than 12 bpm at 1 minute is considered abnormal and has been associated with increased mortality risk in multiple landmark studies (Cole et al., NEJM 1999). After 2 minutes: a drop of 42+ bpm is normal." },
    { question: "Why is HRR clinically important?", answer: "Abnormal HRR (< 12 bpm at 1 minute) is an independent predictor of all-cause mortality, even after adjusting for age, sex, fitness level, and traditional cardiovascular risk factors. The Cole et al. (1999) study in the New England Journal of Medicine showed that abnormal HRR was associated with a 4-fold increase in mortality risk over 6 years of follow-up." },
    { question: "How do I measure HRR correctly?", answer: "Perform exercise until reaching near-maximal effort. Stop exercising and stand or walk slowly (cool-down protocol matters). Record heart rate immediately at peak, then at exactly 1, 2, and 3 minutes post-exercise. Active cool-down (slow walking) is the standard protocol — supine recovery yields different reference values." },
    { question: "Can I improve my heart rate recovery?", answer: "Yes. Regular aerobic exercise (150+ minutes/week of moderate intensity) improves vagal tone and HRR within 4–12 weeks. High-intensity interval training (HIIT) is particularly effective. Other factors: adequate sleep, stress reduction, weight management, and avoiding chronic over-training. Elite athletes often have HRR drops of 30–50 bpm at 1 minute." },
    { question: "How does HRR relate to VO₂ max?", answer: "HRR and VO₂ max are moderately correlated (r = 0.3–0.5). Both reflect cardiovascular fitness but measure different aspects: VO₂ max measures maximal oxygen consumption capacity, while HRR measures autonomic nervous system recovery function. Improving one generally improves the other, though they are not interchangeable metrics." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Heart Rate Recovery Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Heart Rate Recovery Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Peak Exercise Heart Rate</label>
              <div className="relative">
                <input type="number" value={peakHR} onChange={(e) => setPeakHR(e.target.value)} className="h-10 w-full px-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="175" min="60" max="220" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">bpm</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Heart Rate at 1 Minute Post-Exercise</label>
              <div className="relative">
                <input type="number" value={hr1min} onChange={(e) => setHr1min(e.target.value)} className="h-10 w-full px-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="150" min="40" max="220" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">bpm</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Heart Rate at 2 Minutes <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="relative">
                <input type="number" value={hr2min} onChange={(e) => setHr2min(e.target.value)} className="h-10 w-full px-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="130" min="40" max="220" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">bpm</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Heart Rate at 3 Minutes <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="relative">
                <input type="number" value={hr3min} onChange={(e) => setHr3min(e.target.value)} className="h-10 w-full px-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="115" min="40" max="220" />
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">1-Minute Heart Rate Recovery</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{result.drop1} <span className="text-xl">bpm drop</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
                {result.abnormal && (
                  <div className="text-xs text-red-500 mt-2 font-medium">⚠ Drop &lt; 12 bpm is considered abnormal. Consider consulting a physician for cardiovascular evaluation.</div>
                )}
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Recovery Timeline</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Peak Exercise HR", value: `${result.PK} bpm` },
                    { label: "HR at 1 Minute", value: `${result.H1} bpm (−${result.drop1} bpm)` },
                    ...(result.drop2 !== null ? [{ label: "HR at 2 Minutes", value: `${result.H2} bpm (−${result.drop2} bpm)` }] : []),
                    ...(result.drop3 !== null ? [{ label: "HR at 3 Minutes", value: `${result.H3} bpm (−${result.drop3} bpm)` }] : []),
                    { label: "1-Min Recovery Rating", value: result.rating.label },
                    { label: "Clinical Threshold", value: result.drop1 >= 12 ? "Normal (≥12 bpm) ✓" : "Abnormal (<12 bpm) ✗" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Heart Rate Recovery Curve</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${v} bpm`} />
                    <Bar dataKey="hr" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Reference Values</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Excellent", "≥ 25 bpm", "#10b981"],
                    ["Good", "18–24 bpm", "#22c55e"],
                    ["Average", "12–17 bpm", "#f59e0b"],
                    ["Abnormal", "< 12 bpm", "#ef4444"],
                  ].map(([label, range, color], i) => (
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
            <h2 className="text-2xl font-bold mb-3">What Is a Heart Rate Recovery Calculator?</h2>
            <p>A heart rate recovery (HRR) calculator measures how quickly your heart rate drops after peak exercise — a powerful indicator of cardiovascular fitness and autonomic nervous system health. Pre-filled with a peak heart rate of 175 bpm dropping to 150 bpm at 1 minute, the 25-bpm recovery is rated "Excellent." Slower recovery indicates reduced parasympathetic (vagal) tone and may warrant medical evaluation.</p>
            <h2 className="text-2xl font-bold mb-3">The Clinical Significance of HRR</h2>
            <p>The landmark 1999 New England Journal of Medicine study by Cole et al. demonstrated that a 1-minute HRR below 12 bpm (during active cool-down) was an independent predictor of mortality — patients with abnormal HRR had a 4-fold increase in 6-year mortality risk. This finding has been replicated across diverse populations and is now a standard component of exercise stress testing interpretation in cardiology.</p>
            <h2 className="text-2xl font-bold mb-3">How Heart Rate Recovery Works</h2>
            <p>During exercise, the sympathetic nervous system accelerates heart rate. After exercise stops, the parasympathetic (vagus) nerve rapidly reactivates to slow the heart. A healthy autonomic system creates a sharp, rapid decline in HR. Impaired vagal reactivation — seen in heart failure, diabetes, chronic inflammation, and physical deconditioning — results in sluggish recovery. The speed of this transition directly reflects autonomic balance and cardiovascular reserve.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting Multi-Minute Recovery</h2>
            <p>1-Minute Drop: The most clinically validated timepoint. ≥12 bpm is normal, ≥25 bpm is excellent. 2-Minute Drop: A drop ≥42 bpm is considered normal. Abnormal 2-minute recovery independently predicts mortality. 3-Minute Drop: Less standardized, but provides additional context. Elite athletes often recover to within 20 bpm of resting by 3 minutes. The recovery curve should be steadily declining — a plateau or secondary rise may indicate arrhythmia.</p>
            <h2 className="text-2xl font-bold mb-3">Factors Affecting Heart Rate Recovery</h2>
            <p>Cardiovascular fitness (most important), age (HRR decreases with age), medications (beta-blockers dramatically improve HRR, while anticholinergics impair it), chronic conditions (heart failure, diabetes, COPD reduce HRR), overtraining syndrome, dehydration, and ambient temperature all affect recovery speed. Serial HRR measurements over weeks provide more reliable assessment than single measurements.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Heart Rate Recovery</h2>
            <p>Regular aerobic exercise improves HRR within 4–12 weeks. HIIT (high-intensity interval training) is particularly effective at enhancing autonomic function. Additional strategies: adequate sleep (7–9 hours), meditation and deep breathing exercises (directly stimulate vagal tone), weight management, smoking cessation, moderate alcohol consumption, and avoiding chronic psychological stress. Elite endurance athletes exhibit HRR drops of 30–50+ bpm at 1 minute, reflecting superior vagal tone.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heart-rate-recovery-calculator" />
          <PopularCalculators exclude="/calculator/heart-rate-recovery-calculator" />
        </div>
      </div>
    </>
  );
};

export default HeartRateRecoveryCalculator;
