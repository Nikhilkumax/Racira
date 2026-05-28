"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const HalfLifeCalculator = () => {
  const DEFAULTS = { initial: "1000", halfLife: "5730", elapsed: "11460" };
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
  const [elapsed, setElapsed] = useState(DEFAULTS.elapsed);
  const [result, setResult] = useState<any>(null);

  const calculate = (initV = initial, hlV = halfLife, elV = elapsed) => {
    const N0 = parseFloat(initV), t12 = parseFloat(hlV), t = parseFloat(elV);
    if (isNaN(N0) || isNaN(t12) || isNaN(t) || t12 <= 0 || N0 <= 0) return;
    const n = t / t12;
    const remaining = N0 * Math.pow(0.5, n);
    const decayed = N0 - remaining;
    const pctRemaining = (remaining / N0) * 100;
    const lambda = Math.log(2) / t12;

    const steps = Math.min(Math.ceil(n) + 1, 12);
    const chartData = Array.from({ length: steps }, (_, i) => {
      const ti = (t / (steps - 1)) * i;
      return { name: ti % 1 === 0 ? `${ti.toFixed(0)}` : `${ti.toFixed(0)}`, value: parseFloat((N0 * Math.pow(0.5, ti / t12)).toFixed(4)) };
    });

    setResult({
      primary: `${remaining.toFixed(4)} units`,
      subtitle: `${pctRemaining.toFixed(2)}% of original remains after ${n.toFixed(2)} half-lives`,
      rows: [
        { label: "Initial Amount (N₀)", value: N0.toLocaleString() },
        { label: "Half-life (t½)", value: `${t12.toLocaleString()} years` },
        { label: "Elapsed Time (t)", value: `${t.toLocaleString()} years` },
        { label: "Half-lives elapsed (n)", value: n.toFixed(4) },
        { label: "Remaining Amount", value: remaining.toFixed(4) },
        { label: "Decayed Amount", value: decayed.toFixed(4) },
        { label: "Percent Remaining", value: `${pctRemaining.toFixed(4)}%` },
        { label: "Decay Constant (λ)", value: `${lambda.toExponential(4)} yr⁻¹` },
      ],
      chartData,
      summary: [
        { label: "Half-lives elapsed", value: n.toFixed(3) },
        { label: "Remaining", value: `${remaining.toFixed(4)} (${pctRemaining.toFixed(2)}%)` },
        { label: "Decayed", value: decayed.toFixed(4) },
        { label: "Decay constant λ", value: lambda.toExponential(4), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setInitial(DEFAULTS.initial); setHalfLife(DEFAULTS.halfLife); setElapsed(DEFAULTS.elapsed); calculate(DEFAULTS.initial, DEFAULTS.halfLife, DEFAULTS.elapsed); };

  const faqs = [
    { question: "What is the half-life formula?", answer: "N(t) = N₀ × (1/2)^(t/t½) where N₀ is the initial amount, t is elapsed time, and t½ is the half-life. The decay constant λ = ln(2)/t½ ≈ 0.693/t½." },
    { question: "What is Carbon-14 half-life used for?", answer: "Carbon-14 has a half-life of 5,730 years and is used in radiocarbon dating to determine the age of organic materials up to about 50,000 years old." },
    { question: "After 2 half-lives, how much remains?", answer: "After 1 half-life: 50% remains. After 2: 25%. After 3: 12.5%. After n half-lives, (1/2)^n of the original amount remains." },
    { question: "Can half-life be used for non-radioactive decay?", answer: "Yes. Half-life applies to any exponential decay: drug concentrations in the body (pharmacokinetics), capacitor discharge, bacterial die-off, and financial depreciation." },
    { question: "What is the decay constant?", answer: "The decay constant λ = ln(2)/t½ represents the probability per unit time that a given atom decays. It is related to half-life by t½ = ln(2)/λ ≈ 0.693/λ." },
    { question: "How many half-lives until a substance is fully decayed?", answer: "Mathematically, exponential decay never reaches exactly zero. After 10 half-lives, ~0.1% remains; after 20, ~0.0001% remains. Practically, 7-10 half-lives is considered 'effectively gone'." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Half-Life Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Half-Life Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Initial Amount (N₀)</label>
              <input type="number" value={initial} onChange={e => setInitial(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1000" min="0" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Half-Life (t½)</label>
              <div className="relative">
                <input type="number" value={halfLife} onChange={e => setHalfLife(e.target.value)}
                  className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5730" min="0" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Carbon-14 = 5,730 yrs | Uranium-238 = 4.47 billion yrs</p>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Elapsed Time (t)</label>
              <div className="relative">
                <input type="number" value={elapsed} onChange={e => setElapsed(e.target.value)}
                  className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="11460" min="0" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Remaining Amount</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Decay Curve</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={result.chartData}>
                      <defs>
                        <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#decayGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Half-Life Calculator?</h2>
            <p>A half-life calculator computes how much of a substance remains after a given time, based on its half-life — the time required for exactly half of the substance to decay or transform. Pre-filled with Carbon-14 (t½ = 5,730 years, t = 11,460 years = 2 half-lives), the calculator immediately shows that 250 units of an original 1,000 remain: exactly 25%, consistent with two halvings.</p>
            <p>Half-life is a fundamental concept in nuclear physics, pharmacology, environmental science, and finance. The same exponential decay mathematics governs radioactive decay, drug metabolism, capacitor discharge, and population decline.</p>
            <h2>The Half-Life Formula</h2>
            <p><strong>N(t) = N₀ × (½)^(t/t½)</strong></p>
            <p>Where N(t) = remaining amount at time t, N₀ = initial amount, t = elapsed time, t½ = half-life. Equivalently, using the decay constant λ = ln(2)/t½: N(t) = N₀ × e^(−λt). Both forms are mathematically identical.</p>
            <p>For C-14 dating: N(11460) = 1000 × (0.5)^(11460/5730) = 1000 × (0.5)² = 1000 × 0.25 = 250.</p>
            <h2>Common Half-Lives in Science</h2>
            <p>Half-life values span an enormous range. Carbon-14: 5,730 years (used in archaeological dating). Uranium-238: 4.47 billion years (geological dating). Plutonium-239: 24,100 years (nuclear waste concern). Iodine-131: 8.02 days (medical imaging and therapy). Technetium-99m: 6.01 hours (most common medical imaging isotope). Radon-222: 3.82 days (indoor air quality concern). Polonium-210: 138 days (acute toxicity).</p>
            <h2>Radiocarbon Dating</h2>
            <p>Carbon-14 is created in the atmosphere when cosmic ray neutrons strike nitrogen-14. Living organisms continuously incorporate C-14 through the food chain, maintaining a constant ratio of C-14 to C-12. When an organism dies, C-14 decays without replacement. By measuring the current C-14/C-12 ratio and applying the half-life formula, scientists can determine when the organism died — accurately dating samples up to about 50,000 years old.</p>
            <h2>Pharmacokinetic Half-Life</h2>
            <p>In medicine, drug half-life determines dosing intervals. Ibuprofen's half-life is about 2 hours — after 10 hours (5 half-lives), only ~3% remains active. Fluoxetine (Prozac) has a 1–4 day half-life plus active metabolites lasting weeks — explaining why antidepressant effects persist after stopping and why weekly dosing is possible. The therapeutic steady-state is reached after approximately 4–5 half-lives of consistent dosing.</p>
            <h2>Tips for This Calculator</h2>
            <p>Use consistent units for half-life and elapsed time (both years, both hours, etc.). The area chart shows the classic exponential decay curve — notice how it drops steeply at first and then levels off asymptotically. For drug calculations, use hours instead of years. Pair with the <a href="/calculator/exponential-decay-calculator">exponential decay calculator</a> for general decay analysis or the <a href="/calculator/radioactive-decay-calculator">radioactive decay calculator</a> for activity calculations.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/half-life-calculator" />
          <PopularCalculators exclude="/calculator/half-life-calculator" />
        </div>
      </div>
    </>
  );
};
export default HalfLifeCalculator;
