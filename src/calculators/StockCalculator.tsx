"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const StockCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState("150");
  const [sellingPrice, setSellingPrice] = useState("180");
  const [shares, setShares] = useState("100");
  const [buyCommission, setBuyCommission] = useState("0");
  const [sellCommission, setSellCommission] = useState("0");
  const [capitalGainsTax, setCapitalGainsTax] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const buyPrice = parseFloat(purchasePrice) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const numShares = parseFloat(shares) || 0;
    const buyComm = parseFloat(buyCommission) || 0;
    const sellComm = parseFloat(sellCommission) || 0;
    const taxRate = (parseFloat(capitalGainsTax) || 0) / 100;

    const costBasis = (buyPrice * numShares) + buyComm;
    const sellRevenue = (sellPrice * numShares) - sellComm;
    const grossProfit = sellRevenue - costBasis;
    
    const taxAmount = grossProfit > 0 ? grossProfit * taxRate : 0;
    const netProfit = grossProfit - taxAmount;
    const roi = costBasis > 0 ? (netProfit / costBasis) * 100 : 0;

    setResults({
      costBasis,
      sellRevenue,
      grossProfit,
      taxAmount,
      netProfit,
      roi
    });
  };

  const reset = () => {
    setShowResults(false);
    setPurchasePrice("150");
    setSellingPrice("180");
    setShares("100");
    setResults(null);
  };

  const faqs = [
    { question: "What is cost basis in stock trading?", answer: "Cost basis is the original value of an asset for tax purposes, usually the purchase price plus any commissions or fees paid to acquire the shares. This number is used to calculate your capital gains or losses when you sell." },
    { question: "How are stock gains taxed?", answer: "In the US, if you hold a stock for more than a year, you pay long-term capital gains tax (usually 0%, 15%, or 20%). If held for less than a year, it's taxed at your ordinary income tax rate." },
    { question: "Do I have to pay taxes if I lose money on a stock?", answer: "No. In fact, you can often use 'capital losses' to offset other capital gains or even up to $3,000 of your ordinary income each year, a strategy known as tax-loss harvesting." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Stock Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stock Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="purchasePrice" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
                <InputField id="shares" label="Number of Shares" value={shares} onChange={setShares} />
                <InputField id="sellingPrice" label="Selling Price" value={sellingPrice} onChange={setSellingPrice} prefix="$" />
                <InputField id="taxRate" label="Capital Gains Tax" value={capitalGainsTax} onChange={setCapitalGainsTax} suffix="%" />
                <InputField id="buyComm" label="Buy Commission" value={buyCommission} onChange={setBuyCommission} prefix="$" />
                <InputField id="sellComm" label="Sell Commission" value={sellCommission} onChange={setSellCommission} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Profit</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Net Profit</h2>
                  <p className={`text-5xl font-extrabold mb-2 ${results.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.round(results.netProfit).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">ROI: <span className="font-bold text-foreground">{results.roi.toFixed(2)}%</span></p>
                </div>

                <ResultDisplay items={[
                  { label: "Total Cost Basis", value: results.costBasis },
                  { label: "Total Sale Revenue", value: results.sellRevenue },
                  { label: "Gross Profit/Loss", value: results.grossProfit, highlight: true },
                  { label: "Tax Liability", value: results.taxAmount },
                  { label: "Final Net Return", value: results.netProfit, highlight: true },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Your Investment Returns</h2>
              <p>Calculating the true profit of a stock trade involves more than just subtracting the purchase price from the selling price. Commissions and taxes can significantly eat into your returns, especially for high-frequency traders.</p>
              <h3>The Impact of Fees</h3>
              <p>While many modern brokerages offer $0 commissions, many international traders or those using specialized platforms still pay per-share or per-trade fees. These fees are added to your cost basis and subtracted from your revenue, essentially being paid out of your profit.</p>
              <h3>Taxes and the Long Game</h3>
              <p>The biggest "hidden" cost of stock trading is often taxes. By holding quality companies for more than 12 months, you move into the long-term capital gains category, which can save you 10-20% compared to short-term trading taxes.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stock-calculator" />
          <PopularCalculators exclude="/calculator/stock-calculator" />
        </div>
      </div>
    </>
  );
};

export default StockCalculator;

