"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw, ChevronDown } from "lucide-react";

interface AmtResults {
  amti: number;
  exemption: number;
  taxableAmti: number;
  tentativeMinimumTax: number;
  amtOwed: number;
  totalTaxLiability: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

const calculateAmt = (inputs: typeof DEFAULTS): AmtResults => {
  const filingStatus = inputs.filingStatus; 
  const regularTaxableIncome = parseFloat(inputs.regularTaxableIncome) || 0;
  const regularTaxLiability = parseFloat(inputs.regularTaxLiability) || 0;
  const taxPreferenceItems = parseFloat(inputs.taxPreferenceItems) || 0;
  const stateLocalTaxes = parseFloat(inputs.stateLocalTaxes) || 0; 

  if ([regularTaxableIncome, regularTaxLiability, taxPreferenceItems, stateLocalTaxes].some(v => isNaN(v) || v < 0)) {
    return { amti: 0, exemption: 0, taxableAmti: 0, tentativeMinimumTax: 0, amtOwed: 0, totalTaxLiability: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }

  const amti = regularTaxableIncome + taxPreferenceItems + stateLocalTaxes;

  let exemptionBase = 0;
  let phaseOutThreshold = 0;

  if (filingStatus === "single" || filingStatus === "hoh") {
    exemptionBase = 85700;
    phaseOutThreshold = 609350;
  } else if (filingStatus === "mfj") {
    exemptionBase = 133300;
    phaseOutThreshold = 1218700;
  } else if (filingStatus === "mfs") {
    exemptionBase = 66650;
    phaseOutThreshold = 609350;
  }

  let exemption = exemptionBase;
  if (amti > phaseOutThreshold) {
    const reduction = (amti - phaseOutThreshold) * 0.25;
    exemption = Math.max(0, exemptionBase - reduction);
  }

  const taxableAmti = Math.max(0, amti - exemption);

  const threshold28 = filingStatus === "mfs" ? 116300 : 232600;

  let tentativeMinimumTax = 0;
  if (taxableAmti <= threshold28) {
    tentativeMinimumTax = taxableAmti * 0.26;
  } else {
    tentativeMinimumTax = (threshold28 * 0.26) + ((taxableAmti - threshold28) * 0.28);
  }

  const amtOwed = Math.max(0, tentativeMinimumTax - regularTaxLiability);
  const totalTaxLiability = regularTaxLiability + amtOwed;

  const chartData = [
    { name: "Regular Tax", value: regularTaxLiability },
    { name: "AMT Surcharge", value: amtOwed }
  ];

  const schedule = [
    { label: "Regular Taxable Income", value: regularTaxableIncome },
    { label: "+ Tax Preference Items", value: taxPreferenceItems },
    { label: "+ State & Local Taxes (SALT)", value: stateLocalTaxes },
    { label: "= AMTI", value: amti },
    { label: "- Exemption Allowed", value: exemption },
    { label: "= Taxable AMTI", value: taxableAmti },
    { label: "Tentative Minimum Tax (TMT)", value: tentativeMinimumTax },
    { label: "- Regular Tax Liability", value: regularTaxLiability },
    { label: "= Alternative Minimum Tax Owed", value: amtOwed }
  ];

  return {
    amti: Math.round(amti),
    exemption: Math.round(exemption),
    taxableAmti: Math.round(taxableAmti),
    tentativeMinimumTax: Math.round(tentativeMinimumTax),
    amtOwed: Math.round(amtOwed),
    totalTaxLiability: Math.round(totalTaxLiability),
    chartData: chartData.filter(d => d.value > 0),
    schedule,
    isError: false
  };
};

const DEFAULTS = {
  filingStatus: "single", 
  regularTaxableIncome: "150000",
  regularTaxLiability: "28000",
  taxPreferenceItems: "20000", 
  stateLocalTaxes: "15000",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

export default function AmtCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AmtResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateAmt(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateAmt(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAmt(DEFAULTS));
  };

  const faqs = [
    { question: "What is the Alternative Minimum Tax (AMT)?", answer: "The AMT is a parallel tax system designed to ensure that high-income individuals and corporations pay at least a minimum amount of tax, regardless of the deductions and credits they claim under the regular tax system." },
    { question: "How do I know if I have to pay AMT?", answer: "You owe AMT if your Tentative Minimum Tax (TMT) is higher than your regular tax liability. Your TMT is calculated by taking your regular taxable income, adding back certain non-deductible tax preference items (like SALT and ISO spreads), subtracting an exemption amount, and applying the AMT tax rates (26% and 28%)." },
    { question: "What are tax preference items?", answer: "Tax preference items are deductions allowed under the regular tax system but not under the AMT system. Common examples include State and Local Taxes (SALT), the bargain element (spread) of Incentive Stock Options (ISOs) exercised but not sold, and interest on certain private activity bonds." },
    { question: "Do Incentive Stock Options (ISOs) trigger AMT?", answer: "Yes, frequently. When you exercise an ISO and hold the stock, the difference between the fair market value of the stock at exercise and the strike price you paid is a tax preference item for AMT purposes, even though it's not subject to regular income tax until you sell the stock." },
    { question: "Can I get the AMT money back?", answer: "In some cases, yes. If you pay AMT due to a deferral item (like an ISO exercise), you generate an AMT credit. You can use this credit in future years to lower your regular tax liability down to your AMT liability level." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "AMT Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Alternative Minimum Tax (AMT) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="filingStatus" label="Filing Status" value={inputs.filingStatus} onChange={(v: string) => handleChange("filingStatus", v)} options={[
                { label: "Single", value: "single" },
                { label: "Married Filing Jointly", value: "mfj" },
                { label: "Married Filing Separately", value: "mfs" },
                { label: "Head of Household", value: "hoh" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="regularTaxableIncome" label="Regular Taxable Income" value={inputs.regularTaxableIncome} onChange={(v: string) => handleChange("regularTaxableIncome", v)} prefix="$" />
              <CompactInput id="regularTaxLiability" label="Regular Tax Liability" value={inputs.regularTaxLiability} onChange={(v: string) => handleChange("regularTaxLiability", v)} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                AMT Preference Items <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="taxPreferenceItems" label="ISO Spread" value={inputs.taxPreferenceItems} onChange={(v: string) => handleChange("taxPreferenceItems", v)} prefix="$" />
                  <CompactInput id="stateLocalTaxes" label="SALT Deductions" value={inputs.stateLocalTaxes} onChange={(v: string) => handleChange("stateLocalTaxes", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results && (
              results.isError ? (
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                  <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Final Tax Liability</div>
                      <div className="flex items-end gap-3 mb-1">
                        <div className="text-4xl font-bold text-primary tracking-tighter">${results.totalTaxLiability.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className={`bg-card border border-border rounded-lg p-5 relative shadow-sm border-l-4 ${results.amtOwed > 0 ? 'border-destructive' : 'border-emerald-500'}`}>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">AMT Surcharge Owed</div>
                      <div className="flex items-end gap-3 mb-1">
                        <div className={`text-4xl font-bold tracking-tighter ${results.amtOwed > 0 ? 'text-destructive' : 'text-emerald-500'}`}>${results.amtOwed.toLocaleString()}</div>
                      </div>
                      {results.amtOwed === 0 && <div className="text-sm text-muted-foreground font-medium mt-1">You are not subject to AMT.</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                    <div className="p-4 text-center">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">AMTI</div>
                      <div className="text-lg font-bold text-foreground">${results.amti.toLocaleString()}</div>
                    </div>
                    <div className="p-4 text-center border-l border-border">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">AMT Exemption</div>
                      <div className="text-lg font-bold text-emerald-600">${results.exemption.toLocaleString()}</div>
                    </div>
                    <div className="p-4 text-center border-l border-border">
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Tentative Min Tax</div>
                      <div className="text-lg font-bold text-foreground">${results.tentativeMinimumTax.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-1/2 h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-3">
                      <h3 className="text-base font-semibold text-foreground">Tax Breakdown</h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Regular Tax Liability:</span>
                        <span className="font-bold text-primary">${parseFloat(inputs.regularTaxLiability).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Additional AMT Surcharge:</span>
                        <span className="font-bold text-destructive">${results.amtOwed.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-px bg-border my-1"></div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-foreground">Total Final Liability:</span>
                        <span className="font-bold text-foreground">${results.totalTaxLiability.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                      <h3 className="text-base font-bold text-foreground">AMT Calculation Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-base text-left">
                        <tbody className="divide-y divide-border/50">
                          {results.schedule.map((row, idx) => (
                            <tr key={idx} className={`hover:bg-muted/20 transition-colors ${row.label.startsWith('=') ? 'bg-muted/10 font-bold border-t border-border' : ''} ${row.label === '= Alternative Minimum Tax Owed' ? 'text-destructive font-bold border-t-2' : 'text-muted-foreground'}`}>
                              <td className="px-4 py-2.5">{row.label.replace('=', '').trim()}</td>
                              <td className={`px-4 py-2.5 text-right ${row.label.startsWith('=') ? 'text-foreground' : ''}`}>
                                {row.value < 0 ? '-' : ''}${Math.abs(row.value).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <section className="mt-12 space-y-8 text-base text-foreground">
              <div>
                <h2 className="text-2xl font-bold mb-3">Understanding the Alternative Minimum Tax (AMT)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Alternative Minimum Tax (AMT) is a parallel tax system implemented by the Internal Revenue Service (IRS) to ensure that certain taxpayers—predominantly those with higher incomes—pay at least a minimum baseline of federal income tax. Before the AMT was established, some wealthy taxpayers were able to leverage numerous legal deductions, exemptions, and specialized tax credits to aggressively reduce their federal tax liability to zero. The AMT acts as a safety net for the IRS, requiring you to calculate your taxes twice: once under the regular tax code, and once under the AMT code. You are legally required to pay whichever amount is higher.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Under the AMT system, many of the standard deductions and tax benefits you rely on are completely disallowed or strictly limited. These disallowed deductions are added back to your taxable income as "Tax Preference Items" to create a new baseline number known as the Alternative Minimum Taxable Income (AMTI). 
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">The Mechanics of the AMT Calculation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The calculation of your AMT liability requires a multi-step process. First, you calculate your standard regular tax liability. Then, you calculate your AMTI by taking your regular taxable income and adding back the disallowed tax preference items. From this AMTI, you are allowed to subtract an "AMT Exemption." This exemption is a fixed dollar amount set by the IRS, but crucially, it begins to phase out (reduce) rapidly if your AMTI crosses a certain high-income threshold.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Once the exemption is subtracted, the resulting number is your Taxable AMTI. This number is then subjected to the two AMT tax brackets: 26% and 28%. The result of this calculation is your Tentative Minimum Tax (TMT). The final step is comparing your TMT to your regular tax liability. If your regular tax is $30,000 but your TMT is $45,000, you owe your regular tax *plus* an AMT Surcharge of $15,000, bringing your total federal payment to $45,000.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Common Triggers: SALT and ISOs</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While there are numerous tax preference items, the vast majority of AMT surprises are triggered by two specific elements: State and Local Taxes (SALT) and Incentive Stock Options (ISOs). Under the regular tax code, you can often deduct the state income taxes and local property taxes you pay. Under the AMT, the SALT deduction is completely disallowed. If you live in a high-tax state (like California or New York) and earn a high income, the disallowed SALT deduction aggressively pushes up your AMTI.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Incentive Stock Options (ISOs) are arguably the most dangerous AMT trigger for tech workers. When you exercise an ISO, the difference between the stock's Fair Market Value on the day of exercise and the strike price you paid is called the "spread." Under the regular tax code, this spread is not taxed until you actually sell the stock. However, under the AMT code, this paper profit is treated as immediate income. This can result in a devastating scenario where you owe tens of thousands of dollars in AMT taxes on stock you haven't even sold yet—and if the stock price drops before you can sell, you could owe more in taxes than the stock is actually worth.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">2024 Exemption Amounts and Phase-Outs</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To prevent the AMT from punishing middle-class taxpayers, the IRS provides an AMT Exemption. For the 2024 tax year, the exemption amount for Single filers is $85,700, and for Married Filing Jointly, it is $133,300. As long as your AMTI is relatively low, this exemption zeroes out the AMT.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  However, the exemption is not permanent. It begins to "phase out" (disappear) at a rate of 25 cents for every $1 that your AMTI exceeds the phase-out threshold. For 2024, the phase-out threshold begins at $609,350 for Single filers and $1,218,700 for Married Filing Jointly. If your income pushes past these limits—perhaps due to a massive ISO exercise or a business sale—your exemption shrinks, rapidly exposing more of your income to the 28% AMT rate.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Strategic Tax Planning to Avoid AMT</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Because the AMT is triggered by specific actions, proactive tax planning can often mitigate or entirely avoid the surcharge. If you hold ISOs, the most common strategy is to spread your stock exercises over multiple calendar years. By exercising a smaller amount of options each year, you can intentionally keep the "spread" preference item low enough that it falls below the AMT Exemption threshold.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Additionally, if you find yourself paying the AMT because of a "deferral item" like an ISO exercise (where you pay tax now on a gain you will realize later), the IRS grants you an AMT Credit. This credit can be carried forward into future tax years. In years where your regular tax is higher than your TMT, you can apply this credit to reduce your regular tax down to the TMT line, effectively recovering the AMT you were forced to pay in the past. Always consult with a Certified Public Accountant (CPA) when navigating ISO exercises and AMT credits.
                </p>
              </div>
            </section>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amt-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
