"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface BackdoorRothResults {
  totalBalance: number;
  taxFreePercentage: number;
  taxFreeConversion: number;
  taxableConversion: number;
  estimatedTax: number;
  canContributeDirectly: boolean;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBackdoorRoth = (inputs: typeof DEFAULTS): BackdoorRothResults => {
  const grossIncome = parseFloat(inputs.grossIncome);
  const contributionAmount = parseFloat(inputs.contributionAmount);
  const existingPreTaxIraBalance = parseFloat(inputs.existingPreTaxIraBalance);
  const existingAfterTaxBasis = parseFloat(inputs.existingAfterTaxBasis);
  const estimatedTaxRate = parseFloat(inputs.estimatedTaxRate) / 100;
  const filingStatus = inputs.filingStatus; // "single", "mfj"

  if ([grossIncome, contributionAmount, existingPreTaxIraBalance, existingAfterTaxBasis, estimatedTaxRate].some(v => isNaN(v) || v < 0)) {
    return { totalBalance: 0, taxFreePercentage: 0, taxFreeConversion: 0, taxableConversion: 0, estimatedTax: 0, canContributeDirectly: false, chartData: [], isError: true, errorMsg: "All inputs must be valid numbers." };
  }
  if (estimatedTaxRate > 1) {
    return { totalBalance: 0, taxFreePercentage: 0, taxFreeConversion: 0, taxableConversion: 0, estimatedTax: 0, canContributeDirectly: false, chartData: [], isError: true, errorMsg: "Tax rate cannot exceed 100%." };
  }

  // 2024 direct Roth IRA contribution limits (MAGI phase-out)
  // Single: $146,000 - $161,000
  // MFJ: $230,000 - $240,000
  let canContributeDirectly = false;
  if (filingStatus === "single" && grossIncome < 146000) {
    canContributeDirectly = true;
  } else if (filingStatus === "mfj" && grossIncome < 230000) {
    canContributeDirectly = true;
  }

  // Total Non-Deductible Basis = Existing Basis + New Contribution
  const totalBasis = existingAfterTaxBasis + contributionAmount;
  
  // Total IRA Balance on Dec 31 (Assuming the conversion happens immediately so no earnings on the new contribution)
  const totalBalance = existingPreTaxIraBalance + existingAfterTaxBasis + contributionAmount;

  let taxFreePercentage = 0;
  let taxFreeConversion = 0;
  let taxableConversion = 0;
  let estimatedTax = 0;

  if (totalBalance > 0) {
    // Pro-Rata Rule: Tax-Free % = Total Non-Deductible Basis / Total IRA Balance
    taxFreePercentage = totalBasis / totalBalance;
    
    // We are converting the exact amount of the new contribution
    taxFreeConversion = contributionAmount * taxFreePercentage;
    taxableConversion = contributionAmount - taxFreeConversion;
    
    estimatedTax = taxableConversion * estimatedTaxRate;
  }

  const chartData = [
    { name: "Tax-Free Conversion", value: Math.round(taxFreeConversion) },
    { name: "Taxable Conversion", value: Math.round(taxableConversion) }
  ];

  return {
    totalBalance: Math.round(totalBalance),
    taxFreePercentage: Number((taxFreePercentage * 100).toFixed(2)),
    taxFreeConversion: Math.round(taxFreeConversion),
    taxableConversion: Math.round(taxableConversion),
    estimatedTax: Math.round(estimatedTax),
    canContributeDirectly,
    chartData: chartData.filter(d => d.value > 0),
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  filingStatus: "single",
  grossIncome: "180000",
  contributionAmount: "7000",
  existingPreTaxIraBalance: "20000",
  existingAfterTaxBasis: "0",
  estimatedTaxRate: "24",
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

const COLORS = ['hsl(var(--emerald-500))', 'hsl(var(--destructive))'];

// 4. Component
export default function BackdoorRothIraCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BackdoorRothResults>(calculateBackdoorRoth(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateBackdoorRoth(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBackdoorRoth(DEFAULTS));
  };

  const faqs = [
    { question: "What is a Backdoor Roth IRA?", answer: "A Backdoor Roth IRA is a legal tax strategy used by high-income earners who exceed the IRS income limits for contributing directly to a Roth IRA. It involves making a non-deductible contribution to a Traditional IRA and then immediately converting those funds into a Roth IRA." },
    { question: "What is the Pro-Rata Rule?", answer: "The IRS looks at all your Traditional, SEP, and SIMPLE IRAs combined when determining taxes on a Roth conversion. You cannot choose to convert only your 'after-tax' money. If your total IRA balances consist of 80% pre-tax money and 20% after-tax money, any conversion you do will be 80% taxable, regardless of which account you convert from." },
    { question: "How do I avoid the Pro-Rata rule taxes?", answer: "The most common strategy is to 'hide' your pre-tax IRA money by rolling your Traditional IRA balances into your current employer's 401(k) plan, if the plan allows it. 401(k) balances are ignored by the pro-rata rule. Once your Traditional IRA balance is $0, your backdoor Roth conversion will be 100% tax-free." },
    { question: "What is the contribution limit for 2024?", answer: "The maximum IRA contribution limit for 2024 is $7,000, or $8,000 if you are age 50 or older." },
    { question: "Can I do a Backdoor Roth if I already maxed out my 401(k)?", answer: "Yes! IRA contribution limits are completely separate from 401(k) contribution limits. You can max out your 401(k) and still execute a Backdoor Roth IRA conversion." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Backdoor Roth IRA Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Backdoor Roth IRA Calculator (Pro-Rata)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Calculate the tax implications of a backdoor Roth conversion and the impact of the Pro-Rata rule.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="filingStatus" label="Filing Status" value={inputs.filingStatus} onChange={(v: string) => handleChange("filingStatus", v)} options={[
                { label: "Single", value: "single" },
                { label: "Married Filing Jointly", value: "mfj" }
              ]} />
              <CompactInput id="grossIncome" label="Estimated MAGI" value={inputs.grossIncome} onChange={(v: string) => handleChange("grossIncome", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="contributionAmount" label="New Non-Deductible Contribution" value={inputs.contributionAmount} onChange={(v: string) => handleChange("contributionAmount", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Existing IRA Balances (Pre-Conversion)</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="existingPreTaxIraBalance" label="Existing Pre-Tax IRA Balance (Traditional, SEP, SIMPLE)" value={inputs.existingPreTaxIraBalance} onChange={(v: string) => handleChange("existingPreTaxIraBalance", v)} prefix="$" />
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="existingAfterTaxBasis" label="Existing After-Tax Basis" value={inputs.existingAfterTaxBasis} onChange={(v: string) => handleChange("existingAfterTaxBasis", v)} prefix="$" />
                    <CompactInput id="estimatedTaxRate" label="Est. Tax Rate" value={inputs.estimatedTaxRate} onChange={(v: string) => handleChange("estimatedTaxRate", v)} suffix="%" />
                  </div>
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
                {results.canContributeDirectly && (
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-4 mb-2">
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1">Direct Contribution Allowed</div>
                    <div className="text-sm font-medium text-foreground">Based on your MAGI and filing status, you are under the IRS limits and can contribute directly to a Roth IRA. A backdoor conversion is not necessary.</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Tax-Free Conversion</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.taxFreeConversion.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.taxableConversion > 0 ? 'border-destructive' : 'border-emerald-500'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Taxable Conversion</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.taxableConversion > 0 ? 'text-destructive' : 'text-emerald-500'}`}>${results.taxableConversion.toLocaleString()}</div>
                    </div>
                    {results.taxableConversion > 0 && <div className="text-sm text-muted-foreground font-medium mt-1">Est. Taxes Owed: <span className="font-bold text-foreground">${results.estimatedTax.toLocaleString()}</span></div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total IRA Balance</div>
                    <div className="text-xl font-bold text-foreground">${results.totalBalance.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Non-Deductible Basis</div>
                    <div className="text-xl font-bold text-foreground">${(parseFloat(inputs.existingAfterTaxBasis) + parseFloat(inputs.contributionAmount)).toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tax-Free Ratio</div>
                    <div className={`text-xl font-bold ${results.taxFreePercentage === 100 ? 'text-emerald-600 dark:text-emerald-500' : 'text-orange-500'}`}>{results.taxFreePercentage}%</div>
                  </div>
                </div>

                {results.chartData.length > 0 && parseFloat(inputs.existingPreTaxIraBalance) > 0 && (
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
                      <h3 className="text-base font-semibold text-foreground text-destructive">Pro-Rata Rule Warning</h3>
                      <p className="text-sm text-muted-foreground">Because you have existing pre-tax funds in a Traditional IRA, the IRS forces you to aggregate all balances. You cannot choose to only convert the new non-deductible contribution.</p>
                      <div className="p-3 bg-muted/30 rounded-md border border-border mt-2">
                        <div className="text-xs font-bold uppercase tracking-wider mb-1">Solution</div>
                        <p className="text-sm">To make this conversion 100% tax-free, you must roll your $<strong>{parseFloat(inputs.existingPreTaxIraBalance).toLocaleString()}</strong> pre-tax balance into an employer 401(k) before December 31st of the conversion year.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What is a Backdoor Roth IRA?</h2>
            <p>The IRS imposes income limits on who can contribute directly to a Roth IRA. In 2024, if you are single and earn over $161,000 (or Married Filing Jointly and earn over $240,000), you are barred from making direct contributions. However, the "Backdoor Roth" strategy allows high earners to legally bypass these limits.</p>
            
            <h2>How the Backdoor Roth Works</h2>
            <p>The process involves two steps: First, you make a "non-deductible" contribution to a Traditional IRA. Unlike direct Roth contributions, there are no income limits for contributing to a Traditional IRA (though your income dictates whether you can deduct it from your taxes). Second, you immediately convert that Traditional IRA balance into a Roth IRA. Because you already paid taxes on the initial non-deductible contribution, the conversion is tax-free.</p>
            
            <h2>The Pro-Rata Rule Trap</h2>
            <p>The biggest pitfall of the Backdoor Roth strategy is the IRS <strong>Pro-Rata rule</strong>. When you execute a Roth conversion, the IRS looks at the aggregate total of <em>all</em> your Traditional, SEP, and SIMPLE IRAs across all brokerages as of December 31st of that year. You are not allowed to choose to only convert your "after-tax" money.</p>
            <p>If you have $93,000 of old pre-tax 401(k) money rolled into a Traditional IRA, and you make a new $7,000 non-deductible contribution, your total IRA balance is $100,000. That balance is 93% pre-tax and 7% after-tax. When you convert $7,000 to a Roth IRA, the IRS dictates that the conversion must also be 93% taxable and 7% tax-free. You will owe income tax on 93% of the converted amount, defeating the purpose of the strategy.</p>
            
            <h2>How to Avoid the Pro-Rata Rule</h2>
            <p>To successfully execute a tax-free backdoor Roth conversion, your total pre-tax IRA balance on December 31st must be $0. The most common way to achieve this is to do a "reverse rollover," where you roll all your existing pre-tax Traditional IRA balances into your current employer's active 401(k) plan. 401(k) balances are completely ignored by the pro-rata rule calculation.</p>
            
            <h2>Important Deadlines</h2>
            <p>While you can make prior-year IRA contributions up until Tax Day (usually April 15th), a Roth <em>conversion</em> is strictly tied to the calendar year it is performed in. Furthermore, the IRS checks your Traditional IRA balance for the pro-rata calculation on December 31st of the year the conversion takes place.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/backdoor-roth-ira-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
