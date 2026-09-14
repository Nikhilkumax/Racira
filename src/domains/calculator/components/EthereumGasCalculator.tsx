"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Fuel } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GasResult {
  gasLimit: number;
  gasPriceGwei: number;
  ethPrice: number;
  gweiTotal: number;
  costEth: number;
  costUsd: number;
  chartData: { name: string; value: number }[];
}

function calcGas(gasLimit: number, gasPriceGwei: number, ethPrice: number): GasResult {
  const gweiTotal = gasLimit * gasPriceGwei;
  const costEth = gweiTotal * 1e-9;
  const costUsd = costEth * ethPrice;
  const chartData = [
    { name: "Gas Used (units)", value: gasLimit },
    { name: "Gas Price (gwei)", value: gasPriceGwei },
  ];
  return { gasLimit, gasPriceGwei, ethPrice, gweiTotal, costEth, costUsd, chartData };
}

const DEFAULTS = { limit: "21000", price: "25", eth: "3000" };

const faqs = [
  { question: "What is gas on Ethereum?", answer: "Gas is the fee paid for computation on Ethereum. Cost = gas used × gas price, where gas price is quoted in gwei (10⁻⁹ ETH). A basic transfer uses 21,000 gas; a smart-contract call uses far more." },
  { question: "What is the difference between base fee and priority fee?", answer: "After EIP-1559, the base fee is burned and a priority (tip) fee goes to validators. The total price you pay is base + tip; this calculator uses a single combined price in gwei for simplicity." },
  { question: "How do I estimate a real transaction?", answer: "Wallets estimate gas using current network conditions. The default 21,000 gas fits simple transfers; swaps and NFT mints can use 100,000–500,000. Check the actual gas used after confirmation to calibrate." },
];

export default function EthereumGasCalculator() {
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [eth, setEth] = useState(DEFAULTS.eth);
  const [result, setResult] = useState<GasResult>(() => calcGas(21000, 25, 3000));

  useEffect(() => {
    const l = parseFloat(limit);
    const p = parseFloat(price);
    const e = parseFloat(eth);
    if (!isNaN(l) && !isNaN(p) && !isNaN(e) && l >= 0 && p >= 0 && e >= 0) setResult(calcGas(l, p, e));
  }, []);

  const handleCalculate = () => {
    const l = parseFloat(limit);
    const p = parseFloat(price);
    const e = parseFloat(eth);
    if (!isNaN(l) && !isNaN(p) && !isNaN(e) && l >= 0 && p >= 0 && e >= 0) setResult(calcGas(l, p, e));
  };
  const reset = () => { setLimit(DEFAULTS.limit); setPrice(DEFAULTS.price); setEth(DEFAULTS.eth); setResult(calcGas(parseFloat(DEFAULTS.limit), parseFloat(DEFAULTS.price), parseFloat(DEFAULTS.eth))); };
  const invalid = isNaN(parseFloat(limit)) || isNaN(parseFloat(price)) || isNaN(parseFloat(eth)) || parseFloat(limit) < 0 || parseFloat(price) < 0 || parseFloat(eth) < 0;

  const breakdown = [
    { label: "Gas Limit", value: `${result.gasLimit.toLocaleString()} units` },
    { label: "Gas Price", value: `${result.gasPriceGwei.toLocaleString()} gwei` },
    { label: "Total Gas Cost", value: `${result.gweiTotal.toLocaleString()} gwei`, highlight: true },
    { label: "Cost in ETH", value: `${result.costEth.toFixed(6)} ETH` },
    { label: "ETH Price (static)", value: `$${result.ethPrice.toLocaleString()}` },
    { label: "Cost in USD", value: `$${result.costUsd.toFixed(2)}` },
    { label: "Cost in wei", value: `${(result.gweiTotal * 1e9).toLocaleString()} wei` },
  ];

  const summaryStats = [
    { label: "Cost (ETH)", value: `${result.costEth.toFixed(6)} ETH` },
    { label: "Cost (USD)", value: `$${result.costUsd.toFixed(2)}` },
    { label: "Gas Total", value: `${result.gweiTotal.toLocaleString()} gwei` },
    { label: "Gas Limit", value: `${result.gasLimit.toLocaleString()}` },
    { label: "Gas Price", value: `${result.gasPriceGwei.toLocaleString()} gwei` },
    { label: "ETH Price", value: `$${result.ethPrice.toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ethereum Gas Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ethereum Gas Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="eg-limit" className="block text-sm font-medium mb-1 text-foreground">Gas Limit (units)</label>
              <input id="eg-limit" type="number" min="0" step="1000" value={limit} onChange={(e) => setLimit(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Simple transfer: 21,000 · token swap: 100,000–300,000</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eg-price" className="block text-sm font-medium mb-1 text-foreground">Gas Price (gwei)</label>
                <input id="eg-price" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eg-eth" className="block text-sm font-medium mb-1 text-foreground">ETH Price (USD, static)</label>
                <input id="eg-eth" type="number" min="0" step="10" value={eth} onChange={(e) => setEth(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Fuel className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative values for all fields.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Transaction Cost</div>
              <div className="text-4xl font-extrabold text-primary">${result.costUsd.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.costEth.toFixed(6)} ETH · {result.gweiTotal.toLocaleString()} gwei</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">In ETH</div>
                <div className="text-lg font-bold text-primary">{result.costEth.toFixed(6)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Gas Total (gwei)</div>
                <div className="text-lg font-bold text-primary">{result.gweiTotal.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Gas Price</div>
                <div className="text-lg font-bold text-primary">{result.gasPriceGwei.toLocaleString()} gwei</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Gas Used vs Gas Price</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Ethereum Gas Calculator</h2>
            <p>Transaction cost is gas used × gas price. Gas measures computational work (a simple transfer: 21,000 units); price is quoted in gwei, one billionth of an ETH. At 25 gwei and $3,000 ETH, a transfer costs 525,000 gwei = 0.000525 ETH ≈ $1.58.</p>
            <h3>Static Price Note</h3>
            <p>ETH price moves constantly, so this calculator treats it as a user-entered value — set it to today's market rate for an estimate. Gas price similarly fluctuates with network congestion; at busy times a "fast" transaction costs several times more gwei.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ethereum-gas-calculator" />
          <PopularCalculators exclude="/calculator/ethereum-gas-calculator" />
        </div>
      </div>
    </>
  );
}
