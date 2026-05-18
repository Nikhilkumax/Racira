"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SukanyaSamriddhiCalculator = () => {
  const [yearlyDeposit, setYearlyDeposit] = useState("150000");
  const [interestRate, setInterestRate] = useState("8.2");
  const [girlAge, setGirlAge] = useState("5");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    totalDeposited: number; totalInterest: number; maturityAmount: number; maturityYear: number;
  } | null>(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{ year: number; deposit: number; interest: number; balance: number }[]>([]);

  const handleCalculate = () => {
    setShowResults(true);
    const deposit = parseFloat(yearlyDeposit) || 0;
    const rate = parseFloat(interestRate) || 0;
    const age = parseInt(girlAge) || 0;
    if (deposit <= 0 || rate <= 0 || age < 0 || age > 10) return;

    const depositYears = 15;
    const maturityYears = 21;
    const r = rate / 100;
    let balance = 0;
    let totalDeposited = 0;
    const breakdown: typeof yearlyBreakdown = [];

    for (let y = 1; y <= maturityYears; y++) {
      const dep = y <= depositYears ? deposit : 0;
      totalDeposited += dep;
      balance += dep;
      const interest = balance * r;
      balance += interest;
      breakdown.push({ year: y, deposit: dep, interest: Math.round(interest), balance: Math.round(balance) });
    }

    setResult({
      totalDeposited,
      totalInterest: Math.round(balance - totalDeposited),
      maturityAmount: Math.round(balance),
      maturityYear: new Date().getFullYear() + (21 - age),
    });
    setYearlyBreakdown(breakdown);
  };

  const reset = () => {
    setShowResults(false); setYearlyDeposit("150000"); setInterestRate("8.2"); setGirlAge("5"); setResult(null); setYearlyBreakdown([]); };

  const faqs = [
    { question: "What is Sukanya Samriddhi Yojana (SSY)?", answer: "SSY is a government-backed savings scheme for the girl child in India. It offers one of the highest interest rates among small savings schemes with tax benefits under Section 80C." },
    { question: "What is the minimum and maximum deposit?", answer: "The minimum annual deposit is ₹250 and the maximum is ₹1,50,000 per financial year. Deposits can be made for 15 years from the date of account opening." },
    { question: "When does SSY mature?", answer: "The account matures 21 years from the date of opening or upon the marriage of the girl child after she turns 18, whichever is earlier." },
    { question: "Is SSY tax-free?", answer: "Yes, SSY falls under the EEE (Exempt-Exempt-Exempt) category — the deposit, interest earned, and maturity amount are all tax-free." },
    { question: "Can partial withdrawal be made?", answer: "Yes, up to 50% of the balance can be withdrawn after the girl turns 18 for higher education purposes." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sukanya Samriddhi Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Sukanya Samriddhi Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate SSY maturity amount with yearly deposits and compounding interest for your girl child's future.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="yearlyDeposit" label="Yearly Deposit" value={yearlyDeposit} onChange={setYearlyDeposit} prefix="₹" tooltip="Annual deposit amount (₹250 to ₹1,50,000)" />
                <InputField id="interestRate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" tooltip="Current SSY interest rate set by government" />
                <InputField id="girlAge" label="Girl's Current Age" value={girlAge} onChange={setGirlAge} suffix="yrs" tooltip="Age of the girl child (0-10 years eligible)" min="0" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Maturity</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <>
                <div className="card-calculator mb-8">
                  <h2 className="text-xl font-bold mb-4">SSY Maturity Summary</h2>
                  <ResultDisplay currency="₹" items={[
                    { label: "Total Deposited", value: result.totalDeposited },
                    { label: "Total Interest Earned", value: result.totalInterest, highlight: true },
                    { label: "Maturity Amount", value: result.maturityAmount, highlight: true },
                    { label: "Maturity Year", value: 0, textValue: `${result.maturityYear}` },
                  ]} />
                </div>

                {yearlyBreakdown.length > 0 && (
                  <div className="card-calculator mb-8 overflow-x-auto">
                    <h2 className="text-xl font-bold mb-4">Year-wise Breakdown</h2>
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border text-left"><th className="pb-2 pr-4">Year</th><th className="pb-2 pr-4 text-right">Deposit</th><th className="pb-2 pr-4 text-right">Interest</th><th className="pb-2 text-right">Balance</th></tr></thead>
                      <tbody>
                        {yearlyBreakdown.map(row => (
                          <tr key={row.year} className="border-b border-border/50"><td className="py-2 pr-4">{row.year}</td><td className="py-2 pr-4 text-right">₹{row.deposit.toLocaleString("en-IN")}</td><td className="py-2 pr-4 text-right">₹{row.interest.toLocaleString("en-IN")}</td><td className="py-2 text-right font-medium">₹{row.balance.toLocaleString("en-IN")}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is Sukanya Samriddhi Yojana?</h2>
              <p>Sukanya Samriddhi Yojana (SSY) is a government-backed savings scheme launched in 2015 under the Beti Bachao Beti Padhao campaign. It is designed to encourage parents to build a fund for their girl child's future education and marriage. The scheme offers one of the highest interest rates among small savings instruments and provides full tax benefits.</p>

              <h2>How Is SSY Maturity Calculated?</h2>
              <p>The maturity amount depends on three factors: annual deposit amount, prevailing interest rate, and the tenure. Deposits are made for the first 15 years, but interest continues to accrue for the full 21-year term. The formula uses annual compounding:</p>
              <p><strong>A = P × [(1 + r)^n – 1] / r × (1 + r)</strong> (approximately, with yearly deposits)</p>

              <h2>Key Features of SSY</h2>
              <ul>
                <li><strong>Eligibility:</strong> Parents of a girl child aged 0-10 years can open the account.</li>
                <li><strong>Deposit period:</strong> 15 years from account opening.</li>
                <li><strong>Maturity:</strong> 21 years from account opening.</li>
                <li><strong>Tax benefit:</strong> EEE status — deposits, interest, and maturity are all tax-free.</li>
                <li><strong>Partial withdrawal:</strong> 50% after the girl turns 18 for education.</li>
                <li><strong>Maximum 2 accounts:</strong> One per girl child, maximum two per family.</li>
              </ul>

              <h2>SSY Interest Rate History</h2>
              <p>The interest rate is set by the government quarterly. As of 2024-25, the rate is 8.2% per annum. Historically, rates have ranged from 7.6% to 9.2%, making it one of the most attractive fixed-income schemes in India.</p>

              <h2>SSY vs PPF vs FD</h2>
              <ul>
                <li><strong>SSY (8.2%):</strong> Highest rate, 21-year lock-in, only for girl child, fully tax-free.</li>
                <li><strong>PPF (7.1%):</strong> 15-year lock-in, available to all, also EEE status.</li>
                <li><strong>FD (6-7%):</strong> Flexible tenure, interest is taxable, no Section 80C benefit beyond tax-saver FD.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Interest rates are subject to quarterly revision by the government. This calculator provides estimates based on the rate you enter. Verify with post office or bank for current rates.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sukanya-samriddhi-calculator" />
            <PopularCalculators exclude="/sukanya-samriddhi-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SukanyaSamriddhiCalculator;


