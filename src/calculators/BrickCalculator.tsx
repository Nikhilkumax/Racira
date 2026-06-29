"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Grid3x3 } from "lucide-react";

interface BrickResult {
  totalBricks: number;
  wallArea: number; // sq ft or sq m
  mortarVolume: number; // cu ft or cu m
  sandBags: number; // 50lb bags
  cementBags: number; // 94lb standard US portland cement bags
  isError: boolean;
  errorMsg?: string;
}

const calculateBricks = (
  unit: string,
  wallLengthStr: string,
  wallHeightStr: string,
  brickType: string,
  mortarJointStr: string,
  wasteStr: string
): BrickResult | null => {
  const wallL = parseFloat(wallLengthStr);
  const wallH = parseFloat(wallHeightStr);
  const mortarJ = parseFloat(mortarJointStr);
  const waste = parseFloat(wasteStr) / 100;

  if (isNaN(wallL) || isNaN(wallH) || isNaN(mortarJ) || wallL <= 0 || wallH <= 0 || mortarJ < 0) return null;

  try {
    let bLength = 0;
    let bHeight = 0;
    let bDepth = 0;

    // Standard brick sizes (Inches in Imperial, mm in Metric)
    if (unit === "imperial") {
      // Dimensions in inches
      if (brickType === "standard") { bLength = 8; bHeight = 2.25; bDepth = 3.625; }
      else if (brickType === "modular") { bLength = 7.625; bHeight = 2.25; bDepth = 3.625; }
      else if (brickType === "queen") { bLength = 8; bHeight = 2.75; bDepth = 3.125; }
      else if (brickType === "king") { bLength = 9.625; bHeight = 2.625; bDepth = 3; }
      else if (brickType === "utility") { bLength = 11.625; bHeight = 3.625; bDepth = 3.625; }
    } else {
      // Dimensions in mm
      if (brickType === "standard") { bLength = 215; bHeight = 65; bDepth = 102.5; } // UK standard
      else if (brickType === "modular") { bLength = 190; bHeight = 57; bDepth = 90; } // Metric modular
      else if (brickType === "queen") { bLength = 203; bHeight = 70; bDepth = 79; }
      else if (brickType === "king") { bLength = 244; bHeight = 67; bDepth = 76; }
      else if (brickType === "utility") { bLength = 295; bHeight = 92; bDepth = 92; }
    }

    let area = 0;
    let effectiveBLength = 0;
    let effectiveBHeight = 0;
    let totalBricksRaw = 0;
    let mortarVolume = 0;

    if (unit === "imperial") {
      area = wallL * wallH; // sq ft
      effectiveBLength = (bLength + mortarJ) / 12; // ft
      effectiveBHeight = (bHeight + mortarJ) / 12; // ft
      
      const brickAreaWithMortar = effectiveBLength * effectiveBHeight;
      totalBricksRaw = area / brickAreaWithMortar;

      // Mortar volume calculation
      // Volume of wall = area * depth of brick
      const wallVolume = area * (bDepth / 12);
      // Volume of bricks only = totalBricksRaw * (bLength * bHeight * bDepth / 1728)
      const brickVolume = totalBricksRaw * ((bLength * bHeight * bDepth) / 1728);
      mortarVolume = wallVolume - brickVolume;

    } else {
      area = wallL * wallH; // sq m
      effectiveBLength = (bLength + mortarJ) / 1000; // m
      effectiveBHeight = (bHeight + mortarJ) / 1000; // m
      
      const brickAreaWithMortar = effectiveBLength * effectiveBHeight;
      totalBricksRaw = area / brickAreaWithMortar;

      const wallVolume = area * (bDepth / 1000);
      const brickVolume = totalBricksRaw * ((bLength * bHeight * bDepth) / 1000000000);
      mortarVolume = wallVolume - brickVolume;
    }

    const totalBricksWithWaste = Math.ceil(totalBricksRaw * (1 + waste));
    
    // Add 10% waste to mortar volume too
    const finalMortarVol = mortarVolume * (1 + waste);

    // Approximate mortar materials for standard Type N or S mix (1 part cement to 3 parts sand)
    // Very roughly: 1 cu ft of mortar needs ~1/3 bag of masonry cement (70lb) and ~1 cu ft of sand
    // For universal simplicity, we will output generic bag counts based on standard USA specs.
    // 1 cu ft of mortar requires roughly 0.33 bags of 70lb cement and roughly 100lbs (two 50lb bags) of dry sand
    
    let cementBags = 0;
    let sandBags = 0;

    if (unit === "imperial") {
      cementBags = Math.ceil(finalMortarVol * 0.33);
      sandBags = Math.ceil(finalMortarVol * 2); // 50lb bags
    } else {
      // 1 cu m = 35.3 cu ft
      const cuFtMortar = finalMortarVol * 35.3147;
      cementBags = Math.ceil(cuFtMortar * 0.33);
      sandBags = Math.ceil(cuFtMortar * 2);
    }

    return {
      totalBricks: totalBricksWithWaste,
      wallArea: parseFloat(area.toFixed(2)),
      mortarVolume: parseFloat(finalMortarVol.toFixed(2)),
      sandBags,
      cementBags,
      isError: false
    };

  } catch (err) {
    return { totalBricks: 0, wallArea: 0, mortarVolume: 0, sandBags: 0, cementBags: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const BrickCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [length, setLength] = useState("10");
  const [height, setHeight] = useState("8");
  const [brickType, setBrickType] = useState("standard");
  const [joint, setJoint] = useState("0.375"); // 3/8 inch standard
  const [waste, setWaste] = useState("5");

  const [result, setResult] = useState<BrickResult | null>(null);

  const calculate = () => {
    setResult(calculateBricks(unit, length, height, brickType, joint, waste));
  };

  useEffect(() => { calculate(); }, [unit, length, height, brickType, joint, waste]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setLength("10"); setHeight("8"); setJoint("0.375");
    } else {
      setLength("3"); setHeight("2.5"); setJoint("10"); // 10mm
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why do brick sizes matter so much?", answer: "The size of the brick determines how many you need, but more importantly, it determines the 'coursing' (how the horizontal rows align). A Modular brick is designed so that exactly 3 courses of bricks (including the mortar joints) equal exactly 8 inches in vertical height. This makes it incredibly easy for masons to measure and build perfectly level walls." },
    { question: "What is a standard mortar joint?", answer: "In the United States, the standard mortar joint thickness is 3/8 of an inch (0.375 inches). In countries using the metric system, the standard is 10 millimeters. The joint thickness is a critical part of the math; if your joints are too thick, your wall will be taller than calculated and you will have leftover bricks." },
    { question: "What kind of mortar should I use?", answer: "There are four main types of mortar used in construction: Type N, S, M, and O. Type N is a general-purpose mortar used for exterior walls above grade (standard brick walls). Type S is much stronger and is used for load-bearing walls or brick structures below grade (like retaining walls or foundations)." },
    { question: "How much waste should I calculate?", answer: "For a straight, simple wall with no windows or doors, a 5% waste factor is standard to account for dropped or broken bricks. If you are building a complex wall with multiple corners, windows, or intricate patterns (like a herringbone layout), you will need to cut many bricks to fit. In this case, use a 10% waste factor." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Brick Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Brick Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (ft, in)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (m, mm)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Wall Length</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "feet" : "meters"}</span>
                </label>
                <div className={wrap}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Wall Height</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "feet" : "meters"}</span>
                </label>
                <div className={wrap}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Brick Size (Type)</span>
              </label>
              <div className={wrap}>
                <select value={brickType} onChange={e => setBrickType(e.target.value)} className={ci}>
                  <option value="standard">Standard {unit === "imperial" ? "(8 x 2¼ x 3⅝ in)" : "(215 x 65 x 102.5 mm)"}</option>
                  <option value="modular">Modular {unit === "imperial" ? "(7⅝ x 2¼ x 3⅝ in)" : "(190 x 57 x 90 mm)"}</option>
                  <option value="queen">Queen {unit === "imperial" ? "(8 x 2¾ x 3⅛ in)" : "(203 x 70 x 79 mm)"}</option>
                  <option value="king">King {unit === "imperial" ? "(9⅝ x 2⅝ x 3 in)" : "(244 x 67 x 76 mm)"}</option>
                  <option value="utility">Utility {unit === "imperial" ? "(11⅝ x 3⅝ x 3⅝ in)" : "(295 x 92 x 92 mm)"}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Mortar Joint Thickness</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "inches" : "mm"}</span>
              </label>
              <div className={wrap}><input type="number" value={joint} onChange={e => setJoint(e.target.value)} className={ci} min="0" step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Waste Factor</span>
                <span className="text-xs text-muted-foreground self-end">%</span>
              </label>
              <div className={wrap}><input type="number" value={waste} onChange={e => setWaste(e.target.value)} className={ci} min="0" step="any" /></div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter valid positive dimensions.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-orange-500/10 border-l-4 border-orange-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">Total Bricks Required</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.totalBricks.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase mt-1">Includes {waste}% waste margin</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Wall Area</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.wallArea} <span className="text-sm font-normal text-muted-foreground">{unit === "imperial" ? "sq ft" : "sq m"}</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Estimated Mortar Materials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Mortar Vol</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.mortarVolume}</div>
                    <div className="text-xs text-muted-foreground">{unit === "imperial" ? "Cubic Feet" : "Cubic Meters"}</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-zinc-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Cement</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.cementBags}</div>
                    <div className="text-xs text-muted-foreground">70lb Bags</div>
                  </div>
                  <div className="bg-secondary/30 rounded border border-border/50 p-4 text-center border-b-4 border-b-yellow-600">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Sand</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.sandBags}</div>
                    <div className="text-xs text-muted-foreground">50lb Bags</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  * Note: Mortar estimation is based on a standard 1:3 mix ratio. Exact bag yields vary heavily based on how deep the mason strikes the joints and how much mortar falls on the ground.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Masonry</h2>
            <p>Laying a brick wall involves surprisingly precise mathematics. Because bricks are rigid, standardized blocks, calculating the exact quantity required is a matter of calculating the surface area of the wall and dividing it by the surface area of a single brick. However, a major component that DIYers often overlook is the <strong>Mortar Joint</strong>.</p>
            <p>If you stack bare bricks directly on top of each other, your math will be completely wrong. A wall is not just made of bricks; it is made of bricks suspended in a matrix of mortar. In the United States, a standard mortar joint is 3/8 of an inch thick. To calculate correctly, you must add that 3/8 inch to both the length and the height of every single brick to determine the "Effective Area" that each brick covers on the wall.</p>

            <h2>Why Are There So Many Brick Sizes?</h2>
            <p>Walking through a brickyard, you will see a bewildering array of sizes: Standard, Modular, Queen, King, Utility, etc. Why not just use one size?</p>
            <ul>
              <li><strong>Modular Bricks:</strong> This is the most common size in commercial construction. They are mathematically designed so that exactly three horizontal courses (rows) of bricks, including their mortar joints, equal exactly 8 inches in height. This makes it incredibly easy for a mason to align the bricks with standard windows and doors.</li>
              <li><strong>King and Queen Bricks:</strong> These are physically larger face bricks. Because they are larger, you need fewer of them to cover the same wall area. This reduces the amount of mortar required and speeds up the labor, making the overall wall cheaper to build.</li>
              <li><strong>Utility Bricks:</strong> Massive bricks often used in commercial structures behind the scenes to build structural walls rapidly.</li>
            </ul>

            <h2>Estimating Mortar</h2>
            <p>Mortar is the adhesive that binds the bricks. It is not concrete. Mortar is made by mixing masonry cement (or Portland cement and lime) with fine sand and water. It contains no gravel, allowing it to spread smoothly like peanut butter.</p>
            <p>Calculating mortar volume is difficult because it depends heavily on the skill of the mason. A messy mason will drop a significant amount of mortar on the ground, and striking (tooling) the joints deeply removes more material from the wall. As a general industry rule of thumb, you need roughly one cubic foot of wet mortar for every 50 to 60 standard bricks laid.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/brick-calculator" />
          <PopularCalculators exclude="/calculator/brick-calculator" />
        </div>
      </div>
    </>
  );
};
export default BrickCalculator;
