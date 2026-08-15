"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import FinancialTooltip from "@/domains/calculator/components/ui/FinancialTooltip";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

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
  totalPmiCost: number;
  totalHoaOther: number;
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
  const isBiweekly = paymentFreqVal === "biweekly";
  const periodsPerYear = isBiweekly ? 26 : 12;
  const hp = homePriceVal;
  const P = dpModeVal === "percent" ? hp * (1 - dpPctVal / 100) : hp - dpAmtVal;
  const annualRate = interestRateVal;
  const years = loanTermVal;
  const extraM = extraMonthlyVal;
  const oneTime = oneTimeExtraVal;
  const annualE = annualExtraVal;
  
  const taxPeriodic = propertyTaxVal / periodsPerYear;
  const insPeriodic = homeInsuranceVal / periodsPerYear;
  const hoaPeriodic = (hoaFeeVal * 12) / periodsPerYear;
  const otherPeriodic = (otherCostsVal * 12) / periodsPerYear;
  
  // annualPmiRate derived from monthly input assuming it's based on initial loan
  const annualPmiRate = P > 0 ? (pmiVal * 12) / P : 0;

  const periodicRate = annualRate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  if (P <= 0 || n <= 0) {
    return {
      monthlyPI: 0, totalMonthly: 0, totalInterest: 0, totalCost: 0, payoffDate: "N/A",
      interestSaved: 0, timeSavedMonths: 0, loanAmount: P, totalTaxInsurance: 0,
      monthlyRows: [], yearlyRows: [], totalPmiCost: 0, totalHoaOther: 0
    };
  }

  const basePayment = periodicRate > 0 
    ? P * (periodicRate * Math.pow(1 + periodicRate, n)) / (Math.pow(1 + periodicRate, n) - 1)
    : P / n;
    
  // Baseline loop (no extra payments) to calculate savings
  let balanceBase = P;
  let totalInterestBase = 0;
  let periodBase = 0;
  while (balanceBase > 0.01 && periodBase < n * 2) {
    periodBase++;
    const intPmt = periodicRate > 0 ? balanceBase * periodicRate : 0;
    let prinPmt = basePayment - intPmt;
    if (prinPmt > balanceBase) prinPmt = balanceBase;
    totalInterestBase += intPmt;
    balanceBase -= prinPmt;
  }
  const totalPeriodsBase = periodBase;

  // Actual loop with extras and PMI tracking
  let balance = P;
  const periodicRows: AmortRow[] = [];
  let totalPaidLoop = 0;
  let period = 0;
  let totalPmiCost = 0;
  let pmiActive = (P / hp) > 0.80;

  while (balance > 0.01 && period < n * 2) {
    period++;
    const intPayment = periodicRate > 0 ? balance * periodicRate : 0;
    let prinPayment = basePayment - intPayment;
    
    // Add extra payments properly scaled
    let extra = isBiweekly ? (extraM * 12 / 26) : extraM; 
    if (period === 1) extra += oneTime;
    if (period % periodsPerYear === 0) extra += annualE;
    
    prinPayment += extra;
    if (prinPayment > balance) prinPayment = balance;
    
    // Check PMI auto-cancellation
    const currentLTV = balance / hp;
    if (currentLTV <= 0.80) {
      pmiActive = false;
    }
    let currentPeriodicPMI = 0;
    if (pmiActive) {
      currentPeriodicPMI = (annualPmiRate * balance) / periodsPerYear;
      totalPmiCost += currentPeriodicPMI;
    }

    const totalPayment = intPayment + prinPayment;
    balance -= prinPayment;
    totalPaidLoop += totalPayment;
    
    periodicRows.push({
      period,
      payment: totalPayment,
      principal: prinPayment,
      interest: intPayment,
      extraPayment: extra,
      balance: Math.max(0, balance),
    });
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(periodicRows.length / periodsPerYear); y++) {
    const yearSlice = periodicRows.slice(y * periodsPerYear, (y + 1) * periodsPerYear);
    if (yearSlice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: yearSlice.reduce((s, row) => s + row.payment, 0),
      principal: yearSlice.reduce((s, row) => s + row.principal, 0),
      interest: yearSlice.reduce((s, row) => s + row.interest, 0),
      balance: yearSlice[yearSlice.length - 1].balance,
    });
  }

  const sd = startDateVal.split("-");
  const startMonth = parseMonthStr(sd[1]);
  const startYear = parseInt(sd[0]) || new Date().getFullYear();
  
  // Calculate exact payoff date based on periods
  const payoffMonth = ((startMonth - 1 + Math.ceil(period * 12 / periodsPerYear)) % 12) + 1;
  const payoffYear = startYear + Math.floor((startMonth - 1 + Math.ceil(period * 12 / periodsPerYear)) / 12);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const actualInterestPaid = totalPaidLoop - P;
  const periodsSaved = totalPeriodsBase - period;
  const timeSavedMonths = periodsSaved * 12 / periodsPerYear;
  const interestSaved = Math.max(0, totalInterestBase - actualInterestPaid);
  const hasExtras = extraM > 0 || oneTime > 0 || annualE > 0;

  const totalTaxInsurance = (propertyTaxVal + homeInsuranceVal) * years;
  const totalHoaOther = (hoaFeeVal * 12 + otherCostsVal * 12) * years;
  const totalCost = totalPaidLoop + totalTaxInsurance + totalPmiCost + totalHoaOther;

  return {
    monthlyPI: basePayment,
    totalMonthly: basePayment + taxPeriodic + insPeriodic + (pmiActive ? (annualPmiRate * P) / periodsPerYear : 0) + hoaPeriodic + otherPeriodic,
    totalInterest: actualInterestPaid,
    totalCost: totalCost,
    payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
    interestSaved: hasExtras ? interestSaved : 0,
    timeSavedMonths: hasExtras ? timeSavedMonths : 0,
    loanAmount: P,
    totalTaxInsurance: totalTaxInsurance,
    monthlyRows: periodicRows,
    yearlyRows,
    totalPmiCost,
    totalHoaOther: totalHoaOther,
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

  const [calcInputs, setCalcInputs] = useState(() => ({
    homePrice: "400000",
    downPaymentAmt: "80000",
    downPaymentPct: "20",
    dpMode: "percent" as "amount" | "percent",
    interestRate: "6.5",
    loanTerm: "30",
    startDate: `${new Date().getFullYear()}-${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()]}`,
    propertyTax: "3600",
    homeInsurance: "1200",
    pmi: "0",
    hoaFee: "0",
    otherCosts: "0",
    extraMonthly: "0",
    oneTimeExtra: "0",
    annualExtra: "0",
    paymentFreq: "monthly" as "monthly" | "biweekly",
  }));

  const [results, setResults] = useState<MortgageResults | null>(() => {
    const d = new Date();
    const startD = `${d.getFullYear()}-${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
    return calculateMortgage({
      homePriceVal: 400000, dpModeVal: "percent", dpPctVal: 20, dpAmtVal: 80000,
      interestRateVal: 6.5, loanTermVal: 30, startDateVal: startD,
      extraMonthlyVal: 0, oneTimeExtraVal: 0, annualExtraVal: 0,
      propertyTaxVal: 3600, homeInsuranceVal: 1200, pmiVal: 0,
      hoaFeeVal: 0, otherCostsVal: 0, paymentFreqVal: "monthly",
    });
  });
  
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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
    const inputs = {
      homePrice, downPaymentAmt, downPaymentPct, dpMode, interestRate, loanTerm, startDate,
      propertyTax, homeInsurance, pmi, hoaFee, otherCosts, extraMonthly, oneTimeExtra, annualExtra, paymentFreq
    };
    setCalcInputs(inputs);
    const calcResults = calculateMortgage({
      homePriceVal: parseFloat(inputs.homePrice) || 0,
      dpModeVal: inputs.dpMode,
      dpPctVal: parseFloat(inputs.downPaymentPct) || 0,
      dpAmtVal: parseFloat(inputs.downPaymentAmt) || 0,
      interestRateVal: parseFloat(inputs.interestRate) || 0,
      loanTermVal: parseFloat(inputs.loanTerm) || 0,
      startDateVal: inputs.startDate,
      extraMonthlyVal: parseFloat(inputs.extraMonthly) || 0,
      oneTimeExtraVal: parseFloat(inputs.oneTimeExtra) || 0,
      annualExtraVal: parseFloat(inputs.annualExtra) || 0,
      propertyTaxVal: parseFloat(inputs.propertyTax) || 0,
      homeInsuranceVal: parseFloat(inputs.homeInsurance) || 0,
      pmiVal: parseFloat(inputs.pmi) || 0,
      hoaFeeVal: parseFloat(inputs.hoaFee) || 0,
      otherCostsVal: parseFloat(inputs.otherCosts) || 0,
      paymentFreqVal: inputs.paymentFreq,
    });
    setResults(calcResults);
  };

  const reset = () => {
    const d = new Date();
    const startD = `${d.getFullYear()}-${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
    setHomePrice("400000"); setDownPaymentAmt("80000"); setDownPaymentPct("20"); setDpMode("percent");
    setInterestRate("6.5"); setLoanTerm("30"); setStartDate(startD);
    setPropertyTax("3600"); setHomeInsurance("1200"); setPmi("0"); setHoaFee("0"); setOtherCosts("0");
    setExtraMonthly("0"); setOneTimeExtra("0"); setAnnualExtra("0"); setPaymentFreq("monthly");

    const defaultInputs = {
      homePrice: "400000", downPaymentAmt: "80000", downPaymentPct: "20", dpMode: "percent" as "amount" | "percent",
      interestRate: "6.5", loanTerm: "30", startDate: startD, propertyTax: "3600", homeInsurance: "1200", pmi: "0",
      hoaFee: "0", otherCosts: "0", extraMonthly: "0", oneTimeExtra: "0", annualExtra: "0", paymentFreq: "monthly" as "monthly" | "biweekly"
    };
    setCalcInputs(defaultInputs);
    setResults(calculateMortgage({
      homePriceVal: 400000, dpModeVal: "percent", dpPctVal: 20, dpAmtVal: 80000,
      interestRateVal: 6.5, loanTermVal: 30, startDateVal: startD,
      extraMonthlyVal: 0, oneTimeExtraVal: 0, annualExtraVal: 0,
      propertyTaxVal: 3600, homeInsuranceVal: 1200, pmiVal: 0,
      hoaFeeVal: 0, otherCostsVal: 0, paymentFreqVal: "monthly",
    }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Mortgage Amortization – Racira</title>
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
    
    const isBiweekly = calcInputs.paymentFreq === "biweekly";
    const periodsPerYear = isBiweekly ? 26 : 12;
    const totalPeriods = results.monthlyRows.length;

    const hp = parseFloat(calcInputs.homePrice) || 0;
    const annualTax = parseFloat(calcInputs.propertyTax) || 0;
    const annualIns = parseFloat(calcInputs.homeInsurance) || 0;
    const monthlyPmi = parseFloat(calcInputs.pmi) || 0;
    const monthlyHoa = parseFloat(calcInputs.hoaFee) || 0;
    const monthlyOther = parseFloat(calcInputs.otherCosts) || 0;

    const totalPIPaid = results.monthlyRows.reduce((sum, row) => sum + row.principal + row.interest, 0);

    return [
      {
        label: "Mortgage (Principal & Interest)",
        monthly: results.monthlyPI,
        total: totalPIPaid,
      },
      {
        label: "Property Tax",
        monthly: annualTax / periodsPerYear,
        total: (annualTax / periodsPerYear) * totalPeriods,
      },
      {
        label: "Home Insurance",
        monthly: annualIns / periodsPerYear,
        total: (annualIns / periodsPerYear) * totalPeriods,
      },
      {
        label: "PMI",
        monthly: results.totalPmiCost > 0 ? (monthlyPmi * 12) / periodsPerYear : 0,
        total: results.totalPmiCost,
      },
      {
        label: "Other Costs (HOA, etc.)",
        monthly: ((monthlyHoa + monthlyOther) * 12) / periodsPerYear,
        total: results.totalHoaOther,
      },
      {
        label: "Total Out-of-Pocket",
        monthly: results.totalMonthly,
        total: results.totalCost,
        isTotal: true,
      },
    ];
  };

  const isBiweekly = calcInputs.paymentFreq === "biweekly";
  const freqLabel = isBiweekly ? "Bi-Weekly" : "Monthly";
  const freqSuffix = isBiweekly ? "/bi-wk" : "/mo";
  const periodsPerYear = isBiweekly ? 26 : 12;

  const pieData = results
    ? [
        { name: "P & I", value: results.monthlyPI, color: "hsl(var(--primary))" },
        { name: "Property Tax", value: (parseFloat(calcInputs.propertyTax) || 0) / periodsPerYear, color: "#10b981" },
        { name: "Insurance", value: (parseFloat(calcInputs.homeInsurance) || 0) / periodsPerYear, color: "#f59e0b" },
        { name: "Other Costs", value: (results.totalPmiCost > 0 ? (parseFloat(calcInputs.pmi) || 0) * 12 / periodsPerYear : 0) + ((parseFloat(calcInputs.hoaFee) || 0) * 12 / periodsPerYear) + ((parseFloat(calcInputs.otherCosts) || 0) * 12 / periodsPerYear), color: "#8b5cf6" },
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">


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

                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  {/* Payment Details */}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Details</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-foreground mb-1">Start Date</label>
                        <div className="grid grid-cols-2 gap-2 h-9">
                          <div className="relative h-full">
                            <select
                              value={startDate.split("-")[1] || "Jan"}
                              onChange={(e) => {
                                const parts = startDate.split("-");
                                const y = parts[0] || "2026";
                                setStartDate(`${y}-${e.target.value}`);
                              }}
                              className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                            >
                              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="relative h-full">
                            <input
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
                      <div className="flex flex-col">
                        <label className="flex items-center text-sm font-semibold text-foreground mb-1">Payment Frequency</label>
                        <div className="flex rounded-md border border-input overflow-hidden h-9 w-full">
                          <button
                            type="button"
                            onClick={() => setPaymentFreq("monthly")}
                            className={`flex-1 text-sm font-semibold transition-colors ${paymentFreq === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentFreq("biweekly")}
                            className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${paymentFreq === "biweekly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                          >
                            Bi-Weekly
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Taxes & Insurance */}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Taxes & Insurance</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="property-tax" label="Property Tax (Annual)" value={propertyTax} onChange={setPropertyTax} prefix="$" />
                      <CompactInput id="home-insurance" label="Home Insurance (Annual)" value={homeInsurance} onChange={setHomeInsurance} prefix="$" />
                      <CompactInput id="pmi" label={`PMI (${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"})`} value={pmi} onChange={setPmi} prefix="$" />
                      <CompactInput id="hoa" label={`HOA Fee (${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"})`} value={hoaFee} onChange={setHoaFee} prefix="$" />
                      <CompactInput id="other-costs" label={`Other ${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"} Costs`} value={otherCosts} onChange={setOtherCosts} prefix="$" />
                    </div>
                  </div>

                  {/* Extra Payments */}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payments</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="extra-monthly" label={`Extra ${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"}`} value={extraMonthly} onChange={setExtraMonthly} prefix="$" />
                      <CompactInput id="one-time-extra" label="One-Time Extra" value={oneTimeExtra} onChange={setOneTimeExtra} prefix="$" />
                      <CompactInput id="annual-extra" label="Annual Extra" value={annualExtra} onChange={setAnnualExtra} prefix="$" />
                    </div>
                  </div>
                </div>
              
</>)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
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

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                {/* Print Button */}
                <div className="flex justify-end">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>

                {/* Component 1: Monthly Payment Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated {freqLabel} Payment</div>
                  <div className="text-4xl font-bold text-primary mb-1">
                    ${results.totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Principal & Interest: ${results.monthlyPI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{freqSuffix}
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
                        <th className="p-2.5 text-right w-[110px]">{freqLabel.toUpperCase()}</th>
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
                          <td className="text-base py-2.5 px-3 font-semibold text-foreground">{item.label}</td>
                          <td className="text-base py-2.5 px-3 text-right text-foreground">
                            ${item.monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-base py-2.5 px-3 text-right text-foreground font-semibold">
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
                        <LazyView minHeight={170}>
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
                        </LazyView>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total {freqSuffix}</span>
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
                    <h4 className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{freqLabel} Payment Split</h4>
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
                      ${(parseFloat(calcInputs.homePrice) || 0).toLocaleString("en-US")}
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
                      ${Math.round(calcInputs.dpMode === "percent" ? (parseFloat(calcInputs.homePrice) || 0) * (parseFloat(calcInputs.downPaymentPct) || 0) / 100 : (parseFloat(calcInputs.downPaymentAmt) || 0)).toLocaleString("en-US")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({parseFloat(calcInputs.downPaymentPct) || 0}%)
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
                <div className="mt-1 border border-border rounded-xl p-3 sm:p-4 bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3">
                    <h3 className="text-sm font-bold text-foreground">Amortization Schedule</h3>
                    <div className="flex bg-secondary/50 rounded-md p-0.5 border border-border w-full sm:w-auto">
                      <button
                        onClick={() => setViewMode("yearly")}
                        className={`px-3 min-h-[36px] flex items-center justify-center rounded-sm text-[12px] font-bold transition-colors ${
                          viewMode === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-3 min-h-[36px] flex items-center justify-center rounded-sm text-[12px] font-bold transition-colors ${
                          viewMode === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {freqLabel}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto overflow-x-hidden rounded-lg border border-border print:max-h-none print:overflow-visible print:border-none [scrollbar-width:thin]">
                    <LazyView minHeight={300}>
                      <AmortizationTable
                        rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows}
                        yearly={viewMode === "yearly"}
                        periodLabel={freqLabel}
                      />
                    </LazyView>
                  </div>
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <section className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">What Is a Mortgage Calculator?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A mortgage calculator is an essential financial planning tool that helps you estimate your monthly home loan payments. Our advanced calculator goes beyond basic principal and interest by including property taxes, homeowners insurance, private mortgage insurance, homeowner association fees, and additional costs to give you a complete picture of your monthly housing expense. Whether you are a first-time homebuyer exploring affordability or a homeowner considering refinancing, our mortgage calculator provides the clarity you need to make informed decisions. The built-in amortization schedule shows exactly how each payment is split between principal and interest over the life of the loan.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">How It Works</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you take out a mortgage, your lender charges interest on the outstanding principal balance. In the early years of a standard amortization schedule, a large portion of each monthly payment goes toward interest rather than paying down the principal. As you gradually reduce the principal, the interest portion decreases and more of your payment chips away at the balance. The monthly payment uses the standard amortization formula where the payment equals the principal multiplied by the monthly interest rate and the compounded rate over the total number of payments, all divided by the compounded rate minus one. Taxes, insurance, and private mortgage insurance are added separately to this base amount.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your total monthly housing payment consists of several components, often referred to as principal, interest, taxes, and insurance. Our calculator breaks down each component so you can see exactly where your money goes. The core mortgage payment is calculated using the amortization formula. The property tax is your annual property taxes divided by twelve, typically representing a small percentage of your home value depending on your location. Homeowners insurance is the annual insurance premium divided by twelve, protecting your property against damage and liability. Private mortgage insurance is typically required when your down payment is less than twenty percent of the purchase price. Finally, homeowner association dues are added if you live in a planned community.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Several key inputs determine your final mortgage payment. The home price and your down payment dictate the total loan amount. A larger down payment reduces your loan principal and can eliminate the need for private mortgage insurance. Your interest rate directly affects the cost of borrowing; even a small reduction in the rate can save tens of thousands of dollars over the life of the loan. The loan term is also crucial. A thirty-year mortgage offers lower monthly payments but accrues more total interest, while a fifteen-year term has higher monthly payments but saves significant interest. Advanced options like property taxes, homeowners insurance, and association fees provide a realistic view of your total monthly obligations.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our calculator includes an advanced options section that allows you to input precise figures for property tax, home insurance, private mortgage insurance, homeowner association fees, and other costs. This section also supports modeling extra payments. You can add extra monthly payments, a one-time lump sum payment, or an annual extra payment. These advanced features let you see exactly how additional contributions accelerate your payoff date and reduce the total interest paid over the life of the loan. The payment frequency toggle allows you to compare standard monthly payments against a bi-weekly payment schedule, which naturally results in one extra full payment per year.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Consider a home priced at four hundred thousand dollars with a twenty percent down payment of eighty thousand dollars, leaving a three hundred and twenty thousand dollar loan at a six point five percent interest rate for thirty years. The base monthly principal and interest payment would be approximately two thousand and twenty-two dollars. In the first month, about one thousand seven hundred and thirty-three dollars goes toward interest and only two hundred and eighty-nine dollars toward principal. If you use the advanced options to add just two hundred dollars per month in extra payments, you reduce the total interest by a substantial amount and pay off the mortgage several years early. Adding property taxes and insurance to the advanced inputs shows your true out-of-pocket monthly cost.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Before committing to extra payments on your mortgage, ensure you have an adequate emergency fund covering three to six months of living expenses. It is also wise to pay off any higher-interest debt, such as credit card balances, before accelerating your mortgage payoff. Check with your lender to ensure your mortgage does not have prepayment penalties, although most modern mortgages allow extra payments without fees. Always compare multiple lenders when shopping for a mortgage because even a fraction of a percent difference in your interest rate can dramatically alter your long-term financial picture. Use the amortization schedule to track your equity growth and plan your financial future.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Benefits</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Using a comprehensive mortgage calculator empowers you to take control of your homeownership journey. It provides a transparent view of your financial commitments and helps you avoid unexpected costs. By modeling different scenarios with our advanced features, you can optimize your loan structure, find the perfect balance between monthly affordability and long-term interest savings, and confidently navigate the real estate market. The detailed amortization schedule serves as a roadmap to debt freedom, showing you exactly when you will build significant equity and ultimately own your home outright.
                </p>
              </div>
            </section>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage" />
          <PopularCalculators exclude="/calculator/mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default MortgageCalculator;
