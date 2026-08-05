"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import InputField from "@/domains/calculator/components/ui/InputField";

type BatteryTemp = "cold" | "optimal" | "hot";

interface ChargeSpeedInputs {
  batteryCapacity: number;
  startPercent: number;
  endPercent: number;
  chargerPower: number;
  maxAcceptKw: number;
  efficiency: number;
  chargingLoss: number;
  batteryTemp: BatteryTemp;
}

interface CurvePoint {
  percent: number;
  kw: number;
  hours: number;
}

interface ChargeSpeedResults {
  totalHours: number;
  timeFormatted: string;
  kwhToBattery: number;
  kwhFromGrid: number;
  lossKwh: number;
  milesAdded: number;
  milesPerChargingHour: number;
  averageKw: number;
  peakKw: number;
  effectivePeakKw: number;
  tempDerate: number;
  isDc: boolean;
  percentAdded: number;
  hoursTo80: number;
  hoursAbove80: number;
  curve: CurvePoint[];
}

// Charge acceptance as a fraction of peak power, by state of charge.
// DC packs taper hard above 50% to limit cell heating; AC is capped by the
// onboard charger, so it stays flat until the balancing phase near the top.
function taperFactor(soc: number, isDc: boolean): number {
  if (!isDc) return soc >= 95 ? 0.5 : 1;
  if (soc < 50) return 1;
  if (soc < 60) return 0.85;
  if (soc < 70) return 0.7;
  if (soc < 80) return 0.55;
  if (soc < 90) return 0.35;
  return 0.2;
}

const TEMP_DERATE: Record<BatteryTemp, number> = {
  cold: 0.6,
  optimal: 1,
  hot: 0.8,
};

const CHARGER_PRESETS: { value: string; label: string }[] = [
  { value: "1.4", label: "Level 1 — 120V outlet (1.4 kW)" },
  { value: "7.6", label: "Level 2 — 32A home (7.6 kW)" },
  { value: "9.6", label: "Level 2 — 40A home (9.6 kW)" },
  { value: "11.5", label: "Level 2 — 48A home (11.5 kW)" },
  { value: "50", label: "DC Fast Charger (50 kW)" },
  { value: "150", label: "DC Fast Charger (150 kW)" },
  { value: "250", label: "DC Fast Charger (250 kW)" },
  { value: "350", label: "Ultra-Fast DC (350 kW)" },
  { value: "custom", label: "Custom power…" },
];

const DEFAULTS: ChargeSpeedInputs = {
  batteryCapacity: 75,
  startPercent: 20,
  endPercent: 80,
  chargerPower: 150,
  maxAcceptKw: 170,
  efficiency: 4,
  chargingLoss: 10,
  batteryTemp: "optimal",
};

export function calculateChargingSpeed(i: ChargeSpeedInputs): ChargeSpeedResults {
  const start = Math.min(Math.max(i.startPercent, 0), 100);
  const end = Math.min(Math.max(i.endPercent, 0), 100);
  const lossFraction = Math.min(Math.max(i.chargingLoss, 0), 50) / 100;

  // The car never draws more than its own acceptance rate, however big the charger is.
  const cappedKw = Math.min(i.chargerPower, i.maxAcceptKw);
  // AC and DC behave differently; 22 kW is the practical dividing line.
  const isDc = cappedKw > 22;
  // Temperature gating is a DC-side limit — AC rate is set by the onboard charger.
  const tempDerate = isDc ? TEMP_DERATE[i.batteryTemp] : 1;
  const effectivePeakKw = cappedKw * tempDerate;

  const percentAdded = Math.max(end - start, 0);
  const kwhToBattery = i.batteryCapacity * (percentAdded / 100);
  const kwhFromGrid = kwhToBattery / (1 - lossFraction);

  const curve: CurvePoint[] = [];
  const stepKwhBattery = i.batteryCapacity / 100;
  const stepKwhGrid = stepKwhBattery / (1 - lossFraction);

  let elapsed = 0;
  let peakKw = 0;
  let hoursTo80 = 0;

  if (effectivePeakKw > 0 && i.batteryCapacity > 0) {
    // Seed the curve at the starting SoC with the real acceptance rate, not zero.
    const startKw = effectivePeakKw * taperFactor(start, isDc);
    curve.push({ percent: start, kw: startKw, hours: 0 });
    peakKw = startKw;

    for (let soc = start; soc < end; soc++) {
      const kw = effectivePeakKw * taperFactor(soc, isDc);
      elapsed += stepKwhGrid / kw;
      if (kw > peakKw) peakKw = kw;
      if (soc + 1 <= 80) hoursTo80 = elapsed;

      const nextSoc = soc + 1;
      if (nextSoc % 5 === 0 || nextSoc === end) {
        curve.push({
          percent: nextSoc,
          kw: effectivePeakKw * taperFactor(Math.min(nextSoc, 99), isDc),
          hours: elapsed,
        });
      }
    }
  }

  const hrs = Math.floor(elapsed);
  const mins = Math.round((elapsed - hrs) * 60);
  const timeFormatted = elapsed <= 0 ? "0m" : hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const milesAdded = kwhToBattery * i.efficiency;

  return {
    totalHours: elapsed,
    timeFormatted,
    kwhToBattery,
    kwhFromGrid,
    lossKwh: kwhFromGrid - kwhToBattery,
    milesAdded,
    milesPerChargingHour: elapsed > 0 ? milesAdded / elapsed : 0,
    averageKw: elapsed > 0 ? kwhFromGrid / elapsed : 0,
    peakKw,
    effectivePeakKw,
    tempDerate,
    isDc,
    percentAdded,
    hoursTo80,
    hoursAbove80: Math.max(elapsed - hoursTo80, 0),
    curve,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtDuration = (h: number) => {
  if (h <= 0) return "0m";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export default function ChargingSpeedCalculator() {
  const [batteryCapacity, setBatteryCapacity] = useState(String(DEFAULTS.batteryCapacity));
  const [startPercent, setStartPercent] = useState(String(DEFAULTS.startPercent));
  const [endPercent, setEndPercent] = useState(String(DEFAULTS.endPercent));
  const [chargerPreset, setChargerPreset] = useState(String(DEFAULTS.chargerPower));
  const [customPower, setCustomPower] = useState(String(DEFAULTS.chargerPower));
  const [maxAcceptKw, setMaxAcceptKw] = useState(String(DEFAULTS.maxAcceptKw));
  const [efficiency, setEfficiency] = useState(String(DEFAULTS.efficiency));
  const [chargingLoss, setChargingLoss] = useState(String(DEFAULTS.chargingLoss));
  const [batteryTemp, setBatteryTemp] = useState<BatteryTemp>(DEFAULTS.batteryTemp);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<ChargeSpeedResults>(calculateChargingSpeed(DEFAULTS));
  const [calcInputs, setCalcInputs] = useState<ChargeSpeedInputs>(DEFAULTS);

  const getInputs = (): ChargeSpeedInputs => ({
    batteryCapacity: parseFloat(batteryCapacity) || 0,
    startPercent: parseFloat(startPercent) || 0,
    endPercent: parseFloat(endPercent) || 0,
    chargerPower: chargerPreset === "custom" ? parseFloat(customPower) || 0 : parseFloat(chargerPreset) || 0,
    maxAcceptKw: parseFloat(maxAcceptKw) || 0,
    efficiency: parseFloat(efficiency) || 0,
    chargingLoss: parseFloat(chargingLoss) || 0,
    batteryTemp,
  });

  useEffect(() => {
    setResults(calculateChargingSpeed(DEFAULTS));
  }, []);

  const capNum = parseFloat(batteryCapacity) || 0;
  const startNum = parseFloat(startPercent) || 0;
  const endNum = parseFloat(endPercent) || 0;
  const powerNum = chargerPreset === "custom" ? parseFloat(customPower) || 0 : parseFloat(chargerPreset) || 0;
  const acceptNum = parseFloat(maxAcceptKw) || 0;
  const lossNum = parseFloat(chargingLoss) || 0;

  let errorMsg = "";
  if (capNum <= 0) errorMsg = "Battery capacity must be greater than zero.";
  else if (startNum < 0 || startNum > 100 || endNum < 0 || endNum > 100) errorMsg = "State of charge must be between 0% and 100%.";
  else if (startNum >= endNum) errorMsg = "Target charge must be higher than the starting charge.";
  else if (powerNum <= 0) errorMsg = "Charger power must be greater than zero.";
  else if (acceptNum <= 0) errorMsg = "Vehicle maximum charge rate must be greater than zero.";
  else if (lossNum < 0 || lossNum > 50) errorMsg = "Charging loss must be between 0% and 50%.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    const inputs = getInputs();
    setResults(calculateChargingSpeed(inputs));
    setCalcInputs(inputs);
  };

  const handleReset = () => {
    setBatteryCapacity(String(DEFAULTS.batteryCapacity));
    setStartPercent(String(DEFAULTS.startPercent));
    setEndPercent(String(DEFAULTS.endPercent));
    setChargerPreset(String(DEFAULTS.chargerPower));
    setCustomPower(String(DEFAULTS.chargerPower));
    setMaxAcceptKw(String(DEFAULTS.maxAcceptKw));
    setEfficiency(String(DEFAULTS.efficiency));
    setChargingLoss(String(DEFAULTS.chargingLoss));
    setBatteryTemp(DEFAULTS.batteryTemp);
    setCalcInputs(DEFAULTS);
    setResults(calculateChargingSpeed(DEFAULTS));
  };

  const chargerLimited = calcInputs.chargerPower <= calcInputs.maxAcceptKw;
  const showTaperLine = results.isDc && calcInputs.startPercent < 80 && calcInputs.endPercent > 80;

  const speedFlag =
    results.averageKw >= 100
      ? "text-emerald-600"
      : results.averageKw >= 20
        ? "text-amber-600"
        : "text-red-600";

  const breakdown = [
    { label: "Battery Capacity", value: `${fmt(calcInputs.batteryCapacity, 1)} kWh` },
    { label: "Charge Range", value: `${fmtInt(calcInputs.startPercent)}% → ${fmtInt(calcInputs.endPercent)}%` },
    { label: "State of Charge Added", value: `${fmtInt(results.percentAdded)}%` },
    { label: "Energy Into Battery", value: `${fmt(results.kwhToBattery, 2)} kWh` },
    { label: `Conversion Loss (${fmt(lossNum, 0)}%)`, value: `${fmt(results.lossKwh, 2)} kWh` },
    { label: "Energy Drawn From Grid", value: `${fmt(results.kwhFromGrid, 2)} kWh` },
    { label: "Charger Rating", value: `${fmt(calcInputs.chargerPower, 1)} kW` },
    { label: "Vehicle Max Accept Rate", value: `${fmt(calcInputs.maxAcceptKw, 1)} kW` },
    { label: "Temperature Derate", value: results.isDc ? `× ${fmt(results.tempDerate, 2)}` : "n/a (AC)" },
    { label: "Effective Peak Power", value: `${fmt(results.effectivePeakKw, 1)} kW`, highlight: true },
    { label: "Average Power Delivered", value: `${fmt(results.averageKw, 1)} kW` },
    { label: "Range Added", value: `${fmtInt(results.milesAdded)} mi` },
  ];

  const faqs = [
    { question: "Why does charging slow down after 80%?", answer: "Lithium-ion cells accept energy readily when relatively empty. As they fill, forcing further lithium into the anode raises the risk of plating and generates significant heat, so the battery management system deliberately reduces the current. The result is that the final twenty percent frequently takes as long as the first sixty, which is why road-trip charging stops are usually cut short at eighty." },
    { question: "What is a charge curve?", answer: "A charge curve plots delivered power in kilowatts against state of charge. Plugging into a 150 kW charger does not mean drawing 150 kW throughout. A typical pack holds near peak power to roughly fifty percent, falls away through the sixties and seventies, and drops sharply past eighty. This calculator simulates that taper in one-percent steps rather than assuming a flat rate." },
    { question: "Why doesn't a bigger charger always charge faster?", answer: "Because the vehicle sets its own ceiling. A car rated to accept 55 kW draws 55 kW from a 350 kW dispenser; the extra capacity is simply unused. Charging time is governed by the lower of the two figures, which is why this calculator asks for the vehicle's maximum acceptance rate separately from the charger's rating." },
    { question: "How much does cold weather slow charging?", answer: "Substantially on DC. A cold pack has slower internal chemistry and higher resistance, so the car gates the current until its heater brings the cells into range — commonly a forty percent reduction in peak power. Preconditioning on the way to a fast charger largely eliminates the penalty. AC charging is barely affected, because the onboard charger, not the pack, is the limiting factor." },
    { question: "What is the difference between Level 1, Level 2 and DC fast charging?", answer: "Level 1 uses a standard 120V outlet at about 1.4 kW and adds roughly three to five miles of range per hour. Level 2 runs on a 240V circuit between 7 and 11.5 kW and refills most vehicles overnight. DC fast charging bypasses the onboard charger entirely, feeding the pack directly at 50 to 350 kW and covering a usable range top-up in twenty to forty minutes." },
    { question: "What are charging losses?", answer: "Not all energy drawn from the grid reaches the battery; some is lost as heat in conversion, cabling and thermal management. AC charging typically loses ten to twelve percent because the onboard charger does the AC-to-DC conversion. DC fast charging is more efficient at the vehicle, around five to eight percent, though it runs the cooling system harder. This calculator bills time against grid energy, which is what the charger meters." },
    { question: "Should I charge to 100 percent?", answer: "Only when the next leg genuinely requires it. Above eighty percent the rate collapses, so on a long trip it is almost always quicker to unplug early, drive on, and take a second short stop in the fast part of the curve. Routinely stopping at eighty to ninety percent also reduces the time the pack spends at high state of charge, which is the condition most associated with calendar ageing." },
    { question: "How accurate are these estimates?", answer: "The model uses a representative taper shape and does not know your specific vehicle's published curve, which varies by manufacturer, pack chemistry and software version. Expect the result to land within roughly ten to fifteen percent of a real session under similar conditions. Treat it as a planning figure for comparing chargers and stop lengths, not as a guarantee." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator#transportation" }, { label: "EV Charging Speed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Charging Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="battery-capacity" label="Battery Capacity (kWh)" value={batteryCapacity} onChange={setBatteryCapacity} suffix="kWh" step="any" tooltip="Usable pack capacity from the owner's manual. Typical range is 50–100 kWh." />
              <div>
                <label htmlFor="charger-preset" className="flex items-center text-sm font-medium text-foreground mb-1">Charger Type</label>
                <select
                  id="charger-preset"
                  value={chargerPreset}
                  onChange={e => setChargerPreset(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CHARGER_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <InputField id="start-percent" label="Starting Charge (%)" value={startPercent} onChange={setStartPercent} suffix="%" tooltip="State of charge when you plug in." />
              <InputField id="end-percent" label="Target Charge (%)" value={endPercent} onChange={setEndPercent} suffix="%" tooltip="State of charge you want to reach before unplugging." />
              {chargerPreset === "custom" && (
                <InputField id="custom-power" label="Custom Power (kW)" value={customPower} onChange={setCustomPower} suffix="kW" step="any" tooltip="Rated output of the charger you are using." />
              )}
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Vehicle</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="max-accept" label="Max Charge Rate (kW)" value={maxAcceptKw} onChange={setMaxAcceptKw} suffix="kW" step="any" tooltip="Peak DC power the car will accept. Charging never exceeds this, however large the charger." />
                      <InputField id="ev-eff" label="Efficiency (mi/kWh)" value={efficiency} onChange={setEfficiency} suffix="mi/kWh" step="any" tooltip="Real-world consumption. 3.5–4.5 mi/kWh is typical for a mid-size EV." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Conditions</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="battery-temp" className="flex items-center text-sm font-medium text-foreground mb-1">Battery Temp</label>
                        <select
                          id="battery-temp"
                          value={batteryTemp}
                          onChange={e => setBatteryTemp(e.target.value as BatteryTemp)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="optimal">Optimal / preconditioned</option>
                          <option value="cold">Cold — not preconditioned</option>
                          <option value="hot">Hot — extreme summer</option>
                        </select>
                      </div>
                      <InputField id="charging-loss" label="Charging Loss (%)" value={chargingLoss} onChange={setChargingLoss} suffix="%" step="any" tooltip="Energy lost in conversion and thermal management. Around 10% on AC, 5–8% on DC." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Charge Time</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{results.timeFormatted}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmtInt(calcInputs.startPercent)}% → {fmtInt(calcInputs.endPercent)}% at {fmt(results.effectivePeakKw, 1)} kW peak
                {chargerLimited ? " (charger-limited)" : " (vehicle-limited)"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Energy Added</span>
                <span className="font-extrabold text-foreground">{fmt(results.kwhToBattery, 1)} kWh</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Range Added</span>
                <span className="font-extrabold text-emerald-600">{fmtInt(results.milesAdded)} mi</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Avg Speed</span>
                <span className={`font-extrabold ${speedFlag}`}>{fmt(results.averageKw, 1)} kW</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Charging Session</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Total Time Plugged In</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{results.timeFormatted}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Charge Curve — Power vs State of Charge</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.curve} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="percent"
                      type="number"
                      domain={[calcInputs.startPercent, calcInputs.endPercent]}
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 11 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tickFormatter={(v: number) => `${fmtInt(v)} kW`}
                      tick={{ fontSize: 11 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      width={62}
                    />
                    <RechartsTooltip
                      formatter={(v: number) => [`${fmt(v, 1)} kW`, "Charging speed"]}
                      labelFormatter={(label: number) => `State of charge: ${label}%`}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="kw" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                    {showTaperLine ? (
                      <ReferenceLine x={80} stroke="#EF4444" strokeDasharray="3 3" />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#2563EB" }} />
                  <span className="font-semibold text-muted-foreground">Delivered power</span>
                  <span className="font-bold text-foreground">peak {fmt(results.peakKw, 1)} kW</span>
                </div>
                {showTaperLine && (
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#EF4444" }} />
                    <span className="font-semibold text-muted-foreground">80% taper</span>
                    <span className="font-bold text-foreground">{fmtDuration(results.hoursAbove80)} above it</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Charge Time</span>
                  <span className="font-bold text-foreground">{results.timeFormatted}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">State of Charge Added</span>
                  <span className="font-bold text-foreground">{fmtInt(results.percentAdded)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Energy Into Battery</span>
                  <span className="font-bold text-foreground">{fmt(results.kwhToBattery, 2)} kWh</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Energy From Grid</span>
                  <span className="font-bold text-foreground">{fmt(results.kwhFromGrid, 2)} kWh</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Conversion Loss</span>
                  <span className="font-bold text-foreground">{fmt(results.lossKwh, 2)} kWh</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Effective Peak Power</span>
                  <span className="font-bold text-foreground">{fmt(results.effectivePeakKw, 1)} kW</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Average Power</span>
                  <span className="font-bold text-foreground">{fmt(results.averageKw, 1)} kW</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Range Added</span>
                  <span className="font-bold text-foreground">{fmtInt(results.milesAdded)} mi</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Range per Charging Hour</span>
                  <span className="font-bold text-foreground">{fmtInt(results.milesPerChargingHour)} mi/h</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Time Above 80%</span>
                  <span className="font-bold text-foreground">{fmtDuration(results.hoursAbove80)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Charging Time Is Not a Single Division</h2>
            <p>The textbook formula — energy needed divided by charger power — describes a fuel pump, not a battery. A lithium-ion pack accepts power at a rate that changes continuously as it fills, so a session that averages 80 kW may have started above 150 and finished below 40. This calculator therefore simulates the session in one-percent increments, applying the acceptance rate appropriate to each state of charge, and sums the resulting times rather than dividing once.</p>
            <h2 className="text-2xl font-bold mb-3">Two Ceilings, and the Lower One Wins</h2>
            <p>Every session is limited by both the charger's rating and the vehicle's maximum acceptance rate, and only the smaller of the two matters. A car rated at 55 kW draws 55 kW from a 350 kW dispenser and the remaining capacity sits idle. This is the single most common source of disappointment at a fast charger, and it is why the vehicle's own rate is an explicit input here rather than an assumption. The result card states which of the two is binding.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Curve Collapses Past Eighty Percent</h2>
            <p>Filling the last portion of a pack requires forcing lithium into an increasingly saturated anode. Doing so quickly risks metallic plating on the anode surface, which permanently reduces capacity, and generates heat the cooling system must remove. The battery management system responds by cutting current sharply, typically from around eighty percent. The practical consequence is stark: the final twenty percent of a fast-charge session often takes as long as the first sixty.</p>
            <h2 className="text-2xl font-bold mb-3">Temperature Gating Applies to DC, Not AC</h2>
            <p>A cold pack has slower internal chemistry and higher resistance, so the vehicle restricts DC current until its heater brings the cells into range — commonly a forty percent cut in peak power. Preconditioning on the approach to a fast charger largely removes the penalty. AC charging behaves differently: the onboard charger, not the pack, sets the ceiling at 7 to 11 kW, a rate low enough that a cold battery can accept it regardless. This calculator applies the temperature derate to DC sessions only.</p>
            <h2 className="text-2xl font-bold mb-3">Grid Energy Versus Battery Energy</h2>
            <p>The kilowatt-hours a charger meters are not the kilowatt-hours that reach the battery. Conversion, cabling and thermal management consume roughly ten to twelve percent on AC, where the onboard charger performs the AC-to-DC conversion, and five to eight percent on DC, where the conversion happens in the cabinet instead. Because the charger delivers grid-side power, timing is calculated against grid energy, while range added is calculated from the smaller figure that actually reaches the pack.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Stops Around the Curve</h2>
            <p>On a long journey, total travel time usually falls when each stop is kept short. Charging from ten to sixty percent happens in the fast part of the curve; waiting from eighty to one hundred does not. Two brief stops in the steep region frequently beat one long stop that runs into the taper, even after accounting for the time lost pulling off the road twice. The Time Above 80% figure in the summary is there to make that trade-off explicit.</p>
            <h2 className="text-2xl font-bold mb-3">How Far to Trust the Estimate</h2>
            <p>The taper shape used here is representative rather than vehicle-specific; published curves differ by manufacturer, cell chemistry and even software revision, and a pack that has already been fast-charged twice that day will behave differently from a cold-start session. Expect agreement within roughly ten to fifteen percent under comparable conditions. That is close enough to choose between chargers and to size a stop, and not close enough to schedule against to the minute.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-charging-speed-calculator" />
          <PopularCalculators exclude="/calculator/ev-charging-speed-calculator" />
        </div>
      </div>
    </>
  );
}
