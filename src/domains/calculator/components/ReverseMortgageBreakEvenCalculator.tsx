"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Home, Target, TrendingDown, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface ReverseInputs {
  homeValue: number;
  borrowerAge: number;
  initialDraw: number;
  monthlyDraw: number;
  interestRate: number;
  homeAppreciation: number;
  upfrontCosts: number;
}

interface YearlyData {
  year: number;
  age: number;
  loanBalance: number;
  homeValue: number;
  equity: number;
}

interface ReverseResult {
  breakEvenYear: number | null;
  breakEvenAge: number | null;
  finalYear: number;
  finalEquity: number;
  schedule: YearlyData[];
  chartData: { year: number; "Loan Balance": number; "Home Value": number; Equity: number }[];
}

const DEFAULTS = {
  homeValue: "400000",
  borrowerAge: "65",
  initialDraw: "50000",
  monthlyDraw: "1000",
  interestRate: "7.0",
  homeAppreciation: "3.0",
  upfrontCosts: "12000",
};

const calculateReverseMortgage = (inputs: ReverseInputs): ReverseResult => {
  const { homeValue, borrowerAge, initialDraw, monthlyDraw, interestRate, homeAppreciation, upfrontCosts } = inputs;
  
  const annualRate = interestRate / 100;
  const annualAppreciation = homeAppreciation / 100;
  const monthlyRate = annualRate / 12;

  let currentHomeValue = homeValue;
  let currentLoanBalance = initialDraw + upfrontCosts;
  let currentAge = borrowerAge;
  
  const schedule: YearlyData[] = [];
  const chartData: { year: number; "Loan Balance": number; "Home Value": number; Equity: number }[] = [];
  
  let breakEvenYear: number | null = null;
  let breakEvenAge: number | null = null;

  schedule.push({
    year: 0,
    age: currentAge,
    loanBalance: currentLoanBalance,
    homeValue: currentHomeValue,
    equity: currentHomeValue - currentLoanBalance,
  });
  
  chartData.push({
    year: 0,
    "Loan Balance": Math.round(currentLoanBalance),
    "Home Value": Math.round(currentHomeValue),
    Equity: Math.round(currentHomeValue - currentLoanBalance)
  });

  // Project out to age 100 or 35 years maximum
  const maxYears = Math.min(100 - borrowerAge, 35);

  for (let year = 1; year <= maxYears; year++) {
    // Compound monthly for the year
    for (let m = 1; m <= 12; m++) {
      currentLoanBalance += monthlyDraw;
      currentLoanBalance += currentLoanBalance * monthlyRate;
    }
    
    currentHomeValue += currentHomeValue * annualAppreciation;
    currentAge++;
    
    const equity = currentHomeValue - currentLoanBalance;

    if (equity <= 0 && breakEvenYear === null) {
      breakEvenYear = year;
      breakEvenAge = currentAge;
    }

    schedule.push({
      year,
      age: currentAge,
      loanBalance: currentLoanBalance,
      homeValue: currentHomeValue,
      equity: equity < 0 ? 0 : equity,
    });

    chartData.push({
      year,
      "Loan Balance": Math.round(currentLoanBalance),
      "Home Value": Math.round(currentHomeValue),
      Equity: Math.round(equity < 0 ? 0 : equity)
    });
  }

  return {
    breakEvenYear,
    breakEvenAge,
    finalYear: maxYears,
    finalEquity: schedule[schedule.length - 1].equity,
    schedule,
    chartData
  };
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function ReverseMortgageBreakEvenCalculator() {
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [borrowerAge, setBorrowerAge] = useState(DEFAULTS.borrowerAge);
  const [initialDraw, setInitialDraw] = useState(DEFAULTS.initialDraw);
  const [monthlyDraw, setMonthlyDraw] = useState(DEFAULTS.monthlyDraw);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [homeAppreciation, setHomeAppreciation] = useState(DEFAULTS.homeAppreciation);
  const [upfrontCosts, setUpfrontCosts] = useState(DEFAULTS.upfrontCosts);

  const [result, setResult] = useState<ReverseResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculateReverseMortgage({
      homeValue: parseFloat(homeValue) || 0,
      borrowerAge: parseInt(borrowerAge) || 0,
      initialDraw: parseFloat(initialDraw) || 0,
      monthlyDraw: parseFloat(monthlyDraw) || 0,
      interestRate: parseFloat(interestRate) || 0,
      homeAppreciation: parseFloat(homeAppreciation) || 0,
      upfrontCosts: parseFloat(upfrontCosts) || 0,
    }));
  };

  const reset = () => {
    setHomeValue(DEFAULTS.homeValue);
    setBorrowerAge(DEFAULTS.borrowerAge);
    setInitialDraw(DEFAULTS.initialDraw);
    setMonthlyDraw(DEFAULTS.monthlyDraw);
    setInterestRate(DEFAULTS.interestRate);
    setHomeAppreciation(DEFAULTS.homeAppreciation);
    setUpfrontCosts(DEFAULTS.upfrontCosts);
    setShowAdvanced(false);
    setResult(calculateReverseMortgage({
      homeValue: parseFloat(DEFAULTS.homeValue),
      borrowerAge: parseInt(DEFAULTS.borrowerAge),
      initialDraw: parseFloat(DEFAULTS.initialDraw),
      monthlyDraw: parseFloat(DEFAULTS.monthlyDraw),
      interestRate: parseFloat(DEFAULTS.interestRate),
      homeAppreciation: parseFloat(DEFAULTS.homeAppreciation),
      upfrontCosts: parseFloat(DEFAULTS.upfrontCosts),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "What is a Reverse Mortgage?", answer: "A reverse mortgage (often a HECM - Home Equity Conversion Mortgage) is a type of loan for homeowners aged 62 or older. It allows them to convert a portion of the equity in their home into cash. Unlike a traditional mortgage, the borrower doesn't make monthly payments to the lender; instead, the lender makes payments to the borrower, and the loan balance grows over time." },
    { question: "What does 'Break-Even' mean in a reverse mortgage?", answer: "The 'break-even' point in a reverse mortgage context usually refers to the point in time where the growing loan balance (from initial draws, monthly draws, accumulated interest, and fees) overtakes the appreciating value of the home, reducing the remaining equity to zero. After this point, you owe more than the home is worth." },
    { question: "Can I owe more than my home is worth?", answer: "No. Most reverse mortgages (HECMs) are 'non-recourse' loans. This means that when the home is eventually sold to repay the loan, neither you nor your heirs will ever have to pay more than the appraised value of the home at the time of sale, even if the loan balance is higher." },
    { question: "Do I still own my home?", answer: "Yes, you retain the title to your home. However, you are strictly required to continue paying property taxes, homeowners insurance, and HOA fees (if applicable), and you must maintain the property in good condition. If you fail to do so, the loan can be called due." },
    { question: "What happens when I pass away or move out?", answer: "When the last surviving borrower on the loan passes away, moves into a care facility for more than 12 consecutive months, or sells the home, the loan becomes due. Your heirs will typically have 6 months to either pay off the loan balance (often by refinancing) to keep the home, or sell the home to satisfy the debt." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Reverse Mortgage Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Mortgage Break-Even Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <CompactInput id="homeValue" label="Current Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
            <CompactInput id="borrowerAge" label="Borrower Age (Min 62)" value={borrowerAge} onChange={setBorrowerAge} />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="initialDraw" label="Initial Draw" value={initialDraw} onChange={setInitialDraw} prefix="$" />
              <CompactInput id="monthlyDraw" label="Monthly Draw" value={monthlyDraw} onChange={setMonthlyDraw} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Loan Terms & Projections
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="interestRate" label="Interest Rate (APR)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
                  <CompactInput id="homeAppreciation" label="Annual Home Appreciation" value={homeAppreciation} onChange={setHomeAppreciation} suffix="%" step="0.1" />
                  <CompactInput id="upfrontCosts" label="Upfront Closing Costs" value={upfrontCosts} onChange={setUpfrontCosts} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`border-l-4 rounded-lg p-5 ${result.breakEvenYear !== null ? 'bg-amber-500/10 border-amber-500' : 'bg-green-500/10 border-green-500'}`}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Zero Equity Reached At</p>
                    {result.breakEvenYear !== null ? (
                      <div>
                        <p className="text-3xl font-black text-amber-600 dark:text-amber-400">Age {result.breakEvenAge}</p>
                        <p className="text-sm text-muted-foreground mt-1">In {result.breakEvenYear} years</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">Never</p>
                        <p className="text-sm text-muted-foreground mt-1">Equity remains positive for life</p>
                      </div>
                    )}
                  </div>
                  <div className="border-l-4 rounded-lg p-5 bg-primary/10 border-primary">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Projected Final Equity (Age {Number(borrowerAge) + result.finalYear})</p>
                    <p className="text-3xl font-black text-primary">{formatCurrency(result.finalEquity)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Non-recourse guarantee protects heirs</p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4">Loan Balance vs Home Value Projection</p>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => `Year ${label} (Age ${Number(borrowerAge) + Number(label)})`}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line type="monotone" dataKey="Home Value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="Loan Balance" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="Equity" stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Reverse Mortgage Structure</h2>
            <p>A reverse mortgage, most commonly known as a Home Equity Conversion Mortgage (HECM) insured by the Federal Housing Administration, allows senior homeowners aged 62 and older to tap into their home equity without selling the home or taking on a new monthly mortgage payment. Instead of you paying the lender every month, the lender pays you — either as a lump sum, a line of credit, or monthly installments.</p>
            <p>However, the money received is not free. Every dollar drawn, along with substantial upfront closing costs, is added to the loan balance. Because you are not making monthly principal and interest payments, the loan balance experiences negative amortization — it grows steadily over time, compounded by the interest rate.</p>

            <h2 className="text-2xl font-bold mb-3">What the Break-Even Point Actually Means</h2>
            <p>In the context of a reverse mortgage, the break-even point — also called the crossover point — is the exact moment in the future when your exponentially growing loan balance overtakes the appreciating value of your home. At this juncture, your home equity mathematically drops to zero. Any further draws or interest accumulation pushes the loan balance higher than the home's current market value. Using our calculator, you can project precisely when this will happen based on your withdrawal rate, the loan's interest rate, and your assumed annual home appreciation.</p>

            <h2 className="text-2xl font-bold mb-3">The Non-Recourse Guarantee</h2>
            <p>One of the most critical features of a federally insured HECM reverse mortgage is the non-recourse clause. When the loan eventually becomes due — usually because the last surviving borrower passes away or moves out permanently — the loan must be repaid. If the loan balance has grown larger than the home's appraised market value, neither you nor your heirs are personally liable for the difference. The lender sells the home, takes the proceeds, and the FHA insurance fund covers any remaining shortfall. Your estate cannot be forced to pay the excess from other assets.</p>

            <h2 className="text-2xl font-bold mb-3">Hidden Risks You Must Understand</h2>
            <p>While non-recourse protection is excellent, reverse mortgages carry significant risks. HECMs require an initial Mortgage Insurance Premium equal to 2% of the home's appraised value, plus origination fees and standard closing costs. These are typically rolled into the loan balance immediately, meaning you owe thousands more than the cash you actually received. You must also continue paying property taxes, homeowners insurance, and any HOA fees — failure to do so gives the lender grounds to foreclose, forcing you out of the home.</p>
            <p>Because the loan balance grows rapidly through compound interest, it aggressively consumes home equity over time. If your goal is to leave a free-and-clear home to your children, a reverse mortgage works directly against that objective. Additionally, taking large lump sums can push your liquid asset balance over the threshold for needs-based benefit programs such as Medicaid or Supplemental Security Income, potentially disqualifying you from programs you depend on.</p>

            <h2 className="text-2xl font-bold mb-3">Planning for the Long Term</h2>
            <p>A reverse mortgage can be a powerful tool to secure reliable cash flow in retirement, allowing seniors to age in place without the burden of a monthly mortgage payment. The key is understanding the trajectory before you commit. By using this Break-Even Calculator to map out exactly when your loan balance will overtake your home's value, you can make an informed decision, prepare your heirs for what to expect, and choose a draw strategy that balances your income needs against the equity you wish to preserve.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reverse-mortgage-break-even-calculator" />
          <PopularCalculators exclude="/calculator/reverse-mortgage-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
