"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";

interface YearRow {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
  inflationAdjusted: number;
}

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CompoundInterestCalculator = () => {
  const [initial, setInitial] = useState("10000");
  const [monthlyContrib, setMonthlyContrib] = useState("500");
  const [annualContrib, setAnnualContrib] = useState("0");
  const [returnRate, setReturnRate] = useState("8");
  const [compounding, setCompounding] = useState("monthly");
  const [years, setYears] = useState("20");
  const [months, setMonths] = useState("0");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inflation, setInflation] = useState("3");
  const [taxRate, setTaxRate] = useState("0");

  const [result, setResult] = useState<{
    futureValue: number;
    totalContributions: number;
    totalInterest: number;
    inflationAdjusted: number;
    afterTax: number;
    yearlyRows: YearRow[];
  } | null>(null);
  const [showTable, setShowTable] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    const P = parseFloat(initial) || 0;
    const mc = parseFloat(monthlyContrib) || 0;
    const ac = parseFloat(annualContrib) || 0;
    const r = (parseFloat(returnRate) || 0) / 100;
    const inf = (parseFloat(inflation) || 0) / 100;
    const tax = (parseFloat(taxRate) || 0) / 100;
    const totalMonths = (parseFloat(years) || 0) * 12 + (parseFloat(months) || 0);

    const compPeriods: Record<string, number> = { annually: 1, "semi-annually": 2, quarterly: 4, monthly: 12, daily: 365, continuous: 0 };
    const n = compPeriods[compounding] ?? 12;

    let balance = P;
    let totalContrib = P;
    const yearlyRows: YearRow[] = [];
    let yearContrib = 0;
    let yearInterest = 0;

    for (let m = 1; m <= totalMonths; m++) {
      // Monthly interest
      let monthlyRate: number;
      if (compounding === "continuous") {
        monthlyRate = Math.exp(r / 12) - 1;
      } else {
        monthlyRate = Math.pow(1 + r / n, n / 12) - 1;
      }

      const interest = balance * monthlyRate;
      balance += interest + mc;
      yearInterest += interest;
      yearContrib += mc;

      // Annual contribution at year end
      if (m % 12 === 0) {
        balance += ac;
        yearContrib += ac;
        totalContrib += yearContrib;

        const yr = m / 12;
        const inflAdj = balance / Math.pow(1 + inf, yr);
        yearlyRows.push({
          year: yr,
          balance,
          contributions: totalContrib,
          interest: balance - totalContrib,
          inflationAdjusted: inflAdj,
        });
        yearContrib = 0;
        yearInterest = 0;
      }
    }

    // Handle remaining months
    if (totalMonths % 12 !== 0) {
      totalContrib += yearContrib;
      const yr = totalMonths / 12;
      const inflAdj = balance / Math.pow(1 + inf, yr);
      yearlyRows.push({
        year: Math.ceil(yr),
        balance,
        contributions: totalContrib,
        interest: balance - totalContrib,
        inflationAdjusted: inflAdj,
      });
    }

    if (totalMonths % 12 === 0 && yearlyRows.length === 0) return;

    const totalInterest = balance - totalContrib;
    const inflAdj = balance / Math.pow(1 + inf, totalMonths / 12);
    const afterTax = balance - totalInterest * tax;

    setResult({
      futureValue: balance,
      totalContributions: totalContrib,
      totalInterest,
      inflationAdjusted: inflAdj,
      afterTax,
      yearlyRows,
    });
  };

  const reset = () => {
    setInitial("10000"); setMonthlyContrib("500"); setAnnualContrib("0");
    setReturnRate("8"); setYears("20"); setMonths("0");
    setInflation("3"); setTaxRate("0");
    setResult(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Investment Growth – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is compound interest?", answer: "Compound interest is interest earned on both your initial principal and on previously earned interest. Unlike simple interest (calculated only on the principal), compound interest grows exponentially over time, making it one of the most powerful forces in wealth building." },
    { question: "How does compounding frequency affect returns?", answer: "The more frequently interest compounds, the more you earn. Daily compounding earns slightly more than monthly, which earns more than annually. However, the difference between daily and monthly compounding is relatively small for most investments." },
    { question: "What is the rule of 72?", answer: "The Rule of 72 is a quick way to estimate how long it takes to double your money. Divide 72 by your annual return rate. For example, at 8% return, your money doubles in approximately 72/8 = 9 years." },
    { question: "How does inflation affect my returns?", answer: "Inflation reduces the purchasing power of your future money. If your investments grow at 8% but inflation is 3%, your real return is approximately 5%. Our calculator shows both nominal and inflation-adjusted values." },
    { question: "What return rate should I use?", answer: "Historical average annual return for the S&P 500 is about 10% (7% after inflation). For bonds, use 4-5%. For a balanced portfolio, 6-8% is reasonable. Always use conservative estimates for planning." },
    { question: "How are taxes handled?", answer: "Our calculator applies the tax rate to investment gains (not contributions) at the end of the period. In reality, tax treatment varies by account type (401k, IRA, taxable) and country. Consult a tax professional for specifics." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Compound Interest" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Compound Interest & Investment Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate how your investments grow over time with compound interest, regular contributions, and inflation adjustment.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="initial" label="Initial Investment" value={initial} onChange={setInitial} prefix="$" tooltip="The amount you're starting with today." />
                <InputField id="monthly" label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} prefix="$" tooltip="Amount you'll add each month." />
                <InputField id="return" label="Annual Return Rate" value={returnRate} onChange={setReturnRate} suffix="%" tooltip="Expected annual rate of return on your investments." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Compounding Frequency</label>
                  <select value={compounding} onChange={(e) => setCompounding(e.target.value)} className="input-calc">
                    <option value="annually">Annually</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                    <option value="continuous">Continuous</option>
                  </select>
                </div>
                <InputField id="years" label="Years" value={years} onChange={setYears} tooltip="Investment duration in years." />
                <InputField id="months" label="Additional Months" value={months} onChange={setMonths} tooltip="Additional months beyond whole years." />
              </div>

              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline mb-4">
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="annual-contrib" label="Annual Contribution" value={annualContrib} onChange={setAnnualContrib} prefix="$" tooltip="Additional lump sum added once per year." />
                  <InputField id="inflation" label="Inflation Rate" value={inflation} onChange={setInflation} suffix="%" tooltip="Expected annual inflation rate to calculate real returns." />
                  <InputField id="tax" label="Tax Rate on Gains" value={taxRate} onChange={setTaxRate} suffix="%" tooltip="Estimated tax rate applied to investment gains." />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate Growth</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8" ref={printRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Investment Growth Results</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>

                <ResultDisplay items={[
                  { label: "Future Value", value: result.futureValue, highlight: true },
                  { label: "Total Contributions", value: result.totalContributions },
                  { label: "Total Interest Earned", value: result.totalInterest, highlight: true },
                  { label: "Inflation Adjusted", value: result.inflationAdjusted },
                  ...(parseFloat(taxRate) > 0 ? [{ label: "After-Tax Value", value: result.afterTax }] : []),
                ]} />

                {/* CSS Bar Chart for growth */}
                {result.yearlyRows.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground mb-3">Growth Over Time</h3>
                    <div className="flex items-end gap-1 h-40">
                      {result.yearlyRows.map((row) => {
                        const maxBal = result.yearlyRows[result.yearlyRows.length - 1].balance;
                        const contribH = (row.contributions / maxBal) * 100;
                        const interestH = (row.interest / maxBal) * 100;
                        return (
                          <div key={row.year} className="flex-1 flex flex-col justify-end" title={`Year ${row.year}: ${fmt(row.balance)}`}>
                            <div style={{ height: `${interestH}%` }} className="bg-accent/40 rounded-t-sm min-h-[1px]" />
                            <div style={{ height: `${contribH}%` }} className="bg-accent min-h-[1px]" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Year 1</span>
                      <span>Year {result.yearlyRows.length}</span>
                    </div>
                    <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent inline-block" /> Contributions</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent/40 inline-block" /> Interest</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Contributions", value: result.totalContributions, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest", value: result.totalInterest, color: "hsl(220, 60%, 20%)" },
                    ]}
                    size={180}
                  />
                </div>

                {/* Year table */}
                <div className="mt-6">
                  <button onClick={() => setShowTable(!showTable)} className="text-sm text-accent hover:underline">
                    {showTable ? "Hide" : "Show"} Annual Schedule
                  </button>
                  {showTable && (
                    <div className="overflow-x-auto mt-3 rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary text-foreground">
                            <th className="px-3 py-2 text-left font-medium">Year</th>
                            <th className="px-3 py-2 text-right font-medium">Balance</th>
                            <th className="px-3 py-2 text-right font-medium">Contributions</th>
                            <th className="px-3 py-2 text-right font-medium">Interest</th>
                            <th className="px-3 py-2 text-right font-medium">Inflation Adj.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearlyRows.map((row) => (
                            <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                              <td className="px-3 py-2 text-muted-foreground">{row.year}</td>
                              <td className="px-3 py-2 text-right font-medium">{fmt(row.balance)}</td>
                              <td className="px-3 py-2 text-right">{fmt(row.contributions)}</td>
                              <td className="px-3 py-2 text-right text-accent">{fmt(row.interest)}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">{fmt(row.inflationAdjusted)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is Compound Interest?</h2>
              <p>Compound interest is the interest you earn on both your original investment and on the interest that has already accumulated. It's often called "interest on interest" and is one of the most powerful concepts in personal finance and investing.</p>
              <p>Albert Einstein reportedly called compound interest the "eighth wonder of the world." Whether or not he actually said it, the mathematics behind compound interest truly are remarkable. A modest investment, given enough time and a reasonable return, can grow to impressive sums.</p>

              <h2>How Compound Interest Works</h2>
              <p>The compound interest formula is: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual interest rate, n is the number of times interest compounds per year, and t is time in years.</p>
              <p>For example, $10,000 invested at 8% annually compounded monthly for 20 years grows to approximately $49,268 — nearly 5 times the original investment. Add $500 monthly contributions and the result jumps to approximately $344,000, of which about $214,000 is pure investment growth.</p>

              <h2>The Impact of Compounding Frequency</h2>
              <p>Interest can compound annually, semi-annually, quarterly, monthly, daily, or even continuously. More frequent compounding means slightly higher returns because interest starts earning its own interest sooner.</p>
              <p>The difference between annual and monthly compounding on $10,000 at 8% over 20 years is about $1,200. While not negligible, it shows that the return rate and time horizon matter far more than compounding frequency.</p>

              <h2>Why Regular Contributions Matter</h2>
              <p>The true power of compound interest is unlocked through regular contributions. By consistently adding money to your investment, each new dollar also begins compounding. Over decades, the effect is dramatic. Someone investing $500/month from age 25 to 65 at 8% would accumulate over $1.7 million — having contributed only $240,000 of their own money.</p>

              <h2>Understanding Inflation's Impact</h2>
              <p>Inflation erodes purchasing power over time. A dollar today buys more than a dollar will in 20 years. Our calculator shows inflation-adjusted values so you can see the real purchasing power of your future wealth. At 3% inflation, $1 million in 20 years has the purchasing power of roughly $554,000 in today's dollars.</p>

              <h2>Tax Considerations</h2>
              <p>Investment gains are subject to taxes, which can significantly impact your net returns. Tax-advantaged accounts like 401(k)s, IRAs, and Roth IRAs allow your investments to grow tax-deferred or tax-free, amplifying the compound effect. Our calculator's tax field gives you a rough estimate of the tax impact on your gains.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Actual investment returns vary and past performance doesn't guarantee future results. This is not financial advice. Consult a qualified financial advisor.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compound-interest-calculator" />
            <PopularCalculators exclude="/compound-interest-calculator" />
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

export default CompoundInterestCalculator;

