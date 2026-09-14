"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface BitcoinMiningResults {
  dailyRevenueBTC: number;
  dailyRevenueUSD: number;
  dailyPowerCost: number;
  dailyProfit: number;
  monthlyProfit: number;
  annualProfit: number;
  daysToBreakEven: number | string;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBitcoinMining = (inputs: typeof DEFAULTS): BitcoinMiningResults => {
  const hashRate = parseFloat(inputs.hashRate); // in TH/s
  const power = parseFloat(inputs.powerConsumption); // in Watts
  const electricityCost = parseFloat(inputs.electricityCost); // in $/kWh
  const poolFee = parseFloat(inputs.poolFee) / 100;
  const hardwareCost = parseFloat(inputs.hardwareCost);
  const btcPrice = parseFloat(inputs.btcPrice);
  const networkDifficulty = parseFloat(inputs.networkDifficulty) * 1e12; // Input is in Trillions
  const blockReward = parseFloat(inputs.blockReward); // e.g., 3.125

  if ([hashRate, power, electricityCost, poolFee, hardwareCost, btcPrice, networkDifficulty, blockReward].some(v => isNaN(v) || v < 0)) {
    return { dailyRevenueBTC: 0, dailyRevenueUSD: 0, dailyPowerCost: 0, dailyProfit: 0, monthlyProfit: 0, annualProfit: 0, daysToBreakEven: 0, chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }
  if (networkDifficulty === 0) {
    return { dailyRevenueBTC: 0, dailyRevenueUSD: 0, dailyPowerCost: 0, dailyProfit: 0, monthlyProfit: 0, annualProfit: 0, daysToBreakEven: 0, chartData: [], isError: true, errorMsg: "Network difficulty cannot be zero." };
  }

  // Hash rate in Hashes per second (H/s). 1 TH/s = 1e12 H/s
  const hashRateHs = hashRate * 1e12;

  // Expected blocks per day = (Hash Rate / (Difficulty * 2^32)) * 86400
  // Or more simply: Daily BTC = (Hash Rate * Block Reward * 86400) / (Difficulty * 2^32)
  const dailyBlocksFound = (hashRateHs * 86400) / (networkDifficulty * Math.pow(2, 32));
  
  // Gross Revenue
  let dailyRevenueBTC = dailyBlocksFound * blockReward;
  
  // Subtract pool fee
  dailyRevenueBTC = dailyRevenueBTC * (1 - poolFee);
  const dailyRevenueUSD = dailyRevenueBTC * btcPrice;

  // Power cost
  // power is in Watts. kWh per day = (power / 1000) * 24
  const dailyPowerCost = (power / 1000) * 24 * electricityCost;

  // Profits
  const dailyProfit = dailyRevenueUSD - dailyPowerCost;
  const monthlyProfit = dailyProfit * 30;
  const annualProfit = dailyProfit * 365;

  let daysToBreakEven: number | string = "Never";
  if (hardwareCost > 0) {
    if (dailyProfit > 0) {
      daysToBreakEven = Math.ceil(hardwareCost / dailyProfit);
    }
  } else {
    daysToBreakEven = 0; // Already paid for
  }

  const chartData = [
    { name: "Daily", Profit: Math.round(dailyProfit) },
    { name: "Weekly", Profit: Math.round(dailyProfit * 7) },
    { name: "Monthly", Profit: Math.round(monthlyProfit) },
    { name: "Yearly", Profit: Math.round(annualProfit) }
  ];

  return {
    dailyRevenueBTC: Number(dailyRevenueBTC.toFixed(8)),
    dailyRevenueUSD: Number(dailyRevenueUSD.toFixed(2)),
    dailyPowerCost: Number(dailyPowerCost.toFixed(2)),
    dailyProfit: Number(dailyProfit.toFixed(2)),
    monthlyProfit: Number(monthlyProfit.toFixed(2)),
    annualProfit: Number(annualProfit.toFixed(2)),
    daysToBreakEven,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  hashRate: "140", // TH/s (e.g. Antminer S19 Pro)
  powerConsumption: "3010", // Watts
  electricityCost: "0.12", // $/kWh
  poolFee: "2", // %
  hardwareCost: "3000", // $
  btcPrice: "65000", // $
  networkDifficulty: "83.9", // Trillions
  blockReward: "3.125", // Current reward after 2024 halving
  showAdvanced: true
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function BitcoinMiningCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BitcoinMiningResults>(calculateBitcoinMining(DEFAULTS));
  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateBitcoinMining(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleCalculate = () => {
    const r = calculateBitcoinMining(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBitcoinMining(DEFAULTS));
  };

  const faqs = [
    { question: "Is Bitcoin mining still profitable?", answer: "Profitability depends entirely on your electricity cost and the current Bitcoin price. If your electricity cost is high (e.g., above $0.15/kWh), mining is usually unprofitable unless Bitcoin experiences a massive price surge. Commercial miners secure electricity rates under $0.05/kWh to remain competitive." },
    { question: "What is Hash Rate?", answer: "Hash rate is a measure of the computing power of your mining hardware. It represents the number of calculations (hashes) the machine can perform per second to solve the cryptographic puzzle required to mine a block. It is usually measured in Terahashes per second (TH/s)." },
    { question: "What is Network Difficulty?", answer: "The Bitcoin network automatically adjusts how hard it is to mine a block every two weeks to ensure a new block is found roughly every 10 minutes, regardless of how many miners join or leave the network. As more miners join, difficulty increases, which reduces your individual hardware's profitability." },
    { question: "What was the 2024 Halving?", answer: "Every 210,000 blocks (roughly 4 years), the block reward paid to miners is cut in half. In April 2024, the reward dropped from 6.25 BTC to 3.125 BTC per block. This instantly cut miner revenue in half, forcing many older, less efficient machines to shut down." },
    { question: "Why do I need to pay a pool fee?", answer: "Solo mining is essentially playing the lottery; you might mine for years and never solve a block. By joining a mining pool, thousands of miners combine their hash power and share the rewards proportionally when the pool finds a block, ensuring steady, predictable payouts. Pools charge a small fee (1-3%) for managing this process." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bitcoin Mining Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bitcoin Mining Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Estimate mining profitability based on your hardware, power costs, and network conditions.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="hashRate" label="Hardware Hash Rate" value={inputs.hashRate} onChange={(v: string) => handleChange("hashRate", v)} suffix="TH/s" />
              <CompactInput id="powerConsumption" label="Power Consumption" value={inputs.powerConsumption} onChange={(v: string) => handleChange("powerConsumption", v)} suffix="W" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="electricityCost" label="Electricity Cost" value={inputs.electricityCost} onChange={(v: string) => handleChange("electricityCost", v)} prefix="$" suffix="/kWh" />
              <CompactInput id="hardwareCost" label="Hardware Cost" value={inputs.hardwareCost} onChange={(v: string) => handleChange("hardwareCost", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Network Conditions & Fees</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="btcPrice" label="Bitcoin Price" value={inputs.btcPrice} onChange={(v: string) => handleChange("btcPrice", v)} prefix="$" />
                  <CompactInput id="poolFee" label="Mining Pool Fee" value={inputs.poolFee} onChange={(v: string) => handleChange("poolFee", v)} suffix="%" />
                  <CompactInput id="networkDifficulty" label="Network Difficulty" value={inputs.networkDifficulty} onChange={(v: string) => handleChange("networkDifficulty", v)} suffix="T" />
                  <CompactInput id="blockReward" label="Block Reward" value={inputs.blockReward} onChange={(v: string) => handleChange("blockReward", v)} suffix="BTC" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.dailyProfit > 0 ? 'border-emerald-500' : 'border-destructive'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Daily Profit</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.dailyProfit > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
                        {results.dailyProfit > 0 ? '+' : ''}${results.dailyProfit}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">
                      Cost: <span className="font-bold text-destructive">-${results.dailyPowerCost}/day</span>
                    </div>
                  </div>

                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Daily Mined</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-bold text-primary tracking-tight">{results.dailyRevenueBTC} <span className="text-xl text-primary">BTC</span></div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">
                      Gross Revenue: <span className="font-bold text-foreground">${results.dailyRevenueUSD}/day</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Monthly Profit</div>
                    <div className={`text-xl font-bold ${results.monthlyProfit > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
                      {results.monthlyProfit > 0 ? '+' : ''}${results.monthlyProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual Profit</div>
                    <div className={`text-xl font-bold ${results.annualProfit > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
                      {results.annualProfit > 0 ? '+' : ''}${results.annualProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm border-l-2 border-orange-500">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Days to Break Even</div>
                    <div className="text-xl font-bold text-foreground">{results.daysToBreakEven}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Projected Cash Flow</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Bar dataKey="Profit" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.Profit >= 0 ? "hsl(var(--emerald-500))" : "hsl(var(--destructive))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4 italic">
                    Assumes constant network difficulty, block reward, and Bitcoin price over the projected time periods. In reality, these variables fluctuate constantly.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Realities of Bitcoin Mining</h2>
            <p>Bitcoin mining is the process of using high-powered computer hardware (ASICs) to solve complex cryptographic puzzles. The first miner to solve the puzzle earns the right to add a new block to the blockchain and receives the "block reward" (newly minted Bitcoins) plus transaction fees.</p>
            
            <h2 className="text-2xl font-bold mb-3">Why Electricity Costs Dictate Profitability</h2>
            <p>ASIC miners consume massive amounts of electricity and generate immense heat. The biggest recurring cost for any miner is their electricity bill. If your residential electricity rate is $0.15/kWh, you are competing against commercial mining farms in Texas, Iceland, or Kazakhstan paying $0.03 to $0.06/kWh. In a bear market, high-cost miners are forced to shut down their machines because the Bitcoin they earn isn't enough to pay the power bill.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Halving Cycle</h2>
            <p>Bitcoin's protocol dictates that the block reward is cut in half every 210,000 blocks (roughly every 4 years). This event is known as "The Halving." The reward started at 50 BTC in 2009. After the April 2024 halving, it dropped to 3.125 BTC. This means that overnight, the revenue generated by miners gets slashed in half, forcing the industry to constantly upgrade to more efficient hardware.</p>
            
            <h2 className="text-2xl font-bold mb-3">Network Difficulty</h2>
            <p>Satoshi Nakamoto designed Bitcoin to produce a block every 10 minutes. If thousands of new miners plug in their machines, blocks would be found too quickly. To counteract this, the network automatically increases the "Difficulty" every two weeks (2,016 blocks). As difficulty goes up, your individual hardware earns a smaller percentage of the total rewards.</p>
            
            <h2 className="text-2xl font-bold mb-3">Mining Pools</h2>
            <p>Because the network hash rate is so incredibly high, solo mining is financially reckless. You could run a machine for 10 years and never win the race to solve a block. To fix this, miners combine their hash power into "pools." The pool acts as one massive miner, solving blocks frequently, and distributing the BTC to its participants based on how much hash power they contributed. This provides a steady, predictable income stream.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bitcoin-mining-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Bitcoin Mining Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Bitcoin Mining Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Bitcoin Mining Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Bitcoin Mining Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Bitcoin Mining Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
