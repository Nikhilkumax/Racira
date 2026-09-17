"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

interface BreakdownRow {
  label: string;
  value: number;
  isBold?: boolean;
  isGreen?: boolean;
}

interface HousingRatioInputs {
  incomeType: string;
  annualIncome: string;
  monthlyIncome: string;
  monthlyPI: string;
  monthlyTax: string;
  monthlyInsurance: string;
  monthlyHoa: string;
  monthlyPmi: string;
}

interface RatioResults {
  income: number;
  housingExpenses: number;
  housingRatio: number;
  maxRecommendedExpense: number;
  excessExpense: number;
  remainingIncome: number;
  backEndCapacity: number;
  status: string;
  statusColor: string;
  chartData: ChartSlice[];
  breakdownRows: BreakdownRow[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-[13px] font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateHousingRatio = (inputs: HousingRatioInputs): RatioResults => {
  let income = 0;
  if (inputs.incomeType === "annual") {
    income = (parseFloat(inputs.annualIncome) || 0) / 12;
  } else {
    income = parseFloat(inputs.monthlyIncome) || 0;
  }

  const pi = parseFloat(inputs.monthlyPI) || 0;
  const tax = parseFloat(inputs.monthlyTax) || 0;
  const insurance = parseFloat(inputs.monthlyInsurance) || 0;
  const hoa = parseFloat(inputs.monthlyHoa) || 0;
  const pmi = parseFloat(inputs.monthlyPmi) || 0;

  const housingExpenses = pi + tax + insurance + hoa + pmi;
  const housingRatio = income > 0 ? (housingExpenses / income) * 100 : 0;
  
  const targetRatio = 28;
  const maxRecommendedExpense = income * (targetRatio / 100);
  const excessExpense = housingExpenses - maxRecommendedExpense;

  let status = "N/A";
  let statusColor = "text-muted-foreground";

  if (income > 0) {
    if (housingRatio <= 28) { status = "Excellent (Below 28%)"; statusColor = "text-green-600"; }
    else if (housingRatio <= 31) { status = "Good (Borderline)"; statusColor = "text-green-500"; }
    else if (housingRatio <= 43) { status = "High Risk (Hard to qualify)"; statusColor = "text-orange-500"; }
    else { status = "Danger (Highly Unlikely to Qualify)"; statusColor = "text-destructive"; }
  }

  const remainingIncome = Math.max(0, income - housingExpenses);

  const chartData = [
    { name: "Principal & Interest", value: pi, color: "hsl(var(--primary))" },
    { name: "Taxes & Ins & HOA", value: tax + insurance + hoa + pmi, color: "#f59e0b" },
    { name: "Remaining Income", value: remainingIncome, color: "#10b981" }
  ].filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Gross Monthly Income", value: income },
    { label: "Max Recommended Housing (28%)", value: maxRecommendedExpense },
    { label: "Your Total Housing Expenses", value: -housingExpenses, isBold: true },
    { label: "Amount Over/Under Target", value: -excessExpense, isGreen: excessExpense <= 0 }
  ];

  return {
    income,
    housingExpenses,
    housingRatio,
    maxRecommendedExpense,
    excessExpense,
    remainingIncome,
    backEndCapacity: Math.max(0, income * 0.36 - housingExpenses),
    status,
    statusColor,
    chartData,
    breakdownRows
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const DEFAULTS = {
  incomeType: "annual",
  annualIncome: "120000",
  monthlyIncome: "10000",
  monthlyPI: "2200",
  monthlyTax: "400",
  monthlyInsurance: "150",
  monthlyHoa: "200",
  monthlyPmi: "0"
};

export default function HousingRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RatioResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateHousingRatio(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateHousingRatio(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateHousingRatio(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Housing Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Housing Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="col-span-2">
                <label className="flex items-center text-[13px] font-semibold text-foreground mb-1">Income Input Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="incomeType" checked={inputs.incomeType === "annual"} onChange={() => handleChange("incomeType", "annual")} className="accent-primary w-4 h-4" /> Annual Income
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="incomeType" checked={inputs.incomeType === "monthly"} onChange={() => handleChange("incomeType", "monthly")} className="accent-primary w-4 h-4" /> Monthly Income
                  </label>
                </div>
              </div>
              
              {inputs.incomeType === "annual" ? (
                <CompactInput id="annualIncome" label="Gross Annual Income" value={inputs.annualIncome} onChange={(v: string) => handleChange("annualIncome", v)} prefix="$" />
              ) : (
                <CompactInput id="monthlyIncome" label="Gross Monthly Income" value={inputs.monthlyIncome} onChange={(v: string) => handleChange("monthlyIncome", v)} prefix="$" />
              )}
            </div>

            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1 mt-1">Monthly Housing Expenses</div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="monthlyPI" label="Principal & Interest" value={inputs.monthlyPI} onChange={(v: string) => handleChange("monthlyPI", v)} prefix="$" />
              <CompactInput id="monthlyTax" label="Property Taxes" value={inputs.monthlyTax} onChange={(v: string) => handleChange("monthlyTax", v)} prefix="$" />
              <CompactInput id="monthlyInsurance" label="Home Insurance" value={inputs.monthlyInsurance} onChange={(v: string) => handleChange("monthlyInsurance", v)} prefix="$" />
              <CompactInput id="monthlyHoa" label="HOA Fees" value={inputs.monthlyHoa} onChange={(v: string) => handleChange("monthlyHoa", v)} prefix="$" />
              <CompactInput id="monthlyPmi" label="PMI (if any)" value={inputs.monthlyPmi} onChange={(v: string) => handleChange("monthlyPmi", v)} prefix="$" />
            </div>
            
            <div className="flex gap-2.5 mt-3">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Housing Ratio (Front-End Ratio)</div>
                  <div className="text-4xl font-bold text-primary">{results.housingRatio.toFixed(2)}%</div>
                  <div className={`text-sm font-bold mt-1 ${results.statusColor}`}>{results.status}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Housing Expense</div>
                    <div className="text-sm font-bold text-destructive">${results.housingExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Recommend (28%)</div>
                    <div className="text-sm font-bold text-green-600">${results.maxRecommendedExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {results.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Housing Expense Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Category</th>
                          <th className="py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${row.isBold ? 'font-bold bg-muted/20 text-primary' : ''}`}>
                            <td className="text-left py-2.5">{row.label}</td>
                            <td className={`py-2.5 ${row.value < 0 && !row.isGreen ? 'text-destructive' : ''} ${row.isGreen ? 'text-green-600 font-bold' : ''}`}>
                              {row.value < 0 ? "-" : ""}${Math.abs(row.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5 mt-4">
                  <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Gross Monthly Income</span>
                      <span className="font-medium">${results.income.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Total Housing Expense</span>
                      <span className="font-medium text-destructive">${results.housingExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Max Recommended (28%)</span>
                      <span className="font-medium text-green-600">${results.maxRecommendedExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Amount Over/Under Target</span>
                      <span className={`font-medium ${results.excessExpense > 0 ? "text-destructive" : "text-green-600"}`}>
                        {results.excessExpense > 0 ? "+" : ""}${results.excessExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Remaining After Housing</span>
                      <span className="font-medium">${results.remainingIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Back-End Room (36%)</span>
                      <span className="font-medium">${results.backEndCapacity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Lender Assessment</span>
                      <span className={`font-medium ${results.statusColor}`}>{results.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Income Basis</span>
                      <span className="font-medium capitalize">{inputs.incomeType}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t-2 border-border pt-3 mt-1 font-bold text-primary">
                    <span>Housing Ratio (Front-End)</span>
                    <span>{results.housingRatio.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mt-12 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What Is the Housing Ratio?</h2>
          <p>The housing ratio, also known as the front-end ratio, is the percentage of your gross monthly income that goes toward paying your total housing costs. It is a critical metric used by mortgage lenders to determine how much home you can afford.</p>
          
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p>The calculation is simple: <strong>Housing Ratio = (Total Monthly Housing Expenses / Gross Monthly Income) × 100</strong>. "Total Monthly Housing Expenses" is also known as PITI (Principal, Interest, Taxes, and Insurance) and must also include any HOA fees and Private Mortgage Insurance (PMI).</p>

          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p>The standard rule of thumb for mortgage underwriting is the "28/36 Rule". This means your housing ratio should not exceed 28% of your gross income, and your total debt-to-income ratio (including car loans and credit cards) should not exceed 36%.</p>
          
          <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
          <p>Gross income is your income <em>before</em> taxes are taken out. This is a common point of confusion for first-time buyers who often calculate their ratio using their take-home pay. Lenders always use your gross, pre-tax income.</p>
          
          <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
          <p>If you earn $120,000 per year, your gross monthly income is $10,000. Under the 28% rule, your maximum allowed housing payment (including taxes and insurance) is $2,800. If your proposed mortgage payment is $3,200, your ratio is 32%, which may make qualifying more difficult.</p>
          
          <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
          <p>While some FHA and conventional loans allow housing ratios up to 43% (or higher in some automated underwriting scenarios), keeping your ratio below 28% is the safest way to ensure you don't become "house poor" and have enough cash leftover for emergencies and living expenses.</p>
          
          <h2 className="text-2xl font-bold mb-3">Benefits</h2>
          <p>By calculating your housing ratio before you start house hunting, you can set a realistic budget for your home search, ensuring you only look at houses that a bank will actually approve you to buy.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/housing-ratio-calculator" faqs={[
          { question: "What is a good housing ratio?", answer: "A ratio of 28% or lower is considered excellent and is the benchmark for conventional lending. Ratios up to 31% are acceptable for FHA loans, and some lenders will go higher if you have excellent credit." },
          { question: "Does the housing ratio include utilities?", answer: "No. The housing ratio (front-end ratio) only includes the mortgage principal, interest, property taxes, homeowners insurance, HOA fees, and PMI. It does not include gas, electric, water, or internet bills." },
          { question: "What is the difference between front-end and back-end ratio?", answer: "The front-end ratio is just your housing expenses divided by income. The back-end ratio (Total DTI) is your housing expenses PLUS all your other monthly debt payments (car loans, student loans, credit cards) divided by income." },
          { question: "Can I get a mortgage with a housing ratio of 40%?", answer: "It is possible, but difficult. Some lenders allow higher ratios if you have compensating factors, such as a large down payment, substantial cash reserves, or a very high credit score (760+)." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
