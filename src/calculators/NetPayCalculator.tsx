"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Wallet, DollarSign, Calculator, Receipt, ShieldCheck, Info } from "lucide-react";

const NetPayCalculator = () => {
  const [grossPay, setGrossPay] = useState("85000");
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [filingStatus, setFilingStatus] = useState("single");
  const [preTaxDeductions, setPreTaxDeductions] = useState("400"); // e.g. 401k per period
  const [medicalPremiums, setMedicalPremiums] = useState("150"); // per period

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const annualGross = parseFloat(grossPay) || 0;
    const freq = getFrequencyMultiplier(payFrequency);
    
    const periodGross = annualGross / freq;
    const periodPreTax = parseFloat(preTaxDeductions) || 0;
    const periodMedical = parseFloat(medicalPremiums) || 0;

    // Annualize for tax calculation
    const annualPreTax = periodPreTax * freq;
    const annualMedical = periodMedical * freq;

    // 2024 Standard Deductions
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, annualGross - annualPreTax - annualMedical - standardDeduction);

    // FICA (Social Security & Medicare)
    // Medical premiums are usually FICA-exempt
    const ficaTaxable = Math.max(0, annualGross - annualMedical);
    const ssTax = Math.min(ficaTaxable, 168600) * 0.062;
    const medicareTax = ficaTaxable * 0.0145;

    // Federal Income Tax (Brackets)
    const federalTax = calculateFederalTax(taxableIncome, filingStatus);

    const totalAnnualTax = ssTax + medicareTax + federalTax;
    const annualNetPay = annualGross - totalAnnualTax - annualPreTax - annualMedical;

    setResults({
      periodGross,
      periodNet: annualNetPay / freq,
      periodTax: totalAnnualTax / freq,
      periodDeductions: periodPreTax + periodMedical,
      annualNetPay,
      annualTax: totalAnnualTax,
      effectiveRate: annualGross > 0 ? (totalAnnualTax / annualGross) * 100 : 0
    });
  };

  const calculateFederalTax = (taxable: number, status: string) => {
    const singleBrackets = [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];
    const marriedBrackets = [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];
    const brackets = status === "single" ? singleBrackets : marriedBrackets;
    let tax = 0;
    let prevLimit = 0;
    for (const b of brackets) {
      const taxableInBracket = Math.min(taxable, b.limit - prevLimit);
      tax += taxableInBracket * b.rate;
      taxable -= taxableInBracket;
      prevLimit = b.limit;
      if (taxable <= 0) break;
    }
    return tax;
  };

  const getFrequencyMultiplier = (freq: string) => {
    if (freq === "weekly") return 52;
    if (freq === "biweekly") return 26;
    if (freq === "semimonthly") return 24;
    return 12;
  };

  // Removed auto-calculation useEffect

  const reset = () => {
    setGrossPay("85000");
    setPayFrequency("biweekly");
    setFilingStatus("single");
    setPreTaxDeductions("400");
    setMedicalPremiums("150");
    setShowResults(false);
  };

  const faqs = [
    {
      question: "What is the difference between gross pay and net pay?",
      answer: "Gross pay is the total amount you earn before any taxes or deductions are taken out. Net pay, often called 'take-home pay,' is the actual amount of money that ends up in your bank account after all taxes (Federal, Social Security, Medicare) and deductions (health insurance, 401k) have been removed."
    },
    {
      question: "Are 401(k) contributions tax-deductible?",
      answer: "Traditional 401(k) contributions are 'pre-tax,' meaning they are deducted from your gross pay before income taxes are calculated. This lowers your taxable income and the amount of income tax you owe today. However, you will pay taxes on this money when you withdraw it in retirement."
    },
    {
      question: "How does filing status affect my take-home pay?",
      answer: "Your filing status determines which tax brackets and standard deduction apply to your income. Generally, 'Married Filing Jointly' has larger brackets and a higher standard deduction than 'Single,' which often results in lower tax withholding and higher take-home pay for the same gross salary."
    },
    {
      question: "What is FICA?",
      answer: "FICA stands for the Federal Insurance Contributions Act. It is a mandatory payroll tax that funds Social Security (6.2%) and Medicare (1.45%). Most employees must pay this on their entire salary up to a certain limit for Social Security."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Net Pay Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Pay (Take-Home) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Wallet className="h-5 w-5 text-primary" /> Earnings
                  </h2>
                  <InputField id="gross-pay" label="Annual Gross Salary" value={grossPay} onChange={setGrossPay} prefix="$" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pay Frequency</label>
                    <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="semimonthly">Semi-Monthly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Per-Period Deductions
                  </h2>
                  <InputField id="pre-tax" label="401(k) / 403(b)" value={preTaxDeductions} onChange={setPreTaxDeductions} prefix="$" tooltip="Amount contributed to your retirement account each paycheck." />
                  <InputField id="medical" label="Medical Insurance" value={medicalPremiums} onChange={setMedicalPremiums} prefix="$" tooltip="Health, Dental, and Vision premiums per paycheck." />
                  
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Gross Pay Per Period</p>
                    <p className="text-3xl font-black text-foreground">${results ? Math.round(results.periodGross).toLocaleString() : '0'}</p>
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
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimated Take-Home Pay</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.periodNet).toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-widest">Per {payFrequency === 'biweekly' ? 'Bi-Weekly' : payFrequency.charAt(0).toUpperCase() + payFrequency.slice(1)} Paycheck</p>
                  </div>
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Annual Net Pay</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annualNetPay).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-2xl font-bold mb-3">
                    <Calculator className="h-5 w-5 text-primary" /> Annual Breakdown
                  </h2>
                  <div className="mb-8">
                     <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Where your money goes</span>
                        <span>100%</span>
                     </div>
                     <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(results.annualNetPay / parseFloat(grossPay)) * 100}%` }}></div>
                        <div className="h-full bg-red-500" style={{ width: `${(results.annualTax / parseFloat(grossPay)) * 100}%` }}></div>
                        <div className="h-full bg-indigo-500" style={{ width: `${((parseFloat(preTaxDeductions) + parseFloat(medicalPremiums)) * getFrequencyMultiplier(payFrequency) / parseFloat(grossPay)) * 100}%` }}></div>
                     </div>
                     <div className="flex gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Take-Home</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-red-500"></div> Taxes</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Deductions</div>
                     </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Total Annual Gross Pay", value: parseFloat(grossPay) },
                    { label: "Total Federal & FICA Taxes", value: results.annualTax },
                    { label: "Total Benefit Deductions", value: results.periodDeductions * getFrequencyMultiplier(payFrequency) },
                    { label: "Effective Tax Rate", value: 0, textValue: `${results.effectiveRate.toFixed(1)}%` },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Your Take-Home Pay</h2>
              <p>When you see a salary figure on a job offer or a promotion letter, it represents your gross pay—the total amount the company pays you. However, the amount that actually reaches your bank account is your net pay. This gap is filled by taxes, social insurance, and voluntary benefit contributions.</p>

              <h3>Tax Withholding: The Three Big Ones</h3>
              <p>For most Americans, three primary federal taxes are removed from every paycheck:</p>
              <ol>
                <li><strong>Federal Income Tax:</strong> This is a progressive tax. As you earn more, the percentage taken from your paycheck increases. The amount withheld is based on your filing status and the information you provided on your Form W-4.</li>
                <li><strong>Social Security (FICA):</strong> A flat 6.2% tax on your wages up to a certain annual limit ($168,600 in 2024). This funds the Social Security program for retirees and the disabled.</li>
                <li><strong>Medicare (FICA):</strong> A flat 1.45% tax on all your wages, with no limit. High earners (over $200,000) may pay an additional 0.9% tax.</li>
              </ol>

              <h3>The Power of Pre-Tax Deductions</h3>
              <p>One of the most effective ways to increase your long-term wealth while lowering your current tax bill is through pre-tax deductions. When you contribute to a <strong>Traditional 401(k)</strong> or a <strong>Health Savings Account (HSA)</strong>, that money is taken out of your gross pay <em>before</em> taxes are calculated. For example, if you are in the 22% tax bracket, a $100 contribution to your 401(k) only reduces your take-home pay by about $78, because the government "pays" the other $22 in the form of a tax break.</p>

              <h3>Medical Premiums and FICA</h3>
              <p>Most health insurance premiums paid through an employer are also 'Section 125' deductions. This means they are exempt not only from federal income tax but also from the 7.65% FICA tax. This makes employer-sponsored health insurance one of the most cost-effective ways to pay for medical care.</p>

              <h3>Managing Your Paycheck</h3>
              <p>If you find that your net pay is consistently too low to cover your expenses, consider these steps:</p>
              <ul>
                <li><strong>Review Your W-4:</strong> If you get a massive tax refund every year, you are over-withholding. Adjusting your W-4 can put more money in your pocket every month.</li>
                <li><strong>Evaluate Benefit Tiers:</strong> Check if you are paying for a high-premium medical plan that you don't fully utilize. A High Deductible Health Plan (HDHP) with an HSA might be more cost-effective.</li>
                <li><strong>Automate Your Savings:</strong> Even if your net pay is small, try to automate a small transfer to a high-yield savings account the day you get paid. Treating savings like a mandatory deduction is the best way to build an emergency fund.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Next Steps</h2>
              <p>Use this calculator to see how a potential raise or a new deduction would impact your actual budget. Knowing your exact take-home pay is the first step in creating a realistic monthly budget that helps you reach your financial goals.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-pay-calculator" />
          <PopularCalculators exclude="/calculator/net-pay-calculator" />
        </div>
      </div>
    </>
  );
};

export default NetPayCalculator;

