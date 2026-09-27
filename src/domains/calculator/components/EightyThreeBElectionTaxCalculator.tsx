"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface ElectionResults {
  taxTodayWith83b: number;
  taxAtVestingWithout83b: number;
  taxAtSaleWith83b: number;
  taxAtSaleWithout83b: number;
  totalTaxWith83b: number;
  totalTaxWithout83b: number;
  totalSavings: number;
  futureTotalValue: number;
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

const calculateElection = (
  shares: number,
  fmvToday: number,
  pricePaid: number,
  expectedFmvVesting: number,
  expectedFmvSale: number,
  ordinaryTaxRate: number,
  capitalGainsRate: number
): ElectionResults => {
  if (shares <= 0) {
    return {
      taxTodayWith83b: 0, taxAtVestingWithout83b: 0, taxAtSaleWith83b: 0, taxAtSaleWithout83b: 0,
      totalTaxWith83b: 0, totalTaxWithout83b: 0, totalSavings: 0, futureTotalValue: 0
    };
  }

  const ordRate = ordinaryTaxRate / 100;
  const capRate = capitalGainsRate / 100;

  // With 83(b)
  // Taxed on grant date on the difference between FMV and amount paid as ordinary income
  const ordinaryIncomeToday = Math.max(0, (fmvToday - pricePaid) * shares);
  const taxTodayWith83b = ordinaryIncomeToday * ordRate;
  
  // Taxed at sale on the difference between Sale price and FMV at grant as capital gains
  const capitalGainsAtSaleWith83b = Math.max(0, (expectedFmvSale - Math.max(fmvToday, pricePaid)) * shares);
  const taxAtSaleWith83b = capitalGainsAtSaleWith83b * capRate;

  const totalTaxWith83b = taxTodayWith83b + taxAtSaleWith83b;

  // Without 83(b)
  // Taxed on vesting date on the difference between Vesting FMV and amount paid as ordinary income
  const ordinaryIncomeAtVesting = Math.max(0, (expectedFmvVesting - pricePaid) * shares);
  const taxAtVestingWithout83b = ordinaryIncomeAtVesting * ordRate;

  // Taxed at sale on the difference between Sale price and Vesting FMV as capital gains
  const capitalGainsAtSaleWithout83b = Math.max(0, (expectedFmvSale - expectedFmvVesting) * shares);
  const taxAtSaleWithout83b = capitalGainsAtSaleWithout83b * capRate;

  const totalTaxWithout83b = taxAtVestingWithout83b + taxAtSaleWithout83b;

  return {
    taxTodayWith83b,
    taxAtVestingWithout83b,
    taxAtSaleWith83b,
    taxAtSaleWithout83b,
    totalTaxWith83b,
    totalTaxWithout83b,
    totalSavings: totalTaxWithout83b - totalTaxWith83b,
    futureTotalValue: expectedFmvSale * shares,
  };
};

export default function EightyThreeBElectionTaxCalculator() {
  const [shares, setShares] = useState("100000");
  const [fmvToday, setFmvToday] = useState("0.01");
  const [pricePaid, setPricePaid] = useState("0.01");
  const [expectedFmvVesting, setExpectedFmvVesting] = useState("1.50");
  const [expectedFmvSale, setExpectedFmvSale] = useState("10.00");
  const [ordinaryTaxRate, setOrdinaryTaxRate] = useState("37");
  const [capitalGainsRate, setCapitalGainsRate] = useState("20");
  
  const [results, setResults] = useState<ElectionResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateElection(
      parseFloat(shares) || 0,
      parseFloat(fmvToday) || 0,
      parseFloat(pricePaid) || 0,
      parseFloat(expectedFmvVesting) || 0,
      parseFloat(expectedFmvSale) || 0,
      parseFloat(ordinaryTaxRate) || 0,
      parseFloat(capitalGainsRate) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setShares("100000");
    setFmvToday("0.01");
    setPricePaid("0.01");
    setExpectedFmvVesting("1.50");
    setExpectedFmvSale("10.00");
    setOrdinaryTaxRate("37");
    setCapitalGainsRate("20");
    setResults(calculateElection(100000, 0.01, 0.01, 1.50, 10.00, 37, 20));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>83(b) Election Results</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const chartData = results ? [
    {
      name: "With 83(b)",
      OrdinaryTax: results.taxTodayWith83b,
      CapitalGainsTax: results.taxAtSaleWith83b,
    },
    {
      name: "Without 83(b)",
      OrdinaryTax: results.taxAtVestingWithout83b,
      CapitalGainsTax: results.taxAtSaleWithout83b,
    }
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "83(b) Election Tax Calculator" }]} />
      <div className="racira-page-container py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">83(b) Election Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-2">
              <h3 className="font-semibold text-destructive mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> 30-Day Strict Deadline
              </h3>
              <p className="text-sm text-foreground/80 mb-0">
                You must file your 83(b) election with the IRS within <strong>30 days</strong> of the date the stock is granted. There are no exceptions to this deadline.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="shares"
                label="Number of Restricted Shares Granted"
                value={shares}
                onChange={setShares}
              />
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="fmv-today"
                  label="Current FMV / Share"
                  value={fmvToday}
                  onChange={setFmvToday}
                  prefix="$"
                />
                <CompactInput
                  id="price-paid"
                  label="Amount You Paid / Share"
                  value={pricePaid}
                  onChange={setPricePaid}
                  prefix="$"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="expected-fmv-vesting"
                  label="Expected FMV at Vesting"
                  value={expectedFmvVesting}
                  onChange={setExpectedFmvVesting}
                  prefix="$"
                />
                <CompactInput
                  id="expected-fmv-sale"
                  label="Expected FMV at Exit/Sale"
                  value={expectedFmvSale}
                  onChange={setExpectedFmvSale}
                  prefix="$"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="ordinary-tax"
                  label="Ordinary Income Tax Rate"
                  value={ordinaryTaxRate}
                  onChange={setOrdinaryTaxRate}
                  suffix="%"
                />
                <CompactInput
                  id="capital-gains"
                  label="Capital Gains Tax Rate"
                  value={capitalGainsRate}
                  onChange={setCapitalGainsRate}
                  suffix="%"
                />
              </div>
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
                <div className="flex justify-end hidden-print">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-4 w-4" /> Print Results
                  </button>
                </div>

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Tax Savings with 83(b)</div>
                  <div className={`text-4xl font-bold mb-2 ${results.totalSavings > 0 ? 'text-primary' : 'text-foreground'}`}>
                    ${results.totalSavings.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    Assuming a final exit value of ${results.futureTotalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Tax Owed NOW (83b)</span>
                    <span className="text-base sm:text-lg font-bold">${results.taxTodayWith83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Tax at Vesting (No 83b)</span>
                    <span className="text-base sm:text-lg font-bold text-destructive">${results.taxAtVestingWithout83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Total Exit Tax (83b)</span>
                    <span className="text-base sm:text-lg font-bold">${results.taxAtSaleWith83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Total Tax Paid Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 600 }} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          width={60}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                          cursor={{fill: 'hsl(var(--muted))'}}
                        />
                        <Legend />
                        <Bar 
                          dataKey="OrdinaryTax" 
                          name="Ordinary Income Tax" 
                          stackId="a" 
                          fill="hsl(var(--destructive))" 
                          radius={[0, 0, 4, 4]} 
                        />
                        <Bar 
                          dataKey="CapitalGainsTax" 
                          name="Capital Gains Tax" 
                          stackId="a" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Breakdown Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">Tax Timeline</th>
                        <th className="px-4 py-3 text-sm font-semibold text-muted-foreground text-right">With 83(b) Election</th>
                        <th className="px-4 py-3 text-sm font-semibold text-muted-foreground text-right">Without 83(b)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm">Tax due today (Grant Date)</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${results.taxTodayWith83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-muted-foreground">$0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Tax due at Vesting</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-muted-foreground">$0</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-destructive">${results.taxAtVestingWithout83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Tax due at Exit/Sale</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${results.taxAtSaleWith83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${results.taxAtSaleWithout83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="px-4 py-3 text-sm font-bold">Total Lifetime Taxes</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-primary">${results.totalTaxWith83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">${results.totalTaxWithout83b.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mt-16 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What is an 83(b) Election?</h2>
          <p>
            Section 83(b) of the Internal Revenue Code allows founders and startup employees to choose to be taxed on the fair market value (FMV) of restricted stock or options <em>at the time they are granted</em>, rather than waiting until the shares actually vest.
          </p>
          <p>
            When you join an early-stage startup, your shares are usually subject to a vesting schedule (e.g., 4 years with a 1-year cliff). By default, the IRS taxes you on those shares as they vest. If the startup grows rapidly, the value of those shares might increase dramatically before they vest, resulting in a massive, unexpected tax bill.
          </p>
          <p>
            By filing an 83(b) election, you preemptively tell the IRS, "Tax me on everything right now." Because the company is usually worth very little at the time of grant, the tax bill today is often zero or very small.
          </p>

          <h2 className="text-2xl font-bold mb-3">Why the 83(b) Election is Crucial for Founders</h2>
          <p>
            The primary goal of an 83(b) election is to convert what would have been high-rate <strong>ordinary income</strong> into lower-rate <strong>long-term capital gains</strong>.
          </p>
          <p>
            Without an 83(b) election, every time a batch of shares vests, the difference between the current FMV and what you paid for the shares is taxed as ordinary income (which can be as high as 37%). If the company is doing well, this "phantom income" can force employees to sell shares just to cover the tax bill.
          </p>
          <p>
            With an 83(b) election, you lock in your ordinary income tax at the grant date (when FMV and purchase price are usually identical, resulting in $0 tax). From that point forward, all future growth of the company is categorized as capital gains. When you eventually sell the stock (assuming you held it for over a year), you will pay the much lower capital gains tax rate (usually 15% to 20%).
          </p>

          <h2 className="text-2xl font-bold mb-3">The 30-Day Strict Deadline</h2>
          <p>
            This cannot be overstated: <strong>You must file your 83(b) election with the IRS within 30 days of the grant date.</strong>
          </p>
          <p>
            There are virtually no exceptions. If you miss this deadline by even one day, the IRS will reject the election, and you will be forced to pay ordinary income tax on the shares as they vest. For successful startups, missing this deadline has literally cost founders and early employees millions of dollars.
          </p>
          <p>
            It is highly recommended to mail the election form via USPS Certified Mail with a Return Receipt Requested, so you have absolute proof of the date it was sent and received.
          </p>

          <h2 className="text-2xl font-bold mb-3">The Risks of Filing an 83(b)</h2>
          <p>
            While an 83(b) election is almost always a no-brainer for early-stage founders receiving stock for pennies, it does carry risks for later-stage employees:
          </p>
          <ul>
            <li><strong>Upfront Cash Required:</strong> If the FMV of the stock is high when you are granted the shares, filing an 83(b) means you must write a check to the IRS today for shares that you haven't even earned yet.</li>
            <li><strong>The "Clawback" Risk:</strong> If you leave the company before your shares vest, you forfeit those unvested shares back to the company. However, the IRS <strong>will not refund</strong> the taxes you paid upfront via the 83(b) election. You took the gamble and lost.</li>
            <li><strong>Company Failure:</strong> If the startup goes bankrupt and the shares become worthless, you cannot claim a tax deduction for the ordinary income taxes you paid upfront.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">Understanding the Calculator Results</h2>
          <p>
            This calculator demonstrates the mathematical power of the 83(b) election by modeling a hypothetical exit scenario.
          </p>
          <ul>
            <li><strong>Tax Owed NOW:</strong> This is the check you must write to the IRS if you file the 83(b). For early founders, this is often $0 because the purchase price equals the current FMV.</li>
            <li><strong>Tax at Vesting:</strong> This is the "phantom income" trap you avoid by filing. If you don't file, and the company value spikes, you owe this amount out-of-pocket simply because the shares vested.</li>
            <li><strong>Total Exit Tax:</strong> The taxes you will pay when the company is acquired or goes public. Notice how the blue bar (Capital Gains) is much larger in the 83(b) scenario, representing the conversion of your wealth into the more favorable tax bracket.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">When Should You NOT File an 83(b)?</h2>
          <p>
            Generally, you might reconsider filing an 83(b) if:
          </p>
          <ul>
            <li>You are joining a late-stage, highly valued startup (like a Series C or D), and the upfront tax bill would be tens of thousands of dollars.</li>
            <li>You are not confident you will stay at the company long enough to vest the shares.</li>
            <li>You do not believe the company's valuation will increase.</li>
          </ul>
        </div>

        <FAQSection faqs={[
          { question: "How do I actually file an 83(b) election?", answer: "You must fill out a brief letter/form containing your name, SSN, description of the property, FMV, and amount paid. You mail this letter to the IRS office where you file your regular tax return within 30 days of the grant. You must also give a copy to your employer." },
          { question: "Can I file an 83(b) election electronically?", answer: "Currently, no. The IRS requires a physical signature. It must be mailed via USPS, preferably via Certified Mail so you have a timestamped receipt." },
          { question: "Does an 83(b) election apply to standard stock options (ISOs or NSOs)?", answer: "No. The 83(b) election only applies to restricted stock or early-exercised options (where you buy the unvested shares immediately). You cannot file an 83(b) for standard unexercised options." },
          { question: "What happens if I miss the 30-day deadline?", answer: "You are out of luck. The IRS is notoriously strict about this. You will be taxed at ordinary income rates on the difference between the FMV and your purchase price as your shares vest over the coming years." },
          { question: "I paid exactly the FMV for my shares. Do I still need to file?", answer: "YES! This is the most common mistake. Even if your calculated tax is $0 today, you must file the election to legally establish that $0 tax baseline and lock in capital gains treatment for the future." },
          { question: "Will the IRS send me a confirmation?", answer: "Usually, no. If you include a self-addressed stamped envelope and a cover letter requesting a date-stamped copy back, they sometimes will, but it is not guaranteed. Your Certified Mail receipt is your ultimate proof of filing." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
