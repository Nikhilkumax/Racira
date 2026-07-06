"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw, Calculator, AlertCircle, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface ARInputs {
  netCreditSales: number;
  beginningAR: number;
  endingAR: number;
  workingDays: number;
  creditTerms: number;
  industryBenchmark: number;
  badDebtPercent: number;
  overdueReceivables: number;
}

interface ARResult {
  avgAR: number;
  arTurnover: number | null;
  dso: number | null;
  dailyCreditSales: number;
  thirtyDayArEstimate: number;
  netChangeInAR: number;

  gapVsTermsDays: number | null;
  gapVsTermsPercent: number | null;
  gapVsBenchmarkDays: number | null;
  gapVsBenchmarkPercent: number | null;
  cashReleasePotential: number | null;
  workingCapitalOpportunity: number | null;
  overdueARRatio: number | null;
  collectionRiskScore: number | null;
  riskBand: "Low Risk" | "Moderate Risk" | "High Risk" | null;
  
  errors: string[];
  chartData: { name: string; value: number; fill: string }[];
}

const DEFAULTS = {
  netCreditSales: "500000",
  beginningAR: "80000",
  endingAR: "70000",
  workingDays: "365",
  creditTerms: "30",
  industryBenchmark: "45",
  badDebtPercent: "2.0",
  overdueReceivables: "25000",
};

function calculate(inputs: ARInputs): ARResult {
  const errors: string[] = [];
  const sales = inputs.netCreditSales;
  const begAR = inputs.beginningAR;
  const endAR = inputs.endingAR;
  const days = inputs.workingDays;
  const terms = inputs.creditTerms;
  const benchmark = inputs.industryBenchmark;
  const badDebt = inputs.badDebtPercent;
  const overdue = inputs.overdueReceivables;

  const avgAR = (begAR + endAR) / 2;
  const dailyCreditSales = days > 0 ? sales / days : 0;
  const thirtyDayArEstimate = dailyCreditSales * 30;
  const netChangeInAR = begAR - endAR;

  let arTurnover: number | null = null;
  let dso: number | null = null;

  if (sales <= 0) {
    errors.push("Net Credit Sales must be greater than 0");
  } else if (avgAR <= 0) {
    errors.push("Average AR must be greater than 0");
  } else if (days <= 0) {
    errors.push("Days in Period must be greater than 0");
  } else {
    arTurnover = sales / avgAR;
    dso = days / arTurnover;
  }

  let gapVsTermsDays: number | null = null;
  let gapVsTermsPercent: number | null = null;
  let gapVsBenchmarkDays: number | null = null;
  let gapVsBenchmarkPercent: number | null = null;
  let cashReleasePotential: number | null = null;
  let workingCapitalOpportunity: number | null = null;
  let overdueARRatio: number | null = null;
  let collectionRiskScore: number | null = null;
  let riskBand: "Low Risk" | "Moderate Risk" | "High Risk" | null = null;

  if (dso !== null) {
    if (terms > 0) {
      gapVsTermsDays = dso - terms;
      gapVsTermsPercent = (gapVsTermsDays / terms) * 100;
      workingCapitalOpportunity = (dso - terms) * dailyCreditSales;
    }
    if (benchmark > 0) {
      gapVsBenchmarkDays = dso - benchmark;
      gapVsBenchmarkPercent = (gapVsBenchmarkDays / benchmark) * 100;
      cashReleasePotential = (dso - benchmark) * dailyCreditSales;
    }
  }

  if (avgAR > 0) {
    if (overdue > avgAR) {
      errors.push("Overdue Receivables cannot exceed Average AR");
    }
    overdueARRatio = (overdue / avgAR) * 100;
  }

  if (overdueARRatio !== null) {
    let score = (badDebt * 0.5) + (overdueARRatio * 0.5);
    if (score > 100) score = 100;
    collectionRiskScore = score;
    
    if (score <= 20) riskBand = "Low Risk";
    else if (score <= 50) riskBand = "Moderate Risk";
    else riskBand = "High Risk";
  }

  const chartData = [
    { name: "Beginning AR", value: parseFloat(begAR.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Ending AR", value: parseFloat(endAR.toFixed(0)), fill: "#10b981" },
    { name: "Avg AR", value: parseFloat(avgAR.toFixed(0)), fill: "#f59e0b" },
    { name: "30-Day AR Est.", value: parseFloat(thirtyDayArEstimate.toFixed(0)), fill: "#8b5cf6" },
  ];

  return {
    avgAR, arTurnover, dso, dailyCreditSales, thirtyDayArEstimate, netChangeInAR,
    gapVsTermsDays, gapVsTermsPercent, gapVsBenchmarkDays, gapVsBenchmarkPercent,
    cashReleasePotential, workingCapitalOpportunity, overdueARRatio, collectionRiskScore, riskBand,
    errors, chartData
  };
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
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

const fmt = (n: number | null, decimals = 2) => n === null ? "-" : n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const fmtCurrency = (n: number | null) => n === null ? "-" : `$${fmt(n, 0)}`;

export default function AccountsReceivableCalculator() {
  const [netCreditSales, setNetCreditSales] = useState(DEFAULTS.netCreditSales);
  const [beginningAR, setBeginningAR] = useState(DEFAULTS.beginningAR);
  const [endingAR, setEndingAR] = useState(DEFAULTS.endingAR);
  const [workingDays, setWorkingDays] = useState(DEFAULTS.workingDays);
  
  const [creditTerms, setCreditTerms] = useState(DEFAULTS.creditTerms);
  const [industryBenchmark, setIndustryBenchmark] = useState(DEFAULTS.industryBenchmark);
  const [badDebtPercent, setBadDebtPercent] = useState(DEFAULTS.badDebtPercent);
  const [overdueReceivables, setOverdueReceivables] = useState(DEFAULTS.overdueReceivables);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ARResult | null>(() => {
    return calculate({
      netCreditSales: parseFloat(DEFAULTS.netCreditSales),
      beginningAR: parseFloat(DEFAULTS.beginningAR),
      endingAR: parseFloat(DEFAULTS.endingAR),
      workingDays: parseFloat(DEFAULTS.workingDays),
      creditTerms: 0,
      industryBenchmark: 0,
      badDebtPercent: 0,
      overdueReceivables: 0,
    });
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculate = () => {
    const inputs: ARInputs = {
      netCreditSales: parseFloat(netCreditSales) || 0,
      beginningAR: parseFloat(beginningAR) || 0,
      endingAR: parseFloat(endingAR) || 0,
      workingDays: parseFloat(workingDays) || 365,
      creditTerms: showAdvanced ? (parseFloat(creditTerms) || 0) : 0,
      industryBenchmark: showAdvanced ? (parseFloat(industryBenchmark) || 0) : 0,
      badDebtPercent: showAdvanced ? (parseFloat(badDebtPercent) || 0) : 0,
      overdueReceivables: showAdvanced ? (parseFloat(overdueReceivables) || 0) : 0,
    };
    setResult(calculate(inputs));
  };

  const reset = () => {
    setNetCreditSales(DEFAULTS.netCreditSales);
    setBeginningAR(DEFAULTS.beginningAR);
    setEndingAR(DEFAULTS.endingAR);
    setWorkingDays(DEFAULTS.workingDays);
    setCreditTerms(DEFAULTS.creditTerms);
    setIndustryBenchmark(DEFAULTS.industryBenchmark);
    setBadDebtPercent(DEFAULTS.badDebtPercent);
    setOverdueReceivables(DEFAULTS.overdueReceivables);
    setShowAdvanced(false);
    setResult(calculate({
      netCreditSales: parseFloat(DEFAULTS.netCreditSales),
      beginningAR: parseFloat(DEFAULTS.beginningAR),
      endingAR: parseFloat(DEFAULTS.endingAR),
      workingDays: parseFloat(DEFAULTS.workingDays),
      creditTerms: 0,
      industryBenchmark: 0,
      badDebtPercent: 0,
      overdueReceivables: 0,
    }));
  };

  const faqs = [
    { question: "What is Accounts Receivable Turnover?", answer: "Accounts Receivable (AR) Turnover measures how efficiently a company collects payment on credit sales. It's calculated as Net Credit Sales ÷ Average Accounts Receivable. A higher ratio indicates faster collection and better cash flow management." },
    { question: "What is Days Sales Outstanding (DSO)?", answer: "DSO measures the average number of days it takes to collect payment after a credit sale. Formula: DSO = (Accounts Receivable ÷ Net Credit Sales) × Number of Days. Lower DSO is better. A DSO of 30–45 days is considered healthy for most businesses." },
    { question: "How is Average Accounts Receivable calculated?", answer: "Average AR = (Beginning AR Balance + Ending AR Balance) ÷ 2. This smooths out seasonal fluctuations." },
    { question: "How does DSO affect working capital?", answer: "Every day of DSO represents cash tied up in receivables. Reducing DSO frees up working capital — cash that can fund operations or be invested." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Accounts Receivable Turnover Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Accounts Receivable Turnover Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Standard Mode */}
            <div className="flex flex-col gap-4">
              <CompactInput id="net-credit-sales" label="Net Credit Sales" value={netCreditSales} onChange={setNetCreditSales} prefix="$" />
              <div className="grid grid-cols-2 gap-4">
                <CompactInput id="beginning-ar" label="Beginning AR" value={beginningAR} onChange={setBeginningAR} prefix="$" />
                <CompactInput id="ending-ar" label="Ending AR" value={endingAR} onChange={setEndingAR} prefix="$" />
              </div>
              <CompactInput id="working-days" label="Days in Period" value={workingDays} onChange={setWorkingDays} suffix="days" />
            </div>

            {/* Professional Mode */}
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
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Professional Settings</div>
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="credit-terms" label="Credit Terms" value={creditTerms} onChange={setCreditTerms} suffix="days" />
                    <CompactInput id="ind-benchmark" label="Industry Benchmark DSO" value={industryBenchmark} onChange={setIndustryBenchmark} suffix="days" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="bad-debt" label="Bad Debt %" value={badDebtPercent} onChange={setBadDebtPercent} suffix="%" />
                    <CompactInput id="overdue-ar" label="Overdue Receivables" value={overdueReceivables} onChange={setOverdueReceivables} prefix="$" />
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
            {result ? (
              <>
                {result.errors.length > 0 && (
                  <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-md flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-sm">Calculation Error</p>
                      <ul className="list-disc pl-4 text-sm">
                        {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
                
                {result.dso !== null && result.arTurnover !== null && (
                  <>
                    <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Days Sales Outstanding (DSO)</p>
                      <p className="text-4xl font-black text-primary">{fmt(result.dso, 1)} days</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your AR Turnover Ratio is <strong>{fmt(result.arTurnover, 2)}×</strong> per year.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                      <div className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Turnover</p>
                        <p className="text-base font-bold text-foreground">{fmt(result.arTurnover, 2)}×</p>
                      </div>
                      
                      {!showAdvanced ? (
                        <>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Avg AR</p>
                            <p className="text-base font-bold text-foreground">${(result.avgAR / 1000).toFixed(1)}k</p>
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">30-Day Est.</p>
                            <p className="text-base font-bold text-foreground">${(result.thirtyDayArEstimate / 1000).toFixed(1)}k</p>
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Cash Flow</p>
                            <p className={`text-base font-bold ${result.netChangeInAR >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {result.netChangeInAR >= 0 ? "+" : ""}${(result.netChangeInAR / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">vs Benchmark</p>
                            <p className="text-base font-bold text-foreground">
                              {result.gapVsBenchmarkDays !== null ? (result.gapVsBenchmarkDays > 0 ? `+${fmt(result.gapVsBenchmarkDays, 1)}d` : `${fmt(result.gapVsBenchmarkDays, 1)}d`) : "-"}
                            </p>
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Cash Release</p>
                            <p className="text-base font-bold text-foreground">
                              {result.cashReleasePotential !== null 
                                ? (result.cashReleasePotential <= 0 ? "$0" : `$${(result.cashReleasePotential / 1000).toFixed(1)}k`) 
                                : "-"}
                            </p>
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Risk Band</p>
                            <p className={`text-sm font-bold ${result.riskBand === 'Low Risk' ? 'text-green-600' : result.riskBand === 'Moderate Risk' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {result.riskBand || "-"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden bg-card">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Standard Metrics</th>
                            <th className="text-right font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium text-foreground">Average Accounts Receivable</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.avgAR)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium text-foreground">AR Turnover Ratio</td>
                            <td className="px-4 py-3 text-right">{fmt(result.arTurnover, 2)}×</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium text-foreground">Days Sales Outstanding (DSO)</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{fmt(result.dso, 1)} days</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium text-foreground">
                              30-Day AR Estimate
                              <span className="block text-xs text-muted-foreground font-normal">Projected AR generated per 30 days</span>
                            </td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.thirtyDayArEstimate)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium text-foreground">
                              Net Change in AR
                              <span className="block text-xs font-normal">
                                {result.netChangeInAR >= 0 ? "Cash Released from AR" : "Cash Tied Up in AR"}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${result.netChangeInAR >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {result.netChangeInAR >= 0 ? "+" : ""}{fmtCurrency(result.netChangeInAR)}
                            </td>
                          </tr>
                        </tbody>
                        
                        {showAdvanced && result.gapVsTermsDays !== null && (
                          <>
                            <thead>
                              <tr className="bg-muted/50 border-b border-border border-t">
                                <th className="font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Professional Metrics</th>
                                <th className="text-right font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">
                                  DSO vs. Credit Terms
                                  <span className="block text-xs text-muted-foreground font-normal">
                                    {result.gapVsTermsDays > 0 ? "Collecting slower than your stated terms" : "Collecting within terms"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {result.gapVsTermsDays > 0 ? "+" : ""}{fmt(result.gapVsTermsDays, 1)} days 
                                  <span className="text-muted-foreground ml-1">({result.gapVsTermsPercent! > 0 ? "+" : ""}{fmt(result.gapVsTermsPercent, 1)}%)</span>
                                </td>
                              </tr>
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">DSO vs. Industry Benchmark</td>
                                <td className="px-4 py-3 text-right">
                                  {result.gapVsBenchmarkDays! > 0 ? "+" : ""}{fmt(result.gapVsBenchmarkDays, 1)} days 
                                  <span className="text-muted-foreground ml-1">({result.gapVsBenchmarkPercent! > 0 ? "+" : ""}{fmt(result.gapVsBenchmarkPercent, 1)}%)</span>
                                </td>
                              </tr>
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">Cash Release Potential</td>
                                <td className="px-4 py-3 text-right text-green-600 font-medium">
                                  {result.cashReleasePotential! <= 0 ? "$0 (already at or better than benchmark)" : fmtCurrency(result.cashReleasePotential)}
                                </td>
                              </tr>
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">Working Capital Opportunity</td>
                                <td className="px-4 py-3 text-right text-green-600 font-medium">
                                  {result.workingCapitalOpportunity! <= 0 ? "$0 (already at or better than terms)" : fmtCurrency(result.workingCapitalOpportunity)}
                                </td>
                              </tr>
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">Overdue AR Ratio</td>
                                <td className="px-4 py-3 text-right">{fmt(result.overdueARRatio, 1)}%</td>
                              </tr>
                              <tr className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-1.5">
                                  Collection Risk Score
                                  <div className="group relative flex items-center justify-center">
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none">
                                      This is a composite indicator calculated by Racira using a 50/50 weighting of Bad Debt % and Overdue Receivables as a share of Average AR. It is not a standardized accounting metric.
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {fmt(result.collectionRiskScore, 1)} / 100 
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${result.riskBand === 'Low Risk' ? 'bg-green-100 text-green-700' : result.riskBand === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {result.riskBand}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </>
                        )}
                      </table>
                    </div>

                    {mounted && (
                      <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                        <p className="text-sm font-semibold text-foreground mb-4 text-center">AR Balance Comparison</p>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.chartData} barCategoryGap="25%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                              <RechartsTooltip 
                                formatter={(v: number | string) => [`$${Number(v).toLocaleString()}`, "Amount"]} 
                                cursor={{ fill: "hsl(var(--secondary))" }}
                                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-secondary/10 border border-border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground">Awaiting Calculation</p>
                <p className="text-sm max-w-[250px] mt-1">Enter your accounts receivable numbers and click Calculate to view results.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Accounts Receivable</h2>
            <p>Managing accounts receivable (AR) effectively is one of the most critical components of maintaining healthy cash flow and ensuring the long-term solvency of any business that sells goods or services on credit. When a company makes a sale but allows the customer to pay at a later date, it creates an account receivable. While this represents revenue on the income statement, it does not immediately represent cash in the bank account. Until that invoice is actually paid by the customer, the business is effectively acting as a bank, providing a short-term, interest-free loan to its client. If this process is not managed with strict mathematical rigor, a business can easily find itself showing massive profits on paper while simultaneously going bankrupt because it has run out of the actual liquid cash needed to pay its own employees, suppliers, and operational expenses. Our calculator is engineered to track every single key metric related to your credit sales, providing you with exact formulas to understand the precise pace at which your business collects cash and how efficiently your working capital is being deployed.</p>

            <h2 className="text-2xl font-bold mb-3">Average Accounts Receivable</h2>
            <p><strong>Average AR = (Beginning AR + Ending AR) / 2</strong></p>
            <p>Because the total balance of accounts receivable fluctuates violently on a daily basis as new sales are made and old invoices are paid, measuring collection efficiency using a single point in time is statistically flawed. If a massive customer happened to pay their invoice on the very last day of the month, your ending AR balance would look artificially low, making your collection process appear much better than it actually is. To correct this volatility, analysts must smooth the data. We take your starting balance at the beginning of the period, add it to your ending balance, and divide by two to establish the baseline average AR over the period. This average is the critical denominator used in almost all subsequent turnover calculations.</p>

            <h2 className="text-2xl font-bold mb-3">AR Turnover Ratio</h2>
            <p><strong>AR Turnover = Net Credit Sales / Average AR</strong></p>
            <p>The Accounts Receivable Turnover Ratio is a fundamental efficiency metric that measures exactly how many times your business completely collected its average accounts receivable balance over the measured period. For example, an annual turnover ratio of 12 means that, on average, your company collects its entire outstanding receivables balance twelve times a year, or roughly once a month. A higher number indicates rapid collection, highly efficient credit policies, and fewer funds tied up in unpaid invoices. Conversely, a low turnover ratio suggests that your credit policies might be too lenient, your collection department is underperforming, or your customers are struggling financially.</p>

            <h2 className="text-2xl font-bold mb-3">Days Sales Outstanding (DSO)</h2>
            <p><strong>DSO = Days in Period / AR Turnover</strong></p>
            <p>Equivalently calculated as <em>(Average AR / Net Credit Sales) × Days in Period</em>, Days Sales Outstanding (DSO) is arguably the single most important collection metric monitored by Chief Financial Officers (CFOs) worldwide. It translates the abstract turnover ratio into a concrete, easily understandable time metric. It tells you exactly how many days, on average, a single dollar of credit sales spends sitting as an unpaid invoice before finally becoming usable cash in your bank account. If your DSO is creeping upward month over month, it is a glaring red flag that your cash flow is deteriorating and immediate action must be taken by the collections team.</p>

            <h2 className="text-2xl font-bold mb-3">Daily Credit Sales and 30-Day Projections</h2>
            <p><strong>Daily Credit Sales = Net Credit Sales / Days in Period</strong></p>
            <p>This internal metric establishes the absolute velocity of your sales on a daily basis. By dividing your total net credit sales by the number of days in the period, we determine exactly how much new AR is being generated every 24 hours. By taking this daily velocity and multiplying it by 30, we generate the <strong>30-Day AR Estimate</strong>. This represents the projected amount of new accounts receivable that will be generated in a standard 30-day billing window based entirely on your current sales momentum.</p>

            <h2 className="text-2xl font-bold mb-3">Net Change in AR and Cash Flow Impact</h2>
            <p><strong>Net Change in AR = Beginning AR − Ending AR</strong></p>
            <p>This simple subtraction measures whether your AR balance physically grew or shrank over the period, which has a massive, direct impact on your cash flow statement. If the result is positive, it means your ending balance is smaller than your beginning balance. You collected more old cash than you issued in new credit, effectively releasing cash back into your business operations. If the result is negative, it means your outstanding credit grew, tying up more of your liquid cash in unpaid invoices.</p>

            <h2 className="text-2xl font-bold mb-3">Professional Mode Metrics: Gap Analysis</h2>
            <p>By opening the Advanced Options panel in our calculator, you unlock Tier 2 analytics for a much deeper assessment of your collection performance against both industry benchmarks and your own stated credit policies.</p>
            
            <p>The <strong>DSO vs. Credit Terms Gap</strong> reveals whether your customers are actually obeying the payment terms you legally extend to them. If you grant "Net 30" terms, but your DSO is 42, you have a gap of 12 days. This means you are collecting significantly slower than your stated terms, effectively providing a free 12-day grace period to your clients. The <strong>DSO vs. Industry Benchmark Gap</strong> compares your collection efficiency against peers in your specific industry, illustrating your competitive position regarding working capital management.</p>

            <h2 className="text-2xl font-bold mb-3">Working Capital and Cash Release Potential</h2>
            <p>The <strong>Working Capital Opportunity</strong> calculates the exact amount of cash you are effectively lending to your customers for free by allowing them to pay late. It represents the literal dollar amount of cash that would be immediately released into your bank account if every single customer simply paid on exactly the due date of their invoice. Similarly, the <strong>Cash Release Potential</strong> calculates the exact amount of cash that would be freed if you simply improved your collection processes to match the standard benchmark of your industry.</p>

            <h2 className="text-2xl font-bold mb-3">Collection Risk and Overdue Ratios</h2>
            <p>Finally, the calculator evaluates portfolio health through the <strong>Overdue AR Ratio</strong>, which measures what percentage of your average accounts receivable balance is currently past its due date. This ratio directly feeds into the <strong>Collection Risk Score</strong>, a proprietary composite indicator calculated by Racira using a 50/50 weighting of your Bad Debt Percentage and your Overdue Receivables Ratio. The score is capped at 100 and banded into Low Risk (0–20), Moderate Risk (20–50), and High Risk (50–100) to provide an instant, at-a-glance health check of your entire receivables portfolio.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/accounts-receivable-calculator" />
          <PopularCalculators exclude="/calculator/accounts-receivable-calculator" />
        </div>
      </div>
    </>
  );
}
