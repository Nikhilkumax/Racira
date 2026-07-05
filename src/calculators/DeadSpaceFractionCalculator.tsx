"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Wind, AlertCircle } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface DeadSpaceInputs {
  paCO2: number; // Arterial partial pressure of CO2 (mmHg)
  peCO2: number; // Mixed expired partial pressure of CO2 (mmHg)
  tidalVolume: number; // ml (optional, for absolute calculation)
}

interface DeadSpaceResults {
  vdvtRatio: number; // Vd/Vt ratio as a decimal
  vdvtPercent: number; // %
  absoluteDeadSpace: number | null; // ml, if tidal volume is provided
  classification: "Normal" | "Elevated" | "Severely Elevated" | "Invalid";
  clinicalInterpretation: string;
  chartData: { name: string; value: number; color: string }[];
}

// 2. Pure Calculation Function
const calculateDeadSpace = (inputs: DeadSpaceInputs): DeadSpaceResults | null => {
  const { paCO2, peCO2, tidalVolume } = inputs;
  
  if (paCO2 <= 0 || peCO2 <= 0 || paCO2 < peCO2) return null; // PaCO2 must be >= PeCO2 for physiological validity

  // Bohr-Enghoff Equation: Vd/Vt = (PaCO2 - PeCO2) / PaCO2
  const vdvtRatio = (paCO2 - peCO2) / paCO2;
  const vdvtPercent = vdvtRatio * 100;

  let absoluteDeadSpace: number | null = null;
  if (tidalVolume > 0) {
    absoluteDeadSpace = vdvtRatio * tidalVolume;
  }

  let classification: "Normal" | "Elevated" | "Severely Elevated" | "Invalid";
  let clinicalInterpretation = "";
  let chartColor = "";

  if (vdvtPercent < 0 || vdvtPercent > 100) {
    classification = "Invalid";
    clinicalInterpretation = "Values provided result in an impossible ratio. Please check PaCO2 and PeCO2.";
    chartColor = "#ef4444";
  } else if (vdvtPercent <= 35) {
    classification = "Normal";
    clinicalInterpretation = "Normal physiological dead space fraction. Gas exchange is efficient. In healthy adults, dead space typically represents 20-33% of resting tidal volume.";
    chartColor = "#10b981"; // green
  } else if (vdvtPercent > 35 && vdvtPercent <= 50) {
    classification = "Elevated";
    clinicalInterpretation = "Elevated dead space fraction. Indicates mild to moderate ventilation-perfusion (V/Q) mismatch. Common in mild COPD, early ARDS, or pulmonary embolism. The patient must increase minute ventilation to maintain normal CO2 levels, increasing the work of breathing.";
    chartColor = "#f59e0b"; // amber
  } else {
    classification = "Severely Elevated";
    clinicalInterpretation = "Severely elevated dead space fraction (>50%). Indicates critical impairment of pulmonary gas exchange. Seen in severe ARDS, massive pulmonary embolism, or end-stage COPD. These patients are at extremely high risk of respiratory muscle fatigue and often require prolonged mechanical ventilation or ECMO support.";
    chartColor = "#ef4444"; // red
  }

  const chartData = [
    { name: "Dead Space (Wasted Ventilation)", value: vdvtPercent, color: chartColor },
    { name: "Alveolar Ventilation (Effective)", value: 100 - vdvtPercent, color: "hsl(var(--primary))" }
  ];

  return {
    vdvtRatio,
    vdvtPercent,
    absoluteDeadSpace,
    classification,
    clinicalInterpretation,
    chartData
  };
};

export default function DeadSpaceFractionCalculator() {
  const [paCO2, setPaCO2] = useState<string>("40");
  const [peCO2, setPeCO2] = useState<string>("28");
  const [tidalVolume, setTidalVolume] = useState<string>("500");
  
  const [results, setResults] = useState<DeadSpaceResults | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const a = parseFloat(paCO2);
    const e = parseFloat(peCO2);
    const v = parseFloat(tidalVolume) || 0;

    if (isNaN(a) || isNaN(e) || a <= 0 || e <= 0) {
      setResults(null);
      return;
    }

    if (e > a) {
      setErrorMsg("Error: Mixed Expired CO2 (PeCO2) cannot physiologically exceed Arterial CO2 (PaCO2).");
      setResults(null);
      return;
    }

    const inputs: DeadSpaceInputs = { paCO2: a, peCO2: e, tidalVolume: v };
    setResults(calculateDeadSpace(inputs));
  };

  const handleReset = () => {
    setPaCO2("40");
    setPeCO2("28");
    setTidalVolume("500");
    setErrorMsg("");
    setTimeout(handleCalculate, 10);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paCO2, peCO2, tidalVolume]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dead Space Fraction</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
          <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
          <p className="text-foreground font-extrabold text-sm">{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const faqs = [
    { question: "What is Dead Space Ventilation?", answer: "When you take a breath, not all the air reaches the alveoli where oxygen and carbon dioxide are exchanged with the blood. The air that fills the mouth, trachea, and large bronchi does not participate in gas exchange. This is known as anatomic dead space. Physiological dead space includes this anatomic space plus any alveoli that are ventilated with air but are not receiving blood flow (perfusion)." },
    { question: "What is the Bohr-Enghoff Equation?", answer: "The classic Bohr equation used alveolar CO2, which is nearly impossible to measure directly. Enghoff modified the equation to use arterial CO2 (PaCO2) obtained from a standard arterial blood gas (ABG) test. The formula Vd/Vt = (PaCO2 - PeCO2) / PaCO2 compares the CO2 in the blood to the CO2 actually exhaled. The larger the gap between these two numbers, the more 'wasted' dead space ventilation is occurring." },
    { question: "How do you measure PeCO2?", answer: "PeCO2 stands for Mixed Expired partial pressure of CO2. It is not the same as End-Tidal CO2 (EtCO2). PeCO2 requires collecting all the exhaled gas over a specific period (usually in a Douglas bag or via specialized metabolic monitors on modern ventilators) and analyzing the average CO2 concentration." },
    { question: "Why is a high Vd/Vt ratio dangerous?", answer: "A high ratio means the lungs are highly inefficient. If a patient has a Vd/Vt of 60%, it means 60% of every breath they take is wasted. To maintain normal blood CO2 levels, the patient must breathe substantially faster and deeper. This causes immense respiratory muscle fatigue and is a primary reason patients fail to wean from mechanical ventilators." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Dead Space Fraction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dead Space Fraction (Vd/Vt) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1100px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                <Wind className="h-4 w-4" /> Bohr-Enghoff Equation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the ratio of physiological dead space to tidal volume to assess pulmonary gas exchange efficiency and V/Q mismatch severity.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Arterial PCO2 (PaCO2)</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={paCO2}
                    onChange={(e) => setPaCO2(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                    placeholder="From ABG"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">mmHg</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Mixed Expired PCO2 (PeCO2)</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={peCO2}
                    onChange={(e) => setPeCO2(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                    placeholder="Volumetric capnography"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">mmHg</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex flex-col text-sm font-semibold text-foreground mb-1.5">
                  <span>Tidal Volume (Vt)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional. Used to calculate absolute dead space.</span>
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={tidalVolume}
                    onChange={(e) => setTidalVolume(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">mL</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Values
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className={`${results.classification === 'Normal' ? 'bg-green-500/10 border-green-500' : results.classification === 'Elevated' ? 'bg-amber-500/10 border-amber-500' : 'bg-red-500/10 border-red-500'} border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${results.classification === 'Normal' ? 'text-green-600' : results.classification === 'Elevated' ? 'text-amber-600' : 'text-red-600'}`}>
                      {results.classification} Dead Space Fraction
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                        {results.vdvtPercent.toFixed(1)}<span className="text-3xl ml-1 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold mt-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                       Ratio (Vd/Vt) = {results.vdvtRatio.toFixed(3)}
                    </div>
                  </div>
                  {results.classification !== 'Normal' && <AlertCircle className={`absolute -bottom-4 -right-4 h-32 w-32 opacity-10 ${results.classification === 'Elevated' ? 'text-amber-500' : 'text-red-500'}`} />}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Clinical Interpretation */}
                  <div className="bg-card border border-border rounded-lg p-5 shadow-sm h-full flex flex-col">
                    <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-3">Clinical Interpretation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                      {results.clinicalInterpretation}
                    </p>
                    {results.absoluteDeadSpace && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground font-semibold mb-1">Calculated Absolute Dead Space Volume:</div>
                        <div className="text-lg font-bold text-foreground">{results.absoluteDeadSpace.toFixed(0)} mL <span className="text-xs font-normal text-muted-foreground">(per breath)</span></div>
                      </div>
                    )}
                  </div>

                  {/* Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[240px] shadow-sm">
                    <h3 className="text-sm font-bold mb-2 w-full text-left">Ventilation Efficiency</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <RechartsPieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70}
                          paddingAngle={2} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col items-center gap-y-1.5 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                          {d.name} ({d.value.toFixed(1)}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Wind className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter PaCO2 and PeCO2 values to calculate the dead space fraction (Vd/Vt) and assess pulmonary efficiency.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Dead Space Fraction (Vd/Vt) Calculator</h2>
            <p>Mechanical ventilation is a life-saving intervention, but managing a patient on a ventilator requires deep insight into pulmonary mechanics. One of the most critical metrics of lung efficiency is the <strong>Dead Space Fraction (Vd/Vt)</strong>. Our Dead Space Fraction Calculator uses the classic Bohr-Enghoff equation to determine exactly how much of a patient's breathing is "wasted" ventilation. By inputting the arterial CO2 (PaCO2) and the mixed expired CO2 (PeCO2), clinicians can rapidly assess the severity of ventilation-perfusion (V/Q) mismatch, guide ventilator weaning strategies, and predict patient mortality in severe respiratory failure.</p>

            <h2 className="text-2xl font-bold mb-3">What is Pulmonary Dead Space?</h2>
            <p>In a perfectly efficient lung, every milliliter of air inhaled would reach an alveolus that is surrounded by a rushing capillary of blood, allowing for perfect oxygen and carbon dioxide exchange. In reality, the human respiratory system is not perfectly efficient. <strong>Dead space</strong> refers to the volume of air that enters the respiratory tract but does not participate in gas exchange.</p>
            <p>Dead space is broken down into two components:</p>
            <ul>
              <li><strong>Anatomic Dead Space:</strong> This is the volume of the conducting airways—the mouth, trachea, and bronchi. Air must travel through these pipes to reach the lungs, but the thick walls of the trachea cannot exchange gas. In a healthy adult, anatomic dead space is roughly 150 mL (or about 2 mL per kilogram of ideal body weight).</li>
              <li><strong>Alveolar Dead Space:</strong> This occurs deep within the lungs. If an alveolus fills with fresh air, but the blood vessel surrounding it is blocked (such as by a pulmonary embolism) or destroyed (as in severe emphysema), that air is effectively wasted. No blood is present to drop off CO2 or pick up oxygen.</li>
            </ul>
            <p><strong>Physiological Dead Space</strong> is the sum of both Anatomic and Alveolar dead space. The Dead Space Fraction (Vd/Vt) tells us what percentage of a single breath (Tidal Volume, or Vt) is trapped in this physiological dead space.</p>

            <h2 className="text-2xl font-bold mb-3">The Bohr-Enghoff Equation Explained</h2>
            <p>In the late 1800s, Christian Bohr recognized that if a patient exhales air that contains very little CO2 compared to the CO2 in their blood, it means a large portion of their breath never interacted with the blood. His original equation required measuring the CO2 exactly at the alveolar level, which is clinically impractical.</p>
            <p>In 1938, Henrik Enghoff modified the equation to use the Arterial partial pressure of CO2 (PaCO2), which can be easily obtained from a standard Arterial Blood Gas (ABG) draw. The modern equation is:</p>
            <p><code>Vd/Vt = (PaCO2 - PeCO2) / PaCO2</code></p>
            <p>This simple mathematical ratio compares the CO2 trapped in the bloodstream (PaCO2) to the CO2 successfully exhaled by the patient over time (PeCO2). The wider the gap between the two numbers, the higher the dead space fraction.</p>

            <h2 className="text-2xl font-bold mb-3">Clinical Interpretations of Vd/Vt</h2>
            <p>A normal, healthy, spontaneously breathing adult has a Vd/Vt ratio of approximately <strong>0.20 to 0.33 (20% to 33%)</strong>. This means roughly a third of every breath is spent filling the trachea and bronchi. When this fraction rises, it signals profound pulmonary pathology.</p>

            <h3>1. Moderate Elevation (35% to 50%)</h3>
            <p>A moderate increase in dead space is frequently seen in conditions that alter pulmonary blood flow or over-distend the alveoli. This includes mild Acute Respiratory Distress Syndrome (ARDS), exacerbations of Chronic Obstructive Pulmonary Disease (COPD), or patients subjected to excessively high Positive End-Expiratory Pressure (PEEP) on a ventilator, which can physically compress pulmonary capillaries and create alveolar dead space.</p>

            <h3>2. Severe Elevation (&gt;50%)</h3>
            <p>A Vd/Vt greater than 0.50 is a hallmark of severe respiratory failure. This is classic for massive pulmonary embolisms (where a blood clot entirely blocks blood flow to a lung segment) or severe ARDS. In these states, the lungs are so inefficient that the patient must breathe twice or three times as fast just to clear their baseline CO2 production. This immense "Work of Breathing" rapidly fatigues the diaphragm. Patients with a Vd/Vt &gt; 0.60 almost universally fail attempts to be weaned off the ventilator and extubated.</p>

            <h2 className="text-2xl font-bold mb-3">Why is PeCO2 Difficult to Obtain?</h2>
            <p>While an ABG provides PaCO2 easily, getting a true PeCO2 (Mixed Expired CO2) is technologically challenging. PeCO2 is not the same as End-Tidal CO2 (EtCO2), which is the CO2 concentration at the very end of a single exhaled breath. PeCO2 is the average CO2 concentration of the <em>entire</em> exhaled volume over several minutes.</p>
            <p>Historically, this required having the patient breathe into a massive physical bag (a Douglas Bag) for several minutes, and then analyzing the captured gas. Today, advanced modern mechanical ventilators feature "volumetric capnography." These machines continuously measure breath-by-breath flow and CO2 concentration simultaneously, integrating the data to automatically display the PeCO2, allowing clinicians to input the values directly into our calculator at the bedside.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>The Dead Space Fraction is a powerful prognostic indicator in critical care medicine. It provides a direct mathematical window into the efficiency of pulmonary gas exchange. By calculating Vd/Vt, intensivists can objectively measure the severity of ARDS, optimize ventilator settings to minimize alveolar over-distension, and accurately assess whether a recovering patient possesses the respiratory efficiency required to successfully breathe on their own.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dead-space-fraction-calculator" />
          <PopularCalculators exclude="/calculator/dead-space-fraction-calculator" />
        </div>
      </div>
    </>
  );
}
