"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Orbit, Mountain, Flame, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ImpactorMaterial = "ice" | "porousRock" | "denseRock" | "iron";
type TargetMaterial = "water" | "sediment" | "crystalline";
type Body = "earth" | "moon" | "mars";

interface MaterialSpec {
  key: ImpactorMaterial;
  label: string;
  density: number;
}

interface TargetSpec {
  key: TargetMaterial;
  label: string;
  density: number;
}

interface BodySpec {
  key: Body;
  label: string;
  gravity: number;
  simpleComplexKm: number;
}

interface CraterInputs {
  diameterM: number;
  velocityKmS: number;
  impactorMaterial: ImpactorMaterial;
  angleDegrees: number;
  targetMaterial: TargetMaterial;
  body: Body;
  proMode: boolean;
  customImpactorDensity: number;
}

interface ChartPoint {
  name: string;
  km: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface CraterResult {
  massKg: number;
  velocityMs: number;
  kineticEnergyJ: number;
  megatonsTnt: number;
  transientDiameterM: number;
  finalDiameterM: number;
  finalDiameterKm: number;
  depthM: number;
  craterType: string;
  craterTypeColor: string;
  ejectaRadiusKm: number;
  seismicMagnitude: number;
  recurrenceYears: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  impactorDensity: number;
  fireballRadiusKm: number;
}

const IMPACTOR_MATERIALS: MaterialSpec[] = [
  { key: "ice", label: "Cometary ice", density: 930 },
  { key: "porousRock", label: "Porous rock (carbonaceous)", density: 1500 },
  { key: "denseRock", label: "Dense rock (stony)", density: 3000 },
  { key: "iron", label: "Iron", density: 7900 },
];

const TARGET_MATERIALS: TargetSpec[] = [
  { key: "water", label: "Water", density: 1000 },
  { key: "sediment", label: "Sedimentary rock", density: 2500 },
  { key: "crystalline", label: "Crystalline rock", density: 2750 },
];

const BODIES: BodySpec[] = [
  { key: "earth", label: "Earth", gravity: 9.81, simpleComplexKm: 3.2 },
  { key: "moon", label: "Moon", gravity: 1.62, simpleComplexKm: 15 },
  { key: "mars", label: "Mars", gravity: 3.71, simpleComplexKm: 7 },
];

const JOULES_PER_MEGATON = 4.184e15;

const DEFAULTS: CraterInputs = {
  diameterM: 50,
  velocityKmS: 17,
  impactorMaterial: "denseRock",
  angleDegrees: 45,
  targetMaterial: "crystalline",
  body: "earth",
  proMode: false,
  customImpactorDensity: 3000,
};

export function calculateCrater(i: CraterInputs): CraterResult {
  const spec = IMPACTOR_MATERIALS.find((m) => m.key === i.impactorMaterial) ?? IMPACTOR_MATERIALS[2];
  const target = TARGET_MATERIALS.find((t) => t.key === i.targetMaterial) ?? TARGET_MATERIALS[2];
  const body = BODIES.find((b) => b.key === i.body) ?? BODIES[0];

  const impactorDensity = i.proMode && i.customImpactorDensity > 0 ? i.customImpactorDensity : spec.density;

  const radius = Math.max(0, i.diameterM) / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const massKg = volume * impactorDensity;

  const velocityMs = Math.max(0, i.velocityKmS) * 1000;
  const kineticEnergyJ = 0.5 * massKg * Math.pow(velocityMs, 2);
  const megatonsTnt = kineticEnergyJ / JOULES_PER_MEGATON;

  // Pi-group crater scaling (Holsapple & Schmidt, gravity-dominated regime).
  // Transient crater diameter for a vertical impact, then corrected for angle.
  const angleRad = (Math.max(0, Math.min(90, i.angleDegrees)) * Math.PI) / 180;
  const angleFactor = Math.pow(Math.sin(angleRad), 1 / 3);

  const densityRatio = Math.pow(impactorDensity / target.density, 1 / 3);
  const gravityTerm = Math.pow(
    (Math.max(0.01, i.diameterM) * Math.pow(velocityMs, 2)) / body.gravity,
    0.22
  );

  // Coefficient calibrated so a 50 m dense-rock impactor at 17 km/s into
  // crystalline rock yields a transient crater close to the ~1 km Barringer scale.
  const transientDiameterM =
    1.161 * densityRatio * Math.pow(Math.max(0.01, i.diameterM), 0.78) *
    Math.pow(velocityMs, 0.44) * Math.pow(body.gravity, -0.22) * angleFactor;

  // Simple craters relax slightly; complex craters collapse and widen substantially.
  const simpleComplexM = body.simpleComplexKm * 1000;
  let finalDiameterM: number;
  let craterType: string;
  let craterTypeColor: string;

  if (transientDiameterM < simpleComplexM) {
    finalDiameterM = transientDiameterM * 1.25;
    craterType = "Simple bowl-shaped crater";
    craterTypeColor = "text-emerald-600";
  } else {
    // Collapse widening above the transition, per Melosh's scaling.
    finalDiameterM =
      1.17 * Math.pow(transientDiameterM, 1.13) / Math.pow(simpleComplexM, 0.13);
    craterType = "Complex crater with central uplift and terraced walls";
    craterTypeColor = "text-red-600";
  }

  const finalDiameterKm = finalDiameterM / 1000;

  // Simple craters hold a depth-to-diameter ratio near 1:5; complex craters are
  // proportionally much shallower.
  const depthM =
    transientDiameterM < simpleComplexM
      ? finalDiameterM / 5
      : 0.4 * Math.pow(finalDiameterM / 1000, 0.3) * 1000;

  // Continuous ejecta blanket extends to roughly 2-3 crater radii.
  const ejectaRadiusKm = finalDiameterKm * 1.3;

  // Energy-to-magnitude relation with the standard seismic efficiency of 1e-4.
  const seismicMagnitude =
    kineticEnergyJ > 0 ? 0.67 * Math.log10(kineticEnergyJ * 1e-4) - 5.87 : 0;

  // Rough terrestrial recurrence interval from the observed impactor size
  // frequency distribution.
  const recurrenceYears = Math.pow(Math.max(1, i.diameterM), 2.7) / 12;

  // Fireball radius scales roughly as the cube root of yield.
  const fireballRadiusKm = megatonsTnt > 0 ? 0.28 * Math.pow(megatonsTnt, 1 / 3) : 0;

  const chartData: ChartPoint[] = [
    { name: "This impact", km: finalDiameterKm, isSubject: true },
    { name: "Barringer (AZ)", km: 1.2, isSubject: false },
    { name: "Ries (Germany)", km: 24, isSubject: false },
    { name: "Chicxulub", km: 180, isSubject: false },
    { name: "Vredefort", km: 300, isSubject: false },
  ];

  const sci = (v: number, digits = 3): string => {
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs >= 1e-2 && abs < 1e6) return v.toPrecision(digits + 1);
    const exponent = Math.floor(Math.log10(abs));
    const mantissa = v / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10^${exponent}`;
  };

  const rows: TableRow[] = [
    { label: "Impactor Diameter", value: `${i.diameterM.toLocaleString("en-US")} m` },
    { label: "Impactor Density", value: `${impactorDensity.toLocaleString("en-US")} kg/m³` },
    { label: "Impactor Mass", value: `${sci(massKg)} kg` },
    { label: "Impact Velocity", value: `${i.velocityKmS} km/s` },
    { label: "Impact Angle", value: `${i.angleDegrees}° from horizontal` },
    { label: "Kinetic Energy", value: `${sci(kineticEnergyJ)} J` },
    { label: "Energy Yield", value: `${megatonsTnt >= 1 ? `${megatonsTnt.toFixed(1)} Mt` : `${(megatonsTnt * 1000).toFixed(1)} kt`} TNT` },
    { label: "Transient Crater Diameter", value: `${(transientDiameterM / 1000).toFixed(2)} km` },
    { label: "Final Crater Diameter", value: `${finalDiameterKm.toFixed(2)} km`, key: true },
    { label: "Crater Depth", value: `${depthM >= 1000 ? `${(depthM / 1000).toFixed(2)} km` : `${Math.round(depthM)} m`}` },
    { label: "Crater Morphology", value: craterType },
    { label: "Ejecta Blanket Radius", value: `${ejectaRadiusKm.toFixed(2)} km` },
  ];

  return {
    massKg,
    velocityMs,
    kineticEnergyJ,
    megatonsTnt,
    transientDiameterM,
    finalDiameterM,
    finalDiameterKm,
    depthM,
    craterType,
    craterTypeColor,
    ejectaRadiusKm,
    seismicMagnitude,
    recurrenceYears,
    chartData,
    rows,
    impactorDensity,
    fireballRadiusKm,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

function sciDisplay(v: number, digits = 3): string {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e-2 && abs < 1e6) return v.toPrecision(digits + 1);
  const exponent = Math.floor(Math.log10(abs));
  const mantissa = v / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)} × 10^${exponent}`;
}

export default function ImpactCraterDiameterEstimator() {
  const [inputs, setInputs] = useState<CraterInputs>(DEFAULTS);
  const [result, setResult] = useState<CraterResult>(calculateCrater(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateCrater(inputs));
  }, []);

  const calculate = () => setResult(calculateCrater(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCrater(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof CraterInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "How much bigger is a crater than the object that made it?",
      answer:
        "Typically 10 to 20 times the impactor's diameter, and the ratio grows with impact energy. A 50 metre stony asteroid at 17 km/s excavates a crater around 1 kilometre across — roughly 20 times its own size. The reason is that the crater is carved by the shock wave and the excavation flow it drives, not by the projectile physically pushing material aside. The impactor itself is almost entirely vaporised in the first moments of contact.",
    },
    {
      question: "What are pi-group scaling laws?",
      answer:
        "They are dimensionless-parameter relationships derived from experiments and numerical models, principally by Holsapple and Schmidt, that predict crater size from impactor size, velocity, density, target properties, and gravity. The approach works because crater formation is governed by a handful of dimensionless ratios rather than absolute values, which lets laboratory-scale experiments and nuclear test data be extrapolated to planetary scales with reasonable confidence.",
    },
    {
      question: "What is the difference between a transient and a final crater?",
      answer:
        "The transient crater is the bowl at maximum excavation, before gravity acts on the unstable walls. For small craters the walls slump only slightly and the final crater is about 25% wider than the transient. Above a threshold — roughly 3.2 km on Earth, 15 km on the Moon — the cavity is too deep to support itself, the floor rebounds into a central uplift, and the rim collapses inward along terraces, producing a final crater considerably wider and much shallower than the transient one.",
    },
    {
      question: "Why does the simple-to-complex transition happen at different sizes on different worlds?",
      answer:
        "Because gravity drives the collapse. Stronger gravity destabilises a shallower cavity, so the transition occurs at smaller diameters. On Earth it is about 3.2 km, on Mars about 7 km, and on the Moon around 15 km. This is one of the more elegant results in impact cratering: measuring the transition diameter on an unfamiliar body tells you something about its surface gravity and near-surface material strength.",
    },
    {
      question: "How much does impact angle matter?",
      answer:
        "Less than intuition suggests. Crater diameter scales roughly with the cube root of the sine of the angle from horizontal, so a 45° impact — the statistically most likely case — produces a crater about 89% the diameter of a vertical hit, and even a 30° impact yields about 79%. Craters stay essentially circular down to roughly 15°, below which they become elongated. What angle does change substantially is the ejecta distribution, which becomes markedly asymmetric.",
    },
    {
      question: "What happens to the impactor itself?",
      answer:
        "It is destroyed. On contact, shock pressures reach hundreds of gigapascals — far beyond the strength of any material — and both the impactor and a comparable mass of target rock are vaporised or melted within microseconds. This is why meteoritic material is rarely found at large craters: the projectile no longer exists in recognisable form, and its signature survives mainly as trace-element and isotopic anomalies in the melt sheet, such as the iridium layer marking Chicxulub.",
    },
    {
      question: "How often do impacts of a given size occur on Earth?",
      answer:
        "Frequency falls steeply with size. Metre-scale objects arrive several times a year and burn up harmlessly. Objects around 25 metres, like the Chelyabinsk airburst, arrive roughly every 60 to 100 years. Kilometre-scale impactors capable of global effects come every few hundred thousand years, and Chicxulub-scale events every hundred million or so. The recurrence estimate in this calculator follows the observed size-frequency distribution and should be read as an order-of-magnitude figure.",
    },
    {
      question: "Does an airburst still make a crater?",
      answer:
        "Usually not. Smaller stony and icy objects decelerate and fragment in the atmosphere, releasing their energy as an airburst — Chelyabinsk in 2013 and Tunguska in 1908 both did this, causing substantial ground damage without excavating a crater. Roughly speaking, stony objects below about 25 metres rarely reach the surface intact, while iron impactors punch through far more readily, which is why Barringer Crater in Arizona was made by an iron body. This calculator models the ground impact and does not simulate atmospheric entry, so treat results for small stony impactors as an upper bound.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator/science" },
          { label: "Impact Crater Diameter Estimator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Impact Crater Diameter Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="diameterM" className={lbl}>Impactor Diameter (m)</label>
                <input id="diameterM" type="number" min="0.1" step="1" className={inp} value={inputs.diameterM}
                  onChange={(e) => setNum("diameterM", e.target.value)} />
              </div>
              <div>
                <label htmlFor="velocityKmS" className={lbl}>Velocity (km/s)</label>
                <input id="velocityKmS" type="number" min="0.1" step="0.5" className={inp} value={inputs.velocityKmS}
                  onChange={(e) => setNum("velocityKmS", e.target.value)} />
              </div>
              <div>
                <label htmlFor="impactorMaterial" className={lbl}>Impactor Type</label>
                <select id="impactorMaterial" className={inp} value={inputs.impactorMaterial}
                  onChange={(e) => setInputs((p) => ({ ...p, impactorMaterial: e.target.value as ImpactorMaterial }))}>
                  {IMPACTOR_MATERIALS.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="angleDegrees" className={lbl}>Impact Angle (°)</label>
                <input id="angleDegrees" type="number" min="1" max="90" step="1" className={inp}
                  value={inputs.angleDegrees} onChange={(e) => setNum("angleDegrees", e.target.value)} />
              </div>
            </div>

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
                      <Mountain className="h-3.5 w-3.5" /> Target &amp; Planetary Body
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="targetMaterial" className={lbl}>Target Material</label>
                        <select id="targetMaterial" className={inp} value={inputs.targetMaterial}
                          onChange={(e) => setInputs((p) => ({ ...p, targetMaterial: e.target.value as TargetMaterial }))}>
                          {TARGET_MATERIALS.map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="body" className={lbl}>Planetary Body</label>
                        <select id="body" className={inp} value={inputs.body}
                          onChange={(e) => setInputs((p) => ({ ...p, body: e.target.value as Body }))}>
                          {BODIES.map((b) => (
                            <option key={b.key} value={b.key}>{b.label} (g = {b.gravity} m/s²)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Flame className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock seismic, thermal, and recurrence estimates
                    </label>
                    {inputs.proMode ? (
                      <div>
                        <label htmlFor="customImpactorDensity" className={lbl}>Custom Impactor Density (kg/m³)</label>
                        <input id="customImpactorDensity" type="number" min="1" step="50" className={inp}
                          value={inputs.customImpactorDensity} onChange={(e) => setNum("customImpactorDensity", e.target.value)} />
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Final Crater Diameter</div>
              <div className="text-4xl font-bold text-primary my-1">{result.finalDiameterKm.toFixed(2)} km</div>
              <div className="text-sm text-muted-foreground">
                {(result.finalDiameterM / Math.max(0.01, inputs.diameterM)).toFixed(0)}× the impactor diameter — {result.megatonsTnt >= 1 ? `${result.megatonsTnt.toFixed(1)} Mt` : `${(result.megatonsTnt * 1000).toFixed(1)} kt`} TNT equivalent
              </div>
              <div className={`text-base font-bold mt-2 ${result.craterTypeColor}`}>{result.craterType}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Depth</div>
                <div className="text-lg font-bold text-emerald-600">
                  {result.depthM >= 1000 ? `${(result.depthM / 1000).toFixed(2)} km` : `${Math.round(result.depthM)} m`}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Energy</div>
                <div className="text-lg font-bold text-amber-600">
                  {result.megatonsTnt >= 1 ? `${result.megatonsTnt.toFixed(1)} Mt` : `${(result.megatonsTnt * 1000).toFixed(0)} kt`}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Ejecta Radius</div>
                <div className="text-lg font-bold text-red-600">{result.ejectaRadiusKm.toFixed(1)} km</div>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Final Crater Diameter</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.finalDiameterKm.toFixed(2)} km</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Scale Against Known Terrestrial Craters (km)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={65} />
                    <YAxis tick={{ fontSize: 11 }} scale="log" domain={[0.01, 400]} allowDataOverflow />
                    <RTooltip formatter={(value: number) => `${value.toFixed(2)} km`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="km" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Your impact
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Known crater (log scale)
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Secondary Effects &amp; Recurrence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Seismic Magnitude</div>
                    <div className="text-base font-bold text-foreground">M {result.seismicMagnitude.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fireball Radius</div>
                    <div className="text-base font-bold text-amber-600">{result.fireballRadiusKm.toFixed(2)} km</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Impactor Mass</div>
                    <div className="text-base font-bold text-foreground">{sciDisplay(result.massKg)} kg</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Kinetic Energy</div>
                    <div className="text-base font-bold text-foreground">{sciDisplay(result.kineticEnergyJ)} J</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Estimated Terrestrial Recurrence Interval</div>
                    <div className="text-base font-bold text-foreground">
                      ~1 in {result.recurrenceYears >= 1e6
                        ? `${(result.recurrenceYears / 1e6).toFixed(1)} million`
                        : Math.round(result.recurrenceYears).toLocaleString("en-US")} years
                    </div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Atmospheric entry is not modelled. Stony objects below roughly 25 m usually airburst rather than
                      cratering, so small-impactor results are an upper bound.
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
            <h2 className="text-2xl font-bold mb-3">Why Craters Are Far Larger Than the Objects That Make Them</h2>
            <p className="mb-4">
              A crater is typically 10 to 20 times wider than the body that formed it, and the ratio grows with impact
              energy. The reason is that nothing about crater formation resembles a projectile pushing material aside. On
              contact, shock pressures reach hundreds of gigapascals — well beyond the strength of any material — and both
              the impactor and a comparable mass of target rock vaporise within microseconds. The cavity is then excavated
              by the outward flow field the shock wave drives. A 50 metre stony asteroid at 17 km/s carves roughly a
              kilometre of ground, which is why meteoritic fragments are rarely recovered at large craters: the projectile
              no longer exists in recognisable form.
            </p>

            <h2 className="text-2xl font-bold mb-3">Pi-Group Scaling and What It Rests On</h2>
            <p className="mb-4">
              The estimates here follow pi-group scaling relationships, principally from the work of Holsapple and Schmidt,
              which express crater size through dimensionless combinations of impactor size, velocity, density, target
              properties, and surface gravity. The approach works because cratering is governed by a small number of
              dimensionless ratios rather than absolute magnitudes, which is what permits laboratory experiments, explosive
              tests, and numerical hydrocodes to be extrapolated across many orders of magnitude to planetary scales.
              Gravity enters with a negative exponent — stronger gravity resists excavation and yields smaller craters for
              identical impacts.
            </p>

            <h2 className="text-2xl font-bold mb-3">Simple Bowls, Complex Basins, and the Transition Between</h2>
            <p className="mb-4">
              The transient crater is the cavity at maximum excavation, before gravity acts on unstable walls. Below a
              threshold diameter the walls slump only modestly and the final crater ends up about 25% wider, retaining a
              clean bowl shape with a depth-to-diameter ratio near one to five. Above the threshold the cavity cannot
              support itself: the floor rebounds into a central uplift, the rim collapses inward along terraces, and the
              result is dramatically wider and shallower. That threshold is about 3.2 km on Earth, 7 km on Mars, and 15 km
              on the Moon — the differences track surface gravity, since stronger gravity destabilises a shallower cavity.
            </p>

            <h2 className="text-2xl font-bold mb-3">Angle, Frequency, and the Atmosphere</h2>
            <p>
              Impact angle matters less than intuition suggests. Diameter scales with roughly the cube root of the sine of
              the angle from horizontal, so a 45° impact — the statistically most probable case — produces about 89% of the
              vertical diameter, and craters stay essentially circular down to about 15°. What angle strongly affects is
              ejecta asymmetry. Impact frequency falls steeply with size: metre-scale objects arrive several times a year,
              Chelyabinsk-scale bodies every 60 to 100 years, kilometre-scale impactors every few hundred thousand years,
              and Chicxulub-scale events on hundred-million-year timescales. One important limit on these results is that
              atmospheric entry is not modelled here — stony objects below roughly 25 metres typically airburst rather than
              reaching the ground, so results for small stony impactors should be read as an upper bound.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/impact-crater-diameter-estimator" />
          <PopularCalculators exclude="/calculator/impact-crater-diameter-estimator" />
        </div>
      </div>
    </>
  );
}
