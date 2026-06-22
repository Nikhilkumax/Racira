"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, LayoutGrid } from "lucide-react";

interface TileResult {
  totalTiles: number;
  areaSqFt: number;
  boxCount: number;
  totalCost: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateTiles = (
  unit: string,
  roomLStr: string,
  roomWStr: string,
  tileLStr: string,
  tileWStr: string,
  gapStr: string,
  wasteStr: string,
  tilesPerBoxStr: string,
  pricePerBoxStr: string
): TileResult | null => {
  const roomL = parseFloat(roomLStr);
  const roomW = parseFloat(roomWStr);
  const tileL = parseFloat(tileLStr);
  const tileW = parseFloat(tileWStr);
  const gap = parseFloat(gapStr);
  const waste = parseFloat(wasteStr) / 100;
  const tilesPerBox = parseInt(tilesPerBoxStr, 10);
  const pricePerBox = parseFloat(pricePerBoxStr);

  if (isNaN(roomL) || isNaN(roomW) || isNaN(tileL) || isNaN(tileW) || isNaN(gap) || isNaN(waste) || isNaN(tilesPerBox) || isNaN(pricePerBox) || roomL <= 0 || roomW <= 0 || tileL <= 0 || tileW <= 0 || gap < 0 || tilesPerBox <= 0 || pricePerBox < 0) return null;

  try {
    let area = 0;
    let tL = 0;
    let tW = 0;

    // Standardize to inches for calculation
    if (unit === "imperial") {
      // Room is in feet, convert to inches
      const roomL_in = roomL * 12;
      const roomW_in = roomW * 12;
      area = roomL * roomW; // sq ft for display

      // Tile dimensions + grout gap
      tL = tileL + gap;
      tW = tileW + gap;

      const tileAreaIn = tL * tW;
      const roomAreaIn = roomL_in * roomW_in;

      const totalTilesRaw = roomAreaIn / tileAreaIn;
      const totalTilesWithWaste = Math.ceil(totalTilesRaw * (1 + waste));

      const boxes = Math.ceil(totalTilesWithWaste / tilesPerBox);
      const cost = boxes * pricePerBox;

      return {
        totalTiles: totalTilesWithWaste,
        areaSqFt: parseFloat(area.toFixed(2)),
        boxCount: boxes,
        totalCost: parseFloat(cost.toFixed(2)),
        isError: false
      };
    } else {
      // Metric: Room in meters, Tile in mm, Gap in mm
      // Convert everything to mm
      const roomL_mm = roomL * 1000;
      const roomW_mm = roomW * 1000;
      area = roomL * roomW; // sq m for display

      tL = tileL + gap;
      tW = tileW + gap;

      const tileAreaMm = tL * tW;
      const roomAreaMm = roomL_mm * roomW_mm;

      const totalTilesRaw = roomAreaMm / tileAreaMm;
      const totalTilesWithWaste = Math.ceil(totalTilesRaw * (1 + waste));

      const boxes = Math.ceil(totalTilesWithWaste / tilesPerBox);
      const cost = boxes * pricePerBox;

      return {
        totalTiles: totalTilesWithWaste,
        areaSqFt: parseFloat(area.toFixed(2)), // Storing sq m in this field when metric
        boxCount: boxes,
        totalCost: parseFloat(cost.toFixed(2)),
        isError: false
      };
    }

  } catch (err) {
    return { totalTiles: 0, areaSqFt: 0, boxCount: 0, totalCost: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const TileCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [roomL, setRoomL] = useState("10"); // ft or m
  const [roomW, setRoomW] = useState("12"); // ft or m
  const [tileL, setTileL] = useState("12"); // in or mm
  const [tileW, setTileW] = useState("12"); // in or mm
  const [gap, setGap] = useState("0.25"); // in or mm
  const [waste, setWaste] = useState("10"); // %
  const [tilesPerBox, setTilesPerBox] = useState("10");
  const [price, setPrice] = useState("25");

  const [result, setResult] = useState<TileResult | null>(null);

  const calculate = () => {
    setResult(calculateTiles(unit, roomL, roomW, tileL, tileW, gap, waste, tilesPerBox, price));
  };

  useEffect(() => { calculate(); }, [unit, roomL, roomW, tileL, tileW, gap, waste, tilesPerBox, price]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setRoomL("10"); setRoomW("12"); setTileL("12"); setTileW("12"); setGap("0.25");
    } else {
      setRoomL("3"); setRoomW("4"); setTileL("300"); setTileW("300"); setGap("5"); // mm
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const faqs = [
    { question: "Why do I need to calculate the grout gap?", answer: "Tiles are never laid edge-to-edge. They are separated by small plastic spacers (usually 1/8 to 1/4 inch) to leave room for grout. Grout prevents water from seeping between the tiles and destroying the subfloor, and allows for tiny microscopic expansions of the floor without the tiles cracking against each other. To get an accurate count, you must mathematically add the width of the grout gap to the physical dimensions of the tile." },
    { question: "How much waste should I plan for?", answer: "If you are tiling a perfectly square room with straight walls, a 10% waste factor is standard to account for dropped tiles or bad cuts. If you are laying the tile in a diagonal pattern, or if the room has many angles, closets, or obstacles (like a bathroom with a toilet and vanity), you should increase the waste factor to 15% or 20% because you will have to make many complex cuts, destroying more tiles in the process." },
    { question: "Why do I buy by the box?", answer: "Tile is extremely fragile during shipping. It is almost exclusively sold in dense, heavy cardboard boxes packed tightly to prevent movement and cracking. Hardware stores rarely sell individual tiles (except for very expensive, large-format decorative tiles). If you need 105 tiles and they come 10 to a box, you must buy 11 boxes (110 tiles)." },
    { question: "What is 'nominal' vs 'actual' size?", answer: "Many tiles are sold by 'nominal' size. For example, a tile sold as 12x12 inches might physically measure 11.75 x 11.75 inches. The manufacturer assumes you will use a 1/4 inch grout joint, so the 'installed' footprint is exactly 12x12. Always measure the physical tile yourself to know what number to enter into the calculator." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Tile Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tile Calculator</h1>
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
                  <span>Room Length</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "feet" : "meters"}</span>
                </label>
                <div className={wrap}><input type="number" value={roomL} onChange={e => setRoomL(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Room Width</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "feet" : "meters"}</span>
                </label>
                <div className={wrap}><input type="number" value={roomW} onChange={e => setRoomW(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Tile Length</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "inches" : "mm"}</span>
                </label>
                <div className={wrap}><input type="number" value={tileL} onChange={e => setTileL(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Tile Width</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "inches" : "mm"}</span>
                </label>
                <div className={wrap}><input type="number" value={tileW} onChange={e => setTileW(e.target.value)} className={ci} min="0.1" step="any" /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Grout Gap</span>
                  <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "inches" : "mm"}</span>
                </label>
                <div className={wrap}><input type="number" value={gap} onChange={e => setGap(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Waste Factor</span>
                  <span className="text-xs text-muted-foreground self-end">%</span>
                </label>
                <div className={wrap}><input type="number" value={waste} onChange={e => setWaste(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Tiles Per Box</span>
                </label>
                <div className={wrap}><input type="number" value={tilesPerBox} onChange={e => setTilesPerBox(e.target.value)} className={ci} min="1" step="1" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Price Per Box</span>
                  <span className="text-xs text-muted-foreground self-end">$</span>
                </label>
                <div className={wrap}><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <LayoutGrid className="h-5 w-5" /> Calculate Project
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your inputs. Ensure no fields are zero.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Total Material Cost</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {formatCurrency(result.totalCost)}
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Room Area</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.areaSqFt} <span className="text-sm font-normal text-muted-foreground">{unit === "imperial" ? "sq ft" : "sq m"}</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Required Materials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Individual Tiles</div>
                    <div className="text-3xl font-bold text-foreground font-mono">{result.totalTiles.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase mt-1">Includes {waste}% waste</div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                    <div className="text-xs text-primary font-bold uppercase mb-1">Full Boxes to Buy</div>
                    <div className="text-3xl font-bold text-primary font-mono">{result.boxCount.toLocaleString()}</div>
                    <div className="text-xs text-primary/70 font-bold uppercase mt-1">Boxes of {tilesPerBox}</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Flooring</h2>
            <p>Laying a tile floor seems like a simple math problem: calculate the square footage of the room, calculate the square footage of a single tile, and divide. However, performing this calculation without accounting for the realities of construction will leave you short on materials every time. The two critical factors you must include are the <strong>Grout Joint</strong> and the <strong>Waste Margin</strong>.</p>

            <h2>Why Calculate the Grout Joint?</h2>
            <p>Tiles are almost never laid edge-to-edge. They are installed using small plastic spacers (usually 1/8 to 1/4 of an inch) to leave an intentional gap between every single tile. Once the adhesive dries, this gap is filled with grout.</p>
            <p>Grout serves two vital purposes: it prevents liquid water from seeping between the tiles and rotting the wooden subfloor beneath, and it provides a microscopic cushion. Houses expand and contract with seasonal temperature changes. If rigid ceramic tiles were laid touching each other, that expansion pressure would cause the tiles to buckle and crack.</p>
            <p>Mathematically, if you are laying 12x12 inch tiles with a 1/4 inch grout joint, the actual physical footprint of the installed tile is 12.25 x 12.25 inches. Over the span of a large room, failing to account for the grout will severely throw off your material count.</p>

            <h2>Understanding the Waste Margin</h2>
            <p>Rooms are rarely perfectly square, and tiles are rarely perfectly cut. When laying a floor, you will inevitably have to cut tiles to fit against the walls, around doorways, or around plumbing fixtures like a toilet. Many of these cut off-cuts will be completely unusable scraps. Furthermore, ceramic and porcelain tiles are fragile; you will almost certainly break a few while scoring them or dropping them.</p>
            <p>To compensate, industry standard practice dictates you must over-order materials.</p>
            <ul>
              <li><strong>10% Waste (Standard):</strong> Use this for a standard, square or rectangular room where the tiles are laid in a straight grid.</li>
              <li><strong>15% Waste (Diagonal / Complex):</strong> If you are laying the tile in a diagonal (diamond) pattern, you will have to cut an angle into almost every single tile that touches a wall, creating massive amounts of scrap waste. You should also use 15% for complex bathrooms with many fixtures.</li>
            </ul>

            <h2>Why is Tile Sold by the Box?</h2>
            <p>Because tile is heavy and extremely fragile, it is shipped from the factory tightly packed in heavy corrugated cardboard boxes to prevent movement and cracking. For this reason, hardware stores rarely allow you to break open a box to buy individual tiles. If your mathematical calculation determines you need 112 tiles, and the tiles are sold in boxes of 10, you cannot buy 11.2 boxes. You must round up and purchase exactly 12 full boxes.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tile-calculator" />
          <PopularCalculators exclude="/calculator/tile-calculator" />
        </div>
      </div>
    </>
  );
};
export default TileCalculator;
