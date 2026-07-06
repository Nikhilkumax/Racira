"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Plane, Globe, Info } from "lucide-react";

const FlightEmissionsCalculator = () => {
  const [distance, setDistance] = useState("1000"); // miles
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [roundTrip, setRoundTrip] = useState(true);

  const [results, setResults] = useState<any>(null);
  useEffect(() => { handleCalculate(); }, []);

  const handleCalculate = () => {
    const dist = parseFloat(distance) || 0;
    const pax = parseFloat(passengers) || 1;
    
    // Emission factors (kg CO2 per passenger mile)
    // Factors vary by distance (efficiency) and class (space taken)
    let baseFactor = 0.15; // kg/mile for economy
    if (dist < 300) baseFactor = 0.25; // Short haul is less efficient
    else if (dist > 1500) baseFactor = 0.12; // Long haul cruise is efficient but takeoff is same

    // Cabin class multipliers
    const classMult: any = {
      economy: 1,
      premium_economy: 1.5,
      business: 2.9,
      first: 4.0
    };

    let emissions = dist * baseFactor * classMult[cabinClass] * pax;
    
    // Radiative Forcing Index (RFI) - Non-CO2 effects (contrails, etc.)
    // Standard multiplier is ~1.9x to 2.5x
    const RFI = 1.9;
    const totalEmissions = emissions * RFI * (roundTrip ? 2 : 1);

    setResults({
      totalEmissions,
      perPerson: totalEmissions / pax,
      treesNeeded: Math.ceil(totalEmissions / 20), // Approx 20kg per tree per year
      drivingEquivalent: (totalEmissions / 0.4) // Approx 0.4kg per mile for a car
    });
  };

  const reset = () => {
    setDistance("1000"); setPassengers("1"); setCabinClass("economy"); setRoundTrip(true);
    setResults(null);
    setTimeout(() => handleCalculate(), 0);
  };

  const faqs = [
    { question: "Why is business class more polluting?", answer: "Business and first-class seats take up significantly more physical space on the aircraft. Because fewer passengers can fit in these sections, the carbon footprint per passenger is much higher—often 2 to 4 times higher than economy." },
    { question: "What are 'non-CO2' effects in aviation?", answer: "Airplanes emit nitrogen oxides and create contrails (vapor trails) at high altitudes. These have a warming effect that is roughly 1.9 to 2 times greater than the CO2 alone. This is often called the Radiative Forcing Index (RFI)." },
    { question: "Is one long flight better than two short ones?", answer: "Usually, yes. Takeoff and landing are the most fuel-intensive parts of a flight. A single non-stop flight covers the same distance with only one takeoff, making it more efficient than a connecting flight." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Flight Emissions Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flight Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="distance" label="Flight Distance (one-way)" value={distance} onChange={setDistance} suffix="miles" />
                <InputField id="passengers" label="Number of Passengers" value={passengers} onChange={setPassengers} />
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cabin Class</label>
                  <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="input-calc">
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business Class</option>
                    <option value="first">First Class</option>
                  </select>
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${roundTrip ? 'bg-primary' : 'bg-secondary'}`}>
                      <input type="checkbox" className="sr-only" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${roundTrip ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Round Trip</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (<>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-2xl font-bold mb-3">Travel Impact Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total CO2e Emissions</p>
                    <p className="text-5xl font-black text-foreground">{results.totalEmissions.toFixed(0)} <span className="text-xl font-normal text-muted-foreground">kg</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({(results.totalEmissions / 1000).toFixed(2)} Metric Tons)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Per Person</p>
                    <p className="text-3xl font-black text-foreground">{results.perPerson.toFixed(0)} kg</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Contextual Impact</h3>
                      <p className="text-sm text-muted-foreground mb-4">To offset this flight, you would need to grow approximately <strong>{results.treesNeeded} trees</strong> for a full year.</p>
                      <ResultDisplay items={[
                        { label: "Driving Equivalent", value: 0, textValue: results.drivingEquivalent.toFixed(0) + " miles" },
                        { label: "Trees to Offset (1yr)", value: 0, textValue: results.treesNeeded + " trees" },
                      ]} />
                    </div>
                  </div>
                </div>
              
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Aviation and the Climate</h2>
              <p>Air travel is one of the most carbon-intensive activities an individual can perform. A single long-haul flight can produce more CO2 emissions than many people produce in an entire year through other activities.</p>
              <h3>The Radiative Forcing Index (RFI)</h3>
              <p>When you burn fuel at high altitudes, the impact is different than burning it at sea level. Contrails and other gases trap more heat. Most scientists agree that the total warming effect of aviation is about twice as high as the CO2 emissions alone. This calculator includes an RFI of 1.9 to provide a more honest picture of your impact.</p>
              <h3>How to Reduce Your Flight Footprint</h3>
              <ul>
                <li><strong>Fly Less:</strong> The most effective way is to choose trains or buses for shorter distances.</li>
                <li><strong>Non-Stop:</strong> Avoid layovers. Takeoff uses the most fuel; more takeoffs mean more emissions.</li>
                <li><strong>Economy Class:</strong> Flying economy is the most efficient way to use the plane's space.</li>
                <li><strong>Newer Aircraft:</strong> Modern planes (like the A350 or 787) are significantly more fuel-efficient than older models.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flight-emissions" />
          <PopularCalculators exclude="/calculator/flight-emissions-calculator" />
        </div>
      </div>
    </>
  );
};

export default FlightEmissionsCalculator;


