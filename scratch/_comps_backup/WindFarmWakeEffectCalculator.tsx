"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RBar, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

type Terrain = "offshore" | "flat" | "farmland" | "forest" | "complex";

interface TerrainProfile {
  key: Terrain;
  label: string;
  /** Jensen wake decay constant k, sometimes written as the entrainment constant. */
  k: number;
  note: string;
}

const TERRAINS: TerrainProfile[] = [
  { key: "offshore", label: "Offshore / open sea", k: 0.04, note: "Low surface roughness, slow wake recovery" },
  { key: "flat", label: "Flat open land", k: 0.06, note: "Grassland, few obstacles" },
  { key: "farmland", label: "Farmland with hedges", k: 0.075, note: "Standard onshore default" },
  { key: "forest", label: "Forested", k: 0.09, note: "High roughness, faster mixing" },
  { key: "complex", label: "Complex terrain / hills", k: 0.1, note: "Strong shear and turbulence" },
];

interface WakeInputs {
  rotorDiameter: string;
  spacingD: string;
  rows: string;
  ratedPowerMW: string;
  windSpeed: string;
  thrustCoefficient: string;
  terrain: Terrain;
  turbinesPerRow: string;
  fullLoadHours: string;
  proMode: boolean;
  electricityPrice: string;
  alignedFrequency: string;
  lateralOffsetD: string;
}

interface RowResult {
  row: number;
  velocityRatio: number;
  windSpeed: number;
  powerRatio: number;
  powerMW: number;
  lossMW: number;
}

interface WakeResult {
  rows: RowResult[];
  arrayEfficiency: number;
  idealFarmMW: number;
  actualFarmMW: number;
  lostMW: number;
  lossPercent: number;
  turbineCount: number;
  decayConstant: number;
  spacingMeters: number;
  wakeWidthAtNext: number;
  annualIdealMWh: number;
  annualActualMWh: number;
  annualLostMWh: number;
  annualLostValue: number;
  effectiveLossPercent: number;
  overlapFactor: number;
  recoveryDistanceD: number;
  rating: "excellent" | "acceptable" | "tight";
}

const DEFAULTS: WakeInputs = {
  rotorDiameter: "126",
  spacingD: "7",
  rows: "5",
  ratedPowerMW: "3.6",
  windSpeed: "9",
  thrustCoefficient: "0.8",
  terrain: "farmland",
  turbinesPerRow: "4",
  fullLoadHours: "3200",
  proMode: false,
  electricityPrice: "75",
  alignedFrequency: "22",
  lateralOffsetD: "0",
};

/**
 * Jensen (Park) single-wake velocity deficit at downstream distance x:
 *   dU/U = (1 - sqrt(1 - Ct)) / (1 + 2k x / D)^2
 * Multiple upstream wakes combine by sum of squares (Katic superposition).
 */
const calculateWake = (input: WakeInputs): WakeResult => {
  const D = Math.max(1, parseFloat(input.rotorDiameter) || 0);
  const spacing = Math.max(1, parseFloat(input.spacingD) || 0);
  const rowCount = Math.max(1, Math.round(parseFloat(input.rows) || 1));
  const rated = Math.max(0.01, parseFloat(input.ratedPowerMW) || 0);
  const u0 = Math.max(0.1, parseFloat(input.windSpeed) || 0);
  const ct = Math.min(0.95, Math.max(0.05, parseFloat(input.thrustCoefficient) || 0));
  const perRow = Math.max(1, Math.round(parseFloat(input.turbinesPerRow) || 1));
  const hours = Math.max(0, parseFloat(input.fullLoadHours) || 0);
  const profile = TERRAINS.find((t) => t.key === input.terrain) ?? TERRAINS[2];
  const k = profile.k;

  const price = input.proMode ? Math.max(0, parseFloat(input.electricityPrice) || 0) : 0;
  const alignedFreq = input.proMode ? Math.min(100, Math.max(0, parseFloat(input.alignedFrequency) || 0)) : 100;
  const offsetD = input.proMode ? Math.max(0, parseFloat(input.lateralOffsetD) || 0) : 0;

  const spacingMeters = spacing * D;
  const initialDeficit = 1 - Math.sqrt(1 - ct);

  // Lateral overlap: how much of the downstream rotor sits inside the expanding wake.
  const wakeRadiusAtNext = (D / 2) * (1 + 2 * k * spacing);
  const wakeWidthAtNext = wakeRadiusAtNext * 2;
  const offsetMeters = offsetD * D;
  const overlapSpan = Math.max(0, Math.min(wakeRadiusAtNext + D / 2 - offsetMeters, D));
  const overlapFactor = Math.min(1, overlapSpan / D);

  const rows: RowResult[] = [];
  for (let i = 0; i < rowCount; i++) {
    let sumSquares = 0;
    for (let up = 0; up < i; up++) {
      const distanceD = (i - up) * spacing;
      const expansion = Math.pow(1 + 2 * k * distanceD, 2);
      const deficit = (initialDeficit / expansion) * overlapFactor;
      sumSquares += deficit * deficit;
    }
    const totalDeficit = Math.sqrt(sumSquares);
    const velocityRatio = Math.max(0, 1 - totalDeficit);
    // Power in the wind scales with the cube of velocity.
    const powerRatio = Math.pow(velocityRatio, 3);
    const powerMW = rated * powerRatio * perRow;
    rows.push({
      row: i + 1,
      velocityRatio,
      windSpeed: u0 * velocityRatio,
      powerRatio,
      powerMW,
      lossMW: rated * perRow - powerMW,
    });
  }

  const turbineCount = rowCount * perRow;
  const idealFarmMW = rated * turbineCount;
  const actualFarmMW = rows.reduce((sum, r) => sum + r.powerMW, 0);
  const lostMW = idealFarmMW - actualFarmMW;
  const arrayEfficiency = idealFarmMW > 0 ? (actualFarmMW / idealFarmMW) * 100 : 0;
  const lossPercent = 100 - arrayEfficiency;

  // Only the aligned wind sector suffers the full array loss.
  const effectiveLossPercent = lossPercent * (alignedFreq / 100);
  const annualIdealMWh = idealFarmMW * hours;
  const annualLostMWh = annualIdealMWh * (effectiveLossPercent / 100);
  const annualActualMWh = annualIdealMWh - annualLostMWh;
  const annualLostValue = annualLostMWh * price;

  // Distance at which a single wake has recovered to within 2% of free stream.
  const recoveryDistanceD = (Math.sqrt(initialDeficit / 0.02) - 1) / (2 * k);

  const rating: WakeResult["rating"] = lossPercent < 8 ? "excellent" : lossPercent < 15 ? "acceptable" : "tight";

  return {
    rows,
    arrayEfficiency,
    idealFarmMW,
    actualFarmMW,
    lostMW,
    lossPercent,
    turbineCount,
    decayConstant: k,
    spacingMeters,
    wakeWidthAtNext,
    annualIdealMWh,
    annualActualMWh,
    annualLostMWh,
    annualLostValue,
    effectiveLossPercent,
    overlapFactor,
    recoveryDistanceD,
    rating,
  };
};

const fmt = (n: number, d = 2): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "What is the wake effect in a wind farm?",
    answer:
      "A turbine extracts momentum from the air, so the flow leaving the rotor is slower and more turbulent than the flow arriving. That slower column of air is the wake. Any turbine standing inside it sees a reduced wind speed and produces less power. Because power in the wind scales with the cube of velocity, a modest velocity deficit becomes a large power deficit: a 10% drop in wind speed costs roughly 27% of the available power. Across a full array these losses compound, and total wake loss for a commercial wind farm typically lands somewhere between 5% and 20% of gross annual production depending on layout and terrain.",
  },
  {
    question: "How does the Jensen model work?",
    answer:
      "The Jensen or Park model treats the wake as a cone that starts at the rotor diameter and expands linearly downstream at a rate set by the wake decay constant k. Inside that cone the velocity deficit is assumed uniform, and mass conservation gives the deficit as the initial deficit divided by the square of the expansion factor. The initial deficit comes from the thrust coefficient as one minus the square root of one minus Ct. It is deliberately simple, it runs instantly, and decades of comparison against operating farms have shown it predicts array-level energy loss well enough for layout screening. It is less reliable for the detailed near-wake structure within two or three rotor diameters.",
  },
  {
    question: "Why does terrain change the answer so much?",
    answer:
      "The wake decay constant represents how quickly ambient turbulence mixes fast free-stream air back into the slow wake. Rough, turbulent surfaces mix faster. Offshore sites have very smooth water surfaces, low ambient turbulence and therefore slow wake recovery, which is why offshore layouts use k values near 0.04 and demand wider spacing than their onshore equivalents. Farmland with hedges and scattered buildings generates enough turbulence to justify the classic 0.075 default. Forested and complex terrain sites recover faster still, though they bring their own shear and fatigue problems that this model does not address.",
  },
  {
    question: "How do wakes from several upstream turbines combine?",
    answer:
      "The standard approach, due to Katic, adds the individual deficits in quadrature: the combined deficit is the square root of the sum of the squares of each single wake deficit. This is the method used here. It reflects that deficits are not simply additive, since a turbine already sitting in slow air does not remove as much absolute momentum as one in free stream. Linear summation overpredicts loss badly in deep arrays, while sum of squares matches measured deep-array behaviour reasonably well. More advanced codes use momentum-conserving superposition or full CFD.",
  },
  {
    question: "What spacing should I use between turbines?",
    answer:
      "The common rule of thumb is seven to ten rotor diameters along the prevailing wind direction and three to five diameters across it. At seven diameters in farmland conditions a second-row turbine typically loses something in the region of five to ten percent of its output. Pushing to four or five diameters can double or triple that. The trade-off is land cost, cabling, road length and permitting area, all of which grow with spacing, so the economic optimum is usually tighter than the aerodynamic optimum. Run the calculator at several spacings and compare the annual revenue loss against the incremental land and cable cost.",
  },
  {
    question: "What is array efficiency?",
    answer:
      "Array efficiency is the total farm output divided by the output the same turbines would produce if each stood alone in free stream, expressed as a percentage. It is the single number developers use to compare layouts. Above 92% is a comfortable layout, the high eighties is normal for a dense commercial array, and below 85% suggests the layout is sacrificing meaningful energy for site compactness. Note that array efficiency computed for one wind direction is a worst case; the annual figure is much better because the wind does not always blow down the rows.",
  },
  {
    question: "Why does the wind rose matter?",
    answer:
      "Full array losses only occur when the wind blows straight down a row. When it blows across the rows the turbines are effectively in free stream and see almost no wake at all. So the annual energy loss is the aligned-direction loss weighted by how often the wind actually blows from that sector. A site with a strongly dominant prevailing direction should have its rows laid out perpendicular to it. Professional Mode lets you enter the frequency of the aligned sector so the annual figures reflect a realistic directional distribution rather than assuming permanent worst-case alignment.",
  },
  {
    question: "What does this calculator deliberately leave out?",
    answer:
      "Several real effects are outside its scope. It does not model added turbulence intensity and the resulting fatigue loading, which is often what actually constrains tight spacing. It does not model global blockage, the upstream slowdown ahead of a large array that recent research suggests costs a further one to three percent. It does not model wake steering, where turbines are deliberately yawed to deflect their wake away from downstream machines. It also assumes a constant thrust coefficient rather than a full Ct curve against wind speed. Use it for screening and intuition, then confirm with a full resource assessment.",
  },
];

export default function WindFarmWakeEffectCalculator() {
  const [inputs, setInputs] = useState<WakeInputs>(DEFAULTS);
  const [result, setResult] = useState<WakeResult>(calculateWake(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateWake(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof WakeInputs>(key: K, val: WakeInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const terrainProfile = TERRAINS.find((t) => t.key === inputs.terrain) ?? TERRAINS[2];

  const tableRows: { label: string; value: string; key?: boolean }[] = [
    { label: "Turbines in array", value: `${result.turbineCount} (${inputs.rows} rows x ${inputs.turbinesPerRow})` },
    { label: "Downwind spacing", value: `${inputs.spacingD} D = ${fmt(result.spacingMeters, 0)} m` },
    { label: "Wake decay constant k", value: fmt(result.decayConstant, 3) },
    { label: "Wake width at next row", value: `${fmt(result.wakeWidthAtNext, 0)} m` },
    { label: "Rotor overlap with wake", value: `${fmt(result.overlapFactor * 100, 0)}%` },
    { label: "Front row output", value: `${fmt(result.rows[0]?.powerMW ?? 0, 2)} MW` },
    { label: "Last row output", value: `${fmt(result.rows[result.rows.length - 1]?.powerMW ?? 0, 2)} MW` },
    { label: "Last row wind speed", value: `${fmt(result.rows[result.rows.length - 1]?.windSpeed ?? 0, 2)} m/s` },
    { label: "Full-recovery distance", value: `${fmt(result.recoveryDistanceD, 1)} D` },
    { label: "Ideal array output", value: `${fmt(result.idealFarmMW, 2)} MW` },
    { label: "Power lost to wakes", value: `${fmt(result.lostMW, 2)} MW`, key: true },
  ];

  const chartData = result.rows.map((r) => ({
    name: `Row ${r.row}`,
    output: parseFloat(r.powerMW.toFixed(2)),
    loss: parseFloat(r.lossMW.toFixed(2)),
  }));

  const effColor =
    result.rating === "excellent"
      ? "text-green-600"
      : result.rating === "acceptable"
      ? "text-orange-500"
      : "text-red-500";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/category/environment" },
          { label: "Wind Farm Wake Effect Calculator" },
        ]}
      />

      <div className="racira-page-container">
        <h1 className="text-3xl font-bold text-foreground mb-6">Wind Farm Wake Effect Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ---------------- INPUT PANEL ---------------- */}
          <div className="card-calculator !p-5">
            <div className="space-y-4">
              <div>
                <label className={lbl} htmlFor="rotorDiameter">
                  Rotor diameter (m)
                </label>
                <input
                  id="rotorDiameter"
                  type="number"
                  className={inp}
                  value={inputs.rotorDiameter}
                  onChange={(e) => set("rotorDiameter", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="spacingD">
                  Downwind spacing (rotor diameters)
                </label>
                <input
                  id="spacingD"
                  type="number"
                  step="0.5"
                  className={inp}
                  value={inputs.spacingD}
                  onChange={(e) => set("spacingD", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="rows">
                  Number of rows downwind
                </label>
                <input
                  id="rows"
                  type="number"
                  className={inp}
                  value={inputs.rows}
                  onChange={(e) => set("rows", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="ratedPowerMW">
                  Rated power per turbine (MW)
                </label>
                <input
                  id="ratedPowerMW"
                  type="number"
                  step="0.1"
                  className={inp}
                  value={inputs.ratedPowerMW}
                  onChange={(e) => set("ratedPowerMW", e.target.value)}
                />
              </div>

              {/* -------- TIER 2A -------- */}
              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-4 border-l-2 border-border pl-4">
                  <div>
                    <div className={groupLabel}>Site &amp; Wind</div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl} htmlFor="windSpeed">
                          Free-stream wind speed (m/s)
                        </label>
                        <input
                          id="windSpeed"
                          type="number"
                          step="0.1"
                          className={inp}
                          value={inputs.windSpeed}
                          onChange={(e) => set("windSpeed", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={lbl} htmlFor="terrain">
                          Terrain type
                        </label>
                        <select
                          id="terrain"
                          className={inp}
                          value={inputs.terrain}
                          onChange={(e) => set("terrain", e.target.value as Terrain)}
                        >
                          {TERRAINS.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.label} (k = {t.k})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">{terrainProfile.note}</p>
                      </div>
                      <div>
                        <label className={lbl} htmlFor="thrustCoefficient">
                          Thrust coefficient Ct
                        </label>
                        <input
                          id="thrustCoefficient"
                          type="number"
                          step="0.01"
                          className={inp}
                          value={inputs.thrustCoefficient}
                          onChange={(e) => set("thrustCoefficient", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>Array Size</div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl} htmlFor="turbinesPerRow">
                          Turbines per row
                        </label>
                        <input
                          id="turbinesPerRow"
                          type="number"
                          className={inp}
                          value={inputs.turbinesPerRow}
                          onChange={(e) => set("turbinesPerRow", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={lbl} htmlFor="fullLoadHours">
                          Equivalent full-load hours per year
                        </label>
                        <input
                          id="fullLoadHours"
                          type="number"
                          className={inp}
                          value={inputs.fullLoadHours}
                          onChange={(e) => set("fullLoadHours", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* -------- TIER 2B -------- */}
                  <div>
                    <div className={groupLabel}>Professional Mode</div>
                    <label className="flex items-center gap-2 text-sm text-foreground mb-3">
                      <input
                        type="checkbox"
                        checked={inputs.proMode}
                        onChange={(e) => set("proMode", e.target.checked)}
                        className="h-4 w-4"
                      />
                      Enable energy yield &amp; directional analysis
                    </label>

                    {inputs.proMode && (
                      <div className="space-y-3">
                        <div>
                          <label className={lbl} htmlFor="electricityPrice">
                            Electricity price ($/MWh)
                          </label>
                          <input
                            id="electricityPrice"
                            type="number"
                            className={inp}
                            value={inputs.electricityPrice}
                            onChange={(e) => set("electricityPrice", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="alignedFrequency">
                            Wind frequency in aligned sector (%)
                          </label>
                          <input
                            id="alignedFrequency"
                            type="number"
                            className={inp}
                            value={inputs.alignedFrequency}
                            onChange={(e) => set("alignedFrequency", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="lateralOffsetD">
                            Lateral row offset (rotor diameters)
                          </label>
                          <input
                            id="lateralOffsetD"
                            type="number"
                            step="0.1"
                            className={inp}
                            value={inputs.lateralOffsetD}
                            onChange={(e) => set("lateralOffsetD", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Staggering rows sideways moves downstream rotors out of the wake core.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResult(calculateWake(inputs))}
                  className="h-10 w-full rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  aria-label="Reset"
                  title="Reset"
                  onClick={() => {
                    setInputs(DEFAULTS);
                    setResult(calculateWake(DEFAULTS));
                  }}
                  className="h-10 w-10 shrink-0 rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition flex items-center justify-center"
                >
                  ↺
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- RESULTS ---------------- */}
          <div className="space-y-5">
            {/* 1. PRIMARY */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-medium text-muted-foreground mb-1">Array efficiency</div>
              <div className="text-4xl font-bold text-primary">{fmt(result.arrayEfficiency, 1)}%</div>
              <div className="text-sm text-muted-foreground mt-2">
                {fmt(result.lossPercent, 1)}% of gross output lost to wakes when the wind blows straight down the rows
              </div>
            </div>

            {/* 2. STAT BAR */}
            <div className="flex items-stretch bg-muted/30 rounded-lg divide-x divide-border">
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Ideal output</div>
                <div className="text-lg font-bold text-green-600">{fmt(result.idealFarmMW, 1)} MW</div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Actual output</div>
                <div className="text-lg font-bold text-orange-500">{fmt(result.actualFarmMW, 1)} MW</div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Wake loss</div>
                <div className={`text-lg font-bold ${effColor}`}>{fmt(result.lostMW, 1)} MW</div>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="card-calculator !p-0 overflow-hidden">
              <div className="px-5 pt-4 pb-2 text-sm font-bold text-foreground">Layout Breakdown</div>
              <table className="w-full text-base">
                <tbody>
                  {tableRows.map((r) => (
                    <tr
                      key={r.label}
                      className={`border-t border-border ${r.key ? "bg-secondary/20 font-semibold" : ""}`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{r.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5 px-3 text-foreground">Net array output</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmt(result.actualFarmMW, 2)} MW</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="card-calculator !p-4">
              <div className="text-sm font-bold text-foreground mb-3">Output by Row</div>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RBar data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 85%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} unit=" MW" />
                      <RTooltip formatter={(v: number) => `${v} MW`} />
                      <ReferenceLine
                        y={parseFloat((result.rows[0]?.powerMW ?? 0).toFixed(2))}
                        stroke="hsl(215 16% 65%)"
                        strokeDasharray="4 4"
                        label={{ value: "Free stream", fontSize: 11, position: "insideTopRight" }}
                      />
                      <Bar dataKey="output" name="Row output" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell
                            key={d.name}
                            fill={
                              i === 0
                                ? "hsl(142 71% 45%)"
                                : i < chartData.length - 1
                                ? "hsl(217 91% 60%)"
                                : "hsl(25 95% 53%)"
                            }
                          />
                        ))}
                      </Bar>
                    </RBar>
                  </ResponsiveContainer>
                ) : null}
              </div>
              <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} />
                  Front row (unwaked)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                  Interior rows
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(25 95% 53%)" }} />
                  Deepest row
                </span>
              </div>
            </div>

            {/* PRO MODE SECTION */}
            {inputs.proMode && (
              <div className="card-calculator !p-5">
                <div className="text-sm font-bold text-foreground mb-3">Annual Energy &amp; Revenue Impact</div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-base">
                  <span className="text-muted-foreground">Direction-weighted loss</span>
                  <span className="text-right text-foreground">{fmt(result.effectiveLossPercent, 2)}%</span>
                  <span className="text-muted-foreground">Gross annual energy</span>
                  <span className="text-right text-foreground">{fmt(result.annualIdealMWh, 0)} MWh</span>
                  <span className="text-muted-foreground">Net annual energy</span>
                  <span className="text-right text-foreground">{fmt(result.annualActualMWh, 0)} MWh</span>
                  <span className="text-muted-foreground">Energy lost to wakes</span>
                  <span className="text-right text-foreground">{fmt(result.annualLostMWh, 0)} MWh</span>
                  <span className="font-semibold text-foreground">Annual revenue lost</span>
                  <span className="text-right font-semibold text-foreground">
                    ${fmt(result.annualLostValue, 0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  The aligned-sector frequency scales the worst-case loss down to an annual average. Setting it to 100%
                  assumes the wind always blows straight down the rows, which no real site does.
                </p>
              </div>
            )}

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold text-foreground mb-3">Summary Statistics</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                {tableRows.map((r) => (
                  <div key={r.label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-foreground font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-3 sm:col-span-2 border-t border-border pt-2 mt-1">
                  <span className="font-bold text-foreground">Net array output</span>
                  <span className="font-bold text-foreground">{fmt(result.actualFarmMW, 2)} MW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SEO ---------------- */}
        <div className="prose-finance text-[15.75px] max-w-[1180px] mt-10 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">How Wind Farm Wake Losses Are Calculated</h2>
            <p>
              Every turbine that produces power must slow the air passing through it, because the energy it extracts
              comes directly from the kinetic energy of that air. The slowed, turbulent column trailing behind the
              rotor is the wake, and it is the single largest source of energy loss unique to arranging turbines in
              groups rather than operating them alone. This calculator uses the Jensen model, also called the Park
              model, which represents the wake as a cone expanding linearly downstream from the rotor plane.
            </p>
            <p>
              The velocity deficit immediately behind the rotor follows from the thrust coefficient as one minus the
              square root of one minus Ct. Downstream, that deficit is diluted by the square of the expansion factor,
              which grows as one plus twice the wake decay constant times the distance in rotor diameters. When a
              turbine sits in the wakes of several upstream machines, the individual deficits are combined by the sum
              of squares rule rather than added directly, reflecting the observation that deficits do not accumulate
              linearly in deep arrays.
            </p>
            <p>
              Converting the velocity deficit into a power deficit is where the numbers become dramatic. Power
              available in moving air scales with the cube of velocity, so a wake that reduces wind speed by ten
              percent removes roughly twenty seven percent of the available power at that rotor. This cubic
              relationship is why layout decisions that look minor on a site plan translate into millions of dollars
              of lifetime revenue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Choosing Turbine Spacing</h2>
            <p>
              The industry rule of thumb calls for seven to ten rotor diameters of separation along the prevailing
              wind direction and three to five diameters perpendicular to it. Those figures are not arbitrary. At
              seven diameters in typical onshore conditions a single wake has recovered enough that the downstream
              turbine loses only a few percent of its output, and the incremental gain from stretching to nine or ten
              diameters rarely justifies the additional land lease, access road and collector cable cost.
            </p>
            <p>
              Offshore the calculation shifts. Sea surfaces are aerodynamically smooth, ambient turbulence is low, and
              wakes persist far downstream. Wake decay constants near 0.04 are appropriate, and spacing of eight to
              twelve diameters is common. Since offshore foundations and cabling are extremely expensive, developers
              face a genuinely difficult optimisation between packing turbines close enough to keep infrastructure
              costs down and separating them enough to avoid crippling array losses.
            </p>
            <p>
              Lateral staggering offers a way to escape part of the trade-off. Offsetting alternate rows sideways
              moves downstream rotors partly or entirely out of the wake core without requiring additional downwind
              distance. Professional Mode includes a lateral offset input so you can see how much of the loss a
              staggered layout recovers for a given site footprint.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Reading Array Efficiency</h2>
            <p>
              Array efficiency compares the actual farm output against what the same turbines would generate standing
              alone in undisturbed flow. It is the number that appears in energy yield assessments and that lenders
              scrutinise during due diligence. An efficiency above ninety two percent indicates a generously spaced
              layout. The high eighties is normal for a commercially optimised onshore array. Anything below eighty
              five percent means the layout is trading a substantial slice of annual energy for site compactness, and
              deserves a hard look at whether the land savings truly justify it.
            </p>
            <p>
              The figure this calculator reports for a single wind direction is a worst case, because it assumes the
              wind blows exactly along the rows. Real annual losses are considerably lower, since for most of the year
              the wind arrives from directions where turbines are effectively in free stream. Professional Mode
              applies a directional weighting so the annual energy and revenue figures reflect how often the aligned
              sector actually occurs at your site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Limitations and What to Check Next</h2>
            <p>
              The Jensen model is a screening tool. It handles array-level energy loss well and runs instantly, which
              is exactly what you want when comparing dozens of candidate layouts. It does not capture the detailed
              near-wake structure within two or three rotor diameters, it assumes a uniform deficit across the wake
              cross section rather than the Gaussian profile that measurements show, and it takes the thrust
              coefficient as a constant rather than following the full Ct curve across the operating wind speed range.
            </p>
            <p>
              Three further effects are absent entirely. Added turbulence intensity in the wake drives fatigue loading
              on downstream turbines and is frequently the real constraint on tight spacing, sometimes overriding the
              energy argument completely. Global blockage, the upstream deceleration ahead of a large array, has been
              measured at one to three percent of production and is not modelled here. Wake steering, in which
              upstream turbines yaw deliberately to deflect their wakes aside, can recover a meaningful fraction of
              array losses on modern control systems.
            </p>
            <p>
              Treat the output as a well-grounded first estimate that tells you which layouts are worth pursuing.
              Before committing capital, confirm with a full resource assessment using measured site wind data, a
              complete wind rose, turbine-specific power and thrust curves, and a wake code validated against
              operating farms in comparable terrain.
            </p>
          </section>
        </div>

        <div className="max-w-[1180px] mt-10">
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/wind-farm-wake-effect-calculator" />
        </div>

        <div className="max-w-[1180px] mt-10">
          <PopularCalculators exclude="/calculator/wind-farm-wake-effect-calculator" />
        </div>

        <div className="max-w-[1180px] mt-8 text-sm text-muted-foreground">
          Related:{" "}
          <Link href="/category/environment" className="text-primary hover:underline">
            more environment calculators
          </Link>
        </div>
      </div>
    </>
  );
}
