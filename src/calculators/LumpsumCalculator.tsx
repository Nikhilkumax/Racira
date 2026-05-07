"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const LumpsumCalculator = () => {
  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState<{ invested: number; returns: number; total: number; yearData: { year: number; value: number }[] } | null>(null);

  const calculate = () => {
    const P = parseFloat(amount) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(years) || 0;
    if (P <= 0 || n <= 0) return;

    const data: { year: number; value: number }[] = [];
    for (let y = 1; y <= n; y++) {
      data.push({ year: y, value: P * Math.pow(1 + r, y) });
    }

    const total = P * Math.pow(1 + r, n);
    setResult({ invested: P, returns: total - P, total, yearData: data });
  };

  const reset = () => { setAmount("500000"); setRate("12"); setYears("10"); setResult(null); };

  const faqs = [
    { question: "What is lump sum investment?", answer: "Lump sum investment means investing a large amount of money at one time in a mutual fund or other instrument, as opposed to investing smaller amounts periodically through SIP." },
    { question: "Is lump sum better than SIP?", answer: "Lump sum can outperform SIP in a consistently rising market. However, SIP reduces risk through rupee cost averaging. For most investors, SIP is recommended unless you have a large sum to invest during market dips." },
    { question: "How are lump sum returns calculated?", answer: "Returns are calculated using compound interest: FV = PV × (1 + r)^n, where PV is the invested amount, r is the annual return rate, and n is the number of years." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Lumpsum Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Lumpsum Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate returns on a one-time lump sum investment in mutual funds with compound interest growth.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="amount" label="Investment Amount" value={amount} onChange={setAmount} prefix="₹" />
                <InputField id="rate" label="Expected Return (p.a.)" value={rate} onChange={setRate} suffix="%" />
                <InputField id="years" label="Investment Period" value={years} onChange={setYears} suffix="Years" />
              </div>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Investment Returns</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Amount Invested", value: result.invested },
                  { label: "Estimated Returns", value: result.returns, highlight: true },
                  { label: "Total Value", value: result.total, highlight: true },
                ]} />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Year-by-Year Growth</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Value</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Returns</th>
                      </tr></thead>
                      <tbody>
                        {result.yearData.map((d) => (
                          <tr key={d.year} className="border-b border-border/50">
                            <td className="py-2 px-3">{d.year}</td>
                            <td className="py-2 px-3 text-right font-medium">₹{d.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            <td className="py-2 px-3 text-right text-[hsl(217,91%,40%)] dark:text-primary">₹{(d.value - result.invested).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Lumpsum Calculator?</h2>
              <p>A lumpsum calculator estimates the future value of a one-time investment using compound interest. It helps you visualize how your money grows when invested in mutual funds, stocks, or other growth instruments over a period of time.</p>

              <h2>Lumpsum Investment Formula</h2>
              <p><strong>Future Value = P × (1 + r)^n</strong></p>
              <p>Where P is the principal amount, r is the annual rate of return, and n is the number of years.</p>

              <h2>When to Invest Lump Sum</h2>
              <ul>
                <li><strong>Market corrections:</strong> Investing during market dips can yield higher long-term returns.</li>
                <li><strong>Windfall income:</strong> Bonuses, inheritance, or asset sales are good candidates for lump sum investing.</li>
                <li><strong>Long time horizon:</strong> The longer you stay invested, the more compounding works in your favor.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Returns are not guaranteed. Past performance does not indicate future results. Consult a financial advisor before investing.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lumpsum-calculator" />
            <PopularCalculators exclude="/lumpsum-calculator" />
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

export default LumpsumCalculator;

