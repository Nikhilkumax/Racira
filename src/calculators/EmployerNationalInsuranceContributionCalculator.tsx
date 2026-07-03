"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PoundSterling, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NICResults {
  salary: number;
  threshold: number;
  taxableAmount: number;
  nicAmount: number;
  totalCost: number;
  effectiveRate: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateNIC = (salary: number): NICResults => {
  // UK 2024/2025 Standard Class 1 Employer NIC Rules
  // Secondary Threshold (ST): £9,100 per year
  // Employer Rate: 13.8% on everything above the ST
  
  const threshold = 9100;
  const rate = 0.138;
  
  const taxableAmount = Math.max(0, salary - threshold);
  const nicAmount = taxableAmount * rate;
  const totalCost = salary + nicAmount;
  
  const effectiveRate = salary > 0 ? (nicAmount / salary) * 100 : 0;

  const chartData = [
    { name: "Employee Gross Salary", value: salary, color: "hsl(var(--primary))" },
    { name: "Employer NIC (Tax)", value: nicAmount, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Total Employer Cost", value: `£${totalCost.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
    { label: "Employer NIC Due", value: `£${nicAmount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
    { label: "Effective NIC Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Tax Year", value: "2024/2025" },
  ];

  const breakdown = [
    { label: "Employee Annual Gross Salary", amount: `£${salary.toLocaleString("en-GB", { maximumFractionDigits: 2 })}` },
    { label: "Secondary Threshold (Tax-Free Allowance)", amount: `-£${threshold.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Earnings Subject to Employer NIC", amount: `£${taxableAmount.toLocaleString("en-GB", { maximumFractionDigits: 2 })}` },
    { label: "Standard Employer Rate", amount: "13.8%" },
    { label: "Calculated Employer NIC", amount: `+£${nicAmount.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500 font-bold" },
    { label: "Total Cost of Employment", amount: `£${totalCost.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { salary, threshold, taxableAmount, nicAmount, totalCost, effectiveRate, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  salary: "45000",
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function EmployerNationalInsuranceContributionCalculator() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  
  const [results, setResults] = useState<NICResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateNIC(parseFloat(salary) || 0));
  };

  const handleReset = () => {
    setSalary(DEFAULTS.salary);
    setResults(calculateNIC(45000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Employer NIC Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">£{payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employer NIC Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employer National Insurance (NIC) Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">UK Payroll Details</h2>
            </div>
            
            <CompactInput id="sal" label="Employee Annual Gross Salary" value={salary} onChange={setSalary} prefix="£" tooltip="The total pre-tax salary paid to the employee." />
            
            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>This calculator uses standard <strong>2024/2025 Tax Year</strong> rules. It assumes standard Class 1 NICs (Category A) with a 13.8% rate above the £9,100 Secondary Threshold.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Cost to Employer
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    £{results.totalCost.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Employer NIC Due: <span className="font-bold text-red-500">£{results.nicAmount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Payroll Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Employer Cost Breakdown</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What are Employer National Insurance Contributions?</h2>
            <p>In the United Kingdom, both employers and employees must pay National Insurance Contributions (NICs) to fund state benefits, including the NHS and the State Pension. However, the rates and thresholds are different for both parties.</p>
            <p><strong>Employer NICs (Class 1 Secondary)</strong> represent a significant hidden cost of hiring staff. When you offer an employee a £45,000 salary, it actually costs the business nearly £50,000 due to this mandatory tax.</p>
            
            <h3>The 2024/2025 Tax Year Rules</h3>
            <p>For the standard employee (Category A), the rules for the 2024/2025 tax year are as follows:</p>
            <ul>
              <li><strong>The Secondary Threshold:</strong> The first £9,100 an employee earns is completely exempt from Employer NICs.</li>
              <li><strong>The Rate:</strong> The employer must pay exactly <strong>13.8%</strong> on every pound the employee earns above £9,100.</li>
              <li>Unlike employee NICs (which drop in percentage at a higher bracket), the Employer rate remains at 13.8% with absolutely no upper limit.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Exemptions and Reliefs</h2>
            <p>To encourage hiring specific demographics, HMRC provides several exemptions where employers pay 0% NIC up to a much higher threshold (£50,270):</p>
            <ul>
              <li><strong>Employees under 21:</strong> (Category M)</li>
              <li><strong>Apprentices under 25:</strong> (Category H)</li>
              <li><strong>Veterans:</strong> In their first year of civilian employment (Category V)</li>
            </ul>
            <p>Additionally, small businesses may be eligible for the <strong>Employment Allowance</strong>, which allows eligible employers to reduce their annual National Insurance liability by up to £5,000.</p>

            <h2 className="text-2xl font-bold mb-3">Why Directors Must Be Careful</h2>
            <p>If you are the director of a limited company, you pay Employer NICs on your own salary. This is why many UK directors choose to pay themselves a small base salary (usually up to the Primary Threshold to qualify for state pension years without paying NICs) and take the rest of their income as corporate dividends, which are subject to different tax rates and do not attract National Insurance.</p>
          </article>
          <FAQSection faqs={[
            { question: "Does the employee pay this 13.8%?", answer: "No. The 13.8% Employer NIC is a direct expense to the business. The employee pays their own separate Class 1 Primary NICs, which are deducted directly from their gross salary before they receive their payslip." },
            { question: "Is Employer NIC a tax-deductible expense?", answer: "Yes. Employer National Insurance contributions are considered a legitimate business expense. You can deduct them from your company's profits before calculating Corporation Tax." },
            { question: "What happens if an employee has multiple jobs?", answer: "National Insurance is calculated per job, not per person (unlike Income Tax). If you employ someone part-time and pay them £8,000 a year, you pay zero Employer NICs, regardless of how much they earn at their other job." },
          ]} pageUrl="https://racira.com/calculator/employer-national-insurance-contribution-calculator" />
          <PopularCalculators exclude="/calculator/employer-national-insurance-contribution-calculator" />
        </div>
      </div>
    </>
  );
}
