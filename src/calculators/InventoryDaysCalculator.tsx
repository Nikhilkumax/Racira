"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DIOResult {
  daysInInventory: number;
  inventoryTurnover: number;
  rating: string;
  ratingColor: string;
  annualCOGS: number;
}
const DEFAULTS = { cogs:"4800000", beginInventory:"780000", endInventory:"920000" };

function calculate(d: typeof DEFAULTS): DIOResult {
  const cogs = parseFloat(d.cogs)||0;
  const avgInventory = ((parseFloat(d.beginInventory)||0)+(parseFloat(d.endInventory)||0))/2;
  const inventoryTurnover = cogs>0&&avgInventory>0 ? cogs/avgInventory : 0;
  const daysInInventory = inventoryTurnover>0 ? 365/inventoryTurnover : 0;
  let rating=""; let ratingColor="";
  if(daysInInventory<=30){rating="Excellent";ratingColor="text-emerald-600";}
  else if(daysInInventory<=60){rating="Good";ratingColor="text-primary";}
  else if(daysInInventory<=90){rating="Fair";ratingColor="text-amber-600";}
  else{rating="Slow-Moving";ratingColor="text-red-600";}
  return { daysInInventory, inventoryTurnover, rating, ratingColor, annualCOGS:cogs };
}

const fmtM = (n:number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:`$${n.toLocaleString("en-US",{maximumFractionDigits:0})}`;

export default function InventoryDaysCalculator() {
  const [f,setF] = useState(DEFAULTS);
  const [result,setResult] = useState<DIOResult>(()=>calculate(DEFAULTS));
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(p=>({...p,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const barData = [
    { name:"Your DIO", value:+result.daysInInventory.toFixed(1), fill:"hsl(var(--primary))" },
    { name:"Industry Avg (retail)", value:45, fill:"#94a3b8" },
    { name:"Best-in-Class", value:20, fill:"#10b981" },
  ];

  const faqs = [
    { question:"What is Days Inventory Outstanding (DIO)?", answer:"DIO measures the average number of days a company holds inventory before selling it. Lower DIO generally indicates efficient inventory management and faster cash conversion." },
    { question:"How is DIO calculated?", answer:"DIO = (Average Inventory ÷ COGS) × 365. Average inventory = (Beginning Inventory + Ending Inventory) ÷ 2. Alternatively, DIO = 365 ÷ Inventory Turnover Ratio." },
    { question:"What is a good DIO?", answer:"DIO varies widely by industry. Fast-moving consumer goods: 20–40 days. Retail: 30–60 days. Manufacturing: 60–100 days. Aerospace/defense: 100–200 days. Always compare DIO to industry peers rather than applying a universal benchmark." },
    { question:"What does high DIO indicate?", answer:"High DIO (relative to industry) suggests slow-moving or excess inventory, potential obsolescence risk, higher storage and carrying costs, and capital tied up unproductively. It can be an early warning sign of demand weakness or supply chain inefficiency." },
    { question:"How does DIO relate to the Cash Conversion Cycle?", answer:"DIO is one component of the Cash Conversion Cycle (CCC): CCC = DIO + DSO − DPO. A lower CCC means the business converts investments in inventory to cash more quickly. World-class companies like Amazon achieve negative CCC — collecting customer cash before paying suppliers." },
    { question:"Can DIO be too low?", answer:"Yes. An extremely low DIO may indicate stockouts, lost sales, or an inability to buffer against supply disruptions. The optimal DIO balances carrying costs against the risk of running out of inventory to meet customer demand." },
    { question:"What is inventory turnover?", answer:"Inventory Turnover = COGS ÷ Average Inventory. It measures how many times a company sells and replaces its inventory in a year. Higher turnover (lower DIO) is generally favorable. DIO = 365 ÷ Inventory Turnover." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Days in Inventory Calculator"}]}/>
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Days in Inventory (DIO) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              {label:"Cost of Goods Sold (Annual COGS)",key:"cogs",tip:"Total annual cost of goods sold from income statement"},
              {label:"Beginning Inventory",key:"beginInventory",tip:"Inventory balance at start of period"},
              {label:"Ending Inventory",key:"endInventory",tip:"Inventory balance at end of period"},
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
            <div className={`rounded-xl p-5 border-l-4 ${result.daysInInventory<=60?"bg-primary/10 border-primary":"bg-amber-500/10 border-amber-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Days in Inventory (DIO)</div>
              <div className={`text-5xl font-extrabold ${result.ratingColor}`}>{result.daysInInventory.toFixed(1)} <span className="text-2xl">days</span></div>
              <div className={`text-sm font-semibold mt-1 ${result.ratingColor}`}>{result.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Inventory Turnover</div><div className="font-bold text-lg">{result.inventoryTurnover.toFixed(2)}×</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Avg Inventory</div><div className="font-bold text-lg">{fmtM(((parseFloat(f.beginInventory)||0)+(parseFloat(f.endInventory)||0))/2)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Annual COGS</div><div className="font-bold text-lg">{fmtM(result.annualCOGS)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">DIO vs. Industry Benchmarks (days)</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:11}} unit=" d"/>
                    <RTooltip formatter={(v:number)=>[`${v} days`,""]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 2" label={{value:"Caution",fontSize:9,fill:"#f59e0b"}}/>
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {barData.map((e,i)=><rect key={i} fill={e.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Full Calculation</h3></div>
              {[
                {label:"Beginning Inventory",val:fmtM(parseFloat(f.beginInventory)||0)},
                {label:"Ending Inventory",val:fmtM(parseFloat(f.endInventory)||0)},
                {label:"Average Inventory",val:fmtM(((parseFloat(f.beginInventory)||0)+(parseFloat(f.endInventory)||0))/2)},
                {label:"Annual COGS",val:fmtM(result.annualCOGS)},
                {label:"Inventory Turnover",val:`${result.inventoryTurnover.toFixed(2)}×`,bold:true},
                {label:"Days in Inventory (DIO)",val:`${result.daysInInventory.toFixed(1)} days`,bold:true,highlight:true},
                {label:"Assessment",val:result.rating},
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
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Days in Inventory Calculator?</h2>
            <p>Days in Inventory (DIO), also known as Days Sales of Inventory (DSI) or Days Inventory Outstanding, measures how many days on average a company holds inventory before selling it. It is a critical operational efficiency metric used by CFOs, supply chain managers, and equity analysts to assess working capital management.</p>
            <h2>DIO Formula</h2>
            <p><strong>DIO = (Average Inventory ÷ COGS) × 365</strong></p>
            <p>Where Average Inventory = (Beginning Inventory + Ending Inventory) ÷ 2. Equivalently: DIO = 365 ÷ Inventory Turnover Ratio, where Inventory Turnover = COGS ÷ Average Inventory.</p>
            <h2>Why COGS and Not Revenue?</h2>
            <p>COGS is used rather than revenue because both inventory and COGS are measured at cost. Using revenue would mix cost-basis inventory with selling-price revenue, producing a misleading ratio. This ensures the numerator and denominator are on the same accounting basis.</p>
            <h2>DIO and the Cash Conversion Cycle</h2>
            <p>DIO is one of three components in the Cash Conversion Cycle (CCC): <strong>CCC = DIO + DSO − DPO</strong> (where DSO = Days Sales Outstanding and DPO = Days Payable Outstanding). A lower CCC means faster conversion of operating investments to cash — a hallmark of capital-efficient businesses. Companies like Amazon achieve a negative CCC, effectively using supplier credit to fund operations.</p>
            <h2>Industry Benchmarks</h2>
            <p>DIO varies enormously by sector. Food retail: 10–20 days. Apparel: 60–100 days. Automotive: 40–70 days. Electronics retail: 30–50 days. Aerospace: 100–200 days. Compare your DIO to direct competitors to identify whether inventory management is a competitive strength or weakness.</p>
            <h2>Strategies to Reduce DIO</h2>
            <p>Implement demand forecasting to align procurement with actual sales velocity. Adopt just-in-time (JIT) inventory practices. Segment inventory into ABC categories (A=high value/high velocity, C=low value/low velocity) and prioritize active management of A items. Use vendor-managed inventory (VMI) where suppliers maintain optimal stock levels. Regularly review and clear slow-moving or obsolete inventory through markdowns or liquidation.</p>
            <h2>Risks of Overly Low DIO</h2>
            <p>While reducing DIO is generally beneficial, extreme reduction creates stockout risk — empty shelves leading to lost sales and customer churn. The optimal DIO balances inventory carrying costs (storage, insurance, obsolescence) against the cost of stockouts (lost revenue, expediting charges). Safety stock calculations should inform the floor below which DIO should not fall.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inventory-days-calculator"/>
          <PopularCalculators exclude="/calculator/inventory-days-calculator"/>
        </div>
      </div>
    </>
  );
}
