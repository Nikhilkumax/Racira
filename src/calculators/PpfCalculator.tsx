"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const PPFCalculator = () => {
  const [yearly, setYearly] = useState("150000");
  const [rate, setRate] = useState("7.1");
  const [years, setYears] = useState("15");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ invested: number; interest: number; maturity: number; yearData: { year: number; deposit: number; interest: number; balance: number }[] } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(yearly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(years) || 15;
    if (P <= 0 || n <= 0) return;

    const cappedP = Math.min(P, 150000); // PPF max limit
    let balance = 0;
    let totalDeposit = 0;
    const data: { year: number; deposit: number; interest: number; balance: number }[] = [];

    for (let y = 1; y <= n; y++) {
      totalDeposit += cappedP;
      const interest = (balance + cappedP) * r;
      balance = balance + cappedP + interest;
      data.push({ year: y, deposit: cappedP, interest, balance });
    }

    setResult({ invested: totalDeposit, interest: balance - totalDeposit, maturity: balance, yearData: data });
  };

  const reset = () => {
    setShowResults(false); setYearly("150000"); setRate("7.1"); setYears("15"); setResult(null); };

  const faqs = [
    { question: "What is PPF?", answer: "PPF (Public Provident Fund) is a government-backed long-term savings scheme in India offering guaranteed, tax-free returns. It has a 15-year lock-in period with extension options." },
    { question: "What is the current PPF interest rate?", answer: "The PPF interest rate is reviewed quarterly by the government. As of recent quarters, it has been 7.1% per annum, compounded annually." },
    { question: "What is the maximum PPF deposit?", answer: "The maximum annual deposit in PPF is ₹1,50,000. The minimum is ₹500 per year. Deposits above ₹1,50,000 do not earn interest." },
    { question: "Is PPF tax-free?", answer: "Yes, PPF enjoys EEE (Exempt-Exempt-Exempt) tax status. Deposits qualify for Section 80C deduction (up to ₹1.5L), interest earned is tax-free, and maturity amount is tax-free." },
    { question: "Can I extend PPF after 15 years?", answer: "Yes, PPF can be extended in blocks of 5 years each. You can extend with or without fresh contributions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "PPF Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PPF Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate Public Provident Fund maturity amount with yearly deposits and compound interest.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="yearly" label="Yearly Deposit" value={yearly} onChange={setYearly} prefix="₹" />
                <InputField id="rate" label="Interest Rate (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="years" label="Tenure" value={years} onChange={setYears} suffix="Years" min="15" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">Max deposit: ₹1,50,000/year. Min tenure: 15 years.</p>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">PPF Maturity</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Total Deposited", value: result.invested },
                  { label: "Total Interest", value: result.interest, highlight: true },
                  { label: "Maturity Amount", value: result.maturity, highlight: true },
                ]} />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Year-by-Year Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Deposit</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Interest</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Balance</th>
                      </tr></thead>
                      <tbody>
                        {result.yearData.map((d) => (
                          <tr key={d.year} className="border-b border-border/50">
                            <td className="py-2 px-3">{d.year}</td>
                            <td className="py-2 px-3 text-right">₹{d.deposit.toLocaleString("en-IN")}</td>
                            <td className="py-2 px-3 text-right text-[hsl(217,91%,40%)] dark:text-primary">₹{d.interest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a PPF Calculator?</h2>
              <p>A PPF calculator helps you estimate the maturity value of your Public Provident Fund account based on annual deposits, interest rate, and tenure. PPF is one of the safest investment options in India, backed by the Government of India.</p>

              <h2>How PPF Interest Is Calculated</h2>
              <p>PPF interest is compounded annually. The interest for each year is calculated on the balance at the end of the previous year plus the current year's deposit. The formula is:</p>
              <p><strong>Balance(n) = [Balance(n-1) + Deposit] × (1 + r)</strong></p>

              <h2>PPF Key Features</h2>
              <ul>
                <li><strong>Tax Benefits:</strong> EEE status — deduction under 80C, tax-free interest, tax-free maturity.</li>
                <li><strong>Lock-in:</strong> 15-year minimum, extendable in 5-year blocks.</li>
                <li><strong>Partial Withdrawal:</strong> Allowed from 7th year onwards.</li>
                <li><strong>Loan Facility:</strong> Available from 3rd to 6th year against PPF balance.</li>
                <li><strong>Sovereign Guarantee:</strong> Zero credit risk, backed by Government of India.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> PPF interest rate is subject to quarterly revision by the government. This calculator uses the rate you provide for the entire tenure. Actual returns may vary.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ppf-calculator" />
          <PopularCalculators exclude="/ppf-calculator" />
        </div>
      </div>
    </>
  );
};

export default PPFCalculator;


