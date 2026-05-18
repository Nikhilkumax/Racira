"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Eye } from "lucide-react";

const FovCalculator = () => {
  const [baseFov, setBaseFov] = useState("90");
  const [baseRatio, setBaseRatio] = useState("4:3"); // Most games use 4:3 as base for FOV (Source Engine)
  const [targetRatio, setTargetRatio] = useState("16:9");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const fov = parseFloat(baseFov) || 0;
    const [bw, bh] = baseRatio.split(":").map(Number);
    const [tw, th] = targetRatio.split(":").map(Number);

    if (fov <= 0 || !bw || !bh || !tw || !th) return;

    // Convert FOV to radians
    const fovRad = (fov * Math.PI) / 180;

    // Vertical FOV (Assuming horizontal FOV on base ratio)
    const vFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * (bh / bw));
    const vFovDeg = (vFovRad * 180) / Math.PI;

    // Target Horizontal FOV
    const tFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * (tw / th));
    const tFovDeg = (tFovRad * 180) / Math.PI;

    setResults({
      vFov: vFovDeg,
      hFov: tFovDeg,
      hFov21_9: (2 * Math.atan(Math.tan(vFovRad / 2) * (21 / 9)) * 180) / Math.PI,
      hFov32_9: (2 * Math.atan(Math.tan(vFovRad / 2) * (32 / 9)) * 180) / Math.PI
    });
  };

  const reset = () => {
    setShowResults(false);
    setBaseFov("90"); setBaseRatio("4:3"); setTargetRatio("16:9");
    setResults(null);
  };

  const faqs = [
    { question: "What is Horizontal vs Vertical FOV?", answer: "Horizontal FOV (hFOV) measures how much you can see from left to right. Vertical FOV (vFOV) measures from top to bottom. Most games define FOV horizontally based on a 4:3 aspect ratio, even if you play at 16:9." },
    { question: "Does a higher FOV give me an advantage?", answer: "A higher FOV increases your peripheral vision, helping you spot enemies at the edges of your screen. However, it also makes targets in the center appear smaller and harder to hit (the 'fish-eye' effect)." },
    { question: "Why do some games feel faster with high FOV?", answer: "High FOV increases the perceived speed of peripheral motion. This makes the game feel faster and more intense, which is popular in arena shooters like Quake or Doom." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "FOV Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">FOV (Field of View) Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Convert FOV settings between different aspect ratios and calculate your true horizontal and vertical vision.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="baseFov" label="In-Game FOV Value" value={baseFov} onChange={setBaseFov} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Game FOV Basis</label>
                  <select value={baseRatio} onChange={(e) => setBaseRatio(e.target.value)} className="input-calc">
                    <option value="4:3">4:3 (Source/Source 2)</option>
                    <option value="16:9">16:9 (Unreal/Modern)</option>
                    <option value="1:1">Vertical Basis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your Aspect Ratio</label>
                  <select value={targetRatio} onChange={(e) => setTargetRatio(e.target.value)} className="input-calc">
                    <option value="16:9">16:9 (Standard)</option>
                    <option value="16:10">16:10 (Laptop)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                    <option value="32:9">32:9 (Super Ultrawide)</option>
                    <option value="4:3">4:3 (Stretched)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Eye className="h-5 w-5" /> Calculate True FOV
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Field of View Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">True Horizontal FOV</p>
                    <p className="text-5xl font-black text-foreground">{results.hFov.toFixed(1)}°</p>
                    <p className="text-xs text-muted-foreground mt-2">At {targetRatio} Aspect Ratio</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Vertical FOV</p>
                    <p className="text-4xl font-black text-foreground">{results.vFov.toFixed(1)}°</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Ultrawide (21:9) FOV", value: 0, textValue: results.hFov21_9.toFixed(1) + "°" },
                  { label: "Superwide (32:9) FOV", value: 0, textValue: results.hFov32_9.toFixed(1) + "°" },
                  { label: "Perception Change", value: 0, textValue: results.hFov > 110 ? "High Distortion" : "Natural" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Why FOV Matters in Gaming</h2>
              <p>Field of View (FOV) determines how much of the game world you can see at once. While it seems simple, developers use different mathematical bases for their FOV sliders.</p>
              <h3>Source Engine Basis (4:3)</h3>
              <p>Games like Counter-Strike, Dota 2, and Team Fortress 2 use a 4:3 base. If you set your FOV to 90 on a 16:9 monitor, your actual horizontal FOV is **106.26°**. This calculator helps you translate that "feel" to other games or monitor setups.</p>
              <h3>Vertical FOV Basis</h3>
              <p>Some modern games (like Battlefield or R6 Siege) use Vertical FOV. In these games, your horizontal vision expands automatically as you use wider monitors, but your vertical vision stays the same. This is generally preferred for consistency across different screen shapes.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fov" />
            <PopularCalculators exclude="/calculator/fov-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default FovCalculator;

