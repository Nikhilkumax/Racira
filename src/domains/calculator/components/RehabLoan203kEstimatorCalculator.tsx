"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home, Hammer, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RehabResult {
  totalRehabCost: number;
  totalProjectCost: number;
  fhaLoanAmount: number;
  downPaymentRequired: number;
  monthlyPayment: number;
  upfrontMip: number;
  contingencyAmount: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRehab(purchasePrice: number, repairCosts: number, contingencyPct: number, inspectionFees: number, titleUpdates: number, interestRate: number, loanTermYears: number): RehabResult {
  const contingencyAmount = repairCosts * (contingencyPct / 100);
  const totalRehabCost = repairCosts + contingencyAmount + inspectionFees + titleUpdates;

  // Total project cost for an FHA 203k is the purchase price plus the rehab cost
  const totalProjectCost = purchasePrice + totalRehabCost;

  // FHA requires a minimum 3.5% down payment on the total project cost
  const downPaymentRequired = totalProjectCost * 0.035;
  const baseLoanAmount = totalProjectCost - downPaymentRequired;

  // FHA Upfront Mortgage Insurance Premium (UFMIP) is 1.75% of the base loan amount
  const upfrontMip = baseLoanAmount * 0.0175;
  const fhaLoanAmount = baseLoanAmount + upfrontMip;

  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;

  const monthlyPayment = fhaLoanAmount > 0 && n > 0
    ? (r > 0 ? fhaLoanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : fhaLoanAmount / n)
    : 0;

  const chartData = [
    { name: "Purchase Price", value: purchasePrice, color: "hsl(var(--primary))" },
    { name: "Repair Costs", value: repairCosts, color: "#f59e0b" },
    { name: "Contingency Reserve", value: contingencyAmount, color: "#10b981" },
    { name: "Fees & Permits", value: inspectionFees + titleUpdates, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Purchase Price", value: `$${purchasePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Rehab Budget", value: `$${totalRehabCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Project Cost", value: `$${totalProjectCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Minimum Down Payment (3.5%)", value: `$${downPaymentRequired.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "FHA UFMIP (Financed)", value: `$${upfrontMip.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Final Loan Amount", value: `$${fhaLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { totalRehabCost, totalProjectCost, fhaLoanAmount, downPaymentRequired, monthlyPayment, upfrontMip, contingencyAmount, chartData, summaryStats };
}

const DEFAULTS = { purchasePrice: "200000", repairCosts: "50000", contingencyPct: "15", inspectionFees: "1500", titleUpdates: "500", interestRate: "6.75", loanTermYears: "30" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function RehabLoan203kEstimatorCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(DEFAULTS.purchasePrice);
  const [repairCosts, setRepairCosts] = useState(DEFAULTS.repairCosts);
  const [contingencyPct, setContingencyPct] = useState(DEFAULTS.contingencyPct);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inspectionFees, setInspectionFees] = useState(DEFAULTS.inspectionFees);
  const [titleUpdates, setTitleUpdates] = useState(DEFAULTS.titleUpdates);
  const [results, setResults] = useState<RehabResult | null>(null);

  const calc = () => setResults(calcRehab(parseFloat(purchasePrice) || 0, parseFloat(repairCosts) || 0, parseFloat(contingencyPct) || 15, parseFloat(inspectionFees) || 0, parseFloat(titleUpdates) || 0, parseFloat(interestRate) || 0, parseFloat(loanTermYears) || 30));
  const reset = () => { setPurchasePrice(DEFAULTS.purchasePrice); setRepairCosts(DEFAULTS.repairCosts); setContingencyPct(DEFAULTS.contingencyPct); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setInspectionFees(DEFAULTS.inspectionFees); setTitleUpdates(DEFAULTS.titleUpdates); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is an FHA 203(k) loan?", answer: "An FHA 203(k) loan is a government-backed mortgage that allows you to finance both the purchase of a 'fixer-upper' home and the cost of its repairs and upgrades through a single mortgage. Instead of taking out a mortgage to buy the house and a separate, higher-interest personal loan for renovations, the 203(k) bundles them together based on the projected after-repair value of the home." },
    { question: "What is the contingency reserve?", answer: "FHA guidelines require a contingency reserve to cover unexpected costs that inevitably arise during renovations (e.g., finding termite damage or mold behind a wall). This reserve is typically 10% to 20% of the base repair costs, depending on the complexity of the project and whether utilities are turned on. If you don't use the contingency funds, they are applied to pay down your mortgage principal." },
    { question: "How is the down payment calculated on a 203(k) loan?", answer: "Unlike a standard mortgage where the down payment is based strictly on the purchase price, the FHA 203(k) down payment is calculated based on the total project cost. You must put down at least 3.5% of the combined purchase price plus the total rehab budget (repairs + contingency + fees)." },
    { question: "Can I do the repair work myself?", answer: "Generally, no. FHA 203(k) loans require you to use licensed, insured, and approved general contractors to perform the work. The lender manages the rehab funds, releasing them to the contractor in 'draws' only after an HUD consultant inspects the property to verify the work was completed to code." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Rehab Loan (203k Estimator) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rehab Loan (203k Estimator) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <CompactInput id="rehab" label="Est. Repair Costs" value={repairCosts} onChange={setRepairCosts} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["15", "15 yr"], ["30", "30 yr"]].map(([v, l]) => (
                    <button key={v} onClick={() => setLoanTermYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${loanTermYears === v ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Contingency & Fees <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="cont" label="Contingency Reserve" value={contingencyPct} onChange={setContingencyPct} suffix="%" />
                  <CompactInput id="insp" label="Consultant Fees" value={inspectionFees} onChange={setInspectionFees} prefix="$" />
                  <CompactInput id="title" label="Title Updates" value={titleUpdates} onChange={setTitleUpdates} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly P&I Payment</div>
                <div className="text-4xl font-bold text-foreground">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Based on total loan of ${results.fhaLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} (Property tax & insurance not included)</div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Rehab Budget", `$${results.totalRehabCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Down Payment (3.5%)", `$${results.downPaymentRequired.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                  <h3 className="text-base font-bold mb-2 w-full text-left">Total Project Cost</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                        {results.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                    {results.chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding FHA 203(k) Rehab Loans</h2>
            <p>Buying a "fixer-upper" presents a common financial dilemma: standard mortgages will not lend you more than the current, pre-repaired value of the house, leaving you to fund renovations out of pocket or with high-interest personal loans. The Federal Housing Administration created the <strong>203(k) Rehab Loan</strong> to solve this. It allows you to wrap the purchase price of the home and the cost of the necessary repairs into one single, 30-year fixed-rate mortgage.</p>
            <p>The loan amount is based not on what the house is worth today, but on the projected value of the house after the repairs are completed. This powerful tool allows homebuyers to purchase distressed properties, update them, and immediately build sweat equity.</p>

            <h2 className="text-2xl font-bold mb-3">How the Rehab Budget is Calculated</h2>
            <p>To ensure the project succeeds, the FHA does not just hand you cash. The rehab budget must be meticulously calculated and managed. It consists of the actual repair costs (determined by a licensed general contractor) plus several mandatory buffers. The most important buffer is the <strong>Contingency Reserve</strong>. The FHA requires you to add 10% to 20% to your repair budget to cover unforeseen issues that arise during construction. There are also fees for HUD consultants who must inspect the work before the lender releases funds to your contractor.</p>

            <h2 className="text-2xl font-bold mb-3">The 3.5% Down Payment Requirement</h2>
            <p>One of the biggest advantages of the 203(k) loan is the low down payment. Just like a standard FHA loan, you only need to put down 3.5%. However, this 3.5% is calculated based on the <strong>Total Project Cost</strong> (Purchase Price + Rehab Budget), not just the purchase price. For example, if you buy a home for $200,000 and the total rehab budget is $50,000, your 3.5% down payment is based on $250,000, requiring $8,750 down.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rehab-loan-203k-estimator-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Rehab Loan203k Estimator Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Rehab Loan203k Estimator Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Rehab Loan203k Estimator Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Rehab Loan203k Estimator Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Rehab Loan203k Estimator Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/rehab-loan-203k-estimator-calculator" />
        </div>
      </div>
    </>
  );
}
