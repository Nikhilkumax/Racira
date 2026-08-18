"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PetInsuranceInputs {
  monthlyPremium: number;
  deductible: number;
  reimbursementPct: number;
  annualVetCosts: number;
  nonCovered: number;
}

interface PetInsuranceResult {
  annualPremium: number;
  reimbursement: number;
  ownerVetShare: number;
  insuredTotal: number;
  uninsuredTotal: number;
  savings: number;
  breakEvenVetCosts: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcPetInsurance(inputs: PetInsuranceInputs): PetInsuranceResult {
  const annualPremium = inputs.monthlyPremium * 12;
  const reimbursable = Math.max(0, inputs.annualVetCosts - inputs.deductible);
  const reimbursement = reimbursable * (inputs.reimbursementPct / 100);
  const ownerVetShare = inputs.annualVetCosts - reimbursement;
  const insuredTotal = annualPremium + ownerVetShare + inputs.nonCovered;
  const uninsuredTotal = inputs.annualVetCosts + inputs.nonCovered;
  const savings = uninsuredTotal - insuredTotal;
  const breakEvenVetCosts = inputs.reimbursementPct > 0 ? inputs.deductible + annualPremium / (inputs.reimbursementPct / 100) : 0;

  const chartData = [
    { name: "With Insurance", value: Math.round(insuredTotal), fill: "hsl(var(--primary))" },
    { name: "Without Insurance", value: Math.round(uninsuredTotal), fill: savings >= 0 ? "#10b981" : "#ef4444" },
  ];

  const breakdown = [
    { label: "Monthly Premium", value: `$${inputs.monthlyPremium.toFixed(2)}` },
    { label: "Annual Premium", value: `$${annualPremium.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Deductible", value: `$${inputs.deductible.toLocaleString()}` },
    { label: "Reimbursement Rate", value: `${inputs.reimbursementPct}%` },
    { label: "Annual Vet Costs", value: `$${inputs.annualVetCosts.toLocaleString()}` },
    { label: "Reimbursed by Insurer", value: `$${reimbursement.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Non-Covered Annual Costs", value: `$${inputs.nonCovered.toLocaleString()}` },
    { label: "Total with Insurance", value: `$${insuredTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total without Insurance", value: `$${uninsuredTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Savings / (Extra Cost)", value: `${savings >= 0 ? "+" : "−"}$${Math.abs(savings).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Premium", value: `$${annualPremium.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Reimbursement", value: `$${reimbursement.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total with Insurance", value: `$${insuredTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total without Insurance", value: `$${uninsuredTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Break-Even Vet Bill", value: `$${breakEvenVetCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net Result", value: savings >= 0 ? `Save $${savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `Cost $${Math.abs(savings).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { annualPremium, reimbursement, ownerVetShare, insuredTotal, uninsuredTotal, savings, breakEvenVetCosts, chartData, breakdown, summaryStats };
}

const DEFAULTS: PetInsuranceInputs = { monthlyPremium: 35, deductible: 250, reimbursementPct: 80, annualVetCosts: 1200, nonCovered: 100 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{label}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function PetInsuranceCostBenefitCalculator() {
  const [monthlyPremium, setMonthlyPremium] = useState("35");
  const [deductible, setDeductible] = useState("250");
  const [reimbursementPct, setReimbursementPct] = useState("80");
  const [annualVetCosts, setAnnualVetCosts] = useState("1200");
  const [nonCovered, setNonCovered] = useState("100");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PetInsuranceResult | null>(null);

  const calculate = () =>
    setResult(calcPetInsurance({
      monthlyPremium: parseFloat(monthlyPremium) || 0,
      deductible: parseFloat(deductible) || 0,
      reimbursementPct: parseFloat(reimbursementPct) || 0,
      annualVetCosts: parseFloat(annualVetCosts) || 0,
      nonCovered: parseFloat(nonCovered) || 0,
    }));
  const reset = () => { setMonthlyPremium(DEFAULTS.monthlyPremium.toString()); setDeductible(DEFAULTS.deductible.toString()); setReimbursementPct(DEFAULTS.reimbursementPct.toString()); setAnnualVetCosts(DEFAULTS.annualVetCosts.toString()); setNonCovered(DEFAULTS.nonCovered.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const savingsColor = result ? (result.savings >= 0 ? "text-emerald-600" : "text-red-500") : "";

  const faqs = [
    { question: "Is pet insurance worth it?", answer: "It depends on your pet's risk profile and your ability to absorb a large vet bill. For young, healthy pets the premiums usually exceed reimbursed claims; for breeds prone to expensive conditions — or for owners who could not cover a $5,000 surgery — insurance converts a rare catastrophic cost into a predictable monthly payment." },
    { question: "How do deductibles and reimbursement work?", answer: "You pay the annual deductible first, then the insurer reimburses a percentage (usually 70–90%) of the remaining covered costs. A $1,200 vet bill with a $250 deductible and 80% reimbursement pays out $760: (1,200 − 250) × 0.80." },
    { question: "What is the break-even vet bill?", answer: "It is the annual vet spend where your reimbursements exactly equal your premiums: deductible + (annual premium ÷ reimbursement rate). Below it, insurance costs you money; above it, insurance pays off. With a $420 premium, $250 deductible, and 80% coverage, the break-even is about $775." },
    { question: "What do pet policies not cover?", answer: "Most exclude pre-existing conditions, and many exclude or limit dental, behavioral, and breeding-related care. Exam fees are sometimes separate from the reimbursement rate. Add your expected non-covered costs to the calculator to keep the comparison honest." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator/everyday-life" }, { label: "Pet Insurance Cost-Benefit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pet Insurance Cost-Benefit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="premium" label="Monthly Premium" value={monthlyPremium} onChange={setMonthlyPremium} prefix="$" />
              <CompactInput id="deductible" label="Annual Deductible" value={deductible} onChange={setDeductible} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="reimburse" label="Reimbursement Rate" value={reimbursementPct} onChange={setReimbursementPct} suffix="%" />
              <CompactInput id="vet" label="Annual Vet Costs" value={annualVetCosts} onChange={setAnnualVetCosts} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Additional Costs</label>
                    <CompactInput id="noncovered" label="Non-Covered Annual Costs (exam fees, dental, etc.)" value={nonCovered} onChange={setNonCovered} prefix="$" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Result With Insurance</div>
                <div className={`text-4xl font-extrabold mb-1 tracking-tight ${savingsColor}`}>{result.savings >= 0 ? `Save $${result.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `Cost $${Math.abs(result.savings).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}</div>
                <div className="text-sm text-muted-foreground font-medium">${result.insuredTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })} with insurance vs ${result.uninsuredTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })} without</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual Premium", `$${result.annualPremium.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Annual Reimbursement", `$${result.reimbursement.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Break-Even Vet Bill", `$${result.breakEvenVetCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Annual Cost Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Deciding on Pet Insurance</h2>
            <p>Pet insurance is a bet on the future: you pay a fixed premium so a rare, expensive vet bill does not become a financial crisis. This <strong>pet insurance cost-benefit calculator</strong> makes the trade-off concrete by computing your total cost with and without a policy, and the vet-bill level where the policy pays for itself.</p>
            <h2 className="text-2xl font-bold mb-3">The Break-Even Number</h2>
            <p>Insurance always loses money in the average year — that is how insurers profit. It wins when your pet has an expensive year. The calculator's break-even vet bill (deductible plus premium divided by the reimbursement rate) marks the crossover: spend less and the premium was pure cost; spend more and the policy covered you.</p>
            <h2 className="text-2xl font-bold mb-3">Pricing by Risk, Not Just Cost</h2>
            <p>Premiums rise with age, and policies exclude pre-existing conditions — so the cheapest time to insure is when a pet is young and healthy. If your savings could absorb a $5,000 emergency, self-insuring is rational. If not, the predictability of a premium is itself worth something the calculator cannot price.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pet-insurance-cost-benefit-calculator" />
          <PopularCalculators exclude="/calculator/pet-insurance-cost-benefit-calculator" />
        </div>
      </div>
    </>
  );
}
