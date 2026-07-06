"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ThermometerSun } from "lucide-react";

interface BtuResult {
  btuHeating: number;
  btuCooling: number;
  squareFeet: number;
  tonnage: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateBtu = (
  lengthStr: string,
  widthStr: string,
  heightStr: string,
  insulation: string,
  sunExposure: string,
  occupantsStr: string
): BtuResult | null => {
  const l = parseFloat(lengthStr);
  const w = parseFloat(widthStr);
  const h = parseFloat(heightStr);
  const occ = parseInt(occupantsStr, 10);

  if (isNaN(l) || isNaN(w) || isNaN(h) || isNaN(occ) || l <= 0 || w <= 0 || h <= 0 || occ < 0) return null;

  try {
    const sqFt = l * w;
    const volume = sqFt * h;

    // Base cooling BTU: Volume * 2.5 (approximate industry rule of thumb for standard 8ft ceilings is sqft * 20)
    // Actually standard rule: (Length x Width x Height) * multiplier based on insulation
    let insulationMultC = 0;
    let insulationMultH = 0;
    
    if (insulation === "poor") { insulationMultC = 3; insulationMultH = 5; }
    else if (insulation === "average") { insulationMultC = 2.5; insulationMultH = 4; }
    else if (insulation === "excellent") { insulationMultC = 2; insulationMultH = 3; }

    let baseCooling = volume * insulationMultC;
    let baseHeating = volume * insulationMultH;

    // Sun exposure multiplier (Cooling only)
    if (sunExposure === "heavy") {
      baseCooling *= 1.10; // +10%
    } else if (sunExposure === "shaded") {
      baseCooling *= 0.90; // -10%
    }

    // Occupants (add 600 BTU per person over 2 for cooling)
    if (occ > 2) {
      baseCooling += (occ - 2) * 600;
    }

    // Add Kitchen adjustment (if they select it, normally +4000 BTU, but we keep it simple here)
    // We'll just stick to standard room

    // 1 Ton of AC = 12,000 BTUs
    const tons = baseCooling / 12000;

    return {
      btuHeating: Math.ceil(baseHeating),
      btuCooling: Math.ceil(baseCooling),
      squareFeet: Math.ceil(sqFt),
      tonnage: parseFloat(tons.toFixed(2)),
      isError: false
    };

  } catch (err) {
    return { btuHeating: 0, btuCooling: 0, squareFeet: 0, tonnage: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const BtuCalculator = () => {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [height, setHeight] = useState("8");
  const [insulation, setInsulation] = useState("average");
  const [sun, setSun] = useState("average");
  const [occupants, setOccupants] = useState("2");

  const [result, setResult] = useState<BtuResult | null>(null);

  const calculate = () => {
    setResult(calculateBtu(length, width, height, insulation, sun, occupants));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setLength("20"); setWidth("15"); setHeight("8"); setInsulation("average"); setSun("average"); setOccupants("2");
    setResult(calculateBtu("20", "15", "8", "average", "average", "2"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a BTU?", answer: "BTU stands for British Thermal Unit. It is the traditional unit of heat in the imperial system. Scientifically, 1 BTU is the amount of energy required to raise the temperature of 1 pound of water by 1 degree Fahrenheit. In HVAC terms, it measures how much heat an air conditioner can remove, or a heater can add, to a room in one hour." },
    { question: "Can I buy an AC unit that is too big?", answer: "Yes! A common mistake is buying a massive AC unit for a small room. An oversized AC will cool the room extremely quickly and shut off before it has a chance to pull the humidity out of the air. This leaves the room feeling cold but 'clammy' and damp. Always buy an AC unit that closely matches your BTU calculation." },
    { question: "What is an AC 'Ton'?", answer: "A 'Ton' of air conditioning capacity has nothing to do with the physical weight of the machine. It is a historical term referring to the amount of heat required to melt one ton of solid ice in 24 hours. Mathematically, 1 Ton of AC capacity equals exactly 12,000 BTUs per hour." },
    { question: "How does ceiling height affect BTUs?", answer: "Standard HVAC calculations assume an 8-foot ceiling. If you have 10-foot or 12-foot vaulted ceilings, you have significantly more physical air volume (cubic feet) in the room to heat or cool, even if the floor square footage is identical. This calculator accounts for height to ensure accuracy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "BTU Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BTU Calculator (AC & Heater Size)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col mb-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Room Dimensions</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-foreground mb-1">Length (ft)</label>
                  <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-foreground mb-1">Width (ft)</label>
                  <div className={wrap}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-foreground mb-1">Height (ft)</label>
                  <div className={wrap}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min="1" step="any" /></div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border/50 my-2"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Insulation Quality</span>
              </label>
              <div className={wrap}>
                <select value={insulation} onChange={e => setInsulation(e.target.value)} className={ci}>
                  <option value="excellent">Excellent (New Build / Heavy Insulation)</option>
                  <option value="average">Average (Standard Home)</option>
                  <option value="poor">Poor (Old House / Drafty Windows)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Sun Exposure</span>
              </label>
              <div className={wrap}>
                <select value={sun} onChange={e => setSun(e.target.value)} className={ci}>
                  <option value="heavy">Heavy (Direct sunlight all day)</option>
                  <option value="average">Average</option>
                  <option value="shaded">Shaded (Trees / North facing)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Average Occupants</span>
                <span className="text-xs text-muted-foreground font-normal self-end">In the room</span>
              </label>
              <div className={wrap}><input type="number" value={occupants} onChange={e => setOccupants(e.target.value)} className={ci} min="0" step="1" /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter valid positive numbers for dimensions.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-sky-500/10 border-l-4 border-sky-500 rounded-lg p-5">
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mb-1 uppercase tracking-wider">Air Conditioner Size</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.btuCooling.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-bold">BTUs (Cooling)</div>
                </div>

                <div className="bg-orange-500/10 border-l-4 border-orange-500 rounded-lg p-5">
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">Heater / Furnace Size</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{result.btuHeating.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-bold">BTUs (Heating)</div>
                </div>

              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">HVAC System Specs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Room Area</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.squareFeet.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">sq ft</span></div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Required AC Tonnage</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.tonnage} <span className="text-sm font-normal text-muted-foreground font-sans">Tons</span></div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Sizing Guide</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 font-bold mt-0.5">•</span> 
                    <span><strong>Window AC Units:</strong> Are typically sold in 5,000 to 14,000 BTU sizes. Buy the unit that most closely matches your cooling number above. Do not buy a 14,000 BTU unit for a 5,000 BTU room.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-500 font-bold mt-0.5">•</span> 
                    <span><strong>Mini-Splits & Central AC:</strong> Are often sold by "Tons". 1 Ton = 12,000 BTUs. So a 2.5 Ton AC unit provides exactly 30,000 BTUs of cooling power.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-orange-500 font-bold mt-0.5">•</span> 
                    <span><strong>Why is Heating higher?</strong> Heating a room in the dead of winter requires overcoming a much larger temperature delta (e.g., 20°F outside to 70°F inside = 50° difference) compared to cooling in the summer (95°F outside to 75°F inside = 20° difference).</span>
                  </li>
                </ul>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a BTU?</h2>
            <p><strong>BTU</strong> stands for British Thermal Unit. It is the international standard for measuring the power of heating and air conditioning systems. Scientifically, one BTU is the exact amount of energy required to raise the temperature of one pound of liquid water by 1 degree Fahrenheit.</p>
            <p>In the HVAC industry, when you buy an "8,000 BTU Air Conditioner," it technically means the unit has the capacity to remove 8,000 BTUs of heat from the air <em>per hour</em>.</p>

            <h2 className="text-2xl font-bold mb-3">Why Proper Sizing is Critical</h2>
            <p>A very common consumer mistake is buying the largest, most powerful air conditioner they can afford, assuming "bigger is better." In HVAC, oversized equipment is a massive problem.</p>
            <p>Air conditioners do two things simultaneously: they lower the air temperature, and they pull humidity (water) out of the air. If you put a massive 15,000 BTU AC in a small bedroom, it will blast the room with freezing air, hitting your target temperature in 3 minutes, and then shut off. Because it ran for such a short time, it never had a chance to dehumidify the air. The room will feel cold, but incredibly clammy and uncomfortable. You must buy an AC unit that closely matches your BTU calculation so it runs long enough to pull the water out of the air.</p>

            <h2 className="text-2xl font-bold mb-3">Factors That Alter BTU Requirements</h2>
            <p>Calculating BTUs strictly by square footage is a flawed method because it ignores critical environmental factors. A professional "Manual J" HVAC calculation accounts for:</p>
            <ul>
              <li><strong>Volume (Ceiling Height):</strong> A room with 12-foot vaulted ceilings contains 50% more air than a room with 8-foot ceilings, requiring significantly more BTUs to cool, despite having the exact same floor footprint.</li>
              <li><strong>Insulation:</strong> Poor insulation allows the cool air you just paid to generate to rapidly escape through the walls and roof. You must buy a larger system to counteract this leakage.</li>
              <li><strong>Sun Exposure:</strong> Windows facing the sun create a "greenhouse effect," trapping solar radiation. Rooms with heavy, direct sun exposure require roughly 10% more cooling power.</li>
              <li><strong>Human Body Heat:</strong> Every human body acts like a 100-watt heater. If a room frequently hosts many people, you must add 600 BTUs of cooling capacity for every person over two.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/btu-calculator" />
          <PopularCalculators exclude="/calculator/btu-calculator" />
        </div>
      </div>
    </>
  );
};
export default BtuCalculator;
