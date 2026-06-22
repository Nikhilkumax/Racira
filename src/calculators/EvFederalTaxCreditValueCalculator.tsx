"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { evTaxCredit, fmtUsd } from "@/lib/auto/autoFinance";

type VehicleClass = "sedan" | "suv" | "pickup" | "van";

interface Inputs {
  msrp: number;
  vehicleClass: VehicleClass;
  isNew: boolean;
  income: number;
  filingJoint: boolean;
  taxLiability: number;
}

interface Results {
  creditAmount: number;
  maxAmount: number;
  eligible: boolean;
  reason: string;
  msrpCap: number;
  incomeCap: number;
  usableCredit: number;
  refundPortion: number;
  carryforwardNote: string;
}

const DEFAULTS: Inputs = {
  msrp: 47000, vehicleClass: "suv", isNew: true,
  income: 120000, filingJoint: true, taxLiability: 8500,
};

function calculate(input: Inputs): Results {
  const credit = evTaxCredit(input.msrp, input.vehicleClass, input.isNew, input.income, input.filingJoint);
  const msrpCap = input.isNew
    ? (input.vehicleClass === "sedan" ? 55000 : 80000)
    : 25000;
  const incomeCap = input.isNew
    ? (input.filingJoint ? 300000 : 150000)
    : (input.filingJoint ? 150000 : 75000);

  // The federal EV credit is non-refundable — you can only use up to your tax liability.
  const usableCredit = Math.min(credit.amount, Math.max(0, input.taxLiability));
  const refundPortion = 0; // non-refundable
  const carryforwardNote = input.isNew
    ? "The federal new-vehicle credit is non-refundable. If your tax liability is less than the credit, you cannot receive the difference as a refund. However, the 2024+ rules allow transferring the credit to the dealer at point-of-sale for instant cash benefit."
    : "The used-vehicle credit is refundable as of 2024 — you can receive the full credit even if it exceeds your tax liability.";

  return {
    creditAmount: credit.amount,
    maxAmount: credit.maxAmount,
    eligible: credit.eligible,
    reason: credit.reason,
    msrpCap,
    incomeCap,
    usableCredit,
    refundPortion,
    carryforwardNote,
  };
}

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const EvFederalTaxCreditValueCalculator = () => {
  const [msrp, setMsrp] = useState(String(DEFAULTS.msrp));
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(DEFAULTS.vehicleClass);
  const [isNew, setIsNew] = useState(DEFAULTS.isNew);
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [filingJoint, setFilingJoint] = useState(DEFAULTS.filingJoint);
  const [taxLiability, setTaxLiability] = useState(String(DEFAULTS.taxLiability));
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    msrp: parseFloat(msrp) || 0, vehicleClass, isNew,
    income: parseFloat(income) || 0, filingJoint,
    taxLiability: parseFloat(taxLiability) || 0,
  }), [msrp, vehicleClass, isNew, income, filingJoint, taxLiability]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setMsrp(String(d.msrp)); setVehicleClass(d.vehicleClass); setIsNew(d.isNew);
    setIncome(String(d.income)); setFilingJoint(d.filingJoint); setTaxLiability(String(d.taxLiability));
    setResults(calculate(DEFAULTS));
  };

  const faqs = [
    { question: "How much is the federal EV tax credit worth?", answer: "New clean vehicles qualify for up to $7,500. Used clean vehicles qualify for up to $4,000 (30% of sale price, capped). The exact amount depends on MSRP, vehicle class, your income, and the vehicle's battery sourcing — only vehicles on the IRS eligible list receive the full credit." },
    { question: "Is the EV tax credit refundable?", answer: "For new vehicles, the credit is non-refundable — you can only use up to your federal tax liability. If your liability is $4,000 and the credit is $7,500, you only benefit by $4,000. For used vehicles (2024+), the credit is refundable — you receive the full amount even with zero tax liability." },
    { question: "Can I get the credit at point of sale?", answer: "Yes, starting in 2024. You can transfer the credit to a registered dealer at point of sale for an instant $7,500 (or $4,000 used) discount off the purchase price. This eliminates the tax-liability limitation for new vehicles and provides immediate cash benefit." },
    { question: "What MSRP disqualifies an EV from the credit?", answer: "Sedans over $55,000 MSRP don't qualify. SUVs, pickup trucks, and vans over $80,000 don't qualify. Note that IRS classifications sometimes differ from manufacturer marketing — check the IRS list to confirm your vehicle's class." },
    { question: "What income disqualifies me from the EV credit?", answer: "For new vehicles: $300,000 joint, $225,000 head of household, $150,000 single. For used vehicles: $150,000 joint, $75,000 single. Income is measured as modified AGI for the year of purchase (or prior year if lower)." },
    { question: "Why might an eligible EV only get $3,750 instead of $7,500?", answer: "The $7,500 new-vehicle credit has two halves: $3,750 for North American final assembly, and $3,750 for critical mineral sourcing (40%+ from US/free-trade partners). Many vehicles qualify for only one half, receiving $3,750 total. Check the IRS eligible manufacturer list for each vehicle's exact amount." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "EV Federal Tax Credit Value" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Federal Tax Credit Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="msrp" label="Vehicle MSRP" value={msrp} onChange={setMsrp} prefix="$" />
              <CI id="income" label="Household Income" value={income} onChange={setIncome} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Vehicle Class</label>
                <select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value as VehicleClass)} className="rounded-md border border-input bg-background h-9 px-2 text-sm">
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="pickup">Pickup</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Condition</label>
                <select value={isNew ? "new" : "used"} onChange={(e) => setIsNew(e.target.value === "new")} className="rounded-md border border-input bg-background h-9 px-2 text-sm">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filingJoint} onChange={(e) => setFilingJoint(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-foreground font-medium">Filing jointly (married)</span>
            </label>
            <CI id="tax" label="Federal Tax Liability (annual)" value={taxLiability} onChange={setTaxLiability} prefix="$" />

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Credit
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                </div>

                <div className={`border rounded-xl p-5 text-center ${results.eligible ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"}`}>
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${results.eligible ? "text-emerald-600" : "text-red-600"}`}>
                    {results.eligible ? "Federal EV Credit Value" : "Not Eligible"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.creditAmount).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.eligible ? `Up to $${Math.round(results.maxAmount).toLocaleString()} max · ${isNew ? "New vehicle" : "Used vehicle"}` : "See reason below"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Max Credit</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.maxAmount).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Usable Credit</div>
                    <div className="text-lg font-bold text-emerald-600">${Math.round(results.usableCredit).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">MSRP Cap</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.msrpCap).toLocaleString()}</div>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${results.eligible ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                  <div className="text-sm font-bold text-foreground mb-1">Eligibility Status</div>
                  <p className={`text-sm ${results.eligible ? "text-emerald-700" : "text-red-700"}`}>{results.reason}</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <tbody className="divide-y divide-border/50">
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Vehicle MSRP</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(parseFloat(msrp) || 0).toLocaleString()}</td>
                        <td className={`p-2.5 pr-3 text-right text-xs ${parseFloat(msrp) <= results.msrpCap ? "text-emerald-600" : "text-red-600"}`}>Cap: ${results.msrpCap.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Household Income</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(parseFloat(income) || 0).toLocaleString()}</td>
                        <td className={`p-2.5 pr-3 text-right text-xs ${parseFloat(income) <= results.incomeCap ? "text-emerald-600" : "text-red-600"}`}>Cap: ${results.incomeCap.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Federal Tax Liability</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(parseFloat(taxLiability) || 0).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Limits new-vehicle use</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30 text-base border-t border-border">
                        <td className="p-2.5 pl-3">Your Credit Value</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.creditAmount).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Usable: ${Math.round(results.usableCredit).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Important Notes</h3>
                  <p className="text-sm text-muted-foreground">{results.carryforwardNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the EV Federal Tax Credit Value Calculator?</h2>
            <p>This calculator determines the exact dollar value of the federal EV tax credit you qualify for, based on your vehicle's MSRP, class, condition, your household income, filing status, and federal tax liability. It applies the Inflation Reduction Act rules to check eligibility and caps the credit based on your ability to use it.</p>

            <h2>How It Works</h2>
            <p>Enter the vehicle details and your financial situation. The calculator checks MSRP against the class-specific cap ($55K sedan, $80K SUV/truck/van for new; $25K for used), income against filing-status caps, and for new vehicles, limits the credit to your federal tax liability. The result shows the actual credit value and the maximum possible.</p>

            <h2>Understanding the Credit Structure</h2>
            <ul>
              <li><strong>New vehicles:</strong> Up to $7,500 — split into $3,750 for N. America assembly + $3,750 for critical minerals sourcing.</li>
              <li><strong>Used vehicles:</strong> 30% of sale price up to $4,000 — refundable (you receive the full amount even with no tax liability).</li>
              <li><strong>Non-refundable (new):</strong> You can only use the credit up to your tax liability. Excess cannot be refunded.</li>
              <li><strong>Point-of-sale transfer (2024+):</strong> Eliminates the tax-liability limit by transferring credit to dealer instantly.</li>
            </ul>

            <h2>Eligibility Requirements</h2>
            <ul>
              <li><strong>MSRP caps:</strong> $55K sedans, $80K SUVs/pickups/vans (new); $25K (used).</li>
              <li><strong>Income caps (new):</strong> $300K joint, $225K head of household, $150K single.</li>
              <li><strong>Income caps (used):</strong> $150K joint, $75K single.</li>
              <li><strong>Assembly:</strong> Final assembly must occur in North America.</li>
              <li><strong>Battery sourcing:</strong> Critical minerals from US/free-trade partners (40%+ in 2024, rising to 80% by 2027).</li>
              <li><strong>IRS list:</strong> Only vehicles on the Qualified Manufacturer list qualify.</li>
            </ul>

            <h2>How Tax Liability Affects Your Credit</h2>
            <p>For new vehicles, the federal EV credit is non-refundable — it can only reduce your tax bill to zero. If your federal tax liability is $4,000 and the credit is $7,500, you benefit by $4,000, not $7,500. To capture the full amount, use the point-of-sale dealer transfer option (available 2024+) which converts the credit to an instant purchase discount.</p>

            <h2>Practical Examples</h2>
            <ul>
              <li><strong>Eligible SUV, $47K MSRP, $120K joint income, $8,500 tax liability:</strong> Full $7,500 credit, all usable. Effective net price: $39,500.</li>
              <li><strong>Eligible sedan, $50K MSRP, $200K single income:</strong> Ineligible — income exceeds $150K single cap.</li>
              <li><strong>Luxury EV, $95K MSRP SUV:</strong> Ineligible — exceeds $80K MSRP cap.</li>
              <li><strong>Used EV, $22K sale price, $80K joint income:</strong> $4,000 credit (30% of $22K capped at $4K), refundable.</li>
            </ul>

            <h2>How to Claim the Credit</h2>
            <ul>
              <li><strong>Point-of-sale transfer (recommended):</strong> Dealer applies $7,500 discount instantly at purchase. No tax filing required.</li>
              <li><strong>Tax return claim:</strong> File Form 8936 with your federal return. Receive credit as tax reduction the following year.</li>
              <li><strong>Check eligibility first:</strong> Confirm the vehicle is on the IRS qualified list before purchase.</li>
              <li><strong>Income verification:</strong> Use the lower of current-year or prior-year modified AGI.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool gives you the exact dollar value of the federal EV credit for your specific situation — not just a generic $7,500. By checking MSRP, income, and tax liability, it tells you whether you qualify, how much you'll actually benefit, and whether you should use point-of-sale transfer or tax-return filing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-federal-tax-credit-value-calculator" />
          <PopularCalculators exclude="/calculator/ev-federal-tax-credit-value-calculator" />
        </div>
      </div>
    </>
  );
};

export default EvFederalTaxCreditValueCalculator;
