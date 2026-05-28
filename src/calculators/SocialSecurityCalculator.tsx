"use client";
import { RotateCcw, Calendar, TrendingUp, Shield } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const SocialSecurityCalculator = () => {
  const [currentAge, setCurrentAge] = useState("45");
  const [annualSalary, setAnnualSalary] = useState("85000");
  const [retirementAge, setRetirementAge] = useState("67");
  const [yearsWorked, setYearsWorked] = useState("20");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const age = parseInt(currentAge) || 0;
    const salary = parseFloat(annualSalary) || 0;
    const retireAge = parseInt(retirementAge) || 67;
    
    // Simplified AIME calculation
    // Assume salary remains constant or increases with inflation
    const cappedSalary = Math.min(salary, 168600); // 2024 Social Security Taxable Limit
    const aime = cappedSalary / 12;

    // 2024 PIA Formula (Bend Points)
    // 90% of first $1,174
    // 32% of next $5,904
    // 15% of remainder
    let pia = 0;
    if (aime <= 1174) {
      pia = aime * 0.9;
    } else if (aime <= 7078) {
      pia = (1174 * 0.9) + ((aime - 1174) * 0.32);
    } else {
      pia = (1174 * 0.9) + (5904 * 0.32) + ((aime - 7078) * 0.15);
    }

    // Adjustment for retirement age (Full Retirement Age assumed to be 67)
    const fra = 67;
    let adjustment = 1.0;
    if (retireAge < fra) {
      // Early retirement penalty (approx 6.67% per year for first 3 years, 5% after)
      const diff = fra - retireAge;
      adjustment = 1.0 - (diff * 0.0667);
    } else if (retireAge > fra) {
      // Delayed retirement credit (8% per year up to age 70)
      const diff = Math.min(3, retireAge - fra);
      adjustment = 1.0 + (diff * 0.08);
    }

    const monthlyBenefit = pia * adjustment;

    setResults({
      monthlyBenefit,
      annualBenefit: monthlyBenefit * 12,
      pia,
      adjustment: (adjustment - 1) * 100,
      fullRetirementAge: fra
    });
  };

  const reset = () => {
    setCurrentAge("45");
    setAnnualSalary("85000");
    setRetirementAge("67");
    setYearsWorked("20");
  };

  const faqs = [
    {
      question: "What is Full Retirement Age (FRA)?",
      answer: "Your Full Retirement Age is the age at which you can receive your full, unreduced Social Security benefit. For anyone born in 1960 or later, the FRA is 67. If you claim before this age, your benefits are permanently reduced."
    },
    {
      question: "How is my Social Security benefit calculated?",
      answer: "Social Security benefits are based on your 'Average Indexed Monthly Earnings' (AIME) over your 35 highest-earning years. These earnings are adjusted for inflation and then passed through a formula with 'bend points' to determine your Primary Insurance Amount (PIA)."
    },
    {
      question: "Should I wait until age 70 to claim Social Security?",
      answer: "Waiting until age 70 provides the maximum possible monthly benefit. For every year you delay claiming past your Full Retirement Age (up to age 70), your benefit increases by approximately 8%. This is a guaranteed, inflation-adjusted return that is hard to match in the private market."
    },
    {
      question: "What happens if I work while receiving Social Security?",
      answer: "If you have not yet reached Full Retirement Age, there is a limit to how much you can earn while receiving benefits. If you exceed this limit, Social Security will temporarily withhold a portion of your benefits. Once you reach FRA, there is no limit on earnings."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Social Security Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Social Security Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your future Social Security benefits and see how your retirement age affects your lifetime income.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" /> Your Profile
                  </h2>
                  <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" />
                  <InputField id="salary" label="Current Annual Salary" value={annualSalary} onChange={setAnnualSalary} prefix="$" tooltip="Your current pre-tax earnings." />
                  <InputField id="worked" label="Years Worked" value={yearsWorked} onChange={setYearsWorked} suffix="yrs" tooltip="Number of years you have paid into Social Security." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" /> Retirement Plan
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Planned Retirement Age ({retirementAge})</label>
                    <input type="range" min="62" max="70" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                       <span>Early (62)</span>
                       <span>Full (67)</span>
                       <span>Max (70)</span>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-10">
                     <p className="text-[10px] font-bold text-primary uppercase mb-1">Estimated Full Benefit (at 67)</p>
                     <p className="text-2xl font-black text-foreground">${results ? Math.round(results.pia).toLocaleString() : '0'}/mo</p>
                  </div>
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
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated Monthly Benefit</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.monthlyBenefit).toLocaleString()}</p>
                    <p className={`text-xs mt-2 font-bold uppercase tracking-widest ${results.adjustment >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {results.adjustment >= 0 ? `+${results.adjustment.toFixed(1)}% Credit` : `${results.adjustment.toFixed(1)}% Reduction`}
                    </p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimated Annual Income</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annualBenefit).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Lifetime Projections
                  </h2>
                  <ResultDisplay items={[
                    { label: "Primary Insurance Amount (PIA)", value: results.pia },
                    { label: "Age Adjustment Percentage", value: 0, textValue: `${(100 + results.adjustment).toFixed(1)}%` },
                    { label: "Full Retirement Age (FRA)", value: 0, textValue: `${results.fullRetirementAge}` },
                    { label: "20-Year Cumulative Benefit", value: results.annualBenefit * 20 },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Strategic Importance of Social Security</h2>
              <p>Social Security is the foundation of retirement security for millions of Americans. It provides a guaranteed, inflation-indexed source of income that you cannot outlive. Understanding how the calculation works can help you make an informed decision about when to claim your benefits.</p>

              <h3>The "35-Year" Rule</h3>
              <p>Social Security looks at your 35 highest-earning years. If you worked fewer than 35 years, "zeros" are averaged into the calculation, which can significantly lower your benefit. If you have already worked more than 35 years, each new year of high earnings replaces a lower-earning year from your past, slowly increasing your benefit.</p>

              <h3>How Age Affects Your Check</h3>
              <p>You have a choice of when to start receiving benefits, ranging from age 62 to age 70. This decision has a permanent impact on your monthly income:</p>
              <ul>
                <li><strong>Age 62 (Early):</strong> Your benefit is reduced by up to 30% compared to your Full Retirement Age. This is the earliest possible age to claim.</li>
                <li><strong>Age 67 (Full):</strong> For most current workers, this is the age you receive 100% of your earned benefit.</li>
                <li><strong>Age 70 (Maximum):</strong> By waiting until 70, you receive "Delayed Retirement Credits," which increase your benefit by 8% per year past age 67. There is no benefit to waiting past age 70.</li>
              </ul>

              <h3>Is the System Solvent?</h3>
              <p>Many young workers worry that Social Security will be gone by the time they retire. While the Social Security Trust Fund is projected to be depleted by the mid-2030s, this does not mean benefits will disappear. Even if the trust fund is empty, incoming payroll taxes are projected to cover approximately 77% to 80% of scheduled benefits. Legislative changes (such as raising the tax cap or the retirement age) could bridge this gap.</p>

              <h3>Social Security and Taxes</h3>
              <p>Depending on your total "provisional income," up to 85% of your Social Security benefits may be subject to federal income tax. Provisional income is calculated as your adjusted gross income + tax-exempt interest + 50% of your Social Security benefits. If this total exceeds $34,000 (single) or $44,000 (married), you will likely owe taxes on a portion of your benefit.</p>

              <h2>Maximizing Your Benefit</h2>
              <ol>
                <li><strong>Work at least 35 years:</strong> Avoid the "zeros" in your calculation.</li>
                <li><strong>Earn more:</strong> Increasing your income today increases your AIME and your future benefit.</li>
                <li><strong>Delay claiming:</strong> Every year you wait between 62 and 70 significantly increases your monthly cash flow.</li>
                <li><strong>Coordinate with a Spouse:</strong> If you are married, specialized strategies (like claiming a spousal benefit) can help maximize the total lifetime income for the couple.</li>
              </ol>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/social-security-calculator" />
          <PopularCalculators exclude="/calculator/social-security-calculator" />
        </div>
      </div>
    </>
  );
};

export default SocialSecurityCalculator;

