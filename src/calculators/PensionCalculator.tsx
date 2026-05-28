"use client";
import { RotateCcw, Calendar, TrendingUp, DollarSign } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const PensionCalculator = () => {
  const [currentAge, setCurrentAge] = useState("40");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentService, setCurrentService] = useState("10");
  const [finalSalary, setFinalSalary] = useState("95000");
  const [multiplier, setMultiplier] = useState("2.0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const age = parseInt(currentAge) || 0;
    const retireAge = parseInt(retirementAge) || 0;
    const service = parseFloat(currentService) || 0;
    const salary = parseFloat(finalSalary) || 0;
    const mult = (parseFloat(multiplier) || 0) / 100;

    const totalServiceYears = service + (retireAge - age);
    const annualBenefit = totalServiceYears * salary * mult;
    const monthlyBenefit = annualBenefit / 12;

    setResults({
      totalServiceYears,
      annualBenefit,
      monthlyBenefit,
      replacementRatio: salary > 0 ? (annualBenefit / salary) * 100 : 0
    });
  };

  const reset = () => {
    setCurrentAge("40");
    setRetirementAge("65");
    setCurrentService("10");
    setFinalSalary("95000");
    setMultiplier("2.0");
  };

  const faqs = [
    {
      question: "What is a defined benefit pension?",
      answer: "A defined benefit pension is a retirement plan where an employer promises a specific monthly benefit upon retirement. This benefit is usually based on a formula that considers your years of service and your salary history, rather than on investment returns like a 401(k)."
    },
    {
      question: "How does the pension multiplier work?",
      answer: "The multiplier is a fixed percentage (often between 1% and 2.5%) used in the pension formula. For example, if you have a 2% multiplier and 30 years of service, your pension would be 60% (2% × 30) of your final average salary."
    },
    {
      question: "What is 'vesting' in a pension plan?",
      answer: "Vesting means you have earned a non-forfeitable right to your pension benefits. Most plans require you to work for a minimum number of years (often 5 to 10 years) before you are 'fully vested' and eligible to receive a pension at retirement age."
    },
    {
      question: "Can I take my pension as a lump sum?",
      answer: "Many plans allow you to choose between a monthly annuity (payments for life) or a one-time lump sum payment. While a lump sum gives you more control, a monthly annuity provides a guaranteed income stream that you cannot outlive."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pension Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pension Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your future monthly income from a defined benefit pension plan based on your years of service and salary.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" /> Service & Age
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                    <InputField id="retire-age" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                  </div>
                  <InputField id="service" label="Current Years of Service" value={currentService} onChange={setCurrentService} suffix="yrs" />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" /> Salary & Formula
                  </h2>
                  <InputField id="salary" label="Final Average Salary" value={finalSalary} onChange={setFinalSalary} prefix="$" tooltip="The average of your highest earning years (e.g., top 3 or 5 years)." />
                  <InputField id="multiplier" label="Pension Multiplier (%)" value={multiplier} onChange={setMultiplier} suffix="%" step="0.1" tooltip="The percentage assigned per year of service (e.g., 2.0%)." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated Monthly Pension</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.monthlyBenefit).toLocaleString()}</p>
                    <p className="text-xs text-primary mt-2 font-bold uppercase tracking-widest">{results.totalServiceYears} Total Service Years</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimated Annual Benefit</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annualBenefit).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Formula Breakdown
                  </h2>
                  <div className="mb-8 p-6 bg-secondary/30 rounded-2xl text-center border border-border italic font-medium">
                     "${results.totalServiceYears} Years" × "${results.multiplier}% Multiplier" × "${parseFloat(finalSalary).toLocaleString()} Salary" = "${Math.round(results.annualBenefit).toLocaleString()}"
                  </div>
                  <ResultDisplay items={[
                    { label: "Total Years of Service", value: results.totalServiceYears },
                    { label: "Income Replacement Ratio", value: 0, textValue: `${results.replacementRatio.toFixed(1)}%` },
                    { label: "Current Vested Years", value: parseFloat(currentService) },
                    { label: "Years Remaining to Retire", value: parseInt(retirementAge) - parseInt(currentAge) },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Defined Benefit Pensions Work</h2>
              <p>While 401(k) plans have become the standard in the private sector, many public sector employees (teachers, police officers, government workers) still have access to defined benefit pensions. These plans offer a high level of retirement security because the employer bears all the investment risk, promising a set income for the rest of your life.</p>

              <h3>The Three Pillars of the Pension Formula</h3>
              <p>Most pension plans use a simple but powerful formula to determine your benefit:</p>
              <ol>
                <li><strong>Years of Service:</strong> The total number of years you have worked for the employer and participated in the plan. Even a few extra months can sometimes make a significant difference.</li>
                <li><strong>Final Average Salary (FAS):</strong> Instead of using your starting salary, pensions usually average your highest earning years (often the 'Highest 3' or 'Highest 5' consecutive years).</li>
                <li><strong>The Multiplier:</strong> This is a percentage determined by the plan's rules. A 2% multiplier is common in many public plans, while some 'high-risk' roles like firefighters might have a 3% multiplier.</li>
              </ol>

              <h3>Cost of Living Adjustments (COLA)</h3>
              <p>One of the most valuable features of many pensions is the Cost of Living Adjustment. This ensures that your monthly check increases over time to keep up with inflation. Without a COLA, the purchasing power of your pension would slowly erode over a 20 or 30-year retirement.</p>

              <h3>Survivor Benefits</h3>
              <p>When you retire, you will often be asked to choose how your pension is paid. You can take a "Single Life" annuity, which provides the highest possible payment but stops when you die. Alternatively, you can choose a "Joint and Survivor" option, which provides a slightly smaller payment but continues to pay your spouse a percentage (usually 50%, 75%, or 100%) after your death.</p>

              <h3>The "Rule of 80" or "Rule of 90"</h3>
              <p>Some plans allow for early retirement without penalty if your age plus your years of service reach a certain number. For example, under a 'Rule of 80,' if you are 55 years old and have 25 years of service (55+25=80), you could retire with your full earned benefit even if you haven't reached the plan's 'normal' retirement age.</p>

              <h2>Pension Safety and the PBGC</h2>
              <p>If you work for a private company with a pension, your benefits are likely insured by the **Pension Benefit Guaranty Corporation (PBGC)**. This federal agency ensures that even if your company goes bankrupt, you will still receive at least a portion of your promised pension benefits, up to certain legal limits.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pension-calculator" />
          <PopularCalculators exclude="/calculator/pension-calculator" />
        </div>
      </div>
    </>
  );
};

export default PensionCalculator;

