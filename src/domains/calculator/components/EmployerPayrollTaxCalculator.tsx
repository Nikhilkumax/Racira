"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Briefcase, Printer, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PayrollResults {
  grossPay: number;
  fica: number;
  futa: number;
  sui: number;
  benefits: number;
  totalTaxes: number;
  totalCost: number;
  burdenPct: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculatePayroll = (gross: number, suiRate: number, suiCap: number, benefits: number): PayrollResults => {
  // 2024 US FICA Rules
  const ssCap = 168600;
  const ssTax = Math.min(gross, ssCap) * 0.062;
  const medTax = gross * 0.0145; // No cap on employer side
  const fica = ssTax + medTax;

  // 2024 US FUTA Rules (Standard 0.6% after maximum state credit)
  const futaCap = 7000;
  const futa = Math.min(gross, futaCap) * 0.006;

  // State Unemployment (SUI)
  const sui = Math.min(gross, suiCap) * (suiRate / 100);

  const totalTaxes = fica + futa + sui;
  const totalCost = gross + totalTaxes + benefits;

  // Burden % is (Taxes + Benefits) / Gross Salary
  const totalBurden = totalTaxes + benefits;
  const burdenPct = gross > 0 ? (totalBurden / gross) * 100 : 0;

  const chartData = [
    { name: "Gross Salary", value: gross, color: "hsl(var(--primary))" },
    { name: "FICA Taxes (SS & Med)", value: fica, color: "hsl(var(--chart-2))" },
    { name: "Unemployment (FUTA/SUI)", value: futa + sui, color: "hsl(var(--chart-3))" },
    { name: "Benefits & Insurance", value: benefits, color: "hsl(var(--chart-4))" },
  ];

  const summaryStats = [
    { label: "True Employer Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Employer Taxes", value: `$${totalTaxes.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Benefits Cost", value: `$${benefits.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Burden Rate", value: `${burdenPct.toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Employee Gross Salary", amount: `$${gross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "FICA - Social Security (6.2%)", amount: `$${ssTax.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "FICA - Medicare (1.45%)", amount: `$${medTax.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Federal Unemployment (FUTA)", amount: `$${futa.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "State Unemployment (SUI)", amount: `$${sui.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Additional Benefits (Health, 401k, etc)", amount: `$${benefits.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total True Cost of Employee", amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { grossPay: gross, fica, futa, sui, benefits, totalTaxes, totalCost, burdenPct, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  gross: "75000",
  suiRate: "2.7",
  suiCap: "10000",
  benefits: "15000",
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

export default function EmployerPayrollTaxCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [suiRate, setSuiRate] = useState(DEFAULTS.suiRate);
  const [suiCap, setSuiCap] = useState(DEFAULTS.suiCap);
  const [benefits, setBenefits] = useState(DEFAULTS.benefits);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<PayrollResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePayroll(
      parseFloat(gross) || 0, 
      parseFloat(suiRate) || 0,
      parseFloat(suiCap) || 0,
      parseFloat(benefits) || 0
    ));
  };

  const handleReset = () => {
    setGross(DEFAULTS.gross); setSuiRate(DEFAULTS.suiRate); setSuiCap(DEFAULTS.suiCap); setBenefits(DEFAULTS.benefits);
    setResults(calculatePayroll(75000, 2.7, 10000, 15000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Employer Cost Calculator</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employer Payroll Tax" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employer Payroll Tax & Burden Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Employee Cost Inputs</h2>
            </div>
            
            <CompactInput id="gross" label="Employee Annual Gross Salary" value={gross} onChange={setGross} prefix="$" tooltip="The stated salary on the employee's offer letter." />
            <CompactInput id="ben" label="Annual Benefits Cost (Health, 401k, etc)" value={benefits} onChange={setBenefits} prefix="$" tooltip="The total amount the employer pays for health insurance premiums, 401k matches, and other perks." />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Adjust State Tax Assumptions <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="sui" label="State Unemployment Rate" value={suiRate} onChange={setSuiRate} suffix="%" tooltip="Your company's specific SUI rate (varies by state and claims history)." step="0.1" />
                  <CompactInput id="suicap" label="State Wage Base Cap" value={suiCap} onChange={setSuiCap} prefix="$" tooltip="The maximum salary amount subject to state unemployment tax." />
                  <div className="col-span-2 text-xs text-muted-foreground text-center">
                    Note: FICA (7.65%) and FUTA (0.6%) are hardcoded to 2024 US federal standards.
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
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
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total True Cost of Employee
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.totalCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Employer Burden Rate: <span className="font-bold text-foreground">{results.burdenPct.toFixed(1)}% above salary</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Payroll Expense</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Breakdown of Employer Costs</h3>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the True Cost of an Employee?</h2>
            <p>A common mistake made by new business owners is assuming that a $75,000 salary costs the business exactly $75,000. In reality, the true cost is significantly higher due to mandatory payroll taxes, workers' compensation, and discretionary benefits.</p>
            <p>This hidden cost is known as the <strong>Employer Burden Rate</strong>. For a standard US employee receiving basic health benefits and a 401k match, the burden rate is typically <strong>20% to 30%</strong> on top of their gross salary.</p>
            
            <h3>Mandatory US Payroll Taxes</h3>
            <p>Every US employer is legally required to pay the following taxes <em>in addition</em> to what is withheld from the employee's paycheck:</p>
            <ul>
              <li><strong>FICA (Social Security):</strong> 6.2% of the employee's gross wages, up to a wage base cap (which is $168,600 for the year 2024).</li>
              <li><strong>FICA (Medicare):</strong> 1.45% of the employee's gross wages, with no wage base cap.</li>
              <li><strong>Federal Unemployment (FUTA):</strong> 6.0% on the first $7,000 of wages, but almost all employers receive a 5.4% credit, dropping the effective rate to <strong>0.6%</strong> ($42 maximum per employee per year).</li>
              <li><strong>State Unemployment (SUI):</strong> Varies wildly by state and by your company's history of laying off workers. It is charged as a percentage against a state-defined wage base cap.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits: The Largest Burden</h2>
            <p>While taxes add about 8% to 10% to the cost of an employee, discretionary benefits are the primary driver of a high burden rate. The average cost of an employer-sponsored health insurance plan in the US is over $7,000 per year for a single employee, and over $20,000 for family coverage.</p>

            <h2 className="text-2xl font-bold mb-3">W-2 Employees vs. 1099 Contractors</h2>
            <p>Because the employer burden is so high, many companies attempt to classify workers as 1099 Independent Contractors. When you hire a contractor, you pay zero FICA, zero unemployment, and zero benefits. The burden rate is effectively 0%.</p>
            <p>However, the IRS has extremely strict rules regarding worker classification. If you control exactly how, when, and where a contractor does their work, they are legally a W-2 employee, and misclassifying them can result in devastating penalties and back-taxes.</p>
          </section>
          <FAQSection faqs={[
            { question: "Do I pay both halves of FICA?", answer: "The total FICA tax is 15.3%. The employer pays half (7.65%), and the employee pays the other half (7.65%), which you are required to withhold from their paycheck. This calculator only shows the employer's half, as that is the cost borne by the business." },
            { question: "Does this include Workers' Compensation?", answer: "No. Workers' compensation insurance is required in almost all states, but the rates vary so drastically by industry (a roofer's rate might be 20%, while an office worker's rate might be 0.1%) that it must be quoted by an insurance broker." },
            { question: "What is the wage base limit?", answer: "A wage base limit is a cap on taxable income. For example, you only pay the 6.2% Social Security tax on the first $168,600 an employee earns in 2024. If they earn $200,000, you pay no Social Security tax on the final $31,400 of their income." },
          ]} pageUrl="https://racira.com/calculator/employer-payroll-tax-calculator" />
          <PopularCalculators exclude="/calculator/employer-payroll-tax-calculator" />
        </div>
      </div>
    </>
  );
}
