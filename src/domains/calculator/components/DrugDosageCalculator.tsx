"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Syringe, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface DosageResult {
  singleDoseMg: number;
  singleDoseMl: number;
  dailyDoseMg: number;
  dailyDoseMl: number;
  weightKg: number;
  isOverMax: boolean;
  maxDailyMg: number;
  chartData: { name: string; amount: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDosage(
  weight: number, weightUnit: string,
  doseMgPerKg: number,
  concentrationMg: number, concentrationMl: number,
  dosesPerDay: number,
  maxDailyMg: number
): DosageResult {
  // Convert weight to kg
  const weightKg = weightUnit === "lbs" ? weight / 2.20462 : weight;
  
  // Calculate total daily mg required based on weight
  const totalDailyMg = weightKg * doseMgPerKg;
  
  // Cap at max daily (usually adult maximum)
  let actualDailyMg = totalDailyMg;
  let isOverMax = false;
  if (maxDailyMg > 0 && actualDailyMg > maxDailyMg) {
    actualDailyMg = maxDailyMg;
    isOverMax = true;
  }

  // Calculate single dose in mg
  const singleDoseMg = actualDailyMg / dosesPerDay;

  // Calculate liquid volume (mL)
  // concentration = mg / mL. So mL = mg * (mL / mg)
  const mgPerMl = concentrationMg / concentrationMl;
  const singleDoseMl = singleDoseMg / mgPerMl;
  const dailyDoseMl = actualDailyMg / mgPerMl;

  // Chart data: Comparing the calculated daily dose against the safety max
  const maxToDisplay = maxDailyMg > 0 ? maxDailyMg : actualDailyMg * 1.5;
  const chartData = [
    { name: "Daily Dose (mg)", amount: Math.round(actualDailyMg), fill: isOverMax ? "#f59e0b" : "#3b82f6" },
    { name: "Max Safety Limit", amount: Math.round(maxToDisplay), fill: "#e2e8f0" }
  ];

  const summaryStats = [
    { label: "Patient Weight", value: `${weightKg.toFixed(1)} kg` },
    { label: "Dose Basis", value: `${doseMgPerKg} mg/kg/day` },
    { label: "Concentration", value: `${concentrationMg}mg / ${concentrationMl}mL` },
    { label: "Frequency", value: `${dosesPerDay}x daily` }
  ];

  return {
    singleDoseMg: Number(singleDoseMg.toFixed(1)),
    singleDoseMl: Number(singleDoseMl.toFixed(2)),
    dailyDoseMg: Number(actualDailyMg.toFixed(1)),
    dailyDoseMl: Number(dailyDoseMl.toFixed(1)),
    weightKg: Number(weightKg.toFixed(1)),
    isOverMax,
    maxDailyMg,
    chartData,
    summaryStats
  };
}

export default function DrugDosageCalculator() {
  const [weight, setWeight] = useState("40");
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [doseMgPerKg, setDoseMgPerKg] = useState("40"); // e.g. Amoxicillin 40mg/kg/day
  const [concentrationMg, setConcentrationMg] = useState("250");
  const [concentrationMl, setConcentrationMl] = useState("5");
  const [dosesPerDay, setDosesPerDay] = useState("2");
  const [maxDailyMg, setMaxDailyMg] = useState("3000");

  const [result, setResult] = useState<DosageResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight), d = parseFloat(doseMgPerKg), cm = parseFloat(concentrationMg), cl = parseFloat(concentrationMl), dpd = parseInt(dosesPerDay), max = parseInt(maxDailyMg) || 0;
    if (w > 0 && d > 0 && cm > 0 && cl > 0 && dpd > 0) {
      setResult(calcDosage(w, weightUnit, d, cm, cl, dpd, max));
    }
  };

  useEffect(() => { setResult(calcDosage(40, "lbs", 40, 250, 5, 2, 3000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why do doctors use weight-based dosing for children?", answer: "Children are not simply small adults. Their livers and kidneys metabolize drugs at vastly different rates than adult organs. Because the volume of blood and tissue distribution space is much smaller in a child, a standard adult dose would result in dangerously toxic blood concentrations. Weight-based dosing (mg per kg) is the only way to ensure the drug reaches therapeutic levels without crossing into toxicity." },
    { question: "What does 'mg/kg/day' mean?", answer: "This is the clinical standard for dosing. It means 'milligrams of drug per kilogram of patient body weight, per day'. For example, if a drug is dosed at 10 mg/kg/day, and a child weighs 20 kg, the child needs a total of 200 mg in a 24-hour period. That 200 mg is then divided up into however many doses they take per day (e.g., 100 mg twice a day)." },
    { question: "Why is the liquid concentration (mg/mL) so important?", answer: "Liquid medications come in different strengths. For example, Children's Tylenol is 160 mg / 5 mL, but Infant Tylenol drops used to be 80 mg / 0.8 mL (much more concentrated). If you calculate that your child needs 160 mg, you must know the concentration of the exact bottle you hold in your hand to know how many milliliters (mL) of fluid to draw up in the syringe." },
    { question: "What is a 'Maximum Daily Dose' limit?", answer: "As a child's weight increases, the mg/kg calculation will eventually result in a number higher than an adult dose. For safety, almost all pediatric medications have an absolute 'Adult Maximum' daily limit. Once the child's weight pushes the calculation past the adult limit, the calculation stops using weight and simply assigns the standard adult maximum dose." },
    { question: "Are 'teaspoons' safe to use for measuring medication?", answer: "No. Never use household kitchen spoons to measure medication. Kitchen spoons are not standardized and can vary significantly in volume, leading to massive under or overdosing. Always use a calibrated oral syringe or the specific dosing cup that came with the medication." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Drug Dosage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Drug Dosage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Patient Weight</label>
                <div className={inp}><input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight Unit</label>
                <select value={weightUnit} onChange={e => setWeightUnit(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block flex justify-between">
                <span>Prescribed Target Dose</span>
                <span className="text-xs text-muted-foreground font-normal">mg / kg / day</span>
              </label>
              <div className={inp}><input type="number" step="0.1" value={doseMgPerKg} onChange={e => setDoseMgPerKg(e.target.value)} className={ci} placeholder="e.g. 40" /></div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center border p-3 rounded-md bg-muted/20">
              <div>
                <label className="text-xs font-medium mb-1 block">Medication</label>
                <div className={`${inp} h-9`}><input type="number" value={concentrationMg} onChange={e => setConcentrationMg(e.target.value)} className={ci} placeholder="mg" /><span className="pr-2 text-xs font-bold text-muted-foreground">mg</span></div>
              </div>
              <div className="text-muted-foreground font-bold pt-5">per</div>
              <div>
                <label className="text-xs font-medium mb-1 block">Liquid Vol</label>
                <div className={`${inp} h-9`}><input type="number" value={concentrationMl} onChange={e => setConcentrationMl(e.target.value)} className={ci} placeholder="mL" /><span className="pr-2 text-xs font-bold text-muted-foreground">mL</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Doses Per Day</label>
                <select value={dosesPerDay} onChange={e => setDosesPerDay(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                  <option value="1">1x (q24h)</option>
                  <option value="2">2x (q12h)</option>
                  <option value="3">3x (q8h)</option>
                  <option value="4">4x (q6h)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Adult Max Limit</label>
                <div className={inp}><input type="number" value={maxDailyMg} onChange={e => setMaxDailyMg(e.target.value)} className={ci} placeholder="e.g. 3000" /><span className="pr-2 text-xs text-muted-foreground">mg</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeight("40"); setWeightUnit("lbs"); setDoseMgPerKg("40"); setConcentrationMg("250"); setConcentrationMl("5"); setDosesPerDay("2"); setMaxDailyMg("3000"); setResult(calcDosage(40, "lbs", 40, 250, 5, 2, 3000)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`bg-primary/10 border-l-4 rounded-lg p-5 shadow-sm ${result.isOverMax ? "border-amber-500" : "border-primary"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.isOverMax ? "text-amber-600" : "text-primary"}`}>Single Dose Volume (mL)</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{result.singleDoseMl}</div>
                      <div className="text-xl font-semibold text-muted-foreground">mL / dose</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border">
                    <Syringe className={`w-8 h-8 ${result.isOverMax ? "text-amber-500" : "text-primary"}`} />
                  </div>
                </div>
                
                <div className="text-sm font-medium text-muted-foreground mt-3 leading-relaxed flex items-center gap-1.5">
                  Give <strong className="text-foreground">{result.singleDoseMg} mg</strong> ({result.singleDoseMl} mL) every {24/parseInt(dosesPerDay)} hours.
                </div>
                
                {result.isOverMax && (
                  <div className="mt-3 p-3 bg-amber-500/20 text-amber-900 dark:text-amber-200 text-sm rounded-md flex items-start gap-2 border border-amber-500/30">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p><strong>Dose Capped:</strong> The weight-based calculation exceeded the maximum adult daily limit of {result.maxDailyMg} mg. The dosage has been safely capped at the adult maximum.</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[
                  ["Total Daily Dose", `${result.dailyDoseMg} mg`], 
                  ["Total Daily Volume", `${result.dailyDoseMl} mL`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i % 2 !== 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg sm:text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Daily Drug Exposure vs Safety Limit</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 'dataMax']} hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} mg`, "Dose"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Clinical Parameters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 last:border-0 pb-1 sm:pb-0 sm:border-0"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">Disclaimer: This calculator is for educational and verification purposes only. Always verify dosages with a licensed physician or pharmacist before administration.</p>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Weight-Based Dosing</h2>
            <p>Administering medication to pediatric patients or underweight adults requires absolute mathematical precision. Unlike standard adult medications which often come in fixed, universal pill sizes (e.g., "take two 200mg capsules"), pediatric medications must be dynamically scaled. This <strong>Drug Dosage Calculator</strong> automates the clinical pharmacology equations required to safely convert a prescribed mg/kg target into an exact liquid milliliter (mL) volume for syringe administration.</p>

            <h2 className="text-2xl font-bold mb-3">Why Children Require Milligrams Per Kilogram (mg/kg)</h2>
            <p>In pharmacology, children are not treated as miniature adults. A child's internal organ systems—specifically the liver and kidneys, which are responsible for metabolizing and clearing drugs from the bloodstream—operate at vastly different physiological rates than adult organs. Furthermore, a child has a significantly smaller total volume of blood and tissue distribution space.</p>
            <p>If you were to administer a standard adult dose of antibiotics or acetaminophen to a 30-pound child, the concentration of the drug within their small blood volume would immediately spike into dangerously toxic territory, potentially causing organ failure. Conversely, severely under-dosing a child with antibiotics leads to treatment failure and drug-resistant bacteria. Therefore, the global clinical standard is to prescribe drugs based on <strong>mg/kg</strong> (milligrams of drug per kilogram of patient body weight).</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Three Core Variables</h2>
            <p>To safely calculate a liquid dosage volume, you must have three exact pieces of data. If any of these are incorrect, a medication error will occur.</p>

            <h3>1. Accurate Patient Weight (Converted to kg)</h3>
            <p>The entire equation rests on an accurate body weight. Because clinical science operates on the metric system, if you weigh your child in pounds (lbs), you must precisely convert it to kilograms (kg) by dividing the pounds by 2.20462. A common, highly dangerous medical error occurs when a parent or nurse accidentally multiplies by 2.2 instead of dividing, resulting in a massive overdose. This calculator handles the conversion automatically.</p>

            <h3>2. The Prescribed Target Dose</h3>
            <p>This is the pharmacological target determined by the physician or medical literature. For example, the standard dose for Amoxicillin for a pediatric ear infection is often <strong>40 mg/kg/day</strong>. If a child weighs 20 kg, the equation is simple: 20 kg × 40 mg = 800 mg. The child needs a total of 800 milligrams of the drug throughout a 24-hour period. If the doctor says "take twice daily," that 800 mg is split into two 400 mg single doses.</p>

            <h3>3. The Liquid Concentration (mg/mL)</h3>
            <p>Knowing that the child needs 400 mg is useless if you are staring at a bottle of pink liquid. You must convert milligrams (mass) into milliliters (volume). To do this, you must read the concentration printed on the exact bottle you are holding. For example, if the bottle says <strong>250 mg / 5 mL</strong>, it means there are 250 milligrams of active drug floating in every 5 milliliters of liquid. The calculator uses this ratio to determine exactly how far to pull back the plunger on an oral syringe to deliver exactly 400 mg.</p>

            <h2 className="text-2xl font-bold mb-3">The "Adult Maximum" Safety Cap</h2>
            <p>There is a biological threshold where weight-based dosing must stop. As an adolescent child grows heavier, multiplying their large body weight by the mg/kg factor will eventually result in a number that is drastically higher than a standard adult dose. For example, a 180-pound 14-year-old taking ibuprofen at 10 mg/kg/dose would mathematically calculate to roughly 816 mg per dose. However, the standard adult max single dose for ibuprofen is 800 mg.</p>
            <p>For safety, almost all pediatric medications have a hard <strong>"Adult Maximum Limit."</strong> Once the weight-based calculation hits this ceiling, the math stops, and the patient is simply given the adult maximum. This calculator includes a programmable cap to simulate this safety check, preventing theoretical overdoses on heavy patients.</p>

            <h2 className="text-2xl font-bold mb-3">A Critical Warning on Kitchen Spoons</h2>
            <p><strong>Never use household kitchen spoons to measure or administer liquid medications.</strong> The term "teaspoon" in medical pharmacology refers to an exact, calibrated volume of 5.0 mL. However, the actual metal spoons in your kitchen drawer are not standardized. A spoon you eat cereal with might hold anywhere from 3 mL to 9 mL of liquid. Using them can easily result in under-dosing by 40% or overdosing by 80%. Always use the calibrated plastic oral syringe or measuring cup provided by the pharmacy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/drug-dosage-calculator" />
          <PopularCalculators exclude="/calculator/drug-dosage-calculator" />
        </div>
      </div>
    </>
  );
}
