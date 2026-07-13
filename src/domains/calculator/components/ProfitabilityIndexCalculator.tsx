"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PIResult {
  pi: number; npv: number; totalPV: number; initialInvestment: number;
  rating: string; ratingColor: string; irr: number | null;
}
const DEFAULTS = { initialInvestment:"500000", cashFlows:"120000,150000,180000,200000,210000", discountRate:"10" };

function calcIRR(flows: number[]): number | null {
  let lo=0,hi=100,mid=0;
  for(let i=0;i<200;i++){
    mid=(lo+hi)/2;
    const r=mid/100;
    const npv=flows.reduce((s,cf,t)=>s+cf/Math.pow(1+r,t),0);
    if(Math.abs(npv)<0.01) return mid;
    if(npv>0) lo=mid; else hi=mid;
  }
  return Math.abs(mid)<100?mid:null;
}

function calculate(d: typeof DEFAULTS): PIResult {
  const initial = parseFloat(d.initialInvestment)||0;
  const rate = (parseFloat(d.discountRate)||0)/100;
  const rawFlows = d.cashFlows.split(",").map(s=>parseFloat(s.trim())||0).filter((_,i)=>i>=0);
  const totalPV = rawFlows.reduce((s,cf,t)=>s+cf/Math.pow(1+rate,t+1),0);
  const npv = totalPV - initial;
  const pi = initial>0 ? totalPV/initial : 0;
  const allFlows = [-initial,...rawFlows];
  const irr = calcIRR(allFlows);
  let rating="",ratingColor="";
  if(pi>1.5){rating="Highly Profitable";ratingColor="text-emerald-600";}
  else if(pi>1.2){rating="Good Investment";ratingColor="text-primary";}
  else if(pi>1.0){rating="Marginally Positive";ratingColor="text-amber-600";}
  else if(pi===1.0){rating="Break-Even";ratingColor="text-muted-foreground";}
  else{rating="Destroy Value — Reject";ratingColor="text-red-600";}
  return { pi, npv, totalPV, initialInvestment:initial, rating, ratingColor, irr };
}

const fmtM = (n:number) => { const abs=Math.abs(n); const s=n<0?"-":""; if(abs>=1e6) return `${s}$${(abs/1e6).toFixed(2)}M`; return `${s}$${abs.toLocaleString("en-US",{maximumFractionDigits:0})}`; };

export default function ProfitabilityIndexCalculator() {
  const [f,setF] = useState(DEFAULTS);
  const [result,setResult] = useState<PIResult>(()=>calculate(DEFAULTS));
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(p=>({...p,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const flows = f.cashFlows.split(",").map(s=>parseFloat(s.trim())||0);
  const rate = (parseFloat(f.discountRate)||0)/100;
  const barData = flows.map((cf,i)=>({name:`Yr ${i+1}`,pv:+( cf/Math.pow(1+rate,i+1)).toFixed(0),nominal:cf}));

  const faqs = [
    {question:"What is the Profitability Index (PI)?",answer:"The PI, also called the Benefit-Cost Ratio, is the ratio of the present value of future cash flows to the initial investment. PI = PV of Future Cash Flows ÷ Initial Investment. A PI > 1.0 means the project creates value; PI < 1.0 destroys value."},
    {question:"How does PI differ from NPV?",answer:"NPV gives an absolute dollar value of value created. PI gives a relative measure — how many dollars of PV are generated per dollar invested. PI is superior for capital rationing (comparing projects with different investment sizes)."},
    {question:"What is a good Profitability Index?",answer:"PI > 1.0: Accept (creates value). PI = 1.0: Break-even (no economic profit). PI < 1.0: Reject (destroys value). For competitive capital allocation, projects with PI > 1.2 are generally preferred. A PI of 1.5 means every $1 invested returns $1.50 in present value."},
    {question:"When should I use PI vs. NPV?",answer:"Use NPV when evaluating a single project in isolation. Use PI when comparing multiple projects competing for limited capital (capital rationing). PI ranks projects by value created per dollar invested, enabling optimal budget allocation."},
    {question:"What discount rate should I use?",answer:"Use the project's WACC (Weighted Average Cost of Capital) or the required rate of return for projects of similar risk. If the project is riskier than average company operations, apply a risk premium above WACC (e.g., WACC + 2–5%)."},
    {question:"How do I enter multiple year cash flows?",answer:"Enter cash flows separated by commas in the Cash Flows field: 100000,150000,200000 for 3 years. Each value represents one year's net cash inflow. Do not include the initial investment (it is entered separately)."},
    {question:"What is IRR and how does it relate to PI?",answer:"IRR (Internal Rate of Return) is the discount rate at which NPV = 0. A project with PI > 1 will have an IRR exceeding the discount rate. Both metrics should be used together — IRR for go/no-go, PI for capital rationing across multiple projects."},
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Profitability Index Calculator"}]}/>
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Profitability Index (PI) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1">Initial Investment</label>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                <input type="number" value={f.initialInvestment} onChange={e=>set("initialInvestment")(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground"/>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1">Annual Cash Flows (comma-separated)</label>
              <p className="text-xs text-muted-foreground mb-1">Example: 120000,150000,180000 for 3 years</p>
              <textarea value={f.cashFlows} onChange={e=>set("cashFlows")(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none"/>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1">Discount Rate (WACC)</label>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={f.discountRate} onChange={e=>set("discountRate")(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"/>
                <span className="pr-3 text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4"/></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-5 border-l-4 ${result.pi>1?"bg-primary/10 border-primary":"bg-red-500/10 border-red-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Profitability Index</div>
              <div className={`text-5xl font-extrabold ${result.ratingColor}`}>{result.pi.toFixed(3)}</div>
              <div className={`text-sm font-semibold mt-1 ${result.ratingColor}`}>{result.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">NPV</div><div className={`font-bold text-lg ${result.npv>=0?"text-emerald-600":"text-red-600"}`}>{fmtM(result.npv)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total PV</div><div className="font-bold text-lg">{fmtM(result.totalPV)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">IRR</div><div className="font-bold text-lg">{result.irr!==null?`${result.irr.toFixed(1)}%`:"N/A"}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Present Value by Year</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barGap={2}>
                    <XAxis dataKey="name" tick={{fontSize:10}}/>
                    <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fontSize:11}}/>
                    <RTooltip formatter={(v:number,n:string)=>[fmtM(v),n==="pv"?"PV":"Nominal"]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <ReferenceLine y={0} stroke="#64748b"/>
                    <Bar dataKey="nominal" fill="#94a3b8" radius={[4,4,0,0]} name="Nominal"/>
                    <Bar dataKey="pv" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="PV"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Investment Summary</h3></div>
              {[
                {label:"Initial Investment",val:fmtM(result.initialInvestment)},
                {label:"Discount Rate",val:`${f.discountRate}%`},
                {label:"Number of Periods",val:`${flows.length} years`},
                {label:"Total PV of Cash Flows",val:fmtM(result.totalPV),bold:true},
                {label:"NPV",val:fmtM(result.npv),bold:true},
                {label:"Profitability Index",val:result.pi.toFixed(4),bold:true,highlight:true},
                {label:"IRR",val:result.irr!==null?`${result.irr.toFixed(2)}%`:"N/A",bold:true},
                {label:"Decision",val:result.pi>=1?"✓ Accept":"✗ Reject"},
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
            <h2 className="text-2xl font-bold mb-3">What Is the Profitability Index?</h2>
            <p>The Profitability Index (PI), also known as the Profit Investment Ratio (PIR) or Value Investment Ratio (VIR), is a capital budgeting metric that measures the value created per unit of investment. It extends NPV analysis by providing a relative measure of investment efficiency — essential when comparing projects of different sizes or allocating limited capital across multiple opportunities.</p>
            <h2 className="text-2xl font-bold mb-3">Profitability Index Formula</h2>
            <p><strong>PI = PV of Future Cash Flows ÷ Initial Investment</strong></p>
            <p>Where PV of Future Cash Flows = Σ (CFt ÷ (1+r)^t) for t = 1 to n. r = discount rate (WACC). CFt = cash flow in period t. Equivalently: PI = 1 + (NPV ÷ Initial Investment).</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Profitability Index</h2>
            <p>PI = 1.0: The project earns exactly the required rate of return (zero economic profit). PI &gt; 1.0: Accept — the project creates value above the cost of capital. PI &lt; 1.0: Reject — the project destroys value. For capital rationing, rank all projects by PI and fund in descending order until the capital budget is exhausted. This maximizes total NPV across the portfolio.</p>
            <h2 className="text-2xl font-bold mb-3">PI vs. NPV — When Each Is Better</h2>
            <p>NPV is superior for independent projects where the absolute value creation matters. PI is superior for mutually exclusive projects of different sizes and for capital rationing scenarios. Example: Project A has NPV=$100K, investment=$500K (PI=1.20). Project B has NPV=$80K, investment=$200K (PI=1.40). With a $200K budget, Project B creates more value per dollar despite lower absolute NPV.</p>
            <h2 className="text-2xl font-bold mb-3">Discount Rate Selection</h2>
            <p>The discount rate represents the opportunity cost of capital — what your money could earn in a risk-equivalent alternative investment. Use WACC for projects aligned with the company&apos;s overall risk profile. Apply a risk premium (2–5%) for ventures more risky than typical operations. Use the risk-free rate plus equity risk premium for equity-financed projects without leverage.</p>
            <h2 className="text-2xl font-bold mb-3">PI in Capital Rationing</h2>
            <p>When a firm cannot fund all positive-NPV projects (due to budget constraints, credit limits, or strategic priorities), PI ranking enables optimal capital allocation. Sort available projects by PI in descending order. Fund from the top until the budget is exhausted. This algorithm maximizes total NPV across the funded portfolio — a fundamental result in corporate finance theory.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations of the Profitability Index</h2>
            <p>PI assumes cash flows are known with certainty — use sensitivity analysis to stress-test key assumptions. It does not account for project interdependencies (e.g., two projects that share infrastructure). PI can be misleading for mutually exclusive projects of the same size — in that case, NPV provides the correct ranking. Always use PI alongside IRR and payback period for a complete capital investment evaluation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/profitability-index-calculator"/>
          <PopularCalculators exclude="/calculator/profitability-index-calculator"/>
        </div>
      </div>
    </>
  );
}
