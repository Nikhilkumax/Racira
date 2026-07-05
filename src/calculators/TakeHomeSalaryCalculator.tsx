"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Wallet } from "lucide-react";

const TakeHomeSalaryCalculator = () => {
  const [grossSalary, setGrossSalary] = useState("75000");
  const [filingStatus, setFilingStatus] = useState("single");
  const [state401k, setState401k] = useState("6");
  const [healthInsurance, setHealthInsurance] = useState("200");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const gross = parseFloat(grossSalary);
    const k401 = gross * (parseFloat(state401k) / 100);
    const health = parseFloat(healthInsurance) * 12;
    const taxableIncome = gross - k401 - health;

    // 2024 Federal tax brackets (single)
    let federalTax = 0;
    if (filingStatus === "single") {
      if (taxableIncome > 609350) federalTax = 183647.25 + (taxableIncome - 609350) * 0.37;
      else if (taxableIncome > 243725) federalTax = 58289.25 + (taxableIncome - 243725) * 0.35;
      else if (taxableIncome > 191950) federalTax = 40426.75 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome > 100525) federalTax = 17168.50 + (taxableIncome - 100525) * 0.24;
      else if (taxableIncome > 47150) federalTax = 5426.00 + (taxableIncome - 47150) * 0.22;
      else if (taxableIncome > 11600) federalTax = 1160.00 + (taxableIncome - 11600) * 0.12;
      else federalTax = taxableIncome * 0.10;
    } else {
      // married filing jointly (double the brackets)
      if (taxableIncome > 731200) federalTax = 165580.50 + (taxableIncome - 731200) * 0.37;
      else if (taxableIncome > 487450) federalTax = 80413.50 + (taxableIncome - 487450) * 0.35;
      else if (taxableIncome > 383900) federalTax = 54793.50 + (taxableIncome - 383900) * 0.32;
      else if (taxableIncome > 201050) federalTax = 22357.00 + (taxableIncome - 201050) * 0.24;
      else if (taxableIncome > 94300) federalTax = 10852.00 + (taxableIncome - 94300) * 0.22;
      else if (taxableIncome > 23200) federalTax = 2320.00 + (taxableIncome - 23200) * 0.12;
      else federalTax = taxableIncome * 0.10;
    }

    const socialSecurity = Math.min(gross, 168600) * 0.062;
    const medicare = gross * 0.0145;
    const totalDeductions = federalTax + socialSecurity + medicare + k401 + health;
    const netAnnual = gross - totalDeductions;
    const effectiveRate = (federalTax / gross) * 100;

    setResults({ netAnnual, netMonthly: netAnnual / 12, netBiweekly: netAnnual / 26, federalTax, socialSecurity, medicare, k401, health, effectiveRate });
  };

  const reset = () => {
    setShowResults(false); setGrossSalary("75000"); setFilingStatus("single"); setState401k("6"); setHealthInsurance("200"); setResults(null); };

  const faqs = [
    { question: "What is take-home pay?", answer: "Take-home pay (net pay) is your gross salary minus all deductions: federal and state taxes, FICA (Social Security + Medicare), 401(k) contributions, and insurance premiums." },
    { question: "How can I increase my take-home pay?", answer: "You can increase take-home pay by increasing pre-tax deductions (401k, FSA, HSA), ensuring you're claiming the correct withholding allowances on your W-4, or by reducing your tax liability through deductions." },
    { question: "Does this include state taxes?", answer: "This calculator estimates federal taxes using 2024 brackets. State income tax varies widely by state (0% in TX, FL, NV to 13.3% in CA). Consult your state's tax authority for accurate state-specific calculations." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Take-Home Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Take-Home Salary Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                <InputField id="gross" label="Annual Gross Salary ($)" value={grossSalary} onChange={setGrossSalary} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Filing Status</label>
                  <select value={filingStatus} onChange={e => setFilingStatus(e.target.value)} className="input-calc">
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                  </select>
                </div>
                <InputField id="k401" label="401(k) Contribution (%)" value={state401k} onChange={setState401k} />
                <InputField id="health" label="Health Insurance ($/mo)" value={healthInsurance} onChange={setHealthInsurance} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Paycheck Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Net Pay</p>
                    <p className="text-5xl font-black text-foreground">${results.netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Take-Home</p>
                    <p className="text-3xl font-black text-foreground">${results.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Federal Income Tax", value: 0, textValue: "$" + results.federalTax.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " (" + results.effectiveRate.toFixed(1) + "% effective)" },
                  { label: "Social Security + Medicare", value: 0, textValue: "$" + (results.socialSecurity + results.medicare).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Bi-Weekly Paycheck", value: 0, textValue: "$" + results.netBiweekly.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Where Does Your Money Go?</h2>
              <p>Understanding your paycheck deductions is the foundation of personal finance. For most Americans, federal income taxes and FICA (Social Security and Medicare) are the two largest deductions.</p>
              <h3>Pre-Tax vs. Post-Tax Deductions</h3>
              <p>Pre-tax deductions (401k, HSA, FSA) reduce your taxable income, lowering your tax bill. Post-tax deductions (Roth 401k, life insurance) are taken from your net pay and don't reduce taxes now but may offer benefits later.</p>
              <h3>Marginal vs. Effective Tax Rate</h3>
              <p>The US uses a progressive tax system. Your "marginal rate" is the rate on your last dollar of income. Your "effective rate" is your actual total tax as a percentage of gross income — always lower than the marginal rate.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/take-home-salary" />
          <PopularCalculators exclude="/calculator/take-home-salary-calculator" />
        </div>
      </div>
    </>
  );
};
export default TakeHomeSalaryCalculator;

