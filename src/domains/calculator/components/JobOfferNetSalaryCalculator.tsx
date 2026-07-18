"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Wallet, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface NetSalaryResults {
  grossAnnual: number;
  grossBiWeekly: number;
  netAnnual: number;
  netMonthly: number;
  netBiWeekly: number;
  taxesAnnual: number;
  benefitsAnnual: number;
  chartData: { name: string; value: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateNetSalary = (gross: number, taxRate: number, k401: number, healthMonthly: number, otherMonthly: number): NetSalaryResults => {
  // 401k is pre-tax, so we calculate it first
  const k401Annual = gross * (k401 / 100);
  
  // Health insurance is usually pre-tax
  const healthAnnual = healthMonthly * 12;
  const otherAnnual = otherMonthly * 12; // assuming post-tax for simplicity unless specified, but let's just group it.
  
  const taxableIncome = Math.max(0, gross - k401Annual - healthAnnual);
  
  // FICA is standard 7.65% up to cap, let's simplify for this level of tool.
  const ficaRate = 0.0765;
  const ficaAnnual = gross * ficaRate; // FICA is based on gross (mostly), though pre-tax health lowers it, 401k does NOT lower FICA.
  // Actually, standard rule: Health insurance lowers FICA taxable wages. 401k does NOT lower FICA taxable wages.
  const ficaWages = Math.max(0, gross - healthAnnual);
  const preciseFica = ficaWages * ficaRate;

  // Income Tax (Federal + State combined effective rate provided by user)
  const incomeTaxAnnual = taxableIncome * (taxRate / 100);

  const totalTaxes = preciseFica + incomeTaxAnnual;
  const totalDeductions = totalTaxes + k401Annual + healthAnnual + otherAnnual;

  const netAnnual = gross - totalDeductions;
  
  const grossBiWeekly = gross / 26;
  const netBiWeekly = netAnnual / 26;
  const netMonthly = netAnnual / 12;

  const chartData = [
    { name: "Gross", value: gross, fill: "hsl(var(--muted))" },
    { name: "Taxes", value: -totalTaxes, fill: "hsl(var(--destructive))" },
    { name: "Benefits/401k", value: -(k401Annual + healthAnnual + otherAnnual), fill: "hsl(var(--amber-500, 45 93% 47%))" },
    { name: "Net Take-Home", value: netAnnual, fill: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Net Annual", value: `$${netAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net Monthly", value: `$${netMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net Bi-Weekly", value: `$${netBiWeekly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Tax Rate", value: `${((totalTaxes / gross) * 100).toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Annual Gross Salary", amount: `$${gross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Pre-Tax Deductions (401k, Health)", amount: `-$${(k401Annual + healthAnnual).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Estimated Income Taxes", amount: `-$${incomeTaxAnnual.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "FICA Taxes (SS & Medicare)", amount: `-$${preciseFica.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Post-Tax Deductions", amount: `-$${otherAnnual.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Annual Net Take-Home Pay", amount: `$${netAnnual.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { grossAnnual: gross, grossBiWeekly, netAnnual, netMonthly, netBiWeekly, taxesAnnual: totalTaxes, benefitsAnnual: (k401Annual + healthAnnual + otherAnnual), chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  gross: "85000",
  taxRate: "18", // Combined effective
  k401: "5",
  health: "150",
  other: "0"
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

export default function JobOfferNetSalaryCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  const [k401, setK401] = useState(DEFAULTS.k401);
  const [health, setHealth] = useState(DEFAULTS.health);
  const [other, setOther] = useState(DEFAULTS.other);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<NetSalaryResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateNetSalary(
      parseFloat(gross) || 0, 
      parseFloat(taxRate) || 0,
      parseFloat(k401) || 0,
      parseFloat(health) || 0,
      parseFloat(other) || 0
    ));
  };

  const handleReset = () => {
    setGross(DEFAULTS.gross); setTaxRate(DEFAULTS.taxRate); setK401(DEFAULTS.k401); setHealth(DEFAULTS.health); setOther(DEFAULTS.other);
    setResults(calculateNetSalary(85000, 18, 5, 150, 0));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Net Salary Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${Math.abs(payload[0].value).toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Job Offer Net Salary" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Job Offer Net Salary Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Offer Details</h2>
            </div>
            
            <CompactInput id="gross" label="Offered Annual Gross Salary" value={gross} onChange={setGross} prefix="$" tooltip="The total salary printed on your offer letter before any taxes or deductions." />
            
            <div className="grid grid-cols-2 gap-4 mt-1">
              <CompactInput id="k401" label="401(k) Contribution" value={k401} onChange={setK401} suffix="%" tooltip="Percentage of your salary you plan to contribute to retirement." step="1" />
              <CompactInput id="hlth" label="Health Ins. (Monthly)" value={health} onChange={setHealth} prefix="$" tooltip="Estimated monthly premium you will pay for health insurance." />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Adjust Tax & Deductions <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="Est. Effective Income Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" tooltip="Combined effective rate for Federal and State taxes. Usually between 12% and 25% for average earners." />
                  <CompactInput id="oth" label="Other Monthly Deductions" value={other} onChange={setOther} prefix="$" tooltip="Commuter benefits, union dues, extra life insurance, etc." />
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    FICA (Social Security & Medicare) is automatically calculated at 7.65%.
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
                    Estimated Bi-Weekly Paycheck
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.netBiWeekly.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Gross Bi-Weekly: <span className="font-bold text-muted-foreground line-through">${results.grossBiWeekly.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
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
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Annual</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Gross to Net Waterfall</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(Math.abs(v)/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <ReferenceLine y={0} stroke="hsl(var(--border))" />
                          <Bar dataKey="value" radius={4}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
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
            <h2 className="text-2xl font-bold mb-3">Don't Spend Your Gross Salary</h2>
            <p>One of the most common financial mistakes young professionals make is building a budget based on the salary written in their job offer letter. That number is your <strong>Gross Salary</strong>, and you will never actually see it. What matters for your rent, car payment, and groceries is your <strong>Net Take-Home Pay</strong>.</p>
            
            <h3>Where Does the Money Go?</h3>
            <p>Before a dollar hits your bank account, several entities take a cut:</p>
            <ul>
              <li><strong>Pre-Tax Deductions:</strong> If you elect to put 5% of your pay into a 401(k), and pay $150 a month for health insurance, this money is taken out first. <em>(Good news: This lowers your taxable income, meaning you pay less in taxes!)</em></li>
              <li><strong>FICA Taxes:</strong> The Federal government mandates a 7.65% tax on your wages to fund Social Security (6.2%) and Medicare (1.45%). This is non-negotiable.</li>
              <li><strong>Income Taxes:</strong> Depending on what state you live in, your employer will withhold estimated Federal Income Tax and State Income Tax based on the W-4 form you fill out.</li>
              <li><strong>Post-Tax Deductions:</strong> Things like union dues, parking passes, or Roth 401(k) contributions are taken out after taxes have been applied.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Understanding Effective Tax Rate</h2>
            <p>Many people think that if they are in the "22% Tax Bracket," they pay 22% of their income in taxes. This is false due to the progressive tax system. Your <strong>Effective Tax Rate</strong> (the actual percentage of your total income paid to the government) is much lower.</p>
            <p>For an individual making $85,000, their Federal effective rate is usually around 12% to 14%. When combined with a standard state tax (like 4%), an effective rate of 16% to 18% is a solid estimate for calculating take-home pay.</p>

            <h2 className="text-2xl font-bold mb-3">Why Bi-Weekly Matters</h2>
            <p>Most corporate employers pay <strong>Bi-Weekly</strong> (every two weeks), resulting in 26 paychecks per year. However, most people budget <strong>Monthly</strong> (12 months). This creates a discrepancy: for 10 months of the year, you will only receive 2 paychecks per month. Twice a year, you will receive a "bonus" 3rd paycheck in a single month.</p>
            <p>You should always build your monthly budget based on two bi-weekly paychecks, and treat the two "extra" paychecks as windfall money for savings or debt payoff.</p>
          </section>
          <FAQSection faqs={[
            { question: "Is this calculator exact to the penny?", answer: "No. Exact payroll calculation requires knowing your precise state, local city taxes, filing status (Single/Married), number of dependents, and specific W-4 withholding elections. This calculator provides a highly accurate estimate for negotiation and budgeting purposes." },
            { question: "Do my health insurance premiums lower my FICA taxes?", answer: "Yes. Section 125 Cafeteria Plans (which cover most employer health insurance premiums) are deducted before FICA taxes are applied. However, 401(k) contributions do NOT lower FICA taxes, they only lower your income taxes." },
            { question: "What happens if I get a bonus?", answer: "Bonuses are considered 'supplemental wages' and are usually withheld at a flat 22% Federal rate, plus FICA and state taxes. A $10,000 bonus will often result in a net check of only $6,000 to $6,500." },
          ]} pageUrl="https://racira.com/calculator/job-offer-net-salary-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Job Offer Net Salary Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Job Offer Net Salary Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Job Offer Net Salary Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Job Offer Net Salary Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Job Offer Net Salary Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/job-offer-net-salary-calculator" />
        </div>
      </div>
    </>
  );
}
