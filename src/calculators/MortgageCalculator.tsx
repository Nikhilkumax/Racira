"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import FinancialTooltip from "@/components/calculator/FinancialTooltip";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MortgageResults {
  monthlyPI: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  interestSaved: number;
  timeSavedMonths: number;
  loanAmount: number;
  totalTaxInsurance: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  tooltip,
  type = "number",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  type?: string;
  [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (<>

        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      
</>)}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && (<>

        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      
</>)}
    </div>
  </div>
);

const parseMonthStr = (mStr: string): number => {
  if (!mStr) return 1;
  const normalized = mStr.trim().toLowerCase();
  const monthsMap: Record<string, number> = {
    jan: 1, january: 1, "1": 1, "01": 1,
    feb: 2, february: 2, "2": 2, "02": 2,
    mar: 3, march: 3, "3": 3, "03": 3,
    apr: 4, april: 4, "4": 4, "04": 4,
    may: 5, "5": 5, "05": 5,
    jun: 6, june: 6, "6": 6, "06": 6,
    jul: 7, july: 7, "7": 7, "07": 7,
    aug: 8, august: 8, "8": 8, "08": 8,
    sep: 9, september: 9, "9": 9, "09": 9,
    oct: 10, october: 10, "10": 10,
    nov: 11, november: 11, "11": 11,
    dec: 12, december: 12, "12": 12,
  };
  return monthsMap[normalized] || parseInt(normalized) || 1;
};

const calculateMortgage = ({
  homePriceVal,
  dpModeVal,
  dpPctVal,
  dpAmtVal,
  interestRateVal,
  loanTermVal,
  startDateVal,
  extraMonthlyVal,
  oneTimeExtraVal,
  annualExtraVal,
  propertyTaxVal,
  homeInsuranceVal,
  pmiVal,
  hoaFeeVal,
  otherCostsVal,
  paymentFreqVal,
}: {
  homePriceVal: number;
  dpModeVal: "percent" | "amount";
  dpPctVal: number;
  dpAmtVal: number;
  interestRateVal: number;
  loanTermVal: number;
  startDateVal: string;
  extraMonthlyVal: number;
  oneTimeExtraVal: number;
  annualExtraVal: number;
  propertyTaxVal: number;
  homeInsuranceVal: number;
  pmiVal: number;
  hoaFeeVal: number;
  otherCostsVal: number;
  paymentFreqVal: "monthly" | "biweekly";
}): MortgageResults => {
  const hp = homePriceVal;
  const P = dpModeVal === "percent" ? hp * (1 - dpPctVal / 100) : hp - dpAmtVal;
  const annualRate = interestRateVal;
  const years = loanTermVal;
  const extraM = extraMonthlyVal;
  const oneTime = oneTimeExtraVal;
  const annualE = annualExtraVal;
  const taxMonthly = propertyTaxVal / 12;
  const insMonthly = homeInsuranceVal / 12;
  const pmiMonthly = pmiVal;
  const hoaMonthly = hoaFeeVal;
  const otherMonthly = otherCostsVal;

  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (P <= 0 || r <= 0 || n <= 0) {
    return {
      monthlyPI: 0,
      totalMonthly: 0,
      totalInterest: 0,
      totalCost: 0,
      payoffDate: "N/A",
      interestSaved: 0,
      timeSavedMonths: 0,
      loanAmount: P,
      totalTaxInsurance: 0,
      monthlyRows: [],
      yearlyRows: [],
    };
  }

  const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalWithoutExtra = M * n;
  const totalInterestBase = totalWithoutExtra - P;
  const escrow = taxMonthly + insMonthly + pmiMonthly + hoaMonthly + otherMonthly;

  let balance = P;
  const monthlyRows: AmortRow[] = [];
  let totalPaid = 0;
  let month = 0;
  const hasExtra = extraM > 0 || oneTime > 0 || annualE > 0;

  while (balance > 0.01 && month < n * 2) {
    month++;
    const intPayment = balance * r;
    let prinPayment = M - intPayment;
    let extra = extraM;
    if (month === 1) extra += oneTime;
    if (month % 12 === 0) extra += annualE;
    prinPayment += extra;
    if (prinPayment > balance) {
      prinPayment = balance;
    }
    const totalPayment = intPayment + prinPayment;
    balance -= prinPayment;
    totalPaid += totalPayment;
    monthlyRows.push({
      period: month,
      payment: totalPayment,
      principal: prinPayment - extra > 0 ? prinPayment - extra : prinPayment,
      interest: intPayment,
      extraPayment: extra,
      balance: Math.max(0, balance),
    });
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const yearSlice = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (yearSlice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: yearSlice.reduce((s, r) => s + r.payment, 0),
      principal: yearSlice.reduce((s, r) => s + r.principal, 0),
      interest: yearSlice.reduce((s, r) => s + r.interest, 0),
      balance: yearSlice[yearSlice.length - 1].balance,
    });
  }

  const sd = startDateVal.split("-");
  const startMonth = parseMonthStr(sd[1]);
  const startYear = parseInt(sd[0]) || new Date().getFullYear();
  const payoffMonth = ((startMonth - 1 + month) % 12) + 1;
  const payoffYear = startYear + Math.floor((startMonth - 1 + month) / 12);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return {
    monthlyPI: M,
    totalMonthly: M + escrow,
    totalInterest: totalPaid - P,
    totalCost: totalPaid + escrow * month,
    payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
    interestSaved: hasExtra ? totalInterestBase - (totalPaid - P) : 0,
    timeSavedMonths: hasExtra ? n - month : 0,
    loanAmount: P,
    totalTaxInsurance: escrow * month,
    monthlyRows,
    yearlyRows,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const MortgageCalculator = () => {
  // Basic inputs
  const [homePrice, setHomePrice] = useState("400000");
  const [downPaymentAmt, setDownPaymentAmt] = useState("80000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [dpMode, setDpMode] = useState<"amount" | "percent">("percent");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getFullYear()}-${months[d.getMonth()]}`;
  });

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyTax, setPropertyTax] = useState("3600");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [pmi, setPmi] = useState("0");
  const [hoaFee, setHoaFee] = useState("0");
  const [otherCosts, setOtherCosts] = useState("0");
  const [extraMonthly, setExtraMonthly] = useState("0");
  const [oneTimeExtra, setOneTimeExtra] = useState("0");
  const [annualExtra, setAnnualExtra] = useState("0");
  const [paymentFreq, setPaymentFreq] = useState<"monthly" | "biweekly">("monthly");

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleHomePriceChange = (val: string) => {
    setHomePrice(val);
    const hp = parseFloat(val) || 0;
    if (dpMode === "percent") {
      const pct = parseFloat(downPaymentPct) || 0;
      setDownPaymentAmt(hp > 0 ? String(Math.round(hp * pct / 100)) : "0");
    } else {
      const amt = parseFloat(downPaymentAmt) || 0;
      setDownPaymentPct(hp > 0 ? String(((amt / hp) * 100).toFixed(1)) : "0");
    }
  };

  const handleDpInputChange = (val: string) => {
    const hp = parseFloat(homePrice) || 0;
    if (dpMode === "percent") {
      setDownPaymentPct(val);
      setDownPaymentAmt(hp > 0 ? String(Math.round(hp * (parseFloat(val) || 0) / 100)) : "0");
    } else {
      setDownPaymentAmt(val);
      setDownPaymentPct(hp > 0 ? String(((parseFloat(val) || 0) / hp * 100).toFixed(1)) : "0");
    }
  };

  const handleCalculate = () => {
    const calcResults = calculateMortgage({
      homePriceVal: parseFloat(homePrice) || 0,
      dpModeVal: dpMode,
      dpPctVal: parseFloat(downPaymentPct) || 0,
      dpAmtVal: parseFloat(downPaymentAmt) || 0,
      interestRateVal: parseFloat(interestRate) || 0,
      loanTermVal: parseFloat(loanTerm) || 0,
      startDateVal: startDate,
      extraMonthlyVal: parseFloat(extraMonthly) || 0,
      oneTimeExtraVal: parseFloat(oneTimeExtra) || 0,
      annualExtraVal: parseFloat(annualExtra) || 0,
      propertyTaxVal: parseFloat(propertyTax) || 0,
      homeInsuranceVal: parseFloat(homeInsurance) || 0,
      pmiVal: parseFloat(pmi) || 0,
      hoaFeeVal: parseFloat(hoaFee) || 0,
      otherCostsVal: parseFloat(otherCosts) || 0,
      paymentFreqVal: paymentFreq,
    });
    setResults(calcResults);
  };

  const reset = () => {
    setHomePrice("400000");
    setDownPaymentAmt("80000");
    setDownPaymentPct("20");
    setDpMode("percent");
    setInterestRate("6.5");
    setLoanTerm("30");
    setStartDate(() => {
      const d = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getFullYear()}-${months[d.getMonth()]}`;
    });
    setPropertyTax("3600");
    setHomeInsurance("1200");
    setPmi("0");
    setHoaFee("0");
    setOtherCosts("0");
    setExtraMonthly("0");
    setOneTimeExtra("0");
    setAnnualExtra("0");
    setPaymentFreq("monthly");

    const defaultResults = calculateMortgage({
      homePriceVal: 400000,
      dpModeVal: "percent",
      dpPctVal: 20,
      dpAmtVal: 80000,
      interestRateVal: 6.5,
      loanTermVal: 30,
      startDateVal: (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })(),
      extraMonthlyVal: 0,
      oneTimeExtraVal: 0,
      annualExtraVal: 0,
      propertyTaxVal: 3600,
      homeInsuranceVal: 1200,
      pmiVal: 0,
      hoaFeeVal: 0,
      otherCostsVal: 0,
      paymentFreqVal: "monthly",
    });
    setResults(defaultResults);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Mortgage Amortization – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const getBreakdownData = () => {
    if (!results) return [];
    const months = results.monthlyRows.length || 1;
    const years = months / 12;

    const hp = parseFloat(homePrice) || 0;
    const annualTax = parseFloat(propertyTax) || 0;
    const annualIns = parseFloat(homeInsurance) || 0;
    const monthlyPmi = parseFloat(pmi) || 0;
    const monthlyHoa = parseFloat(hoaFee) || 0;
    const monthlyOther = parseFloat(otherCosts) || 0;

    const totalPIPaid = results.monthlyRows.reduce((sum, row) => sum + row.principal + row.interest, 0);

    return [
      {
        label: "Mortgage (Principal & Interest)",
        monthly: results.monthlyPI,
        total: totalPIPaid,
      },
      {
        label: "Property Tax",
        monthly: annualTax / 12,
        total: annualTax * years,
      },
      {
        label: "Home Insurance",
        monthly: annualIns / 12,
        total: annualIns * years,
      },
      {
        label: "PMI",
        monthly: monthlyPmi,
        total: monthlyPmi * months,
      },
      {
        label: "Other Costs (HOA, etc.)",
        monthly: monthlyHoa + monthlyOther,
        total: (monthlyHoa + monthlyOther) * months,
      },
      {
        label: "Total Out-of-Pocket",
        monthly: results.totalMonthly,
        total: results.totalCost,
        isTotal: true,
      },
    ];
  };

  const pieData = results
    ? [
        { name: "P & I", value: results.monthlyPI, color: "hsl(var(--primary))" },
        { name: "Property Tax", value: (parseFloat(propertyTax) || 0) / 12, color: "#10b981" },
        { name: "Insurance", value: (parseFloat(homeInsurance) || 0) / 12, color: "#f59e0b" },
        { name: "Other Costs", value: (parseFloat(pmi) || 0) + (parseFloat(hoaFee) || 0) + (parseFloat(otherCosts) || 0), color: "#8b5cf6" },
      ]
    : [];

  const activePieData = pieData.filter((d) => d.value > 0);

  const faqs = [
    { question: "What is a mortgage calculator?", answer: "A mortgage calculator estimates your monthly home loan payments including principal, interest, taxes, and insurance. It helps you understand the true cost of homeownership and compare different scenarios before committing to a mortgage." },
    { question: "How is the monthly mortgage payment calculated?", answer: "The monthly payment uses the standard amortization formula: M = P[r(1+r)^n] / [(1+r)^n – 1], where P is the principal, r is the monthly interest rate, and n is the total number of payments. Taxes, insurance, and PMI are added separately." },
    { question: "What is PMI and when is it required?", answer: "Private Mortgage Insurance (PMI) is typically required when your down payment is less than 20% of the home price. PMI protects the lender if you default. It usually costs 0.5% to 1% of the loan amount annually and can be removed once you reach 20% equity." },
    { question: "How do extra payments save money?", answer: "Extra payments go directly toward reducing your principal balance. This reduces the interest charged in every subsequent month, shortening your loan term and saving thousands in total interest paid over the life of the loan." },
    { question: "What is an amortization schedule?", answer: "An amortization schedule is a table showing each payment broken down into principal and interest portions over the life of the loan. In early payments, most goes to interest. Over time, more goes to principal. Our calculator generates a complete monthly and yearly schedule." },
    { question: "Should I choose a 15-year or 30-year mortgage?", answer: "A 15-year mortgage has higher monthly payments but saves significant interest over the loan term. A 30-year mortgage has lower monthly payments, providing more flexibility. Use our calculator to compare both scenarios side-by-side." },
    { question: "Does this include property taxes and insurance?", answer: "Yes. Our advanced calculator includes fields for property tax, homeowners insurance, PMI, HOA fees, and other monthly costs. These are added to your principal and interest to show the true total monthly payment." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Mortgage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="home-price"
                label="Home Price"
                value={homePrice}
                onChange={handleHomePriceChange}
                prefix="$"
              />

              {/* Down Payment Custom Field */}
              <div className="flex flex-col">
                <label htmlFor="down-payment" className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Down Payment
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  {dpMode === "amount" && (
                    <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
                      $
                    </span>
                  )}
                  <input
                    id="down-payment"
                    type="number"
                    value={dpMode === "percent" ? downPaymentPct : downPaymentAmt}
                    onChange={(e) => handleDpInputChange(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                  />
                  <div className="flex border-l border-input h-full shrink-0">
                    <button
                      type="button"
                      onClick={() => setDpMode("percent")}
                      className={`px-2 text-sm font-bold transition-colors border-r border-input ${
                        dpMode === "percent"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpMode("amount")}
                      className={`px-2 text-sm font-bold transition-colors ${
                        dpMode === "amount"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      $
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="interest-rate"
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
              />

              <CompactInput
                id="loan-term"
                label="Loan Term"
                value={loanTerm}
                onChange={setLoanTerm}
                suffix="years"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="start-month" className="text-sm font-semibold text-foreground mb-1">
                  Start Date
                </label>
                <div className="grid grid-cols-2 gap-2 h-9">
                  {/* Month select dropdown */}
                  <div className="relative h-full">
                    <select
                      id="start-month"
                      value={startDate.split("-")[1] || "Jan"}
                      onChange={(e) => {
                        const parts = startDate.split("-");
                        const y = parts[0] || "2026";
                        setStartDate(`${y}-${e.target.value}`);
                      }}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year input - simple text input */}
                  <div className="relative h-full">
                    <input
                      id="start-year"
                      type="text"
                      value={startDate.split("-")[0] || ""}
                      onChange={(e) => {
                        const parts = startDate.split("-");
                        const m = parts[1] || "May";
                        setStartDate(`${e.target.value}-${m}`);
                      }}
                      placeholder="Year"
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Frequency selector */}
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Payment Frequency
                </label>
                <div className="flex rounded-md border border-input overflow-hidden h-9 w-full">
                  <button
                    type="button"
                    onClick={() => setPaymentFreq("monthly")}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      paymentFreq === "monthly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFreq("biweekly")}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${
                      paymentFreq === "biweekly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Bi-Weekly
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (<>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput
                    id="property-tax"
                    label="Property Tax (Annual)"
                    value={propertyTax}
                    onChange={setPropertyTax}
                    prefix="$"
                  />
                  <CompactInput
                    id="home-insurance"
                    label="Home Insurance (Annual)"
                    value={homeInsurance}
                    onChange={setHomeInsurance}
                    prefix="$"
                  />
                  <CompactInput
                    id="pmi"
                    label="PMI (Monthly)"
                    value={pmi}
                    onChange={setPmi}
                    prefix="$"
                  />
                  <CompactInput
                    id="hoa"
                    label="HOA Fee (Monthly)"
                    value={hoaFee}
                    onChange={setHoaFee}
                    prefix="$"
                  />
                  <CompactInput
                    id="other-costs"
                    label="Other Monthly Costs"
                    value={otherCosts}
                    onChange={setOtherCosts}
                    prefix="$"
                  />
                  <CompactInput
                    id="extra-monthly"
                    label="Extra Monthly Payment"
                    value={extraMonthly}
                    onChange={setExtraMonthly}
                    prefix="$"
                  />
                  <CompactInput
                    id="one-time-extra"
                    label="One-Time Extra"
                    value={oneTimeExtra}
                    onChange={setOneTimeExtra}
                    prefix="$"
                  />
                  <CompactInput
                    id="annual-extra"
                    label="Annual Extra"
                    value={annualExtra}
                    onChange={setAnnualExtra}
                    prefix="$"
                  />
                </div>
              
</>)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                {/* Results Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>

                {/* Component 1: Monthly Payment Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center relative overflow-hidden">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    ${results.totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Principal & Interest: ${results.monthlyPI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                  </div>
                </div>

                {/* Extra Payment Savings alert if applicable */}
                {results.interestSaved > 0 && (<>

                  <div className="p-3 rounded-lg bg-accent/40 border border-accent/60 text-sm flex flex-col gap-1">
                    <span className="font-bold text-accent-foreground">⚡ Extra Payment Savings:</span>
                    <span className="text-muted-foreground">
                      By adding extra payments, you will save <strong className="text-foreground">${Math.round(results.interestSaved).toLocaleString()}</strong> in interest and pay off the loan <strong className="text-foreground">{Math.floor(results.timeSavedMonths / 12)} years {results.timeSavedMonths % 12} months</strong> earlier!
                    </span>
                  </div>
                
</>)}

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Expense Category</th>
                        <th className="p-2.5 text-right w-[110px]">Monthly</th>
                        <th className="p-2.5 pr-3 text-right w-[130px]">Total Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {getBreakdownData().map((item) => (
                        <tr
                          key={item.label}
                          className={`hover:bg-secondary/20 transition-colors ${
                            item.isTotal ? "font-bold bg-secondary/30 text-foreground text-base border-t border-border" : "text-muted-foreground"
                          }`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{item.label}</td>
                          <td className="p-2.5 text-right text-foreground">
                            ${item.monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 pr-3 text-right text-foreground font-semibold">
                            ${item.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Recharts Pie Chart & Legend */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                  <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                    {mounted && activePieData.length > 0 ? (
                      <div className="w-[170px] h-[170px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={activePieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={70}
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total / mo</span>
                          <span className="text-lg font-extrabold text-foreground leading-tight">
                            ${Math.round(results.totalMonthly).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[170px] flex items-center justify-center text-muted-foreground text-[13px]">
                        Calculating chart...
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    <h4 className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Monthly Payment Split</h4>
                    {pieData.map((item) => {
                      const totalVal = results.totalMonthly;
                      const pct = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-muted-foreground truncate">{item.name}</span>
                          </div>
                          <span className="text-foreground font-bold shrink-0">
                            ${item.value.toFixed(2)} ({pct.toFixed(1)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Component 4: Summary Stats Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">House Price</span>
                    <span className="text-base font-extrabold text-foreground">
                      ${(parseFloat(homePrice) || 0).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Loan Amount</span>
                    <span className="text-base font-extrabold text-foreground">
                      ${Math.round(results.loanAmount).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Down Payment</span>
                    <span className="text-base font-extrabold text-foreground">
                      ${Math.round(dpMode === "percent" ? (parseFloat(homePrice) || 0) * (parseFloat(downPaymentPct) || 0) / 100 : (parseFloat(downPaymentAmt) || 0)).toLocaleString("en-US")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({parseFloat(downPaymentPct) || 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Total Cost</span>
                    <span className="text-base font-extrabold text-foreground">
                      ${Math.round(results.totalCost).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Total Interest</span>
                    <span className="text-base font-extrabold text-foreground">
                      ${Math.round(results.totalInterest).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Payoff Date</span>
                    <span className="text-base font-extrabold text-primary">
                      {results.payoffDate}
                    </span>
                  </div>
                </div>

                {/* Amortization Table */}
                <div className="mt-1 border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">Amortization Schedule</h3>
                    <div className="flex bg-secondary/50 rounded-md p-0.5 border border-border">
                      <button
                        onClick={() => setViewMode("yearly")}
                        className={`px-2 py-0.5 rounded-sm text-[12px] font-bold transition-colors ${
                          viewMode === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-2 py-0.5 rounded-sm text-[12px] font-bold transition-colors ${
                          viewMode === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto rounded-lg border border-border">
                    <AmortizationTable
                      rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows}
                      yearly={viewMode === "yearly"}
                    />
                  </div>
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is a Mortgage Calculator?</h2>
            <p>A mortgage calculator is an essential financial planning tool that helps you estimate your monthly home loan payments. Our advanced calculator goes beyond basic principal and interest by including property taxes, homeowners insurance, PMI, HOA fees, and additional costs to give you a complete picture of your monthly housing expense.</p>
            <p>Whether you're a first-time homebuyer exploring affordability or a homeowner considering refinancing, our mortgage calculator provides the clarity you need to make informed decisions. The built-in amortization schedule shows exactly how each payment is split between principal and interest over the life of the loan.</p>

            <h2>How Mortgage Interest Works</h2>
            <p>When you take out a mortgage, your lender charges interest on the outstanding principal balance. In the early years of a standard amortization schedule, a large portion of each monthly payment goes toward interest rather than paying down the principal. As you gradually reduce the principal, the interest portion decreases and more of your payment chips away at the balance.</p>
            <p>For example, on a $320,000 mortgage at 6.5% interest over 30 years, your monthly payment would be approximately $2,023. In the first month alone, about $1,733 goes toward interest and only $290 toward principal. This ratio shifts dramatically over time, illustrating why early extra payments are so powerful.</p>

            <h2>Understanding Your Total Monthly Payment</h2>
            <p>Your total monthly housing payment consists of several components, often referred to as PITI: Principal, Interest, Taxes, and Insurance. Our calculator breaks down each component so you can see exactly where your money goes.</p>
            <ul>
              <li><strong>Principal & Interest:</strong> The core mortgage payment calculated using the amortization formula.</li>
              <li><strong>Property Tax:</strong> Annual property taxes divided by 12, typically 0.5%–2.5% of home value depending on your location.</li>
              <li><strong>Homeowners Insurance:</strong> Annual insurance premium divided by 12, protecting your property against damage and liability.</li>
              <li><strong>PMI:</strong> Private Mortgage Insurance, required when your down payment is less than 20% of the purchase price.</li>
              <li><strong>HOA Fees:</strong> Monthly homeowner association dues, common in condominiums and planned communities.</li>
            </ul>

            <h2>How Extra Payments Reduce Your Loan Term</h2>
            <p>Making additional payments — even modest ones — can dramatically reduce both total interest and loan duration. Extra payments go directly toward reducing the principal balance, which means less interest accrues in every subsequent month.</p>
            <p>Our calculator supports three types of extra payments: monthly additions, a one-time lump sum, and annual contributions. This flexibility lets you model real-world scenarios like applying a year-end bonus or consistently rounding up your payment.</p>

            <h3>Example Scenario</h3>
            <p>Consider a $350,000 home with 20% down ($70,000), leaving a $280,000 loan at 7% for 30 years. The base monthly P&I would be about $1,863. Adding just $200 per month extra reduces total interest by approximately $78,000 and pays off the mortgage 6 years early. Add property taxes ($4,200/year) and insurance ($1,500/year), and your total monthly payment would be about $2,338 before extra payments.</p>

            <h2>Benefits of Using an Amortization Schedule</h2>
            <p>An amortization schedule is your roadmap to debt freedom. It shows the exact breakdown of each payment into principal and interest, letting you see your equity building over time. Our calculator generates both monthly and yearly views, and you can print the schedule for your records or to share with a financial advisor.</p>
            <ul>
              <li><strong>Track equity growth:</strong> See how much of your home you truly own at any point in the loan.</li>
              <li><strong>Plan extra payments:</strong> Identify optimal times to make additional payments for maximum impact.</li>
              <li><strong>Compare scenarios:</strong> Run calculations with different terms, rates, or extra payments to find your best strategy.</li>
              <li><strong>Tax planning:</strong> Understand your annual interest paid for potential mortgage interest deductions.</li>
            </ul>

            <h2>Tips for Managing Your Mortgage</h2>
            <p>Before committing to extra payments, ensure you have an adequate emergency fund (3–6 months of expenses) and no higher-interest debt such as credit cards. Consider whether your mortgage has prepayment penalties — most modern mortgages do not, but it's worth confirming with your lender.</p>
            <p>Always compare multiple lenders when shopping for a mortgage. Even a 0.25% difference in interest rate can translate to tens of thousands of dollars over the life of a 30-year loan. Use our calculator to compare different rate scenarios side by side.</p>
            <p>If your interest rate is very low (under 4%), you may get a better return investing extra cash in diversified index funds rather than paying down the mortgage early. This decision depends on your risk tolerance, tax situation, and financial goals.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage" />
          <PopularCalculators exclude="/calculator/mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default MortgageCalculator;
