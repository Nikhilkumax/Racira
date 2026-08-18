"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface VisaInputs {
  country: string;
  baseFee: number;      // $ government fee per applicant
  applicants: number;
  processing: string;   // "standard" | "expedited"
  serviceFee: number;   // $ per applicant
  biometrics: number;   // $ per applicant
  courier: number;      // $ one-time
}

interface VisaResults {
  govFee: number;
  serviceFees: number;
  expeditedFees: number;
  biometricsFees: number;
  totalCost: number;
  perApplicant: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COUNTRY_FEES: Record<string, { label: string; fee: number }> = {
  usa: { label: "United States", fee: 185 },
  uk: { label: "United Kingdom", fee: 150 },
  schengen: { label: "Schengen Area (EU)", fee: 100 },
  canada: { label: "Canada", fee: 125 },
  australia: { label: "Australia", fee: 165 },
  india: { label: "India", fee: 40 },
};

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

function calcVisa(i: VisaInputs): VisaResults {
  const govFee = i.baseFee * i.applicants;
  const serviceFees = i.serviceFee * i.applicants;
  const expeditedFees = (i.processing === "expedited" ? 60 : 0) * i.applicants;
  const biometricsFees = i.biometrics * i.applicants;
  const totalCost = govFee + serviceFees + expeditedFees + biometricsFees + i.courier;
  const perApplicant = i.applicants > 0 ? totalCost / i.applicants : 0;

  const chartData = [
    { name: "Gov Fee", value: Math.round(govFee) },
    { name: "Service Fee", value: Math.round(serviceFees) },
    { name: "Expedited", value: Math.round(expeditedFees) },
    { name: "Biometrics", value: Math.round(biometricsFees) },
    { name: "Courier", value: Math.round(i.courier) },
  ];

  const breakdown = [
    { label: "Government Fee", value: `$${govFee.toFixed(2)}` },
    { label: "Service / Processing Fee", value: `$${serviceFees.toFixed(2)}` },
    { label: "Expedited Processing", value: `$${expeditedFees.toFixed(2)}` },
    { label: "Biometrics / Photos", value: `$${biometricsFees.toFixed(2)}` },
    { label: "Passport Courier", value: `$${i.courier.toFixed(2)}` },
    { label: "Total Visa Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Cost per Applicant", value: `$${perApplicant.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Visa Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Per Applicant", value: `$${perApplicant.toFixed(2)}` },
    { label: "Government Fee", value: `$${govFee.toFixed(2)}` },
    { label: "Service Fees", value: `$${serviceFees.toFixed(2)}` },
    { label: "Expedited Fees", value: `$${expeditedFees.toFixed(2)}` },
    { label: "Applicants", value: `${i.applicants}` },
    { label: "Destination", value: COUNTRY_FEES[i.country]?.label ?? "—" },
    { label: "Processing", value: i.processing === "expedited" ? "Expedited" : "Standard" },
  ];

  return { govFee, serviceFees, expeditedFees, biometricsFees, totalCost, perApplicant, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  country: "usa",
  baseFee: "185",
  applicants: "1",
  processing: "standard",
  serviceFee: "85",
  biometrics: "35",
  courier: "25",
};

// 4. Component
export default function VisaFeeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<VisaResults>(() => calcVisa({ country: "usa", baseFee: 185, applicants: 1, processing: "standard", serviceFee: 85, biometrics: 35, courier: 25 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcVisa({ country: "usa", baseFee: 185, applicants: 1, processing: "standard", serviceFee: 85, biometrics: 35, courier: 25 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const selectCountry = (c: string) => setInputs((s) => ({ ...s, country: c, baseFee: String(COUNTRY_FEES[c]?.fee ?? s.baseFee) }));

  const calculate = () =>
    setResult(
      calcVisa({
        country: inputs.country,
        baseFee: parseFloat(inputs.baseFee) || 0,
        applicants: parseFloat(inputs.applicants) || 1,
        processing: inputs.processing,
        serviceFee: parseFloat(inputs.serviceFee) || 0,
        biometrics: parseFloat(inputs.biometrics) || 0,
        courier: parseFloat(inputs.courier) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcVisa({ country: "usa", baseFee: 185, applicants: 1, processing: "standard", serviceFee: 85, biometrics: 35, courier: 25 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const baseFee = parseFloat(inputs.baseFee) || 0;
  const applicants = parseFloat(inputs.applicants) || 0;
  if (baseFee <= 0) errors.baseFee = "Must be greater than 0";
  if (applicants < 1 || applicants > 20) errors.applicants = "Must be 1–20";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much does a US visa cost?", answer: "The standard US nonimmigrant visa application fee is $185 (B-1/B-2 tourist or business). Add the visa service center fee ($85 typical), biometrics ($35), and courier ($25) and a single applicant should budget about $330. Fees are per applicant and are generally non-refundable even if the visa is denied." },
    { question: "Why are there extra fees beyond the visa fee?", answer: "Most countries charge a government application fee plus service-center fees for biometrics, photos, document processing, and passport return. The calculator separates them so you see exactly what the government keeps versus what goes to processing logistics — the two are usually paid separately too." },
    { question: "Is expedited processing worth it?", answer: "Expedited service shortens decision times from weeks to days but typically adds $50–100 per applicant on top of the base fee. It is worth it only when travel dates are firm and close. Note that expedited processing does not guarantee approval — it only speeds up the decision." },
    { question: "Do visa fees vary by country?", answer: "Yes, widely. As of recent schedules, US visitor visas are $185, UK visitor visas about $150, Schengen short-stay €90 (about $100), Canada visitor visas around $125 CAD equivalent, and India e-visas about $40. The calculator pre-fills typical fees for popular destinations but lets you enter the exact amount from the embassy's site." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Visa Fee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Visa Fee Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="country" className={lbl}>Destination</label>
                <select id="country" value={inputs.country} onChange={(e) => selectCountry(e.target.value)} className={sel}>
                  {Object.entries(COUNTRY_FEES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="applicants" className={lbl}>Applicants</label>
                <div className={inp}>
                  <input id="applicants" type="number" min="1" max="20" value={inputs.applicants} onChange={(e) => set("applicants")(e.target.value)} className={ci} />
                </div>
                {errors.applicants && <p className="text-xs text-red-500 font-medium mt-1">{errors.applicants}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="baseFee" className={lbl}>Government Fee</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="baseFee" type="number" min="1" value={inputs.baseFee} onChange={(e) => set("baseFee")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/applicant</span>
                </div>
                {errors.baseFee && <p className="text-xs text-red-500 font-medium mt-1">{errors.baseFee}</p>}
              </div>
              <div>
                <label htmlFor="processing" className={lbl}>Processing</label>
                <select id="processing" value={inputs.processing} onChange={(e) => set("processing")(e.target.value)} className={sel}>
                  <option value="standard">Standard</option>
                  <option value="expedited">Expedited (+$60)</option>
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Service Center Fees</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="serviceFee" className={lbl}>Service / Processing Fee</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="serviceFee" type="number" min="0" step="5" value={inputs.serviceFee} onChange={(e) => set("serviceFee")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">/applicant</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="biometrics" className={lbl}>Biometrics / Photos</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="biometrics" type="number" min="0" step="5" value={inputs.biometrics} onChange={(e) => set("biometrics")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">/applicant</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="courier" className={lbl}>Passport Courier</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="courier" type="number" min="0" step="5" value={inputs.courier} onChange={(e) => set("courier")(e.target.value)} className={ci} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Visa Cost</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.perApplicant.toFixed(2)}/applicant · {inputs.applicants} applicant(s) · includes all fees
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Government Fee", `$${result.govFee.toFixed(2)}`],
                ["Service Fees", `$${(result.serviceFees + result.biometricsFees).toFixed(2)}`],
                ["Per Applicant", `$${result.perApplicant.toFixed(2)}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Fee Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Fee Composition</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`$${v}`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The government fee is the largest line; service-center fees add up fast for families.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Real Cost of a Visa</h2>
            <p>A visa costs far more than the fee on the embassy's price list. Between the government application fee, visa service center charges for biometrics and document handling, expedited processing, and passport courier, a single US visitor visa typically lands around $330 — and those fees are non-refundable even if the visa is refused. This calculator itemizes every layer so the sticker price never surprises you.</p>
            <h2 className="text-2xl font-bold mb-3">Fees Scale Per Applicant</h2>
            <p>Government and service-center fees are charged per person, so a family of four multiplies most lines by four — only the courier is one-time per package. When planning a family trip, run the calculator once with the full applicant count rather than multiplying a single-person estimate, since per-applicant rounding works out differently.</p>
            <h2 className="text-2xl font-bold mb-3">Check the Embassy Site First</h2>
            <p>Visa fees change frequently and vary by visa type — student, work, and transit visas all have their own schedules. The defaults here are typical recent figures for visitor visas and update frequently enough for planning, but always confirm the exact fee on the destination embassy's official site before paying anything.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/visa-fee-calculator" />
          <PopularCalculators exclude="/calculator/visa-fee-calculator" />
        </div>
      </div>
    </>
  );
}
