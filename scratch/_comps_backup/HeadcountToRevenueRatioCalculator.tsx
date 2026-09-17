"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";

type Sector = "technology" | "finance" | "healthcare" | "manufacturing" | "retail" | "hospitality";

interface HeadcountInputs {
  revenue: number;
  headcount: number;
  sector: Sector;
  payroll: number;
  contractors: number;
  partTime: number;
  grossMarginPct: number;
}

interface HeadcountResult {
  totalFte: number;
  revenuePerEmployee: number;
  grossProfit: number;
  profitPerEmployee: number;
  payrollPerEmployee: number;
  payrollRatio: number;
  revenueToPayroll: number;
  benchmark: number;
  benchmarkGap: number;
  benchmarkPct: number;
  employeesPerMillion: number;
  headcountAtBenchmark: number;
  revenueAtBenchmark: number;
  valid: boolean;
}

const BENCHMARKS: { key: Sector; label: string; value: number }[] = [
  { key: "technology", label: "Technology", value: 500000 },
  { key: "finance", label: "Finance", value: 300000 },
  { key: "healthcare", label: "Healthcare", value: 200000 },
  { key: "manufacturing", label: "Manufacturing", value: 150000 },
  { key: "retail", label: "Retail", value: 100000 },
  { key: "hospitality", label: "Hospitality", value: 50000 },
];

const DEFAULTS: HeadcountInputs = {
  revenue: 5000000,
  headcount: 25,
  sector: "technology",
  payroll: 2200000,
  contractors: 2,
  partTime: 4,
  grossMarginPct: 60,
};

export function calculateHeadcountRatio(i: HeadcountInputs): HeadcountResult {
  // Part-time staff count as half an FTE; contractors count in full.
  const totalFte = i.headcount + i.contractors + i.partTime * 0.5;
  const marginPct = Math.min(Math.max(i.grossMarginPct, 0), 100) / 100;

  const revenuePerEmployee = totalFte > 0 ? i.revenue / totalFte : 0;
  const grossProfit = i.revenue * marginPct;
  const benchmarkRow = BENCHMARKS.find(b => b.key === i.sector) ?? BENCHMARKS[0];
  const benchmark = benchmarkRow.value;

  return {
    totalFte,
    revenuePerEmployee,
    grossProfit,
    profitPerEmployee: totalFte > 0 ? grossProfit / totalFte : 0,
    payrollPerEmployee: totalFte > 0 ? i.payroll / totalFte : 0,
    payrollRatio: i.revenue > 0 ? (i.payroll / i.revenue) * 100 : 0,
    revenueToPayroll: i.payroll > 0 ? i.revenue / i.payroll : 0,
    benchmark,
    benchmarkGap: revenuePerEmployee - benchmark,
    benchmarkPct: benchmark > 0 ? (revenuePerEmployee / benchmark) * 100 : 0,
    employeesPerMillion: revenuePerEmployee > 0 ? 1000000 / revenuePerEmployee : 0,
    headcountAtBenchmark: benchmark > 0 ? i.revenue / benchmark : 0,
    revenueAtBenchmark: benchmark * totalFte,
    valid: i.revenue > 0 && totalFte > 0,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function HeadcountToRevenueRatioCalculator() {
  const [revenue, setRevenue] = useState(String(DEFAULTS.revenue));
  const [headcount, setHeadcount] = useState(String(DEFAULTS.headcount));
  const [sector, setSector] = useState<Sector>(DEFAULTS.sector);
  const [payroll, setPayroll] = useState(String(DEFAULTS.payroll));
  const [contractors, setContractors] = useState(String(DEFAULTS.contractors));
  const [partTime, setPartTime] = useState(String(DEFAULTS.partTime));
  const [grossMarginPct, setGrossMarginPct] = useState(String(DEFAULTS.grossMarginPct));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<HeadcountResult>(calculateHeadcountRatio(DEFAULTS));
  const [calcSector, setCalcSector] = useState<Sector>(DEFAULTS.sector);

  const getInputs = (): HeadcountInputs => ({
    revenue: parseFloat(revenue) || 0,
    headcount: parseFloat(headcount) || 0,
    sector,
    payroll: parseFloat(payroll) || 0,
    contractors: parseFloat(contractors) || 0,
    partTime: parseFloat(partTime) || 0,
    grossMarginPct: parseFloat(grossMarginPct) || 0,
  });

  useEffect(() => {
    setResults(calculateHeadcountRatio(DEFAULTS));
  }, []);

  const revenueNum = parseFloat(revenue) || 0;
  const headcountNum = parseFloat(headcount) || 0;
  const contractorsNum = parseFloat(contractors) || 0;
  const partTimeNum = parseFloat(partTime) || 0;
  const marginNum = parseFloat(grossMarginPct) || 0;
  const fteNum = headcountNum + contractorsNum + partTimeNum * 0.5;

  let errorMsg = "";
  if (revenueNum <= 0) errorMsg = "Annual revenue must be greater than zero.";
  else if (headcountNum < 0 || contractorsNum < 0 || partTimeNum < 0) errorMsg = "Headcount values cannot be negative.";
  else if (fteNum <= 0) errorMsg = "Total workforce must be at least one full-time equivalent.";
  else if (marginNum < 0 || marginNum > 100) errorMsg = "Gross margin must be between 0% and 100%.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResults(calculateHeadcountRatio(getInputs()));
    setCalcSector(sector);
  };

  const reset = () => {
    setRevenue(String(DEFAULTS.revenue));
    setHeadcount(String(DEFAULTS.headcount));
    setSector(DEFAULTS.sector);
    setPayroll(String(DEFAULTS.payroll));
    setContractors(String(DEFAULTS.contractors));
    setPartTime(String(DEFAULTS.partTime));
    setGrossMarginPct(String(DEFAULTS.grossMarginPct));
    setCalcSector(DEFAULTS.sector);
    setResults(calculateHeadcountRatio(DEFAULTS));
  };

  const chartData = [
    { name: "You", value: results.revenuePerEmployee, color: "#2563EB" },
    ...BENCHMARKS.map(b => ({
      name: b.label,
      value: b.value,
      color: b.key === calcSector ? "#10B981" : "#CBD5E1",
    })),
  ];

  const productivity =
    results.benchmarkPct >= 100
      ? { label: "Above Benchmark", color: "text-emerald-600" }
      : results.benchmarkPct >= 75
        ? { label: "Near Benchmark", color: "text-amber-600" }
        : { label: "Below Benchmark", color: "text-red-600" };

  const payrollFlag =
    results.payrollRatio <= 30
      ? "text-emerald-600"
      : results.payrollRatio <= 50
        ? "text-amber-600"
        : "text-red-600";

  const sectorLabel = BENCHMARKS.find(b => b.key === calcSector)?.label ?? "Technology";

  const breakdown = [
    { label: "Annual Revenue", value: `$${fmtInt(revenueNum)}` },
    { label: "Full-Time Employees", value: fmtInt(headcountNum) },
    { label: "Contractors (FTE)", value: fmtInt(contractorsNum) },
    { label: "Part-Time (× 0.5 FTE)", value: fmt(partTimeNum * 0.5, 1) },
    { label: "Total Workforce (FTE)", value: fmt(results.totalFte, 1) },
    { label: "Revenue per Employee", value: `$${fmtInt(results.revenuePerEmployee)}`, highlight: true },
    { label: `${sectorLabel} Benchmark`, value: `$${fmtInt(results.benchmark)}` },
    { label: "Gap vs Benchmark", value: `${results.benchmarkGap >= 0 ? "+" : "−"}$${fmtInt(Math.abs(results.benchmarkGap))}` },
    { label: "Gross Profit per Employee", value: `$${fmtInt(results.profitPerEmployee)}` },
    { label: "Payroll per Employee", value: `$${fmtInt(results.payrollPerEmployee)}` },
  ];

  const faqs = [
    { question: "What is the headcount to revenue ratio?", answer: "Also called revenue per employee, it measures the average revenue each worker generates: total annual revenue divided by full-time equivalent headcount. It is one of the clearest indicators of workforce productivity, particularly in service and knowledge industries where people are the primary asset." },
    { question: "How do I calculate revenue per employee?", answer: "Divide total annual revenue by the number of full-time equivalent employees. A company with $5,000,000 in revenue and 25 FTE generates $200,000 per employee. Include contractors and convert part-time staff to fractional FTE, or the figure will overstate productivity." },
    { question: "How should part-time staff and contractors be counted?", answer: "Convert them to full-time equivalents. This calculator counts part-time staff as half an FTE and contractors in full, since a contractor working full-time consumes the same capacity as an employee. Excluding contractors entirely is the most common way this metric gets inflated." },
    { question: "What is a good revenue per employee figure?", answer: "It depends almost entirely on sector. Technology firms often exceed $500,000 per employee, finance $300,000, healthcare $200,000, manufacturing $150,000, retail $100,000, and hospitality closer to $50,000. Comparing across sectors is meaningless; compare against your own industry and your own trend." },
    { question: "Why does the payroll ratio matter alongside this metric?", answer: "Revenue per employee measures output but ignores what that output costs. Payroll as a percentage of revenue closes that gap. A company generating $400,000 per employee while spending 60% of revenue on payroll is less healthy than one generating $250,000 at a 30% payroll ratio." },
    { question: "What is revenue-to-payroll multiple?", answer: "Total revenue divided by total payroll cost. It shows how many dollars of revenue each dollar of compensation produces. A multiple above 3 is generally healthy for service businesses; below 2 suggests the workforce is expensive relative to the revenue it supports." },
    { question: "How can a company improve revenue per employee?", answer: "Either raise revenue without proportional hiring, or deliver the same revenue with fewer people. In practice that means automation, better tooling, pricing improvements, focusing staff on high-value work, and removing management layers. Cutting headcount alone improves the ratio while often damaging the business behind it." },
    { question: "Is a rising ratio always good?", answer: "No. A ratio that climbs because revenue grew is a genuine efficiency gain. One that climbs because headcount was cut can mask burnout, rising turnover, and deferred capacity problems that surface a year later. Read it alongside turnover and profit margin, never in isolation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Headcount to Revenue Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Headcount to Revenue Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="revenue" label="Annual Revenue ($)" value={revenue} onChange={setRevenue} prefix="$" tooltip="Total revenue for the most recent twelve months." />
              <InputField id="headcount" label="Full-Time Employees" value={headcount} onChange={setHeadcount} tooltip="Number of full-time staff on payroll." />
              <div>
                <label htmlFor="sector" className="flex items-center text-sm font-medium text-foreground mb-1">Industry</label>
                <select
                  id="sector"
                  value={sector}
                  onChange={e => setSector(e.target.value as Sector)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {BENCHMARKS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                </select>
              </div>
              <InputField id="payroll" label="Annual Payroll ($)" value={payroll} onChange={setPayroll} prefix="$" tooltip="Total compensation cost including salaries, benefits, and employer taxes." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extended Workforce</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="contractors" label="Contractors (FTE)" value={contractors} onChange={setContractors} tooltip="Full-time-equivalent contractors. Counted in full toward workforce." />
                      <InputField id="part-time" label="Part-Time Staff" value={partTime} onChange={setPartTime} tooltip="Part-time headcount. Each counts as 0.5 FTE." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Profitability</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="gross-margin" label="Gross Margin (%)" value={grossMarginPct} onChange={setGrossMarginPct} suffix="%" tooltip="Gross profit as a percentage of revenue. Drives profit per employee." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Revenue per Employee</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">${fmtInt(results.revenuePerEmployee)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                Across {fmt(results.totalFte, 1)} FTE — {fmt(results.benchmarkPct, 0)}% of the {sectorLabel} benchmark
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Productivity</span>
                <span className={`font-extrabold ${productivity.color}`}>{productivity.label}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payroll Ratio</span>
                <span className={`font-extrabold ${payrollFlag}`}>{fmt(results.payrollRatio, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rev / Payroll</span>
                <span className="font-extrabold text-foreground">{fmt(results.revenueToPayroll, 2)}×</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Workforce Metric</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Revenue at Benchmark Productivity</td>
                    <td className="py-2.5 px-3 text-right text-foreground">${fmtInt(results.revenueAtBenchmark)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Your Ratio vs Industry Benchmarks</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => [`$${fmtInt(v)}`, "Revenue / Employee"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#2563EB" }} />
                  <span className="font-semibold text-muted-foreground">Your Company</span>
                  <span className="font-bold text-foreground">${fmtInt(results.revenuePerEmployee)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#10B981" }} />
                  <span className="font-semibold text-muted-foreground">{sectorLabel} Benchmark</span>
                  <span className="font-bold text-foreground">${fmtInt(results.benchmark)}</span>
                </div>
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Revenue per Employee</span>
                  <span className="font-bold text-foreground">${fmtInt(results.revenuePerEmployee)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Workforce (FTE)</span>
                  <span className="font-bold text-foreground">{fmt(results.totalFte, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">{sectorLabel} Benchmark</span>
                  <span className="font-bold text-foreground">${fmtInt(results.benchmark)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Gap vs Benchmark</span>
                  <span className={`font-bold ${results.benchmarkGap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {results.benchmarkGap >= 0 ? "+" : "−"}${fmtInt(Math.abs(results.benchmarkGap))}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Gross Profit per Employee</span>
                  <span className="font-bold text-foreground">${fmtInt(results.profitPerEmployee)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Payroll per Employee</span>
                  <span className="font-bold text-foreground">${fmtInt(results.payrollPerEmployee)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Payroll Ratio</span>
                  <span className="font-bold text-foreground">{fmt(results.payrollRatio, 1)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Revenue-to-Payroll</span>
                  <span className="font-bold text-foreground">{fmt(results.revenueToPayroll, 2)}×</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Employees per $1M Revenue</span>
                  <span className="font-bold text-foreground">{fmt(results.employeesPerMillion, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">FTE Supported at Benchmark</span>
                  <span className="font-bold text-foreground">{fmt(results.headcountAtBenchmark, 1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Revenue per Employee Actually Measures</h2>
            <p>The headcount to revenue ratio, more commonly expressed as revenue per employee, divides total annual revenue by full-time equivalent headcount. It is a productivity measure: how much output the organisation generates from each unit of human capital. In capital-light businesses where payroll is the dominant cost, it is one of the few single numbers that says something meaningful about operational efficiency.</p>
            <h2 className="text-2xl font-bold mb-3">Counting the Workforce Correctly</h2>
            <p>The most common error in this calculation is an incomplete denominator. Companies that lean heavily on contractors or part-time staff frequently count only salaried employees, which inflates the ratio without any real productivity gain. A defensible figure converts everyone to full-time equivalents: contractors working full-time count in full, part-time staff count fractionally. This calculator treats part-time headcount as half an FTE and contractors as whole units.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarks Do Not Cross Industries</h2>
            <p>Structural differences between sectors make cross-industry comparison meaningless. Software companies sell products that scale without proportional headcount, routinely exceeding $500,000 per employee. Financial services cluster near $300,000, manufacturing around $150,000, and hospitality closer to $50,000 because the service itself is delivered by people in real time. A hotel group is not underperforming because it fails to match a software vendor; it is running a different business model.</p>
            <h2 className="text-2xl font-bold mb-3">Pair It With the Payroll Ratio</h2>
            <p>Revenue per employee measures what the workforce produces but says nothing about what it costs. Payroll as a percentage of revenue supplies the missing half. A firm generating $400,000 per employee while spending 60% of revenue on compensation is in a weaker position than one generating $250,000 at a 30% payroll ratio. The revenue-to-payroll multiple expresses the same relationship differently: how many dollars of revenue each dollar of compensation produces.</p>
            <h2 className="text-2xl font-bold mb-3">Improving the Ratio Honestly</h2>
            <p>There are two routes to a higher ratio, and they are not equivalent. Growing revenue without proportional hiring reflects genuine leverage — better tooling, automation, pricing power, or redirecting staff toward higher-value work. Cutting headcount produces the same arithmetic instantly while frequently damaging the business: remaining staff absorb the load, turnover climbs, and capacity problems surface a year later. The metric cannot distinguish between the two, which is why it should always be read alongside turnover and margin.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Trend, Not the Snapshot</h2>
            <p>A single quarter's figure is close to meaningless in isolation. What matters is direction over several periods and how that direction compares with revenue growth. A ratio rising alongside growing revenue signals scaling leverage. A ratio rising while revenue is flat signals contraction. A ratio falling during rapid hiring may be entirely healthy if those hires have not yet reached productivity — early-stage companies routinely show depressed ratios for exactly this reason.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/headcount-to-revenue-ratio-calculator" />
          <PopularCalculators exclude="/calculator/headcount-to-revenue-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
