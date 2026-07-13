"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Wind } from "lucide-react";

interface WindChillResult {
  windChillF: number;
  windChillC: number;
  frostbiteTime?: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateWindChill = (tempStr: string, speedStr: string, unit: string): WindChillResult | null => {
  const temp = parseFloat(tempStr);
  const speed = parseFloat(speedStr);

  if (isNaN(temp) || isNaN(speed) || speed < 0) return null;

  try {
    let tF = temp;
    let vMph = speed;

    if (unit === "metric") {
      tF = (temp * 9/5) + 32;
      vMph = speed * 0.621371; // km/h to mph
    }

    // Wind chill is only defined for temperatures at or below 50F and wind speeds above 3 mph.
    // If conditions aren't met, the "wind chill" is basically just the air temperature.
    let wcF = tF;

    if (tF <= 50 && vMph > 3) {
      // National Weather Service Formula
      wcF = 35.74 + (0.6215 * tF) - (35.75 * Math.pow(vMph, 0.16)) + (0.4275 * tF * Math.pow(vMph, 0.16));
    }

    const wcC = (wcF - 32) * 5/9;

    // Frostbite logic based on NWS chart (approximate ranges)
    let frostbiteTime = "No immediate risk for most people.";
    if (wcF <= -60) frostbiteTime = "5 minutes";
    else if (wcF <= -35) frostbiteTime = "10 minutes";
    else if (wcF <= -18) frostbiteTime = "30 minutes";

    return {
      windChillF: parseFloat(wcF.toFixed(1)),
      windChillC: parseFloat(wcC.toFixed(1)),
      frostbiteTime: tF <= 50 ? frostbiteTime : undefined,
      isError: false
    };

  } catch (err) {
    return { windChillF: 0, windChillC: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const WindChillCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [temp, setTemp] = useState("30");
  const [speed, setSpeed] = useState("15");

  const [result, setResult] = useState<WindChillResult | null>(null);

  const calculate = () => {
    setResult(calculateWindChill(temp, speed, unit));
  };

  useEffect(() => { calculate(); }, [unit, temp, speed]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setTemp("30");
      setSpeed("15");
    } else {
      setTemp("-1");
      setSpeed("24");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What exactly is Wind Chill?", answer: "Wind chill is how cold it actually feels on human skin when the wind is blowing. Your body naturally creates a thin, invisible layer of warm air right next to your skin. When the wind blows, it strips this insulating layer of warm air away. The faster the wind blows, the faster it strips the heat, making you feel significantly colder than the actual air temperature." },
    { question: "Does wind chill affect inanimate objects?", answer: "No. Wind chill only affects living things that generate heat. If it is 40°F outside with a wind chill of 20°F, your car engine and water pipes will only cool down to 40°F. Water will not freeze, because the actual physical air temperature is still above freezing." },
    { question: "Why doesn't the calculator work for 60°F?", answer: "The National Weather Service formula for wind chill is only defined for temperatures at or below 50°F (10°C) and wind speeds above 3 mph. Above 50°F, the cooling effect of the wind is not considered biologically dangerous, and different formulas (like Heat Index) are used to measure comfort." },
    { question: "How long does it take to get frostbite?", answer: "Frostbite can occur extremely quickly in severe wind chill. If the wind chill drops to -18°F, exposed skin can freeze in 30 minutes. At -35°F, it takes 10 minutes. At -60°F or lower, it takes less than 5 minutes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Wind Chill Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wind Chill Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (°F, mph)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (°C, km/h)</button>
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
                <span>Wind Speed</span>
                <span className="text-xs text-muted-foreground font-normal self-end">{unit === "imperial" ? "mph" : "km/h"}</span>
              </label>
              <div className={wrap}><input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className={ci} min="0" step="any" /></div>
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
                <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-2 uppercase tracking-wider">Wind Chill (Feels Like)</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono">
                    {unit === "imperial" ? result.windChillF : result.windChillC}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground font-mono">
                    {unit === "imperial" ? "°F" : "°C"}
                  </span>
                </div>
                
                {/* Secondary Unit Display */}
                <div className="mt-4 pt-4 border-t border-sky-500/20">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Equivalent Temperature</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    {unit === "imperial" ? `${result.windChillC} °C` : `${result.windChillF} °F`}
                  </div>
                </div>
              </div>

              {result.frostbiteTime && (
                <div className={`card-calculator !p-5 border shadow-sm ${result.windChillF <= -18 ? 'bg-red-500/10 border-red-500/30' : 'bg-card border-border'}`}>
                  <h3 className={`text-base font-bold mb-2 ${result.windChillF <= -18 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>Frostbite Warning</h3>
                  <div className="flex items-start gap-3">
                    <div>
                      <p className={`text-sm ${result.windChillF <= -18 ? 'text-red-700/80 dark:text-red-300/80' : 'text-muted-foreground'} leading-relaxed`}>
                        At this temperature and wind speed, exposed skin can freeze in:
                      </p>
                      <div className={`text-xl font-bold font-mono mt-1 ${result.windChillF <= -18 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                        {result.frostbiteTime}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(parseFloat(temp) > (unit === "imperial" ? 50 : 10) || parseFloat(speed) <= (unit === "imperial" ? 3 : 4.8)) && (
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Note:</strong> Wind chill is officially only defined for temperatures at or below 50°F (10°C) and wind speeds above 3 mph (4.8 km/h). Under these conditions, the "feels like" temperature is considered identical to the actual air temperature.
                  </p>
                </div>
              )}

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of Wind Chill</h2>
            <p>During the winter, meteorologists will often say, <em>"The temperature is 30°F, but it feels like 15°F."</em> This phenomenon is known as the <strong>Wind Chill Factor</strong>. It explains why a calm, sunny day at 30°F feels tolerable, but a blustery, windy day at 30°F cuts right to the bone.</p>

            <h2 className="text-2xl font-bold mb-3">How Does Wind Make You Colder?</h2>
            <p>The human body is constantly generating heat. When you are outside on a cold day with no wind, your body creates a thin, microscopic layer of warm air immediately surrounding your skin and clothes. This boundary layer acts like an invisible sweater, insulating you from the colder air slightly further away.</p>
            <p>When the wind blows, it rapidly strips this warm boundary layer away. Your body has to immediately burn more energy to heat up a new layer of air. If the wind is blowing constantly, your body can never build up that insulation, and heat is constantly sucked away from your skin. The faster the wind blows, the faster you lose heat, making the air <em>feel</em> significantly colder than it actually is.</p>

            <h2 className="text-2xl font-bold mb-3">The Limitations of Wind Chill</h2>
            <p>It is crucial to understand that wind chill is a <strong>biological effect</strong>, not a physical temperature drop. It only affects living things that generate heat. </p>
            <p>If you park your car outside and the temperature is 35°F with a massive wind chill of 10°F, <strong>your engine block and radiator fluid will only cool down to 35°F.</strong> Water pipes will not freeze under these conditions, because the physical air surrounding them is still above freezing. The wind only cools the object down to the ambient air temperature faster; it cannot cool the object <em>below</em> the ambient air temperature.</p>

            <h2 className="text-2xl font-bold mb-3">Frostbite Danger</h2>
            <p>The National Weather Service (NWS) updated the wind chill formula in 2001 to more accurately reflect human face heat loss. The NWS issues Wind Chill Advisories and Warnings because severe wind chill drastically accelerates the onset of frostbite. In extreme conditions (wind chill below -60°F), exposed flesh can freeze in under 5 minutes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wind-chill-calculator" />
          <PopularCalculators exclude="/calculator/wind-chill-calculator" />
        </div>
      </div>
    </>
  );
};
export default WindChillCalculator;
