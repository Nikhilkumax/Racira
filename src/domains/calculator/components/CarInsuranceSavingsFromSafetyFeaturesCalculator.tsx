"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtUsd } from "@/lib/auto/autoFinance";

interface FeatureInput {
  id: string;
  label: string;
  discountPct: number;
  enabled: boolean;
}

interface Inputs {
  basePremium: number;
  features: FeatureInput[];
  goodDriver: boolean;
  multiPolicy: boolean;
}

interface Results {
  basePremium: number;
  totalDiscountPct: number;
  annualSavings: number;
  monthlySavings: number;
  newPremium: number;
  fiveYearSavings: number;
  featuresApplied: { label: string; discountPct: number; dollarSavings: number }[];
}

const FEATURES: Omit<FeatureInput, "enabled">[] = [
  { id: "abs", label: "Anti-lock Brakes (ABS)", discountPct: 5 },
  { id: "airbags", label: "Front + Side Airbags", discountPct: 10 },
  { id: "stability", label: "Electronic Stability Control", discountPct: 5 },
  { id: "backup", label: "Backup Camera", discountPct: 3 },
  { id: "blindspot", label: "Blind Spot Monitoring", discountPct: 5 },
  { id: "fcw", label: "Forward Collision Warning", discountPct: 10 },
  { id: "aeb", label: "Automatic Emergency Braking", discountPct: 15 },
  { id: "ldw", label: "Lane Departure Warning", discountPct: 5 },
  { id: "adaptive", label: "Adaptive Cruise Control", discountPct: 5 },
  { id: "alarm", label: "Anti-theft Alarm System", discountPct: 5 },
  { id: "tracking", label: "GPS Vehicle Tracking", discountPct: 10 },
  { id: "immobilizer", label: "Engine Immobilizer", discountPct: 5 },
];

const DEFAULTS: Inputs = {
  basePremium: 1800,
  features: FEATURES.map((f) => ({ ...f, enabled: ["airbags", "abs", "aeb", "fcw"].includes(f.id) })),
  goodDriver: true,
  multiPolicy: false,
};

function calculate(input: Inputs): Results {
  const applied: { label: string; discountPct: number; dollarSavings: number }[] = [];
  let totalDiscountPct = 0;
  for (const f of input.features) {
    if (f.enabled && f.discountPct > 0) {
      applied.push({ label: f.label, discountPct: f.discountPct, dollarSavings: (input.basePremium * f.discountPct) / 100 });
      totalDiscountPct += f.discountPct;
    }
  }
  // Cap combined feature discounts at 30% — most insurers cap stacked discounts.
  totalDiscountPct = Math.min(30, totalDiscountPct);
  if (input.goodDriver) {
    applied.push({ label: "Good Driver Discount", discountPct: 20, dollarSavings: input.basePremium * 0.2 });
    totalDiscountPct += 20;
  }
  if (input.multiPolicy) {
    applied.push({ label: "Multi-Policy (Home + Auto) Bundle", discountPct: 15, dollarSavings: input.basePremium * 0.15 });
    totalDiscountPct += 15;
  }
  totalDiscountPct = Math.min(60, totalDiscountPct); // hard cap
  const annualSavings = (input.basePremium * totalDiscountPct) / 100;
  return {
    basePremium: input.basePremium,
    totalDiscountPct,
    annualSavings,
    monthlySavings: annualSavings / 12,
    newPremium: input.basePremium - annualSavings,
    fiveYearSavings: annualSavings * 5,
    featuresApplied: applied,
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

const CarInsuranceSavingsFromSafetyFeaturesCalculator = () => {
  const [basePremium, setBasePremium] = useState(String(DEFAULTS.basePremium));
  const [features, setFeatures] = useState<FeatureInput[]>(DEFAULTS.features);
  const [goodDriver, setGoodDriver] = useState(DEFAULTS.goodDriver);
  const [multiPolicy, setMultiPolicy] = useState(DEFAULTS.multiPolicy);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    basePremium: parseFloat(basePremium) || 0,
    features,
    goodDriver,
    multiPolicy,
  }), [basePremium, features, goodDriver, multiPolicy]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setBasePremium(String(DEFAULTS.basePremium));
    setFeatures(DEFAULTS.features);
    setGoodDriver(DEFAULTS.goodDriver);
    setMultiPolicy(DEFAULTS.multiPolicy);
    setResults(calculate(DEFAULTS));
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const barData = results ? results.featuresApplied.map(f => ({
    name: f.label.length > 28 ? f.label.slice(0, 25) + "…" : f.label,
    savings: Math.round(f.dollarSavings),
  })) : [];

  const faqs = [
    { question: "Do safety features really lower car insurance premiums?", answer: "Yes. Most major insurers offer 3–15% discounts for features like airbags, automatic emergency braking, forward collision warning, and anti-theft systems. These features reduce the frequency and severity of claims, so insurers pass savings to safe-equipped vehicles." },
    { question: "Which safety features save the most on insurance?", answer: "Automatic Emergency Braking (10–15%), Forward Collision Warning (10%), airbags (up to 10%), and GPS vehicle tracking (up to 10%) typically deliver the largest discounts. Anti-theft systems are especially valuable in high-crime areas." },
    { question: "Is there a limit on how many discounts I can stack?", answer: "Most insurers cap combined safety-feature discounts at around 30%. Adding a good driver discount (up to 20%) and a multi-policy bundle (up to 15%) can bring total savings to 50–60% off the base premium." },
    { question: "How do I claim safety feature discounts?", answer: "Contact your insurance provider and provide your vehicle's VIN and a list of installed safety features. Many insurers automatically apply discounts for newer vehicles but require documentation for aftermarket installations like anti-theft systems." },
    { question: "Are aftermarket safety features eligible for discounts?", answer: "Yes, in most cases. Aftermarket anti-theft systems, GPS trackers, and backup cameras often qualify. However, factory-installed advanced systems (AEB, lane departure) typically generate larger discounts because they're more reliable." },
    { question: "How much can I save over 5 years?", answer: "If safety features and discounts reduce your premium from $1,800 to $1,000/year, you save $800/year or $4,000 over 5 years. The savings often exceed the cost of the safety features themselves." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Safety Feature Insurance Savings" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Insurance Savings from Safety Features Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <CI id="premium" label="Current Annual Premium" value={basePremium} onChange={setBasePremium} prefix="$" />

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Safety Features Installed</div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                {features.map(f => (
                  <label key={f.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 cursor-pointer hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={f.enabled} onChange={() => toggleFeature(f.id)} className="h-4 w-4 accent-primary" />
                      <span className="text-sm font-medium text-foreground">{f.label}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">-{f.discountPct}%</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 cursor-pointer hover:bg-secondary/20 transition-colors mt-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={goodDriver} onChange={(e) => setGoodDriver(e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm font-medium text-foreground">Good Driver Discount (3+ yrs clean)</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">-20%</span>
            </label>
            <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 cursor-pointer hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={multiPolicy} onChange={(e) => setMultiPolicy(e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm font-medium text-foreground">Multi-Policy Bundle (Home + Auto)</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">-15%</span>
            </label>

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

                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Annual Savings</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.annualSavings).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">{results.totalDiscountPct.toFixed(0)}% off · ${Math.round(results.monthlySavings)}/mo · ${Math.round(results.fiveYearSavings).toLocaleString()} over 5 years</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Old Premium</div>
                    <div className="text-lg font-bold text-foreground line-through opacity-60">${Math.round(results.basePremium).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">New Premium</div>
                    <div className="text-lg font-bold text-emerald-600">${Math.round(results.newPremium).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">5-Year Savings</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.fiveYearSavings).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Discount Applied</th>
                        <th className="p-2.5 text-right">Discount</th>
                        <th className="p-2.5 pr-3 text-right">Annual Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.featuresApplied.length === 0 ? (
                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No discounts selected.</td></tr>
                      ) : results.featuresApplied.map((f) => (
                        <tr key={f.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{f.label}</td>
                          <td className="p-2.5 text-right text-emerald-600 font-medium">-{f.discountPct}%</td>
                          <td className="p-2.5 pr-3 text-right font-medium text-foreground">${Math.round(f.dollarSavings).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total Savings</td>
                        <td className="p-2.5 text-right text-emerald-600">-{results.totalDiscountPct.toFixed(0)}%</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.annualSavings).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {barData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Savings by Discount</h3>
                    <div className="w-full h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${v}`} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={140} />
                          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Savings"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          <Bar dataKey="savings" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Safety Feature Insurance Savings Calculator?</h2>
            <p>This calculator estimates how much you can save on car insurance premiums by having safety features installed on your vehicle. Most major insurers offer discounts of 3–15% for each qualifying safety feature, and the savings stack. Combined with a clean driving record and multi-policy bundle, you can reduce your premium by 30–60%.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter your current annual premium and check the safety features your vehicle has. The calculator applies each feature's typical discount percentage, caps stacked feature discounts at 30%, and adds optional good-driver (20%) and multi-policy bundle (15%) discounts. Total savings are capped at 60% of your base premium.</p>

            <h2 className="text-2xl font-bold mb-3">Which Safety Features Get the Biggest Discounts?</h2>
            <ul>
              <li><strong>Automatic Emergency Braking (AEB):</strong> 10–15% — insurers love this feature because it prevents the most common type of crash (rear-end collisions).</li>
              <li><strong>Forward Collision Warning (FCW):</strong> 10% — alerts drivers to impending collisions.</li>
              <li><strong>Airbags (front + side):</strong> up to 10% — reduces injury severity.</li>
              <li><strong>GPS Vehicle Tracking:</strong> up to 10% — aids recovery if stolen.</li>
              <li><strong>Anti-lock Brakes (ABS):</strong> 5% — standard on most modern cars.</li>
              <li><strong>Blind Spot Monitoring:</strong> 5% — prevents lane-change crashes.</li>
              <li><strong>Anti-theft Alarm:</strong> 5% — deters break-ins.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result shows your annual savings and total discount percentage. The 3-stat bar compares old premium, new premium, and 5-year savings. The breakdown table itemizes each applied discount with its dollar savings. The horizontal bar chart visualizes which features contribute the most.</p>

            <h2 className="text-2xl font-bold mb-3">How to Maximize Your Savings</h2>
            <ul>
              <li><strong>Document every feature.</strong> Provide your insurer with a complete list — they don't always apply discounts automatically.</li>
              <li><strong>Bundle home + auto.</strong> Multi-policy discounts can save 10–25% on auto insurance.</li>
              <li><strong>Maintain a clean driving record.</strong> Good driver discounts are the single largest savings — up to 20–30%.</li>
              <li><strong>Install anti-theft systems</strong> especially if you live in a high-crime area.</li>
              <li><strong>Shop around annually.</strong> Different insurers weight safety features differently — you may find 10–15% more savings by switching.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A driver with a $1,800 annual premium, automatic emergency braking (15%), airbags (10%), forward collision warning (10%), good driver (20%), and home bundle (15%) could save $1,080/year — reducing the premium to $720. Over 5 years, that's $5,400 in savings.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool reveals savings most drivers overlook. By understanding which features generate the largest discounts, you can make smarter vehicle purchase decisions, prioritize aftermarket safety upgrades, and ensure your current insurer is applying all eligible discounts to your policy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-insurance-savings-from-safety-features-calculator" />
          <PopularCalculators exclude="/calculator/car-insurance-savings-from-safety-features-calculator" />
        </div>
      </div>
    </>
  );
};

export default CarInsuranceSavingsFromSafetyFeaturesCalculator;
