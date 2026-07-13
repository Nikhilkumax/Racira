"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface EPSResult {
  basicEPS: number; dilutedEPS: number; adjustedEPS: number;
  peRatio: number | null; earningsYield: number | null;
  sharesBasis: number; dilutedShares: number;
}
const DEFAULTS = { netIncome:"4200000000", preferredDividends:"200000000", sharesOutstanding:"3200000000", dilutiveOptions:"150000000", dilutiveWarrants:"50000000", stockPrice:"185", oneTimeItems:"0" };

function calculate(d: typeof DEFAULTS): EPSResult {
  const netIncome = parseFloat(d.netIncome)||0, prefDiv = parseFloat(d.preferredDividends)||0;
  const shares = parseFloat(d.sharesOutstanding)||1;
  const options = parseFloat(d.dilutiveOptions)||0, warrants = parseFloat(d.dilutiveWarrants)||0;
  const stockPrice = parseFloat(d.stockPrice)||0, oneTime = parseFloat(d.oneTimeItems)||0;
  const available = netIncome - prefDiv, adjusted = available - oneTime;
  const diluted = shares + options + warrants;
  const basicEPS = shares>0 ? available/shares : 0;
  const dilutedEPS = diluted>0 ? available/diluted : 0;
  const adjustedEPS = diluted>0 ? adjusted/diluted : 0;
  const peRatio = dilutedEPS!==0&&stockPrice>0 ? stockPrice/dilutedEPS : null;
  const earningsYield = peRatio!==null ? (1/peRatio)*100 : null;
  return { basicEPS, dilutedEPS, adjustedEPS, peRatio, earningsYield, sharesBasis:shares, dilutedShares:diluted };
}

const f2 = (n:number) => `$${n.toFixed(2)}`;
const fB = (n:number) => Math.abs(n)>=1e9 ? `$${(n/1e9).toFixed(2)}B` : `$${(n/1e6).toFixed(1)}M`;

export default function EarningsPerShareCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [result, setResult] = useState<EPSResult>(()=>calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(prev=>({...prev,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const barData = [
    { name:"Basic EPS", value:+result.basicEPS.toFixed(2), fill:"hsl(var(--primary))" },
    { name:"Diluted EPS", value:+result.dilutedEPS.toFixed(2), fill:"#10b981" },
    { name:"Adjusted EPS", value:+result.adjustedEPS.toFixed(2), fill:"#f59e0b" },
  ];

  const faqs = [
    { question:"What is EPS?", answer:"Earnings Per Share (EPS) is net income available to common shareholders divided by weighted average shares outstanding. It is the most widely used profitability metric per share of stock." },
    { question:"Basic vs. Diluted EPS — what's the difference?", answer:"Basic EPS uses only actual shares outstanding. Diluted EPS adds potentially dilutive securities (options, warrants) to the share count, giving a more conservative figure. Analysts nearly always use diluted EPS." },
    { question:"What is adjusted EPS?", answer:"Adjusted (non-GAAP) EPS removes one-time items like restructuring charges or asset write-downs for a cleaner view of ongoing operational earnings. Always compare it to GAAP EPS to spot potential manipulation." },
    { question:"Why subtract preferred dividends?", answer:"Preferred dividends are obligations paid before common shareholders receive any earnings. Subtracting them gives the net income actually available per common share." },
    { question:"What is a good EPS?", answer:"EPS is meaningful relative to the stock price (P/E ratio) and to prior-year EPS (growth rate). Consistent 10–15% annual EPS growth over 5+ years characterizes high-quality compounding businesses." },
    { question:"How does EPS affect stock price?", answer:"Higher and growing EPS supports a higher stock price. EPS surprises vs. analyst consensus estimates typically drive 3–7% post-earnings stock moves for large-cap companies." },
    { question:"What is earnings yield?", answer:"Earnings yield = EPS ÷ Stock Price × 100. It is the inverse of P/E and expresses earnings as a percentage return. Commonly compared to bond yields to assess relative stock attractiveness." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"EPS Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Earnings Per Share (EPS) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              {label:"Net Income",key:"netIncome",prefix:"$",tip:"Total net profit (income statement)"},
              {label:"Preferred Dividends",key:"preferredDividends",prefix:"$",tip:"Dividends paid to preferred shareholders"},
              {label:"Shares Outstanding (Basic)",key:"sharesOutstanding",prefix:"",tip:"Weighted avg common shares"},
              {label:"Stock Price",key:"stockPrice",prefix:"$",tip:"Current market price per share"},
            ] as const).map(({label,key,prefix,tip})=>(
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  {prefix&&<span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
                  <input type="number" value={f[key]} onChange={e=>set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground"/>
                </div>
              </div>
            ))}
            <button onClick={()=>setShowAdv(!showAdv)} className="text-sm font-semibold text-primary hover:underline text-left">
              {showAdv?"▲":"▼"} Dilution &amp; Adjustments
            </button>
            {showAdv&&(
              <div className="grid grid-cols-1 gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                {([
                  {label:"Dilutive Stock Options (shares)",key:"dilutiveOptions"},
                  {label:"Dilutive Warrants (shares)",key:"dilutiveWarrants"},
                  {label:"One-Time / Non-Recurring Items ($)",key:"oneTimeItems"},
                ] as const).map(({label,key})=>(
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1">{label}</label>
                    <input type="number" value={f[key]} onChange={e=>set(key)(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"/>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4"/>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Diluted EPS</div>
              <div className="text-5xl font-extrabold text-foreground">{f2(result.dilutedEPS)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.peRatio!==null?`P/E Ratio: ${result.peRatio.toFixed(1)}×`:"Enter stock price for P/E"}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Basic EPS</div><div className="font-bold text-lg">{f2(result.basicEPS)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Adjusted EPS</div><div className="font-bold text-lg text-amber-600">{f2(result.adjustedEPS)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Earnings Yield</div><div className="font-bold text-lg">{result.earningsYield!==null?`${result.earningsYield.toFixed(2)}%`:"—"}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">EPS Comparison</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{fontSize:11}}/>
                    <YAxis tickFormatter={v=>`$${v}`} tick={{fontSize:11}}/>
                    <RTooltip formatter={(v:number)=>[`$${v.toFixed(2)}`,""]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {barData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50">
                <h3 className="font-bold text-sm text-foreground">Full Breakdown</h3>
              </div>
              {[
                {label:"Net Income",val:fB(parseFloat(f.netIncome)||0)},
                {label:"Less: Preferred Dividends",val:fB(parseFloat(f.preferredDividends)||0)},
                {label:"Income Available to Common",val:fB((parseFloat(f.netIncome)||0)-(parseFloat(f.preferredDividends)||0))},
                {label:"Basic Shares",val:`${(result.sharesBasis/1e9).toFixed(2)}B`},
                {label:"Diluted Shares",val:`${(result.dilutedShares/1e9).toFixed(2)}B`},
                {label:"Basic EPS",val:f2(result.basicEPS),bold:true},
                {label:"Diluted EPS",val:f2(result.dilutedEPS),bold:true,highlight:true},
                {label:"Adjusted EPS",val:f2(result.adjustedEPS),bold:true},
                {label:"P/E Ratio",val:result.peRatio!==null?`${result.peRatio.toFixed(1)}×`:"N/A"},
                {label:"Earnings Yield",val:result.earningsYield!==null?`${result.earningsYield.toFixed(2)}%`:"N/A"},
              ].map((row,i)=>(
                <div key={i} className={`grid grid-cols-2 px-4 py-2 border-b border-border/30 last:border-0 ${row.highlight?"bg-primary/5":"hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold?"font-bold text-foreground":""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10"/>
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Earnings Per Share (EPS) Calculator?</h2>
            <p>Earnings Per Share (EPS) is the portion of a company&apos;s profit allocated to each outstanding common share. It is one of the most important metrics in equity analysis, directly impacting stock valuation, P/E ratios, and investor sentiment. This EPS calculator computes basic EPS, diluted EPS, adjusted EPS, and the implied P/E ratio and earnings yield.</p>
            <h2 className="text-2xl font-bold mb-3">EPS Formulas Explained</h2>
            <p><strong>Basic EPS</strong> = (Net Income − Preferred Dividends) ÷ Weighted Average Common Shares</p>
            <p><strong>Diluted EPS</strong> = (Net Income − Preferred Dividends) ÷ (Shares + Dilutive Securities)</p>
            <p><strong>Adjusted EPS</strong> = (Net Income − Preferred Dividends − One-Time Items) ÷ Diluted Shares</p>
            <p>Dilutive securities include in-the-money options, warrants, and convertible instruments. Diluted EPS is always ≤ basic EPS and is the preferred figure in investment analysis.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting EPS Results</h2>
            <p>EPS alone is meaningless without context. Always view it relative to: (1) stock price via P/E ratio, (2) prior-year EPS for growth trend, (3) analyst consensus estimates for beat/miss analysis, and (4) industry peer EPS for competitive benchmarking. Consistent 10–15% annual EPS growth characterizes quality compounding businesses.</p>
            <h2 className="text-2xl font-bold mb-3">EPS and P/E Ratio</h2>
            <p>P/E = Stock Price ÷ Diluted EPS. A P/E of 20× means investors pay $20 for every $1 of annual earnings. Growth stocks may trade at 30–50× EPS; mature value stocks at 10–15×. The earnings yield (1/P/E) is often compared to 10-year Treasury yields to assess equity attractiveness relative to bonds.</p>
            <h2 className="text-2xl font-bold mb-3">EPS Dilution and Share Buybacks</h2>
            <p>Aggressive stock-based compensation inflates the diluted share count and mechanically reduces EPS. Conversely, buybacks reduce shares outstanding and mechanically boost EPS even with flat net income. Investors should distinguish EPS growth driven by genuine profit improvement versus financial engineering through buybacks or accounting adjustments.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Earnings Reports</h2>
            <p>Companies report GAAP and often non-GAAP (adjusted) EPS in earnings releases. The consensus estimate aggregated by Bloomberg, FactSet, or Refinitiv serves as the benchmark. A "beat" occurs when reported EPS exceeds consensus — historically triggering positive stock moves. Guidance on forward EPS often matters more than the reported quarter for long-term investors.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/earnings-per-share-calculator"/>
          <PopularCalculators exclude="/calculator/earnings-per-share-calculator"/>
        </div>
      </div>
    </>
  );
}
