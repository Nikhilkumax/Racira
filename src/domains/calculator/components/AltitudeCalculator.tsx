"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RotateCcw, Plane } from "lucide-react";

interface AltitudeResults {
  pressureAltitude: number;
  densityAltitude: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

const DEFAULTS = {
  elevation: "1000",
  altimeterSetting: "29.92",
  temperatureC: "15"
};

const calculateAltitude = (inputs: typeof DEFAULTS): AltitudeResults => {
  const elev = parseFloat(inputs.elevation);
  const altSetting = parseFloat(inputs.altimeterSetting);
  const temp = parseFloat(inputs.temperatureC);

  if (isNaN(elev) || isNaN(altSetting) || isNaN(temp)) {
    return { pressureAltitude: 0, densityAltitude: 0, chartData: [], isError: true, errorMsg: "All inputs must be valid numbers." };
  }

  // Pressure Altitude = Elevation + (29.92 - Altimeter) * 1000
  const pressureAltitude = elev + (29.92 - altSetting) * 1000;

  // Standard Temperature at Elevation = 15 - (2 * (Elevation / 1000))
  const standardTemp = 15 - (2 * (elev / 1000));
  
  // Density Altitude = Pressure Altitude + (120 * (Outside Temp - Standard Temp))
  const densityAltitude = pressureAltitude + (120 * (temp - standardTemp));

  // Generate chart data showing Density Altitude vs Temperature at this elevation
  const chartData = [];
  for (let t = -10; t <= 40; t += 5) {
    const da = pressureAltitude + (120 * (t - standardTemp));
    chartData.push({
      "Temperature (°C)": t,
      "Density Altitude (ft)": Math.round(da)
    });
  }

  return {
    pressureAltitude: Math.round(pressureAltitude),
    densityAltitude: Math.round(densityAltitude),
    chartData,
    isError: false
  };
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

export default function AltitudeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AltitudeResults>(calculateAltitude(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateAltitude(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAltitude(DEFAULTS));
  };

  const faqs = [
    { question: "What is Density Altitude?", answer: "Density altitude is formally defined as pressure altitude corrected for non-standard temperature variations. In aviation, it represents the altitude the aircraft 'feels' like it is flying at, which critically impacts engine output, aerodynamic lift, and required runway length." },
    { question: "How does temperature affect altitude?", answer: "As the ambient temperature increases, air molecules gain kinetic energy and spread further apart, reducing the overall air density. This decrease in air density effectively increases the density altitude, drastically reducing both engine horsepower and propeller efficiency during critical takeoff phases." },
    { question: "What is Pressure Altitude?", answer: "Pressure altitude is the height above a standard datum plane where the atmospheric pressure is precisely 29.92 inches of mercury. It serves as the foundational baseline calculation before factoring in ambient temperature variations to determine the final density altitude." },
    { question: "Why is 29.92 inHg significant?", answer: "29.92 inches of mercury is the internationally recognized standard atmospheric pressure at sea level under standard atmospheric conditions. Altimeters are calibrated against this absolute baseline to ensure global standardization in altitude reporting and aircraft separation." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Aviation", href: "/calculator#aviation" }, { label: "Aviation Altitude Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Aviation Altitude Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Calculate critical aviation metrics including Pressure Altitude and Density Altitude for safe takeoff performance analysis.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="elevation" label="Field Elevation" value={inputs.elevation} onChange={(v: string) => handleChange("elevation", v)} suffix="feet" />
              <CompactInput id="altimeter" label="Altimeter Setting" value={inputs.altimeterSetting} onChange={(v: string) => handleChange("altimeterSetting", v)} suffix="inHg" />
              <CompactInput id="temperature" label="Outside Air Temperature (OAT)" value={inputs.temperatureC} onChange={(v: string) => handleChange("temperatureC", v)} suffix="°C" />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-11 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none shadow-sm"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 relative mb-4">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-4">
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Density Altitude</p>
                  <div className="text-5xl font-black text-foreground mb-1 tracking-tight">
                    {results.densityAltitude.toLocaleString()} <span className="text-2xl font-bold text-muted-foreground">ft</span>
                  </div>
                  <p className="text-base text-muted-foreground font-medium mt-2">The altitude the aircraft actually performs at.</p>
                  <Plane className="absolute right-5 bottom-5 h-16 w-16 text-primary opacity-10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Pressure Altitude</p>
                    <p className="text-2xl font-bold text-foreground">{results.pressureAltitude.toLocaleString()} ft</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Field Elevation</p>
                    <p className="text-2xl font-bold text-foreground">{inputs.elevation} ft</p>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Density Altitude vs. Temperature</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Temperature (°C)" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} ft`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['dataMin - 1000', 'dataMax + 1000']} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => [`${value} ft`, 'Density Altitude']} labelFormatter={(label) => `Temp: ${label}°C`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <ReferenceLine x={parseFloat(inputs.temperatureC)} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'CURRENT', fill: 'hsl(var(--destructive))', fontSize: 10 }} />
                        <Line type="monotone" dataKey="Density Altitude (ft)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Physics of Aviation Altitude</h2>
            <p>In the highly technical and rigorously demanding field of aviation, understanding the precise aerodynamic environment is absolutely critical for ensuring the safe operation of any aircraft. While a casual observer might simply look at a topographical map to determine the physical elevation of an airport, professional pilots and aeronautical engineers recognize that physical elevation is merely a starting point. The true performance capabilities of an aircraft are dictated by the absolute density of the atmospheric air surrounding it. To mathematically quantify this critical environmental variable, the aviation industry universally relies on complex calculations involving pressure altitude and density altitude. These sophisticated metrics provide an unambiguous, standardized framework for predicting exactly how an aircraft's engine, propeller, and aerodynamic lifting surfaces will behave under specific atmospheric conditions.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Critical Concept of Pressure Altitude</h2>
            <p>Before any pilot can determine their density altitude, they must first calculate the baseline pressure altitude. Pressure altitude is mathematically defined as the theoretical height above the standard datum plane, which is an imaginary geographical layer where the atmospheric pressure is exactly twenty nine point nine two inches of mercury. Because the Earth's atmosphere is constantly shifting due to complex meteorological pressure systems, the actual physical altitude of an airport rarely matches its pressure altitude. When a low pressure weather system moves into a region, the atmospheric pressure drops significantly. This drop in ambient pressure essentially simulates a higher altitude environment. To calculate the precise pressure altitude, a pilot subtracts the current local altimeter setting from the standard baseline of twenty nine point nine two, multiplies that differential by one thousand, and then adds the resulting product to the airport's surveyed physical elevation.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Aerodynamic Impact of Density Altitude</h2>
            <p>While pressure altitude provides a crucial atmospheric baseline, density altitude is the definitive metric that ultimately dictates aerodynamic performance. Density altitude is formally defined as pressure altitude that has been mathematically corrected for non standard temperature variations. As the ambient atmospheric temperature increases, the kinetic energy of the individual air molecules increases proportionally, causing them to spread further apart and significantly reducing the overall density of the air mass. From an aerodynamic perspective, flying in hot, low density air is mathematically identical to flying at a vastly higher physical elevation. If an airport is physically located at sea level, but the ambient temperature is extremely high, the density altitude could easily exceed three thousand feet. This means the aircraft will perform exactly as if it were attempting to take off from a high mountain runway, suffering severe degradations in both engine horsepower and overall aerodynamic lift.</p>
            
            <h2 className="text-2xl font-bold mb-3">Engine Performance Degradation</h2>
            <p>The relationship between density altitude and internal combustion engine performance is direct, immediate, and potentially catastrophic if miscalculated. Aircraft engines operate by meticulously mixing atmospheric oxygen with aviation fuel to create highly controlled combustion. In a high density altitude environment, the physical air entering the engine's intake manifold contains significantly fewer oxygen molecules per cubic inch. Because there is less oxygen available for the chemical combustion process, the engine physically cannot generate its maximum rated horsepower. A normally aspirated engine operating at a high density altitude will suffer a massive reduction in thrust output, exponentially increasing the length of the runway required to achieve takeoff speed while simultaneously crippling the aircraft's critical climb rate during initial departure.</p>
            
            <h2 className="text-2xl font-bold mb-3">Propeller Efficiency and Aerodynamic Lift</h2>
            <p>The adverse effects of a high density altitude environment extend far beyond internal engine combustion; the fundamental physics of aerodynamic lift are similarly compromised. An aircraft propeller is essentially a rotating airfoil designed to take massive "bites" of atmospheric air and aggressively force them backward to generate forward thrust. In thin, low density air, the propeller blades encounter significantly less aerodynamic resistance, causing them to take smaller, less efficient bites of air and producing drastically reduced thrust. Furthermore, the main aerodynamic wings of the aircraft require a dense, heavy flow of air moving over their curved surfaces to generate sufficient lift to counteract gravitational forces. In a high density altitude environment, the wings must be propelled through the thin air at a significantly higher true airspeed to generate the exact same amount of lift that would be effortlessly produced at sea level.</p>
            
            <h2 className="text-2xl font-bold mb-3">Mitigating Density Altitude Risks</h2>
            <p>To safely mitigate the severe operational hazards associated with high density altitude, professional pilots must proactively modify their flight profiles and operating procedures. The most common and effective strategy is to meticulously schedule flight operations during the coolest portions of the day, typically immediately after sunrise or during the late evening hours, when the ambient temperature is lowest and the air density is theoretically optimal. Additionally, pilots must aggressively manage the aircraft's gross takeoff weight by intentionally carrying less aviation fuel or strictly limiting the total number of passengers and cargo on board. By systematically reducing the total mass of the aircraft, the pilot decreases the total aerodynamic lift required for safe flight, effectively compensating for the severe performance penalties inflicted by the high density altitude environment.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/altitude-calculator" />
          <PopularCalculators exclude="/calculator/altitude-calculator" />
        </div>
      </div>
    </>
  );
}
