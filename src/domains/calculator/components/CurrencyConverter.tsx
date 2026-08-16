"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ArrowRightLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "CAD" | "AUD" | "CHF" | "CNY" | "BRL";

const currencies: { key: CurrencyCode; label: string; symbol: string; rateToUSD: number }[] = [
  { key: "USD", label: "US Dollar (USD)", symbol: "$", rateToUSD: 1 },
  { key: "EUR", label: "Euro (EUR)", symbol: "€", rateToUSD: 1.08 },
  { key: "GBP", label: "British Pound (GBP)", symbol: "£", rateToUSD: 1.27 },
  { key: "JPY", label: "Japanese Yen (JPY)", symbol: "¥", rateToUSD: 0.0067 },
  { key: "INR", label: "Indian Rupee (INR)", symbol: "₹", rateToUSD: 0.012 },
  { key: "CAD", label: "Canadian Dollar (CAD)", symbol: "C$", rateToUSD: 0.74 },
  { key: "AUD", label: "Australian Dollar (AUD)", symbol: "A$", rateToUSD: 0.65 },
  { key: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF", rateToUSD: 1.13 },
  { key: "CNY", label: "Chinese Yuan (CNY)", symbol: "¥", rateToUSD: 0.14 },
  { key: "BRL", label: "Brazilian Real (BRL)", symbol: "R$", rateToUSD: 0.17 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const faqs = [
  { question: "Are these rates real-time?", answer: "No — the rates are approximate and static. For live rates, please consult a financial data provider or bank." },
  { question: "How does the conversion work?", answer: "All currencies are converted through USD as an intermediate step: amount → USD → target currency." },
  { question: "Which currencies are supported?", answer: "USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY, and BRL." },
];

interface CurrencyResult {
  amount: number;
  from: CurrencyCode;
  to: CurrencyCode;
  converted: number;
  rate: number;
  inverseRate: number;
  fromSymbol: string;
  toSymbol: string;
}

function calcConversion(value: number, from: CurrencyCode, to: CurrencyCode): CurrencyResult {
  const fromCur = currencies.find(c => c.key === from)!;
  const toCur = currencies.find(c => c.key === to)!;
  const usd = value * fromCur.rateToUSD;
  const converted = usd / toCur.rateToUSD;
  const rate = fromCur.rateToUSD / toCur.rateToUSD;
  return {
    amount: value,
    from,
    to,
    converted,
    rate,
    inverseRate: rate !== 0 ? 1 / rate : 0,
    fromSymbol: fromCur.symbol,
    toSymbol: toCur.symbol,
  };
}

export default function CurrencyConverter() {
  const [value, setValue] = useState("1000");
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("EUR");
  const [result, setResult] = useState<CurrencyResult>(() => calcConversion(1000, "USD", "EUR"));

  useEffect(() => {
    const v = parseFloat(value);
    if (!isNaN(v) && v >= 0) setResult(calcConversion(v, from, to));
  }, [value, from, to]);

  const reset = () => { setValue("1000"); setFrom("USD"); setTo("EUR"); };
  const invalid = isNaN(parseFloat(value)) || parseFloat(value) < 0;

  const breakdown = [
    { label: "Amount", value: `${result.fromSymbol}${fmt(result.amount)} ${result.from}` },
    { label: "Exchange Rate", value: `${fmt(result.rate)} ${result.to} per ${result.from}` },
    { label: "Converted Amount", value: `${result.toSymbol}${fmt(result.converted)} ${result.to}` },
    { label: "Inverse Rate", value: `${fmt(result.inverseRate)} ${result.from} per ${result.to}` },
    { label: "Direction", value: `${result.from} → ${result.to}` },
    { label: "Method", value: "Via USD intermediate" },
  ];

  const summaryStats = [
    { label: "Amount", value: `${result.fromSymbol}${fmt(result.amount)}` },
    { label: "Converted", value: `${result.toSymbol}${fmt(result.converted)}` },
    { label: "Exchange Rate", value: fmt(result.rate) },
    { label: "Inverse Rate", value: fmt(result.inverseRate) },
    { label: "From", value: result.from },
    { label: "To", value: result.to },
  ];

  const chartData = [
    { name: `Original (${result.from})`, value: result.amount },
    { name: `Converted (${result.to})`, value: result.converted },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Currency Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Currency Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cur-value" className="block text-sm font-medium mb-1 text-foreground">Amount</label>
              <input id="cur-value" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cur-from" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="cur-from" value={from} onChange={(e) => setFrom(e.target.value as CurrencyCode)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {currencies.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cur-to" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="cur-to" value={to} onChange={(e) => setTo(e.target.value as CurrencyCode)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {currencies.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <ArrowRightLeft className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative amount.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Amount</div>
              <div className="text-4xl font-extrabold text-primary">{result.toSymbol}{fmt(result.converted)} <span className="text-xl font-bold">{result.to}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.fromSymbol}{fmt(result.amount)} {result.from} at {fmt(result.rate)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Exchange Rate</div>
                <div className="text-lg font-bold text-primary">{fmt(result.rate)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Inverse Rate</div>
                <div className="text-lg font-bold text-primary">{fmt(result.inverseRate)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Direction</div>
                <div className="text-lg font-bold text-primary">{result.from} → {result.to}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row, i) => (
                    <tr key={row.label} className={i === 2 ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Original vs Converted</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Currency Converter</h2>
            <p>This converter values every pair through the US dollar as an intermediate: the amount is first converted from the source currency to USD, then from USD to the target currency. Rates are static approximations for estimation only.</p>
            <h3>Reading Exchange Rates</h3>
            <p>The exchange rate shown is how many units of the target currency one unit of the source buys. The inverse rate is the reciprocal — how many units of the source one unit of the target buys. Banks and brokers typically quote slightly different buy and sell rates; the spread is how they earn revenue.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/currency-converter" />
          <PopularCalculators exclude="/calculator/currency-converter" />
        </div>
      </div>
    </>
  );
}
