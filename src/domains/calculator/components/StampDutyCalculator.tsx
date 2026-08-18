"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StateRates {
  label: string;
  stampDutyMale: number;
  stampDutyFemale: number;
  registration: number;
}

const STATE_RATES: Record<string, StateRates> = {
  maharashtra: { label: "Maharashtra", stampDutyMale: 6, stampDutyFemale: 5, registration: 1 },
  karnataka: { label: "Karnataka", stampDutyMale: 5, stampDutyFemale: 5, registration: 1 },
  delhi: { label: "Delhi", stampDutyMale: 6, stampDutyFemale: 4, registration: 1 },
  tamil_nadu: { label: "Tamil Nadu", stampDutyMale: 7, stampDutyFemale: 7, registration: 4 },
  uttar_pradesh: { label: "Uttar Pradesh", stampDutyMale: 7, stampDutyFemale: 6, registration: 1 },
  telangana: { label: "Telangana", stampDutyMale: 6, stampDutyFemale: 6, registration: 0.5 },
  west_bengal: { label: "West Bengal", stampDutyMale: 7, stampDutyFemale: 7, registration: 1 },
  rajasthan: { label: "Rajasthan", stampDutyMale: 6, stampDutyFemale: 5, registration: 1 },
};

function fmtInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function StampDutyCalculator() {
  const [propertyValue, setPropertyValue] = useState("5000000");
  const [state, setState] = useState("maharashtra");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showResults, setShowResults] = useState(false);

  const value = parseFloat(propertyValue) || 0;
  const rates = STATE_RATES[state] ?? STATE_RATES.maharashtra;
  const sdRate = gender === "female" ? rates.stampDutyFemale : rates.stampDutyMale;
  const stampDuty = (value * sdRate) / 100;
  const registration = (value * rates.registration) / 100;
  const totalCharges = stampDuty + registration;
  const effectiveRate = sdRate + rates.registration;

  const chartData = Object.entries(STATE_RATES).map(([key, r]) => {
    const rRate = gender === "female" ? r.stampDutyFemale : r.stampDutyMale;
    return {
      name: r.label.split(" ")[0],
      total: Math.round((value * (rRate + r.registration)) / 100),
      key,
    };
  });

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setPropertyValue("5000000");
    setState("maharashtra");
    setGender("male");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is stamp duty?", answer: "Stamp duty is a tax levied by state governments on property transactions, paid when the sale agreement is registered. It is calculated on the higher of the agreement value or the state's circle rate (minimum government valuation) for the area." },
    { question: "What is the registration charge?", answer: "A separate fee paid to register the property deed in your name, typically 1% of the property value in most states — though Tamil Nadu charges 4%. It is paid once at purchase alongside stamp duty and cannot be financed in most cases." },
    { question: "Do women buyers get a discount?", answer: "Many states offer 1–2% lower stamp duty for properties registered in a woman's name to encourage female homeownership — Maharashtra, Delhi, and Rajasthan, for example. The discount applies to the stamp duty rate only, not registration." },
    { question: "Is stamp duty tax-deductible?", answer: "Stamp duty and registration paid on a residential property qualify for deduction under Section 80C, up to the ₹1.5 lakh combined limit that also covers life insurance, PPF, and ELSS. For a ₹50 lakh property in Maharashtra, the ₹3.5 lakh of charges exceed the cap." },
    { question: "What is the circle rate?", answer: "The minimum value per square meter set by the state government for each locality. Stamp duty is charged on the higher of the circle rate or the actual agreement value — so understating the sale price on paper does not reduce the tax." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Stamp Duty Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stamp Duty Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Home className="w-4 h-4" /> Property Purchase Costs
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="input-calc">
                  {Object.entries(STATE_RATES).map(([key, r]) => (
                    <option key={key} value={key}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Property Value (₹)</label>
                <input id="sd-value" type="number" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Buyer's Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")} className="input-calc">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {rates.label}: stamp duty {gender === "female" ? rates.stampDutyFemale : rates.stampDutyMale}% + registration {rates.registration}% = {effectiveRate}% total
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Charges — {rates.label}</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmtInr(totalCharges)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    stamp duty {sdRate}% · registration {rates.registration}% · {effectiveRate}% combined
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Stamp Duty</p>
                    <p className="text-2xl font-bold text-primary">{fmtInr(stampDuty)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration</p>
                    <p className="text-2xl font-bold text-orange-500">{fmtInr(registration)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Property Value</p>
                    <p className="text-2xl font-bold text-green-600">{fmtInr(value)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Charge</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total Charges</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmtInr(totalCharges)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Stamp Duty ({sdRate}%)</td>
                        <td className="py-2.5 px-3 text-right">{fmtInr(stampDuty)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Registration Charges ({rates.registration}%)</td>
                        <td className="py-2.5 px-3 text-right">{fmtInr(registration)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Total Charges by State</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => fmtInr(v)} />
                        <Bar dataKey="total" name="Total Charges" radius={[4, 4, 0, 0]}>
                          {chartData.map((d) => (
                            <Cell key={d.key} fill={d.key === state ? "#f59e0b" : "hsl(var(--primary))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Property Value</span>
                      <span className="font-medium">{fmtInr(value)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">State</span>
                      <span className="font-medium">{rates.label}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Combined Rate</span>
                      <span className="font-medium">{effectiveRate}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Stamp Duty</span>
                      <span className="font-medium">{fmtInr(stampDuty)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">{fmtInr(registration)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">80C Deduction Eligible</span>
                      <span className="font-medium">Up to ₹1.5 lakh</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your property value and state, then click <strong className="text-foreground">Calculate</strong> to see stamp duty and registration charges.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Stamp Duty Works</h2>
            <p>Stamp duty is charged on the higher of the agreement value or the government's circle rate. Many states offer 1–2% lower rates for women buyers. Stamp duty and registration paid on residential property qualify for deduction under Section 80C up to ₹1.5 lakh.</p>
            <h3>Worked Example</h3>
            <p>A ₹50,00,000 apartment in Maharashtra registered by a male buyer costs ₹3,00,000 in stamp duty (6%) plus ₹50,000 registration (1%) — ₹3,50,000 on top of the purchase price. The same property in Tamil Nadu costs ₹3,50,000 + ₹2,00,000 = ₹5,50,000, a two-lakh difference that should factor into where you buy.</p>
            <h3>Budgeting for the Purchase</h3>
            <p>Registration charges and most of the stamp duty must be paid in cash at closing — they cannot be added to your home loan in most states. Buyers routinely forget this 5–10% cash outlay, so plan for it alongside the down payment when saving for a property.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stamp-duty-calculator" />
          <PopularCalculators exclude="/calculator/stamp-duty-calculator" />
        </div>
      </div>
    </>
  );
}
