"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Zap, Flame, Droplets, Calculator, Home } from "lucide-react";

const HomeEnergyEmissionsCalculator = () => {
  const [electricity, setElectricity] = useState("900"); // kWh/month
  const [naturalGas, setNaturalGas] = useState("60"); // therms/month
  const [heatingOil, setHeatingOil] = useState("0"); // gallons/month
  const [propane, setPropane] = useState("0"); // gallons/month

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    // Emission factors (kg CO2e per unit)
    const EF_ELEC = 0.4; // kg/kWh (average mix)
    const EF_GAS = 5.3; // kg/therm
    const EF_OIL = 10.1; // kg/gallon
    const EF_PROPANE = 5.7; // kg/gallon

    const elecCO2 = parseFloat(electricity) * EF_ELEC * 12;
    const gasCO2 = parseFloat(naturalGas) * EF_GAS * 12;
    const oilCO2 = parseFloat(heatingOil) * EF_OIL * 12;
    const propaneCO2 = parseFloat(propane) * EF_PROPANE * 12;

    const totalCO2 = elecCO2 + gasCO2 + oilCO2 + propaneCO2;

    setResults({
      totalCO2,
      totalTons: totalCO2 / 1000,
      elecPercent: (elecCO2 / (totalCO2 || 1)) * 100,
      gasPercent: (gasCO2 / (totalCO2 || 1)) * 100,
      oilPercent: ((oilCO2 + propaneCO2) / (totalCO2 || 1)) * 100,
      treesNeeded: Math.ceil(totalCO2 / 20)
    });
  };

  const reset = () => {
    setShowResults(false);
    setElectricity("900"); setNaturalGas("60"); setHeatingOil("0"); setPropane("0");
    setResults(null);
  };

  const faqs = [
    { question: "Which home energy source is cleanest?", answer: "Electricity is currently the cleanest source for many, as the power grid incorporates more wind and solar energy every year. Natural gas is cleaner than heating oil or coal, but still produces significant CO2 when burned." },
    { question: "How can I lower my electricity emissions?", answer: "You can reduce emissions by improving home insulation, using smart thermostats, switching to energy-efficient appliances (Energy Star), and opting for a green energy plan from your utility provider if available." },
    { question: "What is a 'Therm' of natural gas?", answer: "A therm is a unit of heat energy equivalent to 100,000 British Thermal Units (BTUs). It is the standard unit used by utility companies in the US to bill for natural gas usage." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home Energy Emissions Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Energy Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="elec" label="Monthly Electricity" value={electricity} onChange={setElectricity} suffix="kWh" />
                <InputField id="gas" label="Monthly Natural Gas" value={naturalGas} onChange={setNaturalGas} suffix="therms" />
                <InputField id="oil" label="Monthly Heating Oil" value={heatingOil} onChange={setHeatingOil} suffix="gal" />
                <InputField id="propane" label="Monthly Propane" value={propane} onChange={setPropane} suffix="gal" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-2xl font-bold mb-3">Household Impact Report</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Home CO2e</p>
                    <p className="text-5xl font-black text-foreground">{results.totalTons.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">Tons</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily CO2 Impact</p>
                    <p className="text-3xl font-black text-foreground">{(results.totalCO2 / 365).toFixed(1)} kg</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Emissions Breakdown</h3>
                  <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden flex">
                    <div style={{ width: `${results.elecPercent}%` }} className="h-full bg-primary" />
                    <div style={{ width: `${results.gasPercent}%` }} className="h-full bg-orange-500" />
                    <div style={{ width: `${results.oilPercent}%` }} className="h-full bg-slate-700" />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary rounded-sm" /> Electricity ({results.elecPercent.toFixed(0)}%)</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded-sm" /> Natural Gas ({results.gasPercent.toFixed(0)}%)</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-700 rounded-sm" /> Other Fuels ({results.oilPercent.toFixed(0)}%)</div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl"><Home className="h-6 w-6 text-green-600" /></div>
                    <div>
                      <h4 className="font-bold">Neutralization Target</h4>
                      <p className="text-sm text-muted-foreground">To neutralize your home's energy footprint, you would need to plant <strong>{results.treesNeeded} trees</strong> every year.</p>
                    </div>
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Heating, Cooling, and the Planet</h2>
              <p>For the average household, space heating and cooling account for more than half of total energy use. This is where the largest opportunities for emission reductions exist.</p>
              <h3>The Hidden Impact of Natural Gas</h3>
              <p>While natural gas burns cleaner than coal, it is mostly methane. Methane leaks from pipelines and infrastructure are a significant source of global warming. Switching to electric heat pumps can reduce a home's operational carbon footprint by 40% to 70% in most regions.</p>
              <h3>The Efficiency First Rule</h3>
              <p>Before installing solar panels or switching fuels, the most cost-effective way to reduce emissions is efficiency. Sealing air leaks and adding attic insulation can reduce energy needs by up to 20%, permanently lowering your footprint regardless of the energy source.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-energy-emissions" />
          <PopularCalculators exclude="/calculator/home-energy-emissions-calculator" />
        </div>
      </div>
    </>
  );
};

export default HomeEnergyEmissionsCalculator;

