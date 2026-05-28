"use client";
import { RotateCcw, CreditCard, ArrowRightLeft, TrendingDown } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const BalanceTransferCalculator = () => {
  const [balance, setBalance] = useState("5000");
  const [currentApr, setCurrentApr] = useState("24.9");
  const [transferFee, setTransferFee] = useState("3");
  const [promoApr, setPromoApr] = useState("0");
  const [promoPeriod, setPromoPeriod] = useState("18");
  const [monthlyPayment, setMonthlyPayment] = useState("300");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const bal = parseFloat(balance) || 0;
    const oldRate = (parseFloat(currentApr) || 0) / 100 / 12;
    const fee = (parseFloat(transferFee) || 0) / 100;
    const newRate = (parseFloat(promoApr) || 0) / 100 / 12;
    const period = parseInt(promoPeriod) || 0;
    const pay = parseFloat(monthlyPayment) || 0;

    if (bal <= 0 || pay <= 0) return;

    // Cost of transfer
    const upfrontFee = bal * fee;
    const newBalance = bal + upfrontFee;

    // Current debt timeline
    let currentBal = bal;
    let monthsToPayOld = 0;
    let totalInterestOld = 0;
    while (currentBal > 0 && monthsToPayOld < 600) {
      const interest = currentBal * oldRate;
      totalInterestOld += interest;
      currentBal = currentBal + interest - pay;
      monthsToPayOld++;
    }

    // New debt timeline (during promo)
    let transferBal = newBalance;
    let monthsToPayNew = 0;
    let totalInterestNew = 0;
    
    // During promo
    for (let m = 1; m <= period && transferBal > 0; m++) {
      const interest = transferBal * newRate;
      totalInterestNew += interest;
      transferBal = transferBal + interest - pay;
      monthsToPayNew++;
    }

    // After promo (assuming it reverts to old rate)
    while (transferBal > 0 && monthsToPayNew < 600) {
      const interest = transferBal * oldRate;
      totalInterestNew += interest;
      transferBal = transferBal + interest - pay;
      monthsToPayNew++;
    }

    const netSavings = totalInterestOld - (totalInterestNew + upfrontFee);

    setResults({
      upfrontFee,
      totalInterestOld,
      totalInterestNew,
      monthsToPayOld,
      monthsToPayNew,
      netSavings,
      breakEvenMonths: upfrontFee / (bal * oldRate)
    });
  };

  const reset = () => {
    setBalance("5000");
    setCurrentApr("24.9");
    setTransferFee("3");
    setPromoApr("0");
    setPromoPeriod("18");
    setMonthlyPayment("300");
  };

  const faqs = [
    {
      question: "What is a balance transfer?",
      answer: "A balance transfer is a credit card transaction where you move high-interest debt from one or more credit cards to a new card with a lower interest rate, often a 0% introductory APR. This allows you to pay down the principal faster since more of your monthly payment goes toward the balance rather than interest."
    },
    {
      question: "How much is a balance transfer fee?",
      answer: "Most credit card issuers charge a balance transfer fee, which is typically between 3% and 5% of the total amount transferred. For example, transferring $5,000 with a 3% fee would cost $150."
    },
    {
      question: "Is a balance transfer worth it?",
      answer: "A balance transfer is worth it if the amount you save in interest over the promotional period is significantly higher than the transfer fee. It's most effective if you can pay off the entire balance before the 0% APR period expires."
    },
    {
      question: "Will a balance transfer affect my credit score?",
      answer: "Yes, but often in a positive way over the long term. Opening a new card may cause a small, temporary dip due to the hard inquiry and lower average account age, but the new credit limit will lower your overall credit utilization ratio, which is a major factor in your credit score."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Balance Transfer Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Balance Transfer Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Compare your current credit card debt to a balance transfer offer and see exactly how much you could save.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" /> Current Debt
                  </h2>
                  <InputField id="balance" label="Current Balance" value={balance} onChange={setBalance} prefix="$" />
                  <InputField id="current-apr" label="Current APR (%)" value={currentApr} onChange={setCurrentApr} suffix="%" step="0.1" />
                  <InputField id="monthly-pay" label="Monthly Payment" value={monthlyPayment} onChange={setMonthlyPayment} prefix="$" tooltip="The amount you plan to pay each month." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <ArrowRightLeft className="h-5 w-5 text-primary" /> Transfer Offer
                  </h2>
                  <InputField id="fee" label="Transfer Fee (%)" value={transferFee} onChange={setTransferFee} suffix="%" />
                  <InputField id="promo-apr" label="Promo APR (%)" value={promoApr} onChange={setPromoApr} suffix="%" />
                  <InputField id="period" label="Promo Period" value={promoPeriod} onChange={setPromoPeriod} suffix="mo" />
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
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Net Savings</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.netSavings).toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase">After {transferFee}% Transfer Fee</p>
                  </div>
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Payoff Timeline</p>
                    <p className="text-5xl font-black text-foreground">{results.monthsToPayNew} mo</p>
                    <p className="text-xs text-primary mt-2 font-bold uppercase">vs {results.monthsToPayOld} mo currently</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingDown className="h-5 w-5 text-primary" /> Savings Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Upfront Transfer Fee", value: results.upfrontFee },
                    { label: "Total Interest (Current)", value: results.totalInterestOld },
                    { label: "Total Interest (Transfer)", value: results.totalInterestNew },
                    { label: "Break-Even Point", value: 0, textValue: `${results.breakEvenMonths.toFixed(1)} months` },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Is a Balance Transfer Right for You?</h2>
              <p>A balance transfer can be a life-saving financial move for anyone struggling with high-interest credit card debt. By moving your debt to a card with a 0% introductory APR, you effectively pause the interest charges, allowing 100% of your monthly payment to chip away at the principal balance.</p>

              <h3>How to Calculate the Real Savings</h3>
              <p>While 0% interest sounds great, it isn't completely free. Most lenders charge a <strong>Balance Transfer Fee</strong>, which is added to your new balance immediately. To see if it's worth it, you must subtract this fee from the total interest you would have paid on your old card. This calculator does that math for you automatically.</p>

              <h3>The 'Trap' of Balance Transfers</h3>
              <p>Balance transfers are a tool, not a solution. The biggest mistake borrowers make is continuing to spend on their old cards after transferring the balance. This results in even more debt. To succeed, you should:</p>
              <ul>
                <li><strong>Stop New Spending:</strong> Lock away or cut up the old cards while you are in the payoff phase.</li>
                <li><strong>Set Autopay:</strong> Never miss a payment, as a single late payment can void your 0% APR offer.</li>
                <li><strong>Beat the Clock:</strong> Aim to pay the entire balance before the promo period (e.g., 18 months) ends and the interest rate spikes back up.</li>
              </ul>

              <h3>Understanding the Fine Print</h3>
              <p>Before you apply for a transfer card, check these three things:</p>
              <ol>
                <li><strong>The 'Go-To' Rate:</strong> What will the APR be after the promo ends? It might be even higher than your current rate.</li>
                <li><strong>The Credit Limit:</strong> You might not be approved for a limit high enough to transfer your entire balance.</li>
                <li><strong>Internal Transfers:</strong> Most banks will not allow you to transfer a balance between two cards they both issue (e.g., you can't transfer from one Chase card to another Chase card).</li>
              </ol>

              <h3>Alternatives to Balance Transfers</h3>
              <p>If you have a very high balance or a credit score that won't qualify you for a new card, consider:</p>
              <ul>
                <li><strong>Personal Loans:</strong> Often have lower fixed rates than credit cards and no upfront transfer fees.</li>
                <li><strong>Debt Management Plans:</strong> Non-profit agencies can sometimes negotiate lower rates with your current creditors.</li>
                <li><strong>The Snowball Method:</strong> Focus on paying off the smallest balances first to build momentum.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balance-transfer-calculator" />
          <PopularCalculators exclude="/calculator/balance-transfer-calculator" />
        </div>
      </div>
    </>
  );
};

export default BalanceTransferCalculator;

