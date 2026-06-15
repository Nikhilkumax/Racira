"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity, Ruler, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface BodyFatResult {
  bfPercent: number;
  category: string;
  categoryColor: string;
  fatMass: number;
  leanMass: number;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
  ranges: { name: string; min: number; max: number; color: string }[];
}

function calcBodyFat(sex: string, weightLbs: number, heightInches: number, waistIn: number, neckIn: number, hipIn: number): BodyFatResult | null {
  if (waistIn <= neckIn || (sex === "female" && (waistIn + hipIn <= neckIn))) return null;

  let bfPercent = 0;
  let ranges: { name: string; min: number; max: number; color: string }[] = [];

  // U.S. Navy Method Formula (requires measurements in inches)
  if (sex === "male") {
    bfPercent = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightInches) + 36.76;
    ranges = [
      { name: "Essential Fat", min: 2, max: 5, color: "#3b82f6" }, // Blue
      { name: "Athletes", min: 6, max: 13, color: "#8b5cf6" }, // Purple
      { name: "Fitness", min: 14, max: 17, color: "#22c55e" }, // Green
      { name: "Average", min: 18, max: 24, color: "#f59e0b" }, // Yellow
      { name: "Obese", min: 25, max: 50, color: "#ef4444" } // Red
    ];
  } else {
    bfPercent = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightInches) - 78.387;
    ranges = [
      { name: "Essential Fat", min: 10, max: 13, color: "#3b82f6" },
      { name: "Athletes", min: 14, max: 20, color: "#8b5cf6" },
      { name: "Fitness", min: 21, max: 24, color: "#22c55e" },
      { name: "Average", min: 25, max: 31, color: "#f59e0b" },
      { name: "Obese", min: 32, max: 60, color: "#ef4444" }
    ];
  }

  // Cap the percentage between 1 and 70 for sanity
  bfPercent = Math.max(1, Math.min(bfPercent, 70));

  let category = "Unknown";
  let categoryColor = "#94a3b8";
  
  for (const r of ranges) {
    if (bfPercent >= r.min && bfPercent < r.max) {
      category = r.name;
      categoryColor = r.color;
      break;
    }
  }
  // Catch edge cases
  if (bfPercent < ranges[0].min) {
    category = "Dangerously Low";
    categoryColor = "#ef4444";
  } else if (bfPercent >= ranges[ranges.length - 1].min) {
    category = "Obese";
    categoryColor = "#ef4444";
  }

  const fatMass = (bfPercent / 100) * weightLbs;
  const leanMass = weightLbs - fatMass;

  const chartData = [
    { name: "Your Body Fat %", value: Number(bfPercent.toFixed(1)) }
  ];

  const summaryStats = [
    { label: "Total Fat Mass", value: `${fatMass.toFixed(1)} lbs` },
    { label: "Lean Body Mass", value: `${leanMass.toFixed(1)} lbs` }
  ];

  return {
    bfPercent: Number(bfPercent.toFixed(1)),
    category,
    categoryColor,
    fatMass,
    leanMass,
    chartData,
    summaryStats,
    ranges
  };
}

export default function BodyFatPercentageCalculator() {
  const [sex, setSex] = useState("male");
  const [weight, setWeight] = useState("180");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [neck, setNeck] = useState("16");
  const [waist, setWaist] = useState("34");
  const [hip, setHip] = useState("38");

  const [result, setResult] = useState<BodyFatResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const f = parseInt(feet) || 0;
    const i = parseInt(inches) || 0;
    const h = (f * 12) + i;
    const n = parseFloat(neck);
    const wa = parseFloat(waist);
    const hi = parseFloat(hip);

    if (w > 0 && h > 0 && n > 0 && wa > 0 && (sex === "male" || hi > 0)) {
      const res = calcBodyFat(sex, w, h, wa, n, hi);
      if (res) {
        setResult(res);
      } else {
        alert("Invalid measurements. Please check your inputs.");
      }
    }
  };

  useEffect(() => { setResult(calcBodyFat("male", 180, 70, 34, 16, 38)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How does the U.S. Navy Method work?", answer: "The U.S. Navy Method estimates body fat by taking a geometric approach to the human body. Because fat tends to accumulate around the waist and hips, while the neck is relatively free of large fat deposits, comparing these circumferences against your total height provides a surprisingly accurate estimate of total body density without needing expensive medical equipment." },
    { question: "Why do women need a hip measurement but men don't?", answer: "Biological men and women store fat in completely different physical locations. Estrogen causes the female body to store a significant amount of 'gluteofemoral' fat in the hips and thighs to support childbearing. The Navy Method must measure the hips to account for this healthy, biologically necessary fat. Men typically store fat hormonally in the abdomen (visceral fat), so a waist measurement is sufficient." },
    { question: "Why are the healthy percentages different for men and women?", answer: "Women require a significantly higher body fat percentage to maintain proper hormone production (especially estrogen) and reproductive health. A body fat level of 12% is considered 'athletic' for a man, but would cause a woman to stop menstruating and begin losing bone density. Women have roughly 10% to 12% 'essential fat', whereas men only have 2% to 5%." },
    { question: "What is Lean Body Mass?", answer: "Lean Body Mass (LBM) is the total weight of everything in your body that is NOT fat. This includes your skeletal bones, your muscles, your organs, your blood, and all the water inside your cells. If a 200 lb man has 20% body fat, he has 40 lbs of fat and 160 lbs of Lean Body Mass." },
    { question: "How accurate is the tape measure method?", answer: "When performed correctly, the U.S. Navy Method is accurate to within 3-4% of DEXA scans (the gold standard clinical test). To ensure accuracy, the measuring tape should be pulled taut but not tight enough to compress the skin. The waist should be measured exactly at the navel for men, and at the narrowest point for women." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Fat Percentage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Body Fat Percentage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
                <select value={sex} onChange={e => {
                  setSex(e.target.value);
                  if (e.target.value === "female" && hip === "") setHip("38");
                }} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
              </div>
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
              <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
                <span>Neck Circumference</span>
              </label>
              <div className={inp}><input type="number" step="0.1" value={neck} onChange={e => setNeck(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Measure just below the larynx (Adam's apple).</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
                <span>Waist Circumference</span>
              </label>
              <div className={inp}><input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              <p className="text-[11px] text-muted-foreground mt-1.5">{sex === "male" ? "Measure horizontally across the navel." : "Measure at the narrowest point of the abdomen."}</p>
            </div>

            {sex === "female" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
                  <span>Hip Circumference</span>
                </label>
                <div className={inp}><input type="number" step="0.1" value={hip} onChange={e => setHip(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
                <p className="text-[11px] text-muted-foreground mt-1.5">Measure at the widest point of the hips/buttocks.</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Ruler className="h-5 w-5" /> Calculate Body Fat
              </button>
              <button onClick={() => { setSex("male"); setWeight("180"); setFeet("5"); setInches("10"); setNeck("16"); setWaist("34"); setResult(calcBodyFat("male", 180, 70, 34, 16, 0)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.categoryColor}10`, borderColor: result.categoryColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.categoryColor }}>Estimated Body Fat</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">{result.bfPercent}</div>
                      <div className="text-2xl font-bold text-muted-foreground">%</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    <Activity className="w-8 h-8" style={{ color: result.categoryColor }} />
                  </div>
                </div>
                <div className="inline-block px-3 py-1 mt-2 text-sm font-bold uppercase tracking-widest rounded-full shadow-sm bg-background border" style={{ color: result.categoryColor, borderColor: `${result.categoryColor}30` }}>
                  {result.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 flex justify-center items-center gap-1.5">
                      {i === 1 && <Dumbbell className="w-3.5 h-3.5" />} {s.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Body Fat Percentage Scale ({sex === 'male' ? 'Men' : 'Women'})</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Chart dynamically adjusted to {sex === 'male' ? 'male' : 'female'} physiological requirements.</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[0, result.ranges[result.ranges.length - 1].max]} tick={{ fontSize: 11 }} ticks={result.ranges.map(r => r.min)} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Background Ranges dynamically set based on sex */}
                    {result.ranges.map((r, idx) => (
                      <ReferenceArea key={idx} x1={r.min} x2={r.max} fill={r.color} fillOpacity={0.15} />
                    ))}
                    
                    {result.ranges.slice(1).map((r, idx) => (
                      <ReferenceLine key={idx} x={r.min} stroke={r.color} strokeDasharray="3 3" />
                    ))}

                    <Tooltip cursor={false} formatter={(v: number) => [`${v}%`, "Your Body Fat"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" barSize={20} fill={result.categoryColor} radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Why Body Fat Percentage is Better Than BMI</h2>
            <p>For decades, doctors have relied on the Body Mass Index (BMI) to screen patients for weight-related health risks. However, BMI is inherently flawed because it simply divides total weight by height. It cannot tell the difference between a 200-pound man carrying 60 pounds of dangerous visceral fat, and a 200-pound professional athlete carrying 180 pounds of healthy muscle.</p>
            <p><strong>Body Fat Percentage</strong> is a far superior metric because it isolates exactly how much of your mass is adipose tissue (fat). By tracking your body fat percentage, you ensure that any weight you lose is actually fat, rather than precious muscle mass or water.</p>

            <h2>The U.S. Navy Tape Measure Method</h2>
            <p>There are many ways to measure body fat. DEXA scans are highly accurate but cost hundreds of dollars. Calipers are cheap but require a trained professional to pinch your skinfolds accurately. Bioelectrical impedance scales (smart scales) are notoriously inaccurate because they are skewed by how much water you drank that day.</p>
            <p>The <strong>U.S. Navy Method</strong> was developed to quickly and accurately screen thousands of military recruits. By measuring the circumferences of the body where fat naturally accumulates (the waist and hips) and subtracting the circumference of an area where fat rarely accumulates (the neck), the formula can triangulate your body density. Clinical studies have shown this tape measure method is incredibly accurate, usually falling within 3-4% of expensive DEXA scans.</p>

            <h2>Understanding Lean Body Mass (LBM)</h2>
            <p>This calculator also provides your Lean Body Mass. This is arguably the most important number for longevity. LBM is the weight of your skeleton, your organs, and your skeletal muscle.</p>
            <p>As we age, we naturally lose muscle mass (Sarcopenia) and bone density. If you attempt to lose weight by simply starving yourself, a large portion of the weight lost will be from your Lean Body Mass. This suppresses your metabolism and makes you frail. A healthy diet combined with resistance training (weightlifting) ensures that you preserve your Lean Body Mass while forcing your body to burn its fat reserves.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-fat-percentage-calculator" />
          <PopularCalculators exclude="/calculator/body-fat-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
