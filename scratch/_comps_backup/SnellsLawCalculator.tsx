"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface Medium {
  id: string;
  name: string;
  n: number;
}

interface SnellInputs {
  angle: string;
  n1: string;
  n2: string;
  customN1: string;
  customN2: string;
}

interface SnellResult {
  theta1: number; // degrees
  n1: number;
  n2: number;
  theta2: number | null; // degrees, null when TIR
  sinTheta1: number;
  sinTheta2: number | null;
  criticalAngle: number | null; // degrees, only when n1 > n2
  tir: boolean;
}

// ── 2. Common media ─────────────────────────────────────────────────────────
const MEDIA: Medium[] = [
  { id: "air", name: "Air", n: 1.0003 },
  { id: "vacuum", name: "Vacuum", n: 1 },
  { id: "water", name: "Water", n: 1.333 },
  { id: "glass", name: "Glass (crown)", n: 1.52 },
  { id: "acrylic", name: "Acrylic", n: 1.49 },
  { id: "diamond", name: "Diamond", n: 2.417 },
  { id: "custom", name: "Custom…", n: 0 },
];

const nOf = (inputs: SnellInputs, key: "n1" | "n2"): number => {
  const id = inputs[key];
  const m = MEDIA.find((x) => x.id === id);
  if (!m) return 1;
  if (m.id !== "custom") return m.n;
  const custom = key === "n1" ? inputs.customN1 : inputs.customN2;
  return parseFloat(custom) || 1;
};

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: SnellInputs = {
  angle: "45",
  n1: "glass",
  n2: "water",
  customN1: "1.52",
  customN2: "1.33",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: SnellInputs): SnellResult {
  const theta1 = parseFloat(inputs.angle);
  const n1 = nOf(inputs, "n1");
  const n2 = nOf(inputs, "n2");
  const sin1 = Math.sin((theta1 * Math.PI) / 180);
  const ratio = (n1 * sin1) / n2;
  const tir = ratio > 1 || !isFinite(ratio);
  const theta2 = tir ? null : (Math.asin(Math.min(1, Math.max(-1, ratio))) * 180) / Math.PI;
  const criticalAngle = n1 > n2 ? (Math.asin(Math.min(1, n2 / n1)) * 180) / Math.PI : null;
  return {
    theta1,
    n1,
    n2,
    theta2,
    sinTheta1: sin1,
    sinTheta2: tir ? null : ratio,
    criticalAngle,
    tir,
  };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const SnellsLawCalculator = () => {
  const [inputs, setInputs] = useState<SnellInputs>(DEFAULTS);
  const [result, setResult] = useState<SnellResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<SnellInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const angleParsed = parseFloat(inputs.angle);
  const invalid = isNaN(angleParsed) || angleParsed < 0 || angleParsed > 90 || inputs.angle.trim() === "";
  const invalidCustom =
    (inputs.n1 === "custom" && (isNaN(parseFloat(inputs.customN1)) || parseFloat(inputs.customN1) < 1)) ||
    (inputs.n2 === "custom" && (isNaN(parseFloat(inputs.customN2)) || parseFloat(inputs.customN2) < 1));

  const run = () => {
    if (invalid || invalidCustom) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const fmt = (n: number | null, dec = 2) => (n === null ? "—" : n.toFixed(dec));

  const n1Name = MEDIA.find((m) => m.id === inputs.n1)?.name || "—";
  const n2Name = MEDIA.find((m) => m.id === inputs.n2)?.name || "—";

  const chartData = [
    { name: "Incident", value: result.theta1, color: "hsl(var(--primary))" },
    { name: "Refracted", value: result.tir ? 0 : (result.theta2 ?? 0), color: result.tir ? "#ef4444" : "#10b981" },
    { name: "Critical", value: result.criticalAngle ?? 0, color: "#f59e0b" },
  ];

  const faqs = [
    { question: "What is Snell's law?", answer: "Snell's law, n₁·sin(θ₁) = n₂·sin(θ₂), relates the angles of incidence and refraction to the refractive indices of two media. It governs how light bends when crossing the boundary between materials." },
    { question: "What is total internal reflection?", answer: "When light travels from a higher-index medium into a lower-index one at a sufficiently large angle, the refracted ray cannot emerge and the light reflects entirely back into the first medium. The threshold angle is the critical angle: θc = sin⁻¹(n₂/n₁)." },
    { question: "Why does a straw look bent in water?", answer: "Light from the submerged portion of the straw refracts as it exits the water into air, so the eye traces the light back along a straight line and sees the straw displaced. Snell's law predicts exactly how much bending occurs." },
    { question: "What is a typical glass refractive index?", answer: "Crown glass is about 1.52, flint glass ranges from 1.6 to 1.7, and diamond is 2.417. Water is 1.333 and air is 1.0003, nearly identical to vacuum." },
    { question: "Can the refracted angle exceed 90 degrees?", answer: "No. When Snell's law would require sin(θ₂) > 1, no refracted ray exists — the result is total internal reflection instead. Our calculator detects this automatically and reports the critical angle." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Snell's Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Snell's Law Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="snell-angle" className="text-sm font-medium text-foreground mb-1">Incident Angle</label>
                <div className="relative">
                  <input
                    id="snell-angle"
                    type="number"
                    min="0"
                    max="90"
                    step="any"
                    value={inputs.angle}
                    onChange={(e) => set({ angle: e.target.value })}
                    className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-8 ${invalid ? "border-red-500" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">°</span>
                </div>
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Angle must be 0–90°</p>}
              </div>
              <div className="flex flex-col">
                <label htmlFor="snell-n1" className="text-sm font-medium text-foreground mb-1">Incident Medium</label>
                <select
                  id="snell-n1"
                  value={inputs.n1}
                  onChange={(e) => set({ n1: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {MEDIA.map((m) => <option key={m.id} value={m.id}>{m.name} (n = {m.n})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="snell-n2" className="text-sm font-medium text-foreground mb-1">Refracting Medium</label>
                <select
                  id="snell-n2"
                  value={inputs.n2}
                  onChange={(e) => set({ n2: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {MEDIA.map((m) => <option key={m.id} value={m.id}>{m.name} (n = {m.n})</option>)}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <div className="p-3 rounded-lg bg-secondary/20 border border-border mt-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Custom Refractive Indices</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label htmlFor="snell-cn1" className="text-sm font-medium text-foreground mb-1">n₁ (Incident)</label>
                    <input
                      id="snell-cn1"
                      type="number"
                      min="1"
                      step="0.001"
                      value={inputs.customN1}
                      onChange={(e) => set({ customN1: e.target.value })}
                      disabled={inputs.n1 !== "custom"}
                      className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 ${inputs.n1 === "custom" && invalidCustom ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="snell-cn2" className="text-sm font-medium text-foreground mb-1">n₂ (Refracting)</label>
                    <input
                      id="snell-cn2"
                      type="number"
                      min="1"
                      step="0.001"
                      value={inputs.customN2}
                      onChange={(e) => set({ customN2: e.target.value })}
                      disabled={inputs.n2 !== "custom"}
                      className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 ${inputs.n2 === "custom" && invalidCustom ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">Values apply when the medium above is set to Custom…</p>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={run}
                disabled={invalid || invalidCustom}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex flex-col gap-4 print-section">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              {result.tir ? (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Internal Reflection</div>
                  <div className="text-3xl font-bold text-red-500 mb-1 tracking-tight">No Refracted Ray</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    sin(θ₂) would exceed 1 — light reflects back into the {n1Name}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Refracted Angle θ₂</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.theta2)}°</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {n1Name} (n = {result.n1.toFixed(3)}) → {n2Name} (n = {result.n2.toFixed(3)})
                  </div>
                </>
              )}
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Incident θ₁</span>
                <span className="font-extrabold text-foreground">{fmt(result.theta1)}°</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Critical Angle</span>
                <span className={`font-extrabold ${result.criticalAngle !== null ? "text-emerald-600" : "text-foreground"}`}>
                  {result.criticalAngle !== null ? `${fmt(result.criticalAngle)}°` : "N/A"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">sin θ₁ / sin θ₂</span>
                <span className="font-extrabold text-primary">{fmt(result.sinTheta1)} / {fmt(result.sinTheta2)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">Refracted Angle θ₂</td>
                    <td className="p-2.5 pr-3 text-right font-bold text-amber-700">{result.tir ? "TIR (no refraction)" : `${fmt(result.theta2)}°`}</td>
                  </tr>
                  {[
                    { label: "Incident Angle θ₁", value: `${fmt(result.theta1)}°` },
                    { label: "Refractive Index n₁", value: result.n1.toFixed(3) },
                    { label: "Refractive Index n₂", value: result.n2.toFixed(3) },
                    { label: "sin θ₁", value: fmt(result.sinTheta1, 4) },
                    { label: "sin θ₂", value: result.tir ? "> 1 (impossible)" : fmt(result.sinTheta2, 4) },
                    { label: "Critical Angle θc", value: result.criticalAngle !== null ? `${fmt(result.criticalAngle)}°` : "No critical angle" },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Angles in Degrees</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis domain={[0, 90]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={34} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}°`, "Angle"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={70}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                {result.tir ? "Red = refraction impossible (TIR)" : "Green = refracted ray; amber = critical angle reference"}
              </p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Incident Angle", value: `${fmt(result.theta1)}°` },
                  { label: "Refracted Angle", value: result.tir ? "TIR" : `${fmt(result.theta2)}°` },
                  { label: "n₁ / n₂", value: `${result.n1.toFixed(3)} / ${result.n2.toFixed(3)}` },
                  { label: "n₁·sin θ₁", value: fmt(result.n1 * result.sinTheta1, 4) },
                  { label: "Critical Angle", value: result.criticalAngle !== null ? `${fmt(result.criticalAngle)}°` : "None" },
                  { label: "Direction", value: result.n2 > result.n1 ? "Toward normal" : "Away from normal" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Physics of Refraction</h2>
            <p>When a light ray crosses the boundary between two transparent media, its speed changes and the ray bends. Snell's law, named for the Dutch mathematician Willebrord Snellius, states that the product of the refractive index and the sine of the angle to the normal is conserved across the boundary: n₁·sin(θ₁) = n₂·sin(θ₂). The refractive index itself is the ratio of the speed of light in vacuum to its speed in the medium, so denser optical materials like glass and diamond slow light more and bend rays more sharply. This single equation explains lenses, prisms, fiber optics, rainbows, mirages, and the apparent displacement of objects seen through water.</p>
            <p>The direction of bending depends on the index change. Entering a higher-index medium, the ray bends toward the normal — light going from air into water at 45° emerges at roughly 32°. Entering a lower-index medium, it bends away from the normal, and beyond the critical angle it cannot emerge at all. The critical angle, θc = sin⁻¹(n₂/n₁), exists only when light travels from a higher-index into a lower-index medium, and it is the principle behind fiber-optic cables, which trap light inside a glass core through repeated total internal reflection.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Calculator</h2>
            <p>Choose any two common media — air, water, crown glass, acrylic, or diamond — or specify custom refractive indices, and enter the incident angle. The calculator applies Snell's law, reports the refracted angle in degrees, and automatically flags total internal reflection when the geometry makes refraction impossible, alongside the critical angle for your media pair. This makes it a practical reference for optics students verifying homework, engineers designing lenses and light pipes, and anyone curious about how light behaves at the boundary between materials.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/snells-law-calculator" />
          <PopularCalculators exclude="/calculator/snells-law-calculator" />
        </div>
      </div>
    </>
  );
};

export default SnellsLawCalculator;
