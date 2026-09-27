"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  time60: string;
  curbWeight: string;
  drivetrainLoss: string;
  peakPower: string;
  driverCargoWeight: string;
  gripCoeff: string;
}

interface Result {
  avgAccelMs2: number;
  avgAccelG: number;
  distanceFt: number;
  forceLbf: number;
  avgPowerWheelHp: number;
  reqFlywheelHp: number;
  powerGap: number;
  tractionLimitG: number;
  tractionOk: boolean;
  finalSpeedMph: number;
}

const DEFAULTS: Inputs = {
  time60: "5.5",
  curbWeight: "3500",
  drivetrainLoss: "15",
  peakPower: "300",
  driverCargoWeight: "200",
  gripCoeff: "1.0",
};

function calculate(inputs: Inputs): Result {
  const t = Math.max(0.1, parseFloat(inputs.time60) || 0);
  const curbWeight = Math.max(0, parseFloat(inputs.curbWeight) || 0);
  const drivetrainLoss = Math.min(90, Math.max(0, parseFloat(inputs.drivetrainLoss) || 0));
  const peakPower = Math.max(0, parseFloat(inputs.peakPower) || 0);
  const driverCargoWeight = Math.max(0, parseFloat(inputs.driverCargoWeight) || 0);
  const gripCoeff = Math.min(5, Math.max(0, parseFloat(inputs.gripCoeff) || 0));

  const finalSpeedMph = 60;
  const v = finalSpeedMph * 0.44704; // m/s
  const totalWeightLb = curbWeight + driverCargoWeight;
  const m = totalWeightLb / 2.20462; // kg
  const avgAccelMs2 = v / t;
  const avgAccelG = avgAccelMs2 / 9.80665;
  const distanceM = 0.5 * avgAccelMs2 * t * t;
  const distanceFt = distanceM / 0.3048;
  const forceN = m * avgAccelMs2;
  const forceLbf = forceN / 4.44822;
  const avgPowerW = 0.5 * m * v * v / t;
  const avgPowerWheelHp = avgPowerW / 745.7;
  const reqFlywheelHp = avgPowerWheelHp / (1 - drivetrainLoss / 100);
  const powerGap = peakPower > 0 ? peakPower - reqFlywheelHp : 0;
  const tractionLimitG = gripCoeff * 1;
  const tractionOk = avgAccelG <= tractionLimitG;

  return { avgAccelMs2, avgAccelG, distanceFt, forceLbf, avgPowerWheelHp, reqFlywheelHp, powerGap, tractionLimitG, tractionOk, finalSpeedMph };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt1 = (n: number) => fmt(n, 1);
const fmt2 = (n: number) => fmt(n, 2);

const NumInput = ({ id, label, value, onChange, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const ZeroToSixtyPerformanceCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.time60) <= 0 ||
    num(inputs.curbWeight) <= 0 ||
    num(inputs.drivetrainLoss) < 0 || num(inputs.drivetrainLoss) >= 100 ||
    num(inputs.peakPower) < 0 ||
    num(inputs.driverCargoWeight) < 0 ||
    num(inputs.gripCoeff) <= 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: "Final Speed (0-60 mph)", value: `${result.finalSpeedMph} mph` },
    { label: "Average Acceleration", value: `${fmt2(result.avgAccelG)} g (${fmt1(result.avgAccelMs2)} m/s²)` },
    { label: "Distance Covered", value: `${fmt(result.distanceFt)} ft` },
    { label: "Average Force Required", value: `${fmt(result.forceLbf)} lbf` },
    { label: "Avg Power at Wheels", value: `${fmt1(result.avgPowerWheelHp)} hp` },
    { label: "Drivetrain Loss", value: `${fmt1(num(inputs.drivetrainLoss))}%` },
    { label: "Required Flywheel Power", value: `${fmt1(result.reqFlywheelHp)} hp` },
    { label: "Actual Peak Power", value: num(inputs.peakPower) > 0 ? `${fmt(num(inputs.peakPower))} hp` : "—" },
    { label: "Power Gap", value: num(inputs.peakPower) > 0 ? `${result.powerGap >= 0 ? "+" : ""}${fmt(result.powerGap)} hp` : "—" },
    { label: "Traction Limit", value: `${fmt2(result.tractionLimitG)} g` },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="time-60" label="0-60 Time" value={inputs.time60} onChange={set("time60")} suffix="sec" />
            <NumInput id="curb-weight" label="Curb Weight" value={inputs.curbWeight} onChange={set("curbWeight")} suffix="lb" />
            <NumInput id="drivetrain-loss" label="Drivetrain Loss" value={inputs.drivetrainLoss} onChange={set("drivetrainLoss")} suffix="%" />
            <NumInput id="peak-power" label="Actual Peak Power" value={inputs.peakPower} onChange={set("peakPower")} suffix="hp" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Load & Traction</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="driver-weight" label="Driver + Cargo Weight" value={inputs.driverCargoWeight} onChange={set("driverCargoWeight")} suffix="lb" />
                  <NumInput id="grip-coeff" label="Tire Grip Coefficient" value={inputs.gripCoeff} onChange={set("gripCoeff")} suffix="μ" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — time, weight, and grip must be positive; drivetrain loss must be under 100%.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Required Flywheel Power</div>
            <div className="text-4xl font-bold text-primary">{fmt1(result.reqFlywheelHp)} hp</div>
            <div className="text-sm text-muted-foreground mt-1">to hit 0-60 in {fmt2(num(inputs.time60))}s at {fmt(num(inputs.curbWeight))} lb, {fmt1(num(inputs.drivetrainLoss))}% loss</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Avg Acceleration</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.avgAccelG)} g</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Distance to 60</div>
              <div className="text-lg font-bold mt-1">{fmt(result.distanceFt)} ft</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Power Gap</div>
              <div className={`text-lg font-bold mt-1 ${result.powerGap >= 0 ? "text-emerald-600" : "text-red-600"}`}>{num(inputs.peakPower) > 0 ? `${result.powerGap >= 0 ? "+" : ""}${fmt(result.powerGap)} hp` : "—"}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Performance Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Required Flywheel Power</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt1(result.reqFlywheelHp)} hp</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!result.tractionOk && (
            <p className="text-sm text-red-600">⚠ Average acceleration exceeds the {fmt2(result.tractionLimitG)} g traction limit — the target time is not achievable with this tire grip regardless of power.</p>
          )}

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Required Flywheel Power</div>
                <div className="text-base font-bold text-primary">{fmt1(result.reqFlywheelHp)} hp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a 0-60 mph Performance Calculator?</h2>
            <p className="text-muted-foreground leading-relaxed">A 0-60 mph performance calculator translates a car's weight, drivetrain losses, and target sprint time into the physics behind the run: the average acceleration, the distance the car covers, the force the tires must deliver, and the engine power required to make it happen. The 0-60 sprint is the most widely quoted acceleration benchmark in the automotive world, and behind that single number sits a short chain of classical mechanics — a constant acceleration from rest to 60 miles per hour implies a specific average force and a specific amount of kinetic energy delivered over a specific window of time. Because power is energy per unit of time, the target sprint time fixes the average power the drivetrain must put to the wheels, and the drivetrain loss percentage converts that into the flywheel power the engine has to produce. This calculator lays that chain out end to end so you can see whether a claimed time is physically realistic for a given car, what a weight reduction is actually worth, and how much headroom your current power output leaves over the minimum required.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Physics of the 0-60 Sprint Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculation starts from the definition of acceleration: converting 60 miles per hour to meters per second — 60 mph is 26.82 meters per second — and dividing by the elapsed time gives the average acceleration. For a 5.5-second run that is 4.88 meters per second squared, or about 0.50 g when divided by the standard gravity of 9.81 meters per second squared. With constant acceleration, the distance covered follows the kinematic formula one half times acceleration times time squared, so the same 5.5-second run covers roughly 242 feet — about 80 percent of a standard football field. Newton's second law then converts that acceleration into force: the vehicle mass, curb weight plus driver and cargo, multiplied by the acceleration gives the average thrust the tires must transmit to the pavement, expressed in pounds of force. The energy side of the problem comes from kinetic energy, one half times mass times final velocity squared, which is the total energy the engine must supply over the sprint. Dividing that energy by the elapsed time gives the average power at the wheels in horsepower, and dividing by the drivetrain efficiency — one minus the loss percentage, so 85 percent at a 15 percent loss — gives the average flywheel power the engine itself must produce. The traction check closes the loop: the maximum acceleration any tire can deliver is the grip coefficient times gravity, so a car with a 1.0 grip coefficient tops out near 1 g of acceleration; if the target time demands more, no amount of horsepower can make the run happen. The power gap compares your entered peak power against the required flywheel power, showing whether the engine has headroom or comes up short. The calculator deliberately models average power and constant acceleration rather than the full launch curve, which is the standard simplification for this benchmark and matches how published 0-60 figures are normally interpreted.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Start with the required flywheel power — the headline number — and compare it against the actual peak power you entered. A healthy positive power gap means the target time is comfortably within reach, while a negative gap means the engine simply does not have enough output to sustain that pace on average, so the real-world time will be slower. The distance row tells you how much road the sprint consumes, which matters for stoplight performance and for safety when testing on public roads. Watch the traction row closely: the warning flag appears whenever the required average acceleration exceeds the tire grip limit, which is exactly the situation where launch control, drag tires, or weight transfer — shifting mass onto the driven axle — can be worth real time even when power is unchanged. The advanced load input is the single most useful lever: shaving 200 pounds of combined driver, cargo, and vehicle weight cuts the force and energy requirements proportionally, and the calculator shows that effect in every downstream number. Drivetrain losses are the other lever — every percentage point of loss recovered, through more efficient drivelines or lighter rotating components, flows straight into the required flywheel power. For engineering sanity checks, remember the model assumes ideal constant acceleration from a standing start with full traction; real launches lose time in the first fraction of a second and gain it back later, so treat the outputs as the physical floor for the target time rather than a guarantee of what any particular car will do. Re-run the calculation when weight, power, or tires change, and use the traction row as the reality check before spending money on power upgrades that physics says the tires cannot put down.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/0-60-mph-performance-calculator" />
      </div>
    </div>
  );
};

export default ZeroToSixtyPerformanceCalculator;