"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Target, Zap, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface SluggingInputs {
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
}

interface SluggingResults {
  sluggingPercentage: string; // formatted as ".540"
  totalBases: number;
  singles: number;
  classification: "Elite Power" | "Great Power" | "Average" | "Below Average" | "Poor Power";
  colorClass: string;
  chartData: { name: string; bases: number; count: number }[];
}

// 2. Pure Calculation Function
const calculateSlugging = (inputs: SluggingInputs): SluggingResults | null => {
  const { atBats, hits, doubles, triples, homeRuns } = inputs;
  
  if (atBats < 0 || hits < 0 || doubles < 0 || triples < 0 || homeRuns < 0) return null;
  
  // Logical constraints
  const extraBaseHits = doubles + triples + homeRuns;
  if (hits > atBats) return null; // Can't have more hits than at-bats
  if (extraBaseHits > hits) return null; // Can't have more extra-base hits than total hits

  const singles = hits - extraBaseHits;

  // Total Bases Formula: (1 * 1B) + (2 * 2B) + (3 * 3B) + (4 * HR)
  const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);

  if (atBats === 0) return null;

  const sluggingRaw = totalBases / atBats;

  // Format to standard 3 decimal places without leading zero
  let sluggingString = sluggingRaw.toFixed(3).toString();
  if (sluggingString.startsWith("0")) {
    sluggingString = sluggingString.substring(1);
  }

  // Classifications (Modern MLB standards)
  let classification: SluggingResults["classification"] = "Average";
  let colorClass = "#3b82f6";

  if (sluggingRaw >= 0.500) {
    classification = "Elite Power";
    colorClass = "#8b5cf6"; // Purple
  } else if (sluggingRaw >= 0.450) {
    classification = "Great Power";
    colorClass = "#10b981"; // Emerald
  } else if (sluggingRaw >= 0.400) {
    classification = "Average";
    colorClass = "#3b82f6"; // Blue
  } else if (sluggingRaw >= 0.350) {
    classification = "Below Average";
    colorClass = "#f59e0b"; // Amber
  } else {
    classification = "Poor Power";
    colorClass = "#ef4444"; // Red
  }

  // Generate Chart Data showing the BASE yield of each hit type
  const chartData = [
    { name: "Singles (1B)", bases: singles * 1, count: singles },
    { name: "Doubles (2B)", bases: doubles * 2, count: doubles },
    { name: "Triples (3B)", bases: triples * 3, count: triples },
    { name: "Home Runs (HR)", bases: homeRuns * 4, count: homeRuns }
  ];

  return {
    sluggingPercentage: sluggingString,
    totalBases,
    singles,
    classification,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  atBats: "500",
  hits: "135",
  doubles: "30",
  triples: "2",
  homeRuns: "25"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">{data.name}</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-muted-foreground mr-3">Hits:</span>
          <span className="font-bold text-foreground">{data.count}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">Bases Yielded:</span>
          <span className="font-bold text-primary">{data.bases}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function BaseballSluggingCalculator() {
  // 4. Component State
  const [atBats, setAtBats] = useState(DEFAULTS.atBats);
  const [hits, setHits] = useState(DEFAULTS.hits);
  const [doubles, setDoubles] = useState(DEFAULTS.doubles);
  const [triples, setTriples] = useState(DEFAULTS.triples);
  const [homeRuns, setHomeRuns] = useState(DEFAULTS.homeRuns);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<SluggingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const ab = parseInt(atBats, 10);
    const h = parseInt(hits, 10);
    const d = parseInt(doubles, 10);
    const t = parseInt(triples, 10);
    const hr = parseInt(homeRuns, 10);

    if (isNaN(ab) || ab < 0) return setErrorMsg("Please enter valid At-Bats.");
    if (isNaN(h) || h < 0) return setErrorMsg("Please enter valid Total Hits.");
    if (isNaN(d) || d < 0) return setErrorMsg("Please enter valid Doubles.");
    if (isNaN(t) || t < 0) return setErrorMsg("Please enter valid Triples.");
    if (isNaN(hr) || hr < 0) return setErrorMsg("Please enter valid Home Runs.");

    if (h > ab) return setErrorMsg("Total Hits cannot exceed At-Bats.");
    if ((d + t + hr) > h) return setErrorMsg("Extra-Base Hits (2B+3B+HR) cannot exceed Total Hits.");

    const res = calculateSlugging({ atBats: ab, hits: h, doubles: d, triples: t, homeRuns: hr });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Ensure At-Bats > 0.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setAtBats(DEFAULTS.atBats);
    setHits(DEFAULTS.hits);
    setDoubles(DEFAULTS.doubles);
    setTriples(DEFAULTS.triples);
    setHomeRuns(DEFAULTS.homeRuns);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atBats, hits, doubles, triples, homeRuns]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Baseball Slugging Percentage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is Slugging Percentage (SLG) more valuable than Batting Average?", answer: "Batting Average treats all hits as exactly equal. A slow infield single that barely beats the throw to first base is given the exact same mathematical weight as a 450-foot grand slam home run. This is a massive analytical failure. A player who hits 40 home runs is vastly more valuable to run production than a player who hits 40 singles. Slugging Percentage corrects this by applying a multiplier to hits based on how many bases they secure for the team." },
    { question: "How does the Slugging math actually work?", answer: "Instead of dividing Hits by At-Bats, Slugging Percentage divides 'Total Bases' by At-Bats. The formula multiplies your hits by their base value. A Single is worth 1 base. A Double is worth 2 bases. A Triple is worth 3 bases. A Home Run is worth 4 bases. Therefore, a single Home Run provides four times the mathematical value to your Slugging Percentage than a Single does, accurately reflecting the massive run-scoring potential of extra-base hits." },
    { question: "Is a Slugging Percentage of .500 considered good?", answer: "Yes. In modern Major League Baseball, the league average SLG generally hovers around .400 to .410. If a player maintains a Slugging Percentage over .500, they are considered an elite power threat and are likely hitting 30+ home runs or 40+ doubles in a season. Barry Bonds holds the single-season record, posting a mathematically absurd .863 Slugging Percentage in the 2001 season (where he hit 73 home runs)." },
    { question: "Why doesn't this calculator ask for Singles?", answer: "Singles do not need to be manually entered because they are mathematically derived. The calculator takes your 'Total Hits' and subtracts your extra-base hits (Doubles + Triples + Home Runs). The remaining hits are, by definition, your Singles. This prevents users from accidentally entering conflicting numbers (e.g., entering 100 Total Hits, but somehow entering 80 Singles and 40 Home Runs)." },
    { question: "What is OPS and why is it related?", answer: "OPS stands for 'On-Base Plus Slugging'. It is simply the addition of a player's On-Base Percentage (OBP) and their Slugging Percentage (SLG). Sabermetricians love OPS because it elegantly combines the two most important offensive traits: the ability to avoid making an out (OBP), and the ability to hit the ball with massive destructive power (SLG). An OPS over .800 is great; an OPS over 1.000 is MVP-level." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball Slugging Percentage (SLG) Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball Slugging Percentage (SLG) Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Zap className="h-4 w-4" /> Offensive Statistics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the player's total at-bats, total hits, and the breakdown of their extra-base hits to calculate their weighted power rating.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="ab" label="At Bats (AB)" value={atBats} onChange={setAtBats} />
              <CompactInput id="hits" label="Total Hits (H)" value={hits} onChange={setHits} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1 pt-4 border-t border-border">
              <CompactInput id="2b" label="Doubles (2B)" value={doubles} onChange={setDoubles} />
              <CompactInput id="3b" label="Triples (3B)" value={triples} onChange={setTriples} />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-1">
              <CompactInput id="hr" label="Home Runs (HR)" value={homeRuns} onChange={setHomeRuns} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold"
              >
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Box */}
                <div 
                  className="text-white rounded-lg p-6 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: results.colorClass }}
                >
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Slugging Percentage (SLG)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{results.sluggingPercentage}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Zap className="h-4 w-4" /> {results.classification} Status
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Bases Secured</div>
                    <div className="text-3xl font-black text-white">{results.totalBases}</div>
                    <div className="text-[10px] text-slate-500 mt-1">1B + (2B*2) + (3B*3) + (HR*4)</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Derived Singles (1B)</div>
                    <div className="text-3xl font-black text-white">{results.singles}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Total Hits - Extra Base Hits</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Power Base Generation</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A breakdown of how this player generated their Total Bases. While singles are common, the massive 4x multiplier applied to Home Runs demonstrates how elite power hitters can mathematically dominate offensive production.</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="bases" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {results.chartData.map((entry, index) => {
                            let fill = "hsl(var(--primary))";
                            if (entry.name.includes("Singles")) fill = "#3b82f6";
                            if (entry.name.includes("Doubles")) fill = "#10b981";
                            if (entry.name.includes("Triples")) fill = "#f59e0b";
                            if (entry.name.includes("Home Runs")) fill = "#ef4444";
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Zap className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's extra-base hits and total at-bats to calculate their mathematical power rating and overall slugging percentage.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Flaw of Traditional Batting Average</h2>
            <p>For decades, the most celebrated statistic in the sport of baseball was the Batting Average. If a player was hitting .300, they were automatically considered a superstar. But there is a massive, fundamental mathematical flaw in Batting Average: it treats every single hit as if it possesses the exact same value. In the eyes of Batting Average, a slow, bouncing infield single that barely beats the throw to first base is completely equal to a 450-foot grand slam home run that clears the stadium walls. The <strong>Baseball Slugging Percentage (SLG) Calculator</strong> destroys this false equivalency by evaluating hits based on the actual, physical damage they do to the opposing team.</p>

            <h2>Understanding the Total Bases Multiplier</h2>
            <p>Slugging Percentage corrects the Batting Average error by abandoning "Hits" and replacing them with "Total Bases." In order to calculate SLG, the formula applies a specific multiplier to every type of hit a batter achieves, directly correlating to how many bases that hit secured for the team.</p>
            <p>The formula is simple but profoundly effective: A Single is worth 1 base. A Double is multiplied by 2. A Triple is multiplied by 3. And a Home Run is multiplied by 4. This means that mathematically, a single home run provides four times the offensive value to the Slugging Percentage than a standard single does. Once the "Total Bases" are calculated, that number is divided by the player's total At-Bats to generate the final Slugging Percentage decimal.</p>

            <h2>Why Power Hitters Are Incredibly Valuable</h2>
            <p>If you look at the chart generated by this calculator, you will instantly visualize why modern Major League Baseball front offices are obsessed with acquiring power hitters, even if those hitters strike out frequently.</p>
            <p>Imagine a "contact hitter" who has 100 At-Bats. They hit 30 Singles and zero extra-base hits. Their Batting Average is an elite .300. Their Slugging Percentage is also .300. Now imagine a "power hitter" who also has 100 At-Bats. They strike out constantly and only get 20 hits. However, 10 of those hits are Home Runs, 5 are Doubles, and 5 are Singles. Their Batting Average is a terrible .200. But if you calculate their Total Bases (40 + 10 + 5), you get 55. Their Slugging Percentage is a massive .550. Despite having a terrible Batting Average, the power hitter generated 55 total bases for the team compared to the contact hitter's 30. The power hitter is mathematically generating vastly more run-scoring opportunities.</p>

            <h2>The Rise of OPS (On-Base Plus Slugging)</h2>
            <p>While Slugging Percentage is an incredible tool for measuring raw power and run-producing capacity, it is not a perfect statistic on its own. Like Batting Average, SLG completely ignores Walks and Hit-By-Pitches. A batter could draw 100 walks in a season, and their Slugging Percentage would completely ignore that massive offensive contribution.</p>
            <p>To solve this, modern sabermetricians created the ultimate, unified hitting statistic: OPS (On-Base Plus Slugging). By simply taking a player's On-Base Percentage (which perfectly measures their ability to avoid making an out and getting to first base) and adding it to their Slugging Percentage (which perfectly measures their destructive power), you get a single number that encapsulates the player's entire offensive profile. If a player has a high SLG but a terrible OBP, they are a flawed power hitter. If they have both, they are an MVP.</p>

            <h2>Why Triples Are the Rarest Base</h2>
            <p>If you play with the calculator, you will notice that Triples (3B) provide a massive 3x multiplier to the SLG formula. However, in modern baseball, Triples are exceptionally rare. Why?</p>
            <p>A Triple requires a perfect storm of variables. The hitter must possess extreme sprint speed, the stadium must possess deep, expansive outfield dimensions (like "Triples Alley" in San Francisco), and the ball must be hit into a physical gap that requires the outfielders to run a massive distance to retrieve it. For slower power hitters, a ball hit into the gap will only result in a Double. Therefore, players who generate high Slugging Percentages via Triples are almost exclusively elite, fast-twitch athletes, whereas players who generate high SLG via Home Runs are typically massive, pure-power athletes.</p>

            <h2>What is Considered an 'Elite' Slugging Percentage?</h2>
            <p>Because the formula divides Total Bases by At-Bats, it is mathematically possible for a player's Slugging Percentage to exceed 1.000 (if they average more than one base per at-bat). However, over a 162-game season, this is nearly impossible.</p>
            <p>In the modern era of baseball, the league average SLG typically hovers around .400 to .410. If a player finishes the season with a Slugging Percentage above .450, they had a great offensive year. If they cross the .500 threshold, they are considered an elite power threat. The single-season Major League record belongs to Barry Bonds, who posted an incomprehensible .863 Slugging Percentage in 2001, hitting 73 home runs and generating 411 Total Bases in just 476 at-bats.</p>

            <h2>Conclusion: Stop Counting Singles</h2>
            <p>If you want to evaluate a baseball player's true ability to drive in runs and change the geometry of a game, you must look past their Batting Average. Use the Baseball Slugging Percentage Calculator to measure the actual, mathematical weight of their contact. By valuing extra-base hits accurately, you will instantly recognize which hitters are truly generating the power required to win championships.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-slugging-percentage-calculator" />
          <PopularCalculators exclude="/calculator/baseball-slugging-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
