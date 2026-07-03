"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const OhmsLawCalculator = () => {
  const DEFAULTS = { voltage: "12", resistance: "4", mode: "current" };
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [resistance, setResistance] = useState(DEFAULTS.resistance);
  const [current, setCurrent] = useState("3");
  const [mode, setMode] = useState<"current" | "voltage" | "resistance">(DEFAULTS.mode as "current");
  const [result, setResult] = useState<any>(null);

  const calculate = (vV = voltage, rV = resistance, iV = current, mV: string = mode) => {
    const V = parseFloat(vV), R = parseFloat(rV), I = parseFloat(iV);
    let calcV = V, calcI = I, calcR = R;

    if (mV === "current") {
      if (isNaN(V) || isNaN(R) || R === 0) return;
      calcI = V / R;
    } else if (mV === "voltage") {
      if (isNaN(I) || isNaN(R)) return;
      calcV = I * R;
    } else {
      if (isNaN(V) || isNaN(I) || I === 0) return;
      calcR = V / I;
    }

    const power = calcV * calcI;
    const chartData = [
      { name: "Voltage (V)", value: parseFloat(calcV.toFixed(4)) },
      { name: "Current (A)", value: parseFloat(calcI.toFixed(4)) },
      { name: "Resistance (Ω)", value: parseFloat(calcR.toFixed(4)) },
      { name: "Power (W)", value: parseFloat(power.toFixed(4)) },
    ];

    setResult({
      primary: mV === "current" ? `${calcI.toFixed(4)} A` : mV === "voltage" ? `${calcV.toFixed(4)} V` : `${calcR.toFixed(4)} Ω`,
      subtitle: `V = ${calcV.toFixed(3)}V, I = ${calcI.toFixed(3)}A, R = ${calcR.toFixed(3)}Ω`,
      rows: [
        { label: "Voltage (V)", value: `${calcV.toFixed(4)} V` },
        { label: "Current (I)", value: `${calcI.toFixed(4)} A` },
        { label: "Resistance (R)", value: `${calcR.toFixed(4)} Ω` },
        { label: "Power (P = V×I)", value: `${power.toFixed(4)} W` },
        { label: "Power (P = I²R)", value: `${(calcI * calcI * calcR).toFixed(4)} W` },
        { label: "Power (P = V²/R)", value: `${(calcV * calcV / calcR).toFixed(4)} W` },
        { label: "Ohm's Law check (V=IR)", value: `${(calcI * calcR).toFixed(4)} V ✓` },
      ],
      chartData,
      summary: [
        { label: "Voltage", value: `${calcV.toFixed(4)} V` },
        { label: "Current", value: `${calcI.toFixed(4)} A` },
        { label: "Resistance", value: `${calcR.toFixed(4)} Ω` },
        { label: "Power", value: `${power.toFixed(4)} W`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setVoltage(DEFAULTS.voltage); setResistance(DEFAULTS.resistance); setCurrent("3"); setMode("current"); calculate(DEFAULTS.voltage, DEFAULTS.resistance, "3", "current"); };

  const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];

  const faqs = [
    { question: "What is Ohm's Law?", answer: "Ohm's Law states that the current through a conductor is directly proportional to the voltage across it: V = I × R. George Ohm published this relationship in 1827." },
    { question: "What is the formula for power in a circuit?", answer: "P = V × I = I² × R = V² / R. All three forms are equivalent by substituting Ohm's Law. Power is measured in watts (W)." },
    { question: "What are the units in Ohm's Law?", answer: "Voltage (V) in volts, Current (I) in amperes (amps), Resistance (R) in ohms (Ω). By Ohm's Law: 1 Ω = 1 V/A." },
    { question: "Does Ohm's Law apply to all materials?", answer: "Ohm's Law applies to ohmic conductors where resistance is constant (metals, resistors). Non-ohmic devices like diodes, LEDs, and transistors have non-linear V-I relationships." },
    { question: "How do I calculate total resistance in series and parallel?", answer: "Series: R_total = R1 + R2 + R3. Parallel: 1/R_total = 1/R1 + 1/R2 + 1/R3. For two resistors in parallel: R_total = (R1 × R2) / (R1 + R2)." },
    { question: "What is the difference between AC and DC in Ohm's Law?", answer: "For DC circuits, Ohm's Law applies directly. For AC circuits, resistance is replaced by impedance (Z) which includes capacitive and inductive reactance. V = I × Z." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Ohm's Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ohm&apos;s Law Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Solve For</label>
              <div className="grid grid-cols-3 gap-2">
                {[["current", "Current (I)"], ["voltage", "Voltage (V)"], ["resistance", "Resistance (R)"]].map(([v, l]) => (
                  <button key={v} onClick={() => setMode(v as "current" | "voltage" | "resistance")}
                    className={`h-10 rounded-md border text-xs font-medium transition-colors ${mode === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {mode !== "voltage" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Voltage (V)</label>
                <div className="relative">
                  <input type="number" value={voltage} onChange={e => setVoltage(e.target.value)}
                    className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="12" step="any" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">V</span>
                </div>
              </div>
            )}
            {mode !== "current" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Current (I)</label>
                <div className="relative">
                  <input type="number" value={current} onChange={e => setCurrent(e.target.value)}
                    className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="3" step="any" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">A</span>
                </div>
              </div>
            )}
            {mode !== "resistance" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Resistance (R)</label>
                <div className="relative">
                  <input type="number" value={resistance} onChange={e => setResistance(e.target.value)}
                    className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="4" step="any" min="0.001" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Ω</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{mode === "current" ? "Current" : mode === "voltage" ? "Voltage" : "Resistance"}</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Values (V = I × R)</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Circuit Values Overview</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }: any) => `${name}: ${value}`}>
                        {result.chartData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Ohm&apos;s Law?</h2>
            <p>Ohm&apos;s Law is the fundamental relationship in electrical circuit analysis: the voltage across a conductor equals the current flowing through it multiplied by its resistance (V = I × R). Published by German physicist Georg Simon Ohm in 1827, this simple equation underpins all of electrical engineering and electronics. This calculator solves for any one of the three variables — voltage, current, or resistance — given the other two, and also computes power using the three equivalent power formulas.</p>
            <p>Pre-filled with 12V and 4Ω (a common 12V automotive circuit), the calculator immediately shows that 3 amperes of current flow and 36 watts of power are consumed — typical for a small automotive accessory.</p>
            <h2>Ohm&apos;s Law Formula and Variations</h2>
            <p><strong>V = I × R</strong> (Voltage = Current × Resistance)</p>
            <p><strong>I = V / R</strong> (Current = Voltage ÷ Resistance)</p>
            <p><strong>R = V / I</strong> (Resistance = Voltage ÷ Current)</p>
            <p>Power equations: <strong>P = V × I = I² × R = V² / R</strong>. All three power forms are mathematically identical — use whichever two quantities you know.</p>
            <h2>The Ohm&apos;s Law Triangle</h2>
            <p>A memory aid: draw a triangle with V at the top, I at bottom-left, R at bottom-right. Cover the quantity you want to find: covering V reveals I × R. Covering I reveals V/R. Covering R reveals V/I. This triangle works the same way for the power triangle: P at top, I at bottom-left, V at bottom-right.</p>
            <h2>Series and Parallel Circuits</h2>
            <p><strong>Series:</strong> Resistors in series add directly: R_total = R1 + R2 + R3. Current is the same through all components; voltage divides proportionally. <strong>Parallel:</strong> 1/R_total = 1/R1 + 1/R2 + 1/R3. Voltage is the same across all branches; current divides inversely with resistance. For two resistors in parallel: R_total = (R1 × R2)/(R1 + R2) — the product-over-sum shortcut.</p>
            <h2>Practical Applications</h2>
            <p><strong>LED circuits:</strong> An LED needs 2V forward voltage and 20mA current from a 5V supply. Required series resistor: R = (5 − 2) / 0.02 = 150Ω. Power dissipated in resistor: P = 0.02² × 150 = 0.06W — safely within a ¼W resistor rating. <strong>Fuse sizing:</strong> A 120V appliance drawing 1,200W needs a current of I = P/V = 10A — use a 15A fuse for safety margin. <strong>Battery drain:</strong> A 12V car battery powering a 60W load: I = 60/12 = 5A. If the battery is 60Ah, it lasts 60/5 = 12 hours.</p>
            <h2>Limitations of Ohm&apos;s Law</h2>
            <p>Ohm&apos;s Law applies only to ohmic (linear) conductors where resistance is constant regardless of applied voltage. Non-ohmic devices include diodes (exponential V-I curve), transistors, thermistors (resistance changes with temperature), and incandescent bulb filaments (resistance increases when hot). For AC circuits, resistance is replaced by impedance Z = √(R² + X²), where X is reactance from capacitors or inductors. Use the <a href="/calculator/impedance-calculator">impedance calculator</a> for AC analysis.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Select "Solve For" to choose which variable to calculate. The two known values auto-populate the visible input fields. The calculator verifies Ohm&apos;s Law in the breakdown table (V = I × R should equal your entered voltage). The pie chart shows all four quantities for quick visual comparison. Pair with the <a href="/calculator/power-calculator">power calculator</a> for complete electrical circuit analysis.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ohms-law-calculator" />
          <PopularCalculators exclude="/calculator/ohms-law-calculator" />
        </div>
      </div>
    </>
  );
};
export default OhmsLawCalculator;
