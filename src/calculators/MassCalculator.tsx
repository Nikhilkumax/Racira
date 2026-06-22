"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowRight } from "lucide-react";

interface MassResult {
  massStr: string;
  unitStr: string;
  baseKg: number;
  equation: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateMass = (
  mode: "from_density" | "from_force" | "from_energy",
  val1: string,
  val2: string
): MassResult | null => {
  const v1 = parseFloat(val1);
  const v2 = parseFloat(val2);

  if (isNaN(v1) || isNaN(v2)) return null;

  let massKg = 0;
  let eq = "";

  try {
    if (mode === "from_density") {
      // Mass = Density * Volume
      // v1 = Density (kg/m^3), v2 = Volume (m^3)
      if (v1 <= 0 || v2 <= 0) return { massStr: "", unitStr: "", baseKg: 0, equation: "", isError: true, errorMsg: "Density and Volume must be positive numbers." };
      massKg = v1 * v2;
      eq = `Mass = ${v1} kg/m³ × ${v2} m³`;
    } else if (mode === "from_force") {
      // Mass = Force / Acceleration (Newton's Second Law)
      // v1 = Force (N), v2 = Acceleration (m/s^2)
      if (v2 === 0) return { massStr: "", unitStr: "", baseKg: 0, equation: "", isError: true, errorMsg: "Acceleration cannot be zero." };
      massKg = Math.abs(v1 / v2);
      eq = `Mass = |${v1} N / ${v2} m/s²|`;
    } else if (mode === "from_energy") {
      // Mass = Energy / c^2 (Einstein)
      // v1 = Energy (Joules)
      // v2 is ignored, we use c = 299,792,458 m/s
      if (v1 < 0) return { massStr: "", unitStr: "", baseKg: 0, equation: "", isError: true, errorMsg: "Energy must be a positive number." };
      const c = 299792458;
      massKg = v1 / (c * c);
      eq = `Mass = ${v1} J / (${c} m/s)²`;
    }

    const formatMass = (m: number) => {
      if (m >= 1000) return { val: (m / 1000).toPrecision(6), unit: "Metric Tons (t)" };
      if (m < 0.001 && m > 0) return { val: (m * 1000).toPrecision(6), unit: "Grams (g)" };
      return { val: m.toPrecision(6), unit: "Kilograms (kg)" };
    };

    const res = formatMass(massKg);

    return {
      massStr: parseFloat(res.val).toString(), // strip trailing zeros
      unitStr: res.unit,
      baseKg: massKg,
      equation: eq,
      isError: false
    };

  } catch (err) {
    return { massStr: "", unitStr: "", baseKg: 0, equation: "", isError: true, errorMsg: "Calculation resulted in an overflow or error." };
  }
};

const MassCalculator = () => {
  const [mode, setMode] = useState<"from_density" | "from_force" | "from_energy">("from_density");
  const [val1, setVal1] = useState("1000"); // Density
  const [val2, setVal2] = useState("2.5"); // Volume

  const [result, setResult] = useState<MassResult | null>(null);

  const calculate = () => {
    setResult(calculateMass(mode, val1, val2));
  };

  useEffect(() => { calculate(); }, [mode, val1, val2]);

  const handleModeChange = (newMode: "from_density" | "from_force" | "from_energy") => {
    setMode(newMode);
    if (newMode === "from_density") { setVal1("1000"); setVal2("2.5"); }
    if (newMode === "from_force") { setVal1("500"); setVal2("9.81"); }
    if (newMode === "from_energy") { setVal1("90000000000000000"); setVal2("0"); }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Mass vs. Weight?", answer: "Mass is the amount of matter in an object, measured in Kilograms (kg). Weight is the force of gravity acting on that mass, measured in Newtons (N) or Pounds (lbs). Your mass is exactly the same on Earth as it is on the Moon. Your weight, however, changes depending on the gravity." },
    { question: "How do you calculate mass from density?", answer: "The formula is Mass = Density × Volume. Density tells you how tightly packed the matter is (e.g., steel is very dense, styrofoam is not). If you know the volume an object takes up and the density of its material, multiplying them gives you the total mass." },
    { question: "What is Newton's Second Law?", answer: "Newton's Second Law states that Force = Mass × Acceleration (F = ma). By rearranging this algebraically, we get Mass = Force / Acceleration. If you know exactly how much force it takes to accelerate an object at a certain rate, you can determine its mass." },
    { question: "What does E=mc² have to do with mass?", answer: "Einstein's famous equation shows mass-energy equivalence. It proves that mass and energy are two forms of the exact same thing, and they can be converted into one another. The equation means that a tiny amount of mass contains a colossal amount of energy (because the speed of light squared, c², is a massive number)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Mass Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mass Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Calculation Method</label>
              <div className="flex flex-col gap-2 rounded-md border border-input p-1 bg-background">
                <button type="button" onClick={() => handleModeChange("from_density")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "from_density" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>From Density & Volume</button>
                <button type="button" onClick={() => handleModeChange("from_force")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "from_force" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>From Force & Acceleration</button>
                <button type="button" onClick={() => handleModeChange("from_energy")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "from_energy" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>From Energy (E=mc²)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            {mode === "from_density" && (<>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Density</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">kg / m³</span>
                </label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} min="0" step="any" /></div>
                <p className="text-xs text-muted-foreground mt-1.5">e.g., Water is ~1000 kg/m³.</p>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Volume</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">Cubic Meters (m³)</span>
                </label>
                <div className={wrap}><input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
            </>)}

            {mode === "from_force" && (<>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Force</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">Newtons (N)</span>
                </label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Acceleration</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">m / s²</span>
                </label>
                <div className={wrap}><input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={ci} step="any" /></div>
                <p className="text-xs text-muted-foreground mt-1.5">Earth gravity is ~9.81 m/s².</p>
              </div>
            </>)}

            {mode === "from_energy" && (<>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Energy</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">Joules (J)</span>
                </label>
                <div className={wrap}><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
              <div className="flex flex-col opacity-50 pointer-events-none">
                <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Speed of Light (c)</span>
                  <span className="text-xs text-muted-foreground font-normal self-end">m / s</span>
                </label>
                <div className={wrap}><input type="text" value="299,792,458" readOnly className={ci} /></div>
              </div>
            </>)}
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
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Calculated Mass</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono">{result.massStr}</span>
                </div>
                <div className="text-xl font-bold text-muted-foreground font-mono mt-2">{result.unitStr}</div>
                
                {/* Secondary Unit Display */}
                <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-primary/20">
                  <div className="bg-background rounded border border-border/50 p-2 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Pounds (lb)</div>
                    <div className="text-base font-bold text-foreground font-mono">{(result.baseKg * 2.20462).toPrecision(6)}</div>
                  </div>
                  <div className="bg-background rounded border border-border/50 p-2 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Kilograms (kg)</div>
                    <div className="text-base font-bold text-foreground font-mono">{parseFloat(result.baseKg.toPrecision(6))}</div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Equation Breakdown</h3>
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
                  <div className="font-mono text-base font-bold text-foreground break-words">{result.equation}</div>
                  {mode === "from_density" && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Derived from the density formula (ρ = m/V), rewritten to solve for mass (m = ρ × V).</p>}
                  {mode === "from_force" && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Derived from Newton's Second Law of Motion (F = ma), rewritten to solve for mass (m = F/a).</p>}
                  {mode === "from_energy" && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Derived from Einstein's mass-energy equivalence (E = mc²), rewritten to solve for mass (m = E/c²).</p>}
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What is Mass?</h2>
            <p><strong>Mass</strong> is a fundamental property of physics that describes the amount of matter in an object. Unlike weight—which is the force created when gravity pulls on that mass—mass is absolute. A 10 kg bowling ball has a mass of 10 kg on Earth, in deep space, and on Jupiter. However, its weight will change dramatically in those three locations because gravity varies. The standard metric unit for mass is the Kilogram (kg).</p>

            <h2>Methods of Calculating Mass</h2>
            <p>Because mass is a foundational property, it appears in many core equations of physics. This calculator allows you to solve for mass using three different, fundamental laws of physics.</p>

            <h3>1. The Density Equation</h3>
            <p><code>Density = Mass ÷ Volume</code>. This describes how tightly packed an object's atoms are. If you know the density of a material (e.g., solid steel is about 7,850 kg/m³) and you know how much physical space it takes up (Volume), you simply multiply them together to find the mass. This is the most common way to find mass in chemistry and engineering.</p>

            <h3>2. Newton's Second Law of Motion</h3>
            <p><code>Force = Mass × Acceleration</code>. Sir Isaac Newton proved that the force required to accelerate an object is directly proportional to its mass. It takes very little force to accelerate a tennis ball, but massive force to accelerate a train. If you know exactly how much Force (in Newtons) was applied, and exactly how fast it accelerated (in m/s²), you can divide Force by Acceleration to find the mass. This is known as "Inertial Mass."</p>

            <h3>3. Einstein's Mass-Energy Equivalence</h3>
            <p><code>E = mc²</code>. Albert Einstein radically changed physics by proving that mass and energy are the exact same thing, just in different forms. If you take a tiny piece of mass and convert it entirely into energy (like in a nuclear reactor), it releases a colossal amount of Joules. By rearranging the equation to <code>m = E ÷ c²</code>, you can calculate exactly how much mass is required to generate a specific amount of energy. Because the speed of light (c) squared is such a massive number, it takes an enormous amount of energy to equal even a tiny fraction of a gram of mass.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mass-calculator" />
          <PopularCalculators exclude="/calculator/mass-calculator" />
        </div>
      </div>
    </>
  );
};
export default MassCalculator;
