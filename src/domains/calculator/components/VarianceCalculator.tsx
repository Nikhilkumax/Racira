"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function VarianceCalculator() {
  const [inputData, setInputData] = useState("12, 15, 18, 22, 28, 30");
  const [res, setRes] = useState<{
    count: number;
    sum: number;
    mean: number;
    sampleVariance: number;
    populationVariance: number;
    sampleStdDev: number;
    populationStdDev: number;
    steps: { val: number; deviation: number; deviationSq: number }[];
    chartData: { name: string; value: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    // Parse numbers from comma, space, or newline separated string
    const nums = inputData
      .split(/[\s,]+/)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    if (nums.length < 2) return;

    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Deviations and sum of squares
    const steps = nums.map(v => {
      const deviation = v - mean;
      const deviationSq = deviation * deviation;
      return { val: v, deviation, deviationSq };
    });

    const sumSq = steps.reduce((a, b) => a + b.deviationSq, 0);

    const sampleVariance = sumSq / (count - 1);
    const populationVariance = sumSq / count;

    const sampleStdDev = Math.sqrt(sampleVariance);
    const populationStdDev = Math.sqrt(populationVariance);

    const chartData = nums.map((v, i) => ({
      name: `x${i + 1}`,
      value: v,
    }));

    setRes({
      count,
      sum,
      mean,
      sampleVariance,
      populationVariance,
      sampleStdDev,
      populationStdDev,
      steps,
      chartData,
    });
  };

  const reset = () => {
    setInputData("12, 15, 18, 22, 28, 30");
  };

  const faqs = [
    { question: "What is variance?", answer: "Variance measures how far a set of numbers is spread out from their average value. It is the average of the squared differences from the Mean." },
    { question: "What is the difference between sample and population variance?", answer: "Population variance divisor is N (entire dataset size), whereas sample variance divisor is n - 1 (Bessel's correction) to correct for bias when estimating population parameters from samples." },
    { question: "Why are the differences squared?", answer: "Squaring ensures that positive and negative deviations do not cancel each other out, and it gives disproportionately more weight to extreme outliers." },
    { question: "How does variance relate to standard deviation?", answer: "Standard deviation is simply the square root of the variance. It returns the spread statistic back to the original units of measurement." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Variance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Variance & Standard Deviation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Data Set Input</h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="data" className="text-sm font-semibold text-foreground">Enter Numbers (separated by commas, spaces, or newlines)</label>
              <textarea id="data" value={inputData} onChange={e => setInputData(e.target.value)} className="w-full h-32 p-3 text-base rounded-md border border-input bg-transparent outline-none text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" placeholder="10, 20, 30, 40" />
            </div>

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
                  <h2 className="text-2xl font-bold mb-3">Statistical Results</h2>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Sample Variance (s²)</div>
                    <div className="text-3xl font-extrabold text-foreground">{res.sampleVariance.toFixed(4)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Divisor: n - 1</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Population Variance (σ²)</div>
                    <div className="text-3xl font-extrabold text-foreground">{res.populationVariance.toFixed(4)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Divisor: N</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Sample Count (n)", value: res.count },
                        { label: "Sum (Σx)", value: res.sum },
                        { label: "Arithmetic Mean (μ or x̄)", value: res.mean.toFixed(4) },
                        { label: "Sample Std. Deviation (s)", value: res.sampleStdDev.toFixed(4) },
                        { label: "Population Std. Deviation (σ)", value: res.populationStdDev.toFixed(4) },
                      ].map(r => (
                        <tr key={r.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Data Point Deviation Plot</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [`${v}`, "Value"]} />
                        <ReferenceLine y={res.mean} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Mean: ${res.mean.toFixed(2)}`, fill: "#ef4444", fontSize: 10, position: "top" }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}

                <div className="mt-2">
                  <h3 className="text-sm font-bold text-foreground mb-2">Step-by-Step Deviations (First 10)</h3>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg text-xs font-mono">
                    <table className="w-full text-left">
                      <thead className="bg-secondary sticky top-0">
                        <tr className="border-b border-border">
                          <th className="p-2">Value (x)</th>
                          <th className="p-2">Deviation (x - x̄)</th>
                          <th className="p-2">Squared Deviation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {res.steps.slice(0, 10).map((st, i) => (
                          <tr key={i} className="hover:bg-secondary/20">
                            <td className="p-2 text-foreground">{st.val}</td>
                            <td className="p-2 text-muted-foreground">{st.deviation >= 0 ? "+" : ""}{st.deviation.toFixed(4)}</td>
                            <td className="p-2 text-foreground">{st.deviationSq.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Variance and standard deviation</h2>
            <p>Variance measures structural spread within data sets. It calculates the expectation of squared deviations from the arithmetic mean, giving analysts a mathematically solid index of dispersion. Standard deviation is simply the square root of the variance, converting the value back into the original units of measurement.</p>
            <p>Sample variance utilizes Bessel's correction, dividing the sum of squares by $n - 1$ instead of $n$. This accounts for degrees of freedom lost during mean estimation and ensures the sample variance remains an unbiased estimator of true population parameters.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/variance-calculator" />
          <PopularCalculators exclude="/calculator/variance-calculator" />
        </div>
      </div>
    </>
  );
}
