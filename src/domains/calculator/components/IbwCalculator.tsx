"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface IBWResult {
  devineKg: number;
  robinsonKg: number;
  millerKg: number;
  hamwiKg: number;
  
  devineLbs: number;
  robinsonLbs: number;
  millerLbs: number;
  hamwiLbs: number;

  averageKg: number;
  averageLbs: number;
  
  chartData: { name: string; kg: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcIBW(
  sex: string, heightInches: number
): IBWResult {
  let devineKg = 0, robinsonKg = 0, millerKg = 0, hamwiKg = 0;
  
  // Formulas calculate IBW for height over 5 feet (60 inches)
  const inchesOver60 = Math.max(0, heightInches - 60);

  if (sex === "male") {
    // Male formulas
    devineKg = 50.0 + (2.3 * inchesOver60);
    robinsonKg = 52.0 + (1.9 * inchesOver60);
    millerKg = 56.2 + (1.41 * inchesOver60);
    hamwiKg = 48.0 + (2.7 * inchesOver60);
    
    // For males under 5 feet, subtract standard ratio
    if (heightInches < 60) {
      const deficit = 60 - heightInches;
      devineKg = 50.0 - (2.3 * deficit);
      robinsonKg = 52.0 - (1.9 * deficit);
      millerKg = 56.2 - (1.41 * deficit);
      hamwiKg = 48.0 - (2.7 * deficit);
    }
  } else {
    // Female formulas
    devineKg = 45.5 + (2.3 * inchesOver60);
    robinsonKg = 49.0 + (1.7 * inchesOver60);
    millerKg = 53.1 + (1.36 * inchesOver60);
    hamwiKg = 45.5 + (2.2 * inchesOver60);
    
    // For females under 5 feet
    if (heightInches < 60) {
      const deficit = 60 - heightInches;
      devineKg = 45.5 - (2.3 * deficit);
      robinsonKg = 49.0 - (1.7 * deficit);
      millerKg = 53.1 - (1.36 * deficit);
      hamwiKg = 45.5 - (2.2 * deficit);
    }
  }

  // Convert kg to lbs
  const kgToLbs = 2.20462;
  const devineLbs = devineKg * kgToLbs;
  const robinsonLbs = robinsonKg * kgToLbs;
  const millerLbs = millerKg * kgToLbs;
  const hamwiLbs = hamwiKg * kgToLbs;

  const averageKg = (devineKg + robinsonKg + millerKg + hamwiKg) / 4;
  const averageLbs = averageKg * kgToLbs;

  const chartData = [
    { name: "Devine (1974)", kg: Number(devineKg.toFixed(1)), fill: "#3b82f6" },
    { name: "Robinson (1983)", kg: Number(robinsonKg.toFixed(1)), fill: "#8b5cf6" },
    { name: "Miller (1983)", kg: Number(millerKg.toFixed(1)), fill: "#10b981" },
    { name: "Hamwi (1964)", kg: Number(hamwiKg.toFixed(1)), fill: "#f59e0b" },
  ];

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  const summaryStats = [
    { label: "Sex Assessed", value: sex === "male" ? "Biological Male" : "Biological Female" },
    { label: "Height Assessed", value: `${feet}'${inches}"` },
    { label: "Clinical Standard", value: "Devine Formula" },
    { label: "IBW Average", value: `${averageLbs.toFixed(1)} lbs` }
  ];

  return {
    devineKg, robinsonKg, millerKg, hamwiKg,
    devineLbs, robinsonLbs, millerLbs, hamwiLbs,
    averageKg, averageLbs, chartData, summaryStats
  };
}

export default function IbwCalculator() {
  const [sex, setSex] = useState("male");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");

  const [result, setResult] = useState<IBWResult | null>(null);

  const calculate = () => {
    const f = parseInt(feet) || 0;
    const i = parseInt(inches) || 0;
    const totalInches = (f * 12) + i;
    if (totalInches > 0) {
      setResult(calcIBW(sex, totalInches));
    }
  };

  useEffect(() => { setResult(calcIBW("male", 70)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What does 'Ideal' Body Weight mean?", answer: "In a medical context, 'Ideal Body Weight' has absolutely nothing to do with aesthetics, attractiveness, or social beauty standards. It is a strictly mathematical value used by clinical pharmacists and anesthesiologists to determine safe dosages for medications that distribute into lean tissue rather than fat tissue." },
    { question: "Why are there four different formulas?", answer: "Dr. B.J. Devine published the first major formula in 1974 strictly for calculating drug dosages. Later researchers (Robinson, Miller, Hamwi) published their own modifications to attempt to improve accuracy. All four are mathematically similar, but the Devine formula remains the global standard in hospitals today." },
    { question: "Why do these formulas calculate low weights?", answer: "These formulas were developed decades ago when the average population was significantly lighter. They calculate what a person of a specific height would weigh with very low body fat and average muscle mass. Many healthy, athletic individuals will be significantly heavier than their calculated 'Ideal' Body Weight simply because they carry more muscle." },
    { question: "Are these formulas accurate for very tall or very short people?", answer: "No. All of these formulas use a base of 5 feet (60 inches) and add weight for every inch above that. They become mathematically inaccurate for people under 5 feet tall, and often calculate unrealistically high weights for individuals over 6 feet 6 inches tall." },
    { question: "Should I use this to set my weight loss goal?", answer: "Probably not. For general health and weight loss, calculating your Body Mass Index (BMI) or tracking your body fat percentage is much more relevant. The IBW formulas are primarily for clinical pharmacology, not personal fitness." },
    { question: "Why do males and females have different formulas?", answer: "Biological males generally carry a higher percentage of lean muscle mass and bone density than biological females of the exact same height. The formulas account for this by providing a slightly higher base weight for males." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "IBW Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Ideal Body Weight (IBW) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">in</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setSex("male"); setFeet("5"); setInches("10"); setResult(calcIBW("male", 70)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Devine Formula (Clinical Standard)</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{result.devineLbs.toFixed(1)}</div>
                      <div className="text-xl font-semibold text-muted-foreground">lbs</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border">
                    <Scale className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                  Equivalent to <strong className="text-foreground">{result.devineKg.toFixed(1)} kg</strong>. This is the primary value used by pharmacists for drug dosing calculations.
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[
                  ["Devine", result.devineLbs.toFixed(1), result.devineKg.toFixed(1)], 
                  ["Robinson", result.robinsonLbs.toFixed(1), result.robinsonKg.toFixed(1)],
                  ["Miller", result.millerLbs.toFixed(1), result.millerKg.toFixed(1)],
                  ["Hamwi", result.hamwiLbs.toFixed(1), result.hamwiKg.toFixed(1)]
                ].map(([l, lbs, kg], i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">{l}</div>
                    <div className="text-lg font-bold text-foreground leading-tight">{lbs} lbs</div>
                    <div className="text-xs font-semibold text-muted-foreground mt-1">{kg} kg</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">IBW Formula Variance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} kg`, "Ideal Weight"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="kg" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Patient Parameters</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Medical Definition of "Ideal" Body Weight</h2>
            <p>The term "Ideal Body Weight" (IBW) is one of the most widely misunderstood terms in medicine. In the clinical world, "ideal" does not refer to aesthetics, visual attractiveness, or personal health goals. Instead, it is a strictly mathematical construct utilized by anesthesiologists, clinical pharmacists, and nephrologists to safely dose medications.</p>
            <p>This <strong>Ideal Body Weight Calculator</strong> computes the four globally recognized IBW formulas. Because different organ systems metabolize drugs differently, using a patient's actual total body weight can sometimes result in massive overdoses, particularly in obese patients. IBW strips away excess adipose (fat) tissue mathematically, providing doctors with an estimate of the patient's lean metabolic mass.</p>

            <h2 className="text-2xl font-bold mb-3">Why Pharmacies Use IBW for Drug Dosing</h2>
            <p>When a patient receives an intravenous (IV) drug, that drug must distribute itself throughout the body. Drugs are generally classified as either hydrophilic (water-soluble) or lipophilic (fat-soluble).</p>
            <p>Hydrophilic drugs (like aminoglycoside antibiotics or certain muscle relaxants used in surgery) do not enter fat tissue; they stay entirely in the blood and lean tissue. If a patient is obese and weighs 300 lbs, but their lean mass is only 150 lbs, administering a water-soluble drug based on their total 300 lb weight will result in a dangerous overdose. All of the drug will pool in the blood instead of distributing into the fat.</p>
            <p>To prevent toxicity and organ damage, pharmacists calculate the patient's Ideal Body Weight and dose the medication exclusively based on that lower, leaner number.</p>

            <h2 className="text-2xl font-bold mb-3">The Four Core IBW Formulas</h2>
            <p>Because humans vary wildly in bone density and muscle mass, no single formula is perfect. Over the decades, four distinct formulas have emerged in the medical literature:</p>

            <h3>1. The Devine Formula (1974)</h3>
            <p>Dr. B.J. Devine developed this formula purely to calculate drug dosages (specifically for the drug gentamicin). Despite being the oldest, it remains the absolute gold standard in modern hospitals for calculating creatinine clearance and drug dosing. If you are ever admitted to an ICU, the computers will use this formula to dose your medications.</p>

            <h3>2. The Robinson Formula (1983)</h3>
            <p>Dr. J.D. Robinson published this formula in 1983 as a slight modification to Devine's work. Robinson found that the Devine formula calculated weights that were slightly too low for women, so he adjusted the multiplier.</p>

            <h3>3. The Miller Formula (1983)</h3>
            <p>Also published in 1983, Dr. Miller attempted to improve the accuracy of the formula by lowering the base multiplier for both men and women. Today, the Miller formula is rarely used in standard clinical practice but is still taught in medical pharmacology.</p>

            <h3>4. The Hamwi Formula (1964)</h3>
            <p>Originally published by Dr. G.J. Hamwi, this formula was actually created as a rough guideline to help doctors estimate weight goals for diabetic patients. Because it is so simple to memorize, many dietitians still use it as a mental shortcut.</p>

            <h2 className="text-2xl font-bold mb-3">Limitations of the IBW Calculations</h2>
            <p>While critical for pharmacology, IBW formulas are incredibly flawed for general health assessments. They were developed decades ago when the average population was significantly lighter. </p>
            <p>Furthermore, these formulas exclusively factor in <strong>height</strong>. They do not account for frame size, bone density, or muscle mass. An elite NFL linebacker who is 6'2" might weigh 245 lbs of pure muscle with 10% body fat, but the Devine formula will tell him his "Ideal Body Weight" is 177 lbs. For this reason, athletes should entirely ignore IBW formulas for fitness planning and instead rely on Body Fat Percentage or Fat-Free Mass Index (FFMI) calculations.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ibw-calculator" />
          <PopularCalculators exclude="/calculator/ibw-calculator" />
        </div>
      </div>
    </>
  );
}
