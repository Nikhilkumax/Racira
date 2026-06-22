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

// Critical Z values lookup
const Z_CRITICALS: Record<string, number> = {
  "80": 1.2816,
  "85": 1.4395,
  "90": 1.6449,
  "95": 1.9600,
  "98": 2.3263,
  "99": 2.5758,
};

export default function ConfidenceIntervalCalculator() {
  const [type, setType] = useState<"mean" | "proportion">("mean");
  const [sampleMean, setSampleMean] = useState("100");
  const [sampleStdDev, setSampleStdDev] = useState("15");
  const [sampleSize, setSampleSize] = useState("100");
  const [propVal, setPropVal] = useState("0.6");
  const [confLevel, setConfLevel] = useState("95");

  const [res, setRes] = useState<{
    lowerBound: number;
    upperBound: number;
    marginOfError: number;
    stdError: number;
    zCritical: number;
    chartData: { name: string; min: number; max: number; mid: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const n = parseFloat(sampleSize) || 30;
    const cl = Z_CRITICALS[confLevel] || 1.96;

    if (n <= 0) return;

    let stdError = 0;
    let marginOfError = 0;
    let lowerBound = 0;
    let upperBound = 0;
    let midPoint = 0;

    if (type === "mean") {
      const mean = parseFloat(sampleMean) || 0;
      const sd = parseFloat(sampleStdDev) || 0;
      midPoint = mean;
      stdError = sd / Math.sqrt(n);
      marginOfError = cl * stdError;
      lowerBound = mean - marginOfError;
      upperBound = mean + marginOfError;
    } else {
      const p = parseFloat(propVal) || 0.5;
      midPoint = p;
      if (p < 0 || p > 1) return;
      stdError = Math.sqrt((p * (1 - p)) / n);
      marginOfError = cl * stdError;
      lowerBound = Math.max(0, p - marginOfError);
      upperBound = Math.min(1, p + marginOfError);
    }

    const chartData = [{
      name: type === "mean" ? "Sample Mean Interval" : "Sample Proportion Interval",
      min: parseFloat(lowerBound.toFixed(4)),
      max: parseFloat(upperBound.toFixed(4)),
      mid: parseFloat(midPoint.toFixed(4)),
    }];

    setRes({
      lowerBound,
      upperBound,
      marginOfError,
      stdError,
      zCritical: cl,
      chartData,
    });
  };

  const reset = () => {
    setType("mean");
    setSampleMean("100");
    setSampleStdDev("15");
    setSampleSize("100");
    setPropVal("0.6");
    setConfLevel("95");
  };

  const faqs = [
    { question: "What is a confidence interval?", answer: "A confidence interval is a range of values, derived from sample statistics, that is likely to contain the true value of an unknown population parameter." },
    { question: "What does the 95% confidence level mean?", answer: "It means that if we repeat the sampling process many times, approximately 95% of the calculated intervals will contain the true population parameter." },
    { question: "How does sample size affect confidence intervals?", answer: "Larger sample sizes reduce the standard error, which decreases the margin of error and narrows the width of the confidence interval." },
    { question: "When should I use proportion instead of mean?", answer: "Use mean for continuous quantitative data (e.g. height, revenue). Use proportion for binary qualitative survey outcomes (e.g. Yes/No votes, conversion rates)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Confidence Interval Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Confidence Interval Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Interval Settings</h2>
            <div className="flex gap-2">
              {(["mean", "proportion"] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${type === t ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{t === "mean" ? "Mean (Numeric)" : "Proportion (%)"}</button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Confidence Level (1-α)</label>
              <select value={confLevel} onChange={e => setConfLevel(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="80">80% Confidence</option>
                <option value="85">85% Confidence</option>
                <option value="90">90% Confidence</option>
                <option value="95">95% Confidence</option>
                <option value="98">98% Confidence</option>
                <option value="99">99% Confidence</option>
              </select>
            </div>

            {type === "mean" ? (
              <>
                <CompactInput id="mean" label="Sample Mean (x̄)" value={sampleMean} onChange={setSampleMean} />
                <CompactInput id="stddev" label="Sample Std. Deviation (s)" value={sampleStdDev} onChange={setSampleStdDev} min="0.0001" />
              </>
            ) : (
              <CompactInput id="prop" label="Sample Proportion (p)" value={propVal} onChange={setPropVal} min="0" max="1" step="0.01" />
            )}

            <CompactInput id="n" label="Sample Size (n)" value={sampleSize} onChange={setSampleSize} min="1" step="1" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Interval
              </button>
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
                  <h2 className="text-lg font-bold text-foreground">Interval Limits</h2>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{confLevel}% Confidence Interval Range</div>
                  <div className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
                    [{res.lowerBound.toFixed(4)} , {res.upperBound.toFixed(4)}]
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    Margin of Error: ±{res.marginOfError.toFixed(4)}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Statistical Boundary</th><th className="p-2.5 pr-3 text-right">Calculated Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Lower Bound Limit", value: res.lowerBound.toFixed(4), bold: true },
                        { label: "Upper Bound Limit", value: res.upperBound.toFixed(4), bold: true },
                        { label: "Margin of Error (E)", value: `±${res.marginOfError.toFixed(4)}` },
                        { label: "Standard Error (SE)", value: res.stdError.toFixed(4) },
                        { label: "Critical Z-Value (z*)", value: res.zCritical.toFixed(4) },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Confidence Interval Boundary Span</h3>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart layout="vertical" data={res.chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[res.lowerBound - res.marginOfError, res.upperBound + res.marginOfError]} />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [`${v}`, "Value"]} />
                        <Bar dataKey="mid" fill="hsl(var(--primary))" name="Point Estimate" radius={[0, 4, 4, 0]} />
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Confidence Intervals and Margins of Error</h2>
            <p>Confidence intervals are vital to statistical inference. They provide a range of values likely to contain the true population parameter rather than a single point estimate. The width of the interval is determined by sample standard deviation, sample size, and confidence level choice.</p>
            <p>Using critical value multipliers derived from normal probability distributions ($z^*$), the margin of error bounds standard error on both sides of the sample statistic, indicating uncertainty boundary thresholds.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/confidence-interval-calculator" />
          <PopularCalculators exclude="/calculator/confidence-interval-calculator" />
        </div>
      </div>
    </>
  );
}
