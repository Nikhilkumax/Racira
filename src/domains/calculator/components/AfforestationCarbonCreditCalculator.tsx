"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface ForestInputs {
  areaHa: number;
  treesPerHa: number;
  survivalPct: number;
  co2PerTreeKg: number;
  creditPrice: number;
  mgmtCostPerHa: number;
  bufferPct: number;
  creditingPeriod: number;
}

interface ForestResult {
  treesPlanted: number;
  livingTrees: number;
  grossSequestration: number;
  bufferCredits: number;
  netCredits: number;
  grossCreditValue: number;
  annualMgmtCost: number;
  netAnnualValue: number;
  lifetimeCredits: number;
  lifetimeNetValue: number;
  valuePerHa: number;
  netPerCredit: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcAfforestation(inp: ForestInputs): ForestResult {
  const treesPlanted = inp.areaHa * inp.treesPerHa;
  const livingTrees = treesPlanted * (inp.survivalPct / 100);
  const grossSequestration = (livingTrees * inp.co2PerTreeKg) / 1000; // tCO2e/yr
  const bufferCredits = grossSequestration * (inp.bufferPct / 100);
  const netCredits = grossSequestration - bufferCredits;
  const grossCreditValue = netCredits * inp.creditPrice;
  const annualMgmtCost = inp.areaHa * inp.mgmtCostPerHa;
  const netAnnualValue = grossCreditValue - annualMgmtCost;
  const lifetimeCredits = netCredits * inp.creditingPeriod;
  const lifetimeNetValue = netAnnualValue * inp.creditingPeriod;
  const valuePerHa = inp.areaHa > 0 ? netAnnualValue / inp.areaHa : 0;
  const netPerCredit = netCredits > 0 ? netAnnualValue / netCredits : 0;

  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
  const fmtCur = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Land Area", value: `${fmtInt(inp.areaHa)} ha` },
    { label: `Planting Density (${fmtInt(inp.treesPerHa)}/ha)`, value: `${fmtInt(treesPlanted)} trees` },
    { label: `Survival Rate (${inp.survivalPct}%)`, value: `${fmtInt(livingTrees)} living trees` },
    { label: `CO₂ Uptake per Tree`, value: `${inp.co2PerTreeKg.toFixed(0)} kg/yr` },
    { label: "Gross Annual Sequestration", value: `${fmtInt(grossSequestration)} tCO₂e/yr` },
    { label: `Buffer Reserve (${inp.bufferPct}%)`, value: `−${fmtInt(bufferCredits)} tCO₂e/yr` },
    { label: "Net Issuable Credits", value: `${fmtInt(netCredits)} credits/yr`, highlight: true },
    { label: "Gross Annual Credit Value", value: fmtCur(grossCreditValue) },
    { label: `Monitoring & Mgmt ($${inp.mgmtCostPerHa.toFixed(0)}/ha/yr)`, value: `−${fmtCur(annualMgmtCost)}/yr` },
    { label: "Net Annual Value", value: `${fmtCur(netAnnualValue)}/yr`, highlight: true },
    { label: `Credits over ${inp.creditingPeriod} Years`, value: `${fmtInt(lifetimeCredits)} credits` },
    { label: "Net Value over Crediting Period", value: fmtCur(lifetimeNetValue), highlight: true },
  ];

  const summaryStats = [
    { label: "Living Trees", value: `${fmtInt(livingTrees)}` },
    { label: "Net Credits per Year", value: `${fmtInt(netCredits)} tCO₂e` },
    { label: "Gross Annual Value", value: `${fmtCur(grossCreditValue)}/yr` },
    { label: "Annual Monitoring & Mgmt", value: `${fmtCur(annualMgmtCost)}/yr` },
    { label: "Net Annual Value", value: `${fmtCur(netAnnualValue)}/yr` },
    { label: "Net Value per Hectare", value: `${fmtCur(valuePerHa)}/ha/yr` },
    { label: "Net Value per Credit", value: `$${netPerCredit.toFixed(2)}` },
    { label: "Lifetime Net Value", value: fmtCur(lifetimeNetValue) },
  ];

  return {
    treesPlanted, livingTrees, grossSequestration, bufferCredits, netCredits,
    grossCreditValue, annualMgmtCost, netAnnualValue, lifetimeCredits,
    lifetimeNetValue, valuePerHa, netPerCredit, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: ForestInputs = {
  areaHa: 100,
  treesPerHa: 1600,
  survivalPct: 80,
  co2PerTreeKg: 15,
  creditPrice: 15,
  mgmtCostPerHa: 10,
  bufferPct: 20,
  creditingPeriod: 25,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AfforestationCarbonCreditCalculator() {
  const [areaHa, setAreaHa] = useState(String(DEFAULTS.areaHa));
  const [treesPerHa, setTreesPerHa] = useState(String(DEFAULTS.treesPerHa));
  const [survivalPct, setSurvivalPct] = useState(String(DEFAULTS.survivalPct));
  const [co2PerTreeKg, setCo2PerTreeKg] = useState(String(DEFAULTS.co2PerTreeKg));
  const [creditPrice, setCreditPrice] = useState(String(DEFAULTS.creditPrice));
  const [mgmtCostPerHa, setMgmtCostPerHa] = useState(String(DEFAULTS.mgmtCostPerHa));
  const [bufferPct, setBufferPct] = useState(String(DEFAULTS.bufferPct));
  const [creditingPeriod, setCreditingPeriod] = useState(String(DEFAULTS.creditingPeriod));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ForestResult>(() => calcAfforestation(DEFAULTS));

  useEffect(() => { setResult(calcAfforestation(DEFAULTS)); }, []);

  const getInputs = (): ForestInputs => ({
    areaHa: parseFloat(areaHa) || 0,
    treesPerHa: parseFloat(treesPerHa) || 0,
    survivalPct: parseFloat(survivalPct) || 0,
    co2PerTreeKg: parseFloat(co2PerTreeKg) || 0,
    creditPrice: parseFloat(creditPrice) || 0,
    mgmtCostPerHa: parseFloat(mgmtCostPerHa) || 0,
    bufferPct: parseFloat(bufferPct) || 0,
    creditingPeriod: parseFloat(creditingPeriod) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const area = parseFloat(areaHa) || 0;
  const density = parseFloat(treesPerHa) || 0;
  const survival = parseFloat(survivalPct) || 0;
  const uptake = parseFloat(co2PerTreeKg) || 0;
  const price = parseFloat(creditPrice) || 0;
  const cost = parseFloat(mgmtCostPerHa) || 0;
  const buffer = parseFloat(bufferPct) || 0;
  const period = parseFloat(creditingPeriod) || 0;
  if (area <= 0) errors.area = "Land area must be greater than 0 hectares.";
  if (density < 100 || density > 5000) errors.density = "Planting density must be 100–5,000 trees/ha.";
  if (survival <= 0 || survival > 100) errors.survival = "Survival rate must be greater than 0 and at most 100%.";
  if (uptake <= 0 || uptake > 100) errors.uptake = "CO₂ uptake must be greater than 0 and at most 100 kg/yr.";
  if (price < 0) errors.price = "Credit price cannot be negative.";
  if (cost < 0) errors.cost = "Monitoring cost cannot be negative.";
  if (buffer < 0 || buffer > 90) errors.buffer = "Buffer reserve must be 0–90%.";
  if (period < 1 || period > 100) errors.period = "Crediting period must be 1–100 years.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcAfforestation(getInputs())); };

  const reset = () => {
    setAreaHa(String(DEFAULTS.areaHa));
    setTreesPerHa(String(DEFAULTS.treesPerHa));
    setSurvivalPct(String(DEFAULTS.survivalPct));
    setCo2PerTreeKg(String(DEFAULTS.co2PerTreeKg));
    setCreditPrice(String(DEFAULTS.creditPrice));
    setMgmtCostPerHa(String(DEFAULTS.mgmtCostPerHa));
    setBufferPct(String(DEFAULTS.bufferPct));
    setCreditingPeriod(String(DEFAULTS.creditingPeriod));
    setResult(calcAfforestation(DEFAULTS));
  };

  const faqs = [
    { question: "What is afforestation, and how is it different from reforestation?", answer: "Afforestation is planting trees on land that has not been forested for at least 50 years, while reforestation replants recently cleared forest land. Both generate carbon credits under standards like Verra's Afforestation, Reforestation and Revegetation methodology, but afforestation projects must prove the baseline was non-forest and typically carry higher upfront costs because they start from bare land. The distinction matters for eligibility and for how conservative the carbon model must be." },
    { question: "How much carbon does a newly planted tree actually absorb?", answer: "Young trees grow quickly and take up carbon dioxide as they build biomass, with uptake peaking in the first decades and slowing as stands mature. A reasonable planning range for mixed afforestation is roughly 10–20 kg of CO₂ per tree per year averaged over a 20–30 year rotation, depending on species, rainfall, and management — which is why the calculator defaults to 15 kg. Real projects must use a methodology-approved growth and yield model rather than a flat per-tree figure, so treat this tool as a screening estimate." },
    { question: "Why are credits deducted for a buffer reserve?", answer: "Standards require afforestation projects to deposit a share of issued credits — commonly 10–30 percent — into a pooled buffer account that protects buyers if stored carbon is later released by fire, disease, pests, or clearing. The deduction is not a cost you pay; it reduces the number of credits you can sell, which is why the calculator nets it out before valuing the project. Higher-risk projects face larger buffer deductions." },
    { question: "What does a survival rate of 80% mean for my project?", answer: "Not every planted seedling survives. Mortality in the first three to five years — from drought, browsing, weeds, or poor planting stock — typically removes 10–30 percent of a stand. The calculator applies the survival rate to the total trees planted to find the living trees that will actually sequester carbon and generate credits, so a project that plants 160,000 trees at an 80 percent survival rate is modeled on 128,000 productive trees." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Afforestation Carbon Credit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Afforestation Carbon Credit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="acc-area" className="text-sm font-medium mb-1 block">Land Area (hectares)</label>
                  <div className={inp}><input id="acc-area" type="number" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ha</span></div>
                  {errors.area && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.area}</p>}
                </div>
                <div>
                  <label htmlFor="acc-density" className="text-sm font-medium mb-1 block">Trees Planted per Hectare</label>
                  <div className={inp}><input id="acc-density" type="number" value={treesPerHa} onChange={(e) => setTreesPerHa(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">/ha</span></div>
                  {errors.density && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.density}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="acc-survival" className="text-sm font-medium mb-1 block">Survival Rate (%)</label>
                  <div className={inp}><input id="acc-survival" type="number" value={survivalPct} onChange={(e) => setSurvivalPct(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.survival && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.survival}</p>}
                </div>
                <div>
                  <label htmlFor="acc-uptake" className="text-sm font-medium mb-1 block">CO₂ Uptake per Tree per Year (kg)</label>
                  <div className={inp}><input id="acc-uptake" type="number" value={co2PerTreeKg} onChange={(e) => setCo2PerTreeKg(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
                  {errors.uptake && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.uptake}</p>}
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
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Project Economics</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="acc-price" className="text-sm font-medium mb-1 block">Credit Price ($/tCO₂e)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="acc-price" type="number" value={creditPrice} onChange={(e) => setCreditPrice(e.target.value)} step="0.5" className={ci} /></div>
                          {errors.price && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.price}</p>}
                        </div>
                        <div>
                          <label htmlFor="acc-cost" className="text-sm font-medium mb-1 block">Monitoring &amp; Mgmt Cost ($/ha/yr)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="acc-cost" type="number" value={mgmtCostPerHa} onChange={(e) => setMgmtCostPerHa(e.target.value)} className={ci} /></div>
                          {errors.cost && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.cost}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Verification &amp; Risk</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="acc-buffer" className="text-sm font-medium mb-1 block">Buffer Reserve (%)</label>
                          <div className={inp}><input id="acc-buffer" type="number" value={bufferPct} onChange={(e) => setBufferPct(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.buffer && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.buffer}</p>}
                        </div>
                        <div>
                          <label htmlFor="acc-period" className="text-sm font-medium mb-1 block">Crediting Period (years)</label>
                          <div className={inp}><input id="acc-period" type="number" value={creditingPeriod} onChange={(e) => setCreditingPeriod(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
                          {errors.period && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.period}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Buffer pools insure against reversal (fire, pests, clearing). AFOLU crediting periods typically run 20–40 years and can be renewed.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Annual Carbon Credits</div>
              <div className="text-4xl font-extrabold tracking-tight text-emerald-600">{Math.round(result.netCredits).toLocaleString("en-US")}<span className="text-2xl text-muted-foreground"> tCO₂e/yr</span></div>
              <div className="text-sm text-muted-foreground mt-1">{Math.round(result.grossSequestration).toLocaleString("en-US")} gross − {Math.round(result.bufferCredits).toLocaleString("en-US")} buffer · ≈ ${Math.round(result.netAnnualValue).toLocaleString("en-US")}/yr net value</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Living Trees", `${Math.round(result.livingTrees).toLocaleString("en-US")}`],
                ["Gross Sequestration", `${Math.round(result.grossSequestration).toLocaleString("en-US")} tCO₂e/yr`],
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
              <h3 className="text-base font-bold mb-4">Project Breakdown</h3>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Afforestation Carbon Credit Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An afforestation carbon credit calculator estimates how many carbon credits a tree-planting project can generate and what those credits are worth, starting from the two numbers a landowner actually controls: the land area and the planting density. Afforestation — planting trees on land that has not held forest for decades — is one of the most accessible nature-based climate projects, but its economics are easy to get wrong in either direction. Optimistic pitches quote gross sequestration from a fully stocked, mature stand, while cautious developers mentally discount for seedling mortality and buffer deductions without ever putting numbers on the table. This tool builds the credit chain from the ground up: it applies a survival rate to every planted tree, multiplies the living trees by an annual carbon uptake per tree, deducts the buffer reserve that standards require as insurance against reversal, and prices the remaining credits in the voluntary market. The result is a realistic annual picture of issuable credits and net revenue that a landowner, investor, or project developer can take into a feasibility conversation with a verifier.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Afforestation Credits Are Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation follows the credit issuance chain from planting to sale. Total trees planted is the land area multiplied by the planting density. The survival rate then determines how many of those seedlings reach productive maturity — the living trees that will actually photosynthesize and store carbon. Each living tree removes carbon dioxide each year as it builds trunk, branch, and root biomass, so multiplying living trees by the per-tree uptake and dividing by one thousand converts the annual removal into metric tons of carbon dioxide equivalent. That gross sequestration is the theoretical credit output before risk adjustments. Under the major standards, afforestation projects must deposit a share of credits — the buffer reserve, commonly 10 to 30 percent — into a pooled account that compensates buyers if fire, disease, or clearing later releases the stored carbon; subtracting that share leaves the net issuable credits, the figure the project can actually sell. Valuing those net credits at a market price gives the gross annual credit value, from which the calculator subtracts ongoing monitoring and management costs to reach net annual value. Extending that net value across the full crediting period — typically 25 to 40 years for forestry, often renewable — yields the lifetime revenue stream, and dividing by land area gives value per hectare so different projects or land uses can be compared on equal footing. The math deliberately stops at operating costs: development capital, verification audits, and standard registration fees are excluded so the output stays a screening estimate rather than a full project pro-forma.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline figure is the net annual credits the project can issue — the number that actually reaches the market — with gross sequestration and net lifetime value shown alongside. The defaults describe a mid-size project: 100 hectares planted at 1,600 trees per hectare, an 80 percent survival rate, and 15 kilograms of CO₂ absorbed per tree per year. That yields about 128,000 living trees removing roughly 1,900 tons of CO₂ annually, which becomes about 1,500 issuable credits after a 20 percent buffer — worth around $22,000 per year net of monitoring costs, or over half a million dollars across a 25-year crediting period. The breakdown table traces each step from planting through buffer deduction to net value, and the summary statistics add the per-hectare and per-credit economics that let you compare against alternative land uses. The most sensitive levers are survival rate and uptake per tree, both of which move credits nearly linearly, so stress-test them before committing. Remember that every input is a planning estimate: real projects must use methodology-approved carbon models and carry third-party verification costs, and credit prices in the voluntary market vary widely by standard and vintage. Use this tool to decide whether a full feasibility study is worth commissioning, then let the methodology do the precise accounting.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/afforestation-carbon-credit-calculator" />
          <PopularCalculators exclude="/calculator/afforestation-carbon-credit-calculator" />
        </div>
      </div>
    </>
  );
}
