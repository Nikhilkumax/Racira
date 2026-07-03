"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const EPFCalculator = () => {
  const [basicSalary, setBasicSalary] = useState("25000");
  const [employeeContrib, setEmployeeContrib] = useState("12");
  const [employerContrib, setEmployerContrib] = useState("3.67");
  const [rate, setRate] = useState("8.25");
  const [currentAge, setCurrentAge] = useState("25");
  const [retirementAge, setRetirementAge] = useState("58");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [annualIncrement, setAnnualIncrement] = useState("5");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ employeeTotal: number; employerTotal: number; interest: number; maturity: number; yearData: { year: number; salary: number; contribution: number; balance: number }[] } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const salary = parseFloat(basicSalary) || 0;
    const empPct = (parseFloat(employeeContrib) || 0) / 100;
    const erPct = (parseFloat(employerContrib) || 0) / 100;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const age = parseInt(currentAge) || 25;
    const retAge = parseInt(retirementAge) || 58;
    const existing = parseFloat(currentBalance) || 0;
    const increment = (parseFloat(annualIncrement) || 0) / 100;

    const yearsLeft = retAge - age;
    if (salary <= 0 || yearsLeft <= 0) return;

    let balance = existing;
    let totalEmployee = 0;
    let totalEmployer = 0;
    let currentSalary = salary;
    const data: { year: number; salary: number; contribution: number; balance: number }[] = [];

    for (let y = 1; y <= yearsLeft; y++) {
      const monthlyContrib = currentSalary * (empPct + erPct);
      for (let m = 0; m < 12; m++) {
        totalEmployee += currentSalary * empPct;
        totalEmployer += currentSalary * erPct;
        balance = (balance + monthlyContrib) * (1 + r);
      }
      data.push({ year: y, salary: currentSalary, contribution: monthlyContrib * 12, balance });
      currentSalary = currentSalary * (1 + increment);
    }

    setResult({
      employeeTotal: totalEmployee,
      employerTotal: totalEmployer,
      interest: balance - totalEmployee - totalEmployer - existing,
      maturity: balance,
      yearData: data,
    });
  };

  const reset = () => {
    setShowResults(false);
    setBasicSalary("25000"); setEmployeeContrib("12"); setEmployerContrib("3.67");
    setRate("8.25"); setCurrentAge("25"); setRetirementAge("58");
    setCurrentBalance("0"); setAnnualIncrement("5"); setResult(null);
  };

  const faqs = [
    { question: "What is EPF?", answer: "EPF (Employee Provident Fund) is a mandatory retirement savings scheme for salaried employees in India. Both employee and employer contribute a percentage of basic salary monthly." },
    { question: "What is the EPF interest rate?", answer: "The EPF interest rate is declared annually by EPFO. For FY 2023-24, it was 8.25%. The rate has historically ranged between 8-9%." },
    { question: "How much does the employer contribute to EPF?", answer: "Employer contributes 12% of basic salary, but only 3.67% goes to EPF. The remaining 8.33% goes to EPS (Employee Pension Scheme), capped at ₹15,000 basic salary." },
    { question: "Is EPF withdrawal tax-free?", answer: "EPF withdrawal after 5 continuous years of service is fully tax-free. Withdrawal before 5 years is taxable. The employee's contribution portion is not taxed." },
    { question: "Can I withdraw EPF before retirement?", answer: "Partial withdrawal is allowed for specific purposes like home purchase, medical emergency, education, and marriage. Full withdrawal is possible 2 months after leaving employment." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "EPF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EPF Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="salary" label="Monthly Basic Salary" value={basicSalary} onChange={setBasicSalary} prefix="₹" />
                <InputField id="empContrib" label="Employee Contribution" value={employeeContrib} onChange={setEmployeeContrib} suffix="%" />
                <InputField id="erContrib" label="Employer EPF Contribution" value={employerContrib} onChange={setEmployerContrib} suffix="%" />
                <InputField id="rate" label="EPF Interest Rate (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="currentAge" label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="Years" />
                <InputField id="retAge" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} suffix="Years" />
                <InputField id="currentBal" label="Current EPF Balance" value={currentBalance} onChange={setCurrentBalance} prefix="₹" />
                <InputField id="increment" label="Annual Salary Increment" value={annualIncrement} onChange={setAnnualIncrement} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">EPF Corpus at Retirement</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Your Contribution", value: result.employeeTotal },
                  { label: "Employer's Contribution", value: result.employerTotal },
                  { label: "Total Interest Earned", value: result.interest, highlight: true },
                  { label: "Total EPF Corpus", value: result.maturity, highlight: true },
                ]} />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Year-by-Year Growth</h3>
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card"><tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Basic Salary</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Annual Contrib.</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Balance</th>
                      </tr></thead>
                      <tbody>
                        {result.yearData.map((d) => (
                          <tr key={d.year} className="border-b border-border/50">
                            <td className="py-2 px-3">{d.year}</td>
                            <td className="py-2 px-3 text-right">₹{d.salary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-3 text-right">₹{d.contribution.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-3 text-right font-medium">₹{d.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is an EPF Calculator?</h2>
              <p>An EPF calculator estimates your Employee Provident Fund corpus at retirement based on your current salary, contribution rates, expected salary increments, and EPF interest rate. It helps you plan for retirement by projecting how your monthly EPF contributions will grow over time.</p>

              <h2>Understanding EPF Contributions</h2>
              <p>Both employee and employer contribute to EPF:</p>
              <ul>
                <li><strong>Employee:</strong> 12% of basic salary + DA goes entirely to EPF.</li>
                <li><strong>Employer:</strong> 12% of basic salary + DA, split as 3.67% to EPF and 8.33% to EPS (capped at ₹15,000 basic).</li>
              </ul>

              <h2>EPF Tax Benefits</h2>
              <ul>
                <li><strong>Section 80C:</strong> Employee contribution qualifies for ₹1.5L deduction.</li>
                <li><strong>Tax-Free Interest:</strong> Interest is tax-free up to ₹2.5L annual contribution (excess taxable since FY 2021-22).</li>
                <li><strong>Tax-Free Maturity:</strong> Withdrawal after 5 years of continuous service is fully tax-exempt.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> EPF interest rate changes annually. This calculator assumes a constant rate. Actual corpus may vary. Consult your HR or EPFO for exact figures.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/epf-calculator" />
          <PopularCalculators exclude="/epf-calculator" />
        </div>
      </div>
    </>
  );
};

export default EPFCalculator;


