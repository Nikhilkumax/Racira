"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Home } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface UkMortgageInputs {
  propertyPrice: number;
  deposit: number;
  interestRate: number;
  termYears: number;
  buyerType: "standard" | "firstTime" | "additional";
  paymentType: "repayment" | "interestOnly";
}

interface UkMortgageResults {
  loanAmount: number;
  ltv: number;
  stampDuty: number;
  
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  totalCostOfPurchase: number;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

// Helper: Calculate Stamp Duty Land Tax (SDLT)
const calculateSDLT = (price: number, type: "standard" | "firstTime" | "additional"): number => {
  let tax = 0;
  if (type === "firstTime") {
    if (price <= 625000) {
      if (price > 425000) {
        tax = (price - 425000) * 0.05;
      }
    } else {
      // Standard rates apply if price > £625k
      tax = calculateSDLT(price, "standard");
    }
  } else if (type === "standard") {
    if (price > 1500000) {
      tax += (price - 1500000) * 0.12;
      tax += (1500000 - 925000) * 0.10;
      tax += (925000 - 250000) * 0.05;
    } else if (price > 925000) {
      tax += (price - 925000) * 0.10;
      tax += (925000 - 250000) * 0.05;
    } else if (price > 250000) {
      tax += (price - 250000) * 0.05;
    }
  } else if (type === "additional") {
    // 3% surcharge on each tier
    if (price > 1500000) {
      tax += (price - 1500000) * 0.15;
      tax += (1500000 - 925000) * 0.13;
      tax += (925000 - 250000) * 0.08;
      tax += 250000 * 0.03;
    } else if (price > 925000) {
      tax += (price - 925000) * 0.13;
      tax += (925000 - 250000) * 0.08;
      tax += 250000 * 0.03;
    } else if (price > 250000) {
      tax += (price - 250000) * 0.08;
      tax += 250000 * 0.03;
    } else {
      tax += price * 0.03;
    }
  }
  return tax;
};

// 2. Pure Calculation Function
const calculateUkMortgage = (inputs: UkMortgageInputs): UkMortgageResults => {
  const {
    propertyPrice,
    deposit,
    interestRate,
    termYears,
    buyerType,
    paymentType
  } = inputs;

  const loanAmount = Math.max(0, propertyPrice - deposit);
  const ltv = propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0;
  const stampDuty = calculateSDLT(propertyPrice, buyerType);

  const r = interestRate / 100 / 12;
  const n = termYears * 12;

  let monthlyPayment = 0;
  if (loanAmount > 0 && n > 0) {
    if (paymentType === "repayment") {
      monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
    } else {
      monthlyPayment = loanAmount * r;
    }
  }

  let balance = loanAmount;
  let totalInterestPaid = 0;
  const monthlyRows: AmortRow[] = [];
  const yearlyRows: AmortRow[] = [];

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let i = 1; i <= n && balance > 0.01; i++) {
    const interest = balance * r;
    let principal = 0;
    
    if (paymentType === "repayment") {
      principal = monthlyPayment - interest;
    }
    
    if (principal > balance) principal = balance;
    balance -= principal;
    totalInterestPaid += interest;

    monthlyRows.push({
      period: i,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance),
    });

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    if (i % 12 === 0 || i === n) {
      yearlyRows.push({
        period: Math.ceil(i / 12),
        payment: currentYearPayment,
        principal: currentYearPrincipal,
        interest: currentYearInterest,
        balance: Math.max(0, balance),
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
      currentYearPayment = 0;
    }
  }

  const totalRepayment = loanAmount + totalInterestPaid;
  const totalCostOfPurchase = deposit + stampDuty + totalRepayment;

  const chartData = [
    { name: "Deposit", value: deposit, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Principal (Loan)", value: loanAmount, color: "#10b981" },
    { name: "Stamp Duty (SDLT)", value: stampDuty, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Loan Amount", value: `£${loanAmount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
    { label: "Loan-to-Value (LTV)", value: `${ltv.toFixed(1)}%` },
    { label: "Stamp Duty Land Tax", value: `£${stampDuty.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
    { label: "Repayment Type", value: paymentType === "repayment" ? "Capital & Interest" : "Interest Only" },
    { label: "Interest Paid Over Term", value: `£${totalInterestPaid.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
    { label: "Total Debt Repayment", value: `£${totalRepayment.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Property Price", amount: `£${propertyPrice.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-foreground font-semibold" },
    { label: "Total Interest Paid", amount: `£${totalInterestPaid.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Stamp Duty (SDLT)", amount: `£${stampDuty.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Cost of Ownership", amount: `£${totalCostOfPurchase.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    loanAmount,
    ltv,
    stampDuty,
    monthlyPayment,
    totalInterest: totalInterestPaid,
    totalRepayment,
    totalCostOfPurchase,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  propertyPrice: "350000",
  deposit: "70000",
  interestRate: "4.5",
  termYears: "25",
  buyerType: "standard" as const,
  paymentType: "repayment" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="font-extrabold text-sm" style={{ color: payload[0].payload.color }}>
          £{payload[0].value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function UkMortgageCalculator() {
  // 4. Component State
  const [propertyPrice, setPropertyPrice] = useState(DEFAULTS.propertyPrice);
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [buyerType, setBuyerType] = useState(DEFAULTS.buyerType);
  const [paymentType, setPaymentType] = useState<"repayment" | "interestOnly">(DEFAULTS.paymentType);

  const [results, setResults] = useState<UkMortgageResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: UkMortgageInputs = {
      propertyPrice: parseFloat(propertyPrice) || 0,
      deposit: parseFloat(deposit) || 0,
      interestRate: parseFloat(interestRate) || 0,
      termYears: parseFloat(termYears) || 0,
      buyerType: buyerType,
      paymentType: paymentType
    };
    setResults(calculateUkMortgage(inputs));
  };

  const handleReset = () => {
    setPropertyPrice(DEFAULTS.propertyPrice);
    setDeposit(DEFAULTS.deposit);
    setInterestRate(DEFAULTS.interestRate);
    setTermYears(DEFAULTS.termYears);
    setBuyerType(DEFAULTS.buyerType);
    setPaymentType(DEFAULTS.paymentType);
    
    setResults(calculateUkMortgage({
      propertyPrice: parseFloat(DEFAULTS.propertyPrice),
      deposit: parseFloat(DEFAULTS.deposit),
      interestRate: parseFloat(DEFAULTS.interestRate),
      termYears: parseFloat(DEFAULTS.termYears),
      buyerType: DEFAULTS.buyerType,
      paymentType: DEFAULTS.paymentType
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>UK Mortgage Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does a UK mortgage calculator work?", answer: "A UK mortgage calculator uses the loan amount (property price minus deposit), the interest rate, and the term to estimate your monthly repayments. It follows UK lending standards and includes Stamp Duty Land Tax (SDLT) estimates based on current government thresholds." },
    { question: "What is Stamp Duty (SDLT)?", answer: "Stamp Duty Land Tax is a tax paid when you buy property or land over a certain price in England and Northern Ireland. The amount depends on the property price and whether you are a first-time buyer, moving home, or buying an additional property." },
    { question: "What is LTV (Loan-to-Value)?", answer: "LTV is the ratio of the loan amount to the property value, expressed as a percentage. For example, if you have a £50,000 deposit on a £250,000 home, your mortgage is £200,000, and your LTV is 80%. Generally, lower LTVs qualify for better interest rates." },
    { question: "Should I choose Repayment or Interest Only?", answer: "With a Repayment mortgage, you pay back both the interest and a portion of the loan every month, meaning you will own the home outright at the end of the term. With Interest Only, you only pay the interest, so the original loan amount remains due at the end." },
    { question: "Can I get a mortgage with a 5% deposit?", answer: "Yes, many UK lenders offer 95% LTV mortgages, often supported by government schemes like the Mortgage Guarantee Scheme. However, these typically carry higher interest rates than mortgages with larger deposits (like 15% or 20%)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "UK Mortgage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">UK Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Property Price" value={propertyPrice} onChange={setPropertyPrice} prefix="£" />
              <CompactInput id="dep" label="Deposit" value={deposit} onChange={setDeposit} prefix="£" />
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/20 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Calculated LTV</span>
                <span className="text-lg font-bold text-primary">
                  {propertyPrice && parseFloat(propertyPrice) > 0 ? (100 - (parseFloat(deposit) / parseFloat(propertyPrice) * 100)).toFixed(1) : "0"}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Mortgage Term" value={termYears} onChange={setTermYears} suffix="years" />
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col">
                <label htmlFor="buyerType" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                  Buyer Type (For Stamp Duty)
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <select
                    id="buyerType"
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as any)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer"
                  >
                    <option value="standard">Home Mover (Standard)</option>
                    <option value="firstTime">First-Time Buyer</option>
                    <option value="additional">Additional Property / BTL</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Repayment Type</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setPaymentType("repayment")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${paymentType === "repayment" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Repayment</button>
                  <button type="button" onClick={() => setPaymentType("interestOnly")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${paymentType === "interestOnly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Interest Only</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Home className="h-4 w-4" /> Calculate Mortgage
              </button>
              <button type="button" onClick={handleReset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Repayment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">£{results.monthlyPayment.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{paymentType === "repayment" ? "Capital & Interest" : "Interest Only"} Mortgage</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Loan Amount</div>
                    <div className="text-lg font-bold">£{results.loanAmount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Stamp Duty (SDLT)</div>
                    <div className="text-lg font-bold text-red-600">£{results.stampDuty.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">£{results.totalInterest.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Total Cost Breakdown</h3>
                    <table className="w-full text-base">
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.isTotal ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-2">
                                {!row.isTotal && <span className={`w-2.5 h-2.5 rounded-full bg-current ${row.colorClass}`} />}
                                <span className={row.isTotal ? row.colorClass : ""}>{row.label}</span>
                              </span>
                            </td>
                            <td className={`py-2.5 text-right ${row.isTotal ? row.colorClass : ""}`}>{row.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Cost Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={85}
                          paddingAngle={2} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Mortgage Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {results.summaryStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-muted-foreground">{stat.label}:</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Amortization Schedule</h3>
                    <div className="flex rounded-md border border-input overflow-hidden h-8">
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} currency="£" />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding the UK Mortgage Calculator</h2>
            <p>Buying a property in the United Kingdom is a massive financial commitment that involves far more than just agreeing to a purchase price. Lenders, solicitors, surveyors, and HM Revenue and Customs (HMRC) all play a role in determining your final costs. Our <strong>UK Mortgage Calculator</strong> is specifically engineered for the British housing market. It bypasses generic international formulas to accurately model Loan-to-Value (LTV) bands, Stamp Duty Land Tax (SDLT) thresholds, and Repayment vs. Interest-Only structures.</p>
            <p>Whether you are a First-Time Buyer trying to get onto the property ladder, a Home Mover upgrading your primary residence, or a Buy-to-Let investor expanding your portfolio, this calculator provides a transparent breakdown of your monthly obligations and total upfront tax liabilities.</p>

            <h2>The Importance of Your Deposit and LTV</h2>
            <p>In the UK mortgage market, the size of your deposit is the ultimate lever of power. It dictates your Loan-to-Value (LTV) ratio, which is the percentage of the property's price that you are borrowing. If you buy a £300,000 house with a £30,000 deposit, your mortgage is £270,000, giving you an LTV of 90%.</p>
            <p><strong>Why LTV Matters:</strong> Lenders group their interest rates into LTV bands (typically 60%, 75%, 80%, 85%, 90%, and 95%). The lower your LTV, the less risk the bank takes. Therefore, a borrower with a 60% LTV will almost always be offered a significantly lower interest rate than a borrower with a 95% LTV. When planning your deposit, hitting a lower LTV band (even by adding just a few thousand pounds to your deposit) can save you tens of thousands in interest over the life of the loan.</p>

            <h2>Decoding Stamp Duty Land Tax (SDLT)</h2>
            <p>Stamp Duty is often the largest upfront cost outside of the deposit itself. It is a progressive tax applied by the government when you purchase property or land in England and Northern Ireland. (Note: Scotland uses the Land and Buildings Transaction Tax, and Wales uses the Land Transaction Tax). The amount of SDLT you owe depends entirely on your "Buyer Type."</p>
            <p><strong>1. First-Time Buyers:</strong> The government offers significant relief to help people onto the ladder. You pay absolutely zero SDLT on the first £425,000 of a property. If the property costs between £425,001 and £625,000, you only pay 5% on that specific portion. However, if the property costs more than £625,000, you lose all first-time buyer privileges and pay the standard rates.</p>
            <p><strong>2. Standard Home Movers:</strong> If you have owned a home before, you pay standard progressive rates. Currently, you pay 0% on the first £250,000, 5% on the portion up to £925,000, 10% up to £1.5m, and 12% on anything above that.</p>
            <p><strong>3. Additional Properties (Buy-to-Let / Second Homes):</strong> If you are buying a second property without selling your main residence, the government applies a severe 3% surcharge across every single SDLT band. This massively increases the upfront cost of becoming a landlord.</p>

            <h2>Repayment vs. Interest Only Mortgages</h2>
            <p>When selecting your mortgage structure, you have two distinct paths, each with massive long-term implications.</p>
            <p><strong>Repayment (Capital & Interest):</strong> This is the standard for almost all residential buyers. Every month, your payment covers the interest generated by the loan, plus a portion of the principal debt. It guarantees that at the end of your 25-year term, your balance is £0, and you own the house outright. This builds equity automatically.</p>
            <p><strong>Interest Only:</strong> Common for Buy-to-Let investors, this structure requires you to only pay the interest generated by the loan each month. Your monthly payments are drastically lower, maximizing your cash flow. However, your principal balance never decreases. After 25 years, you still owe the bank the exact original loan amount. To qualify for this, lenders legally require you to prove a "Repayment Vehicle" (e.g., selling the property, selling a stock portfolio) to clear the debt at the end.</p>

            <h2>Fixed Rate vs. Standard Variable Rate (SVR)</h2>
            <p>The UK mortgage market is unique globally because long-term (30-year) fixed rates are incredibly rare. The vast majority of British borrowers take out short-term fixed deals (typically 2, 3, or 5 years).</p>
            <p>During your 2-year or 5-year fixed period, your interest rate and monthly payment are locked and cannot change, providing absolute budgeting security. However, when that fixed period ends, your mortgage automatically reverts to the lender's Standard Variable Rate (SVR), which is almost always significantly higher than your fixed rate. This causes "Payment Shock." To avoid this, UK borrowers regularly "Remortgage" (switch to a new fixed-rate deal with their current or a new lender) every few years.</p>

            <h2>The Hidden Costs of Buying a House</h2>
            <p>Your deposit and Stamp Duty are the largest capital outlays, but when budgeting for a house purchase in the UK, you must account for thousands of pounds in ancillary fees:</p>
            <p><strong>Conveyancing (Solicitor) Fees:</strong> You must hire a solicitor to handle the legal transfer of the property, conduct local authority searches, and register the property with the Land Registry. Expect to pay between £1,000 and £2,500.</p>
            <p><strong>Valuation and Survey Fees:</strong> The lender will charge a Valuation Fee (sometimes waived on new deals) to ensure the house is worth the loan amount. However, this is not a structural survey. You should independently hire a surveyor (RICS HomeBuyer Report or Building Survey) to identify hidden defects like damp or subsidence, costing between £400 and £1,000.</p>
            <p><strong>Arrangement Fees:</strong> To secure the lowest interest rates, lenders often charge a Product or Arrangement Fee, typically around £999. You can often add this to the mortgage balance, but remember you will pay interest on it for 25 years if you do.</p>

            <h2>Mortgage Affordability and Stress Testing</h2>
            <p>Since the regulatory reforms of the 2014 Mortgage Market Review (MMR), getting a mortgage is no longer just about multiplying your salary by 4.5. Lenders conduct rigorous affordability checks.</p>
            <p>They will scrutinize your bank statements for childcare costs, car finance, credit card debt, and regular living expenses. More importantly, they "stress test" the loan. They must verify that if interest rates were to spike to 6% or 7% when your fixed-rate deal ends, you could still afford the monthly repayments without defaulting. Using our calculator to simulate an interest rate 3% higher than current deals is an excellent way to stress-test your own finances before applying.</p>

            <h2>Conclusion</h2>
            <p>Securing a UK mortgage requires navigating a labyrinth of LTV bands, tax thresholds, and fixed-rate expiries. It is not a passive process; it requires active financial management every few years to ensure you remain on the optimal rate.</p>
            <p>By utilizing this UK Mortgage Calculator, you gain the foresight needed to confidently approach lenders. By accurately projecting your SDLT liability, understanding the amortization curve of your repayment structure, and recognizing the power of your deposit, you can transition from a prospective buyer to a financially secure homeowner.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/uk-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/uk-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
