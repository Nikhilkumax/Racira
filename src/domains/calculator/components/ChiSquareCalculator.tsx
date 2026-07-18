"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Standard normal cumulative distribution function
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Chi-square distribution approximation (for p-value)
function chiSquareCdf(chi: number, df: number): number {
  if (chi < 0) return 0;
  const term1 = chi / df;
  const term2 = 2 / (9 * df);
  const z = (Math.pow(term1, 1/3) - (1 - term2)) / Math.sqrt(term2);
  return normalCdf(z);
}

export default function ChiSquareCalculator() {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  
  // Matrix for Observed values (up to 3x3 for safety/simplicity in layout)
  const [matrix, setMatrix] = useState<string[][]>([
    ["50", "30"],
    ["20", "40"],
  ]);

  const [res, setRes] = useState<{
    chiSquare: number;
    df: number;
    pValue: number;
    expected: number[][];
    isSignificant: boolean;
    chartData: { name: string; Observed: number; Expected: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  // Adjust matrix size
  const updateMatrixSize = (r: number, c: number) => {
    setRows(r);
    setCols(c);
    const newMatrix = Array(r).fill(null).map((_, ri) => {
      return Array(c).fill(null).map((_, ci) => {
        return (matrix[ri] && matrix[ri][ci]) || "10";
      });
    });
    setMatrix(newMatrix);
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const next = [...matrix];
    next[rIdx] = [...next[rIdx]];
    next[rIdx][cIdx] = val;
    setMatrix(next);
  };

  const calc = () => {
    const obs = matrix.map(r => r.map(v => parseFloat(v) || 0));
    const rTotals = obs.map(r => r.reduce((a, b) => a + b, 0));
    const cTotals = Array(cols).fill(0).map((_, ci) => obs.reduce((sum, r) => sum + r[ci], 0));
    const grandTotal = rTotals.reduce((a, b) => a + b, 0);

    if (grandTotal <= 0) return;

    // Expected frequencies
    const expected = obs.map((r, ri) => r.map((_, ci) => {
      return (rTotals[ri] * cTotals[ci]) / grandTotal;
    }));

    // Chi-Square calculation
    let chiSquare = 0;
    const chartData: { name: string; Observed: number; Expected: number }[] = [];

    obs.forEach((r, ri) => {
      r.forEach((o, ci) => {
        const e = expected[ri][ci];
        if (e > 0) {
          chiSquare += ((o - e) * (o - e)) / e;
        }
        chartData.push({
          name: `R${ri + 1}C${ci + 1}`,
          Observed: o,
          Expected: parseFloat(e.toFixed(2)),
        });
      });
    });

    const df = (rows - 1) * (cols - 1);
    const pValue = 1 - chiSquareCdf(chiSquare, df);

    setRes({
      chiSquare,
      df,
      pValue,
      expected,
      isSignificant: pValue < 0.05,
      chartData,
    });
  };

  const reset = () => {
    setRows(2);
    setCols(2);
    setMatrix([
      ["50", "30"],
      ["20", "40"],
    ]);
  };

  const faqs = [
    { question: "What is the Chi-Square Test of Independence?", answer: "The Chi-Square test evaluates whether there is a statistically significant association between two categorical variables." },
    { question: "What are observed vs. expected frequencies?", answer: "Observed frequencies are the actual counts recorded in your sample dataset. Expected frequencies are the calculated counts that would be present if the null hypothesis of independence were true." },
    { question: "What represents a statistically significant result?", answer: "Typically, a P-value below 0.05 indicates statistical significance, meaning there is less than a 5% probability that the observed association occurred by chance." },
    { question: "What are the limitations of the Chi-Square test?", answer: "The test requires that each cell has an expected frequency of 5 or more for the normal distribution approximation to remain valid." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Chi-Square Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Chi-Square (χ²) Test of Independence Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Contingency Matrix Setup</h2>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Rows</label>
                <select value={rows} onChange={e => updateMatrixSize(Number(e.target.value), cols)} className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground outline-none">
                  <option value={2}>2 Rows</option>
                  <option value={3}>3 Rows</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Columns</label>
                <select value={cols} onChange={e => updateMatrixSize(rows, Number(e.target.value))} className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground outline-none">
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-foreground">Observed Counts (O)</label>
              <div className="grid gap-2 border border-border/80 p-3 rounded-lg bg-secondary/20" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {matrix.map((row, rIdx) => (
                  row.map((cell, cIdx) => (
                    <input key={`${rIdx}-${cIdx}`} type="number" value={cell} onChange={e => handleCellChange(rIdx, cIdx, e.target.value)} className="h-10 px-2 text-center rounded border border-input bg-background text-foreground text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  ))
                ))}
              </div>
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
                  <h2 className="text-2xl font-bold mb-3">Statistical Significance Report</h2>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Chi-Square (χ²)</div>
                    <div className="text-2xl font-extrabold text-foreground">{res.chiSquare.toFixed(4)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/25 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Degrees of Freedom</div>
                    <div className="text-2xl font-extrabold text-foreground">{res.df}</div>
                  </div>
                  <div className={`bg-gradient-to-br border rounded-xl p-3 text-center ${res.isSignificant ? "from-emerald-500/15 to-emerald-500/10 border-emerald-500/20" : "from-amber-500/15 to-amber-500/10 border-amber-500/20"}`}>
                    <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">P-Value</div>
                    <div className="text-2xl font-extrabold text-foreground">{res.pValue.toFixed(6)}</div>
                  </div>
                </div>

                <div className="mt-2 border border-border rounded-lg p-3 bg-secondary/30">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Null Hypothesis Decision (α = 0.05)</div>
                  <div className="text-sm font-semibold text-foreground">
                    {res.isSignificant
                      ? "Reject Null Hypothesis: There is a statistically significant association between variables."
                      : "Fail to Reject Null: The variables are independent (no significant association)."}
                  </div>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Observed vs. Expected Frequencies</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Observed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expected" fill="hsl(var(--muted-foreground) / 0.5)" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Understanding the Chi-Square (χ²) Test of Independence</h2>
            <p>The Chi-Square test of independence is one of the most fundamental statistical methods used to determine whether there is a significant association between two categorical variables in a single population. In statistical terms, categorical data refers to variables that can be grouped into distinct categories without an inherent numerical order, such as gender, blood type, product preference, or geographic region.</p>
            <p>For example, a market researcher might want to know if there is a relationship between a person's age group (Categorical Variable 1: Under 30, 30-50, Over 50) and their preferred streaming service (Categorical Variable 2: Netflix, Hulu, Disney+). The Chi-Square test mathematically evaluates the survey data to tell the researcher whether age and streaming preference are completely independent (unrelated) or if they are structurally associated.</p>

            <h2 className="text-2xl font-bold mb-3">Observed vs. Expected Frequencies</h2>
            <p>The core logic of the Chi-Square test revolves around comparing two sets of numbers: the <strong>Observed Frequencies</strong> and the <strong>Expected Frequencies</strong>.</p>
            <ul>
              <li><strong>Observed Frequencies (O):</strong> This is the actual raw data you collected. If you surveyed 100 people and found that 40 people under 30 prefer Netflix, 40 is your observed frequency for that specific cross-section (or "cell" in the contingency table).</li>
              <li><strong>Expected Frequencies (E):</strong> These are the hypothetical numbers you would expect to see if there was absolutely no relationship between the two variables. The expected frequency for any cell is calculated by multiplying its row total by its column total, and then dividing by the grand total of the entire sample.</li>
            </ul>
            <p>The test formula calculates the squared difference between the observed and expected counts, divided by the expected counts, across every cell in the table: <em>χ² = Σ [ (O - E)² / E ]</em>. If the observed numbers are very close to the expected numbers, the χ² value will be small, suggesting the variables are independent. If there is a massive difference, the χ² value will be large, indicating a strong association.</p>

            <h2 className="text-2xl font-bold mb-3">Degrees of Freedom and the P-Value</h2>
            <p>Once the raw Chi-Square statistic is calculated, it must be contextualized using the <strong>Degrees of Freedom (df)</strong>. The degrees of freedom represent the number of values in the final calculation that are free to vary. For a contingency table, it is calculated as: <em>df = (Number of Rows - 1) × (Number of Columns - 1)</em>.</p>
            <p>Using the χ² statistic and the degrees of freedom, we calculate the <strong>P-value</strong>. The P-value tells us the probability of obtaining our observed data (or data more extreme) if the null hypothesis (that the variables are entirely independent) is true. In most scientific research, an alpha level (α) of 0.05 is used as the threshold. If the P-value is less than 0.05, we reject the null hypothesis and conclude that a statistically significant relationship exists between the variables.</p>
            
            <h2 className="text-2xl font-bold mb-3">Limitations and Assumptions</h2>
            <p>While powerful, the Chi-Square test has strict limitations. It can only be used with categorical data (counts/frequencies), not continuous data (like exact height or income). The test assumes random sampling and mutually exclusive categories. Most importantly, the test becomes unreliable if the sample size is too small; a general statistical rule of thumb requires that at least 80% of the expected frequencies in the matrix must be 5 or greater, and no expected frequency can be exactly zero. If your sample violates this assumption, alternative tests like Fisher's Exact Test must be used instead.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/chi-square-calculator" />
          <PopularCalculators exclude="/calculator/chi-square-calculator" />
        </div>
      </div>
    </>
  );
}
