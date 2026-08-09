"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FhbResults {
  monthlyPayment: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyIns: number;
  monthlyPmi: number;
  loanAmount: number;
  totalCashToClose: number;
  chartData: any[];
  breakdownRows: any[];
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

const calculateFhb = (inputs: any): FhbResults => {
  const hp = parseFloat(inputs.homePrice) || 0;
  const dpPct = parseFloat(inputs.downPaymentPct) || 0;
  const dpAmt = hp * (dpPct / 100);
  const loanAmount = hp - dpAmt;
  
  const grant = parseFloat(inputs.fhbGrant) || 0;
  const closingCosts = parseFloat(inputs.closingCosts) || 0;
  
  const rate = (parseFloat(inputs.interestRate) || 0) / 100 / 12;
  const months = (parseFloat(inputs.loanTerm) || 30) * 12;

  let monthlyPI = 0;
  if (loanAmount > 0 && months > 0) {
    monthlyPI = rate > 0 ? loanAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1) : loanAmount / months;
  }

  const monthlyTax = (parseFloat(inputs.annualTax) || 0) / 12;
  const monthlyIns = (parseFloat(inputs.annualInsurance) || 0) / 12;
  
  let monthlyPmi = 0;
  if (dpPct < 20 && loanAmount > 0) {
    const annualPmiRate = 0.5; // assumption for 3% down FHA/conventional
    monthlyPmi = (loanAmount * (annualPmiRate / 100)) / 12;
  }

  const monthlyPayment = monthlyPI + monthlyTax + monthlyIns + monthlyPmi;
  const totalCashToClose = dpAmt + closingCosts - grant;

  const chartData = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--primary))" },
    { name: "Property Tax", value: monthlyTax, color: "#10b981" },
    { name: "Home Insurance", value: monthlyIns, color: "#f59e0b" },
    { name: "PMI", value: monthlyPmi, color: "#ef4444" }
  ].filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Down Payment", value: dpAmt },
    { label: "Estimated Closing Costs", value: closingCosts },
    { label: "First-Time Buyer Grant", value: -grant, isGreen: true },
    { label: "Total Cash Needed to Close", value: totalCashToClose, isBold: true }
  ];

  return {
    monthlyPayment,
    monthlyPI,
    monthlyTax,
    monthlyIns,
    monthlyPmi,
    loanAmount,
    totalCashToClose,
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
  homePrice: "350000",
  downPaymentPct: "3", // Typical FHB down payment
  fhbGrant: "5000",
  closingCosts: "7000",
  interestRate: "6.5",
  loanTerm: "30",
  annualTax: "3500",
  annualInsurance: "1200"
};

export default function FirstHomeBuyerCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FhbResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateFhb(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateFhb(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFhb(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "First Home Buyer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">First Home Buyer Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="homePrice" label="Home Price" value={inputs.homePrice} onChange={(v: string) => handleChange("homePrice", v)} prefix="$" />
              <CompactInput id="downPaymentPct" label="Down Payment" value={inputs.downPaymentPct} onChange={(v: string) => handleChange("downPaymentPct", v)} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="interestRate" label="Interest Rate" value={inputs.interestRate} onChange={(v: string) => handleChange("interestRate", v)} suffix="%" />
              <CompactInput id="loanTerm" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="years" />
            </div>
            
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
              Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <CompactInput id="fhbGrant" label="FHB Grant/Credit" value={inputs.fhbGrant} onChange={(v: string) => handleChange("fhbGrant", v)} prefix="$" />
                <CompactInput id="closingCosts" label="Estimated Closing Costs" value={inputs.closingCosts} onChange={(v: string) => handleChange("closingCosts", v)} prefix="$" />
                <CompactInput id="annualTax" label="Annual Property Tax" value={inputs.annualTax} onChange={(v: string) => handleChange("annualTax", v)} prefix="$" />
                <CompactInput id="annualInsurance" label="Annual Insurance" value={inputs.annualInsurance} onChange={(v: string) => handleChange("annualInsurance", v)} prefix="$" />
              </div>
            )}
            
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="flex justify-end">
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">${results.monthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Loan Amount: ${results.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
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
                  <div className="text-sm font-bold mb-2">Cash to Close Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Item</th>
                          <th className="py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${row.isBold ? 'font-bold bg-muted/20' : ''}`}>
                            <td className="text-left py-2.5">{row.label}</td>
                            <td className={`py-2.5 ${row.isGreen ? 'text-green-600' : ''}`}>
                              {row.value < 0 ? "-" : ""}${Math.abs(row.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5 mt-4">
                  <h3 className="text-base font-semibold mb-3">Monthly Payment Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-1 col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground">Principal & Interest</span>
                      <span className="font-medium">${results.monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1 col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground">Property Tax</span>
                      <span className="font-medium">${results.monthlyTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1 col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground">Home Insurance</span>
                      <span className="font-medium">${results.monthlyIns.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1 col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground">PMI (Estimated)</span>
                      <span className="font-medium">${results.monthlyPmi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a First Home Buyer Calculator?</h2>
            <p className="text-muted-foreground leading-relaxed">Buying your first home can be intimidating because of the numerous hidden costs. A First Home Buyer Calculator is specifically designed to account for first-time buyer grants, low down payment options (like 3% conventional or 3.5% FHA), and the resulting Private Mortgage Insurance (PMI) required.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator uses standard mortgage amortization math for the loan itself but also integrates a "Cash to Close" breakdown. It totals your down payment and closing costs, then subtracts any first-time home buyer grants or seller credits to show you exactly how much cash you need in your bank account on closing day.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The main result is your total estimated monthly payment, which is split in the pie chart into Principal & Interest, Property Taxes, Homeowners Insurance, and PMI. The secondary focus is the Cash to Close table, which ensures you aren't surprised by the thousands of dollars required for closing costs.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p className="text-muted-foreground leading-relaxed">As a first-time buyer, your <strong>down payment percentage</strong> and <strong>FHB Grant</strong> are critical. Many buyers assume they need 20% down, but first-time buyer programs allow as little as 3% down. However, putting down less than 20% triggers PMI, which is automatically estimated in this calculator.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p className="text-muted-foreground leading-relaxed">If you buy a $350,000 home with 3% down ($10,500), and you have $7,000 in closing costs, you normally need $17,500 in cash. But if you qualify for a $5,000 state first-time homebuyer grant, your required cash to close drops to a much more manageable $12,500.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p className="text-muted-foreground leading-relaxed">Always research your state and local housing authority programs. Many states offer down payment assistance (DPA) loans or grants specifically for first-time buyers that can cover 3% to 5% of the purchase price, making homeownership accessible even with limited savings.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p className="text-muted-foreground leading-relaxed">By simulating your exact cash-to-close requirements and realistic monthly payments (including PMI and taxes), you can confidently enter the housing market knowing exactly what you can afford and what to expect on closing day.</p>
          </div>
        </section>

        <FAQSection pageUrl="https://racira.com/calculator/first-home-buyer-calculator" faqs={[
          { question: "Do I really need 20% down to buy a house?", answer: "No. First-time homebuyers can often qualify for conventional loans with just 3% down, or FHA loans with 3.5% down. There are even USDA and VA loans that require 0% down if you meet their specific criteria." },
          { question: "What are closing costs?", answer: "Closing costs are fees paid to the lender and third parties (like title companies and appraisers) to process the home purchase. They usually range from 2% to 5% of the home price." },
          { question: "What is PMI?", answer: "Private Mortgage Insurance (PMI) is a monthly fee you pay to protect the lender in case you default on the loan. It is typically required on conventional loans if your down payment is less than 20%." },
          { question: "How do first-time buyer grants work?", answer: "Grants or Down Payment Assistance (DPA) programs provide funds to help cover your down payment or closing costs. Some are true grants that do not need to be repaid, while others are silent second mortgages forgiven after you live in the home for a certain number of years." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
