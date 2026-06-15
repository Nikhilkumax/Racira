"use client";
import { RotateCcw, TrendingUp, Info, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const CapitalGainsTaxCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState("50000");
  const [salePrice, setSalePrice] = useState("85000");
  const [holdingPeriod, setHoldingPeriod] = useState("long");
  const [annualIncome, setAnnualIncome] = useState("65000");
  const [filingStatus, setFilingStatus] = useState("single");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cost = parseFloat(purchasePrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    const income = parseFloat(annualIncome) || 0;
    const gain = Math.max(0, sale - cost);

    if (cost < 0 || sale < 0) return;

    let taxRate = 0;
    let totalTax = 0;

    if (holdingPeriod === "short") {
      // Short-term is taxed at ordinary income rates (simplified)
      if (income < 11600) taxRate = 10;
      else if (income < 47150) taxRate = 12;
      else if (income < 100525) taxRate = 22;
      else if (income < 191950) taxRate = 24;
      else taxRate = 32;
      
      totalTax = gain * (taxRate / 100);
    } else {
      // Long-term capital gains rates for 2024
      if (filingStatus === "single") {
        if (income + gain <= 47025) taxRate = 0;
        else if (income + gain <= 518900) taxRate = 15;
        else taxRate = 20;
      } else { // Married Joint
        if (income + gain <= 94050) taxRate = 0;
        else if (income + gain <= 583750) taxRate = 15;
        else taxRate = 20;
      }
      totalTax = gain * (taxRate / 100);
    }

    setResults({
      gain,
      taxRate,
      totalTax,
      netProfit: gain - totalTax,
      roi: cost > 0 ? (gain / cost) * 100 : 0
    });
  };

  const reset = () => {
    setPurchasePrice("50000");
    setSalePrice("85000");
    setHoldingPeriod("long");
    setAnnualIncome("65000");
    setFilingStatus("single");
  };

  const faqs = [
    {
      question: "What is the difference between short-term and long-term capital gains?",
      answer: "Short-term capital gains apply to assets held for one year or less and are taxed as ordinary income at your marginal tax rate. Long-term capital gains apply to assets held for more than one year and benefit from lower tax rates (0%, 15%, or 20%)."
    },
    {
      question: "Can capital losses offset capital gains?",
      answer: "Yes. You can use capital losses to offset your capital gains. If your losses exceed your gains, you can use up to $3,000 of the remaining loss to offset your ordinary income, and any leftover loss can be carried forward to future years."
    },
    {
      question: "Are some assets taxed differently?",
      answer: "Yes. For example, collectibles (like art or coins) are taxed at a maximum rate of 28%, and certain types of real estate gains (unrecaptured Section 1250 gain) are taxed at a maximum rate of 25%."
    },
    {
      question: "Is there a tax-free threshold for capital gains?",
      answer: "Yes. If your total taxable income (including the capital gain) is below a certain threshold ($47,025 for singles in 2024), your long-term capital gains tax rate is 0%."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Capital Gains Tax Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Capital Gains Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" /> The Transaction
                  </h2>
                  <InputField id="purchase" label="Purchase Price (Basis)" value={purchasePrice} onChange={setPurchasePrice} prefix="$" tooltip="The total amount paid for the asset including commissions." />
                  <InputField id="sale" label="Sale Price" value={salePrice} onChange={setSalePrice} prefix="$" tooltip="The total amount received from the sale." />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Holding Period</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setHoldingPeriod("short")} className={`p-3 rounded-xl border font-bold text-sm transition-all ${holdingPeriod === 'short' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}>
                        Short-Term
                        <span className="block text-[10px] font-medium opacity-80">≤ 1 Year</span>
                      </button>
                      <button onClick={() => setHoldingPeriod("long")} className={`p-3 rounded-xl border font-bold text-sm transition-all ${holdingPeriod === 'long' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}>
                        Long-Term
                        <span className="block text-[10px] font-medium opacity-80">&gt; 1 Year</span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-primary" /> Tax Profile
                  </h2>
                  <InputField id="income" label="Other Annual Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" tooltip="Your total taxable income from other sources (salary, etc.)." />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                    <div className="flex justify-between items-center mb-1">
                       <p className="text-[10px] font-bold text-primary uppercase">Estimated Gain</p>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase">+{results?.roi.toFixed(1)}% ROI</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">${results ? results.gain.toLocaleString() : '0'}</p>
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
                  <div className="card-calculator bg-red-500/5 border-red-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Estimated Tax Due</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.totalTax).toLocaleString()}</p>
                    <p className="text-xs text-red-500 mt-2 font-bold uppercase tracking-widest">{results.taxRate}% Rate</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Net After-Tax Profit</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.netProfit).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Info className="h-5 w-5 text-primary" /> Tax Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Total Gross Gain", value: results.gain },
                    { label: "Capital Gains Tax Rate", value: 0, textValue: `${results.taxRate}%` },
                    { label: "Total Tax Liability", value: results.totalTax },
                    { label: "Profit Kept After Tax", value: results.netProfit },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Capital Gains Taxes Work</h2>
              <p>When you sell an investment for more than you paid for it, the profit is considered a "capital gain." The IRS taxes these gains differently depending on how long you owned the asset. Understanding these rules can help you time your sales to minimize your tax bill.</p>

              <h3>Short-Term vs. Long-Term Gains</h3>
              <p>The holding period is the most critical factor in determining your tax rate:</p>
              <ul>
                <li><strong>Short-Term:</strong> If you hold an asset for one year or less, your gain is taxed at your ordinary income tax rate. This can be as high as 37%, depending on your total income.</li>
                <li><strong>Long-Term:</strong> If you hold an asset for more than 365 days, you qualify for the long-term capital gains tax rates, which are significantly lower (0%, 15%, or 20%).</li>
              </ul>

              <h3>2024 Long-Term Tax Brackets</h3>
              <p>For most individual taxpayers, the 15% rate applies. However, you may pay 0% if your total income is relatively low, or 20% if you are a high-income earner. Specifically, for 2024:</p>
              <ul>
                <li><strong>0% Rate:</strong> Applies to single filers with income up to $47,025 and married couples up to $94,050.</li>
                <li><strong>15% Rate:</strong> Applies to income between the 0% threshold and $518,900 (single) or $583,750 (married).</li>
                <li><strong>20% Rate:</strong> Applies to income above those limits.</li>
              </ul>

              <h3>Net Investment Income Tax (NIIT)</h3>
              <p>High-income earners may also be subject to an additional 3.8% Net Investment Income Tax. This typically applies to individuals with a modified adjusted gross income (MAGI) over $200,000 or married couples over $250,000.</p>

              <h3>Reducing Your Capital Gains Tax</h3>
              <p>Smart investors use several strategies to lower their tax liability:</p>
              <ol>
                <li><strong>Tax-Loss Harvesting:</strong> Selling 'loser' investments to offset the gains from 'winner' investments.</li>
                <li><strong>The 1031 Exchange:</strong> For real estate investors, this allows you to defer capital gains tax by reinvesting the proceeds into a 'like-kind' property.</li>
                <li><strong>Hold for at least 366 days:</strong> Simply waiting one extra day before selling can cut your tax rate by more than half.</li>
                <li><strong>Donate to Charity:</strong> Donating appreciated stock directly to a non-profit allows you to avoid capital gains tax entirely while still getting a full deduction for the market value.</li>
              </ol>

              <h2>Special Assets</h2>
              <p>Be aware that some assets don't follow the 0/15/20 rules. Collectibles (like art, stamps, or vintage cars) are taxed at a maximum rate of 28%. Real estate gains resulting from depreciation deductions taken in previous years (depreciation recapture) are taxed at 25%.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/capital-gains-tax-calculator" />
          <PopularCalculators exclude="/calculator/capital-gains-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default CapitalGainsTaxCalculator;

