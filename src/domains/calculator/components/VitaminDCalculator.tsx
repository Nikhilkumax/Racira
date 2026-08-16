"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Sun } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";

interface VitaminDResult {
  dailyIU: number;
  maintenanceIU: number;
  status: string;
  statusColor: string;
  recommendation: string;
  bloodLevelTarget: string;
  breakdown: { label: string; value: string }[];
  chartData: { category: string; span: number; min: number; max: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcVitaminD(
  age: number, weightLbs: number, sunExposure: string,
  skinType: string, currentBloodLevel: number
): VitaminDResult {
  // Base daily maintenance depending on age (Endocrine Society guidelines)
  let maintenanceIU = 600;
  if (age < 1) maintenanceIU = 400;
  else if (age > 70) maintenanceIU = 800;

  // Weight modifier: Obese individuals require 2-3x more Vitamin D (it's fat soluble)
  let weightMultiplier = 1;
  if (weightLbs > 200) weightMultiplier = 2;
  if (weightLbs > 250) weightMultiplier = 2.5;

  // Sun / Skin modifier
  if (sunExposure === "low" || skinType === "dark") {
    maintenanceIU = Math.max(maintenanceIU, 1000);
  }

  maintenanceIU = Math.round(maintenanceIU * weightMultiplier);

  // If a blood level is provided, calculate loading dose to reach 40 ng/mL
  let dailyIU = maintenanceIU;
  let status = "Maintenance Phase";
  let statusColor = "#3b82f6"; // Blue
  let recommendation = `To maintain healthy Vitamin D levels, supplement with approximately ${maintenanceIU.toLocaleString()} IU daily.`;
  
  if (currentBloodLevel > 0) {
    if (currentBloodLevel < 20) {
      status = "Deficient";
      statusColor = "#ef4444"; // Red
      dailyIU = 7000 * weightMultiplier;
      recommendation = `You are deficient. Clinical guidelines recommend high-dose therapy (e.g. ~${Math.round(dailyIU).toLocaleString()} IU daily) for 8 weeks, followed by maintenance.`;
    } else if (currentBloodLevel < 30) {
      status = "Insufficient";
      statusColor = "#f59e0b"; // Orange
      const deficit = 40 - currentBloodLevel;
      dailyIU = maintenanceIU + (deficit * 100 * weightMultiplier);
      recommendation = `You have insufficient levels. To reach the optimal range of 40-50 ng/mL, supplement with ~${Math.round(dailyIU).toLocaleString()} IU daily for 2-3 months.`;
    } else if (currentBloodLevel <= 60) {
      status = "Optimal";
      statusColor = "#22c55e"; // Green
      dailyIU = maintenanceIU;
      recommendation = `Your levels are currently optimal. Continue with a maintenance dose of ${maintenanceIU.toLocaleString()} IU daily.`;
    } else if (currentBloodLevel <= 100) {
      status = "High Normal";
      statusColor = "#3b82f6"; // Blue
      dailyIU = Math.max(400, maintenanceIU / 2);
      recommendation = `Your levels are high-normal. You can reduce your supplementation to ${Math.round(dailyIU).toLocaleString()} IU daily.`;
    } else {
      status = "Potentially Toxic";
      statusColor = "#7f1d1d"; // Dark Red
      dailyIU = 0;
      recommendation = "Levels above 100 ng/mL can cause toxicity (hypercalcemia). Stop supplementation and consult your doctor immediately.";
    }
  }

  // Cap the daily UI recommendation for safety
  if (dailyIU > 10000) dailyIU = 10000;

  const bloodLevelTarget = "40 - 50 ng/mL";

  const breakdown = [
    { label: "Patient Age", value: `${age} years` },
    { label: "Patient Weight", value: `${weightLbs} lbs` },
    { label: "Current Blood Level", value: currentBloodLevel > 0 ? `${currentBloodLevel} ng/mL` : "Not provided" },
    { label: "Body Mass Multiplier", value: `${weightMultiplier}x` },
    { label: "Calculated Status", value: status },
  ];

  const summaryStats = [
    { label: "Therapeutic Dose", value: `${Math.round(dailyIU).toLocaleString()} IU/day` },
    { label: "Maintenance Dose", value: `${maintenanceIU.toLocaleString()} IU/day` },
    { label: "Clinical Target", value: bloodLevelTarget },
    { label: "Status", value: status },
  ];

  // Chart data representing the blood level spectrum
  const chartData = [
    { category: "Deficient", min: 0, max: 20, span: 20, color: "#ef4444" },
    { category: "Low", min: 20, max: 30, span: 10, color: "#f59e0b" },
    { category: "Optimal", min: 30, max: 60, span: 30, color: "#22c55e" },
    { category: "High", min: 60, max: 100, span: 40, color: "#3b82f6" },
    { category: "Toxic", min: 100, max: 150, span: 50, color: "#7f1d1d" },
  ];

  return { dailyIU: Math.round(dailyIU), maintenanceIU, status, statusColor, recommendation, bloodLevelTarget, breakdown, chartData, summaryStats };
}

export default function VitaminDCalculator() {
  const [age, setAge] = useState("35");
  const [weight, setWeight] = useState("160");
  const [sun, setSun] = useState("moderate");
  const [skin, setSkin] = useState("medium");
  const [bloodLevel, setBloodLevel] = useState("24");
  const [result, setResult] = useState<VitaminDResult | null>(null);

  const calculate = () => {
    const a = parseInt(age), w = parseInt(weight), b = parseFloat(bloodLevel) || 0;
    if (a > 0 && w > 0) setResult(calcVitaminD(a, w, sun, skin, b));
  };

  useEffect(() => { setResult(calcVitaminD(35, 160, "moderate", "medium", 24)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is the optimal Vitamin D blood level?", answer: "According to the Endocrine Society, Vitamin D deficiency is defined as a 25(OH)D blood level below 20 ng/mL. Insufficiency is 21-29 ng/mL. Sufficiency is 30-100 ng/mL. However, many functional medicine doctors, immunologists, and modern researchers suggest an 'optimal' target range of 40-60 ng/mL to maximize immune function, bone density, and hormone regulation." },
    { question: "Why do heavier individuals need more Vitamin D?", answer: "Vitamin D is a fat-soluble vitamin. Unlike water-soluble vitamins (like Vitamin C) that circulate freely in the blood, fat-soluble vitamins are physically sequestered (stored) inside fat tissue. This severely reduces its bioavailability in the bloodstream. Because of this physiological trap, obese adults often require 2 to 3 times more Vitamin D than normal-weight adults just to achieve and maintain the same blood levels." },
    { question: "Can I get enough Vitamin D from the sun?", answer: "It is possible during the peak summer months if you expose large areas of skin (arms and legs) without sunscreen for 15-30 minutes midday. However, if you live above 37 degrees latitude (e.g., anywhere north of Atlanta, Georgia), the winter sun's angle is simply too low to trigger any Vitamin D synthesis in your skin from November through March. In these regions, supplementation or heavily fortified foods are absolutely essential." },
    { question: "Should I take Vitamin D2 or D3?", answer: "You should exclusively take Vitamin D3 (cholecalciferol). D3 is the exact molecular form naturally produced by your body when exposed to sunlight. Clinical studies consistently prove that Vitamin D3 is significantly more effective at raising and sustaining blood levels of 25(OH)D than Vitamin D2 (ergocalciferol), which is a cheaper, plant-derived form often found in older prescription formulas." },
    { question: "Why should I take Vitamin K2 alongside Vitamin D?", answer: "Vitamin D's primary role is to increase the absorption of calcium from your diet into your bloodstream. However, it does not control where that calcium goes. Without adequate Vitamin K2, that free-floating calcium can deposit in your soft tissues and arteries (causing dangerous calcification). Vitamin K2 activates proteins (like Osteocalcin) that bind to the calcium and direct it straight into the bone matrix. Taking them together ensures calcium ends up in your bones, not your heart." },
    { question: "Is it possible to overdose on Vitamin D?", answer: "Yes. Vitamin D toxicity (hypercalcemia) is a severe condition that causes dangerously high calcium levels in the blood, leading to kidney stones, intense nausea, confusion, and permanent organ damage. However, toxicity is rare. It typically only occurs after a patient takes extremely high doses (e.g., 50,000+ IU daily) continuously for several months. Blood levels above 150 ng/mL are considered toxic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Vitamin D Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Vitamin D Dosage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Body Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className={suf}>lbs</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Blood Level: 25(OH)D</label>
              <div className={inp}><input type="number" value={bloodLevel} onChange={e => setBloodLevel(e.target.value)} placeholder="e.g. 24" className={ci} /><span className={suf}>ng/mL</span></div>
              <p className="text-xs text-muted-foreground mt-1">Leave blank or set to 0 for a general maintenance dose.</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Sun Exposure</label>
              <select value={sun} onChange={e => setSun(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-base shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="high">High (Daily outdoor time, no sunscreen)</option>
                <option value="moderate">Moderate (Some outdoor time)</option>
                <option value="low">Low (Mostly indoors, winter, or sunscreen)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Skin Pigmentation</label>
              <select value={skin} onChange={e => setSkin(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-base shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="light">Light (Burns easily)</option>
                <option value="medium">Medium (Tans easily)</option>
                <option value="dark">Dark (Rarely burns)</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setWeight("160"); setSun("moderate"); setSkin("medium"); setBloodLevel("24"); setResult(calcVitaminD(35, 160, "moderate", "medium", 24)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Target Daily Dosage</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-primary tracking-tight">{result.dailyIU.toLocaleString()}</div>
                  <div className="text-lg font-semibold text-muted-foreground">IU / day</div>
                </div>
                <div className="text-sm font-semibold mt-2" style={{ color: result.statusColor }}>{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Status", result.status], ["Maintenance", `${result.maintenanceIU.toLocaleString()} IU`], ["Multiplier", `${result.breakdown[3].value}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Clinical Profile Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">25(OH)D Blood Level Spectrum</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 150]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={55} />
                    <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.min} – ${p.payload.max} ng/mL`, "Range"]} />
                    {parseFloat(bloodLevel) > 0 && (
                      <ReferenceLine x={parseFloat(bloodLevel) > 150 ? 150 : parseFloat(bloodLevel)} stroke="#6366f1" strokeWidth={3} strokeDasharray="4 4" label={{ value: `You: ${bloodLevel}`, position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />
                    )}
                    <Bar dataKey="span" radius={[0, 4, 4, 0]}>{result.chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Standard clinical thresholds for Vitamin D sufficiency.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Global Vitamin D Epidemic</h2>
            <p>Vitamin D is not actually a vitamin—it is a powerful pro-hormone that controls the expression of over 1,000 genes throughout the human body. Every single cell in your immune system, from T-cells to macrophages, contains Vitamin D receptors. Without adequate levels, your immune system cannot activate effectively to fight off viruses, your bones cannot absorb calcium, and your brain struggles to regulate mood-stabilizing neurotransmitters like serotonin.</p>
            <p>Despite its critical importance, we are facing a global deficiency epidemic. Because modern humans spend the vast majority of their lives indoors, and heavily apply sunscreen when outdoors, over 40% of the population is clinically deficient in Vitamin D, with another 30% hovering in the "insufficient" range. This calculator is designed to help you determine the exact daily dosage required to pull yourself out of deficiency and into the optimal range.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding The 25(OH)D Blood Test</h2>
            <p>To accurately dose Vitamin D, you must first know your baseline. The only way to determine this is through a specific blood test called the <strong>25-hydroxyvitamin D test</strong>, abbreviated as 25(OH)D. This test measures the stable, storage form of the vitamin circulating in your liver.</p>
            <p>The Endocrine Society defines the following clinical thresholds (measured in nanograms per milliliter, ng/mL):</p>
            <ul>
              <li><strong>Deficient:</strong> Below 20 ng/mL. At this level, bone softening (osteomalacia in adults, rickets in children) can occur, and immune function is severely compromised.</li>
              <li><strong>Insufficient:</strong> 20 to 29 ng/mL. The body has enough to prevent severe bone disease, but not enough to optimize immune or hormonal health.</li>
              <li><strong>Sufficient (Optimal):</strong> 30 to 60 ng/mL. Most functional medicine doctors push for the higher end of this range (40-60 ng/mL) for maximum longevity and disease prevention.</li>
              <li><strong>Potentially Toxic:</strong> Above 100 ng/mL. Prolonged levels this high can lead to hypercalcemia (calcium buildup in the blood), causing kidney stones and arterial damage.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">How The Calculator Determines Your Dosage</h2>
            <p>Calculating your required daily dosage is highly individualized. A standard "one size fits all" gummy vitamin containing 400 IU is mathematically incapable of correcting a deficiency in an adult. The calculator uses four primary biological factors:</p>

            <h3>1. Your Current Blood Level (The Deficit)</h3>
            <p>If your blood test shows a level of 15 ng/mL, your goal is to reach 40 ng/mL. You have a massive deficit of 25 ng/mL. As a general clinical rule of thumb, it takes an additional 100 IU of Vitamin D3 daily to raise your blood level by 1 ng/mL. Therefore, you would need an extra 2,500 IU per day <em>on top</em> of your standard maintenance dose just to slowly fill the tank over the course of 3 months.</p>

            <h3>2. Body Weight and Fat Percentage</h3>
            <p>Vitamin D is fat-soluble. When you consume it, your fat cells act like a sponge, absorbing and locking away the vitamin so it cannot circulate in your bloodstream. A person weighing 250 lbs has significantly more fat tissue than a person weighing 130 lbs. Therefore, the heavier person requires a massive mathematical multiplier (often 2x or 3x the standard dose) to saturate the fat cells and allow the excess vitamin to finally remain in the blood.</p>

            <h3>3. Skin Pigmentation (Melanin)</h3>
            <p>Melanin is the pigment that makes skin dark. It evolved near the equator to act as a highly effective, natural sunblock to prevent UV damage. However, when dark-skinned individuals migrate to northern latitudes with weak sunlight, their natural sunblock prevents them from synthesizing Vitamin D. A dark-skinned person may need to stand in the sun for 90 minutes to produce the same amount of Vitamin D that a fair-skinned person produces in 15 minutes. Consequently, darker skin tones require significantly higher daily supplementation targets.</p>

            <h3>4. Daily Sun Exposure</h3>
            <p>If you work outdoors in construction in Texas, you are likely synthesizing 10,000+ IU of Vitamin D a day naturally, and require zero supplementation. If you work in an office in Seattle and wear sunscreen on the weekends, your natural production is effectively zero, and you must rely 100% on oral supplements.</p>

            <h2 className="text-2xl font-bold mb-3">Loading Dose vs. Maintenance Dose</h2>
            <p>If the calculator flags you as "Deficient," your doctor will likely not prescribe a daily pill. Trying to fix a severe deficiency with 2,000 IU a day is like trying to fill a swimming pool with a garden hose. Instead, doctors use a <strong>Loading Dose</strong> protocol.</p>
            <p>The standard medical protocol is to prescribe a massive 50,000 IU capsule to be taken once a week for 8 straight weeks. This floods the system and rapidly brings the blood levels up to 40 ng/mL. Once the 8 weeks are over, the patient is transitioned to a <strong>Maintenance Dose</strong> (typically 2,000 to 4,000 IU daily) to keep the "pool" full indefinitely. Never attempt a high-dose loading protocol without direct supervision and regular blood testing from a physician.</p>

            <h2 className="text-2xl font-bold mb-3">Crucial Co-Factors: Vitamin K2 and Magnesium</h2>
            <p>You should never take high doses of Vitamin D in isolation. Vitamin D works synergistically with two critical co-factors.</p>
            <p><strong>Magnesium:</strong> Every enzyme involved in metabolizing Vitamin D in the liver and kidneys requires magnesium to function. If you are magnesium deficient (and roughly 50% of the population is), taking high doses of Vitamin D will rapidly deplete your remaining magnesium stores, leading to muscle cramps, heart palpitations, and anxiety.</p>
            <p><strong>Vitamin K2:</strong> As mentioned, Vitamin D vastly increases your body's absorption of dietary calcium. If that calcium is not directed into your bones, it will float in your bloodstream and calcify your soft tissues and arteries. Vitamin K2 acts as the "traffic cop," activating the proteins that shuttle calcium directly into the bone matrix. Always look for a supplement that pairs Vitamin D3 with Vitamin K2 (specifically the MK-7 variant) to ensure long-term cardiovascular safety.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vitamin-d-calculator" />
          <PopularCalculators exclude="/calculator/vitamin-d-calculator" />
        </div>
      </div>
    </>
  );
}
