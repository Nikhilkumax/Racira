"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Droplets } from "lucide-react";

interface DewPointResult {
  dewPointF: number;
  dewPointC: number;
  comfortLevel: string;
  comfortDesc: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateDewPoint = (tempStr: string, humidityStr: string, unit: string): DewPointResult | null => {
  const temp = parseFloat(tempStr);
  const rh = parseFloat(humidityStr);

  if (isNaN(temp) || isNaN(rh) || rh < 0 || rh > 100) return null;

  try {
    let tC = temp;

    // Convert F to C for the Magnus formula
    if (unit === "imperial") {
      tC = (temp - 32) * 5/9;
    }

    // Magnus-Tetens formula constants
    const a = 17.27;
    const b = 237.7;

    const alpha = ((a * tC) / (b + tC)) + Math.log(rh / 100.0);
    const dpC = (b * alpha) / (a - alpha);
    
    let dpF = (dpC * 9/5) + 32;

    // Determine comfort level based on Dew Point in Fahrenheit (standard metric for comfort)
    let comfort = "";
    let comfortDesc = "";

    if (dpF <= 55) {
      comfort = "Dry & Comfortable";
      comfortDesc = "Air feels pleasant and crisp.";
    } else if (dpF <= 60) {
      comfort = "Pleasant";
      comfortDesc = "Comfortable for most people.";
    } else if (dpF <= 65) {
      comfort = "Slightly Humid";
      comfortDesc = "Starting to feel 'sticky'.";
    } else if (dpF <= 70) {
      comfort = "Humid & Uncomfortable";
      comfortDesc = "Air feels heavy and muggy. Sweating becomes less effective.";
    } else if (dpF <= 75) {
      comfort = "Oppressive";
      comfortDesc = "Extremely uncomfortable and sticky.";
    } else {
      comfort = "Miserable & Dangerous";
      comfortDesc = "Severely oppressive. Heat-related illnesses are highly possible.";
    }

    return {
      dewPointF: parseFloat(dpF.toFixed(1)),
      dewPointC: parseFloat(dpC.toFixed(1)),
      comfortLevel: comfort,
      comfortDesc: comfortDesc,
      isError: false
    };

  } catch (err) {
    return { dewPointF: 0, dewPointC: 0, comfortLevel: "", comfortDesc: "", isError: true, errorMsg: "Calculation error." };
  }
};

const DewPointCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [temp, setTemp] = useState("85");
  const [humidity, setHumidity] = useState("65");

  const [result, setResult] = useState<DewPointResult | null>(null);

  const calculate = () => {
    setResult(calculateDewPoint(temp, humidity, unit));
  };

  useEffect(() => { calculate(); }, [unit, temp, humidity]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setTemp("85");
    } else {
      setTemp("29");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What exactly is Dew Point?", answer: "Dew point is the absolute temperature to which air must be cooled for water vapor to condense into liquid water (dew). If the air temperature drops to the dew point, you get fog, dew on the grass, or condensation on your windows. It is an absolute measurement of how much moisture is physically in the air." },
    { question: "Why is Dew Point better than Relative Humidity?", answer: "Relative Humidity (RH) is misleading because it changes with temperature. If the actual amount of water in the air stays exactly the same, but the sun comes out and heats up the air, the RH will drop rapidly (because hot air can 'hold' more water). The Dew Point, however, will not change at all. Meteorologists prefer Dew Point because it is an absolute metric for human comfort." },
    { question: "What is a comfortable Dew Point?", answer: "Most people find a dew point between 50°F and 60°F to be very comfortable. Once it climbs above 65°F, the air starts to feel sticky and 'muggy.' When the dew point hits 70°F or higher, the air feels completely oppressive because your sweat can no longer evaporate to cool you down." },
    { question: "Can the Dew Point be higher than the Air Temperature?", answer: "No. The dew point can never be higher than the actual air temperature. If the air temperature drops and hits the dew point, the relative humidity becomes exactly 100%. If the temperature continues to drop further, the air is forced to squeeze out the excess water vapor, creating rain, fog, or heavy dew." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Dew Point Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dew Point Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (°F)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (°C)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Air Temperature</span>
                <span className="text-xs text-muted-foreground font-normal self-end">{unit === "imperial" ? "°F" : "°C"}</span>
              </label>
              <div className={wrap}><input type="number" value={temp} onChange={e => setTemp(e.target.value)} className={ci} step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Relative Humidity</span>
                <span className="text-xs text-muted-foreground font-normal self-end">%</span>
              </label>
              <div className={wrap}><input type="number" value={humidity} onChange={e => setHumidity(e.target.value)} className={ci} min="0" max="100" step="any" /></div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
              
              <div className="bg-sky-500/10 border-l-4 border-sky-500 rounded-lg p-6">
                <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-2 uppercase tracking-wider">Dew Point Temperature</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono">
                    {unit === "imperial" ? result.dewPointF : result.dewPointC}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground font-mono">
                    {unit === "imperial" ? "°F" : "°C"}
                  </span>
                </div>
                
                {/* Secondary Unit Display */}
                <div className="mt-4 pt-4 border-t border-sky-500/20">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Equivalent Temperature</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    {unit === "imperial" ? `${result.dewPointC} °C` : `${result.dewPointF} °F`}
                  </div>
                </div>
              </div>

              <div className={`card-calculator !p-5 border shadow-sm ${result.dewPointF >= 70 ? 'bg-orange-500/5 border-orange-500/30' : result.dewPointF <= 55 ? 'bg-sky-500/5 border-sky-500/30' : 'bg-card border-border'}`}>
                <h3 className={`text-base font-bold mb-2 uppercase tracking-wider ${result.dewPointF >= 70 ? 'text-orange-600 dark:text-orange-400' : result.dewPointF <= 55 ? 'text-sky-600 dark:text-sky-400' : 'text-foreground'}`}>
                  Comfort Level: {result.comfortLevel}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.comfortDesc}
                </p>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Dew Point Comfort Scale</h3>
                <ul className="space-y-2 font-mono text-sm">
                  <li className="flex justify-between items-center text-sky-600 dark:text-sky-400"><span>≤ 55°F</span> <span>Dry / Comfortable</span></li>
                  <li className="flex justify-between items-center text-emerald-600 dark:text-emerald-400"><span>56°F - 60°F</span> <span>Pleasant</span></li>
                  <li className="flex justify-between items-center text-yellow-600 dark:text-yellow-400"><span>61°F - 65°F</span> <span>Slightly Humid</span></li>
                  <li className="flex justify-between items-center text-orange-600 dark:text-orange-400"><span>66°F - 70°F</span> <span>Humid / Muggy</span></li>
                  <li className="flex justify-between items-center text-red-600 dark:text-red-400"><span>71°F - 75°F</span> <span>Oppressive</span></li>
                  <li className="flex justify-between items-center text-purple-600 dark:text-purple-400 font-bold"><span>≥ 76°F</span> <span>Miserable / Dangerous</span></li>
                </ul>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Dew Point is Better Than Relative Humidity</h2>
            <p>If you have ever stepped outside in Florida during the summer and felt like you could drink the air, you have experienced a high <strong>Dew Point</strong>. While most weather apps prominently display Relative Humidity (RH), meteorologists actually prefer using the Dew Point to measure human comfort.</p>
            <p>Why? Because Relative Humidity is highly misleading. RH measures how close the air is to being completely saturated with water, but this capacity changes with temperature. Hot air can hold vastly more water than cold air. If the temperature is 95°F with 50% humidity, the air feels violently oppressive. But if the temperature is 35°F with 50% humidity, the air feels crisp and dry. The RH is the exact same, but the physical amount of water floating around you is entirely different.</p>
            <p><strong>Dew Point</strong>, on the other hand, is an absolute measurement. It tells you exactly how much water vapor is physically in the air, regardless of the temperature. A dew point of 70°F feels identically sticky and gross whether the air temperature is 75°F or 95°F.</p>

            <h2 className="text-2xl font-bold mb-3">What is Dew Point Physically?</h2>
            <p>Physically, the dew point is the temperature the air must drop to in order for water to condense out of it. Imagine holding a glass of ice water outside on a hot day. The glass cools the thin layer of air immediately surrounding it. If that layer of air cools down to the dew point, the air can no longer hold its water vapor, and the water condenses into physical drops on the outside of your glass.</p>
            <p>This is exactly how morning dew forms on grass, or why fog rolls in when the sun goes down and temperatures drop.</p>

            <h2 className="text-2xl font-bold mb-3">Why High Dew Points are Dangerous</h2>
            <p>The human body's primary method of cooling itself is sweating. However, sweating only works if the sweat can evaporate off your skin into the air, taking heat energy with it. When the dew point is exceptionally high (above 70°F), the air is so heavily loaded with water vapor that there is simply no "room" for your sweat to evaporate. Your sweat stays trapped on your skin, your core temperature rises, and you become highly susceptible to heat exhaustion or heat stroke.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dew-point-calculator" />
          <PopularCalculators exclude="/calculator/dew-point-calculator" />
        </div>
      </div>
    </>
  );
};
export default DewPointCalculator;
