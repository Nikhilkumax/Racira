"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const UNITS = [
  { id: "pa", label: "Pascal (Pa)", toPa: 1 },
  { id: "kpa", label: "Kilopascal (kPa)", toPa: 1e3 },
  { id: "mpa", label: "Megapascal (MPa)", toPa: 1e6 },
  { id: "bar", label: "Bar", toPa: 1e5 },
  { id: "psi", label: "Pound per sq inch (psi)", toPa: 6894.757293168 },
  { id: "atm", label: "Atmosphere (atm)", toPa: 101325 },
  { id: "mmhg", label: "Millimeter of mercury (mmHg)", toPa: 133.322387415 },
];

interface Inputs {
  value: string;
  from: string;
  to: string;
  precision: string;
}

interface Result {
  valueOut: number;
  valuePa: number;
  outUnit: string;
  factor: number;
  values: { id: string; label: string; value: number }[];
}

function calculate(i: Inputs): Result {
  const v = Math.max(0, parseFloat(i.value) || 0);
  const from = UNITS.find(u => u.id === i.from) || UNITS[0];
  const to = UNITS.find(u => u.id === i.to) || UNITS[1];
  const pa = v * from.toPa;
  const out = pa / to.toPa;
  return {
    valueOut: out,
    valuePa: pa,
    outUnit: to.id,
    factor: from.toPa / to.toPa,
    values: UNITS.map(u => ({ id: u.id, label: u.label, value: pa / u.toPa })),
  };
}

const DEFAULTS: Inputs = { value: "32", from: "psi", to: "kpa", precision: "2" };

function validate(i: Inputs): string[] {
  const errors: string[] = [];
  const v = parseFloat(i.value);
  if (i.value.trim() === "" || isNaN(v)) errors.push("Enter a valid pressure value.");
  else if (v < 0) errors.push("Pressure cannot be negative.");
  return errors;
}

export default function PressureConverter() {
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

  const digits = Math.min(6, Math.max(0, parseInt(inputs.precision, 10) || 0));

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const fromLabel = (UNITS.find(u => u.id === inputs.from) || UNITS[0]).label;
  const toLabel = (UNITS.find(u => u.id === inputs.to) || UNITS[1]).label;

  const chartData = result.values
    .filter(u => ["kpa", "psi", "bar", "atm"].includes(u.id))
    .map((u, i) => ({ name: u.id.toUpperCase(), value: u.value, fill: i === 0 ? "hsl(var(--primary))" : ["#f59e0b", "#10b981", "#8b5cf6"][i - 1] }));

  const faqs = [
    { question: "How do I convert pressure between units?", answer: "Every pressure unit is a fixed multiple of the pascal. To convert, multiply the value by the 'from' unit's pascal factor, then divide by the 'to' unit's factor. One psi equals 6,894.757 Pa, and one atmosphere equals exactly 101,325 Pa." },
    { question: "What are the most common pressure units?", answer: "Pascals and kilopascals in SI contexts, bar in industry and meteorology, psi in US applications like tire pressure, atm for chemistry and diving, and mmHg (torr) for blood pressure and vacuum work." },
    { question: "Is 1 bar the same as 1 atmosphere?", answer: "Nearly but not exactly: 1 bar = 100,000 Pa, while 1 atm = 101,325 Pa. The difference is about 1.3%, which is why they are often used interchangeably in casual contexts but never in precise engineering." },
    { question: "Why does the same tire read differently in kPa and psi?", answer: "The physical pressure is identical — the number just changes units. A typical car tire at 32 psi reads 220.6 kPa or 2.206 bar. The converter shows every unit at once so you can compare figures from any source." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Pressure Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pressure Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Value</label>
                <input type="number" min={0} step="any" value={inputs.value} onChange={e => set("value")(e.target.value)} className={inp} placeholder="32" />
              </div>
              <div>
                <label className={lbl}>From unit</label>
                <select value={inputs.from} onChange={e => set("from")(e.target.value)} className={inp}>
                  {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>To unit</label>
              <select value={inputs.to} onChange={e => set("to")(e.target.value)} className={inp}>
                {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Output Options</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Decimal places (0–6)</label>
                        <select value={inputs.precision} onChange={e => set("precision")(e.target.value)} className={inp}>
                          {[0, 1, 2, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
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
            <p className="text-xs text-muted-foreground leading-relaxed">Converts between pascal, kilopascal, megapascal, bar, psi, atmosphere, and mmHg.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Converted Pressure</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.valueOut, digits)} {result.outUnit.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(parseFloat(inputs.value) || 0, digits)} {inputs.from.toUpperCase()} × {fmt(result.factor, 4)} = {fmt(result.valueOut, digits)} {result.outUnit.toUpperCase()}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pascal</span>
                <span className="font-extrabold text-foreground">{fmt(result.valuePa, digits)} Pa</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Kilopascal</span>
                <span className="font-extrabold text-foreground">{fmt(result.values.find(u => u.id === "kpa")!.value, digits)} kPa</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bar</span>
                <span className="font-extrabold text-foreground">{fmt(result.values.find(u => u.id === "bar")!.value, digits)} bar</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pounds per sq in</span>
                <span className="font-extrabold text-foreground">{fmt(result.values.find(u => u.id === "psi")!.value, digits)} psi</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.values.map((u, idx) => (
                    <tr key={u.id} className={`hover:bg-secondary/20 transition-colors ${u.id === result.outUnit ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${u.id === result.outUnit ? "text-amber-700" : "text-foreground"}`}>{u.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${u.id === result.outUnit ? "text-amber-700" : "text-foreground"}`}>{fmt(u.value, digits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Same Pressure, Different Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [fmt(Number(v), digits), ""]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-1">The same physical pressure expressed in kPa, psi, bar, and atm</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Conversion Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">From:</span><span className="font-semibold">{fmt(parseFloat(inputs.value) || 0, digits)} {fromLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">To:</span><span className="font-semibold">{fmt(result.valueOut, digits)} {toLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Conversion factor:</span><span className="font-semibold">×{fmt(result.factor, 4)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Base value:</span><span className="font-semibold">{fmt(result.valuePa, digits)} Pa</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Megapascal:</span><span className="font-semibold">{fmt(result.values.find(u => u.id === "mpa")!.value, 6)} MPa</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Atmosphere:</span><span className="font-semibold">{fmt(result.values.find(u => u.id === "atm")!.value, 4)} atm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">mmHg (torr):</span><span className="font-semibold">{fmt(result.values.find(u => u.id === "mmhg")!.value, digits)} mmHg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Decimal places:</span><span className="font-semibold">{digits}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Every Pressure Unit Is the Pascal</h2>
            <p>The pascal (one newton per square meter) is the SI unit of pressure, and every other unit is a fixed multiple of it. That single fact makes conversion mechanical: multiply by the source unit's factor, divide by the target's, and the number is converted. This <strong>pressure converter</strong> applies those exact factors.</p>
            <h2 className="text-2xl font-bold mb-3">From Tire Gauges to Blood Pressure</h2>
            <p>psi on a tire gauge, kPa on a weather report, mmHg on a blood pressure monitor, atm on a dive table — the same physical quantity appears in dozens of guises. Having all of them at once is what this converter is for: pick any two units and see the full table alongside.</p>
            <h2 className="text-2xl font-bold mb-3">Exact Factors, No Rounding Drift</h2>
            <p>1 psi = 6,894.757293 Pa and 1 atm = 101,325 Pa exactly. Because the converter carries the base value in pascals and only rounds for display, converting 32 psi to kPa and back returns 32 psi — no accumulated rounding error.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pressure-converter" />
          <PopularCalculators exclude="/calculator/pressure-converter" />
        </div>
      </div>
    </>
  );
}
