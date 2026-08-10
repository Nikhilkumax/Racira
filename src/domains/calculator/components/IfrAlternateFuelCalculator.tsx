"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RBar, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

type FuelUnit = "gal" | "lb";
type FuelType = "avgas" | "jeta";

/** Pounds per US gallon at standard temperature. */
const FUEL_DENSITY: Record<FuelType, number> = {
  avgas: 6.0,
  jeta: 6.7,
};

interface IfrFuelInputs {
  burnRate: string;
  distanceToAlternate: string;
  cruiseSpeed: string;
  timeToDestination: string;
  ceiling: string;
  visibility: string;
  taxiFuel: string;
  missedApproachMinutes: string;
  reserveMinutes: string;
  proMode: boolean;
  fuelUnit: FuelUnit;
  fuelType: FuelType;
  headwind: string;
  climbPenaltyMinutes: string;
  fuelOnBoard: string;
}

interface FuelLeg {
  label: string;
  minutes: number;
  fuel: number;
  required: boolean;
}

interface IfrFuelResult {
  legs: FuelLeg[];
  alternateRequired: boolean;
  ceilingTrigger: boolean;
  visibilityTrigger: boolean;
  groundSpeed: number;
  alternateMinutes: number;
  alternateFuel: number;
  destinationFuel: number;
  reserveFuel: number;
  taxiFuel: number;
  missedFuel: number;
  totalFuel: number;
  totalMinutes: number;
  unitLabel: string;
  weightLb: number;
  fuelOnBoard: number;
  marginFuel: number;
  marginMinutes: number;
  legal: boolean;
  enduranceMinutes: number;
  burnPerMinute: number;
}

const DEFAULTS: IfrFuelInputs = {
  burnRate: "12",
  distanceToAlternate: "85",
  cruiseSpeed: "140",
  timeToDestination: "95",
  ceiling: "1500",
  visibility: "2.5",
  taxiFuel: "1.5",
  missedApproachMinutes: "10",
  reserveMinutes: "45",
  proMode: false,
  fuelUnit: "gal",
  fuelType: "avgas",
  headwind: "15",
  climbPenaltyMinutes: "5",
  fuelOnBoard: "50",
};

/**
 * FAR 91.167 IFR fuel: enough to fly to the destination, then to the alternate
 * when one is required, then 45 minutes at normal cruise consumption.
 * The 1-2-3 rule (91.169) decides whether an alternate must be filed.
 */
const calculateIfrFuel = (input: IfrFuelInputs): IfrFuelResult => {
  const burnRate = Math.max(0, parseFloat(input.burnRate) || 0);
  const distance = Math.max(0, parseFloat(input.distanceToAlternate) || 0);
  const tas = Math.max(1, parseFloat(input.cruiseSpeed) || 1);
  const toDestination = Math.max(0, parseFloat(input.timeToDestination) || 0);
  const ceiling = Math.max(0, parseFloat(input.ceiling) || 0);
  const visibility = Math.max(0, parseFloat(input.visibility) || 0);
  const taxi = Math.max(0, parseFloat(input.taxiFuel) || 0);
  const missedMinutes = Math.max(0, parseFloat(input.missedApproachMinutes) || 0);
  const reserveMinutes = Math.max(0, parseFloat(input.reserveMinutes) || 0);

  const headwind = input.proMode ? parseFloat(input.headwind) || 0 : 0;
  const climbPenalty = input.proMode ? Math.max(0, parseFloat(input.climbPenaltyMinutes) || 0) : 0;
  const onBoard = input.proMode ? Math.max(0, parseFloat(input.fuelOnBoard) || 0) : 0;

  // 1-2-3 rule: an alternate is required unless forecast ceiling is at least
  // 2000 ft AND visibility is at least 3 statute miles for the window around ETA.
  const ceilingTrigger = ceiling < 2000;
  const visibilityTrigger = visibility < 3;
  const alternateRequired = ceilingTrigger || visibilityTrigger;

  const groundSpeed = Math.max(1, tas - headwind);
  const alternateMinutes = alternateRequired ? (distance / groundSpeed) * 60 + climbPenalty : 0;

  const burnPerMinute = burnRate / 60;
  const destinationFuel = toDestination * burnPerMinute;
  const alternateFuel = alternateMinutes * burnPerMinute;
  const missedFuel = alternateRequired ? missedMinutes * burnPerMinute : 0;
  const reserveFuel = reserveMinutes * burnPerMinute;

  const legs: FuelLeg[] = [
    { label: "Taxi and run-up", minutes: 0, fuel: taxi, required: true },
    { label: "Cruise to destination", minutes: toDestination, fuel: destinationFuel, required: true },
    { label: "Missed approach at destination", minutes: alternateRequired ? missedMinutes : 0, fuel: missedFuel, required: alternateRequired },
    { label: "Divert to alternate", minutes: alternateMinutes, fuel: alternateFuel, required: alternateRequired },
    { label: `Final reserve (${reserveMinutes} min)`, minutes: reserveMinutes, fuel: reserveFuel, required: true },
  ];

  const totalFuel = legs.reduce((sum, l) => sum + l.fuel, 0);
  const totalMinutes = legs.reduce((sum, l) => sum + l.minutes, 0);

  const unitLabel = input.fuelUnit === "gal" ? "gal" : "lb";
  const weightLb = input.fuelUnit === "gal" ? totalFuel * FUEL_DENSITY[input.fuelType] : totalFuel;

  const marginFuel = onBoard - totalFuel;
  const marginMinutes = burnPerMinute > 0 ? marginFuel / burnPerMinute : 0;
  const legal = !input.proMode || onBoard >= totalFuel;
  const enduranceMinutes = burnPerMinute > 0 ? onBoard / burnPerMinute : 0;

  return {
    legs,
    alternateRequired,
    ceilingTrigger,
    visibilityTrigger,
    groundSpeed,
    alternateMinutes,
    alternateFuel,
    destinationFuel,
    reserveFuel,
    taxiFuel: taxi,
    missedFuel,
    totalFuel,
    totalMinutes,
    unitLabel,
    weightLb,
    fuelOnBoard: onBoard,
    marginFuel,
    marginMinutes,
    legal,
    enduranceMinutes,
    burnPerMinute,
  };
};

const fmt = (n: number, d = 1): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtTime = (minutes: number): string => {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
};

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "What is the 1-2-3 rule for IFR alternates?",
    answer:
      "FAR 91.169 requires you to file an alternate airport unless, for at least one hour before through one hour after your estimated time of arrival, the forecast at the destination shows a ceiling of at least 2000 feet above airport elevation and visibility of at least 3 statute miles. That is the origin of the shorthand: one hour either side, two thousand feet, three miles. If either the ceiling or the visibility forecast falls below those values at any point in that window, an alternate is mandatory and its fuel must be carried. The rule looks at the forecast, not the conditions you actually find, so a deteriorating TAF drives the requirement even if the weather is currently clear.",
  },
  {
    question: "How much fuel does FAR 91.167 actually require?",
    answer:
      "For IFR flight in the United States you must carry enough fuel to fly to the first airport of intended landing, then from that airport to the alternate when an alternate is required, and then for forty five minutes beyond that at normal cruise consumption. That forty five minute figure is the legal floor for Part 91 operations, not a target. It leaves nothing for a hold, a re-route around weather, an unexpected approach or a taxi delay at a busy field. Most experienced pilots treat one hour as their personal minimum and many operators impose more.",
  },
  {
    question: "Should I use gallons or pounds?",
    answer:
      "It depends on your aircraft and how it is dispatched. Light piston aircraft almost universally work in US gallons, since the fuel gauges, the fuel pump and the pilot operating handbook all use volume. Turbine and transport aircraft work in pounds or kilograms, because engine fuel flow and weight and balance both care about mass rather than volume. This calculator handles either. Whichever unit you enter, it also reports the fuel weight in pounds, using six pounds per gallon for avgas and six point seven for Jet A, so you can carry the figure straight into a weight and balance sheet.",
  },
  {
    question: "Why does headwind matter so much on the alternate leg?",
    answer:
      "Fuel burn is driven by time aloft, not by distance over the ground. A headwind reduces your ground speed while leaving fuel flow essentially unchanged, so the leg takes longer and costs more fuel. An eighty five nautical mile diversion at 140 knots true airspeed takes about thirty six minutes in still air. Add a twenty five knot headwind and the same leg takes forty four minutes, roughly twenty percent more fuel. Diversions frequently happen into the weather system that closed your destination, which is exactly the situation where the wind is strongest, so planning the alternate leg with a nil wind assumption is a meaningful error in the wrong direction.",
  },
  {
    question: "Should I plan fuel for a missed approach?",
    answer:
      "Yes. If the weather at the destination is bad enough to require an alternate, there is a real chance you will fly an approach, not see the runway, and go around before diverting. That missed approach costs fuel: the climb back to a safe altitude, the segment out to the holding fix, and the time spent getting a clearance to the alternate. Ten minutes is a reasonable allowance for a light aircraft and more for a heavy one or a busy terminal area. The regulation does not require this explicitly, which is precisely why it is one of the most common ways a legal fuel load turns out to be an uncomfortable one.",
  },
  {
    question: "What is a standard alternate minimum?",
    answer:
      "Unless the approach chart specifies otherwise, standard alternate minimums are 600 feet ceiling and 2 statute miles visibility for a precision approach, and 800 feet and 2 miles for a non-precision approach. Airports without an instrument approach may only be used as an alternate if the forecast allows a descent from the minimum enroute altitude, an approach and a landing under basic VFR. Some airports carry non-standard alternate minimums or are marked NA for alternate use entirely, indicated by a triangle symbol on the approach plate, so always check the chart rather than assuming the standard values apply.",
  },
  {
    question: "Does this calculator account for climb and descent fuel?",
    answer:
      "Only in a simplified way. Climb burns fuel at a considerably higher rate than cruise, often half again as much or more, while descent burns much less. Professional Mode includes a climb penalty input expressed in equivalent extra cruise minutes, which lets you approximate the additional fuel for a climb back to altitude on the diversion leg. For accurate planning, use the climb, cruise and descent tables in your aircraft flight manual, which account for weight, temperature and altitude. The cruise-rate approximation used here is adequate for a preflight sanity check, not for a dispatch release.",
  },
  {
    question: "Is this calculator a substitute for official flight planning?",
    answer:
      "No. It is a planning aid for understanding how the regulatory fuel requirement is built up and how sensitive it is to weather, wind and diversion distance. It does not fetch live METAR or TAF data, it has no winds aloft, no aircraft performance database, no terrain or airspace awareness, and no knowledge of your specific airframe. Always plan from current official weather products, your aircraft flight manual performance data, and where applicable your operator's fuel policy, which will frequently be more conservative than the federal minimum.",
  },
];

export default function IfrAlternateFuelCalculator() {
  const [inputs, setInputs] = useState<IfrFuelInputs>(DEFAULTS);
  const [result, setResult] = useState<IfrFuelResult>(calculateIfrFuel(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateIfrFuel(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof IfrFuelInputs>(key: K, val: IfrFuelInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const u = result.unitLabel;

  const tableRows: { label: string; value: string; key?: boolean }[] = [
    { label: "Alternate required?", value: result.alternateRequired ? "Yes — 1-2-3 rule triggered" : "No — forecast is above 2000 / 3" },
    ...result.legs.map((l) => ({
      label: l.label,
      value: l.required
        ? `${fmt(l.fuel, 1)} ${u}${l.minutes > 0 ? ` (${fmtTime(l.minutes)})` : ""}`
        : "not required",
      key: l.label === "Divert to alternate",
    })),
    { label: "Ground speed to alternate", value: `${fmt(result.groundSpeed, 0)} kt` },
    { label: "Total planned time", value: fmtTime(result.totalMinutes) },
    { label: "Fuel weight", value: `${fmt(result.weightLb, 0)} lb` },
  ];

  const chartData = result.legs
    .filter((l) => l.required && l.fuel > 0)
    .map((l) => ({
      name: l.label.replace(" at destination", "").replace("Final reserve", "Reserve").replace(/ \(.*\)/, ""),
      fuel: parseFloat(l.fuel.toFixed(2)),
    }));

  const CHART_COLORS = [
    "hsl(215 16% 65%)",
    "hsl(217 91% 60%)",
    "hsl(25 95% 53%)",
    "hsl(25 95% 53%)",
    "hsl(142 71% 45%)",
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/category/transportation" },
          { label: "IFR Alternate Fuel Calculator" },
        ]}
      />

      <div className="racira-page-container">
        <h1 className="text-3xl font-bold text-foreground mb-6">IFR Alternate Fuel Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ---------------- INPUT PANEL ---------------- */}
          <div className="card-calculator !p-5">
            <div className="space-y-4">
              <div>
                <label className={lbl} htmlFor="burnRate">
                  Cruise fuel burn ({inputs.fuelUnit}/hr)
                </label>
                <input
                  id="burnRate"
                  type="number"
                  step="0.1"
                  className={inp}
                  value={inputs.burnRate}
                  onChange={(e) => set("burnRate", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="timeToDestination">
                  Time to destination (minutes)
                </label>
                <input
                  id="timeToDestination"
                  type="number"
                  className={inp}
                  value={inputs.timeToDestination}
                  onChange={(e) => set("timeToDestination", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="distanceToAlternate">
                  Destination to alternate (nm)
                </label>
                <input
                  id="distanceToAlternate"
                  type="number"
                  className={inp}
                  value={inputs.distanceToAlternate}
                  onChange={(e) => set("distanceToAlternate", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="cruiseSpeed">
                  True airspeed (knots)
                </label>
                <input
                  id="cruiseSpeed"
                  type="number"
                  className={inp}
                  value={inputs.cruiseSpeed}
                  onChange={(e) => set("cruiseSpeed", e.target.value)}
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
                    <div className={groupLabel}>Destination Forecast (1-2-3 Rule)</div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl} htmlFor="ceiling">
                          Forecast ceiling (ft AGL)
                        </label>
                        <input
                          id="ceiling"
                          type="number"
                          className={inp}
                          value={inputs.ceiling}
                          onChange={(e) => set("ceiling", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={lbl} htmlFor="visibility">
                          Forecast visibility (statute miles)
                        </label>
                        <input
                          id="visibility"
                          type="number"
                          step="0.25"
                          className={inp}
                          value={inputs.visibility}
                          onChange={(e) => set("visibility", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>Reserves &amp; Allowances</div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl} htmlFor="reserveMinutes">
                          Final reserve (minutes)
                        </label>
                        <input
                          id="reserveMinutes"
                          type="number"
                          className={inp}
                          value={inputs.reserveMinutes}
                          onChange={(e) => set("reserveMinutes", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          FAR 91.167 minimum is 45 minutes. Many pilots plan 60.
                        </p>
                      </div>
                      <div>
                        <label className={lbl} htmlFor="taxiFuel">
                          Taxi and run-up fuel ({inputs.fuelUnit})
                        </label>
                        <input
                          id="taxiFuel"
                          type="number"
                          step="0.1"
                          className={inp}
                          value={inputs.taxiFuel}
                          onChange={(e) => set("taxiFuel", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={lbl} htmlFor="missedApproachMinutes">
                          Missed approach allowance (minutes)
                        </label>
                        <input
                          id="missedApproachMinutes"
                          type="number"
                          className={inp}
                          value={inputs.missedApproachMinutes}
                          onChange={(e) => set("missedApproachMinutes", e.target.value)}
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
                      Enable wind, fuel type and legality check
                    </label>

                    {inputs.proMode && (
                      <div className="space-y-3">
                        <div>
                          <label className={lbl} htmlFor="fuelUnit">
                            Fuel unit
                          </label>
                          <select
                            id="fuelUnit"
                            className={inp}
                            value={inputs.fuelUnit}
                            onChange={(e) => set("fuelUnit", e.target.value as FuelUnit)}
                          >
                            <option value="gal">US gallons</option>
                            <option value="lb">Pounds</option>
                          </select>
                        </div>
                        <div>
                          <label className={lbl} htmlFor="fuelType">
                            Fuel type
                          </label>
                          <select
                            id="fuelType"
                            className={inp}
                            value={inputs.fuelType}
                            onChange={(e) => set("fuelType", e.target.value as FuelType)}
                          >
                            <option value="avgas">100LL Avgas (6.0 lb/gal)</option>
                            <option value="jeta">Jet A (6.7 lb/gal)</option>
                          </select>
                        </div>
                        <div>
                          <label className={lbl} htmlFor="headwind">
                            Headwind component on diversion (kt)
                          </label>
                          <input
                            id="headwind"
                            type="number"
                            className={inp}
                            value={inputs.headwind}
                            onChange={(e) => set("headwind", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter a negative value for a tailwind.
                          </p>
                        </div>
                        <div>
                          <label className={lbl} htmlFor="climbPenaltyMinutes">
                            Climb penalty on diversion (equivalent minutes)
                          </label>
                          <input
                            id="climbPenaltyMinutes"
                            type="number"
                            className={inp}
                            value={inputs.climbPenaltyMinutes}
                            onChange={(e) => set("climbPenaltyMinutes", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="fuelOnBoard">
                            Usable fuel on board ({inputs.fuelUnit})
                          </label>
                          <input
                            id="fuelOnBoard"
                            type="number"
                            step="0.1"
                            className={inp}
                            value={inputs.fuelOnBoard}
                            onChange={(e) => set("fuelOnBoard", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResult(calculateIfrFuel(inputs))}
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
                    setResult(calculateIfrFuel(DEFAULTS));
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
              <div className="text-sm font-medium text-muted-foreground mb-1">Minimum IFR fuel required</div>
              <div className="text-4xl font-bold text-primary">
                {fmt(result.totalFuel, 1)} {u}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {result.alternateRequired
                  ? "Includes the alternate leg — the 1-2-3 rule is triggered"
                  : "No alternate required by the forecast you entered"}
              </div>
            </div>

            {/* 2. STAT BAR */}
            <div className="flex items-stretch bg-muted/30 rounded-lg divide-x divide-border">
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">To destination</div>
                <div className="text-lg font-bold text-green-600">
                  {fmt(result.destinationFuel, 1)} {u}
                </div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">To alternate</div>
                <div className="text-lg font-bold text-orange-500">
                  {result.alternateRequired ? `${fmt(result.alternateFuel, 1)} ${u}` : "—"}
                </div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Final reserve</div>
                <div className="text-lg font-bold text-red-500">
                  {fmt(result.reserveFuel, 1)} {u}
                </div>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="card-calculator !p-0 overflow-hidden">
              <div className="px-5 pt-4 pb-2 text-sm font-bold text-foreground">Fuel Breakdown</div>
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
                    <td className="py-2.5 px-3 text-foreground">Total minimum fuel</td>
                    <td className="py-2.5 px-3 text-right text-foreground">
                      {fmt(result.totalFuel, 1)} {u}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="card-calculator !p-4">
              <div className="text-sm font-bold text-foreground mb-3">Fuel by Segment</div>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RBar data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 85%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                      <YAxis tick={{ fontSize: 12 }} unit={` ${u}`} />
                      <RTooltip formatter={(v: number) => `${v} ${u}`} />
                      <Bar dataKey="fuel" name="Fuel" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </RBar>
                  </ResponsiveContainer>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                  Enroute
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(25 95% 53%)" }} />
                  Contingency / diversion
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} />
                  Reserve
                </span>
              </div>
            </div>

            {/* PRO MODE SECTION */}
            {inputs.proMode && (
              <div
                className={`card-calculator !p-5 border-l-4 ${
                  result.legal ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="text-sm font-bold text-foreground mb-3">Legality &amp; Margin Check</div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-base">
                  <span className="text-muted-foreground">Usable fuel on board</span>
                  <span className="text-right text-foreground">
                    {fmt(result.fuelOnBoard, 1)} {u}
                  </span>
                  <span className="text-muted-foreground">Total endurance</span>
                  <span className="text-right text-foreground">{fmtTime(result.enduranceMinutes)}</span>
                  <span className="text-muted-foreground">Margin over minimum</span>
                  <span
                    className={`text-right font-semibold ${
                      result.marginFuel >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {result.marginFuel >= 0 ? "+" : ""}
                    {fmt(result.marginFuel, 1)} {u}
                  </span>
                  <span className="text-muted-foreground">Extra time available</span>
                  <span className="text-right text-foreground">
                    {result.marginMinutes >= 0 ? fmtTime(result.marginMinutes) : "deficit"}
                  </span>
                  <span className="font-semibold text-foreground">FAR 91.167 status</span>
                  <span
                    className={`text-right font-semibold ${result.legal ? "text-green-600" : "text-red-500"}`}
                  >
                    {result.legal ? "Legal for dispatch" : "Insufficient fuel"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Planning aid only. This is not a dispatch release and does not use live weather. Verify against
                  current TAFs, your aircraft flight manual and any operator fuel policy before flight.
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
                  <span className="font-bold text-foreground">Total minimum fuel</span>
                  <span className="font-bold text-foreground">
                    {fmt(result.totalFuel, 1)} {u}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SEO ---------------- */}
        <div className="prose-finance text-[15.75px] max-w-[1180px] mt-10 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">How IFR Fuel Requirements Are Built Up</h2>
            <p>
              Federal Aviation Regulation 91.167 sets out the fuel a pilot must carry for flight under instrument
              flight rules. The requirement is cumulative and has three parts. First, enough fuel to fly from the
              departure airport to the airport of intended landing. Second, when an alternate airport is required,
              enough additional fuel to fly from that intended destination to the alternate. Third, forty five minutes
              of further flight at normal cruising speed and consumption.
            </p>
            <p>
              That structure matters because the alternate leg is measured from the destination, not from the
              departure point. A diversion airport eighty five nautical miles beyond your destination adds the fuel
              for eighty five miles of flight after you have already burned everything needed to arrive. Pilots who
              measure the alternate distance from their departure field consistently underestimate the requirement.
            </p>
            <p>
              This calculator lays out each element separately so you can see where the fuel goes. It adds two
              elements the regulation does not explicitly require but that any careful preflight should include: taxi
              and run-up fuel, which is burned before the wheels leave the ground and is not covered by any enroute
              calculation, and an allowance for a missed approach at the destination before the diversion begins.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">The 1-2-3 Rule and When an Alternate Is Required</h2>
            <p>
              FAR 91.169 governs whether you must file an alternate at all. The test looks at the forecast for the
              destination during the window from one hour before to one hour after your estimated time of arrival. If
              the forecast throughout that window shows a ceiling of at least two thousand feet above the airport
              elevation and visibility of at least three statute miles, no alternate is required. If either value
              falls below the threshold at any point in the window, an alternate must be filed and its fuel carried.
            </p>
            <p>
              Two details trip people up. The rule is driven entirely by the forecast, so a TAF that predicts
              deterioration triggers the requirement even when conditions on departure are perfect. And the airport
              you choose must itself meet alternate minimums at your expected arrival time there, which are typically
              six hundred feet and two miles for a precision approach and eight hundred feet and two miles for a
              non-precision approach unless the chart specifies otherwise. Some airports are marked as unusable for
              alternate filing entirely.
            </p>
            <p>
              Enter the forecast ceiling and visibility in Advanced Options and the calculator evaluates the rule for
              you, showing whether the alternate leg is included in the total and which of the two conditions
              triggered it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Wind, Weight and the Realities of Diversion</h2>
            <p>
              Fuel burn depends on time in the air, and time in the air depends on ground speed. A headwind on the
              diversion leg stretches the flight without reducing fuel flow, and diversions typically head into the
              same weather system that closed the destination. Professional Mode accepts a headwind component and
              recomputes the leg on ground speed rather than true airspeed, which for a typical light aircraft
              diversion can move the fuel requirement by fifteen to twenty five percent.
            </p>
            <p>
              Weight is the other consideration. Fuel is heavy, and carrying a generous margin has to be checked
              against your maximum takeoff weight and centre of gravity envelope. The calculator reports total fuel
              weight in pounds regardless of whether you entered gallons or pounds, using six pounds per gallon for
              one hundred low lead avgas and six point seven for Jet A. On a warm day at a high field elevation with
              four seats occupied, the fuel you would like to carry and the fuel you are permitted to carry are not
              always the same number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Treat the Legal Minimum as a Floor</h2>
            <p>
              Forty five minutes of reserve is the regulatory minimum for Part 91 instrument flight, not a
              recommendation. It assumes nothing goes wrong after you arrive at the alternate. It provides no room for
              a hold at a busy terminal area, a re-route around a line of convection, an approach flown twice, or a
              lengthy taxi at a congested field. Fuel exhaustion and fuel starvation remain persistent causes of
              general aviation accidents, and the accident reports overwhelmingly describe flights that were legal on
              paper at the moment of departure.
            </p>
            <p>
              A widely used personal minimum is one hour of reserve rather than forty five minutes, with more when the
              forecast is marginal, the destination has a single runway, or the alternate is distant. Commercial
              operators impose their own fuel policies which are almost always stricter than the federal floor. The
              reserve field in Advanced Options lets you plan to whatever standard you have adopted.
            </p>
            <p>
              Finally, remember what this tool is. It does not retrieve live weather, it has no winds aloft data, it
              does not know your airframe, and it cannot see terrain, airspace or notices to air missions. Use it to
              understand the shape of your fuel requirement and to test how sensitive it is to the variables. Then
              plan the actual flight from current official weather products and the performance section of your
              aircraft flight manual.
            </p>
          </section>
        </div>

        <div className="max-w-[1180px] mt-10">
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/ifr-alternate-fuel-calculator" />
        </div>

        <div className="max-w-[1180px] mt-10">
          <PopularCalculators exclude="/calculator/ifr-alternate-fuel-calculator" />
        </div>

        <div className="max-w-[1180px] mt-8 text-sm text-muted-foreground">
          Related:{" "}
          <Link href="/category/transportation" className="text-primary hover:underline">
            more transportation calculators
          </Link>
        </div>
      </div>
    </>
  );
}
