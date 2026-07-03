"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface DepreciationInputs {
  purchasePrice: number;
  landValue: number;
  propertyType: "residential" | "commercial";
  closingCosts: number;
  improvements: number;
  monthPlacedInService: number; // 1-12
}

interface DepreciationResult {
  costBasis: number;
  annualDepreciation: number;
  firstYearDepreciation: number;
  usefulLife: number;
  totalDepreciableBasis: number;
  landRatio: number;
  chartData: { name: string; value: number; fill: string }[];
  yearlyData: { year: number; deduction: number; remainingBasis: number }[];
}

const DEFAULTS = {
  purchasePrice: "500000",
  landValue: "100000",
  propertyType: "residential" as "residential" | "commercial",
  closingCosts: "15000",
  improvements: "25000",
  monthPlacedInService: "1", // January
};

function calculate(inputs: DepreciationInputs): DepreciationResult {
  const pp = inputs.purchasePrice;
  const lv = inputs.landValue;
  const cc = inputs.closingCosts;
  const imp = inputs.improvements;
  const month = inputs.monthPlacedInService;
  
  // Land cannot be depreciated.
  const costBasis = pp + cc + imp;
  const depreciableBasis = Math.max(0, costBasis - lv);
  
  const usefulLife = inputs.propertyType === "residential" ? 27.5 : 39;
  const annualDepreciation = depreciableBasis / usefulLife;
  
  // IRS Mid-Month Convention for the first year
  // e.g. January (1) gets 11.5 months of depreciation.
  // formula: (12.5 - month) / 12
  const firstYearFraction = (12.5 - Math.max(1, Math.min(12, month))) / 12;
  const firstYearDepreciation = annualDepreciation * firstYearFraction;

  const chartData = [
    { name: "Building Value", value: pp - lv, fill: "hsl(var(--primary))" },
    { name: "Land Value", value: lv, fill: "#f59e0b" },
    { name: "Closing Costs", value: cc, fill: "#8b5cf6" },
    { name: "Improvements", value: imp, fill: "#10b981" },
  ].filter(d => d.value > 0);

  const landRatio = pp > 0 ? (lv / pp) * 100 : 0;

  // Generate an amortization schedule of depreciation
  const yearlyData = [];
  let remaining = depreciableBasis;
  let year = 1;
  
  // Year 1
  yearlyData.push({
    year,
    deduction: firstYearDepreciation,
    remainingBasis: remaining - firstYearDepreciation
  });
  remaining -= firstYearDepreciation;
  year++;

  // Full years
  const fullYears = Math.floor(usefulLife);
  for (let i = 0; i < fullYears - 1; i++) {
    yearlyData.push({
      year,
      deduction: annualDepreciation,
      remainingBasis: remaining - annualDepreciation
    });
    remaining -= annualDepreciation;
    year++;
  }

  // Final partial year
  if (remaining > 0.01) {
    yearlyData.push({
      year,
      deduction: remaining,
      remainingBasis: 0
    });
  }

  return {
    costBasis,
    annualDepreciation,
    firstYearDepreciation,
    usefulLife,
    totalDepreciableBasis: depreciableBasis,
    landRatio,
    chartData,
    yearlyData
  };
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  [key: string]: unknown;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const fmtCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function RentalPropertyDepreciationCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(DEFAULTS.purchasePrice);
  const [landValue, setLandValue] = useState(DEFAULTS.landValue);
  const [propertyType, setPropertyType] = useState(DEFAULTS.propertyType);
  const [closingCosts, setClosingCosts] = useState(DEFAULTS.closingCosts);
  const [improvements, setImprovements] = useState(DEFAULTS.improvements);
  const [monthPlacedInService, setMonthPlacedInService] = useState(DEFAULTS.monthPlacedInService);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<DepreciationResult | null>(null);

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const inputs: DepreciationInputs = {
      purchasePrice: parseFloat(purchasePrice) || 0,
      landValue: parseFloat(landValue) || 0,
      propertyType: propertyType,
      closingCosts: parseFloat(closingCosts) || 0,
      improvements: parseFloat(improvements) || 0,
      monthPlacedInService: parseInt(monthPlacedInService) || 1,
    };
    setResult(calculate(inputs));
  };

  const reset = () => {
    setPurchasePrice(DEFAULTS.purchasePrice);
    setLandValue(DEFAULTS.landValue);
    setPropertyType(DEFAULTS.propertyType);
    setClosingCosts(DEFAULTS.closingCosts);
    setImprovements(DEFAULTS.improvements);
    setMonthPlacedInService(DEFAULTS.monthPlacedInService);
    setShowAdvanced(false);

    setResult(calculate({
      purchasePrice: parseFloat(DEFAULTS.purchasePrice),
      landValue: parseFloat(DEFAULTS.landValue),
      propertyType: DEFAULTS.propertyType,
      closingCosts: parseFloat(DEFAULTS.closingCosts),
      improvements: parseFloat(DEFAULTS.improvements),
      monthPlacedInService: parseInt(DEFAULTS.monthPlacedInService),
    }));
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const faqs = [
    { question: "What is rental property depreciation?", answer: "Rental property depreciation is a tax deduction that allows real estate investors to recover the cost of an income-producing property over its useful life. The IRS recognizes that physical structures undergo wear and tear over time, so they permit owners to deduct a portion of the property's value from their taxable income each year, significantly reducing their tax burden." },
    { question: "Why is land value subtracted from the purchase price?", answer: "According to IRS rules, land never depreciates because it doesn't wear out or get used up. Therefore, you can only depreciate the value of the physical building (the structure) and its improvements. To calculate your depreciable basis, you must subtract the estimated value of the land from the total purchase price of the property." },
    { question: "How long is the depreciation period for rental property?", answer: "Under the Modified Accelerated Cost Recovery System (MACRS), residential rental property (like single-family homes, duplexes, or apartment buildings) is depreciated over 27.5 years. Nonresidential commercial property (like retail stores, office buildings, or warehouses) is depreciated over 39 years." },
    { question: "What is the Mid-Month Convention?", answer: "The IRS requires the use of the mid-month convention for real estate depreciation. This means that no matter what day of the month you place a property into service (rent it out or make it available for rent), it is treated as if it were placed in service exactly in the middle of that month. For example, if you place a home in service on January 2nd or January 29th, you get 11.5 months of depreciation for that first year." },
    { question: "Can I depreciate closing costs and improvements?", answer: "Yes. Certain settlement fees and closing costs (like title insurance, legal fees, and recording fees) are added to your cost basis. Additionally, capital improvements made before placing the property in service (like a new roof or full remodel) are added to the basis and depreciated over the same 27.5 or 39-year schedule." },
    { question: "What happens to depreciation when I sell the property?", answer: "When you sell a rental property, you are subject to 'depreciation recapture.' The IRS requires you to pay taxes on the depreciation deductions you took (or were entitled to take) over the years you owned the property. This recapture is taxed at a maximum rate of 25%. Many investors use a 1031 Exchange to defer this tax." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rental Property Depreciation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rental Property Depreciation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Normal Tier */}
            <div className="flex flex-col gap-4">
              <CompactInput
                id="purchase-price"
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                prefix="$"
              />
              <CompactInput
                id="land-value"
                label="Land Value (Cannot be depreciated)"
                value={landValue}
                onChange={setLandValue}
                prefix="$"
              />
              
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Property Type
                </label>
                <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                  <button
                    type="button"
                    onClick={() => setPropertyType("residential")}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      propertyType === "residential"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Residential (27.5 Yrs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType("commercial")}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${
                      propertyType === "commercial"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Commercial (39 Yrs)
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="col-span-2 text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Capitalized Costs</div>
                  <CompactInput
                    id="closing-costs"
                    label="Closing Costs"
                    value={closingCosts}
                    onChange={setClosingCosts}
                    prefix="$"
                  />
                  <CompactInput
                    id="improvements"
                    label="Improvements"
                    value={improvements}
                    onChange={setImprovements}
                    prefix="$"
                  />
                  
                  <div className="col-span-2 mt-2">
                    <label htmlFor="service-month" className="text-sm font-semibold text-foreground mb-1 block">Month Placed in Service</label>
                    <select
                      id="service-month"
                      value={monthPlacedInService}
                      onChange={(e) => setMonthPlacedInService(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      {months.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">First year depreciation uses the IRS mid-month convention.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Annual Tax Deduction</p>
                  <p className="text-4xl font-black text-primary">{fmtCurrency(result.annualDepreciation)} <span className="text-xl font-bold text-muted-foreground">/ yr</span></p>
                  <p className="text-sm text-muted-foreground mt-1">
                    First Year Deduction: <strong>{fmtCurrency(result.firstYearDepreciation)}</strong> (Mid-Month Convention)
                  </p>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Depreciable Basis</p>
                    <p className="text-base font-bold text-foreground">{fmtCurrency(result.totalDepreciableBasis)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Useful Life</p>
                    <p className="text-base font-bold text-foreground">{result.usefulLife} Years</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Land Ratio</p>
                    <p className="text-base font-bold text-foreground">{result.landRatio.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Breakdown Chart */}
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-2 text-center">Cost Basis Breakdown</p>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={result.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {result.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(v: number | string) => [`$${Number(v).toLocaleString()}`, "Amount"]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {result.chartData.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: entry.fill }}></div>
                            {entry.name}
                          </div>
                          <span className="font-medium text-foreground">{fmtCurrency(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Depreciation Schedule Snippet */}
                  <div className="bg-card border border-border rounded-lg p-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground p-4 pb-2 text-center border-b border-border">Depreciation Schedule</p>
                    <div className="overflow-y-auto max-h-[260px]">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left font-semibold text-muted-foreground px-4 py-2">Year</th>
                            <th className="text-right font-semibold text-muted-foreground px-4 py-2">Deduction</th>
                            <th className="text-right font-semibold text-muted-foreground px-4 py-2">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.yearlyData.filter(r => r.year <= 5 || r.year === Math.ceil(result.usefulLife)).map((row) => (
                            <tr key={row.year} className="hover:bg-muted/30">
                              <td className="px-4 py-2 font-medium">Year {row.year}</td>
                              <td className="px-4 py-2 text-right font-medium text-green-600">{fmtCurrency(row.deduction)}</td>
                              <td className="px-4 py-2 text-right text-muted-foreground">{fmtCurrency(row.remainingBasis)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t border-border mt-auto">
                      Showing Years 1-5 and Final Year
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-10" />
          
          <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary mb-12">
            <section className="mb-8">
              <h2>What Is Rental Property Depreciation?</h2>
              <p>Rental property depreciation is one of the most powerful tax advantages available to real estate investors. It is an income tax deduction that allows you to recover the cost of an income-producing property over a period of time specified by the IRS. Essentially, it accounts for the wear and tear, deterioration, and obsolescence of the physical building.</p>
              <p>Unlike regular expenses (like repairs or property management fees) that are deducted fully in the year they are incurred, the cost of the property itself is capitalized and deducted gradually over its "useful life." This creates a non-cash deduction that offsets your rental income, often allowing real estate investors to generate positive cash flow while reporting a tax loss.</p>
            </section>

            <section className="mb-8">
              <h2>How to Calculate Depreciable Basis</h2>
              <p>You cannot simply depreciate the purchase price of the property. The IRS mandates that <strong>land does not depreciate</strong> because it does not wear out. Therefore, you must separate the value of the land from the value of the building.</p>
              <p><strong>Cost Basis = Purchase Price + Capitalized Closing Costs + Initial Improvements</strong></p>
              <p><strong>Depreciable Basis = Cost Basis − Land Value</strong></p>
              <p>For example, if you buy a $500,000 property, and the local tax assessor values the land at $100,000, your depreciable basis (assuming no other costs) is $400,000. You will only calculate depreciation on that $400,000.</p>
            </section>

            <section className="mb-8">
              <h2>Residential vs. Commercial Useful Life</h2>
              <p>The IRS uses the Modified Accelerated Cost Recovery System (MACRS) to dictate how long a property must be depreciated:</p>
              <ul>
                <li><strong>Residential Rental Property:</strong> Depreciated over <strong>27.5 years</strong>. This includes single-family homes, duplexes, and apartment buildings where 80% or more of the gross rental income comes from dwelling units.</li>
                <li><strong>Commercial Property:</strong> Depreciated over <strong>39 years</strong>. This applies to nonresidential real estate like office buildings, retail centers, and industrial warehouses.</li>
              </ul>
              <p>Using the previous $400,000 example, a residential property would yield an annual deduction of $14,545 ($400,000 ÷ 27.5), while a commercial property would yield $10,256 ($400,000 ÷ 39).</p>
            </section>

            <section className="mb-8">
              <h2>The IRS Mid-Month Convention</h2>
              <p>You rarely get a full year of depreciation in the year you buy a property. The IRS requires the use of the "mid-month convention" for the first year. This rule assumes you placed the property in service exactly in the middle of the month, regardless of the actual day.</p>
              <p>If you place a residential property in service in July, you get 5.5 months of depreciation for that first calendar year (July 15 to December 31). The formula is: <code>(12.5 - Month) / 12 * Annual Depreciation</code>. Our calculator automatically applies this convention to provide an accurate First Year Deduction figure.</p>
            </section>

            <section className="mb-8">
              <h2>Closing Costs & Capital Improvements</h2>
              <p>Certain costs incurred during the purchase process must be capitalized (added to your basis) rather than deducted immediately. These include abstract fees, legal fees, recording fees, surveys, and title insurance.</p>
              <p>Similarly, if you buy a fixer-upper and spend $25,000 on a new roof and HVAC system before renting it out, that $25,000 is considered a capital improvement. It increases your cost basis and is depreciated along with the building.</p>
            </section>

            <section className="mb-8">
              <h2>Depreciation Recapture When Selling</h2>
              <p>It is crucial to understand that depreciation is not completely free money; it lowers your cost basis. If you bought a $500,000 property, took $100,000 in depreciation over several years, and then sold it, the IRS considers your adjusted cost basis to be $400,000.</p>
              <p>If you sell the property for $600,000, you have a $200,000 total gain. The $100,000 of that gain attributed to depreciation is subject to "depreciation recapture" tax at a maximum rate of 25%. The remaining $100,000 is taxed at long-term capital gains rates. Many real estate investors utilize a 1031 Exchange to continually defer these taxes by rolling the proceeds into a new property.</p>
            </section>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rental-property-depreciation-calculator" />
          <PopularCalculators exclude="/calculator/rental-property-depreciation-calculator" />
        </div>
      </div>
    </>
  );
}
