"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs { homeValue: number; firstRate: number; secondRate: number; singleRate: number; term: number; }
interface Result { firstPayment: number; secondPayment: number; piggybackTotal: number; singlePayment: number; singlePmi: number; singleTotal: number; monthlySavings: number; totalSavings: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;piggyback:number;single:number}[]; }

function calc(inp: Inputs): Result {
  const first = inp.homeValue * 0.8; const second = inp.homeValue * 0.1;
  const r1 = inp.firstRate/100/12; const r2 = inp.secondRate/100/12; const rs = inp.singleRate/100/12;
  const n = inp.term * 12;
  const pmt = (P:number,r:number) => r > 0 ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
  const firstPayment = pmt(first, r1); const secondPayment = pmt(second, r2);
  const piggybackTotal = (firstPayment + secondPayment) * n;
  const singlePayment = pmt(inp.homeValue, rs); const singlePmi = (inp.homeValue * 0.007) / 12;
  const singleTotal = (singlePayment + singlePmi) * n;
  const monthlySavings = (singlePayment + singlePmi) - (firstPayment + secondPayment);
  const totalSavings = singleTotal - piggybackTotal;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Home Value',value:fmt(inp.homeValue)}, {label:'First Mortgage (80%)',value:fmt(first)+' @ '+inp.firstRate+'%'},
    {label:'Second Mortgage (10%)',value:fmt(second)+' @ '+inp.secondRate+'%'}, {label:'Your Down Payment (10%)',value:fmt(inp.homeValue*0.1)},
    {label:'First Mortgage Payment',value:'$'+fmtD(firstPayment)+'/mo'}, {label:'Second Mortgage Payment',value:'$'+fmtD(secondPayment)+'/mo'},
    {label:'Piggyback Total Payment',value:'$'+fmtD(firstPayment+secondPayment)+'/mo',highlight:true},
    {label:'Single Loan + PMI Payment',value:'$'+fmtD(singlePayment+singlePmi)+'/mo'},
    {label:'Monthly Savings (Piggyback)',value:monthlySavings>0?'$'+fmtD(monthlySavings)+'/mo':'N/A',highlight:monthlySavings>0},
    {label:'Total Savings Over Term',value:totalSavings>0?fmt(totalSavings):'N/A',highlight:totalSavings>0},
  ];
  const summaryStats = [
    {label:'Piggyback Payment',value:'$'+fmtD(firstPayment+secondPayment)+'/mo'},{label:'Single Loan + PMI',value:'$'+fmtD(singlePayment+singlePmi)+'/mo'},
    {label:'Monthly Savings',value:monthlySavings>0?'$'+fmtD(monthlySavings):'N/A'},{label:'Total Savings',value:totalSavings>0?fmt(totalSavings):'N/A'},
    {label:'Piggyback Total Cost',value:fmt(piggybackTotal)},{label:'Single Total Cost',value:fmt(singleTotal)},
    {label:'PMI Avoided',value:fmt(singlePmi*12)+'/yr'},{label:'Down Payment',value:fmt(inp.homeValue*0.1)},
  ];
  const chartData = [{name:'Monthly',piggyback:Math.round(firstPayment+secondPayment),single:Math.round(singlePayment+singlePmi)},{name:'Total Cost',piggyback:Math.round(piggybackTotal/1000),single:Math.round(singleTotal/1000)}];
  return {firstPayment,secondPayment,piggybackTotal,singlePayment,singlePmi,singleTotal,monthlySavings,totalSavings,breakdown,summaryStats,chartData};
}

const DEFAULTS: Inputs = {homeValue:400000,firstRate:6.5,secondRate:9.5,singleRate:6.5,term:30};

export default function PiggybackLoanCalculator() {
  const [homeValue,setHomeValue] = useState(String(DEFAULTS.homeValue));
  const [firstRate,setFirstRate] = useState(String(DEFAULTS.firstRate));
  const [secondRate,setSecondRate] = useState(String(DEFAULTS.secondRate));
  const [singleRate,setSingleRate] = useState(String(DEFAULTS.singleRate));
  const [term,setTerm] = useState(String(DEFAULTS.term));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({homeValue:parseFloat(homeValue)||0,firstRate:parseFloat(firstRate)||0,secondRate:parseFloat(secondRate)||0,singleRate:parseFloat(singleRate)||0,term:parseInt(term)||30});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {Object.entries(DEFAULTS).forEach(([k,v])=>{if(k==='homeValue')setHomeValue(String(v));else if(k==='firstRate')setFirstRate(String(v));else if(k==='secondRate')setSecondRate(String(v));else if(k==='singleRate')setSingleRate(String(v));else setTerm(String(v));});setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is a piggyback loan?",answer:"A piggyback loan (also called an 80/10/10) combines an 80% first mortgage, a 10% second mortgage (HELOC or home equity loan), and 10% down payment. This lets you avoid PMI while still putting only 10% down — saving the $200–400/month PMI cost on a $400K home."},
    {question:"When does a piggyback loan make sense?",answer:"When the combined cost of the first + second mortgage payments is less than the single loan payment plus PMI. This typically works when the PMI rate is above 0.5% and the second mortgage rate is less than 3% above the first rate."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Piggyback Loan Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Piggyback Loan Calculator (80/10/10)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Home Value ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homeValue} onChange={e=>setHomeValue(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">First Mortgage Rate (%)</label><div className={i}><input type="number" value={firstRate} onChange={e=>setFirstRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Second Mortgage Rate (%)</label><div className={i}><input type="number" value={secondRate} onChange={e=>setSecondRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Single Loan Rate (%)</label><div className={i}><input type="number" value={singleRate} onChange={e=>setSingleRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e=>setTerm(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Piggyback Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${(result.firstPayment+result.secondPayment).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlySavings>0?'Saves $'+result.monthlySavings.toFixed(2)+'/mo vs single loan + PMI':'Single loan is cheaper'}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Piggyback","$"+(result.firstPayment+result.secondPayment).toFixed(2)],["Single+PMI","$"+(result.singlePayment+result.singlePmi).toFixed(2)],["Savings",result.monthlySavings>0?"$"+result.monthlySavings.toFixed(2):"N/A"]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Comparison Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Piggyback vs Single Loan</h3><ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>v>1000?'$'+(v/1000).toFixed(0)+'K':'$'+v}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="piggyback" fill="hsl(var(--primary))" name="Piggyback" radius={[4,4,0,0]}/><Bar dataKey="single" fill="#10b981" name="Single + PMI" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">What Is a Piggyback Loan?</h2><p>A piggyback loan (80/10/10) combines an 80% first mortgage, a 10% second mortgage (HELOC), and a 10% down payment. This structure lets you reach 20% equity immediately, avoiding PMI while keeping your down payment at just 10%.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/piggyback-loan-calculator"/><PopularCalculators exclude="/calculator/piggyback-loan-calculator"/></div>
    </div>
  </>);
}
