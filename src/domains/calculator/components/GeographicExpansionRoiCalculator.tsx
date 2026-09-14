"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  setupCost: string;
  firstYearRevenue: string;
  annualGrowthPct: string;
  grossMarginPct: string;
  operatingCosts: string;
  forecastYears: string;
  exitMultiple: string;
  riskPct: string;
}

interface Result {
  year1Profit: number;
  forecastProfit: number;
  cumulativeProfit: number;
  exitValue: number;
  totalReturn: number;
  roiPct: number;
  breakEvenYear: number;
}

const DEFAULTS: Inputs = {
  setupCost: "250000",
  firstYearRevenue: "400000",
  annualGrowthPct: "20",
  grossMarginPct: "55",
  operatingCosts: "80000",
  forecastYears: "5",
  exitMultiple: "3.5",
  riskPct: "15",
};

function calculate(inputs: Inputs): Result {
  const setupCost = Math.max(0, parseFloat(inputs.setupCost) || 0);
  const firstYearRevenue = Math.max(0, parseFloat(inputs.firstYearRevenue) || 0);
  const annualGrowthPct = Math.min(200, Math.max(0, parseFloat(inputs.annualGrowthPct) || 0));
  const grossMarginPct = Math.min(100, Math.max(0, parseFloat(inputs.grossMarginPct) || 0));
  const operatingCosts = Math.max(0, parseFloat(inputs.operatingCosts) || 0);
  const forecastYears = Math.min(20, Math.max(1, parseFloat(inputs.forecastYears) || 1));
  const exitMultiple = Math.max(0, parseFloat(inputs.exitMultiple) || 0);
  const riskPct = Math.min(100, Math.max(0, parseFloat(inputs.riskPct) || 0));

  const year1Profit = firstYearRevenue * (grossMarginPct / 100) - operatingCosts;
  let forecastProfit = 0;
  let cumulativeProfit = 0;
  let revenue = firstYearRevenue;
  let breakEvenYear = 0;
  for (let y = 1; y <= forecastYears; y++) {
    const profit = revenue * (grossMarginPct / 100) - operatingCosts;
    forecastProfit += profit;
    cumulativeProfit += profit;
    if (cumulativeProfit >= setupCost && breakEvenYear === 0) breakEvenYear = y;
    revenue *= 1 + annualGrowthPct / 100;
  }
  const exitValue = revenue / (1 + annualGrowthPct / 100) * exitMultiple;
  const exitEarnings = exitValue * (1 - riskPct / 100);
  const totalReturn = cumulativeProfit + exitEarnings - setupCost;
  const roiPct = setupCost > 0 ? (totalReturn / setupCost) * 100 : 0;

  return { year1Profit, forecastProfit, cumulativeProfit, exitValue, totalReturn, roiPct, breakEvenYear };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function GeographicExpansionRoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.setupCost) < 0 ||
    num(inputs.firstYearRevenue) < 0 ||
    num(inputs.annualGrowthPct) < 0 || num(inputs.annualGrowthPct) > 200 ||
    num(inputs.grossMarginPct) < 0 || num(inputs.grossMarginPct) > 100 ||
    num(inputs.operatingCosts) < 0 ||
    num(inputs.forecastYears) < 1 || num(inputs.forecastYears) > 20 ||
    num(inputs.exitMultiple) < 0 ||
    num(inputs.riskPct) < 0 || num(inputs.riskPct) > 100;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Setup & Entry Investment", value: fmtMoney(num(inputs.setupCost)) },
    { label: `Year 1 Revenue (${fmtMoney(num(inputs.firstYearRevenue))})`, value: fmtMoney(result.year1Profit) + " profit" },
    { label: `Cumulative Profit (${fmt(num(inputs.forecastYears))} yrs)`, value: fmtMoney(result.cumulativeProfit) },
    { label: `Exit Value (${fmt(num(inputs.exitMultiple), 1)}× revenue)`, value: fmtMoney(result.exitValue) },
    { label: `Risk-Adjusted Exit (${fmt(num(inputs.riskPct), 1)}% discount)`, value: fmtMoney(result.exitValue * (1 - num(inputs.riskPct) / 100)) },
    { label: "Total Return", value: fmtMoney(result.totalReturn), total: true },
    { label: "Break-Even Year", value: result.breakEvenYear > 0 ? "Year " + fmt(result.breakEvenYear) : "Beyond forecast", highlight: true },
  ];

  const summaryStats = [
    { label: "Setup Cost", value: fmtMoney(num(inputs.setupCost)) },
    { label: "Year 1 Revenue", value: fmtMoney(num(inputs.firstYearRevenue)) },
    { label: "Annual Growth", value: fmt(num(inputs.annualGrowthPct), 1) + "%" },
    { label: "Gross Margin", value: fmt(num(inputs.grossMarginPct), 1) + "%" },
    { label: "Annual Operating Costs", value: fmtMoney(num(inputs.operatingCosts)) },
    { label: "Forecast Period", value: fmt(num(inputs.forecastYears)) + " years" },
    { label: "Cumulative Profit", value: fmtMoney(result.cumulativeProfit) },
    { label: "Exit Value", value: fmtMoney(result.exitValue) },
    { label: "Risk Discount", value: fmt(num(inputs.riskPct), 1) + "%" },
    { label: "Total Return", value: fmtMoney(result.totalReturn), bold: true },
    { label: "ROI", value: fmt(result.roiPct, 1) + "%" },
    { label: "Break-Even", value: result.breakEvenYear > 0 ? "Year " + fmt(result.breakEvenYear) : "Not in period" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Geographic Expansion ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Geographic Expansion ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ge-setup" label="Setup & Entry Investment" value={inputs.setupCost} onChange={set("setupCost")} prefix="$" />
              <NumInput id="ge-revenue" label="Year 1 Revenue" value={inputs.firstYearRevenue} onChange={set("firstYearRevenue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ge-growth" label="Annual Revenue Growth" value={inputs.annualGrowthPct} onChange={set("annualGrowthPct")} suffix="%" />
              <NumInput id="ge-margin" label="Gross Margin" value={inputs.grossMarginPct} onChange={set("grossMarginPct")} suffix="%" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Forecast & Exit</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ge-opex" label="Annual Operating Costs" value={inputs.operatingCosts} onChange={set("operatingCosts")} prefix="$" />
                    <NumInput id="ge-years" label="Forecast Period" value={inputs.forecastYears} onChange={set("forecastYears")} suffix="years" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ge-multiple" label="Exit Multiple" value={inputs.exitMultiple} onChange={set("exitMultiple")} suffix="× revenue" />
                    <NumInput id="ge-risk" label="Risk Discount" value={inputs.riskPct} onChange={set("riskPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; growth between 0 and 200; margin and risk between 0 and 100; forecast years between 1 and 20.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Geographic Expansion ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roiPct, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.totalReturn)} total return over {fmt(num(inputs.forecastYears))} years — break-even {result.breakEvenYear > 0 ? "in year " + fmt(result.breakEvenYear) : "beyond forecast"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cumulative Profit</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.cumulativeProfit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Exit Value</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.exitValue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Return</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.totalReturn)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Expansion Return Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Geographic Expansion ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A geographic expansion ROI calculator estimates the return a business can expect from opening a new location, entering a new city, or expanding into a new regional market. Geographic expansion is one of the most capital-intensive growth moves a company can make, with costs that include site selection and build-out, hiring a local team, licensing and compliance, and the operating losses that are normal while a new market ramps. The payoff comes from the market's profit stream and, for many businesses, from the value of the location itself if it is later sold or folded into a broader business sale. This calculator models the full picture: the setup investment, the revenue and gross margin trajectory, the fixed operating costs, the cumulative profit over a forecast period, an exit value based on a revenue multiple, and a risk discount that reflects the real chance a new market underperforms.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The annual operating cost line is a fixed subtraction from each year's gross profit, and it should include the local overhead the new market carries on its own, such as rent, utilities, local management, and administrative staff, since those costs do not scale with revenue and are the reason new markets often run losses in year one. The growth rate compounds revenue forward across the forecast period, and the model's profit stream therefore reflects the compounding effect that makes expansion economics attractive when margins hold. The exit value applies the revenue multiple to the final projected year's revenue, giving the location a value that can be realized through sale, franchise, or consolidation, and the risk discount then adjusts that value downward to reflect the uncertainty that real expansions face. Because the model reports cumulative profit, exit value, and total return separately, you can see whether the expansion's value comes from operations, from the eventual sale, or from both.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the setup and entry investment, the year-one revenue, the annual revenue growth rate, and the gross margin percentage. Year-one profit subtracts the annual operating costs from the year-one revenue valued at the gross margin. The model then projects revenue forward at the growth rate, computing profit in each year and accumulating the total over the forecast period, while tracking the year in which cumulative profit first covers the setup investment, which is the break-even year. With the default inputs, a $250,000 entry investment, $400,000 of year-one revenue at a 55% margin, and $80,000 of operating costs produce a $140,000 year-one profit that grows with revenue, and the cumulative profit over five years covers the setup cost in year two. The advanced options add the forecast period, the exit multiple applied to the final year's revenue for the location's value, and the risk discount applied to that exit value. The total return subtracts the setup cost from the sum of cumulative profit and the risk-adjusted exit value, and the ROI divides it by the setup cost.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The ROI figure is the headline comparison against other growth investments, and the break-even year tells you how long the market must be supported before it pays back its entry cost. If break-even lands beyond the forecast period, the expansion is a strategic bet rather than a financial one, and it should be justified on market position, not return. The risk discount is your honesty check: a 15% discount on exit value is modest for a market where competitors, regulation, or demand are uncertain. Sensitivity matters more than precision here, so re-run the calculator across growth, margin, and exit-multiple scenarios; expansions that look attractive at the base case but fail under a conservative case deserve scrutiny. The operating cost line deserves particular attention, since new locations rarely hit planned efficiency in their first years.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="geographic-expansion-roi-calculator" />
        </div>
      </div>
    </>
  );
}