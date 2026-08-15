"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface LtcInputs {
  loanAmount: number;
  totalCost: number;
  estimatedArv: number;
  maxLtcPolicy: number;
}

interface LtcResults {
  ltcRatio: number;
  ltvRatio: number;
  equityRequired: number;
  qualifiesLtc: boolean;
  maxLoanAmount: number;
}

const DEFAULTS = {
  loanAmount: "800000",
  totalCost: "1000000",
  estimatedArv: "1200000",
  maxLtcPolicy: "80"
};

const calculateLtc = (inputs: LtcInputs): LtcResults => {
  const { loanAmount, totalCost, estimatedArv, maxLtcPolicy } = inputs;
  
  if (loanAmount <= 0 || totalCost <= 0) {
    return {
      ltcRatio: 0,
      ltvRatio: 0,
      equityRequired: 0,
      qualifiesLtc: false,
      maxLoanAmount: 0
    };
  }

  const ltcRatio = (loanAmount / totalCost) * 100;
  const ltvRatio = estimatedArv > 0 ? (loanAmount / estimatedArv) * 100 : 0;
  const equityRequired = Math.max(0, totalCost - loanAmount);
  const maxLoanAmount = (maxLtcPolicy / 100) * totalCost;
  const qualifiesLtc = ltcRatio <= maxLtcPolicy;

  return {
    ltcRatio,
    ltvRatio,
    equityRequired,
    qualifiesLtc,
    maxLoanAmount
  };
};

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
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

const LoanToCostRatioCalculator = () => {
  // Normal Tier Inputs
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [totalCost, setTotalCost] = useState(DEFAULTS.totalCost);

  // Second Tier Inputs (Advanced Options)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedArv, setEstimatedArv] = useState(DEFAULTS.estimatedArv);
  const [maxLtcPolicy, setMaxLtcPolicy] = useState(DEFAULTS.maxLtcPolicy);

  // State for calculation
  const [results, setResults] = useState<LtcResults | null>(() => 
    calculateLtc({
      loanAmount: parseFloat(DEFAULTS.loanAmount) || 0,
      totalCost: parseFloat(DEFAULTS.totalCost) || 0,
      estimatedArv: parseFloat(DEFAULTS.estimatedArv) || 0,
      maxLtcPolicy: parseFloat(DEFAULTS.maxLtcPolicy) || 0,
    })
  );

  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculate = () => {
    const calcResults = calculateLtc({
      loanAmount: parseFloat(loanAmount) || 0,
      totalCost: parseFloat(totalCost) || 0,
      estimatedArv: parseFloat(estimatedArv) || 0,
      maxLtcPolicy: parseFloat(maxLtcPolicy) || 0,
    });
    setResults(calcResults);
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setTotalCost(DEFAULTS.totalCost);
    setEstimatedArv(DEFAULTS.estimatedArv);
    setMaxLtcPolicy(DEFAULTS.maxLtcPolicy);
    setResults(calculateLtc({
      loanAmount: parseFloat(DEFAULTS.loanAmount) || 0,
      totalCost: parseFloat(DEFAULTS.totalCost) || 0,
      estimatedArv: parseFloat(DEFAULTS.estimatedArv) || 0,
      maxLtcPolicy: parseFloat(DEFAULTS.maxLtcPolicy) || 0,
    }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Loan-to-Cost (LTC) Ratio Calculator – Racira</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const currentLoanAmt = parseFloat(loanAmount) || 0;
  const currentTotalCost = parseFloat(totalCost) || 0;

  const pieData = results && currentTotalCost > 0
    ? [
        { name: "Loan Amount", value: currentLoanAmt, color: "hsl(var(--primary))" },
        { name: "Equity Required", value: results.equityRequired, color: "#10b981" },
      ]
    : [];

  const activePieData = pieData.filter((d) => d.value > 0);

  const faqs = [
    { question: "What is the Loan-to-Cost (LTC) Ratio?", answer: "The Loan-to-Cost (LTC) ratio is a metric used in commercial real estate construction to compare the financing amount of a project to its total cost. It helps lenders assess the risk of offering a loan. A lower LTC indicates more equity from the borrower, which generally means lower risk for the lender." },
    { question: "How does LTC differ from LTV (Loan-to-Value)?", answer: "LTC compares the loan amount to the total cost to build or acquire a project, while LTV (Loan-to-Value) compares the loan amount to the estimated value of the project after it is completed (As-Completed Value or ARV). Both metrics are used by lenders, but LTC is specifically focused on hard and soft costs during construction." },
    { question: "What is a good Loan-to-Cost ratio?", answer: "Most commercial lenders typically finance up to 80% LTC for construction projects, meaning the borrower must provide at least 20% of the project's cost as equity. However, acceptable LTC ratios vary by property type, market conditions, and borrower experience." },
    { question: "How is Equity Required calculated?", answer: "Equity required is the difference between the total project cost and the loan amount. If your total project cost is $1,000,000 and the loan amount is $800,000, the equity required from the borrower is $200,000." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Loan-to-Cost (LTC) Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan-to-Cost (LTC) Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">

            {/* Normal Tier Inputs */}
            <div className="flex flex-col gap-4">
              <CompactInput
                id="loan-amount"
                label="Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                prefix="$"
              />

              <CompactInput
                id="total-cost"
                label="Total Project Cost"
                value={totalCost}
                onChange={setTotalCost}
                prefix="$"
              />
            </div>

            {/* Advanced Options (Second Tier 2A) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-3 focus:outline-none bg-transparent border-none p-0"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="col-span-full mb-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Project Refinements</span>
                  </div>
                  <CompactInput
                    id="estimated-arv"
                    label="Estimated ARV"
                    value={estimatedArv}
                    onChange={setEstimatedArv}
                    prefix="$"
                  />
                  <CompactInput
                    id="max-ltc"
                    label="Lender Max LTC"
                    value={maxLtcPolicy}
                    onChange={setMaxLtcPolicy}
                    suffix="%"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                {/* Print Button */}
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none bg-transparent border-none p-0">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Loan-to-Cost Ratio</div>
                  <div className="text-4xl font-bold text-primary mb-1">
                    {results.ltcRatio.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Required Equity: ${results.equityRequired.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-2 divide-x divide-border bg-card border border-border rounded-lg p-3">
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="text-xs uppercase text-muted-foreground mb-1 font-semibold tracking-wider">Status</span>
                    <span className={`text-lg font-bold ${results.qualifiesLtc ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      {results.qualifiesLtc ? "Qualifies" : "Over Limit"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="text-xs uppercase text-muted-foreground mb-1 font-semibold tracking-wider">Max Loan</span>
                    <span className="text-lg font-bold text-foreground">
                      ${results.maxLoanAmount >= 1000000 ? (results.maxLoanAmount / 1000000).toFixed(2) + "M" : (results.maxLoanAmount / 1000).toFixed(0) + "k"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="text-xs uppercase text-muted-foreground mb-1 font-semibold tracking-wider">Est. LTV</span>
                    <span className="text-lg font-bold text-foreground">
                      {results.ltvRatio > 0 ? results.ltvRatio.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + "%" : "N/A"}
                    </span>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Capital Stack</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                        <th className="p-2.5 pr-3 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="hover:bg-secondary/20 transition-colors text-muted-foreground">
                        <td className="text-base py-2.5 px-3 font-semibold text-foreground">Loan Amount</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          ${currentLoanAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          {results.ltcRatio.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/20 transition-colors text-muted-foreground">
                        <td className="text-base py-2.5 px-3 font-semibold text-foreground">Equity Required</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          ${results.equityRequired.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          {Math.max(0, 100 - results.ltcRatio).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/20 transition-colors font-bold bg-secondary/30 text-foreground text-base border-t border-border border-t-2">
                        <td className="text-base py-2.5 px-3 font-semibold text-foreground">Total Project Cost</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          ${currentTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">
                          100.0%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart & 5. Summary Statistics side-by-side */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Chart (Recharts) */}
                  <div className="w-full sm:w-1/2 p-4 rounded-xl border border-border bg-card flex flex-col items-center justify-center">
                    {mounted && activePieData.length > 0 ? (
                      <div className="w-[200px] h-[200px] relative">
                        <LazyView minHeight={200}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={activePieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {activePieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </LazyView>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                          <span className="text-lg font-extrabold text-foreground leading-tight">
                            ${currentTotalCost >= 1000000 ? (currentTotalCost / 1000000).toFixed(2) + "M" : (currentTotalCost / 1000).toFixed(0) + "k"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-[13px]">
                        Calculating chart...
                      </div>
                    )}
                  </div>

                  {/* Summary Statistics */}
                  <div className="w-full sm:w-1/2 bg-muted/30 rounded-lg p-5 flex flex-col justify-center border border-border">
                    <h4 className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Project Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">Loan Amount</span>
                        <span className="text-base font-semibold text-foreground">${currentLoanAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">Equity Req.</span>
                        <span className="text-base font-semibold text-foreground">${results.equityRequired.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">Max LTC</span>
                        <span className="text-base font-semibold text-foreground">{parseFloat(maxLtcPolicy) || 0}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">Max Loan</span>
                        <span className="text-base font-semibold text-foreground">${results.maxLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-xs text-muted-foreground mb-0.5">Estimated ARV</span>
                        <span className="text-base font-semibold text-foreground">${(parseFloat(estimatedArv) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <section className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">What Is a Loan-to-Cost (LTC) Ratio Calculator?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Loan-to-Cost (LTC) ratio calculator is a specialized financial tool used primarily in commercial real estate and construction lending. It measures the loan amount against the total cost required to complete a project. Unlike traditional mortgages that focus on the current appraised value of a property, construction lenders need to evaluate the hard and soft costs of building something new or heavily renovating an existing structure. By calculating your LTC ratio, you can determine exactly how much equity you need to bring to the table and whether your financing request aligns with standard lending practices in the commercial real estate market.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">How It Works</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The fundamental mathematics behind the Loan-to-Cost ratio are straightforward. The formula takes the total loan amount requested and divides it by the total project cost. The total project cost typically includes land acquisition costs, hard construction costs, and soft costs such as architectural fees and permits. The resulting decimal is multiplied by one hundred to express it as a percentage. For example, a loan amount of eight hundred thousand dollars divided by a total project cost of one million dollars yields an LTC ratio of eighty percent. The remaining twenty percent represents the equity required from the borrower to fund the project.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you use the calculator, the primary output is your LTC ratio expressed as a percentage. Alongside this, you will see the exact equity required, which is simply the total project cost minus the loan amount. If you have entered your lender's maximum LTC policy, the calculator will immediately show whether your proposed capital stack qualifies for financing. If your calculated LTC is higher than the lender's maximum policy, the status will indicate that you are over the limit, meaning you either need to increase your equity contribution, lower the project costs, or seek alternative financing structures.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The primary inputs that drive your results are the loan amount and the total project cost. Because commercial construction involves significant risk, lenders rely heavily on the accuracy of your total cost estimates. If your total project cost increases mid-construction and your loan amount is fixed, your effective equity requirement will increase unexpectedly. It is crucial to have a comprehensive and well-documented project budget before applying for a loan. The total project cost must account for all variables, including a contingency fund to handle unforeseen expenses during the build phase.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our calculator includes advanced options to refine your project analysis. You can input the Estimated After-Repair Value (ARV), which is the projected market value of the property once construction is complete. This allows the calculator to simultaneously compute the Loan-to-Value (LTV) ratio alongside the LTC ratio. Lenders almost always evaluate both metrics; a project might pass the LTC requirement but fail if the LTV ratio is too high based on the projected final value. Additionally, you can adjust the lender maximum LTC policy to see exactly what your maximum approved loan amount would be under different lending scenarios.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Consider a real estate developer planning to build a multi-family property. The land costs two hundred thousand dollars, and construction costs are estimated at eight hundred thousand dollars, bringing the total project cost to one million dollars. The developer requests a loan of seven hundred and fifty thousand dollars. The calculator determines the LTC ratio is seventy-five percent, requiring two hundred and fifty thousand dollars in equity. If the estimated ARV is one point two million dollars, the calculated LTV ratio is sixty-two point five percent. Since typical lenders allow up to eighty percent LTC and seventy percent LTV, this project comfortably qualifies on both fronts.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When preparing a construction loan application, always provide your lender with a detailed line-item budget. Lenders will heavily scrutinize your total project cost to ensure the LTC ratio is realistic. It is highly recommended to include a contingency buffer of five to ten percent within your total project cost. Furthermore, keep in mind that while a lender might approve an eighty percent LTC loan, they will typically release funds in draws as construction progresses rather than all at once. Having strong liquidity beyond your initial equity contribution is essential to keep the project moving between loan disbursements.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Benefits</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizing a Loan-to-Cost ratio calculator gives real estate investors and developers a clear understanding of the capital required to launch a project. It bridges the gap between estimated project costs and available financing, ensuring that your capital stack is viable before you approach a lender. By analyzing both the LTC and LTV metrics simultaneously through the advanced options, you can present a thoroughly vetted project proposal that demonstrates financial prudence, thereby significantly increasing your chances of securing the necessary construction funding.
                </p>
              </div>
            </section>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-to-cost-ltc-ratio-calculator" />
          <PopularCalculators exclude="/calculator/loan-to-cost-ltc-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default LoanToCostRatioCalculator;
