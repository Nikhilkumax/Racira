"use client";
import { RotateCcw, TrendingUp, CreditCard, Wallet, Info, PieChart } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const NetWorthCalculator = () => {
  // Assets
  const [cash, setCash] = useState("15000");
  const [investments, setInvestments] = useState("120000");
  const [realEstate, setRealEstate] = useState("450000");
  const [vehicles, setVehicles] = useState("35000");
  const [otherAssets, setOtherAssets] = useState("5000");

  // Liabilities
  const [mortgage, setMortgage] = useState("320000");
  const [carLoans, setCarLoans] = useState("15000");
  const [studentLoans, setStudentLoans] = useState("25000");
  const [creditCards, setCreditCards] = useState("2000");
  const [otherDebt, setOtherDebt] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const totalAssets = (parseFloat(cash) || 0) + 
                       (parseFloat(investments) || 0) + 
                       (parseFloat(realEstate) || 0) + 
                       (parseFloat(vehicles) || 0) + 
                       (parseFloat(otherAssets) || 0);

    const totalLiabilities = (parseFloat(mortgage) || 0) + 
                            (parseFloat(carLoans) || 0) + 
                            (parseFloat(studentLoans) || 0) + 
                            (parseFloat(creditCards) || 0) + 
                            (parseFloat(otherDebt) || 0);

    const netWorth = totalAssets - totalLiabilities;

    setResults({
      totalAssets,
      totalLiabilities,
      netWorth,
      debtToAssetRatio: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0
    });
  };

  const reset = () => {
    setCash("15000");
    setInvestments("120000");
    setRealEstate("450000");
    setVehicles("35000");
    setOtherAssets("5000");
    setMortgage("320000");
    setCarLoans("15000");
    setStudentLoans("25000");
    setCreditCards("2000");
    setOtherDebt("0");
  };

  const faqs = [
    {
      question: "What is net worth?",
      answer: "Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It is the single best measure of your overall financial health and progress toward long-term wealth."
    },
    {
      question: "What counts as an asset?",
      answer: "An asset is anything of value that can be converted into cash. This includes bank accounts, stocks, bonds, retirement accounts, real estate, vehicles (using resale value), and jewelry or collectibles."
    },
    {
      question: "What counts as a liability?",
      answer: "A liability is any debt you owe to another person or institution. Common liabilities include mortgages, auto loans, student loans, credit card balances, and personal loans."
    },
    {
      question: "How often should I calculate my net worth?",
      answer: "Most financial experts recommend tracking your net worth quarterly or annually. Tracking it too frequently (daily or weekly) can be discouraging due to normal market fluctuations, while tracking it annually helps you see the long-term trend of your wealth building."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Net Worth Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Worth Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">See your complete financial picture by tracking all your assets and liabilities in one place.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-emerald-500" /> Assets (What you Own)
                  </h2>
                  <InputField id="cash" label="Cash & Bank Accounts" value={cash} onChange={setCash} prefix="$" />
                  <InputField id="investments" label="Investments (401k, Stocks)" value={investments} onChange={setInvestments} prefix="$" />
                  <InputField id="real-estate" label="Real Estate (Market Value)" value={realEstate} onChange={setRealEstate} prefix="$" />
                  <InputField id="vehicles" label="Vehicles (Resale Value)" value={vehicles} onChange={setVehicles} prefix="$" />
                  <InputField id="other-assets" label="Other Assets" value={otherAssets} onChange={setOtherAssets} prefix="$" />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-red-500" /> Liabilities (What you Owe)
                  </h2>
                  <InputField id="mortgage" label="Mortgage Balance" value={mortgage} onChange={setMortgage} prefix="$" />
                  <InputField id="car-loans" label="Auto Loans" value={carLoans} onChange={setCarLoans} prefix="$" />
                  <InputField id="student-loans" label="Student Loans" value={studentLoans} onChange={setStudentLoans} prefix="$" />
                  <InputField id="credit-cards" label="Credit Card Balances" value={creditCards} onChange={setCreditCards} prefix="$" />
                  <InputField id="other-debt" label="Other Debts" value={otherDebt} onChange={setOtherDebt} prefix="$" />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center py-12 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp className="h-48 w-48" />
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Your Total Net Worth</p>
                  <p className="text-8xl font-black text-foreground">${Math.round(results.netWorth).toLocaleString()}</p>
                  <div className="mt-6 flex justify-center gap-8">
                     <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Assets</p>
                        <p className="text-xl font-bold">${Math.round(results.totalAssets).toLocaleString()}</p>
                     </div>
                     <div className="w-px h-10 bg-border"></div>
                     <div>
                        <p className="text-[10px] font-bold text-red-600 uppercase">Total Liabilities</p>
                        <p className="text-xl font-bold">${Math.round(results.totalLiabilities).toLocaleString()}</p>
                     </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="card-calculator">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                      <PieChart className="h-4 w-4 text-primary" /> Asset Allocation
                    </h3>
                    <div className="space-y-4">
                       <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                          <div className="h-full bg-blue-500" style={{ width: `${(parseFloat(cash) / results.totalAssets) * 100}%` }}></div>
                          <div className="h-full bg-emerald-500" style={{ width: `${(parseFloat(investments) / results.totalAssets) * 100}%` }}></div>
                          <div className="h-full bg-amber-500" style={{ width: `${(parseFloat(realEstate) / results.totalAssets) * 100}%` }}></div>
                          <div className="h-full bg-indigo-500" style={{ width: `${(parseFloat(vehicles) / results.totalAssets) * 100}%` }}></div>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Cash</div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Invest</div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Estate</div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Vehicles</div>
                       </div>
                    </div>
                  </div>

                  <div className="card-calculator flex flex-col justify-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                       <Info className="h-4 w-4 text-primary" /> Debt-to-Asset Ratio
                    </h3>
                    <p className="text-4xl font-black text-foreground mb-1">{results.debtToAssetRatio.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground font-medium">Your liabilities represent {results.debtToAssetRatio.toFixed(1)}% of your total assets.</p>
                    <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                       <div className={`h-full ${results.debtToAssetRatio > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, results.debtToAssetRatio)}%` }}></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Why Your Net Worth is the Most Important Number</h2>
              <p>In a world obsessed with monthly income and fancy salaries, it's easy to forget that true wealth isn't about how much you earn—it's about how much you keep. Your net worth is a snapshot of your financial life at a single point in time, providing a clear view of your progress toward financial independence.</p>

              <h3>The Math of Wealth</h3>
              <p>The formula for net worth is brutally simple: <strong>Assets - Liabilities = Net Worth</strong>. If you earn $200,000 a year but spend $205,000, your net worth is decreasing, and you are technically becoming "poorer" each year despite your high income. Conversely, someone earning $50,000 who saves $5,000 is building wealth.</p>

              <h3>Understanding Assets</h3>
              <p>Not everything you own is an asset in the financial sense. A true asset is something that puts money in your pocket or can be sold for significant value. We categorize assets into two main groups:</p>
              <ul>
                <li><strong>Liquid Assets:</strong> Cash, savings accounts, and brokerage accounts that can be accessed quickly.</li>
                <li><strong>Illiquid Assets:</strong> Real estate, retirement accounts (with penalties), and vehicles that take time to sell or come with restrictions.</li>
              </ul>

              <h3>Managing Liabilities</h3>
              <p>Liabilities are the anchors that pull your net worth down. However, not all debt is created equal. A low-interest mortgage is often considered "good debt" because it allows you to build equity in an appreciating asset. "Bad debt," like credit card balances with 25% APR, should be eliminated as quickly as possible as it directly eats away at your future wealth.</p>

              <h3>The Power of Compounding</h3>
              <p>As your net worth grows, your assets begin to do the heavy lifting for you. When your investments earn a 7% return, a $100,000 net worth generates $7,000 a year without you lifting a finger. When your net worth reaches $1,000,000, that same 7% generates $70,000—potentially more than your actual job. This is the point of "financial crossover" where work becomes optional.</p>

              <h2>How to Grow Your Net Worth</h2>
              <ol>
                <li><strong>Automate Your Savings:</strong> Treat your savings like a bill that must be paid every month.</li>
                <li><strong>Pay Down High-Interest Debt:</strong> Every dollar of debt you pay off is a dollar added to your net worth.</li>
                <li><strong>Invest in Appreciating Assets:</strong> Shift your spending away from things that lose value (fast fashion, gadgets) and toward things that gain value (stocks, real estate, education).</li>
                <li><strong>Rebalance Annually:</strong> Use this calculator once a year to see which areas of your financial life need adjustment.</li>
              </ol>

              <h3>A Final Note on Mindset</h3>
              <p>Calculating your net worth for the first time can be intimidating, especially if the number is lower than you expected (or even negative). Remember that this is just a starting point. The goal isn't to have a perfect number today; it's to ensure that the number is higher next year than it is right now.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-worth-calculator" />
          <PopularCalculators exclude="/calculator/net-worth-calculator" />
        </div>
      </div>
    </>
  );
};

export default NetWorthCalculator;

