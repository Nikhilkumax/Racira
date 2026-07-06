"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import { Calculator, RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface BalanceTransferInputs {
  balance: number;
  currentApr: number;
  transferFee: number;
  promoApr: number;
  promoPeriod: number;
  monthlyPayment: number;
  postPromoApr: number;
}

interface BalanceTransferResults {
  upfrontFee: number;
  totalInterestOld: number;
  totalInterestNew: number;
  monthsToPayOld: number;
  monthsToPayNew: number;
  netSavings: number;
  breakEvenMonths: number;
  chartData: Array<{ month: number; currentBalance: number; newBalance: number }>;
  isImpossibleOld: boolean;
  isImpossibleNew: boolean;
}

// 2. Pure Calculation Function
const calculateBalanceTransfer = (inputs: BalanceTransferInputs): BalanceTransferResults => {
  const bal = inputs.balance;
  const oldRate = inputs.currentApr / 100 / 12;
  const fee = inputs.transferFee / 100;
  const promoRate = inputs.promoApr / 100 / 12;
  const postRate = inputs.postPromoApr / 100 / 12;
  const period = inputs.promoPeriod;
  const pay = inputs.monthlyPayment;

  if (bal <= 0 || pay <= 0) {
    return {
      upfrontFee: 0,
      totalInterestOld: 0,
      totalInterestNew: 0,
      monthsToPayOld: 0,
      monthsToPayNew: 0,
      netSavings: 0,
      breakEvenMonths: 0,
      chartData: [],
      isImpossibleOld: false,
      isImpossibleNew: false
    };
  }

  // Check if minimum payment is met for old card
  const isImpossibleOld = pay <= (bal * oldRate);

  const upfrontFee = bal * fee;
  const newBalance = bal + upfrontFee;

  let currentBal = bal;
  let monthsToPayOld = 0;
  let totalInterestOld = 0;
  
  let transferBal = newBalance;
  let monthsToPayNew = 0;
  let totalInterestNew = 0;

  const chartData = [{ month: 0, currentBalance: bal, newBalance: newBalance }];
  
  const MAX_MONTHS = 360; // Limit to 30 years to prevent infinite loops

  // Calculate Old debt timeline
  if (!isImpossibleOld) {
    while (currentBal > 0 && monthsToPayOld < MAX_MONTHS) {
      const interest = currentBal * oldRate;
      totalInterestOld += interest;
      currentBal = currentBal + interest - pay;
      if (currentBal < 0) currentBal = 0;
      monthsToPayOld++;
    }
  }

  // Check if minimum payment is met for new card post-promo
  let isImpossibleNew = false;
  
  // Calculate New debt timeline (during promo)
  for (let m = 1; m <= period && transferBal > 0; m++) {
    const interest = transferBal * promoRate;
    totalInterestNew += interest;
    transferBal = transferBal + interest - pay;
    if (transferBal < 0) transferBal = 0;
    monthsToPayNew++;
    
    // Only add to chart if old balance is also tracked up to this point or we want to show it finishing
    chartData.push({ 
      month: monthsToPayNew, 
      currentBalance: isImpossibleOld ? bal : 0, // Will be updated below
      newBalance: Math.round(transferBal) 
    });
  }

  // After promo (assuming it reverts to postRate)
  if (transferBal > 0 && pay <= (transferBal * postRate)) {
    isImpossibleNew = true;
  } else {
    while (transferBal > 0 && monthsToPayNew < MAX_MONTHS) {
      const interest = transferBal * postRate;
      totalInterestNew += interest;
      transferBal = transferBal + interest - pay;
      if (transferBal < 0) transferBal = 0;
      monthsToPayNew++;
      
      chartData.push({ 
        month: monthsToPayNew, 
        currentBalance: 0, // Will be updated below
        newBalance: Math.round(transferBal) 
      });
    }
  }

  // Update chart data with old balance timeline
  currentBal = bal;
  for (let m = 1; m <= Math.max(monthsToPayOld, monthsToPayNew) && m < MAX_MONTHS; m++) {
    if (!isImpossibleOld && currentBal > 0) {
      const interest = currentBal * oldRate;
      currentBal = currentBal + interest - pay;
      if (currentBal < 0) currentBal = 0;
    }
    
    // Ensure we have a chart point
    if (!chartData[m]) {
      chartData[m] = { month: m, currentBalance: 0, newBalance: 0 };
    }
    chartData[m].currentBalance = isImpossibleOld ? Math.round(bal) : Math.round(currentBal);
  }

  const netSavings = isImpossibleOld ? 0 : totalInterestOld - (totalInterestNew + upfrontFee);
  
  // Simplified break even: when upfront fee equals interest saved so far
  let breakEvenMonths = 0;
  if (oldRate > promoRate) {
    breakEvenMonths = upfrontFee / (bal * (oldRate - promoRate));
  }

  return {
    upfrontFee,
    totalInterestOld,
    totalInterestNew,
    monthsToPayOld: isImpossibleOld ? -1 : monthsToPayOld,
    monthsToPayNew: isImpossibleNew ? -1 : monthsToPayNew,
    netSavings: isImpossibleOld ? 0 : netSavings,
    breakEvenMonths: breakEvenMonths > 0 ? breakEvenMonths : 0,
    chartData,
    isImpossibleOld,
    isImpossibleNew
  };
};

// 3. Realistic Industry Standard Defaults
const DEFAULTS = {
  balance: "5000",
  currentApr: "24.9",
  transferFee: "3",
  promoApr: "0",
  promoPeriod: "18",
  monthlyPayment: "300",
  postPromoApr: "24.9"
};

const BalanceTransferCalculator = () => {
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [currentApr, setCurrentApr] = useState(DEFAULTS.currentApr);
  const [transferFee, setTransferFee] = useState(DEFAULTS.transferFee);
  const [promoApr, setPromoApr] = useState(DEFAULTS.promoApr);
  const [promoPeriod, setPromoPeriod] = useState(DEFAULTS.promoPeriod);
  const [monthlyPayment, setMonthlyPayment] = useState(DEFAULTS.monthlyPayment);
  const [postPromoApr, setPostPromoApr] = useState(DEFAULTS.postPromoApr);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<BalanceTransferResults | null>(null);

  const performCalculation = () => {
    const inputs: BalanceTransferInputs = {
      balance: parseFloat(balance) || 0,
      currentApr: parseFloat(currentApr) || 0,
      transferFee: parseFloat(transferFee) || 0,
      promoApr: parseFloat(promoApr) || 0,
      promoPeriod: parseInt(promoPeriod) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      postPromoApr: parseFloat(postPromoApr) || 0
    };
    setResults(calculateBalanceTransfer(inputs));
  };

  useEffect(() => {
    performCalculation();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    performCalculation();
  };

  const reset = () => {
    setBalance(DEFAULTS.balance);
    setCurrentApr(DEFAULTS.currentApr);
    setTransferFee(DEFAULTS.transferFee);
    setPromoApr(DEFAULTS.promoApr);
    setPromoPeriod(DEFAULTS.promoPeriod);
    setMonthlyPayment(DEFAULTS.monthlyPayment);
    setPostPromoApr(DEFAULTS.postPromoApr);
    setShowAdvanced(false);
    setTimeout(() => {
      performCalculation();
    }, 0);
  };

  const faqs = [
    { question: "What is a balance transfer?", answer: "A balance transfer is a credit card transaction where you move high-interest debt from one or more credit cards to a new card with a lower interest rate, often a 0% introductory APR. This allows you to pay down the principal faster since more of your monthly payment goes toward the balance rather than interest." },
    { question: "How much is a balance transfer fee?", answer: "Most credit card issuers charge a balance transfer fee, which is typically between 3% and 5% of the total amount transferred. For example, transferring $5,000 with a 3% fee would cost $150." },
    { question: "Is a balance transfer worth it?", answer: "A balance transfer is worth it if the amount you save in interest over the promotional period is significantly higher than the transfer fee. It's most effective if you can pay off the entire balance before the 0% APR period expires." },
    { question: "Will a balance transfer affect my credit score?", answer: "Yes, but often in a positive way over the long term. Opening a new card may cause a small, temporary dip due to the hard inquiry and lower average account age, but the new credit limit will lower your overall credit utilization ratio, which is a major factor in your credit score." },
    { question: "What happens if I don't pay off the balance before the promo ends?", answer: "If you carry a balance past the promotional period, the interest rate will revert to the standard 'go-to' rate (e.g., 24.99%). You will begin accruing interest on the remaining balance from that day forward. It is crucial to set a monthly payment high enough to eliminate the debt before this happens." },
    { question: "Can I transfer a balance between cards from the same bank?", answer: "Generally, no. Banks do not allow internal balance transfers (e.g., moving debt from a Chase Freedom to a Chase Slate). You typically need to apply for a card from a different financial institution." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Finance", href: "/finance" }, { label: "Balance Transfer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight text-foreground">Balance Transfer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <InputField id="balance" label="Current Balance ($)" value={balance} onChange={setBalance} type="number" />
              <InputField id="current-apr" label="Current Interest Rate (APR, %)" value={currentApr} onChange={setCurrentApr} type="number" step="0.1" />
              <InputField id="monthly-pay" label="Planned Monthly Payment ($)" value={monthlyPayment} onChange={setMonthlyPayment} type="number" />
              
              <div className="border-t pt-3 mt-1">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Balance Transfer Offer Details
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showAdvanced && (
                  <div className="grid gap-3 mt-3">
                    <InputField id="fee" label="Transfer Fee (%)" value={transferFee} onChange={setTransferFee} type="number" step="0.1" />
                    <InputField id="promo-apr" label="Promotional APR (%)" value={promoApr} onChange={setPromoApr} type="number" step="0.1" />
                    <InputField id="period" label="Promo Period (Months)" value={promoPeriod} onChange={setPromoPeriod} type="number" />
                    <InputField id="post-apr" label="Post-Promo APR (%)" value={postPromoApr} onChange={setPostPromoApr} type="number" step="0.1" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="h-10 w-full bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">Calculate</button>
                <button type="button" onClick={reset} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground" aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && !results.isImpossibleOld && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5 relative">
                  <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">Total Estimated Savings</p>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${Math.round(results.netSavings).toLocaleString()}</p>
                  <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-1">Net savings after paying the ${results.upfrontFee.toLocaleString()} transfer fee</p>
                  <button className="absolute top-4 right-4 p-2 rounded-md hover:bg-emerald-500/20 text-emerald-600 transition-colors" title="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 bg-card border border-border rounded-lg overflow-hidden divide-x divide-border">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">New Payoff Time</p>
                    <p className="text-lg font-bold">{results.monthsToPayNew} Months</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Old Payoff Time</p>
                    <p className="text-lg font-bold">{results.monthsToPayOld} Months</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Time Saved</p>
                    <p className="text-lg font-bold text-emerald-500">{results.monthsToPayOld - results.monthsToPayNew} Months</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">Financial Breakdown</h3>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Initial Balance</td>
                            <td className="py-2.5 px-4 text-right font-medium">${parseFloat(balance).toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Upfront Transfer Fee</td>
                            <td className="py-2.5 px-4 text-right font-medium text-amber-500">+ ${results.upfrontFee.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Interest Paid (New Card)</td>
                            <td className="py-2.5 px-4 text-right font-medium text-red-500">${results.totalInterestNew.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                          <tr className="bg-muted/10 border-y-2 border-border">
                            <td className="py-3 px-4 font-bold">Total Cost of Transfer</td>
                            <td className="py-3 px-4 text-right font-bold text-foreground">${(results.upfrontFee + results.totalInterestNew).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Interest Paid (Old Card)</td>
                            <td className="py-2.5 px-4 text-right font-medium text-red-500">${results.totalInterestOld.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-muted-foreground w-full text-center mb-2">Debt Payoff Trajectory</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={results.chartData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorOld" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `$${value/1000}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            labelFormatter={(label) => `Month ${label}`}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="currentBalance" name="Current Card" stroke="#ef4444" fillOpacity={1} fill="url(#colorOld)" />
                          <Area type="monotone" dataKey="newBalance" name="Transfer Card" stroke="#2563eb" fillOpacity={1} fill="url(#colorNew)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-3">Key Takeaways</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Promo Period Utilization:</div>
                    <div className="font-medium text-right">
                      {results.monthsToPayNew <= parseFloat(promoPeriod) 
                        ? <span className="text-emerald-500">Paid off before promo ends</span>
                        : <span className="text-red-500">Will carry balance post-promo</span>}
                    </div>
                    <div className="text-muted-foreground">Break-even Point:</div>
                    <div className="font-medium text-right">
                      {results.breakEvenMonths > 0 ? `${results.breakEvenMonths.toFixed(1)} months` : 'Immediate'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {results && results.isImpossibleOld && (
              <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5">
                <p className="text-lg font-bold text-red-600 mb-2">Warning: Payment Too Low</p>
                <p className="text-sm text-foreground">Your planned monthly payment of ${monthlyPayment} is less than the monthly interest generated by your current APR. You will never pay off this debt under current settings. Please increase your monthly payment to see savings.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-8" />
          <article className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2 className="text-2xl font-bold mb-3">What Is a Balance Transfer Calculator?</h2>
            <p>
              A <strong>Balance Transfer Calculator</strong> is a strategic financial tool used to determine whether shifting high-interest credit card debt to a new credit card with a promotional 0% APR (Annual Percentage Rate) will actually save you money. 
            </p>
            <p>
              Credit card debt is notoriously expensive, with average APRs frequently exceeding 24%. When you are trapped in this cycle, the vast majority of your monthly payment goes toward simply treading water—paying the interest—rather than reducing the principal balance. A balance transfer allows you to pause the interest clock, but it is rarely free. This calculator analyzes the friction costs (transfer fees) against the projected interest savings to give you a definitive answer on whether a transfer is a smart financial move.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Mathematical Model Works</h2>
            <p>
              Calculating the true value of a balance transfer requires running two parallel amortization schedules. We do not use generic estimates; our calculator mathematically simulates every payment month-by-month.
            </p>
            <p>
              <strong>Scenario 1: Staying the Course.</strong> First, the calculator determines how many months it will take to pay off your existing balance at your current APR, given your specified monthly payment. It sums up every dollar of interest you will pay over that timeline.
              <br />
              <strong>Scenario 2: Executing the Transfer.</strong> Next, the calculator applies the upfront balance transfer fee directly to your principal. (For example, a $5,000 transfer with a 3% fee results in a new starting balance of $5,150). It then runs the amortization schedule for this new balance at 0% interest for the duration of the promotional period. If a balance remains after the promo expires, the calculator seamlessly shifts to the post-promo APR to finish the simulation.
            </p>
            <p>
              The <strong>Net Savings</strong> is derived by subtracting the total cost of Scenario 2 (Upfront Fee + Any Post-Promo Interest) from the total cost of Scenario 1 (Current Total Interest).
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              Our right-hand panel provides a comprehensive suite of metrics designed to give you total clarity over your debt payoff journey:
            </p>
            <ul>
              <li><strong>Total Estimated Savings:</strong> The exact dollar amount you will retain in your pocket by executing the transfer. This figure already has the transfer fee subtracted from it.</li>
              <li><strong>Payoff Timeline:</strong> A side-by-side comparison of how many months it will take to become debt-free under the new card versus the old card.</li>
              <li><strong>Financial Breakdown Table:</strong> A transparent ledger showing the upfront costs and the total interest generated under both scenarios.</li>
              <li><strong>Debt Payoff Trajectory Chart:</strong> A visual representation of your declining balance over time. You will notice the blue line (Transfer) drops much steeper than the red line (Current) because 100% of your payment is attacking the principal during the 0% period.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Key Factors That Influence Balance Transfers</h2>
            <p>
              Three main variables dictate the success of a balance transfer strategy:
            </p>
            <p>
              <strong>1. The Transfer Fee:</strong> Almost all balance transfer cards charge an upfront fee, usually between 3% and 5%. If you are transferring $10,000, a 5% fee instantly adds $500 to your debt. You must save at least $500 in interest to break even.
            </p>
            <p>
              <strong>2. The Promotional Period:</strong> Offers generally range from 12 to 21 months. A longer promotional period gives you a wider window to attack the principal without accruing interest.
            </p>
            <p>
              <strong>3. Your Monthly Payment:</strong> A 0% APR offer is useless if you only make the minimum payments. The goal is to aggressively pay down the balance. To find the optimal monthly payment, divide your total transfer balance (including the fee) by the number of promotional months.
            </p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features: Post-Promotional APR</h2>
            <p>
              Many consumers fail to pay off their entire balance before the 0% promotional period ends. Our calculator includes a "Post-Promo APR" field in the Advanced Options to simulate exactly what happens if you carry a balance into month 19 or 22. When the promo ends, the interest rate often skyrockets back to standard credit card levels. The calculator accurately models this jump, ensuring you have realistic expectations of your long-term costs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples of Balance Transfers</h2>
            <p>
              Let's look at a realistic scenario. You have $8,000 in debt at 24.9% APR. You plan to pay $400 a month.
            </p>
            <p>
              <strong>Without a Transfer:</strong> It will take you 27 months to pay off the debt, and you will pay $2,347 in interest.
            </p>
            <p>
              <strong>With a Transfer:</strong> You move the $8,000 to a card with a 15-month 0% APR and a 3% fee ($240). Your new balance is $8,240. Paying $400 a month, you will eliminate the debt in just 21 months. You pay zero interest, only the $240 fee.
              <br/>
              <strong>Net Savings:</strong> You save 6 months of your life and $2,107 in cash.
            </p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices for Getting Out of Debt</h2>
            <p>
              <strong>Do Not Use the Old Card:</strong> The fatal flaw of a balance transfer is freeing up the credit limit on your old card and immediately running up new debt. Put the old card in a drawer or cut it up.
            </p>
            <p>
              <strong>Set Up Auto-Pay:</strong> If you miss a payment or pay late during your promotional period, the credit card company reserves the right to immediately revoke your 0% APR status and apply a penalty APR (often upwards of 29.99%). Set up auto-pay to guarantee this never happens.
            </p>
            <p>
              <strong>Avoid New Purchases on the Transfer Card:</strong> The 0% APR usually only applies to the transferred balance. If you make new purchases on the card, those purchases will accrue interest at the regular rate, creating an accounting nightmare.
            </p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using Our Calculator</h2>
            <p>
              Financial institutions rely on consumers misunderstanding the math behind balance transfer fees and post-promotional rates. By using our robust algorithmic calculator, you take the guesswork out of debt repayment. The interactive charts and precise amortization schedules empower you to mathematically verify that a transfer is beneficial, allowing you to execute a disciplined strategy to achieve financial freedom.
            </p>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balance-transfer-calculator" />
          <PopularCalculators exclude="/calculator/balance-transfer-calculator" />
        </div>
      </div>
    </>
  );
};

export default BalanceTransferCalculator;
