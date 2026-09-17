"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { evTaxCredit, annualEvCost, annualFuelCost, fmtUsd } from "@/lib/auto/autoFinance";

type VehicleClass = "sedan" | "suv" | "pickup" | "van";

interface Inputs {
  msrp: number;
  vehicleClass: VehicleClass;
  isNew: boolean;
  income: number;
  filingJoint: boolean;
  stateIncentive: number;
  utilityRebate: number;
  annualMiles: number;
  milesPerKwh: number;
  pricePerKwh: number;
  comparableMpg: number;
  pricePerGallon: number;
  ownershipYears: number;
}

interface Results {
  federalCredit: number;
  federalEligible: boolean;
  federalReason: string;
  stateIncentive: number;
  utilityRebate: number;
  totalIncentives: number;
  netPrice: number;
  annualFuelSavings: number;
  totalFuelSavings: number;
  totalBenefit: number;
}

const DEFAULTS: Inputs = {
  msrp: 47000, vehicleClass: "suv", isNew: true, income: 120000, filingJoint: true,
  stateIncentive: 2000, utilityRebate: 1000,
  annualMiles: 15000, milesPerKwh: 3.5, pricePerKwh: 0.16,
  comparableMpg: 28, pricePerGallon: 3.5, ownershipYears: 6,
};

function calculate(input: Inputs): Results {
  const credit = evTaxCredit(input.msrp, input.vehicleClass, input.isNew, input.income, input.filingJoint);
  const stateInc = Math.max(0, input.stateIncentive);
  const util = Math.max(0, input.utilityRebate);
  const totalIncentives = credit.amount + stateInc + util;
  const netPrice = Math.max(0, input.msrp - totalIncentives);

  const evAnnual = annualEvCost(input.annualMiles, input.milesPerKwh, input.pricePerKwh);
  const gasAnnual = annualFuelCost(input.annualMiles, input.comparableMpg, input.pricePerGallon);
  const annualFuelSavings = Math.max(0, gasAnnual - evAnnual);
  const totalFuelSavings = annualFuelSavings * Math.max(1, input.ownershipYears);

  return {
    federalCredit: credit.amount,
    federalEligible: credit.eligible,
    federalReason: credit.reason,
    stateIncentive: stateInc,
    utilityRebate: util,
    totalIncentives,
    netPrice,
    annualFuelSavings,
    totalFuelSavings,
    totalBenefit: totalIncentives + totalFuelSavings,
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

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6"];

const EvTaxCreditBenefitCalculator = () => {
  const [msrp, setMsrp] = useState(String(DEFAULTS.msrp));
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(DEFAULTS.vehicleClass);
  const [isNew, setIsNew] = useState(DEFAULTS.isNew);
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [filingJoint, setFilingJoint] = useState(DEFAULTS.filingJoint);
  const [stateIncentive, setStateIncentive] = useState(String(DEFAULTS.stateIncentive));
  const [utilityRebate, setUtilityRebate] = useState(String(DEFAULTS.utilityRebate));
  const [annualMiles, setAnnualMiles] = useState(String(DEFAULTS.annualMiles));
  const [milesPerKwh, setMilesPerKwh] = useState(String(DEFAULTS.milesPerKwh));
  const [pricePerKwh, setPricePerKwh] = useState(String(DEFAULTS.pricePerKwh));
  const [comparableMpg, setComparableMpg] = useState(String(DEFAULTS.comparableMpg));
  const [pricePerGallon, setPricePerGallon] = useState(String(DEFAULTS.pricePerGallon));
  const [ownershipYears, setOwnershipYears] = useState(String(DEFAULTS.ownershipYears));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    msrp: parseFloat(msrp) || 0, vehicleClass, isNew, income: parseFloat(income) || 0, filingJoint,
    stateIncentive: parseFloat(stateIncentive) || 0, utilityRebate: parseFloat(utilityRebate) || 0,
    annualMiles: parseFloat(annualMiles) || 0, milesPerKwh: parseFloat(milesPerKwh) || 0,
    pricePerKwh: parseFloat(pricePerKwh) || 0, comparableMpg: parseFloat(comparableMpg) || 0,
    pricePerGallon: parseFloat(pricePerGallon) || 0, ownershipYears: parseFloat(ownershipYears) || 0,
  }), [msrp, vehicleClass, isNew, income, filingJoint, stateIncentive, utilityRebate, annualMiles, milesPerKwh, pricePerKwh, comparableMpg, pricePerGallon, ownershipYears]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setMsrp(String(d.msrp)); setVehicleClass(d.vehicleClass); setIsNew(d.isNew); setIncome(String(d.income)); setFilingJoint(d.filingJoint);
    setStateIncentive(String(d.stateIncentive)); setUtilityRebate(String(d.utilityRebate)); setAnnualMiles(String(d.annualMiles));
    setMilesPerKwh(String(d.milesPerKwh)); setPricePerKwh(String(d.pricePerKwh)); setComparableMpg(String(d.comparableMpg));
    setPricePerGallon(String(d.pricePerGallon)); setOwnershipYears(String(d.ownershipYears)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const pieData = results ? [
    { name: "Federal Credit", value: Math.round(results.federalCredit), color: COLORS[0] },
    { name: "State Incentive", value: Math.round(results.stateIncentive), color: COLORS[1] },
    { name: "Utility Rebate", value: Math.round(results.utilityRebate), color: COLORS[2] },
  ].filter(d => d.value > 0) : [];
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "What is the federal EV tax credit?", answer: "Under IRC §30D (Inflation Reduction Act), new clean vehicles qualify for up to $7,500 in federal tax credit, and used clean vehicles qualify for up to $4,000 (30% of sale price, capped). Eligibility depends on MSRP caps, buyer income, vehicle battery sourcing, and final assembly in North America." },
    { question: "What are the income limits for the EV tax credit?", answer: "For new vehicles, modified AGI must be under $300,000 (joint filers) or $150,000 (single filers). For used vehicles, the limit is $150,000 (joint) or $75,000 (single). Exceeding these limits disqualifies you entirely." },
    { question: "What are the MSRP caps for new EVs?", answer: "Sedans must have an MSRP under $55,000. SUVs, pickup trucks, and vans must be under $80,000. Vehicles above these caps don't qualify for the federal credit, regardless of income." },
    { question: "How does the used EV credit work?", answer: "Used clean vehicles under $25,000 sale price qualify for 30% of the sale price up to $4,000. The vehicle must be at least 2 model years old, purchased from a dealer, and the buyer must meet income limits. Only one used credit is allowed per vehicle." },
    { question: "Are there state and utility EV incentives too?", answer: "Yes. Many states offer additional rebates ($1,000–$5,000) and tax credits on top of the federal credit. Utilities often offer $500–$2,500 rebates or free home charger installation. Stacking all incentives can reduce EV cost by $10,000–$15,000." },
    { question: "How much do I save on fuel with an EV?", answer: "EVs cost roughly 60–70% less to fuel than gas cars. At $0.16/kWh and 3.5 mi/kWh, an EV costs $0.046/mile. A 28 MPG gas car at $3.50/gallon costs $0.125/mile. Over 15,000 miles/year, that's $1,180/year in fuel savings — $7,000+ over 6 years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "EV Tax Credit Benefit" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Tax Credit Benefit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
            <div className="grid grid-cols-2 gap-4">
              <CI id="state" label="State Incentive" value={stateIncentive} onChange={setStateIncentive} prefix="$" />
              <CI id="util" label="Utility Rebate" value={utilityRebate} onChange={setUtilityRebate} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Fuel Comparison (Advanced)
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CI id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
                  <CI id="years" label="Ownership Years" value={ownershipYears} onChange={setOwnershipYears} suffix="yr" />
                  <CI id="mpkwh" label="EV Efficiency" value={milesPerKwh} onChange={setMilesPerKwh} suffix="mi/kWh" />
                  <CI id="kwh" label="Electricity Price" value={pricePerKwh} onChange={setPricePerKwh} prefix="$" suffix="/kWh" />
                  <CI id="mpg" label="Gas Car MPG" value={comparableMpg} onChange={setComparableMpg} suffix="MPG" />
                  <CI id="gas" label="Gas Price" value={pricePerGallon} onChange={setPricePerGallon} prefix="$" suffix="/gal" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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

                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Total EV Benefit</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalBenefit).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.totalIncentives).toLocaleString()} upfront + ${Math.round(results.totalFuelSavings).toLocaleString()} fuel savings over {ownershipYears} yr</div>
                </div>

                <div className={`rounded-lg border p-3 ${results.federalEligible ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${results.federalEligible ? "text-emerald-600" : "text-red-600"}`}>
                      Federal Credit: {results.federalEligible ? "Eligible" : "Not Eligible"}
                    </span>
                    <span className="text-lg font-bold text-foreground">${Math.round(results.federalCredit).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{results.federalReason}</p>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">All Incentives</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.totalIncentives).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Net Price</div>
                    <div className="text-lg font-bold text-emerald-600">${Math.round(results.netPrice).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fuel Saved/Yr</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualFuelSavings).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Benefit Source</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Federal Tax Credit", amount: results.federalCredit, cls: "text-emerald-600" },
                        { label: "State Incentive", amount: results.stateIncentive, cls: "text-blue-600" },
                        { label: "Utility Rebate", amount: results.utilityRebate, cls: "text-violet-600" },
                        { label: `Fuel Savings (${ownershipYears} yr)`, amount: results.totalFuelSavings, cls: "text-amber-600" },
                      ].map(r => (
                        <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-medium ${r.cls}`}>${Math.round(r.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total Benefit</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.totalBenefit).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {pieData.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                    <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                      <div className="w-[200px] h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                              {pieData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Upfront</span>
                          <span className="text-lg font-extrabold text-foreground">${pieTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2 flex flex-col gap-2">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-foreground font-medium flex-1">{d.name}</span>
                          <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the EV Tax Credit Benefit Calculator?</h2>
            <p>This calculator estimates the total financial benefit of buying an electric vehicle, combining the federal tax credit, state incentives, utility rebates, and fuel savings over your ownership period. It also checks federal eligibility based on MSRP, vehicle class, income, and filing status under the Inflation Reduction Act rules.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter the vehicle MSRP, class, and condition (new/used), plus your household income and filing status. The calculator determines federal credit eligibility (up to $7,500 new, $4,000 used) and adds any state/utility incentives. The optional fuel comparison computes annual savings vs a comparable gas vehicle based on EV efficiency, electricity price, gas MPG, and gas price.</p>

            <h2 className="text-2xl font-bold mb-3">Federal EV Tax Credit Rules (2024+)</h2>
            <ul>
              <li><strong>New vehicles:</strong> Up to $7,500 credit. MSRP caps: $55K sedans, $80K SUVs/trucks/vans.</li>
              <li><strong>Used vehicles:</strong> Up to $4,000 (30% of sale price). Sale price must be under $25,000.</li>
              <li><strong>Income limits (new):</strong> $300K joint, $150K single, $225K head of household.</li>
              <li><strong>Income limits (used):</strong> $150K joint, $75K single.</li>
              <li><strong>Battery sourcing:</strong> 50% of credit requires N. America assembly; the other 50% requires critical minerals from US/trade partners.</li>
              <li><strong>Leased vehicles:</strong> The full $7,500 typically applies (commercial credit loophole).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">State and Utility Incentives</h2>
            <p>States like California ($2,000–$4,500 CVRP), Colorado ($5,000–$7,500), New York ($2,000), and Massachusetts ($3,500) offer additional rebates on top of the federal credit. Local utilities frequently add $500–$2,500 rebates or free charger installation. Stacking all incentives can reduce an EV's effective price by $10,000–$15,000.</p>

            <h2 className="text-2xl font-bold mb-3">Fuel Savings Calculation</h2>
            <p>EVs cost roughly 60–70% less to fuel than gas cars. At $0.16/kWh and 3.5 mi/kWh, an EV costs $0.046/mile. A 28 MPG gas car at $3.50/gallon costs $0.125/mile. Over 15,000 miles/year, that's $1,180/year in savings — $7,000+ over 6 years of ownership.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A $47,000 new SUV with $2,000 state incentive and $1,000 utility rebate, owned 6 years with 15,000 miles/year: federal credit $7,500 + state $2,000 + utility $1,000 = $10,500 upfront. Plus $7,080 in fuel savings over 6 years = $17,580 total benefit. Net vehicle cost: $36,500.</p>

            <h2 className="text-2xl font-bold mb-3">How to Claim Your EV Benefits</h2>
            <ul>
              <li><strong>Federal credit:</strong> Transfer to dealer at point-of-sale (2024+) for instant savings, or claim on your tax return.</li>
              <li><strong>State incentives:</strong> Apply through your state's energy office or DMV — some are point-of-sale, others are rebates.</li>
              <li><strong>Utility rebates:</strong> Apply directly with your electricity provider, often within 6 months of purchase.</li>
              <li><strong>Check eligibility:</strong> Use the IRS Qualified Manufacturer list and your state's EV incentive database before purchasing.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool reveals the complete financial picture of EV ownership — not just the federal credit but every dollar of incentive plus ongoing fuel savings. Use it to compare EVs against gas vehicles on a total-cost basis and to ensure you're capturing every available incentive before purchase.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-tax-credit-benefit-calculator" />
          <PopularCalculators exclude="/calculator/ev-tax-credit-benefit-calculator" />
        </div>
      </div>
    </>
  );
};

export default EvTaxCreditBenefitCalculator;
