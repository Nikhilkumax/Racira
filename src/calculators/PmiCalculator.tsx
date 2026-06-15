"use client";
import React, { useState, useRef } from "react";
import { ChevronDown, RotateCcw, Printer, Calculator, ChevronUp } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { calculatePmi, MONTHS, type PmiInputs, type LoanType, type PaymentFreq, type DpMode, type PmiMode } from "./pmiLogic";
import PmiLtvChart from "./PmiLtvChart";
import PmiAmortizationTable from "./PmiAmortizationTable";

const fmt = (n: number, dec = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  min,
  max,
  step,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
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
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);



const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const PmiCalculator = () => {
  const now = new Date();
  const [homeValue, setHomeValue] = useState("400000");
  const [dpMode, setDpMode] = useState<DpMode>("percent");
  const [dpPct, setDpPct] = useState("10");
  const [dpAmt, setDpAmt] = useState("40000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [creditScore, setCreditScore] = useState("720");
  const [loanType, setLoanType] = useState<LoanType>("conventional");
  const [propertyUse, setPropertyUse] = useState("primary");
  const [startMonth, setStartMonth] = useState(MONTHS[now.getMonth()]);
  const [startYear, setStartYear] = useState(String(now.getFullYear()));
  const [paymentFreq, setPaymentFreq] = useState<PaymentFreq>("monthly");
  const [showAdv, setShowAdv] = useState(false);
  const [pmiMode, setPmiMode] = useState<PmiMode>("auto");
  const [manualPmiRate, setManualPmiRate] = useState("0.5");
  const [propertyTax, setPropertyTax] = useState("3600");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [hoaFee, setHoaFee] = useState("0");
  const [extraMonthly, setExtraMonthly] = useState("0");
  const [oneTimeExtra, setOneTimeExtra] = useState("0");
  const [annualExtra, setAnnualExtra] = useState("0");
  const [fhaMipMode, setFhaMipMode] = useState<PmiMode>("auto");
  const [manualFhaMipRate, setManualFhaMipRate] = useState("0.85");
  const [vaFundingFeeRate, setVaFundingFeeRate] = useState("2.15");
  const [appreciationRate, setAppreciationRate] = useState("0");
  const [cancelEarlyExtra, setCancelEarlyExtra] = useState("0");
  const [showCancelEarly, setShowCancelEarly] = useState(false);
  const [showDpComparison, setShowDpComparison] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [isCustomTerm, setIsCustomTerm] = useState(false);
  const [customTerm, setCustomTerm] = useState("17");
  const printRef = useRef<HTMLDivElement>(null);

  const getInputs = (): PmiInputs => ({
    homeValue: parseFloat(homeValue) || 0,
    dpMode, dpPct: parseFloat(dpPct) || 0, dpAmt: parseFloat(dpAmt) || 0,
    interestRate: parseFloat(interestRate) || 0,
    loanTerm: isCustomTerm ? (parseFloat(customTerm) || 1) : (parseFloat(loanTerm) || 30),
    creditScore: parseInt(creditScore) || 720,
    loanType, propertyUse, startMonth, startYear,
    paymentFreq, pmiMode, manualPmiRate: parseFloat(manualPmiRate) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    homeInsurance: parseFloat(homeInsurance) || 0,
    hoaFee: parseFloat(hoaFee) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    oneTimeExtra: parseFloat(oneTimeExtra) || 0,
    annualExtra: parseFloat(annualExtra) || 0,
    fhaMipMode, manualFhaMipRate: parseFloat(manualFhaMipRate) || 0,
    vaFundingFeeRate: parseFloat(vaFundingFeeRate) || 0,
    appreciationRate: parseFloat(appreciationRate) || 0,
  });

  const defaultInputs: PmiInputs = {
    homeValue: 400000, dpMode: "percent", dpPct: 10, dpAmt: 40000,
    interestRate: 6.5, loanTerm: 30, creditScore: 720, loanType: "conventional",
    propertyUse: "primary", startMonth: MONTHS[now.getMonth()], startYear: String(now.getFullYear()),
    paymentFreq: "monthly", pmiMode: "auto", manualPmiRate: 0,
    propertyTax: 3600, homeInsurance: 1200, hoaFee: 0,
    extraMonthly: 0, oneTimeExtra: 0, annualExtra: 0,
    fhaMipMode: "auto", manualFhaMipRate: 0, vaFundingFeeRate: 2.15,
    appreciationRate: 0,
  };

  const [results, setResults] = useState(() => calculatePmi(defaultInputs));
  const [calcInputs, setCalcInputs] = useState<PmiInputs>(() => defaultInputs);

  // mounted is always true (initialized to true above)

  const handleHvChange = (v: string) => {
    setHomeValue(v);
    const hv = parseFloat(v) || 0;
    if (dpMode === "percent") setDpAmt(String(Math.round(hv * (parseFloat(dpPct) || 0) / 100)));
    else setDpPct(hv > 0 ? String(((parseFloat(dpAmt) || 0) / hv * 100).toFixed(1)) : "0");
  };
  const handleDpChange = (v: string) => {
    const hv = parseFloat(homeValue) || 0;
    if (dpMode === "percent") { setDpPct(v); setDpAmt(String(Math.round(hv * (parseFloat(v) || 0) / 100))); }
    else { setDpAmt(v); setDpPct(hv > 0 ? String(((parseFloat(v) || 0) / hv * 100).toFixed(1)) : "0"); }
  };
  const handleDpModeToggle = (m: string) => {
    setDpMode(m as DpMode);
  };

  const reset = () => {
    setHomeValue("400000"); setDpMode("percent"); setDpPct("10"); setDpAmt("40000");
    setInterestRate("6.5"); setLoanTerm("30"); setCreditScore("720");
    setLoanType("conventional"); setPropertyUse("primary");
    setStartMonth(MONTHS[now.getMonth()]); setStartYear(String(now.getFullYear()));
    setPaymentFreq("monthly"); setPmiMode("auto"); setManualPmiRate("0.5");
    setPropertyTax("3600"); setHomeInsurance("1200"); setHoaFee("0");
    setExtraMonthly("0"); setOneTimeExtra("0"); setAnnualExtra("0");
    setFhaMipMode("auto"); setManualFhaMipRate("0.85");
    setVaFundingFeeRate("2.15"); setAppreciationRate("0");
    setCancelEarlyExtra("0"); setIsCustomTerm(false); setCustomTerm("17");
    setCalcInputs(defaultInputs);
    setResults(calculatePmi(defaultInputs));
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Derived live values ───────────────────────────────────────────────────
  const liveHv = parseFloat(homeValue) || 0;
  const liveDpAmt = dpMode === "amount" ? (parseFloat(dpAmt) || 0) : liveHv * (parseFloat(dpPct) || 0) / 100;
  const liveLtv = liveHv > 0 ? Math.min(100, Math.max(0, (liveHv - liveDpAmt) / liveHv * 100)) : 100;
  const ltvBadgeColor = liveLtv > 90 ? "bg-red-500" : liveLtv > 80 ? "bg-orange-500" : "bg-emerald-500";
  const isInvalidDp = liveHv > 0 && liveDpAmt >= liveHv;
  const noPmiNeeded = liveLtv <= 80;
  const liveDpPct = liveHv > 0 ? (liveDpAmt / liveHv) * 100 : 0;

  // ── Comprehensive inline validation ──────────────────────────────────────
  const valErrors: Record<string, string> = {};
  if (!homeValue || liveHv <= 0) valErrors.homeValue = "Home Value is required and must be > 0";
  if (liveDpAmt <= 0) valErrors.dp = "Down Payment must be > 0";
  else if (isInvalidDp) valErrors.dp = "Down Payment must be less than Home Value";
  else if (dpMode === "percent" && (parseFloat(dpPct) || 0) > 100) valErrors.dp = "Down Payment % cannot exceed 100";
  const ir = parseFloat(interestRate) || 0;
  if (ir < 0.1 || ir > 30) valErrors.interestRate = "Interest Rate must be between 0.1% and 30%";
  const creditScoreNum = parseInt(creditScore) || 0;
  if (!creditScore || creditScoreNum < 300 || creditScoreNum > 850) valErrors.creditScore = "Credit Score must be between 300 and 850";
  const termVal = isCustomTerm ? (parseFloat(customTerm) || 0) : (parseFloat(loanTerm) || 0);
  if (termVal <= 0) valErrors.loanTerm = "Loan Term must be > 0";
  if (pmiMode === "manual" && (parseFloat(manualPmiRate) || 0) < 0) valErrors.pmiRate = "PMI Rate must be ≥ 0";
  if ((parseFloat(extraMonthly) || 0) < 0) valErrors.extraMonthly = "Must be ≥ 0";
  if ((parseFloat(oneTimeExtra) || 0) < 0) valErrors.oneTimeExtra = "Must be ≥ 0";
  if ((parseFloat(annualExtra) || 0) < 0) valErrors.annualExtra = "Must be ≥ 0";
  const apprVal = parseFloat(appreciationRate) || 0;
  if (apprVal < 0 || apprVal > 20) valErrors.appreciationRate = "Appreciation must be 0–20%";
  const hasValidationErrors = Object.keys(valErrors).length > 0;

  const ltv = results.ltv;

  const isWeekly = calcInputs.paymentFreq === "weekly";
  const isBiwk = calcInputs.paymentFreq === "biweekly";
  const freqLabel = isWeekly ? "Weekly" : isBiwk ? "Bi-Weekly" : "Monthly";
  const freqSuffix = isWeekly ? "/wk" : isBiwk ? "/bi-wk" : "/mo";
  const freqMult = isWeekly ? 12 / 52 : isBiwk ? 12 / 26 : 1;

  const pieDataArr = [
    { name: "P & I", value: results.monthlyPI * freqMult, color: PIE_COLORS[0] },
    { name: "Property Tax", value: results.monthlyTax * freqMult, color: PIE_COLORS[1] },
    { name: "Insurance", value: results.monthlyInsurance * freqMult, color: PIE_COLORS[2] },
    { name: "PMI / MIP", value: results.monthlyPmi * freqMult, color: PIE_COLORS[3] },
    { name: "HOA / Other", value: results.monthlyHoa * freqMult, color: PIE_COLORS[4] },
  ];
  let pieSumPct = 0;
  const piePcts = pieDataArr.map(item => {
    if (results.totalMonthly <= 0) return 0;
    const p = Math.round((item.value / results.totalMonthly) * 1000) / 10;
    pieSumPct += p;
    return p;
  });
  if (results.totalMonthly > 0 && pieSumPct !== 100) {
    const diff = Math.round((100 - pieSumPct) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < piePcts.length; i++) {
      if (piePcts[i] > piePcts[maxIdx]) maxIdx = i;
    }
    piePcts[maxIdx] = Math.round((piePcts[maxIdx] + diff) * 10) / 10;
  }
  const pieDataWithPcts = pieDataArr.map((item, i) => ({ ...item, pct: piePcts[i] }));
  const pieData = pieDataWithPcts.filter(d => d.value > 0);

  const totalTax = calcInputs.propertyTax * calcInputs.loanTerm;
  const totalInsurance = calcInputs.homeInsurance * calcInputs.loanTerm;
  const totalHoa = calcInputs.hoaFee * 12 * calcInputs.loanTerm;
  
  type BreakdownRow = { label: string; periodic: number; total: number; highlight?: boolean; isTotal?: boolean; note?: string; };
  
  const breakdown: BreakdownRow[] = [
    { label: "Principal & Interest", periodic: results.monthlyPI * freqMult, total: results.totalPI },
    { label: "Property Tax", periodic: results.monthlyTax * freqMult, total: totalTax },
    { label: "Home Insurance", periodic: results.monthlyInsurance * freqMult, total: totalInsurance },
    { label: calcInputs.loanType === "fha" ? "MIP (Mortgage Ins.)" : calcInputs.loanType === "usda" ? "Guarantee Fee" : "PMI", periodic: results.monthlyPmi * freqMult, total: results.totalPmiCost, highlight: true },
    { label: "HOA / Other Costs", periodic: results.monthlyHoa * freqMult, total: totalHoa },
  ];
  if (calcInputs.loanType === "va") {
    breakdown[3] = { label: "PMI", periodic: 0, total: 0, highlight: false, note: "No PMI required" };
  }
  
  const totalOutOfPocket = results.totalPI + totalTax + totalInsurance + totalHoa + results.totalPmiCost;
  breakdown.push({ label: "Total Out-of-Pocket", periodic: results.totalMonthly * freqMult, total: totalOutOfPocket, isTotal: true });

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "PMI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PMI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">

            {/* HOME VALUE & DOWN PAYMENT */}
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="home-value"
                label="Home Value"
                value={homeValue}
                onChange={handleHvChange}
                prefix="$"
              />
              
              {/* DOWN PAYMENT with toggle + LTV badge */}
              <div className="flex flex-col">
                {/* Label + LTV badge: stacked on mobile, inline on md+ */}
                <div className="flex flex-col md:flex-row md:items-center gap-x-2 mb-1">
                  <label htmlFor="down-payment" className="text-sm font-semibold text-foreground leading-tight">
                    Down Payment
                  </label>
                  <span className={`self-start md:self-auto mt-0.5 md:mt-0 text-[10px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap ${ltvBadgeColor}`} title={noPmiNeeded ? "No PMI Required" : ""}>
                    LTV: {liveLtv.toFixed(1)}%{noPmiNeeded ? " ✓" : ""}
                  </span>
                </div>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  {dpMode === "amount" && (
                    <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
                      $
                    </span>
                  )}
                  <input
                    id="down-payment"
                    type="number"
                    value={dpMode === "percent" ? dpPct : dpAmt}
                    onChange={(e) => handleDpChange(e.target.value)}
                    className="w-full h-full pl-2 pr-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <div className="flex border-l border-input h-full shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDpModeToggle("percent")}
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
                      onClick={() => handleDpModeToggle("amount")}
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

            {/* INTEREST RATE + LOAN TERM */}
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="interest-rate"
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
              />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Loan Term</label>
                {isCustomTerm ? (
                  <div className="flex items-center h-11 md:h-9 w-full rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={customTerm}
                      onChange={e => setCustomTerm(e.target.value)}
                      style={{ MozAppearance: "textfield" } as React.CSSProperties}
                      className="flex-1 min-w-[48px] h-full bg-transparent px-2 md:px-3 text-sm focus:outline-none border-none text-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none rounded-l-md"
                    />
                    <span className="px-1 md:px-2 text-[13px] md:text-sm text-muted-foreground font-medium select-none shrink-0">Years</span>
                    <div className="relative h-full flex items-center border-l border-input shrink-0 min-w-[72px] overflow-visible bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-r-md">
                      <select
                        value="custom"
                        onChange={(e) => {
                          setIsCustomTerm(false);
                          setLoanTerm(e.target.value);
                        }}
                        className="w-full h-full pl-1.5 md:pl-2.5 pr-5 md:pr-7 py-0 bg-transparent text-[13px] md:text-sm font-semibold outline-none border-none text-foreground cursor-pointer appearance-none z-10 rounded-r-md"
                      >
                        <option value="custom" disabled>Custom</option>
                        {["10","15","20","25","30"].map((t) => (
                          <option key={t} value={t}>{t} years</option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-1 md:right-2 pointer-events-none z-0" />
                    </div>
                  </div>
                ) : (
                  <div className="relative h-9">
                    <select
                      id="loan-term"
                      value={loanTerm}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomTerm(true);
                        } else {
                          setLoanTerm(e.target.value);
                        }
                      }}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      {["10","15","20","25","30"].map((t) => (
                        <option key={t} value={t}>{t} years</option>
                      ))}
                      <option value="custom">Custom...</option>
                    </select>
                  </div>
                )}
                {valErrors.loanTerm && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanTerm}</p>}
              </div>
            </div>

            {/* CREDIT SCORE + LOAN TYPE */}
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="credit-score"
                label="Credit Score"
                value={creditScore}
                onChange={setCreditScore}
              />
              <div className="flex flex-col">
                <label htmlFor="loan-type" className="text-sm font-semibold text-foreground mb-1">
                  Loan Type
                </label>
                <div className="relative h-9">
                  <select
                    id="loan-type"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as LoanType)}
                    className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                  >
                    <option value="conventional">Conventional</option>
                    <option value="fha">FHA</option>
                    <option value="va">VA</option>
                    <option value="usda">USDA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PROPERTY USE + START DATE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="property-use" className="text-sm font-semibold text-foreground mb-1">
                  Property Use
                </label>
                <div className="relative h-9">
                  <select
                    id="property-use"
                    value={propertyUse}
                    onChange={(e) => setPropertyUse(e.target.value)}
                    className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                  >
                    <option value="primary">Primary Residence</option>
                    <option value="second">Second Home</option>
                    <option value="investment">Investment Property</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">
                  Start Date
                </label>
                <div className="grid grid-cols-2 gap-2 h-9">
                  <div className="relative h-full">
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="relative h-full">
                    <input
                      type="text"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      placeholder="Year"
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT FREQUENCY */}
            <div className="grid grid-cols-1 gap-4">
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
                  <button
                    type="button"
                    onClick={() => setPaymentFreq("weekly")}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${
                      paymentFreq === "weekly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  {/* PMI RATE */}
                  <div className="col-span-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className={`flex items-center text-sm font-semibold mb-1 ${noPmiNeeded ? "text-muted-foreground" : "text-foreground"}`}>
                        PMI Rate (%) {noPmiNeeded && "(N/A)"}
                      </label>
                      <div className="flex rounded-md border border-input overflow-hidden h-8 w-32">
                        <button
                          type="button"
                          disabled={noPmiNeeded}
                          onClick={() => setPmiMode("auto")}
                          className={`flex-1 text-xs font-semibold transition-colors ${
                            noPmiNeeded ? "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed" :
                            pmiMode === "auto" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          type="button"
                          disabled={noPmiNeeded}
                          onClick={() => setPmiMode("manual")}
                          className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${
                            noPmiNeeded ? "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed" :
                            pmiMode === "manual" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {pmiMode === "manual"
                      ? <div className="h-9 w-full flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <input
                            id="pmi-rate"
                            type="number"
                            value={manualPmiRate}
                            onChange={(e) => setManualPmiRate(e.target.value)}
                            disabled={noPmiNeeded}
                            className={`w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none ${noPmiNeeded ? "text-muted-foreground cursor-not-allowed" : "text-foreground"}`}
                          />
                          <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">%</span>
                        </div>
                      : <div className={`h-9 rounded-md border border-input px-3 flex items-center text-sm font-medium ${noPmiNeeded ? "bg-secondary/20 text-muted-foreground opacity-50" : "bg-secondary/40 text-muted-foreground"}`}>
                          {noPmiNeeded ? "No PMI Required" : `Auto: ~${results.pmiRate.toFixed(2)}% (based on LTV + credit score)`}
                        </div>}
                    {/* Credit tier label */}
                    {!noPmiNeeded && calcInputs.loanType === "conventional" && results.creditTierLabel && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tier: <span className="font-semibold text-foreground">{results.creditTierLabel}</span> → Rate: <span className="font-bold text-primary">{results.pmiRate.toFixed(2)}%</span>
                      </p>
                    )}
                  </div>

                  <CompactInput id="property-tax" label="Property Tax (Annual)" value={propertyTax} onChange={setPropertyTax} prefix="$" />
                  <CompactInput id="home-insurance" label="Home Insurance (Annual)" value={homeInsurance} onChange={setHomeInsurance} prefix="$" />
                  <CompactInput id="hoa-fee" label={`HOA Fee (${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"})`} value={hoaFee} onChange={setHoaFee} prefix="$" />
                  <CompactInput id="extra-monthly" label={`Extra ${paymentFreq === "biweekly" ? "Bi-Weekly" : "Monthly"} Payment`} value={extraMonthly} onChange={setExtraMonthly} prefix="$" />
                  <CompactInput id="one-time-extra" label="One-Time Extra Payment" value={oneTimeExtra} onChange={setOneTimeExtra} prefix="$" />
                  <CompactInput id="annual-extra" label="Annual Extra Payment" value={annualExtra} onChange={setAnnualExtra} prefix="$" />
                  <CompactInput id="appreciation-rate" label="Home Appreciation (Annual)" value={appreciationRate} onChange={setAppreciationRate} suffix="%" placeholder="0" />
                </div>
              )}
            </div>

              {loanType === "fha" && showAdv && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col gap-3 mt-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">🏦 FHA-Specific Fields</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Upfront MIP</span>
                    <span className="font-bold text-blue-600">1.75% (${fmtInt(results.upfrontMip)}) — Financed</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-sm font-semibold text-foreground mb-1">Annual MIP Rate</label>
                      <div className="flex rounded-md border border-input overflow-hidden h-8 w-32">
                        <button
                          type="button"
                          onClick={() => setFhaMipMode("auto")}
                          className={`flex-1 text-xs font-semibold transition-colors ${
                            fhaMipMode === "auto" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          type="button"
                          onClick={() => setFhaMipMode("manual")}
                          className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${
                            fhaMipMode === "manual" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {fhaMipMode === "manual"
                      ? <CompactInput id="fha-mip-rate" label="" value={manualFhaMipRate} onChange={setManualFhaMipRate} suffix="%" />
                      : <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Auto: {results.annualMipRate.toFixed(2)}% (based on LTV + term)
                        </div>}
                  </div>
                </div>
              )}

              {/* VA SPECIFIC */}
              {loanType === "va" && showAdv && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col gap-3 mt-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">🎖️ VA-Specific Fields</p>
                  <CompactInput id="va-funding-fee" label="VA Funding Fee (%)" value={vaFundingFeeRate} onChange={setVaFundingFeeRate} suffix="%" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Fee Financed</span>
                    <span className="font-bold text-blue-600">${fmtInt(results.vaFundingFee)}</span>
                  </div>
                </div>
              )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-2.5 mt-2">
              {hasValidationErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}
              {!isInvalidDp && liveLtv > 0 && liveLtv < 95 && liveHv > 0 && (parseFloat(dpMode === "percent" ? dpPct : String((parseFloat(dpAmt)||0)/(liveHv)*100)) < 5) && loanType === "conventional" && (
                <div className="text-sm text-amber-600 font-semibold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-md">
                  ⚠️ Conventional loans below 5% down are uncommon. Consider an FHA loan (as low as 3.5% down).
                </div>
              )}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={hasValidationErrors}
                  onClick={() => {
                    if (hasValidationErrors) return;
                    const inputs = getInputs();
                    setCalcInputs(inputs);
                    setResults(calculatePmi(inputs));
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !hasValidationErrors) {
                      const inputs = getInputs();
                      setCalcInputs(inputs);
                      setResults(calculatePmi(inputs));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                    hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                  }`}
                >
                  <Calculator className="h-4 w-4" /> Calculate
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset"
                  className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start print-section" ref={printRef}>

            {/* VA/USDA No PMI Banner */}
            {results.noMipLoan && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-6 rounded-2xl text-center">
                <p className="text-2xl font-black mb-1">✅ No PMI Required!</p>
                <p className="text-sm font-medium">{calcInputs.loanType.toUpperCase()} loans do not require Private Mortgage Insurance. LTV: {ltv.toFixed(1)}%</p>
              </div>
            )}

            {/* No PMI (conventional at ≤80% LTV) */}
            {!results.noMipLoan && !results.pmiRequired && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-6 rounded-2xl text-center">
                <p className="text-2xl font-black mb-1">✅ No PMI Required!</p>
                <p className="text-sm font-medium">Your LTV is {ltv.toFixed(1)}% — at or below 80%. No PMI needed on this conventional loan.</p>
                {results.noPmiSavingsVs10 > 0 && (
                  <p className="text-sm font-bold text-emerald-600 mt-2">
                    You’re saving <span className="text-lg">${fmt(results.noPmiSavingsVs10)}/mo</span> in PMI vs a 10% down scenario.
                  </p>
                )}
              </div>
            )}

            {/* PRIMARY PMI CARD */}
            {(results.pmiRequired || results.noMipLoan === false) && !results.noMipLoan && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center relative overflow-hidden">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated {freqLabel} PMI</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    ${fmt(results.monthlyPmi * freqMult)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Total {freqLabel} Payment: ${fmt(results.totalMonthly * freqMult)}{freqSuffix}
                  </div>
                </div>

                {/* COMPACT SUMMARY ROW */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current LTV</span>
                    <span className="font-extrabold text-foreground">{ltv.toFixed(1)}%</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{calcInputs.loanType === "fha" ? "MIP Rate" : "PMI Rate"}</span>
                    <span className="font-extrabold text-foreground">{calcInputs.loanType === "fha" ? results.annualMipRate.toFixed(2) : results.pmiRate.toFixed(2)}%</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{calcInputs.loanType === "fha" ? "MIP Ends" : "PMI Ends"}</span>
                    <span className="font-extrabold text-foreground">{results.pmiCancelDate}</span>
                  </div>
                </div>
              </>
            )}

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Expense Category</th>
                    <th className="p-2.5 text-right w-[110px]">{freqLabel}</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Total over {calcInputs.loanTerm} yrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <tr className={`hover:bg-secondary/20 transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t border-border" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                        <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                        <td className={`p-2.5 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>
                          {row.note ? <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{row.note}</span> : `$${fmt(row.periodic)}`}
                        </td>
                        <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>
                          {row.note ? "-" : `$${fmtInt(row.total)}`}
                        </td>
                      </tr>
                      {row.label === "MIP (Mortgage Ins.)" && results.fhaPmiLifetime && (
                        <tr>
                          <td colSpan={3} className="px-3 pb-2 pt-1 text-[11px] text-amber-700/80 italic font-medium bg-amber-500/10 border-t-0">
                            * Note: For FHA loans with a down payment under 10%, MIP lasts for the entire life of the loan.
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PMI TIMELINE CARD */}
            {results.pmiRequired && (
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <span style={{ width: 32, height: 32, background: "#EBF3FF", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="ti ti-calendar-stats" style={{ fontSize: 18, color: "#2563EB" }} />
                  </span>
                  PMI Timeline
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { label: "Current LTV", value: `${ltv.toFixed(1)}%` },
                    { label: "PMI Required Until LTV", value: "80%" },
                    { label: "Estimated PMI Cancellation", value: results.pmiCancelDate },
                    { label: "Months of PMI Payments", value: `${results.pmiCancelMonth} months` },
                    { label: "Total PMI Cost", value: `$${fmtInt(results.totalPmiCost)}` },
                    { label: `${freqLabel} Savings After PMI`, value: `$${fmt(results.monthlySavingsAfterPmi * freqMult)}${freqSuffix}`, highlight: true },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                      <span className={`text-sm font-extrabold ${item.highlight ? "text-emerald-600" : "text-foreground"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LTV OVER TIME CHART */}
            {results.pmiRequired && results.ltvCurve.length > 0 && (
              <PmiLtvChart
                ltvCurve={results.ltvCurve}
                ltvCurveAccel={results.ltvCurveAccel}
                ltvCurveAppreciation={results.ltvCurveAppreciation}
                pmiCancelMonth={results.pmiCancelMonth}
                pmiCancelDate={results.pmiCancelDate}
                hasExtra={calcInputs.extraMonthly > 0 || calcInputs.oneTimeExtra > 0 || calcInputs.annualExtra > 0}
                hasAppreciation={calcInputs.appreciationRate > 0}
              />
            )}

            {/* CANCEL PMI EARLY */}
            {results.pmiRequired && calcInputs.loanType === "conventional" && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCancelEarly(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span style={{ width: 32, height: 32, background: "#EBF3FF", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="ti ti-scissors" style={{ fontSize: 18, color: "#2563EB" }} />
                    </span>
                    Cancel PMI Early — What-If Calculator
                  </span>
                  <i className={`ti ${showCancelEarly ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 16, color: "#6B7280" }} />
                </button>
                {showCancelEarly && (() => {
                  const earlyExtra = parseFloat(cancelEarlyExtra) || 0;
                  const earlyInputs = { ...calcInputs, extraMonthly: calcInputs.extraMonthly + earlyExtra };
                  const earlyRes = calculatePmi(earlyInputs);
                  const monthsSaved = Math.max(0, results.pmiCancelMonth - earlyRes.pmiCancelMonth);
                  const pmiSaved = monthsSaved * results.monthlyPmi;
                  return (
                    <div className="px-4 pb-4 border-t border-border pt-3 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-foreground">Extra Monthly Principal ($/mo)</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="range" min="0" max="2000" step="50"
                            value={cancelEarlyExtra}
                            onChange={e => setCancelEarlyExtra(e.target.value)}
                            className="flex-1 accent-primary"
                          />
                          <input
                            type="number" min="0" max="2000"
                            value={cancelEarlyExtra}
                            onChange={e => setCancelEarlyExtra(e.target.value)}
                            className="w-20 h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Results update on Calculate click</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "New PMI End", value: earlyRes.pmiCancelDate },
                          { label: "Months Saved", value: `${monthsSaved} mo` },
                          { label: "PMI Cost Saved", value: `$${fmtInt(pmiSaved)}` },
                        ].map(item => (
                          <div key={item.label} className="flex flex-col p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                            <span className="text-sm font-extrabold text-emerald-600">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* DONUT CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0">
                {mounted && pieData.length > 0 ? (
                  <div className="w-[160px] h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPie>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`$${fmt(v)}`, ""]} />
                      </RPie>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Total{freqSuffix}</span>
                      <span className="text-base font-extrabold text-foreground">${fmtInt(results.totalMonthly * freqMult)}</span>
                    </div>
                  </div>
                ) : <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">Loading chart...</div>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <span style={{ width: 28, height: 28, background: "#EBF3FF", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="ti ti-chart-donut" style={{ fontSize: 16, color: "#2563EB" }} />
                  </span>
                  {freqLabel} Payment Split
                </h4>
                {pieDataWithPcts.map(item => {
                  return (
                    <div key={item.name} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">${fmt(item.value)} ({item.pct.toFixed(1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* INTEREST SAVED STATS (From Extra Payments) */}
            {(results.interestSaved > 0 || results.pmiMonthsSaved > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {results.interestSaved > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interest Saved</span>
                    <span className="text-lg font-extrabold text-emerald-600">${fmtInt(results.interestSaved)}</span>
                    <span className="text-[10px] text-muted-foreground">vs no extra payments</span>
                  </div>
                )}
                {results.pmiMonthsSaved > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PMI Months Saved</span>
                    <span className="text-lg font-extrabold text-emerald-600">{results.pmiMonthsSaved} mo</span>
                    <span className="text-[10px] text-muted-foreground">vs no extra payments</span>
                  </div>
                )}
              </div>
            )}

            {/* INTEREST SAVED STATS (From Frequency) */}
            {(results.interestSavedVsMonthly > 0 || results.payoffMonthsSavedVsMonthly > 0) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interest Saved</span>
                  <span className="text-lg font-extrabold text-blue-600">${fmtInt(results.interestSavedVsMonthly)}</span>
                  <span className="text-[10px] text-muted-foreground">vs monthly payments</span>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time Saved</span>
                  <span className="text-lg font-extrabold text-blue-600">{Math.floor(results.payoffMonthsSavedVsMonthly / 12)}y {results.payoffMonthsSavedVsMonthly % 12}m</span>
                  <span className="text-[10px] text-muted-foreground">vs monthly payments</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DOWN PAYMENT COMPARISON */}
        {calcInputs.loanType === "conventional" && calcInputs.homeValue > 0 && (
          <div className="max-w-[1180px] mx-auto mt-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDpComparison(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary/20 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span style={{ width: 32, height: 32, background: "#EBF3FF", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="ti ti-chart-bar" style={{ fontSize: 18, color: "#2563EB" }} />
                  </span>
                  Down Payment Comparison
                </span>
                <i className={`ti ${showDpComparison ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 16, color: "#6B7280" }} />
              </button>
              {showDpComparison && (() => {
                const dpOptions = [5, 10, 15, 20];
                const currentDpPct = Math.round(calcInputs.dpMode === "percent" ? calcInputs.dpPct : (calcInputs.dpAmt / calcInputs.homeValue * 100));
                return (
                  <div className="overflow-x-auto border-t border-border">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-2.5 pl-4">Metric</th>
                          {dpOptions.map(dp => (
                            <th key={dp} className={`p-2.5 text-right ${Math.abs(currentDpPct - dp) <= 2 ? "text-primary" : ""}`}>{dp}% Down</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {(() => {
                          const cols = dpOptions.map(dp => {
                            const dpAmt = calcInputs.homeValue * dp / 100;
                            const res = calculatePmi({ ...calcInputs, dpMode: "amount", dpAmt, dpPct: dp });
                            return { dp, dpAmt, res };
                          });
                          const rows2 = [
                            { label: "Down Payment", fmt2: (c: typeof cols[0]) => `$${fmtInt(c.dpAmt)}` },
                            { label: "Loan Amount", fmt2: (c: typeof cols[0]) => `$${fmtInt(c.res.loanAmount)}` },
                            { label: "Monthly PMI", fmt2: (c: typeof cols[0]) => c.dp >= 20 ? "$0.00" : `$${fmt(c.res.monthlyPmi)}` },
                            { label: "Total PMI Paid", fmt2: (c: typeof cols[0]) => c.dp >= 20 ? "$0" : `$${fmtInt(c.res.totalPmiCost)}` },
                            { label: "PMI End Date", fmt2: (c: typeof cols[0]) => c.dp >= 20 ? "No PMI" : c.res.pmiCancelDate },
                            { label: "Monthly Payment", fmt2: (c: typeof cols[0]) => `$${fmt(c.res.totalMonthly)}` },
                          ];
                          return rows2.map(row => (
                            <tr key={row.label} className="hover:bg-secondary/10 transition-colors">
                              <td className="p-2.5 pl-4 font-semibold text-muted-foreground">{row.label}</td>
                              {cols.map(col => (
                                <td key={col.dp} className={`p-2.5 text-right font-medium ${
                                  Math.abs(currentDpPct - col.dp) <= 2 ? "text-primary font-bold bg-primary/5" : ""
                                } ${col.dp >= 20 && row.label === "PMI End Date" ? "text-emerald-600 font-bold" : ""}`}>
                                  {row.fmt2(col)}
                                </td>
                              ))}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* AMORTIZATION TABLE */}
        {results.amortizationRows.length > 0 && (
          <div className="max-w-[1180px] mx-auto mt-4">
            <PmiAmortizationTable
              rows={results.amortizationRows}
              isFha={calcInputs.loanType === "fha"}
              isUsda={calcInputs.loanType === "usda"}
              loanType={calcInputs.loanType}
            />
          </div>
        )}

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is Private Mortgage Insurance (PMI)?</h2>
            <p>Private Mortgage Insurance, commonly known as PMI, is a financial product that protects the lender — not the borrower — in the event of a loan default. It is typically required on conventional mortgage loans when the borrower makes a down payment of less than 20% of the home&apos;s purchase price. While PMI adds to your monthly housing cost, it plays an important role in making homeownership accessible to millions of Americans who cannot yet afford a 20% down payment.</p>
            <p>PMI essentially allows lenders to take on greater risk by insuring themselves against potential losses. Without PMI, most lenders would require a 20% down payment as a mandatory condition for loan approval. With PMI in place, you can purchase a home with as little as 3% to 5% down — a significant advantage in today&apos;s competitive housing market.</p>

            <h2>How the PMI Calculator Works</h2>
            <p>Our PMI calculator uses your loan details to estimate your monthly private mortgage insurance cost and project when that cost will end. The core formula for monthly PMI is straightforward:</p>
            <p><strong>Monthly PMI = (Loan Amount × Annual PMI Rate) ÷ 12</strong></p>
            <p>The PMI rate itself is not fixed — it varies based on your Loan-to-Value (LTV) ratio and your credit score. The LTV ratio is calculated as: <strong>LTV = (Loan Amount ÷ Home Value) × 100</strong>. A higher LTV means greater risk to the lender, which translates to a higher PMI rate.</p>
            <p>The calculator also simulates your amortization schedule month-by-month to determine the exact date your loan balance will fall to 80% of the original home value — the threshold at which you can request PMI cancellation. If you add extra monthly or one-time payments, the simulation automatically accounts for the accelerated principal paydown and adjusts the PMI cancellation date accordingly.</p>

            <h2>Understanding Your PMI Results</h2>
            <p>When you run a calculation, the results panel breaks down your full monthly housing cost into its component parts: principal and interest (P&I), property tax, home insurance, HOA fees, and PMI. This holistic view helps you understand your true out-of-pocket cost beyond just the mortgage payment.</p>
            <p>The <strong>PMI Timeline</strong> card shows you four critical data points: your current LTV, the date PMI is estimated to cancel, how many months you&apos;ll pay PMI, and your total PMI cost over the life of the insurance period. The <strong>Monthly Savings After PMI</strong> metric is particularly motivating — it shows exactly how much more take-home money you&apos;ll have once PMI drops off your payment.</p>

            <h2>Key Factors That Affect Your PMI Rate</h2>
            <p><strong>Loan-to-Value (LTV) Ratio:</strong> This is the single biggest driver of your PMI cost. LTV is the percentage of the home&apos;s value you&apos;re borrowing. A 95% LTV (5% down) will carry a significantly higher PMI rate than a 90% LTV (10% down) or an 85% LTV (15% down). Most PMI providers have distinct pricing tiers at 85%, 90%, 95%, and 97% LTV.</p>
            <p><strong>Credit Score:</strong> Your FICO credit score is the second largest factor. Borrowers with scores of 760 or above typically qualify for the lowest PMI rates available — often 30–40% lower than borrowers in the 640–679 range. Improving your credit score before applying for a mortgage can meaningfully reduce your PMI cost.</p>
            <p><strong>Loan Term:</strong> PMI rates are generally higher for 30-year loans compared to 15-year loans, because the longer amortization means your balance declines more slowly in the early years, keeping the lender at risk for a longer period.</p>
            <p><strong>Property Type &amp; Occupancy:</strong> Investment properties and second homes carry higher PMI rates than primary residences. Lenders view non-owner-occupied properties as higher default risks, and PMI pricing reflects that additional exposure.</p>

            <h2>FHA MIP vs. Conventional PMI: Key Differences</h2>
            <p>FHA loans use a system called Mortgage Insurance Premiums (MIP) that works differently from conventional PMI. FHA MIP has two components: an <strong>Upfront MIP</strong> of 1.75% of the loan amount (usually rolled into the loan) and an <strong>Annual MIP</strong> paid monthly, ranging from 0.45% to 0.85% depending on your LTV and loan term.</p>
            <p>The most critical distinction is cancellation policy. On a conventional loan, PMI automatically cancels once your balance reaches 78% LTV (Homeowners Protection Act). On an FHA loan with a down payment below 10%, MIP lasts for the <em>entire life of the loan</em> — there is no automatic cancellation. For borrowers with 10% or more down on an FHA loan, MIP cancels after 11 years.</p>
            <p>This difference makes conventional loans with PMI potentially more cost-effective over the long run for buyers who can eventually reach 20% equity, because once PMI drops off, it&apos;s gone entirely. FHA MIP, by contrast, may never go away unless you refinance into a conventional loan.</p>
            <p><strong>VA and USDA Loans:</strong> Neither VA loans (for eligible veterans and service members) nor USDA loans (for rural homebuyers) require any form of PMI. VA loans charge a one-time funding fee instead, which varies based on service history and down payment amount. USDA loans have an annual guarantee fee that&apos;s much lower than conventional PMI rates.</p>

            <h2>Practical Examples: PMI in Action</h2>
            <p><strong>Example 1 — Conventional Loan, 10% Down:</strong> Home value $400,000, loan amount $360,000, LTV 90%, credit score 720. Estimated PMI rate: ~0.85% annually. Monthly PMI: ($360,000 × 0.0085) ÷ 12 = <strong>$255/month</strong>. Based on standard amortization at 6.5%, PMI would cancel after approximately 9.5 years. Total PMI cost: ~$29,070.</p>
            <p><strong>Example 2 — FHA Loan, 3.5% Down:</strong> Home value $300,000, loan amount $289,500 (after 3.5% down). Upfront MIP: $5,066 (1.75%). Annual MIP rate: 0.85%. Monthly MIP: ~$205. Because the down payment is under 10%, MIP lasts the life of the 30-year loan — total MIP cost: <strong>~$73,800</strong> plus the upfront premium. This dramatically illustrates why reaching 10% down on an FHA loan is so valuable.</p>
            <p><strong>Example 3 — Accelerated PMI Removal:</strong> Same Conventional Loan as Example 1, but adding $300/month in extra principal payments. PMI cancels after roughly 5.5 years instead of 9.5 years, saving 4 years × 12 months × $255 = <strong>~$12,240</strong> in PMI alone, plus substantial interest savings.</p>

            <h2>Tips &amp; Best Practices for Managing PMI</h2>
            <ul>
              <li><strong>Request cancellation proactively:</strong> Lenders must cancel PMI automatically at 78% LTV, but you can request it at 80% — potentially saving several months of payments.</li>
              <li><strong>Get a new appraisal:</strong> If your home has appreciated significantly, a new appraisal may show your LTV is already below 80%, allowing PMI removal without extra payments.</li>
              <li><strong>Make extra principal payments:</strong> Even an extra $100–$200/month can shave years off your PMI timeline. Use the Advanced Options in our calculator to model this scenario.</li>
              <li><strong>Refinance strategically:</strong> If rates have dropped and your equity has grown, refinancing into a new conventional loan without PMI may be financially beneficial — though you&apos;ll need to factor in closing costs.</li>
              <li><strong>Consider lender-paid PMI (LPMI):</strong> Some lenders offer to pay the PMI premium in exchange for a slightly higher interest rate. Run both scenarios to see which costs less over your expected holding period.</li>
              <li><strong>Keep records:</strong> Maintain documentation of your payment history and original home value so you can build a strong case for early PMI cancellation when the time comes.</li>
            </ul>

            <h2>What Does Bi-Weekly Payment Mean?</h2>
            <p>In this calculator, bi-weekly means one payment every 14 days — 26 payments per year. This is equivalent to making 13 full monthly payments per year instead of 12, which reduces your principal faster and can eliminate PMI months earlier than a standard monthly schedule. This differs from semi-monthly (twice per calendar month, 24 payments per year), which does not produce the same interest savings.</p>

            <h2>The Benefits of Using a PMI Calculator</h2>
            <p>A PMI calculator gives you a comprehensive, real-time view of one of homeownership&apos;s most misunderstood costs. Instead of being surprised by a higher-than-expected mortgage payment, you can model different down payment amounts, loan types, and payment strategies <em>before</em> you commit. This empowers you to make smarter decisions — whether that means saving a little longer to hit 20% down, choosing a conventional loan over FHA, or structuring extra payments to eliminate PMI as quickly as possible.</p>
            <p>Use this tool alongside our <a href="/calculator/mortgage-calculator">Mortgage Calculator</a> for a complete view of your monthly housing costs, and our <a href="/calculator/home-affordability-calculator">Home Affordability Calculator</a> to determine how much house fits your budget before factoring in PMI.</p>
          </article>
          <FAQSection faqs={[
            { question: "What is PMI and why is it required?", answer: "Private Mortgage Insurance (PMI) protects the lender if you default on your loan. It is required on conventional loans when your down payment is less than 20% of the home's purchase price, since lower equity represents higher risk to the lender." },
            { question: "How is my monthly PMI payment calculated?", answer: "Monthly PMI = (Loan Amount × Annual PMI Rate) ÷ 12. For example, a $320,000 loan with a 0.85% PMI rate results in ($320,000 × 0.0085) ÷ 12 = $226.67/month. The annual rate is determined by your LTV ratio and credit score." },
            { question: "When can I remove PMI from my mortgage?", answer: "On conventional loans, you can request PMI cancellation once your balance reaches 80% of the original home value. Lenders must automatically cancel it at 78% LTV under the Homeowners Protection Act. You can accelerate this by making extra principal payments or requesting a new appraisal if your home has appreciated." },
            { question: "What is the difference between PMI and FHA MIP?", answer: "PMI is for conventional loans and cancels automatically at 78% LTV. FHA MIP is for FHA-backed loans and includes an upfront fee (1.75%) plus annual premiums. If your FHA down payment is under 10%, MIP lasts the life of the loan — unlike conventional PMI which eventually goes away." },
            { question: "Do VA and USDA loans require PMI?", answer: "No. VA loans (for eligible veterans) and USDA loans (for rural homebuyers) do not require PMI. VA loans charge a one-time funding fee instead, and USDA loans charge a small annual guarantee fee — both typically lower than conventional PMI rates." },
            { question: "How do extra payments affect my PMI timeline?", answer: "Extra payments reduce your principal balance faster, helping you reach 80% LTV sooner. Even an extra $100–$200/month can cut years off your PMI period. Use the Advanced Options section in our calculator to model different extra payment scenarios and see the exact savings." },
            { question: "When should I choose a conventional loan over FHA to minimize mortgage insurance costs?", answer: "If you have a credit score above 680 and can put at least 10% down, a conventional loan with PMI is usually cheaper long-term because PMI cancels once you reach 20% equity. FHA MIP with less than 10% down lasts the life of the loan, making it significantly more expensive over 30 years." },
            { question: "What credit score gives me the best PMI rate?", answer: "Borrowers with credit scores of 760 or above qualify for the lowest PMI rates — often 30–40% lower than borrowers in the 640–679 range. Improving your credit score before applying can meaningfully reduce your monthly PMI cost. Our calculator automatically adjusts the estimated PMI rate based on the credit score you enter." },
          ]} pageUrl="https://racira.com/calculator/pmi-calculator" />
          <PopularCalculators exclude="/calculator/pmi-calculator" />
        </div>
      </div>
    </>
  );
};

export default PmiCalculator;
