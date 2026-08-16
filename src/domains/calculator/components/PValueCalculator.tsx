"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// Standard normal cumulative distribution function
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Student's T distribution approximation (for p-value)
function tCdf(t: number, df: number): number {
  // Simple approximation for T distribution CDF
  const x = t;
  const g = df / 2;
  const a = 1 / (1 + x * x / df);
  
  // Numerical approximation
  let p = 0;
  if (df === 1) {
    p = 0.5 + Math.atan(x) / Math.PI;
  } else {
    // Normal approximation for large df, or polynomial for low df
    const z = x * (1 - 1 / (4 * df)) / Math.sqrt(1 + x * x / (2 * df));
    p = normalCdf(z);
  }
  return p;
}

// Chi-square distribution approximation (for p-value)
function chiSquareCdf(chi: number, df: number): number {
  if (chi < 0) return 0;
  // Wilson-Hilferty transformation of chi-square to normal distribution
  const term1 = chi / df;
  const term2 = 2 / (9 * df);
  const z = (Math.pow(term1, 1/3) - (1 - term2)) / Math.sqrt(term2);
  return normalCdf(z);
}

export default function PValueCalculator() {
  const [testType, setTestType] = useState<"z" | "t" | "chi">("z");
  const [statVal, setStatVal] = useState("1.96");
  const [df, setDf] = useState("10");
  const [tailType, setTailType] = useState<"two" | "right" | "left">("two");
  const [alpha, setAlpha] = useState("0.05");

  const [res, setRes] = useState<{
    pValue: number;
    decision: string;
    isSignificant: boolean;
    chartData: { name: string; value: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const val = parseFloat(statVal) || 0;
    const degF = parseFloat(df) || 1;
    const a = parseFloat(alpha) || 0.05;

    let pValue = 0.5;

    if (testType === "z") {
      const pLess = normalCdf(val);
      if (tailType === "left") {
        pValue = pLess;
      } else if (tailType === "right") {
        pValue = 1 - pLess;
      } else {
        pValue = 2 * Math.min(pLess, 1 - pLess);
      }
    } else if (testType === "t") {
      const pLess = tCdf(val, degF);
      if (tailType === "left") {
        pValue = pLess;
      } else if (tailType === "right") {
        pValue = 1 - pLess;
      } else {
        pValue = 2 * Math.min(pLess, 1 - pLess);
      }
    } else if (testType === "chi") {
      // Chi-square test is typically one-tailed (right-tail)
      const pLess = chiSquareCdf(val, degF);
      pValue = 1 - pLess;
    }

    pValue = Math.min(1, Math.max(0, pValue));

    const isSignificant = pValue < a;
    const decision = isSignificant
      ? `Reject the null hypothesis (H₀) at α = ${a}. The result is statistically significant.`
      : `Fail to reject the null hypothesis (H₀) at α = ${a}. There is insufficient evidence of statistical significance.`;

    const chartData = [
      { name: "P-Value", value: parseFloat(pValue.toFixed(4)) },
      { name: "Significance (α)", value: a },
    ];

    setRes({
      pValue,
      decision,
      isSignificant,
      chartData,
    });
  };

  const reset = () => {
    setTestType("z");
    setStatVal("1.96");
    setDf("10");
    setTailType("two");
    setAlpha("0.05");
  };

  const faqs = [
    { question: "What is a P-value?", answer: "A P-value is the probability of obtaining test results at least as extreme as the results actually observed, under the assumption that the null hypothesis is correct." },
    { question: "How do I choose between Z, T, and Chi-Square?", answer: "Use Z-tests for large samples when population variance is known. Use T-tests for smaller sample sizes or unknown population variance. Use Chi-Square for categorical counts and contingency table analyses." },
    { question: "What does α (alpha) represent?", answer: "Alpha is the significance level, representing the probability of making a Type I error (rejecting a true null hypothesis). The standard setting is 0.05 (5%)." },
    { question: "Does a low p-value prove the alternative hypothesis is true?", answer: "No, a low p-value simply indicates that the observed data is highly improbable under the null hypothesis, supporting rejection of the null." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "P Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">P-Value Hypothesis Testing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Hypothesis Test Setup</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Test Statistic Distribution</label>
              <select value={testType} onChange={e => { const v = e.target.value as any; setTestType(v); if (v === "chi") setTailType("right"); }} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="z">Z-Statistic (Normal Distribution)</option>
                <option value="t">T-Statistic (Student's T)</option>
                <option value="chi">Chi-Square (χ²)</option>
              </select>
            </div>

            <CompactInput id="stat" label="Test Statistic (Z, T, or χ² value)" value={statVal} onChange={setStatVal} step="any" />
            
            {(testType === "t" || testType === "chi") && (
              <CompactInput id="df" label="Degrees of Freedom (df)" value={df} onChange={setDf} min="1" step="1" />
            )}

            {testType !== "chi" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Hypothesis Tail Direction</label>
                <select value={tailType} onChange={e => setTailType(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="two">Two-Tailed Test (H₁: μ ≠ μ₀)</option>
                  <option value="right">Right-Tailed Test (H₁: μ &gt; μ₀)</option>
                  <option value="left">Left-Tailed Test (H₁: μ &lt; μ₀)</option>
                </select>
              </div>
            )}

            <CompactInput id="alpha" label="Significance Level (α)" value={alpha} onChange={setAlpha} step="0.01" min="0.001" max="0.5" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Significance Report</h2>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                
                <div className={`bg-primary/10 border-l-4 border rounded-xl p-5 text-center ${res.isSignificant ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 bg-gradient-to-br" : "from-amber-500/10 to-amber-500/5 border-amber-500/20 bg-gradient-to-br"}`}>
                  <div className="text-[13px] font-bold mb-1 uppercase tracking-wider text-muted-foreground">Calculated P-Value</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.pValue.toFixed(6)}</div>
                  <div className={`text-xs font-bold ${res.isSignificant ? "text-emerald-600" : "text-amber-600"}`}>
                    {res.isSignificant ? "Statistically Significant" : "Not Statistically Significant"}
                  </div>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg text-sm text-foreground leading-relaxed border border-border/50">
                  <span className="font-semibold text-muted-foreground">Decision: </span>
                  <span className="font-bold text-foreground">{res.decision}</span>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">P-Value vs. Significance Threshold</h3>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart layout="vertical" data={res.chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, Math.max(0.1, res.pValue * 1.2)]} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [`${v}`, "Value"]} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mechanics of Statistical Significance</h2>
            <p>In the realm of scientific research, medicine, and data analytics, it is impossible to prove anything with absolute 100% certainty due to the inherent randomness of the universe. Instead, statisticians rely on Hypothesis Testing to determine if a specific observation is a real, repeatable phenomenon, or merely a fluke. The mathematical engine driving this decision-making process is the <strong>P-value</strong>.</p>
            <p>P-values quantify the exact strength of evidence against the "Null Hypothesis" (H₀). The Null Hypothesis is the baseline assumption that nothing interesting is happening—that there is no difference, no effect, or no relationship between the variables being tested. For example, if you are testing a new blood pressure medication, the Null Hypothesis states that the new drug is no better than a sugar pill.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting the P-Value</h2>
            <p>A P-value is a probability score ranging from 0 to 1. Specifically, it measures the likelihood of observing your specific sample data (or something even more extreme) if you assume the Null Hypothesis is completely true. Because it is a probability, you can think of it as a percentage.</p>
            <ul>
              <li><strong>A High P-Value (e.g., 0.40):</strong> This means there is a 40% chance of seeing your data just through random noise, even if the medication does absolutely nothing. Because this probability is high, you do not have enough evidence to claim the drug works. You "fail to reject" the Null Hypothesis.</li>
              <li><strong>A Low P-Value (e.g., 0.01):</strong> This means there is only a 1% chance of seeing your data if the medication was truly useless. Because it is highly improbable that random chance produced these results, you have strong statistical evidence to "reject" the Null Hypothesis and conclude that the drug actually has an effect.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Alpha Threshold (α)</h2>
            <p>To prevent subjective bias in interpreting what is "high" or "low," researchers must set a strict cutoff point before the experiment begins. This cutoff is called the Significance Level, denoted by the Greek letter Alpha (α). In the vast majority of scientific literature, the standard Alpha is set at 0.05. This means researchers are willing to accept a 5% risk of a "False Positive" (concluding an effect exists when it actually doesn't).</p>
            <p>If your calculated P-value is less than your chosen Alpha (e.g., P &lt; 0.05), your result is declared <strong>Statistically Significant</strong>. In fields requiring extreme precision, like particle physics (e.g., the discovery of the Higgs Boson), the Alpha threshold is set vastly lower, often at 0.0000003 (the "Five Sigma" standard).</p>

            <h2 className="text-2xl font-bold mb-3">Distributions and Test Statistics</h2>
            <p>Calculating the P-value requires converting your raw data into a standardized Test Statistic, which is then mapped against a known probability distribution curve. The type of distribution depends on your data:</p>
            <ul>
              <li><strong>Z-Distribution (Normal):</strong> Used when you have a very large sample size (typically n &gt; 30) and the true population variance is known.</li>
              <li><strong>T-Distribution (Student's T):</strong> Used for smaller sample sizes. The T-distribution has "fatter tails" than the normal distribution, which mathematically accounts for the increased uncertainty of relying on a small sample. As the sample size increases (represented by Degrees of Freedom), the T-distribution morphs to become identical to the Z-distribution.</li>
              <li><strong>Chi-Square (χ²) Distribution:</strong> Used almost exclusively for analyzing categorical counts and frequencies in contingency tables to determine if variables are independent.</li>
            </ul>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/p-value-calculator" />
          <PopularCalculators exclude="/calculator/p-value-calculator" />
        </div>
      </div>
    </>
  );
}
