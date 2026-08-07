"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Building2, Scale, Ruler } from "lucide-react";
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

type UnitSystem = "imperial" | "metric";
type CodeMethod = "aci318" | "aciDensity" | "eurocode2" | "cebFip";
type AggregateType = "quartzite" | "limestone" | "sandstone" | "basalt";

interface AggregateSpec {
  key: AggregateType;
  label: string;
  ecFactor: number;
}

interface ConcreteInputs {
  compressiveStrength: number;
  unitSystem: UnitSystem;
  method: CodeMethod;
  density: number;
  proMode: boolean;
  aggregate: AggregateType;
  memberLengthMm: number;
  appliedStressMpa: number;
}

interface ChartPoint {
  name: string;
  gpa: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface ConcreteResult {
  fcMpa: number;
  fcPsi: number;
  densityKgM3: number;
  ecMpa: number;
  ecGpa: number;
  ecKsi: number;
  ecPsi: number;
  aciNormalweightMpa: number;
  aciDensityMpa: number;
  eurocodeMpa: number;
  cebFipMpa: number;
  modularRatio: number;
  rupturousModulusMpa: number;
  strainAtStress: number;
  deflectionIndexMm: number;
  aggregateAdjustedGpa: number;
  strengthClass: string;
  strengthClassColor: string;
  chartData: ChartPoint[];
  rows: TableRow[];
}

const PSI_PER_MPA = 145.0377;
const STEEL_MODULUS_MPA = 200000;

// Eurocode 2 Table 3.1 aggregate correction factors applied to Ecm.
const AGGREGATES: AggregateSpec[] = [
  { key: "quartzite", label: "Quartzite (reference)", ecFactor: 1.0 },
  { key: "limestone", label: "Limestone", ecFactor: 0.9 },
  { key: "sandstone", label: "Sandstone", ecFactor: 0.7 },
  { key: "basalt", label: "Basalt", ecFactor: 1.2 },
];

const DEFAULTS: ConcreteInputs = {
  compressiveStrength: 30,
  unitSystem: "metric",
  method: "aci318",
  density: 2400,
  proMode: false,
  aggregate: "quartzite",
  memberLengthMm: 6000,
  appliedStressMpa: 10,
};

export function calculateConcreteModulus(i: ConcreteInputs): ConcreteResult {
  const fcMpa =
    i.unitSystem === "imperial"
      ? Math.max(0.1, i.compressiveStrength) / PSI_PER_MPA
      : Math.max(0.1, i.compressiveStrength);
  const fcPsi = fcMpa * PSI_PER_MPA;

  const densityKgM3 =
    i.unitSystem === "imperial"
      ? Math.max(1, i.density) * 16.0185 // pcf to kg/m3
      : Math.max(1, i.density);

  // ACI 318 normalweight: Ec = 4700 sqrt(f'c) in MPa (57000 sqrt(f'c) in psi).
  const aciNormalweightMpa = 4700 * Math.sqrt(fcMpa);

  // ACI 318 density-dependent: Ec = wc^1.5 x 0.043 sqrt(f'c) in MPa,
  // valid for 1440 to 2560 kg/m3.
  const aciDensityMpa = Math.pow(densityKgM3, 1.5) * 0.043 * Math.sqrt(fcMpa);

  // Eurocode 2: Ecm = 22 [(fcm)/10]^0.3 GPa, where fcm = fck + 8 MPa.
  const fcm = fcMpa + 8;
  const eurocodeMpa = 22000 * Math.pow(fcm / 10, 0.3);

  // CEB-FIP Model Code: Eci = 21500 (fcm/10)^(1/3) MPa.
  const cebFipMpa = 21500 * Math.pow(fcm / 10, 1 / 3);

  let ecMpa: number;
  if (i.method === "aciDensity") ecMpa = aciDensityMpa;
  else if (i.method === "eurocode2") ecMpa = eurocodeMpa;
  else if (i.method === "cebFip") ecMpa = cebFipMpa;
  else ecMpa = aciNormalweightMpa;

  const ecGpa = ecMpa / 1000;
  const ecPsi = ecMpa * PSI_PER_MPA;
  const ecKsi = ecPsi / 1000;

  // Modular ratio n = Es/Ec, used throughout reinforced concrete design.
  const modularRatio = ecMpa > 0 ? STEEL_MODULUS_MPA / ecMpa : 0;

  // ACI modulus of rupture: fr = 0.62 sqrt(f'c) MPa.
  const rupturousModulusMpa = 0.62 * Math.sqrt(fcMpa);

  const aggregate = AGGREGATES.find((a) => a.key === i.aggregate) ?? AGGREGATES[0];
  const aggregateAdjustedGpa = (eurocodeMpa * aggregate.ecFactor) / 1000;

  // Elastic strain and axial shortening under the applied service stress.
  const appliedStress = Math.max(0, i.appliedStressMpa);
  const strainAtStress = ecMpa > 0 ? appliedStress / ecMpa : 0;
  const deflectionIndexMm = strainAtStress * Math.max(0, i.memberLengthMm);

  let strengthClass: string;
  let strengthClassColor: string;
  if (fcMpa >= 55) {
    strengthClass = "High-strength concrete (C55+)";
    strengthClassColor = "text-emerald-600";
  } else if (fcMpa >= 35) {
    strengthClass = "Structural grade (C35-C50)";
    strengthClassColor = "text-emerald-600";
  } else if (fcMpa >= 20) {
    strengthClass = "Normal structural (C20-C30)";
    strengthClassColor = "text-amber-600";
  } else {
    strengthClass = "Low strength — non-structural or mass fill";
    strengthClassColor = "text-red-600";
  }

  const chartData: ChartPoint[] = [
    { name: "ACI 318 (normalweight)", gpa: aciNormalweightMpa / 1000, isSubject: i.method === "aci318" },
    { name: "ACI 318 (density)", gpa: aciDensityMpa / 1000, isSubject: i.method === "aciDensity" },
    { name: "Eurocode 2", gpa: eurocodeMpa / 1000, isSubject: i.method === "eurocode2" },
    { name: "CEB-FIP MC90", gpa: cebFipMpa / 1000, isSubject: i.method === "cebFip" },
  ];

  const rows: TableRow[] = [
    { label: "Compressive Strength f'c", value: `${fcMpa.toFixed(1)} MPa (${Math.round(fcPsi).toLocaleString("en-US")} psi)` },
    { label: "Concrete Density", value: `${Math.round(densityKgM3).toLocaleString("en-US")} kg/m³ (${(densityKgM3 / 16.0185).toFixed(0)} pcf)` },
    { label: "Strength Classification", value: strengthClass },
    { label: "ACI 318 — 4700√f'c", value: `${(aciNormalweightMpa / 1000).toFixed(2)} GPa` },
    { label: "ACI 318 — wc^1.5 × 0.043√f'c", value: `${(aciDensityMpa / 1000).toFixed(2)} GPa` },
    { label: "Eurocode 2 — 22(fcm/10)^0.3", value: `${(eurocodeMpa / 1000).toFixed(2)} GPa` },
    { label: "CEB-FIP MC90 — 21500(fcm/10)^⅓", value: `${(cebFipMpa / 1000).toFixed(2)} GPa` },
    { label: "Selected Elastic Modulus Ec", value: `${ecGpa.toFixed(2)} GPa`, key: true },
    { label: "Ec in Imperial Units", value: `${Math.round(ecKsi).toLocaleString("en-US")} ksi` },
    { label: "Modular Ratio n = Es/Ec", value: modularRatio.toFixed(2) },
    { label: "Modulus of Rupture fr", value: `${rupturousModulusMpa.toFixed(2)} MPa` },
    { label: "Mean Strength fcm = fck + 8", value: `${fcm.toFixed(1)} MPa` },
  ];

  return {
    fcMpa,
    fcPsi,
    densityKgM3,
    ecMpa,
    ecGpa,
    ecKsi,
    ecPsi,
    aciNormalweightMpa,
    aciDensityMpa,
    eurocodeMpa,
    cebFipMpa,
    modularRatio,
    rupturousModulusMpa,
    strainAtStress,
    deflectionIndexMm,
    aggregateAdjustedGpa,
    strengthClass,
    strengthClassColor,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function ElasticModulusOfConcreteCalculator() {
  const [inputs, setInputs] = useState<ConcreteInputs>(DEFAULTS);
  const [result, setResult] = useState<ConcreteResult>(calculateConcreteModulus(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateConcreteModulus(inputs));
  }, []);

  const calculate = () => setResult(calculateConcreteModulus(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateConcreteModulus(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof ConcreteInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "What is the elastic modulus of concrete?",
      answer:
        "It is the ratio of stress to strain in the linear portion of the concrete's stress-strain curve, expressed in gigapascals or thousands of psi. It governs how much a member deflects, shortens, or shortens under load, and it feeds directly into deflection checks, prestress loss calculations, and the modular ratio used in reinforced concrete section analysis. Typical structural concrete falls between 25 and 40 GPa, roughly one-sixth to one-seventh the stiffness of steel.",
    },
    {
      question: "Why does elastic modulus scale with the square root of strength?",
      answer:
        "The square-root relationship in ACI 318 — Ec = 4700√f'c in MPa, or 57000√f'c in psi — is empirical, fitted to test data rather than derived from first principles. It reflects the fact that stiffness rises more slowly than strength: doubling f'c from 30 to 60 MPa raises the modulus by only about 41%, not 100%. This is why high-strength concrete is disproportionately strong relative to how stiff it is, and why deflection often governs design in high-strength members.",
    },
    {
      question: "Which code equation should I use?",
      answer:
        "Use the one your governing code specifies, since the values differ meaningfully. ACI 318's 4700√f'c is standard for North American normalweight design. Eurocode 2's 22(fcm/10)^0.3 uses mean rather than characteristic strength and typically gives slightly higher values at normal grades. The ACI density-dependent form is required for lightweight concrete. Where a project spans jurisdictions, the differences between these — often 10 to 15% — matter for deflection compliance.",
    },
    {
      question: "How does aggregate type affect the modulus?",
      answer:
        "Substantially, and it is the single largest source of scatter around code predictions. Aggregate occupies 60 to 75% of concrete volume and its own stiffness dominates the composite. Eurocode 2 gives correction factors: basalt aggregate multiplies the predicted modulus by 1.2, limestone by 0.9, and sandstone by only 0.7. A sandstone-aggregate mix can therefore be 40% less stiff than a basalt mix of identical compressive strength, which no strength-based equation will capture.",
    },
    {
      question: "What is the modular ratio and why does it matter?",
      answer:
        "The modular ratio n is the steel modulus divided by the concrete modulus, typically 6 to 9 for structural concrete. It converts steel area into equivalent concrete area for transformed-section analysis, which is how cracked-section properties, service stresses, and deflections are computed in reinforced concrete. A lower n means stiffer concrete relative to steel and less stress transferred into the reinforcement at service loads.",
    },
    {
      question: "Does the modulus change over time?",
      answer:
        "Yes, in two directions. It increases as the concrete continues hydrating — 28-day values are the reference, but strength and stiffness keep rising for months and years. Working against that, sustained load produces creep, so the effective modulus for long-term deflection is substantially lower than the instantaneous value. Codes handle this with an effective modulus, dividing the short-term value by one plus the creep coefficient, which can halve the stiffness used for long-term checks.",
    },
    {
      question: "Should I test rather than calculate?",
      answer:
        "For anything unusual, yes. Code equations are fitted to normalweight concrete with common aggregates, and scatter of plus or minus 20% against measured values is routine even within that range. Where the modulus governs the design — long-span deflection, prestress losses, seismic stiffness, vibration serviceability — a measured value from ASTM C469 or EN 12390-13 on the actual mix is worth the cost. Calculated values are appropriate for preliminary design and for conventional mixes.",
    },
    {
      question: "What is the difference between static and dynamic modulus?",
      answer:
        "The dynamic modulus, measured by resonant frequency or ultrasonic pulse velocity, is typically 20 to 30% higher than the static value from a compression test. The difference arises because the dynamic test applies tiny strains that stay in the truly linear region, while the static test involves enough strain to engage microcracking. Structural design uses the static value; dynamic measurements are more useful for quality control and for assessing damage in existing structures.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator/engineering" },
          { label: "Elastic Modulus of Concrete Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Elastic Modulus of Concrete Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="compressiveStrength" className={lbl}>
                  f&apos;c ({inputs.unitSystem === "metric" ? "MPa" : "psi"})
                </label>
                <input id="compressiveStrength" type="number" min="0.1" step={inputs.unitSystem === "metric" ? "1" : "100"}
                  className={inp} value={inputs.compressiveStrength}
                  onChange={(e) => setNum("compressiveStrength", e.target.value)} />
              </div>
              <div>
                <label htmlFor="unitSystem" className={lbl}>Unit System</label>
                <select id="unitSystem" className={inp} value={inputs.unitSystem}
                  onChange={(e) => setInputs((p) => ({ ...p, unitSystem: e.target.value as UnitSystem }))}>
                  <option value="metric">Metric (MPa, kg/m³)</option>
                  <option value="imperial">Imperial (psi, pcf)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="method" className={lbl}>Code Equation</label>
                <select id="method" className={inp} value={inputs.method}
                  onChange={(e) => setInputs((p) => ({ ...p, method: e.target.value as CodeMethod }))}>
                  <option value="aci318">ACI 318 — 4700√f&apos;c (normalweight)</option>
                  <option value="aciDensity">ACI 318 — wc^1.5 × 0.043√f&apos;c (any density)</option>
                  <option value="eurocode2">Eurocode 2 — 22(fcm/10)^0.3</option>
                  <option value="cebFip">CEB-FIP MC90 — 21500(fcm/10)^⅓</option>
                </select>
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
                      <Scale className="h-3.5 w-3.5" /> Mix Properties
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="density" className={lbl}>
                          Density ({inputs.unitSystem === "metric" ? "kg/m³" : "pcf"})
                        </label>
                        <input id="density" type="number" min="1" step={inputs.unitSystem === "metric" ? "10" : "1"}
                          className={inp} value={inputs.density}
                          onChange={(e) => setNum("density", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="aggregate" className={lbl}>Coarse Aggregate</label>
                        <select id="aggregate" className={inp} value={inputs.aggregate}
                          onChange={(e) => setInputs((p) => ({ ...p, aggregate: e.target.value as AggregateType }))}>
                          {AGGREGATES.map((a) => (
                            <option key={a.key} value={a.key}>{a.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Ruler className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock strain, shortening, and aggregate correction
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="appliedStressMpa" className={lbl}>Service Stress (MPa)</label>
                          <input id="appliedStressMpa" type="number" min="0" step="0.5" className={inp}
                            value={inputs.appliedStressMpa} onChange={(e) => setNum("appliedStressMpa", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="memberLengthMm" className={lbl}>Member Length (mm)</label>
                          <input id="memberLengthMm" type="number" min="0" step="100" className={inp}
                            value={inputs.memberLengthMm} onChange={(e) => setNum("memberLengthMm", e.target.value)} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Modulus of Elasticity Ec</div>
              <div className="text-4xl font-bold text-primary my-1">{result.ecGpa.toFixed(2)} GPa</div>
              <div className="text-sm text-muted-foreground">
                {Math.round(result.ecKsi).toLocaleString("en-US")} ksi at f&apos;c = {result.fcMpa.toFixed(1)} MPa
              </div>
              <div className={`text-base font-bold mt-2 ${result.strengthClassColor}`}>{result.strengthClass}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Ec (GPa)</div>
                <div className="text-lg font-bold text-emerald-600">{result.ecGpa.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Modular Ratio n</div>
                <div className="text-lg font-bold text-amber-600">{result.modularRatio.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Rupture fr</div>
                <div className="text-lg font-bold text-red-600">{result.rupturousModulusMpa.toFixed(2)} MPa</div>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Selected Ec</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.ecGpa.toFixed(2)} GPa</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Code Equation Comparison (GPa)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(value: number) => `${value.toFixed(2)} GPa`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Selected equation
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Alternative codes
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" /> Strain, Shortening &amp; Aggregate Correction
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Elastic Strain at Service Stress</div>
                    <div className="text-base font-bold text-foreground">
                      {(result.strainAtStress * 1e6).toFixed(0)} µε
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Axial Shortening</div>
                    <div className="text-base font-bold text-amber-600">{result.deflectionIndexMm.toFixed(2)} mm</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Aggregate-Corrected Ec (EC2)</div>
                    <div className="text-base font-bold text-foreground">{result.aggregateAdjustedGpa.toFixed(2)} GPa</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Correction Factor</div>
                    <div className="text-base font-bold text-foreground">
                      ×{(AGGREGATES.find((a) => a.key === inputs.aggregate) ?? AGGREGATES[0]).ecFactor.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Code equations carry roughly ±20% scatter against measured values even for conventional mixes.
                      Where stiffness governs — long spans, prestress losses, vibration — test the actual mix per
                      ASTM C469 or EN 12390-13.
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
            <h2 className="text-2xl font-bold mb-3">Stiffness Is Not Strength</h2>
            <p className="mb-4">
              The elastic modulus of concrete measures how much it deforms under load, which is a different question from
              how much load it can carry before failing. Structural concrete typically falls between 25 and 40 GPa,
              roughly one-sixth to one-seventh the stiffness of steel. Codes predict it from compressive strength using a
              square-root relationship — ACI 318 gives Ec = 4700√f&apos;c in MPa, or 57000√f&apos;c in psi — and that
              exponent carries an important design consequence: doubling f&apos;c from 30 to 60 MPa raises stiffness by
              only about 41%. High-strength concrete is disproportionately strong relative to how stiff it is, which is
              precisely why deflection so often governs high-strength member design.
            </p>

            <h2 className="text-2xl font-bold mb-3">Four Equations, Four Different Answers</h2>
            <p className="mb-4">
              ACI 318's normalweight expression is the North American standard, with a density-dependent variant required
              for lightweight mixes. Eurocode 2 works from mean rather than characteristic strength, using
              Ecm = 22(fcm/10)^0.3 GPa with fcm = fck + 8, and typically returns slightly higher values at normal grades.
              The CEB-FIP Model Code uses a cube-root form. Differences of 10 to 15% between these are routine, which is
              rarely academic — that margin can decide whether a long-span floor passes its deflection check. Use the
              equation your governing code specifies rather than the one that gives the friendlier number.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Aggregate Dominates the Scatter</h2>
            <p className="mb-4">
              Coarse aggregate occupies 60 to 75% of concrete volume, and its own stiffness largely sets the composite
              modulus. Eurocode 2 quantifies this with correction factors relative to quartzite: basalt multiplies the
              predicted value by 1.2, limestone by 0.9, and sandstone by only 0.7. A sandstone mix can therefore be 40%
              less stiff than a basalt mix of identical compressive strength — a difference no strength-based equation
              can capture, and the main reason code predictions carry roughly ±20% scatter against measured values even
              for conventional mixes.
            </p>

            <h2 className="text-2xl font-bold mb-3">Where the Modulus Actually Gets Used</h2>
            <p>
              Three places, mostly. The modular ratio n = Es/Ec, typically 6 to 9, converts steel into equivalent concrete
              for transformed-section analysis and governs how service stresses distribute between the two materials.
              Deflection calculations use it directly. And prestressed design depends on it twice over, since elastic
              shortening at transfer and long-term creep losses both scale with concrete stiffness. That last case
              highlights a limitation worth remembering: sustained load causes creep, so the effective long-term modulus is
              the instantaneous value divided by one plus the creep coefficient — often halving the stiffness available for
              long-term checks. Where any of this governs the design, a measured value per ASTM C469 or EN 12390-13 on the
              actual mix is worth the testing cost.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/elastic-modulus-of-concrete-calculator" />
          <PopularCalculators exclude="/calculator/elastic-modulus-of-concrete-calculator" />
        </div>
      </div>
    </>
  );
}
