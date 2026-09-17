"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getMAPRating = (map: number) => {
  if (map < 60) return { label: "Hypotension Risk", color: "#3b82f6", desc: "Below critical threshold — risk of organ hypoperfusion." };
  if (map < 70) return { label: "Low Normal", color: "#f59e0b", desc: "Adequate but on lower end. Monitor for symptoms." };
  if (map <= 100) return { label: "Normal", color: "#10b981", desc: "Healthy perfusion pressure. Optimal organ function." };
  if (map <= 110) return { label: "High Normal", color: "#f59e0b", desc: "Elevated. May warrant monitoring over time." };
  return { label: "Hypertensive", color: "#ef4444", desc: "Consistently high MAP. Seek medical evaluation." };
};

const MeanArterialPressureCalculator = () => {
  const DEFAULTS = { systolic: "120", diastolic: "80" };
  const [systolic, setSystolic] = useState(DEFAULTS.systolic);
  const [diastolic, setDiastolic] = useState(DEFAULTS.diastolic);
  const [result, setResult] = useState<any>(null);

  const calculate = (sbp = systolic, dbp = diastolic) => {
    const SBP = parseFloat(sbp) || 0;
    const DBP = parseFloat(dbp) || 0;
    if (!SBP || !DBP || SBP <= 0 || DBP <= 0 || SBP < DBP) return;
    const map = DBP + (SBP - DBP) / 3;
    const pp = SBP - DBP;
    const rating = getMAPRating(map);
    const chartData = [
      { name: "Diastolic", value: DBP, color: "#3b82f6" },
      { name: "MAP", value: parseFloat(map.toFixed(0)), color: rating.color },
      { name: "Systolic", value: SBP, color: "#ef4444" },
    ];
    setResult({ SBP, DBP, map, pp, rating, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setSystolic(DEFAULTS.systolic); setDiastolic(DEFAULTS.diastolic); calculate(DEFAULTS.systolic, DEFAULTS.diastolic); };

  const faqs = [
    { question: "What is mean arterial pressure (MAP)?", answer: "Mean arterial pressure is the average blood pressure during a single cardiac cycle. It represents the true driving pressure for blood perfusion to organs. MAP is weighted toward diastolic pressure because the heart spends approximately 2/3 of the cardiac cycle in diastole (filling) and only 1/3 in systole (pumping)." },
    { question: "What is the MAP formula?", answer: "MAP = Diastolic BP + 1/3 × (Systolic BP − Diastolic BP). Equivalently: MAP = (2 × DBP + SBP) / 3. For 120/80 mmHg: MAP = 80 + (120 − 80)/3 = 80 + 13.3 = 93.3 mmHg." },
    { question: "What is a normal MAP?", answer: "A MAP between 70–100 mmHg is generally considered normal. Below 60 mmHg is considered critically low — organs may not receive adequate perfusion. Above 100 mmHg consistently indicates hypertensive-range arterial pressure. In ICU settings, MAP ≥ 65 mmHg is typically the minimum target for adequate perfusion." },
    { question: "Why is MAP more important than systolic or diastolic BP alone?", answer: "MAP represents the average pressure driving blood through the entire circulatory system. A person with 150/60 and one with 120/80 have very different BP patterns but may have similar MAPs. MAP is the pressure that organs 'see' on average throughout the cardiac cycle, making it the best single predictor of organ perfusion." },
    { question: "What is pulse pressure and why does it matter?", answer: "Pulse Pressure = Systolic − Diastolic BP. Normal pulse pressure is 30–50 mmHg. Wide pulse pressure (>60 mmHg) may indicate aortic valve regurgitation, arterial stiffness (atherosclerosis), or hyperthyroidism. Narrow pulse pressure (<25 mmHg) may indicate heart failure, cardiac tamponade, or aortic stenosis. It is an independent predictor of cardiovascular events." },
    { question: "When is MAP used clinically?", answer: "MAP is used extensively in emergency medicine, critical care (ICU), anesthesiology, and nephrology. Common clinical applications: shock resuscitation (target MAP ≥ 65), vasopressor titration in sepsis, intra-operative blood pressure management, and assessing cerebral perfusion pressure (CPP = MAP − intracranial pressure). Automated ICU monitors calculate and display MAP continuously." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Mean Arterial Pressure Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mean Arterial Pressure (MAP) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Systolic Blood Pressure</label>
              <div className="relative">
                <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} className="h-10 w-full px-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="120" min="60" max="250" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mmHg</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Diastolic Blood Pressure</label>
              <div className="relative">
                <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} className="h-10 w-full px-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="80" min="30" max="180" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mmHg</span>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mean Arterial Pressure (MAP)</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.map, 1)} <span className="text-xl">mmHg</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Blood Pressure Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Systolic BP", value: `${result.SBP} mmHg` },
                    { label: "Diastolic BP", value: `${result.DBP} mmHg` },
                    { label: "Mean Arterial Pressure (MAP)", value: `${fmt(result.map, 1)} mmHg` },
                    { label: "Pulse Pressure (PP)", value: `${result.pp} mmHg` },
                    { label: "PP Assessment", value: result.pp >= 30 && result.pp <= 50 ? "Normal (30–50)" : result.pp > 50 ? "Wide (elevated risk)" : "Narrow (may indicate low output)" },
                    { label: "MAP Category", value: result.rating.label },
                    { label: "Organ Perfusion", value: result.map >= 60 ? "Adequate ✓" : "Inadequate — Risk ✗" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">BP Component Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${v} mmHg`} />
                    <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 2" label={{ value: "Min Normal 70", position: "insideTopLeft", fontSize: 9 }} />
                    <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Max Normal 100", position: "insideTopRight", fontSize: 9 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Clinical Reference</h3>
                <div className="space-y-3">
                  {[
                    { label: "Blood Pressure", value: `${result.SBP}/${result.DBP} mmHg` },
                    { label: "MAP", value: `${fmt(result.map, 1)} mmHg` },
                    { label: "Pulse Pressure", value: `${result.pp} mmHg` },
                    { label: "Perfusion Status", value: result.map >= 60 ? "Adequate" : "Inadequate", border: true, bold: true },
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
            <h2 className="text-2xl font-bold mb-3">What Is a Mean Arterial Pressure Calculator?</h2>
            <p>A mean arterial pressure (MAP) calculator computes the average blood pressure during a complete cardiac cycle from your systolic and diastolic readings. MAP is the single best indicator of organ perfusion pressure — the force driving blood through your kidneys, brain, and other vital organs. Pre-filled with 120/80 mmHg (normal blood pressure), the MAP is 93 mmHg — well within the healthy range of 70–100 mmHg.</p>
            <h2 className="text-2xl font-bold mb-3">The MAP Formula</h2>
            <p><strong>MAP = Diastolic BP + ⅓ × (Systolic BP − Diastolic BP)</strong></p>
            <p>Equivalently: MAP = (2 × DBP + SBP) / 3. The formula weights diastolic pressure more heavily because the heart spends approximately 2/3 of each cardiac cycle in diastole. For 120/80: MAP = 80 + (120−80)/3 = 80 + 13.3 = 93.3 mmHg.</p>
            <h2 className="text-2xl font-bold mb-3">Clinical Significance</h2>
            <p>MAP is the primary hemodynamic target in critical care medicine. In septic shock, the Surviving Sepsis Campaign guidelines recommend maintaining MAP ≥ 65 mmHg using fluids and vasopressors. Below 60 mmHg, organ perfusion becomes compromised — the kidneys begin to fail (acute kidney injury), cerebral autoregulation breaks down, and tissue ischemia develops. Chronically elevated MAP (&gt;100 mmHg) damages blood vessel walls and accelerates atherosclerosis.</p>
            <h2 className="text-2xl font-bold mb-3">Pulse Pressure</h2>
            <p>Pulse pressure (PP = Systolic − Diastolic) is an independent cardiovascular risk marker. Normal PP is 30–50 mmHg. Wide PP (&gt;60 mmHg) indicates: arterial stiffness (aging/atherosclerosis), aortic regurgitation, hyperthyroidism, or anemia. Narrow PP (&lt;25 mmHg) may indicate: heart failure, cardiac tamponade, aortic stenosis, or hypovolemic shock. PP widens naturally with age as arteries lose compliance.</p>
            <h2 className="text-2xl font-bold mb-3">MAP and Cerebral Perfusion</h2>
            <p>The brain requires a cerebral perfusion pressure (CPP) of 60–70 mmHg for adequate oxygenation. CPP = MAP − Intracranial Pressure (ICP). In traumatic brain injury management, MAP is carefully targeted to maintain CPP above 60 mmHg while controlling ICP. Too high MAP with elevated ICP can worsen brain edema, while too low MAP causes cerebral ischemia. This is why MAP monitoring is continuous in neurocritical care units.</p>
            <h2 className="text-2xl font-bold mb-3">MAP in Anesthesia</h2>
            <p>During surgery, anesthesiologists monitor MAP continuously and maintain it within 20% of the patient's baseline to prevent organ damage. A MAP drop below 65 mmHg for more than 10 minutes during surgery is associated with myocardial injury, acute kidney injury, and 30-day mortality. Vasopressors (phenylephrine, ephedrine) and fluid boluses are titrated to maintain MAP targets.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mean-arterial-pressure-calculator" />
          <PopularCalculators exclude="/calculator/mean-arterial-pressure-calculator" />
        </div>
      </div>
    </>
  );
};

export default MeanArterialPressureCalculator;
