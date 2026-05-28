"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AverageCalculator = () => {
  const DEFAULT_NUMS = "10, 20, 30, 40, 50";
  const [nums, setNums] = useState(DEFAULT_NUMS);
  const [result, setResult] = useState<{mean:number;median:number;mode:number[];min:number;max:number;sum:number;count:number;range:number;values:number[]} | null>(null);

  const calculate = (input = nums) => {
    const values = input.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && input.trim() !== '');
    if (!values.length) return;
    const sorted = [...values].sort((a,b)=>a-b);
    const sum = values.reduce((a,b)=>a+b,0);
    const mean = sum / values.length;
    const median = values.length % 2 === 0 ? (sorted[values.length/2-1]+sorted[values.length/2])/2 : sorted[Math.floor(values.length/2)];
    const freq: Record<number,number> = {};
    values.forEach(v => freq[v] = (freq[v]||0)+1);
    const maxFreq = Math.max(...Object.values(freq));
    const mode = Object.keys(freq).filter(k=>freq[+k]===maxFreq).map(Number);
    setResult({ mean, median, mode, min: sorted[0], max: sorted[sorted.length-1], sum, count: values.length, range: sorted[sorted.length-1]-sorted[0], values });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setNums(DEFAULT_NUMS); calculate(DEFAULT_NUMS); };

  const chartData = result?.values.map((v,i) => ({ name: `#${i+1}`, value: v })) ?? [];

  const faqs = [
    { question: "What is the arithmetic mean?", answer: "The arithmetic mean is the sum of all values divided by the count. It is the most common type of average." },
    { question: "What is the difference between mean and median?", answer: "The mean is affected by outliers; the median is the middle value when sorted and is more robust to extreme values." },
    { question: "How many numbers can I average?", answer: "This calculator handles any quantity of numbers. Separate values with commas or spaces." },
    { question: "What is the mode?", answer: "The mode is the most frequently occurring value. A dataset can have multiple modes (bimodal, multimodal)." },
    { question: "How is the range calculated?", answer: "Range = Maximum − Minimum. It measures the spread of your data." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Math",href:"/calculator#math"},{label:"Average Calculator"}]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Average Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Numbers (comma or space separated)</label>
              <textarea value={nums} onChange={e=>setNums(e.target.value)} className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all" rows={3} placeholder="10, 20, 30, 40, 50" />
            </div>
            <div className="flex gap-3">
              <button onClick={()=>calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Arithmetic Mean</div>
                <div className="text-4xl font-bold text-primary">{result.mean.toLocaleString(undefined,{maximumFractionDigits:4})}</div>
                <div className="text-sm text-muted-foreground mt-1">Average of {result.count} numbers | Sum: {result.sum}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Statistical Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Count</td><td className="text-right font-medium">{result.count}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Sum</td><td className="text-right font-medium">{result.sum.toLocaleString()}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Mean (Average)</td><td className="text-right font-medium">{result.mean.toFixed(4)}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Median</td><td className="text-right font-medium">{result.median}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Mode</td><td className="text-right font-medium">{result.mode.join(", ")}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Minimum</td><td className="text-right font-medium">{result.min}</td></tr>
                  <tr className="border-b"><td className="py-2 text-muted-foreground">Maximum</td><td className="text-right font-medium">{result.max}</td></tr>
                  <tr><td className="py-2 text-muted-foreground">Range</td><td className="text-right font-bold">{result.range}</td></tr>
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Value Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]}/></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-base"><span className="text-muted-foreground">Numbers entered:</span><span className="font-medium">{result.count}</span></div>
                  <div className="flex justify-between text-base"><span className="text-muted-foreground">Sum:</span><span className="font-medium">{result.sum.toLocaleString()}</span></div>
                  <div className="flex justify-between text-base"><span className="text-muted-foreground">Spread (Range):</span><span className="font-medium">{result.range}</span></div>
                  <div className="flex justify-between text-base border-t pt-3"><span className="font-semibold text-muted-foreground">Mean:</span><span className="font-bold text-primary">{result.mean.toFixed(4)}</span></div>
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is an Average Calculator?</h2>
            <p>An average calculator computes descriptive statistics — mean, median, mode, range, sum, minimum, and maximum — for any list of numbers you provide. The arithmetic mean is the single number most people call "the average," but a complete statistical summary requires several measures to describe a dataset accurately.</p>
            <p>This calculator is useful for students computing class averages, analysts summarizing data, athletes tracking performance metrics, businesses calculating sales averages, and scientists summarizing experimental results.</p>
            <h2>How Averages Are Calculated</h2>
            <p><strong>Arithmetic Mean:</strong> Sum of all values ÷ count of values. For [10, 20, 30, 40, 50]: Mean = 150 ÷ 5 = 30.</p>
            <p><strong>Median:</strong> Sort values, then take the middle value. For 5 values: median = 3rd value = 30. For even counts, average the two middle values.</p>
            <p><strong>Mode:</strong> The most frequently occurring value. A dataset with all unique values is considered "no mode" or every value is a mode.</p>
            <p><strong>Range:</strong> Maximum − Minimum = 50 − 10 = 40. Measures spread.</p>
            <h2>Mean vs Median: When to Use Each</h2>
            <p>The mean works well for symmetric, bell-shaped distributions without extreme outliers. The median is preferred for skewed data or data with outliers — for example, household income statistics use median income because a few billionaires would inflate the mean dramatically. In practice, always compare both to understand your data.</p>
            <h2>Applications of Averages</h2>
            <p>Averages are fundamental in education (GPA, test scores), finance (average returns, moving averages), weather (average temperature, rainfall), sports (batting averages, ERA), manufacturing (average defect rates), and healthcare (average blood pressure readings). Any field that collects repeated measurements uses averages for summarization.</p>
            <h2>Tips for Accurate Averages</h2>
            <p>Always check for outliers before interpreting the mean. Use the median for skewed distributions. When data has natural groupings, consider the weighted average instead. For percentage data, the geometric mean is often more appropriate than the arithmetic mean.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/average-calculator" />
          <PopularCalculators exclude="/calculator/average-calculator" />
        </div>
      </div>
    </>
  );
};
export default AverageCalculator;