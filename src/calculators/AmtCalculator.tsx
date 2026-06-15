"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
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

// 2. Pure calculation function (Using 2024 IRS brackets for AMT)
const calculateAmt = (inputs: typeof DEFAULTS): AmtResults => {
  const filingStatus = inputs.filingStatus; // "single", "mfj", "mfs", "hoh"
  const regularTaxableIncome = parseFloat(inputs.regularTaxableIncome);
  const regularTaxLiability = parseFloat(inputs.regularTaxLiability);
  const taxPreferenceItems = parseFloat(inputs.taxPreferenceItems);
  const stateLocalTaxes = parseFloat(inputs.stateLocalTaxes); // SALT added back to AMTI

  if ([regularTaxableIncome, regularTaxLiability, taxPreferenceItems, stateLocalTaxes].some(v => isNaN(v) || v < 0)) {
    return { amti: 0, exemption: 0, taxableAmti: 0, tentativeMinimumTax: 0, amtOwed: 0, totalTaxLiability: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }

  // Calculate AMTI (Alternative Minimum Taxable Income)
  // Simplified: Regular Taxable Income + Tax Preference Items + SALT
  const amti = regularTaxableIncome + taxPreferenceItems + stateLocalTaxes;

  // 2024 Exemption Amounts and Phase-out thresholds
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

  // Calculate Exemption Phase-out (reduced by 25 cents for every $1 AMTI is over the threshold)
  let exemption = exemptionBase;
  if (amti > phaseOutThreshold) {
    const reduction = (amti - phaseOutThreshold) * 0.25;
    exemption = Math.max(0, exemptionBase - reduction);
  }

  // Calculate Taxable AMTI
  const taxableAmti = Math.max(0, amti - exemption);

  // 2024 AMT Tax Brackets (26% and 28%)
  // The 28% rate applies to taxable AMTI over $232,600 for all statuses except MFS ($116,300 for MFS)
  const threshold28 = filingStatus === "mfs" ? 116300 : 232600;

  let tentativeMinimumTax = 0;
  if (taxableAmti <= threshold28) {
    tentativeMinimumTax = taxableAmti * 0.26;
  } else {
    tentativeMinimumTax = (threshold28 * 0.26) + ((taxableAmti - threshold28) * 0.28);
  }

  // AMT is only owed if TMT is greater than Regular Tax Liability
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

// 3. DEFAULTS object
const DEFAULTS = {
  filingStatus: "single", // "single", "mfj", "mfs", "hoh"
  regularTaxableIncome: "150000",
  regularTaxLiability: "28000",
  taxPreferenceItems: "20000", // e.g. ISO spread
  stateLocalTaxes: "15000",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

// 4. Component
export default function AmtCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AmtResults>(calculateAmt(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateAmt(newInputs);
      if (!r.isError) setResults(r);
    }
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
            <p className="text-sm text-muted-foreground mb-2">Estimate your 2024 Alternative Minimum Tax liability and see if your deductions trigger the AMT.</p>

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

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>AMT Preference Items</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="taxPreferenceItems" label="ISO Spread / Tax Pref" value={inputs.taxPreferenceItems} onChange={(v: string) => handleChange("taxPreferenceItems", v)} prefix="$" />
                  <CompactInput id="stateLocalTaxes" label="SALT Deductions" value={inputs.stateLocalTaxes} onChange={(v: string) => handleChange("stateLocalTaxes", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Tax Liability</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.totalTaxLiability.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.amtOwed > 0 ? 'border-destructive' : 'border-emerald-500'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">AMT Surcharge Owed</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.amtOwed > 0 ? 'text-destructive' : 'text-emerald-500'}`}>${results.amtOwed.toLocaleString()}</div>
                    </div>
                    {results.amtOwed === 0 && <div className="text-sm text-muted-foreground font-medium mt-1">You are not subject to AMT.</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">AMTI</div>
                    <div className="text-xl font-bold text-foreground">${results.amti.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">AMT Exemption</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">${results.exemption.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tentative Min Tax</div>
                    <div className="text-xl font-bold text-foreground">${results.tentativeMinimumTax.toLocaleString()}</div>
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
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">AMT Calculation Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row, idx) => (
                          <tr key={idx} className={`hover:bg-muted/20 transition-colors ${row.label.startsWith('=') ? 'bg-muted/10 font-bold border-t border-border' : ''} ${row.label === '= Alternative Minimum Tax Owed' ? 'text-destructive text-base border-t-2' : 'text-muted-foreground'}`}>
                            <td className="px-4 py-3 font-medium">{row.label.replace('=', '').trim()}</td>
                            <td className={`px-4 py-3 text-right ${row.label.startsWith('=') ? 'text-foreground' : ''}`}>
                              {row.value < 0 ? '-' : ''}${Math.abs(row.value).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What is the Alternative Minimum Tax (AMT)?</h2>
            <p>The Alternative Minimum Tax (AMT) is a parallel tax system established by the IRS to ensure that certain taxpayers—usually those with high incomes—pay at least a minimum amount of tax, regardless of the deductions, exemptions, and credits they use to reduce their regular income tax liability.</p>
            
            <h2>How AMT is Calculated</h2>
            <p>The calculation of your AMT requires figuring your tax liability under the regular tax system, then recalculating it under the AMT rules. The AMT rules require you to add back certain tax preference items to your regular taxable income. This creates your Alternative Minimum Taxable Income (AMTI). From the AMTI, you subtract an AMT Exemption (which phases out at high income levels). The remaining amount is subject to the AMT rates of 26% and 28%. The result is your Tentative Minimum Tax (TMT). If your TMT is higher than your regular tax, you pay the regular tax plus the difference (the AMT surcharge).</p>
            
            <h2>Common Tax Preference Items</h2>
            <p>Many deductions that are allowed under the regular tax code are completely disallowed under the AMT. The two most common triggers for the AMT are State and Local Taxes (SALT) and Incentive Stock Options (ISOs). When you exercise an ISO, the difference between the stock's Fair Market Value and your strike price is considered a tax preference item for AMT purposes, often triggering a massive unexpected tax bill before the stock is even sold.</p>
            
            <h2>2024 AMT Exemptions and Phase-Outs</h2>
            <p>The IRS provides a generous exemption amount to keep the AMT from affecting middle-class taxpayers, but this exemption phases out by $0.25 for every $1 of AMTI above a certain threshold. For 2024, the exemption for Single filers is $85,700 (phasing out starting at $609,350), and for Married Filing Jointly, it is $133,300 (phasing out starting at $1,218,700).</p>
            
            <h2>Practical Example</h2>
            <p>Suppose you are Single, have a regular taxable income of $150,000, and exercised ISOs with a "spread" of $50,000. Under regular tax, you don't pay tax on the ISO spread until you sell. Under AMT, your AMTI is $200,000. You subtract your $85,700 exemption, leaving a Taxable AMTI of $114,300. At a 26% rate, your TMT is $29,718. If your regular tax liability is only $25,000, you owe the $25,000 plus an AMT surcharge of $4,718, bringing your total tax liability to the TMT amount of $29,718.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amt-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
