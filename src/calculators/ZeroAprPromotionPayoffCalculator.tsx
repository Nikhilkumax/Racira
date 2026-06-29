"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface PayoffResults {
  totalInterest: number;
  monthsToPayoff: number;
  totalPaid: number;
  balanceAtPromoEnd: number;
  monthlyRequiredForPromoPayoff: number;
  schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const calculatePayoff = (
  balance: number,
  promoMonths: number,
  standardApr: number,
  monthlyPayment: number
): PayoffResults => {
  if (balance <= 0) {
    return {
      totalInterest: 0,
      monthsToPayoff: 0,
      totalPaid: 0,
      balanceAtPromoEnd: 0,
      monthlyRequiredForPromoPayoff: 0,
      schedule: [],
    };
  }

  const monthlyRequiredForPromoPayoff = promoMonths > 0 ? balance / promoMonths : balance;
  
  let currentBalance = balance;
  let totalInterest = 0;
  let monthsToPayoff = 0;
  let totalPaid = 0;
  let balanceAtPromoEnd = 0;
  const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];

  const monthlyRate = standardApr / 100 / 12;

  // Minimum payment safeguard (e.g. 2% of balance or $25)
  const getMinPayment = (bal: number) => Math.max(25, bal * 0.02);

  while (currentBalance > 0.01 && monthsToPayoff < 1200) { // max 100 years
    monthsToPayoff++;
    let interestCharge = 0;

    if (monthsToPayoff > promoMonths) {
      interestCharge = currentBalance * monthlyRate;
    }

    let minPay = getMinPayment(currentBalance);
    let payment = Math.max(monthlyPayment, minPay);
    
    if (payment > currentBalance + interestCharge) {
      payment = currentBalance + interestCharge;
    }

    const principalPayment = payment - interestCharge;
    currentBalance -= principalPayment;
    totalInterest += interestCharge;
    totalPaid += payment;

    if (monthsToPayoff === promoMonths) {
      balanceAtPromoEnd = currentBalance;
    }

    // Only store first 120 months to avoid huge arrays if payment is tiny
    if (monthsToPayoff <= 120 || currentBalance <= 0) {
      schedule.push({
        month: monthsToPayoff,
        payment,
        principal: principalPayment,
        interest: interestCharge,
        balance: Math.max(0, currentBalance),
      });
    }
  }

  if (promoMonths >= monthsToPayoff) {
    balanceAtPromoEnd = 0;
  }

  return {
    totalInterest,
    monthsToPayoff,
    totalPaid,
    balanceAtPromoEnd: Math.max(0, balanceAtPromoEnd),
    monthlyRequiredForPromoPayoff,
    schedule,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-sm text-foreground">
        <p className="font-bold mb-1">Month {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ZeroAprPromotionPayoffCalculator() {
  const [balance, setBalance] = useState("5000");
  const [promoMonths, setPromoMonths] = useState("15");
  const [standardApr, setStandardApr] = useState("24.99");
  const [monthlyPayment, setMonthlyPayment] = useState("200");
  
  const [results, setResults] = useState<PayoffResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculatePayoff(
      parseFloat(balance) || 0,
      parseFloat(promoMonths) || 0,
      parseFloat(standardApr) || 0,
      parseFloat(monthlyPayment) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setBalance("5000");
    setPromoMonths("15");
    setStandardApr("24.99");
    setMonthlyPayment("200");
    setResults(calculatePayoff(5000, 15, 24.99, 200));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>0% APR Payoff Results</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const chartData = results?.schedule.filter((s, i) => i % Math.max(1, Math.floor(results.schedule.length / 20)) === 0 || i === results.schedule.length - 1).map(s => ({
    month: s.month,
    Balance: s.balance,
  })) || [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "0% APR Promotion Payoff Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">0% APR Promotion Payoff Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="balance"
                label="Credit Card Balance"
                value={balance}
                onChange={setBalance}
                prefix="$"
              />
              <CompactInput
                id="promo-months"
                label="0% APR Promo Duration"
                value={promoMonths}
                onChange={setPromoMonths}
                suffix="months"
              />
              <CompactInput
                id="standard-apr"
                label="Standard APR (After Promo)"
                value={standardApr}
                onChange={setStandardApr}
                suffix="%"
              />
              <CompactInput
                id="monthly-payment"
                label="Planned Monthly Payment"
                value={monthlyPayment}
                onChange={setMonthlyPayment}
                prefix="$"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="flex justify-end hidden-print">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-4 w-4" /> Print Results
                  </button>
                </div>

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Interest Paid</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${results.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    If you pay ${parseFloat(monthlyPayment).toLocaleString()} per month.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Time to Payoff</span>
                    <span className="text-lg font-bold">{results.monthsToPayoff} <span className="text-sm font-normal text-muted-foreground">mos</span></span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Balance at Promo End</span>
                    <span className={`text-lg font-bold ${results.balanceAtPromoEnd > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                      ${results.balanceAtPromoEnd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Total Amount Paid</span>
                    <span className="text-lg font-bold">${results.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Monthly Required Highlight */}
                {results.balanceAtPromoEnd > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-destructive mb-1">Warning: Balance Remaining After 0% APR Period</h4>
                      <p className="text-sm text-foreground/80">
                        To pay off your balance completely before the promotional period ends, you need to pay <strong>${results.monthlyRequiredForPromoPayoff.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> per month.
                      </p>
                    </div>
                  </div>
                )}
                {results.balanceAtPromoEnd === 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-700 mb-1">Great Job!</h4>
                      <p className="text-sm text-foreground/80">
                        Your current monthly payment will pay off the balance before the 0% APR promotion ends, saving you from paying any interest.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Balance Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `Mo ${val}`}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${val}`}
                          width={60}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="Balance" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorBalance)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-3">Payoff Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Original Balance</span>
                      <span className="font-medium">${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">0% APR Duration</span>
                      <span className="font-medium">{promoMonths} Months</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Standard APR</span>
                      <span className="font-medium">{standardApr}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Time to Payoff</span>
                      <span className="font-medium">{results.monthsToPayoff} Months</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Interest Paid</span>
                      <span className="font-medium text-destructive">${results.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-border sm:col-span-2">
                      <span className="font-semibold">Total Amount Paid</span>
                      <span className="font-bold text-primary text-base">${results.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mx-auto mt-16 prose prose-slate dark:prose-invert">
          <h2>What Is a 0% APR Promotion Payoff Calculator?</h2>
          <p>
            A 0% APR Promotion Payoff Calculator is a specialized financial tool designed for credit card users who have transferred a balance or made a large purchase under a promotional 0% interest rate. It helps you determine exactly how much you need to pay each month to eliminate your debt before the promotional period expires, ensuring you never pay a dime in interest.
          </p>
          <p>
            Many credit cards offer 12, 15, or even 21 months of 0% APR as an introductory offer. However, if the balance is not paid in full by the end of this period, the remaining amount will be subject to the standard, often high, Annual Percentage Rate (APR). In some cases, known as deferred interest promotions, failing to pay off the balance can result in being charged retroactive interest from the date of purchase.
          </p>

          <h2>How It Works</h2>
          <p>
            The mathematics behind the 0% APR payoff are relatively straightforward during the promotional period, but become standard amortization calculations once the promotion ends.
          </p>
          <p>
            <strong>To pay off during the promo period:</strong><br/>
            <code>Monthly Payment = Total Balance / Number of Promotional Months</code>
          </p>
          <p>
            If your planned monthly payment extends beyond the promotional period, the calculator applies the standard APR to the remaining balance. The formula used for interest calculation in those subsequent months is:
          </p>
          <p>
            <code>Monthly Interest = Current Balance × (Standard APR / 100 / 12)</code>
          </p>

          <h2>Understanding Your Results</h2>
          <p>
            When you use the calculator, it provides several key metrics:
          </p>
          <ul>
            <li><strong>Total Interest Paid:</strong> This shows exactly how much extra money you will pay if you don't clear the balance before the standard APR kicks in.</li>
            <li><strong>Time to Payoff:</strong> The total number of months it will take to become debt-free at your current payment rate.</li>
            <li><strong>Balance at Promo End:</strong> A crucial figure showing how much debt will be exposed to high interest rates when the 0% period concludes.</li>
            <li><strong>Required Payment:</strong> The exact monthly amount needed to guarantee zero interest charges.</li>
          </ul>

          <h2>Key Factors to Consider</h2>
          <p>
            Several variables influence your payoff strategy:
          </p>
          <ul>
            <li><strong>Minimum Payments:</strong> Simply paying the minimum amount due on your credit card statement is almost never enough to pay off a balance before a 0% promo ends. Minimum payments are usually set at 1% to 2% of the balance.</li>
            <li><strong>New Purchases:</strong> If you make new purchases on the card, your payments may be allocated to those purchases rather than the promotional balance, depending on the card issuer's rules.</li>
            <li><strong>Deferred Interest vs. 0% APR:</strong> With true 0% APR, you only pay interest on the remaining balance after the promo ends. With deferred interest (common in store financing), if you leave even $1 unpaid at the end of the promo, you are charged all the interest that would have accumulated since day one.</li>
          </ul>

          <h2>Practical Examples</h2>
          <p>
            <strong>Example 1: The Ideal Scenario</strong><br/>
            You transfer $6,000 to a card with 0% APR for 15 months. 
            Required payment = $6,000 / 15 = $400 per month.
            If you pay $400 monthly, you pay $0 in interest.
          </p>
          <p>
            <strong>Example 2: The Minimum Payment Trap</strong><br/>
            You transfer the same $6,000 but only pay $150 per month. 
            After 15 months, you have paid $2,250. 
            Your remaining balance of $3,750 is now subject to a 24.99% standard APR. It will take you another 35 months to pay off the debt, costing you over $1,500 in interest charges.
          </p>

          <h2>Tips & Best Practices</h2>
          <ul>
            <li><strong>Automate Your Payments:</strong> Once you calculate the required payment to beat the promo expiration, set up an automatic transfer for that exact amount.</li>
            <li><strong>Add a Margin of Safety:</strong> Aim to pay off the balance one or two months before the actual expiration date to account for billing cycle delays or bank holidays.</li>
            <li><strong>Read the Fine Print:</strong> Always check if your promotion is a true 0% APR or a deferred interest offer.</li>
            <li><strong>Don't Miss Payments:</strong> Missing a single payment or paying late can instantly void your 0% APR promotion and trigger a penalty APR.</li>
          </ul>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            Using a 0% APR payoff calculator empowers you to take control of your debt strategy. It removes the guesswork, showing you the exact financial reality of your current repayment plan. By visualizing the cost of carrying a balance past the promotional period, it provides the motivation and the exact mathematical roadmap needed to execute a successful balance transfer or financing strategy, potentially saving you thousands of dollars in unnecessary interest.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "What happens if I don't pay off the balance before the 0% APR ends?", answer: "If it's a standard 0% APR offer, you will begin accumulating interest on the remaining balance at your regular APR rate from that day forward. If it is a 'deferred interest' offer, you will be charged all the interest that would have accrued since the original purchase date." },
          { question: "Does my monthly payment automatically adjust to pay off the balance in time?", answer: "No. Your credit card company will only require you to make the minimum monthly payment, which is usually around 1-2% of your balance. This is rarely enough to pay off the debt during the promotional period. You must manually choose to pay the higher calculated amount." },
          { question: "Will making new purchases affect my 0% APR payoff?", answer: "Yes, it can complicate things. By law, payments above the minimum must go to the highest-interest balance first. However, the minimum payment itself might be applied to the 0% balance. It is generally best practice to not make new purchases on a card holding a 0% balance transfer." },
          { question: "Are balance transfer fees included in the 0% APR?", answer: "The balance transfer fee (typically 3% to 5%) is added to your total balance immediately. It does not accrue interest during the 0% period, but you must factor it into your total payoff amount. Be sure to enter your total starting balance *including* the fee into the calculator." },
          { question: "Can a late payment void my 0% APR promotion?", answer: "Yes. Almost all credit card agreements state that if you are 60 days late on a payment, or sometimes even just one day late, the promotional rate can be canceled and a penalty APR (often around 29.99%) will be applied immediately." },
          { question: "What is the difference between 0% APR and deferred interest?", answer: "With a true 0% APR, interest only starts growing on the remaining balance after the promo ends. With deferred interest, interest is secretly calculating in the background from day one. If the balance isn't paid in full by the end date, all that back-interest is applied to your account at once." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
