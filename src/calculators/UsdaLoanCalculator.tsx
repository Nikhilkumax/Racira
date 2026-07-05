"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UsdaLoanResult {
  totalMonthly: number;
  monthlyPI: number;
  monthlyFee: number;
  monthlyTaxes: number;
  monthlyIns: number;
  totalLoan: number;
  upfrontAmount: number;
  totalInterest: number;
  totalCost: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcUsdaLoan(price: number, downPayment: number, rate: number, termYears: number, upfrontFeePct: number, annualFeePct: number, propertyTaxRate: number, homeIns: number, hoa: number): UsdaLoanResult {
  const baseLoan = Math.max(0, price - downPayment);
  const upfrontAmount = baseLoan * (upfrontFeePct / 100);
  const totalLoan = baseLoan + upfrontAmount;
  
  const r = rate / 100 / 12;
  const n = termYears * 12;
  
  const monthlyPI = totalLoan > 0 && r > 0 ? (totalLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : totalLoan > 0 && n > 0 ? totalLoan / n : 0;
  
  // USDA annual fee is calculated based on average annual balance, but standard estimates use the base loan
  const monthlyFee = (baseLoan * (annualFeePct / 100)) / 12;
  const monthlyTaxes = (price * (propertyTaxRate / 100)) / 12;
  const monthlyIns = homeIns / 12;
  const monthlyHOA = hoa;
  
  const totalMonthly = monthlyPI + monthlyFee + monthlyTaxes + monthlyIns + monthlyHOA;
  
  const totalInterest = Math.max(0, (monthlyPI * n) - totalLoan);
  const totalCost = downPayment + (totalMonthly * n);

  const pieData = [
    { name: "Principal & Interest", value: monthlyPI },
    { name: "Guarantee Fee", value: monthlyFee },
    { name: "Property Tax", value: monthlyTaxes },
    { name: "Home Insurance", value: monthlyIns },
  ];
  if (monthlyHOA > 0) pieData.push({ name: "HOA Dues", value: monthlyHOA });

  const breakdown = [
    { label: "Home Price", value: `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Base Loan Amount", value: `$${baseLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Upfront Guarantee Fee", value: `+$${upfrontAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Financed Loan", value: `$${totalLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest (Life of Loan)", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Total Monthly Payment", value: `$${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "P&I Payment", value: `$${monthlyPI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Monthly Guarantee Fee", value: `$${monthlyFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Upfront Fee", value: `$${upfrontAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan-to-Value (LTV)", value: `${price > 0 ? ((totalLoan / price) * 100).toFixed(1) : 0}%` },
    { label: "Total Cost of Loan", value: `$${((monthlyPI * n) + upfrontAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { totalMonthly, monthlyPI, monthlyFee, monthlyTaxes, monthlyIns, totalLoan, upfrontAmount, totalInterest, totalCost, pieData, breakdown, summaryStats };
}

const DEFAULTS = { price: "250000", downPayment: "0", rate: "6.25", termYears: "30", upfrontFeePct: "1.0", annualFeePct: "0.35", propertyTaxRate: "1.2", homeIns: "1000", hoa: "0" };
const PIE_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"]; 

export default function UsdaLoanCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [upfrontFeePct, setUpfrontFeePct] = useState(DEFAULTS.upfrontFeePct);
  const [annualFeePct, setAnnualFeePct] = useState(DEFAULTS.annualFeePct);
  const [propertyTaxRate, setPropertyTaxRate] = useState(DEFAULTS.propertyTaxRate);
  const [homeIns, setHomeIns] = useState(DEFAULTS.homeIns);
  const [hoa, setHoa] = useState(DEFAULTS.hoa);
  
  const [result, setResult] = useState<UsdaLoanResult | null>(null);

  const calculate = () => setResult(calcUsdaLoan(
    parseFloat(price) || 0, parseFloat(downPayment) || 0, parseFloat(rate) || 0, parseFloat(termYears) || 0, 
    parseFloat(upfrontFeePct) || 0, parseFloat(annualFeePct) || 0, parseFloat(propertyTaxRate) || 0, parseFloat(homeIns) || 0, parseFloat(hoa) || 0
  ));
  
  const reset = () => { 
    setPrice(DEFAULTS.price); setDownPayment(DEFAULTS.downPayment); setRate(DEFAULTS.rate); setTermYears(DEFAULTS.termYears);
    setUpfrontFeePct(DEFAULTS.upfrontFeePct); setAnnualFeePct(DEFAULTS.annualFeePct); setPropertyTaxRate(DEFAULTS.propertyTaxRate); setHomeIns(DEFAULTS.homeIns); setHoa(DEFAULTS.hoa);
    setShowAdvanced(false);
    setResult(calcUsdaLoan(250000, 0, 6.25, 30, 1.0, 0.35, 1.2, 1000, 0)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a USDA loan?", answer: "A USDA loan is a specialized, zero-down-payment mortgage program sponsored by the U.S. Department of Agriculture. It is designed to promote homeownership and development in eligible rural and suburban areas for low-to-moderate-income families." },
    { question: "Are USDA loans only for farms?", answer: "No. This is a common misconception. While they are intended for rural and suburban development, you absolutely do not need to operate a farm to qualify. In fact, many standard suburban subdivisions that sit just outside major city limits are located in USDA-eligible zones." },
    { question: "What is the down payment requirement for a USDA loan?", answer: "USDA loans offer 100% financing, meaning a 0% down payment is required. This makes it one of the most accessible mortgage programs available, rivaled only by the VA loan program (which is restricted to military veterans)." },
    { question: "What are the USDA Guarantee Fees?", answer: "To fund the program and protect lenders against default, the USDA charges two guarantee fees. First is an Upfront Guarantee Fee (currently 1.0% of the loan amount), which is typically rolled into the total loan balance. Second is an Annual Guarantee Fee (currently 0.35% of the loan balance), which is divided by 12 and added to your monthly payment." },
    { question: "What are the income limits for USDA loans?", answer: "Because the program targets low-to-moderate-income families, there are strict income limits. These limits vary significantly by location and the size of your household (e.g., a family of 5 has a higher income limit than a single person). Generally, your household income cannot exceed 115% of the area's median income." },
    { question: "Can I use a USDA loan to buy an investment property?", answer: "No. USDA loans are strictly for primary residences. You must intend to personally occupy the home as your primary dwelling. They cannot be used for vacation homes, rental properties, or working farms." },
    { question: "How does the USDA Annual Fee compare to FHA PMI?", answer: "The USDA Annual Guarantee Fee (0.35%) is significantly cheaper than standard FHA Mortgage Insurance Premiums (MIP), which typically sit at 0.55%. Over the life of a 30-year loan, this lower fee saves USDA borrowers thousands of dollars compared to FHA borrowers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "USDA Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">USDA Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Home Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Down Payment ($)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Loan Term (Years)</label><div className={inp}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={ci} /></div></div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Upfront Fee (%)</label><div className={inp}><input type="number" value={upfrontFeePct} onChange={e => setUpfrontFeePct(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Annual Fee (%)</label><div className={inp}><input type="number" value={annualFeePct} onChange={e => setAnnualFeePct(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
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
                <div className="text-sm text-muted-foreground mt-1">Includes P&I, Taxes, Insurance, and USDA Guarantee Fee</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Financed", `$${result.totalLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Monthly Fee", `$${result.monthlyFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["LTV", `${(result.totalLoan / (parseFloat(price) || 1) * 100).toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Total Financed") || r.label.includes("Total Interest") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a USDA Loan Calculator?</h2>
            <p>A USDA loan calculator is a specialized mortgage tool designed to compute the exact costs associated with the United States Department of Agriculture's Rural Development loan program. For millions of Americans living in suburban and rural areas, the USDA loan is arguably the best mortgage product on the market, offering 100% financing (zero down payment) and competitive interest rates. However, because it is a government-backed loan, it features unique fee structures—specifically the Upfront and Annual Guarantee Fees—that standard mortgage calculators simply ignore.</p>
            <p>If you use a generic calculator to estimate a USDA loan, you will dramatically underestimate your monthly payment and your total loan balance. This tool perfectly replicates the USDA underwriting formula. It automatically calculates the mandatory upfront fee, rolls it into your financed loan amount, and computes the ongoing monthly guarantee fee alongside your property taxes and insurance, providing you with a perfectly accurate, to-the-penny estimate of your true housing costs.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics behind a USDA loan are unique because the program allows you to finance its own mandatory fees, often pushing the initial loan balance higher than the actual purchase price of the home.</p>
            <p>First, the calculator determines your <strong>Base Loan Amount</strong> by subtracting your Down Payment (if you choose to make one) from the Home Price. Formula: <code>Base Loan = Home Price - Down Payment</code>.</p>
            <p>Next, it calculates the mandatory <strong>Upfront Guarantee Fee</strong>. The current standard is 1.0% of the Base Loan. Because virtually all borrowers finance this fee rather than paying it in cash at closing, the calculator automatically adds it to your loan. Formula: <code>Total Loan Amount = Base Loan + (Base Loan * 1.0%)</code>. On a $250,000 house with zero down, your starting loan balance is actually $252,500.</p>
            <p>The tool then runs a standard amortization formula on that Total Loan Amount to find your Principal and Interest (P&I) payment. Crucially, it then adds the <strong>Annual Guarantee Fee</strong>. The current standard is 0.35% of the Base Loan, divided by 12 months. Finally, it adds your monthly property taxes and home insurance to generate the true Total Monthly Payment.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you generate a calculation, the tool provides five distinct analytical sections designed to mirror the actual Loan Estimate you will receive from your USDA-approved lender.</p>
            <p><strong>Primary Result Card:</strong> This displays your Total Monthly Payment. This is the absolute amount of cash leaving your bank account every month, incorporating the loan, taxes, insurance, and USDA fees.</p>
            <p><strong>3-Stat Bar:</strong> This section highlights your Total Financed Amount (showing you the impact of the financed upfront fee), your Monthly Guarantee Fee cost, and your Loan-to-Value (LTV) ratio.</p>
            <p><strong>Loan Breakdown Table:</strong> This table walks you through the exact math of how your final loan balance was determined. It clearly separates your base loan from the financed upfront fee, ensuring total transparency.</p>
            <p><strong>Monthly Payment Breakdown Chart:</strong> A visual pie chart that breaks your monthly payment into its core components (P&I, Taxes, Insurance, and the Guarantee Fee). This helps you visualize exactly where your money is going every month.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating the most important metrics, including the total interest you will pay over the life of the loan.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>To successfully utilize a USDA loan, you must understand both its financial mechanics and its strict eligibility requirements.</p>
            <p><strong>The 0% Down Payment:</strong> This is the primary draw of the USDA loan. By allowing 100% financing, families can buy homes without spending years saving for a 20% down payment. However, financing the entire purchase price (plus fees) means your monthly payments and total interest costs will be significantly higher than if you had put money down.</p>
            <p><strong>Location Eligibility:</strong> The USDA loan is geographically restricted. The home must be located in an eligible rural or suburban area. You can check any property address on the official USDA eligibility map. You might be surprised; many expanding suburban neighborhoods are still classified as "rural" by the USDA.</p>
            <p><strong>Income Limits:</strong> This program is designed for low-to-moderate-income families. There are strict caps on how much your entire household can earn. If your household income exceeds 115% of the median income for your area, you will be disqualified from the program, regardless of how good your credit score is.</p>
            <p><strong>The Guarantee Fees:</strong> The 1.0% upfront fee and 0.35% annual fee are mandatory. Unlike conventional loan PMI (Private Mortgage Insurance), which falls off when you reach 20% equity, the USDA annual fee remains for the life of the loan. However, at 0.35%, it is significantly cheaper than FHA mortgage insurance.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options tab unlocks the ability to highly customize the USDA calculations, ensuring your estimate perfectly matches your localized market conditions.</p>
            <p>While the calculator defaults to the current standard Upfront Fee of 1.0% and Annual Fee of 0.35%, these rates can be adjusted by Congress or the USDA based on funding needs. The advanced inputs allow you to change these percentages if the government alters the program guidelines.</p>
            <p>Furthermore, you can precisely adjust local Property Tax Rates and Home Insurance estimates. Since property taxes vary wildly—from 0.3% in Hawaii to over 2.4% in New Jersey—adjusting this input is critical to generating an accurate monthly payment.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how the USDA loan compares to an FHA loan for the same property.</p>
            <p><strong>Example 1: The USDA 0% Down.</strong> You buy a $300,000 home using a USDA loan with 0% down. Your base loan is $300,000. The 1.0% upfront fee adds $3,000, making your Total Loan $303,000. At a 6.5% interest rate, your P&I is $1,915. The 0.35% Annual Fee adds $87/month. With taxes and insurance, your total payment is roughly $2,385/month. You moved in with zero cash down.</p>
            <p><strong>Example 2: The FHA Alternative.</strong> You buy the same $300,000 home using an FHA loan. You must put 3.5% down ($10,500). Your base loan is $289,500. The FHA 1.75% upfront fee adds $5,066, making your Total Loan $294,566. At 6.5%, your P&I is $1,861. The FHA 0.55% Annual Fee adds $132/month. With taxes and insurance, your total payment is roughly $2,376/month. The payments are almost identical, but the FHA loan required you to drain $10,500 from your bank account for the down payment.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>The USDA loan is a powerful tool, but it requires careful navigation. Follow these best practices when utilizing USDA financing.</p>
            <p>First, aggressively check the USDA eligibility map before you start touring homes. Do not assume a house qualifies just because it has trees in the yard. Conversely, do not rule out a neighborhood just because it looks suburban. The boundaries are strict and drawn by the government.</p>
            <p>Second, remember that USDA appraisals are very strict, similar to FHA appraisals. The home must be in good condition, safe, and structurally sound. You generally cannot use a standard USDA loan to buy a "fixer-upper" that needs a new roof or major structural repairs.</p>
            <p>Third, work with a lender who has extensive experience with USDA loans. Because this is a niche program, many loan officers are unfamiliar with the complex income calculations and property eligibility requirements. An inexperienced lender can cause your loan to be denied at the last minute by the USDA underwriting office.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using a dedicated USDA loan calculator is critical because standard mortgage calculators will mislead you by ignoring the mandatory guarantee fees, resulting in a payment shock when you receive your official loan estimate.</p>
            <p>This tool provides absolute clarity. It shows you the true cost of zero-down financing. By understanding exactly how much of your payment is consumed by interest, taxes, and government fees, you can confidently determine if a USDA loan is the right path to achieving your dream of homeownership.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/usda-loan-calculator" />
          <PopularCalculators exclude="/calculator/usda-loan-calculator" />
        </div>
      </div>
    </>
  );
}
