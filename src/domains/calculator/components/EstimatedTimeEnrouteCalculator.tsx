"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EteInputs {
  distanceNm: number;
  tasKt: number;
  trackDeg: number;
  windDirDeg: number;
  windSpeedKt: number;
  fuelBurnPerHour: number;
  fuelUnit: string;
  reserveMinutes: number;
  departure: number;
  decimals: number;
}

const DEFAULTS: EteInputs = {
  distanceNm: 320,
  tasKt: 120,
  trackDeg: 90,
  windDirDeg: 270,
  windSpeedKt: 25,
  fuelBurnPerHour: 12,
  fuelUnit: "gal/hr",
  reserveMinutes: 45,
  departure: 1430,
  decimals: 1,
};

const FUEL_UNITS = ["gal/hr", "L/hr", "kg/hr", "lb/hr"];

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

/** Hours as hh:mm, hours decimal and minutes, plus a 24-hour zulu arrival clock time. */
function hoursToClock(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) return "—";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

function minutesToZulu(totalMinutes: number): string {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}Z`;
}

/** HHMM input such as 1430 becomes 14:30Z. */
function zuluToMinutes(hhmm: number): number {
  const h = Math.floor(hhmm / 100);
  const m = Math.round(hhmm % 100);
  return h * 60 + m;
}

/** Keeps a relative angle in the −180° … +180° range. */
function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

interface EteResult {
  valid: boolean;
  errorMsg: string;
  groundSpeed: number;
  headwindComponent: number;
  crosswindComponent: number;
  windCorrectionAngle: number;
  eteHours: number;
  eteMinutes: number;
  etaZulu: string;
  distanceNm: number;
  fuelBurned: number;
  reserveFuel: number;
  totalFuel: number;
  fuelPerNm: number;
  windEffectPct: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateEte(input: EteInputs): EteResult {
  const blank = (errorMsg: string): EteResult => ({
    valid: false,
    errorMsg,
    groundSpeed: 0,
    headwindComponent: 0,
    crosswindComponent: 0,
    windCorrectionAngle: 0,
    eteHours: 0,
    eteMinutes: 0,
    etaZulu: "",
    distanceNm: 0,
    fuelBurned: 0,
    reserveFuel: 0,
    totalFuel: 0,
    fuelPerNm: 0,
    windEffectPct: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.distanceNm,
    input.tasKt,
    input.trackDeg,
    input.windDirDeg,
    input.windSpeedKt,
    input.fuelBurnPerHour,
    input.reserveMinutes,
    input.departure,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to plan the leg.");
  if (input.distanceNm <= 0) return blank("Leg distance must be greater than zero.");
  if (input.tasKt <= 0) return blank("True airspeed must be greater than zero.");
  if (input.windSpeedKt < 0) return blank("Wind speed cannot be negative.");
  if (input.trackDeg < 0 || input.trackDeg > 360) return blank("Course should be between 0° and 360° true.");
  if (input.windDirDeg < 0 || input.windDirDeg > 360) return blank("Wind direction should be between 0° and 360°.");
  if (input.fuelBurnPerHour < 0) return blank("Fuel burn cannot be negative.");
  if (input.reserveMinutes < 0 || input.reserveMinutes > 240) return blank("Reserve should be between 0 and 240 minutes.");
  if (input.departure < 0 || input.departure > 2400 || Math.round(input.departure) % 100 > 59) {
    return blank("Departure time should be a zulu clock time in HHMM form, such as 1430.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));

  // Wind triangle, component method: the wind component along the track subtracts
  // from (headwind) or adds to (tailwind) the true airspeed, and the across-track
  // component is what the pilot flies into as a wind correction angle.
  const relativeAngle = normalizeAngle(input.windDirDeg - input.trackDeg);
  const rad = (relativeAngle * Math.PI) / 180;
  const headwindComponent = input.windSpeedKt * Math.cos(rad);
  const crosswindComponent = input.windSpeedKt * Math.sin(rad);

  const groundSpeed = input.tasKt - headwindComponent;
  if (groundSpeed <= 0) {
    return blank("The headwind component exceeds the true airspeed, so the aircraft cannot make progress along this track.");
  }

  const wcaRatio = crosswindComponent / input.tasKt;
  const windCorrectionAngle = (Math.asin(Math.max(-1, Math.min(1, wcaRatio))) * 180) / Math.PI;

  const eteHours = input.distanceNm / groundSpeed;
  const eteMinutes = eteHours * 60;
  const etaZulu = minutesToZulu(zuluToMinutes(input.departure) + eteMinutes);

  const fuelBurned = input.fuelBurnPerHour * eteHours;
  const reserveFuel = input.fuelBurnPerHour * (input.reserveMinutes / 60);
  const totalFuel = fuelBurned + reserveFuel;
  const fuelPerNm = input.distanceNm > 0 ? fuelBurned / input.distanceNm : 0;
  const windEffectPct = (headwindComponent / input.tasKt) * 100;

  const tailwind = headwindComponent < 0;
  const verdict = tailwind
    ? `A ${fmt(Math.abs(headwindComponent), 0)} kt tailwind lifts ground speed to ${fmt(groundSpeed, 0)} kt and saves ${fmt(
        (input.distanceNm / (input.tasKt - headwindComponent) - input.distanceNm / input.tasKt) * 60,
        0,
      )} min against still air`
    : `A ${fmt(headwindComponent, 0)} kt headwind pulls ground speed down to ${fmt(groundSpeed, 0)} kt and costs ${fmt(
        (input.distanceNm / groundSpeed - input.distanceNm / input.tasKt) * 60,
        0,
      )} min against still air`;
  const verdictColor = tailwind ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: "Leg distance", value: `${fmt(input.distanceNm, d)} NM` },
    { label: "True airspeed", value: `${fmt(input.tasKt, 0)} kt` },
    { label: "Wind", value: `${fmt(input.windSpeedKt, 0)} kt from ${fmt(input.windDirDeg, 0)}°` },
    {
      label: tailwind ? "Tailwind component along track" : "Headwind component along track",
      value: `${tailwind ? "+" : "−"}${fmt(Math.abs(headwindComponent), d)} kt`,
    },
    {
      label: `Crosswind component (${crosswindComponent >= 0 ? "from the right" : "from the left"})`,
      value: `${fmt(Math.abs(crosswindComponent), d)} kt`,
    },
    { label: "Wind correction angle to fly", value: `${fmt(Math.abs(windCorrectionAngle), d)}° ${windCorrectionAngle >= 0 ? "right" : "left"}` },
    { label: "Ground speed", value: `${fmt(groundSpeed, 0)} kt`, highlight: true },
    { label: "Estimated time enroute", value: hoursToClock(eteHours), highlight: true },
    { label: "Time enroute in decimal hours", value: `${fmt(eteHours, 2)} h · ${fmt(eteMinutes, 0)} min` },
    { label: `Departure ${fmt(input.departure, 0)} on the zulu clock`, value: `arrival ${etaZulu}` },
    { label: `Fuel burn at ${fmt(input.fuelBurnPerHour, d)} ${input.fuelUnit}`, value: `${fmt(fuelBurned, d)} ${input.fuelUnit.split("/")[0]}` },
    { label: `Reserve of ${fmt(input.reserveMinutes, 0)} min`, value: `${fmt(reserveFuel, d)} ${input.fuelUnit.split("/")[0]}` },
    { label: "Fuel required for the leg", value: `${fmt(totalFuel, d)} ${input.fuelUnit.split("/")[0]}`, highlight: true },
    { label: "Fuel per nautical mile", value: `${fmt(fuelPerNm, 3)} ${input.fuelUnit.split("/")[0]}/NM` },
    { label: "Comparison with still air", value: `${fmt(windEffectPct, 1)}% ${tailwind ? "faster" : "slower"} ground speed` },
  ];

  return {
    valid: true,
    errorMsg: "",
    groundSpeed,
    headwindComponent,
    crosswindComponent,
    windCorrectionAngle,
    eteHours,
    eteMinutes,
    etaZulu,
    distanceNm: input.distanceNm,
    fuelBurned,
    reserveFuel,
    totalFuel,
    fuelPerNm,
    windEffectPct,
    verdict,
    verdictColor,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function EstimatedTimeEnrouteCalculator() {
  const [distanceNm, setDistanceNm] = useState(String(DEFAULTS.distanceNm));
  const [tasKt, setTasKt] = useState(String(DEFAULTS.tasKt));
  const [trackDeg, setTrackDeg] = useState(String(DEFAULTS.trackDeg));
  const [windDirDeg, setWindDirDeg] = useState(String(DEFAULTS.windDirDeg));
  const [windSpeedKt, setWindSpeedKt] = useState(String(DEFAULTS.windSpeedKt));
  const [fuelBurnPerHour, setFuelBurnPerHour] = useState(String(DEFAULTS.fuelBurnPerHour));
  const [fuelUnit, setFuelUnit] = useState<string>(DEFAULTS.fuelUnit);
  const [reserveMinutes, setReserveMinutes] = useState(String(DEFAULTS.reserveMinutes));
  const [departure, setDeparture] = useState(String(DEFAULTS.departure));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EteInputs => ({
    distanceNm: parseFloat(distanceNm) || 0,
    tasKt: parseFloat(tasKt) || 0,
    trackDeg: parseFloat(trackDeg) || 0,
    windDirDeg: parseFloat(windDirDeg) || 0,
    windSpeedKt: parseFloat(windSpeedKt) || 0,
    fuelBurnPerHour: parseFloat(fuelBurnPerHour) || 0,
    fuelUnit,
    reserveMinutes: parseFloat(reserveMinutes) || 0,
    departure: parseFloat(departure) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<EteInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EteResult>(() => calculateEte(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateEte(inputs));
  };

  const reset = () => {
    setDistanceNm(String(DEFAULTS.distanceNm));
    setTasKt(String(DEFAULTS.tasKt));
    setTrackDeg(String(DEFAULTS.trackDeg));
    setWindDirDeg(String(DEFAULTS.windDirDeg));
    setWindSpeedKt(String(DEFAULTS.windSpeedKt));
    setFuelBurnPerHour(String(DEFAULTS.fuelBurnPerHour));
    setFuelUnit(DEFAULTS.fuelUnit);
    setReserveMinutes(String(DEFAULTS.reserveMinutes));
    setDeparture(String(DEFAULTS.departure));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateEte(DEFAULTS));
  };

  const distNum = parseFloat(distanceNm);
  const tasNum = parseFloat(tasKt);
  const windNum = parseFloat(windSpeedKt);
  const trackNum = parseFloat(trackDeg);
  const windDirNum = parseFloat(windDirDeg);
  const departureNum = parseFloat(departure);

  const errors = {
    distanceNm: !Number.isFinite(distNum) || distNum <= 0 ? "Must be greater than zero" : "",
    tasKt: !Number.isFinite(tasNum) || tasNum <= 0 ? "Must be greater than zero" : "",
    windSpeedKt: !Number.isFinite(windNum) || windNum < 0 ? "Cannot be negative" : "",
    trackDeg: !Number.isFinite(trackNum) || trackNum < 0 || trackNum > 360 ? "Use 0–360°" : "",
    windDirDeg: !Number.isFinite(windDirNum) || windDirNum < 0 || windDirNum > 360 ? "Use 0–360°" : "",
    departure:
      !Number.isFinite(departureNum) || departureNum < 0 || departureNum > 2400 || Math.round(departureNum) % 100 > 59
        ? "Use HHMM, e.g. 1430"
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is the difference between ETE and ETA?",
      answer:
        "Estimated time enroute is the duration of the leg — the number of hours and minutes from take-off to the next checkpoint or destination. Estimated time of arrival is the clock time you expect to be there, which is the departure time plus the ETE. This calculator reports both, using the zulu (UTC) clock so the answer stays valid across time zones.",
    },
    {
      question: "How does wind change the time enroute?",
      answer:
        "Only the component of the wind that blows along your track changes the time. A 25-knot headwind on a 120-knot true airspeed reduces ground speed to about 95 knots, which stretches a 320-nautical-mile leg from roughly 2 hours 40 minutes to about 3 hours 22 minutes. A tailwind of the same strength cuts it to about 2 hours 13 minutes. The across-track component does not change the distance flown much, but it does determine the wind correction angle you hold to stay on course.",
    },
    {
      question: "Why is the ground speed simply true airspeed minus the headwind?",
      answer:
        "Over the distances and speeds of normal light-aircraft operations the component method is accurate to a fraction of a knot, because the correction for the across-track component is second order. A full wind triangle solves for the heading that produces the desired track and gives a ground speed larger than the simple component answer by only a fraction of a percent when the crosswind is moderate. For jet operations at high altitude the same arithmetic holds; only the airspeed you feed in changes, since true airspeed is what the wind acts on.",
    },
    {
      question: "How much fuel should be carried for the leg?",
      answer:
        "Multiply the hourly burn by the time enroute to get the fuel for the leg, then add the reserve you intend to land with — commonly 30 to 45 minutes for daytime visual flight and more for instrument or night operations. The calculator reports the fuel for the leg, the reserve and the total, and it converts the total into a fuel-per-nautical-mile figure, which is the number that makes two route options comparable when one is longer but has a better wind.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Estimated Time Enroute (ETE) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Estimated Time Enroute (ETE) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Leg">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="distance"
                  label="Distance"
                  value={distanceNm}
                  onChange={setDistanceNm}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="NM"
                  error={errors.distanceNm}
                  tooltip="Track distance for the leg, in nautical miles."
                />
                <CompactInput
                  id="tas"
                  label="True Airspeed"
                  value={tasKt}
                  onChange={setTasKt}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="kt"
                  error={errors.tasKt}
                  tooltip="True airspeed, which is the speed the wind acts on."
                />
              </div>
            </SubSection>

            <SubSection title="Course & Wind">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="track"
                  label="Course (True)"
                  value={trackDeg}
                  onChange={setTrackDeg}
                  onEnter={runCalculate}
                  min="0"
                  max="360"
                  step="any"
                  suffix="°"
                  error={errors.trackDeg}
                  tooltip="Desired track over the ground, in degrees true."
                />
                <CompactInput
                  id="wind-dir"
                  label="Wind From"
                  value={windDirDeg}
                  onChange={setWindDirDeg}
                  onEnter={runCalculate}
                  min="0"
                  max="360"
                  step="any"
                  suffix="°"
                  error={errors.windDirDeg}
                  hint="Direction the wind blows from."
                  tooltip="Meteorological wind direction, in degrees true."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="wind-speed"
                  label="Wind Speed"
                  value={windSpeedKt}
                  onChange={setWindSpeedKt}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="kt"
                  error={errors.windSpeedKt}
                  tooltip="Forecast wind speed in knots; accept 0 for still air."
                />
                <CompactInput
                  id="departure"
                  label="Departure (Zulu)"
                  value={departure}
                  onChange={setDeparture}
                  onEnter={runCalculate}
                  min="0"
                  max="2400"
                  step="1"
                  error={errors.departure}
                  hint="HHMM, e.g. 1430 for 14:30Z."
                  tooltip="Off-block time on the UTC clock, entered as HHMM."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Fuel Planning">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="burn"
                        label="Fuel Burn"
                        value={fuelBurnPerHour}
                        onChange={setFuelBurnPerHour}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        hint="Per hour of flight."
                        tooltip="Hourly fuel consumption at the planned power setting."
                      />
                      <CompactSelect
                        id="fuel-unit"
                        label="Fuel Unit"
                        value={fuelUnit}
                        onChange={setFuelUnit}
                        options={FUEL_UNITS.map((u) => ({ value: u, label: u }))}
                        tooltip="Unit used for every fuel figure in the results."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="reserve"
                        label="Reserve"
                        value={reserveMinutes}
                        onChange={setReserveMinutes}
                        onEnter={runCalculate}
                        min="0"
                        max="240"
                        step="1"
                        suffix="min"
                        tooltip="Fuel you intend to land with, expressed as minutes of flight."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for wind components and fuel figures."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Time Enroute</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? hoursToClock(results.eteHours) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(calcInputs.distanceNm, 0)} NM at ${fmt(results.groundSpeed, 0)} kt ground speed, arriving ${results.etaZulu}`
                  : "Fix the highlighted inputs to plan the leg"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ground Speed</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.groundSpeed, 0)} kt` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Arrival</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.etaZulu : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fuel to Land With</span>
                <span className={`font-extrabold ${results.valid ? "text-foreground" : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.reserveFuel, calcInputs.decimals)} ${calcInputs.fuelUnit.split("/")[0]}` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Flight Plan Item</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the leg, the wind and the departure time to see the full plan.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Time enroute</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${hoursToClock(results.eteHours)} · ${fmt(results.eteMinutes, 0)} min`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Leg distance</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.distanceNm, 0)} NM` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ground speed</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.groundSpeed, 1)} kt` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time enroute</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.eteHours, 2)} h` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Arrival (zulu)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? results.etaZulu : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Along-track wind</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${results.headwindComponent >= 0 ? "−" : "+"}${fmt(Math.abs(results.headwindComponent), 1)} kt`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Wind correction angle</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(Math.abs(results.windCorrectionAngle), 1)}°` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel for leg + reserve</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${fmt(results.totalFuel, 1)} ${calcInputs.fuelUnit.split("/")[0]}`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel per NM</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.fuelPerNm, 3)}` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Estimated Time Enroute Calculator?</h2>
            <p>
              An estimated time enroute calculator turns a leg distance, a true airspeed and a wind forecast into the time the leg
              will take. The arithmetic behind it is small — ground speed is true airspeed adjusted for the wind component along the
              track, and time is distance divided by ground speed — but the answer drives everything else in the flight: fuel required,
              arrival time, alternates, and whether the leg is even worth flying with the forecast as it stands.
            </p>
            <p>
              This calculator also splits the wind into its two components. The along-track component is what changes the time; the
              across-track component determines the wind correction angle, which is the heading offset that keeps the aircraft on the
              plotted course instead of drifting downwind of it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The wind is reported as a direction and a speed, so the first step is to find the relative angle between the wind
              direction and the desired track. A wind blowing from exactly ahead is a 100 percent headwind, a wind from exactly behind
              is a 100 percent tailwind, and a wind from 90 degrees off the nose contributes nothing along the track. Multiply the wind
              speed by the cosine of that relative angle and you have the along-track component; multiply by the sine and you have the
              across-track component.
            </p>
            <p>
              Ground speed is then true airspeed minus the headwind component, so a 25-knot headwind on 120 knots of true airspeed gives
              95 knots over the ground. Time enroute is the leg distance divided by that ground speed, expressed in hours and minutes.
              Arrival time is the departure time plus the time enroute, computed on the zulu clock so no time zone conversion is needed.
            </p>
            <p>
              Fuel planning follows directly. The hourly burn multiplied by the time enroute gives the fuel for the leg, and the reserve
              you enter as minutes of flight adds the fuel you expect to be carrying when you land. The fuel figure is also expressed
              per nautical mile, which is what makes two routing options comparable when the shorter one has a headwind and the longer
              one has a tailwind.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the time enroute itself, with the leg distance and the ground speed it was based on. The three-stat
              bar adds the ground speed, the arrival time and the fuel you should still have on board when you land — the reserve, not
              the total.
            </p>
            <p>
              The breakdown table shows the wind split into its components, the wind correction angle you would hold, the time in both
              clock and decimal form, the arrival time, the fuel for the leg, the reserve and the total, and how the wind compares with
              still air. The summary panel repeats the headline figures and adds the verdict line: whether the forecast is helping or
              costing you time.
            </p>
            <p>
              A few limitations are worth respecting. The component method ignores the small second-order effect of the across-track
              wind on ground speed, which is negligible at normal cruise speeds but grows if the crosswind approaches the true
              airspeed. Forecast winds are also winds aloft at a particular altitude and time, so a climbing or descending leg will
              experience something different. Finally, fuel burn is treated as constant: real burn changes with weight, altitude and
              power setting, so add your own margin on top of the reserve if the leg is long or the weather marginal.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/estimated-time-enroute-ete-calculator" />
          <PopularCalculators exclude="/calculator/estimated-time-enroute-ete-calculator" />
        </div>
      </div>
    </>
  );
}
