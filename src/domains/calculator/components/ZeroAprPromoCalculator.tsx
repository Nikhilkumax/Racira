"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Printer, CreditCard, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calculateZeroAprPromo, DEFAULTS, type ZeroAprPromoInputs, type ZeroAprPromoResults } from "./ZeroAprPromoLogic";

const fmt = (n: number, dec = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

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

const ZeroAprPromoCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [promoMonths, setPromoMonths] = useState(String(DEFAULTS.promoMonths));
  const [regularApr, setRegularApr] = useState(String(DEFAULTS.regularApr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [showAdv, setShowAdv] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [results, setResults] = useState<ZeroAprPromoResults>(() => calculateZeroAprPromo(DEFAULTS));

  const getInputs = (): ZeroAprPromoInputs => ({
    purchasePrice: parseFloat(purchasePrice) || 0,
    promoMonths: parseFloat(promoMonths) || 0,
    regularApr: parseFloat(regularApr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
  });

  const handleCalculate = () => {
    const inputs = getInputs();
    setResults(calculateZeroAprPromo(inputs));
  };

  const reset = () => {
    setPurchasePrice(String(DEFAULTS.purchasePrice));
    setPromoMonths(String(DEFAULTS.promoMonths));
    setRegularApr(String(DEFAULTS.regularApr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setShowAdv(false);
    setResults(calculateZeroAprPromo(DEFAULTS));
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const valErrors: Record<string, string> = {};
  const price = parseFloat(purchasePrice) || 0;
  const months = parseFloat(promoMonths) || 0;
  const apr = parseFloat(regularApr) || 0;
  const payment = parseFloat(monthlyPayment) || 0;
  if (price <= 0) valErrors.purchasePrice = "Purchase price must be > 0";
  if (months <= 0) valErrors.promoMonths = "Promotional months must be > 0";
  if (apr < 0) valErrors.regularApr = "APR cannot be negative";
  if (payment <= 0) valErrors.monthlyPayment = "Monthly payment must be > 0";
  const hasValidationErrors = Object.keys(valErrors).length > 0;

  const pieData = [
    { name: "Promo Cost", value: results.totalPromoCost, color: PIE_COLORS[0] },
    { name: "Regular Cost", value: results.totalRegularCost, color: PIE_COLORS[1] },
    { name: "Deferred Interest", value: results.deferredInterest, color: PIE_COLORS[2] },
  ];

  const piePcts = pieData.map(item => {
    const total = pieData.reduce((a, b) => a + b.value, 0);
    if (total <= 0) return 0;
    return Math.round((item.value / total) * 1000) / 10;
  });
  const pieSumPct = piePcts.reduce((a, b) => a + b, 0);
  let pieDataWithPcts = pieData.map((item, i) => ({ ...item, pct: piePcts[i] }));
  if (pieData.reduce((a, b) => a + b.value, 0) > 0 && Math.abs(pieSumPct - 100) > 0.1) {
    const diff = Math.round((100 - pieSumPct) * 10) / 10;
    const maxIdx = piePcts.indexOf(Math.max(...piePcts));
    pieDataWithPcts[maxIdx].pct = Math.round((pieDataWithPcts[maxIdx].pct + diff) * 10) / 10;
  }
  const pieDataFinal = pieDataWithPcts.filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Total Promo Cost", value: `$${fmt(results.totalPromoCost)}`, highlight: true },
    { label: "Total Regular Cost", value: `$${fmt(results.totalRegularCost)}` },
    { label: "Deferred Interest", value: `$${fmt(results.deferredInterest)}` },
    { label: "Payoff Months", value: `${results.payoffMonths}` },
    { label: "Interest Saved", value: `$${fmt(results.interestSaved)}` },
  ];

  const summaryStats = [
    { label: "Purchase Price", value: `$${fmt(price)}` },
    { label: "Promo Period", value: `${months} months` },
    { label: "Regular APR", value: `${apr.toFixed(2)}%` },
    { label: "Monthly Payment", value: `$${fmt(payment)}` },
    { label: "Deferred Interest", value: `$${fmt(results.deferredInterest)}` },
    { label: "Payoff Time", value: `${results.payoffMonths} months` },
  ];

  const faqs = [
    { question: "What is a 0% APR promotional offer?", answer: "It is a financing offer where no interest is charged on your purchases for a specified promotional period, usually ranging from 6 to 24 months." },
    { question: "What is deferred interest?", answer: "Deferred interest means that if you do not pay off the entire balance by the end of the promotional period, you may be charged interest retroactively on the full purchase amount from the start date." },
    { question: "How is the interest saved calculated?", answer: "It is calculated by comparing the total interest you would pay under a standard APR with the promotional interest-free period, assuming you pay off the balance before the promo ends." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "0% APR Promotional Period Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">0% APR Promotional Period Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="purchase-price"
                label="Purchase Price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                prefix="$"
              />
              <CompactInput
                id="promo-months"
                label="Promotional Period"
                value={promoMonths}
                onChange={setPromoMonths}
                suffix="mo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="regular-apr"
                label="Regular APR"
                value={regularApr}
                onChange={setRegularApr}
                suffix="%"
              />
              <CompactInput
                id="monthly-payment"
                label="Monthly Payment"
                value={monthlyPayment}
                onChange={setMonthlyPayment}
                prefix="$"
              />
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                {showAdv ? <span className="text-xs">▼</span> : <span className="text-xs">▶</span>}
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Settings</div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="monthly-payment-adv" className="text-sm font-semibold text-foreground mb-1">Monthly Payment</label>
                        <div className="relative h-9">
                          <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 absolute left-0 top-1/2 -translate-y-1/2">$</span>
                          <input
                            id="monthly-payment-adv"
                            type="number"
                            value={monthlyPayment}
                            onChange={(e) => setMonthlyPayment(e.target.value)}
                            className="w-full h-full pl-7 pr-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasValidationErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}

            <div className="flex gap-2.5">
              <Button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className="flex-1 h-10 text-base font-bold"
              >
                Calculate
              </Button>
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

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Deferred Interest Risk</div>
              <div className="text-4xl font-bold text-primary mb-1">
                ${fmt(results.deferredInterest)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Total Promo Cost: ${fmt(results.totalPromoCost)} | Total Regular: ${fmt(results.totalRegularCost)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Promo Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPromoCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Regular Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalRegularCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Saved</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.interestSaved)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10 font-bold" : ""} ${row.highlight ? "text-amber-700" : "text-foreground"}`}>
                      <td className={`p-2.5 pl-3 ${row.highlight ? "text-amber-700 font-bold" : "font-semibold"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "font-semibold"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DONUT CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0">
                {mounted && pieDataFinal.length > 0 ? (
                  <div className="w-[160px] h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieDataFinal}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {pieDataFinal.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, ""]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">Loading chart...</div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 text-primary font-bold text-xs">📊</span>
                  Cost Comparison
                </h4>
                {pieDataFinal.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">${typeof item.value === 'number' ? item.value.toFixed(2) : item.value} ({item.pct.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {summaryStats.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PopularCalculators exclude="/calculator/0-apr-promotional-period-cost-calculator" />
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/0-apr-promotional-period-cost-calculator" />
      </div>
    </>
  );
};

export default ZeroAprPromoCalculator;
