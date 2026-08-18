"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, PiggyBank } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RothIraCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [annualContribution, setAnnualContribution] = useState("7000");
  const [currentBalance, setCurrentBalance] = useState("10000");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [showResults, setShowResults] = useState(false);

  const age = parseFloat(currentAge) || 0;
  const retAge = parseFloat(retirementAge) || 0;
  const contribution = parseFloat(annualContribution) || 0;
  const balance = parseFloat(currentBalance) || 0;
  const r = (parseFloat(annualReturn) || 0) / 100;
  const years = Math.max(0, retAge - age);

  const fvCurrentBalance = balance * Math.pow(1 + r, years);
  const fvContributions = r > 0 ? contribution * ((Math.pow(1 + r, years) - 1) / r) : contribution * years;
  const totalFV = fvCurrentBalance + fvContributions;
  const totalContributed = balance + contribution * years;
  const taxFreeGrowth = totalFV - totalContributed;
  const annualWithdrawal = totalFV * 0.04;
  const monthlyWithdrawal = annualWithdrawal / 12;
  const growthMultiple = totalContributed > 0 ? totalFV / totalContributed : 0;

  const chartData = [];
  for (let y = 0; y <= years; y++) {
    const bal = balance * Math.pow(1 + r, y) + (r > 0 ? contribution * ((Math.pow(1 + r, y) - 1) / r) : contribution * y);
    chartData.push({ age: Math.round(age + y), balance: Math.round(bal) });
  }

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setCurrentAge("30");
    setRetirementAge("65");
    setAnnualContribution("7000");
    setCurrentBalance("10000");
    setAnnualReturn("7");
    setShowResults(false);
  };

  const faqs = [
    { question: "How does a Roth IRA work?", answer: "Contributions are made with after-tax dollars, grow completely tax-free, and qualified withdrawals in retirement are tax-free — including all the growth. Unlike a Traditional IRA, there are no Required Minimum Distributions during your lifetime, so the money can compound untouched." },
    { question: "What are the contribution and income limits?", answer: "For 2024 the contribution limit is $7,000 ($8,000 if 50+), but eligibility phases out by income: single filers can contribute fully below $146,000 and partially to $161,000; married couples filing jointly from $230,000 to $240,000. Above those ranges, a backdoor Roth conversion is the usual workaround." },
    { question: "When can I withdraw earnings tax-free?", answer: "A qualified distribution requires the account to be open at least 5 years AND you to be 59½ or older (or disabled, or a first-time homebuyer up to $10,000). Contributions can be withdrawn anytime without tax or penalty because they were already taxed." },
    { question: "What is a backdoor Roth?", answer: "A legal two-step for high earners: contribute after-tax to a Traditional IRA, then convert it to a Roth. Because the contribution was non-deductible, the conversion is nearly tax-free. Anyone can do it regardless of income, but pro-rata rules can complicate it if you have existing pre-tax IRA balances." },
    { question: "Roth or Traditional — which should I pick?", answer: "Roth wins if you expect higher taxes in retirement, want tax-free income, or dislike RMDs. Traditional wins if today's rate exceeds tomorrow's. Young earners in low brackets are usually better off in a Roth, since they lock in a low rate for decades of tax-free growth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Roth IRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Roth IRA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <PiggyBank className="w-4 h-4" /> Tax-Free Growth
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Current Age</label>
                <input id="rira-age" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} min={16} max={80} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Retirement Age</label>
                <input id="rira-retire" type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} min={50} max={75} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Contribution ($)</label>
                <input id="rira-contrib" type="number" value={annualContribution} onChange={(e) => setAnnualContribution(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Current Balance ($)</label>
                <input id="rira-balance" type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Expected Annual Return (%)</label>
                <input id="rira-return" type="number" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} min={0} max={25} className="input-calc" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Tax-Free Balance at {retAge}</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(totalFV)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(taxFreeGrowth)} of tax-free growth · {fmt(monthlyWithdrawal)}/mo via the 4% rule
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax-Free Growth</p>
                    <p className="text-2xl font-bold text-primary">{fmt(taxFreeGrowth)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual Withdrawal</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(annualWithdrawal)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Growth Multiple</p>
                    <p className="text-2xl font-bold text-green-600">{growthMultiple.toFixed(2)}×</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Metric</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Tax-Free Balance</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(totalFV)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Years of Growth</td>
                        <td className="py-2.5 px-3 text-right">{years} yrs</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Contributed</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalContributed)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Tax-Free Growth</td>
                        <td className="py-2.5 px-3 text-right">{fmt(taxFreeGrowth)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Annual Withdrawal (4% Rule)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(annualWithdrawal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Monthly Withdrawal</td>
                        <td className="py-2.5 px-3 text-right">{fmt(monthlyWithdrawal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Projected Growth to Age {retAge}</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
                        <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Contribution / Year</span>
                      <span className="font-medium">{fmt(contribution)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Return</span>
                      <span className="font-medium">{r * 100}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Total Contributed</span>
                      <span className="font-medium">{fmt(totalContributed)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Tax-Free Growth</span>
                      <span className="font-medium">{fmt(taxFreeGrowth)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Withdrawal (4% Rule)</span>
                      <span className="font-medium">{fmt(annualWithdrawal)}/yr</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Monthly Income</span>
                      <span className="font-medium">{fmt(monthlyWithdrawal)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your age, contributions, and expected return, then click <strong className="text-foreground">Calculate</strong> to project your tax-free balance and retirement income.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why the Roth Is Powerful</h2>
            <p>Contributions are made after tax, but every dollar of growth comes out tax-free in retirement. A $10,000 balance plus $7,000/year at 7% from age 30 to 65 grows to roughly $1.07M — and unlike a Traditional IRA, no tax is due on withdrawals, and there are no RMDs during your lifetime.</p>
            <h3>The Compounding Advantage</h3>
            <p>The tax-free growth line is where the Roth shines: in the worked example, more than $900,000 of the $1.07M balance is growth that would be taxed in a Traditional IRA. Because Roth dollars are worth more per nominal dollar than pre-tax dollars, $1M in a Roth effectively outspends $1M in a Traditional IRA at the same nominal value.</p>
            <h3>Estate and Flexibility Benefits</h3>
            <p>No RMDs means the account can pass to heirs intact, who can stretch withdrawals over their own lifetimes. Contributions (not growth) can be withdrawn anytime penalty-free, making the Roth a powerful emergency-fund layer. For most young savers, maxing the Roth before a Traditional IRA is the default right answer.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roth-ira-calculator" />
          <PopularCalculators exclude="/calculator/roth-ira-calculator" />
        </div>
      </div>
    </>
  );
}
