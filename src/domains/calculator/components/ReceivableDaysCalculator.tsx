"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DSOResult { dso: number; receivableTurnover: number; rating: string; ratingColor: string; }
const DEFAULTS = { revenue:"12400000", beginAR:"1850000", endAR:"2100000" };

function calculate(d: typeof DEFAULTS): DSOResult {
  const rev = parseFloat(d.revenue)||1;
  const avgAR = ((parseFloat(d.beginAR)||0)+(parseFloat(d.endAR)||0))/2;
  const turnover = rev>0&&avgAR>0 ? rev/avgAR : 0;
  const dso = turnover>0 ? 365/turnover : 0;
  let rating="",ratingColor="";
  if(dso<=30){rating="Excellent";ratingColor="text-emerald-600";}
  else if(dso<=45){rating="Good";ratingColor="text-primary";}
  else if(dso<=60){rating="Fair";ratingColor="text-amber-600";}
  else{rating="Slow Collections";ratingColor="text-red-600";}
  return { dso, receivableTurnover:turnover, rating, ratingColor };
}

const fmtM = (n:number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:`$${n.toLocaleString("en-US",{maximumFractionDigits:0})}`;

export default function ReceivableDaysCalculator() {
  const [f,setF] = useState(DEFAULTS);
  const [result,setResult] = useState<DSOResult>(()=>calculate(DEFAULTS));
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(p=>({...p,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const barData = [
    {name:"Your DSO",value:+result.dso.toFixed(1),fill:"hsl(var(--primary))"},
    {name:"Industry Avg",value:45,fill:"#94a3b8"},
    {name:"Best-in-Class",value:25,fill:"#10b981"},
  ];

  const faqs = [
    {question:"What is Days Sales Outstanding (DSO)?",answer:"DSO measures the average number of days it takes a company to collect payment after a sale has been made. Lower DSO means faster cash collection and better working capital efficiency."},
    {question:"How is DSO calculated?",answer:"DSO = (Average Accounts Receivable ÷ Revenue) × 365. Alternatively DSO = 365 ÷ Receivables Turnover, where Receivables Turnover = Revenue ÷ Average AR."},
    {question:"What is a good DSO?",answer:"It depends on industry and payment terms. If you offer net-30 payment terms, a DSO near 30 is ideal; 45+ indicates many customers are paying late. B2B companies average 40–60 days; B2C cash businesses are near zero."},
    {question:"What causes high DSO?",answer:"Extended payment terms offered to customers, lax credit policies, weak collections processes, invoice disputes, economic stress among customers, or seasonal revenue concentration. High DSO ties up cash that could be used for investment or operations."},
    {question:"How does DSO relate to the Cash Conversion Cycle?",answer:"CCC = DIO + DSO − DPO. DSO is the accounts receivable component. Reducing DSO directly shortens the cash conversion cycle, improving operating cash flow and reducing the need for external financing."},
    {question:"What strategies reduce DSO?",answer:"Invoice immediately upon delivery, offer early-payment discounts (e.g., 2/10 net 30), implement automated payment reminders, require deposits for large orders, perform credit checks on new customers, and use factoring or invoice financing for persistent slow-payers."},
    {question:"Can DSO be too low?",answer:"In theory, yes. Extremely aggressive collections or requiring upfront payment could lose customers to competitors offering more favorable credit terms. The optimal DSO balances collection speed against customer relationship and sales volume."},
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Days Sales Outstanding Calculator"}]}/>
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Days Sales Outstanding (DSO) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              {label:"Annual Revenue",key:"revenue",tip:"Total annual net revenue from income statement"},
              {label:"Beginning Accounts Receivable",key:"beginAR",tip:"AR balance at start of period (balance sheet)"},
              {label:"Ending Accounts Receivable",key:"endAR",tip:"AR balance at end of period (balance sheet)"},
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Days Sales Outstanding</div>
              <div className={`text-5xl font-extrabold ${result.ratingColor}`}>{result.dso.toFixed(1)} <span className="text-2xl">days</span></div>
              <div className={`text-sm font-semibold mt-1 ${result.ratingColor}`}>{result.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">AR Turnover</div><div className="font-bold text-lg">{result.receivableTurnover.toFixed(2)}×</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Avg AR</div><div className="font-bold text-lg">{fmtM(((parseFloat(f.beginAR)||0)+(parseFloat(f.endAR)||0))/2)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Annual Revenue</div><div className="font-bold text-lg">{fmtM(parseFloat(f.revenue)||0)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">DSO vs. Benchmarks (days)</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:11}} unit=" d"/>
                    <RTooltip formatter={(v:number)=>[`${v} days`,""]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="4 2"/>
                    <Bar dataKey="value" radius={[4,4,0,0]} fill="hsl(var(--primary))"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Calculation Breakdown</h3></div>
              {[
                {label:"Annual Revenue",val:fmtM(parseFloat(f.revenue)||0)},
                {label:"Beginning AR",val:fmtM(parseFloat(f.beginAR)||0)},
                {label:"Ending AR",val:fmtM(parseFloat(f.endAR)||0)},
                {label:"Average AR",val:fmtM(((parseFloat(f.beginAR)||0)+(parseFloat(f.endAR)||0))/2)},
                {label:"AR Turnover",val:`${result.receivableTurnover.toFixed(2)}×`,bold:true},
                {label:"Days Sales Outstanding",val:`${result.dso.toFixed(1)} days`,bold:true,highlight:true},
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Days Sales Outstanding (DSO)?</h2>
            <p>Days Sales Outstanding (DSO) is a financial ratio that measures the average number of days a company takes to collect payment after a sale has been made on credit. It is a key accounts receivable efficiency metric used by finance teams, credit analysts, and investors to assess collection effectiveness and working capital management quality.</p>
            <h2 className="text-2xl font-bold mb-3">DSO Formula</h2>
            <p><strong>DSO = (Average Accounts Receivable ÷ Revenue) × 365</strong></p>
            <p>Where Average AR = (Beginning AR + Ending AR) ÷ 2. Equivalently: DSO = 365 ÷ Receivables Turnover. The receivables turnover ratio = Revenue ÷ Average AR, measuring how many times receivables are collected per year.</p>
            <h2 className="text-2xl font-bold mb-3">Why DSO Matters for Cash Flow</h2>
            <p>Revenue recognized on an accrual basis does not equal cash received. DSO quantifies the gap between revenue recognition and cash collection. A high DSO means capital is locked in unpaid invoices, increasing the need for working capital financing. Every 10-day improvement in DSO releases cash equal to (Annual Revenue ÷ 36.5), which can be used to fund growth, reduce debt, or return to shareholders.</p>
            <h2 className="text-2xl font-bold mb-3">DSO by Industry</h2>
            <p>Government/defense contractors: 70–90 days (long payment cycles). Professional services B2B: 45–60 days. Manufacturing: 40–55 days. Technology SaaS: 30–45 days. Retail (B2C): near 0 (cash/card sales). Healthcare: 40–60 days due to insurance reimbursement cycles. Wholesale distribution: 35–50 days.</p>
            <h2 className="text-2xl font-bold mb-3">Bad Debt and DSO Quality</h2>
            <p>High DSO can mask bad debt risk. A rising DSO alongside rising revenue could indicate relaxed credit standards to boost sales — recording revenue that will never be collected. Monitor the allowance for doubtful accounts as a percentage of AR alongside DSO. A shrinking allowance despite rising DSO is a red flag in financial statement analysis.</p>
            <h2 className="text-2xl font-bold mb-3">Reducing DSO — Practical Strategies</h2>
            <p>Invoice immediately upon delivery or completion. Offer 2/10 net 30 early-payment discounts. Use automated AR platforms (Bill.com, Stripe Invoicing) with built-in reminders. Enforce credit limits and conduct credit checks on new customers. Escalate overdue accounts systematically: email at day 15, call at day 30, collections at day 60. Consider invoice factoring or dynamic discounting platforms for persistent slow-payers.</p>
            <h2 className="text-2xl font-bold mb-3">DSO and Revenue Quality</h2>
            <p>Rapidly increasing DSO in a high-growth company may indicate channel stuffing — shipping product to distributors that is not yet sold through to end customers. This artificially inflates revenue while AR bloats. Forensic accountants often track DSO alongside inventory turnover as part of revenue quality assessments during due diligence or fraud investigations.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/receivable-days-calculator"/>
          <PopularCalculators exclude="/calculator/receivable-days-calculator"/>
        </div>
      </div>
    </>
  );
}
