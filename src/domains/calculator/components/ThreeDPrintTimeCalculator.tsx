"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Printer, Calculator, Zap, Box, Layers, BarChart as BarChartIcon } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { 
  calculate3DPrint, 
  ThreeDPrintInputs, 
  PrinterClass, 
  MaterialType, 
  SupportUsage,
  PRINTER_PROFILES
} from "./threeDPrintLogic";
import { 
  ThreeDPrintPieChart, 
  ThreeDPrintImpactChart 
} from "./ThreeDPrintCharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, dec = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const defaultInputs: ThreeDPrintInputs = {
  modelVolume: 50,
  modelHeight: 100,
  infill: 20,
  wallCount: 3,
  layerHeight: 0.20,
  printSpeed: 60,
  material: "PLA",
  supportUsage: "None",
  printerClass: "Standard FDM",
  nozzleDiameter: 0.4,
  lineWidth: 0.48,
  travelSpeed: 150,
  acceleration: 1000,
  topLayers: 5,
  bottomLayers: 5,
  filamentPrice: 20,
  electricityRate: 0.15,
  printerPower: 150,
  efficiencyFactor: 90,
  brimRaftMaterial: 0,
  failedPrintBuffer: 0,
};

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", min, max, step, placeholder, disabled
}: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className={`relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${disabled ? "opacity-50" : ""}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const ThreeDPrintTimeCalculator = () => {
  // Basic Inputs
  const [modelVolume, setModelVolume] = useState("50");
  const [modelHeight, setModelHeight] = useState("100");
  const [infill, setInfill] = useState("20");
  const [wallCount, setWallCount] = useState("3");
  const [layerHeight, setLayerHeight] = useState("0.20");
  const [printSpeed, setPrintSpeed] = useState("60");
  const [material, setMaterial] = useState<MaterialType>("PLA");
  const [supportUsage, setSupportUsage] = useState<SupportUsage>("None");
  const [printerClass, setPrinterClass] = useState<PrinterClass>("Standard FDM");

  // Advanced Inputs
  const [showAdv, setShowAdv] = useState(false);
  const [nozzleDiameter, setNozzleDiameter] = useState("0.4");
  const [lineWidth, setLineWidth] = useState("0.48");
  const [travelSpeed, setTravelSpeed] = useState("150");
  const [acceleration, setAcceleration] = useState("1000");
  const [topLayers, setTopLayers] = useState("5");
  const [bottomLayers, setBottomLayers] = useState("5");
  const [filamentPrice, setFilamentPrice] = useState("20");
  const [electricityRate, setElectricityRate] = useState("0.15");
  const [printerPower, setPrinterPower] = useState("150");
  const [efficiencyFactor, setEfficiencyFactor] = useState("90");
  const [brimRaftMaterial, setBrimRaftMaterial] = useState("0");
  const [failedPrintBuffer, setFailedPrintBuffer] = useState("0");

  const printRef = useRef<HTMLDivElement>(null);

  // Auto-update linewidth when nozzle changes
  const handleNozzleChange = (val: string) => {
    setNozzleDiameter(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setLineWidth((num * 1.2).toFixed(2));
  };

  // Auto-update printer settings when class changes
  const handlePrinterClassChange = (val: string) => {
    setPrinterClass(val as PrinterClass);
    if (val !== "Custom") {
      const profile = PRINTER_PROFILES[val as Exclude<PrinterClass, "Custom">];
      setAcceleration(profile.acceleration.toString());
      setTravelSpeed(profile.travelSpeed.toString());
      setEfficiencyFactor(profile.efficiency.toString());
    }
  };

  const getInputs = (): ThreeDPrintInputs => ({
    modelVolume: parseFloat(modelVolume) || 0,
    modelHeight: parseFloat(modelHeight) || 0,
    infill: parseFloat(infill) || 0,
    wallCount: parseInt(wallCount) || 0,
    layerHeight: parseFloat(layerHeight) || 0.2,
    printSpeed: parseFloat(printSpeed) || 60,
    material,
    supportUsage,
    printerClass,
    nozzleDiameter: parseFloat(nozzleDiameter) || 0.4,
    lineWidth: parseFloat(lineWidth) || 0.48,
    travelSpeed: parseFloat(travelSpeed) || 150,
    acceleration: parseFloat(acceleration) || 1000,
    topLayers: parseInt(topLayers) || 5,
    bottomLayers: parseInt(bottomLayers) || 5,
    filamentPrice: parseFloat(filamentPrice) || 20,
    electricityRate: parseFloat(electricityRate) || 0.15,
    printerPower: parseFloat(printerPower) || 150,
    efficiencyFactor: parseFloat(efficiencyFactor) || 90,
    brimRaftMaterial: parseFloat(brimRaftMaterial) || 0,
    failedPrintBuffer: parseFloat(failedPrintBuffer) || 0,
  });

  const [calculatedInputs, setCalculatedInputs] = useState<ThreeDPrintInputs>(defaultInputs);
  const results = React.useMemo(() => calculate3DPrint(calculatedInputs), [calculatedInputs]);

  const handleCalculate = () => {
    setCalculatedInputs(getInputs());
    // Scroll to results on mobile
    printRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const reset = () => {
    setModelVolume("50"); setModelHeight("100"); setInfill("20"); setWallCount("3");
    setLayerHeight("0.20"); setPrintSpeed("60"); setMaterial("PLA"); setSupportUsage("None");
    setPrinterClass("Standard FDM"); setNozzleDiameter("0.4"); setLineWidth("0.48");
    setTravelSpeed("150"); setAcceleration("1000"); setTopLayers("5"); setBottomLayers("5");
    setFilamentPrice("20"); setElectricityRate("0.15"); setPrinterPower("150");
    setEfficiencyFactor("90"); setBrimRaftMaterial("0"); setFailedPrintBuffer("0");
    setCalculatedInputs(defaultInputs);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate format time string
  const hrs = Math.floor(results.actualPrintTimeSeconds / 3600);
  const mins = Math.floor((results.actualPrintTimeSeconds % 3600) / 60);
  const days = hrs > 24 ? Math.floor(hrs / 24) : 0;
  
  const completionDate = results.estimatedCompletionTime;
  const compDateStr = mounted ? completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "";
  const compTimeStr = mounted ? completionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "3D Print Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">3D Print Time Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            
            {/* MODEL INFO */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <Box className="h-4 w-4" /> Model Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="model-volume" label="Model Volume" value={modelVolume} onChange={setModelVolume} suffix="cm³" />
                <CompactInput id="model-height" label="Model Height" value={modelHeight} onChange={setModelHeight} suffix="mm" />
                <CompactInput id="infill" label="Infill" value={infill} onChange={setInfill} suffix="%" />
                <CompactInput id="wall-count" label="Wall Count" value={wallCount} onChange={setWallCount} />
              </div>
            </div>

            {/* PRINT SETTINGS */}
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <Layers className="h-4 w-4" /> Print Settings
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">Layer Height</label>
                  <select value={layerHeight} onChange={(e) => setLayerHeight(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-medium">
                    <option value="0.08">0.08 mm (Ultra Fine)</option>
                    <option value="0.12">0.12 mm (Fine)</option>
                    <option value="0.16">0.16 mm</option>
                    <option value="0.20">0.20 mm (Standard)</option>
                    <option value="0.28">0.28 mm</option>
                    <option value="0.32">0.32 mm</option>
                  </select>
                </div>
                <CompactInput id="print-speed" label="Print Speed" value={printSpeed} onChange={setPrintSpeed} suffix="mm/s" />
                
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">Material</label>
                  <select value={material} onChange={(e) => setMaterial(e.target.value as MaterialType)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-medium">
                    {["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">Support Usage</label>
                  <select value={supportUsage} onChange={(e) => setSupportUsage(e.target.value as SupportUsage)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-medium">
                    <option value="None">None</option>
                    <option value="Light">Light (5%)</option>
                    <option value="Medium">Medium (10%)</option>
                    <option value="Heavy">Heavy (20%)</option>
                  </select>
                </div>

                <div className="col-span-2 flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">Printer Class</label>
                  <select value={printerClass} onChange={(e) => handlePrinterClassChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-medium">
                    <option value="Budget FDM">Budget FDM (Ender 3, etc.)</option>
                    <option value="Standard FDM">Standard FDM (Prusa MK3/4, etc.)</option>
                    <option value="Fast CoreXY">Fast CoreXY (Bambu P1P/X1, K1)</option>
                    <option value="High Speed CoreXY">High Speed CoreXY (Voron, VZBot)</option>
                    <option value="Custom">Custom Settings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="-mt-3">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nozzle & Extrusion</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-foreground mb-1">Nozzle Diameter</label>
                        <select value={nozzleDiameter} onChange={(e) => handleNozzleChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-medium">
                          <option value="0.2">0.2 mm</option>
                          <option value="0.4">0.4 mm</option>
                          <option value="0.6">0.6 mm</option>
                          <option value="0.8">0.8 mm</option>
                        </select>
                      </div>
                      <CompactInput id="line-width" label="Line Width" value={lineWidth} onChange={setLineWidth} suffix="mm" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Travel & Layers</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="travel-speed" label="Travel Speed" value={travelSpeed} onChange={setTravelSpeed} suffix="mm/s" />
                      <CompactInput id="acceleration" label="Acceleration" value={acceleration} onChange={setAcceleration} suffix="mm/s²" />
                      <CompactInput id="top-layers" label="Top Layers" value={topLayers} onChange={setTopLayers} />
                      <CompactInput id="bottom-layers" label="Bottom Layers" value={bottomLayers} onChange={setBottomLayers} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cost & Efficiency</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="filament-price" label="Filament Price" value={filamentPrice} onChange={setFilamentPrice} prefix="$" suffix="/kg" />
                      <CompactInput id="electricity-rate" label="Electricity Rate" value={electricityRate} onChange={setElectricityRate} prefix="$" suffix="/kWh" />
                      <CompactInput id="printer-power" label="Printer Power" value={printerPower} onChange={setPrinterPower} suffix="W" />
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-foreground mb-1">Efficiency ({efficiencyFactor}%)</label>
                        <input type="range" min="70" max="110" value={efficiencyFactor} onChange={(e) => setEfficiencyFactor(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Additional Material</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="brim-raft" label="Brim / Raft" value={brimRaftMaterial} onChange={setBrimRaftMaterial} suffix="%" />
                      <CompactInput id="fail-buffer" label="Failed Print Buffer" value={failedPrintBuffer} onChange={setFailedPrintBuffer} suffix="%" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 -mt-1">
              <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section" ref={printRef}>
            
            {/* HERO CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden flex flex-col items-center justify-center">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Print Time</div>
              <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-1">
                {days > 0 ? `${days}d ` : ""}{hrs % 24}h {mins}m
              </div>
              
              <div className="mt-4 flex flex-col items-center gap-1 bg-background/50 border border-primary/10 rounded-lg p-3 w-full max-w-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Completion</p>
                <p className="text-sm font-semibold text-foreground">
                  Start Now → <span className="font-extrabold text-primary">{compDateStr} at {compTimeStr}</span>
                </p>
              </div>
            </div>

            {/* QUALITY SCORE & COMPACT SUMMARY */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 border border-border rounded-lg">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Quality Score</span>
                <span className="font-extrabold text-foreground text-lg">{results.qualityScore}/100</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white mt-1 
                  ${results.qualityScore >= 85 ? "bg-purple-500" : results.qualityScore >= 60 ? "bg-emerald-500" : results.qualityScore >= 30 ? "bg-blue-500" : "bg-orange-500"}`}>
                  {results.qualityBadge}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 border border-border rounded-lg text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Complexity</span>
                <span className="font-extrabold text-foreground text-sm mt-1">{results.printComplexity}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 border border-border rounded-lg text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Layers</span>
                <span className="font-extrabold text-foreground text-lg">{fmtInt(results.layerCount)}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 border border-border rounded-lg text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg Layer Time</span>
                <span className="font-extrabold text-foreground text-lg">{results.averageLayerTime.toFixed(1)}s</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 border border-border rounded-lg text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Filament Needed</span>
                <span className="font-extrabold text-foreground text-lg">{results.filamentLengthMeters.toFixed(1)}m</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic text-center px-4">
              Estimated using volumetric flow and kinematic path approximation. Actual slicer-generated print times may vary by 5–15%.
            </p>

            {/* COST BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="p-3 font-bold text-foreground">Cost Category</th>
                    <th className="p-3 font-bold text-foreground text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 text-muted-foreground font-medium">Model Material ({fmt(results.filamentWeightKg * 1000)}g)</td>
                    <td className="p-3 font-semibold text-foreground text-right">${fmt(results.modelMaterialCost)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-medium">Support Material</td>
                    <td className="p-3 font-semibold text-foreground text-right">${fmt(results.supportMaterialCost)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-medium">Waste Buffer</td>
                    <td className="p-3 font-semibold text-foreground text-right">${fmt(results.wasteBufferCost)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-medium">Electricity</td>
                    <td className="p-3 font-semibold text-foreground text-right">${fmt(results.electricityCost)}</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="p-3 font-bold text-primary">Total Estimated Cost</td>
                    <td className="p-3 font-extrabold text-primary text-right">${fmt(results.totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="card-calculator !p-4 flex flex-col items-center">
                <h4 className="text-sm font-bold text-foreground mb-4">Cost Breakdown</h4>
                <ThreeDPrintPieChart data={results.pieData} />
              </div>
              <div className="card-calculator !p-4 flex flex-col items-center">
                <h4 className="text-sm font-bold text-foreground mb-4">Time Impact Analysis</h4>
                <ThreeDPrintImpactChart data={results.timeImpacts} />
              </div>
            </div>
            
            <div className="card-calculator !p-4 flex flex-col items-center mt-2">
              <h4 className="text-sm font-bold text-foreground mb-4">Layer Progress Over Time</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="timeHrs" tickFormatter={(val: number) => `${val.toFixed(1)}h`} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value: number) => [Math.round(value), "Layers"]} labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}h`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="layer" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RECOMMENDATIONS ENGINE */}
            {results.recommendations.length > 0 && (
              <div className="card-calculator !p-5 mt-2 bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/20">
                <h3 className="text-base font-bold text-blue-600 flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4" /> Optimization Insights
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <div>
                        <span className="font-semibold text-foreground block">{rec.title}</span>
                        <span className="text-muted-foreground">{rec.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a 3D Print Time Calculator?</h2>
            <p>
              A <strong>3D Print Time Calculator</strong> is an advanced planning tool designed to estimate how long a 3D model will take to manufacture using Fused Deposition Modeling (FDM) or other additive manufacturing technologies. For hobbyists, engineers, and print farm operators, time is the ultimate bottleneck. This calculator uses volumetric flow algorithms, kinematic limits, and slicer approximations to give you a highly accurate preview of your print duration without needing to open resource-heavy slicing software like Cura or PrusaSlicer.
            </p>
            <p>
              Beyond just time, our calculator acts as a comprehensive cost-estimator. By evaluating your material usage (filament weight), electricity consumption, and printer efficiency, it calculates the true financial cost of your production run. Whether you are pricing a print job for a client or just wondering if your weekend project will finish before Monday, this tool provides the analytical insight needed to optimize your 3D printing workflow.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Mechanics of 3D Print Time</h2>
            <p>
              3D printing is inherently slow because it creates objects one microscopic layer at a time. The time it takes to finish a print is dictated by the sheer volume of material being extruded and the physical speed limits of the machine's stepper motors. To calculate this mathematically, we look at the <strong>volumetric flow rate</strong>—the amount of plastic (in cubic millimeters per second) that the printer's hotend can melt and push through the nozzle.
            </p>
            <p>
              However, print time isn't just a simple equation of <code>Volume / Flow Rate</code>. The printer's toolhead must constantly slow down for corners, accelerate on straightaways, and stop completely to retract filament and travel across empty space. This is where <strong>acceleration and jerk (or square corner velocity)</strong> come into play. A printer might have a maximum speed of 300mm/s, but if its acceleration is low, it will never actually reach that speed on small models.
            </p>

            <h2 className="text-2xl font-bold mb-3">Key Factors That Influence Print Time</h2>
            <p>
              If you want to speed up your 3D prints, you need to understand which levers to pull. Adjusting the following settings will have the most significant impact on your production time:
            </p>
            <h3>1. Layer Height (Z-Resolution)</h3>
            <p>
              Layer height is the single most powerful setting for reducing print time. If you change your layer height from 0.12mm (Fine) to 0.24mm (Draft), you are effectively cutting the number of required layers in half. Because the printer has to make half as many passes, your print time will decrease by roughly 40-50%. For structural parts, brackets, or rapid prototypes, always use the thickest layer height your nozzle will allow (typically up to 75% of your nozzle diameter).
            </p>
            <h3>2. Infill Density and Pattern</h3>
            <p>
              Infill is the internal structure of your print. Many beginners assume that 100% infill is required for strong parts, but this is a massive waste of time and material. Most of a part's mechanical strength comes from its outer walls (perimeters). Reducing infill from 50% to 15% and increasing your wall count from 2 to 4 will yield a stronger part while drastically cutting print time, as the printer spends less time zigzagging across the interior of the model. Additionally, using fast infill patterns like "Lightning" or "Grid" prints faster than complex 3D patterns like "Gyroid."
            </p>
            <h3>3. Print Speed and Acceleration</h3>
            <p>
              While increasing the print speed from 60mm/s to 120mm/s seems like it should cut your time in half, it rarely does. This is due to acceleration limits. If your printer's acceleration is set to 500mm/s², the toolhead takes too long to get up to speed. Upgrading to a printer running Klipper firmware (like a Voron or Bambu Lab) allows for accelerations of 10,000mm/s² or more, which actually allows the machine to achieve those high top speeds, resulting in massive time savings.
            </p>
            <h3>4. Nozzle Diameter</h3>
            <p>
              The standard nozzle size is 0.4mm, but swapping to a 0.6mm or 0.8mm nozzle is a cheat code for fast printing. A 0.6mm nozzle prints lines that are 50% wider and allows for thicker layer heights. This exponentially increases your volumetric flow, often cutting print times by 60% with only a minor loss in horizontal detail. For large, functional prints, a larger nozzle is essential.
            </p>
            <h3>5. Supports and Adhesion</h3>
            <p>
              Printing overhanging geometry requires support material. Generating, printing, and removing supports adds massive amounts of time and wastes plastic. Designing your models to print without supports (keeping overhangs below 45 degrees) is the best optimization. If supports are unavoidable, utilizing "Tree" or "Organic" supports instead of standard grid supports will save significant time and material.
            </p>

            <h2 className="text-2xl font-bold mb-3">How to Interpret Your Results</h2>
            <p>
              When you generate an estimate using our calculator, you will receive a suite of analytics. Here is how to use them effectively:
            </p>
            <ul>
              <li><strong>Estimated Print Time:</strong> The headline metric, broken down into days, hours, and minutes. Use this to schedule your print farm or decide if you should start a print before leaving for work.</li>
              <li><strong>Quality Score:</strong> A synthesized metric that evaluates your chosen settings. If you select a 0.08mm layer height with a 0.8mm nozzle, your quality score will plummet, warning you of an incompatible configuration.</li>
              <li><strong>Filament Needed:</strong> Provided in both meters and grams. Always check your spool's remaining weight against this metric to ensure you don't run out of filament mid-print.</li>
              <li><strong>Cost Breakdown Table:</strong> This shows exactly where your money is going. While filament is usually the largest expense, if you are running a 50-hour print on a power-hungry machine in an area with high electricity rates, your power bill might surprise you.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Hidden Costs of 3D Printing</h2>
            <p>
              Many users dramatically underestimate the cost of 3D printing because they only look at the price of the plastic. Our calculator incorporates the hidden variables:
            </p>
            <p>
              <strong>Electricity:</strong> Heating a print bed to 100°C for ABS and running stepper motors for 30 hours requires significant energy.
              <br/>
              <strong>Waste and Failure:</strong> Support material is pure waste. Furthermore, 3D printing is not perfect. Incorporating a "Failed Print Buffer" percentage ensures that when you quote a price to a client, you are protected against warped corners, clogged nozzles, or spaghetti failures that force a reprint.
            </p>

            <h2 className="text-2xl font-bold mb-3">Advanced Optimization Techniques</h2>
            <p>
              For users operating print farms or commercial businesses, maximizing throughput is the key to profitability. Use the Advanced Options panel to fine-tune your operations:
            </p>
            <p>
              <strong>Variable Layer Height:</strong> Slicers allow you to use thick layers for vertical sections of a model and thin layers for curved sections. This provides the speed of a draft print with the quality of a fine print.
            </p>
            <p>
              <strong>Optimize Travel Moves:</strong> Enable "Combing" or "Avoid Printed Parts" in your slicer to keep the nozzle inside the printed object during travel moves. This reduces retractions (which take time) and improves speed.
            </p>
            <p>
              <strong>Sequential Printing:</strong> If printing multiple small objects, use the "Print One at a Time" setting. Instead of completing layer 1 for all objects, the printer finishes object A completely before moving to object B. This drastically reduces travel time between parts and ensures that if the print fails halfway through, you still get half of your parts.
            </p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>
              3D printing is a balancing act between speed, strength, and aesthetic quality. By using our 3D Print Time Calculator, you remove the guesswork from your manufacturing workflow. Tweak your layer heights, simulate a nozzle swap, and optimize your infill before you ever generate a G-code file, ensuring your printers are always running at peak efficiency.
            </p>
          </section>
          <FAQSection faqs={[
            { question: "How accurate is this print time estimate?", answer: "This tool uses a mathematical volumetric-flow approximation, simulating the volume of plastic extruded against your printer's kinematic limits. It assumes your printer can sustain the requested flow rate and uses a generic efficiency factor to account for acceleration and travel. Actual print times in a slicer like Cura or PrusaSlicer may vary by 5-15% based on complex, specific model geometries." },
            { question: "Why is electricity cost so low?", answer: "A 3D printer draws significant peak power (e.g., 300W+) while initially heating the bed and nozzle, but it settles to a much lower average (e.g., 100W-150W) during the actual printing process. At an average US rate of $0.15/kWh, printing for 10 hours usually costs less than $0.25 in electricity." },
            { question: "What is the failed print risk buffer?", answer: "If you run a print farm or print difficult, warp-prone materials (like ABS or Nylon), you will occasionally experience failed prints (the infamous 'spaghetti' failure). The risk buffer lets you add a percentage markup to your estimated costs to mathematically account for wasted plastic over time, ensuring your client pricing remains profitable." },
            { question: "Will a larger nozzle reduce my print time?", answer: "Yes, drastically. Switching from a standard 0.4mm nozzle to a 0.6mm nozzle increases your volumetric flow significantly. It allows you to print thicker, wider lines, meaning fewer perimeters and fewer Z-axis movements are required to build the same object. This can cut print times by 40-60%." },
            { question: "Should I use 100% infill for maximum strength?", answer: "No. Diminishing returns on part strength happen rapidly after 40% infill. If you need a mechanically strong, functional part, it is much faster and more effective to increase your 'Wall Count' (perimeters) from 2 to 4 or 5, while keeping infill around 15-25%." },
            { question: "Why doesn't my print finish faster when I double the print speed?", answer: "Because of 'Acceleration' and 'Jerk'. If you set your speed to 120mm/s, the print head needs enough physical space on a straight line to accelerate up to that speed. For small models with lots of corners, the printer is constantly slowing down to turn, meaning it rarely actually reaches your top commanded speed." },
            { question: "Does the type of filament change the print time?", answer: "Yes. Flexible filaments like TPU must be printed very slowly (often 20-30mm/s) to prevent the filament from buckling in the extruder gears. PETG is generally printed slower than PLA to ensure good layer adhesion. High-speed PLAs can be printed exceptionally fast on modern CoreXY machines." }
          ]} pageUrl="https://racira.com/calculator/3d-print-time-calculator" />
          <PopularCalculators exclude="/calculator/3d-print-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default ThreeDPrintTimeCalculator;
