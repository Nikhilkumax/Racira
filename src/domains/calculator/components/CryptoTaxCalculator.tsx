"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CryptoTaxResult {
  totalGains: number;
  totalLosses: number;
  netGain: number;
  shortTermTax: number;
  longTermTax: number;
  totalTax: number;
  effectiveRate: number;
  afterTaxProfit: number;
  breakdown: { label: string; value: string }[];
  taxData: { label: string; short: number; long: number }[];
  summaryStats: { label: string; value: string }[];
}

// 2024 US Federal Tax Rates
const SHORT_TERM_RATES = [
  { maxIncome: 11600, rate: 0.10 },
  { maxIncome: 47150, rate: 0.12 },
  { maxIncome: 100525, rate: 0.22 },
  { maxIncome: 191950, rate: 0.24 },
  { maxIncome: 243725, rate: 0.32 },
  { maxIncome: 609350, rate: 0.35 },
  { maxIncome: Infinity, rate: 0.37 },
];

const LONG_TERM_RATES = [
  { maxIncome: 47025, rate: 0 },
  { maxIncome: 518900, rate: 0.15 },
  { maxIncome: Infinity, rate: 0.20 },
];

function getShortTermRate(income: number): number {
  return SHORT_TERM_RATES.find(r => income <= r.maxIncome)?.rate ?? 0.37;
}

function getLongTermRate(income: number): number {
  return LONG_TERM_RATES.find(r => income <= r.maxIncome)?.rate ?? 0.20;
}

function calcCryptoTax(
  shortTermGains: number, longTermGains: number,
  shortTermLosses: number, longTermLosses: number,
  otherIncome: number
): CryptoTaxResult {
  // Net short-term and long-term
  const netShort = shortTermGains - shortTermLosses;
  const netLong = longTermGains - longTermLosses;

  // Loss harvesting: excess losses from one can offset other
  let finalShort = netShort;
  let finalLong = netLong;
  if (finalShort < 0 && finalLong > 0) {
    finalLong = Math.max(0, finalLong + finalShort);
    finalShort = 0;
  } else if (finalLong < 0 && finalShort > 0) {
    finalShort = Math.max(0, finalShort + finalLong);
    finalLong = 0;
  }

  // Up to $3,000 of net losses offset ordinary income
  const netCapitalLoss = Math.min(0, finalShort + finalLong);
  const ordinaryIncomeOffset = Math.max(-3000, netCapitalLoss);

  const totalGains = shortTermGains + longTermGains;
  const totalLosses = shortTermLosses + longTermLosses;
  const netGain = totalGains - totalLosses;

  const shortTermRate = getShortTermRate(otherIncome + Math.max(0, finalShort));
  const longTermRate = getLongTermRate(otherIncome);

  const shortTermTax = Math.max(0, finalShort) * shortTermRate;
  const longTermTax = Math.max(0, finalLong) * longTermRate;
  const totalTax = shortTermTax + longTermTax;
  const effectiveRate = netGain > 0 ? (totalTax / netGain) * 100 : 0;
  const afterTaxProfit = netGain - totalTax;

  const breakdown = [
    { label: "Short-Term Gains", value: `$${shortTermGains.toLocaleString()}` },
    { label: "Short-Term Losses", value: `−$${shortTermLosses.toLocaleString()}` },
    { label: "Net Short-Term", value: `$${netShort.toLocaleString()}` },
    { label: "Long-Term Gains", value: `$${longTermGains.toLocaleString()}` },
    { label: "Long-Term Losses", value: `−$${longTermLosses.toLocaleString()}` },
    { label: "Net Long-Term", value: `$${netLong.toLocaleString()}` },
    { label: "Short-Term Tax Rate", value: `${(shortTermRate * 100).toFixed(0)}%` },
    { label: "Long-Term Tax Rate", value: `${(longTermRate * 100).toFixed(0)}%` },
    { label: "Short-Term Tax", value: `$${shortTermTax.toFixed(2)}` },
    { label: "Long-Term Tax", value: `$${longTermTax.toFixed(2)}` },
    { label: "Total Tax Owed", value: `$${totalTax.toFixed(2)}` },
    { label: "After-Tax Profit", value: `$${afterTaxProfit.toFixed(2)}` },
  ];

  const taxData = [
    { label: "Short-Term Gains", short: shortTermGains, long: 0 },
    { label: "Long-Term Gains", short: 0, long: longTermGains },
    { label: "Tax Owed", short: shortTermTax, long: longTermTax },
  ];

  const summaryStats = [
    { label: "Net Gain", value: `$${netGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Tax", value: `$${totalTax.toFixed(2)}` },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "After-Tax Profit", value: `$${afterTaxProfit.toFixed(2)}` },
    { label: "Short-Term Rate", value: `${(shortTermRate * 100).toFixed(0)}%` },
    { label: "Long-Term Rate", value: `${(longTermRate * 100).toFixed(0)}%` },
  ];

  return { totalGains, totalLosses, netGain, shortTermTax, longTermTax, totalTax, effectiveRate, afterTaxProfit, breakdown, taxData, summaryStats };
}

export default function CryptoTaxCalculator() {
  const [stGains, setStGains] = useState("5000");
  const [ltGains, setLtGains] = useState("15000");
  const [stLosses, setStLosses] = useState("1000");
  const [ltLosses, setLtLosses] = useState("2000");
  const [otherIncome, setOtherIncome] = useState("60000");
  const [result, setResult] = useState<CryptoTaxResult | null>(null);

  const calculate = () => {
    setResult(calcCryptoTax(
      parseFloat(stGains) || 0, parseFloat(ltGains) || 0,
      parseFloat(stLosses) || 0, parseFloat(ltLosses) || 0,
      parseFloat(otherIncome) || 0
    ));
  };

  useEffect(() => { setResult(calcCryptoTax(5000, 15000, 1000, 2000, 60000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How is cryptocurrency taxed in the US?", answer: "The IRS treats cryptocurrency as property (Notice 2014-21). Every sale, trade, or exchange of crypto is a taxable event. Tax rates depend on holding period: Short-term (held ≤12 months): taxed as ordinary income at your marginal rate (10–37%). Long-term (held 12+ months): taxed at preferential capital gains rates (0%, 15%, or 20% depending on income). Mining, staking rewards, and airdrops are typically taxed as ordinary income at receipt." },
    { question: "What is the crypto long-term capital gains rate for 2024?", answer: "2024 long-term capital gains rates (single filers): 0% for income up to $47,025; 15% for income $47,025–$518,900; 20% for income above $518,900. Additionally, a 3.8% Net Investment Income Tax (NIIT) applies to investment income for high earners (single income above $200,000, married above $250,000). Strategically holding crypto longer than 12 months before selling can dramatically reduce your tax bill." },
    { question: "How does crypto tax loss harvesting work?", answer: "Tax loss harvesting means selling losing crypto positions to realize losses that offset taxable gains. Net capital losses first offset capital gains (short-term losses offset short-term gains first, then long-term). Remaining net losses up to $3,000 can offset ordinary income. Additional losses carry forward to future tax years. Unlike stocks, crypto has NO wash-sale rule in the US (as of 2024) — you can sell and immediately rebuy the same crypto to harvest losses." },
    { question: "What crypto transactions are taxable?", answer: "Taxable events: Selling crypto for fiat (USD). Trading one crypto for another. Using crypto to buy goods/services. Receiving crypto as payment for work/services. Mining and staking rewards (ordinary income at receipt). Airdrops received (ordinary income). NOT taxable: Buying crypto with USD. Transferring between your own wallets. Gifting crypto (gift taxes may apply at high amounts). Donating to qualified charities (may be deductible at FMV)." },
    { question: "How do I calculate my crypto cost basis?", answer: "Cost basis = Price paid for crypto + fees paid. For FIFO (First In, First Out — IRS default): the first coins bought are considered sold first. HIFO (Highest In, First Out) minimizes gains by using the highest cost basis coins first — can significantly reduce taxes. LIFO (Last In, First Out) sells newest coins first. Specific Identification lets you choose exactly which lots to sell for optimal tax outcomes. Crypto tax software (CoinTracker, TaxBit, Koinly) automates this across exchanges." },
    { question: "Do I need to report crypto if I didn't sell?", answer: "If you only bought crypto and held it — no taxable event occurred and no reporting is needed beyond answering 'Yes' to the crypto question on Form 1040 (required since 2019). However, the IRS does ask whether you received, sold, exchanged, or otherwise disposed of any digital assets during the tax year. Answering incorrectly is a perjury risk. If you received crypto through mining, staking, airdrops, or employment, those are reportable as income even without selling." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Crypto Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Crypto Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Other Annual Income (W-2, etc.)</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherIncome} onChange={e => setOtherIncome(e.target.value)} className={ci} /></div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Used to determine your marginal tax bracket.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Short-Term Gains (&lt;1yr)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={stGains} onChange={e => setStGains(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Short-Term Losses</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={stLosses} onChange={e => setStLosses(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Long-Term Gains (&gt;1yr)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={ltGains} onChange={e => setLtGains(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Long-Term Losses</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={ltLosses} onChange={e => setLtLosses(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setStGains("5000"); setLtGains("15000"); setStLosses("1000"); setLtLosses("2000"); setOtherIncome("60000"); setResult(calcCryptoTax(5000, 15000, 1000, 2000, 60000)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive uppercase tracking-wider mb-1">Total Tax Owed</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.totalTax.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">Effective rate: {result.effectiveRate.toFixed(2)}% · After-tax profit: ${result.afterTaxProfit.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Short-Term Tax", `$${result.shortTermTax.toFixed(2)}`], ["Long-Term Tax", `$${result.longTermTax.toFixed(2)}`], ["Net Gain", `$${result.netGain.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Tax Owed" ? "font-bold border-t-2 border-border text-destructive" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gains vs. Tax Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.taxData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, ""]} />
                    <Bar dataKey="short" name="Short-Term" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} stackId="a" />
                    <Bar dataKey="long" name="Long-Term" fill="#22c55e" radius={[2, 2, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Crypto Capital Gains Tax Works</h2>
            <p>This <strong>crypto tax calculator</strong> computes your 2024 US federal capital gains tax liability from cryptocurrency trading, using the current IRS tax brackets. Short-term gains (held ≤12 months) are taxed at ordinary income rates (10–37%); long-term gains (held 12+ months) at preferential rates (0%, 15%, 20%). Losses offset gains, and net losses up to $3,000/year reduce ordinary income.</p>
            <h2 className="text-2xl font-bold mb-3">2024 Capital Gains Tax Rates</h2>
            <p>Short-term rates equal your income tax bracket: 10%, 12%, 22%, 24%, 32%, 35%, or 37%. Long-term rates: 0% (income under $47,025 single), 15% ($47,025–$518,900), 20% (above $518,900). High earners also face the 3.8% Net Investment Income Tax on top. The tax differential between short and long-term can be dramatic: the same gain taxed at 37% (short-term) vs. 20% (long-term) saves 17 cents per dollar — holding longer literally pays.</p>
            <h2 className="text-2xl font-bold mb-3">Tax Loss Harvesting Without Wash Sales</h2>
            <p>Unlike stocks, US crypto is NOT subject to wash-sale rules (as of 2024). You can sell a loss position and immediately repurchase the same cryptocurrency to lock in the tax loss while maintaining market exposure. This makes crypto tax loss harvesting a powerful year-end strategy. Net capital losses beyond gains offset up to $3,000 of ordinary income per year, with additional losses carrying forward indefinitely. Related tools: <a href="/calculator/crypto-profit-calculator">Crypto Profit Calculator</a>, <a href="/calculator/income-tax-calculator">Income Tax Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/crypto-tax-calculator" />
          <PopularCalculators exclude="/calculator/crypto-tax-calculator" />
        </div>
      </div>
    </>
  );
}
