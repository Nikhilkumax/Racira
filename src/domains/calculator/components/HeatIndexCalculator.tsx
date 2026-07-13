"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ThermometerSun } from "lucide-react";

interface HeatIndexResult {
  heatIndexF: number;
  heatIndexC: number;
  dangerLevel: string;
  dangerDescription: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateHeatIndex = (tempStr: string, humidityStr: string, unit: string): HeatIndexResult | null => {
  const temp = parseFloat(tempStr);
  const humidity = parseFloat(humidityStr);

  if (isNaN(temp) || isNaN(humidity) || humidity < 0 || humidity > 100) return null;

  try {
    let tF = temp;

    if (unit === "metric") {
      tF = (temp * 9/5) + 32;
    }

    // Heat index is only officially defined for temperatures at or above 80F and humidity >= 40%
    // If not met, heat index is essentially the air temperature.
    let hiF = tF;

    if (tF >= 80 && humidity >= 40) {
      // Rothfusz regression equation (NWS)
      const c1 = -42.379;
      const c2 = 2.04901523;
      const c3 = 10.14333127;
      const c4 = -0.22475541;
      const c5 = -6.83783 * Math.pow(10, -3);
      const c6 = -5.481717 * Math.pow(10, -2);
      const c7 = 1.22874 * Math.pow(10, -3);
      const c8 = 8.5282 * Math.pow(10, -4);
      const c9 = -1.99 * Math.pow(10, -6);

      let hi = c1 + (c2 * tF) + (c3 * humidity) + (c4 * tF * humidity) + 
               (c5 * tF * tF) + (c6 * humidity * humidity) + 
               (c7 * tF * tF * humidity) + (c8 * tF * humidity * humidity) + 
               (c9 * tF * tF * humidity * humidity);

      // Adjustments based on NWS rules
      if (humidity < 13 && tF >= 80 && tF <= 112) {
        hi -= ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
      } else if (humidity > 85 && tF >= 80 && tF <= 87) {
        hi += ((humidity - 85) / 10) * ((87 - tF) / 5);
      }

      hiF = hi;
    }

    const hiC = (hiF - 32) * 5/9;

    let dangerLevel = "Safe";
    let dangerDesc = "No immediate danger under normal conditions.";

    if (hiF >= 130) {
      dangerLevel = "Extreme Danger";
      dangerDesc = "Heat stroke is highly likely with continued exposure.";
    } else if (hiF >= 103) {
      dangerLevel = "Danger";
      dangerDesc = "Sunstroke, muscle cramps, and/or heat exhaustion likely. Heat stroke possible with prolonged exposure.";
    } else if (hiF >= 90) {
      dangerLevel = "Extreme Caution";
      dangerDesc = "Sunstroke, muscle cramps, and/or heat exhaustion possible with prolonged exposure.";
    } else if (hiF >= 80) {
      dangerLevel = "Caution";
      dangerDesc = "Fatigue possible with prolonged exposure and physical activity.";
    }

    return {
      heatIndexF: parseFloat(hiF.toFixed(1)),
      heatIndexC: parseFloat(hiC.toFixed(1)),
      dangerLevel: tF >= 80 ? dangerLevel : "Safe",
      dangerDescription: tF >= 80 ? dangerDesc : "Temperature is below Heat Index threshold.",
      isError: false
    };

  } catch (err) {
    return { heatIndexF: 0, heatIndexC: 0, dangerLevel: "", dangerDescription: "", isError: true, errorMsg: "Calculation error." };
  }
};

const HeatIndexCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [temp, setTemp] = useState("90");
  const [humidity, setHumidity] = useState("70");

  const [result, setResult] = useState<HeatIndexResult | null>(null);

  const calculate = () => {
    setResult(calculateHeatIndex(temp, humidity, unit));
  };

  useEffect(() => { calculate(); }, [unit, temp, humidity]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setTemp("90");
    } else {
      setTemp("32");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the Heat Index?", answer: "The Heat Index (often referred to as the 'feels like' temperature) is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature. It is the summer equivalent to the winter's Wind Chill factor." },
    { question: "Why does humidity make it feel hotter?", answer: "The human body naturally cools itself by sweating. As sweat evaporates off your skin, it pulls heat away from your body. However, when the relative humidity is high, the air is already saturated with water vapor. This makes it much harder for your sweat to evaporate, preventing your body from cooling down. As a result, you 'feel' much hotter." },
    { question: "Does the Heat Index assume I'm in the sun?", answer: "No. The official National Weather Service Heat Index values were devised for shady, light wind conditions. Exposure to full sunshine can increase heat index values by up to 15°F." },
    { question: "Why does the calculator say 'Safe' below 80°F?", answer: "The complex mathematics of the Heat Index (the Rothfusz regression equation) are only officially defined and accurate for temperatures of 80°F (27°C) or higher, and a relative humidity of 40% or more. Below these levels, the humidity does not significantly impede human evaporative cooling." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Heat Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Heat Index Calculator</h1>
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
              
              <div className={`${result.heatIndexF >= 103 ? 'bg-red-500/10 border-red-500' : result.heatIndexF >= 90 ? 'bg-orange-500/10 border-orange-500' : 'bg-primary/10 border-primary'} border-l-4 rounded-lg p-6`}>
                <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${result.heatIndexF >= 103 ? 'text-red-600 dark:text-red-400' : result.heatIndexF >= 90 ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
                  Heat Index (Feels Like)
                </div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono">
                    {unit === "imperial" ? result.heatIndexF : result.heatIndexC}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground font-mono">
                    {unit === "imperial" ? "°F" : "°C"}
                  </span>
                </div>
                
                {/* Secondary Unit Display */}
                <div className={`mt-4 pt-4 border-t ${result.heatIndexF >= 103 ? 'border-red-500/20' : result.heatIndexF >= 90 ? 'border-orange-500/20' : 'border-primary/20'}`}>
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Equivalent Temperature</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    {unit === "imperial" ? `${result.heatIndexC} °C` : `${result.heatIndexF} °F`}
                  </div>
                </div>
              </div>

              <div className={`card-calculator !p-5 border shadow-sm ${result.heatIndexF >= 103 ? 'bg-red-500/5 border-red-500/30' : result.heatIndexF >= 90 ? 'bg-orange-500/5 border-orange-500/30' : 'bg-card border-border'}`}>
                <h3 className={`text-base font-bold mb-2 uppercase tracking-wider ${result.heatIndexF >= 103 ? 'text-red-600 dark:text-red-400' : result.heatIndexF >= 90 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'}`}>
                  Level: {result.dangerLevel}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.dangerDescription}
                </p>
                {result.heatIndexF >= 90 && (
                  <p className="text-xs font-bold text-foreground mt-3">
                    * Note: Exposure to full sunshine can increase heat index values by up to 15°F.
                  </p>
                )}
              </div>

              {(parseFloat(temp) < (unit === "imperial" ? 80 : 26.6) || parseFloat(humidity) < 40) && (
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Note:</strong> The Heat Index is officially defined only for temperatures of 80°F (27°C) or higher, and a relative humidity of 40% or more. Below these levels, the "feels like" temperature is considered identical to the actual air temperature.
                  </p>
                </div>
              )}

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of the Heat Index</h2>
            <p>During the summer, you will frequently hear meteorologists say, <em>"The temperature is 90°F, but the Heat Index makes it feel like 105°F."</em> This <strong>Heat Index</strong> (often called the apparent temperature) is the summer equivalent to the winter's Wind Chill factor. It calculates how hot it actually feels on human skin when relative humidity is combined with the air temperature.</p>

            <h2 className="text-2xl font-bold mb-3">Why Humidity Makes Us Feel Hotter</h2>
            <p>The human body is an engine that generates heat. To prevent overheating, the body has a built-in cooling system: <strong>sweating</strong>. As sweat physically evaporates off your skin and turns into a gas, it pulls heat energy away from your body, cooling you down.</p>
            <p>However, evaporation depends entirely on the surrounding air. When the <strong>Relative Humidity</strong> is high, it means the air is already heavily saturated with water vapor. Because the air is "full," it cannot easily absorb any more water. Therefore, your sweat cannot evaporate. Because the sweat stays on your skin, your body's primary cooling mechanism shuts down. This causes your core temperature to rise, making you "feel" significantly hotter than the thermometer reads.</p>

            <h2 className="text-2xl font-bold mb-3">Heat Index Danger Levels</h2>
            <p>The National Weather Service (NWS) categorizes Heat Index values to warn the public of the physical dangers of heat exposure. Prolonged exposure or physical activity in high heat index conditions can lead to severe medical emergencies:</p>
            <ul>
              <li><strong>80°F - 90°F (Caution):</strong> Fatigue is possible with prolonged exposure and physical activity.</li>
              <li><strong>90°F - 103°F (Extreme Caution):</strong> Sunstroke, muscle cramps, and heat exhaustion are possible.</li>
              <li><strong>103°F - 124°F (Danger):</strong> Sunstroke, muscle cramps, and heat exhaustion are likely. Heat stroke is possible with prolonged exposure.</li>
              <li><strong>125°F or higher (Extreme Danger):</strong> Heat stroke is highly likely with continued exposure. This is a medical emergency.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Crucial Caveats of the Heat Index</h2>
            <p>It is important to remember two critical rules about the Heat Index:</p>
            <ol>
              <li>The official formula (the Rothfusz regression equation) assumes you are resting in the <strong>shade</strong> with a light breeze. If you are standing in direct, full sunshine, the heat index value can actually increase by up to 15°F.</li>
              <li>The formula mathematically breaks down below 80°F or below 40% humidity. In those mild conditions, humidity does not significantly impair evaporative cooling, so the "feels like" temperature is simply the actual temperature.</li>
            </ol>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heat-index-calculator" />
          <PopularCalculators exclude="/calculator/heat-index-calculator" />
        </div>
      </div>
    </>
  );
};
export default HeatIndexCalculator;
