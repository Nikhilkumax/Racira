"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface DPOResult { dpo: number; payableTurnover: number; rating: string; ratingColor: string; }
const DEFAULTS = { cogs:"9600000", beginAP:"820000", endAP:"950000" };

function calculate(d: typeof DEFAULTS): DPOResult {
  const cogs = parseFloat(d.cogs)||1;
  const avgAP = ((parseFloat(d.beginAP)||0)+(parseFloat(d.endAP)||0))/2;
  const turnover = avgAP>0 ? cogs/avgAP : 0;
  const dpo = turnover>0 ? 365/turnover : 0;
  let rating="",ratingColor="";
  if(dpo>=45&&dpo<=75){rating="Optimal";ratingColor="text-emerald-600";}
  else if(dpo>=30&&dpo<45){rating="Short — Paying Early";ratingColor="text-amber-600";}
  else if(dpo>75&&dpo<=90){rating="Extended";ratingColor="text-primary";}
  else if(dpo>90){rating="Very Long — Supplier Risk";ratingColor="text-red-600";}
  else{rating="Short";ratingColor="text-amber-600";}
  return { dpo, payableTurnover:turnover, rating, ratingColor };
}

const fmtM = (n:number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:`$${n.toLocaleString("en-US",{maximumFractionDigits:0})}`;

export default function PayableDaysCalculator() {
  const [f,setF] = useState(DEFAULTS);
  const [result,setResult] = useState<DPOResult>(()=>calculate(DEFAULTS));
  const set = (k:keyof typeof DEFAULTS) => (v:string) => setF(p=>({...p,[k]:v}));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const barData = [
    {name:"Your DPO",value:+result.dpo.toFixed(1)},
    {name:"Industry Avg",value:45},
    {name:"Optimal Range",value:60},
  ];

  const faqs = [
    {question:"What is Days Payable Outstanding (DPO)?",answer:"DPO measures the average number of days a company takes to pay its trade creditors after receiving goods or services. Higher DPO means the company holds supplier cash longer, improving its own working capital position."},
    {question:"How is DPO calculated?",answer:"DPO = (Average Accounts Payable ÷ COGS) × 365. Where Average AP = (Beginning AP + Ending AP) ÷ 2. Equivalently: DPO = 365 ÷ Payables Turnover Ratio (COGS ÷ Average AP)."},
    {question:"Is higher DPO better?",answer:"Generally yes — a higher DPO means you are using supplier credit as a form of interest-free financing, improving cash flow. However, excessively high DPO (e.g., 90+ days beyond agreed terms) can damage supplier relationships, lead to supply disruptions, or result in penalty clauses."},
    {question:"What is the optimal DPO?",answer:"The optimal DPO is close to but not exceeding your agreed payment terms with suppliers. If terms are net-45, a DPO of 40–50 days is optimal. Well-managed companies maximize DPO within contractual terms while maintaining strong supplier relationships."},
    {question:"How does DPO relate to the Cash Conversion Cycle?",answer:"CCC = DIO + DSO − DPO. A higher DPO reduces the CCC, meaning you convert your operating investment to cash more quickly. Large retailers like Walmart have leveraged superior DPO to achieve near-zero or negative CCC, essentially financing their operations on supplier credit."},
    {question:"What causes very low DPO?",answer:"Early payment discounts (e.g., 2/10 net 30), weak negotiating power with suppliers requiring immediate payment, voluntary early payment to maintain preferred supplier status, or manual processes that generate payment delays between invoice receipt and approval."},
    {question:"Can DPO be too high?",answer:"Yes. Stretching payables far beyond agreed terms causes supplier distrust, potential credit holds, loss of early-payment discounts, and supply disruptions. In extreme cases, suppliers may refuse to do business with the company."},
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Days Payable Outstanding Calculator"}]}/>
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Days Payable Outstanding (DPO) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              {label:"Cost of Goods Sold (Annual)",key:"cogs",tip:"Total annual COGS used as proxy for purchases"},
              {label:"Beginning Accounts Payable",key:"beginAP",tip:"AP balance at start of period"},
              {label:"Ending Accounts Payable",key:"endAP",tip:"AP balance at end of period"},
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
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Days Payable Outstanding</div>
              <div className={`text-5xl font-extrabold ${result.ratingColor}`}>{result.dpo.toFixed(1)} <span className="text-2xl">days</span></div>
              <div className={`text-sm font-semibold mt-1 ${result.ratingColor}`}>{result.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">AP Turnover</div><div className="font-bold text-lg">{result.payableTurnover.toFixed(2)}×</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Avg AP</div><div className="font-bold text-lg">{fmtM(((parseFloat(f.beginAP)||0)+(parseFloat(f.endAP)||0))/2)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Annual COGS</div><div className="font-bold text-lg">{fmtM(parseFloat(f.cogs)||0)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">DPO Comparison (days)</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:11}} unit=" d"/>
                    <RTooltip formatter={(v:number)=>[`${v} days`,""]} contentStyle={{borderRadius:"8px",fontSize:"13px"}}/>
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Calculation Detail</h3></div>
              {[
                {label:"Annual COGS",val:fmtM(parseFloat(f.cogs)||0)},
                {label:"Beginning AP",val:fmtM(parseFloat(f.beginAP)||0)},
                {label:"Ending AP",val:fmtM(parseFloat(f.endAP)||0)},
                {label:"Average AP",val:fmtM(((parseFloat(f.beginAP)||0)+(parseFloat(f.endAP)||0))/2)},
                {label:"AP Turnover",val:`${result.payableTurnover.toFixed(2)}×`,bold:true},
                {label:"Days Payable Outstanding",val:`${result.dpo.toFixed(1)} days`,bold:true,highlight:true},
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
            <h2 className="text-2xl font-bold mb-3">What Is the Days Payable Outstanding (DPO) Calculator?</h2>
            <p>Days Payable Outstanding (DPO) measures how many days on average a company takes to pay its trade creditors. It is the supplier-side counterpart to Days Sales Outstanding (DSO) and is a critical component of the Cash Conversion Cycle. Higher DPO means the business retains cash longer before paying suppliers — effectively using supplier credit as free short-term financing.</p>
            <h2 className="text-2xl font-bold mb-3">DPO Formula</h2>
            <p><strong>DPO = (Average Accounts Payable ÷ COGS) × 365</strong></p>
            <p>Where Average AP = (Beginning AP + Ending AP) ÷ 2. COGS is used as a proxy for total purchases since detailed purchase data is rarely publicly disclosed. Equivalently: DPO = 365 ÷ Payables Turnover Ratio (COGS ÷ Average AP).</p>
            <h2 className="text-2xl font-bold mb-3">DPO and the Cash Conversion Cycle</h2>
            <p>CCC = DIO + DSO − DPO. A higher DPO reduces the CCC, meaning the business converts operational investments to cash faster. Walmart achieves a DPO of ~40–45 days, Amazon ~75–90 days. Large retailers use their purchasing scale to negotiate extended payment terms, creating structural working capital advantages that smaller competitors cannot replicate.</p>
            <h2 className="text-2xl font-bold mb-3">Optimal DPO Range</h2>
            <p>The ideal DPO aligns with negotiated supplier payment terms. If your standard terms are net-30, a DPO of 28–35 days is optimal. Net-45 terms warrant a 42–50 day DPO. Paying well ahead of terms foregoes interest-free credit. Paying well beyond terms risks supply disruption and relationship damage. Dynamic discounting programs allow capturing early-payment discounts while managing DPO strategically.</p>
            <h2 className="text-2xl font-bold mb-3">Strategies to Optimize DPO</h2>
            <p>Negotiate extended payment terms with key suppliers — especially when you represent a large portion of their revenue. Centralize accounts payable to leverage scale. Implement automated AP workflows that approve invoices quickly but schedule payment at the optimal due date. Use supply chain finance platforms that allow suppliers to receive early payment from a financial institution while you maintain extended terms.</p>
            <h2 className="text-2xl font-bold mb-3">DPO Risks and Supplier Relationship Management</h2>
            <p>Excessively extending DPO beyond agreed terms creates legal risk (breach of contract), reputational damage, and supply chain vulnerability. Suppliers may place the company on credit hold, delay shipments, or deprioritize orders during high-demand periods. The optimal DPO strategy maximizes cash retention within ethical and contractual boundaries while investing in supplier relationships through transparency, consistent communication, and honoring commitments.</p>
            <h2 className="text-2xl font-bold mb-3">DPO in Financial Statement Analysis</h2>
            <p>Rising DPO alongside declining margins can signal a company struggling to pay bills. Rising DPO with stable or improving margins suggests deliberate, strategic cash management. Compare DPO trends year-over-year and against industry peers. A company with DPO far above industry average should be examined carefully — it may reflect superior negotiating power or a warning sign of payment difficulties.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payable-days-calculator"/>
          <PopularCalculators exclude="/calculator/payable-days-calculator"/>
        </div>
      </div>
    </>
  );
}
