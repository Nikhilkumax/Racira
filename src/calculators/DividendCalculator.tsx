"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, DollarSign } from "lucide-react";

const DividendCalculator = () => {
  const [shares, setShares] = useState("1000");
  const [pricePerShare, setPricePerShare] = useState("50");
  const [annualDividend, setAnnualDividend] = useState("2.40");
  const [yieldGrowth, setYieldGrowth] = useState("5");
  const [years, setYears] = useState("10");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const sh = parseFloat(shares);
    const price = parseFloat(pricePerShare);
    const div = parseFloat(annualDividend);
    const growth = parseFloat(yieldGrowth) / 100;
    const yrs = parseFloat(years);

    const totalInvestment = sh * price;
    const currentYield = (div / price) * 100;
    const currentAnnualIncome = sh * div;
    const quarterlyIncome = currentAnnualIncome / 4;
    const monthlyEquivalent = currentAnnualIncome / 12;

    // Dividend income in future with DRIP (compounding)
    let shares10yr = sh;
    let totalDividends = 0;
    let currentDiv = div;
    for (let y = 0; y < yrs; y++) {
      const annualIncome = shares10yr * currentDiv;
      totalDividends += annualIncome;
      const newShares = annualIncome / (price * Math.pow(1.05, y));
      shares10yr += newShares;
      currentDiv *= (1 + growth);
    }

    setResults({ currentYield, currentAnnualIncome, quarterlyIncome, monthlyEquivalent, totalInvestment, totalDividends, shares10yr });
  };

  const reset = () => {
    setShowResults(false); setShares("1000"); setPricePerShare("50"); setAnnualDividend("2.40"); setYieldGrowth("5"); setYears("10"); setResults(null); };

  const faqs = [
    { question: "What is dividend yield?", answer: "Dividend yield is the annual dividend per share divided by the stock price, expressed as a percentage. It tells you what percentage of your investment you receive back each year as dividend income." },
    { question: "What is DRIP?", answer: "DRIP stands for Dividend Reinvestment Plan. Instead of receiving dividends as cash, you reinvest them to buy more shares. Over time, this dramatically compounds your returns through the power of fractional share accumulation." },
    { question: "What is a good dividend yield?", answer: "Yields of 2-4% are considered healthy for stable companies. Yields above 6-7% should be scrutinized, as they may signal a dividend cut is coming (a 'yield trap')." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dividend Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Dividend Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate dividend income, yield, and long-term DRIP accumulation for stock investments.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="shares" label="Number of Shares" value={shares} onChange={setShares} />
                <InputField id="price" label="Price Per Share ($)" value={pricePerShare} onChange={setPricePerShare} />
                <InputField id="div" label="Annual Dividend Per Share ($)" value={annualDividend} onChange={setAnnualDividend} />
                <InputField id="growth" label="Dividend Growth Rate (%/yr)" value={yieldGrowth} onChange={setYieldGrowth} />
                <InputField id="yrs" label="Projection Period (Years)" value={years} onChange={setYears} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><DollarSign className="h-5 w-5" /> Calculate Income</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Dividend Income Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Dividend Income</p>
                    <p className="text-5xl font-black text-foreground">${results.currentAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-sm text-muted-foreground mt-1">Yield: {results.currentYield.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total DRIP Dividends ({years}yr)</p>
                    <p className="text-3xl font-black text-foreground">${results.totalDividends.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Monthly Equivalent", value: 0, textValue: "$" + results.monthlyEquivalent.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                  { label: "Quarterly Payment", value: 0, textValue: "$" + results.quarterlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Investment", value: 0, textValue: "$" + results.totalInvestment.toLocaleString() },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Building Dividend Income</h2>
              <p>Dividend investing is a popular strategy for generating passive income. By owning dividend-paying stocks, you receive regular cash payments simply for holding shares.</p>
              <h3>The Power of DRIP</h3>
              <p>Dividend reinvestment plans (DRIPs) are arguably the most powerful wealth-building tool available to retail investors. By automatically reinvesting dividends to buy more shares, you harness the power of compound growth on both price appreciation and increasing dividend payments.</p>
              <h3>Dividend Growth Investing</h3>
              <p>Companies that have consistently raised their dividends for 25+ consecutive years are called "Dividend Aristocrats." These companies tend to be financially strong and shareholder-friendly, making them excellent candidates for long-term income portfolios.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend" />
            <PopularCalculators exclude="/calculator/dividend-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default DividendCalculator;

