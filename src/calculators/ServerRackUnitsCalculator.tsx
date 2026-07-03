"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Server, Plus, Trash2 } from "lucide-react";

const ServerRackUnitsCalculator = () => {
  const [rackCapacity, setRackCapacity] = useState("42");
  const [components, setComponents] = useState([
    { id: 1, name: "Dell PowerEdge (Server)", units: "1" },
    { id: 2, name: "APC Smart-UPS", units: "2" },
    { id: 3, name: "Cisco Switch", units: "1" },
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addComponent = () => {
    setComponents([...components, { id: Date.now(), name: "New Device", units: "1" }]);
  };

  const removeComponent = (id: number) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateComponent = (id: number, field: string, value: string) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCalculate = () => {
    setShowResults(true);
    const totalU = parseInt(rackCapacity) || 0;
    let usedU = 0;
    components.forEach(c => usedU += parseInt(c.units) || 0);

    const remainingU = totalU - usedU;
    const rackUnitHeightInches = 1.75; // 1U = 1.75 inches
    const totalHeightInches = totalU * rackUnitHeightInches;
    const occupiedHeightInches = usedU * rackUnitHeightInches;

    setResults({
      totalU,
      usedU,
      remainingU,
      fillPercentage: (usedU / totalU) * 100,
      occupiedHeightInches,
      occupiedHeightMm: occupiedHeightInches * 25.4
    });
  };

  const reset = () => {
    setShowResults(false);
    setRackCapacity("42");
    setComponents([
      { id: 1, name: "Dell PowerEdge (Server)", units: "1" },
    ]);
    setResults(null);
  };

  const faqs = [
    { question: "What is a 'U' or 'Rack Unit'?", answer: "A Rack Unit (U) is a standard unit of measure defined as 1.75 inches (44.45 mm). It is used to measure the height of server racks and the equipment that fits into them." },
    { question: "What are common rack sizes?", answer: "The most common full-size rack is 42U. Half-racks are typically 22U or 24U, and small wall-mount racks range from 6U to 12U." },
    { question: "Do I need to leave space between servers?", answer: "Modern servers usually pull air from the front and exhaust it out the back, so they can be stacked without vertical gaps. However, some older equipment or high-heat networking gear may benefit from a 1U blanking panel for better airflow management." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Server Rack Units Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Server Rack Units Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-8">
                <InputField id="rackCapacity" label="Rack Total Capacity (U)" value={rackCapacity} onChange={setRackCapacity} suffix="U" />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Rack Components</h3>
                  <button onClick={addComponent} className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                    <Plus className="h-4 w-4" /> Add Device
                  </button>
                </div>
                
                {components.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_80px_40px] gap-3 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                    <input 
                      type="text" 
                      value={c.name} 
                      onChange={(e) => updateComponent(c.id, "name", e.target.value)}
                      placeholder="Device Name"
                      className="input-calc !py-2"
                    />
                    <div className="relative">
                      <input 
                        type="number" 
                        value={c.units} 
                        onChange={(e) => updateComponent(c.id, "units", e.target.value)}
                        className="input-calc !py-2 !pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">U</span>
                    </div>
                    <button onClick={() => removeComponent(c.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
                <h2 className="text-2xl font-bold mb-3">Rack Utilization Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Used Space</p>
                    <p className="text-5xl font-black text-foreground">{results.usedU} <span className="text-xl">U</span></p>
                    <p className="text-xs text-muted-foreground mt-2">{results.fillPercentage.toFixed(1)}% Capacity Full</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.remainingU < 0 ? "bg-red-500/5 border-red-500/10" : "bg-green-500/5 border-green-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Remaining Space</p>
                    <p className={`text-5xl font-black ${results.remainingU < 0 ? "text-red-600" : "text-green-600"}`}>{results.remainingU} <span className="text-xl">U</span></p>
                    {results.remainingU < 0 && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase">Over Capacity!</p>}
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Physical Height Occupied", value: 0, textValue: results.occupiedHeightInches.toFixed(2) + " inches" },
                  { label: "Metric Height", value: 0, textValue: results.occupiedHeightMm.toFixed(0) + " mm" },
                  { label: "Standard 19\" Rack", value: 0, textValue: "Confirmed" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Data Center Capacity Planning</h2>
              <p>Effective rack management is about more than just physical space; it's about power distribution, weight limits, and airflow. However, everything starts with the Rack Unit (U).</p>
              <h3>Standard Equipment Sizes</h3>
              <ul>
                <li><strong>Network Switches:</strong> Usually 1U.</li>
                <li><strong>Standard Servers:</strong> Range from 1U (blade/pizza box) to 4U (storage heavy).</li>
                <li><strong>UPS / Batteries:</strong> Typically 2U to 6U depending on capacity.</li>
                <li><strong>Patch Panels:</strong> Usually 1U or 2U.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/server-rack-units" />
          <PopularCalculators exclude="/calculator/server-rack-units-calculator" />
        </div>
      </div>
    </>
  );
};

export default ServerRackUnitsCalculator;

