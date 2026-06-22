"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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

export default function RuleOf72Calculator() {
  const [mode, setMode] = useState<"rate" | "years">("rate");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("9");
  const [res, setRes] = useState<{ result: number; rule69: number; rule70: number; exact: number; chartData: { rate: number; r72: number; exact: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    if (mode === "rate") {
      const r = parseFloat(rate) || 0;
      const result = r > 0 ? 72 / r : 0;
      const rule69 = r > 0 ? 69.3 / r : 0;
      const rule70 = r > 0 ? 70 / r : 0;
      const exact = r > 0 ? Math.log(2) / Math.log(1 + r / 100) : 0;
      const chartData = Array.from({ length: 30 }, (_, i) => {
        const r2 = i + 1;
        return { rate: r2, r72: +(72 / r2).toFixed(2), exact: +(Math.log(2) / Math.log(1 + r2 / 100)).toFixed(2) };
      });
      setRes({ result, rule69, rule70, exact, chartData });
    } else {
      const t = parseFloat(years) || 0;
      const result = t > 0 ? 72 / t : 0;
      const rule69 = t > 0 ? 69.3 / t : 0;
      const rule70 = t > 0 ? 70 / t : 0;
      const exact = t > 0 ? (Math.pow(2, 1 / t) - 1) * 100 : 0;
      const chartData = Array.from({ length: 30 }, (_, i) => {
        const r2 = i + 1;
        return { rate: r2, r72: +(72 / r2).toFixed(2), exact: +(Math.log(2) / Math.log(1 + r2 / 100)).toFixed(2) };
      });
      setRes({ result, rule69, rule70, exact, chartData });
    }
  };

  const reset = () => { setMode("rate"); setRate("8"); setYears("9"); };

  const faqs = [
    { question: "What is the Rule of 72?", answer: "The Rule of 72 is a simple mathematical shortcut to estimate how long it takes for an investment to double in value, given a fixed annual rate of return. Divide 72 by the annual interest rate: if you earn 8% per year, your money doubles in 72 ÷ 8 = 9 years. It works with any compounding investment — stocks, bonds, savings accounts, or even debt." },
    { question: "Why is the number 72 used?", answer: "72 is used because it's divisible by many common interest rates (1, 2, 3, 4, 6, 8, 9, 12, 24, 36) and gives a close approximation to the mathematically exact doubling time. The exact formula is: Years = ln(2) / ln(1 + r) = 0.6931 / r (for small r). Multiplying by 100 gives the Rule of 69.3. However, 72 is more convenient and still very accurate for rates between 6% and 10%." },
    { question: "Is the Rule of 72 exact?", answer: "No, it's an approximation. For an 8% return: Rule of 72 gives 9.0 years; exact answer is 9.006 years — essentially perfect. For 6%: Rule of 72 gives 12 years; exact is 11.9 years. The rule becomes less accurate at extreme rates: at 2%, it says 36 years (exact: 35.0); at 25%, it says 2.88 years (exact: 3.11). For most practical purposes between 4–20%, it's highly accurate." },
    { question: "How can I use the Rule of 72 for debt?", answer: "The Rule of 72 also applies to debt growth. Credit card debt at 18% APR doubles in 72 ÷ 18 = 4 years. If you carry a $5,000 balance without making payments, it becomes $10,000 in 4 years, $20,000 in 8 years, $40,000 in 12 years. This sobering calculation is one of the strongest arguments for paying off high-interest debt aggressively." },
    { question: "What about the Rule of 69.3 and Rule of 70?", answer: "The Rule of 69.3 is more mathematically precise (since ln(2) ≈ 0.693). The Rule of 70 is a good compromise — more accurate than 72 for lower rates but less convenient for mental math. The Rule of 72 remains most popular because 72 has more divisors (making mental division easier) and it slightly overcorrects for the compounding effect, keeping it accurate for typical investment rates." },
    { question: "Can I use the Rule of 72 in reverse?", answer: "Yes! If you want to double your money in a specific number of years, divide 72 by the years to find the required rate. To double in 6 years: 72 ÷ 6 = 12% annual return needed. To double in 10 years: 72 ÷ 10 = 7.2% required. This is useful for setting investment goals and evaluating whether a target return is realistic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Rule of 72 Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rule of 72 Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Calculate Doubling Time</h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">I want to find...</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["rate", "years"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {m === "rate" ? "Doubling Time (Years)" : "Required Rate (%)"}
                  </button>
                ))}
              </div>
            </div>
            {mode === "rate"
              ? <CompactInput id="rate" label="Annual Interest / Return Rate" value={rate} onChange={setRate} suffix="%" />
              : <CompactInput id="years" label="Target Doubling Time" value={years} onChange={setYears} suffix="years" />
            }
            {/* Quick rate buttons */}
            {mode === "rate" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Common Rates</span>
                <div className="flex flex-wrap gap-1.5">
                  {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25].map(r => (
                    <button key={r} type="button" onClick={() => setRate(String(r))} className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${rate === String(r) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary text-muted-foreground"}`}>{r}%</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
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
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                    {mode === "rate" ? "Years to Double" : "Required Annual Rate"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {mode === "rate" ? `${res.result.toFixed(2)} years` : `${res.result.toFixed(2)}%`}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Exact answer: {mode === "rate" ? `${res.exact.toFixed(3)} years` : `${res.exact.toFixed(3)}%`}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Method</th>
                      <th className="p-2.5 pr-3 text-right">{mode === "rate" ? "Years to Double" : "Required Rate"}</th>
                      <th className="p-2.5 pr-3 text-right">Error vs Exact</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Rule of 72", value: res.result },
                        { label: "Rule of 70", value: res.rule70 },
                        { label: "Rule of 69.3", value: res.rule69 },
                        { label: "Exact (ln 2)", value: res.exact, isExact: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.isExact ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{mode === "rate" ? `${r.value.toFixed(3)} yrs` : `${r.value.toFixed(3)}%`}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{r.isExact ? "—" : `${((r.value - res.exact) / res.exact * 100).toFixed(2)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Rule of 72 vs Exact Doubling Time by Rate</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="rate" tick={{ fontSize: 10 }} label={{ value: "Rate (%)", position: "insideBottom", offset: -2, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} label={{ value: "Years", angle: -90, position: "insideLeft", fontSize: 10 }} />
                        <Tooltip labelFormatter={l => `${l}% rate`} formatter={(v: any, n: string) => [`${v} years`, n === "r72" ? "Rule of 72" : "Exact"]} />
                        <ReferenceLine x={parseFloat(mode === "rate" ? rate : "8")} stroke="#f59e0b" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="r72" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Rule of 72" />
                        <Line type="monotone" dataKey="exact" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Exact" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: mode === "rate" ? "At Rate" : "In Years", value: mode === "rate" ? `${rate}%` : `${years} yrs` },
                    { label: "Rule of 72", value: mode === "rate" ? `${res.result.toFixed(2)} yrs` : `${res.result.toFixed(2)}%` },
                    { label: "Exact Answer", value: mode === "rate" ? `${res.exact.toFixed(3)} yrs` : `${res.exact.toFixed(3)}%` },
                    { label: "Accuracy", value: `${(100 - Math.abs((res.result - res.exact) / res.exact * 100)).toFixed(2)}%` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Rule of 72?</h2>
            <p>The Rule of 72 is one of the most useful mental shortcuts in personal finance and investing. It provides a quick, accurate estimate of how long it takes for an investment to double in value, given a fixed annual rate of return. Simply divide 72 by the annual interest rate percentage, and the result is the approximate number of years to double your money.</p>
            <p>For example: at 8% annual return, your money doubles in approximately 72 ÷ 8 = 9 years. At 6%, it takes 12 years. At 12%, it takes just 6 years. The simplicity is stunning — no calculator or complex formula needed, just a single division. Yet the result is remarkably accurate for most everyday investment rates (between 4% and 20%).</p>

            <h2>The Math Behind the Rule of 72</h2>
            <p>The exact doubling time formula uses natural logarithms: t = ln(2) / ln(1 + r) ≈ 0.6931 / r (for small r, where r is expressed as a decimal). Multiplying top and bottom by 100 gives t ≈ 69.3 / r%. The Rule of 72 uses 72 instead of 69.3 for three reasons: 72 is divisible by more numbers (1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36), making mental math easier; the slight overestimate at lower rates cancels out the underestimate at higher rates within the common investment range; and tradition — it's been used for centuries, first appearing in Luca Pacioli's 1494 mathematics text.</p>

            <h2>Applying the Rule of 72 to Debt</h2>
            <p>The Rule of 72 is equally powerful for understanding debt growth — and the results are often alarming. Credit card debt at 18% APR doubles in 4 years. A $10,000 balance ignored for 16 years becomes $160,000. Payday loans at 390% APR theoretically "double" in under 2.5 months (though most payday loans are short-term). Student loans at 6% double in 12 years. This application of the Rule of 72 powerfully illustrates why paying off high-interest debt is the best guaranteed "investment" most people can make.</p>

            <h2>Inflation and Purchasing Power</h2>
            <p>The Rule of 72 applies to inflation too. At 3% inflation, purchasing power halves in 24 years. At 7% inflation (as seen in 2022), purchasing power halves in just over 10 years. This means if you hold cash without investing it, you're losing half its real value roughly every decade during periods of elevated inflation. Conversely, an investment that merely keeps pace with inflation provides no real growth — your money needs to grow faster than inflation to actually increase your purchasing power.</p>

            <h2>The Rule of 72 in Practice: Examples</h2>
            <p>Stock market (7–10% historical average): Money doubles every 7.2–10.3 years. High-yield savings (4–5%): Doubles every 14.4–18 years. Typical mortgage rate (6–7%): Outstanding debt doubles without extra payments every 10.3–12 years. CD rate (3–5%): Doubles every 14.4–24 years. Cryptocurrency (hypothetical 20%): Could double every 3.6 years (with extreme risk). These examples make tangible why starting to invest early and targeting higher returns (within appropriate risk tolerance) dramatically accelerates wealth building.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-72-calculator" />
          <PopularCalculators exclude="/calculator/rule-of-72-calculator" />
        </div>
      </div>
    </>
  );
}
