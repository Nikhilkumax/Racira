"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface CRResult {
  currentRatio: number;
  workingCapital: number;
  rating: string;
  ratingColor: string;
  quickRatioApprox: number;
  cashRatioApprox: number;
}

const DEFAULTS = { currentAssets:"850000", currentLiabilities:"420000", inventory:"180000", cash:"230000" };

function calculate(d: typeof DEFAULTS): CRResult {
  const ca = parseFloat(d.currentAssets)||0;
  const cl = parseFloat(d.currentLiabilities)||1;
  const inv = parseFloat(d.inventory)||0;
  const cash = parseFloat(d.cash)||0;
  const currentRatio = ca/cl;
  const workingCapital = ca - cl;
  const quickRatioApprox = (ca - inv)/cl;
  const cashRatioApprox = cash/cl;
  let rating = ""; let ratingColor = "";
  if (currentRatio>=2) { rating="Excellent"; ratingColor="text-emerald-600"; }
  else if (currentRatio>=1.5) { rating="Good"; ratingColor="text-primary"; }
  else if (currentRatio>=1) { rating="Adequate"; ratingColor="text-amber-600"; }
  else { rating="Risky (< 1.0)"; ratingColor="text-red-600"; }
  return { currentRatio, workingCapital, rating, ratingColor, quickRatioApprox, cashRatioApprox };
}

const fmtM = (n:number) => { const abs=Math.abs(n); if(abs>=1e6) return `${n<0?"-":""}$${(abs/1e6).toFixed(2)}M`; return `${n<0?"-":""}$${abs.toLocaleString("en-US",{maximumFractionDigits:0})}`; };

export default function CurrentRatioCalculator() {
  const [f,setF] = useState(DEFAULTS);
  const [result,setResult] = useState<CRResult>(()=>calculate(DEFAULTS));
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(p=>({...p,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const barData = [
    { name:"Current Ratio", value:+result.currentRatio.toFixed(2), benchmark:1.5 },
    { name:"Quick Ratio", value:+result.quickRatioApprox.toFixed(2), benchmark:1.0 },
    { name:"Cash Ratio", value:+result.cashRatioApprox.toFixed(2), benchmark:0.5 },
  ];

  const faqs = [
    { question:"What is the current ratio?", answer:"The current ratio measures a company's ability to pay short-term liabilities using short-term assets. Calculated as Current Assets ÷ Current Liabilities, it is the most widely used liquidity ratio in financial analysis." },
    { question:"What is a good current ratio?", answer:"A current ratio between 1.5 and 2.0 is generally considered healthy. Below 1.0 means current liabilities exceed current assets — a potential liquidity warning. Above 3.0 may indicate excess idle assets not being deployed efficiently." },
    { question:"How does the current ratio differ from the quick ratio?", answer:"The quick ratio excludes inventory and prepaid expenses from current assets, providing a more conservative liquidity measure. It is preferred for industries where inventory is slow to convert to cash (manufacturing, retail). Formula: (Current Assets − Inventory) ÷ Current Liabilities." },
    { question:"What is working capital?", answer:"Working capital = Current Assets − Current Liabilities. Positive working capital means the company can fund its short-term operations. Negative working capital indicates potential financial stress and reliance on external financing for day-to-day operations." },
    { question:"How does inventory affect the current ratio?", answer:"Inventory is a current asset but is the least liquid — it must be sold and collected before becoming cash. High inventory levels inflate the current ratio but may mask liquidity problems. The quick ratio removes inventory for this reason." },
    { question:"What industries have low current ratios?", answer:"Retailers and grocery stores often operate with current ratios below 1.0 because they collect cash quickly from customers but pay suppliers on extended terms (negative working capital model). Utilities and telecom also tend toward lower ratios due to stable recurring revenues." },
    { question:"Can a current ratio be too high?", answer:"Yes. A ratio above 3.0 may indicate excess cash or slow-moving inventory — capital that could be put to more productive use. Analysts evaluate current ratio trends and compare to industry benchmarks rather than using absolute thresholds." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Current Ratio Calculator"}]}/>
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Current Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              {label:"Total Current Assets",key:"currentAssets",tip:"Cash, receivables, inventory, prepaid expenses"},
              {label:"Total Current Liabilities",key:"currentLiabilities",tip:"AP, accrued liabilities, short-term debt"},
              {label:"Inventory",key:"inventory",tip:"Included in current assets above"},
              {label:"Cash & Cash Equivalents",key:"cash",tip:"Included in current assets above"},
            ] as const).map(({label,key,tip})=>(
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                  <input type="number" value={f[key]} onChange={e=>set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground"/>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4"/></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-5 border-l-4 ${result.currentRatio>=1.5?"bg-primary/10 border-primary":result.currentRatio>=1?"bg-amber-500/10 border-amber-500":"bg-red-500/10 border-red-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Current Ratio</div>
              <div className={`text-5xl font-extrabold ${result.ratingColor}`}>{result.currentRatio.toFixed(2)}×</div>
              <div className={`text-sm font-semibold mt-1 ${result.ratingColor}`}>{result.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Working Capital</div><div className={`font-bold text-lg ${result.workingCapital>=0?"text-emerald-600":"text-red-600"}`}>{fmtM(result.workingCapital)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Quick Ratio</div><div className="font-bold text-lg">{result.quickRatioApprox.toFixed(2)}×</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Cash Ratio</div><div className="font-bold text-lg">{result.cashRatioApprox.toFixed(2)}×</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Liquidity Ratios vs. Benchmarks</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{fontSize:11}}/>
                    <YAxis tick={{fontSize:11}}/>
                    <RTooltip formatter={(v:number)=>[`${v.toFixed(2)}×`,""]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="4 2" label={{value:"Min Safe",fontSize:10,fill:"#ef4444"}}/>
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Detailed Breakdown</h3></div>
              {[
                {label:"Current Assets",val:fmtM(parseFloat(f.currentAssets)||0)},
                {label:"Current Liabilities",val:fmtM(parseFloat(f.currentLiabilities)||0)},
                {label:"Inventory",val:fmtM(parseFloat(f.inventory)||0)},
                {label:"Cash & Equivalents",val:fmtM(parseFloat(f.cash)||0)},
                {label:"Working Capital",val:fmtM(result.workingCapital),bold:true},
                {label:"Current Ratio",val:`${result.currentRatio.toFixed(2)}×`,bold:true,highlight:true},
                {label:"Quick Ratio (est.)",val:`${result.quickRatioApprox.toFixed(2)}×`,bold:true},
                {label:"Cash Ratio (est.)",val:`${result.cashRatioApprox.toFixed(2)}×`,bold:true},
                {label:"Rating",val:result.rating},
              ].map((row,i)=>(
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight?"bg-primary/5":"hover:bg-secondary/20"}`}>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Current Ratio?</h2>
            <p>The current ratio is a liquidity ratio that measures a company&apos;s ability to pay its short-term obligations with its short-term assets. It is the most basic and widely cited liquidity metric in financial statement analysis, appearing in credit agreements, loan covenants, and equity research reports worldwide.</p>
            <h2 className="text-2xl font-bold mb-3">Current Ratio Formula</h2>
            <p><strong>Current Ratio = Current Assets ÷ Current Liabilities</strong></p>
            <p>Current assets include cash, marketable securities, accounts receivable, inventory, and prepaid expenses — all items expected to convert to cash within 12 months. Current liabilities include accounts payable, accrued expenses, short-term debt, and the current portion of long-term debt.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Current Ratio</h2>
            <p>A ratio above 1.0 means current assets cover current liabilities. The commonly accepted "safe" range is 1.5–2.0. A ratio below 1.0 signals that the company cannot fully cover its near-term obligations from existing assets alone — a potential liquidity red flag. However, some business models (notably large retailers) routinely operate below 1.0 without distress due to their fast cash-collection cycles.</p>
            <h2 className="text-2xl font-bold mb-3">Current Ratio vs. Quick Ratio vs. Cash Ratio</h2>
            <p>The three ratios form a liquidity spectrum from most to least inclusive. The current ratio is the broadest. The quick ratio removes inventory (formula: (Current Assets − Inventory) ÷ Current Liabilities), providing a stricter test. The cash ratio is the most conservative, using only cash and short-term investments. For capital-intensive or inventory-heavy industries, the quick ratio is often more meaningful.</p>
            <h2 className="text-2xl font-bold mb-3">Working Capital and Operational Liquidity</h2>
            <p>Working capital = Current Assets − Current Liabilities. Positive working capital funds day-to-day operations. Negative working capital occurs in fast-collection businesses (Amazon, Walmart) where customers pay instantly but suppliers extend credit — creating a self-financing "float." This is a structural advantage, not a danger sign, when driven by strong negotiating power over suppliers.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>Typical current ratios by sector: Retail/Grocery: 0.8–1.2. Manufacturing: 1.5–2.5. Technology (asset-light): 2.0–4.0. Utilities: 0.8–1.3. Healthcare: 1.5–2.5. Always compare a company&apos;s current ratio to its direct peers rather than using a universal benchmark.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations of the Current Ratio</h2>
            <p>The current ratio is a point-in-time snapshot and can be easily manipulated near reporting dates (window dressing). It does not reflect cash flow quality, the liquidity of receivables, or the age of inventory. A high ratio with slow-moving inventory and uncollectible receivables may be worse than a lower ratio with high-quality liquid assets.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/current-ratio-calculator"/>
          <PopularCalculators exclude="/calculator/current-ratio-calculator"/>
        </div>
      </div>
    </>
  );
}
