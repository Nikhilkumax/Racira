"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BoatLoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
  payoffDate: string;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBoatLoan(price: number, downPayment: number, tradeIn: number, rate: number, termYears: number, salesTax: number, fees: number): BoatLoanResult {
  const taxableAmount = Math.max(0, price - tradeIn);
  const taxAmount = (taxableAmount * salesTax) / 100;
  const loanAmount = Math.max(0, price - downPayment - tradeIn + taxAmount + fees);
  
  const r = rate / 100 / 12;
  const n = termYears * 12;
  
  const monthlyPayment = loanAmount > 0 && r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount > 0 && n > 0 ? loanAmount / n : 0;
  const totalInterest = Math.max(0, (monthlyPayment * n) - loanAmount);
  const totalCost = price + totalInterest + taxAmount + fees;
  
  const payoffDateObj = new Date();
  payoffDateObj.setMonth(payoffDateObj.getMonth() + n);
  const payoffDate = payoffDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const pieData = [
    { name: "Principal (Loan)", value: loanAmount },
    { name: "Total Interest", value: totalInterest },
  ];

  const breakdown = [
    { label: "Boat Price", value: `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Trade-In Value", value: `-$${tradeIn.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `-$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Sales Tax", value: `+$${taxAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Dealer/Registration Fees", value: `+$${fees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Financed Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost to Purchase", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Interest/Loan Ratio", value: loanAmount > 0 ? `${((totalInterest / loanAmount) * 100).toFixed(1)}%` : "0%" },
  ];

  return { monthlyPayment, totalInterest, totalCost, loanAmount, payoffDate, pieData, breakdown, summaryStats };
}

const DEFAULTS = { price: "45000", downPayment: "5000", tradeIn: "0", rate: "7.5", termYears: "10", salesTax: "6", fees: "500" };
const PIE_COLORS = ["#3b82f6", "#ef4444"]; 

export default function BoatLoanCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [tradeIn, setTradeIn] = useState(DEFAULTS.tradeIn);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salesTax, setSalesTax] = useState(DEFAULTS.salesTax);
  const [fees, setFees] = useState(DEFAULTS.fees);
  
  const [result, setResult] = useState<BoatLoanResult | null>(null);

  const calculate = () => setResult(calcBoatLoan(
    parseFloat(price) || 0, parseFloat(downPayment) || 0, parseFloat(tradeIn) || 0, parseFloat(rate) || 0, parseFloat(termYears) || 0, parseFloat(salesTax) || 0, parseFloat(fees) || 0
  ));
  
  const reset = () => { 
    setPrice(DEFAULTS.price); setDownPayment(DEFAULTS.downPayment); setTradeIn(DEFAULTS.tradeIn); setRate(DEFAULTS.rate); setTermYears(DEFAULTS.termYears);
    setSalesTax(DEFAULTS.salesTax); setFees(DEFAULTS.fees); setShowAdvanced(false);
    setResult(calcBoatLoan(45000, 5000, 0, 7.5, 10, 6, 500)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a typical interest rate for a boat loan?", answer: "Boat loan interest rates generally range from 6% to 15%. Because boats are considered luxury, depreciating assets, rates are often slightly higher than auto loans. Your exact rate depends on your credit score, the boat's age, and the loan amount." },
    { question: "How long can I finance a boat for?", answer: "Boat loans often have much longer terms than car loans. While 5 to 7 years is common for smaller boats, loans for larger vessels and yachts can extend to 10, 15, or even 20 years, functioning more like a mortgage." },
    { question: "Do boat loans require a down payment?", answer: "Yes, almost all lenders require a down payment for a boat loan, typically ranging from 10% to 20% of the purchase price. A larger down payment can help secure a lower interest rate and prevent you from going 'upside down' on the loan." },
    { question: "Is boat loan interest tax-deductible?", answer: "In some specific cases, yes. If your boat has sleeping quarters, a galley (cooking facility), and a head (toilet), the IRS may classify it as a 'second home.' If so, you might be able to deduct the loan interest on your federal taxes, subject to limits." },
    { question: "What are common hidden costs when buying a boat?", answer: "When financing a boat, you must also budget for sales tax, registration fees, marine insurance (which can be expensive), docking/mooring fees, maintenance, and winterization. These are not included in the loan but drastically affect affordability." },
    { question: "Can I finance a used boat?", answer: "Yes, you can finance a used boat. However, lenders often charge higher interest rates for used vessels and may restrict financing to boats under a certain age (e.g., less than 15 years old). Many will also require a professional marine survey before approval." },
    { question: "What happens if I pay off my boat loan early?", answer: "Paying off your boat loan early saves you money on interest. However, you should check your loan agreement for a 'prepayment penalty.' Some lenders charge a fee if you pay off the loan before a specified time, though this is becoming less common." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Boat Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Boat Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Boat Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Down Payment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Trade-In Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeIn} onChange={e => setTradeIn(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Loan Term (Years)</label><div className={inp}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={ci} /></div></div>
            </div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Sales Tax</label><div className={inp}><input type="number" value={salesTax} onChange={e => setSalesTax(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Dealer Fees</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={fees} onChange={e => setFees(e.target.value)} className={ci} /></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Loan Amount: ${result.loanAmount.toLocaleString()} · Payoff: {result.payoffDate}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Loan", `$${result.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Cost", `$${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Total Financed") || r.label.includes("Total Cost") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Principal vs Interest</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} /><Legend /></PieChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Boat Loan Calculator?</h2>
            <p>A boat loan calculator is an essential financial tool designed specifically for marine financing. Purchasing a boat—whether it’s a small fishing vessel, a pontoon, or a luxury yacht—represents a significant capital expenditure. Unlike automotive loans, which typically span 3 to 7 years, boat loans operate in a unique space between auto loans and home mortgages, with terms frequently stretching from 10 to 20 years. This calculator helps prospective boat owners model different purchasing scenarios by factoring in the boat's price, down payment, trade-in value, interest rate, and term length. It goes beyond a simple monthly payment calculation by integrating critical out-the-door costs such as state sales tax and dealer registration fees, providing a transparent view of the true cost of boat ownership.</p>
            <p>Using this calculator allows you to confidently set a budget before visiting a marine dealership or negotiating with a private seller. By understanding the long-term amortization schedule and total interest accumulation, you can avoid the common trap of shopping based purely on a "monthly payment" and instead focus on securing the best overall financial deal for your nautical dreams.</p>

            <h2>How It Works</h2>
            <p>The mathematics behind the boat loan calculator rely on standard loan amortization formulas, combined with state-specific tax logic. Here is the exact calculation process the tool uses to generate your results.</p>
            <p>First, the calculator determines your <strong>Taxable Amount</strong>. In most states, if you trade in a vessel, you only pay sales tax on the difference between the new boat price and the trade-in value. Formula: <code>Taxable Amount = Boat Price - Trade-In Value</code>.</p>
            <p>Next, it calculates the <strong>Total Loan Amount</strong>. This is the actual principal balance you will finance. It subtracts your cash down payment and trade-in, but adds back the calculated sales tax and any dealer or registration fees. Formula: <code>Loan Amount = Boat Price - Down Payment - Trade-In + Sales Tax + Dealer Fees</code>.</p>
            <p>Finally, it applies the amortization formula to determine the <strong>Monthly Payment</strong>. Formula: <code>M = P [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]</code>, where P is the Loan Amount, r is the monthly interest rate (annual rate divided by 12), and n is the total number of months in the loan term. The calculator then multiplies the monthly payment by the term length to determine the Total Cost and Total Interest paid to the bank.</p>

            <h2>Understanding Your Results</h2>
            <p>Once you enter your variables and click calculate, the tool generates five distinct analytical components to help you understand your marine loan.</p>
            <p><strong>Primary Result Card:</strong> This highlights your exact Monthly Payment. This is the critical number you must fit into your monthly household budget alongside your mortgage, utilities, and groceries.</p>
            <p><strong>3-Stat Bar:</strong> This provides a quick snapshot of the three most important macro numbers: the Total Loan Amount (what you owe the bank on day one), the Total Interest (the bank's profit over the life of the loan), and the Total Cost (the absolute sum of all money leaving your pocket).</p>
            <p><strong>Loan Breakdown Table:</strong> This is a line-by-line accounting of how your loan amount was constructed. It acts exactly like a dealer's buyer's order, showing how taxes and fees inflate the base price, and how your down payment and trade-in reduce the burden.</p>
            <p><strong>Principal vs. Interest Chart:</strong> This visual pie chart dramatically illustrates the cost of financing. For long-term loans (15-20 years), you will often see the interest slice of the pie consume 30% to 50% of the chart. It is a stark reminder of the cost of long-term borrowing.</p>
            <p><strong>Summary Statistics:</strong> This section aggregates the final data, including your estimated payoff date and the Interest/Loan Ratio, which tells you exactly how much interest you are paying relative to the principal borrowed.</p>

            <h2>Key Factors</h2>
            <p>Several critical variables will dictate the affordability of your boat loan. Understanding how lenders view these factors is key to getting approved at a favorable rate.</p>
            <p><strong>Down Payment:</strong> Marine lenders are notoriously conservative. While you might buy a car with zero down, most boat loans require a minimum of 10% to 20% down. A larger down payment significantly reduces your monthly payment, decreases your total interest, and protects you from negative equity (being "upside down") if you need to sell the boat early.</p>
            <p><strong>Loan Term Length:</strong> This is the most dangerous variable in boat financing. Stretching a loan to 15 or 20 years makes the monthly payment incredibly attractive, but it causes total interest to skyrocket. Furthermore, boats depreciate. If you finance a boat for 20 years, it is highly likely that for the first 5 to 7 years, you will owe the bank far more than the boat is actually worth on the open market.</p>
            <p><strong>Credit Score and History:</strong> Because a boat is a discretionary luxury asset, lenders require higher credit scores than they do for essential assets like cars or homes. A tier-one credit score (typically 740+) is usually required to secure the advertised promotional interest rates.</p>
            <p><strong>Age and Condition of the Vessel:</strong> Lenders prefer new boats and offer the best rates and longest terms for them. If you are buying a used boat, the interest rate will likely be higher. Furthermore, if the boat is over 10-15 years old, many traditional banks will refuse to finance it altogether, forcing you to seek out specialized marine lenders.</p>

            <h2>Advanced Features</h2>
            <p>Our boat loan calculator includes an Advanced Options toggle designed to provide a highly accurate "out-the-door" calculation, replicating a dealer's finance office.</p>
            <p>By entering your local <strong>Sales Tax</strong> percentage, the calculator automatically computes the tax burden. Crucially, it applies the tax <em>after</em> the trade-in value is deducted (which is the law in most states), saving you from overestimating your tax bill. It also allows you to roll the sales tax directly into the loan amount, which is standard practice.</p>
            <p>The <strong>Dealer Fees</strong> input allows you to account for registration, title, doc fees, and freight/prep charges. On a new boat, freight and prep can easily add thousands of dollars to the advertised price. By including these in the calculator, you get a true representation of the final amount you will need to finance.</p>

            <h2>Practical Examples</h2>
            <p>To illustrate the massive impact of loan term length on your finances, let's look at two scenarios for buying the exact same boat.</p>
            <p><strong>Example 1: The Aggressive Payoff.</strong> You agree to buy a $60,000 wakeboard boat. You put $10,000 down and finance $50,000 at a 7.5% interest rate for a short term of <strong>5 years (60 months)</strong>. Your monthly payment is high at $1,001.90. However, over the 5 years, you pay only $10,114 in total interest. The total cost of the loan (principal + interest) is $60,114. By year 3, you have significant positive equity in the boat.</p>
            <p><strong>Example 2: The Long-Term Stretch.</strong> You buy the exact same $60,000 boat, put $10,000 down, and finance $50,000 at 7.5%. But this time, to get a lower payment, you choose a <strong>15-year (180 months)</strong> term. Your monthly payment drops beautifully to just $463.51. It seems like a great deal. However, over 15 years, you will pay a staggering $33,432 in interest. The total cost of the loan becomes $83,432. For the first 7 years of this loan, you will owe more than the boat is worth.</p>

            <h2>Tips & Best Practices</h2>
            <p>Navigating the marine finance world requires caution. Keep these best practices in mind before signing loan documents.</p>
            <p>First, always get pre-approved from an independent bank or credit union before walking into a marine dealership. Dealerships often mark up the interest rate (a practice called holding points) to make a profit on the financing. Having a pre-approval in hand forces the dealer to beat your rate, saving you thousands.</p>
            <p>Second, be extraordinarily wary of 15 and 20-year loan terms on depreciating assets. If you must stretch the loan to 20 years just to afford the monthly payment, the harsh mathematical reality is that you cannot afford the boat. Aim to finance boats for no longer than 10 years.</p>
            <p>Third, remember that the loan payment is only a fraction of the cost of ownership. Industry experts suggest budgeting an additional 10% of the boat's purchase price <em>annually</em> for insurance, maintenance, slip fees, winter storage, and fuel. A $500 loan payment often requires a true monthly budget of $1,000 when all operational costs are factored in.</p>

            <h2>Benefits</h2>
            <p>Utilizing a comprehensive boat loan calculator transforms an emotional purchase into a rational financial decision. Boats are inherently emotional buys—they represent family time, recreation, and freedom. It is incredibly easy to let the excitement of a boat show blind you to the math.</p>
            <p>By running the numbers through this calculator, you strip away the sales pitch and confront the reality of the amortization schedule. You will know exactly how much interest the bank is charging you, when the boat will actually be paid off, and whether the true out-the-door cost aligns with your long-term wealth-building goals. This clarity allows you to buy the boat of your dreams without accidentally sinking your financial future.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boat-loan-calculator" />
          <PopularCalculators exclude="/calculator/boat-loan-calculator" />
        </div>
      </div>
    </>
  );
}
