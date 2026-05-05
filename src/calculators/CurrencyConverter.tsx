"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const CurrencyConverter = () => {
  const [value, setValue] = useState("1000");
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("EUR");

  const v = parseFloat(value) || 0;
  const fromCur = currencies.find(c => c.key === from)!;
  const toCur = currencies.find(c => c.key === to)!;
  const usd = v * fromCur.rateToUSD;
  const result = usd / toCur.rateToUSD;

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Currency Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Currency Converter</h1>
        <p className="text-muted-foreground mb-6">Convert between major world currencies. <span className="text-xs italic">Rates are approximate — for live rates, consult a financial provider.</span></p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <InputField id="cur-value" label="Amount" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as CurrencyCode)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as CurrencyCode)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="card-calc p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Result</h2>
          <div className="result-card">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{fromCur.label} → {toCur.label}</p>
            <p className="text-2xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{fromCur.symbol}{fmt(v)} = {toCur.symbol}{fmt(result)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Rate: 1 {from} = {fmt(fromCur.rateToUSD / toCur.rateToUSD)} {to}</p>

          <h3 className="text-md font-semibold text-foreground mt-6 mb-3">All Conversions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currencies.map(c => (
              <div key={c.key} className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{c.label}</p>
                <p className="text-lg font-bold text-foreground">{c.symbol}{fmt(usd / c.rateToUSD)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrencyConverter;

