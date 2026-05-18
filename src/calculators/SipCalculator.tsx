"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SIPCalculator = () => {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [stepUp, setStepUp] = useState("10");
  const [useStepUp, setUseStepUp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ invested: number; returns: number; total: number; monthlyData: { year: number; invested: number; value: number }[] } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;
    const step = useStepUp ? (parseFloat(stepUp) || 0) / 100 : 0;

    if (P <= 0 || n <= 0) return;

    let totalInvested = 0;
    let totalValue = 0;
    let currentMonthly = P;
    const data: { year: number; invested: number; value: number }[] = [];

    for (let month = 1; month <= n; month++) {
      if (useStepUp && month > 1 && (month - 1) % 12 === 0) {
        currentMonthly = currentMonthly * (1 + step);
      }
      totalInvested += currentMonthly;
      totalValue = (totalValue + currentMonthly) * (1 + r);

      if (month % 12 === 0) {
        data.push({ year: month / 12, invested: totalInvested, value: totalValue });
      }
    }

    if (n % 12 !== 0) {
      data.push({ year: Math.ceil(n / 12), invested: totalInvested, value: totalValue });
    }

    setResult({ invested: totalInvested, returns: totalValue - totalInvested, total: totalValue, monthlyData: data });
  };

  const reset = () => {
    setShowResults(false); setMonthly("5000"); setRate("12"); setYears("10"); setStepUp("10"); setUseStepUp(false); setResult(null); };

  const faqs = [
    { question: "What is SIP?", answer: "SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly in mutual funds. It helps build wealth through disciplined investing and rupee cost averaging." },
    { question: "How is SIP return calculated?", answer: "SIP returns are calculated using the future value of an annuity formula. Each monthly installment earns compound interest for its remaining tenure, and the sum gives total corpus." },
    { question: "What is Step-Up SIP?", answer: "Step-Up SIP (or Top-Up SIP) increases your monthly investment by a fixed percentage every year. This helps counter inflation and accelerates wealth creation." },
    { question: "What is a good SIP return rate?", answer: "Historically, equity mutual funds in India have delivered 12-15% annualized returns over 10+ years. Debt funds typically return 6-8%. Past performance doesn't guarantee future returns." },
    { question: "Can I withdraw SIP anytime?", answer: "Yes, open-ended mutual fund SIPs can be redeemed anytime. However, ELSS funds have a 3-year lock-in period. Exit loads may apply for early redemption." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "SIP Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">SIP Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate mutual fund SIP returns with optional step-up SIP and year-by-year growth projection.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="monthly" label="Monthly SIP Amount" value={monthly} onChange={setMonthly} prefix="₹" />
                <InputField id="rate" label="Expected Return Rate (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="years" label="Investment Period" value={years} onChange={setYears} suffix="Years" />
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input type="checkbox" id="stepUpCheck" checked={useStepUp} onChange={(e) => setUseStepUp(e.target.checked)} className="rounded border-input" />
                    <label htmlFor="stepUpCheck" className="text-sm font-medium text-foreground">Enable Step-Up SIP</label>
                  </div>
                  {useStepUp && <InputField id="stepUp" label="Annual Step-Up" value={stepUp} onChange={setStepUp} suffix="%" />}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">SIP Returns</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Total Invested", value: result.invested },
                  { label: "Estimated Returns", value: result.returns, highlight: true },
                  { label: "Total Value", value: result.total, highlight: true },
                ]} />

                {result.monthlyData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Year-by-Year Growth</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Invested</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Value</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Returns</th>
                        </tr></thead>
                        <tbody>
                          {result.monthlyData.map((d) => (
                            <tr key={d.year} className="border-b border-border/50">
                              <td className="py-2 px-3">{d.year}</td>
                              <td className="py-2 px-3 text-right">₹{d.invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                              <td className="py-2 px-3 text-right font-medium">₹{d.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                              <td className="py-2 px-3 text-right text-[hsl(217,91%,40%)] dark:text-primary">₹{(d.value - d.invested).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a SIP Calculator?</h2>
              <p>A SIP (Systematic Investment Plan) calculator helps you estimate the future value of your mutual fund investments made through regular monthly contributions. It uses the compound interest formula to project growth over your chosen investment period.</p>

              <h2>How SIP Returns Are Calculated</h2>
              <p>Each monthly SIP installment is treated as a separate investment that compounds at the expected rate of return. The formula used is the Future Value of an Annuity:</p>
              <p><strong>FV = P × [((1 + r)^n - 1) / r] × (1 + r)</strong></p>
              <p>Where P is the monthly investment, r is the monthly rate of return (annual rate / 12), and n is the total number of months.</p>

              <h2>What Is Step-Up SIP?</h2>
              <p>Step-Up SIP (also called Top-Up SIP) automatically increases your monthly investment by a fixed percentage every year. For example, a 10% step-up on ₹5,000/month means you invest ₹5,500/month in year 2, ₹6,050/month in year 3, and so on. This strategy significantly accelerates wealth creation by keeping pace with income growth.</p>

              <h2>Benefits of SIP Investing</h2>
              <ul>
                <li><strong>Rupee Cost Averaging:</strong> Buying more units when prices are low and fewer when high, reducing average cost.</li>
                <li><strong>Power of Compounding:</strong> Returns earn returns, creating exponential growth over long periods.</li>
                <li><strong>Disciplined Investing:</strong> Automated monthly deductions build consistent saving habits.</li>
                <li><strong>Flexibility:</strong> Start with as low as ₹500/month, increase, pause, or stop anytime.</li>
              </ul>

              <h2>SIP vs Lump Sum Investment</h2>
              <p>SIP spreads investment over time, reducing market timing risk. Lump sum invests everything at once, which can yield higher returns in a consistently rising market. For most investors, SIP is the safer and more practical approach.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates based on assumed constant returns. Actual mutual fund returns vary and past performance does not guarantee future results. Consult a financial advisor.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sip-calculator" />
            <PopularCalculators exclude="/sip-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SIPCalculator;


