"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface CarbonInputs {
  areaHa: number;
  seqRate: number;
  creditPrice: number;
  bufferPct: number;
  creditingPeriod: number;
  opCostPerHa: number;
}

interface CarbonResult {
  grossSequestration: number;
  bufferCredits: number;
  netCredits: number;
  grossValue: number;
  annualOpCost: number;
  netValue: number;
  lifetimeCredits: number;
  lifetimeNetValue: number;
  valuePerHa: number;
  revenuePerCredit: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcCarbonCredit(inp: CarbonInputs): CarbonResult {
  const grossSequestration = inp.areaHa * inp.seqRate;
  const bufferCredits = grossSequestration * (inp.bufferPct / 100);
  const netCredits = grossSequestration - bufferCredits;
  const grossValue = netCredits * inp.creditPrice;
  const annualOpCost = inp.areaHa * inp.opCostPerHa;
  const netValue = grossValue - annualOpCost;
  const lifetimeCredits = netCredits * inp.creditingPeriod;
  const lifetimeNetValue = netValue * inp.creditingPeriod;
  const valuePerHa = inp.areaHa > 0 ? netValue / inp.areaHa : 0;
  const revenuePerCredit = netCredits > 0 ? netValue / netCredits : 0;

  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Project Area", value: `${fmtInt(inp.areaHa)} ha` },
    { label: "Net Sequestration Rate", value: `${inp.seqRate.toFixed(2)} tCO₂e/ha/yr` },
    { label: "Gross Annual Sequestration", value: `${fmtInt(grossSequestration)} tCO₂e` },
    { label: `Buffer Reserve (${inp.bufferPct}%)`, value: `−${fmtInt(bufferCredits)} tCO₂e` },
    { label: "Issuable Credits (Net)", value: `${fmtInt(netCredits)} credits/yr`, highlight: true },
    { label: `Credit Price`, value: `$${inp.creditPrice.toFixed(2)}/credit` },
    { label: "Gross Annual Credit Value", value: `$${fmtInt(grossValue)}` },
    { label: `Operating Cost ($${inp.opCostPerHa.toFixed(2)}/ha/yr)`, value: `−$${fmtInt(annualOpCost)}/yr` },
    { label: "Net Annual Credit Value", value: `$${fmtInt(netValue)}/yr`, highlight: true },
    { label: `Credits over ${inp.creditingPeriod} Years`, value: `${fmtInt(lifetimeCredits)} credits` },
    { label: "Net Value over Crediting Period", value: `$${fmtInt(lifetimeNetValue)}`, highlight: true },
    { label: "Net Value per Hectare", value: `$${fmtInt(valuePerHa)}/ha/yr` },
  ];

  const summaryStats = [
    { label: "Net Credits per Year", value: `${fmtInt(netCredits)} tCO₂e` },
    { label: "Net Annual Value", value: `$${fmtInt(netValue)}` },
    { label: "Gross Annual Value", value: `$${fmtInt(grossValue)}` },
    { label: "Buffer Reserve", value: `${fmtInt(bufferCredits)} credits/yr` },
    { label: "Operating Cost", value: `$${fmtInt(annualOpCost)}/yr` },
    { label: "Value per Hectare", value: `$${fmtInt(valuePerHa)}/ha/yr` },
    { label: "Net per Credit", value: `$${revenuePerCredit.toFixed(2)}` },
    { label: "Lifetime Net Value", value: `$${fmtInt(lifetimeNetValue)}` },
  ];

  return {
    grossSequestration, bufferCredits, netCredits, grossValue, annualOpCost, netValue,
    lifetimeCredits, lifetimeNetValue, valuePerHa, revenuePerCredit, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: CarbonInputs = {
  areaHa: 500,
  seqRate: 8,
  creditPrice: 15,
  bufferPct: 20,
  creditingPeriod: 30,
  opCostPerHa: 10,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CarbonCreditValueCalculator() {
  const [areaHa, setAreaHa] = useState(String(DEFAULTS.areaHa));
  const [seqRate, setSeqRate] = useState(String(DEFAULTS.seqRate));
  const [creditPrice, setCreditPrice] = useState(String(DEFAULTS.creditPrice));
  const [bufferPct, setBufferPct] = useState(String(DEFAULTS.bufferPct));
  const [creditingPeriod, setCreditingPeriod] = useState(String(DEFAULTS.creditingPeriod));
  const [opCostPerHa, setOpCostPerHa] = useState(String(DEFAULTS.opCostPerHa));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CarbonResult>(() => calcCarbonCredit(DEFAULTS));

  useEffect(() => { setResult(calcCarbonCredit(DEFAULTS)); }, []);

  const getInputs = (): CarbonInputs => ({
    areaHa: parseFloat(areaHa) || 0,
    seqRate: parseFloat(seqRate) || 0,
    creditPrice: parseFloat(creditPrice) || 0,
    bufferPct: parseFloat(bufferPct) || 0,
    creditingPeriod: parseFloat(creditingPeriod) || 0,
    opCostPerHa: parseFloat(opCostPerHa) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const area = parseFloat(areaHa) || 0;
  const rate = parseFloat(seqRate) || 0;
  const price = parseFloat(creditPrice) || 0;
  const buffer = parseFloat(bufferPct) || 0;
  const period = parseFloat(creditingPeriod) || 0;
  const opCost = parseFloat(opCostPerHa) || 0;
  if (area <= 0) errors.area = "Project area must be greater than 0 hectares.";
  if (rate <= 0) errors.rate = "Sequestration rate must be greater than 0.";
  if (price < 0) errors.price = "Credit price cannot be negative.";
  if (buffer < 0 || buffer > 90) errors.buffer = "Buffer reserve must be 0–90%.";
  if (period < 1 || period > 100) errors.period = "Crediting period must be 1–100 years.";
  if (opCost < 0) errors.opCost = "Operating cost cannot be negative.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcCarbonCredit(getInputs())); };

  const reset = () => {
    setAreaHa(String(DEFAULTS.areaHa));
    setSeqRate(String(DEFAULTS.seqRate));
    setCreditPrice(String(DEFAULTS.creditPrice));
    setBufferPct(String(DEFAULTS.bufferPct));
    setCreditingPeriod(String(DEFAULTS.creditingPeriod));
    setOpCostPerHa(String(DEFAULTS.opCostPerHa));
    setResult(calcCarbonCredit(DEFAULTS));
  };

  const faqs = [
    { question: "What is a carbon credit?", answer: "A carbon credit (or carbon offset) represents one metric ton of carbon dioxide equivalent (tCO₂e) that has been removed from the atmosphere or avoided. Projects such as afforestation, improved forest management, and soil carbon sequestration are measured and verified against methodologies from standards bodies like Verra (VCS) or the Gold Standard before credits are issued." },
    { question: "What is the buffer reserve?", answer: "The buffer reserve is a percentage of credits withheld from sale as insurance against reversal — for example, if a forest burns or trees are cut down. The credits go into a shared buffer pool managed by the standard. If losses occur, buffer credits are cancelled to compensate. Forestry projects typically carry buffer deductions of 10–30%, which is why the calculator defaults to 20%." },
    { question: "How much are carbon credits worth?", answer: "Voluntary carbon credit prices vary widely by project type, vintage, and standard — from roughly $3–$10 for many nature-based credits to $20–$50+ for high-quality removal credits with strong co-benefits. Compliance markets such as California's cap-and-trade have traded well above $30. The $15 default reflects a mid-range voluntary-market nature-based credit." },
    { question: "How do I estimate a sequestration rate for my land?", answer: "Net sequestration depends on climate, species, and management. Temperate reforestation typically removes 3–10 tCO₂e per hectare per year; tropical afforestation can reach 10–20; improved forest management adds roughly 1–3; soil carbon practices often add under 1–2. For a real project you must use a methodology-approved model — these defaults are for initial screening only." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Carbon Credit Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbon Credit Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cc-area" className="text-sm font-medium mb-1 block">Project Area (hectares)</label>
                  <div className={inp}><input id="cc-area" type="number" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ha</span></div>
                  {errors.area && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.area}</p>}
                </div>
                <div>
                  <label htmlFor="cc-rate" className="text-sm font-medium mb-1 block">Net Sequestration (tCO₂e/ha/yr)</label>
                  <div className={inp}><input id="cc-rate" type="number" value={seqRate} onChange={(e) => setSeqRate(e.target.value)} step="0.1" className={ci} /></div>
                  {errors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.rate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cc-price" className="text-sm font-medium mb-1 block">Credit Price ($/tCO₂e)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="cc-price" type="number" value={creditPrice} onChange={(e) => setCreditPrice(e.target.value)} step="0.5" className={ci} /></div>
                  {errors.price && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label htmlFor="cc-buffer" className="text-sm font-medium mb-1 block">Buffer Reserve (%)</label>
                  <div className={inp}><input id="cc-buffer" type="number" value={bufferPct} onChange={(e) => setBufferPct(e.target.value)} step="1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.buffer && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.buffer}</p>}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Project Costs &amp; Timeline</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="cc-period" className="text-sm font-medium mb-1 block">Crediting Period (years)</label>
                          <div className={inp}><input id="cc-period" type="number" value={creditingPeriod} onChange={(e) => setCreditingPeriod(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
                          {errors.period && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.period}</p>}
                        </div>
                        <div>
                          <label htmlFor="cc-opcost" className="text-sm font-medium mb-1 block">Operating Cost ($/ha/yr)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="cc-opcost" type="number" value={opCostPerHa} onChange={(e) => setOpCostPerHa(e.target.value)} className={ci} /></div>
                          {errors.opCost && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.opCost}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Includes monitoring, verification, and management. AFOLU crediting periods are typically 20–40 years (renewable).</p>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Annual Credit Value</div>
              <div className="text-4xl font-extrabold tracking-tight text-emerald-600">${Math.round(result.netValue).toLocaleString("en-US")}<span className="text-2xl text-muted-foreground">/yr</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.netCredits.toLocaleString("en-US", { maximumFractionDigits: 0 })} credits/yr × ${price.toFixed(2)} − ${Math.round(result.annualOpCost).toLocaleString("en-US")} costs</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Credits per Year", `${Math.round(result.netCredits).toLocaleString("en-US")} tCO₂e`],
                ["Buffer Reserve", `${Math.round(result.bufferCredits).toLocaleString("en-US")} tCO₂e/yr`],
                ["Net Lifetime Value", `$${Math.round(result.lifetimeNetValue).toLocaleString("en-US")}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Credit &amp; Value Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Carbon Credit Value Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A carbon credit value calculator estimates how many carbon credits a land-based project can generate and what those credits are worth, turning a parcel of land into an understandable annual revenue figure. Landowners, project developers, and investors evaluating afforestation, reforestation, improved forest management, or soil carbon projects all start from the same three questions: how much carbon will this land actually remove each year, how many of those tons will survive the standard&apos;s risk deductions and be issued as tradable credits, and what will the market pay for them? This tool answers those questions in one pass. It multiplies project area by a net sequestration rate to find gross annual removals, applies a buffer reserve deduction that protects against reversal risk, and multiplies the remaining issuable credits by a price per credit to arrive at the project&apos;s credit value. Because a real project also carries ongoing costs — monitoring, verification, management, and reporting — the calculator nets those out and extends the result across a full crediting period, so you see both the annual picture and the lifetime revenue stream that a developer would underwrite against.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Carbon Credit Value Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation follows the credit issuance chain used by the major standards. Gross annual sequestration is the project area in hectares multiplied by the net sequestration rate in metric tons of carbon dioxide equivalent per hectare per year — the carbon actually held in new biomass, net of any emissions the project causes. The buffer reserve is then deducted as a percentage of that gross figure; standards such as Verra require forestry projects to deposit a share of credits, commonly 10 to 30 percent, into a pooled buffer account that compensates buyers if the carbon is later released through fire, pests, or clearing. The credits remaining after the buffer are the ones that can be verified, issued, and sold. Multiplying those net credits by the price per credit gives the gross annual credit value. From that, the calculator subtracts the operating cost per hectare to reach net annual value, which it then projects across the crediting period to show lifetime value. Two derived figures complete the picture: value per hectare per year, which lets you compare project types and land-use alternatives on equal footing, and net revenue per credit, which shows what each sold credit contributes after costs. The math deliberately stops at operating costs — development capital, verification audits, and standard fees are excluded so that the tool stays a screening estimate rather than a full pro-forma model.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline figure is the net annual credit value after buffer deductions and operating costs, with the number of issuable credits and the lifetime value across the full crediting period shown alongside it. The defaults describe a typical mid-size project: 500 hectares of temperate reforestation removing 8 tons per hectare per year, a 20 percent buffer, credits priced at $15, and $10 per hectare of annual operating cost — which yields roughly 3,200 issuable credits and about $43,000 of net annual value, or over $1.2 million across a 30-year crediting period. The breakdown table traces each step so you can see exactly how the buffer and costs shrink the headline number, and the summary statistics condense the economics into per-hectare and per-credit terms. Experiment with the sensitivity of the model: sequestration rate and credit price move value almost linearly, while the buffer and operating cost are the levers that separate a realistic projection from an optimistic one. Remember that every input is an estimate — real projects must use methodology-approved carbon models, and credit prices have swung widely with market conditions — so treat the output as a first-order screen that tells you whether a full feasibility study is worth commissioning.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbon-credit-value-calculator" />
          <PopularCalculators exclude="/calculator/carbon-credit-value-calculator" />
        </div>
      </div>
    </>
  );
}
