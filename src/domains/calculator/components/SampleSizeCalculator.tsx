"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Info } from "lucide-react";

const calculateSampleSize = (
  populationStr: string,
  confidenceLevelStr: string,
  marginOfErrorStr: string,
  populationProportionStr: string
): number | null => {
  const population = parseInt(populationStr, 10);
  const marginOfError = parseFloat(marginOfErrorStr) / 100;
  const p = parseFloat(populationProportionStr) / 100;
  const cl = parseFloat(confidenceLevelStr);

  if (
    isNaN(population) || 
    isNaN(marginOfError) || 
    isNaN(p) || 
    isNaN(cl) || 
    marginOfError <= 0 || 
    p <= 0 || 
    p >= 1 ||
    population < 0
  ) return null;

  // Z-scores for common confidence levels
  let z = 1.96; // Default 95%
  if (cl === 90) z = 1.645;
  if (cl === 95) z = 1.96;
  if (cl === 99) z = 2.576;
  if (cl === 80) z = 1.282;
  if (cl === 85) z = 1.440;
  if (cl === 98) z = 2.326;

  // Cochran's formula for infinite population
  // n0 = (Z^2 * p * (1-p)) / e^2
  const n0 = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(marginOfError, 2);

  // Finite population correction
  if (population > 0) {
    const n = (n0 * population) / (n0 + (population - 1));
    return Math.ceil(n);
  }

  return Math.ceil(n0);
};

const SampleSizeCalculator = () => {
  const [population, setPopulation] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("95");
  const [marginOfError, setMarginOfError] = useState("5");
  const [proportion, setProportion] = useState("50");

  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // If population is empty, treat as 0 (infinite)
    const popVal = population.trim() === "" ? "0" : population;
    setResult(calculateSampleSize(popVal, confidenceLevel, marginOfError, proportion));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setPopulation(""); setConfidenceLevel("95"); setMarginOfError("5"); setProportion("50");
    setResult(calculateSampleSize("0", "95", "5", "50"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a Sample Size?", answer: "Sample size is the number of individuals you need to survey or test from a larger population to achieve mathematically significant results. You rarely need to survey everyone in a population to get an accurate read on their opinions or traits." },
    { question: "What is Confidence Level?", answer: "Confidence level tells you how sure you can be that your results are accurate. A 95% confidence level means that if you repeated your survey 100 times, 95 of those times the results would match the true population. 95% is the industry standard." },
    { question: "What is Margin of Error (Confidence Interval)?", answer: "Margin of error is the plus-or-minus figure you often see in polls (e.g., '± 3%'). If your survey finds that 60% of people like a product, and your margin of error is 5%, you can be confident the true population figure is between 55% and 65%." },
    { question: "What is Population Proportion?", answer: "This is the estimated percentage of the population that exhibits the trait you are testing for. If you don't know, leave it at 50%. A proportion of 50% represents the maximum variance and yields the safest (largest) recommended sample size." },
    { question: "Do I need to know the exact Population Size?", answer: "No. If your population is very large (e.g., all adults in the US), the mathematics of sampling stabilize. Surveying a population of 1 million or 300 million requires almost the exact same sample size. If you don't know your population, leave the field blank (infinite)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Sample Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sample Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between items-end">
                <span>Population Size</span>
                <span className="text-xs text-muted-foreground font-normal">(Leave blank if unknown)</span>
              </label>
              <div className={wrap}><input type="number" value={population} onChange={e => setPopulation(e.target.value)} className={ci} min="0" step="1" placeholder="Infinite" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between items-end">
                <span>Confidence Level</span>
                <span className="text-xs text-muted-foreground font-normal">(Industry standard: 95%)</span>
              </label>
              <div className={wrap}>
                <select value={confidenceLevel} onChange={e => setConfidenceLevel(e.target.value)} className={ci}>
                  <option value="80">80%</option>
                  <option value="85">85%</option>
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="98">98%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between items-end">
                <span>Margin of Error (%)</span>
                <span className="text-xs text-muted-foreground font-normal">(Industry standard: 5%)</span>
              </label>
              <div className={wrap}><input type="number" value={marginOfError} onChange={e => setMarginOfError(e.target.value)} className={ci} min="0.1" max="50" step="0.1" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between items-end">
                <span>Population Proportion (%)</span>
                <span className="text-xs text-muted-foreground font-normal">(Leave at 50% if unknown)</span>
              </label>
              <div className={wrap}><input type="number" value={proportion} onChange={e => setProportion(e.target.value)} className={ci} min="1" max="99" step="1" /></div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result !== null ? (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 text-center">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Required Sample Size</div>
                <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                  {result.toLocaleString()}
                </div>
                <div className="mt-3 text-sm text-muted-foreground font-medium">
                  Respondents / Tests needed
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">What does this mean?</h3>
                <div className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    To achieve a <strong>{confidenceLevel}% confidence level</strong> with a <strong>±{marginOfError}% margin of error</strong> 
                    {population && population !== "0" ? ` for a population of ${parseInt(population).toLocaleString()}` : ` for an infinitely large population`}, 
                    you must successfully survey or test exactly <strong>{result.toLocaleString()}</strong> randomly selected individuals.
                  </p>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Adjusting Your Constraints</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span> 
                    <span><strong>Too many people?</strong> Increase your margin of error (e.g. from 5% to 7%) or decrease your confidence level (e.g. from 95% to 90%) to lower the required sample size.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span> 
                    <span><strong>Need more accuracy?</strong> Decrease your margin of error (e.g. from 5% to 2%). Note that this will exponentially increase the number of people you need to survey.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span> 
                    <span><strong>Response Rate Warning:</strong> If you are sending out email surveys, remember that not everyone will respond. If you expect a 10% response rate, you need to send the survey to { (result * 10).toLocaleString() } people to get {result.toLocaleString()} actual responses.</span>
                  </li>
                </ul>
              </div>

            </>) : (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your inputs. Margin of Error and Proportion must be greater than 0.</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of Statistical Sampling</h2>
            <p>If a polling agency wants to know who will win a presidential election, they do not ask all 160 million registered voters. That would cost billions of dollars and take months. Instead, they ask a few thousand people. How can asking 2,000 people accurately predict the behavior of 160 million people? The answer is <strong>Statistical Sampling</strong>.</p>
            <p>Sampling mathematics proves that if you select a group of people truly at random, the traits of that small group will mirror the traits of the massive population with astonishing accuracy. This calculator uses Cochran's formula to determine exactly how many people you need to test to guarantee that accuracy.</p>

            <h2 className="text-2xl font-bold mb-3">Key Metrics Explained</h2>
            
            <h3>1. Margin of Error</h3>
            <p>No sample is perfectly accurate. The margin of error dictates how much "wiggle room" you are allowing your results to have. If your survey shows 55% of people prefer Brand A over Brand B, and your margin of error is 5%, you can confidently state that the true population preference is somewhere between 50% and 60%.</p>

            <h3>2. Confidence Level</h3>
            <p>Confidence level measures the certainty of your margin of error. A 95% confidence level indicates that if you ran your exact survey 100 different times with 100 different randomly selected groups, 95 of those surveys would yield results within your margin of error. 95% is the standard for business and political polling. 99% is often used for medical and scientific research.</p>

            <h3>3. Population Proportion</h3>
            <p>This is the expected variance in the answers. If you know that 80% of your population is male, the variance is low. If you have no idea what the split will be, you use 50%. A 50% proportion represents maximum variance, which mathematically requires the largest possible sample size. When in doubt, always leave this at 50% to ensure your sample size is large enough to be safe.</p>

            <h2 className="text-2xl font-bold mb-3">The Infinite Population Paradox</h2>
            <p>One of the most counter-intuitive rules of statistics is that once a population is "large enough" (usually over 100,000), the population size no longer matters. To achieve a 5% margin of error at a 95% confidence level, you need to survey exactly 385 people—whether your total population is 100,000 people, 1 million people, or the entire planet Earth. The math stabilizes, which is why national polls rarely survey more than 1,000 respondents.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sample-size-calculator" />
          <PopularCalculators exclude="/calculator/sample-size-calculator" />
        </div>
      </div>
    </>
  );
};
export default SampleSizeCalculator;
