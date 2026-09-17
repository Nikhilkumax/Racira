"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Bitcoin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CryptoResult {
  amount: number;
  coin: string;
  rate: number;
  convertedUsd: number;
  inverseRate: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const COINS: Record<string, { label: string; rate: number }> = {
  btc: { label: "Bitcoin (BTC)", rate: 60000 },
  eth: { label: "Ethereum (ETH)", rate: 3200 },
  sol: { label: "Solana (SOL)", rate: 140 },
  xrp: { label: "XRP", rate: 0.55 },
  doge: { label: "Dogecoin (DOGE)", rate: 0.14 },
  ada: { label: "Cardano (ADA)", rate: 0.45 },
};

function calcCrypto(amount: number, coin: string, rateInput: string): CryptoResult {
  const c = COINS[coin];
  const rate = isNaN(parseFloat(rateInput)) || parseFloat(rateInput) <= 0 ? c.rate : parseFloat(rateInput);
  const convertedUsd = amount * rate;
  const inverseRate = rate > 0 ? 1 / rate : 0;

  const chartData = [
    { name: "Crypto Amount", value: amount },
    { name: "USD Value", value: convertedUsd },
  ];

  const breakdown = [
    { label: "Amount", value: `${amount.toFixed(6)} ${c.label.split(" (")[1].replace(")", "")}` },
    { label: "Price (user-set)", value: `$${rate.toFixed(rate < 1 ? 4 : 2)}` },
    { label: "USD Value", value: `$${convertedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Inverse Rate", value: `1 USD = ${inverseRate.toFixed(6)} ${c.label.split(" (")[1].replace(")", "")}` },
    { label: "Reference Price", value: `$${c.rate.toLocaleString()} (default)` },
    { label: "Coin", value: c.label },
  ];

  const summaryStats = [
    { label: "USD Value", value: `$${convertedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Price", value: `$${rate.toFixed(rate < 1 ? 4 : 2)}` },
    { label: "Amount", value: `${amount.toFixed(6)}` },
    { label: "Inverse", value: `${inverseRate.toFixed(6)}/USD` },
    { label: "Note", value: "Static reference rate" },
    { label: "Update", value: "Enter current price" },
  ];

  return { amount, coin, rate, convertedUsd, inverseRate, chartData, breakdown, summaryStats };
}

const DEFAULTS = { amount: "1", coin: "btc", rate: "60000" };

export default function CryptoCurrencyConverter() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [coin, setCoin] = useState(DEFAULTS.coin);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [result, setResult] = useState<CryptoResult>(() => calcCrypto(1, "btc", "60000"));

  const handleCalculate = () => {
    const a = parseFloat(amount);
    if (!isNaN(a)) setResult(calcCrypto(a, coin, rate));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCalculate(); }, []);

  const reset = () => { setAmount(DEFAULTS.amount); setCoin(DEFAULTS.coin); setRate(DEFAULTS.rate); setResult(calcCrypto(parseFloat(DEFAULTS.amount), DEFAULTS.coin, DEFAULTS.rate)); };
  const invalid = isNaN(parseFloat(amount));

  const faqs = [
    { question: "Why is the price pre-filled?", answer: "This tool uses a static reference price so it works offline and never blocks on a live feed. Update the price field with the current market rate before converting for accurate results." },
    { question: "How do I convert between two cryptocurrencies?", answer: "Convert the first coin to USD using its price, then divide by the second coin's price. For example, 1 BTC × $60,000 ÷ $3,200 = 18.75 ETH." },
    { question: "What fees should I account for?", answer: "Exchange fees (0.1–0.6% typical), network/gas fees, and spread. Subtract them from the amount before converting for a net estimate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Crypto Currency Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Crypto Currency Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ccamt" className="block text-sm font-medium mb-1 text-foreground">Amount</label>
                <input id="ccamt" type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cccoin" className="block text-sm font-medium mb-1 text-foreground">Coin</label>
                <select id="cccoin" value={coin} onChange={(e) => { setCoin(e.target.value); setRate(COINS[e.target.value].rate.toString()); }} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {Object.entries(COINS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="ccrate" className="block text-sm font-medium mb-1 text-foreground">Price per Coin (USD)</label>
              <input id="ccrate" type="number" min="0" step="any" value={rate} onChange={(e) => setRate(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1.5">Pre-filled with a static reference price — enter the live market price for accuracy.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Bitcoin className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid amount.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">USD Value</div>
              <div className="text-4xl font-extrabold text-primary">${result.convertedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.amount.toFixed(6)} {COINS[result.coin].label.split(" (")[1].replace(")", "")} × ${result.rate.toFixed(result.rate < 1 ? 4 : 2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Amount</div>
                <div className="text-lg font-bold text-primary">{result.amount.toFixed(6)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Price</div>
                <div className="text-lg font-bold text-primary">${result.rate.toFixed(result.rate < 1 ? 4 : 2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">1 USD =</div>
                <div className="text-lg font-bold text-primary">{result.inverseRate.toFixed(6)}</div>
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
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Crypto Amount vs USD Value</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Crypto Currency Converter</h2>
            <p>Convert any crypto amount to USD — or read the inverse rate — using a price you control. This tool deliberately uses a static reference price rather than a live feed, so update the price field to the current market rate before relying on the result.</p>
            <h3>Converting Between Coins</h3>
            <p>To go coin-to-coin, convert through USD: value in USD ÷ target coin price. Mind exchange fees, network fees, and bid-ask spread, which can shift the final amount by several percent on smaller altcoins.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/crypto-currency-converter" />
          <PopularCalculators exclude="/calculator/crypto-currency-converter" />
        </div>
      </div>
    </>
  );
}
