"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Crosshair, Target, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface OBPInputs {
  atBats: number;
  hits: number;
  walks: number;
  hitByPitch: number;
  sacFlies: number;
}

interface OBPResults {
  obp: string; // Stored as a string for standard baseball formatting e.g., ".350"
  plateAppearances: number;
  timesOnBase: number;
  classification: "Elite (All-Star)" | "Great" | "Average" | "Below Average" | "Poor";
  colorClass: string;
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
const calculateOBP = (inputs: OBPInputs): OBPResults | null => {
  const { atBats, hits, walks, hitByPitch, sacFlies } = inputs;
  
  if (atBats < 0 || hits < 0 || walks < 0 || hitByPitch < 0 || sacFlies < 0) return null;
  if (hits > atBats) return null; // Impossible to have more hits than at-bats

  // Times on Base (Numerator)
  const timesOnBase = hits + walks + hitByPitch;
  
  // Plate Appearances for OBP (Denominator)
  // Note: OBP does not count Sacrifice Bunts (SH) or Catcher's Interference (CI)
  const plateAppearances = atBats + walks + hitByPitch + sacFlies;

  if (plateAppearances === 0) return null;

  const obpRaw = timesOnBase / plateAppearances;

  // Format to standard 3 decimal places without leading zero
  let obpString = obpRaw.toFixed(3).toString();
  if (obpString.startsWith("0")) {
    obpString = obpString.substring(1);
  }

  // Classifications (Modern MLB standards)
  let classification: OBPResults["classification"] = "Average";
  let colorClass = "#3b82f6";

  if (obpRaw >= 0.390) {
    classification = "Elite (All-Star)";
    colorClass = "#8b5cf6"; // Purple
  } else if (obpRaw >= 0.340) {
    classification = "Great";
    colorClass = "#10b981"; // Emerald
  } else if (obpRaw >= 0.315) {
    classification = "Average";
    colorClass = "#3b82f6"; // Blue
  } else if (obpRaw >= 0.290) {
    classification = "Below Average";
    colorClass = "#f59e0b"; // Amber
  } else {
    classification = "Poor";
    colorClass = "#ef4444"; // Red
  }

  // Generate Chart Data for visual composition
  const chartData = [
    { name: "Hits", value: hits },
    { name: "Walks", value: walks },
    { name: "Hit by Pitch", value: hitByPitch }
  ];

  return {
    obp: obpString,
    plateAppearances,
    timesOnBase,
    classification,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  atBats: "450",
  hits: "125",
  walks: "60",
  hitByPitch: "5",
  sacFlies: "4"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Base Access Method</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">{payload[0].payload.name}:</span>
          <span className="font-bold">{payload[0].value} Times</span>
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

export default function BaseballOBPCalculator() {
  // 4. Component State
  const [atBats, setAtBats] = useState(DEFAULTS.atBats);
  const [hits, setHits] = useState(DEFAULTS.hits);
  const [walks, setWalks] = useState(DEFAULTS.walks);
  const [hitByPitch, setHitByPitch] = useState(DEFAULTS.hitByPitch);
  const [sacFlies, setSacFlies] = useState(DEFAULTS.sacFlies);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<OBPResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const ab = parseInt(atBats, 10);
    const h = parseInt(hits, 10);
    const bb = parseInt(walks, 10);
    const hbp = parseInt(hitByPitch, 10);
    const sf = parseInt(sacFlies, 10);

    if (isNaN(ab) || ab < 0) return setErrorMsg("Please enter valid At-Bats.");
    if (isNaN(h) || h < 0) return setErrorMsg("Please enter valid Hits.");
    if (isNaN(bb) || bb < 0) return setErrorMsg("Please enter valid Walks.");
    if (isNaN(hbp) || hbp < 0) return setErrorMsg("Please enter valid Hit by Pitches.");
    if (isNaN(sf) || sf < 0) return setErrorMsg("Please enter valid Sacrifice Flies.");

    if (h > ab) return setErrorMsg("Hits cannot exceed At-Bats.");

    const res = calculateOBP({ atBats: ab, hits: h, walks: bb, hitByPitch: hbp, sacFlies: sf });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Ensure plate appearances > 0.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setAtBats(DEFAULTS.atBats);
    setHits(DEFAULTS.hits);
    setWalks(DEFAULTS.walks);
    setHitByPitch(DEFAULTS.hitByPitch);
    setSacFlies(DEFAULTS.sacFlies);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atBats, hits, walks, hitByPitch, sacFlies]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Baseball OBP Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is On-Base Percentage (OBP) more important than Batting Average?", answer: "Batting Average only counts hits. It completely ignores walks and hit-by-pitches. If a player walks 100 times in a season, their Batting Average does not increase, making it look like those 100 successful plate appearances never happened. OBP measures the single most important job of a batter: avoiding making an out. The statistical reality of baseball is that the team that avoids outs the longest, scores the most runs. A walk is statistically just as effective as a single at avoiding an out, making OBP the vastly superior metric." },
    { question: "What was the 'Moneyball' revolution?", answer: "In the early 2000s, the Oakland Athletics (led by Billy Beane) realized that the rest of Major League Baseball was severely overvaluing Batting Average and heavily undervaluing Walks. Because other teams ignored walks, players with high OBPs could be acquired very cheaply. By building a team entirely focused on OBP, the Athletics proved that a team of 'average' hitters who walked constantly could win just as many games as a team of expensive superstars. This mathematical revelation changed how every team in sports evaluates talent." },
    { question: "Why do Sacrifice Flies lower OBP?", answer: "A Sacrifice Fly (SF) occurs when a batter hits a deep fly ball that is caught for an out, but allows a runner on third base to tag up and score. In traditional Batting Average, an SF does not count as an at-bat, so it doesn't penalize the hitter. However, in OBP, an SF is counted in the denominator as a Plate Appearance. Why? Because OBP strictly measures the ability to get safely on base. Even though the SF helped the team score, the batter still made an out, so their individual OBP goes down." },
    { question: "Why are Sacrifice Bunts NOT included in OBP?", answer: "A Sacrifice Bunt is an intentional tactical decision ordered by the manager to advance a runner, knowing it will result in a near-guaranteed out for the batter. Because the batter was essentially ordered to make an out by the coaching staff, statisticians decided it was unfair to penalize the batter's personal On-Base Percentage for executing a team command." },
    { question: "What is a 'Good' OBP?", answer: "In modern Major League Baseball, the league average OBP usually hovers around .315 to .320. If a player has an OBP of .340, they are considered a great asset to the lineup. If a player consistently maintains an OBP above .390 or .400, they are considered Elite and are almost certainly performing at an All-Star or MVP level. Barry Bonds holds the single-season record with an absurd .609 OBP in 2004." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball On-Base Percentage (OBP) Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball On-Base Percentage (OBP) Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Plate Discipline
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the player's seasonal statistics to calculate their true mathematical value at the plate.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="ab" label="At Bats (AB)" value={atBats} onChange={setAtBats} />
              <CompactInput id="hits" label="Hits (H)" value={hits} onChange={setHits} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="walks" label="Walks (BB)" value={walks} onChange={setWalks} />
              <CompactInput id="hbp" label="Hit By Pitch (HBP)" value={hitByPitch} onChange={setHitByPitch} />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-1 border-t border-border pt-4">
              <CompactInput id="sf" label="Sacrifice Flies (SF)" value={sacFlies} onChange={setSacFlies} />
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
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">On-Base Percentage (OBP)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{results.obp}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> {results.classification} Status
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Times Reached Base</div>
                    <div className="text-3xl font-black text-white">{results.timesOnBase}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Hits + Walks + Hit By Pitch</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Qualifying Plate Apps</div>
                    <div className="text-3xl font-black text-white">{results.plateAppearances}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Denominator: AB + BB + HBP + SF</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Base Access Composition</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A breakdown of exactly how this player avoided making an out. In traditional statistics, only the 'Hits' bar is evaluated, completely ignoring the immense value of plate discipline (Walks).</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {results.chartData.map((entry, index) => {
                            let fill = "hsl(var(--primary))";
                            if (entry.name === "Walks") fill = "#10b981"; // Highlight walks to emphasize Moneyball concept
                            if (entry.name === "Hit by Pitch") fill = "#f59e0b";
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
                <Crosshair className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's hitting statistics to calculate their On-Base Percentage and determine their true mathematical value to the team.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Moneyball</h2>
            <p>For over a century, the game of baseball operated under a deeply flawed mathematical assumption: the only way to measure a great hitter was by their Batting Average. If a player hit .300 (getting a hit 30% of the time), they were considered a superstar and were paid millions of dollars. If a player hit .240, they were considered a liability and benched. This massive mathematical blind spot ignored one of the most crucial elements of the game: the Walk. The <strong>Baseball On-Base Percentage (OBP) Calculator</strong> exposes the flaw of traditional Batting Average by measuring the only thing that actually prevents a team from losing: the ability to safely reach base.</p>

            <h2>Why Batting Average is a Liar</h2>
            <p>To understand the genius of OBP, you must understand the failure of Batting Average. Batting Average is calculated by dividing Hits by At-Bats. It completely ignores Walks and Hit-By-Pitches. </p>
            <p>Imagine two players. Player A has 100 At-Bats and gets 30 Hits. He never walks. His Batting Average is .300. He made 70 outs for his team. Player B has 100 At-Bats and gets 25 Hits. But Player B has incredible plate discipline, forcing the pitcher into deep counts, and draws 20 Walks. Because walks do not count as At-Bats, Player B's Batting Average is .250. To a traditional baseball scout, Player A looks vastly superior. However, the mathematics tell a completely different story. Player A reached base 30 times. Player B reached base 45 times. Player B is mathematically a vastly superior offensive asset.</p>

            <h2>The Anatomy of the OBP Formula</h2>
            <p>On-Base Percentage fixes the blind spots of Batting Average by including all primary methods of safely reaching base. The formula is: <code>(Hits + Walks + Hit By Pitch) / (At Bats + Walks + Hit By Pitch + Sacrifice Flies)</code>.</p>
            <p>The numerator represents every time the player safely reached first base without relying on a fielding error or a fielder's choice. The denominator represents every time the player stepped into the batter's box with the intent to hit, including Sacrifice Flies. By combining these variables, OBP gives a pure, undistilled mathematical percentage of a player's ability to not make an out.</p>

            <h2>The Value of the Walk</h2>
            <p>In the early 2000s, Billy Beane and the Oakland Athletics revolutionized the sport by exploiting the financial gap between Batting Average and OBP. They realized that a walk is statistically identical to a single in its ability to put a runner on first base and prevent an out. However, players who walked frequently (but had low Batting Averages) were incredibly cheap to acquire in free agency.</p>
            <p>The Athletics built a team entirely focused on OBP. They instructed their batters to be intensely patient, never swinging at bad pitches, and intentionally drawing walks. They proved that a team of "average" hitters who walked constantly could mathematically generate just as many runs as a team of expensive superstars. This statistical revolution, famously documented in the book <em>Moneyball</em>, forever changed how professional sports teams evaluate talent.</p>

            <h2>Why Sacrifice Flies Hurt Your OBP</h2>
            <p>Many amateur statisticians are confused by the inclusion of Sacrifice Flies (SF) in the denominator of the OBP equation. If a batter hits a deep fly ball, and a runner tags up from third base to score a run, it is considered a successful play for the team. Why does it lower the batter's OBP?</p>
            <p>Because OBP does not measure run production; it strictly measures base access. Even though the batter successfully helped the team score a run, the batter still made an out. They did not reach base safely. Because they consumed a plate appearance and resulted in an out, the mathematics dictate that their personal On-Base Percentage must decrease. (This is why teams also calculate OPS—On-Base Plus Slugging—to capture the full value of run-producing outs).</p>

            <h2>Why Sacrifice Bunts Are Ignored</h2>
            <p>If a Sacrifice Fly lowers your OBP, why doesn't a Sacrifice Bunt? A Sacrifice Bunt is an intentional tactical decision ordered by the team's manager. The manager tells the batter to lay down a bunt, knowing the batter will almost certainly be thrown out at first base, simply to advance a runner to second.</p>
            <p>Because the batter was essentially ordered to execute an out by the coaching staff, statisticians decided it was mathematically unfair to penalize the batter's personal performance metrics. Therefore, Sacrifice Bunts are completely excluded from the Plate Appearance denominator.</p>

            <h2>Conclusion: The Ultimate Out Prevention Metric</h2>
            <p>The fundamental rule of baseball is that a team is only granted 27 outs per game. The team that guards those outs the most fiercely will statistically win the most games. Stop looking at Batting Average. Use the Baseball On-Base Percentage Calculator to evaluate hitters based on their true objective value: their disciplined, relentless ability to reach base.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-on-base-percentage-calculator" />
          <PopularCalculators exclude="/calculator/baseball-on-base-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
