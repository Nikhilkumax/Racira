"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function OptionsProfitCalculator() {
  const [optionType, setOptionType] = useState("call");
  const [stockPrice, setStockPrice] = useState("150");
  const [strikePrice, setStrikePrice] = useState("155");
  const [premium, setPremium] = useState("2.50");
  const [contracts, setContracts] = useState("1");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    breakEven: 0,
    maxProfitText: "",
    maxLoss: 0,
    currentProfit: 0,
  });

  const handleCalculate = () => {
    const sp = parseFloat(stockPrice) || 0;
    const strike = parseFloat(strikePrice) || 0;
    const prem = parseFloat(premium) || 0;
    const cont = parseFloat(contracts) || 1;
    const totalPremium = prem * cont * 100;

    let breakEven = 0;
    let maxProfitText = "";
    let currentProfit = 0;

    if (optionType === "call") {
      breakEven = strike + prem;
      currentProfit = (Math.max(0, sp - strike) - prem) * cont * 100;
      maxProfitText = "Unlimited";
    } else {
      breakEven = strike - prem;
      currentProfit = (Math.max(0, strike - sp) - prem) * cont * 100;
      maxProfitText = `$${((strike - prem) * cont * 100).toLocaleString()}`;
    }

    setResults({ breakEven, maxProfitText, maxLoss: totalPremium, currentProfit });
    setShowResults(true);
  };

  const reset = () => {
    setOptionType("call"); setStockPrice("150"); setStrikePrice("155");
    setPremium("2.50"); setContracts("1"); setShowResults(false);
  };

  const faqs = [
    { question: "What is an options profit calculator?", answer: "An options profit calculator estimates the potential profit or loss of an options contract based on changes in the underlying stock price, strike price, and premium paid." },
    { question: "How is the break-even price calculated for a call option?", answer: "For a long call option, the break-even price is the strike price plus the premium paid per share. For example, a $155 strike with a $2.50 premium has a break-even of $157.50." },
    { question: "What is the maximum loss on a long call or put?", answer: "The maximum loss for a long option buyer is strictly limited to the total premium paid for the contract — this is one of the key advantages of buying options vs. shorting stocks." },
    { question: "How does the number of contracts affect the calculation?", answer: "Each standard U.S. options contract represents 100 shares. So the total premium paid is: premium per share × number of contracts × 100." },
    { question: "What is a strike price?", answer: "The strike price is the fixed price at which the option holder can buy (call) or sell (put) the underlying security when exercising the option." },
    { question: "What does 'premium' mean in options trading?", answer: "The premium is the price the buyer pays to the seller for the rights granted by the options contract. It is quoted on a per-share basis, so a $2.50 premium costs $250 per contract." },
    { question: "What is the difference between intrinsic and extrinsic value in options?", answer: "Intrinsic value is the real in-the-money value of the option. Extrinsic value (time value) is the extra amount paid above intrinsic value, reflecting time remaining and implied volatility." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Options Profit Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Options Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">Option Type</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button type="button" onClick={() => setOptionType("call")} className={`flex-1 py-3 text-sm font-medium transition-colors ${optionType === "call" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Call (Bullish)</button>
                  <button type="button" onClick={() => setOptionType("put")} className={`flex-1 py-3 text-sm font-medium transition-colors ${optionType === "put" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Put (Bearish)</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="stock-price" label="Current Stock Price" value={stockPrice} onChange={setStockPrice} prefix="$" tooltip="The current market price of the underlying stock." />
                <InputField id="strike-price" label="Strike Price" value={strikePrice} onChange={setStrikePrice} prefix="$" tooltip="The price at which the option can be exercised." />
                <InputField id="premium" label="Premium Paid (per share)" value={premium} onChange={setPremium} prefix="$" tooltip="The cost of one share's worth of the option contract." />
                <InputField id="contracts" label="Number of Contracts" value={contracts} onChange={setContracts} tooltip="Each contract = 100 shares." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate P&L</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-4">Results</h2>
                <ResultDisplay items={[
                  { label: "Break-Even Price", value: results.breakEven, highlight: true },
                  { label: "Max Profit", value: 0, textValue: results.maxProfitText, highlight: true },
                  { label: "Maximum Loss (Premium Paid)", value: results.maxLoss },
                  { label: "Current P&L at Stock Price", value: results.currentProfit, highlight: true },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Understanding Options Profit and Loss</h2>
              <p>Options trading offers investors a powerful way to profit from price movements in stocks, ETFs, and other securities with a defined and limited risk. Unlike buying shares outright, purchasing an option grants you the right — but not the obligation — to buy or sell an underlying asset at a predetermined price (the strike price) before a specified expiration date. This Options Profit Calculator helps you visualize the exact profit, loss, and break-even points for your trade before you commit capital.</p>

              <h2>The Mechanics of a Call Option</h2>
              <p>A call option is a bullish strategy. You buy a call when you believe the underlying stock price will rise above the strike price before expiration. For example, if a stock trades at $150 and you buy a call with a $155 strike for a $2.50 premium, your break-even is $157.50. Above that price, every dollar of stock appreciation translates to $100 of profit per contract (since each contract covers 100 shares). Below $157.50 at expiration, your maximum loss is the $250 premium paid.</p>

              <h2>The Mechanics of a Put Option</h2>
              <p>A put option is the bearish counterpart. You buy a put when you expect the stock to fall. If the same $150 stock has a $145 put with a $2.50 premium, your break-even is $142.50. Below that, the option gains value. The maximum profit for a put is capped at the strike price minus the premium (times 100 shares), occurring when the stock goes to zero. The maximum loss is again the premium paid.</p>

              <h2>Risk Management with Options</h2>
              <p>One of the most appealing features of buying options is that risk is defined and limited. Unlike short-selling a stock where losses can be theoretically infinite, an option buyer cannot lose more than the premium invested. This makes options an attractive tool for hedging an existing stock portfolio or speculating with limited downside. However, it's critical to understand that the probability of losing 100% of the premium is often higher than the probability of the trade being profitable.</p>

              <h2>Time Decay: The Silent Killer</h2>
              <p>Options are wasting assets — they lose value every day simply due to the passage of time. This is called Theta decay. An option with 60 days left has more time value than one with 5 days left. For option buyers, time is the enemy. If the stock doesn't move in your direction quickly enough, time decay will erode your option's value even if you are eventually proven right about the direction.</p>

              <h2>Implied Volatility and Its Impact</h2>
              <p>Implied Volatility (IV) represents the market's consensus on how much a stock's price will move. High IV means options are expensive; low IV means they are cheap. Buying options when IV is extremely high (e.g., right before an earnings announcement) is risky because the "volatility crush" after the event can destroy an option's value even if the stock moves in the right direction. This is why experienced options traders pay close attention to IV rank and IV percentile.</p>

              <h2>Calculating Your True Cost</h2>
              <p>Always think in terms of total cost, not per-share cost. A $2.50 premium might seem small, but one contract controls 100 shares and costs $250. If you buy 10 contracts, your total premium is $2,500. This total premium is your maximum possible loss. When calculating expected return, the percentage gain on the premium can be very high (e.g., 200-300%), but the absolute dollar amount must justify the risk.</p>

              <h2>The Role of the Greeks in Options Trading</h2>
              <p>Beyond the basic P&L at expiration, options traders use "The Greeks" to measure sensitivity:</p>
              <ul>
                <li><strong>Delta:</strong> How much the option price changes per $1 move in the stock (0 to 1 for calls, -1 to 0 for puts).</li>
                <li><strong>Gamma:</strong> The rate of change of delta, showing how quickly your exposure shifts.</li>
                <li><strong>Theta:</strong> Daily time decay in dollars, always working against the buyer.</li>
                <li><strong>Vega:</strong> Sensitivity to changes in implied volatility.</li>
              </ul>
              <p>Understanding the Greeks allows traders to construct sophisticated multi-leg strategies like spreads, straddles, and iron condors that profit from specific market conditions.</p>

              <h2>Common Options Strategies Beyond Simple Calls and Puts</h2>
              <p>Once you master the basics, you can combine options contracts into complex strategies. A <strong>covered call</strong> involves owning 100 shares and selling a call against them to generate income. A <strong>protective put</strong> involves buying a put on shares you own to insure against downside. A <strong>bull call spread</strong> involves buying one call and selling another at a higher strike to reduce the cost of the trade, capping both your profit and loss.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/options-profit-calculator" />
          <PopularCalculators exclude="/calculator/options-profit-calculator" />
        </div>
      </div>
    </>
  );
}
