"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Info } from "lucide-react";

interface ProbabilityResult {
  pA: number;
  pB: number;
  notA: number;
  notB: number;
  aAndB_ind: number;
  aOrB_ind: number;
  aOrB_mut: number;
  aGivenB?: number;
  bGivenA?: number;
}

const ProbabilityCalculator = () => {
  const [probAType, setProbAType] = useState("percent");
  const [probAVal, setProbAVal] = useState("50");
  const [probAOutcomes, setProbAOutcomes] = useState("1");
  const [probATotal, setProbATotal] = useState("2");

  const [probBType, setProbBType] = useState("percent");
  const [probBVal, setProbBVal] = useState("25");
  const [probBOutcomes, setProbBOutcomes] = useState("1");
  const [probBTotal, setProbBTotal] = useState("4");

  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [error, setError] = useState("");

  const getDecimalProb = (type: string, valStr: string, outcomesStr: string, totalStr: string): number | null => {
    if (type === "percent") {
      const v = parseFloat(valStr);
      if (isNaN(v) || v < 0 || v > 100) return null;
      return v / 100;
    } else if (type === "fraction") {
      const o = parseFloat(outcomesStr);
      const t = parseFloat(totalStr);
      if (isNaN(o) || isNaN(t) || t === 0 || o < 0 || t < 0 || o > t) return null;
      return o / t;
    }
    return null;
  };

  const calculate = () => {
    setError("");
    const pA = getDecimalProb(probAType, probAVal, probAOutcomes, probATotal);
    const pB = getDecimalProb(probBType, probBVal, probBOutcomes, probBTotal);

    if (pA === null) {
      setError("Please enter a valid probability for Event A (0-100%, or valid fraction where outcomes <= total).");
      return;
    }
    if (pB === null) {
      setError("Please enter a valid probability for Event B (0-100%, or valid fraction where outcomes <= total).");
      return;
    }

    setResult({
      pA,
      pB,
      notA: 1 - pA,
      notB: 1 - pB,
      aAndB_ind: pA * pB,
      aOrB_ind: pA + pB - (pA * pB),
      aOrB_mut: pA + pB > 1 ? 1 : pA + pB, // Cap at 1 (100%) for mutually exclusive though technically if sum > 1 they can't be mutually exclusive
    });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setProbAType("percent"); setProbAVal("50"); setProbAOutcomes("1"); setProbATotal("2");
    setProbBType("percent"); setProbBVal("25"); setProbBOutcomes("1"); setProbBTotal("4");
    setError("");
    // trigger immediate recalc based on reset values manually
    setResult({
      pA: 0.5, pB: 0.25, notA: 0.5, notB: 0.75, aAndB_ind: 0.125, aOrB_ind: 0.625, aOrB_mut: 0.75
    });
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const formatProb = (p: number) => {
    if (isNaN(p)) return "0%";
    const pct = p * 100;
    return `${parseFloat(pct.toPrecision(6))}%`;
  };

  const formatDecimal = (p: number) => {
    if (isNaN(p)) return "0";
    return parseFloat(p.toPrecision(6)).toString();
  };

  const faqs = [
    { question: "What is Event A and Event B?", answer: "In probability, an 'event' is simply an outcome you are testing for. Event A could be 'flipping a coin and getting Heads' (50%), and Event B could be 'rolling a 6-sided die and getting a 4' (16.66%)." },
    { question: "What does 'Mutually Exclusive' mean?", answer: "Two events are mutually exclusive if they cannot possibly happen at the same time. For example, drawing a single card from a deck. It cannot be both a Heart and a Spade simultaneously. If Event A is 'Heart' and Event B is 'Spade', they are mutually exclusive." },
    { question: "What are 'Independent Events'?", answer: "Independent events do not affect each other. Flipping a coin (Event A) does not change the odds of rolling a die (Event B). When calculating the probability of BOTH happening, you simply multiply their probabilities together." },
    { question: "How do I calculate 'A OR B'?", answer: "If the events are mutually exclusive, you just add them: P(A) + P(B). However, if they are independent (they can happen together), you must add them and then subtract the probability of them happening together to avoid double-counting: P(A) + P(B) - P(A and B)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Probability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Probability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            {/* Event A */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-3">Event A Probability</h3>
              
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={probAType === "percent"} onChange={() => setProbAType("percent")} className="text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-foreground">Percentage (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={probAType === "fraction"} onChange={() => setProbAType("fraction")} className="text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-foreground">Fraction / Odds</span>
                </label>
              </div>

              {probAType === "percent" ? (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-1.5">Probability (%)</label>
                  <div className={wrap}><input type="number" value={probAVal} onChange={e => setProbAVal(e.target.value)} className={ci} min="0" max="100" step="any" placeholder="e.g. 50" /></div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-foreground mb-1.5 text-center">Favorable</label>
                    <div className={wrap}><input type="number" value={probAOutcomes} onChange={e => setProbAOutcomes(e.target.value)} className={`${ci} text-center`} min="0" step="1" /></div>
                  </div>
                  <div className="text-2xl font-light text-muted-foreground mt-6">/</div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-foreground mb-1.5 text-center">Total Possible</label>
                    <div className={wrap}><input type="number" value={probATotal} onChange={e => setProbATotal(e.target.value)} className={`${ci} text-center`} min="1" step="1" /></div>
                  </div>
                </div>
              )}
            </div>

            {/* Event B */}
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-foreground mb-3">Event B Probability</h3>
              
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={probBType === "percent"} onChange={() => setProbBType("percent")} className="text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-foreground">Percentage (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={probBType === "fraction"} onChange={() => setProbBType("fraction")} className="text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-foreground">Fraction / Odds</span>
                </label>
              </div>

              {probBType === "percent" ? (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-1.5">Probability (%)</label>
                  <div className={wrap}><input type="number" value={probBVal} onChange={e => setProbBVal(e.target.value)} className={ci} min="0" max="100" step="any" placeholder="e.g. 25" /></div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-foreground mb-1.5 text-center">Favorable</label>
                    <div className={wrap}><input type="number" value={probBOutcomes} onChange={e => setProbBOutcomes(e.target.value)} className={`${ci} text-center`} min="0" step="1" /></div>
                  </div>
                  <div className="text-2xl font-light text-muted-foreground mt-6">/</div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-foreground mb-1.5 text-center">Total Possible</label>
                    <div className={wrap}><input type="number" value={probBTotal} onChange={e => setProbBTotal(e.target.value)} className={`${ci} text-center`} min="1" step="1" /></div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm font-bold text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && !error && (<>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Both Events Happen</div>
                  <div className="text-sm text-muted-foreground mb-3 font-medium">Independent: P(A and B)</div>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight font-mono mb-1">
                    {formatProb(result.aAndB_ind)}
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">Decimal: {formatDecimal(result.aAndB_ind)}</div>
                </div>
                
                <div className="bg-card border-l-4 border-emerald-500 rounded-lg p-5 shadow-sm">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Either Event Happens</div>
                  <div className="text-sm text-muted-foreground mb-3 font-medium">Independent: P(A or B)</div>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight font-mono mb-1">
                    {formatProb(result.aOrB_ind)}
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">Decimal: {formatDecimal(result.aOrB_ind)}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Mutually Exclusive Events</h3>
                <div className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">If these events are mutually exclusive (they cannot happen at the same time), the probability of <strong>Either Event</strong> happening is simply P(A) + P(B):</p>
                    <div className="text-xl font-bold text-foreground font-mono">
                      {formatProb(result.aOrB_mut)} <span className="text-sm font-medium text-muted-foreground font-sans ml-2">(Decimal: {formatDecimal(result.aOrB_mut)})</span>
                    </div>
                    {result.pA + result.pB > 1 && (
                      <p className="text-xs font-bold text-destructive mt-2">Note: P(A) + P(B) exceeds 100%. These events cannot be mutually exclusive in reality.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Single Event Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card border border-border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground font-bold mb-1">Event A Not Happening</div>
                    <div className="text-lg font-bold text-foreground font-mono">{formatProb(result.notA)}</div>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground font-bold mb-1">Event B Not Happening</div>
                    <div className="text-lg font-bold text-foreground font-mono">{formatProb(result.notB)}</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Probability Basics</h2>
            <p><strong>Probability</strong> is the mathematical measurement of how likely an event is to occur. It is expressed as a number between 0 and 1 (or 0% and 100%). A probability of 0% means the event is impossible, while a probability of 100% means the event is absolutely certain. Everything in between represents varying degrees of likelihood.</p>
            <p>When calculating probability manually using fractions, the formula is simple: divide the number of <em>favorable outcomes</em> by the total number of <em>possible outcomes</em>. For example, rolling a 4 on a standard six-sided die has a probability of 1/6, or ~16.66%.</p>

            <h2 className="text-2xl font-bold mb-3">Independent vs. Dependent Events</h2>
            <p>Before calculating the combined probability of multiple events, you must determine their relationship:</p>
            <ul>
              <li><strong>Independent Events:</strong> The outcome of one event does not affect the outcome of the other. Flipping a coin and rolling a die are independent. The coin landing on Heads doesn't change the physical properties of the die.</li>
              <li><strong>Dependent Events:</strong> The outcome of the first event directly changes the probability of the second event. Drawing two cards from a deck without replacing the first card is dependent. If you draw an Ace first, there are now fewer Aces and fewer total cards in the deck for your second draw.</li>
            </ul>
            <p><em>Note: This calculator is designed specifically for calculating Independent Events.</em></p>

            <h2 className="text-2xl font-bold mb-3">The "AND" Rule (Multiplication)</h2>
            <p>If you want to know the probability of Event A <strong>AND</strong> Event B happening together (assuming they are independent), you multiply their probabilities. </p>
            <p>Example: What is the probability of flipping Heads (50%) AND rolling a 6 on a die (16.66%)? <br/><code>0.50 × 0.1666 = 0.0833</code>, or an 8.33% chance.</p>

            <h2 className="text-2xl font-bold mb-3">The "OR" Rule (Addition)</h2>
            <p>If you want to know the probability of Event A <strong>OR</strong> Event B happening, you add their probabilities. However, you must be careful about <strong>Mutually Exclusive</strong> events.</p>
            <ul>
              <li><strong>Mutually Exclusive (Cannot happen together):</strong> Drawing a Heart OR a Spade from a deck. You simply add them: P(A) + P(B).</li>
              <li><strong>Not Mutually Exclusive (Can happen together):</strong> Drawing a King OR a Heart from a deck. Since you could draw the King of Hearts (satisfying both conditions simultaneously), you must subtract the overlap so you don't double count it. Formula: <code>P(A) + P(B) - P(A and B)</code>.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/probability-calculator" />
          <PopularCalculators exclude="/calculator/probability-calculator" />
        </div>
      </div>
    </>
  );
};
export default ProbabilityCalculator;
