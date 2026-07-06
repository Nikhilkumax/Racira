"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/domains/calculator/components/ui/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Currency Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Currency Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <InputField id="cur-value" label="Amount" value={value} onChange={setValue} />
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">From</label>
              <Select value={from} onValueChange={(v) => setFrom(v as CurrencyCode)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">To</label>
              <Select value={to} onValueChange={(v) => setTo(v as CurrencyCode)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">{fromCur.label} to {toCur.label}</p>
              <p className="text-5xl font-black text-foreground">{toCur.symbol}{fmt(result)}</p>
              <p className="text-sm text-muted-foreground">Rate: 1 {from} = {fmt(fromCur.rateToUSD / toCur.rateToUSD)} {to}</p>
            </div>
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <h2 className="text-2xl font-bold mb-3">All Conversions ({from} {fmt(v)})</h2>
              <div className="grid sm:grid-cols-2 gap-1">
                {currencies.map(c => (
                  <div key={c.key} className="flex justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{c.key}</span>
                    <span className="text-sm font-bold text-foreground">{c.symbol}{fmt(usd / c.rateToUSD)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Currency Conversion Works</h2>
            <p>Currency conversion calculates how much of one currency you receive when exchanging another. This converter uses fixed reference rates relative to the US Dollar (USD) as a base currency.</p>
            <h3>Understanding Exchange Rates</h3>
            <p>An exchange rate tells you how much of one currency you can buy with another. For example, if 1 USD = 0.92 EUR, then $100 converts to approximately €92.</p>
            <h3>Factors That Affect Exchange Rates</h3>
            <ul>
              <li><strong>Interest Rates:</strong> Higher rates attract foreign investment, strengthening a currency.</li>
              <li><strong>Inflation:</strong> Lower inflation typically strengthens purchasing power.</li>
              <li><strong>Political Stability:</strong> Stable countries tend to have stronger currencies.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/currency-converter" />
          <PopularCalculators exclude="/calculator/currency-converter" />
        </div>
      </div>
    </>
  );
};

export default CurrencyConverter;
