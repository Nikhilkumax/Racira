"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const NPSCalculator = () => {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("10");
  const [currentAge, setCurrentAge] = useState("25");
  const [retirementAge, setRetirementAge] = useState("60");
  const [annuityPct, setAnnuityPct] = useState("40");
  const [annuityRate, setAnnuityRate] = useState("6");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ totalInvested: number; totalCorpus: number; interest: number; lumpsum: number; annuityCorpus: number; monthlyPension: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const age = parseInt(currentAge) || 25;
    const retAge = parseInt(retirementAge) || 60;
    const annPct = (parseFloat(annuityPct) || 40) / 100;
    const annRate = (parseFloat(annuityRate) || 6) / 100 / 12;
    const months = (retAge - age) * 12;

    if (P <= 0 || months <= 0) return;

    let corpus = 0;
    for (let i = 0; i < months; i++) {
      corpus = (corpus + P) * (1 + r);
    }
    const totalInvested = P * months;
    const annuityCorpus = corpus * annPct;
    const lumpsum = corpus - annuityCorpus;

    // Monthly pension from annuity (simplified as perpetuity-style)
    const monthlyPension = annuityCorpus * annRate;

    setResult({
      totalInvested,
      totalCorpus: corpus,
      interest: corpus - totalInvested,
      lumpsum,
      annuityCorpus,
      monthlyPension,
    });
  };

  const reset = () => {
    setShowResults(false); setMonthly("5000"); setRate("10"); setCurrentAge("25"); setRetirementAge("60"); setAnnuityPct("40"); setAnnuityRate("6"); setResult(null); };

  const faqs = [
    { question: "What is NPS?", answer: "NPS (National Pension System) is a government-sponsored retirement savings scheme. It invests in a mix of equity, corporate bonds, and government securities based on your choice." },
    { question: "What are the tax benefits of NPS?", answer: "NPS offers tax deduction under Section 80CCD(1) within 80C limit of ₹1.5L, plus additional ₹50,000 under Section 80CCD(1B). Employer contributions qualify under 80CCD(2)." },
    { question: "What is the minimum NPS annuity percentage?", answer: "At retirement, you must use at least 40% of your NPS corpus to purchase an annuity. The remaining 60% can be withdrawn as a tax-free lump sum." },
    { question: "Can I choose my NPS investment mix?", answer: "Yes, NPS offers Active Choice (you pick equity/debt/government bonds allocation) and Auto Choice (lifecycle fund that adjusts automatically based on age)." },
    { question: "What returns does NPS give?", answer: "NPS returns depend on your asset allocation. Historically, Tier I equity funds have returned 10-14% p.a., while government bonds returned 8-10% p.a." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "NPS Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">NPS Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="monthly" label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="₹" />
                <InputField id="rate" label="Expected Return (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="currentAge" label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="Years" />
                <InputField id="retAge" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} suffix="Years" />
                <InputField id="annuityPct" label="Annuity Purchase %" value={annuityPct} onChange={setAnnuityPct} suffix="%" min="40" />
                <InputField id="annuityRate" label="Annuity Return Rate" value={annuityRate} onChange={setAnnuityRate} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">NPS Retirement Projection</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Total Invested", value: result.totalInvested },
                  { label: "Interest Earned", value: result.interest, highlight: true },
                  { label: "Total Corpus", value: result.totalCorpus, highlight: true },
                ]} />
                <div className="mt-4">
                  <ResultDisplay currency="₹" items={[
                    { label: "Lump Sum (Tax-Free)", value: result.lumpsum },
                    { label: "Annuity Corpus", value: result.annuityCorpus },
                    { label: "Est. Monthly Pension", value: result.monthlyPension, highlight: true },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is an NPS Calculator?</h2>
              <p>An NPS calculator helps you estimate the retirement corpus from your National Pension System contributions. It projects your total accumulation, tax-free lump sum withdrawal, and estimated monthly pension from the annuity portion.</p>

              <h2 className="text-2xl font-bold mb-3">How NPS Works</h2>
              <p>NPS is a defined contribution pension scheme. You contribute monthly, choose your investment mix (equity, corporate bonds, government securities), and at retirement:</p>
              <ul>
                <li><strong>Minimum 40%</strong> must be used to buy an annuity (monthly pension).</li>
                <li><strong>Up to 60%</strong> can be withdrawn as a tax-free lump sum.</li>
                <li>If corpus is ≤ ₹5 lakh, 100% can be withdrawn.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">NPS Tax Benefits</h2>
              <ul>
                <li><strong>Section 80CCD(1):</strong> Up to 10% of salary (within ₹1.5L of 80C).</li>
                <li><strong>Section 80CCD(1B):</strong> Additional ₹50,000 deduction (exclusive).</li>
                <li><strong>Section 80CCD(2):</strong> Employer contribution up to 14% of basic (no cap).</li>
                <li><strong>60% lump sum:</strong> Fully tax-free at retirement.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> NPS returns are market-linked and not guaranteed. The pension estimate is simplified and actual annuity rates vary by provider. Consult PFRDA guidelines.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/nps-calculator" />
          <PopularCalculators exclude="/nps-calculator" />
        </div>
      </div>
    </>
  );
};

export default NPSCalculator;


