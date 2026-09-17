"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs { loanAmount: number; constructionRate: number; constructionMonths: number; permanentRate: number; permanentTerm: number; }
interface Result { constructionInterest: number; constructionPayment: number; permanentPayment: number; totalInterest: number; totalCost: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;interest:number;principal:number}[]; }

function calc(inp: Inputs): Result {
  const r1 = inp.constructionRate / 100 / 12;
  const constructionInterest = inp.loanAmount * r1 * inp.constructionMonths;
  const constructionPayment = inp.loanAmount * r1; // Interest-only during construction
  const totalDuringConstruction = constructionPayment * inp.constructionMonths;
  const permanentBalance = inp.loanAmount + constructionInterest; // Interest capitalized
  const r2 = inp.permanentRate / 100 / 12;
  const n2 = inp.permanentTerm * 12;
  const permanentPayment = r2 > 0 ? (permanentBalance*r2*Math.pow(1+r2,n2))/(Math.pow(1+r2,n2)-1) : permanentBalance/n2;
  const totalInterest = constructionInterest + (permanentPayment * n2 - permanentBalance);
  const totalCost = totalDuringConstruction + permanentPayment * n2;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Original Loan Amount',value:fmt(inp.loanAmount)},
    {label:'Construction Rate',value:inp.constructionRate+'%/yr (interest-only)'},
    {label:'Construction Period',value:inp.constructionMonths+' months'},
    {label:'Construction Interest',value:fmt(constructionInterest)},
    {label:'Capitalized Balance',value:fmt(permanentBalance),highlight:true},
    {label:'Permanent Rate',value:inp.permanentRate+'%/yr'},
    {label:'Permanent Term',value:inp.permanentTerm+' years'},
    {label:'Permanent Monthly Payment',value:'$'+fmtD(permanentPayment),highlight:true},
    {label:'Total Interest (all phases)',value:fmt(totalInterest)},
    {label:'Total Cost',value:fmt(totalCost),highlight:true},
  ];
  const summaryStats = [
    {label:'Construction Payment',value:'$'+fmtD(constructionPayment)+'/mo'},{label:'Permanent Payment',value:'$'+fmtD(permanentPayment)+'/mo'},
    {label:'Total Interest',value:fmt(totalInterest)},{label:'Total Cost',value:fmt(totalCost)},
    {label:'Construction Interest',value:fmt(constructionInterest)},{label:'Capitalized Amount',value:fmt(permanentBalance)},
    {label:'Months Interest-Only',value:String(inp.constructionMonths)},{label:'Total Months',value:String(inp.constructionMonths+n2)},
  ];
  const chartData = [{name:'Construction',interest:Math.round(constructionInterest),principal:0},{name:'Permanent',interest:Math.round(totalInterest-constructionInterest),principal:Math.round(inp.loanAmount)}];
  return {constructionInterest,constructionPayment,permanentPayment,totalInterest,totalCost,breakdown,summaryStats,chartData};
}
const DEFAULTS: Inputs = {loanAmount:400000,constructionRate:7.5,constructionMonths:12,permanentRate:6.5,permanentTerm:30};

export default function ConstructionLoanInterestCalculator() {
  const [loanAmount,setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [constructionRate,setConstructionRate] = useState(String(DEFAULTS.constructionRate));
  const [constructionMonths,setConstructionMonths] = useState(String(DEFAULTS.constructionMonths));
  const [permanentRate,setPermanentRate] = useState(String(DEFAULTS.permanentRate));
  const [permanentTerm,setPermanentTerm] = useState(String(DEFAULTS.permanentTerm));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({loanAmount:parseFloat(loanAmount)||0,constructionRate:parseFloat(constructionRate)||0,constructionMonths:parseInt(constructionMonths)||1,permanentRate:parseFloat(permanentRate)||0,permanentTerm:parseInt(permanentTerm)||30});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {Object.entries(DEFAULTS).forEach(([k,v])=>{const s={loanAmount:setLoanAmount,constructionRate:setConstructionRate,constructionMonths:setConstructionMonths,permanentRate:setPermanentRate,permanentTerm:setPermanentTerm}[k];if(s)s(String(v));});setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"How does construction loan interest work?",answer:"During construction, you make interest-only payments on the drawn amount. At completion, the construction loan converts to a permanent mortgage. Interest accrued during construction is often 'capitalized' — added to the loan balance — meaning you pay interest on interest in the permanent phase."},
    {question:"What is a construction-to-permanent loan?",answer:"A construction-to-permanent (CTP) loan combines the construction phase and permanent financing into one loan with one closing. This saves on closing costs compared to separate construction and mortgage loans. The rate typically adjusts when construction completes."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Construction Loan Interest Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Construction Loan Interest Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Construction Rate (%)</label><div className={i}><input type="number" value={constructionRate} onChange={e=>setConstructionRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Construction Period</label><div className={i}><input type="number" value={constructionMonths} onChange={e=>setConstructionMonths(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">months</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Permanent Rate (%)</label><div className={i}><input type="number" value={permanentRate} onChange={e=>setPermanentRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Permanent Term</label><div className={i}><input type="number" value={permanentTerm} onChange={e=>setPermanentTerm(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Permanent Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.permanentPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Construction: ${result.constructionPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}/mo · Total Interest: ${result.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Construction","$"+result.constructionPayment.toFixed(2)],["Permanent","$"+result.permanentPayment.toFixed(2)],["Total Interest","$"+Math.round(result.totalInterest).toLocaleString()]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Interest by Phase</h3><ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="interest" fill="#f59e0b" name="Interest" radius={[4,4,0,0]}/><Bar dataKey="principal" fill="hsl(var(--primary))" name="Principal" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Construction Loan Interest</h2><p>Construction loans are short-term (6–18 months) interest-only loans that fund home building. During construction, you pay only interest on the amount drawn. When construction completes, the loan converts to a permanent mortgage. Any unpaid construction interest is typically capitalized into the permanent loan balance.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-loan-interest-calculator"/><PopularCalculators exclude="/calculator/construction-loan-interest-calculator"/></div>
    </div>
  </>);
}
