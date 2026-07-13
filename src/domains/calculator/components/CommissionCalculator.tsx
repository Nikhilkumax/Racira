"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import PieChart from "@/domains/calculator/components/ui/PieChart";
import { RotateCcw, Plus, Trash2, DollarSign, Percent, TrendingUp, Calculator } from "lucide-react";

interface CommissionTier {
  min: string;
  max: string;
  rate: string;
}

const CommissionCalculator = () => {
  const [salesAmount, setSalesAmount] = useState("50000");
  const [baseRate, setBaseRate] = useState("5");
  const [baseSalary, setBaseSalary] = useState("3000");
  const [useTiers, setUseTiers] = useState(false);
  const [tiers, setTiers] = useState<CommissionTier[]>([
    { min: "0", max: "20000", rate: "5" },
    { min: "20000", max: "50000", rate: "8" },
    { min: "50000", max: "", rate: "12" },
  ]);

  const [results, setResults] = useState<{
    commission: number;
    totalPay: number;
    effectiveRate: number;
    tierDetails: { tier: string; amount: number; rate: number }[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const totalSales = parseFloat(salesAmount) || 0;
    const salary = parseFloat(baseSalary) || 0;
    
    let commission = 0;
    const tierDetails: { tier: string; amount: number; rate: number }[] = [];

    if (!useTiers) {
      const rate = parseFloat(baseRate) || 0;
      commission = (totalSales * rate) / 100;
      tierDetails.push({ tier: "Flat Rate", amount: commission, rate });
    } else {
      let remainingSales = totalSales;
      tiers.forEach((t, i) => {
        if (remainingSales <= 0) return;
        const min = parseFloat(t.min) || 0;
        const max = t.max === "" ? Infinity : (parseFloat(t.max) || 0);
        const rate = (parseFloat(t.rate) || 0) / 100;
        
        const tierSize = max - min;
        const salesInTier = Math.min(remainingSales, tierSize);
        
        if (salesInTier > 0) {
          const tierComm = salesInTier * rate;
          commission += tierComm;
          tierDetails.push({ 
            tier: `${t.min}${t.max ? " - "+t.max : "+"}`, 
            amount: tierComm, 
            rate: rate * 100 
          });
          remainingSales -= salesInTier;
        }
      });
    }

    setResults({
      commission,
      totalPay: commission + salary,
      effectiveRate: totalSales > 0 ? (commission / totalSales) * 100 : 0,
      tierDetails
    });
  };

  const addTier = () => setTiers([...tiers, { min: "", max: "", rate: "" }]);
  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));
  const updateTier = (index: number, field: keyof CommissionTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const reset = () => {
    setShowResults(false);
    setSalesAmount("50000"); setBaseRate("5"); setBaseSalary("3000"); setUseTiers(false);
    setResults(null);
  };

  const faqs = [
    { question: "What is a commission calculator?", answer: "A commission calculator determines the amount of money an employee or agent earns based on their sales volume. It can handle simple flat-rate commissions or complex tiered structures where the rate increases as higher sales targets are met." },
    { question: "How is tiered commission calculated?", answer: "In a tiered structure, different rates apply to different portions of the total sales. For example, you might earn 5% on the first $10,000 and 10% on anything above that. If you sold $15,000, you'd earn $500 (5% of $10k) + $500 (10% of $5k), for a total of $1,000." },
    { question: "What is a draw against commission?", answer: "A draw is an advance payment made to a salesperson, which is later deducted from their earned commissions. If they earn more than the draw, they keep the difference. If they earn less, they may owe the 'deficit' back to the company depending on if it is a 'recoverable' or 'non-recoverable' draw." },
    { question: "What is a flat commission rate?", answer: "A flat rate is a fixed percentage paid on every dollar of sales, regardless of the total volume. It is the simplest commission structure to calculate and manage." },
    { question: "Should I include base salary in the calculation?", answer: "Yes, if you receive a fixed monthly or annual salary in addition to your commissions, adding it to the calculation gives you a complete picture of your total 'gross pay' or 'on-target earnings' (OTE)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Commission Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sales Commission Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                    <InputField id="sales" label="Total Sales Amount" value={salesAmount} onChange={setSalesAmount} prefix="$" tooltip="The total dollar amount of sales generated." />
                    <InputField id="salary" label="Base Salary (Optional)" value={baseSalary} onChange={setBaseSalary} prefix="$" tooltip="Your fixed monthly or per-period salary." />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                    <button 
                        onClick={() => setUseTiers(false)} 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!useTiers ? "bg-primary text-white" : "text-muted-foreground"}`}
                    >
                        Flat Rate
                    </button>
                    <button 
                        onClick={() => setUseTiers(true)} 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${useTiers ? "bg-primary text-white" : "text-muted-foreground"}`}
                    >
                        Tiered Rates
                    </button>
                </div>

                {!useTiers ? (
                    <InputField id="rate" label="Commission Rate" value={baseRate} onChange={setBaseRate} suffix="%" tooltip="Fixed percentage earned on all sales." />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Commission Tiers</h3>
                            <button onClick={addTier} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"><Plus className="h-3 w-3" /> Add Tier</button>
                        </div>
                        {tiers.map((tier, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-end">
                                <InputField id={`min-${index}`} label="From ($)" value={tier.min} onChange={(v) => updateTier(index, "min", v)} />
                                <InputField id={`max-${index}`} label="To ($)" value={tier.max} onChange={(v) => updateTier(index, "max", v)} placeholder="∞" />
                                <InputField id={`rate-${index}`} label="Rate (%)" value={tier.rate} onChange={(v) => updateTier(index, "rate", v)} />
                                <button onClick={() => removeTier(index)} className="p-3 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="p-4 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Earnings Breakdown</h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Commission</p>
                        <p className="text-5xl font-black text-foreground">${results.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-secondary/10 border border-border text-center flex flex-col justify-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Pay (Gross)</p>
                        <p className="text-3xl font-black text-foreground">${results.totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Key Stats</h3>
                        <ResultDisplay items={[
                            { label: "Effective Comm. Rate", value: 0, textValue: results.effectiveRate.toFixed(2) + "%" },
                            { label: "Base Salary", value: parseFloat(baseSalary) },
                            { label: "Sales Volume", value: parseFloat(salesAmount) },
                        ]} />
                    </div>
                    <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Tier Breakdown</h3>
                        <div className="space-y-2">
                            {results.tierDetails.map((td, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 text-sm">
                                    <span className="text-muted-foreground">{td.tier} <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">{td.rate}%</span></span>
                                    <span className="font-bold">${td.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-border flex justify-center">
                    <PieChart segments={[
                        { label: "Commission", value: results.commission, color: "hsl(var(--primary))" },
                        { label: "Base Salary", value: parseFloat(baseSalary) || 0.0001, color: "hsl(var(--secondary))" },
                    ]} size={160} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">A Comprehensive Guide to Sales Commission Structures</h2>
              <p>Commission is a powerful motivator in sales, aligning the interests of the salesperson with those of the company. However, not all commission structures are created equal. Whether you are a business owner designing a new comp plan or a sales professional trying to forecast your next paycheck, understanding the mechanics of these calculations is essential.</p>
              
              <h2 className="text-2xl font-bold mb-3">Common Types of Commission Models</h2>
              <p>Depending on the industry and the complexity of the product, companies use various models to reward their sales teams:</p>
              <ul>
                <li><strong>Flat Rate Commission:</strong> The simplest model where a fixed percentage (e.g., 5%) is paid on every sale.</li>
                <li><strong>Tiered Commission:</strong> Encourages high performance by increasing the commission rate as the salesperson hits specific volume targets. For example, 5% on the first $50k, 7% on the next $50k, and 10% on everything above $100k.</li>
                <li><strong>Base Plus Commission:</strong> Provides the security of a fixed monthly salary while still offering the upside of sales performance. This is the most common model for full-time B2B sales roles.</li>
                <li><strong>Straight Commission:</strong> No base salary is provided; the salesperson only earns what they kill. This offers the highest risk but typically the highest commission percentages.</li>
                <li><strong>Gross Margin Commission:</strong> Instead of paying on the total sale price, the company pays on the profit margin. This prevents salespeople from discounting too heavily just to "close the deal."</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">How to Use This Commission Calculator</h2>
              <p>To calculate your earnings, first enter your total sales volume for the period. If you receive a base salary, enter that amount as well. If your company uses a tiered structure, toggle to the "Tiered Rates" view and enter your specific brackets. The calculator will automatically apply the correct rates to each portion of your sales and provide a detailed breakdown of your total gross pay.</p>

              <h2 className="text-2xl font-bold mb-3">The Psychology of Tiered Commission</h2>
              <p>Tiered structures (also known as "accelerators") are designed to push salespeople past their comfort zones. By offering a significantly higher rate once a "quota" or "threshold" is met, companies incentivize their top performers to keep selling even after they've had a successful month. For the salesperson, reaching that next tier can often double their paycheck with only a modest increase in effort.</p>

              <h2 className="text-2xl font-bold mb-3">Gross Pay vs. Net Pay</h2>
              <p>It is important to remember that the total pay calculated here is your **Gross Pay** before taxes and other deductions. Commission is generally taxed as "supplemental income," which means it might be withheld at a flat rate (often 22% in the US for federal tax) rather than your standard marginal tax bracket. Always consult with a tax professional to understand how your commissions will impact your final take-home pay.</p>

              <h2 className="text-2xl font-bold mb-3">Negotiating Your Commission Plan</h2>
              <p>When starting a new sales role, don't just look at the percentage. Consider the following factors:</p>
              <ul>
                <li><strong>Capping:</strong> Is there a limit to how much you can earn? High performers should avoid "capped" commission plans.</li>
                <li><strong>Clawbacks:</strong> Does the company take back your commission if the customer cancels their subscription or returns the product within 90 days?</li>
                <li><strong>On-Target Earnings (OTE):</strong> What is the realistic total pay a successful salesperson in this role can expect to earn?</li>
                <li><strong>Sales Cycle:</strong> A 10% commission on a product that takes 12 months to sell might be worse than a 2% commission on a product that sells in a week.</li>
              </ul>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/commission-calculator" />
          <PopularCalculators exclude="/calculator/commission-calculator" />
        </div>
      </div>
    </>
  );
};

export default CommissionCalculator;

