"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface VoltageDropResult {
  voltageDrop: number;
  percentageDrop: number;
  voltageAtEnd: number;
  crossSectionalArea: number;
  isAcceptable: boolean;
  isError: boolean;
  errorMsg?: string;
}

// American Wire Gauge (AWG) table for Copper and Aluminum
// Cross-sectional area in mm^2
const awgToMm2: Record<string, number> = {
  "0000": 107.2, "000": 85.0, "00": 67.4, "0": 53.5,
  "1": 42.4, "2": 33.6, "3": 26.7, "4": 21.2,
  "6": 13.3, "8": 8.37, "10": 5.26, "12": 3.31,
  "14": 2.08, "16": 1.31, "18": 0.823, "20": 0.518,
  "22": 0.326, "24": 0.205
};

const calculateVoltageDrop = (
  material: string,
  wireSizeAwg: string,
  voltageStr: string,
  currentStr: string,
  distanceStr: string,
  phase: string
): VoltageDropResult | null => {
  const voltage = parseFloat(voltageStr);
  const current = parseFloat(currentStr);
  let distance = parseFloat(distanceStr); // assuming meters input for now
  
  if (isNaN(voltage) || isNaN(current) || isNaN(distance) || voltage <= 0 || current < 0 || distance < 0) return null;

  // Resistivity (rho) in ohm*mm^2/m at 20C
  const rho = material === "copper" ? 0.01724 : 0.0282;
  const areaMm2 = awgToMm2[wireSizeAwg];

  if (!areaMm2) {
    return { voltageDrop: 0, percentageDrop: 0, voltageAtEnd: 0, crossSectionalArea: 0, isAcceptable: false, isError: true, errorMsg: "Invalid wire size." };
  }

  // Formula: V_drop = (k * I * rho * L) / A
  // k = 2 for single-phase (there and back), k = sqrt(3) for three-phase
  const k = phase === "single" ? 2 : Math.sqrt(3);

  const vDrop = (k * current * rho * distance) / areaMm2;
  const pctDrop = (vDrop / voltage) * 100;
  const vEnd = voltage - vDrop;

  // NEC recommends max 3% for branch circuits, 5% for feeder + branch total. We'll use 3% as strict acceptable.
  const isAcceptable = pctDrop <= 3;

  return {
    voltageDrop: vDrop,
    percentageDrop: pctDrop,
    voltageAtEnd: vEnd < 0 ? 0 : vEnd,
    crossSectionalArea: areaMm2,
    isAcceptable,
    isError: false
  };
};

const VoltageDropCalculator = () => {
  const [material, setMaterial] = useState("copper");
  const [wireSize, setWireSize] = useState("12");
  const [voltage, setVoltage] = useState("120");
  const [phase, setPhase] = useState("single");
  const [current, setCurrent] = useState("15");
  const [distance, setDistance] = useState("30"); // meters

  const [result, setResult] = useState<VoltageDropResult | null>(null);

  const calculate = () => {
    setResult(calculateVoltageDrop(material, wireSize, voltage, current, distance, phase));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setMaterial("copper"); setWireSize("12"); setVoltage("120"); setPhase("single"); setCurrent("15"); setDistance("30");
    setResult(calculateVoltageDrop("copper", "12", "120", "15", "30", "single"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Voltage Drop?", answer: "Voltage drop is the loss of electrical voltage as current travels through a wire. Wires are not perfect conductors; they have internal resistance. As electricity pushes through this resistance over a long distance, some energy is lost as heat, resulting in a lower voltage at the end of the wire than at the source." },
    { question: "What is an acceptable percentage drop?", answer: "The National Electrical Code (NEC) recommends a maximum voltage drop of 3% for branch circuits, and a total of 5% for the combined feeder and branch circuit. If the drop is too high, electrical equipment may overheat, operate inefficiently, or fail to start entirely." },
    { question: "How does wire thickness (AWG) affect it?", answer: "Thicker wires (which have LOWER AWG numbers) have less internal resistance. If you are running power over a long distance and suffering from severe voltage drop, the most common solution is to upgrade to a thicker wire (e.g., moving from 14 AWG to 10 AWG)." },
    { question: "Why is Copper better than Aluminum?", answer: "Copper has a lower electrical resistivity than aluminum, meaning it naturally conducts electricity more efficiently. An aluminum wire must be significantly thicker than a copper wire to carry the same current with the same voltage drop. However, aluminum is often used for massive transmission lines because it is much lighter and cheaper." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Voltage Drop Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Voltage Drop Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Wire Material</label>
                <div className={wrap}>
                  <select value={material} onChange={e => setMaterial(e.target.value)} className={ci}>
                    <option value="copper">Copper</option>
                    <option value="aluminum">Aluminum</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Wire Size (AWG)</label>
                <div className={wrap}>
                  <select value={wireSize} onChange={e => setWireSize(e.target.value)} className={ci}>
                    {Object.keys(awgToMm2).reverse().map(awg => (
                      <option key={awg} value={awg}>{awg} AWG</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Source Voltage (V)</label>
                <div className={wrap}><input type="number" value={voltage} onChange={e => setVoltage(e.target.value)} className={ci} min="1" step="0.01" placeholder="120" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Phase</label>
                <div className={wrap}>
                  <select value={phase} onChange={e => setPhase(e.target.value)} className={ci}>
                    <option value="single">Single Phase</option>
                    <option value="three">Three Phase</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Current Load (Amps)</label>
                <div className={wrap}><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={ci} min="0.1" step="0.01" placeholder="15" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Distance (Meters)</label>
                <div className={wrap}><input type="number" value={distance} onChange={e => setDistance(e.target.value)} className={ci} min="1" step="0.01" placeholder="30" /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Voltage Drop</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.voltageDrop.toFixed(2)}</span>
                    <span className="text-xl font-bold text-muted-foreground">Volts</span>
                  </div>
                  <div className={`text-sm font-bold px-2 py-1 inline-block rounded border ${result.isAcceptable ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'}`}>
                    {result.percentageDrop.toFixed(2)}% Loss ({result.isAcceptable ? 'Acceptable' : 'Too High'})
                  </div>
                </div>
                
                <div className="bg-card border-l-4 border-emerald-500 rounded-lg p-5 shadow-sm flex flex-col justify-center">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Voltage at End of Wire</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.voltageAtEnd.toFixed(2)}</span>
                    <span className="text-xl font-bold text-muted-foreground">Volts</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Usable voltage for your equipment</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Source vs End Voltage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[{ name: "Source", value: voltage, fill: "#a3a3a3" }, { name: "At End of Wire", value: result.voltageAtEnd, fill: "hsl(var(--primary))" }]} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                    <Tooltip formatter={(v: number) => [v.toFixed(2) + " V", ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[{ name: "Source", value: voltage }, { name: "At End of Wire", value: result.voltageAtEnd }].map((d, i) => <Cell key={i} fill={d.name === "Source" ? "#a3a3a3" : "hsl(var(--primary))"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">The gap between the bars is the {result.voltageDrop.toFixed(2)} V ({result.percentageDrop.toFixed(2)}%) lost to wire resistance.</p>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Wire Specifications Used</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Cross-Sectional Area</div>
                    <div className="text-lg font-bold text-foreground font-mono">{result.crossSectionalArea} mm²</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Circuit Type</div>
                    <div className="text-lg font-bold text-foreground capitalize">{phase} Phase</div>
                  </div>
                </div>
              </div>

              {!result.isAcceptable && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-start">
                  <Zap className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Warning: Excessive Voltage Drop</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your calculated drop exceeds the NEC recommended maximum of 3%. Operating equipment at this lowered voltage can cause motors to overheat, electronics to behave erratically, and lights to dim significantly. To fix this, you must either <strong>decrease the load (Amps)</strong>, <strong>shorten the distance</strong>, or <strong>increase the wire thickness (use a lower AWG number)</strong>.
                    </p>
                  </div>
                </div>
              )}

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Physics of Voltage Drop</h2>
            <p>No wire is a perfect conductor of electricity. Even highly conductive metals like copper and aluminum possess a small amount of internal resistance to the flow of electrons. When electrical current (Amperage) pushes through this resistance over a long distance, some of the electrical energy is converted into heat and lost to the surrounding environment. This loss of electrical "pressure" is known as <strong>Voltage Drop</strong>.</p>
            
            <h2 className="text-2xl font-bold mb-3">Why is Voltage Drop Dangerous?</h2>
            <p>If you plug a heavy-duty air compressor into a very long, thin extension cord, you will experience severe voltage drop. The compressor's motor requires 120 Volts to spin freely, but due to the drop, it might only receive 100 Volts. Because it is starved for pressure, the motor will struggle to turn, generating massive amounts of internal heat. This can quickly destroy the motor's windings or even cause a fire.</p>
            <p>For sensitive electronics, excessive voltage drop can cause computers to reboot randomly, screens to flicker, or power supplies to fail prematurely. This is why the National Electrical Code (NEC) strongly recommends keeping voltage drop below 3% for every single branch circuit.</p>

            <h2 className="text-2xl font-bold mb-3">How to Reduce Voltage Drop</h2>
            <p>If your calculation shows an unacceptable percentage drop, you have three primary ways to fix the circuit:</p>
            <ol>
              <li><strong>Increase the Wire Size:</strong> This is the most common solution. A thicker wire (which means a <em>lower</em> AWG number, like moving from 14 AWG to 10 AWG) acts like a wider pipe for water. It offers less resistance to the electrical flow, dramatically reducing the drop.</li>
              <li><strong>Shorten the Distance:</strong> Resistance is cumulative. The shorter the physical length of the wire from the breaker panel to the outlet, the lower the resistance.</li>
              <li><strong>Decrease the Load:</strong> If a circuit is heavily loaded (pulling many Amps), the voltage drop is amplified. Splitting the electrical load across two separate circuits will reduce the drop on both.</li>
            </ol>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/voltage-drop-calculator" />
          <PopularCalculators exclude="/calculator/voltage-drop-calculator" />
        </div>
      </div>
    </>
  );
};
export default VoltageDropCalculator;
