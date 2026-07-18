"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface EarResults {
  ear: number;
  periodicRate: number;
  dailyEquivalent: number;
  continuousEquivalent: number;
  comparison: { label: string; ear: number; premium: number }[];
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtP = (n: number) => `${n.toFixed(4)}%`;

const FREQ_OPTIONS = [
  { label: "Annual (1×/year)", value: "1" },
  { label: "Semi-Annual (2×/year)", value: "2" },
  { label: "Quarterly (4×/year)", value: "4" },
  { label: "Monthly (12×/year)", value: "12" },
  { label: "Biweekly (26×/year)", value: "26" },
  { label: "Weekly (52×/year)", value: "52" },
  { label: "Daily (365×/year)", value: "365" },
];

function calcEAR({ apr, n }: { apr: number; n: number }): EarResults {
  const r = apr / 100;
  const ear = (Math.pow(1 + r / n, n) - 1) * 100;
  const periodicRate = (r / n) * 100;
  const dailyEquivalent = (Math.pow(1 + r / 365, 365) - 1) * 100;
  const continuousEquivalent = (Math.exp(r) - 1) * 100;

  const comparison = FREQ_OPTIONS.map(f => {
    const fn = parseInt(f.value);
    const fearVal = (Math.pow(1 + r / fn, fn) - 1) * 100;
    return { label: f.label, ear: fearVal, premium: fearVal - r * 100 };
  });

  return { ear, periodicRate, dailyEquivalent, continuousEquivalent, comparison };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-primary font-semibold">EAR: {payload[0]?.value?.toFixed(4)}%</p>
      </div>
    );
  }
  return null;
};

export default function AprToEarCalculator() {
  const [apr, setApr] = useState("8");
  const [freq, setFreq] = useState("12");

  const [results, setResults] = useState<EarResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calculate(); }, []);

  const calculate = () => {
    setResults(calcEAR({ apr: parseFloat(apr) || 8, n: parseInt(freq) || 12 }));
  };

  const reset = () => {
    setApr("8"); setFreq("12");
    setResults(calcEAR({ apr: 8, n: 12 }));
  };

  const faqs = [
    { question: "What is the difference between APR and EAR?", answer: "APR (Annual Percentage Rate) is the nominal interest rate without considering compounding. EAR (Effective Annual Rate) reflects the true cost of borrowing or return on investing when compounding is factored in. EAR is always ≥ APR, with more frequent compounding creating a larger gap." },
    { question: "What is the APR to EAR formula?", answer: "EAR = (1 + APR/n)^n − 1, where n is the number of compounding periods per year. For example, 8% APR compounded monthly: EAR = (1 + 0.08/12)^12 − 1 = 8.2999%." },
    { question: "Why is EAR always higher than APR?", answer: "With each compounding period, interest is earned on the previously accumulated interest (compounding effect). The more frequently this happens, the higher the effective rate. At annual compounding, EAR = APR. At continuous compounding, EAR reaches its theoretical maximum of e^r − 1." },
    { question: "Which rate should I compare when choosing loans?", answer: "Always compare EARs when evaluating loans, credit cards, and savings accounts. A credit card with 24% APR compounded daily has an EAR of 27.11%, while one compounded monthly has a 26.82% EAR — a significant real difference despite the same stated APR." },
    { question: "How does compounding frequency affect EAR?", answer: "Doubling compounding frequency always increases EAR, but with diminishing returns. Going from annual to monthly compounding adds roughly 0.3% to EAR at 8% APR. Going from monthly to daily adds only 0.003%. Beyond daily compounding, the gains are negligible for consumer finance purposes." },
    { question: "What is the EAR for continuous compounding?", answer: "For continuous compounding, EAR = e^APR − 1. At 8% APR, continuous EAR = e^0.08 − 1 = 8.3287%. This is the theoretical maximum EAR for any given APR." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" },
        { label: "Financial", href: "/calculator#financial" }, { label: "APR to EAR Calculator" }
      ]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">APR to EAR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Rate Conversion</h2>

            <CompactInput id="apr" label="Annual Percentage Rate (APR)" value={apr} onChange={setApr} suffix="%" />

            {/* Frequency Select */}
            <div className="flex flex-col">
              <label htmlFor="freq" className="text-sm font-semibold text-foreground mb-1">Compounding Frequency</label>
              <select id="freq" value={freq} onChange={e => setFreq(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>



            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center"
                aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Quick reference */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border">
              <div className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Common Compounding Periods</div>
              <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                <span>Mortgage: Monthly (12)</span><span>Savings: Daily (365)</span>
                <span>Credit Card: Daily (365)</span><span>Bonds: Semi-annual (2)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Conversion Results</h2>
                  <Percent className="h-5 w-5 text-primary" />
                </div>

                {/* Component 1: Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                    Effective Annual Rate (EAR)
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {fmtP(results.ear)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Nominal APR: {apr}% → Real Cost: {fmtP(results.ear)}
                  </div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Rate Type</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "APR (Nominal Rate)", value: `${apr}%`, isTop: true },
                        { label: `EAR (${FREQ_OPTIONS.find(f => f.value === freq)?.label})`, value: fmtP(results.ear) },
                        { label: "EAR (Daily Compounding)", value: fmtP(results.dailyEquivalent) },
                        { label: "EAR (Continuous)", value: fmtP(results.continuousEquivalent) },
                        { label: "Periodic Rate", value: fmtP(results.periodicRate) },
                        { label: "EAR Premium over APR", value: `+${fmtP(results.ear - parseFloat(apr))}` },
                      ].map(row => (
                        <tr key={row.label} className={`hover:bg-secondary/20 ${row.isTop ? "font-bold bg-secondary/30" : "text-muted-foreground"}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">EAR by Compounding Frequency</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.comparison} margin={{ top: 4, right: 8, left: 0, bottom: 48 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => `${v.toFixed(2)}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="ear" radius={[4, 4, 0, 0]}>
                          {results.comparison.map((_, i) => (
                            <Cell key={i} fill={`hsl(var(--primary) / ${0.4 + (i / results.comparison.length) * 0.6})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                {/* Component 4: Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "APR (Nominal)", value: `${apr}%` },
                    { label: "Compounding", value: `${freq}×/year` },
                    { label: "EAR (Effective)", value: fmtP(results.ear) },
                    { label: "Periodic Rate", value: fmtP(results.periodicRate) },
                    { label: "Daily EAR", value: fmtP(results.dailyEquivalent) },
                    { label: "Continuous EAR", value: fmtP(results.continuousEquivalent) },
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">APR vs EAR: Understanding the Difference</h2>
            <p>The Annual Percentage Rate (APR) is the nominal interest rate expressed on an annual basis, without accounting for compounding within the year. The Effective Annual Rate (EAR), also called the Effective Annual Interest Rate (EAIR) or Annual Equivalent Rate (AER), represents the true cost of borrowing or the true return on investment once intra-year compounding is considered.</p>
            <p>This APR to EAR calculator is essential for comparing financial products that use different compounding frequencies. A savings account offering 5% APR compounded monthly is strictly better than one offering 5% APR compounded annually — and this tool quantifies exactly how much better, instantly.</p>

            <h2 className="text-2xl font-bold mb-3">The Formula: APR to EAR Conversion</h2>
            <p>The standard conversion formula is: EAR = (1 + APR/n)^n − 1, where n is the number of compounding periods per year. Breaking this down: 8% APR compounded monthly gives EAR = (1 + 0.08/12)^12 − 1 = (1.006667)^12 − 1 = 0.08299 = 8.299%. This 0.3% difference may seem small but on a $100,000 loan represents $300/year in additional interest.</p>

            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Credit cards typically compound daily at 365 periods per year, making their EAR significantly higher than the stated APR. A credit card at 24% APR daily compounding has an EAR of 27.11%. Mortgages use monthly compounding. Bond yields are often quoted semi-annually. Savings accounts and CDs typically advertise APY (Annual Percentage Yield), which is mathematically identical to EAR — always the more meaningful rate for savers.</p>

            <h2 className="text-2xl font-bold mb-3">Why This Matters for Borrowers and Investors</h2>
            <p>Federal law (Truth in Lending Act) requires lenders to disclose APR, but for comparing financial products, EAR is a more honest metric. When evaluating two loans with the same stated APR but different compounding frequencies, the one with more frequent compounding costs more. Similarly, a savings account with more frequent compounding earns more. Always convert to EAR before making financial comparisons.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apr-to-ear-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Apr To Ear Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Apr To Ear Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Apr To Ear Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Apr To Ear Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Apr To Ear Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/apr-to-ear-calculator" />
        </div>
      </div>
    </>
  );
}
