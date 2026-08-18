"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const G = 9.80665;

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

interface Inputs {
  force: string;
  area: string;
  density: string;
  depth: string;
}

interface Result {
  pressurePa: number;
  pressureKpa: number;
  pressureMpa: number;
  pressureBar: number;
  pressurePsi: number;
  pressureAtm: number;
  pressureMmhg: number;
  hydroPa: number;
  hydroKpa: number;
  hydroPsi: number;
  hydroBar: number;
  hydroAtm: number;
  hydroMmhg: number;
  forceN: number;
  areaM2: number;
  density: number;
  depth: number;
}

function calculate(i: Inputs): Result {
  const force = Math.max(0, parseFloat(i.force) || 0);
  const area = Math.max(0, parseFloat(i.area) || 0);
  const density = Math.max(0, parseFloat(i.density) || 0);
  const depth = Math.max(0, parseFloat(i.depth) || 0);
  const pa = area > 0 ? force / area : 0;
  const hydroPa = density > 0 && depth > 0 ? density * G * depth : 0;
  const toKpa = (v: number) => v / 1000;
  const toMpa = (v: number) => v / 1e6;
  const toBar = (v: number) => v / 1e5;
  const toPsi = (v: number) => v / 6894.757293168;
  const toAtm = (v: number) => v / 101325;
  const toMmhg = (v: number) => v / 133.322387415;
  return {
    pressurePa: pa,
    pressureKpa: toKpa(pa),
    pressureMpa: toMpa(pa),
    pressureBar: toBar(pa),
    pressurePsi: toPsi(pa),
    pressureAtm: toAtm(pa),
    pressureMmhg: toMmhg(pa),
    hydroPa,
    hydroKpa: toKpa(hydroPa),
    hydroPsi: toPsi(hydroPa),
    hydroBar: toBar(hydroPa),
    hydroAtm: toAtm(hydroPa),
    hydroMmhg: toMmhg(hydroPa),
    forceN: force,
    areaM2: area,
    density,
    depth,
  };
}

const DEFAULTS: Inputs = { force: "500", area: "0.25", density: "1000", depth: "10" };

function validate(i: Inputs): string[] {
  const errors: string[] = [];
  const force = parseFloat(i.force);
  const area = parseFloat(i.area);
  const density = parseFloat(i.density);
  const depth = parseFloat(i.depth);
  if (i.force.trim() === "" || isNaN(force)) errors.push("Enter a valid force in newtons.");
  else if (force < 0) errors.push("Force cannot be negative.");
  if (i.area.trim() === "" || isNaN(area)) errors.push("Enter a valid area in square meters.");
  else if (area <= 0) errors.push("Area must be greater than zero.");
  if (i.density.trim() !== "" && (isNaN(density) || density < 0)) errors.push("Fluid density must be zero or greater.");
  if (i.depth.trim() !== "" && (isNaN(depth) || depth < 0)) errors.push("Depth must be zero or greater.");
  return errors;
}

export default function PressureCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  useEffect(() => { setResult(calculate(inputs)); }, []);

  const errors = validate(inputs);
  const valid = errors.length === 0;
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));
  const calc = () => { if (valid) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const hasHydro = inputs.density.trim() !== "" && inputs.depth.trim() !== "" && (parseFloat(inputs.density) || 0) > 0 && (parseFloat(inputs.depth) || 0) > 0;

  const chartData = [
    { name: "kPa", value: result.pressureKpa, fill: "hsl(var(--primary))" },
    { name: "bar", value: result.pressureBar, fill: "#f59e0b" },
    { name: "psi", value: result.pressurePsi, fill: "#10b981" },
    { name: "atm", value: result.pressureAtm, fill: "#8b5cf6" },
  ];

  const tableRows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Pascal (Pa)", value: fmt(result.pressurePa, 0), highlight: true },
    { label: "Kilopascal (kPa)", value: fmt(result.pressureKpa) },
    { label: "Megapascal (MPa)", value: fmt(result.pressureMpa, 4) },
    { label: "Bar", value: fmt(result.pressureBar, 4) },
    { label: "Pounds per sq in (psi)", value: fmt(result.pressurePsi, 3) },
    { label: "Atmosphere (atm)", value: fmt(result.pressureAtm, 4) },
    { label: "Millimeters of mercury (mmHg)", value: fmt(result.pressureMmhg, 2) },
  ];
  if (hasHydro) {
    tableRows.push({ label: "Hydrostatic at depth (kPa)", value: fmt(result.hydroKpa, 2), highlight: true });
    tableRows.push({ label: "Hydrostatic (psi)", value: fmt(result.hydroPsi, 2) });
  }
  tableRows.push({ label: "Force ÷ Area check", value: `${fmt(result.forceN, 1)} N / ${fmt(result.areaM2, 3)} m² = ${fmt(result.pressurePa, 2)} Pa` });

  const faqs = [
    { question: "What is pressure?", answer: "Pressure is the force applied perpendicular to a surface divided by the area it acts on: P = F / A. The SI unit is the pascal (Pa), which is one newton per square meter. Atmospheric pressure at sea level is about 101,325 Pa (1 atm)." },
    { question: "What is hydrostatic pressure?", answer: "Hydrostatic pressure is the pressure exerted by a fluid at rest due to gravity, computed as P = ρ × g × h — fluid density times gravitational acceleration times depth. At a 10 m depth in fresh water it reaches roughly 98 kPa, close to one atmosphere." },
    { question: "What pressure units are most common?", answer: "Pascals (Pa) and kilopascals (kPa) in SI; bar in meteorology and industry; pounds per square inch (psi) in US applications such as tire pressure; atmospheres (atm) and millimeters of mercury (mmHg) in chemistry and medicine. One atm equals 101.325 kPa, 1.01325 bar, or 14.696 psi." },
    { question: "Why does pressure matter in engineering?", answer: "Pressure determines whether structures, pipes, and containers safely handle the forces applied to them. Knowing both the applied pressure (F/A) and any fluid column above (ρgh) lets engineers size materials, valves, and pumps correctly." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Pressure Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pressure Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Force (N)</label>
                <input type="number" min={0} step="any" value={inputs.force} onChange={e => set("force")(e.target.value)} className={inp} placeholder="500" />
              </div>
              <div>
                <label className={lbl}>Area (m²)</label>
                <input type="number" min={0} step="any" value={inputs.area} onChange={e => set("area")(e.target.value)} className={inp} placeholder="0.25" />
              </div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Hydrostatic Pressure (optional)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Fluid density (kg/m³)</label>
                        <input type="number" min={0} step="any" value={inputs.density} onChange={e => set("density")(e.target.value)} className={inp} placeholder="1000" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Depth (m)</label>
                        <input type="number" min={0} step="any" value={inputs.depth} onChange={e => set("depth")(e.target.value)} className={inp} placeholder="10" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">Uses P = ρ × g × h with g = 9.80665 m/s². Leave blank to skip.</p>
                  </div>
                </div>
              )}
            </div>
            {!valid && (
              <div className="space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{e}</p>)}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} disabled={!valid} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Pressure = force spread over area. Add a fluid density and depth to also see hydrostatic pressure.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Pressure (P = F/A)</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.pressurePa)} Pa</div>
              <div className="text-sm text-muted-foreground font-medium">from {fmt(result.forceN, 1)} N over {fmt(result.areaM2, 3)} m²</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Kilopascal</span>
                <span className="font-extrabold text-foreground">{fmt(result.pressureKpa)} kPa</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bar</span>
                <span className="font-extrabold text-foreground">{fmt(result.pressureBar, 4)} bar</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pounds per sq in</span>
                <span className="font-extrabold text-foreground">{fmt(result.pressurePsi, 3)} psi</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Atmosphere</span>
                <span className="font-extrabold text-foreground">{fmt(result.pressureAtm, 4)} atm</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Pressure in Common Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [fmt(Number(v), 3), ""]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-1">The same pressure expressed in kilopascals, bar, psi, and atmospheres</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Pressure Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Pascal (Pa):</span><span className="font-semibold">{fmt(result.pressurePa, 0)} Pa</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kilopascal (kPa):</span><span className="font-semibold">{fmt(result.pressureKpa)} kPa</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bar:</span><span className="font-semibold">{fmt(result.pressureBar, 4)} bar</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pounds per sq in:</span><span className="font-semibold">{fmt(result.pressurePsi, 3)} psi</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Atmosphere:</span><span className="font-semibold">{fmt(result.pressureAtm, 4)} atm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Millimeters of mercury:</span><span className="font-semibold">{fmt(result.pressureMmhg, 2)} mmHg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Force:</span><span className="font-semibold">{fmt(result.forceN, 1)} N</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Area:</span><span className="font-semibold">{fmt(result.areaM2, 3)} m²</span></div>
                {hasHydro && <div className="flex justify-between"><span className="text-muted-foreground">Hydrostatic:</span><span className="font-semibold">{fmt(result.hydroKpa)} kPa</span></div>}
                {hasHydro && <div className="flex justify-between"><span className="text-muted-foreground">Hydrostatic:</span><span className="font-semibold">{fmt(result.hydroPsi, 2)} psi</span></div>}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Force, Area, and the Resulting Pressure</h2>
            <p>Pressure answers a simple question: how tightly is force concentrated on a surface? A 500 N force on a 0.25 m² plate produces 2,000 Pa — the same force spread over a larger area produces less pressure. This <strong>pressure calculator</strong> applies P = F / A and instantly converts the result into the units used across engineering, weather, and medicine.</p>
            <h2 className="text-2xl font-bold mb-3">Adding the Weight of a Fluid Column</h2>
            <p>Underwater, a second source of pressure appears: the weight of the fluid above. Hydrostatic pressure grows linearly with depth — P = ρgh — which is why a 10 m dive adds almost exactly one atmosphere. The optional fluid inputs fold this calculation in alongside the force-based result.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Pressure Across Units</h2>
            <p>One pressure, many languages: 2,000 Pa is 2 kPa, 0.02 bar, 0.29 psi, or roughly 0.0197 atm. The conversion table shows all of them side by side so you can compare your result with published figures regardless of which unit the source uses.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pressure-calculator" />
          <PopularCalculators exclude="/calculator/pressure-calculator" />
        </div>
      </div>
    </>
  );
}
