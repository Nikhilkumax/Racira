"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Thermometer, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type SourceKey = "greenland" | "antarcticaWest" | "antarcticaEast" | "glaciers" | "seaIce" | "custom";

interface IceSource {
  key: SourceKey;
  label: string;
  totalGigatonnes: number;
  potentialRiseM: number;
  grounded: boolean;
  currentLossGtPerYear: number;
}

interface SeaLevelInputs {
  source: SourceKey;
  meltFraction: number;
  customVolumeKm3: number;
  years: number;
  proMode: boolean;
  thermalExpansionMmPerYear: number;
  landSubsidenceMmPerYear: number;
  coastalSlopePercent: number;
  elevationM: number;
}

interface ChartPoint {
  name: string;
  value: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface SeaLevelResult {
  meltedGigatonnes: number;
  meltedVolumeKm3: number;
  riseFromIceMm: number;
  riseFromThermalMm: number;
  totalRiseMm: number;
  totalRiseM: number;
  relativeRiseMm: number;
  landLostKm2: number;
  shorelineRetreatM: number;
  yearsUntilFlooded: number;
  ratePerYearMm: number;
  percentOfPotential: number;
  chartData: ChartPoint[];
  rows: TableRow[];
}

// Ocean surface area in km2, the denominator that converts melt volume to depth.
const OCEAN_AREA_KM2 = 361_900_000;
// Ice density (g/cm3) relative to fresh water; 1 Gt of ice = 1 km3 of water.
const ICE_DENSITY = 0.917;

const SOURCES: IceSource[] = [
  { key: "greenland", label: "Greenland Ice Sheet", totalGigatonnes: 2_900_000, potentialRiseM: 7.4, grounded: true, currentLossGtPerYear: 270 },
  { key: "antarcticaWest", label: "West Antarctic Ice Sheet", totalGigatonnes: 2_200_000, potentialRiseM: 5.3, grounded: true, currentLossGtPerYear: 150 },
  { key: "antarcticaEast", label: "East Antarctic Ice Sheet", totalGigatonnes: 21_700_000, potentialRiseM: 53.3, grounded: true, currentLossGtPerYear: 30 },
  { key: "glaciers", label: "Mountain Glaciers & Ice Caps", totalGigatonnes: 158_000, potentialRiseM: 0.32, grounded: true, currentLossGtPerYear: 290 },
  { key: "seaIce", label: "Arctic Sea Ice (floating)", totalGigatonnes: 15_000, potentialRiseM: 0, grounded: false, currentLossGtPerYear: 0 },
  { key: "custom", label: "Custom Ice Volume", totalGigatonnes: 0, potentialRiseM: 0, grounded: true, currentLossGtPerYear: 0 },
];

function sourceFor(key: SourceKey): IceSource {
  return SOURCES.find((s) => s.key === key) ?? SOURCES[0];
}

const DEFAULTS: SeaLevelInputs = {
  source: "greenland",
  meltFraction: 10,
  customVolumeKm3: 100_000,
  years: 100,
  proMode: false,
  thermalExpansionMmPerYear: 1.4,
  landSubsidenceMmPerYear: 0,
  coastalSlopePercent: 0.5,
  elevationM: 3,
};

function calculateSeaLevel(inputs: SeaLevelInputs): SeaLevelResult {
  const spec = sourceFor(inputs.source);

  const totalGigatonnes =
    inputs.source === "custom" ? inputs.customVolumeKm3 * ICE_DENSITY : spec.totalGigatonnes;

  const meltedGigatonnes = totalGigatonnes * (inputs.meltFraction / 100);
  // 1 Gt of ice mass yields 1 km3 of liquid water (1 Gt = 1e12 kg, water = 1000 kg/m3).
  const meltedVolumeKm3 = meltedGigatonnes;

  // Floating ice displaces its own mass and adds essentially nothing on melting.
  const riseFromIceMm = spec.grounded ? (meltedVolumeKm3 / OCEAN_AREA_KM2) * 1_000_000 : 0;

  const riseFromThermalMm = inputs.thermalExpansionMmPerYear * inputs.years;
  const totalRiseMm = riseFromIceMm + riseFromThermalMm;
  const totalRiseM = totalRiseMm / 1000;

  const subsidenceMm = inputs.landSubsidenceMmPerYear * inputs.years;
  const relativeRiseMm = totalRiseMm + subsidenceMm;

  // Bruun-style horizontal retreat: vertical rise divided by the coastal gradient.
  const slope = inputs.coastalSlopePercent > 0 ? inputs.coastalSlopePercent / 100 : 0.005;
  const shorelineRetreatM = totalRiseM / slope;

  // Global land loss scales with retreat along roughly 1.6 million km of coastline.
  const coastlineKm = 1_600_000;
  const landLostKm2 = (shorelineRetreatM / 1000) * coastlineKm;

  const ratePerYearMm = inputs.years > 0 ? relativeRiseMm / inputs.years : 0;
  const elevationMm = inputs.elevationM * 1000;
  const yearsUntilFlooded =
    ratePerYearMm > 0 ? elevationMm / ratePerYearMm : Number.POSITIVE_INFINITY;

  const percentOfPotential =
    spec.potentialRiseM > 0 ? (totalRiseM / spec.potentialRiseM) * 100 : 0;

  const chartData: ChartPoint[] = [
    { name: "Ice Melt", value: Math.round(riseFromIceMm * 10) / 10, color: "#0ea5e9" },
    { name: "Thermal", value: Math.round(riseFromThermalMm * 10) / 10, color: "#f59e0b" },
    { name: "Subsidence", value: Math.round(subsidenceMm * 10) / 10, color: "#a855f7" },
    { name: "Total", value: Math.round(relativeRiseMm * 10) / 10, color: "#dc2626" },
  ].filter((point) => point.value > 0 || point.name === "Total");

  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const rows: TableRow[] = [
    { label: "Ice Source", value: spec.label },
    { label: "Total Ice Mass", value: `${num(totalGigatonnes, 0)} Gt` },
    { label: "Melt Fraction", value: `${num(inputs.meltFraction)}%` },
    { label: "Ice Melted", value: `${num(meltedGigatonnes, 0)} Gt` },
    { label: "Meltwater Volume", value: `${num(meltedVolumeKm3, 0)} km³` },
    { label: "Rise from Ice Melt", value: `${num(riseFromIceMm)} mm`, key: true },
    { label: "Rise from Thermal Expansion", value: `${num(riseFromThermalMm)} mm` },
    { label: "Total Eustatic Rise", value: `${num(totalRiseMm)} mm (${num(totalRiseM, 2)} m)`, key: true },
    { label: "Land Subsidence", value: `${num(subsidenceMm)} mm` },
    { label: "Relative Local Rise", value: `${num(relativeRiseMm)} mm` },
    { label: "Shoreline Retreat", value: `${num(shorelineRetreatM, 0)} m` },
    { label: "Rate of Rise", value: `${num(ratePerYearMm, 2)} mm/year` },
  ];

  return {
    meltedGigatonnes,
    meltedVolumeKm3,
    riseFromIceMm,
    riseFromThermalMm,
    totalRiseMm,
    totalRiseM,
    relativeRiseMm,
    landLostKm2,
    shorelineRetreatM,
    yearsUntilFlooded,
    ratePerYearMm,
    percentOfPotential,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function SeaLevelRiseFromIceMeltCalculator() {
  const [inputs, setInputs] = useState<SeaLevelInputs>(DEFAULTS);
  const [result, setResult] = useState<SeaLevelResult>(calculateSeaLevel(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateSeaLevel(inputs));
  }, []);

  const calculate = () => setResult(calculateSeaLevel(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateSeaLevel(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof SeaLevelInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const spec = sourceFor(inputs.source);

  const faqs = [
    {
      question: "How is sea level rise from melting ice calculated?",
      answer:
        "Divide the volume of meltwater by the surface area of the ocean. One gigatonne of ice is a trillion kilograms, which becomes one cubic kilometre of water, and the ocean covers about 361.9 million square kilometres. Spreading one cubic kilometre over that area raises the surface by roughly 0.00276 millimetres, so it takes around 362 gigatonnes of ice loss to add a single millimetre of global sea level.",
    },
    {
      question: "Why does melting sea ice not raise sea level?",
      answer:
        "Floating ice already displaces a volume of water equal to its own mass, which is Archimedes' principle. When it melts, the meltwater fills exactly the space the submerged portion occupied, so the level is unchanged. Only grounded ice resting on bedrock above sea level adds new water to the ocean. This calculator sets the contribution from Arctic sea ice to zero for that reason, even though its loss has significant effects on albedo and regional climate.",
    },
    {
      question: "How much would sea level rise if all the ice melted?",
      answer:
        "Roughly 65 metres in total. East Antarctica holds the majority at about 53 metres, West Antarctica adds around 5.3 metres, Greenland 7.4 metres, and all mountain glaciers and ice caps combined only about 0.32 metres. Complete melting would take many thousands of years even under extreme warming, but partial contributions from the more vulnerable West Antarctic and Greenland sheets are the ones that matter on a policy-relevant timescale.",
    },
    {
      question: "What is thermal expansion and why does it matter?",
      answer:
        "Water expands as it warms, so a warmer ocean occupies more volume without any ice melting at all. Thermal expansion accounted for roughly half of observed sea level rise through the twentieth century and currently contributes on the order of 1.3 to 1.5 millimetres per year. Because the deep ocean takes centuries to equilibrate, expansion already committed by past warming will continue long after surface temperatures stabilize.",
    },
    {
      question: "What is the difference between eustatic and relative sea level?",
      answer:
        "Eustatic rise is the global average change in ocean volume. Relative sea level is what a particular coastline actually experiences, and it combines the global signal with local vertical land motion. Cities built on compacting deltas or extracting groundwater can subside several millimetres per year, which effectively doubles or triples the local rate. Conversely, land still rebounding from the last ice age can see relative sea level fall despite global rise.",
    },
    {
      question: "How far inland does the shoreline move per metre of rise?",
      answer:
        "It depends almost entirely on coastal gradient. A shoreline sloping at 0.5% retreats about 200 metres for every metre of vertical rise, while a steep rocky coast at 5% retreats only 20 metres. Very flat deltaic and barrier-island coasts at 0.1% can lose a kilometre or more per metre. This geometric relationship, sometimes formalized as the Bruun rule, explains why low-gradient coastlines dominate global exposure statistics.",
    },
    {
      question: "How fast is sea level rising right now?",
      answer:
        "Satellite altimetry puts the current global rate at roughly 4.3 to 4.5 millimetres per year, up from about 2.1 millimetres per year in the early 1990s. The acceleration is driven mainly by increasing ice sheet loss. Greenland is currently shedding on the order of 270 gigatonnes per year and Antarctica around 150 gigatonnes per year, figures that have both risen substantially since the 2000s.",
    },
    {
      question: "Are these projections predictions of the future?",
      answer:
        "No. This is a physical conversion tool, not a climate model. It answers what a given amount of ice loss would do to sea level, using fixed geometry and densities. It does not forecast how much ice will actually melt, which depends on emissions pathways, ice sheet dynamics, and marine ice cliff instability that remain active areas of research. Use it to build intuition about scale, and consult IPCC assessments for actual projections.",
    },
  ];

  const fmt = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/calculator#environment" },
          { label: "Sea Level Rise from Ice Melt Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Sea Level Rise from Ice Melt Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="source" className={lbl}>Ice Source</label>
                <select id="source" className={inp} value={inputs.source}
                  onChange={(e) => setInputs((p) => ({ ...p, source: e.target.value as SourceKey }))}>
                  {SOURCES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              {inputs.source === "custom" ? (
                <div className="col-span-2">
                  <label htmlFor="customVolumeKm3" className={lbl}>Ice Volume (km³)</label>
                  <input id="customVolumeKm3" type="number" min="0" step="1000" className={inp}
                    value={inputs.customVolumeKm3} onChange={(e) => setNum("customVolumeKm3", e.target.value)} />
                </div>
              ) : null}
              <div>
                <label htmlFor="meltFraction" className={lbl}>Melt Fraction (%)</label>
                <input id="meltFraction" type="number" min="0" max="100" step="1" className={inp}
                  value={inputs.meltFraction} onChange={(e) => setNum("meltFraction", e.target.value)} />
              </div>
              <div>
                <label htmlFor="years" className={lbl}>Time Horizon (years)</label>
                <input id="years" type="number" min="1" step="10" className={inp} value={inputs.years}
                  onChange={(e) => setNum("years", e.target.value)} />
              </div>
            </div>

            {!spec.grounded ? (
              <p className="text-xs text-muted-foreground bg-secondary/20 border border-border rounded-md p-2.5">
                Floating ice displaces its own mass, so melting it contributes no sea level rise. Only the thermal
                expansion term below will affect the result.
              </p>
            ) : null}

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Thermometer className="h-3.5 w-3.5" /> Ocean &amp; Land Motion
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="thermalExpansionMmPerYear" className={lbl}>Thermal Expansion (mm/yr)</label>
                        <input id="thermalExpansionMmPerYear" type="number" min="0" step="0.1" className={inp}
                          value={inputs.thermalExpansionMmPerYear}
                          onChange={(e) => setNum("thermalExpansionMmPerYear", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="landSubsidenceMmPerYear" className={lbl}>Land Subsidence (mm/yr)</label>
                        <input id="landSubsidenceMmPerYear" type="number" step="0.1" className={inp}
                          value={inputs.landSubsidenceMmPerYear}
                          onChange={(e) => setNum("landSubsidenceMmPerYear", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Waves className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock coastal impact and inundation timing
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="coastalSlopePercent" className={lbl}>Coastal Slope (%)</label>
                          <input id="coastalSlopePercent" type="number" min="0.01" step="0.1" className={inp}
                            value={inputs.coastalSlopePercent}
                            onChange={(e) => setNum("coastalSlopePercent", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="elevationM" className={lbl}>Site Elevation (m)</label>
                          <input id="elevationM" type="number" min="0" step="0.5" className={inp}
                            value={inputs.elevationM} onChange={(e) => setNum("elevationM", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Sea Level Rise</div>
              <div className="text-4xl font-bold text-primary">{fmt(result.totalRiseMm, 1)} mm</div>
              <div className="text-sm text-muted-foreground">
                {fmt(result.totalRiseM, 3)} m from {fmt(inputs.meltFraction, 0)}% melt of the {spec.label.toLowerCase()} over {fmt(inputs.years, 0)} years
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">From Ice Melt</div>
                <div className="text-lg font-bold text-sky-600">{fmt(result.riseFromIceMm)} mm</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">From Thermal</div>
                <div className="text-lg font-bold text-amber-600">{fmt(result.riseFromThermalMm)} mm</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Rate</div>
                <div className="text-lg font-bold text-red-600">{fmt(result.ratePerYearMm, 2)} mm/yr</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Parameter</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Relative Local Rise</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{fmt(result.relativeRiseMm)} mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Contributions to Sea Level Rise (mm)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <RTooltip formatter={(value: number) => [`${value.toLocaleString("en-US")} mm`, "Rise"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((point) => (
                    <div key={point.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: point.color }} />
                      {point.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Coastal Impact Projection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shoreline Retreat</div>
                    <div className="text-base font-bold text-red-600">{fmt(result.shorelineRetreatM, 0)} m inland</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Land Area Lost</div>
                    <div className="text-base font-bold text-foreground">{fmt(result.landLostKm2, 0)} km²</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Years Until Site Inundated</div>
                    <div className="text-base font-bold text-amber-600">
                      {Number.isFinite(result.yearsUntilFlooded) ? `${fmt(result.yearsUntilFlooded, 0)} years` : "Not on this trajectory"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Share of Source Potential</div>
                    <div className="text-base font-bold text-foreground">
                      {spec.potentialRiseM > 0 ? `${fmt(result.percentOfPotential, 1)}% of ${fmt(spec.potentialRiseM, 1)} m` : "n/a (floating ice)"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Observed Loss Rate</div>
                    <div className="text-sm text-muted-foreground">
                      {spec.currentLossGtPerYear > 0
                        ? `${spec.currentLossGtPerYear.toLocaleString("en-US")} Gt per year is the approximate present-day mass loss for this source. At that rate, melting ${fmt(result.meltedGigatonnes, 0)} Gt would take about ${fmt(result.meltedGigatonnes / spec.currentLossGtPerYear, 0)} years, holding the rate constant.`
                        : "This source has no meaningful grounded mass loss contribution to sea level."}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Turning Ice Mass Into Millimetres of Ocean</h2>
            <p className="mb-4">
              The conversion is a single division: meltwater volume divided by ocean surface area. What makes it tractable
              is a convenient coincidence of units. One gigatonne is a trillion kilograms, and since fresh water has a
              density of 1000 kilograms per cubic metre, a gigatonne of ice becomes exactly one cubic kilometre of water.
              The ocean covers about 361.9 million square kilometres, so spreading that cubic kilometre across it raises
              the surface by roughly 0.00276 millimetres. Inverted, it takes about 362 gigatonnes of grounded ice loss to
              add one millimetre of global sea level, which is the number worth committing to memory when reading mass
              balance figures from Greenland or Antarctica.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Floating Ice Is Excluded</h2>
            <p className="mb-4">
              Arctic sea ice and Antarctic ice shelves are already afloat, and by Archimedes' principle a floating body
              displaces water equal to its own mass. When that ice melts, the resulting water fills precisely the volume
              the submerged portion had occupied, and the sea surface does not move. This is why the calculator assigns
              zero direct rise to sea ice despite its enormous extent. The exclusion is narrow, though: ice shelves act as
              buttresses that slow the grounded ice flowing behind them, so their collapse accelerates the discharge of ice
              that does raise sea level. The indirect effect is real even though the direct one is nil.
            </p>

            <h2 className="text-2xl font-bold mb-3">Thermal Expansion, the Other Half of the Problem</h2>
            <p className="mb-4">
              Roughly half of the sea level rise observed during the twentieth century came from nothing melting at all.
              Seawater expands as it warms, and the ocean has absorbed the overwhelming majority of the excess heat trapped
              by greenhouse gases. Current expansion contributes on the order of 1.3 to 1.5 millimetres per year. Because
              heat penetrates the deep ocean slowly and mixes over centuries, a substantial amount of expansion is already
              committed by warming that has occurred, and would continue for generations even if surface temperatures were
              stabilized immediately. The time horizon input here multiplies the annual expansion rate, which makes that
              commitment visible alongside the melt contribution.
            </p>

            <h2 className="text-2xl font-bold mb-3">Global Averages Versus What a Coastline Experiences</h2>
            <p className="mb-4">
              Eustatic rise describes the change in global ocean volume, but no coastline experiences the global average.
              Relative sea level combines that signal with vertical land motion, and the local term is often larger.
              Deltaic cities compacting under their own sediment load, or subsiding from groundwater extraction, can sink
              several millimetres per year and effectively double their exposure. Regions still rebounding from the weight
              of Pleistocene ice sheets can see relative sea level fall. Horizontal consequences depend on gradient: a
              coast sloping at half a percent retreats about 200 metres per metre of rise, while a five percent slope
              retreats only twenty. That geometry, not the vertical number alone, determines how much land is actually
              lost.
            </p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sea-level-rise-from-ice-melt-calculator" />
          <PopularCalculators exclude="sea-level-rise-from-ice-melt-calculator" />
        </div>
      </div>
    </>
  );
}

