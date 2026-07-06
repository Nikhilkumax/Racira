"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface ReverseResult {
  principalLimit: number;
  availableFunds: number;
  initialMIP: number;
  originationFee: number;
  totalUpfrontCosts: number;
  chartData: { year: number; loanBalance: number; homeValue: number; remainingEquity: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcReverseMortgage(age: number, homeValue: number, currentMortgage: number, interestRate: number, expectedAppreciation: number): ReverseResult {
  // FHA HECM limits and calculations (simplified estimator)
  const maxClaimAmount = Math.min(homeValue, 1149825); // 2024 HECM limit
  
  // Principal Limit Factor (PLF) is highly complex based on age and expected rate.
  // We use a simplified linear approximation for estimation purposes:
  // Older age = higher PLF. Base PLF at 62 is ~0.40, increasing by ~0.005 per year.
  // Higher rates lower the PLF significantly.
  const baseRate = 5.0;
  const rateAdjustment = (interestRate - baseRate) * 0.05; // 1% higher rate drops PLF by ~0.05
  let plf = 0.40 + ((age - 62) * 0.005) - rateAdjustment;
  plf = Math.max(0.15, Math.min(0.75, plf)); // Cap PLF bounds

  const principalLimit = maxClaimAmount * plf;
  
  // Upfront costs
  const initialMIP = maxClaimAmount * 0.02; // 2% of max claim amount
  let originationFee = 0;
  if (maxClaimAmount <= 125000) {
    originationFee = 2500;
  } else {
    originationFee = 2500 + (maxClaimAmount - 125000) * 0.02;
  }
  originationFee = Math.min(6000, Math.max(2500, originationFee)); // Capped at $6k
  
  const otherClosingCosts = 2500; // Est appraisal, title, etc.
  const totalUpfrontCosts = initialMIP + originationFee + otherClosingCosts;
  
  // Available funds after paying off existing mortgage and upfront costs
  const availableFunds = Math.max(0, principalLimit - currentMortgage - totalUpfrontCosts);

  // Projection over 15 years
  const chartData = [];
  let currentBalance = currentMortgage > 0 ? (principalLimit - availableFunds) : totalUpfrontCosts;
  let currentHomeValue = homeValue;
  const annualMIPRate = 0.005; // 0.5% annual MIP
  const effectiveAnnualRate = (interestRate / 100) + annualMIPRate;

  for (let year = 0; year <= 15; year++) {
    const remainingEquity = Math.max(0, currentHomeValue - currentBalance);
    chartData.push({
      year,
      loanBalance: Math.round(currentBalance),
      homeValue: Math.round(currentHomeValue),
      remainingEquity: Math.round(remainingEquity)
    });
    
    // Grow balance by interest + MIP
    currentBalance = currentBalance * (1 + effectiveAnnualRate);
    // Grow home value
    currentHomeValue = currentHomeValue * (1 + (expectedAppreciation / 100));
  }

  const summaryStats = [
    { label: "Home Value", value: `$${homeValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Borrower Age", value: `${age} years` },
    { label: "Est. Principal Limit Factor", value: `${(plf * 100).toFixed(1)}%` },
    { label: "Total Principal Limit", value: `$${principalLimit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Existing Mortgage Payoff", value: `-$${currentMortgage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Financed Closing Costs", value: `-$${totalUpfrontCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { principalLimit, availableFunds, initialMIP, originationFee, totalUpfrontCosts, chartData, summaryStats };
}

const DEFAULTS = { age: "72", homeValue: "500000", currentMortgage: "50000", interestRate: "6.5", expectedAppreciation: "3.0" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function ReverseMortgageEstimationCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [currentMortgage, setCurrentMortgage] = useState(DEFAULTS.currentMortgage);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [expectedAppreciation, setExpectedAppreciation] = useState(DEFAULTS.expectedAppreciation);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<ReverseResult | null>(null);

  const calc = () => setResults(calcReverseMortgage(parseFloat(age)||62, parseFloat(homeValue)||0, parseFloat(currentMortgage)||0, parseFloat(interestRate)||0, parseFloat(expectedAppreciation)||0));
  const reset = () => { setAge(DEFAULTS.age); setHomeValue(DEFAULTS.homeValue); setCurrentMortgage(DEFAULTS.currentMortgage); setInterestRate(DEFAULTS.interestRate); setExpectedAppreciation(DEFAULTS.expectedAppreciation); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is a reverse mortgage?", answer: "A reverse mortgage (most commonly the FHA-insured Home Equity Conversion Mortgage or HECM) allows homeowners aged 62 and older to convert a portion of their home equity into cash. Unlike a traditional mortgage where you make monthly payments to the lender, the lender makes payments to you (or gives you a lump sum/line of credit). The loan balance grows over time and is repaid when you sell the home, move out permanently, or pass away." },
    { question: "How much money can I get?", answer: "The amount you can borrow is called the Principal Limit. It is determined by three main factors: the age of the youngest borrower (older borrowers get more), the current interest rate (lower rates yield more money), and the appraised value of the home (up to the FHA limit of $1,149,825 in 2024)." },
    { question: "Do I have to pay off my current mortgage?", answer: "Yes. If you have an existing mortgage or home equity loan, the reverse mortgage funds must first be used to pay off that existing debt. The amount left over (the Net Available Funds) is what you can use for other purposes. This effectively eliminates your current monthly mortgage payment, freeing up cash flow." },
    { question: "Can I lose my home with a reverse mortgage?", answer: "While you do not have to make monthly mortgage payments, you are still required to pay property taxes, homeowners insurance, and HOA dues, and you must maintain the home in good repair. If you fail to pay these ongoing property charges, the lender can foreclose on the home." },
    { question: "Will I owe more than the home is worth?", answer: "No. HECM reverse mortgages are 'non-recourse' loans. This means that if the loan balance eventually grows to exceed the value of the home, neither you nor your heirs will have to pay the difference out of pocket. The FHA mortgage insurance fund covers the shortfall." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Reverse Mortgage Estimation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Mortgage Estimation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="age" label="Youngest Borrower Age" value={age} onChange={setAge} suffix="yrs" />
              <CompactInput id="home" label="Est. Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="mortgage" label="Current Mortgage Bal." value={currentMortgage} onChange={setCurrentMortgage} prefix="$" />
              <CompactInput id="rate" label="Expected Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Projection Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="appr" label="Annual Home Appreciation" value={expectedAppreciation} onChange={setExpectedAppreciation} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Home className="h-4 w-4" /> Estimate Funds
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Note: This is an estimator. Actual Principal Limit Factors change daily based on bond rates.</p>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className={`border-l-4 rounded-lg p-5 ${results.availableFunds > 0 ? "bg-primary/10 border-primary" : "bg-destructive/10 border-destructive"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${results.availableFunds > 0 ? "text-primary" : "text-destructive"}`}>Est. Net Available Funds</div>
                <div className="text-4xl font-bold text-foreground">${results.availableFunds.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">After paying off your $${parseFloat(currentMortgage).toLocaleString()} mortgage and closing costs.</div>
              </div>

              {results.availableFunds === 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">⚠️ <strong>Insufficient Equity:</strong> Your current mortgage balance exceeds the Principal Limit allowed for your age and interest rate. You do not qualify for a reverse mortgage at this time unless you bring cash to closing to pay down the existing mortgage.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Principal Limit", `$${results.principalLimit.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Est. Upfront Costs", `$${results.totalUpfrontCosts.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Details</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center">
                  <h3 className="text-base font-bold mb-4 text-left">Equity Projection (15 Years)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={results.chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Years", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="homeValue" name="Home Value" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="loanBalance" name="Loan Balance" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="remainingEquity" name="Your Equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Reverse Mortgage Math</h2>
            <p>A Home Equity Conversion Mortgage (HECM) allows seniors to access their home equity without taking on a monthly payment. However, determining exactly how much cash you can access is complex. Lenders do not simply give you 100% of your home's value. The <strong>Reverse Mortgage Estimation Calculator</strong> models the FHA's algorithm to show you your true "Principal Limit"—the actual maximum amount the government will insure for your specific profile.</p>

            <h2 className="text-2xl font-bold mb-3">The Principal Limit Factor (PLF)</h2>
            <p>Your Principal Limit is calculated by multiplying your home's appraised value by a percentage known as the Principal Limit Factor (PLF). The PLF is determined by a matrix published by the Department of Housing and Urban Development (HUD), relying on two variables: the age of the youngest borrower and the Expected Interest Rate.</p>
            <p><strong>Age:</strong> The older you are, the higher your PLF. A 90-year-old might be allowed to borrow 60% of their home's value, while a 62-year-old might only be allowed to borrow 40%. The FHA assumes older borrowers have a shorter life expectancy, meaning the loan will accrue interest for fewer years before being repaid.</p>
            <p><strong>Interest Rates:</strong> When prevailing interest rates are low, the PLF goes up, allowing you to borrow more. When rates are high, the PLF drops significantly. This is because at high interest rates, the loan balance will grow rapidly through compound interest; the FHA must restrict initial borrowing to ensure the future loan balance doesn't vastly exceed the future home value.</p>

            <h2 className="text-2xl font-bold mb-3">Mandatory Payoffs and Upfront Costs</h2>
            <p>If your Principal Limit is $250,000, you do not immediately receive $250,000 in your bank account. FHA rules require that any existing liens on the property be paid off first. If you still owe $100,000 on your primary mortgage, those funds are automatically deducted from your Principal Limit to pay off the bank. This eliminates your monthly mortgage payment, but reduces your cash-in-hand.</p>
            <p>Additionally, reverse mortgages carry high upfront costs. You must pay a 2% initial Mortgage Insurance Premium (MIP) to the FHA, an origination fee (capped at $6,000), and standard closing costs. These are typically financed into the loan, meaning they are deducted from your Principal Limit before you see the remaining "Net Available Funds."</p>

            <h2 className="text-2xl font-bold mb-3">The Rising Loan Balance</h2>
            <p>Because you are not making monthly payments, the interest and annual MIP (0.5%) are continually added to your loan balance. This results in negative amortization—your debt grows every month. As shown in the Equity Projection chart, over 10 to 15 years, the loan balance can grow substantially, consuming the remaining equity in the home unless the property appreciates at a very high rate.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reverse-mortgage-estimation-calculator" />
          <PopularCalculators exclude="/calculator/reverse-mortgage-estimation-calculator" />
        </div>
      </div>
    </>
  );
}
