"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs { countyLimit: number; downPaymentPct: number; interestRate: number; term: number; }
interface Result { maxHomePrice: number; loanAmount: number; downPayment: number; monthlyPayment: number; totalInterest: number; totalCost: number; upfrontMip: number; annualMip: number; monthlyMip: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;value:number}[]; }

const COUNTY_LIMITS = [
  {name:"Low-Cost Area",limit:498257},{name:"Standard Area",limit:766550},{name:"High-Cost Area",limit:1149825},{name:"Alaska/Hawaii/VI/GU",limit:1149825},
];

function calc(inp: Inputs): Result {
  const maxLoanFromLimit = inp.countyLimit;
  const maxHomePrice = maxLoanFromLimit / (1 - inp.downPaymentPct / 100);
  const downPayment = maxHomePrice * (inp.downPaymentPct / 100);
  const loanAmount = maxHomePrice - downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.term * 12;
  const monthlyPayment = r > 0 ? (loanAmount*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : loanAmount/n;
  const totalInterest = monthlyPayment * n - loanAmount;
  const upfrontMip = loanAmount * 0.0175;
  const annualMip = loanAmount * 0.55 / 100; // 0.55% for >95% LTV
  const monthlyMip = annualMip / 12;
  const totalCost = (monthlyPayment + monthlyMip) * n + upfrontMip + downPayment;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'County Loan Limit',value:fmt(inp.countyLimit)}, {label:'Down Payment',value:inp.downPaymentPct+'% ('+fmt(downPayment)+')'},
    {label:'Maximum Home Price',value:fmt(maxHomePrice),highlight:true}, {label:'Loan Amount',value:fmt(loanAmount)},
    {label:'Interest Rate',value:inp.interestRate+'%/yr'}, {label:'Upfront MIP (1.75%)',value:fmt(upfrontMip)},
    {label:'Annual MIP (0.55%)',value:fmt(annualMip)+'/yr'}, {label:'Monthly MIP',value:'$'+fmtD(monthlyMip)+'/mo'},
    {label:'Monthly P&I Payment',value:'$'+fmtD(monthlyPayment),highlight:true},
    {label:'Total Monthly (P&I + MIP)',value:'$'+fmtD(monthlyPayment+monthlyMip),highlight:true},
    {label:'Total Cost',value:fmt(totalCost)},
  ];
  const summaryStats = [
    {label:'Max Home Price',value:fmt(maxHomePrice)},{label:'Monthly Payment (P&I)',value:'$'+fmtD(monthlyPayment)+'/mo'},
    {label:'Monthly MIP',value:'$'+fmtD(monthlyMip)+'/mo'},{label:'Total Monthly',value:'$'+fmtD(monthlyPayment+monthlyMip)+'/mo'},
    {label:'Down Payment',value:fmt(downPayment)},{label:'Total Interest',value:fmt(totalInterest)},
    {label:'Upfront MIP',value:fmt(upfrontMip)},{label:'Total Cost',value:fmt(totalCost)},
  ];
  const chartData = [{name:'P&I Payment',value:Math.round(monthlyPayment)},{name:'MIP',value:Math.round(monthlyMip)},{name:'Down Payment (÷12)',value:Math.round(downPayment/n)}];
  return {maxHomePrice,loanAmount,downPayment,monthlyPayment,totalInterest,totalCost,upfrontMip,annualMip,monthlyMip,breakdown,summaryStats,chartData};
}
const DEFAULTS: Inputs = {countyLimit:766550,downPaymentPct:3.5,interestRate:6.5,term:30};

export default function FhaLoanLimitCalculator() {
  const [countyLimit,setCountyLimit] = useState(String(DEFAULTS.countyLimit));
  const [downPaymentPct,setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [interestRate,setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [term,setTerm] = useState(String(DEFAULTS.term));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({countyLimit:parseFloat(countyLimit)||0,downPaymentPct:parseFloat(downPaymentPct)||0,interestRate:parseFloat(interestRate)||0,term:parseInt(term)||30});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setCountyLimit(String(DEFAULTS.countyLimit));setDownPaymentPct(String(DEFAULTS.downPaymentPct));setInterestRate(String(DEFAULTS.interestRate));setTerm(String(DEFAULTS.term));setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What are FHA loan limits for 2024?",answer:"FHA loan limits range from $498,257 (low-cost areas) to $1,149,825 (high-cost areas like San Francisco, NYC). The limit for your specific county can be found on the HUD website. Limits are adjusted annually based on median home prices."},
    {question:"What is FHA MIP?",answer:"FHA loans require two mortgage insurance premiums: an upfront MIP of 1.75% (usually financed into the loan) and an annual MIP of 0.15%–0.75% depending on loan term and LTV. Unlike conventional PMI, FHA MIP on loans with >90% LTV lasts the life of the loan."},
    {question:"How much do I need for an FHA down payment?",answer:"FHA requires a minimum 3.5% down payment with a credit score of 580+. If your score is 500–579, you need 10% down. The down payment can come from savings, gifts, or down payment assistance programs. Closing costs are typically 2–5% of the loan amount."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"FHA Loan Limit Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FHA Loan Limit Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">FHA County Loan Limit ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={countyLimit} onChange={e=>setCountyLimit(e.target.value)} className={c}/></div>
            <div className="flex gap-2 mt-2">{COUNTY_LIMITS.map(cl=>(<button key={cl.name} type="button" onClick={()=>setCountyLimit(String(cl.limit))} className="text-[10px] px-2 py-1 rounded border border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground transition-colors">{cl.name} (${(cl.limit/1000).toFixed(0)}K)</button>))}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPaymentPct} onChange={e=>setDownPaymentPct(e.target.value)} step="0.5" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e=>setInterestRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e=>setTerm(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maximum Home Price</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.maxHomePrice.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
              <div className="text-sm text-muted-foreground mt-1">Monthly: ${result.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} + ${result.monthlyMip.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} MIP</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Home Price","$"+Math.round(result.maxHomePrice).toLocaleString()],["Down Payment","$"+Math.round(result.downPayment).toLocaleString()],["Total Monthly","$"+(result.monthlyPayment+result.monthlyMip).toFixed(2)]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Monthly Payment Split</h3><ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>'$'+v}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString()+'/mo','']}/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">FHA Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">FHA Loan Limits Explained</h2><p>The FHA sets maximum loan limits for each county based on median home prices. In 2024, limits range from $498,257 (low-cost areas) to $1,149,825 (high-cost areas). Your maximum FHA-eligible home price is the loan limit divided by the minimum down payment percentage.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fha-loan-limit-calculator"/><PopularCalculators exclude="/calculator/fha-loan-limit-calculator"/></div>
    </div>
  </>);
}
