"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface CarWashResults {
  annualTotal: number;
  monthlyTotal: number;
  fiveYearTotal: number;
  totalTimeHours: number;
  breakdown: {
    autoWashes: number;
    handWashes: number;
    detailing: number;
    atHome: number;
    subscription: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateCarWash = (inputs: typeof DEFAULTS): CarWashResults => {
  const method = inputs.primaryMethod as "pay-per-wash" | "subscription" | "at-home";
  
  const washesPerMonth = parseFloat(inputs.washesPerMonth) || 0;
  const costPerWash = parseFloat(inputs.costPerWash) || 0;
  const subCostPerMonth = parseFloat(inputs.subCostPerMonth) || 0;
  
  const atHomeCostPerWash = parseFloat(inputs.atHomeCostPerWash) || 0;
  
  // Advanced
  const detailFrequencyPerYear = parseFloat(inputs.detailFrequencyPerYear) || 0;
  const detailCost = parseFloat(inputs.detailCost) || 0;
  const hoursPerWash = parseFloat(inputs.hoursPerWash) || 0; // For time spent

  if (washesPerMonth < 0 || costPerWash < 0 || subCostPerMonth < 0) {
    return {
      annualTotal: 0, monthlyTotal: 0, fiveYearTotal: 0, totalTimeHours: 0,
      breakdown: { autoWashes: 0, handWashes: 0, detailing: 0, atHome: 0, subscription: 0 },
      isError: true, errorMsg: "Inputs cannot be negative."
    };
  }

  let autoWashesAnnual = 0;
  let subscriptionAnnual = 0;
  let atHomeAnnual = 0;
  
  const totalWashesAnnual = washesPerMonth * 12;

  if (method === "pay-per-wash") {
    autoWashesAnnual = totalWashesAnnual * costPerWash;
  } else if (method === "subscription") {
    subscriptionAnnual = subCostPerMonth * 12;
  } else if (method === "at-home") {
    atHomeAnnual = totalWashesAnnual * atHomeCostPerWash;
  }

  const detailingAnnual = detailFrequencyPerYear * detailCost;

  const annualTotal = autoWashesAnnual + subscriptionAnnual + atHomeAnnual + detailingAnnual;
  const totalTimeHoursAnnual = (totalWashesAnnual * hoursPerWash) + (detailFrequencyPerYear * 4); // assume 4 hours per detail

  return {
    annualTotal,
    monthlyTotal: annualTotal / 12,
    fiveYearTotal: annualTotal * 5,
    totalTimeHours: totalTimeHoursAnnual,
    breakdown: {
      autoWashes: autoWashesAnnual,
      handWashes: 0, // bundled into auto or at-home
      detailing: detailingAnnual,
      atHome: atHomeAnnual,
      subscription: subscriptionAnnual
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  primaryMethod: "pay-per-wash",
  washesPerMonth: "2",
  costPerWash: "15",
  subCostPerMonth: "35",
  atHomeCostPerWash: "2.50",
  // Advanced
  detailFrequencyPerYear: "1",
  detailCost: "150",
  hoursPerWash: "0.5"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function CarWashCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CarWashResults>(calculateCarWash(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateCarWash(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCarWash(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

  const pieData = results.isError ? [] : [
    { name: "Pay-Per-Wash", value: results.breakdown.autoWashes, color: "#3b82f6" },
    { name: "Subscription", value: results.breakdown.subscription, color: "#8b5cf6" },
    { name: "At-Home Supplies", value: results.breakdown.atHome, color: "#10b981" },
    { name: "Detailing", value: results.breakdown.detailing, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "Is a car wash subscription worth it?", answer: "Mathematically, a monthly car wash subscription is only 'worth it' if the subscription cost is less than the number of times you would naturally pay for a wash multiplied by the single-wash cost. If a wash is $15 and the sub is $35, you must wash your car 3+ times a month to break even. Most drivers don't, which is why car washes push subscriptions so heavily." },
    { question: "Are automatic car washes bad for paint?", answer: "Yes. Touch-style automatic car washes use massive spinning brushes that retain grit and dirt from thousands of previous cars. They effectively act like sandpaper, creating 'swirl marks' and micro-scratches in your clear coat over time." },
    { question: "How much does washing at home really cost?", answer: "Once you purchase the initial buckets, microfiber towels, and grit guards (around $50-$100), the recurring cost of washing at home is extremely low. High-quality car shampoo costs roughly $0.50 to $1.00 per wash, plus a few cents for water." },
    { question: "How often should I detail my car?", answer: "For a daily driver parked outside, a full detail (involving clay bar, polish, and wax/sealant) should be done once or twice a year to protect the paint from UV damage and environmental fallout." },
    { question: "What is touchless car wash?", answer: "A touchless wash uses high-pressure water and harsh chemicals to clean the car without physical brushes touching the paint. While it prevents brush scratches, the aggressive chemicals can strip off protective waxes and degrade plastic trim over time." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Wash Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Wash Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Primary Wash Method</label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-12 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <select value={inputs.primaryMethod} onChange={(e) => handleChange("primaryMethod", e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-bold">
                  <option value="pay-per-wash">Pay-Per-Wash (Automatic/Hand)</option>
                  <option value="subscription">Monthly Wash Subscription</option>
                  <option value="at-home">At-Home / Driveway</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="washes-per-month" label="Washes Per Month" value={inputs.washesPerMonth} onChange={(v: string) => handleChange("washesPerMonth", v)} />
              {inputs.primaryMethod === "pay-per-wash" && (
                <CompactInput id="cost-per-wash" label="Cost Per Wash" value={inputs.costPerWash} onChange={(v: string) => handleChange("costPerWash", v)} prefix="$" />
              )}
              {inputs.primaryMethod === "subscription" && (
                <CompactInput id="sub-cost" label="Subscription Cost / Mo" value={inputs.subCostPerMonth} onChange={(v: string) => handleChange("subCostPerMonth", v)} prefix="$" />
              )}
              {inputs.primaryMethod === "at-home" && (
                <CompactInput id="at-home-cost" label="Soap/Supplies per Wash" value={inputs.atHomeCostPerWash} onChange={(v: string) => handleChange("atHomeCostPerWash", v)} prefix="$" />
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Detailing & Time) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="detail-freq" label="Pro Details / Year" value={inputs.detailFrequencyPerYear} onChange={(v: string) => handleChange("detailFrequencyPerYear", v)} />
                  <CompactInput id="detail-cost" label="Cost per Detail" value={inputs.detailCost} onChange={(v: string) => handleChange("detailCost", v)} prefix="$" />
                  <CompactInput id="hours-per-wash" label="Hours Spent per Wash" value={inputs.hoursPerWash} onChange={(v: string) => handleChange("hoursPerWash", v)} suffix="hrs" tooltip="Include driving/waiting time" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Wash Cost
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Annual Cost</div>
                  <div className="text-5xl font-bold text-primary mb-1">{formatCurrency(results.annualTotal)}</div>
                  <div className="text-sm text-muted-foreground">This is how much you spend every year keeping your car clean.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Monthly Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.monthlyTotal)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">5-Year Total</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.fiveYearTotal)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Time Spent/Yr</div>
                    <div className="text-lg font-bold text-primary">{results.totalTimeHours} Hours</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Annual Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    {inputs.primaryMethod === "pay-per-wash" && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Pay-Per-Wash Costs</span>
                        <span className="font-medium text-foreground">{formatCurrency(results.breakdown.autoWashes)}</span>
                      </div>
                    )}
                    {inputs.primaryMethod === "subscription" && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Subscription Fees</span>
                        <span className="font-medium text-foreground">{formatCurrency(results.breakdown.subscription)}</span>
                      </div>
                    )}
                    {inputs.primaryMethod === "at-home" && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">At-Home Supplies</span>
                        <span className="font-medium text-foreground">{formatCurrency(results.breakdown.atHome)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Professional Detailing</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.detailing)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Annual Payment</span>
                      <span className="text-primary">{formatCurrency(results.annualTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost Distribution</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Car Wash Cost Calculator?</h2>
            <p>A Car Wash Cost Calculator is a specialized budgeting tool designed to reveal the hidden annual expense of keeping your vehicle clean. While dropping $15 at an automatic car wash or paying $35 a month for a subscription might seem like a trivial expense at the time, these small recurring costs silently compound. When aggregated over a year or five years, car washing can easily rival the cost of vehicle maintenance or insurance. This calculator helps you compare different cleaning methods to optimize your budget.</p>

            <h2>How It Works</h2>
            <p>Our algorithm breaks down car washing into three primary financial models: <strong>Pay-Per-Wash</strong>, <strong>Monthly Subscriptions</strong>, and <strong>At-Home Washing</strong>. If you select Pay-Per-Wash or At-Home, the calculator multiplies your stated wash frequency by the single-wash cost. If you select Subscription, it ignores wash frequency entirely (since the cost is fixed) and simply annualizes your monthly fee. It then aggregates these base costs with any sporadic high-ticket expenses, such as professional interior and exterior detailing.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Total Annual Cost</strong> strips away the illusion of cheap $15 washes by showing the yearly compounding effect. The <strong>5-Year Total</strong> is often the most shocking metric; many drivers unknowingly spend $2,000 to $4,000 keeping a depreciating asset clean over its lifespan. The <strong>Time Spent/Yr</strong> metric translates the physical act of washing (or waiting in line at the automatic wash) into raw hours, highlighting the often-ignored "time cost" of vehicle ownership.</p>

            <h2>Key Factors</h2>
            <p>The <strong>Primary Wash Method</strong> heavily dictates your financial outcome. Monthly subscriptions are highly lucrative for car wash businesses because they rely on the "gym membership model"—people pay for it but rarely use it enough to break even. If your subscription is $40 a month and a single wash is $15, you must wash your car three times a month just to stop losing money. <strong>Detailing</strong> is another massive factor; a single $250 professional detail can instantly double your entire annual car wash budget.</p>

            <h2>Advanced Features</h2>
            <p>Using the Advanced Options, you can calculate the invisible burden of <strong>Time</strong>. If you spend 1.5 hours every Saturday hand-washing your car, that equates to a staggering 78 hours a year—nearly two full work weeks—dedicated solely to scrubbing metal. This feature helps buyers weigh the financial savings of at-home washing against the immense time cost it requires.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Subscription Trap.</strong> Mark pays $35 a month for an unlimited car wash subscription. He thinks it's a great deal, but he only goes twice a month. His annual cost is $420. If he had simply paid $12 per wash out-of-pocket for those same two washes, his annual cost would have been only $288. He is losing $132 a year to the subscription.</p>
            <p><strong>Example 2: The At-Home Detailer.</strong> Sarah buys $100 worth of premium soaps, buckets, and towels upfront. She washes her car every week. The chemical cost per wash is roughly $1.50. Her annual cost is just $78. However, she inputs 1 hour per wash into the calculator, revealing that she spends 52 hours a year washing her car.</p>

            <h2>Tips & Best Practices</h2>
            <p>Do the math before signing up for a car wash subscription. If you do not realistically have the time or desire to wash your car every single week, you are better off paying per wash. Furthermore, avoid automatic "touch" car washes with spinning brushes. While they are fast and cheap, they act like sandpaper on your clear coat. You will eventually have to pay a professional detailer hundreds of dollars to polish out the heavy swirl marks, entirely destroying any money you saved.</p>

            <h2>Benefits</h2>
            <p>Using a Car Wash Cost Calculator stops financial leaks. It forces you to look at micro-transactions through an annualized lens. By understanding exactly how much money and time you are dedicating to vehicle aesthetics, you can make an informed decision on whether to cancel that unused subscription, start washing at home, or accept the cost as a necessary luxury.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-wash-cost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
