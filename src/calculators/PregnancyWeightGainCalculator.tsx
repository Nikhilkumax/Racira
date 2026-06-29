"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const PregnancyWeightGainCalculator = () => {
  const [prePregnancyWeight, setPrePregnancyWeight] = useState("140");
  const [height, setHeight] = useState("65"); // inches
  const [currentWeight, setCurrentWeight] = useState("155");
  const [currentWeek, setCurrentWeek] = useState("20");
  const [twins, setTwins] = useState("no");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const preWt = parseFloat(prePregnancyWeight);
    const ht = parseFloat(height);
    const curWt = parseFloat(currentWeight);
    const week = parseInt(currentWeek);

    // Calculate Pre-pregnancy BMI
    const bmi = (preWt / (ht * ht)) * 703;
    
    // ACOG Guidelines for weight gain (single pregnancy)
    let totalGainMin = 0;
    let totalGainMax = 0;
    let weeklyGain2nd3rd = 0; // lbs per week in 2nd and 3rd trimester
    let firstTrimesterGain = 0;

    if (twins === "yes") {
      if (bmi < 18.5) { totalGainMin = 50; totalGainMax = 62; }
      else if (bmi < 25) { totalGainMin = 37; totalGainMax = 54; }
      else if (bmi < 30) { totalGainMin = 31; totalGainMax = 50; }
      else { totalGainMin = 25; totalGainMax = 42; }
      firstTrimesterGain = 4; // roughly 4-6 lbs
      weeklyGain2nd3rd = 1.5;
    } else {
      if (bmi < 18.5) { totalGainMin = 28; totalGainMax = 40; weeklyGain2nd3rd = 1; firstTrimesterGain = 3; }
      else if (bmi < 25) { totalGainMin = 25; totalGainMax = 35; weeklyGain2nd3rd = 1; firstTrimesterGain = 3; }
      else if (bmi < 30) { totalGainMin = 15; totalGainMax = 25; weeklyGain2nd3rd = 0.6; firstTrimesterGain = 2; }
      else { totalGainMin = 11; totalGainMax = 20; weeklyGain2nd3rd = 0.5; firstTrimesterGain = 1; }
    }

    // Expected gain by current week
    let expectedGainMin = 0;
    let expectedGainMax = 0;

    if (week <= 13) {
      // First trimester linear progression
      expectedGainMin = (week / 13) * (firstTrimesterGain - 1);
      expectedGainMax = (week / 13) * (firstTrimesterGain + 2);
    } else {
      // 2nd and 3rd trimester
      const weeksPastFirst = week - 13;
      expectedGainMin = (firstTrimesterGain - 1) + (weeksPastFirst * (weeklyGain2nd3rd - 0.2));
      expectedGainMax = (firstTrimesterGain + 2) + (weeksPastFirst * (weeklyGain2nd3rd + 0.2));
    }

    const actualGain = curWt - preWt;

    let status = "On Track";
    let color = "green";
    if (actualGain < expectedGainMin) {
      status = "Below Expected";
      color = "yellow";
    } else if (actualGain > expectedGainMax) {
      status = "Above Expected";
      color = "red";
    }

    setResults({ 
      bmi: bmi.toFixed(1),
      totalGainMin,
      totalGainMax,
      expectedGainMin: expectedGainMin.toFixed(1),
      expectedGainMax: expectedGainMax.toFixed(1),
      actualGain: actualGain.toFixed(1),
      status,
      color
    });
  };

  const reset = () => {
    setShowResults(false); setPrePregnancyWeight("140"); setHeight("65"); setCurrentWeight("155"); setCurrentWeek("20"); setTwins("no"); setResults(null); };

  const faqs = [
    { question: "How much weight should I gain during pregnancy?", answer: "According to the ACOG, women with a normal BMI (18.5-24.9) should gain between 25 and 35 pounds. Underweight women should gain more, while overweight women should gain less." },
    { question: "Where does the weight go?", answer: "Besides the baby (which usually weighs 7-8 lbs), the weight comes from the placenta, amniotic fluid, increased blood volume, uterus expansion, breast tissue, and necessary maternal fat stores for breastfeeding." },
    { question: "Is it normal to lose weight in the first trimester?", answer: "Yes. Due to morning sickness and nausea, some women lose a few pounds early on. This is usually not harmful to the baby, but you should discuss it with your doctor." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pregnancy Weight Gain Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Weight Gain Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="prewt" label="Pre-Pregnancy Weight (lbs)" value={prePregnancyWeight} onChange={setPrePregnancyWeight} />
                <InputField id="ht" label="Height (inches)" value={height} onChange={setHeight} />
                <InputField id="curwt" label="Current Weight (lbs)" value={currentWeight} onChange={setCurrentWeight} />
                <InputField id="wk" label="Current Week of Pregnancy" value={currentWeek} onChange={setCurrentWeek} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Are you carrying twins?</label>
                  <select value={twins} onChange={e => setTwins(e.target.value)} className="input-calc">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Activity className="h-5 w-5" /> Analyze Weight Gain</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Weight Gain Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Your Gain So Far</p>
                    <p className="text-4xl font-black text-foreground">{results.actualGain} lbs</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-center flex flex-col justify-center ${results.color === 'green' ? 'bg-green-500/10 border-green-500/20' : results.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Status at Week {currentWeek}</p>
                    <p className={`text-2xl font-black ${results.color === 'green' ? 'text-green-600' : results.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>{results.status}</p>
                    <p className="text-sm mt-1 text-muted-foreground">Expected: {results.expectedGainMin} to {results.expectedGainMax} lbs</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Pre-Pregnancy BMI", value: 0, textValue: results.bmi },
                  { label: "Total Recommended Gain (by Week 40)", value: 0, textValue: `${results.totalGainMin} – ${results.totalGainMax} lbs` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Why Tracking Matters</h2>
              <p>Gaining the right amount of weight during pregnancy is crucial. Gaining too little can result in a low birth weight baby, while gaining too much increases the risk of gestational diabetes, high blood pressure, and complications during delivery.</p>
              <h3>Trimester Breakdown</h3>
              <p>During the first trimester, very little extra energy is needed. Most guidelines suggest gaining only 1 to 4 pounds total during the first 13 weeks. In the second and third trimesters, the baby grows rapidly, and steady weight gain (usually around 1 pound per week for a normal BMI) is expected.</p>
              <h3>Don't Diet While Pregnant</h3>
              <p>If you are gaining weight faster than expected, do not try to lose weight or restrict calories drastically. Instead, focus on nutrient-dense foods (lean proteins, vegetables, whole grains) and consult your doctor or a prenatal dietitian.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-weight-gain" />
          <PopularCalculators exclude="/calculator/pregnancy-weight-gain-calculator" />
        </div>
      </div>
    </>
  );
};
export default PregnancyWeightGainCalculator;

