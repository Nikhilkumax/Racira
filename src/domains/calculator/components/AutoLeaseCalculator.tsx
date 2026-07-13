"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AutoLeaseResult {
  monthlyPayment: number;
  basePayment: number;
  monthlyTax: number;
  depreciationFee: number;
  financeFee: number;
  totalCost: number;
  residualValue: number;
  equivalentApr: number;
  capCost: number;
  totalInterest: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcAutoLease(price: number, downPayment: number, tradeIn: number, termMonths: number, moneyFactor: number, residualPct: number, salesTaxPct: number, fees: number): AutoLeaseResult {
  const capCost = Math.max(0, price - downPayment - tradeIn + fees);
  const residualValue = price * (residualPct / 100);
  const taxRate = salesTaxPct / 100;

  // Depreciation Fee: (Cap Cost - Residual) / Term
  const depreciationFee = termMonths > 0 ? (capCost - residualValue) / termMonths : 0;
  
  // Finance Fee (Rent Charge): (Cap Cost + Residual) * Money Factor
  const financeFee = (capCost + residualValue) * moneyFactor;
  
  const basePayment = Math.max(0, depreciationFee + financeFee);
  const monthlyTax = basePayment * taxRate;
  const monthlyPayment = basePayment + monthlyTax;

  const totalInterest = financeFee * termMonths;
  const totalCost = (monthlyPayment * termMonths) + downPayment + tradeIn + fees;
  const equivalentApr = moneyFactor * 2400;

  const pieData = [
    { name: "Monthly Depreciation", value: Math.max(0, depreciationFee) },
    { name: "Monthly Finance Fee", value: Math.max(0, financeFee) },
    { name: "Monthly Sales Tax", value: Math.max(0, monthlyTax) },
  ];

  const breakdown = [
    { label: "Vehicle MSRP / Negotiated Price", value: `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment / Trade-In", value: `-$${(downPayment + tradeIn).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Acquisition/Dealer Fees", value: `+$${fees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net Capitalized Cost", value: `$${capCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Estimated Residual Value", value: `$${residualValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Depreciation (Over Lease)", value: `$${(Math.max(0, capCost - residualValue)).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Total Monthly Payment", value: `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Base Payment (Pre-Tax)", value: `$${basePayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Equivalent APR", value: `${equivalentApr.toFixed(2)}%` },
    { label: "Total Interest (Rent Charge)", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Tax Paid", value: `$${(monthlyTax * termMonths).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Out-of-Pocket Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment, basePayment, monthlyTax, depreciationFee, financeFee, totalCost, residualValue, equivalentApr, capCost, totalInterest, pieData, breakdown, summaryStats };
}

const DEFAULTS = { price: "35000", downPayment: "2000", tradeIn: "0", termMonths: "36", moneyFactor: "0.0025", residualPct: "55", salesTaxPct: "7", fees: "595" };
const PIE_COLORS = ["#3b82f6", "#ef4444", "#f59e0b"]; 

export default function AutoLeaseCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [tradeIn, setTradeIn] = useState(DEFAULTS.tradeIn);
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [moneyFactor, setMoneyFactor] = useState(DEFAULTS.moneyFactor);
  const [residualPct, setResidualPct] = useState(DEFAULTS.residualPct);
  const [salesTaxPct, setSalesTaxPct] = useState(DEFAULTS.salesTaxPct);
  const [fees, setFees] = useState(DEFAULTS.fees);
  
  const [result, setResult] = useState<AutoLeaseResult | null>(null);

  const calculate = () => setResult(calcAutoLease(
    parseFloat(price) || 0, parseFloat(downPayment) || 0, parseFloat(tradeIn) || 0, parseFloat(termMonths) || 0, 
    parseFloat(moneyFactor) || 0, parseFloat(residualPct) || 0, parseFloat(salesTaxPct) || 0, parseFloat(fees) || 0
  ));
  
  const reset = () => { 
    setPrice(DEFAULTS.price); setDownPayment(DEFAULTS.downPayment); setTradeIn(DEFAULTS.tradeIn); setTermMonths(DEFAULTS.termMonths);
    setMoneyFactor(DEFAULTS.moneyFactor); setResidualPct(DEFAULTS.residualPct); setSalesTaxPct(DEFAULTS.salesTaxPct); setFees(DEFAULTS.fees);
    setShowAdvanced(false);
    setResult(calcAutoLease(35000, 2000, 0, 36, 0.0025, 55, 7, 595)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a Money Factor?", answer: "The money factor is how leasing companies express the interest rate on your lease. To find the equivalent APR (Annual Percentage Rate) that you are used to seeing on a car loan, simply multiply the money factor by 2,400. For example, a money factor of 0.0025 equals a 6.0% APR." },
    { question: "What is Residual Value?", answer: "Residual value is the estimated wholesale value of the vehicle at the end of the lease term, expressed as a percentage of the MSRP. A car with a $40,000 MSRP and a 60% residual value will be worth $24,000 at the end of the lease. Higher residuals mean lower monthly payments because you pay for less depreciation." },
    { question: "Should I put money down on a lease?", answer: "Most financial experts strongly advise against putting a large down payment (often called a 'capitalized cost reduction') on a lease. If the car is totaled or stolen early in the lease, your insurance pays the leasing company, and your down payment vanishes. It is financially safer to keep that cash in your bank account and make slightly higher monthly payments." },
    { question: "Can I negotiate the Residual Value?", answer: "No, the residual value is firmly set by the leasing company's bank and cannot be negotiated by the dealer. However, you absolutely can and should negotiate the initial Vehicle Price (Capitalized Cost) just as aggressively as you would if you were buying the car." },
    { question: "What are acquisition fees?", answer: "An acquisition fee (or bank fee) is an administrative charge from the leasing company to originate the lease. It typically ranges from $595 to $1,095. This is rarely negotiable, but you can usually roll it into your capitalized cost so you don't have to pay it in cash upfront." },
    { question: "How is lease sales tax calculated?", answer: "In most states, you do not pay sales tax on the entire price of the car. Instead, sales tax is calculated on your base monthly lease payment and added to your bill each month. A few states (like Texas and New York) require you to pay tax on the entire purchase price upfront, which drastically alters the math." },
    { question: "Can I buy the car at the end of the lease?", answer: "Yes, almost all closed-end leases allow you to purchase the car at the end of the term for the pre-determined Residual Value plus a small 'purchase option fee.' This is an excellent option if the car's actual market value is higher than the residual value." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Lease Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Auto Lease Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Vehicle MSRP / Negotiated Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Down Payment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Trade-In Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeIn} onChange={e => setTradeIn(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Lease Term (Months)</label><div className={inp}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={ci} /></div></div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Lease Details {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Money Factor (ex. .0025)</label><div className={inp}><input type="number" value={moneyFactor} onChange={e => setMoneyFactor(e.target.value)} step={0.0001} className={ci} /></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Residual Value (%)</label><div className={inp}><input type="number" value={residualPct} onChange={e => setResidualPct(e.target.value)} step={1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Sales Tax Rate (%)</label><div className={inp}><input type="number" value={salesTaxPct} onChange={e => setSalesTaxPct(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Acquisition Fees</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={fees} onChange={e => setFees(e.target.value)} className={ci} /></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Includes ${result.monthlyTax.toFixed(2)} in monthly sales tax</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Depreciation", `$${result.depreciationFee.toFixed(2)}/mo`], ["Rent Charge", `$${result.financeFee.toFixed(2)}/mo`], ["APR", `${result.equivalentApr.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Capitalized Cost & Residual</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Net Capitalized Cost") || r.label.includes("Total Depreciation") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Monthly Payment Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} /><Legend /></PieChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Auto Lease Calculator?</h2>
            <p>An auto lease calculator is an essential financial tool that demystifies the complex mathematics behind car leasing. Unlike a standard auto loan where you are financing the entire purchase price of a vehicle, a lease operates on a completely different framework. When you lease a car, you are essentially paying for the exact amount of value the car loses (depreciation) during the time you drive it, plus a finance charge (rent charge) and taxes. Because the vocabulary of leasing—using terms like Money Factor, Capitalized Cost, and Residual Value—is designed to be opaque, dealerships often use leasing as a way to maximize profit from uninformed buyers.</p>
            <p>This calculator strips away the dealership jargon and reveals the true cost of your lease. By independently calculating the depreciation fee, the rent charge, and the localized sales tax, it empowers you to negotiate effectively. You will no longer be negotiating a "monthly payment"—a dangerous practice that allows dealers to hide fees—but rather negotiating the raw numbers that construct that payment.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics of an auto lease rely on a specialized formula that differs entirely from loan amortization. Here is exactly how the calculator generates your monthly payment.</p>
            <p>First, it determines the <strong>Net Capitalized Cost</strong>. This is the actual amount you are financing. Formula: <code>Cap Cost = Negotiated Price + Fees - Down Payment - Trade-In</code>. Note that "Acquisition Fees" are typically rolled into this cost.</p>
            <p>Second, it calculates the <strong>Residual Value</strong>. This is what the leasing bank estimates the car will be worth at the end of the lease. Formula: <code>Residual Value = MSRP * Residual Percentage</code>. (Crucially, the residual is based on the MSRP, not your negotiated price).</p>
            <p>Third, it calculates the <strong>Monthly Depreciation Fee</strong>. This is the core of your lease payment. Formula: <code>(Cap Cost - Residual Value) / Lease Term (Months)</code>.</p>
            <p>Fourth, it calculates the <strong>Finance Fee (Rent Charge)</strong>. This is the interest the bank charges you. The formula is unusual: <code>(Cap Cost + Residual Value) * Money Factor</code>. Yes, it adds them together before multiplying by the money factor.</p>
            <p>Finally, it adds the Depreciation Fee and Finance Fee to get your <strong>Base Payment</strong>. It then multiplies the Base Payment by your local sales tax rate (in most states) to determine your final <strong>Total Monthly Payment</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you execute a calculation, the tool provides five distinct analytical sections designed to give you total visibility into the dealer's math.</p>
            <p><strong>Primary Result Card:</strong> This highlights your exact Total Monthly Payment, including taxes. This is the number you must match against the dealer's final quote.</p>
            <p><strong>3-Stat Bar:</strong> This section breaks out the raw Monthly Depreciation, the monthly Rent Charge (interest), and instantly converts the obscure Money Factor into a recognizable Annual Percentage Rate (APR).</p>
            <p><strong>Capitalized Cost & Residual Table:</strong> This acts as a transparency sheet, showing exactly how your starting loan balance was built (incorporating your down payment and fees) and how much total depreciation you are paying for over the lease term.</p>
            <p><strong>Payment Breakdown Chart:</strong> A visual pie chart that separates your monthly payment into Depreciation, Finance Fee, and Taxes. This visual instantly highlights if you are paying too much interest relative to the cost of the car.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating the most important metrics, including the total out-of-pocket cost over the entire life of the lease.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>To successfully negotiate a lease and avoid overpaying, you must understand which factors are negotiable and which are set in stone.</p>
            <p><strong>Capitalized Cost (Negotiated Price):</strong> This is highly negotiable. Just because you are leasing does not mean you pay MSRP. You should negotiate the price of the car exactly as if you were buying it with cash. A lower Cap Cost directly reduces your depreciation fee.</p>
            <p><strong>Residual Value:</strong> This is firmly set by the leasing bank (e.g., Honda Financial, BMW Financial) and is completely non-negotiable. However, knowing this allows you to shop for cars with high residual values. A car that holds its value well (high residual) will lease much cheaper than a car that loses value quickly, even if they have the same MSRP.</p>
            <p><strong>Money Factor:</strong> This is the interest rate. The bank sets a "buy rate" based on your credit score. However, dealerships are legally allowed to "mark up" the money factor to make a hidden profit. You should always convert the money factor to APR (multiply by 2400) and demand the dealer give you the base "buy rate."</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options tab is what separates this calculator from basic estimation tools, allowing for penny-perfect calculations.</p>
            <p>By inputting the <strong>Money Factor</strong> directly (e.g., 0.0025) rather than a generic APR, the calculator perfectly replicates the leasing software used in the dealer's finance office. It also allows you to manually input the <strong>Acquisition Fee</strong> (usually $595 to $1,095). Dealers almost always roll this fee into the lease, increasing your capitalized cost. By accounting for it here, your math will match theirs.</p>
            <p>Furthermore, the <strong>Sales Tax Rate</strong> input correctly calculates tax on the monthly payment (the method used by the vast majority of U.S. states), rather than taxing the entire purchase price of the vehicle, which would artificially inflate the results.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how the exact same $40,000 car can lease for two drastically different prices based on the lease structure.</p>
            <p><strong>Example 1: The Bad Lease (Dealer Markup).</strong> You lease a $40,000 car. You don't negotiate the price, so the Cap Cost is $40,000. The residual is 50% ($20,000). The dealer marks up the money factor to 0.0035 (8.4% APR). Your monthly depreciation is $555. Your monthly finance fee is $210. With a 7% tax rate, your Total Monthly Payment is a staggering $818.55.</p>
            <p><strong>Example 2: The Optimized Lease.</strong> You want the exact same $40,000 car. You negotiate the Cap Cost down to $37,000. The residual remains 50% ($20,000). You demand the base money factor of 0.0020 (4.8% APR). Your monthly depreciation drops to $472. Your monthly finance fee drops to $114. With 7% tax, your Total Monthly Payment is $627.02. By understanding the math, you save nearly $200 a month on the exact same vehicle.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Leasing can be a smart financial tool if done correctly, but it is fraught with traps. Follow these best practices.</p>
            <p>First, the golden rule of leasing: <strong>Never put money down</strong> (Cap Cost Reduction). If you put $5,000 down to lower your monthly payment, and the car is totaled in a crash two months later, your insurance company will pay the leasing bank the value of the car, and your $5,000 is gone forever. Keep the $5,000 in your bank account and use it to subsidize the slightly higher monthly payment.</p>
            <p>Second, always check lease hacking forums before you go to the dealership. Websites dedicated to leasing will publish the exact residual values and base money factors for the current month. If you know the math before you walk in, the dealer cannot mark it up.</p>
            <p>Third, understand your mileage needs. A standard lease is 10,000 or 12,000 miles per year. If you know you drive 15,000 miles, negotiate a high-mileage lease upfront. The residual value will drop slightly, raising your monthly payment, but it will be significantly cheaper than paying the exorbitant $0.25 per mile overage penalty at the end of the lease.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Utilizing a comprehensive auto lease calculator levels the playing field against professional dealership finance managers. It transitions you from a vulnerable buyer negotiating a "monthly payment" to an educated consumer negotiating the raw data.</p>
            <p>By forcing the dealer to reveal the Money Factor, the Capitalized Cost, and the Residual Value, you can plug those numbers into this tool and verify their honesty instantly. This calculator ensures you never pay hidden markups, prevents you from making risky down payments, and ultimately guarantees you secure the absolute best lease deal possible for your new vehicle.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-lease-calculator" />
          <PopularCalculators exclude="/calculator/auto-lease-calculator" />
        </div>
      </div>
    </>
  );
}
