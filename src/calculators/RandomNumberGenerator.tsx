"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Copy, Check } from "lucide-react";

const generateRandomNumbers = (
  min: number,
  max: number,
  count: number,
  allowDuplicates: boolean,
  sort: "none" | "asc" | "desc"
): number[] | null => {
  if (min > max || count <= 0) return null;
  if (!allowDuplicates && (max - min + 1) < count) return null; // Impossible to generate without duplicates

  const results: number[] = [];
  const range = max - min + 1;

  if (!allowDuplicates) {
    // If range is relatively small, we can shuffle an array
    if (range <= 100000) {
      const pool = Array.from({ length: range }, (_, i) => min + i);
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * (pool.length - i)) + i;
        // Swap
        const temp = pool[i];
        pool[i] = pool[randomIndex];
        pool[randomIndex] = temp;
        results.push(pool[i]);
      }
    } else {
      // For huge ranges, use a Set
      const seen = new Set<number>();
      while (seen.size < count) {
        const num = Math.floor(Math.random() * range) + min;
        if (!seen.has(num)) {
          seen.add(num);
          results.push(num);
        }
      }
    }
  } else {
    // Allow duplicates
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * range) + min);
    }
  }

  if (sort === "asc") results.sort((a, b) => a - b);
  else if (sort === "desc") results.sort((a, b) => b - a);

  return results;
};

const RandomNumberGenerator = () => {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");

  const [result, setResult] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    setError(null);
    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);
    const countVal = parseInt(count, 10);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) {
      setError("Please enter valid integers.");
      return;
    }
    if (minVal > maxVal) {
      setError("Minimum value cannot be greater than Maximum value.");
      return;
    }
    if (countVal <= 0 || countVal > 10000) {
      setError("Please request between 1 and 10,000 numbers.");
      return;
    }
    if (!allowDuplicates && (maxVal - minVal + 1) < countVal) {
      setError("Cannot generate unique numbers: Count is larger than the available range.");
      return;
    }

    setResult(generateRandomNumbers(minVal, maxVal, countVal, allowDuplicates, sort));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setMin("1"); setMax("100"); setCount("1"); setAllowDuplicates(false); setSort("none"); setError(null);
    setResult(generateRandomNumbers(1, 100, 1, false, "none"));
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Are these numbers truly random?", answer: "This generator uses a pseudo-random number generator (PRNG) powered by your browser's math engine (Math.random). While they are statistically random and perfectly suitable for games, lotteries, and general sorting, they are not strictly 'cryptographically secure.' Do not use this tool for generating encryption keys or secure passwords." },
    { question: "What does 'Allow Duplicates' mean?", answer: "If you are rolling a virtual die 10 times, you want to allow duplicates, as you can roll a '6' more than once. However, if you are drawing 5 winning raffle tickets from a pool of 100, you do NOT want duplicates, as one person shouldn't win all 5 prizes." },
    { question: "How many numbers can I generate at once?", answer: "This tool allows you to generate up to 10,000 random numbers simultaneously to maintain browser performance and prevent freezing." },
    { question: "Can I generate negative random numbers?", answer: "Yes! Simply enter a negative number in the Minimum and/or Maximum fields. For example, setting Minimum to -50 and Maximum to 50 will generate numbers within that exact range." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Random Number Generator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Random Number Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Minimum</label>
                <div className={wrap}><input type="number" value={min} onChange={e => setMin(e.target.value)} className={ci} step="1" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Maximum</label>
                <div className={wrap}><input type="number" value={max} onChange={e => setMax(e.target.value)} className={ci} step="1" /></div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">How Many Numbers?</label>
              <div className={wrap}><input type="number" value={count} onChange={e => setCount(e.target.value)} className={ci} min="1" max="10000" step="1" /></div>
            </div>

            <div className="flex flex-col gap-2 bg-secondary/30 border border-border p-3 rounded-lg mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allowDuplicates} onChange={e => setAllowDuplicates(e.target.checked)} className="w-4 h-4 text-primary rounded focus:ring-primary border-input" />
                <span className="text-sm font-medium text-foreground">Allow Duplicate Numbers</span>
              </label>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5">Sorting Output</label>
              <div className="flex rounded-md border border-input overflow-hidden h-9 w-full">
                <button type="button" onClick={() => setSort("none")} className={`flex-1 text-xs font-bold transition-colors ${sort === "none" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>None</button>
                <button type="button" onClick={() => setSort("asc")} className={`flex-1 text-xs font-bold transition-colors border-l border-input ${sort === "asc" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Asc (Low-High)</button>
                <button type="button" onClick={() => setSort("desc")} className={`flex-1 text-xs font-bold transition-colors border-l border-input ${sort === "desc" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Desc (High-Low)</button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            
            {error && (
              <div className="text-sm font-bold text-destructive bg-destructive/10 p-3 rounded-md mt-2 border border-destructive/20">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {result && !error && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 flex flex-col h-full min-h-[300px] max-h-[600px]">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-bold text-primary uppercase tracking-wider">
                    {result.length} Number{result.length !== 1 ? 's' : ''} Generated
                  </div>
                  <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs font-bold bg-background border border-border hover:bg-secondary px-3 py-1.5 rounded-md transition-colors text-foreground">
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy All</>}
                  </button>
                </div>
                
                {result.length === 1 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-8xl font-extrabold text-foreground tracking-tight break-all text-center">
                      {result[0]}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto bg-card border border-border/50 rounded-lg p-4 font-mono text-lg md:text-xl text-foreground leading-relaxed shadow-inner">
                    <div className="flex flex-wrap gap-2">
                      {result.map((num, idx) => (
                        <span key={idx} className="bg-secondary/50 px-2 py-1 rounded border border-border/30 inline-block min-w-[3ch] text-center">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What is a Random Number Generator?</h2>
            <p>A <strong>Random Number Generator (RNG)</strong> is a computational or physical device designed to generate a sequence of numbers or symbols that lack any pattern. This online RNG allows you to define a specific numerical range (e.g., 1 to 100) and instantly draw one or multiple unbiased numbers from that pool.</p>

            <h2>Common Uses for RNGs</h2>
            <p>Random numbers are essential in both digital systems and everyday offline activities. Some of the most common applications include:</p>
            <ul>
              <li><strong>Lotteries and Raffles:</strong> Drawing winning ticket numbers fairly without human bias.</li>
              <li><strong>Gaming and Tabletop RPGs:</strong> Simulating the roll of dice (e.g., 1 to 6, or 1 to 20 for D&amp;D) or randomizing loot drops.</li>
              <li><strong>Statistical Sampling:</strong> Researchers use RNGs to select random samples from a population to ensure their data isn't skewed.</li>
              <li><strong>Classroom Activities:</strong> Teachers picking a random student from a roster numbered 1 through 30.</li>
            </ul>

            <h2>Understanding Duplicates</h2>
            <p>One of the most important settings when generating multiple numbers is whether to <strong>allow duplicates</strong> (often called "sampling with replacement" in statistics).</p>
            <p>If you are simulating flipping a coin (1 for heads, 2 for tails) ten times, you <em>must</em> allow duplicates because the same result can happen multiple times. However, if you are drawing 5 winning bingo balls from a cage of 75, you must <em>disable</em> duplicates, because once a ball is drawn, it cannot be drawn again.</p>
            
            <h2>Pseudo-Random vs. True Random</h2>
            <p>This calculator utilizes a Pseudo-Random Number Generator (PRNG) built into your modern web browser. PRNGs use complex mathematical algorithms to produce sequences of numbers that are practically indistinguishable from true randomness. They are incredibly fast and perfectly reliable for games, raffles, and statistical models.</p>
            <p>However, because they rely on deterministic algorithms (often seeded by the system clock), they are not "True RNGs" (which use unpredictable physical phenomena like atmospheric noise or radioactive decay). Therefore, PRNGs should not be used for high-security cryptography.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/random-number-generator" />
          <PopularCalculators exclude="/calculator/random-number-generator" />
        </div>
      </div>
    </>
  );
};
export default RandomNumberGenerator;
