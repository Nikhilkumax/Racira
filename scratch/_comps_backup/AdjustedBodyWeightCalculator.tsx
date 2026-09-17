"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AdjustedBodyWeightCalculator = () => {
  const [actualWeight, setActualWeight] = useState("220");
  const [height, setHeight] = useState("70");
  const [gender, setGender] = useState("male");
  const [unitSystem, setUnitSystem] = useState("imperial"); // imperial or metric

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(actualWeight);
    const h = parseFloat(height);

    let weightKg = unitSystem === "imperial" ? w * 0.453592 : w;
    let heightCm = unitSystem === "imperial" ? h * 2.54 : h;

    // Ideal Body Weight (Devine formula)
    let ibw = 0;
    if (gender === "male") {
      ibw = 50 + 2.3 * ((heightCm / 2.54) - 60);
    } else {
      ibw = 45.5 + 2.3 * ((heightCm / 2.54) - 60);
    }

    // Adjusted Body Weight (ABW)
    let abw = ibw;
    if (weightKg > ibw) {
      abw = ibw + 0.4 * (weightKg - ibw);
    }

    const actualBmi = weightKg / Math.pow(heightCm / 100, 2);
    
    const displayIbw = unitSystem === "imperial" ? ibw * 2.20462 : ibw;
    const displayAbw = unitSystem === "imperial" ? abw * 2.20462 : abw;

    setResults({ 
      abw: displayAbw, 
      ibw: displayIbw, 
      actualBmi, 
      isOverweight: weightKg > ibw * 1.2 
    });
  };

  const reset = () => {
    setShowResults(false); 
    setActualWeight("220"); 
    setHeight("70"); 
    setGender("male"); 
    setUnitSystem("imperial"); 
    setResults(null); 
  };

  const faqs = [
    { question: "What is Adjusted Body Weight (ABW)?", answer: "Adjusted Body Weight (ABW) is a calculated weight used for dosing certain medications or estimating nutritional needs in obese patients. It accounts for the fact that fat tissue requires less metabolic support and drug distribution than lean tissue." },
    { question: "When is ABW used?", answer: "ABW is typically used when a person's actual weight is significantly higher (usually > 20% or 30%) than their Ideal Body Weight (IBW). It is often used by dietitians to calculate energy needs and by pharmacists to dose hydrophilic medications like aminoglycosides." },
    { question: "How is it calculated?", answer: "The most common formula is: ABW = IBW + 0.4 × (Actual Weight - IBW). The 0.4 factor represents the assumption that 40% of excess body weight is metabolically active tissue or volume of distribution." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Adjusted Body Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Adjusted Body Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit System</label>
                  <select value={unitSystem} onChange={e => setUnitSystem(e.target.value)} className="input-calc">
                    <option value="imperial">Imperial (lb/in)</option>
                    <option value="metric">Metric (kg/cm)</option>
                  </select>
                </div>
                <InputField id="weight" label={`Actual Weight (${unitSystem === 'imperial' ? 'lb' : 'kg'})`} value={actualWeight} onChange={setActualWeight} />
                <InputField id="height" label={`Height (${unitSystem === 'imperial' ? 'in' : 'cm'})`} value={height} onChange={setHeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Body Weight Results</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Adjusted Body Weight</p>
                    <p className="text-4xl font-black text-primary">{results.abw.toFixed(1)} {unitSystem === 'imperial' ? 'lb' : 'kg'}</p>
                  </div>
                  <div className="card-calculator p-5 border border-border bg-card shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Ideal Body Weight</p>
                    <p className="text-3xl font-black text-foreground">{results.ibw.toFixed(1)} {unitSystem === 'imperial' ? 'lb' : 'kg'}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Actual BMI", value: 0, textValue: results.actualBmi.toFixed(1) },
                  { label: "Weight Status", value: 0, textValue: results.isOverweight ? "Over 120% of IBW" : "Within 120% of IBW" },
                  { label: "Recommendation", value: 0, textValue: results.isOverweight ? "Use ABW for dosing/nutrition" : "Use Actual Weight or IBW" },
                ]} />
                
                <div className="card-calculator !p-4 border border-border bg-card mt-4">
                  <h3 className="font-semibold text-sm mb-3">Weight Comparison</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Ideal Weight', weight: parseFloat(results.ibw.toFixed(1)), fill: '#10b981' },
                        { name: 'Adjusted Weight', weight: parseFloat(results.abw.toFixed(1)), fill: '#3b82f6' },
                        { name: 'Actual Weight', weight: parseFloat(actualWeight), fill: '#f59e0b' }
                      ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} cursor={{fill: "transparent"}} />
                        <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                          {[ '#10b981', '#3b82f6', '#f59e0b' ].map((c, i) => <Cell key={i} fill={c} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Adjusted Body Weight (ABW)</h2>
              <p>In the fields of clinical pharmacology and medical dietetics, accurately estimating a patient's metabolic and spatial requirements is paramount for safe treatment. When a patient's actual body mass heavily exceeds the clinical average for their physical stature, medical professionals must adapt their mathematical models to account for the unique physiological properties of excess adipose tissue (fat). This is where the concept of Adjusted Body Weight (ABW) becomes critical. Adipose tissue is vastly different from lean muscle mass or organ tissue; it contains significantly less intracellular water and requires far less metabolic energy to sustain on a daily basis. Therefore, if a physician were to dose a highly potent, water-soluble medication based entirely on a heavily obese patient's actual total body weight, they would likely administer a massive, potentially toxic overdose. Conversely, if they strictly utilized the patient's Ideal Body Weight (IBW)—which entirely ignores the extra mass the patient is carrying—they would likely under-dose the medication, rendering it entirely ineffective against the infection or condition they are attempting to treat.</p>
              
              <h2 className="text-2xl font-bold mb-3">The Mathematics of the ABW Formula</h2>
              <p>To safely bridge this dangerous gap between actual weight and ideal weight, clinicians utilize the Adjusted Body Weight formula. The mathematical logic behind this formula is both elegant and highly practical. First, it requires the calculation of the patient's Ideal Body Weight, which is universally determined using the Devine formula (established in 1974). For adult males, the Devine formula establishes a baseline of 50 kilograms for the first 5 feet (60 inches) of height, adding 2.3 kilograms for every additional inch. For adult females, the baseline is slightly lower at 45.5 kilograms for the first 5 feet, also adding 2.3 kilograms per additional inch.</p>

              <p>Once the Ideal Body Weight is established, the ABW formula calculates the difference between the patient's Actual Body Weight and their Ideal Body Weight to determine exactly how much excess mass they are carrying. The core assumption of the ABW formula is that roughly 40 percent of this excess adipose tissue is metabolically active or contributes to the volume of distribution for hydrophilic (water-soluble) drugs. Therefore, the formula takes 40 percent of the excess weight and adds it back to the Ideal Body Weight. The final, universally accepted clinical formula reads as follows: Adjusted Body Weight = Ideal Body Weight + 0.4 × (Actual Body Weight - Ideal Body Weight).</p>
              
              <h2 className="text-2xl font-bold mb-3">Clinical Application and Thresholds</h2>
              <p>It is crucial to understand that the Adjusted Body Weight formula is not applied to every single patient in a hospital setting. For patients whose actual weight closely matches their ideal weight, the ABW calculation is completely unnecessary and mathematically redundant. Standard clinical protocols across the globe dictate that ABW should only be calculated and utilized when a patient's actual body weight exceeds their ideal body weight by more than 20 percent (or, in some specific hospital protocols, 30 percent). This 120-percent threshold acts as the standard definition for clinical obesity in the context of pharmacokinetics.</p>

              <p>If a patient is under this 120-percent threshold, medical professionals will almost always use the actual body weight for dosing calculations, as the proportion of excess fat is not significant enough to skew the distribution of the medication. Our calculator is specifically programmed to automatically detect this clinical threshold. When you input the patient's height and weight, the tool instantly calculates the IBW, compares it against the actual weight, and explicitly alerts you if the patient is over the 120-percent threshold, providing a clear clinical recommendation on which weight metric (Actual, Ideal, or Adjusted) should be utilized for subsequent medical calculations.</p>

              <h2 className="text-2xl font-bold mb-3">Pharmacological Importance of ABW</h2>
              <p>The most common, life-saving application of the Adjusted Body Weight formula is in the dosing of aminoglycoside antibiotics, such as gentamicin, tobramycin, and amikacin. These are incredibly powerful drugs used to combat severe, often life-threatening bacterial infections. However, they are also highly hydrophilic, meaning they strictly distribute into the body's water compartments and do not penetrate fat tissue well. Furthermore, they possess an incredibly narrow therapeutic index, meaning the difference between a dose that cures the infection and a dose that causes irreversible kidney failure or permanent hearing loss is dangerously small. If a clinician doses gentamicin based on a severely obese patient's actual weight, the massive dose will not absorb into the fat tissue; instead, it will aggressively concentrate in the blood plasma and organs, almost guaranteeing severe toxicity. By utilizing the Adjusted Body Weight calculator, pharmacists and physicians can rapidly determine the precise, safe dosage required to eradicate the infection without destroying the patient's vital organs.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adjusted-body-weight" />
          <PopularCalculators exclude="/calculator/adjusted-body-weight-calculator" />
        </div>
      </div>
    </>
  );
};
export default AdjustedBodyWeightCalculator;

