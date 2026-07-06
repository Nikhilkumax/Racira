"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const G = 6.674e-11;
const EARTH_MASS   = 5.972e24;  // kg
const SUN_MASS     = 1.989e30;  // kg
const EARTH_RADIUS = 6.371e6;   // m
const SUN_RADIUS   = 6.957e8;   // m

// ─── Unit Conversion Maps ─────────────────────────────────────────────────────
const MASS_TO_KG: Record<string, number> = {
  kg:       1,
  t:        1000,
  oz:       0.0283495,
  lb:       0.453592,
  st:       6.35029,
  "US ton": 907.185,
  "long ton": 1016.05,
  Earths:   EARTH_MASS,
  Suns:     SUN_MASS,
};

const RADIUS_TO_M: Record<string, number> = {
  m:    1,
  km:   1000,
  yd:   0.9144,
  mi:   1609.344,
  "R⊕": EARTH_RADIUS,
  "R☉": SUN_RADIUS,
};

const VEL_FROM_MS: Record<string, number> = {
  "m/s":   1,
  "km/h":  3.6,
  "mph":   2.23694,
  "km/s":  0.001,
  "mi/s":  0.000621371,
  "c":     1 / 299792458,
};

const fmt = (n: number, d = 4) => {
  if (Math.abs(n) < 1e-6 || Math.abs(n) > 1e12) return n.toExponential(4);
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });
};

// ─── Component ────────────────────────────────────────────────────────────────
const EscapeVelocityCalculator = () => {
  const [massVal,   setMassVal]   = useState("1");
  const [massUnit,  setMassUnit]  = useState("Earths");
  const [radVal,    setRadVal]    = useState("1");
  const [radUnit,   setRadUnit]   = useState("R⊕");
  const [v1Unit,    setV1Unit]    = useState("km/s");
  const [veUnit,    setVeUnit]    = useState("km/s");
  const [result,    setResult]    = useState<any>(null);

  const calculate = (
    mv = massVal, mu = massUnit,
    rv = radVal,  ru = radUnit,
    v1u = v1Unit, veu = veUnit
  ) => {
    const M_kg = (parseFloat(mv) || 0) * MASS_TO_KG[mu];
    const R_m  = (parseFloat(rv) || 0) * RADIUS_TO_M[ru];
    if (M_kg <= 0 || R_m <= 0) return;

    const ve_ms  = Math.sqrt(2 * G * M_kg / R_m);   // escape velocity in m/s
    const v1_ms  = ve_ms / Math.sqrt(2);             // first cosmic velocity in m/s

    const ve_out = ve_ms * VEL_FROM_MS[veu];
    const v1_out = v1_ms * VEL_FROM_MS[v1u];

    const gSurface = G * M_kg / (R_m * R_m);

    // Chart: escape velocity in km/s for well-known bodies
    const bodies = [
      { name: "Moon",    ve: Math.sqrt(2 * G * 7.342e22 / 1.737e6) / 1000 },
      { name: "Mars",    ve: Math.sqrt(2 * G * 6.417e23 / 3.390e6) / 1000 },
      { name: "Earth",   ve: Math.sqrt(2 * G * EARTH_MASS / EARTH_RADIUS) / 1000 },
      { name: "Venus",   ve: Math.sqrt(2 * G * 4.867e24 / 6.052e6) / 1000 },
      { name: "Saturn",  ve: Math.sqrt(2 * G * 5.683e26 / 5.823e7) / 1000 },
      { name: "Jupiter", ve: Math.sqrt(2 * G * 1.898e27 / 6.991e7) / 1000 },
      { name: "You",     ve: parseFloat((ve_ms / 1000).toFixed(2)) },
    ];

    setResult({
      M_kg, R_m, ve_ms, v1_ms, ve_out, v1_out,
      gSurface, bodies, veu, v1u,
    });
  };

  useEffect(() => {
    calculate("1", "Earths", "1", "R⊕", "km/s", "km/s");
  }, []);

  const reset = () => {
    setMassVal("1");
    setMassUnit("Earths");
    setRadVal("1");
    setRadUnit("R⊕");
    setV1Unit("km/s");
    setVeUnit("km/s");
    calculate("1", "Earths", "1", "R⊕", "km/s", "km/s");
  };

  const faqs = [
    {
      question: "What is escape velocity?",
      answer: "Escape velocity is the minimum speed needed to escape a celestial body's gravitational field without further propulsion. Derived by equating kinetic energy to gravitational PE: ½mv² = GMm/R, giving Vₑ = √(2GM/R). For Earth: 11.186 km/s (≈ 40,270 km/h).",
    },
    {
      question: "What is the First Cosmic Velocity?",
      answer: "The First Cosmic Velocity (V₁) is the minimum orbital speed needed to maintain a circular orbit just above a body's surface. V₁ = √(GM/R) = Vₑ / √2. For Earth: ~7.91 km/s. An object launched horizontally at this speed enters low orbit instead of falling back. It is exactly √2 times slower than escape velocity.",
    },
    {
      question: "Does the escaping object's mass matter?",
      answer: "No — escape velocity is independent of the escaping object's mass. Both kinetic energy (½mv²) and gravitational PE (GMm/R) are proportional to m, which cancels out. A feather and a spacecraft have identical escape velocities from the same point.",
    },
    {
      question: "Why can rockets escape at less than 11.2 km/s?",
      answer: "Rockets provide sustained thrust over many minutes rather than a single instantaneous impulse. The escape velocity formula assumes one burst. A rocket burning fuel continuously can escape at any speed — it only needs enough total delta-v (impulse per unit mass) to overcome gravitational potential energy, regardless of time taken.",
    },
    {
      question: "What is the relationship between escape and orbital velocity?",
      answer: "Vₑ = √2 × V₁ (≈ 1.4142 × orbital velocity). Both share the same √(GM/R) term. To escape, you need √2 more speed than to orbit. The extra factor comes from needing twice the kinetic energy to break free versus just staying in orbit.",
    },
    {
      question: "What happens when escape velocity equals the speed of light?",
      answer: "When Vₑ = c, the Schwarzschild radius R_s = 2GM/c² is reached — the event horizon of a black hole. For Earth compressed to a black hole: R_s ≈ 8.87 mm. For the Sun: R_s ≈ 2.95 km. Inside this radius, nothing — not even light — can escape.",
    },
  ];

  // ─── Select styling helper ────────────────────────────────────────────────
  const selClass = "h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Escape Velocity Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Escape Velocity Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start max-w-[1200px]">

          {/* ── Inputs ────────────────────────────────────────────────────── */}
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">

            {/* Mass */}
            <div>
              <label className="text-base font-medium block mb-1.5">Mass (M)</label>
              <div className="flex gap-2">
                <input
                  type="number" value={massVal} min="0" step="any"
                  onChange={(e) => setMassVal(e.target.value)}
                  className="h-10 flex-1 px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="1"
                />
                <select
                  value={massUnit}
                  onChange={(e) => setMassUnit(e.target.value)}
                  className={selClass}
                >
                  {Object.keys(MASS_TO_KG).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ {(parseFloat(massVal) || 0) * MASS_TO_KG[massUnit] < 1e6
                  ? fmt((parseFloat(massVal) || 0) * MASS_TO_KG[massUnit], 3)
                  : ((parseFloat(massVal) || 0) * MASS_TO_KG[massUnit]).toExponential(3)} kg
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="text-base font-medium block mb-1.5">Radius (R)</label>
              <div className="flex gap-2">
                <input
                  type="number" value={radVal} min="0" step="any"
                  onChange={(e) => setRadVal(e.target.value)}
                  className="h-10 flex-1 px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="1"
                />
                <select
                  value={radUnit}
                  onChange={(e) => setRadUnit(e.target.value)}
                  className={selClass}
                >
                  {Object.keys(RADIUS_TO_M).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ {((parseFloat(radVal) || 0) * RADIUS_TO_M[radUnit]).toExponential(3)} m
              </div>
            </div>

            {/* First Cosmic Velocity output */}
            <div>
              <label className="text-base font-medium block mb-1.5">
                First Cosmic Velocity (V₁) — read‑only
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={result ? fmt(result.v1_out) : "—"}
                  className="h-10 flex-1 px-3 text-lg rounded-md border border-input bg-muted/40 text-primary font-bold outline-none cursor-not-allowed"
                />
                <select
                  value={v1Unit}
                  onChange={(e) => setV1Unit(e.target.value)}
                  className={selClass}
                >
                  {Object.keys(VEL_FROM_MS).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Escape Velocity output */}
            <div>
              <label className="text-base font-medium block mb-1.5">
                Escape Velocity (Vₑ) — read‑only
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={result ? fmt(result.ve_out) : "—"}
                  className="h-10 flex-1 px-3 text-lg rounded-md border border-input bg-muted/40 text-primary font-bold outline-none cursor-not-allowed"
                />
                <select
                  value={veUnit}
                  onChange={(e) => setVeUnit(e.target.value)}
                  className={selClass}
                >
                  {Object.keys(VEL_FROM_MS).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => calculate()}
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors"
              >Calculate</button>
              <button
                onClick={reset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Results ───────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                  Escape Velocity — Vₑ = √(2GM/R)
                </div>
                <div className="text-4xl font-bold text-primary">
                  {fmt(result.ve_out)} <span className="text-xl">{veUnit}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  V₁ = {fmt(result.v1_out)} {v1Unit} (first cosmic) &nbsp;•&nbsp; Vₑ = V₁ × √2
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Velocity Conversions</h3>
                <table className="w-full text-base"><tbody>
                  {(["m/s","km/h","mph","km/s","mi/s","c"] as const).map((u) => (
                    <tr key={u} className="border-b last:border-0">
                      <td className="py-1.5 text-muted-foreground">
                        Vₑ in {u}
                      </td>
                      <td className="text-right font-medium font-mono">
                        {fmt(result.ve_ms * VEL_FROM_MS[u])}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b">
                    <td className="py-1.5 text-muted-foreground">Surface gravity (g)</td>
                    <td className="text-right font-medium">{fmt(result.gSurface, 3)} m/s²</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-muted-foreground">Vₑ / V₁ ratio</td>
                    <td className="text-right font-medium">√2 ≈ 1.41421</td>
                  </tr>
                </tbody></table>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Escape Velocity vs Solar System Bodies (km/s)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={result.bodies}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: 55, bottom: 5 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} km/s`} />
                    <Bar dataKey="ve" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Mass (M)",          value: `${(parseFloat(massVal)||0)} ${massUnit}` },
                    { label: "Radius (R)",         value: `${(parseFloat(radVal)||0)} ${radUnit}` },
                    { label: "First Cosmic (V₁)", value: `${fmt(result.v1_out)} ${v1Unit}` },
                    { label: "Escape Velocity (Vₑ)", value: `${fmt(result.ve_out)} ${veUnit}`, border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        {/* ── Article + FAQ ─────────────────────────────────────────────────── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Escape Velocity Calculator?</h2>
            <p>
              This escape velocity calculator computes two fundamental cosmic speeds: the <strong>First Cosmic Velocity (V₁)</strong> — the minimum speed to orbit just above a body{"'"}s surface — and the <strong>Escape Velocity (Vₑ)</strong> — the minimum speed to leave the body{"'"}s gravitational field entirely. Both are calculated from mass and radius using the universal law of gravitation. You can express mass in anything from kilograms to Earth masses and radius from meters to solar radii, with output in six velocity units including fractions of the speed of light.
            </p>
            <h2 className="text-2xl font-bold mb-3">Formulas</h2>
            <p>
              <strong>Escape Velocity:</strong> Vₑ = √(2GM / R)<br />
              <strong>First Cosmic Velocity:</strong> V₁ = √(GM / R) = Vₑ / √2<br />
              G = 6.674 × 10⁻¹¹ N·m²/kg² (gravitational constant). For Earth (M = 1 M⊕, R = 1 R⊕): Vₑ ≈ 11.186 km/s, V₁ ≈ 7.91 km/s.
            </p>
            <h2 className="text-2xl font-bold mb-3">First Cosmic vs Escape Velocity</h2>
            <p>
              V₁ is the speed at which centripetal acceleration exactly equals gravitational acceleration at the surface: g = V₁² / R. At this speed, an object launched horizontally enters a circular orbit. Vₑ = √2 × V₁ — you need 41% more speed to escape entirely than to simply orbit. The ISS orbits at ~7.66 km/s, close to V₁ for its altitude.
            </p>
            <h2 className="text-2xl font-bold mb-3">Escape Velocity Across the Solar System</h2>
            <p>
              Moon: 2.38 km/s (easy to escape — explains its lack of atmosphere). Mars: 5.03 km/s. Earth: 11.19 km/s. Saturn: 35.5 km/s. Jupiter: 59.5 km/s. Sun: 617.5 km/s. These values assume launch from the surface. Launching from orbit adds the orbital velocity to the effective escape budget.
            </p>
            <h2 className="text-2xl font-bold mb-3">Atmospheres and Escape Velocity</h2>
            <p>
              A planet retains an atmosphere only if escape velocity significantly exceeds the root-mean-square thermal speed of gas molecules: v_rms = √(3kT/m). Earth retains N₂ and O₂ easily (v_rms ~ 500 m/s vs 11.2 km/s) but loses hydrogen slowly over geological time. The Moon (2.38 km/s) cannot retain any atmosphere. Titan (Saturn{"'"}s moon, 2.64 km/s) retains a thick N₂ atmosphere because it is very cold.
            </p>
            <h2 className="text-2xl font-bold mb-3">Black Holes and the Schwarzschild Radius</h2>
            <p>
              A black hole forms when a body is compressed until Vₑ = c (speed of light). The critical radius is the Schwarzschild radius: R_s = 2GM/c². Plugging c = 299,792,458 m/s: for Earth, R_s ≈ 8.87 mm; for the Sun, R_s ≈ 2.95 km. At and inside R_s, not even light can escape — the event horizon. You can explore this using the calculator by setting the velocity output to {"'"}c{"'"} and adjusting mass/radius until Vₑ approaches 1 c.
            </p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/escape-velocity-calculator" />
          <PopularCalculators exclude="/calculator/escape-velocity-calculator" />
        </div>
      </div>
    </>
  );
};

export default EscapeVelocityCalculator;
