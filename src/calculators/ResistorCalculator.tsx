"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";

type BandColor = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'gray' | 'white' | 'gold' | 'silver' | 'none';

interface ResistorResult {
  resistanceValue: number;
  resistanceStr: string;
  toleranceStr: string;
  minRange: string;
  maxRange: string;
}

const colorData: Record<BandColor, { val: number | null, mult: number | null, tol: number | null, hex: string, label: string }> = {
  black:  { val: 0, mult: 1,           tol: null,  hex: '#000000', label: 'Black' },
  brown:  { val: 1, mult: 10,          tol: 1,     hex: '#8B4513', label: 'Brown' },
  red:    { val: 2, mult: 100,         tol: 2,     hex: '#FF0000', label: 'Red' },
  orange: { val: 3, mult: 1000,        tol: 0.05,  hex: '#FF8C00', label: 'Orange' }, // Some standards use 0.05
  yellow: { val: 4, mult: 10000,       tol: 0.02,  hex: '#FFD700', label: 'Yellow' },
  green:  { val: 5, mult: 100000,      tol: 0.5,   hex: '#008000', label: 'Green' },
  blue:   { val: 6, mult: 1000000,     tol: 0.25,  hex: '#0000FF', label: 'Blue' },
  violet: { val: 7, mult: 10000000,    tol: 0.1,   hex: '#EE82EE', label: 'Violet' },
  gray:   { val: 8, mult: 100000000,   tol: 0.01,  hex: '#808080', label: 'Gray' },
  white:  { val: 9, mult: 1000000000,  tol: null,  hex: '#FFFFFF', label: 'White' },
  gold:   { val: null, mult: 0.1,      tol: 5,     hex: '#CFB53B', label: 'Gold' },
  silver: { val: null, mult: 0.01,     tol: 10,    hex: '#C0C0C0', label: 'Silver' },
  none:   { val: null, mult: null,     tol: 20,    hex: '#D2B48C', label: 'None' } // Body color approx
};

const calculateResistor = (bands: number, colors: BandColor[]): ResistorResult => {
  let value = 0;
  let mult = 1;
  let tol = 20;

  if (bands === 4) {
    const digit1 = colorData[colors[0]].val ?? 0;
    const digit2 = colorData[colors[1]].val ?? 0;
    value = (digit1 * 10) + digit2;
    mult = colorData[colors[2]].mult ?? 1;
    tol = colorData[colors[3]].tol ?? 20;
  } else if (bands === 5) {
    const digit1 = colorData[colors[0]].val ?? 0;
    const digit2 = colorData[colors[1]].val ?? 0;
    const digit3 = colorData[colors[2]].val ?? 0;
    value = (digit1 * 100) + (digit2 * 10) + digit3;
    mult = colorData[colors[3]].mult ?? 1;
    tol = colorData[colors[4]].tol ?? 20;
  }

  const finalOhms = value * mult;
  const tolVal = finalOhms * (tol / 100);

  const formatOhms = (ohms: number) => {
    if (ohms >= 1000000) return `${parseFloat((ohms / 1000000).toPrecision(6))} MΩ`;
    if (ohms >= 1000) return `${parseFloat((ohms / 1000).toPrecision(6))} kΩ`;
    return `${parseFloat(ohms.toPrecision(6))} Ω`;
  };

  return {
    resistanceValue: finalOhms,
    resistanceStr: formatOhms(finalOhms),
    toleranceStr: `±${tol}%`,
    minRange: formatOhms(finalOhms - tolVal),
    maxRange: formatOhms(finalOhms + tolVal)
  };
};

const ResistorCalculator = () => {
  const [bandCount, setBandCount] = useState<4 | 5>(4);
  const [band1, setBand1] = useState<BandColor>('red');
  const [band2, setBand2] = useState<BandColor>('red');
  const [band3, setBand3] = useState<BandColor>('brown'); // Mult for 4-band, digit for 5-band
  const [band4, setBand4] = useState<BandColor>('gold'); // Tol for 4-band, Mult for 5-band
  const [band5, setBand5] = useState<BandColor>('brown'); // Tol for 5-band

  const [result, setResult] = useState<ResistorResult | null>(null);

  const calculate = () => {
    const colors = bandCount === 4 ? [band1, band2, band3, band4] : [band1, band2, band3, band4, band5];
    setResult(calculateResistor(bandCount, colors));
  };

  useEffect(() => { calculate(); }, [bandCount, band1, band2, band3, band4, band5]);

  const reset = () => {
    setBandCount(4);
    setBand1('red'); setBand2('red'); setBand3('brown'); setBand4('gold'); setBand5('brown');
  };

  const getSelectStyle = (color: BandColor) => {
    const hex = colorData[color].hex;
    const isLight = ['white', 'yellow', 'none', 'silver'].includes(color);
    return { backgroundColor: hex, color: isLight ? '#000' : '#fff' };
  };

  const wrap = "flex items-center rounded-md border border-input h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base outline-none border-none cursor-pointer font-medium";

  const renderColorOptions = (type: 'digit' | 'mult' | 'tol') => {
    return (Object.keys(colorData) as BandColor[]).filter(c => {
      if (type === 'digit') return colorData[c].val !== null;
      if (type === 'mult') return colorData[c].mult !== null;
      if (type === 'tol') return colorData[c].tol !== null;
      return false;
    }).map(c => (
      <option key={c} value={c} style={getSelectStyle(c)}>{colorData[c].label}</option>
    ));
  };

  const faqs = [
    { question: "How do I read resistor color codes?", answer: "Hold the resistor so the bands are bunched to the left. The first two (or three) bands represent significant digits. The next band is the multiplier (how many zeros to add). The final band, which usually has a slight gap before it, represents the tolerance." },
    { question: "What is a 4-Band vs 5-Band Resistor?", answer: "A 4-band resistor has 2 significant digits, a multiplier, and a tolerance. A 5-band resistor is used for higher precision and adds a 3rd significant digit before the multiplier." },
    { question: "What does the Tolerance band mean?", answer: "Manufacturing is never perfect. A 1000Ω resistor with a Gold band (±5% tolerance) is guaranteed to have a real-world resistance somewhere between 950Ω and 1050Ω. A Silver band means ±10%." },
    { question: "Why do some colors mean different things?", answer: "The color mapping is standardized internationally (IEC 60062). However, Gold and Silver are never used as significant digits; they are only used as fractional multipliers (0.1 and 0.01) or as tolerance bands." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tech", href: "/calculator#tech" }, { label: "Resistor Color Code Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Resistor Color Code Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col mb-2">
              <label className="text-base font-medium text-foreground mb-1.5">Number of Bands</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                <button type="button" onClick={() => setBandCount(4)} className={`flex-1 text-sm font-bold transition-colors ${bandCount === 4 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>4-Band</button>
                <button type="button" onClick={() => setBandCount(5)} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${bandCount === 5 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>5-Band (Precision)</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">1st Band (Digit)</label>
                <div className={wrap} style={getSelectStyle(band1)}>
                  <select value={band1} onChange={e => setBand1(e.target.value as BandColor)} className={ci} style={getSelectStyle(band1)}>
                    {renderColorOptions('digit')}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">2nd Band (Digit)</label>
                <div className={wrap} style={getSelectStyle(band2)}>
                  <select value={band2} onChange={e => setBand2(e.target.value as BandColor)} className={ci} style={getSelectStyle(band2)}>
                    {renderColorOptions('digit')}
                  </select>
                </div>
              </div>

              {bandCount === 5 && (
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">3rd Band (Digit)</label>
                  <div className={wrap} style={getSelectStyle(band3)}>
                    <select value={band3} onChange={e => setBand3(e.target.value as BandColor)} className={ci} style={getSelectStyle(band3)}>
                      {renderColorOptions('digit')}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Multiplier</label>
                <div className={wrap} style={getSelectStyle(bandCount === 4 ? band3 : band4)}>
                  <select value={bandCount === 4 ? band3 : band4} onChange={e => bandCount === 4 ? setBand3(e.target.value as BandColor) : setBand4(e.target.value as BandColor)} className={ci} style={getSelectStyle(bandCount === 4 ? band3 : band4)}>
                    {renderColorOptions('mult')}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tolerance</label>
                <div className={wrap} style={getSelectStyle(bandCount === 4 ? band4 : band5)}>
                  <select value={bandCount === 4 ? band4 : band5} onChange={e => bandCount === 4 ? setBand4(e.target.value as BandColor) : setBand5(e.target.value as BandColor)} className={ci} style={getSelectStyle(bandCount === 4 ? band4 : band5)}>
                    {renderColorOptions('tol')}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={reset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center gap-2 font-medium" aria-label="Reset">
                <RotateCcw className="h-4 w-4" /> Reset Calculator
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Resistance Value</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-mono">{result.resistanceStr}</span>
                  <span className="text-2xl font-bold text-muted-foreground font-mono">{result.toleranceStr}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Acceptable Range (Based on Tolerance)</div>
                  <div className="text-lg font-bold text-foreground font-mono">{result.minRange} <span className="text-muted-foreground font-sans text-sm mx-2">to</span> {result.maxRange}</div>
                </div>
              </div>

              {/* Visual Resistor Representation */}
              <div className="card-calculator !p-8 border border-border bg-card shadow-sm flex items-center justify-center overflow-hidden">
                <div className="relative w-full max-w-[300px] h-24 flex items-center justify-center">
                  {/* Wire L */}
                  <div className="absolute left-0 w-8 h-2 bg-zinc-400"></div>
                  {/* Wire R */}
                  <div className="absolute right-0 w-8 h-2 bg-zinc-400"></div>
                  
                  {/* Resistor Body */}
                  <div className="relative z-10 w-[240px] h-full bg-[#d7c4a1] rounded-full border-2 border-amber-900/40 shadow-inner flex items-center justify-between px-6 overflow-hidden">
                    
                    <div className="flex gap-3 h-full items-center">
                      <div className="w-4 h-full" style={{ backgroundColor: colorData[band1].hex, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }}></div>
                      <div className="w-4 h-full" style={{ backgroundColor: colorData[band2].hex, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }}></div>
                      {bandCount === 5 && (
                        <div className="w-4 h-full" style={{ backgroundColor: colorData[band3].hex, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }}></div>
                      )}
                      <div className="w-4 h-full" style={{ backgroundColor: colorData[bandCount === 4 ? band3 : band4].hex, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }}></div>
                    </div>

                    {/* Tolerance Gap */}
                    <div className="w-4 h-full ml-8" style={{ backgroundColor: colorData[bandCount === 4 ? band4 : band5].hex, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }}></div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Reading a Through-Hole Resistor</h2>
            <p>Through-hole resistors are tiny, cylindrical electronic components used to restrict the flow of electrical current in a circuit. Because they are so small, it is impossible to print text on them legibly. To solve this, the electronics industry developed the <strong>Electronic Color Code (IEC 60062)</strong> in the 1920s. By reading the painted bands on the resistor from left to right, you can determine its exact resistance value in Ohms (Ω) and its manufacturing tolerance.</p>

            <h2>4-Band vs 5-Band Resistors</h2>
            <p>Standard carbon-film resistors typically use a <strong>4-band</strong> system. The first two bands represent the significant digits (e.g., Red = 2, Red = 2, making "22"). The third band is the multiplier, indicating how many zeros to add (e.g., Brown = x10, making "220"). The final band, which usually has a small gap before it, indicates the tolerance (e.g., Gold = ±5%).</p>
            <p>Metal-film resistors, which are manufactured with much higher precision, use a <strong>5-band</strong> system. They feature three significant digits instead of two, allowing for much more granular resistance values (like 2.25 kΩ). The fourth band becomes the multiplier, and the fifth is the tolerance.</p>

            <h2>The Tolerance Band Explained</h2>
            <p>Manufacturing resistors is an imprecise process. A 1,000 Ω (1 kΩ) resistor is rarely exactly 1,000 ohms. The final band on the resistor tells you how far off the actual value might be from the stated value.</p>
            <ul>
              <li><strong>Gold (±5%):</strong> The resistor is guaranteed to be within 5% of its stated value. A 1,000 Ω resistor will actually measure between 950 Ω and 1,050 Ω when tested with a multimeter.</li>
              <li><strong>Silver (±10%):</strong> Lower quality, larger variance.</li>
              <li><strong>Brown (±1%):</strong> Very high precision, used in sensitive audio equipment or measurement tools.</li>
            </ul>

            <h2>Tips for Reading Real Resistors</h2>
            <p>The most common mistake beginners make is reading the resistor backward. How do you know which end is the left? Look for the gap. The tolerance band (usually Gold or Silver) will be separated from the other bands by a slightly wider empty space. Put that band on the right-hand side, and read the colors from left to right.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/resistor-calculator" />
          <PopularCalculators exclude="/calculator/resistor-calculator" />
        </div>
      </div>
    </>
  );
};
export default ResistorCalculator;
