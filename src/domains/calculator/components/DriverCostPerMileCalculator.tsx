"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { DollarSign, RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface DriverCostResults {
  costPerMile: number;
  totalAnnualCost: number;
  totalPayroll: number;
  totalBenefits: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDriverCost = (inputs: typeof DEFAULTS): DriverCostResults => {
  const hourlyRate = parseFloat(inputs.hourlyRate);
  const hoursPerWeek = parseFloat(inputs.hoursPerWeek);
  const weeksPerYear = parseFloat(inputs.weeksPerYear);
  const annualBenefits = parseFloat(inputs.annualBenefits);
  const payrollTaxRate = parseFloat(inputs.payrollTaxRate) / 100;
  const annualMiles = parseFloat(inputs.annualMiles);

  if (isNaN(hourlyRate) || hourlyRate <= 0 || isNaN(hoursPerWeek) || hoursPerWeek <= 0 || 
      isNaN(weeksPerYear) || weeksPerYear <= 0 || isNaN(annualBenefits) || annualBenefits < 0 || 
      isNaN(payrollTaxRate) || payrollTaxRate < 0 || isNaN(annualMiles) || annualMiles <= 0) {
    return {
      costPerMile: 0, totalAnnualCost: 0, totalPayroll: 0, totalBenefits: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Calculate Base Payroll
  // Assuming anything over 40 hours is time-and-a-half overtime
  let baseHours = hoursPerWeek;
  let overtimeHours = 0;
  
  if (hoursPerWeek > 40) {
    baseHours = 40;
    overtimeHours = hoursPerWeek - 40;
  }

  const weeklyBasePay = baseHours * hourlyRate;
  const weeklyOvertimePay = overtimeHours * (hourlyRate * 1.5);
  const weeklyTotalPay = weeklyBasePay + weeklyOvertimePay;
  
  const annualGrossPayroll = weeklyTotalPay * weeksPerYear;

  // Calculate Employer Taxes (FICA, Unemployment, etc.)
  const employerTaxes = annualGrossPayroll * payrollTaxRate;

  // Total Costs
  const totalPayroll = annualGrossPayroll;
  const totalBenefits = annualBenefits + employerTaxes;
  const totalAnnualCost = totalPayroll + totalBenefits;

  // Cost Per Mile (CPM)
  const costPerMile = totalAnnualCost / annualMiles;

  // Generate chart data: Breakdown of where the money goes
  const chartData = [
    { name: "Base Salary", value: Math.round(weeklyBasePay * weeksPerYear), fill: "hsl(var(--primary))" },
    { name: "Overtime Pay", value: Math.round(weeklyOvertimePay * weeksPerYear), fill: "hsl(var(--orange-500))" },
    { name: "Employer Taxes", value: Math.round(employerTaxes), fill: "hsl(var(--destructive))" },
    { name: "Benefits/Insurance", value: Math.round(annualBenefits), fill: "hsl(var(--blue-500))" }
  ];

  // Filter out $0 slices
  const filteredChartData = chartData.filter(d => d.value > 0);

  // Schedule to show the impact of changing annual mileage (+/- 10,000 miles)
  const schedule: any[] = [];
  const mileageVariations = [
    annualMiles - 20000, 
    annualMiles - 10000, 
    annualMiles, 
    annualMiles + 10000, 
    annualMiles + 20000
  ];
  
  mileageVariations.forEach((miles) => {
    if (miles > 0) {
      const cpm = totalAnnualCost / miles;
      schedule.push({
        milesStr: `${miles.toLocaleString()} mi`,
        miles: miles,
        cpm: Number(cpm.toFixed(3))
      });
    }
  });

  return {
    costPerMile: Number(costPerMile.toFixed(3)),
    totalAnnualCost: Math.round(totalAnnualCost),
    totalPayroll: Math.round(totalPayroll),
    totalBenefits: Math.round(totalBenefits),
    chartData: filteredChartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  hourlyRate: "25.00",
  hoursPerWeek: "50", // 40 base + 10 overtime
  weeksPerYear: "50", // 2 weeks unpaid time off
  annualBenefits: "8000", // Health insurance, 401k match, etc.
  payrollTaxRate: "7.65", // Standard FICA + Medicare
  annualMiles: "80000" // Typical regional CDL driver
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function DriverCostPerMileCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DriverCostResults>(calculateDriverCost(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDriverCost(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleCalculate = () => {
    const r = calculateDriverCost(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDriverCost(DEFAULTS));
  };

  const faqs = [
    { question: "What is CPM (Cost Per Mile)?", answer: "Cost Per Mile (CPM) is the foundational metric used by logistics and trucking companies to measure profitability. It calculates exactly how much money the company spends for every single mile a truck drives down the road. If your total CPM (driver + fuel + maintenance) is $2.00, and you charge a customer $1.50 per mile to haul their freight, your company is losing money on every single mile driven." },
    { question: "Why separate Driver CPM from Fuel CPM?", answer: "Fleet managers track Driver CPM and Fuel CPM completely separately because they are controlled by different factors. Fuel CPM fluctuates wildly based on global oil prices and aerodynamics. Driver CPM is a fixed human cost based on payroll, overtime, taxes, and health insurance. By separating them, a manager can easily identify if their profit loss is due to rising gas prices or due to excessive driver overtime pay." },
    { question: "How does mileage affect Driver CPM?", answer: "Because a driver's salary is largely a fixed cost (especially if they are salaried or guaranteed 40 hours), the more miles they drive, the lower the Driver CPM becomes. If a driver costs the company $80,000 a year and only drives 40,000 miles, the Driver CPM is a massive $2.00/mile. If that same driver covers 80,000 miles in that same year, the Driver CPM plummets to $1.00/mile, making the company vastly more profitable." },
    { question: "What are Employer Taxes?", answer: "When you pay a driver $25 an hour, the company actually spends more than $25 an hour. The federal government requires employers to pay a matching portion of payroll taxes (like FICA/Social Security and Medicare), which usually adds roughly 7.65% to the gross payroll cost. You must also account for state unemployment taxes and Worker's Compensation insurance." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Driver Cost Per Mile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Driver Cost Per Mile Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine the exact labor cost for every mile your commercial drivers cover, including overtime, taxes, and benefits.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Driver Compensation</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Hourly Pay Rate" value={inputs.hourlyRate} onChange={(v: string) => handleChange("hourlyRate", v)} prefix="$" placeholder="25.00" />
              <CompactInput id="hours" label="Avg Hours / Week" value={inputs.hoursPerWeek} onChange={(v: string) => handleChange("hoursPerWeek", v)} suffix="hrs" placeholder="50" />
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Annual Schedule</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="weeks" label="Weeks Worked / Year" value={inputs.weeksPerYear} onChange={(v: string) => handleChange("weeksPerYear", v)} suffix="wks" placeholder="50" />
              <CompactInput id="miles" label="Total Annual Miles" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" placeholder="80000" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Additional Employer Costs</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="benefits" label="Annual Benefits" value={inputs.annualBenefits} onChange={(v: string) => handleChange("annualBenefits", v)} prefix="$" placeholder="8000" />
              <CompactInput id="tax" label="Employer Tax Rate" value={inputs.payrollTaxRate} onChange={(v: string) => handleChange("payrollTaxRate", v)} suffix="%" placeholder="7.65" />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: Hours worked over 40 per week are automatically calculated at 1.5x (time-and-a-half) overtime rate.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
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
                {/* 1. Primary Result Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Driver Cost Per Mile (CPM)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-primary mb-1">$</div>
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.costPerMile.toFixed(3)}</div>
                      <div className="text-sm font-bold text-primary/70 mb-2">/ mi</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Annual Driver Cost</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-muted-foreground mb-1">$</div>
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.totalAnnualCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Payroll</div>
                    <div className="text-2xl font-bold text-emerald-500">${results.totalPayroll.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Base + Overtime</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Taxes & Benefits</div>
                    <div className="text-2xl font-bold text-destructive">${results.totalBenefits.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Hidden Employer Cost</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual Miles</div>
                    <div className="text-2xl font-bold text-blue-500">{parseFloat(inputs.annualMiles).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total distance covered</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Total Compensation Breakdown</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Notice how a significant portion of the company's labor cost never actually reaches the driver's paycheck due to employer taxes and benefits.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">The "Low Mileage" Danger</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">If Annual Mileage Is:</th>
                          <th className="px-4 py-3 font-semibold text-right">Total Annual Cost</th>
                          <th className="px-4 py-3 font-semibold text-right">Resulting Driver CPM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.miles} className={`hover:bg-muted/20 transition-colors ${row.miles === parseFloat(inputs.annualMiles) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.milesStr} {row.miles === parseFloat(inputs.annualMiles) ? '(Current)' : ''}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${results.totalAnnualCost.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.cpm > results.costPerMile ? 'text-destructive' : row.cpm < results.costPerMile ? 'text-emerald-500' : 'text-primary'}`}>
                              ${row.cpm.toFixed(3)}
                            </td>
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
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Fleet Profitability</h2>
            <p>If you own a logistics, trucking, or delivery company, you do not sell physical products; you sell distance. The only way your company makes money is by charging a customer a specific rate to move freight from Point A to Point B. This rate is heavily negotiated and usually breaks down to a specific dollar amount per mile.</p>
            <p>To ensure your company doesn't go bankrupt, you must know exactly how much it costs you to drive that mile. This is known as the <strong>Cost Per Mile (CPM)</strong>. A fleet's Total CPM is made up of several buckets: Fuel CPM, Maintenance CPM, Equipment CPM, and the largest controllable bucket: <strong>Driver CPM</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">Why Driver CPM Fluctuates</h2>
            <p>Unlike fuel, which you buy exactly when you need it, human labor is largely a fixed time-based cost. You pay your driver by the hour (or by a salary), regardless of how fast they are driving.</p>
            <p>If you pay a driver $25 an hour, and they drive down an open highway at 60 MPH for one hour, they just covered 60 miles. The labor cost for those miles is incredibly cheap ($25 / 60 miles = $0.41 per mile).</p>
            <p>However, if that same driver hits terrible city traffic and crawls at 15 MPH for an hour, they still get paid $25, but they only covered 15 miles. The labor cost for those miles skyrockets ($25 / 15 miles = $1.66 per mile). If you only charged the customer $1.50 per mile for the freight, your company just lost money on that segment of the trip because of traffic.</p>

            <h2 className="text-2xl font-bold mb-3">The Hidden Costs of Labor</h2>
            <p>When calculating Driver CPM, rookie fleet managers often just divide the driver's paycheck by the miles driven. This is a fatal mathematical error.</p>
            <p>When you hire an employee, the government mandates that you (the employer) pay taxes on top of their salary. This includes a matching portion of Social Security and Medicare (FICA), which automatically adds 7.65% to the labor cost. You must also factor in State Unemployment Taxes, extremely expensive commercial Worker's Compensation Insurance, and any company benefits (like health insurance or 401k matching). An employee who "makes" $60,000 a year actually costs the company closer to $75,000 a year.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/driver-cost-per-mile-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Driver Cost Per Mile Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Driver Cost Per Mile Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Driver Cost Per Mile Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Driver Cost Per Mile Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Driver Cost Per Mile Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
