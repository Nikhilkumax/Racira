"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Orbit, Atom, Telescope } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface CosmoInputs {
  hubbleConstant: number;
  omegaMatter: number;
  omegaLambda: number;
  omegaRadiation: number;
  proMode: boolean;
  observedDensity: number;
  gravitationalConstant: number;
}

interface ChartSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface CosmoResult {
  hubbleSi: number;
  criticalDensity: number;
  criticalDensityGeV: number;
  protonsPerCubicMetre: number;
  hydrogenAtomsPerCubicMetre: number;
  solarMassesPerMpc3: number;
  hubbleTimeYears: number;
  hubbleRadiusMpc: number;
  hubbleRadiusLightYears: number;
  omegaTotal: number;
  curvature: number;
  geometry: string;
  geometryColor: string;
  matterDensity: number;
  lambdaDensity: number;
  radiationDensity: number;
  darkEnergyEquivalent: number;
  chartData: ChartSlice[];
  rows: TableRow[];
  // Professional mode
  densityRatio: number;
  deviationPercent: number;
  scaleFactorAtEquality: number;
  redshiftAtEquality: number;
  deSitterHorizonMpc: number;
}

// Physical constants, SI units.
const G_DEFAULT = 6.6743e-11; // m^3 kg^-1 s^-2
const MPC_IN_METRES = 3.0856775814913673e22;
const KM_IN_METRES = 1000;
const PROTON_MASS = 1.67262192369e-27; // kg
const HYDROGEN_MASS = 1.6735575e-27; // kg
const SOLAR_MASS = 1.98892e30; // kg
const SPEED_OF_LIGHT = 2.99792458e8; // m/s
const SECONDS_PER_YEAR = 3.1557e7;
const LIGHT_YEAR_IN_METRES = 9.4607304725808e15;
// 1 kg c^2 expressed in GeV, used to report density in particle-physics units.
const KG_TO_GEV = 5.6095886e26;

const DEFAULTS: CosmoInputs = {
  hubbleConstant: 67.4,
  omegaMatter: 0.315,
  omegaLambda: 0.685,
  omegaRadiation: 0.00009,
  proMode: false,
  observedDensity: 8.5e-27,
  gravitationalConstant: G_DEFAULT,
};

export function calculateCriticalDensity(i: CosmoInputs): CosmoResult {
  const G = i.gravitationalConstant > 0 ? i.gravitationalConstant : G_DEFAULT;

  // Convert H0 from km/s/Mpc to inverse seconds.
  const hubbleSi = (Math.max(0, i.hubbleConstant) * KM_IN_METRES) / MPC_IN_METRES;

  // Friedmann equation for a flat universe: rho_c = 3 H^2 / (8 pi G)
  const criticalDensity = (3 * Math.pow(hubbleSi, 2)) / (8 * Math.PI * G);

  const criticalDensityGeV = criticalDensity * KG_TO_GEV;
  const protonsPerCubicMetre = criticalDensity / PROTON_MASS;
  const hydrogenAtomsPerCubicMetre = criticalDensity / HYDROGEN_MASS;
  const solarMassesPerMpc3 = (criticalDensity * Math.pow(MPC_IN_METRES, 3)) / SOLAR_MASS;

  const hubbleTimeYears = hubbleSi > 0 ? 1 / hubbleSi / SECONDS_PER_YEAR : 0;
  const hubbleRadiusMetres = hubbleSi > 0 ? SPEED_OF_LIGHT / hubbleSi : 0;
  const hubbleRadiusMpc = hubbleRadiusMetres / MPC_IN_METRES;
  const hubbleRadiusLightYears = hubbleRadiusMetres / LIGHT_YEAR_IN_METRES;

  const omegaM = Math.max(0, i.omegaMatter);
  const omegaL = Math.max(0, i.omegaLambda);
  const omegaR = Math.max(0, i.omegaRadiation);
  const omegaTotal = omegaM + omegaL + omegaR;
  const curvature = 1 - omegaTotal;

  let geometry: string;
  let geometryColor: string;
  if (Math.abs(curvature) < 0.005) {
    geometry = "Flat (Euclidean)";
    geometryColor = "text-emerald-600";
  } else if (curvature < 0) {
    geometry = "Closed (spherical)";
    geometryColor = "text-amber-600";
  } else {
    geometry = "Open (hyperbolic)";
    geometryColor = "text-amber-600";
  }

  const matterDensity = criticalDensity * omegaM;
  const lambdaDensity = criticalDensity * omegaL;
  const radiationDensity = criticalDensity * omegaR;
  const darkEnergyEquivalent = lambdaDensity * Math.pow(SPEED_OF_LIGHT, 2);

  const sci = (v: number, digits = 3) => v.toExponential(digits);

  const chartRaw: { name: string; value: number; color: string }[] = [
    { name: "Matter (Ωm)", value: omegaM, color: "#2563EB" },
    { name: "Dark Energy (ΩΛ)", value: omegaL, color: "#8B5CF6" },
    { name: "Radiation (Ωr)", value: omegaR, color: "#F59E0B" },
  ].filter((s) => s.value > 0);

  const chartTotal = chartRaw.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = chartRaw.map((s) => ({
    ...s,
    value: Number(s.value.toFixed(6)),
    percent: chartTotal > 0 ? (s.value / chartTotal) * 100 : 0,
  }));

  const rows: TableRow[] = [
    { label: "Hubble Constant H₀", value: `${i.hubbleConstant} km/s/Mpc` },
    { label: "H₀ in SI Units", value: `${sci(hubbleSi)} s⁻¹` },
    { label: "Critical Density ρc", value: `${sci(criticalDensity)} kg/m³`, key: true },
    { label: "Critical Density (energy)", value: `${sci(criticalDensityGeV)} GeV/m³` },
    { label: "Equivalent Protons per m³", value: sci(protonsPerCubicMetre, 4) },
    { label: "Equivalent Hydrogen Atoms per m³", value: sci(hydrogenAtomsPerCubicMetre, 4) },
    { label: "Solar Masses per Mpc³", value: sci(solarMassesPerMpc3, 4) },
    { label: "Matter Density (Ωm × ρc)", value: `${sci(matterDensity)} kg/m³` },
    { label: "Dark Energy Density (ΩΛ × ρc)", value: `${sci(lambdaDensity)} kg/m³` },
    { label: "Radiation Density (Ωr × ρc)", value: `${sci(radiationDensity)} kg/m³` },
    { label: "Total Density Parameter Ω", value: omegaTotal.toFixed(5) },
    { label: "Curvature Term Ωk", value: curvature.toFixed(5) },
  ];

  // Professional mode
  const densityRatio = criticalDensity > 0 ? Math.max(0, i.observedDensity) / criticalDensity : 0;
  const deviationPercent = (densityRatio - 1) * 100;
  // Matter and dark energy densities were equal when (1+z)^3 = OmegaL / OmegaM.
  const scaleFactorAtEquality = omegaM > 0 && omegaL > 0 ? Math.pow(omegaM / omegaL, 1 / 3) : 0;
  const redshiftAtEquality = scaleFactorAtEquality > 0 ? 1 / scaleFactorAtEquality - 1 : 0;
  // The de Sitter event horizon for a lambda-dominated universe.
  const deSitterHorizonMpc = omegaL > 0 && hubbleSi > 0 ? SPEED_OF_LIGHT / (hubbleSi * Math.sqrt(omegaL)) / MPC_IN_METRES : 0;

  return {
    hubbleSi,
    criticalDensity,
    criticalDensityGeV,
    protonsPerCubicMetre,
    hydrogenAtomsPerCubicMetre,
    solarMassesPerMpc3,
    hubbleTimeYears,
    hubbleRadiusMpc,
    hubbleRadiusLightYears,
    omegaTotal,
    curvature,
    geometry,
    geometryColor,
    matterDensity,
    lambdaDensity,
    radiationDensity,
    darkEnergyEquivalent,
    chartData,
    rows,
    densityRatio,
    deviationPercent,
    scaleFactorAtEquality,
    redshiftAtEquality,
    deSitterHorizonMpc,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function CriticalDensityOfUniverseCalculator() {
  const [inputs, setInputs] = useState<CosmoInputs>(DEFAULTS);
  const [result, setResult] = useState<CosmoResult>(calculateCriticalDensity(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateCriticalDensity(inputs));
  }, []);

  const calculate = () => setResult(calculateCriticalDensity(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCriticalDensity(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof CosmoInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "What is the critical density of the universe?",
      answer:
        "Critical density is the exact mass-energy density that makes the universe spatially flat, balanced precisely between eventual recollapse and unlimited expansion. It follows from the Friedmann equation as ρc = 3H²/(8πG). Using the Planck 2018 value of H₀ = 67.4 km/s/Mpc, it works out to roughly 8.5 × 10⁻²⁷ kilograms per cubic metre, which is about five hydrogen atoms per cubic metre. That is a far better vacuum than any laboratory on Earth can produce.",
    },
    {
      question: "How is the formula ρc = 3H²/(8πG) derived?",
      answer:
        "Take the Friedmann equation, H² = (8πG/3)ρ − kc²/a², and set the curvature term k to zero, which is the definition of a flat universe. Solving the remainder for ρ gives ρc = 3H²/(8πG) directly. The same result follows from a Newtonian argument: set the kinetic energy of a shell of matter expanding with the Hubble flow equal to its gravitational potential energy, and the escape-velocity condition produces the identical expression.",
    },
    {
      question: "Why does the critical density depend on the Hubble constant squared?",
      answer:
        "Because expansion rate enters the energy balance quadratically, exactly as kinetic energy scales with the square of velocity. A faster-expanding universe needs proportionally more gravitating mass-energy to be held at the flat, marginally-bound configuration. The quadratic dependence is also why the Hubble tension matters here: the difference between 67.4 and 73.0 km/s/Mpc changes ρc by roughly 17%, not 8%.",
    },
    {
      question: "What is the density parameter Omega?",
      answer:
        "Omega is the ratio of actual density to critical density, Ω = ρ/ρc. It is the cleanest way to state cosmic geometry: Ω greater than 1 means a closed universe with positive curvature, less than 1 means an open universe with negative curvature, and exactly 1 means flat. Current measurements place the total Ω at 1.000 within about half a percent, split roughly 31.5% matter and 68.5% dark energy.",
    },
    {
      question: "Is the universe actually at critical density?",
      answer:
        "As far as we can measure, remarkably close to it. Cosmic microwave background data from Planck constrains the curvature parameter to within about 0.5% of zero, meaning total density sits essentially at critical. This near-perfect flatness is itself a puzzle, because any tiny early deviation would have amplified enormously over cosmic time. Cosmic inflation is the standard explanation, driving curvature toward zero exponentially in the first fraction of a second.",
    },
    {
      question: "What does five hydrogen atoms per cubic metre actually mean?",
      answer:
        "It is the average across the entire observable universe, including the vast intergalactic voids that make up most of the volume. Matter is enormously clumped: inside a galaxy the density is roughly a million times higher, and inside a star higher still by many orders of magnitude. The critical density is a cosmological average, not a local prediction, which is why it says nothing about the density of the room you are sitting in.",
    },
    {
      question: "Does critical density change over time?",
      answer:
        "Yes, because it depends on the Hubble parameter, which evolves as the universe expands. Critical density was vastly higher in the early universe when H was enormous, and in a dark-energy-dominated future H approaches a constant, so ρc approaches a fixed floor. What stays fixed is the definition: at any epoch, ρc is whatever density would make space flat at that moment.",
    },
    {
      question: "When did dark energy overtake matter?",
      answer:
        "Matter density falls as the cube of the scale factor while dark energy density stays constant, so they were equal when (1+z)³ = ΩΛ/Ωm. With the default parameters that gives a redshift of about 0.3, roughly 3.5 billion years ago. Before that, gravity was decelerating the expansion; after it, dark energy took over and the expansion began accelerating. Professional Mode above computes this crossover redshift from your own parameter values.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator/science" },
          { label: "Critical Density of Universe Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Critical Density of Universe Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="hubbleConstant" className={lbl}>Hubble Constant H₀ (km/s/Mpc)</label>
                <input id="hubbleConstant" type="number" min="1" step="0.1" className={inp} value={inputs.hubbleConstant}
                  onChange={(e) => setNum("hubbleConstant", e.target.value)} />
              </div>
              <div>
                <label htmlFor="omegaMatter" className={lbl}>Ωm (matter)</label>
                <input id="omegaMatter" type="number" min="0" step="0.005" className={inp} value={inputs.omegaMatter}
                  onChange={(e) => setNum("omegaMatter", e.target.value)} />
              </div>
              <div>
                <label htmlFor="omegaLambda" className={lbl}>ΩΛ (dark energy)</label>
                <input id="omegaLambda" type="number" min="0" step="0.005" className={inp} value={inputs.omegaLambda}
                  onChange={(e) => setNum("omegaLambda", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Atom className="h-3.5 w-3.5" /> Additional Components
                    </div>
                    <div>
                      <label htmlFor="omegaRadiation" className={lbl}>Ωr (radiation)</label>
                      <input id="omegaRadiation" type="number" min="0" step="0.00001" className={inp}
                        value={inputs.omegaRadiation} onChange={(e) => setNum("omegaRadiation", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Telescope className="h-3.5 w-3.5" /> Physical Constants
                    </div>
                    <div>
                      <label htmlFor="gravitationalConstant" className={lbl}>Gravitational Constant G (m³/kg/s²)</label>
                      <input id="gravitationalConstant" type="number" step="0.0000000001" className={inp}
                        value={inputs.gravitationalConstant} onChange={(e) => setNum("gravitationalConstant", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Orbit className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock density comparison and epoch analysis
                    </label>
                    {inputs.proMode ? (
                      <div>
                        <label htmlFor="observedDensity" className={lbl}>Observed Density (kg/m³)</label>
                        <input id="observedDensity" type="number" step="1e-28" className={inp} value={inputs.observedDensity}
                          onChange={(e) => setNum("observedDensity", e.target.value)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Critical Density ρc</div>
              <div className="text-4xl font-bold text-primary my-1">{result.criticalDensity.toExponential(3)}</div>
              <div className="text-sm text-muted-foreground">
                kg/m³ — about {result.hydrogenAtomsPerCubicMetre.toFixed(2)} hydrogen atoms per cubic metre
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Geometry</div>
                <div className={`text-lg font-bold ${result.geometryColor}`}>{result.geometry}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Ω</div>
                <div className={`text-lg font-bold ${Math.abs(result.curvature) < 0.005 ? "text-emerald-600" : Math.abs(result.curvature) < 0.05 ? "text-amber-600" : "text-red-600"}`}>
                  {result.omegaTotal.toFixed(4)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Hubble Time</div>
                <div className="text-lg font-bold text-foreground">{(result.hubbleTimeYears / 1e9).toFixed(2)} Gyr</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cosmological Quantity</th>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Spatial Geometry</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.geometry}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Energy Budget of the Universe</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {result.chartData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value: number) => value.toExponential(4)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
                      {slice.name} — {slice.percent.toFixed(3)}%
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Density Comparison &amp; Cosmic Epochs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Observed Ω (ρ/ρc)</div>
                    <div className="text-base font-bold text-foreground">{result.densityRatio.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Deviation from Critical</div>
                    <div className={`text-base font-bold ${Math.abs(result.deviationPercent) < 1 ? "text-emerald-600" : Math.abs(result.deviationPercent) < 10 ? "text-amber-600" : "text-red-600"}`}>
                      {result.deviationPercent >= 0 ? "+" : ""}{result.deviationPercent.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Matter–Λ Equality Redshift</div>
                    <div className="text-base font-bold text-foreground">z = {result.redshiftAtEquality.toFixed(3)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scale Factor at Equality</div>
                    <div className="text-base font-bold text-foreground">a = {result.scaleFactorAtEquality.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Hubble Radius</div>
                    <div className="text-base font-bold text-foreground">
                      {result.hubbleRadiusMpc.toFixed(1)} Mpc ({(result.hubbleRadiusLightYears / 1e9).toFixed(2)} Gly)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">de Sitter Event Horizon</div>
                    <div className="text-base font-bold text-foreground">{result.deSitterHorizonMpc.toFixed(1)} Mpc</div>
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
            <h2 className="text-2xl font-bold mb-3">The Density That Decides Cosmic Geometry</h2>
            <p className="mb-4">
              Critical density is the mass-energy density at which the universe is exactly spatially flat, poised on the
              knife edge between eventual recollapse and endless expansion. It emerges from the Friedmann equation, the
              cosmological solution to Einstein's field equations, by setting the curvature term to zero and solving for
              density. The result is compact: ρc = 3H²/(8πG). Nothing in it is adjustable except the Hubble constant, which
              is why measuring H₀ precisely has occupied observational cosmology for a century.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Empty That Actually Is</h2>
            <p className="mb-4">
              With the Planck 2018 value of 67.4 km/s/Mpc, critical density works out to roughly 8.5 × 10⁻²⁷ kilograms per
              cubic metre. Expressed in more intuitive terms, that is about five hydrogen atoms in every cubic metre of
              space, a vacuum far better than anything achievable in a terrestrial laboratory. The figure is an average
              across the whole observable universe, dominated by the enormous voids between galaxy filaments. Local density
              inside a galaxy exceeds it by around a million times, and inside a star by many orders of magnitude more, so
              critical density describes the cosmos in bulk rather than any particular place in it.
            </p>

            <h2 className="text-2xl font-bold mb-3">Reading the Omega Parameters</h2>
            <p className="mb-4">
              Cosmologists rarely quote densities directly, preferring the dimensionless ratio Ω = ρ/ρc. Total Ω above 1
              means positive curvature and a closed universe; below 1 means negative curvature and an open one; exactly 1
              means flat. Current measurements put total Ω at 1.000 to within about half a percent, composed of roughly
              31.5% matter, 68.5% dark energy, and a radiation contribution now down near 10⁻⁴. That near-perfect flatness
              is a genuine puzzle, because any small early deviation would have amplified dramatically; cosmic inflation is
              the standard resolution, flattening curvature exponentially in the universe's first fraction of a second.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why the Hubble Tension Matters Here</h2>
            <p>
              Because critical density scales with H₀ squared, the ongoing disagreement between measurement methods
              propagates directly into it. Cosmic microwave background analysis gives about 67.4 km/s/Mpc, while
              distance-ladder measurements using Cepheid variables and Type Ia supernovae give closer to 73.0. That
              difference of roughly 8% in H₀ becomes about 17% in ρc. Try both values in the calculator above to see the
              effect. Professional Mode additionally computes the redshift at which dark energy overtook matter, found by
              solving (1+z)³ = ΩΛ/Ωm, which lands near z = 0.3 for standard parameters and marks the moment cosmic
              expansion switched from decelerating to accelerating.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/critical-density-of-universe-calculator" />
          <PopularCalculators exclude="/calculator/critical-density-of-universe-calculator" />
        </div>
      </div>
    </>
  );
}
