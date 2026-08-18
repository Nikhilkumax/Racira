"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const DEFAULTS = { experimental: "9.8", theoretical: "10.0" };

export default function PercentErrorCalculator() {
  const [experimental, setExperimental] = useState(DEFAULTS.experimental);
  const [theoretical, setTheoretical] = useState(DEFAULTS.theoretical);
  const [calculated, setCalculated] = useState(false);

  const e = parseFloat(experimental);
  const t = parseFloat(theoretical);
  const valid = !isNaN(e) && !isNaN(t) && t !== 0;

  const absError = valid ? Math.abs(e - t) : 0;
  const signedError = valid ? e - t : 0;
  const pctError = valid ? (absError / Math.abs(t)) * 100 : 0;
  const signedPct = valid ? (signedError / Math.abs(t)) * 100 : 0;
  const accuracy = valid ? Math.max(0, 100 - pctError) : 0;

  const chartData = valid ? [
    { name: "Theoretical", value: t, fill: "hsl(var(--primary))" },
    { name: "Experimental", value: e, fill: Math.abs(signedPct) <= 5 ? "#10b981" : "#f59e0b" },
  ] : [];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setExperimental(DEFAULTS.experimental); setTheoretical(DEFAULTS.theoretical); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is percent error?", answer: "It measures how far a measured or experimental value sits from the accepted or theoretical value, as a percentage of the theoretical value: |experimental − theoretical| ÷ |theoretical| × 100. It is the standard accuracy metric in physics and chemistry labs." },
    { question: "What is the difference between signed and absolute error?", answer: "Absolute percent error reports only magnitude — how far off you were. The signed version keeps the direction: negative means your measurement came in low, positive means it came in high. Direction is useful for spotting systematic bias, like a consistently under-reading instrument." },
    { question: "What is a 'good' percent error?", answer: "In a well-controlled physics lab, under 5% is typically acceptable, and under 1% is excellent. In chemistry, percent yield above 90% is considered high. Context matters — biology and field measurements routinely tolerate far more." },
    { question: "Can percent error exceed 100%?", answer: "Yes. If the experimental value is more than double the theoretical value (or in the opposite sign), the absolute percent error exceeds 100%. It simply means the measurement was wildly off." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Percent Error Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Percent Error Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Experimental value</label>
              <input type="number" value={experimental} onChange={e => setExperimental(e.target.value)} className={inp} placeholder="9.8" />
            </div>
            <div>
              <label className={lbl}>Theoretical value (accepted)</label>
              <input type="number" value={theoretical} onChange={e => setTheoretical(e.target.value)} className={inp} placeholder="10.0" />
            </div>
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Theoretical value must be a non-zero number.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Percent Error</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(pctError)}%</div>
                <div className="text-sm text-muted-foreground mt-1">|{fmt(e)} − {fmt(t)}| ÷ |{fmt(t)}| × 100</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Signed error", `${signedPct >= 0 ? "+" : ""}${fmt(signedPct)}%`, signedPct >= 0 ? "measured high" : "measured low"], ["Absolute error", fmt(absError), "units off"], ["Accuracy", `${fmt(accuracy)}%`, "100% − |error|"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Values Compared</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(Number(v)), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The gap between the bars is your absolute error of {fmt(absError)} units</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Calculation Detail</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Experimental:</span><span className="font-semibold">{fmt(e)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Theoretical:</span><span className="font-semibold">{fmt(t)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Difference (signed):</span><span className="font-semibold">{signedError >= 0 ? "+" : ""}{fmt(signedError)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Absolute difference:</span><span className="font-semibold">{fmt(absError)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Percent error:</span><span className="font-semibold">{fmt(pctError)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Verdict:</span><span className="font-semibold">{pctError <= 5 ? "Within 5% — good accuracy" : pctError <= 20 ? "Moderate deviation" : "Large deviation — check method"}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Error, Quantified</h2>
            <p>Percent error turns "close enough" into a number you can grade against. This <strong>percent error calculator</strong> computes both the magnitude of the deviation and its direction, so a lab report can say exactly how far a measurement landed from the accepted value.</p>
            <h2 className="text-2xl font-bold mb-3">Signed Error Finds Bias</h2>
            <p>If every measurement comes out low, random error is not the culprit — something is systematically off, like a mis-calibrated scale or a timing method that starts late. The signed percent error makes that pattern visible instead of burying it in absolute values.</p>
            <h2 className="text-2xl font-bold mb-3">Putting It in Context</h2>
            <p>There is no universal threshold: a 2% error is a great pendulum experiment and a terrible analytical chemistry result. Report the percent error alongside the method's expected precision, and use the verdict readout here as a first-pass sanity check.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percent-error-calculator" />
          <PopularCalculators exclude="/calculator/percent-error-calculator" />
        </div>
      </div>
    </>
  );
}
