"use client";
import { RotateCcw, Landmark, Wallet, Calculator, Users } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const PayrollTaxCalculator = () => {
  const [grossSalary, setGrossSalary] = useState("80000");
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [filingStatus, setFilingStatus] = useState("single");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const salary = parseFloat(grossSalary) || 0;
    
    // FICA Rates (2024)
    const ssRate = 0.062;
    const medicareRate = 0.0145;
    const ssLimit = 168600;

    // 1. Employee Taxes
    const employeeSS = Math.min(salary, ssLimit) * ssRate;
    const employeeMedicare = salary * medicareRate;
    
    // Federal Income Tax (Simplified estimate)
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, salary - standardDeduction);
    const estFedTax = taxableIncome * 0.15; // 15% effective estimate

    const totalEmployeeTax = employeeSS + employeeMedicare + estFedTax;
    const netPay = salary - totalEmployeeTax;

    // 2. Employer Taxes
    const employerSS = Math.min(salary, ssLimit) * ssRate;
    const employerMedicare = salary * medicareRate;
    const futa = Math.min(salary, 7000) * 0.006;
    const suta = Math.min(salary, 10000) * 0.027; // Average SUTA estimate

    const totalEmployerTax = employerSS + employerMedicare + futa + suta;
    const totalCostToEmployer = salary + totalEmployerTax;

    setResults({
      employeeSS,
      employeeMedicare,
      estFedTax,
      totalEmployeeTax,
      netPay,
      employerSS,
      employerMedicare,
      futa,
      suta,
      totalEmployerTax,
      totalCostToEmployer,
      frequencyMultiplier: getFrequencyMultiplier(payFrequency)
    });
  };

  const getFrequencyMultiplier = (freq: string) => {
    if (freq === "weekly") return 52;
    if (freq === "biweekly") return 26;
    if (freq === "semimonthly") return 24;
    return 12;
  };

  const reset = () => {
    setGrossSalary("80000");
    setPayFrequency("biweekly");
    setFilingStatus("single");
  };

  const faqs = [
    {
      question: "What are FICA taxes?",
      answer: "FICA stands for the Federal Insurance Contributions Act. It consists of Social Security and Medicare taxes. Both employers and employees are required to pay these taxes, each paying 6.2% for Social Security (up to a wage limit) and 1.45% for Medicare."
    },
    {
      question: "What is FUTA and SUTA?",
      answer: "FUTA is the Federal Unemployment Tax Act, and SUTA is the State Unemployment Tax Act. These taxes are paid exclusively by the employer and are used to fund unemployment benefits for workers who lose their jobs."
    },
    {
      question: "Why is the cost to the employer higher than my salary?",
      answer: "In addition to your gross salary, employers must pay their share of FICA taxes, as well as federal and state unemployment taxes. Often, when benefits like health insurance and 401(k) matching are included, the total cost to an employer can be 1.2x to 1.4x the employee's base salary."
    },
    {
      question: "How is net pay calculated?",
      answer: "Net pay, or 'take-home pay,' is your gross salary minus all required tax withholdings (Federal Income Tax, Social Security, Medicare) and any voluntary deductions (health insurance premiums, retirement contributions)."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Payroll Tax Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Payroll Tax Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate federal payroll taxes for both employees and employers, including FICA, FUTA, and estimated income tax.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-primary" /> Salary Info
                  </h2>
                  <InputField id="salary" label="Annual Gross Salary" value={grossSalary} onChange={setGrossSalary} prefix="$" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pay Frequency</label>
                    <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="weekly">Weekly (52 periods)</option>
                      <option value="biweekly">Bi-Weekly (26 periods)</option>
                      <option value="semimonthly">Semi-Monthly (24 periods)</option>
                      <option value="monthly">Monthly (12 periods)</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-primary" /> Tax Details
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Pay Per Period (Gross)</p>
                    <p className="text-3xl font-black text-foreground">${results ? Math.round(parseFloat(grossSalary) / results.frequencyMultiplier).toLocaleString() : '0'}</p>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Tax</button>
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
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Employee Net Pay (Annual)</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.netPay).toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-widest">${Math.round(results.netPay / results.frequencyMultiplier).toLocaleString()} per pay period</p>
                  </div>
                  <div className="card-calculator bg-indigo-500/5 border-indigo-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Cost to Employer</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.totalCostToEmployer).toLocaleString()}</p>
                    <p className="text-xs text-indigo-500 mt-2 font-bold uppercase tracking-widest">Includes salary + payroll taxes</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="card-calculator">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                      <Users className="h-4 w-4 text-primary" /> Employee Deductions
                    </h3>
                    <ResultDisplay items={[
                      { label: "Federal Income Tax (Est.)", value: results.estFedTax },
                      { label: "Social Security (6.2%)", value: results.employeeSS },
                      { label: "Medicare (1.45%)", value: results.employeeMedicare },
                      { label: "Total Employee Taxes", value: results.totalEmployeeTax },
                    ]} />
                  </div>

                  <div className="card-calculator">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                      <Landmark className="h-4 w-4 text-primary" /> Employer Taxes
                    </h3>
                    <ResultDisplay items={[
                      { label: "Social Security (6.2%)", value: results.employerSS },
                      { label: "Medicare (1.45%)", value: results.employerMedicare },
                      { label: "Federal Unempl. (FUTA)", value: results.futa },
                      { label: "State Unempl. (SUTA Est.)", value: results.suta },
                    ]} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding Payroll Taxes</h2>
              <p>Payroll taxes are taxes imposed on employers and employees and are usually calculated as a percentage of the salaries that employers pay their staff. These taxes fund essential social insurance programs, including Social Security and Medicare.</p>

              <h3>The Hidden Costs of Hiring</h3>
              <p>For business owners, a $50,000 salary costs much more than $50,000. In addition to the base pay, employers must pay their portion of FICA taxes and unemployment insurance. This is why many companies refer to 'Total Compensation' when discussing pay, as the benefits and taxes paid by the company represent a significant financial commitment beyond the paycheck.</p>

              <h3>FICA: Social Security & Medicare</h3>
              <p>The Federal Insurance Contributions Act (FICA) tax is split evenly between the employer and the employee:</p>
              <ul>
                <li><strong>Social Security:</strong> Both parties pay 6.2% on earnings up to a certain threshold ($168,600 in 2024).</li>
                <li><strong>Medicare:</strong> Both parties pay 1.45% on all earnings. There is an additional 0.9% Medicare tax for high earners, which is paid only by the employee.</li>
              </ul>

              <h3>Unemployment Taxes (FUTA & SUTA)</h3>
              <p>These taxes are only paid by the employer. FUTA is a federal tax that is usually 0.6% of the first $7,000 of an employee's wages. SUTA is a state tax that varies significantly depending on the state and the employer's history of unemployment claims (their 'experience rating').</p>

              <h3>Income Tax Withholding</h3>
              <p>While FICA taxes are fixed percentages, Federal Income Tax withholding is based on the information provided on your Form W-4. This calculator uses a simplified effective rate to estimate this withholding, but your actual take-home pay may vary based on your specific deductions and credits.</p>

              <h2>Managing Payroll for Small Businesses</h2>
              <p>If you are a new employer, managing these taxes can be complex. We recommend using a professional payroll service (like Gusto, ADP, or Paychex) to ensure that all taxes are calculated correctly, withheld from paychecks, and paid to the appropriate government agencies on time. Missing a payroll tax deadline can lead to some of the most severe penalties issued by the IRS.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payroll-tax-calculator" />
          <PopularCalculators exclude="/calculator/payroll-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default PayrollTaxCalculator;

