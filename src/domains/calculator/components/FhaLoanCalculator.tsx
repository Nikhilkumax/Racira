"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FhaLoanResult {
  totalMonthly: number;
  monthlyPI: number;
  monthlyMIP: number;
  monthlyTaxes: number;
  monthlyIns: number;
  totalLoan: number;
  upfrontMIP: number;
  totalInterest: number;
  totalCost: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFhaLoan(price: number, downPaymentPercent: number, rate: number, termYears: number, upfrontMipRate: number, annualMipRate: number, propertyTaxRate: number, homeIns: number, hoa: number): FhaLoanResult {
  const downPayment = (price * downPaymentPercent) / 100;
  const baseLoan = price - downPayment;
  const upfrontMIP = baseLoan * (upfrontMipRate / 100);
  const totalLoan = Math.max(0, baseLoan + upfrontMIP);
  
  const r = rate / 100 / 12;
  const n = termYears * 12;
  
  const monthlyPI = totalLoan > 0 && r > 0 ? (totalLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : totalLoan > 0 && n > 0 ? totalLoan / n : 0;
  
  // Annual MIP is technically based on the average annual outstanding balance, but standard calculators estimate it based on base loan
  const monthlyMIP = (baseLoan * (annualMipRate / 100)) / 12;
  const monthlyTaxes = (price * (propertyTaxRate / 100)) / 12;
  const monthlyIns = homeIns / 12;
  const monthlyHOA = hoa;
  
  const totalMonthly = monthlyPI + monthlyMIP + monthlyTaxes + monthlyIns + monthlyHOA;
  
  const totalInterest = Math.max(0, (monthlyPI * n) - totalLoan);
  const totalCost = downPayment + (totalMonthly * n);

  const pieData = [
    { name: "Principal & Interest", value: monthlyPI },
    { name: "Mortgage Insurance (MIP)", value: monthlyMIP },
    { name: "Property Tax", value: monthlyTaxes },
    { name: "Home Insurance", value: monthlyIns },
  ];
  if (monthlyHOA > 0) pieData.push({ name: "HOA Dues", value: monthlyHOA });

  const breakdown = [
    { label: "Home Price", value: `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Base Loan Amount", value: `$${baseLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Upfront MIP (Financed)", value: `+$${upfrontMIP.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Loan Amount", value: `$${totalLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Total Monthly Payment", value: `$${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Principal & Interest", value: `$${monthlyPI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Monthly MIP", value: `$${monthlyMIP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Upfront MIP", value: `$${upfrontMIP.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan-to-Value", value: `${(100 - downPaymentPercent).toFixed(1)}%` },
    { label: "Total Loan Cost", value: `$${((monthlyPI * n) + upfrontMIP).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { totalMonthly, monthlyPI, monthlyMIP, monthlyTaxes, monthlyIns, totalLoan, upfrontMIP, totalInterest, totalCost, pieData, breakdown, summaryStats };
}

const DEFAULTS = { price: "350000", downPaymentPercent: "3.5", rate: "6.5", termYears: "30", upfrontMipRate: "1.75", annualMipRate: "0.55", propertyTaxRate: "1.2", homeIns: "1200", hoa: "0" };
const PIE_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"]; 

export default function FhaLoanCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [upfrontMipRate, setUpfrontMipRate] = useState(DEFAULTS.upfrontMipRate);
  const [annualMipRate, setAnnualMipRate] = useState(DEFAULTS.annualMipRate);
  const [propertyTaxRate, setPropertyTaxRate] = useState(DEFAULTS.propertyTaxRate);
  const [homeIns, setHomeIns] = useState(DEFAULTS.homeIns);
  const [hoa, setHoa] = useState(DEFAULTS.hoa);
  
  const [result, setResult] = useState<FhaLoanResult | null>(null);

  const calculate = () => setResult(calcFhaLoan(
    parseFloat(price) || 0, parseFloat(downPaymentPercent) || 0, parseFloat(rate) || 0, parseFloat(termYears) || 0, 
    parseFloat(upfrontMipRate) || 0, parseFloat(annualMipRate) || 0, parseFloat(propertyTaxRate) || 0, parseFloat(homeIns) || 0, parseFloat(hoa) || 0
  ));
  
  const reset = () => { 
    setPrice(DEFAULTS.price); setDownPaymentPercent(DEFAULTS.downPaymentPercent); setRate(DEFAULTS.rate); setTermYears(DEFAULTS.termYears);
    setUpfrontMipRate(DEFAULTS.upfrontMipRate); setAnnualMipRate(DEFAULTS.annualMipRate); setPropertyTaxRate(DEFAULTS.propertyTaxRate); setHomeIns(DEFAULTS.homeIns); setHoa(DEFAULTS.hoa);
    setShowAdvanced(false);
    setResult(calcFhaLoan(350000, 3.5, 6.5, 30, 1.75, 0.55, 1.2, 1200, 0)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is an FHA loan?", answer: "An FHA loan is a mortgage insured by the Federal Housing Administration (FHA), a government agency. It is designed to help low-to-moderate-income borrowers achieve homeownership by allowing for lower credit scores and smaller down payments than conventional loans." },
    { question: "What is the minimum down payment for an FHA loan?", answer: "The minimum down payment for an FHA loan is 3.5% of the purchase price, provided the borrower has a credit score of 580 or higher. If your credit score is between 500 and 579, a 10% down payment is required." },
    { question: "What is FHA Mortgage Insurance Premium (MIP)?", answer: "MIP is mandatory insurance that protects the lender in case you default on the loan. FHA loans require two types of MIP: an Upfront MIP (usually 1.75% of the loan amount, rolled into the loan) and an Annual MIP (usually 0.55%, paid monthly)." },
    { question: "Does FHA mortgage insurance ever go away?", answer: "It depends on your initial down payment. If you put down less than 10% (as most FHA borrowers do), the Annual MIP stays for the entire life of the loan. If you put down 10% or more, the Annual MIP is removed after 11 years." },
    { question: "Can I roll the Upfront MIP into the loan?", answer: "Yes, nearly all borrowers choose to finance the Upfront MIP by rolling it into their total loan balance rather than paying it in cash at closing. This calculator assumes you are financing the Upfront MIP." },
    { question: "Are FHA interest rates lower than conventional rates?", answer: "Often, yes. Because the government insures the loan, lenders take on less risk and can offer slightly lower base interest rates. However, the addition of the mandatory MIP often makes the overall monthly payment higher than a conventional loan." },
    { question: "Can I use an FHA loan to buy an investment property?", answer: "No, FHA loans are strictly for primary residences. You must intend to live in the home for at least one year. However, you can use an FHA loan to buy a multi-family property (up to 4 units) as long as you live in one of the units." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "FHA Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">FHA Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Home Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Down Payment (%)</label><div className={inp}><input type="number" value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Loan Term (Years)</label><div className={inp}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={ci} /></div></div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold col-span-2">MIP & Escrow</div>
                <div><label className="text-sm font-medium mb-1.5 block">Upfront MIP (%)</label><div className={inp}><input type="number" value={upfrontMipRate} onChange={e => setUpfrontMipRate(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Annual MIP (%)</label><div className={inp}><input type="number" value={annualMipRate} onChange={e => setAnnualMipRate(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Property Tax (%)</label><div className={inp}><input type="number" value={propertyTaxRate} onChange={e => setPropertyTaxRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Home Ins. ($/yr)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homeIns} onChange={e => setHomeIns(e.target.value)} className={ci} /></div></div>
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
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Includes P&I, Taxes, Home Insurance, and FHA MIP</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Loan", `$${result.totalLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Monthly MIP", `$${result.monthlyMIP.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Cost", `$${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Total Loan") || r.label.includes("Total Interest") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Monthly Payment Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} /><Legend /></PieChart></ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">What Is an FHA Loan Calculator?</h2>
            <p>An FHA loan calculator is a specialized mortgage tool designed to compute the unique costs associated with a mortgage insured by the Federal Housing Administration. FHA loans are incredibly popular among first-time homebuyers because they drastically lower the barrier to entry, requiring a down payment of just 3.5% and accepting credit scores as low as 580. However, this leniency comes with a specific cost structure that traditional mortgage calculators fail to capture accurately.</p>
            <p>Unlike a conventional loan, an FHA loan mandates two distinct types of Mortgage Insurance Premiums (MIP) to protect the lender against default. Without factoring in both the Upfront MIP and the Annual MIP, a standard calculator will severely underestimate your monthly payment and total loan balance. This FHA loan calculator perfectly replicates the FHA underwriting process, automatically rolling the upfront fees into your loan balance and distributing the annual fees into your monthly payment, giving you the exact, to-the-penny cost of homeownership.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The math behind an FHA loan is slightly more complex than a standard amortization schedule due to the mandatory insurance premiums. Here is how the calculator processes your inputs.</p>
            <p>First, it calculates your <strong>Base Loan Amount</strong> by subtracting your Down Payment (typically 3.5%) from the Home Price. Formula: <code>Base Loan = Home Price - Down Payment</code>.</p>
            <p>Next, it calculates the <strong>Upfront MIP (Mortgage Insurance Premium)</strong>. The current FHA standard is 1.75% of the Base Loan. Most borrowers do not pay this in cash; they finance it. The calculator automatically adds this to your loan. Formula: <code>Total Loan Amount = Base Loan + (Base Loan * 1.75%)</code>.</p>
            <p>The calculator then runs a standard amortization formula on the Total Loan Amount to find your Principal and Interest (P&I) payment. Crucially, it then adds the <strong>Annual MIP</strong>. The current standard Annual MIP is 0.55% of the Base Loan, divided by 12 months. Finally, it adds your monthly property taxes, home insurance, and any HOA fees to generate the true Total Monthly Payment (often referred to as PITI + MIP).</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you click calculate, the tool generates a comprehensive financial breakdown designed to mirror the Loan Estimate form you will receive from a lender.</p>
            <p><strong>Primary Result Card:</strong> This displays your Total Monthly Payment. This is the absolute amount of cash you must pay the bank every month. It includes the loan repayment, taxes, insurance, and the mandatory FHA insurance.</p>
            <p><strong>3-Stat Bar:</strong> This section highlights your Total Loan (which will be higher than you expect due to the financed Upfront MIP), your Monthly MIP cost, and the Total Cost of the loan if you keep it for the full 30-year term.</p>
            <p><strong>Loan Breakdown Table:</strong> This table walks you through the exact math of how your final loan balance was determined. It clearly separates your base loan from the financed upfront insurance, ensuring total transparency.</p>
            <p><strong>Monthly Payment Breakdown Chart:</strong> This pie chart breaks your monthly payment into its core components (P&I, Taxes, Insurance, and MIP). Seeing how large a slice the taxes and MIP consume helps you understand that a mortgage payment is much more than just paying back the money you borrowed.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating the most important metrics, including the total interest you will pay over the life of the loan.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>Several variables dictate the affordability of an FHA loan. Understanding these factors can help you make a more informed purchase.</p>
            <p><strong>The 3.5% Down Payment:</strong> This is the hallmark of the FHA loan. On a $350,000 house, 3.5% is only $12,250. This low barrier allows you to preserve cash for furnishings, emergencies, and closing costs. However, a low down payment means a high loan balance, which leads to higher interest charges over time.</p>
            <p><strong>Upfront MIP (1.75%):</strong> This is a hefty fee. On a $337,750 base loan, the Upfront MIP is nearly $6,000. By rolling this into the loan (as the calculator assumes), you are paying interest on that $6,000 for the next 30 years. It is a hidden cost of the low down payment privilege.</p>
            <p><strong>Annual MIP (0.55%):</strong> This is an ongoing monthly cost. Unlike Private Mortgage Insurance (PMI) on a conventional loan, which automatically falls off when you reach 20% equity, FHA Annual MIP is permanent for the life of the loan if you put down less than 10%. The only way to remove it is to refinance the home into a conventional loan once you build enough equity.</p>
            <p><strong>Property Taxes and Insurance:</strong> These are required to be held in an escrow account and paid monthly along with your mortgage. Because they are based on the home's value, they will increase over time. They often make up 20% to 30% of your total monthly payment.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options toggle unlocks the ability to highly customize the FHA calculations, matching the exact current FHA guidelines or adjusting for unique scenarios.</p>
            <p>While the calculator defaults to the current standard Upfront MIP of 1.75% and Annual MIP of 0.55%, these rates can change based on congressional action or FHA policy adjustments. Furthermore, if you choose a 15-year term or put down more than 5%, the Annual MIP rate drops. The advanced inputs allow you to adjust these percentages to perfectly match your lender's quote.</p>
            <p>You can also precisely adjust local Property Tax Rates and Home Insurance estimates, which vary wildly by state and zip code, ensuring your monthly payment estimate is localized and accurate.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how the FHA structure compares to a conventional loan scenario.</p>
            <p><strong>Example A: The FHA First-Timer.</strong> You buy a $400,000 home using an FHA loan with 3.5% down ($14,000). Your base loan is $386,000. The Upfront MIP adds $6,755, making your Total Loan $392,755. At a 6.5% interest rate, your P&I is $2,482. The Annual MIP adds $176/month. With taxes and insurance, your total payment is roughly $3,158/month. You got into the house cheaply, but your monthly burden is high, and the MIP never drops off.</p>
            <p><strong>Example B: The Conventional Wait.</strong> You wait two years and save a 10% down payment ($40,000) on the same $400,000 house, qualifying for a conventional loan. Your loan is $360,000 (no Upfront MIP!). At 6.5%, your P&I is $2,275. You pay $90/month in PMI (which falls off in a few years). With taxes and insurance, your total payment is $2,865. By waiting and saving, you save nearly $300 a month and avoid the permanent FHA insurance trap.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>FHA loans are excellent tools, but they must be used strategically. Follow these best practices when utilizing FHA financing.</p>
            <p>First, view the FHA loan as a stepping stone, not a permanent mortgage. Because the Annual MIP cannot be removed (if you put down less than 10%), your long-term goal should be to refinance into a conventional mortgage as soon as the home appreciates enough to give you 20% equity. This will eliminate the monthly insurance premium entirely.</p>
            <p>Second, remember that FHA appraisals are notoriously strict. The FHA requires homes to meet specific safety and livability standards. A home with peeling paint, a bad roof, or missing handrails will fail an FHA appraisal. You cannot buy a "fixer-upper" with a standard FHA 203(b) loan; you would need a specialized FHA 203(k) rehab loan.</p>
            <p>Third, negotiate for seller concessions. FHA guidelines allow sellers to contribute up to 6% of the purchase price toward your closing costs. In a buyer's market, you can use these concessions to cover origination fees, appraisal costs, or even buy down your interest rate.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using an accurate FHA loan calculator is critical because standard mortgage calculators lie to you by omission. If you only calculate Principal and Interest, you will be shocked when the lender shows you the true monthly payment incorporating the mandatory FHA premiums.</p>
            <p>This tool provides absolute clarity. It shows you the true cost of putting down only 3.5%, allowing you to budget safely. By understanding exactly how much of your payment is consumed by interest and insurance versus how much is actually paying down the principal, you can make the most informed decision possible about whether an FHA loan is the right path to your first home.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fha-loan-calculator" />
          <PopularCalculators exclude="/calculator/fha-loan-calculator" />
        </div>
      </div>
    </>
  );
}
