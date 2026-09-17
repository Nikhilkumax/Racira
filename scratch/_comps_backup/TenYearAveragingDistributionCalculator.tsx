"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface AveragingResults {
  totalTax: number;
  ordinaryTax: number;
  capitalGainTax: number;
  netDistribution: number;
  minimumDistributionAllowance: number;
  taxableOrdinaryIncome: number;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// 1986 Tax Table for single taxpayers (used for 10-year averaging)
const calculate1986Tax = (income: number): number => {
  if (income <= 1190) return 0; // Zero bracket amount was 2,480, but the formula usually starts after $1,190 for the 1/10th portion
  if (income <= 2270) return 0.11 * (income - 1190);
  if (income <= 3540) return 118.80 + 0.12 * (income - 2270);
  if (income <= 4750) return 271.20 + 0.14 * (income - 3540);
  if (income <= 5910) return 440.60 + 0.15 * (income - 4750);
  if (income <= 7150) return 614.60 + 0.16 * (income - 5910);
  if (income <= 8690) return 813.00 + 0.18 * (income - 7150);
  if (income <= 10700) return 1090.20 + 0.20 * (income - 8690);
  if (income <= 12980) return 1492.20 + 0.23 * (income - 10700);
  if (income <= 15310) return 2016.60 + 0.26 * (income - 12980);
  if (income <= 17760) return 2622.40 + 0.30 * (income - 15310);
  if (income <= 22970) return 3357.40 + 0.34 * (income - 17760);
  if (income <= 28600) return 5128.80 + 0.38 * (income - 22970);
  if (income <= 34320) return 7268.20 + 0.42 * (income - 28600);
  if (income <= 42340) return 9670.60 + 0.48 * (income - 34320);
  return 13520.20 + 0.50 * (income - 42340);
};

const calculateAveraging = (
  totalDistribution: number,
  capitalGainPortion: number,
  capitalGainRate: number
): AveragingResults => {
  if (totalDistribution <= 0) {
    return { totalTax: 0, ordinaryTax: 0, capitalGainTax: 0, netDistribution: 0, minimumDistributionAllowance: 0, taxableOrdinaryIncome: 0 };
  }

  const ordinaryPortion = Math.max(0, totalDistribution - capitalGainPortion);

  // Minimum Distribution Allowance (MDA)
  let mda = 0;
  if (totalDistribution < 70000) {
    const initialMDA = Math.min(10000, totalDistribution / 2);
    const reduction = totalDistribution > 20000 ? (totalDistribution - 20000) * 0.20 : 0;
    mda = Math.max(0, initialMDA - reduction);
  }

  // Prorate MDA to the ordinary income portion
  const ordinaryRatio = totalDistribution > 0 ? ordinaryPortion / totalDistribution : 0;
  const ordinaryMDA = mda * ordinaryRatio;

  const taxableOrdinaryIncome = Math.max(0, ordinaryPortion - ordinaryMDA);

  // 10-Year Averaging Formula: Tax = 10 * 1986Tax((TaxableOrdinary / 10) + 2480)
  // The 2480 is the 1986 zero bracket amount for a single individual.
  const oneTenthIncome = (taxableOrdinaryIncome / 10) + 2480;
  const taxOnOneTenth = calculate1986Tax(oneTenthIncome);
  const ordinaryTax = taxOnOneTenth * 10;

  // Capital Gain Tax
  const capitalGainTax = capitalGainPortion * (capitalGainRate / 100);

  const totalTax = ordinaryTax + capitalGainTax;
  const netDistribution = totalDistribution - totalTax;

  return {
    totalTax,
    ordinaryTax,
    capitalGainTax,
    netDistribution,
    minimumDistributionAllowance: mda,
    taxableOrdinaryIncome
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-sm text-foreground">
        <p className="font-semibold text-muted-foreground">{payload[0].name}</p>
        <p className="text-primary font-bold text-lg">
          ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function TenYearAveragingDistributionCalculator() {
  const [totalDistribution, setTotalDistribution] = useState("50000");
  const [capitalGainPortion, setCapitalGainPortion] = useState("0");
  const [capitalGainRate, setCapitalGainRate] = useState("20");
  
  const [results, setResults] = useState<AveragingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateAveraging(
      parseFloat(totalDistribution) || 0,
      parseFloat(capitalGainPortion) || 0,
      parseFloat(capitalGainRate) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setTotalDistribution("50000");
    setCapitalGainPortion("0");
    setCapitalGainRate("20");
    setResults(calculateAveraging(50000, 0, 20));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>10-Year Averaging Distribution Results</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const pieData = results ? [
    { name: "Ordinary Income Tax", value: results.ordinaryTax, color: "hsl(var(--primary))" },
    { name: "Capital Gains Tax", value: results.capitalGainTax, color: "#8b5cf6" },
    { name: "Net Distribution", value: results.netDistribution, color: "#10b981" },
  ] : [];

  const activePieData = pieData.filter(d => d.value > 0);

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "10-Year Averaging Distribution Calculator" }]} />
      <div className="racira-page-container py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">10-Year Averaging Distribution Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="total-distribution"
                label="Total Lump-Sum Distribution"
                value={totalDistribution}
                onChange={setTotalDistribution}
                prefix="$"
              />
              <CompactInput
                id="capital-gain"
                label="Capital Gain Portion (if any)"
                value={capitalGainPortion}
                onChange={setCapitalGainPortion}
                prefix="$"
              />
              <CompactInput
                id="capital-gain-rate"
                label="Capital Gains Tax Rate"
                value={capitalGainRate}
                onChange={setCapitalGainRate}
                suffix="%"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3 hidden-print">
                    <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Estimated Tax</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${results.totalTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Net after-tax distribution: <strong>${results.netDistribution.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Ordinary Tax</span>
                    <span className="text-lg font-bold">${results.ordinaryTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Cap Gains Tax</span>
                    <span className="text-lg font-bold">${results.capitalGainTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Total Distribution</span>
                    <span className="text-lg font-bold">${parseFloat(totalDistribution).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">Calculation Step</th>
                        <th className="px-4 py-3 text-sm font-semibold text-muted-foreground text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm">Total Lump-Sum Distribution</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${parseFloat(totalDistribution).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Less: Capital Gain Portion</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-muted-foreground">-${parseFloat(capitalGainPortion).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Ordinary Income Portion</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${(parseFloat(totalDistribution) - parseFloat(capitalGainPortion)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Less: Minimum Distribution Allowance</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">-${results.minimumDistributionAllowance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="px-4 py-3 text-sm font-semibold">Taxable Ordinary Income</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">${results.taxableOrdinaryIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Distribution Breakdown</h3>
                  <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {activePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {activePieData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-3">Final Tax Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tax on Ordinary Income</span>
                      <span className="font-medium">${results.ordinaryTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tax on Capital Gains</span>
                      <span className="font-medium">${results.capitalGainTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-border sm:col-span-2">
                      <span className="font-semibold">Total Tax Obligation</span>
                      <span className="font-bold text-destructive text-base">${results.totalTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:col-span-2">
                      <span className="font-semibold">Effective Tax Rate</span>
                      <span className="font-bold text-primary text-base">
                        {parseFloat(totalDistribution) > 0 ? ((results.totalTax / parseFloat(totalDistribution)) * 100).toFixed(2) : "0.00"}%
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mt-16 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What Is the 10-Year Averaging Distribution Calculator?</h2>
          <p>
            The 10-Year Averaging Distribution Calculator is a specialized tax tool designed to estimate the tax liability on a lump-sum distribution from a qualified retirement plan. This specific tax treatment is available only to individuals who were born before January 2, 1936, or to their beneficiaries.
          </p>
          <p>
            By using the 10-year tax option, taxpayers can calculate their tax on the ordinary income portion of a lump-sum distribution as if it were received evenly over 10 years, using the tax rates that were in effect in 1986. This often results in a significantly lower overall tax burden compared to adding the entire lump sum to your current year's ordinary income.
          </p>

          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p>
            The mathematics behind the 10-year averaging calculation are complex and defined by IRS Form 4972. Our calculator automates this process:
          </p>
          <ol>
            <li><strong>Identify Ordinary Income:</strong> Subtract any capital gain portion from the total lump-sum distribution.</li>
            <li><strong>Calculate Minimum Distribution Allowance (MDA):</strong> For distributions under $70,000, an allowance reduces the taxable amount. The MDA starts at the lesser of $10,000 or half the total distribution, but is reduced by 20% of the amount over $20,000.</li>
            <li><strong>Prorate the MDA:</strong> The allowance is multiplied by the ratio of the ordinary income portion to the total distribution.</li>
            <li><strong>Apply 1986 Tax Rates:</strong> The taxable ordinary income is divided by 10. We then add $2,480 (the 1986 zero bracket amount for a single taxpayer). The 1986 tax tables are applied to this amount, and the resulting tax is multiplied by 10.</li>
          </ol>

          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p>
            When you use the calculator, you will see a detailed breakdown:
          </p>
          <ul>
            <li><strong>Total Estimated Tax:</strong> The combined tax obligation from both the 10-year averaged ordinary income and the capital gains portion.</li>
            <li><strong>Net After-Tax Distribution:</strong> The actual amount of money you get to keep after fulfilling your tax obligations on the lump sum.</li>
            <li><strong>Effective Tax Rate:</strong> The percentage of your total distribution that goes toward taxes. With 10-year averaging, this rate is typically much lower than your top marginal tax rate.</li>
            <li><strong>Minimum Distribution Allowance:</strong> If your distribution is under $70,000, this tax-free buffer is automatically calculated and subtracted from your taxable income.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">Key Factors to Consider</h2>
          <p>
            Before electing the 10-year tax option, consider these rules:
          </p>
          <ul>
            <li><strong>Age Requirement:</strong> You (or the plan participant if you are a beneficiary) must have been born before January 2, 1936.</li>
            <li><strong>Lump-Sum Definition:</strong> The distribution must be the entire balance from all of the employer's qualified plans of one kind (e.g., all pension plans or all profit-sharing plans) and must be paid within a single tax year.</li>
            <li><strong>Once-in-a-Lifetime Election:</strong> You can only use the 10-year tax option once in your lifetime.</li>
            <li><strong>Capital Gains Treatment:</strong> If you participated in the plan before 1974, a portion of the distribution might qualify for a flat 20% capital gains tax rate instead of ordinary income.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
          <p>
            <strong>Example 1: Small Distribution</strong><br/>
            You receive a $40,000 lump sum with no capital gains. Because it is under $70,000, the Minimum Distribution Allowance kicks in. The MDA is $6,000. Your taxable ordinary income is $34,000. The 10-year averaging tax on $34,000 is approximately $4,220, resulting in an effective tax rate of just 10.5%.
          </p>
          <p>
            <strong>Example 2: Large Distribution</strong><br/>
            You receive a $250,000 lump sum. There is no MDA because the distribution exceeds $70,000. Using the 1986 single taxpayer rates on $25,000 ($250,000 / 10), the tax is $4,168. Multiplied by 10, your total tax is $41,680. An effective tax rate of 16.6%—likely far lower than standard income tax rates on a $250,000 spike in income.
          </p>

          <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
          <ul>
            <li><strong>Compare All Options:</strong> Always compare the 10-year averaging tax to the alternative of rolling the distribution over into an IRA or paying standard income tax on it. An IRA rollover allows the funds to continue growing tax-deferred.</li>
            <li><strong>Use Form 4972:</strong> When filing your official taxes, you must use IRS Form 4972 (Tax on Lump-Sum Distributions) to formally elect this treatment.</li>
            <li><strong>Consult a Professional:</strong> Due to the complexity and the "once-in-a-lifetime" rule, consult with a Certified Public Accountant (CPA) or financial advisor before making a final decision.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
          <p>
            Manually calculating the 10-year averaging tax involves pulling out historical 1986 tax tables and executing a multi-step algebraic formula. This calculator does all the heavy lifting instantly. It allows retirees and beneficiaries to quickly evaluate whether the 10-year tax option is a financially advantageous choice compared to an IRA rollover or standard taxation, ensuring you keep as much of your retirement savings as legally possible.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Who qualifies for 10-year averaging?", answer: "To qualify, the plan participant must have been born before January 2, 1936. Furthermore, the payout must be a qualifying lump-sum distribution, meaning the entire account balance is withdrawn within a single tax year." },
          { question: "Can I roll over part of the distribution and use 10-year averaging on the rest?", answer: "No. If you roll over any part of the lump-sum distribution to an IRA or another qualified retirement plan, you lose the ability to use the 10-year tax option on the remaining portion." },
          { question: "What is the Minimum Distribution Allowance (MDA)?", answer: "The MDA is a tax-free allowance for distributions under $70,000. It shields a portion of your lump sum from taxation. It phases out completely once the distribution reaches $70,000." },
          { question: "Why does the calculation use 1986 tax rates?", answer: "The Tax Reform Act of 1986 eliminated the 10-year averaging rule for most people, but included a grandfather clause for individuals born before 1936, allowing them to continue using the generous 1986 tax brackets." },
          { question: "Can I use the 10-year averaging rule more than once?", answer: "No. You are only allowed to make this election once in your lifetime. If you have multiple qualified plans, you should carefully consider when to use this election." },
          { question: "How does the capital gain portion work?", answer: "If you participated in the retirement plan before 1974, the pre-1974 portion of your distribution may qualify to be taxed at a flat 20% capital gains rate instead of being subject to the 10-year averaging calculation." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
