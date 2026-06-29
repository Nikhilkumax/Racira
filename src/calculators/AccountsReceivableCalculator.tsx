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
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Accounts Receivable Turnover Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
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
                    <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
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
                <p className="text-sm max-w-[250px] mx-auto mt-1">Enter your accounts receivable numbers and click Calculate to view results.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Accounts Receivable</h2>
            <p>Managing accounts receivable (AR) effectively is one of the most critical components of maintaining healthy cash flow. Our calculator tracks every key metric related to your credit sales, providing you with exact formulas to understand the pace at which your business collects cash.</p>

            <h2>Average Accounts Receivable</h2>
            <p><strong>Average AR = (Beginning AR + Ending AR) / 2</strong></p>
            <p>Because AR fluctuates daily as new sales are made and old invoices are paid, measuring efficiency requires smoothing the data. We take your starting balance and ending balance and divide by two to establish the baseline average AR over the period.</p>

            <h2>AR Turnover Ratio</h2>
            <p><strong>AR Turnover = Net Credit Sales / Average AR</strong></p>
            <p>This ratio measures how many times your business completely collected its average accounts receivable balance over the measured period. A higher number indicates rapid collection and fewer funds tied up in unpaid invoices.</p>

            <h2>Days Sales Outstanding (DSO)</h2>
            <p><strong>DSO = Days in Period / AR Turnover</strong></p>
            <p>Equivalently calculated as <em>(Average AR / Net Credit Sales) × Days in Period</em>, this is arguably the most important collection metric. It tells you exactly how many days, on average, a dollar of credit sales spends as an unpaid invoice before becoming cash in your bank account.</p>

            <h2>Daily Credit Sales</h2>
            <p><strong>Daily Credit Sales = Net Credit Sales / Days in Period</strong></p>
            <p>This internal metric establishes the velocity of your sales on a daily basis, allowing us to project how much AR is generated in a 30-day window.</p>

            <h2>30-Day AR Estimate</h2>
            <p><strong>30-Day AR Estimate = Daily Credit Sales × 30</strong></p>
            <p>This represents the projected AR generated per 30 days based on your current sales velocity.</p>

            <h2>Net Change in AR</h2>
            <p><strong>Net Change in AR = Beginning AR − Ending AR</strong></p>
            <p>This measures whether your AR balance grew or shrank over the period. If the result is positive, you collected more cash than you issued in new credit, releasing cash into your business. If negative, your outstanding credit grew, tying up more of your cash in unpaid invoices.</p>

            <h2>Professional Mode Metrics</h2>
            <p>By opening the Advanced Options panel, you unlock Tier 2 analytics for a deeper assessment of collection performance and working capital efficiency against industry benchmarks and your own stated credit terms.</p>

            <h2>DSO vs. Credit Terms (Gap)</h2>
            <p><strong>Gap vs Terms (days) = DSO − Credit Terms</strong></p>
            <p><strong>Gap vs Terms (%) = (Gap vs Terms (days) / Credit Terms) × 100</strong></p>
            <p>This reveals whether your customers are actually obeying the payment terms you extend to them. A positive gap means you are collecting slower than your stated terms.</p>

            <h2>DSO vs. Industry Benchmark (Gap)</h2>
            <p><strong>Gap vs Benchmark (days) = DSO − Industry Benchmark DSO</strong></p>
            <p><strong>Gap vs Benchmark (%) = (Gap vs Benchmark (days) / Industry Benchmark DSO) × 100</strong></p>
            <p>This compares your collection efficiency against peers in your specific industry, illustrating your competitive position regarding working capital management.</p>

            <h2>Cash Release Potential</h2>
            <p><strong>Cash Release Potential = (DSO − Industry Benchmark DSO) × Daily Credit Sales</strong></p>
            <p>This calculates the exact amount of cash that would be freed and injected back into your bank account if you improved your collection processes to match your industry benchmark. If your DSO is already better than the benchmark, this potential is zero.</p>

            <h2>Working Capital Opportunity</h2>
            <p><strong>Working Capital Opportunity = (DSO − Credit Terms) × Daily Credit Sales</strong></p>
            <p>This calculates the cash you are effectively lending to your customers for free by allowing them to pay late. It represents the cash that would be immediately released if every customer simply paid on exactly the due date.</p>

            <h2>Overdue AR Ratio</h2>
            <p><strong>Overdue AR Ratio (%) = (Overdue Receivables / Average AR) × 100</strong></p>
            <p>This ratio measures what percentage of your average accounts receivable balance is currently past due, directly feeding into the assessment of collection risk.</p>

            <h2>Collection Risk Score</h2>
            <p><strong>Collection Risk Score = (Bad Debt % × 0.5) + (Overdue AR Ratio × 0.5)</strong></p>
            <p><em>Methodology:</em> This is a composite indicator calculated by Racira using a 50/50 weighting of Bad Debt % and Overdue Receivables as a share of Average AR. It is not a standardized accounting metric. The score is capped at 100 and banded into Low Risk (0–20), Moderate Risk (20–50), and High Risk (50–100) to provide a quick health check of your receivables portfolio.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/accounts-receivable-calculator" />
          <PopularCalculators exclude="/calculator/accounts-receivable-calculator" />
        </div>
      </div>
    </>
  );
}
