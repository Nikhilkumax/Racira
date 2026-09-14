"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface FlashLoanInputs {
  loanAmount: number;
  buyPrice: number;
  sellPrice: number;
  tradeFeePct: number;
  flashLoanFeePct: number;
  slippagePct: number;
  gasCost: number;
}

interface FlashLoanResult {
  tokensBought: number;
  grossProceeds: number;
  buyFees: number;
  sellFees: number;
  totalTradingFees: number;
  flashLoanFee: number;
  netProfit: number;
  roi: number;
  effectiveBuyPrice: number;
  effectiveSellPrice: number;
  breakevenSellPrice: number;
  breakevenSpreadPct: number;
  profitable: boolean;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcFlashLoan(inp: FlashLoanInputs): FlashLoanResult {
  const slippage = inp.slippagePct / 100;
  const tradeFee = inp.tradeFeePct / 100;
  const flashFee = inp.flashLoanFeePct / 100;

  const effectiveBuyPrice = inp.buyPrice * (1 + slippage);
  const effectiveSellPrice = inp.sellPrice * (1 - slippage);

  // Buy leg: trading fee is deducted from the loan, the rest buys tokens.
  const tokensBought = effectiveBuyPrice > 0 ? (inp.loanAmount * (1 - tradeFee)) / effectiveBuyPrice : 0;
  // Sell leg: proceeds = tokens × sell price, minus the sell-leg trading fee.
  const grossProceeds = tokensBought * effectiveSellPrice * (1 - tradeFee);

  const buyFees = inp.loanAmount * tradeFee;
  const sellFees = tokensBought * effectiveSellPrice * tradeFee;
  const totalTradingFees = buyFees + sellFees;
  const flashLoanFee = inp.loanAmount * flashFee;

  const netProfit = grossProceeds - inp.loanAmount - flashLoanFee - inp.gasCost;
  const roi = inp.loanAmount > 0 ? (netProfit / inp.loanAmount) * 100 : 0;
  const profitable = netProfit > 0;

  // Sell price at which net profit = 0 given all other parameters.
  const breakevenSellPrice =
    inp.loanAmount > 0 && tradeFee < 1
      ? ((inp.loanAmount * (1 + flashFee) + inp.gasCost) * effectiveBuyPrice) /
        (inp.loanAmount * Math.pow(1 - tradeFee, 2) * (1 - slippage))
      : 0;
  const breakevenSpreadPct = inp.buyPrice > 0 ? ((breakevenSellPrice - inp.buyPrice) / inp.buyPrice) * 100 : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Flash Loan Amount", value: `$${fmtInt(inp.loanAmount)}` },
    { label: "Buy Price (DEX A)", value: `$${fmt(inp.buyPrice)}` },
    { label: "Sell Price (DEX B)", value: `$${fmt(inp.sellPrice)}` },
    { label: "Gross Price Gap", value: `${((inp.sellPrice - inp.buyPrice) / inp.buyPrice * 100).toFixed(2)}%` },
    { label: `Effective Buy Price (${inp.slippagePct}% slippage)`, value: `$${fmt(effectiveBuyPrice)}` },
    { label: "Tokens Bought", value: tokensBought.toLocaleString("en-US", { maximumFractionDigits: 2 }) },
    { label: "Gross Sale Proceeds", value: `$${fmt(grossProceeds)}` },
    { label: "Trading Fees (both legs)", value: `−$${fmt(totalTradingFees)}` },
    { label: `Flash Loan Fee (${inp.flashLoanFeePct}%)`, value: `−$${fmt(flashLoanFee)}` },
    { label: "Gas Cost", value: `−$${fmt(inp.gasCost)}` },
    { label: "Net Arbitrage Profit", value: profitable ? `+$${fmt(netProfit)}` : `−$${fmt(Math.abs(netProfit))}`, highlight: true },
    { label: "ROI (per transaction)", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(3)}%` },
    { label: "Break-Even Sell Price", value: `$${fmt(breakevenSellPrice)}` },
    { label: "Minimum Price Gap Needed", value: `+${breakevenSpreadPct.toFixed(2)}%`, highlight: !profitable },
  ];

  const summaryStats = [
    { label: "Net Profit", value: `${profitable ? "+" : "−"}$${fmt(Math.abs(netProfit))}` },
    { label: "Gross Proceeds", value: `$${fmt(grossProceeds)}` },
    { label: "Trading Fees", value: `$${fmt(totalTradingFees)}` },
    { label: "Flash Loan Fee", value: `$${fmt(flashLoanFee)}` },
    { label: "Gas Cost", value: `$${fmt(inp.gasCost)}` },
    { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(3)}%` },
    { label: "Tokens Bought", value: tokensBought.toLocaleString("en-US", { maximumFractionDigits: 2 }) },
    { label: "Break-Even Spread", value: `+${breakevenSpreadPct.toFixed(2)}%` },
  ];

  return {
    tokensBought, grossProceeds, buyFees, sellFees, totalTradingFees, flashLoanFee,
    netProfit, roi, effectiveBuyPrice, effectiveSellPrice, breakevenSellPrice,
    breakevenSpreadPct, profitable, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: FlashLoanInputs = {
  loanAmount: 100000,
  buyPrice: 100,
  sellPrice: 101.2,
  tradeFeePct: 0.3,
  flashLoanFeePct: 0.05,
  slippagePct: 0.1,
  gasCost: 15,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function FlashLoanArbitrageCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [buyPrice, setBuyPrice] = useState(String(DEFAULTS.buyPrice));
  const [sellPrice, setSellPrice] = useState(String(DEFAULTS.sellPrice));
  const [tradeFeePct, setTradeFeePct] = useState(String(DEFAULTS.tradeFeePct));
  const [flashLoanFeePct, setFlashLoanFeePct] = useState(String(DEFAULTS.flashLoanFeePct));
  const [slippagePct, setSlippagePct] = useState(String(DEFAULTS.slippagePct));
  const [gasCost, setGasCost] = useState(String(DEFAULTS.gasCost));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<FlashLoanResult>(() => calcFlashLoan(DEFAULTS));

  useEffect(() => { setResult(calcFlashLoan(DEFAULTS)); }, []);

  const getInputs = (): FlashLoanInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    buyPrice: parseFloat(buyPrice) || 0,
    sellPrice: parseFloat(sellPrice) || 0,
    tradeFeePct: parseFloat(tradeFeePct) || 0,
    flashLoanFeePct: parseFloat(flashLoanFeePct) || 0,
    slippagePct: parseFloat(slippagePct) || 0,
    gasCost: parseFloat(gasCost) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const loan = parseFloat(loanAmount) || 0;
  const buy = parseFloat(buyPrice) || 0;
  const sell = parseFloat(sellPrice) || 0;
  const tradeFee = parseFloat(tradeFeePct) || 0;
  const flashFee = parseFloat(flashLoanFeePct) || 0;
  const slip = parseFloat(slippagePct) || 0;
  const gas = parseFloat(gasCost) || 0;
  if (loan <= 0) errors.loanAmount = "Flash loan amount must be greater than 0.";
  if (buy <= 0) errors.buyPrice = "Buy price must be greater than 0.";
  if (sell <= 0) errors.sellPrice = "Sell price must be greater than 0.";
  if (tradeFee < 0 || tradeFee >= 20) errors.tradeFee = "Trading fee must be 0–19.9%.";
  if (flashFee < 0 || flashFee >= 20) errors.flashFee = "Flash loan fee must be 0–19.9%.";
  if (slip < 0 || slip >= 20) errors.slippage = "Slippage must be 0–19.9%.";
  if (gas < 0) errors.gas = "Gas cost cannot be negative.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcFlashLoan(getInputs())); };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setBuyPrice(String(DEFAULTS.buyPrice));
    setSellPrice(String(DEFAULTS.sellPrice));
    setTradeFeePct(String(DEFAULTS.tradeFeePct));
    setFlashLoanFeePct(String(DEFAULTS.flashLoanFeePct));
    setSlippagePct(String(DEFAULTS.slippagePct));
    setGasCost(String(DEFAULTS.gasCost));
    setResult(calcFlashLoan(DEFAULTS));
  };

  const profitColor = result.netProfit > 0 ? "text-emerald-600" : result.netProfit < 0 ? "text-red-500" : "text-foreground";

  const faqs = [
    { question: "What is a flash loan?", answer: "A flash loan is an uncollateralized DeFi loan that must be borrowed and repaid within the same blockchain transaction. If the loan is not repaid by the end of the transaction, the entire transaction reverts as if it never happened. Protocols such as Aave and dYdX pioneered the model, and it is used for arbitrage, collateral swaps, and liquidations." },
    { question: "What fees do flash loan arbitrage strategies pay?", answer: "Typically three: trading fees on each decentralized exchange swap (0.30% per leg on Uniswap V2-style AMMs), the flash loan fee charged by the lender (0.05% on Aave V3, 0.09% historically on Aave V2, and 0% on some protocols such as dYdX and Balancer), plus gas. The gross price gap between the two exchanges must exceed the sum of all of these or the trade loses money." },
    { question: "Why does the calculator include slippage?", answer: "Slippage is the difference between the quoted price and the price you actually receive when your order moves the market. Arbitrage sizes are limited by the liquidity in the pools: a large loan can consume a meaningful share of the smaller pool, pushing the effective buy price up and the sell price down. The calculator applies your slippage estimate to both legs to avoid overstating profit." },
    { question: "Is flash loan arbitrage risk-free? Can I run this with real money?", answer: "Mechanically the transaction is atomic, so a failed arbitrage reverts and you do not lose the principal. In practice competition is intense: bots monitor every pool and the profitable gaps are often captured within the same block they appear, which is why strategies rely on speed and precise execution rather than manual clicking. This calculator is an educational tool for estimating the economics of a single arbitrage — always understand gas costs, MEV competition, and protocol risks before deploying any strategy." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Flash Loan Arbitrage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flash Loan Arbitrage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fl-loan" className="text-sm font-medium mb-1 block">Flash Loan Amount ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="fl-loan" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className={ci} /></div>
                  {errors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.loanAmount}</p>}
                </div>
                <div>
                  <label htmlFor="fl-buy" className="text-sm font-medium mb-1 block">Buy Price — DEX A ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="fl-buy" type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} step="0.01" className={ci} /></div>
                  {errors.buyPrice && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.buyPrice}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fl-sell" className="text-sm font-medium mb-1 block">Sell Price — DEX B ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="fl-sell" type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} step="0.01" className={ci} /></div>
                  {errors.sellPrice && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.sellPrice}</p>}
                </div>
                <div>
                  <label htmlFor="fl-fee" className="text-sm font-medium mb-1 block">Trading Fee per Swap (%)</label>
                  <div className={inp}><input id="fl-fee" type="number" value={tradeFeePct} onChange={(e) => setTradeFeePct(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.tradeFee && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.tradeFee}</p>}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Protocol &amp; Execution</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="fl-flash" className="text-sm font-medium mb-1 block">Flash Loan Fee (%)</label>
                          <div className={inp}><input id="fl-flash" type="number" value={flashLoanFeePct} onChange={(e) => setFlashLoanFeePct(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.flashFee && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.flashFee}</p>}
                        </div>
                        <div>
                          <label htmlFor="fl-slip" className="text-sm font-medium mb-1 block">Slippage (%)</label>
                          <div className={inp}><input id="fl-slip" type="number" value={slippagePct} onChange={(e) => setSlippagePct(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.slippage && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.slippage}</p>}
                        </div>
                        <div>
                          <label htmlFor="fl-gas" className="text-sm font-medium mb-1 block">Gas Cost ($)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="fl-gas" type="number" value={gasCost} onChange={(e) => setGasCost(e.target.value)} className={ci} /></div>
                          {errors.gas && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.gas}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Aave V3 charges 0.05%; dYdX and some protocols charge 0%. Slippage is applied against both execution prices.</p>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Arbitrage Profit</div>
              <div className={`text-4xl font-extrabold tracking-tight ${profitColor}`}>{result.netProfit >= 0 ? "+" : "−"}${Math.abs(result.netProfit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">ROI: {result.roi >= 0 ? "+" : ""}{result.roi.toFixed(3)}% · {result.profitable ? "Profitable after all fees" : "Trade loses money — gap too small"} · Break-even spread: +{result.breakevenSpreadPct.toFixed(2)}%</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Gross Sale Proceeds", `$${result.grossProceeds.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Total Fees", `$${result.totalTradingFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["ROI (per tx)", `${result.roi >= 0 ? "+" : ""}${result.roi.toFixed(3)}%`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Transaction Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Flash Loan Arbitrage?</h2>
              <p className="text-muted-foreground leading-relaxed">Flash loan arbitrage is a decentralized finance strategy in which a trader borrows a large amount of capital without collateral, uses it to buy an asset on one exchange where it is priced lower, sells it on another exchange where it is priced higher, repays the loan plus its fee, and keeps the difference — all inside a single blockchain transaction. The innovation of the flash loan is atomicity: if the repayment cannot be completed, the entire transaction is reversed, so the lender never faces default and the borrower never faces a stranded position. In practice the strategy is executed by automated bots that monitor the prices of thousands of token pairs across dozens of decentralized exchanges, waiting for momentary price gaps large enough to clear the cost of the two swaps, the lender&apos;s fee, and gas. Because anyone can inspect the same pools, profitable gaps are usually captured within seconds — often within the same block in which they appear — which is why the economics shown by a calculator like this one represent the theoretical ceiling for a single trade rather than a guaranteed recurring income. This tool models the complete cash flow of one arbitrage cycle: the size of the loan, the two execution prices, the trading fee charged on each swap, the flash loan fee charged by the lender, the slippage caused by your own trade moving the pools, and the gas needed to settle the transaction.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Profit Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation follows the money through the transaction step by step. Slippage is applied first: because a large buy consumes liquidity in the cheaper pool, your effective buy price is the quoted price adjusted upward by your slippage estimate, and the effective sell price is adjusted downward on the other side. The trading fee on the buy leg is deducted from the loan before any tokens are purchased, so the number of tokens you acquire equals the loan amount minus the buy fee, divided by the effective buy price. Those tokens are then sold at the effective sell price, and the sell leg&apos;s trading fee is deducted from the proceeds, giving your gross sale proceeds. From those proceeds the calculator subtracts the original loan, the flash loan fee charged by the lender, and your gas cost. What remains is the net arbitrage profit. Because the loan itself is always repaid — the transaction reverts otherwise — the profit is what is left after every cost, and the return on the trade is expressed as ROI relative to the borrowed amount. The calculator also solves the strategy&apos;s critical question in reverse: given every cost you face, what sell price would make the trade exactly break even? That break-even price, shown as a minimum required price gap, tells you instantly whether an observed spread between two exchanges is worth acting on. The math deliberately assumes a single pair of venues with uniform fees; real arbitrage sometimes routes through several pools or uses more complex paths, which only raises the fee burden and the break-even spread.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline number is the net arbitrage profit for one transaction, colored green when it is positive and red when the trade loses money. Next to it you see the return on the borrowed capital and the minimum price gap required to break even, which is the single most useful figure when you are scanning pools for opportunity: if the observed gap between two exchanges is smaller than that percentage, no loan size will make the trade profitable. The breakdown table traces every component of the cash flow — effective buy and sell prices, tokens acquired, gross proceeds, trading fees on both legs, the flash loan fee, and gas — so you can see exactly which cost is consuming your edge. The summary statistics condense the same numbers for a quick scan. The defaults describe a realistic scenario: a $100,000 loan, a token trading at $100.00 on one venue and $101.20 on another, 0.30% trading fees on each swap, a 0.05% flash loan fee, modest slippage, and $15 of gas. Move the sell price down toward the buy price and watch the trade flip to a loss at the break-even spread; move it up and the profit scales almost linearly with the gap. Use the advanced inputs to model your actual lender fee and network conditions, and remember that this calculator estimates the economics of a single isolated arbitrage — competition, mempool dynamics, and protocol risk determine whether that economics can ever be captured in practice.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flash-loan-arbitrage-calculator" />
          <PopularCalculators exclude="/calculator/flash-loan-arbitrage-calculator" />
        </div>
      </div>
    </>
  );
}
