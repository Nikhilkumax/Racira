"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplets, Activity, HeartPulse } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface BloodVolumeResult {
  volumeLiters: number;
  volumePints: number;
  volumeGallons: number;
  plasmaLiters: number;
  cellsLiters: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBloodVolume(sex: string, heightInches: number, weightLbs: number): BloodVolumeResult {
  const heightMeters = heightInches * 0.0254;
  const weightKg = weightLbs * 0.453592;

  let tbvLiters = 0;

  // Nadler Equation for Total Blood Volume (TBV)
  if (sex === "male") {
    tbvLiters = (0.3669 * Math.pow(heightMeters, 3)) + (0.03219 * weightKg) + 0.6041;
  } else {
    tbvLiters = (0.3561 * Math.pow(heightMeters, 3)) + (0.03308 * weightKg) + 0.1833;
  }

  const volumePints = tbvLiters * 2.11338;
  const volumeGallons = tbvLiters * 0.264172;

  // Average human blood composition: 55% Plasma, 45% Formed Elements (Red/White blood cells & platelets)
  const plasmaLiters = tbvLiters * 0.55;
  const cellsLiters = tbvLiters * 0.45;

  const chartData = [
    { name: "Blood Plasma (Liquid)", value: Number(plasmaLiters.toFixed(2)), color: "#fcd34d" }, // Yellowish for plasma
    { name: "Formed Elements (Cells)", value: Number(cellsLiters.toFixed(2)), color: "#ef4444" } // Red for cells
  ];

  const summaryStats = [
    { label: "Volume in Pints", value: `${volumePints.toFixed(1)} pts` },
    { label: "Volume in Gallons", value: `${volumeGallons.toFixed(2)} gal` }
  ];

  return {
    volumeLiters: Number(tbvLiters.toFixed(2)),
    volumePints: Number(volumePints.toFixed(1)),
    volumeGallons: Number(volumeGallons.toFixed(2)),
    plasmaLiters: Number(plasmaLiters.toFixed(2)),
    cellsLiters: Number(cellsLiters.toFixed(2)),
    chartData,
    summaryStats
  };
}

export default function BloodVolumeCalculator() {
  const [sex, setSex] = useState("male");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [weight, setWeight] = useState("180");

  const [result, setResult] = useState<BloodVolumeResult | null>(null);

  const calculate = () => {
    const f = parseInt(feet) || 0;
    const i = parseInt(inches) || 0;
    const w = parseFloat(weight);
    const h = (f * 12) + i;

    if (h > 0 && w > 0) {
      setResult(calcBloodVolume(sex, h, w));
    }
  };

  useEffect(() => { setResult(calcBloodVolume("male", 70, 180)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How does this calculator work?", answer: "This calculator uses the Nadler Equation, which is the gold standard clinical formula used by hematologists and anesthesiologists to estimate a patient's Total Blood Volume (TBV). It factors in your biological sex, height, and weight to provide an incredibly accurate estimation." },
    { question: "Why do men and women have different formulas?", answer: "Men typically have a higher ratio of muscle mass to body fat compared to women. Because muscle tissue requires significantly more oxygen than fat tissue, the male body physically requires a larger volume of blood to sustain it. The Nadler Equation accounts for these biological differences." },
    { question: "What is blood actually made of?", answer: "Your blood is roughly 55% Blood Plasma, which is a yellowish liquid made mostly of water, salts, and proteins. The remaining 45% consists of 'Formed Elements', which include Red Blood Cells (which carry oxygen), White Blood Cells (which fight infection), and Platelets (which clot your blood to stop bleeding)." },
    { question: "How much blood can I lose before it becomes dangerous?", answer: "A healthy adult can safely lose up to 15% of their total blood volume (roughly 1 pint, which is exactly what you donate at a blood drive) without experiencing any severe side effects. Losing 15% to 30% causes a rapid heart rate and weakness. Losing more than 30% to 40% causes life-threatening hemorrhagic shock requiring immediate transfusions." },
    { question: "How fast does my body replace lost blood?", answer: "If you lose a pint of blood, your kidneys immediately begin retaining water to replace the lost blood plasma (the liquid portion). Your total blood volume is usually restored to 100% within 24 to 48 hours. However, it takes your bone marrow 4 to 8 weeks to manufacture enough new Red Blood Cells to replace the ones you lost." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Blood Volume Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Blood Volume Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
              <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <HeartPulse className="h-5 w-5" /> Calculate Volume
              </button>
              <button onClick={() => { setSex("male"); setFeet("5"); setInches("10"); setWeight("180"); setResult(calcBloodVolume("male", 70, 180)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm bg-red-500/10 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-red-600">Total Estimated Blood Volume</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">{result.volumeLiters}</div>
                      <div className="text-2xl font-bold text-muted-foreground">Liters</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    <Droplets className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Blood Composition Breakdown</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Your blood is highly structured, consisting of a liquid matrix (plasma) suspending millions of specialized cells.</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} Liters`, 'Volume']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Blood Volume</h2>
            <p>Your blood is the body's primary transportation network. It delivers oxygen and nutrients to every cell while simultaneously removing carbon dioxide and waste products. But exactly how much of this fluid do you have?</p>
            <p>In clinical settings (such as preparing a patient for major surgery or dialysis), doctors cannot simply guess a patient's blood volume. Instead, they rely on the <strong>Nadler Equation</strong>. Developed in the 1960s, this complex mathematical formula accounts for the non-linear relationship between a person's height, weight, and biological sex to provide a highly accurate estimation of Total Blood Volume (TBV).</p>

            <h2>Why Body Fat Reduces Relative Blood Volume</h2>
            <p>An interesting biological reality is that fat tissue is relatively "avascular"—meaning it does not require a large network of blood vessels to survive. Muscle tissue, on the other hand, is highly vascular and requires massive amounts of oxygen-rich blood.</p>
            <p>Therefore, a 250-pound professional athlete with 10% body fat will actually have a significantly higher total blood volume than a 250-pound sedentary person with 40% body fat. The Nadler Equation mathematically adjusts for this by heavily weighting height (which correlates to bone and muscle structure) over raw weight.</p>

            <h2>The Two Halves of Blood</h2>
            <p>If you were to take a test tube of your blood and spin it in a centrifuge, it would rapidly separate into two distinct layers:</p>
            <ul>
              <li><strong>The Top Layer (55%): Blood Plasma.</strong> This is a clear, yellowish fluid. It is 90% water, but contains critical dissolved proteins, glucose, mineral ions, hormones, and carbon dioxide. Plasma is what allows your blood to flow.</li>
              <li><strong>The Bottom Layer (45%): Formed Elements.</strong> This dark red layer contains all of the physical cells. The vast majority are Red Blood Cells (Erythrocytes) which carry oxygen. A tiny fraction is made of White Blood Cells (Leukocytes) that fight infection, and Platelets (Thrombocytes) that clot to stop bleeding.</li>
            </ul>

            <h2>Hemorrhage: How Much Can You Lose?</h2>
            <p>The human body is incredibly resilient to blood loss, up to a strict limit. The American College of Surgeons classifies hemorrhage into four classes:</p>
            <ul>
              <li><strong>Class I (Up to 15% loss):</strong> The amount lost during a standard blood donation. The body compensates perfectly. You may not even notice an increased heart rate.</li>
              <li><strong>Class II (15% to 30% loss):</strong> The heart begins beating rapidly to circulate the remaining blood faster. Blood is shunted away from the skin (causing you to look pale) to protect vital organs.</li>
              <li><strong>Class III (30% to 40% loss):</strong> Blood pressure begins to drop dangerously. The patient will become confused and agitated as the brain is starved of oxygen. Emergency blood transfusions are required immediately.</li>
              <li><strong>Class IV (Over 40% loss):</strong> This is severe, life-threatening hemorrhagic shock. The heart cannot pump enough fluid to keep the patient alive without immediate, massive resuscitation.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blood-volume-calculator" />
          <PopularCalculators exclude="/calculator/blood-volume-calculator" />
        </div>
      </div>
    </>
  );
}
