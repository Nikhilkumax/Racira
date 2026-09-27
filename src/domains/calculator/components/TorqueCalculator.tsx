"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TorqueInputs {
  force: number;
  armLength: number;
  angleDeg: number;
  rpm: number;
  gearRatio: number;
  decimals: number;
}

const DEFAULTS: TorqueInputs = {
  force: 250,
  armLength: 0.4,
  angleDeg: 90,
  rpm: 2500,
  gearRatio: 1,
  decimals: 3,
};

const fmt = (v: number, d = 3) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const UNIT_FACTORS: { unit: string; factor: number }[] = [
  { unit: "N·m (newton metre)", factor: 1 },
  { unit: "kgf·m (kilogram-force metre)", factor: 0.1019716 },
  { unit: "lbf·ft (pound-force foot)", factor: 0.7375621 },
  { unit: "lbf·in (pound-force inch)", factor: 8.8507458 },
  { unit: "ozf·in (ounce-force inch)", factor: 141.611933 },
  { unit: "dyn·cm", factor: 10000000 },
];

interface UnitRow {
  unit: string;
  value: number;
}

interface ArmRow {
  arm: number;
  torque: number;
  power: number;
}

interface TorqueResult {
  valid: boolean;
  errorMsg: string;
  effectiveArm: number;
  torque: number;
  torqueWithGear: number;
  powerKw: number;
  powerHp: number;
  units: UnitRow[];
  armRows: ArmRow[];
  angleNote: string;
}

function computeTorque(input: TorqueInputs): TorqueResult {
  const { force, armLength, angleDeg, rpm, gearRatio, decimals } = input;

  const blank: TorqueResult = {
    valid: false,
    errorMsg: "",
    effectiveArm: 0,
    torque: 0,
    torqueWithGear: 0,
    powerKw: 0,
    powerHp: 0,
    units: [],
    armRows: [],
    angleNote: "",
  };

  if (![force, armLength, angleDeg, rpm, gearRatio].every((v) => Number.isFinite(v))) {
    return { ...blank, errorMsg: "Enter a number in every field to calculate torque." };
  }
  if (force < 0) return { ...blank, errorMsg: "Force cannot be negative." };
  if (armLength <= 0) return { ...blank, errorMsg: "The lever arm must be greater than zero." };
  if (angleDeg < 0 || angleDeg > 180) {
    return { ...blank, errorMsg: "Enter an angle between 0 and 180 degrees between the force and the lever arm." };
  }
  if (rpm < 0) return { ...blank, errorMsg: "Rotational speed cannot be negative." };
  if (gearRatio <= 0) return { ...blank, errorMsg: "The gear ratio must be greater than zero." };

  const angleRad = (angleDeg * Math.PI) / 180;
  const effectiveArm = armLength * Math.sin(angleRad);
  const torque = force * effectiveArm;
  const torqueWithGear = torque * gearRatio;

  const omega = (2 * Math.PI * rpm) / 60;
  const powerKw = (torque * omega) / 1000;
  const powerHp = powerKw * 1.341022;

  const units: UnitRow[] = UNIT_FACTORS.map((u) => ({
    unit: u.unit,
    value: Number((torque * u.factor).toFixed(decimals + 3)),
  }));

  const armRows: ArmRow[] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1].map((arm) => {
    const t = force * arm * Math.sin(angleRad);
    return {
      arm,
      torque: Number(t.toFixed(decimals)),
      power: Number(((t * omega) / 1000).toFixed(decimals)),
    };
  });

  const angleNote =
    angleDeg === 90
      ? "The force is perpendicular to the lever arm, so the full force contributes to the torque."
      : `Only the perpendicular component counts, which is ${fmt(Math.sin(angleRad), 3)} of the applied force.`;

  return {
    valid: true,
    errorMsg: "",
    effectiveArm: Number(effectiveArm.toFixed(6)),
    torque: Number(torque.toFixed(6)),
    torqueWithGear: Number(torqueWithGear.toFixed(6)),
    powerKw: Number(powerKw.toFixed(4)),
    powerHp: Number(powerHp.toFixed(4)),
    units,
    armRows,
    angleNote,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TorqueCalculator() {
  const [force, setForce] = useState(String(DEFAULTS.force));
  const [armLength, setArmLength] = useState(String(DEFAULTS.armLength));
  const [angleDeg, setAngleDeg] = useState(String(DEFAULTS.angleDeg));
  const [rpm, setRpm] = useState(String(DEFAULTS.rpm));
  const [gearRatio, setGearRatio] = useState(String(DEFAULTS.gearRatio));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TorqueInputs => ({
    force: parseFloat(force) || 0,
    armLength: parseFloat(armLength) || 0,
    angleDeg: parseFloat(angleDeg) || 0,
    rpm: parseFloat(rpm) || 0,
    gearRatio: parseFloat(gearRatio) || 1,
    decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 3)),
  });

  const [calcInputs, setCalcInputs] = useState<TorqueInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TorqueResult>(() => computeTorque(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTorque(inputs));
  };

  const reset = () => {
    setForce(String(DEFAULTS.force));
    setArmLength(String(DEFAULTS.armLength));
    setAngleDeg(String(DEFAULTS.angleDeg));
    setRpm(String(DEFAULTS.rpm));
    setGearRatio(String(DEFAULTS.gearRatio));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computeTorque(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the torque formula?",
      answer:
        "Torque equals force multiplied by the perpendicular distance from the pivot, written as τ = F × r × sin θ. When the force acts at right angles to the lever arm the sine term is one and the torque is simply force times distance. At any other angle only the perpendicular component of the force produces turning effect.",
    },
    {
      question: "Why does a longer wrench make bolts easier to loosen?",
      answer:
        "Because torque scales linearly with the distance from the pivot, the same push on a longer handle produces proportionally more turning force. Doubling the handle length doubles the torque for the same effort, which is why breaker bars are long. The limit is the strength of the bolt and the risk of shearing it.",
    },
    {
      question: "How does torque relate to power?",
      answer:
        "Power is torque multiplied by angular velocity, so an engine that produces the same torque at higher revolutions produces more power. The relationship explains why a diesel engine can feel strong at low speeds while producing modest peak power, and why a motorcycle engine with little torque at idle can still be quick once it revs.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Torque Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Torque Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Force & Lever Arm">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="force"
                  label="Applied Force"
                  value={force}
                  onChange={setForce}
                  onEnter={runCalculate}
                  suffix="N"
                  tooltip="The force applied, in newtons."
                />
                <CompactInput
                  id="arm-length"
                  label="Lever Arm"
                  value={armLength}
                  onChange={setArmLength}
                  onEnter={runCalculate}
                  suffix="m"
                  tooltip="Distance from the pivot to the point where the force is applied."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="angle"
                  label="Angle Between Force and Arm"
                  value={angleDeg}
                  onChange={setAngleDeg}
                  onEnter={runCalculate}
                  min="0"
                  suffix="°"
                  hint="Ninety degrees means the force is perpendicular, which gives the most torque."
                  tooltip="Only the perpendicular component of the force creates rotation."
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
                  <SubSection title="Rotation & Display">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="rpm"
                        label="Speed"
                        value={rpm}
                        onChange={setRpm}
                        onEnter={runCalculate}
                        min="0"
                        suffix="rpm"
                        tooltip="Rotational speed, used to work out power."
                      />
                      <CompactInput
                        id="gear-ratio"
                        label="Gear Ratio"
                        value={gearRatio}
                        onChange={setGearRatio}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="Multiplies the torque delivered downstream."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show after the decimal point."
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
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
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

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Torque</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.torque, calcInputs.decimals)} N·m` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Effective lever arm ${fmt(results.effectiveArm, calcInputs.decimals)} m from ${fmt(calcInputs.force, 1)} N`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Power</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.powerKw, 2)} kW` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Horsepower</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.powerHp, 2)} hp` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After Gearing</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.torqueWithGear, calcInputs.decimals)} N·m` : "—"}
                </span>
              </div>
            </div>

            {/* UNIT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.units.map((row, index) => (
                    <tr key={row.unit} className={index === 0 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.unit}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.value, calcInputs.decimals)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Angle effect</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{results.angleNote}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* LEVER ARM TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Lever Arm</th>
                    <th className="p-2.5 text-right">Torque</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Power At This Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.armRows.map((row) => (
                    <tr
                      key={row.arm}
                      className={Math.abs(row.arm - calcInputs.armLength) < 0.001 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{`${fmt(row.arm, 2)} m`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.torque, calcInputs.decimals)} N·m`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.power, 2)} kW`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Force</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.force, 2)} N`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lever Arm</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.armLength, 3)} m`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Angle</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.angleDeg, 1)}°`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Speed</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.rpm, 0)} rpm`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gear Ratio</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.gearRatio, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Angular Velocity</span>
                  <span className="text-base font-bold text-foreground">
                    {`${fmt((2 * Math.PI * calcInputs.rpm) / 60, 3)} rad/s`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Torque Calculator?</h2>
            <p>
              A torque calculator finds the turning effect produced by a force applied at a distance from a pivot. It multiplies
              the force by the perpendicular component of the lever arm, converts the answer into six different units and, when a
              rotational speed is supplied, reports the mechanical power that torque produces.
            </p>
            <p>
              Torque is the quantity that matters whenever something rotates: tightening a bolt to a specification, choosing a
              motor for a conveyor, sizing a gearbox, checking a bicycle crank or understanding why an engine feels strong at low
              revs. Getting the lever arm and the angle right is usually the difference between a usable figure and a misleading
              one.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The formula is force multiplied by distance multiplied by the sine of the angle between them. At ninety degrees the
              sine is one, so the full force contributes. At thirty degrees only half the force turns the arm, which is why a
              poorly angled push wastes effort. Multiplying the applied force by that sine term gives the effective lever arm used
              in the calculation.
            </p>
            <p>
              Power follows from torque and rotational speed. Converting revolutions per minute into radians per second and
              multiplying by the torque produces watts, which the calculator reports in kilowatts and horsepower. This is the
              relationship behind every engine power curve, and it explains why holding torque to a higher engine speed always
              increases the power figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the torque in newton metres, and the three-stat bar reports the resulting power in kilowatts
              and horsepower together with the torque delivered after gearing. The first table converts the result into kilogram
              force metres, pound force feet and inches, ounce force inches and dyne centimetres.
            </p>
            <p>
              The second table shows how torque scales with the length of the lever arm at the same force and angle. Doubling the
              distance doubles the torque, which is the principle behind breaker bars, long spanners and gearing of any kind. The
              row matching your entered arm length is highlighted so the scaling is easy to compare.
            </p>
            <p>
              Remember that the angle is measured between the force and the lever arm, not from the horizontal. A push that feels
              perfectly square to the handle can still be several degrees off, and at angles below about forty-five degrees a
              surprising amount of the effort goes into loading the pivot rather than turning it.
            </p>
            <p>
              Finally, treat gearing as a torque multiplier rather than a free gain. A reduction gear raises the torque delivered
              downstream while lowering the speed, and the power stays the same apart from losses. That trade is exactly why a
              vehicle needs gears at all, and why the same engine can feel weak in one gear and strong in another. When
              tightening fasteners, check the specification in the manual and use a calibrated wrench, because a torque figure
              taken from a general table can be wrong for the coating, lubrication and thread condition of the joint in front of
              you. Recording the unit alongside every figure avoids the confusion that comes from mixing newton metres with pound
              feet in the same worksheet.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/torque-calculator" />
          <PopularCalculators exclude="/calculator/torque-calculator" />
        </div>
      </div>
    </>
  );
}
