"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Building, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface TradeInResults {
  tradeInValue: number;
  dealerMarginAmount: number;
  taxSavings: number;
  totalEffectiveValue: number;
  netProceeds: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateTradeIn = (inputs: typeof DEFAULTS): TradeInResults => {
  const privatePartyValue = parseFloat(inputs.privatePartyValue) || 0;
  const condition = inputs.condition as "excellent" | "good" | "fair" | "poor";
  const amountOwed = parseFloat(inputs.amountOwed) || 0;
  
  // Advanced
  const dealerMarginPct = parseFloat(inputs.dealerMarginPct) / 100 || 0.15;
  const salesTaxRate = parseFloat(inputs.salesTaxRate) / 100 || 0;

  if (privatePartyValue <= 0) {
    return {
      tradeInValue: 0, dealerMarginAmount: 0, taxSavings: 0, totalEffectiveValue: 0, netProceeds: 0, chartData: [],
      isError: true, errorMsg: "Private party value must be greater than zero."
    };
  }

  // 1. Dealer Margin (They buy below market value to sell at market value)
  // Base margin is adjusted by condition.
  // Dealers want higher margins on poor condition cars due to repair risk.
  let marginMultiplier = dealerMarginPct;
  if (condition === "excellent") marginMultiplier -= 0.03; // They might accept a 12% margin
  else if (condition === "good") marginMultiplier += 0;
  else if (condition === "fair") marginMultiplier += 0.05; // 20% margin
  else if (condition === "poor") marginMultiplier += 0.15; // 30% margin to cover huge risks

  const dealerMarginAmount = privatePartyValue * marginMultiplier;
  let tradeInValue = privatePartyValue - dealerMarginAmount;
  if (tradeInValue < 500) tradeInValue = 500; // Minimum scrap value

  // 2. Tax Savings
  // In many states, trading in a car reduces the taxable amount of the NEW car.
  // So a $10k trade-in saves you $700 in sales tax (at 7%).
  const taxSavings = tradeInValue * salesTaxRate;

  // 3. Total Effective Value
  // The true financial benefit of trading it in (Value + Tax Savings)
  const totalEffectiveValue = tradeInValue + taxSavings;

  // 4. Net Proceeds (Cash to you / applied to new loan)
  // If you owe money, the dealer pays off the loan first.
  const netProceeds = tradeInValue - amountOwed;

  // Chart Data: Comparing Private Party vs Trade-In
  const chartData = [
    { name: "Private Party Sale", value: privatePartyValue, color: "#3b82f6" },
    { name: "Dealer Trade-In Offer", value: tradeInValue, color: "#10b981" },
    { name: "Effective Value (w/ Tax Savings)", value: totalEffectiveValue, color: "#8b5cf6" }
  ];

  return {
    tradeInValue,
    dealerMarginAmount,
    taxSavings,
    totalEffectiveValue,
    netProceeds,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  privatePartyValue: "20000",
  condition: "good",
  amountOwed: "15000",
  // Advanced
  dealerMarginPct: "15",
  salesTaxRate: "7.0"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TradeInValueCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TradeInResults>(calculateTradeIn(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateTradeIn(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTradeIn(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "Why is a Trade-In offer always lower than Private Party value?", answer: "Dealerships are businesses that exist to make a profit. If your car is worth $20,000 on the open market, the dealer cannot give you $20,000 for it, because they must re-sell it at $20,000. They must offer you less (usually 15-20% less) to cover the costs of inspecting, repairing, detailing, advertising, and finally earning a profit margin when they sell it on their used lot." },
    { question: "How does the 'Tax Savings' work?", answer: "In most US states, if you trade in a vehicle while purchasing a new one, you only pay sales tax on the DIFFERENCE in price. If you buy a $40,000 car and trade in a $15,000 car, you only pay sales tax on $25,000. If your state tax rate is 7%, that trade-in just saved you $1,050 in cash. This tax benefit significantly closes the gap between a lowball dealer offer and a high private party sale." },
    { question: "What if I owe more than the trade-in is worth?", answer: "If you owe $20,000 on your loan but the dealer only offers you $15,000, you have $5,000 of 'Negative Equity.' The dealer will take your car, but they will add that $5,000 debt onto your NEW car loan. You do not get out of the debt; you just shift it to the next vehicle. Our 'Net Proceeds' metric shows you exactly how much cash equity you are bringing to the new deal (or how much debt)." },
    { question: "How does vehicle condition affect the dealer's margin?", answer: "Dealers take on risk when they buy your car. If your car is in 'Excellent' condition, their risk of discovering a catastrophic engine failure during inspection is low, so they will accept a smaller profit margin to secure the inventory. If your car is in 'Poor' condition, they know they will have to spend thousands repairing it before they can legally sell it, so they will demand a massive 30%+ profit margin to cover that risk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Trade-In Value Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trade-In Value Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="pp-value" label="Estimated Private Party Value" value={inputs.privatePartyValue} onChange={(v: string) => handleChange("privatePartyValue", v)} prefix="$" tooltip="What you could sell it for yourself on Craigslist or Facebook Marketplace." />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="condition" label="Actual Vehicle Condition" value={inputs.condition} onChange={(v: string) => handleChange("condition", v)} options={[
                { label: "Excellent (Flawless, requires zero prep)", value: "excellent" },
                { label: "Good (Normal wear, needs a wash)", value: "good" },
                { label: "Fair (Needs tires, brakes, or minor paint)", value: "fair" },
                { label: "Poor (Mechanical issues, check engine light)", value: "poor" }
              ]} />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Your Loan Status</div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="owed" label="Amount Owed on Current Loan" value={inputs.amountOwed} onChange={(v: string) => handleChange("amountOwed", v)} prefix="$" tooltip="Enter 0 if the car is completely paid off." />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Tax & Margins) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="margin" label="Base Dealer Margin" value={inputs.dealerMarginPct} onChange={(v: string) => handleChange("dealerMarginPct", v)} suffix="%" tooltip="Average dealer markup is 15-20%." />
                  <CompactInput id="tax-rate" label="State Sales Tax Rate" value={inputs.salesTaxRate} onChange={(v: string) => handleChange("salesTaxRate", v)} suffix="%" tooltip="Used to calculate the tax savings of trading in." />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Building className="h-4 w-4" /> Calculate Trade-In
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Dealer Offer</div>
                  <div className="text-5xl font-bold text-primary mb-1">
                    {formatCurrency(results.tradeInValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Expect the initial dealer offer to be lower. Use this number as your firm negotiation target.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Private Sale Val</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{formatCurrency(parseFloat(inputs.privatePartyValue))}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tax Savings</div>
                    <div className="text-lg font-bold text-[#10b981]">+{formatCurrency(results.taxSavings)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Net Cash to You</div>
                    <div className={`text-lg font-bold ${results.netProceeds < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {results.netProceeds < 0 ? '-' : ''}{formatCurrency(Math.abs(results.netProceeds))}
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Sale Method Comparison</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={130} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">If your state offers tax savings, the "Effective Value" is the true financial benefit of trading it in.</p>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Equity Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Dealer Trade-In Offer</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.tradeInValue)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Amount Owed to Bank</span>
                      <span className="font-medium text-red-500">-{formatCurrency(parseFloat(inputs.amountOwed))}</span>
                    </div>
                    
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Net Cash / Equity</span>
                      <span className={results.netProceeds < 0 ? 'text-destructive' : 'text-primary'}>
                        {results.netProceeds < 0 ? '-' : '+'}{formatCurrency(Math.abs(results.netProceeds))}
                      </span>
                    </div>

                    {results.netProceeds < 0 && (
                      <div className="px-4 py-2 bg-destructive/10 text-xs font-semibold text-destructive">
                        WARNING: You have negative equity. If you trade this car in, {formatCurrency(Math.abs(results.netProceeds))} of debt will be added to your NEW car loan.
                      </div>
                    )}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is a Trade-In Value Calculator?</h2>
            <p>A Trade-In Value Calculator is a financial modeling tool that estimates exactly how much a dealership is willing to pay you for your used car. While most people know what their car is roughly worth on the open market (Private Party Value), dealership math operates differently. Dealerships are not buying your car to use it; they are buying it to re-sell it for a profit. This calculator reverse-engineers the dealership's profit margin and risk-assessment logic to provide you with a realistic negotiation target before you ever step foot on the lot.</p>

            <h2>The Dealership Profit Margin</h2>
            <p>The core mechanic of a trade-in is the <strong>Dealer Margin</strong>. If your car is worth $20,000 to a normal buyer, a dealer cannot pay you $20,000 for it. They must pay you less (typically 15% to 20% less) so they can cover the costs of inspecting it, detailing it, repairing any hidden issues, and paying their salespeople, while still making a profit when they sell it. The worse the condition of your car, the higher the profit margin the dealer will demand, because they are taking on massive mechanical risk by buying a broken car.</p>

            <h2>The Hidden Power of Tax Savings</h2>
            <p>In the vast majority of US states, trading in a car at a dealership provides a massive, hidden financial benefit: <strong>Sales Tax Reduction</strong>. When you trade in a vehicle, you only pay sales tax on the <em>difference</em> between the new car and your trade-in. For example, if your state tax rate is 7% and you trade in a $15,000 car, you instantly save $1,050 in cash on the new car purchase. This tax benefit is often large enough to entirely erase the "loss" you took by accepting the lower dealer offer instead of selling it privately.</p>

            <h2>Dealing with Loans and Negative Equity</h2>
            <p>If you still owe money on the car you are trading in, the dealer handles the payoff for you. Our <strong>Net Cash / Equity</strong> metric shows exactly how much money will actually go toward your new car. If you owe more on the loan than the dealer offers you for the trade-in, you have <strong>Negative Equity</strong> (being underwater). The dealer will happily take your car, but they will take that negative balance and roll it onto your new car loan, drastically increasing your new monthly payment.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Tax Advantage.</strong> John has a car worth $20,000 private party. The dealer offers him $17,000. He is angry and wants to sell it himself. But John lives in a state with 8% sales tax. By trading it in for $17,000, he avoids paying 8% tax on $17,000 of his new car purchase, saving him $1,360. His "Effective Value" is actually $18,360. Considering the hassle, time, and danger of selling a $20,000 car to a stranger on Craigslist, the trade-in offer is actually mathematically superior.</p>
            <p><strong>Example 2: The Negative Equity Trap.</strong> Sarah wants a new SUV. She trades in her sedan. The private party value is $15,000, and the dealer offers her $12,500. However, Sarah owes $18,000 to the bank. Because the offer is $12,500 and the debt is $18,000, she has -$5,500 in net equity. She does not receive any money for her trade-in; instead, the dealer adds $5,500 of pure debt to the loan of her new SUV.</p>

            <h2>Tips & Best Practices</h2>
            <p>Never tell the salesperson you are trading in a vehicle until <em>after</em> you have successfully negotiated the final, out-the-door price of the new car. Dealerships often use the "Four Square" negotiation tactic, manipulating the price of the new car, the trade-in value, and the interest rate simultaneously to confuse you. Negotiate the new car price first. Then, pull out the keys to your old car and say, "I'd like to see what you will offer for a trade-in." Treat it as two completely separate financial transactions.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/trade-in-value-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
