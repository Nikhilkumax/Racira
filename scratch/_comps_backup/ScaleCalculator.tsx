"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calculator, RotateCcw, Printer, Ruler, Info, ArrowLeftRight, Check, Copy } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import {
  calculateScale,
  formatSmartNumber,
  getQuantityConfig,
  ARCHITECTURAL_PRESETS,
  type ScaleInputs,
  type ScaleMode,
  type SolveTarget,
  type ScaleResult,
  type QuantityType,
  type RatioType,
} from "./scaleLogic";

const MODES: { id: ScaleMode; title: string; subtitle: string }[] = [
  { id: "one-to-x", title: "1 : X Scale", subtitle: "Metric & engineering ratios (e.g. 1:100)" },
  { id: "inches-to-the-foot", title: "Inches to Foot", subtitle: "Architectural drawings (e.g. 1/4\" = 1'-0\")" },
  { id: "scale-factor", title: "Scale Factor", subtitle: "Decimal multipliers (e.g. 0.01 or 5x)" },
  { id: "convert-units-only", title: "Convert Units Only", subtitle: "1:1 direct unit conversion" },
];

const PRESET_RATIOS = ["20", "50", "100", "200", "500"];

const QUANTITY_TABS: { id: QuantityType; label: string }[] = [
  { id: "length", label: "Length" },
  { id: "area", label: "Area" },
  { id: "volume", label: "Volume" },
  { id: "mass", label: "Mass" },
  { id: "temperature", label: "Temperature" },
  { id: "angle", label: "Angle" },
];

export default function ScaleCalculator() {
  const [quantityType, setQuantityType] = useState<QuantityType>("length");
  const [dpi, setDpi] = useState("96");
  const [ratioType, setRatioType] = useState<RatioType>("reduction");
  const [mode, setMode] = useState<ScaleMode>("one-to-x");
  const [solveFor, setSolveFor] = useState<SolveTarget>("reality");

  const [scaleValue, setScaleValue] = useState("15");
  const [scaleUnit, setScaleUnit] = useState("cm");

  const [oneToXRatio, setOneToXRatio] = useState("100");
  const [archPresetIndex, setArchPresetIndex] = useState(4); // 1/4" = 1'-0"
  const [archMode, setArchMode] = useState<"preset" | "custom">("preset");
  const [archCustomInches, setArchCustomInches] = useState("0.25");
  const [scaleFactor, setScaleFactor] = useState("0.01");

  const [realValue, setRealValue] = useState("15");
  const [realUnit, setRealUnit] = useState("m");

  const printRef = useRef<HTMLDivElement>(null);

  const numDpi = parseFloat(dpi) || 96;
  const currentConfig = getQuantityConfig(quantityType, numDpi);

  const isNonSpatial = quantityType === "temperature" || quantityType === "angle";

  const getInputs = (overrides?: Partial<ScaleInputs>): ScaleInputs => ({
    quantityType,
    dpi: numDpi,
    ratioType,
    mode: isNonSpatial ? "convert-units-only" : mode,
    solveFor: isNonSpatial && solveFor === "ratio" ? "reality" : solveFor,
    scaleValue,
    scaleUnit,
    oneToXRatio,
    archPresetIndex,
    archCustomInches,
    archMode,
    scaleFactor,
    realValue,
    realUnit,
    ...overrides,
  });

  const defaultInputs: ScaleInputs = {
    quantityType: "length",
    dpi: 96,
    ratioType: "reduction",
    mode: "one-to-x",
    solveFor: "reality",
    scaleValue: "15",
    scaleUnit: "cm",
    oneToXRatio: "100",
    archPresetIndex: 4,
    archCustomInches: "0.25",
    archMode: "preset",
    scaleFactor: "0.01",
    realValue: "15",
    realUnit: "m",
  };

  const [results, setResults] = useState<ScaleResult>(() => calculateScale(defaultInputs));

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = sessionStorage.getItem("scaleCalculatorState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.quantityType) {
          setQuantityType(parsed.quantityType);
          const config = getQuantityConfig(parsed.quantityType, numDpi);
          setScaleUnit(parsed.scaleUnit ?? config.defaultScaleUnit);
          setRealUnit(parsed.realUnit ?? config.defaultRealUnit);
          
          if (parsed.quantityType === "temperature" || parsed.quantityType === "angle") {
            setMode("convert-units-only");
            setSolveFor("reality");
          }
          
          // Re-calculate with loaded settings
          setTimeout(() => {
             setResults(calculateScale(getInputs({
               quantityType: parsed.quantityType,
               scaleUnit: parsed.scaleUnit ?? config.defaultScaleUnit,
               realUnit: parsed.realUnit ?? config.defaultRealUnit,
               mode: (parsed.quantityType === "temperature" || parsed.quantityType === "angle") ? "convert-units-only" : mode,
               solveFor: (parsed.quantityType === "temperature" || parsed.quantityType === "angle") ? "reality" : solveFor,
             })));
          }, 0);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      sessionStorage.setItem(
        "scaleCalculatorState",
        JSON.stringify({ quantityType, scaleUnit, realUnit })
      );
    }
  }, [isClient, quantityType, scaleUnit, realUnit]);


  const handleCalculate = () => {
    const inputs = getInputs();
    setResults(calculateScale(inputs));
  };

  const handleQuantityChange = (newType: QuantityType) => {
    setQuantityType(newType);
    const newConfig = getQuantityConfig(newType, numDpi);
    const newScaleUnit = newConfig.defaultScaleUnit;
    const newRealUnit = newConfig.defaultRealUnit;
    setScaleUnit(newScaleUnit);
    setRealUnit(newRealUnit);

    let nextMode = mode;
    let nextSolveFor = solveFor;

    if (newType === "temperature" || newType === "angle") {
      nextMode = "convert-units-only";
      if (solveFor === "ratio") nextSolveFor = "reality";
      setMode("convert-units-only");
      if (solveFor === "ratio") setSolveFor("reality");
    }

    const nextInputs = getInputs({
      quantityType: newType,
      scaleUnit: newScaleUnit,
      realUnit: newRealUnit,
      mode: nextMode,
      solveFor: nextSolveFor,
    });
    setResults(calculateScale(nextInputs));
  };

  const handleReset = () => {
    setQuantityType("length");
    setDpi("96");
    setRatioType("reduction");
    setMode("one-to-x");
    setSolveFor("reality");
    setScaleValue("15");
    setScaleUnit("cm");
    setOneToXRatio("100");
    setArchPresetIndex(4);
    setArchMode("preset");
    setArchCustomInches("0.25");
    setScaleFactor("0.01");
    setRealValue("15");
    setRealUnit("m");
    setResults(calculateScale(defaultInputs));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleRatioType = () => {
    const nextType: RatioType = ratioType === "reduction" ? "enlargement" : "reduction";
    setRatioType(nextType);
    const nextInputs = getInputs({ ratioType: nextType });
    setResults(calculateScale(nextInputs));
  };

  const handleSnapToStandardScale = () => {
    if (!results.nearestStandardScale) return;
    const standard = results.nearestStandardScale;
    // Derive the denominator from the ratio (e.g. ratio=1/96 → x=96)
    const x = standard.ratio < 1 ? Math.round(1 / standard.ratio) : Math.round(standard.ratio);
    const newRatioType: RatioType = standard.ratio < 1 ? "reduction" : "enlargement";
    const formattedX = String(x);

    setMode("one-to-x");
    setRatioType(newRatioType);
    setOneToXRatio(formattedX);
    setSolveFor("reality");

    const nextInputs = getInputs({
      mode: "one-to-x",
      ratioType: newRatioType,
      oneToXRatio: formattedX,
      solveFor: "reality",
    });
    setResults(calculateScale(nextInputs));
  };

  const handleSnapToRatio = (ratio: number) => {
    if (isNonSpatial) return;
    setMode("one-to-x");
    const newRatioType = ratio < 1 ? "reduction" : "enlargement";
    setRatioType(newRatioType);
    const x = ratio < 1 ? 1 / ratio : ratio;
    const formattedX = formatSmartNumber(x, 4).toString();
    setOneToXRatio(formattedX);
    
    const nextInputs = getInputs({
      mode: "one-to-x",
      ratioType: newRatioType,
      oneToXRatio: formattedX,
    });
    setResults(calculateScale(nextInputs));
    
    // Optional: scroll to top so user sees the snapped values
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Live Badge Calculation ────────────────────────────────────────────────
  const sNum = parseFloat(scaleValue) || 0;
  const rNum = parseFloat(realValue) || 0;
  let liveRatioBadge = "";

  if (isNonSpatial || mode === "convert-units-only") {
    liveRatioBadge = "1:1";
  } else if (solveFor === "ratio") {
    if (sNum > 0 && rNum > 0) {
      const sBase = sNum * (currentConfig.factors[scaleUnit] ?? 1);
      const rBase = rNum * (currentConfig.factors[realUnit] ?? 1);
      if (rBase > 0) {
        const ratio = sBase / rBase;
        if (ratio < 1) {
          const x = 1 / ratio;
          liveRatioBadge = `≈ 1:${formatSmartNumber(x, 2)}`;
        } else {
          liveRatioBadge = `≈ ${formatSmartNumber(ratio, 2)}:1`;
        }
      }
    }
  } else {
    switch (mode) {
      case "one-to-x": {
        const x = parseFloat(oneToXRatio) || 0;
        if (x > 0) {
          liveRatioBadge = ratioType === "enlargement" ? `${formatSmartNumber(x, 2)}:1` : `1:${formatSmartNumber(x, 2)}`;
        }
        break;
      }
      case "inches-to-the-foot": {
        if (archMode === "preset") {
          const preset = ARCHITECTURAL_PRESETS[archPresetIndex] ?? ARCHITECTURAL_PRESETS[4];
          liveRatioBadge = preset.ratioText;
        } else {
          const inches = parseFloat(archCustomInches) || 0;
          if (inches > 0) liveRatioBadge = `1:${formatSmartNumber(12 / inches, 2)}`;
        }
        break;
      }
      case "scale-factor": {
        const f = parseFloat(scaleFactor) || 0;
        if (f > 0) liveRatioBadge = f < 1 ? `1:${formatSmartNumber(1 / f, 2)}` : `${formatSmartNumber(f, 2)}:1`;
        break;
      }
    }
  }

  const quantityNoun =
    quantityType === "length"
      ? "Length"
      : quantityType === "area"
      ? "Area"
      : quantityType === "volume"
      ? "Volume"
      : quantityType === "mass"
      ? "Mass"
      : quantityType === "temperature"
      ? "Temperature"
      : "Angle";

  const solvedLabelText =
    results.solveFor === "reality"
      ? `Solved Reality ${quantityNoun}`
      : results.solveFor === "scale"
      ? `Solved Scale ${quantityNoun}`
      : "Solved Scale Ratio";

  const solvedDisplayValue =
    results.solveFor === "ratio"
      ? results.scaleRatioText
      : formatSmartNumber(results.solvedValue, 4);

  const solvedUnitText = results.solveFor === "ratio" ? "" : results.solvedUnit;

  const faqs = [
    {
      question: "How does scale calculation work across different quantity types?",
      answer:
        "A scale ratio represents the proportional relationship between a measurement on a drawing (or model) and the actual full-size dimension in reality. For linear dimensions, area, volume, and mass, the calculator normalizes values into standard base units (meters, square meters, cubic meters, grams) before applying the scale ratio. Scale factors are applied linearly matching engineering standard practices.",
    },
    {
      question: "How are temperature and angle conversions handled?",
      answer:
        "Temperature and angle measurements represent intensive physical quantities rather than spatial dimensions. Temperature conversions use affine equations with Kelvin as the thermodynamic reference point (°C = K - 273.15, °F = K × 9/5 - 459.67). Scale ratios are not applicable to temperature and angle, locking the calculator into direct high-precision unit conversion mode.",
    },
    {
      question: "How does the Screen / Print DPI setting affect pixels (px)?",
      answer:
        "Pixels are digital display units without a fixed physical size. To resolve pixels into real-world lengths, the calculator uses the formula: 1 pixel = 0.0254 meters / DPI. At standard CSS web resolution (96 DPI), 1 pixel equals 0.2646 mm. You can customize the DPI field (e.g. 72 for traditional desktop print, 300 for high-resolution photo print) to match your exact output medium.",
    },
    {
      question: "What is the 1:X ⇄ X:1 toggle button used for?",
      answer:
        "The toggle button switches between reduction scale (1:X, where the drawing or model is smaller than reality, standard for blueprints and maps) and enlargement scale (X:1, where the drawing or model is larger than reality, standard for watchmaking, precision machining, and microelectronics).",
    },
    {
      question: "What happens when I click 'Use this scale' on a non-standard ratio?",
      answer:
        "When solving for scale ratio from measured values, real-world measurements often produce irregular decimal ratios (e.g. 1:97.3). The calculator automatically detects the nearest standard scale (such as 1:100 or 1:96) and displays an instant recommendation. Clicking 'Use this scale' snaps your scale drawing value to perfectly match the nearest industry standard.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

      {/* Breadcrumbs matching gold standard hierarchy */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator/construction" },
          { label: "Measurement & Layout", href: "/calculator/measurement-and-layout" },
          { label: "Scale Calculator" },
        ]}
      />

      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Scale Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ── LEFT: INPUT PANEL ─────────────────────────────────────────── */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            {/* Header with Icon */}
            <div className="flex items-center gap-2 pb-2 border-b border-border text-primary font-bold text-sm tracking-wide uppercase">
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </div>

            {/* 1. QUANTITY TYPE SELECTOR (All 6 Types) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Quantity Type</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-lg bg-secondary/30 border border-border">
                {QUANTITY_TABS.map((tab) => {
                  const isActive = quantityType === tab.id;
                  const unitCount = getQuantityConfig(tab.id, numDpi).allUnits.length;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleQuantityChange(tab.id)}
                      className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-md transition-all text-center min-w-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span className="text-[11px] sm:text-[11px] xl:text-xs font-bold leading-tight tracking-tight whitespace-nowrap block">
                        {tab.label}
                      </span>
                      <span className={`text-[9px] leading-tight mt-0.5 whitespace-nowrap ${isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                        {unitCount} units
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* DPI / Resolution Setting (Length Only) */}
              {quantityType === "length" && (
                <div className="flex items-center justify-between px-2.5 py-1.5 mt-1 bg-secondary/20 rounded-md border border-border/70 text-xs">
                  <span className="text-muted-foreground font-medium">
                    Screen / Print Resolution (for px):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="dpi-input"
                      type="number"
                      min="1"
                      max="9600"
                      step="1"
                      value={dpi}
                      onChange={(e) => setDpi(e.target.value)}
                      placeholder="96"
                      className="w-16 h-6 px-1.5 text-xs font-semibold rounded border border-input bg-background text-foreground text-right outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-[11px] font-mono text-muted-foreground">DPI</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. INPUT MODE: 2x2 RADIO GRID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Input Mode</span>
                {isNonSpatial && (
                  <span className="text-[11px] text-amber-600 font-medium">
                    Direct conversion only for {quantityNoun}
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => {
                  const isDisabled = isNonSpatial && m.id !== "convert-units-only";
                  const isSelected = (isNonSpatial ? "convert-units-only" : mode) === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        setMode(m.id);
                        if (solveFor === "ratio" && m.id === "convert-units-only") {
                          setSolveFor("reality");
                        }
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                        isDisabled
                          ? "opacity-40 bg-secondary/10 border-border cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-card hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/50"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-foreground truncate">{m.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{m.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SOLVE FOR TARGET SELECTOR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Solve For
              </label>
              <div className={`grid ${isNonSpatial ? "grid-cols-2" : "grid-cols-3"} gap-1.5 p-1 rounded-lg bg-secondary/30 border border-border`}>
                <button
                  type="button"
                  onClick={() => setSolveFor("reality")}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    solveFor === "reality"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Reality {quantityNoun}
                </button>
                <button
                  type="button"
                  onClick={() => setSolveFor("scale")}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    solveFor === "scale"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Scale {quantityNoun}
                </button>
                {!isNonSpatial && (
                  <button
                    type="button"
                    disabled={mode === "convert-units-only"}
                    onClick={() => setSolveFor("ratio")}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      mode === "convert-units-only"
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : solveFor === "ratio"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Scale Ratio
                  </button>
                )}
              </div>
            </div>

            {/* ── 3 LINKED FIELDS ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 pt-1">
              {/* FIELD 1: VALUE IN SCALE */}
              <div className="flex flex-col">
                <label htmlFor="scale-value" className="text-sm font-semibold text-foreground mb-1">
                  Value in Scale (Drawing / Model)
                  {solveFor === "scale" && (
                    <span className="ml-2 text-xs font-bold text-primary">(Solving for this)</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input
                      id="scale-value"
                      type="number"
                      step="any"
                      min={isNonSpatial ? undefined : "0"}
                      disabled={solveFor === "scale"}
                      value={solveFor === "scale" ? formatSmartNumber(results.solvedValue, 4) : scaleValue}
                      onChange={(e) => setScaleValue(e.target.value)}
                      placeholder="e.g. 15"
                      className={`w-full h-full px-3 text-base bg-transparent outline-none border-none ${
                        solveFor === "scale" ? "text-primary font-bold bg-primary/5" : "text-foreground"
                      }`}
                    />
                  </div>
                  <div className="relative w-40 h-9 shrink-0">
                    <select
                      id="scale-unit"
                      value={scaleUnit}
                      onChange={(e) => setScaleUnit(e.target.value)}
                      className="w-full h-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
                    >
                      {currentConfig.unitGroups.map((g) => (
                        <optgroup key={g.label} label={g.label}>
                          {g.units.map((u) => (
                            <option key={u} value={u}>
                              {currentConfig.unitLabels[u] ?? u}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* FIELD 2: SCALE RATIO (WITH LIVE BADGE & 1:X ⇄ X:1 TOGGLE) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-x-2 mb-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor="scale-ratio" className="text-sm font-semibold text-foreground leading-tight">
                      Scale Ratio
                      {solveFor === "ratio" && (
                        <span className="ml-2 text-xs font-bold text-primary">(Solving for this)</span>
                      )}
                    </label>
                    {liveRatioBadge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap bg-primary"
                        title="Calculated effective scale ratio"
                      >
                        {liveRatioBadge}
                      </span>
                    )}
                  </div>

                  {/* 1:X ⇄ X:1 TOGGLE BUTTON (Visible for one-to-x mode on spatial types) */}
                  {!isNonSpatial && mode === "one-to-x" && solveFor !== "ratio" && (
                    <button
                      type="button"
                      onClick={handleToggleRatioType}
                      title="Toggle between Reduction (1:X) and Enlargement (X:1)"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>{ratioType === "reduction" ? "1 : X" : "X : 1"}</span>
                    </button>
                  )}
                </div>

                {solveFor === "ratio" ? (
                  <div className="h-9 px-3 rounded-md border border-input bg-primary/5 flex items-center text-sm font-bold text-primary">
                    {results.scaleRatioText}
                  </div>
                ) : isNonSpatial || mode === "convert-units-only" ? (
                  <div className="h-9 px-3 rounded-md border border-dashed border-input bg-muted/50 flex items-center text-xs font-semibold text-muted-foreground/70 cursor-not-allowed">
                    1 : 1 (Direct {quantityNoun} Conversion)
                  </div>
                ) : mode === "one-to-x" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground shrink-0 px-2 py-1 bg-secondary/50 rounded border border-border">
                        {ratioType === "reduction" ? "1 :" : "X :"}
                      </span>
                      <div className="relative flex-1 rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <input
                          id="scale-ratio"
                          type="number"
                          step="any"
                          min="0.0001"
                          value={oneToXRatio}
                          onChange={(e) => setOneToXRatio(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
                        />
                      </div>
                      {ratioType === "enlargement" && (
                        <span className="text-sm font-bold text-muted-foreground shrink-0 px-2 py-1 bg-secondary/50 rounded border border-border">
                          : 1
                        </span>
                      )}
                    </div>
                    {/* Quick ratio buttons */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-semibold">Presets:</span>
                      {PRESET_RATIOS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setOneToXRatio(r)}
                          className={`px-2 py-0.5 text-xs font-medium rounded border transition-colors ${
                            oneToXRatio === r
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/40 text-foreground border-border hover:bg-secondary"
                          }`}
                        >
                          {ratioType === "enlargement" ? `${r}:1` : `1:${r}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : mode === "inches-to-the-foot" ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setArchMode("preset")}
                        className={`py-1 text-xs font-semibold rounded border ${
                          archMode === "preset"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/30 text-foreground border-border"
                        }`}
                      >
                        Standard Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setArchMode("custom")}
                        className={`py-1 text-xs font-semibold rounded border ${
                          archMode === "custom"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/30 text-foreground border-border"
                        }`}
                      >
                        Custom Inches
                      </button>
                    </div>

                    {archMode === "preset" ? (
                      <div className="relative h-9">
                        <select
                          value={archPresetIndex}
                          onChange={(e) => setArchPresetIndex(parseInt(e.target.value, 10))}
                          className="w-full h-full rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                        >
                          {ARCHITECTURAL_PRESETS.map((p, idx) => (
                            <option key={p.label} value={idx}>
                              {p.label} ({p.ratioText}) — {p.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={archCustomInches}
                            onChange={(e) => setArchCustomInches(e.target.value)}
                            placeholder="e.g. 0.25"
                            className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
                          />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground shrink-0">inches = 1'-0"</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input
                      id="scale-ratio"
                      type="number"
                      step="any"
                      min="0.000001"
                      value={scaleFactor}
                      onChange={(e) => setScaleFactor(e.target.value)}
                      placeholder="e.g. 0.01 for 1:100"
                      className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
                    />
                  </div>
                )}
              </div>

              {/* FIELD 3: VALUE IN REALITY */}
              <div className="flex flex-col">
                <label htmlFor="real-value" className="text-sm font-semibold text-foreground mb-1">
                  Value in Reality (Full Size)
                  {solveFor === "reality" && (
                    <span className="ml-2 text-xs font-bold text-primary">(Solving for this)</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input
                      id="real-value"
                      type="number"
                      step="any"
                      min={isNonSpatial ? undefined : "0"}
                      disabled={solveFor === "reality"}
                      value={solveFor === "reality" ? formatSmartNumber(results.solvedValue, 4) : realValue}
                      onChange={(e) => setRealValue(e.target.value)}
                      placeholder="e.g. 15"
                      className={`w-full h-full px-3 text-base bg-transparent outline-none border-none ${
                        solveFor === "reality" ? "text-primary font-bold bg-primary/5" : "text-foreground"
                      }`}
                    />
                  </div>
                  <div className="relative w-40 h-9 shrink-0">
                    <select
                      id="real-unit"
                      value={realUnit}
                      onChange={(e) => setRealUnit(e.target.value)}
                      className="w-full h-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
                    >
                      {currentConfig.unitGroups.map((g) => (
                        <optgroup key={g.label} label={g.label}>
                          {g.units.map((u) => (
                            <option key={u} value={u}>
                              {currentConfig.unitLabels[u] ?? u}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Full-width Calculate + Icon Reset Pair) */}
            <div className="flex gap-2.5 mt-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset fields"
                title="Reset fields to defaults"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── RIGHT: RESULTS PANEL ────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section" ref={printRef}>
            {/* HERO CALLOUT BOX */}
            <div className={`border-l-4 rounded-lg p-5 text-center relative overflow-hidden shadow-sm ${!results.isValid ? "bg-destructive/10 border-destructive" : "bg-primary/10 border-primary"}`}>
              {!results.isValid ? (
                <div className="text-destructive font-bold flex flex-col items-center justify-center gap-2 py-4">
                  <Info className="h-6 w-6" />
                  <span>{results.errorMessage || "Invalid input"}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-end absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>

                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                    {solvedLabelText}
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                      {solvedDisplayValue}{" "}
                      {solvedUnitText && (
                        <span className="text-2xl font-bold text-muted-foreground">{solvedUnitText}</span>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${solvedDisplayValue}${solvedUnitText ? " " + solvedUnitText : ""}`)}
                      title="Copy to clipboard"
                      className="text-muted-foreground hover:text-primary transition-colors focus:outline-none flex shrink-0"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="text-sm text-muted-foreground font-medium">
                    at {results.scaleRatioText} ({quantityNoun})
                  </div>
                </>
              )}
            </div>

            {/* NEAREST STANDARD SCALE SUGGESTION BANNER */}
            {results.nearestStandardScale && solveFor === "ratio" && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Closest standard scale: <strong>{results.nearestStandardScale.label}</strong> (your computed ratio: {results.nearestStandardScale.computedLabel})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSnapToStandardScale}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0 ml-2"
                >
                  Use this scale
                </button>
              </div>
            )}

            {/* 3-COLUMN MINI-STAT ROW */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col flex-1 text-center">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Scale</span>
                <span className="font-extrabold text-foreground truncate px-1" title={results.scaleRatioText}>
                  {results.scaleRatioText}
                </span>
              </div>
              <div className="w-px h-8 bg-border shrink-0" />
              <div className="flex flex-col flex-1 text-center">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Ratio (Decimal)
                </span>
                <span className="font-extrabold text-foreground truncate px-1">
                  {results.scaleFactorText}
                </span>
              </div>
              <div className="w-px h-8 bg-border shrink-0" />
              <div className="flex flex-col flex-1 text-center">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Quantity Type
                </span>
                <span className="font-extrabold text-foreground capitalize">
                  {quantityType}
                </span>
              </div>
            </div>

            {/* COMMON SCALE EQUIVALENTS CARD (Suppressed for Temperature and Angle) */}
            {results.isValid && results.equivalents.length > 0 && !isNonSpatial && (
              <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
                <div className="p-3 border-b border-border bg-secondary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Common Scale Equivalents</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    For {formatSmartNumber(results.realValueDisplay, 4)} {results.realUnit}
                  </span>
                </div>

                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Scale</th>
                      <th className="p-2.5 text-right">Drawing {quantityNoun} ({results.scaleUnit})</th>
                      <th className="p-2.5 text-right">Real {quantityNoun} ({results.realUnit})</th>
                      <th className="p-2.5 pr-3 hidden sm:table-cell">Typical Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {results.equivalents.map((item, idx) => {
                      const isHighlighted = item.isCurrent;
                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSnapToRatio(item.ratio)}
                          title="Click to use this scale ratio"
                          className={`transition-colors cursor-pointer ${
                            isHighlighted
                              ? "bg-amber-500/10 font-bold"
                              : "hover:bg-primary/10 hover:shadow-sm"
                          }`}
                        >
                          <td className={`p-2.5 pl-3 font-semibold ${isHighlighted ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
                            <div className="flex items-center gap-1.5">
                              {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                              <span>{item.scaleLabel}</span>
                            </div>
                          </td>
                          <td
                            className={`p-2.5 text-right font-mono ${
                              isHighlighted ? "text-amber-700 dark:text-amber-400 font-bold" : "text-foreground"
                            }`}
                          >
                            {formatSmartNumber(item.scaleLength, 4)} {item.scaleUnit}
                          </td>
                          <td
                            className={`p-2.5 text-right font-mono ${
                              isHighlighted ? "text-amber-700 dark:text-amber-400 font-bold" : "text-foreground"
                            }`}
                          >
                            {formatSmartNumber(item.realLength, 4)} {item.realUnit}
                          </td>
                          <td
                            className={`p-2.5 pr-3 text-xs hidden sm:table-cell ${
                              isHighlighted ? "text-amber-700/90 dark:text-amber-400/90 font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {item.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* INFORMATIONAL NOTE — Suppressed for non-spatial quantity types */}
            {quantityType !== "temperature" && quantityType !== "angle" && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Drafting & Sizing Tip:</strong> Scale factors are dimensionless ratios. To convert physical drawings accurately, ensure measuring rulers align with drawing bleed tolerances and print scaling is set to 100% (no fit-to-page).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO CONTENT & FOOTER SECTIONS ─────────────────────────────────────────────── */}
        <div className="mt-12 max-w-[1180px] flex flex-col gap-10">
          <section className="prose-finance text-[15.75px] space-y-6 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Understanding Scale Ratios, Blueprint Proportions, and Physical Dimensions
            </h2>
            <p>
              A scale calculator is an indispensable tool for architects, civil engineers, interior designers, model builders, and digital fabrication specialists who translate real-world environments into scaled representations. Whether you are drafting an architectural blueprint, producing a miniaturized scale model, or converting survey measurements for civil engineering plans, maintaining precise mathematical proportion is essential. Scale represents the fixed ratio between a dimension measured on a drawing or model and its corresponding full-size measurement in the physical world.
            </p>
            <p>
              Scale drawings generally fall into two primary classifications: reduction scales and enlargement scales. In a reduction scale, expressed as 1:X (such as 1:50 or 1:100), the drawn representation is smaller than the physical object. This format is universally applied to building elevations, floor plans, and regional maps. Conversely, an enlargement scale, expressed as X:1 (such as 2:1, 5:1, or 10:1), depicts objects larger than reality. Enlargement scales are standard in micro-engineering, watchmaking, jewelry design, and circuit board layout, where microscopic components must be clearly visible and annotated.
            </p>

            <h2 className="text-2xl font-bold mb-3 text-foreground">
              How Dimensional Scaling Laws Apply to Length, Area, Volume, and Mass
            </h2>
            <p>
              One of the most common pitfalls in drafting and physical modeling is assuming that all physical quantities scale at the same rate as linear dimensions. While a distance or length scales linearly in direct proportion to the scale ratio, spatial measurements that occupy two or three dimensions follow geometric power laws:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Linear Dimensions (Length):</strong> Length scales directly with the scale factor. A 10-meter wall drawn at a 1:100 scale ratio measures exactly 0.1 meters (10 cm) on paper.
              </li>
              <li>
                <strong className="text-foreground">Surface Dimensions (Area):</strong> Because area involves two orthogonal spatial dimensions (length × width), the surface area changes with the square of the scale ratio (R²). A room with a real floor area of 100 square meters represented at a 1:10 scale does not measure 10 square meters on a plan—it measures 100 ÷ 10² = 1 square meter (10,000 cm²).
              </li>
              <li>
                <strong className="text-foreground">Volumetric Dimensions (Volume):</strong> Volume spans three spatial dimensions (length × width × height), meaning the volume scales with the cube of the scale ratio (R³). If a swimming pool contains 1,000 cubic meters of water, a 1:10 physical architectural model requires only 1,000 ÷ 10³ = 1 cubic meter of liquid.
              </li>
              <li>
                <strong className="text-foreground">Mass and Weight:</strong> When an object is scaled using the same material density, its mass is directly proportional to its physical volume. Consequently, mass also follows the cubic scaling relationship (R³). A cast-iron engine weighing 500 kilograms scaled down to 1:10 weighs just 500 ÷ 1,000 = 0.5 kilograms (500 grams).
              </li>
            </ul>
            <p>
              In contrast to spatial dimensions, intensive thermodynamic and geometric quantities such as Temperature and Angle do not scale with physical size. A 90-degree corner remains a 90-degree corner whether drafted on a postage stamp or constructed on a skyscraper foundation, and a liquid boiling at 100°C does not change temperature when scaled. For these quantities, the calculator functions in a dedicated unit conversion mode, providing exact conversions across Celsius, Fahrenheit, Kelvin, Rankine, degrees, radians, gradians, and arcminutes without applying artificial geometric scaling factors.
            </p>

            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Four Flexible Input Modes for Drafting and Engineering
            </h2>
            <p>
              To accommodate diverse workflow standards across civil, structural, architectural, and mechanical disciplines, this calculator provides four specialized calculation modes:
            </p>
            <p>
              <strong className="text-foreground">1 : X Scale:</strong> The standard metric and ratio mode used globally in engineering schematics and international construction projects. The integrated toggle button (1:X ⇄ X:1) allows instant switching between reduction ratios and enlargement ratios without re-entering values.
            </p>
            <p>
              <strong className="text-foreground">Inches to the Foot:</strong> The conventional North American architectural scale format, representing fractional inches on the drawing per one foot of real-world dimension (e.g., 1/4" = 1&apos;-0" or 1/8" = 1&apos;-0"). Selecting any standard architectural preset automatically determines the true dimensionless decimal ratio (such as 1:48 or 1:96), allowing seamless conversion between imperial blueprint dimensions and metric construction units.
            </p>
            <p>
              <strong className="text-foreground">Scale Factor:</strong> A pure decimal multiplier frequently utilized in computer-aided design (CAD) software, slicer software for 3D printing (such as Bambu Studio, PrusaSlicer, and Cura), and computerized numerical control (CNC) machining. A scale factor of 0.02 represents a 1:50 reduction, while a factor of 2.5 represents a 250% enlargement.
            </p>
            <p>
              <strong className="text-foreground">Convert Units Only:</strong> A high-precision converter operating across more than 180 scientific, imperial, and metric units. With scale ratio locked to a true 1:1 baseline, you can verify unit equivalencies—such as converting nautical miles to chains or square yards to roods—without applying geometric distortion.
            </p>

            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Working with Digital Displays, Screen Pixels, and Print DPI
            </h2>
            <p>
              When working with raster imagery, web layouts, and digital drafting tools, measurements are often expressed in screen pixels (px) rather than physical millimeters or inches. Unlike a meter or foot, a pixel has no inherent physical size until rendered on a display device or output onto printed paper. The calculator resolves pixels into absolute real-world dimensions using the active Dots Per Inch (DPI) or Pixels Per Inch (PPI) resolution setting.
            </p>
            <p>
              By default, the calculator applies 96 DPI, which represents the standard web resolution established by W3C CSS specifications (where 1 inch = 96 px, and 1 pixel ≈ 0.2646 mm). For commercial drafting and offset printing, users can configure high-resolution outputs such as 300 DPI or 600 DPI to accurately project blueprint scale across digital scans, physical plotters, and vector rendering workflows.
            </p>

            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Standard Architectural and Engineering Scale Conventions
            </h2>
            <p>
              In construction documentation, standard scales are carefully selected to ensure drawings remain legible and easily measurable with standard triangular architectural or engineering scales:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Residential Blueprints:</strong> The standard architectural scale for floor plans and interior framing is 1/4" = 1&apos;-0" (1:48 ratio). For tighter layouts or small additions, 1/2" = 1&apos;-0" (1:24 ratio) is frequently specified.
              </li>
              <li>
                <strong className="text-foreground">Commercial Facilities and Site Schematics:</strong> Large-scale plans utilize 1/8" = 1&apos;-0" (1:96 ratio) or 1/16" = 1&apos;-0" (1:192 ratio) to display expansive floor plates and multi-wing layouts on standard architectural D or E sheet sizes.
              </li>
              <li>
                <strong className="text-foreground">Metric Construction:</strong> In ISO and metric jurisdictions, standard reduction scales follow rounded decimal steps: 1:20 for interior millwork, 1:50 for general construction plans, 1:100 for overall building layouts, and 1:500 for civil site infrastructure.
              </li>
            </ul>
            <p>
              When measuring existing field dimensions or digitizing legacy blueprints, computed ratios rarely yield clean integers. The calculator automatically calculates your active ratio, checks it against the nearest industry-standard scale preset, and provides a one-click snap button to align your drawing dimensions with recognized building standards.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/scale-calculator" />
          <PopularCalculators exclude="/calculator/scale-calculator" />
        </div>
      </div>
    </>
  );
}
