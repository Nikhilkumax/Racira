"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const RentVsBuyCalculator = () => {
  // Buy Inputs
  const [homePrice, setHomePrice] = useState("450000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [insuranceAnnual, setInsuranceAnnual] = useState("1800");
  const [maintenanceAnnualPct, setMaintenanceAnnualPct] = useState("1");
  const [appreciationRate, setAppreciationRate] = useState("3");
  const [sellingCostPct, setSellingCostPct] = useState("6");

  // Rent Inputs
  const [monthlyRent, setMonthlyRent] = useState("2500");
  const [rentersInsurance, setRentersInsurance] = useState("20");
  const [rentIncreaseRate, setRentIncreaseRate] = useState("3");
  const [investmentReturn, setInvestmentReturn] = useState("7");

  const [years, setYears] = useState("10");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(homePrice) || 0;
    const DP_pct = (parseFloat(downPaymentPct) || 0) / 100;
    const DP = P * DP_pct;
    const loanAmount = P - DP;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseFloat(loanTerm) || 0) * 12;
    
    const monthlyEMI = r > 0 
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

    const numYears = parseInt(years) || 10;
    
    let totalBuyCost = DP; // Start with down payment
    let currentHomeValue = P;
    let remainingLoan = loanAmount;
    let totalInterest = 0;
    let totalTax = 0;
    let totalInsurance = 0;
    let totalMaintenance = 0;

    // Rent side
    let currentRent = parseFloat(monthlyRent) || 0;
    let totalRentCost = 0;
    let investmentBalance = DP; // Renting allows investing the down payment

    for (let i = 1; i <= numYears * 12; i++) {
      // Buy calculations
      const interestPayment = remainingLoan * r;
      const principalPayment = monthlyEMI - interestPayment;
      remainingLoan -= principalPayment;
      totalInterest += interestPayment;
      
      if (i % 12 === 0) {
        totalTax += currentHomeValue * ((parseFloat(propertyTaxRate) || 0) / 100);
        totalInsurance += parseFloat(insuranceAnnual) || 0;
        totalMaintenance += currentHomeValue * ((parseFloat(maintenanceAnnualPct) || 0) / 100);
        currentHomeValue *= (1 + (parseFloat(appreciationRate) || 0) / 100);
      }

      // Rent calculations
      totalRentCost += currentRent + (parseFloat(rentersInsurance) || 0);
      investmentBalance *= (1 + (parseFloat(investmentReturn) || 0) / 100 / 12);
      
      if (i % 12 === 0) {
        currentRent *= (1 + (parseFloat(rentIncreaseRate) || 0) / 100);
      }
    }

    const buyEquity = currentHomeValue - remainingLoan;
    const buySellingCosts = currentHomeValue * ((parseFloat(sellingCostPct) || 0) / 100);
    const netBuyValue = buyEquity - buySellingCosts;
    const netBuyCost = (totalBuyCost + (monthlyEMI * numYears * 12) + totalTax + totalInsurance + totalMaintenance) - netBuyValue;

    const netRentCost = totalRentCost - (investmentBalance - DP);

    setResults({
      netBuyCost,
      netRentCost,
      buyEquity,
      currentHomeValue,
      remainingLoan,
      totalInterest,
      totalTax,
      totalRentCost,
      investmentBalance,
      betterOption: netBuyCost < netRentCost ? "Buying" : "Renting",
      difference: Math.abs(netBuyCost - netRentCost)
    });
  };

  const reset = () => {
    setShowResults(false);
    setHomePrice("450000");
    setDownPaymentPct("20");
    setInterestRate("6.5");
    setLoanTerm("30");
    setResults(null);
  };

  const faqs = [
    { question: "Is it better to rent or buy a home?", answer: "The decision depends on how long you plan to stay, local market conditions, and your financial goals. Buying typically builds equity and offers tax benefits, while renting provides flexibility and avoids maintenance costs. Our calculator helps compare the total cost of both over your expected stay." },
    { question: "What is the 5% rule for rent vs buy?", answer: "The 5% rule suggests that the unrecoverable costs of homeownership (property tax, maintenance, and capital costs) average about 5% of the home's value annually. If monthly rent is less than 5% of the home price divided by 12, renting might be cheaper. However, this is just a rule of thumb; a detailed calculator is more accurate." },
    { question: "How does appreciation affect the rent vs buy decision?", answer: "Home appreciation is a major benefit of buying. Even a 3% annual appreciation can add hundreds of thousands in equity over a decade. If homes in your area are appreciating rapidly, buying becomes significantly more attractive despite high interest rates." },
    { question: "What are the hidden costs of buying a home?", answer: "Beyond the mortgage, owners pay property taxes, homeowners insurance, maintenance (typically 1% of home value annually), and selling costs (5-6%) when they eventually move. Renters avoid these but also miss out on the appreciation of the asset." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rent vs Buy" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rent vs Buy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">Buying Parameters</h3>
                  <InputField id="homePrice" label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
                  <InputField id="downPayment" label="Down Payment %" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" />
                  <InputField id="interestRate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                  <InputField id="years" label="Time Horizon (Years)" value={years} onChange={setYears} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">Renting Parameters</h3>
                  <InputField id="monthlyRent" label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
                  <InputField id="rentIncrease" label="Annual Rent Increase" value={rentIncreaseRate} onChange={setRentIncreaseRate} suffix="%" />
                  <InputField id="investmentReturn" label="Investment Return" value={investmentReturn} onChange={setInvestmentReturn} suffix="%" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-3">Conclusion: {results.betterOption} is likely better</h2>
                  <p className="text-muted-foreground">Estimated difference: <span className="font-bold text-primary">${Math.round(results.difference).toLocaleString()}</span> over {years} years</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <h4 className="font-bold mb-2">Buy Scenario</h4>
                    <p className="text-sm text-muted-foreground">Net Cost: <span className="text-foreground font-medium">${Math.round(results.netBuyCost).toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground">Home Value: <span className="text-foreground font-medium">${Math.round(results.currentHomeValue).toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground">Equity: <span className="text-foreground font-medium">${Math.round(results.buyEquity).toLocaleString()}</span></p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <h4 className="font-bold mb-2">Rent Scenario</h4>
                    <p className="text-sm text-muted-foreground">Net Cost: <span className="text-foreground font-medium">${Math.round(results.netRentCost).toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground">Total Rent Paid: <span className="text-foreground font-medium">${Math.round(results.totalRentCost).toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground">Invested DP Growth: <span className="text-foreground font-medium">${Math.round(results.investmentBalance).toLocaleString()}</span></p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – Sidebar" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Renting vs. Buying: Which is the Smart Move?</h2>
              <p>The "rent vs buy" debate is one of the most significant financial decisions you'll ever face. While the American Dream often emphasizes homeownership, the math doesn't always favor buying—especially in high-interest environments or expensive markets.</p>
              <h3>When Buying Wins</h3>
              <p>Buying usually becomes the better option if you plan to stay in the home for 7 years or longer. This allows time for the home's appreciation to outweigh the high upfront closing costs and the interest-heavy early years of a mortgage. Additionally, buying acts as a forced savings plan by building equity through principal payments.</p>
              <h3>When Renting Wins</h3>
              <p>Renting is often better if you prioritize mobility or have a short time horizon (less than 5 years). It also allows you to invest your down payment capital into the stock market, which historically often yields higher returns than real estate appreciation. Renting is also a "predictable" cost, as the landlord is responsible for all maintenance, taxes, and insurance.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rent-vs-buy-calculator" />
          <PopularCalculators exclude="/calculator/rent-vs-buy-calculator" />
        </div>
      </div>
    </>
  );
};

export default RentVsBuyCalculator;

