"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface Election83bResults {
  taxAtGrantWith83b: number;
  taxAtVestWithout83b: number;
  totalTaxWith83b: number;
  totalTaxWithout83b: number;
  netSavings: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculate83b = (inputs: typeof DEFAULTS): Election83bResults => {
  const numShares = parseFloat(inputs.numShares);
  const currentFmv = parseFloat(inputs.currentFmv);
  const pricePaid = parseFloat(inputs.pricePaid);
  const expectedFmvVest = parseFloat(inputs.expectedFmvVest);
  const expectedFmvSale = parseFloat(inputs.expectedFmvSale);
  const ordinaryTaxRate = parseFloat(inputs.ordinaryTaxRate) / 100;
  const capitalGainsRate = parseFloat(inputs.capitalGainsRate) / 100;

  if ([numShares, currentFmv, pricePaid, expectedFmvVest, expectedFmvSale, ordinaryTaxRate, capitalGainsRate].some(v => isNaN(v) || v < 0)) {
    return { taxAtGrantWith83b: 0, taxAtVestWithout83b: 0, totalTaxWith83b: 0, totalTaxWithout83b: 0, netSavings: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }

  // SCENARIO 1: WITH 83(b) ELECTION
  // Taxed on the difference between FMV at grant and price paid at ordinary income rates
  const spreadAtGrant = Math.max(0, currentFmv - pricePaid);
  const taxableIncomeAtGrantWith83b = spreadAtGrant * numShares;
  const taxAtGrantWith83b = taxableIncomeAtGrantWith83b * ordinaryTaxRate;

  // No tax at vesting with 83(b).
  // At sale, taxed on difference between Sale Price and Grant FMV at long-term capital gains rates (assuming held > 1 year).
  const capitalGainsWith83b = Math.max(0, (expectedFmvSale - currentFmv) * numShares);
  const capitalGainsTaxWith83b = capitalGainsWith83b * capitalGainsRate;
  
  const totalTaxWith83b = taxAtGrantWith83b + capitalGainsTaxWith83b;

  // SCENARIO 2: WITHOUT 83(b) ELECTION
  // No tax at grant.
  // Taxed at vesting on the difference between FMV at vest and price paid at ordinary income rates.
  const spreadAtVest = Math.max(0, expectedFmvVest - pricePaid);
  const taxableIncomeAtVestWithout83b = spreadAtVest * numShares;
  const taxAtVestWithout83b = taxableIncomeAtVestWithout83b * ordinaryTaxRate;

  // At sale, taxed on difference between Sale Price and Vesting FMV at long-term capital gains rates.
  const capitalGainsWithout83b = Math.max(0, (expectedFmvSale - expectedFmvVest) * numShares);
  const capitalGainsTaxWithout83b = capitalGainsWithout83b * capitalGainsRate;

  const totalTaxWithout83b = taxAtVestWithout83b + capitalGainsTaxWithout83b;

  const netSavings = totalTaxWithout83b - totalTaxWith83b;

  // Chart data
  const chartData = [
    {
      name: "With 83(b) Election",
      "Ordinary Income Tax": Math.round(taxAtGrantWith83b),
      "Capital Gains Tax": Math.round(capitalGainsTaxWith83b),
    },
    {
      name: "Without 83(b) (Standard)",
      "Ordinary Income Tax": Math.round(taxAtVestWithout83b),
      "Capital Gains Tax": Math.round(capitalGainsTaxWithout83b),
    }
  ];

  const schedule = [
    { event: "At Grant", with83b: taxAtGrantWith83b, without83b: 0 },
    { event: "At Vesting", with83b: 0, without83b: taxAtVestWithout83b },
    { event: "At Sale", with83b: capitalGainsTaxWith83b, without83b: capitalGainsTaxWithout83b },
    { event: "Total Tax Paid", with83b: totalTaxWith83b, without83b: totalTaxWithout83b },
  ];

  return {
    taxAtGrantWith83b: Math.round(taxAtGrantWith83b),
    taxAtVestWithout83b: Math.round(taxAtVestWithout83b),
    totalTaxWith83b: Math.round(totalTaxWith83b),
    totalTaxWithout83b: Math.round(totalTaxWithout83b),
    netSavings: Math.round(netSavings),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  numShares: "100000",
  currentFmv: "0.10",
  pricePaid: "0.01",
  expectedFmvVest: "2.00",
  expectedFmvSale: "10.00",
  ordinaryTaxRate: "35",
  capitalGainsRate: "15",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function Election83bCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<Election83bResults>(calculate83b(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculate83b(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculate83b(DEFAULTS));
  };

  const faqs = [
    { question: "What is an 83(b) election?", answer: "An 83(b) election is a provision under the Internal Revenue Code that gives an employee or startup founder the option to pay taxes on the total fair market value of restricted stock at the time of granting, rather than at the time of vesting." },
    { question: "Why would I file an 83(b) election?", answer: "By filing an 83(b) election when the stock value is low (e.g., at the founding of a company), you lock in the ordinary income tax at a minimal amount. When the stock vests and is eventually sold, the subsequent gains are taxed at the generally lower long-term capital gains rate instead of the higher ordinary income tax rate." },
    { question: "What is the deadline for filing an 83(b) election?", answer: "The IRS strictly enforces a 30-day deadline. You must file your 83(b) election with the IRS within 30 days of the date the restricted stock is granted to you. There are no exceptions." },
    { question: "What are the risks of an 83(b) election?", answer: "The primary risk is if the company fails or the stock price drops below the grant price. If you leave the company before the stock vests and forfeit the shares, you cannot claim a tax deduction or refund for the taxes already paid upon grant." },
    { question: "Does an 83(b) election apply to stock options?", answer: "No. An 83(b) election generally only applies to restricted stock or early-exercised stock options (where you exercise the option to buy unvested shares). It does not apply to standard unexercised ISOs or NSOs." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "83(b) Election Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">83(b) Election Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Estimate potential tax savings from filing an 83(b) election on restricted stock.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="numShares" label="Number of Shares" value={inputs.numShares} onChange={(v: string) => handleChange("numShares", v)} />
              <CompactInput id="pricePaid" label="Price Paid Per Share" value={inputs.pricePaid} onChange={(v: string) => handleChange("pricePaid", v)} prefix="$" />
              <CompactInput id="currentFmv" label="Grant FMV Per Share" value={inputs.currentFmv} onChange={(v: string) => handleChange("currentFmv", v)} prefix="$" />
              <CompactInput id="expectedFmvVest" label="Expected FMV at Vesting" value={inputs.expectedFmvVest} onChange={(v: string) => handleChange("expectedFmvVest", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Advanced Tax & Sale Options</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="expectedFmvSale" label="Expected FMV at Sale" value={inputs.expectedFmvSale} onChange={(v: string) => handleChange("expectedFmvSale", v)} prefix="$" />
                  <div className="col-span-2 md:col-span-1" />
                  <CompactInput id="ordinaryTaxRate" label="Ordinary Income Tax Rate" value={inputs.ordinaryTaxRate} onChange={(v: string) => handleChange("ordinaryTaxRate", v)} suffix="%" />
                  <CompactInput id="capitalGainsRate" label="Long-Term Cap Gains Rate" value={inputs.capitalGainsRate} onChange={(v: string) => handleChange("capitalGainsRate", v)} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm ${results.netSavings > 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Tax with 83(b)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.totalTaxWith83b.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Tax without 83(b)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-foreground tracking-tighter">${results.totalTaxWithout83b.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tax Savings</div>
                    <div className={`text-2xl font-bold ${results.netSavings > 0 ? 'text-emerald-500' : (results.netSavings < 0 ? 'text-destructive' : 'text-foreground')}`}>
                      {results.netSavings > 0 ? '+' : (results.netSavings < 0 ? '-' : '')}${Math.abs(results.netSavings).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tax Paid Now</div>
                    <div className="text-2xl font-bold text-destructive">${results.taxAtGrantWith83b.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Gain at Sale</div>
                    <div className="text-2xl font-bold text-foreground">
                      ${((parseFloat(inputs.expectedFmvSale) * parseFloat(inputs.numShares)) - (parseFloat(inputs.pricePaid) * parseFloat(inputs.numShares))).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Tax Comparison Breakdown</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Bar dataKey="Ordinary Income Tax" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 4, 4]} maxBarSize={60} />
                        <Bar dataKey="Capital Gains Tax" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Tax Event Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Event</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">With 83(b) Election</th>
                          <th className="px-4 py-3 font-semibold text-right">Without 83(b)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row, idx) => (
                          <tr key={row.event} className={`hover:bg-muted/20 transition-colors ${idx === 3 ? 'bg-muted/10 font-bold border-t-2 border-border' : ''}`}>
                            <td className="px-4 py-3 text-foreground font-medium">{row.event}</td>
                            <td className="px-4 py-3 text-right text-primary">${row.with83b.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${row.without83b.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an 83(b) Election?</h2>
            <p>An 83(b) election is a letter you send to the Internal Revenue Service (IRS) informing them that you'd like to be taxed on your equity, such as restricted stock, on the date the equity was granted to you rather than on the date the equity vests. This provision under Section 83(b) of the Internal Revenue Code is particularly popular among startup founders and early employees who receive stock when the company's valuation is very low.</p>
            
            <h2>How It Works</h2>
            <p>By default, the IRS taxes restricted stock as ordinary income at the time it vests. The taxable amount is the Fair Market Value (FMV) of the stock on the vesting date minus the amount you paid for it. With an 83(b) election, you choose to be taxed at the time of the grant based on the current FMV. Since early-stage startups often have an FMV close to $0 (or equal to the nominal purchase price), the initial tax burden is negligible.</p>
            
            <h2>Understanding Your Results</h2>
            <p>The <strong>Total Tax with 83(b)</strong> represents your initial ordinary income tax paid at grant plus the long-term capital gains tax paid when you eventually sell the stock. The <strong>Total Tax without 83(b)</strong> represents the ordinary income tax paid at vesting (when the stock has theoretically increased in value) plus capital gains on any further increase. The <strong>Tax Savings</strong> highlights the potential net financial benefit of locking in the lower valuation at grant and paying the lower capital gains rate on subsequent appreciation.</p>
            
            <h2>Key Factors</h2>
            <p>The primary driver of the tax savings is the difference between your Ordinary Income Tax Rate (which can be as high as 37% federally plus state taxes) and the Long-Term Capital Gains Rate (typically 15% or 20%). The larger the expected increase in the stock's Fair Market Value between grant and vesting, the more advantageous the 83(b) election becomes, as you are shifting that appreciation from being taxed as ordinary income to being taxed as capital gains.</p>
            
            <h2>Advanced Features</h2>
            <p>The calculator allows you to input an expected Fair Market Value at the time of an eventual sale or liquidation event. This provides a complete picture of your total tax liability across the lifecycle of the equity—from grant, to vesting, to a final exit. You can also customize your specific expected tax brackets to get a more accurate estimation.</p>
            
            <h2>Practical Examples</h2>
            <p>Imagine receiving 100,000 shares of restricted stock. At grant, the FMV is $0.01 per share. You pay $0.01 per share ($1,000 total). If you file an 83(b) election, your "gain" at grant is $0, meaning $0 in ordinary income tax. Four years later, the stock vests at an FMV of $5.00 per share. Without an 83(b), you would recognize $499,000 of ordinary income upon vesting, resulting in a massive tax bill (e.g., $174,650 at a 35% rate) before you've even sold any shares. With an 83(b), you pay nothing at vesting.</p>
            
            <h2>Tips & Best Practices</h2>
            <p>The deadline to file an 83(b) election is <strong>30 days from the date of grant</strong>. There are no exceptions, and missing this deadline means you forfeit the ability to make the election. You must mail a physical copy to the IRS (ideally via certified mail with a return receipt) and provide a copy to your employer. Always consult with a qualified tax professional or CPA before making the election, as it cannot be easily revoked once filed.</p>
            
            <h2>Benefits and Risks</h2>
            <p>The benefit is potentially massive tax savings and avoiding "phantom income" (owing taxes on illiquid stock that has vested but cannot yet be sold). The primary risk is overpaying taxes: if you pay tax based on the grant value and the company subsequently goes out of business, or you leave before the stock vests and forfeit the shares, you cannot claim a tax refund for the ordinary income taxes already paid.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/83-b-election-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
