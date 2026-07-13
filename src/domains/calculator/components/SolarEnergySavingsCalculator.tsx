"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Sun, Zap, TrendingUp, Info } from "lucide-react";

const SolarEnergySavingsCalculator = () => {
  const [systemSize, setSystemSize] = useState("6"); // kW
  const [installCost, setInstallCost] = useState("15000"); // $
  const [electricityRate, setElectricityRate] = useState("0.16"); // $/kWh
  const [sunHours, setSunHours] = useState("4.5"); // peak sun hours per day

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const size = parseFloat(systemSize) || 0;
    const cost = parseFloat(installCost) || 0;
    const rate = parseFloat(electricityRate) || 0;
    const hours = parseFloat(sunHours) || 0;

    // Daily generation (kWh) = Size * Hours * Efficiency (approx 0.8)
    const dailyGeneration = size * hours * 0.8;
    const annualGeneration = dailyGeneration * 365;
    
    const annualSavings = annualGeneration * rate;
    
    // Simple Payback (not accounting for degradation or rate hikes for simplicity)
    const federalTaxCredit = cost * 0.30; // 30% Federal Investment Tax Credit (ITC)
    const netCost = cost - federalTaxCredit;
    const paybackYears = netCost / (annualSavings || 1);

    // CO2 Offset (0.4 kg per kWh)
    const co2Saved = annualGeneration * 0.4;

    setResults({
      dailyGeneration,
      annualGeneration,
      annualSavings,
      paybackYears,
      federalTaxCredit,
      netCost,
      co2Saved,
      total25YearSavings: (annualSavings * 25) - netCost
    });
  };

  const reset = () => {
    setShowResults(false);
    setSystemSize("6"); setInstallCost("15000"); setElectricityRate("0.16"); setSunHours("4.5");
    setResults(null);
  };

  const faqs = [
    { question: "What are 'Peak Sun Hours'?", answer: "Peak sun hours are not the total hours of daylight, but rather the equivalent number of hours where solar intensity averages 1,000 watts per square meter. In the US, this typically ranges from 3 to 6 hours depending on the state." },
    { question: "How long do solar panels last?", answer: "Most modern solar panels come with a 25-year performance warranty. They typically continue to produce electricity well beyond that, though their efficiency slowly degrades by about 0.5% per year." },
    { question: "What is the Federal Solar Tax Credit?", answer: "The Investment Tax Credit (ITC) currently allows you to deduct 30% of the cost of installing a solar energy system from your federal taxes. This applies to both residential and commercial systems." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Solar Energy Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Energy Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="size" label="System Size" value={systemSize} onChange={setSystemSize} suffix="kW" tooltip="Average residential systems are 5-8kW." />
                <InputField id="cost" label="Total Install Cost" value={installCost} onChange={setInstallCost} prefix="$" />
                <InputField id="rate" label="Electricity Rate" value={electricityRate} onChange={setElectricityRate} prefix="$" suffix="/kWh" />
                <InputField id="hours" label="Avg Peak Sun Hours" value={sunHours} onChange={setSunHours} suffix="hr/day" />
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
                <h2 className="text-2xl font-bold mb-3">Financial & Solar Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Annual Savings</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annualSavings).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Payback Period</p>
                    <p className="text-3xl font-black text-foreground">{results.paybackYears.toFixed(1)} <span className="text-lg">Years</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Net System Cost</p>
                    <p className="font-bold text-lg text-foreground">${Math.round(results.netCost).toLocaleString()}</p>
                    <p className="text-[10px] text-green-600">After 30% Tax Credit</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Annual Generation</p>
                    <p className="font-bold text-lg text-foreground">{Math.round(results.annualGeneration).toLocaleString()} <span className="text-xs">kWh</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CO2 Offset</p>
                    <p className="font-bold text-lg text-foreground">{results.co2Saved.toFixed(0)} <span className="text-xs">kg/yr</span></p>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><TrendingUp className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1">Long-term Financial Impact</h3>
                      <p className="text-sm text-muted-foreground mb-4">Over the next 25 years, this system is projected to save you a net total of <strong>${Math.round(results.total25YearSavings).toLocaleString()}</strong> compared to buying from the grid.</p>
                      <ResultDisplay items={[
                        { label: "Daily Production", value: 0, textValue: results.dailyGeneration.toFixed(1) + " kWh/day" },
                        { label: "Lifetime CO2 Saved", value: 0, textValue: (results.co2Saved * 25 / 1000).toFixed(1) + " Tons" },
                      ]} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Solar: An Investment in Independence</h2>
              <p>Installing solar panels is one of the few home improvements that actually pays for itself. Beyond the environmental benefits, it provides a hedge against rising electricity costs from traditional utility companies.</p>
              <h3>Understanding Net Metering</h3>
              <p>Most solar systems are grid-tied. Through "Net Metering," when your panels produce more electricity than you use (typically during the day), the excess is sent back to the grid, and your utility meter literally runs backward. You then use those credits at night when the sun isn't shining.</p>
              <h3>Factors That Affect ROI</h3>
              <ul>
                <li><strong>Roof Orientation:</strong> South-facing roofs (in the Northern Hemisphere) produce the most energy.</li>
                <li><strong>Shading:</strong> Even a small amount of shade from trees or chimneys can significantly reduce the output of some solar arrays.</li>
                <li><strong>Local Incentives:</strong> Many states and municipalities offer additional rebates or tax exemptions beyond the federal 30% credit.</li>
                <li><strong>Energy Usage:</strong> The more electricity you use, the faster your system will pay for itself through avoided costs.</li>
              </ul>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/solar-energy-savings" />
          <PopularCalculators exclude="/calculator/solar-energy-savings-calculator" />
        </div>
      </div>
    </>
  );
};

export default SolarEnergySavingsCalculator;

