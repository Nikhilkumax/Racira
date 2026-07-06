"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SWPCalculator = () => {
  const [corpus, setCorpus] = useState("1000000");
  const [withdrawal, setWithdrawal] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ totalWithdrawn: number; remainingCorpus: number; totalReturns: number; yearData: { year: number; withdrawn: number; returns: number; balance: number }[] } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const C = parseFloat(corpus) || 0;
    const W = parseFloat(withdrawal) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseInt(years) || 0) * 12;
    if (C <= 0 || W <= 0 || n <= 0) return;

    let balance = C;
    let totalWithdrawn = 0;
    let totalReturns = 0;
    const data: { year: number; withdrawn: number; returns: number; balance: number }[] = [];

    for (let month = 1; month <= n; month++) {
      const monthReturn = balance * r;
      totalReturns += monthReturn;
      balance = balance + monthReturn - W;
      totalWithdrawn += W;

      if (balance <= 0) {
        balance = 0;
        data.push({ year: Math.ceil(month / 12), withdrawn: totalWithdrawn, returns: totalReturns, balance: 0 });
        break;
      }

      if (month % 12 === 0) {
        data.push({ year: month / 12, withdrawn: totalWithdrawn, returns: totalReturns, balance });
      }
    }

    if (balance > 0 && n % 12 !== 0) {
      data.push({ year: Math.ceil(n / 12), withdrawn: totalWithdrawn, returns: totalReturns, balance });
    }

    setResult({ totalWithdrawn, remainingCorpus: balance, totalReturns, yearData: data });
  };

  const reset = () => {
    setShowResults(false); setCorpus("1000000"); setWithdrawal("10000"); setRate("8"); setYears("10"); setResult(null); };

  const faqs = [
    { question: "What is SWP?", answer: "SWP (Systematic Withdrawal Plan) allows you to withdraw a fixed amount from your mutual fund investment at regular intervals while the remaining corpus continues to earn returns." },
    { question: "How does SWP differ from SIP?", answer: "SIP is for investing regularly into mutual funds, while SWP is for withdrawing regularly from an existing investment. SWP is commonly used for generating regular income from a lump sum investment." },
    { question: "Is SWP taxable?", answer: "SWP withdrawals are subject to capital gains tax. For equity funds held >1 year, LTCG above ₹1.25 lakh is taxed at 12.5%. For debt funds, gains are taxed at your slab rate." },
    { question: "Can my SWP corpus get exhausted?", answer: "Yes, if the withdrawal rate exceeds the return rate, your corpus will eventually deplete. The sustainable withdrawal rate depends on the expected returns of your investment." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "SWP Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SWP Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="corpus" label="Total Investment" value={corpus} onChange={setCorpus} prefix="₹" />
                <InputField id="withdrawal" label="Monthly Withdrawal" value={withdrawal} onChange={setWithdrawal} prefix="₹" />
                <InputField id="rate" label="Expected Return (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="years" label="Withdrawal Period" value={years} onChange={setYears} suffix="Years" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">SWP Summary</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Total Withdrawn", value: result.totalWithdrawn },
                  { label: "Total Returns Earned", value: result.totalReturns, highlight: true },
                  { label: "Remaining Corpus", value: result.remainingCorpus, highlight: true },
                ]} />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Year-by-Year Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Withdrawn</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Returns</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Balance</th>
                      </tr></thead>
                      <tbody>
                        {result.yearData.map((d) => (
                          <tr key={d.year} className="border-b border-border/50">
                            <td className="py-2 px-3">{d.year}</td>
                            <td className="py-2 px-3 text-right">₹{d.withdrawn.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-3 text-right text-[hsl(217,91%,40%)] dark:text-primary">₹{d.returns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
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
              <h2 className="text-2xl font-bold mb-3">What Is an SWP Calculator?</h2>
              <p>An SWP (Systematic Withdrawal Plan) calculator helps you plan regular withdrawals from your mutual fund investment. It shows how your corpus behaves over time as you withdraw fixed amounts while the remaining balance continues to earn returns.</p>

              <h2 className="text-2xl font-bold mb-3">How SWP Works</h2>
              <p>In an SWP, you invest a lump sum and withdraw a fixed amount monthly. The remaining corpus stays invested and earns returns. If returns exceed withdrawals, your corpus can actually grow. If withdrawals exceed returns, the corpus gradually depletes.</p>

              <h2 className="text-2xl font-bold mb-3">SWP vs Fixed Deposit Interest</h2>
              <ul>
                <li><strong>SWP:</strong> Market-linked returns, potential for capital growth, tax-efficient (only gains are taxed).</li>
                <li><strong>FD:</strong> Fixed returns, no capital growth, entire interest is taxable at slab rate.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Mutual fund returns are not guaranteed. Actual returns may vary significantly from expected rates. This calculator assumes constant returns for estimation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swp-calculator" />
          <PopularCalculators exclude="/swp-calculator" />
        </div>
      </div>
    </>
  );
};

export default SWPCalculator;


