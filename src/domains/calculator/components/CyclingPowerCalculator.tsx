"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Zap } from "lucide-react";

const CyclingPowerCalculator = () => {
  const [speed, setSpeed] = useState("25");
  const [weight, setWeight] = useState("85");
  const [gradient, setGradient] = useState("0");
  const [unit, setUnit] = useState("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let s = parseFloat(speed) || 0;
    let w = parseFloat(weight) || 0;
    const g = parseFloat(gradient) || 0;

    if (unit === "imperial") {
      s = s * 1.60934; // mph to km/h
      w = w / 2.20462; // lb to kg
    }

    if (s <= 0 || w <= 0) return;

    // Simplified Power Formula (Watts)
    // P = P_gravity + P_rolling + P_air
    // This is a rough estimation
    
    const s_ms = s / 3.6; // speed in m/s
    
    // Gravity: P = m * g * s * sin(arctan(grad/100))
    const p_gravity = w * 9.81 * s_ms * (g / 100);
    
    // Rolling: P = m * g * s * C_rr (approx 0.005 for road bike)
    const p_rolling = w * 9.81 * s_ms * 0.005;
    
    // Air: P = 0.5 * rho * s^3 * CdA (approx 0.35 for road bike)
    const p_air = 0.5 * 1.225 * Math.pow(s_ms, 3) * 0.35;
    
    const totalPower = Math.max(0, p_gravity + p_rolling + p_air) / 0.95; // 0.95 drivetrain efficiency

    setResults({
      totalPower,
      wkg: totalPower / w,
      gravityPct: (p_gravity / (totalPower * 0.95)) * 100,
      airPct: (p_air / (totalPower * 0.95)) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setSpeed("25"); setWeight("85"); setGradient("0"); setUnit("metric");
    setResults(null);
  };

  const faqs = [
    { question: "What is a good power-to-weight ratio (W/kg)?", answer: "For recreational cyclists, 2.0 to 3.0 W/kg is common. Professional cyclists often exceed 5.0 to 6.0 W/kg on steep climbs." },
    { question: "How accurate is this power calculation?", answer: "This is a mathematical estimation based on physics. Factors like wind speed, road surface, and body position can significantly impact actual power requirements. A dedicated power meter is needed for precise measurement." },
    { question: "Does a heavier bike affect power significantly?", answer: "On flat ground, bike weight has a very small impact on power (mostly rolling resistance). However, on steep climbs, every extra kilogram requires significantly more power to overcome gravity." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cycling Power Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cycling Power Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="speed" label={unit === "metric" ? "Speed (km/h)" : "Speed (mph)"} value={speed} onChange={setSpeed} />
                <InputField id="weight" label={unit === "metric" ? "Total Weight (kg)" : "Total Weight (lb)"} value={weight} onChange={setWeight} tooltip="Rider + Bike + Gear" />
                <InputField id="gradient" label="Gradient (%)" value={gradient} onChange={setGradient} suffix="%" />
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setUnit("metric")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "metric" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Metric
                </button>
                <button 
                  onClick={() => setUnit("imperial")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "imperial" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Imperial
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Power Output</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Power</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.totalPower)} <span className="text-xl">Watts</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Power to Weight</p>
                    <p className="text-3xl font-black text-foreground">{results.wkg.toFixed(2)} <span className="text-sm font-normal">W/kg</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Gravity Resistance", value: 0, textValue: (results.gravityPct > 0 ? results.gravityPct.toFixed(1) : "0") + "%" },
                  { label: "Air Resistance", value: 0, textValue: results.airPct.toFixed(1) + "%" },
                  { label: "Drivetrain Loss", value: 0, textValue: "5% (Est.)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Physics of Cycling</h2>
              <p>When you ride a bike, you are constantly fighting against three main forces: air resistance (drag), rolling resistance, and gravity. Understanding how these forces interact can help you become a faster, more efficient cyclist.</p>
              <h3>Drafting and Drag</h3>
              <p>Air resistance is the dominant force on flat ground, especially at speeds above 20 km/h. Because drag increases with the cube of your speed, doubling your speed requires eight times the power. This is why "drafting" behind another rider can save you up to 30% of your energy.</p>
              <h3>Climbing and Gravity</h3>
              <p>Once the road tilts upward, gravity becomes the primary enemy. On a 10% gradient, over 90% of your power goes into simply lifting your body and bike weight against gravity. This is why lighter riders (and lighter bikes) have a massive advantage on climbs, where power-to-weight ratio (W/kg) is the ultimate metric of performance.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-power" />
          <PopularCalculators exclude="/calculator/cycling-power-calculator" />
        </div>
      </div>
    </>
  );
};

export default CyclingPowerCalculator;

