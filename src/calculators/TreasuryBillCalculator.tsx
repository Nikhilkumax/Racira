"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function TreasuryBillCalculator() {
  const [faceValue, setFaceValue] = useState("10000");
  const [discountRate, setDiscountRate] = useState("5");
  const [daysToMaturity, setDaysToMaturity] = useState("91");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ purchasePrice: 0, discountAmount: 0, investmentYield: 0, annualizedYield: 0 });

  const handleCalculate = () => {
    const fv = parseFloat(faceValue) || 0;
    const dr = (parseFloat(discountRate) || 0) / 100;
    const days = parseFloat(daysToMaturity) || 0;

    const discountAmount = fv * dr * (days / 360);
    const purchasePrice = fv - discountAmount;
    const investmentYield = purchasePrice > 0 ? (discountAmount / purchasePrice) * (360 / days) * 100 : 0;
    const annualizedYield = purchasePrice > 0 ? (Math.pow(fv / purchasePrice, 365 / days) - 1) * 100 : 0;

    setResults({ purchasePrice, discountAmount, investmentYield, annualizedYield });
    setShowResults(true);
  };

  const reset = () => { setFaceValue("10000"); setDiscountRate("5"); setDaysToMaturity("91"); setShowResults(false); };

  const faqs = [
    { question: "What is a Treasury Bill (T-Bill)?", answer: "A T-Bill is a short-term U.S. government debt obligation backed by the Treasury with a maturity of one year or less. They are sold at a discount from face value and do not pay periodic interest." },
    { question: "How is a T-Bill's return calculated?", answer: "T-Bills are sold at a discount. If you pay $9,750 for a $10,000 T-Bill, you earn $250 at maturity. The bank discount yield uses a 360-day year; the investment yield uses 365 days." },
    { question: "What maturities do T-Bills come in?", answer: "T-Bills are issued with maturities of 4 weeks, 8 weeks, 13 weeks (91 days), 17 weeks, 26 weeks, and 52 weeks. They are auctioned weekly by the U.S. Treasury." },
    { question: "Are T-Bills safe?", answer: "T-Bills are considered one of the safest investments in the world, backed by the full faith and credit of the U.S. government. The primary risk is that the interest rate return may not keep up with inflation." },
    { question: "What is the difference between Bank Discount Yield and Investment Yield?", answer: "Bank Discount Yield uses face value as the base and a 360-day year. Investment Yield uses the purchase price as the base and a 365-day year. Investment Yield is a more accurate comparison to other investments." },
    { question: "How are T-Bills taxed?", answer: "T-Bill interest is subject to federal income tax but exempt from state and local taxes. This makes them especially attractive to investors in high-income-tax states." },
    { question: "Can I buy T-Bills directly?", answer: "Yes. Individual investors can buy T-Bills directly from the U.S. Treasury at TreasuryDirect.gov with no commission. They are also available through brokerages and money market funds." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Treasury Bill Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Treasury Bill (T-Bill) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="face-value" label="Face Value ($)" value={faceValue} onChange={setFaceValue} prefix="$" tooltip="The par/maturity value of the T-Bill (minimum $100, typically $10,000)." />
                <InputField id="discount-rate" label="Bank Discount Rate (%)" value={discountRate} onChange={setDiscountRate} suffix="%" tooltip="The discount rate quoted in T-Bill auctions (annualized, 360-day basis)." />
                <InputField id="days" label="Days to Maturity" value={daysToMaturity} onChange={setDaysToMaturity} tooltip="Standard maturities: 28, 56, 91, 119, 182, or 364 days." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate T-Bill Yield</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-4">T-Bill Yield Results</h2>
                <ResultDisplay items={[
                  { label: "Purchase Price", value: results.purchasePrice, highlight: true },
                  { label: "Discount Amount (Profit at Maturity)", value: results.discountAmount, highlight: true },
                  { label: "Investment Yield (365-day basis)", value: 0, textValue: `${results.investmentYield.toFixed(4)}%` },
                  { label: "Annualized Compound Yield", value: 0, textValue: `${results.annualizedYield.toFixed(4)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Are U.S. Treasury Bills?</h2>
              <p>U.S. Treasury Bills (T-Bills) are short-term debt instruments issued by the U.S. Department of the Treasury to finance the national debt. Unlike bonds, T-Bills do not pay periodic interest. Instead, they are sold at a discount from their face value, and the investor receives the full face value at maturity. The difference between the purchase price and the face value represents the investor's return.</p>
              <h2>How T-Bills Are Priced</h2>
              <p>T-Bills are priced using the bank discount yield method: <strong>Discount = Face Value × Discount Rate × (Days to Maturity ÷ 360)</strong>. The purchase price is then Face Value minus the Discount. For example, a $10,000 T-Bill with a 5% discount rate and 91 days to maturity has a discount of $10,000 × 0.05 × (91/360) = $126.39, so the purchase price is $9,873.61.</p>
              <h2>Bank Discount Yield vs. Investment Yield</h2>
              <p>The Bank Discount Yield (quoted in auctions) uses a 360-day year and face value as the base. The Investment Yield converts this to a 365-day basis using the actual purchase price, making it comparable to other interest-bearing investments. The Investment Yield is always slightly higher than the discount yield. The Bond Equivalent Yield (BEY) compares T-Bills to longer-term securities on a semi-annual basis.</p>
              <h2>Why Investors Choose T-Bills</h2>
              <p>T-Bills are one of the most liquid investments in the world. Their safety (backed by the U.S. government), liquidity (actively traded in secondary markets), and tax treatment (exempt from state and local taxes) make them an essential tool for cash management. During periods of stock market uncertainty, the "flight to safety" into T-Bills often drives yields lower as demand surges.</p>
              <h2>T-Bills in a Portfolio Context</h2>
              <p>T-Bills serve important roles in investment portfolios: emergency fund reserve earning competitive yields, "dry powder" for opportunistic investing, cash sweep vehicles in brokerage accounts, and comparison benchmarks for the risk-free rate in financial models. In the post-2022 environment with interest rates above 5%, T-Bills have attracted enormous inflows from retail investors seeking safe, liquid alternatives to savings accounts offering far lower rates.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/treasury-bill-calculator" />
          <PopularCalculators exclude="/calculator/treasury-bill-calculator" />
        </div>
      </div>
    </>
  );
}
